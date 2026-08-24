import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Companion from "../components/Companion";
import CompanionChat from "../components/CompanionChat";
import CycleCareBanner from "../components/CycleCareBanner";
import FoodUpload from "../components/FoodUpload";
import { useAuth } from "../context/AuthContext";
import { getCycleStatus } from "../services/cycleService";
import { addWater, getFoodLogs, getHydration, totalCalories } from "../services/foodService";
import { getMood, saveMood } from "../services/notificationService";
import { generateWorkoutPlan, getProgress, getTodayWorkout, getWorkoutPlan, workoutCompletionPercent } from "../services/workoutService";
import { FITNESS_GOALS, MOOD_OPTIONS, labelFor } from "../data/options";
import { useToast } from "../context/ToastContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [foodOpen, setFoodOpen] = useState(false);
  const [hydration, setHydration] = useState({ glasses: 0, goal: 8 });
  const [mood, setMood] = useState(getMood()?.mood || user.profile.mood || "");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Promise.all([getFoodLogs(), getHydration()])
      .then(([foodLogs, water]) => {
        setLogs(Array.isArray(foodLogs) ? foodLogs : []);
        setHydration(water && typeof water === "object" ? water : { glasses: 0, goal: 8 });
      })
      .catch(() => {
        setLogs([]);
        setHydration({ glasses: 0, goal: 8 });
      });
  }, []);

  const calories = totalCalories(logs);
  const cycle = getCycleStatus(user.profile);
  const womenMode = cycle.type === "pregnancy" || (cycle.type === "period" && cycle.inWindow);
  const plan = womenMode ? generateWorkoutPlan({ goal: user.profile?.goal, weeks: 4, profile: user.profile, inPeriodWindow: cycle.inWindow }) : getWorkoutPlan();
  const today = getTodayWorkout(plan);
  const progress = getProgress();
  const percent = today ? workoutCompletionPercent(today, progress) : 0;
  const glasses = Array.from({ length: hydration.goal }, (_, i) => (i < hydration.glasses ? "▣" : "□")).join(" ");

  const goalLabel = labelFor(FITNESS_GOALS, user.profile.goal);
  const goalPercent = Math.min(92, 18 + Number(user.profile.timelineWeeks || 12) * 2);

  return (
    <div className="content-grid">
      <div className="center-column">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR AI COMPANION</span>
            <h2>I’m {user.companion?.name || "FitBuddy"}</h2>
            <p>Your AI companion for<br />fitness & wellbeing</p>
            <p className="quote">"Today's focus: Yoga Flow. Ready when you are."</p>
            <button className="primary-btn" onClick={() => setChatOpen(true)}>◌ &nbsp; Chat with me</button>
          </div>
          <Companion
            color={user.companion?.color}
            accessory={user.companion?.accessory}
            variant={user.companion?.variant}
            size="face"
          />
        </section>

        <h3>What’s happening today</h3>
        <div className="stats-grid">
          <article className="stat-card workout">
            <small>Today’s Workout</small>
            <strong>{today?.title || "Rest"}</strong>
            <span>{today?.minutes ? `${today.minutes} min` : "Recovery day"}</span>
            <div className="progress"><i style={{ width: `${percent}%` }} /></div>
            <em>{percent}%</em>
          </article>
          <article className="stat-card water">
            <small>Hydration</small>
            <strong>{hydration.glasses} / {hydration.goal} <span>glasses</span></strong>
            <button
              className="glasses"
              onClick={() => {
                addWater()
                  .then((next) => {
                    setHydration(next && typeof next === "object" ? next : hydration);
                    toast("Water logged");
                  })
                  .catch((error) => toast(error.message));
              }}
            >
              {glasses}
            </button>
          </article>
          <article className="stat-card mood">
            <small>Mood Check-in</small>
            <strong>{labelFor(MOOD_OPTIONS, mood)}</strong>
            <div className="choice-grid" style={{ marginTop: 10 }}>
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`choice ${mood === option.id ? "active" : ""}`}
                  onClick={() => {
                    setMood(option.id);
                    saveMood(option.id);
                    toast("Mood saved");
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </article>
          <article className="stat-card calories">
            <small>Food tracking</small>
            <strong>{calories || 0} <span>kcal logged</span></strong>
            <button className="link-btn" onClick={() => setFoodOpen(true)}>Log a meal</button>
          </article>
        </div>



        <CycleCareBanner status={cycle} />

        <div className="motivation">
          <div className="quote-mark">“</div>
          <div><strong>Small steps every day lead to big changes.</strong><br /><span>You’ve got this! </span></div>
        </div>
      </div>

      <aside className="right-column">
        <section className="side-card goal-card">
          <h3>Goal Progress</h3>
          <p> &nbsp; {goalLabel}</p>
          <div className="ring" style={{ "--p": `${goalPercent}%` }}><span>{goalPercent}<small>%</small></span></div>
          <p className="center-note">Consistency over intensity.<br />Keep going </p>
          <button className="link-btn" onClick={() => navigate("/plan")}>View plan →</button>
        </section>
        <section className="side-card">
          <h3>Today’s Plan</h3>
          <ul className="timeline">
            <li><span />Warm Up <b>5 min</b></li>
            <li className="current"><span /><strong>{today?.title || "Rest"}</strong><b>{today?.minutes ? `${today.minutes} min` : "—"}</b></li>
            <li><span />Log a meal <b>—</b></li>
            <li><span />Hydration <b>{hydration.glasses}/{hydration.goal}</b></li>
          </ul>
        </section>
      </aside>

      {chatOpen && (
        <div className="modal-backdrop" onClick={() => setChatOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setChatOpen(false)}>×</button>
            <CompanionChat mode="home" opener="Hey! What can I help you with today?" />
          </div>
        </div>
      )}
      {foodOpen && (
        <div className="modal-backdrop" onClick={() => setFoodOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setFoodOpen(false)}>×</button>
            <h2>Log food</h2>
            <FoodUpload />
          </div>
        </div>
      )}
    </div>
  );
}
