import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Workout from "../models/Workout.js";
import FoodLog from "../models/FoodLog.js";
import Hydration from "../models/Hydration.js";
import User from "../models/User.js";
import { generateContent, hasGemini } from "../services/geminiService.js";

const router = Router();
router.use(requireAuth);

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysBack(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i); out.push(dayKey(d)); }
  return out;
}
function volume(workout) {
  return (workout.exercises || []).reduce((sum, ex) => {
    const reps = Number.parseInt(String(ex.reps || "0").match(/\d+/)?.[0] || "0", 10);
    const sets = Number(ex.sets) || 0;
    const weight = Number(ex.weight) || 0;
    return sum + reps * sets * weight;
  }, 0);
}

async function buildOverview(userId) {
  const keys = daysBack(7);
  const since = new Date(); since.setDate(since.getDate() - 7);
  const [user, workouts, foods, hydration] = await Promise.all([
    User.findById(userId).select("name goalAssessment profile").lean(),
    Workout.find({ userId, updatedAt: { $gte: since } }).lean(),
    FoodLog.find({ userId, createdAt: { $gte: since } }).lean(),
    Hydration.find({ userId, date: { $in: keys } }).lean(),
  ]);
  const byDay = keys.map((date) => ({
    date,
    workouts: workouts.filter((w) => dayKey(w.updatedAt || w.createdAt) === date && w.progress?.completed).length,
    calories: foods.filter((f) => f.date === date).reduce((s, f) => s + (Number(f.calories) || 0), 0),
    protein: foods.filter((f) => f.date === date).reduce((s, f) => s + (Number(f.protein) || 0), 0),
    water: hydration.find((h) => h.date === date)?.glasses || 0,
  }));
  return {
    user,
    days: byDay,
    totals: {
      workouts: byDay.reduce((s, d) => s + d.workouts, 0),
      calories: byDay.reduce((s, d) => s + d.calories, 0),
      protein: byDay.reduce((s, d) => s + d.protein, 0),
      water: byDay.reduce((s, d) => s + d.water, 0),
      volume: workouts.reduce((s, w) => s + volume(w), 0),
    },
  };
}

router.get("/overview", async (req, res, next) => {
  try { res.json(await buildOverview(req.userId)); } catch (error) { next(error); }
});

router.get("/weekly-report", async (req, res, next) => {
  try {
    const overview = await buildOverview(req.userId);
    let report = `You completed ${overview.totals.workouts} workout(s) in the last 7 days. You logged ${Math.round(overview.totals.calories)} kcal and ${Math.round(overview.totals.protein)} g protein. Hydration totaled ${Math.round(overview.totals.water)} glasses. Keep focusing on consistency rather than perfection.`;
    let aiUsed = false;
    if (hasGemini()) {
      try {
        const aiReport = await generateContent({ prompt: `Create a concise FitBuddy weekly fitness/wellbeing report from this data. Include: wins, areas to improve, and 3 practical next-week actions. Do not diagnose health conditions and do not invent missing data. Clearly say when a metric is unavailable.\n\n${JSON.stringify(overview)}` });
        if (aiReport) {
          report = aiReport;
          aiUsed = true;
        }
      } catch (aiError) {
        console.error("Gemini weekly report error:", aiError.message);
      }
    }
    res.json({ report, overview, aiEnabled: hasGemini(), aiUsed });
  } catch (error) { next(error); }
});

export default router;
