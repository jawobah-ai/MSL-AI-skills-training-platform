import { describe, expect, it } from "vitest";
import { GATES } from "@/lib/content/gates";
import { assessmentGate, gateStates, type Records } from "@/lib/progress";
import type { GateId, Submission } from "@/lib/types";

const empty = (): Records => ({ progress: [], attempts: [], submissions: [] });
const now = "2026-10-27T00:00:00.000Z";

const finishUnits = (r: Records, gateId: GateId) => {
  for (const u of GATES.find((g) => g.id === gateId)!.units)
    r.progress.push({ userId: "u", gateId, unitId: u.id, completedAt: now });
};
const submit = (r: Records, gateId: GateId, attempt: number, status: Submission["status"]) =>
  r.submissions.push({ id: `${gateId}-${attempt}`, userId: "u", gateId, attempt, fields: {}, status, createdAt: now });
const pass = (r: Records, gateId: GateId) =>
  r.attempts.push({ id: gateId, userId: "u", gateId, answers: {}, passed: true, score: 1, maxScore: 1, feedback: [], createdAt: now });

const state = (r: Records, id: GateId) => gateStates(r).find((s) => s.gate.id === id)!;

describe("gate unlocking", () => {
  it("starts with only gate 1 open", () => {
    const s = gateStates(empty());
    expect(s.map((x) => x.unlocked)).toEqual([true, false, false, false]);
  });

  it("opens gates 2 and 3 once gate 1 units are done and its build is submitted", () => {
    const r = empty();
    finishUnits(r, "g1");
    expect(state(r, "g2").unlocked).toBe(false);
    submit(r, "g1", 1, "pending");
    expect(state(r, "g2").unlocked).toBe(true);
    expect(state(r, "g3").unlocked).toBe(true);
    expect(state(r, "g4").unlocked).toBe(false);
  });

  it("opens gate 4 only after gates 1 and 3", () => {
    const r = empty();
    finishUnits(r, "g1");
    submit(r, "g1", 1, "pending");
    finishUnits(r, "g3");
    submit(r, "g3", 1, "pending");
    expect(state(r, "g4").unlocked).toBe(true);
  });
});

describe("gate passing and resubmission", () => {
  it("needs units, a passed drill and a passed build", () => {
    const r = empty();
    finishUnits(r, "g2");
    submit(r, "g2", 1, "passed");
    expect(state(r, "g2").passed).toBe(false);
    pass(r, "g2");
    expect(state(r, "g2").passed).toBe(true);
  });

  it("gate 1 passes on units and build alone (its drill is a reference set)", () => {
    const r = empty();
    finishUnits(r, "g1");
    submit(r, "g1", 1, "passed");
    expect(state(r, "g1").passed).toBe(true);
  });

  it("allows exactly one resubmission", () => {
    const r = empty();
    expect(state(r, "g1").nextAttempt).toBe(1);
    submit(r, "g1", 1, "pending");
    expect(state(r, "g1").nextAttempt).toBeNull();
    r.submissions[0].status = "failed";
    expect(state(r, "g1").nextAttempt).toBe(2);
    submit(r, "g1", 2, "failed");
    expect(state(r, "g1").build).toBe("failed-final");
    expect(state(r, "g1").nextAttempt).toBeNull();
  });

  it("gate 5 is met only when all four builds pass", () => {
    const r = empty();
    for (const g of GATES) submit(r, g.id, 1, "passed");
    expect(assessmentGate(gateStates(r)).met).toBe(true);
    r.submissions[2].status = "failed";
    expect(assessmentGate(gateStates(r))).toMatchObject({ passed: 3, met: false });
  });
});
