import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import FoodLog from "../models/FoodLog.js";
import Hydration from "../models/Hydration.js";
import { generateContent, hasGemini } from "../services/geminiService.js";

const router = Router();
router.use(requireAuth);

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function parseJson(text) {
  try {
    const match = text?.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch { return null; }
}

router.get("/logs", async (req, res, next) => {
  try { res.json(await FoodLog.find({ userId: req.userId, date: today() }).sort({ createdAt: -1 })); } catch (error) { next(error); }
});

router.post("/logs", async (req, res, next) => {
  try {
    const allowed = ["name", "calories", "protein", "carbohydrates", "fat", "imageName"];
    const payload = Object.fromEntries(allowed.filter((key) => Object.prototype.hasOwnProperty.call(req.body || {}, key)).map((key) => [key, req.body[key]]));
    for (const key of ["calories", "protein", "carbohydrates", "fat"]) if (payload[key] !== undefined) payload[key] = Math.max(0, Number(payload[key]) || 0);
    res.status(201).json(await FoodLog.create({ ...payload, userId: req.userId, date: today() }));
  } catch (error) { next(error); }
});

router.post("/analyze", async (req, res, next) => {
  try {
    const { image, mimeType } = req.body || {};
    if (!hasGemini()) return res.status(503).json({ error: "Gemini AI is not configured on the server." });
    if (typeof image !== "string" || !image) return res.status(400).json({ error: "Image data is required." });
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(String(mimeType || ""))) return res.status(400).json({ error: "Unsupported image type." });
    if (image.length > 14_000_000) return res.status(413).json({ error: "Image is too large." });

    const text = await generateContent({
      image: { data: image, mimeType },
      prompt: `Analyze this food photo for FitBuddy. Return ONLY valid JSON with keys: name (string), calories (number), protein (number), carbohydrates (number), fat (number), portion (string), confidence (string: low|medium|high), notes (string). These are ESTIMATES, not exact measurements. If the image is unclear, use conservative estimates and say so in notes. Do not diagnose or give medical advice.`
    });
    const parsed = parseJson(text);
    if (!parsed) return res.status(502).json({ error: "Gemini returned an unreadable nutrition estimate." });
    res.json({
      name: String(parsed.name || "Meal estimate"),
      calories: Math.max(0, Number(parsed.calories) || 0),
      protein: Math.max(0, Number(parsed.protein) || 0),
      carbohydrates: Math.max(0, Number(parsed.carbohydrates) || 0),
      fat: Math.max(0, Number(parsed.fat) || 0),
      portion: String(parsed.portion || "Unknown portion"),
      confidence: ["low", "medium", "high"].includes(parsed.confidence) ? parsed.confidence : "low",
      notes: String(parsed.notes || "Photo-based nutrition is an estimate and may be inaccurate."),
      disclaimer: "Estimated nutrition only — photo analysis cannot determine exact ingredients or portion sizes. Confirm the values before logging.",
      aiEnabled: true,
    });
  } catch (error) { next(error); }
});

router.get("/hydration", async (req, res, next) => {
  try {
    const doc = await Hydration.findOneAndUpdate({ userId: req.userId, date: today() }, { $setOnInsert: { glasses: 0, goal: 8 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json(doc);
  } catch (error) { next(error); }
});

router.post("/hydration/add", async (req, res, next) => {
  try {
    const doc = await Hydration.findOneAndUpdate({ userId: req.userId, date: today() }, { $inc: { glasses: 1 }, $setOnInsert: { goal: 8 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    if (doc.glasses > doc.goal) { doc.glasses = doc.goal; await doc.save(); }
    res.json(doc);
  } catch (error) { next(error); }
});

export default router;
