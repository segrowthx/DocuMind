/**
 * Lightweight buying-intent detector. When a visitor asks about pricing,
 * enrollment, booking or group training, the chat shows a short lead form.
 */
const PATTERNS: { topic: string; re: RegExp }[] = [
  { topic: "pricing", re: /\b(price|prices|pricing|cost|costs|how much|fee|fees|discount|payment plan|instal+ments?|quote)\b/i },
  { topic: "enrollment", re: /\b(enrol+|enrol+ment|sign(ing)? up|register|registration|reserve a (seat|spot|place))\b/i },
  { topic: "booking", re: /\b(book|booking|reserve|schedule a call|advis(or|er)|consultation|demo)\b/i },
  { topic: "corporate", re: /\b(my team|our team|group|corporate|company training|private (course|training)|employees|staff)\b/i },
];

export interface Intent {
  hasIntent: boolean;
  topic: string | null;
}

export function detectIntent(message: string): Intent {
  for (const { topic, re } of PATTERNS) {
    if (re.test(message)) return { hasIntent: true, topic };
  }
  return { hasIntent: false, topic: null };
}
