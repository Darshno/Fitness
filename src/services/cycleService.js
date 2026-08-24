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

export function getCycleStatus(profile = {}, now = new Date()) {
  if (profile?.gender !== "female") return { applicable: false, type: "none" };

  const reproductiveStatus = profile.reproductiveStatus || "not_pregnant";
  if (reproductiveStatus === "pregnant" || reproductiveStatus === "possibly_pregnant") {
    const weeks = clampNumber(profile.pregnancyWeeks, 0, 42, 0);
    const trimester = weeks >= 28 ? 3 : weeks >= 14 ? 2 : 1;
    return {
      applicable: true,
      type: "pregnancy",
      reproductiveStatus,
      pregnancyWeeks: weeks,
      trimester,
      exerciseRestricted: Boolean(profile.pregnancyExerciseRestricted),
      message: reproductiveStatus === "possibly_pregnant"
        ? "Pregnancy is possible. Use the pregnancy-safe pathway and confirm with your clinician before exercising."
        : `Pregnancy-aware plan · ${weeks || "early"} weeks · trimester ${trimester}`,
      disclaimer: "Pregnancy exercise needs individual medical guidance when complications or restrictions are present.",
    };
  }

  const last = parseDate(profile.lastPeriodDate);
  const cycleLength = clampNumber(profile.cycleLength, 21, 45, 28);
  const periodDuration = clampNumber(profile.periodDuration, 1, Math.min(10, cycleLength - 1), 5);

  if (!last) {
    return {
      applicable: true,
      type: "period",
      inWindow: false,
      startingSoon: false,
      unknown: true,
      manualPeriodActive: profile.manualPeriodActive,
      message: "Add your last period date, or mark that you are on your period today.",
      disclaimer: "Cycle estimates are approximate and are not medical advice.",
    };
  }

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSince = Math.max(0, Math.floor((startOfNow - last) / 86400000));
  const cycleDay = (daysSince % cycleLength) + 1;
  const startingSoon = cycleDay >= Math.max(1, cycleLength - 2);
  const estimatedInWindow = cycleDay <= periodDuration || startingSoon;
  const inWindow = typeof profile.manualPeriodActive === "boolean" ? profile.manualPeriodActive : estimatedInWindow;
  const cyclesElapsed = Math.floor(daysSince / cycleLength);
  const estimatedStart = addDays(last, (cyclesElapsed + 1) * cycleLength);

  return {
    applicable: true,
    type: "period",
    inWindow,
    startingSoon,
    dayInCycle: cycleDay,
    cycleLength,
    periodDuration,
    estimatedStart: localDateKey(estimatedStart),
    painLevel: clampNumber(profile.periodPain, 0, 10, 0),
    energyLevel: profile.periodEnergy || "normal",
    message: inWindow
      ? "You are marked as being on your period. Today’s plan is adjusted around comfort and energy."
      : startingSoon
        ? "Your period may be starting soon. You can switch to a gentler plan anytime."
        : "You are outside the estimated period window.",
    disclaimer: "Cycle estimates are approximate and are not medical advice.",
  };
}

export function getWomenCarePlan(status) {
  if (!status?.applicable) return null;

  if (status.type === "pregnancy") {
    if (status.exerciseRestricted || status.reproductiveStatus === "possibly_pregnant") {
      return {
        title: "Clinician-first movement plan",
        intensity: "Only exercise if your clinician/midwife has cleared it.",
        days: [
          { title: "Rest + breathing", minutes: 10, exercises: ["Comfortable breathing", "Gentle mobility if cleared"] },
          { title: "Easy walk", minutes: 10, exercises: ["Easy walking only if cleared"] },
          { title: "Rest", minutes: 0, exercises: [] },
          { title: "Gentle mobility", minutes: 10, exercises: ["Shoulder circles", "Cat-cow if comfortable"] },
          { title: "Rest", minutes: 0, exercises: [] },
          { title: "Easy walk", minutes: 10, exercises: ["Easy walking only if cleared"] },
          { title: "Rest", minutes: 0, exercises: [] },
        ],
      };
    }

    const common = [
      { title: "Walking + pelvic floor", minutes: 25, exercises: ["Brisk walk", "Pelvic floor squeezes"] },
      { title: "Pregnancy strength", minutes: 25, exercises: ["Supported squat", "Resistance-band row", "Wall push-up", "Bird dog"] },
      { title: "Recovery mobility", minutes: 20, exercises: ["Cat-cow", "Hip mobility", "Shoulder circles", "Breathing"] },
      { title: "Swimming / easy cardio", minutes: 25, exercises: ["Swimming or stationary bike"] },
      { title: "Pregnancy strength", minutes: 25, exercises: ["Supported squat", "Band row", "Wall push-up", "Calf raise"] },
      { title: "Easy walk + mobility", minutes: 20, exercises: ["Comfortable walk", "Gentle mobility"] },
      { title: "Rest", minutes: 0, exercises: [] },
    ];
    return {
      title: `Pregnancy-safe movement · Trimester ${status.trimester}`,
      intensity: "Moderate and conversational; reduce intensity as needed.",
      days: common,
      notes: [
        "Walking, swimming, stationary cycling, modified yoga/Pilates and strength work are common pregnancy-safe options for uncomplicated pregnancies.",
        "Avoid contact/fall-risk activities, scuba diving, overheating, and prolonged flat-on-back exercise as pregnancy progresses.",
      ],
    };
  }

  const hardDay = status.painLevel >= 7 || status.energyLevel === "low";
  return {
    title: status.inWindow ? "Period-supportive movement" : "Cycle-aware movement",
    intensity: hardDay ? "Low intensity today; rest is a valid choice." : status.inWindow ? "Moderate or gentle — follow your energy." : "Normal training is reasonable if you feel well.",
    days: status.inWindow ? [
      { title: "Gentle walk + mobility", minutes: 20, exercises: ["Easy walk", "Cat-cow", "Hip mobility"] },
      { title: "Light strength", minutes: 25, exercises: ["Bodyweight squat", "Band row", "Wall push-up", "Calf raise"] },
      { title: "Recovery yoga", minutes: 20, exercises: ["Gentle yoga", "Breathing", "Relaxation"] },
      { title: "Easy cardio", minutes: 20, exercises: ["Walking, swimming or cycling"] },
      { title: "Rest / gentle mobility", minutes: hardDay ? 10 : 15, exercises: ["Breathing", "Gentle stretching"] },
      { title: "Light full body", minutes: 25, exercises: ["Squat", "Row", "Glute bridge", "Bird dog"] },
      { title: "Rest", minutes: 0, exercises: [] },
    ] : null,
    notes: [
      "Regular exercise can help some people with period pain and PMS symptoms.",
      "Heat, sleep, hydration, and gentle movement can be useful comfort measures.",
      "Severe pain, unusually heavy bleeding, fainting, or symptoms that disrupt normal life should be discussed with a clinician.",
    ],
  };
}
