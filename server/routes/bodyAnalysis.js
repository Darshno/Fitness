import { Router } from "express";
import { generateContent, hasGemini } from "../services/geminiService.js";

const router = Router();

const BODY_TYPES = ["ectomorph", "mesomorph", "endomorph", "blended"];
const MASS_LEVELS = ["low", "moderate", "high", "not-estimable"];
const FAT_LEVELS = ["very-lean", "lean", "moderate", "higher", "not-estimable"];
const CONFIDENCE_LEVELS = ["low", "medium", "high"];
const IMAGE_QUALITY_LEVELS = ["good", "fair", "poor"];

function parseJson(text) {
  try {
    const match = text?.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    return null;
  }
}

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function buildPrompt(heightAnchorCm) {
  const anchorLine = heightAnchorCm
    ? `The user has told you their real height is ${heightAnchorCm} cm — treat this as an accurate scale reference and use it to calibrate every other proportion estimate you make (limb length, shoulder/waist width, and therefore body composition).`
    : `No known height was provided, so estimate height only from typical body proportions visible in the photo, and reflect that extra uncertainty by lowering your confidence rating.`;

  return `You are assisting a fitness app's onboarding step. Analyze this full-body photo methodically, the way an experienced trainer would size someone up visually before writing a program, and return ONLY valid JSON (no markdown fences, no extra commentary) with exactly this shape:
{
  "bodyType": "ectomorph" | "mesomorph" | "endomorph" | "blended",
  "estimatedHeightCm": number or null,
  "estimatedHeightRange": string (e.g. "170-178 cm", or "unknown"),
  "bodyFatLevel": "very-lean" | "lean" | "moderate" | "higher" | "not-estimable",
  "bodyFatPercentRange": string (e.g. "18-22%", or "unknown"),
  "muscleMassLevel": "low" | "moderate" | "high" | "not-estimable",
  "muscleNotes": string (one short, neutral sentence on visible muscle definition/build),
  "posture": string (brief note, e.g. "neutral spine", "forward head posture"),
  "imageQuality": "good" | "fair" | "poor",
  "imageIssues": string (empty string if none, else e.g. "partial body, dim lighting, loose clothing"),
  "notes": string,
  "confidence": "low" | "medium" | "high"
}

${anchorLine}

Method: use shoulder-to-waist and waist-to-hip ratios, limb proportions, visible muscle definition/separation, and soft-tissue coverage over the abdomen and waist to judge body fat and muscle levels. Base "confidence" on how much of the body is visible, lighting, how form-fitting the clothing is, and camera angle — use "low" whenever the photo is partial, dim, at an odd angle, or in loose/baggy clothing, regardless of how certain any single field looks.

This is a rough visual estimate for fitness-plan personalization only — NOT a medical, diagnostic, or body-fat-scan-accuracy assessment. Stay strictly descriptive and neutral: do not comment on attractiveness, and do not make value judgments about weight or appearance. If the photo is not a usable full-body photo, set imageQuality to "poor", briefly say why in imageIssues, and set confidence to "low" for the whole result.`;
}

// No requireAuth here on purpose: this runs during signup, before a session
// exists. It never touches the User model — it just returns an estimate for
// the client to show/store after the account is created.
router.post("/analyze", async (req, res, next) => {
  try {
    const { image, mimeType, knownHeightCm } = req.body || {};
    if (!hasGemini()) return res.status(503).json({ error: "Gemini AI is not configured on the server." });
    if (typeof image !== "string" || !image) return res.status(400).json({ error: "Image data is required." });
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(String(mimeType || ""))) {
      return res.status(400).json({ error: "Unsupported image type." });
    }
    if (image.length > 14_000_000) return res.status(413).json({ error: "Image is too large." });

    const rawHeight = Number(knownHeightCm);
    const heightAnchorCm = Number.isFinite(rawHeight) && rawHeight >= 80 && rawHeight <= 250 ? Math.round(rawHeight) : null;

    const text = await generateContent({
      image: { data: image, mimeType },
      prompt: buildPrompt(heightAnchorCm),
    });

    const parsed = parseJson(text);
    if (!parsed) return res.status(502).json({ error: "Gemini returned an unreadable body analysis." });

    const parsedHeightCm = Number(parsed.estimatedHeightCm);

    res.json({
      bodyType: pick(parsed.bodyType, BODY_TYPES, "blended"),
      estimatedHeightCm: heightAnchorCm || (Number.isFinite(parsedHeightCm) ? Math.round(parsedHeightCm) : null),
      estimatedHeightRange: heightAnchorCm ? `${heightAnchorCm} cm (as provided)` : String(parsed.estimatedHeightRange || "unknown"),
      heightSource: heightAnchorCm ? "user-provided" : "photo-estimate",
      bodyFatLevel: pick(parsed.bodyFatLevel, FAT_LEVELS, "not-estimable"),
      bodyFatPercentRange: String(parsed.bodyFatPercentRange || "unknown"),
      muscleMassLevel: pick(parsed.muscleMassLevel, MASS_LEVELS, "not-estimable"),
      muscleNotes: String(parsed.muscleNotes || "Not clearly visible."),
      posture: String(parsed.posture || "Not clearly visible."),
      imageQuality: pick(parsed.imageQuality, IMAGE_QUALITY_LEVELS, "fair"),
      imageIssues: String(parsed.imageIssues || ""),
      notes: String(parsed.notes || "Photo-based estimate; treat as approximate."),
      confidence: pick(parsed.confidence, CONFIDENCE_LEVELS, heightAnchorCm ? "medium" : "low"),
      disclaimer: "Estimated from a photo only — not medical advice or a body-fat scan. You can skip this step or redo it anytime in your profile.",
      aiEnabled: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
