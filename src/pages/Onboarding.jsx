import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Companion from "../components/Companion";
import CompanionSelector from "../components/CompanionSelector";
import { useAuth } from "../context/AuthContext";
import { applyUITheme, completeOnboarding, updateCompanion } from "../services/userService";
import {
  ACTIVITY_LEVELS,
  COMPANION_COLORS,
  FITNESS_GOALS,
  GENDERS,
  MOOD_OPTIONS,
  SLEEP_OPTIONS,
  STRESS_OPTIONS,
  TIMELINE_OPTIONS,
  WELLBEING_OPTIONS,
  labelFor,
} from "../data/options";

const EMPTY = {
  age: "",
  gender: "",
  heightCm: "",
  weightKg: "",
  activityLevel: "",
  goal: "",
  targetWeightKg: "",
  timelineWeeks: "12",
  lastPeriodDate: "",
  cycleLength: "28",
  periodDuration: "5",
  mood: "",
  stress: "",
  sleep: "",
  cope: "",
  wellbeing: "",
};

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...EMPTY, ...user.profile });
  const [botName, setBotName] = useState(user.companion?.name || "FitBuddy");
  const [botColor, setBotColor] = useState(user.companion?.color || "lavender");
  const [botVariant, setBotVariant] = useState(user.companion?.variant || localStorage.getItem("fitbuddy.companionVariant") || "lady");
  const [error, setError] = useState("");

  const steps = useMemo(() => {
    const list = [1, 2, 3];
    if (data.gender === "female") list.push(4);
    list.push(5, 6, 7);
    return list;
  }, [data.gender]);

  const visualIndex = steps.indexOf(step) + 1;
  const visualTotal = steps.length;

  function set(key, value) {
    setData((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function handleColorChange(colorId) {
    setBotColor(colorId);
    applyUITheme(colorId);
  }

  function validateStep() {
    if (step === 1) {
      const age = Number(data.age);
      const height = Number(data.heightCm);
      const weight = Number(data.weightKg);
      if (!data.age || !data.gender || !data.heightCm || !data.weightKg) return "Please complete your basic information.";
      if (!Number.isFinite(age) || age < 13 || age > 100) return "Enter a realistic age.";
      if (!Number.isFinite(height) || height < 80 || height > 250) return "Enter a realistic height.";
      if (!Number.isFinite(weight) || weight < 25 || weight > 350) return "Enter a realistic weight.";
    }
    if (step === 2 && (!data.activityLevel || !data.goal)) return "Choose your activity level and goal.";
    if (step === 3) {
      if (!data.timelineWeeks) return "Choose a timeline.";
      if (data.goal !== "general-fitness" && !data.targetWeightKg) return "Add a target weight, or choose general fitness.";
      if (data.goal !== "general-fitness") {
        const target = Number(data.targetWeightKg);
        if (!Number.isFinite(target) || target < 25 || target > 350) return "Enter a realistic target weight.";
      }
    }
    if (step === 4 && data.gender === "female") {
      if (!data.lastPeriodDate || !data.cycleLength || !data.periodDuration) return "Please complete cycle details, or go back and change gender.";
      const cycleLength = Number(data.cycleLength);
      const periodDuration = Number(data.periodDuration);
      if (cycleLength < 21 || cycleLength > 45) return "Cycle length should be between 21 and 45 days.";
      if (periodDuration < 1 || periodDuration > 10 || periodDuration >= cycleLength) return "Enter a valid period duration.";
    }
    if (step === 5 && (!data.mood || !data.stress || !data.sleep || !data.wellbeing)) {
      return "Pick an option for each wellbeing question.";
    }
    if (step === 5 && !data.cope?.trim()) {
      return "Please describe how you generally cope — even a few words helps.";
    }
    return "";
  }

  function next() {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    const idx = steps.indexOf(step);
    setStep(steps[idx + 1]);
  }

  function back() {
    const idx = steps.indexOf(step);
    setStep(steps[Math.max(0, idx - 1)]);
  }

  async function finish() {
    try {
      await updateCompanion({ name: botName || "FitBuddy", color: botColor, variant: botVariant });
      const nextUser = await completeOnboarding(data);
      setUser(nextUser);
      navigate("/goal-assessment");
    } catch (error) {
      setError(error.message);
    }
  }

  function Choice({ list, value, field }) {
    return (
      <div className="choice-grid">
        {list.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`choice ${value === item.id ? "active" : ""}`}
            onClick={() => set(field, item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="panel">
      <span className="eyebrow">ONBOARDING</span>
      <h1>Let’s get to know you</h1>
      <p className="disclaimer">Step {visualIndex} of {visualTotal}</p>
      <div className="stepper">
        {steps.map((item, index) => <i key={item} className={index < visualIndex ? "on" : ""} />)}
      </div>
      {error && <div className="form-error">{error}</div>}

      {step === 1 && (
        <>
          <label className="field"><span>Age</span><input type="number" value={data.age} onChange={(e) => set("age", e.target.value)} /></label>
          <p>Gender</p>
          <Choice list={GENDERS} value={data.gender} field="gender" />
          <label className="field"><span>Height (cm)</span><input type="number" value={data.heightCm} onChange={(e) => set("heightCm", e.target.value)} /></label>
          <label className="field"><span>Weight (kg)</span><input type="number" value={data.weightKg} onChange={(e) => set("weightKg", e.target.value)} /></label>
        </>
      )}

      {step === 2 && (
        <>
          <p>Current activity level</p>
          <Choice list={ACTIVITY_LEVELS} value={data.activityLevel} field="activityLevel" />
          <p>Fitness goal</p>
          <Choice list={FITNESS_GOALS} value={data.goal} field="goal" />
        </>
      )}

      {step === 3 && (
        <>
          {data.goal !== "general-fitness" && (
            <label className="field"><span>Target weight (kg)</span>
              <input type="number" value={data.targetWeightKg} onChange={(e) => set("targetWeightKg", e.target.value)} />
            </label>
          )}
          <p>Target timeline</p>
          <Choice list={TIMELINE_OPTIONS} value={data.timelineWeeks} field="timelineWeeks" />
        </>
      )}

      {step === 4 && (
        <>
          <p className="disclaimer">This helps FitBuddy offer gentler suggestions around your cycle. It is not medical care.</p>
          <label className="field"><span>Last period date</span>
            <input type="date" value={data.lastPeriodDate} onChange={(e) => set("lastPeriodDate", e.target.value)} />
          </label>
          <label className="field"><span>Average cycle length (days)</span>
            <input type="number" value={data.cycleLength} onChange={(e) => set("cycleLength", e.target.value)} />
          </label>
          <label className="field"><span>Average period duration (days)</span>
            <input type="number" value={data.periodDuration} onChange={(e) => set("periodDuration", e.target.value)} />
          </label>
        </>
      )}

      {step === 5 && (
        <>
          <p>Current mood</p>
          <Choice list={MOOD_OPTIONS} value={data.mood} field="mood" />
          <p>Stress</p>
          <Choice list={STRESS_OPTIONS} value={data.stress} field="stress" />
          <p>Sleep</p>
          <Choice list={SLEEP_OPTIONS} value={data.sleep} field="sleep" />
          <p>How you generally cope</p>
          <label className="field" style={{ marginBottom: 0 }}>
            <textarea
              rows={3}
              value={data.cope}
              onChange={(e) => set("cope", e.target.value)}
              placeholder="e.g. I like to go for a walk, talk to a friend, journal my thoughts…"
              style={{
                resize: "vertical",
                borderRadius: 13,
                border: "1px solid var(--line)",
                padding: "13px 15px",
                outline: "none",
                background: "var(--input-bg, #fff)",
                color: "var(--ink)",
                width: "100%",
                fontFamily: "inherit",
                fontSize: 15,
                lineHeight: 1.5,
                transition: "border-color 0.2s ease, background-color 0.2s ease",
                boxSizing: "border-box",
              }}
            />
          </label>
          <p>General wellbeing</p>
          <Choice list={WELLBEING_OPTIONS} value={data.wellbeing} field="wellbeing" />
        </>
      )}

      {step === 6 && (
        <>
          <CompanionSelector value={botVariant} onChange={setBotVariant} />
          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <Companion color={botColor} variant={botVariant} size="sm" />
            <h4 style={{ margin: "10px 0 0", fontSize: 18, color: "var(--purple-deep)" }}>{botName || "FitBuddy"}</h4>
          </div>

          <label className="field">
            <span>Companion Name</span>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Give your companion a custom name..."
            />
          </label>

          <h3>Choose Theme Color</h3>
          <p className="disclaimer">The app theme will change to match your color choice.</p>
          <div className="color-swatch-grid">
            {COMPANION_COLORS.map((colorItem) => (
              <button
                key={colorItem.id}
                type="button"
                className={`color-swatch-btn ${botColor === colorItem.id ? "active" : ""}`}
                onClick={() => handleColorChange(colorItem.id)}
              >
                <span className="swatch-circle" style={{ background: colorItem.accent }} />
                {colorItem.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 7 && (
        <>
          <div className="summary-list">
            <div><span>FitBuddy</span><strong>{botVariant === "male" ? "Male" : "Lady"} ({labelFor(COMPANION_COLORS, botColor)})</strong></div>
            <div><span>Age</span><strong>{data.age}</strong></div>
            <div><span>Gender</span><strong>{labelFor(GENDERS, data.gender)}</strong></div>
            <div><span>Height / weight</span><strong>{data.heightCm} cm · {data.weightKg} kg</strong></div>
            <div><span>Activity</span><strong>{labelFor(ACTIVITY_LEVELS, data.activityLevel)}</strong></div>
            <div><span>Goal</span><strong>{labelFor(FITNESS_GOALS, data.goal)}</strong></div>
            <div><span>Timeline</span><strong>{data.timelineWeeks} weeks</strong></div>
            {data.goal !== "general-fitness" && <div><span>Target weight</span><strong>{data.targetWeightKg} kg</strong></div>}
            {data.gender === "female" && <div><span>Cycle</span><strong>{data.cycleLength}d cycle · {data.periodDuration}d period</strong></div>}
            <div><span>Mood / stress / sleep</span><strong>{labelFor(MOOD_OPTIONS, data.mood)} · {labelFor(STRESS_OPTIONS, data.stress)} · {labelFor(SLEEP_OPTIONS, data.sleep)}</strong></div>
          </div>
        </>
      )}

      <div className="btn-row" style={{ marginTop: 24 }}>
        {visualIndex > 1 && <button className="secondary-btn" onClick={back}>Back</button>}
        {step !== 7 && <button className="primary-btn" onClick={next}>Continue</button>}
        {step === 7 && <button className="primary-btn" onClick={finish}>Create My Plan</button>}
      </div>
    </div>
  );
}
