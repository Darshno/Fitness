import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";
import FoodLog from "../models/FoodLog.js";
import Hydration from "../models/Hydration.js";
import { detectCrisis, crisisSupportMessage } from "../services/safetyService.js";
import { generateContent, hasGemini } from "../services/geminiService.js";

const router = Router();
router.use(requireAuth);
const VALID_MODES = new Set(["home", "physical", "mental", "nutrition"]);

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function buildContext(userId) {
  const [user, workouts, foods, hydration] = await Promise.all([
    User.findById(userId).select("name goalAssessment profile companion").lean(),
    Workout.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    FoodLog.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Hydration.find({ userId }).sort({ date: -1 }).limit(7).lean(),
  ]);
  return { user, workouts, foods, hydration };
}

function fallback(mode) {
  const replies = {
    home: "I can help you plan a realistic next step. Tell me whether you want to focus on training, food, hydration, or recovery.",
    physical: "Keep your main lifts first, then add accessories only if your energy and form are good. I can help adjust today's session.",
    mental: "Let's keep this simple and supportive. Tell me what feels hardest right now, and we can work through one small next step.",
    nutrition: "I can help you think through meals, protein, calories, and hydration. Tell me what you have eaten so far today.",
  };
  return replies[mode] || replies.home;
}

router.get("/:mode", async (req, res, next) => {
  try {
    if (!VALID_MODES.has(req.params.mode)) return res.status(400).json({ error: "Invalid chat mode" });
    const history = await ChatMessage.find({ userId: req.userId, mode: req.params.mode }).sort({ createdAt: 1 }).limit(100);
    res.json(history);
  } catch (error) { next(error); }
});

router.post("/:mode", async (req, res, next) => {
  try {
    const { text } = req.body || {};
    const { mode } = req.params;
    if (!VALID_MODES.has(mode)) return res.status(400).json({ error: "Invalid chat mode" });
    if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "Message is required" });
    if (text.length > 4000) return res.status(400).json({ error: "Message is too long" });

    await ChatMessage.create({ userId: req.userId, mode, role: "user", text: text.trim() });
    const safety = detectCrisis(text);

    if (safety.crisis) {
      const support = crisisSupportMessage();
      await ChatMessage.create({ userId: req.userId, mode, role: "safety", text: support.body, title: support.title, resources: support.resources });
    } else {
      let answer = fallback(mode);
      if (hasGemini()) {
        try {
          const context = await buildContext(req.userId);
          answer = await generateContent({
            prompt: `You are FitBuddy, a supportive fitness and wellbeing coach. Give practical, concise guidance. Do not diagnose medical conditions. Do not claim certainty about nutrition estimates. If the user asks for medical diagnosis, medication, or emergency care, recommend an appropriate professional. Use only the supplied user context and never invent facts.\n\nMode: ${mode}\nUser message: ${text.trim()}\nUser context JSON:\n${JSON.stringify(context)}`
          }) || answer;
        } catch (error) {
          console.error("Gemini coach error:", error.message);
        }
      }
      await ChatMessage.create({ userId: req.userId, mode, role: "assistant", text: answer });
    }

    const history = await ChatMessage.find({ userId: req.userId, mode }).sort({ createdAt: 1 }).limit(100);
    res.json({ history, crisis: safety.crisis, aiEnabled: hasGemini() });
  } catch (error) { next(error); }
});

export default router;
