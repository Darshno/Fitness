const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-lite";
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash,gemini-3.5-flash-lite")
  .split(",").map((v) => v.trim()).filter(Boolean);
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function hasGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function requestModel(model, parts) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(
      `${API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          // Lower temperature + more output room: the body-analysis prompt asks
          // for a longer structured JSON object, and we want repeatable,
          // less noisy field values run to run.
          generationConfig: { temperature: 0.25, maxOutputTokens: 1200 },
        }),
        signal: controller.signal,
      }
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body?.error?.message || `Gemini request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return body?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || null;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateContent({ prompt, image }) {
  if (!hasGemini()) return null;
  const parts = [{ text: prompt }];
  if (image?.data && image?.mimeType) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
  }

  const models = [...new Set([DEFAULT_MODEL, ...FALLBACK_MODELS])];
  let lastError = null;
  for (const model of models) {
    try {
      const result = await requestModel(model, parts);
      if (result) return result;
      lastError = new Error(`Gemini returned no content for ${model}`);
    } catch (error) {
      lastError = error;
      console.error(`Gemini model ${model} failed:`, error.message);
      if (![429, 500, 502, 503, 504].includes(error.status)) break;
    }
  }
  console.warn("All configured Gemini models failed; using deterministic FitBuddy fallback.", lastError?.message || "");
  return null;
}

export { hasGemini, generateContent, DEFAULT_MODEL };
