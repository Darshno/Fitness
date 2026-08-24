/**
 * Conservative wellbeing-oriented goal check.
 * This is not medical advice and does not diagnose health conditions.
 */
export function assessGoal(profile) {
  const {
    weightKg,
    targetWeightKg,
    timelineWeeks,
    goal,
  } = profile;

  const weeks = Number(timelineWeeks) || 12;
  const current = Number(weightKg);
  const target = Number(targetWeightKg);

  if (goal === "general-fitness" || !target || Number.isNaN(target)) {
    return {
      feasible: true,
      message:
        "A general fitness focus is a steady, sustainable place to start. FitBuddy will keep the plan moderate and flexible.",
      adjustedGoal: "Build consistent movement and energy over the next 8–12 weeks.",
      adjustedTimeline: `${Math.max(weeks, 8)} weeks`,
    };
  }

  const delta = Math.abs(current - target);
  const weeklyChange = delta / weeks;

  if (goal === "weight-loss") {
    if (target >= current) {
      return {
        feasible: false,
        message:
          "The target weight is not lower than your current weight. A gentler fitness-first plan may be a better fit for now.",
        adjustedGoal: "Focus on consistent activity and wellbeing rather than a specific weight target.",
        adjustedTimeline: "12 weeks",
      };
    }

    const tooAggressive = weeklyChange > 0.6 || (current > 0 && delta / current > 0.12 && weeks < 12);

    if (tooAggressive) {
      const saferWeekly = 0.4;
      const saferWeeks = Math.max(12, Math.ceil(delta / saferWeekly));
      return {
        feasible: false,
        message:
          "Your goal may be too aggressive for this timeline. A slower pace is usually more comfortable and easier to sustain.",
        adjustedGoal: `Aim for a more gradual change toward ${target} kg, with room to pause if energy feels low.`,
        adjustedTimeline: `${saferWeeks} weeks`,
      };
    }

    return {
      feasible: true,
      message:
        "Your goal looks achievable at a conservative pace. The plan will stay moderate and can be adjusted as you go.",
      adjustedGoal: `Work toward ${target} kg with consistent movement and recovery.`,
      adjustedTimeline: `${weeks} weeks`,
    };
  }

  if (goal === "muscle-gain") {
    if (target <= current) {
      return {
        feasible: true,
        message:
          "Muscle-focused training can still progress without a higher target weight. Strength and consistency will be the main markers.",
        adjustedGoal: "Build strength with progressive training and enough rest.",
        adjustedTimeline: `${Math.max(weeks, 12)} weeks`,
      };
    }

    if (weeklyChange > 0.25) {
      const saferWeeks = Math.max(16, Math.ceil(delta / 0.15));
      return {
        feasible: false,
        message:
          "The requested change may be quicker than a conservative training timeline. A longer window usually feels more sustainable.",
        adjustedGoal: `Build strength gradually, with ${target} kg as a long-range marker rather than a rush.`,
        adjustedTimeline: `${saferWeeks} weeks`,
      };
    }

    return {
      feasible: true,
      message:
        "Your goal looks achievable. Strength work will stay progressive, with rest days protected.",
      adjustedGoal: `Build strength toward ${target} kg over a patient timeline.`,
      adjustedTimeline: `${weeks} weeks`,
    };
  }

  return {
    feasible: true,
    message: "Your goal looks achievable with a balanced, moderate plan.",
    adjustedGoal: "Stay consistent with movement, rest, and check-ins.",
    adjustedTimeline: `${weeks} weeks`,
  };
}
