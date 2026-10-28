import { GATES } from "@/lib/content/gates";
import type { DrillAttempt, Gate, GateId, Submission, UnitProgress } from "@/lib/types";

export type DrillStatus = "reference" | "not-started" | "failed" | "passed";
export type BuildStatus = "not-submitted" | "pending" | "failed-can-resubmit" | "failed-final" | "passed";

export type GateState = {
  gate: Gate;
  unitsDone: number;
  unitsTotal: number;
  drill: DrillStatus;
  build: BuildStatus;
  latestSubmission: Submission | null;
  nextAttempt: 1 | 2 | null; // null = no submission allowed now
  unlocked: boolean;
  passed: boolean;
};

export type Records = { progress: UnitProgress[]; attempts: DrillAttempt[]; submissions: Submission[] };

// Gate 1's set is a reference set for the learner's own prompt; it is assessed through the build.
const hasScoredDrill = (id: GateId) => id !== "g1";

function buildStatus(latest: Submission | null): BuildStatus {
  if (!latest) return "not-submitted";
  if (latest.status === "pending") return "pending";
  if (latest.status === "passed") return "passed";
  return latest.attempt === 1 ? "failed-can-resubmit" : "failed-final";
}

function baseState(gate: Gate, r: Records): Omit<GateState, "unlocked"> {
  const unitsDone = gate.units.filter((u) => r.progress.some((p) => p.gateId === gate.id && p.unitId === u.id)).length;
  const attempts = r.attempts.filter((a) => a.gateId === gate.id);
  const drill: DrillStatus = !hasScoredDrill(gate.id)
    ? "reference"
    : attempts.some((a) => a.passed)
      ? "passed"
      : attempts.length
        ? "failed"
        : "not-started";
  const subs = r.submissions.filter((s) => s.gateId === gate.id).sort((a, b) => b.attempt - a.attempt);
  const latest = subs[0] ?? null;
  const build = buildStatus(latest);
  const nextAttempt = build === "not-submitted" ? 1 : build === "failed-can-resubmit" ? 2 : null;
  const passed = unitsDone === gate.units.length && (drill === "reference" || drill === "passed") && build === "passed";
  return { gate, unitsDone, unitsTotal: gate.units.length, drill, build, latestSubmission: latest, nextAttempt, passed };
}

// A gate unlocks once each prerequisite has its units done and a build submitted.
// Learners do not wait for grading to move on; the certificate still needs every gate passed.
export function gateStates(r: Records): GateState[] {
  const base = new Map(GATES.map((g) => [g.id, baseState(g, r)]));
  const ready = (id: GateId) => {
    const s = base.get(id)!;
    return s.unitsDone === s.unitsTotal && s.build !== "not-submitted";
  };
  return GATES.map((g) => ({ ...base.get(g.id)!, unlocked: g.prerequisites.every(ready) }));
}

// Gate 5 is met when every build has been graded a pass.
export function assessmentGate(states: GateState[]) {
  const passed = states.filter((s) => s.build === "passed").length;
  return { passed, total: states.length, met: passed === states.length };
}
