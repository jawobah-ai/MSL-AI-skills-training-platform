import { INBOX, SEEDED_DRAFT, SNIPPETS } from "@/lib/content/drills";
import type { DataClass, RedFlagCategory, ToolTier } from "@/lib/types";

export { RUBRIC_PASS_TOTAL } from "@/lib/rubric";

// Thresholds are the spec's proposals; calibrate them in the pilot.
export const THRESHOLDS = {
  gate2MinorShare: 2 / 3, // share of minor seeded issues that must be caught
  gate3Accuracy: 0.8, // share of class + tier points needed
} as const;

export type DrillResult = { passed: boolean; score: number; maxScore: number; feedback: string[] };

// ---- Gate 2: red-flag drill ---------------------------------------------

export type Gate2Answers = Record<string, RedFlagCategory | null>;

export function scoreGate2(answers: Gate2Answers): DrillResult {
  const feedback: string[] = [];
  const issues = SEEDED_DRAFT.filter((s) => s.issue);
  const critical = issues.filter((s) => s.issue!.critical);
  const minor = issues.filter((s) => !s.issue!.critical);

  const missedCritical = critical.filter((s) => !answers[s.id]);
  const caughtMinor = minor.filter((s) => answers[s.id]);
  const falsePositives = SEEDED_DRAFT.filter((s) => !s.issue && answers[s.id]);

  for (const s of issues) {
    const picked = answers[s.id];
    if (!picked) feedback.push(`Missed${s.issue!.critical ? " (critical)" : ""}: "${s.text}" — ${s.issue!.explanation}`);
    else if (picked !== s.issue!.category)
      feedback.push(`Caught, but the main issue is ${s.issue!.category}, not ${picked}: "${s.text}"`);
  }
  for (const s of falsePositives) feedback.push(`No issue planted here: "${s.text}"`);

  const minorNeeded = Math.ceil(minor.length * THRESHOLDS.gate2MinorShare);
  const passed = missedCritical.length === 0 && caughtMinor.length >= minorNeeded;
  if (missedCritical.length > 0) feedback.unshift("Fail: every critical issue must be caught.");
  else if (!passed) feedback.unshift(`Fail: catch at least ${minorNeeded} of ${minor.length} minor issues.`);

  return {
    passed,
    score: critical.length - missedCritical.length + caughtMinor.length,
    maxScore: issues.length,
    feedback,
  };
}

// ---- Gate 3: sorting drill ----------------------------------------------

export type Gate3Answers = Record<string, { cls: DataClass | null; tier: ToolTier | null }>;

export function scoreGate3(answers: Gate3Answers): DrillResult {
  const feedback: string[] = [];
  let score = 0;
  let criticalBreach = false;

  for (const s of SNIPPETS) {
    const a = answers[s.id] ?? { cls: null, tier: null };
    if (a.cls === s.correctClass) score += 1;
    else feedback.push(`Class for "${s.text}" is ${s.correctClass}. ${s.explanation}`);
    if (a.tier && s.allowedTiers.includes(a.tier)) score += 1;
    else feedback.push(`Tool for "${s.text}": allowed tiers are ${s.allowedTiers.join(", ")}.`);
    if (s.correctClass === "restricted" && a.tier === "public-ai") criticalBreach = true;
  }

  const maxScore = SNIPPETS.length * 2;
  const accurate = score / maxScore >= THRESHOLDS.gate3Accuracy;
  if (criticalBreach) feedback.unshift("Fail: restricted data was sent to a public AI tool.");
  else if (!accurate) feedback.unshift(`Fail: ${score} of ${maxScore}; at least ${Math.ceil(maxScore * THRESHOLDS.gate3Accuracy)} needed.`);

  return { passed: !criticalBreach && accurate, score, maxScore, feedback };
}

// ---- Gate 4: inbox drill ------------------------------------------------

export function scoreGate4(flagged: string[]): DrillResult {
  const set = new Set(flagged);
  const planted = INBOX.filter((m) => m.plantedEvent);
  const missed = planted.filter((m) => !set.has(m.id));
  const extra = INBOX.filter((m) => !m.plantedEvent && set.has(m.id));

  const feedback = missed.map((m) => `Missed: "${m.subject}" — ${m.plantedEvent!.explanation}`);
  if (extra.length) feedback.push(`${extra.length} extra item(s) flagged. That is safe: when unsure, hand it on.`);
  if (missed.length) feedback.unshift("Fail: every planted event must be handed to PV.");

  return { passed: missed.length === 0, score: planted.length - missed.length, maxScore: planted.length, feedback };
}

export { RUBRIC, evaluateRubric } from "@/lib/rubric";
