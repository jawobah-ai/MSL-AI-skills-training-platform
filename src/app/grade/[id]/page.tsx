import Link from "next/link";
import { notFound } from "next/navigation";
import { gradeSubmission } from "@/app/actions";
import { GradeForm } from "@/components/grade-form";
import { Card } from "@/components/ui";
import { getGate } from "@/lib/content/gates";
import { RUBRIC, RUBRIC_PASS_TOTAL } from "@/lib/rubric";
import { requireUser } from "@/lib/session";
import { store } from "@/lib/store";

export default async function GradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser("grader");
  const sub = await store.getSubmission(id);
  if (!sub) notFound();
  const gate = getGate(sub.gateId)!;
  const learner = await store.getUser(sub.userId);
  const attempts = (await store.listDrillAttempts(sub.userId)).filter((a) => a.gateId === sub.gateId);

  return (
    <div className="space-y-6">
      <Link href="/grade" className="text-sm text-muted hover:text-foreground">← Grading queue</Link>
      <div>
        <p className="text-xs text-muted">Gate {gate.number} · {gate.rubricId} · attempt {sub.attempt}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{gate.build.title}</h1>
        <p className="text-muted mt-1">
          {learner?.name ?? "Unknown learner"} · submitted {new Date(sub.createdAt).toLocaleString()} ·{" "}
          {attempts.length === 0 ? "no drill attempts" : `drill ${attempts.some((a) => a.passed) ? "passed" : "not passed"} (${attempts.length} attempt${attempts.length > 1 ? "s" : ""})`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
        <section className="space-y-3">
          {gate.build.fields.map((f) => (
            <Card key={f.id}>
              <h2 className="text-sm font-semibold">{f.label}</h2>
              <p className="text-xs text-muted">{f.help}</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{sub.fields[f.id]}</p>
            </Card>
          ))}
        </section>
        <section>
          {sub.status === "pending" ? (
            <GradeForm rubric={RUBRIC} passTotal={RUBRIC_PASS_TOTAL} action={gradeSubmission.bind(null, sub.id)} />
          ) : (
            <Card><p className="text-sm">This build has already been graded ({sub.status}).</p></Card>
          )}
        </section>
      </div>
    </div>
  );
}
