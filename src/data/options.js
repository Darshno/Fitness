export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Mostly sedentary" },
  { id: "light", label: "Lightly active" },
  { id: "moderate", label: "Moderately active" },
  { id: "active", label: "Very active" },
];

export const FITNESS_GOALS = [
  { id: "weight-loss", label: "Weight loss" },
  { id: "muscle-gain", label: "Muscle gain" },
  { id: "general-fitness", label: "General fitness" },
];

export const GENDERS = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "non-binary", label: "Non-binary" },
  { id: "unspecified", label: "Prefer not to say" },
];

export const MOOD_OPTIONS = [
  { id: "low", label: "Low" },
  { id: "okay", label: "Okay" },
  { id: "good", label: "Good" },
  { id: "great", label: "Great" },
];

export const STRESS_OPTIONS = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

export const SLEEP_OPTIONS = [
  { id: "poor", label: "Poor" },
  { id: "okay", label: "Okay" },
  { id: "good", label: "Good" },
];

export const COPE_OPTIONS = [
  { id: "talk", label: "Talk it out" },
  { id: "move", label: "Move my body" },
  { id: "rest", label: "Rest and reset" },
  { id: "create", label: "Create or journal" },
];

export const WELLBEING_OPTIONS = [
  { id: "struggling", label: "A bit of a struggle" },
  { id: "mixed", label: "Mixed" },
  { id: "steady", label: "Pretty steady" },
  { id: "strong", label: "Feeling strong" },
];

export const TIMELINE_OPTIONS = [
  { id: "4", label: "4 weeks" },
  { id: "8", label: "8 weeks" },
  { id: "12", label: "12 weeks" },
  { id: "16", label: "16 weeks" },
  { id: "24", label: "24 weeks" },
];

export const COMPANION_COLORS = [
  { id: "lavender", label: "Lavender", accent: "#6639e9", light: "#f2edff" },
  { id: "pink", label: "Blush", accent: "#ec4899", light: "#fdf2f8" },
  { id: "blue", label: "Sky Blue", accent: "#0284c7", light: "#f0f9ff" },
  { id: "mint", label: "Mint", accent: "#10b981", light: "#ecfdf5" },
  { id: "orange", label: "Sunset", accent: "#ea580c", light: "#fff7ed" },
  { id: "cyan", label: "Cyber Cyan", accent: "#06b6d4", light: "#ecfeff" },
  { id: "gold", label: "Solar Gold", accent: "#d97706", light: "#fefce8" },
  { id: "obsidian", label: "Obsidian", accent: "#4f46e5", light: "#f5f3ff" },
];

export const COMPANION_ACCESSORIES = [
  { id: "none", label: "None" },
  { id: "bow", label: "Bow" },
  { id: "cap", label: "Cap" },
  { id: "glasses", label: "Glasses" },
  { id: "headphones", label: "Headphones" },
  { id: "tie", label: "Tie" },
];

export function labelFor(list, id) {
  return list?.find((item) => item.id === id)?.label || "-";
}
