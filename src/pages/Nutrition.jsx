import { useEffect, useMemo, useState } from "react";
import CompanionChat from "../components/CompanionChat";
import FoodUpload from "../components/FoodUpload";
import { useToast } from "../context/ToastContext";
import {
  addWater,
  getFoodLogs,
  getHydration,
  totalCalories,
} from "../services/foodService";

export default function Nutrition() {
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [foodOpen, setFoodOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [hydration, setHydration] = useState({ glasses: 0, goal: 8 });

  useEffect(() => {
    Promise.all([getFoodLogs(), getHydration()]).then(([foodLogs, water]) => { setLogs(foodLogs); setHydration(water); }).catch((error) => toast(error.message));
  }, []);

  const calories = useMemo(() => totalCalories(logs), [logs]);

  return (
    <div>
      <div className="mode-header nutrition-header">
        <div>
          <span className="eyebrow">NUTRITION MODE</span>
          <h2>Fuel up 🍎</h2>
          <p>Meals, hydration and calories for today.</p>
        </div>
        <button className="primary-btn" onClick={() => setFoodOpen(true)}>
          Log a meal
        </button>
      </div>

      <div className="feature-grid">
        <div className="feature-card large">
          <span className="feature-icon pink-icon">🍽</span>
          <h3>Today’s meals</h3>
          <strong className="big-number">{calories}</strong>
          <p>calories logged</p>
          {logs.map((entry) => (
            <div className="exercise" key={entry.id}>
              <span>{entry.name || "Meal"}</span>
              <b>{entry.calories} kcal</b>
            </div>
          ))}
          {!logs.length && <p>No meals logged yet today.</p>}
        </div>
        <div className="feature-card">
          <span className="feature-icon green">💧</span>
          <h3>Hydration</h3>
          <strong className="big-number">{hydration.glasses} / {hydration.goal}</strong>
          <p>glasses</p>
          <button
            className="secondary-btn"
            onClick={() => {
              addWater().then((next) => { setHydration(next); toast("Water logged"); }).catch((error) => toast(error.message));
            }}
          >
            + Add water
          </button>
        </div>
        <div className="feature-card">
          <span className="feature-icon">💬</span>
          <h3>Ask FitBuddy</h3>
          <p>“Is this a good snack before a workout?”</p>
          <button className="primary-btn" onClick={() => setChatOpen(true)}>
            Ask companion
          </button>
        </div>
      </div>

      {chatOpen && (
        <div className="modal-backdrop" onClick={() => setChatOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setChatOpen(false)}>×</button>
            <CompanionChat
              mode="nutrition"
              opener="Ask me about meals, hydration or cravings — I'll keep it simple."
              placeholder="What should I eat before my workout?"
            />
          </div>
        </div>
      )}
      {foodOpen && (
        <div className="modal-backdrop" onClick={() => setFoodOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setFoodOpen(false)}>×</button>
            <h2>Log a meal</h2>
            <FoodUpload
              onSaved={() => {
                getFoodLogs().then(setLogs).catch((error) => toast(error.message));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
