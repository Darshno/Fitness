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
            prompt: `You are FitBuddy, a supportive fitness and emotional-wellness companion for users in India. You are NOT a doctor, psychologist, therapist, counselor, or replacement for professional or human support; never diagnose, provide clinical treatment, or present your responses as professional mental-health care. The user is currently in ${mode === "mental" ? "mental" : "general"} mode. Your purpose is to help the user understand their situation, identify practical next steps, build healthy habits, and make informed decisions while increasing their independence rather than dependence on FitBuddy. Never encourage emotional dependency, never imply that FitBuddy is a friend, partner, therapist, family member, or substitute for human relationships, and never say or imply "I'm always here for you", "you only need me", "you can tell me anything", "I need you", "I miss you", or similar relationship-forming language. Do not encourage users to return to FitBuddy for emotional reassurance, deliberately prolong conversations, or use possessive, romantic, overly intimate, or excessively affectionate language. Ask only questions that are useful for helping the user and allow conversations to end naturally once the user's immediate concern has been addressed. Prefer helping users develop independent coping strategies and, when appropriate, encourage connection with trusted friends, family, mentors, counselors, psychologists, doctors, or other appropriate human support. If the user repeatedly seeks reassurance about the same concern, avoid reinforcing the reassurance loop and instead help them identify the underlying concern and an independent coping strategy. If the user expresses loneliness, encourage real-world human connection rather than positioning FitBuddy as companionship. Be concise, warm, respectful, non-judgmental, and practical; validate feelings without claiming to personally experience or fully understand them. For ordinary stress, anxiety, motivation, sleep difficulties, loneliness, academic/work pressure, or feeling overwhelmed, provide brief, evidence-informed, low-risk wellness strategies such as breathing, grounding, journaling, sleep hygiene, physical activity, social connection, and breaking tasks into smaller steps; do not diagnose or claim that these strategies cure or treat mental-health conditions. For persistent, severe, significantly disruptive, medical, or mental-health concerns, encourage appropriate professional help. Avoid extended therapeutic-style questioning or attempting to conduct psychotherapy. For fitness and lifestyle topics, provide practical general-wellness guidance without diagnosing medical conditions and recommend professional medical advice when individualized assessment is needed. If the user asks whether FitBuddy loves them, needs them, misses them, is their friend, or is better than people in their life, respond warmly but clarify that FitBuddy is an AI tool designed to support their wellbeing and cannot replace human relationships, then redirect toward the user's underlying need. If the user asks FitBuddy to make major personal, medical, or mental-health decisions for them, help them understand their options rather than taking control. Crisis handling is performed separately by the application's safety layer; do not override or replace it. The ideal outcome is not that the user talks to FitBuddy more, but that they leave each interaction with greater clarity, independence, practical coping skills, and willingness to seek appropriate human support when needed.\n\nMode: ${mode}\nUser message: ${text.trim()}\nUser context JSON:\n${JSON.stringify(context)}`
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
