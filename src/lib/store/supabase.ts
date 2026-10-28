import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditEntry, DrillAttempt, Grade, Submission, User } from "@/lib/types";
import type { Store } from "./types";

// Production store. Runs as the signed-in user, so the RLS policies in
// supabase/migrations decide what each call may read or write.

export async function supabaseServer(): Promise<SupabaseClient> {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const c of list) jar.set(c.name, c.value, c.options);
        } catch {
          // Called from a Server Component, where cookies are read-only; middleware refreshes them.
        }
      },
    },
  });
}

function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// For list queries: a null result with no error is an empty list.
const rows = <T>(res: { data: T[] | null; error: { message: string } | null }): T[] => must(res) ?? [];

type Row = Record<string, unknown>;

const toUser = (r: Row): User => ({ id: r.id as string, name: r.name as string, role: r.role as User["role"] });
const toAttempt = (r: Row): DrillAttempt => ({
  id: r.id as string, userId: r.user_id as string, gateId: r.gate_id as DrillAttempt["gateId"], answers: r.answers,
  passed: r.passed as boolean, score: r.score as number, maxScore: r.max_score as number,
  feedback: r.feedback as string[], createdAt: r.created_at as string,
});
const toSubmission = (r: Row): Submission => ({
  id: r.id as string, userId: r.user_id as string, gateId: r.gate_id as Submission["gateId"], attempt: r.attempt as number,
  fields: r.fields as Record<string, string>, status: r.status as Submission["status"], createdAt: r.created_at as string,
});
const toGrade = (r: Row): Grade => ({
  id: r.id as string, submissionId: r.submission_id as string, graderId: r.grader_id as string,
  scores: r.scores as Grade["scores"], criticalFailures: r.critical_failures as Grade["criticalFailures"],
  total: r.total as number, passed: r.passed as boolean, reasons: r.reasons as string[],
  feedback: r.feedback as string, createdAt: r.created_at as string,
});
const toAudit = (r: Row): AuditEntry => ({
  id: r.id as string, actorId: r.actor_id as string, action: r.action as string, target: r.target as string,
  detail: r.detail as string, createdAt: r.created_at as string,
});

export const supabaseStore: Store = {
  async getUser(id) {
    const db = await supabaseServer();
    const row = must(await db.from("profiles").select("*").eq("id", id).maybeSingle());
    return row ? toUser(row) : null;
  },
  async listUsers() {
    const db = await supabaseServer();
    return rows(await db.from("profiles").select("*")).map(toUser);
  },

  async completeUnit(userId, gateId, unitId) {
    const db = await supabaseServer();
    must(await db.from("unit_progress").upsert({ user_id: userId, gate_id: gateId, unit_id: unitId }));
  },
  async listProgress(userId) {
    const db = await supabaseServer();
    return rows(await db.from("unit_progress").select("*").eq("user_id", userId)).map((r: Row) => ({
      userId: r.user_id as string, gateId: r.gate_id as DrillAttempt["gateId"], unitId: r.unit_id as string,
      completedAt: r.completed_at as string,
    }));
  },

  async addDrillAttempt(a) {
    const db = await supabaseServer();
    const row = must(await db.from("drill_attempts").insert({
      user_id: a.userId, gate_id: a.gateId, answers: a.answers, passed: a.passed, score: a.score,
      max_score: a.maxScore, feedback: a.feedback,
    }).select().single());
    return toAttempt(row);
  },
  async listDrillAttempts(userId) {
    const db = await supabaseServer();
    return rows(await db.from("drill_attempts").select("*").eq("user_id", userId).order("created_at", { ascending: false })).map(toAttempt);
  },

  async addSubmission(s) {
    const db = await supabaseServer();
    const row = must(await db.from("submissions").insert({
      user_id: s.userId, gate_id: s.gateId, attempt: s.attempt, fields: s.fields, status: s.status,
    }).select().single());
    return toSubmission(row);
  },
  async getSubmission(id) {
    const db = await supabaseServer();
    const row = must(await db.from("submissions").select("*").eq("id", id).maybeSingle());
    return row ? toSubmission(row) : null;
  },
  async listSubmissions({ userId, status }) {
    const db = await supabaseServer();
    let q = db.from("submissions").select("*").order("created_at", { ascending: false });
    if (userId) q = q.eq("user_id", userId);
    if (status) q = q.eq("status", status);
    return rows(await q).map(toSubmission);
  },
  async setSubmissionStatus(id, status) {
    const db = await supabaseServer();
    must(await db.from("submissions").update({ status }).eq("id", id));
  },

  async addGrade(g) {
    const db = await supabaseServer();
    const row = must(await db.from("grades").insert({
      submission_id: g.submissionId, grader_id: g.graderId, scores: g.scores, critical_failures: g.criticalFailures,
      total: g.total, passed: g.passed, reasons: g.reasons, feedback: g.feedback,
    }).select().single());
    return toGrade(row);
  },
  async getGradeForSubmission(submissionId) {
    const db = await supabaseServer();
    const row = must(await db.from("grades").select("*").eq("submission_id", submissionId).maybeSingle());
    return row ? toGrade(row) : null;
  },

  async addAudit(e) {
    const db = await supabaseServer();
    must(await db.from("audit_log").insert({ actor_id: e.actorId, action: e.action, target: e.target, detail: e.detail }));
  },
  async listAudit(limit) {
    const db = await supabaseServer();
    return rows(await db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(limit)).map(toAudit);
  },
};
