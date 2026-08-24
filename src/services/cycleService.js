function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

export function getCycleStatus(profile, now = new Date()) {
  if (profile?.gender !== "female") {
    return { applicable: false, inWindow: false, startingSoon: false };
  }

  const last = parseDate(profile.lastPeriodDate);
  const cycleLength = clampNumber(profile.cycleLength, 21, 45, 28);
  const periodDuration = clampNumber(profile.periodDuration, 1, Math.min(10, cycleLength - 1), 5);

  if (!last) {
    return {
      applicable: true,
      inWindow: false,
      startingSoon: false,
      unknown: true,
      message: "Add your last period date if you want cycle-aware suggestions.",
      suggestions: [],
      disclaimer: "Cycle estimates are approximate and are not medical advice.",
    };
  }

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSince = Math.max(0, Math.floor((startOfNow - last) / 86400000));
  const cycleDay = (daysSince % cycleLength) + 1;
  const startingSoon = cycleDay >= Math.max(1, cycleLength - 2);
  const inWindow = cycleDay <= periodDuration || startingSoon;
  const cyclesElapsed = Math.floor(daysSince / cycleLength);
  const estimatedStart = addDays(last, (cyclesElapsed + 1) * cycleLength);

  return {
    applicable: true,
    inWindow,
    startingSoon,
    dayInCycle: cycleDay,
    cycleLength,
    periodDuration,
    estimatedStart: localDateKey(estimatedStart),
    message: startingSoon
      ? "Your period may be starting soon."
      : inWindow
        ? "You may be in your period window."
        : "Cycle Care is available anytime you want gentler options.",
    suggestions: [
      "Gentle movement or yoga",
      "Rest if energy is low",
      "Hydration",
      "Nourishing meals",
    ],
    disclaimer: "These are general wellbeing suggestions, not medical advice.",
  };
}
