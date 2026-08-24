import { Router } from "express";
import { generateContent, hasGemini } from "../services/geminiService.js";

const router = Router();

function parseJson(text) {
  try {
    const match = text?.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    return null;
  }
}

// No requireAuth here on purpose: this runs during signup, before a session
// exists. It never touches the User model — it just returns an estimate for
// the client to show/store after the account is created.
router.post("/analyze", async (req, res, next) => {
  try {
    const { image, mimeType } = req.body || {};
    if (!hasGemini()) return res.status(503).json({ error: "Gemini AI is not configured on the server." });
    if (typeof image !== "string" || !image) return res.status(400).json({ error: "Image data is required." });
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(String(mimeType || ""))) {
      return res.status(400).json({ error: "Unsupported image type." });
    }
    if (image.length > 14_000_000) return res.status(413).json({ error: "Image is too large." });

    const text = await generateContent({
      image: { data: image, mimeType },
      prompt: `Analyze this full-body photo for a fitness app's onboarding step. Return ONLY valid JSON with keys: bodyType (string: one of ectomorph|mesomorph|endomorph|blended), estimatedHeightRange (string, e.g. "170-178 cm", or "unknown" if not estimable), posture (string: brief note on visible posture, e.g. "neutral spine", "forward head posture"), notes (string), confidence (string: low|medium|high). This is a rough visual estimate for onboarding only — NOT a medical, body-fat, or diagnostic assessment. Do not comment on attractiveness, weight judgment, or give health/medical advice. If the photo is unclear or not a full body, say so in notes and use confidence "low".`,
    });

    const parsed = parseJson(text);
    if (!parsed) return res.status(502).json({ error: "Gemini returned an unreadable body analysis." });

    res.json({
      bodyType: ["ectomorph", "mesomorph", "endomorph", "blended"].includes(parsed.bodyType) ? parsed.bodyType : "blended",
      estimatedHeightRange: String(parsed.estimatedHeightRange || "unknown"),
      posture: String(parsed.posture || "Not clearly visible."),
      notes: String(parsed.notes || "Photo-based estimate; treat as approximate."),
      confidence: ["low", "medium", "high"].includes(parsed.confidence) ? parsed.confidence : "low",
      disclaimer: "Estimated from a photo only — not medical advice. You can skip this step or redo it anytime in your profile.",
      aiEnabled: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
