import { persistUser, getCurrentUser } from "./authService";
import { read, write } from "./storage";

function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DEFAULT_REMINDERS = {
  hydration: true,
  workout: true,
  mood: true,
};

export function getReminderSettings() {
  const user = getCurrentUser();
  return user?.reminders || DEFAULT_REMINDERS;
}

export function saveReminderSettings(reminders) {
  const user = getCurrentUser();
  if (!user) return reminders;
  persistUser({ ...user, reminders });
  return reminders;
}

export function getMood() {
  const user = getCurrentUser();
  if (!user) return null;
  const today = localDayKey();
  return read(`mood.${user.id}.${today}`, null);
}

export function saveMood(mood) {
  const user = getCurrentUser();
  if (!user) return mood;
  const today = localDayKey();
  write(`mood.${user.id}.${today}`, { mood, at: new Date().toISOString() });
  return mood;
}
