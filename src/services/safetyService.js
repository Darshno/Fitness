const CRISIS_PATTERNS = [
  /i\s+want\s+to\s+hurt\s+myself/i,
  /i\s+don't\s+want\s+to\s+live/i,
  /i\s+do\s+not\s+want\s+to\s+live/i,
  /i\s+want\s+to\s+kill\s+myself/i,
  /kill\s+myself/i,
  /suicide/i,
  /end\s+my\s+life/i,
  /hurt\s+myself/i,
];

export function detectCrisis(text) {
  const value = String(text || "").trim();
  if (!value) return { crisis: false };
  const crisis = CRISIS_PATTERNS.some((pattern) => pattern.test(value));
  return { crisis };
}

export function crisisSupportMessage() {
  return {
    title: "Please reach out for support",
    body:
      "If you are in crisis or thinking about harming yourself, FitBuddy is not the right place for this conversation. Please contact local emergency services or a crisis helpline in your area. You deserve real-time support from people trained to help.",
    resources: [
      { label: "International Association for Suicide Prevention", href: "https://www.iasp.info/suicidalthoughts/" },
    ],
  };
}
