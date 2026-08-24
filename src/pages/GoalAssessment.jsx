import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { assessGoal } from "../services/goalService";
import { saveGoalAssessment } from "../services/userService";
import { generateWorkoutPlan } from "../services/workoutService";
import { getCycleStatus } from "../services/cycleService";
import { FITNESS_GOALS, labelFor } from "../data/options";
import Companion from "../components/Companion";

export default function GoalAssessment() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("review");
  const [result, setResult] = useState(null);

  const profile = user.profile;

  useEffect(() => {
    if (phase !== "loading") return undefined;
    const timer = setTimeout(() => {
      const assessment = assessGoal(profile);
      setResult(assessment);
      setPhase("result");
    }, 1400);
    return () => clearTimeout(timer);
  }, [phase, profile]);

  async function accept(assessment) {
    const nextUser = await saveGoalAssessment({
      ...assessment,
      acceptedAdjustment: !assessment.feasible,
      acceptedAt: new Date().toISOString(),
    });
    const cycle = getCycleStatus(nextUser.profile);
    generateWorkoutPlan({
      goal: nextUser.profile.goal,
      weeks: 4,
      inPeriodWindow: cycle.inWindow,
    });
    setUser(nextUser);
    navigate("/plan");
  }

  return (
    <div className="panel">
      <span className="eyebrow">GOAL CHECK</span>
      <h1>Let’s check your goal</h1>
          <Companion size="sm" color={user.companion?.color} accessory={user.companion?.accessory} variant={user.companion?.variant} />
      <div className="summary-list">
        <div><span>Current weight</span><strong>{profile.weightKg} kg</strong></div>
        <div><span>Goal</span><strong>{labelFor(FITNESS_GOALS, profile.goal)}</strong></div>
        {profile.targetWeightKg && <div><span>Target</span><strong>{profile.targetWeightKg} kg</strong></div>}
        <div><span>Timeline</span><strong>{profile.timelineWeeks} weeks</strong></div>
      </div>

      {phase === "review" && (
        <button className="primary-btn" style={{ marginTop: 20 }} onClick={() => setPhase("loading")}>
          Check this goal
        </button>
      )}

      {phase === "loading" && (
        <p className="loading-pulse">FitBuddy is checking whether your goal is realistic...</p>
      )}

      {phase === "result" && result && (
        <div>
          <h3>{result.feasible ? "Your goal looks achievable." : "Your goal may be too aggressive for this timeline."}</h3>
          <p>{result.message}</p>
          {!result.feasible && (
            <div className="cycle-banner">
              <strong>A gentler option</strong>
              <p>{result.adjustedGoal}</p>
              <p>Suggested timeline: {result.adjustedTimeline}</p>
            </div>
          )}
          <p className="disclaimer">This is a conservative wellbeing check, not a medical assessment.</p>
          <button className="primary-btn" onClick={() => accept(result)}>
            {result.feasible ? "Continue to my plan" : "Accept this adjustment"}
          </button>
        </div>
      )}
    </div>
  );
}
