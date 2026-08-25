import { apiRequest } from "./api";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
}

// image: a File (from either the webcam capture or the file picker).
// knownHeightCm: optional user-entered height, used server-side as a scale
// anchor so body-fat/muscle proportion estimates are meaningfully more
// accurate than guessing height from the photo alone.
export async function analyzeBodyPhoto(image, { knownHeightCm } = {}) {
  if (!image || !image.type?.startsWith("image/")) throw new Error("Please choose an image file.");
  if (image.size > 8 * 1024 * 1024) throw new Error("Please choose an image smaller than 8 MB.");
  const base64 = await fileToBase64(image);
  const heightValue = Number(knownHeightCm);
  const payload = { image: base64, mimeType: image.type };
  if (Number.isFinite(heightValue) && heightValue >= 80 && heightValue <= 250) {
    payload.knownHeightCm = heightValue;
  }
  return apiRequest("/api/body/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
