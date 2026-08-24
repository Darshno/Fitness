import { useEffect, useMemo, useState } from "react";
import CompanionChat from "../components/CompanionChat";
import CycleCareBanner from "../components/CycleCareBanner";
import FoodUpload from "../components/FoodUpload";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getCycleStatus } from "../services/cycleService";
import { addWater, getHydration } from "../services/foodService";
import {
  getProgress,
  getTodayWorkout,
  getWorkoutPlan,
  generateWorkoutPlan,
  toggleExerciseComplete,
  toggleWorkoutComplete,
  workoutCompletionPercent,
} from "../services/workoutService";

export default function Physical() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [foodOpen, setFoodOpen] = useState(false);
  const [hydration, setHydration] = useState({ glasses: 0, goal: 8 });

  useEffect(() => { getHydration().then(setHydration).catch((error) => toast(error.message)); }, []);
  const [progress, setProgress] = useState(getProgress());
  const today = getTodayWorkout(getWorkoutPlan());
  const cycle = getCycleStatus(user.profile);
  const womenMode = cycle.type === "pregnancy" || (cycle.type === "period" && cycle.inWindow);
  const activeToday = womenMode ? getTodayWorkout(generateWorkoutPlan({ goal: user.profile?.goal, weeks: 4, profile: user.profile, inPeriodWindow: cycle.inWindow })) : today;
  const shownToday = activeToday || today;
  const percent = shownToday ? workoutCompletionPercent(shownToday, progress) : 0;

  const canStart = shownToday && shownToday.focus !== "Rest";

  const exerciseRows = useMemo(() => shownToday?.exercises || [], [shownToday]);

  return (
    <div>
      <div className="mode-header physical-header">
        <div>
          <span className="eyebrow">PHYSICAL MODE</span>
          <h2>Let’s get moving </h2>
          <p>Your workout, food and hydration in one place.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            if (!shownToday) return;
            setProgress(toggleWorkoutComplete(shownToday.id));
            toast(percent === 100 ? "Workout reopened" : "Workout marked complete");
          }}
        >
          {percent === 100 ? "Completed" : canStart ? "Start workout" : "Rest day"}
        </button>
      </div>

      {cycle.applicable && (
        <div className={`care-status-strip ${cycle.type === "pregnancy" ? "pregnancy" : "period"}`}>
          <div><strong>{cycle.type === "pregnancy" ? "Pregnancy-aware workout active" : cycle.inWindow ? "Period-aware workout active" : "Cycle-aware care available"}</strong><span>{cycle.message}</span></div>
          <a href="/cycle-care" className="link-btn">Manage care →</a>
        </div>
      )}

      <div className="feature-grid">
        <div className="feature-card large">
          <span className="feature-icon"></span>
          <h3>Today’s workout</h3>
          <p>{shownToday?.title} · {shownToday?.minutes ? `${shownToday.minutes} min` : "Rest"}</p>
          <div className="progress"><i style={{ width: `${percent}%` }} /></div>
          <p>{percent}% complete</p>
          {exerciseRows.map((exercise) => (
            <div className="exercise" key={exercise.id}>
              <span>{exercise.name}</span>
              <b>{exercise.sets} × {exercise.reps} · rest {exercise.rest}</b>
              <button
                className={progress.exercises[exercise.id] ? "done" : ""}
                onClick={() => setProgress(toggleExerciseComplete(exercise.id))}
                aria-label="Toggle complete"
              >
                {progress.exercises[exercise.id] ? "✓" : "○"}
              </button>
            </div>
          ))}
          {!exerciseRows.length && <p>Enjoy a full rest day. Light walking is optional.</p>}
        </div>
        <div className="feature-card">
          <span className="feature-icon green"></span>
          <h3>Hydration</h3>
          <strong className="big-number">{hydration.glasses} / {hydration.goal}</strong>
          <p>glasses</p>
          <button className="secondary-btn" onClick={() => { addWater().then((next) => { setHydration(next); toast("Water logged"); }).catch((error) => toast(error.message)); }}>+ Add water</button>
        </div>
        <div className="feature-card">
          <span className="feature-icon pink-icon"></span>
          <h3>Food tracking</h3>
          <p>Upload a meal photo and get an estimated nutrition breakdown.</p>
          <button className="secondary-btn" onClick={() => setFoodOpen(true)}>Upload food</button>
        </div>
        <div className="feature-card">
          <span className="feature-icon"></span>
          <h3>Ask FitBuddy</h3>
          <p>“Can I add bicep curls to today’s workout?”</p>
          <button className="primary-btn" onClick={() => setChatOpen(true)}>Ask companion</button>
        </div>
      </div>

      {cycle.applicable && (
        <div className="feature-card" style={{ marginTop: 18 }}>
          <h3>Cycle-aware recommendations</h3>
          <CycleCareBanner status={cycle} />
          {!cycle.inWindow && !cycle.startingSoon && (
            <p className="disclaimer">You’re outside the estimated period window. Gentle training is still optional. These are general wellbeing suggestions, not medical advice.</p>
          )}
        </div>
      )}

      {chatOpen && (
        <div className="modal-backdrop" onClick={() => setChatOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setChatOpen(false)}>×</button>
            <CompanionChat
              mode="physical"
              opener="Ask me about today’s session. I can help you keep it realistic."
              placeholder="Can I add bicep curls today?"
            />
          </div>
        </div>
      )}
      {foodOpen && (
        <div className="modal-backdrop" onClick={() => setFoodOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setFoodOpen(false)}>×</button>
            <h2>Food tracking</h2>
            <FoodUpload />
          </div>
        </div>
      )}
    </div>
  );
}
