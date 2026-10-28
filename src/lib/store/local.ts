import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AuditEntry, DrillAttempt, Grade, Submission, UnitProgress, User } from "@/lib/types";
import type { NewRecord, Store } from "./types";

// Demo-mode store: one JSON file under .data/. Single-process only; not for production.

type Db = {
  users: User[];
  progress: UnitProgress[];
  drillAttempts: DrillAttempt[];
  submissions: Submission[];
  grades: Grade[];
  audit: AuditEntry[];
};

export const DEMO_USERS: User[] = [
  { id: "demo-learner", name: "Demo Learner", role: "learner" },
  { id: "demo-grader", name: "Demo Grader", role: "grader" },
];

const FILE = process.env.MSL_DATA_FILE ?? path.join(process.cwd(), ".data", "db.json");

const empty = (): Db => ({ users: DEMO_USERS, progress: [], drillAttempts: [], submissions: [], grades: [], audit: [] });

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch {
    return empty();
  }
}

// Serialise read-modify-write so concurrent requests in one process do not clobber each other.
function mutate<T>(fn: (db: Db) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const out = fn(db);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2));
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}

const stamp = <T>(r: NewRecord<T>) => ({ ...r, id: randomUUID(), createdAt: new Date().toISOString() }) as T;
const newestFirst = <T extends { createdAt: string }>(xs: T[]) => [...xs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const localStore: Store = {
  async getUser(id) {
    return (await load()).users.find((u) => u.id === id) ?? null;
  },
  async listUsers() {
    return (await load()).users;
  },

  completeUnit(userId, gateId, unitId) {
    return mutate((db) => {
      if (!db.progress.some((p) => p.userId === userId && p.gateId === gateId && p.unitId === unitId))
        db.progress.push({ userId, gateId, unitId, completedAt: new Date().toISOString() });
    });
  },
  async listProgress(userId) {
    return (await load()).progress.filter((p) => p.userId === userId);
  },

  addDrillAttempt(a) {
    return mutate((db) => {
      const rec = stamp<DrillAttempt>(a);
      db.drillAttempts.push(rec);
      return rec;
    });
  },
  async listDrillAttempts(userId) {
    return newestFirst((await load()).drillAttempts.filter((a) => a.userId === userId));
  },

  addSubmission(s) {
    return mutate((db) => {
      const rec = stamp<Submission>(s);
      db.submissions.push(rec);
      return rec;
    });
  },
  async getSubmission(id) {
    return (await load()).submissions.find((s) => s.id === id) ?? null;
  },
  async listSubmissions({ userId, status }) {
    const all = (await load()).submissions;
    return newestFirst(all.filter((s) => (!userId || s.userId === userId) && (!status || s.status === status)));
  },
  setSubmissionStatus(id, status) {
    return mutate((db) => {
      const s = db.submissions.find((x) => x.id === id);
      if (s) s.status = status;
    });
  },

  addGrade(g) {
    return mutate((db) => {
      const rec = stamp<Grade>(g);
      db.grades.push(rec);
      return rec;
    });
  },
  async getGradeForSubmission(submissionId) {
    return (await load()).grades.find((g) => g.submissionId === submissionId) ?? null;
  },

  addAudit(e) {
    return mutate((db) => {
      db.audit.push(stamp<AuditEntry>(e));
    });
  },
  async listAudit(limit) {
    return newestFirst((await load()).audit).slice(0, limit);
  },
};
