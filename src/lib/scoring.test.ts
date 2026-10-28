import { describe, expect, it } from "vitest";
import { INBOX, SEEDED_DRAFT, SNIPPETS } from "@/lib/content/drills";
import { evaluateRubric, scoreGate2, scoreGate3, scoreGate4, type Gate2Answers, type Gate3Answers } from "@/lib/scoring";
import type { RubricScores } from "@/lib/types";

const perfectGate2 = (): Gate2Answers =>
  Object.fromEntries(SEEDED_DRAFT.map((s) => [s.id, s.issue?.category ?? null]));

const perfectGate3 = (): Gate3Answers =>
  Object.fromEntries(SNIPPETS.map((s) => [s.id, { cls: s.correctClass, tier: s.allowedTiers[0] }]));

const all = (n: 0 | 1 | 2 | 3): RubricScores => ({
  taskFit: n, accuracy: n, nonPromotional: n, dataHandling: n, safetyRouting: n, humanReview: n, reusable: n,
});
const noCritical = { restrictedDataToPublicTool: false, missedPlantedEvent: false };

describe("gate 2 red-flag drill", () => {
  it("passes when every issue is caught", () => {
    const r = scoreGate2(perfectGate2());
    expect(r.passed).toBe(true);
    expect(r.score).toBe(r.maxScore);
  });

  it("fails when one critical issue is missed, whatever else is caught", () => {
    const a = perfectGate2();
    const critical = SEEDED_DRAFT.find((s) => s.issue?.critical)!;
    a[critical.id] = null;
    expect(scoreGate2(a).passed).toBe(false);
  });

  it("passes with one minor miss but fails with two", () => {
    const minor = SEEDED_DRAFT.filter((s) => s.issue && !s.issue.critical);
    const one = perfectGate2();
    one[minor[0].id] = null;
    expect(scoreGate2(one).passed).toBe(true);
    const two = { ...one, [minor[1].id]: null };
    expect(scoreGate2(two).passed).toBe(false);
  });
});

describe("gate 3 sorting drill", () => {
  it("passes a perfect sort", () => {
    expect(scoreGate3(perfectGate3()).passed).toBe(true);
  });

  it("fails outright when restricted data goes to a public tool, even with a high score", () => {
    const a = perfectGate3();
    const restricted = SNIPPETS.find((s) => s.correctClass === "restricted")!;
    a[restricted.id] = { cls: "restricted", tier: "public-ai" };
    const r = scoreGate3(a);
    expect(r.score).toBe(r.maxScore - 1);
    expect(r.passed).toBe(false);
  });

  it("fails below the accuracy threshold", () => {
    const a = perfectGate3();
    for (const s of SNIPPETS.slice(0, 3)) a[s.id] = { cls: null, tier: null };
    expect(scoreGate3(a).passed).toBe(false);
  });
});

describe("gate 4 inbox drill", () => {
  const planted = INBOX.filter((m) => m.plantedEvent).map((m) => m.id);

  it("passes when every planted event is flagged, even with extra flags", () => {
    expect(scoreGate4(INBOX.map((m) => m.id)).passed).toBe(true);
  });

  it("fails when any planted event is missed", () => {
    expect(scoreGate4(planted.slice(1)).passed).toBe(false);
  });
});

describe("gate 5 rubric", () => {
  it("all 3s pass with 21", () => {
    expect(evaluateRubric(all(3), noCritical)).toMatchObject({ total: 21, passed: true });
  });

  it("all 2s pass at exactly 14", () => {
    expect(evaluateRubric(all(2), noCritical)).toMatchObject({ total: 14, passed: true });
  });

  it("a single 0 fails even with a high total", () => {
    expect(evaluateRubric({ ...all(3), reusable: 0 }, noCritical).passed).toBe(false);
  });

  it("data handling or safety routing below 2 fails", () => {
    expect(evaluateRubric({ ...all(3), dataHandling: 1 }, noCritical).passed).toBe(false);
    expect(evaluateRubric({ ...all(3), safetyRouting: 1 }, noCritical).passed).toBe(false);
  });

  it("a critical failure overrides a perfect score", () => {
    expect(evaluateRubric(all(3), { ...noCritical, missedPlantedEvent: true }).passed).toBe(false);
    expect(evaluateRubric(all(3), { ...noCritical, restrictedDataToPublicTool: true }).passed).toBe(false);
  });
});
