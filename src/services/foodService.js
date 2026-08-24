import { read, write } from "./storage";
import { getCurrentUser } from "./authService";
import { apiRequest } from "./api";

function localDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function foodKey(userId) { return `food.${userId}.${localDayKey()}`; }
function hydrationKey(userId) { return `hydration.${userId}.${localDayKey()}`; }

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(file);
  });
}

export async function analyzeFood(image) {
  if (!image || !image.type?.startsWith("image/")) throw new Error("Please choose an image file.");
  if (image.size > 8 * 1024 * 1024) throw new Error("Please choose an image smaller than 8 MB.");
  const base64 = await fileToBase64(image);
  const result = await apiRequest("/api/food/analyze", { method: "POST", body: JSON.stringify({ image: base64, mimeType: image.type }) });
  return result;
}

export async function saveFoodLog(entry) {
  try {
    const result = await apiRequest("/api/food/logs", { method: "POST", body: JSON.stringify(entry) });
    const user = getCurrentUser();
    if (user) write(foodKey(user.id), [result, ...read(foodKey(user.id), [])]);
    return result;
  } catch {
    const user = getCurrentUser();
    if (!user) return entry;
    const next = { id: crypto.randomUUID(), at: new Date().toISOString(), ...entry };
    write(foodKey(user.id), [next, ...read(foodKey(user.id), [])]);
    return next;
  }
}

export async function getFoodLogs() {
  try { return await apiRequest("/api/food/logs"); }
  catch {
    const user = getCurrentUser();
    return user ? read(foodKey(user.id), []) : [];
  }
}

export async function getHydration() {
  try { return await apiRequest("/api/food/hydration"); }
  catch {
    const user = getCurrentUser();
    return user ? read(hydrationKey(user.id), { glasses: 0, goal: 8 }) : { glasses: 0, goal: 8 };
  }
}

export async function addWater() {
  try { return await apiRequest("/api/food/hydration/add", { method: "POST" }); }
  catch {
    const user = getCurrentUser();
    const current = await getHydration();
    const next = { ...current, glasses: Math.min(current.goal, current.glasses + 1) };
    if (user) write(hydrationKey(user.id), next);
    return next;
  }
}

export function totalCalories(logs = []) { return logs.reduce((sum, item) => sum + (Number(item.calories) || 0), 0); }
