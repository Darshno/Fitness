import { getCurrentUser, persistUser } from "./authService";

const ACCESSORY_STORAGE_KEY = "selectedAccessory";
const COMPANION_VARIANT_STORAGE_KEY = "fitbuddy.companionVariant";

export function getUser() {
  return getCurrentUser();
}

export async function updateProfile(partial) {
  const user = getCurrentUser();
  if (!user) throw new Error("Not signed in.");
  return persistUser({
    ...user,
    profile: { ...(user.profile || {}), ...partial },
  });
}

export async function completeOnboarding(profile) {
  const user = getCurrentUser();
  if (!user) throw new Error("Not signed in.");
  return persistUser({
    ...user,
    onboardingComplete: true,
    profile: { ...(user.profile || {}), ...profile },
  });
}

export async function saveGoalAssessment(assessment) {
  const user = getCurrentUser();
  if (!user) throw new Error("Not signed in.");
  return persistUser({ ...user, goalAssessment: assessment });
}

export async function acceptPlan() {
  const user = getCurrentUser();
  if (!user) throw new Error("Not signed in.");
  return persistUser({ ...user, planAccepted: true });
}

export function applyUITheme(color) {
  if (typeof document !== "undefined" && color) {
    document.documentElement.dataset.theme = color;
  }
}

export async function updateCompanion(companion) {
  const user = getCurrentUser();
  if (!user) throw new Error("Not signed in.");
  const updatedCompanion = { ...(user.companion || {}), ...companion };
  if (updatedCompanion.color) applyUITheme(updatedCompanion.color);
  if (updatedCompanion.variant) {
    localStorage.setItem(COMPANION_VARIANT_STORAGE_KEY, updatedCompanion.variant);
  }
  if (companion.accessory) {
    localStorage.setItem(ACCESSORY_STORAGE_KEY, companion.accessory);
  }
  return persistUser({ ...user, companion: updatedCompanion });
}

export async function updateAccount({ name, profile }) {
  const user = getCurrentUser();
  if (!user) throw new Error("Not signed in.");
  return persistUser({
    ...user,
    name: name?.trim() || user.name,
    profile: { ...(user.profile || {}), ...profile },
  });
}

export function greetingForName(name = "there") {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = String(name).trim().split(/\s+/)[0] || "there";
  return `${hello}, ${firstName}`;
}
