import type { AuditEntry, DrillAttempt, GateId, Grade, Submission, UnitProgress, User } from "@/lib/types";

export type NewRecord<T> = Omit<T, "id" | "createdAt">;

// Every persistence backend implements this. Callers never touch tables directly.
export interface Store {
  getUser(id: string): Promise<User | null>;
  listUsers(): Promise<User[]>;

  completeUnit(userId: string, gateId: GateId, unitId: string): Promise<void>;
  listProgress(userId: string): Promise<UnitProgress[]>;

  addDrillAttempt(a: NewRecord<DrillAttempt>): Promise<DrillAttempt>;
  listDrillAttempts(userId: string): Promise<DrillAttempt[]>;

  addSubmission(s: NewRecord<Submission>): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | null>;
  listSubmissions(filter: { userId?: string; status?: Submission["status"] }): Promise<Submission[]>;
  setSubmissionStatus(id: string, status: Submission["status"]): Promise<void>;

  addGrade(g: NewRecord<Grade>): Promise<Grade>;
  getGradeForSubmission(submissionId: string): Promise<Grade | null>;

  addAudit(e: NewRecord<AuditEntry>): Promise<void>;
  listAudit(limit: number): Promise<AuditEntry[]>;
}
