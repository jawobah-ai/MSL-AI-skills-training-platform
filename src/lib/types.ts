export type Role = "learner" | "grader";

export type GateId = "g1" | "g2" | "g3" | "g4";

export type Unit = {
  id: string;
  title: string;
  minutes: number;
  paragraphs: string[];
  keyPoints: string[];
};

export type BuildSpec = {
  title: string;
  minutes: number;
  instructions: string[];
  // Fields the learner fills in; graded against the shared rubric.
  fields: { id: string; label: string; help: string }[];
};

export type Gate = {
  id: GateId;
  rubricId: string;
  number: number;
  title: string;
  summary: string;
  prerequisites: GateId[];
  units: Unit[];
  build: BuildSpec;
  drillTitle: string;
  drillIntro: string;
  metric: string;
};

// ---- Drills -------------------------------------------------------------

export type RedFlagCategory = "promotional" | "unbalanced" | "comparative" | "off-label" | "uncited";

export type DraftSentence = {
  id: string;
  text: string;
  // Planted issue, if any. `critical` issues must all be caught to pass.
  issue?: { category: RedFlagCategory; critical: boolean; explanation: string };
};

export type DataClass = "public" | "internal" | "confidential" | "restricted";
export type ToolTier = "public-ai" | "enterprise-ai" | "approved-instance" | "no-ai";

export type Snippet = {
  id: string;
  text: string;
  correctClass: DataClass;
  // Tiers that are acceptable for this snippet.
  allowedTiers: ToolTier[];
  explanation: string;
};

export type InboxItem = {
  id: string;
  source: string;
  from: string;
  subject: string;
  body: string;
  // Planted event: a possible adverse event or product-quality complaint.
  plantedEvent?: { kind: "adverse-event" | "product-complaint"; explanation: string };
};

export type Abstract = { id: string; title: string; ta: string; text: string };

// ---- Records ------------------------------------------------------------

export type User = { id: string; name: string; role: Role; email?: string };

export type DrillAttempt = {
  id: string;
  userId: string;
  gateId: GateId;
  answers: unknown;
  passed: boolean;
  score: number;
  maxScore: number;
  feedback: string[];
  createdAt: string;
};

export type Submission = {
  id: string;
  userId: string;
  gateId: GateId;
  attempt: number; // 1 = first try, 2 = the one resubmission
  fields: Record<string, string>;
  status: "pending" | "passed" | "failed";
  createdAt: string;
};

export type RubricDimension =
  | "taskFit"
  | "accuracy"
  | "nonPromotional"
  | "dataHandling"
  | "safetyRouting"
  | "humanReview"
  | "reusable";

export type RubricScores = Record<RubricDimension, 0 | 1 | 2 | 3>;

export type Grade = {
  id: string;
  submissionId: string;
  graderId: string;
  scores: RubricScores;
  criticalFailures: { restrictedDataToPublicTool: boolean; missedPlantedEvent: boolean };
  total: number;
  passed: boolean;
  reasons: string[];
  feedback: string;
  createdAt: string;
};

export type AuditEntry = {
  id: string;
  actorId: string;
  action: string;
  target: string;
  detail: string;
  createdAt: string;
};

export type UnitProgress = { userId: string; gateId: GateId; unitId: string; completedAt: string };
