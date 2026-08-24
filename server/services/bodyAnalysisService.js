import { apiRequest } from "./api";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
}

export async function analyzeBodyPhoto(image) {
  if (!image || !image.type?.startsWith("image/")) throw new Error("Please choose an image file.");
  if (image.size > 8 * 1024 * 1024) throw new Error("Please choose an image smaller than 8 MB.");
  const base64 = await fileToBase64(image);
  return apiRequest("/api/body/analyze", {
    method: "POST",
    body: JSON.stringify({ image: base64, mimeType: image.type }),
  });
}
