const DEFAULT_MODEL = process.env.GEMINI_MODEL?.trim().replace(/^models\//, "") || "gemini-3.5-flash-lite";
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash").split(",").map((v) => v.trim().replace(/^models\//, "")).filter(Boolean);
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function hasGemini() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function uniqueModels() {
  return [...new Set([DEFAULT_MODEL, ...FALLBACK_MODELS])];
}

async function requestModel(model, parts) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY.trim())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 900 },
      }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body?.error?.message || `Gemini request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    const text = body?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("").trim();
    if (!text) {
      const error = new Error(`Gemini returned no text for ${model}`);
      error.status = 200;
      throw error;
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateContent({ prompt, image, history = [] }) {
  if (!hasGemini()) return null;

  const parts = [{ text: prompt }];
  if (Array.isArray(history) && history.length) {
    parts.push({ text: `Recent conversation:\n${history.slice(-12).map((m) => `${m.role === "user" ? "User" : "FitBuddy"}: ${m.text}`).join("\n")}` });
  }
  if (image?.data && image?.mimeType) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
  }

  let lastError = null;
  for (const model of uniqueModels()) {
    try {
      const result = await requestModel(model, parts);
      console.log(`Gemini response generated with ${model}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Gemini model ${model} failed:`, error.message);
      // Keep trying another configured model for model-not-found, quota, overload,
      // invalid model, or temporary provider errors.
    }
  }
  console.warn("All configured Gemini models failed; using FitBuddy fallback.", lastError?.message || "");
  return null;
}

export { hasGemini, generateContent, DEFAULT_MODEL };
