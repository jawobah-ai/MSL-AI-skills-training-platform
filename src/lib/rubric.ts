import type { Grade, RubricDimension, RubricScores } from "@/lib/types";

// Kept apart from scoring.ts so the grader's browser bundle never includes drill answer keys.

export const RUBRIC_PASS_TOTAL = 14; // out of 21; the spec's proposal, to calibrate in the pilot

// ---- Gate 5: the rubric -------------------------------------------------

export const RUBRIC: { id: RubricDimension; label: string; levels: [string, string, string, string] }[] = [
  { id: "taskFit", label: "Task fit", levels: ["Not an MSL task", "Generic task", "Named MSL task", "Named task with baseline time"] },
  { id: "accuracy", label: "Accuracy and citations", levels: ["Unchecked claims", "Some citations", "All claims cited", "Citations checked against sources"] },
  { id: "nonPromotional", label: "Non-promotional (Gate 2)", levels: ["Promotional or off-label", "Tone issues", "Balanced", "Guardrail block built in"] },
  { id: "dataHandling", label: "Data handling (Gate 3)", levels: ["Restricted data in wrong tool", "Class not stated", "Correct class and tool", "Minimised and documented"] },
  { id: "safetyRouting", label: "Safety routing (Gate 4)", levels: ["No AE check", "Mentioned only", "Flag-and-pause step present", "Tested on a planted event"] },
  { id: "humanReview", label: "Human review step", levels: ["None", "Implied", "Named reviewer step", "Review checklist attached"] },
  { id: "reusable", label: "Reusable and documented", levels: ["One-off", "Partly reusable", "Reusable prompt or build", "Versioned with instructions"] },
];

export function evaluateRubric(
  scores: RubricScores,
  critical: Grade["criticalFailures"],
): { total: number; passed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const total = RUBRIC.reduce((sum, d) => sum + scores[d.id], 0);

  if (critical.restrictedDataToPublicTool) reasons.push("Critical failure: restricted data sent to a public tool.");
  if (critical.missedPlantedEvent) reasons.push("Critical failure: a planted adverse event was missed.");
  if (total < RUBRIC_PASS_TOTAL) reasons.push(`Total ${total} of 21 is below ${RUBRIC_PASS_TOTAL}.`);
  for (const d of RUBRIC) if (scores[d.id] === 0) reasons.push(`${d.label} scored 0.`);
  if (scores.dataHandling < 2) reasons.push("Data handling must be 2 or more.");
  if (scores.safetyRouting < 2) reasons.push("Safety routing must be 2 or more.");

  return { total, passed: reasons.length === 0, reasons };
}
