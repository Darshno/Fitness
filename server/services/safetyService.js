const CRISIS_PATTERNS = [
  /i\s+want\s+to\s+hurt\s+myself/i,
  /i\s+don['’]?t\s+want\s+to\s+live/i,
  /i\s+want\s+to\s+kill\s+myself/i,
  /kill\s+myself/i,
  /suicide/i,
  /end\s+my\s+life/i,
  /hurt\s+myself/i,
  /self[-\s]?harm/i,
  /want\s+to\s+die/i,
];

export function detectCrisis(text) {
  return { crisis: CRISIS_PATTERNS.some((pattern) => pattern.test(String(text || ""))) };
}

export function crisisSupportMessage() {
  return {
    title: "Please reach out for support",
    body: "If you may be in immediate danger or thinking about harming yourself, FitBuddy cannot provide crisis care. Please contact local emergency services or a crisis service in your area and, if possible, stay with someone you trust.",
    resources: [
      { label: "International Association for Suicide Prevention", href: "https://www.iasp.info/suicidalthoughts/" },
    ],
  };
}
