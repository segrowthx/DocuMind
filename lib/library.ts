/**
 * The binder's index tabs: one per document the assistant has read.
 * Titles come from the database; the short label and starter question are
 * derived here so new uploads get sensible tabs too.
 */
export interface BinderTab {
  title: string;
  label: string;
  question: string;
}

const KNOWN: { match: RegExp; label: string; question: string }[] = [
  { match: /catalog/i, label: "Course Catalog", question: "Which data analytics courses do you run?" },
  { match: /pric/i, label: "Pricing", question: "How much is the PMP Exam Prep Bootcamp?" },
  { match: /schedule/i, label: "Schedule", question: "When does Python for Data Analysis start in Austin?" },
  { match: /enrol/i, label: "How to Enroll", question: "How late can I enroll before a course starts?" },
  { match: /instructor/i, label: "Instructors", question: "Who teaches SQL Fundamentals?" },
  { match: /refund|cancel/i, label: "Refunds", question: "What happens if I cancel 10 days before my course?" },
  { match: /^faq$|question/i, label: "FAQ", question: "Are online classes recorded?" },
  { match: /corporate|group/i, label: "Teams", question: "How much does private team training cost?" },
];

export function toTab(title: string): BinderTab {
  const known = KNOWN.find((k) => k.match.test(title));
  if (known) return { title, label: known.label, question: known.question };
  const label = title.replace(/\b(19|20)\d{2}\b/g, "").replace(/\s+/g, " ").trim();
  return { title, label: label.length > 18 ? `${label.slice(0, 17)}…` : label, question: `What does "${title}" cover?` };
}

/** Used when the database can't be reached (e.g. at build time). */
export const DEMO_TITLES = [
  "Course Catalog 2027",
  "Pricing Sheet 2027",
  "Course Schedule Jan-Jun 2027",
  "How to Enroll",
  "Instructor Bios",
  "Refund, Cancellation and Transfer Policy",
  "FAQ",
  "Corporate and Group Training",
];

const ORDER = ["catalog", "pric", "schedule", "enrol", "instructor", "refund", "faq", "corporate"];

export function sortTitles(titles: string[]): string[] {
  const rank = (t: string) => {
    const i = ORDER.findIndex((k) => t.toLowerCase().includes(k));
    return i === -1 ? ORDER.length : i;
  };
  return [...titles].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
