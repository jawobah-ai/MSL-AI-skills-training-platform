"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getGate } from "@/lib/content/gates";
import { gateStates } from "@/lib/progress";
import { evaluateRubric, RUBRIC, scoreGate2, scoreGate3, scoreGate4, type DrillResult } from "@/lib/scoring";
import { DEMO_COOKIE, requireUser } from "@/lib/session";
import { isDemoMode, store } from "@/lib/store";
import { DEMO_USERS } from "@/lib/store/local";
import { supabaseServer } from "@/lib/store/supabase";
import type { GateId, RubricScores } from "@/lib/types";

export async function loadRecords(userId: string) {
  const [progress, attempts, submissions] = await Promise.all([
    store.listProgress(userId),
    store.listDrillAttempts(userId),
    store.listSubmissions({ userId }),
  ]);
  return { progress, attempts, submissions };
}

// ---- Sign-in ------------------------------------------------------------

export async function signInDemo(formData: FormData) {
  if (!isDemoMode) throw new Error("Demo sign-in is disabled when Supabase is configured.");
  const id = String(formData.get("userId"));
  const user = DEMO_USERS.find((u) => u.id === id);
  if (!user) throw new Error("Unknown demo user.");
  (await cookies()).set(DEMO_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(user.role === "grader" ? "/grade" : "/learn");
}

export async function signInWithEmail(_: unknown, formData: FormData): Promise<{ message: string }> {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { message: "Enter a valid work email." };
  const origin = (await headers()).get("origin") ?? "";
  const db = await supabaseServer();
  const { error } = await db.auth.signInWithOtp({ email: email.data, options: { emailRedirectTo: `${origin}/auth/callback` } });
  return { message: error ? error.message : "Check your email for a sign-in link." };
}

export async function signOut() {
  if (isDemoMode) (await cookies()).delete(DEMO_COOKIE);
  else await (await supabaseServer()).auth.signOut();
  redirect("/");
}

// ---- Learner ------------------------------------------------------------

const gateIdSchema = z.enum(["g1", "g2", "g3", "g4"]);

export async function completeUnit(gateId: GateId, unitId: string) {
  const user = await requireUser("learner");
  const gate = getGate(gateIdSchema.parse(gateId));
  if (!gate?.units.some((u) => u.id === unitId)) throw new Error("Unknown unit.");
  await store.completeUnit(user.id, gate.id, unitId);
  revalidatePath(`/learn/${gate.id}`);
}

const gate2Schema = z.record(z.enum(["promotional", "unbalanced", "comparative", "off-label", "uncited"]).nullable());
const gate3Schema = z.record(
  z.object({
    cls: z.enum(["public", "internal", "confidential", "restricted"]).nullable(),
    tier: z.enum(["public-ai", "enterprise-ai", "approved-instance", "no-ai"]).nullable(),
  }),
);
const gate4Schema = z.array(z.string()).max(50);

// Scoring always runs on the server; the client only sends answers.
export async function submitDrill(gateId: GateId, answers: unknown): Promise<DrillResult> {
  const user = await requireUser("learner");
  const id = gateIdSchema.parse(gateId);
  const result =
    id === "g2" ? scoreGate2(gate2Schema.parse(answers))
    : id === "g3" ? scoreGate3(gate3Schema.parse(answers))
    : id === "g4" ? scoreGate4(gate4Schema.parse(answers))
    : null;
  if (!result) throw new Error("This gate has no scored drill.");

  await store.addDrillAttempt({ userId: user.id, gateId: id, answers, ...result });
  await store.addAudit({
    actorId: user.id, action: "drill.attempt", target: id,
    detail: `${result.passed ? "passed" : "failed"} ${result.score}/${result.maxScore}`,
  });
  revalidatePath(`/learn/${id}`);
  return result;
}

export async function submitBuild(gateId: GateId, _: unknown, formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser("learner");
  const gate = getGate(gateIdSchema.parse(gateId))!;
  const state = gateStates(await loadRecords(user.id)).find((s) => s.gate.id === gate.id)!;
  if (!state.unlocked) return { error: "Finish the prerequisite gates first." };
  if (!state.nextAttempt) return { error: "No submission is open for this gate." };

  const fields: Record<string, string> = {};
  for (const f of gate.build.fields) {
    const v = String(formData.get(f.id) ?? "").trim();
    if (v.length < 10) return { error: `"${f.label}" needs more detail.` };
    if (v.length > 8000) return { error: `"${f.label}" is too long (8,000 characters max).` };
    fields[f.id] = v;
  }

  const sub = await store.addSubmission({ userId: user.id, gateId: gate.id, attempt: state.nextAttempt, fields, status: "pending" });
  await store.addAudit({ actorId: user.id, action: "build.submit", target: sub.id, detail: `${gate.id} attempt ${sub.attempt}` });
  revalidatePath(`/learn/${gate.id}`);
  redirect(`/learn/${gate.id}`);
}

// ---- Grader -------------------------------------------------------------

const level = z.coerce.number().int().min(0).max(3);

export async function gradeSubmission(submissionId: string, _: unknown, formData: FormData): Promise<{ error?: string }> {
  const grader = await requireUser("grader");
  const sub = await store.getSubmission(submissionId);
  if (!sub) return { error: "Submission not found." };
  if (sub.userId === grader.id) return { error: "You cannot grade your own submission." };
  if (sub.status !== "pending" || (await store.getGradeForSubmission(sub.id))) return { error: "Already graded." };

  const scores = {} as RubricScores;
  for (const d of RUBRIC) {
    const v = level.safeParse(formData.get(d.id));
    if (!v.success) return { error: `Score "${d.label}" from 0 to 3.` };
    scores[d.id] = v.data as RubricScores[typeof d.id];
  }
  const criticalFailures = {
    restrictedDataToPublicTool: formData.get("restrictedDataToPublicTool") === "on",
    missedPlantedEvent: formData.get("missedPlantedEvent") === "on",
  };
  const feedback = String(formData.get("feedback") ?? "").trim();
  if (feedback.length < 20) return { error: "Write feedback the learner can act on (20 characters or more)." };

  const { total, passed, reasons } = evaluateRubric(scores, criticalFailures);
  await store.addGrade({ submissionId: sub.id, graderId: grader.id, scores, criticalFailures, total, passed, reasons, feedback });
  await store.setSubmissionStatus(sub.id, passed ? "passed" : "failed");
  await store.addAudit({
    actorId: grader.id, action: "build.grade", target: sub.id,
    detail: `${passed ? "passed" : "failed"} ${total}/21${reasons.length ? ` — ${reasons.join(" ")}` : ""}`,
  });
  revalidatePath("/grade");
  redirect("/grade");
}
