import { read, write } from "./storage";
import { getCurrentUser } from "./authService";

function planKey(userId) {
  return `plan.${userId}`;
}

function progressKey(userId) {
  return `workoutProgress.${userId}`;
}

const TEMPLATES = {
  "weight-loss": [
    { title: "Walk + Core", minutes: 30, focus: "Cardio" },
    { title: "Full Body Strength", minutes: 35, focus: "Strength" },
    { title: "Mobility + Stretch", minutes: 25, focus: "Recovery" },
    { title: "Walk + Intervals", minutes: 32, focus: "Cardio" },
    { title: "Lower Body", minutes: 34, focus: "Strength" },
    { title: "Yoga Flow", minutes: 28, focus: "Recovery" },
    { title: "Rest", minutes: 0, focus: "Rest" },
  ],
  "muscle-gain": [
    { title: "Upper Body", minutes: 40, focus: "Strength" },
    { title: "Lower Body", minutes: 40, focus: "Strength" },
    { title: "Walk + Mobility", minutes: 30, focus: "Recovery" },
    { title: "Push Day", minutes: 38, focus: "Strength" },
    { title: "Pull Day", minutes: 38, focus: "Strength" },
    { title: "Core + Stretch", minutes: 25, focus: "Recovery" },
    { title: "Rest", minutes: 0, focus: "Rest" },
  ],
  "general-fitness": [
    { title: "Upper Body", minutes: 32, focus: "Strength" },
    { title: "Walk + Mobility", minutes: 30, focus: "Cardio" },
    { title: "Rest", minutes: 0, focus: "Rest" },
    { title: "Lower Body", minutes: 34, focus: "Strength" },
    { title: "Yoga + Breath", minutes: 28, focus: "Recovery" },
    { title: "Full Body", minutes: 35, focus: "Strength" },
    { title: "Easy Walk", minutes: 25, focus: "Cardio" },
  ],
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EXERCISES = {
  "Upper Body": [
    { name: "Push ups", sets: 3, reps: "12", rest: "60s" },
    { name: "Dumbbell row", sets: 3, reps: "10", rest: "60s" },
    { name: "Shoulder press", sets: 3, reps: "10", rest: "75s" },
    { name: "Plank", sets: 3, reps: "30 sec", rest: "45s" },
  ],
  "Push Day": [
    { name: "Push ups", sets: 3, reps: "10", rest: "60s" },
    { name: "Shoulder press", sets: 3, reps: "10", rest: "75s" },
    { name: "Tricep extension", sets: 3, reps: "12", rest: "60s" },
  ],
  "Pull Day": [
    { name: "Dumbbell row", sets: 3, reps: "10", rest: "60s" },
    { name: "Lat pulldown (band)", sets: 3, reps: "12", rest: "60s" },
    { name: "Bicep curls", sets: 3, reps: "12", rest: "45s" },
  ],
  "Lower Body": [
    { name: "Bodyweight squat", sets: 3, reps: "12", rest: "60s" },
    { name: "Glute bridge", sets: 3, reps: "12", rest: "45s" },
    { name: "Reverse lunge", sets: 3, reps: "8/side", rest: "75s" },
    { name: "Calf raise", sets: 3, reps: "15", rest: "30s" },
  ],
  "Full Body Strength": [
    { name: "Squat to press", sets: 3, reps: "10", rest: "75s" },
    { name: "Row", sets: 3, reps: "10", rest: "60s" },
    { name: "Glute bridge", sets: 3, reps: "12", rest: "45s" },
  ],
  "Full Body": [
    { name: "Squat", sets: 3, reps: "12", rest: "60s" },
    { name: "Push ups", sets: 3, reps: "10", rest: "60s" },
    { name: "Bird dog", sets: 3, reps: "8/side", rest: "30s" },
  ],
  "Walk + Core": [
    { name: "Brisk walk", sets: 1, reps: "20 min", rest: "—" },
    { name: "Dead bug", sets: 3, reps: "8/side", rest: "30s" },
    { name: "Side plank", sets: 2, reps: "20 sec", rest: "30s" },
  ],
  "Walk + Intervals": [
    { name: "Easy walk", sets: 1, reps: "8 min", rest: "—" },
    { name: "Brisk intervals", sets: 6, reps: "1 min", rest: "1 min" },
    { name: "Cool down walk", sets: 1, reps: "6 min", rest: "—" },
  ],
  "Walk + Mobility": [
    { name: "Easy walk", sets: 1, reps: "18 min", rest: "—" },
    { name: "Hip openers", sets: 2, reps: "45 sec", rest: "20s" },
    { name: "Shoulder circles", sets: 2, reps: "10", rest: "15s" },
  ],
  "Easy Walk": [
    { name: "Comfortable walk", sets: 1, reps: "25 min", rest: "—" },
  ],
  "Mobility + Stretch": [
    { name: "Cat-cow", sets: 2, reps: "8", rest: "20s" },
    { name: "World’s greatest stretch", sets: 2, reps: "4/side", rest: "20s" },
    { name: "Hamstring stretch", sets: 2, reps: "30 sec", rest: "15s" },
  ],
  "Yoga Flow": [
    { name: "Sun salutations", sets: 3, reps: "4", rest: "30s" },
    { name: "Warrior holds", sets: 2, reps: "30 sec", rest: "20s" },
    { name: "Seated fold", sets: 1, reps: "45 sec", rest: "—" },
  ],
  "Yoga + Breath": [
    { name: "Box breathing", sets: 4, reps: "4 counts", rest: "—" },
    { name: "Gentle flow", sets: 1, reps: "15 min", rest: "—" },
    { name: "Savasana", sets: 1, reps: "3 min", rest: "—" },
  ],
  "Core + Stretch": [
    { name: "Dead bug", sets: 3, reps: "8/side", rest: "30s" },
    { name: "Glute stretch", sets: 2, reps: "30 sec", rest: "15s" },
  ],
  Rest: [],
};


const WOMEN_EXERCISES = {
  "Pregnancy Walk + Pelvic Floor": [
    { name: "Brisk or comfortable walk", sets: 1, reps: "20 min", rest: "—" },
    { name: "Pelvic floor squeezes", sets: 3, reps: "8", rest: "30s" },
  ],
  "Pregnancy Strength": [
    { name: "Supported squat", sets: 2, reps: "10", rest: "60s" },
    { name: "Resistance-band row", sets: 2, reps: "10", rest: "60s" },
    { name: "Wall push-up", sets: 2, reps: "10", rest: "60s" },
    { name: "Bird dog", sets: 2, reps: "6/side", rest: "30s" },
  ],
  "Pregnancy Mobility": [
    { name: "Cat-cow", sets: 2, reps: "8", rest: "20s" },
    { name: "Gentle hip mobility", sets: 2, reps: "45 sec", rest: "20s" },
    { name: "Shoulder circles", sets: 2, reps: "10", rest: "15s" },
    { name: "Slow breathing", sets: 3, reps: "5 breaths", rest: "—" },
  ],
  "Pregnancy Cardio": [
    { name: "Swimming or stationary bike", sets: 1, reps: "20 min", rest: "—" },
  ],
  "Easy Walk + Mobility": [
    { name: "Comfortable walk", sets: 1, reps: "15 min", rest: "—" },
    { name: "Gentle mobility", sets: 2, reps: "45 sec", rest: "20s" },
  ],
  "Easy walk": [
    { name: "Easy walk", sets: 1, reps: "10 min", rest: "—" },
  ],
  "Gentle mobility": [
    { name: "Shoulder circles", sets: 2, reps: "10", rest: "15s" },
    { name: "Gentle mobility", sets: 2, reps: "30 sec", rest: "20s" },
  ],
  "Period Gentle": [
    { name: "Easy walk", sets: 1, reps: "15 min", rest: "—" },
    { name: "Cat-cow", sets: 2, reps: "8", rest: "20s" },
    { name: "Hip mobility", sets: 2, reps: "45 sec", rest: "20s" },
  ],
  "Period Light Strength": [
    { name: "Bodyweight squat", sets: 2, reps: "10", rest: "60s" },
    { name: "Band row", sets: 2, reps: "10", rest: "60s" },
    { name: "Wall push-up", sets: 2, reps: "10", rest: "60s" },
    { name: "Calf raise", sets: 2, reps: "12", rest: "30s" },
  ],
  "Period Recovery": [
    { name: "Gentle yoga", sets: 1, reps: "15 min", rest: "—" },
    { name: "Breathing", sets: 3, reps: "5 breaths", rest: "—" },
  ],
  "Period Cardio": [
    { name: "Walking, swimming or cycling", sets: 1, reps: "20 min", rest: "—" },
  ],
  "Rest / Mobility": [
    { name: "Breathing", sets: 3, reps: "5 breaths", rest: "—" },
    { name: "Gentle stretching", sets: 2, reps: "30 sec", rest: "15s" },
  ],
  "Period Full Body": [
    { name: "Bodyweight squat", sets: 2, reps: "10", rest: "60s" },
    { name: "Band row", sets: 2, reps: "10", rest: "60s" },
    { name: "Glute bridge", sets: 2, reps: "10", rest: "45s" },
    { name: "Bird dog", sets: 2, reps: "6/side", rest: "30s" },
  ],
};

const PREGNANCY_TEMPLATES = [
  { title: "Pregnancy Walk + Pelvic Floor", minutes: 25, focus: "Pregnancy" },
  { title: "Pregnancy Strength", minutes: 25, focus: "Pregnancy" },
  { title: "Pregnancy Mobility", minutes: 20, focus: "Recovery" },
  { title: "Pregnancy Cardio", minutes: 25, focus: "Pregnancy" },
  { title: "Pregnancy Strength", minutes: 25, focus: "Pregnancy" },
  { title: "Easy Walk + Mobility", minutes: 20, focus: "Recovery" },
  { title: "Rest", minutes: 0, focus: "Rest" },
];

const RESTRICTED_PREGNANCY_TEMPLATES = [
  { title: "Rest + breathing", minutes: 10, focus: "Rest", note: "Exercise only if your clinician has cleared it." },
  { title: "Easy walk", minutes: 10, focus: "Rest", note: "Only if cleared by your clinician." },
  { title: "Rest", minutes: 0, focus: "Rest" },
  { title: "Gentle mobility", minutes: 10, focus: "Rest", note: "Only if cleared and comfortable." },
  { title: "Rest", minutes: 0, focus: "Rest" },
  { title: "Easy walk", minutes: 10, focus: "Rest", note: "Only if cleared by your clinician." },
  { title: "Rest", minutes: 0, focus: "Rest" },
];

const PERIOD_TEMPLATES = [
  { title: "Period Gentle", minutes: 20, focus: "Recovery" },
  { title: "Period Light Strength", minutes: 25, focus: "Strength" },
  { title: "Period Recovery", minutes: 20, focus: "Recovery" },
  { title: "Period Cardio", minutes: 20, focus: "Cardio" },
  { title: "Rest / Mobility", minutes: 15, focus: "Recovery" },
  { title: "Period Full Body", minutes: 25, focus: "Strength" },
  { title: "Rest", minutes: 0, focus: "Rest" },
];

function womenAwareTemplates(profile = {}) {
  if (profile.reproductiveStatus === "pregnant" || profile.reproductiveStatus === "possibly_pregnant") {
    if (profile.pregnancyExerciseRestricted || profile.reproductiveStatus === "possibly_pregnant") return RESTRICTED_PREGNANCY_TEMPLATES;
    return PREGNANCY_TEMPLATES;
  }
  if (profile.gender === "female" && profile.manualPeriodActive === true) return PERIOD_TEMPLATES;
  return null;
}

function rotate(list, weekIndex) {
  return list.map((_, index) => list[(index + weekIndex) % list.length]);
}

function cycleAwareAdjust(day, inPeriodWindow) {
  if (!inPeriodWindow) return day;
  if (day.focus === "Strength" && day.minutes > 0) {
    return {
      ...day,
      title: `${day.title} (gentle)`,
      minutes: Math.max(20, day.minutes - 8),
      note: "Optional lighter version while you may be in your period window.",
    };
  }
  return day;
}

export function generateWorkoutPlan({ goal = "general-fitness", weeks = 4, inPeriodWindow = false, profile = null } = {}) {
  const womenSource = womenAwareTemplates(profile || {});
  const source = womenSource || TEMPLATES[goal] || TEMPLATES["general-fitness"];
  const safeWeeks = Math.min(52, Math.max(1, Number.parseInt(weeks, 10) || 4));
  const plan = {
    generatedAt: new Date().toISOString(),
    source: "frontend-template",
    weeks: Array.from({ length: safeWeeks }, (_, weekIndex) => {
      const rotated = rotate(source, weekIndex);
      return {
        week: weekIndex + 1,
        days: DAYS.map((name, dayIndex) => {
          const base = rotated[dayIndex];
          const adjusted = womenSource ? base : cycleAwareAdjust(base, inPeriodWindow && weekIndex === 0);
          return {
            id: `w${weekIndex + 1}-d${dayIndex}`,
            day: name,
            ...adjusted,
            exercises: (womenSource ? (WOMEN_EXERCISES[base.title] || []) : (EXERCISES[base.title] || [])).map((exercise, idx) => ({
              id: `w${weekIndex + 1}-d${dayIndex}-e${idx}`,
              ...exercise,
            })),
          };
        }),
      };
    }),
  };

  const user = getCurrentUser();
  if (user) write(planKey(user.id), plan);
  return plan;
}

export function getWorkoutPlan() {
  const user = getCurrentUser();
  if (!user) return null;
  return read(planKey(user.id), null);
}

export function getTodayWorkout(plan) {
  if (!plan) return null;
  const weekday = (new Date().getDay() + 6) % 7;
  return plan.weeks[0]?.days[weekday] || plan.weeks[0]?.days[0];
}

export function getProgress() {
  const user = getCurrentUser();
  if (!user) return { workouts: {}, exercises: {} };
  return read(progressKey(user.id), { workouts: {}, exercises: {} });
}

export function toggleWorkoutComplete(workoutId) {
  if (!workoutId) return getProgress();
  const progress = getProgress();
  progress.workouts[workoutId] = !progress.workouts[workoutId];
  const user = getCurrentUser();
  write(progressKey(user.id), progress);
  return progress;
}

export function toggleExerciseComplete(exerciseId) {
  if (!exerciseId) return getProgress();
  const progress = getProgress();
  progress.exercises[exerciseId] = !progress.exercises[exerciseId];
  const user = getCurrentUser();
  write(progressKey(user.id), progress);
  return progress;
}

export function workoutCompletionPercent(workout, progress) {
  if (!workout || workout.focus === "Rest" || !workout.exercises?.length) {
    return progress.workouts[workout?.id] ? 100 : 0;
  }
  const done = workout.exercises.filter((item) => progress.exercises[item.id]).length;
  return Math.round((done / workout.exercises.length) * 100);
}
