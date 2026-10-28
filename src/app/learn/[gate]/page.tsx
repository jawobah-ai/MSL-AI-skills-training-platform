import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { loadRecords } from "@/app/actions";
import { Badge, buildBadge, Card, drillBadge } from "@/components/ui";
import { getGate } from "@/lib/content/gates";
import { gateStates } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { store } from "@/lib/store";
import { RUBRIC } from "@/lib/rubric";

export default async function GatePage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate: id } = await params;
  const gate = getGate(id);
  if (!gate) notFound();
  const user = await requireUser("learner");
  const records = await loadRecords(user.id);
  const state = gateStates(records).find((s) => s.gate.id === gate.id)!;
  if (!state.unlocked) redirect("/learn");

  const done = new Set(records.progress.filter((p) => p.gateId === gate.id).map((p) => p.unitId));
  const grade = state.latestSubmission ? await store.getGradeForSubmission(state.latestSubmission.id) : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/learn" className="text-sm text-muted hover:text-foreground">← All gates</Link>
        <p className="text-xs text-muted mt-4">Gate {gate.number} · {gate.rubricId}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{gate.title}</h1>
        <p className="text-muted mt-1 max-w-prose">{gate.summary}</p>
        <p className="text-xs text-muted mt-2">Measured by: {gate.metric}</p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Units</h2>
        <ol className="grid gap-2">
          {gate.units.map((u, i) => (
            <li key={u.id}>
              <Link href={`/learn/${gate.id}/unit/${u.id}`} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-accent">
                <span className="text-sm text-muted w-5">{i + 1}</span>
                <span className="flex-1">{u.title}</span>
                <span className="text-xs text-muted">{u.minutes} min</span>
                {done.has(u.id) && <Badge tone="good">Done</Badge>}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">{gate.drillTitle}</h2>
          <p className="text-sm text-muted mt-1">{gate.drillIntro}</p>
          <div className="mt-3 flex items-center gap-3">
            <Link href={`/learn/${gate.id}/drill`} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
              {state.drill === "reference" ? "Open the set" : state.drill === "not-started" ? "Start the drill" : "Open the drill"}
            </Link>
            <Badge tone={drillBadge[state.drill][0]}>{drillBadge[state.drill][1]}</Badge>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Build: {gate.build.title}</h2>
          <p className="text-sm text-muted mt-1">{gate.build.minutes} minutes · graded on the shared rubric</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {state.nextAttempt && (
              <Link href={`/learn/${gate.id}/build`} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
                {state.nextAttempt === 1 ? "Start the build" : "Resubmit the build"}
              </Link>
            )}
            <Badge tone={buildBadge[state.build][0]}>{buildBadge[state.build][1]}</Badge>
          </div>
        </Card>
      </div>

      {grade && (
        <Card>
          <div className="flex items-center gap-3">
            <h2 className="font-semibold">Grader feedback · attempt {state.latestSubmission!.attempt}</h2>
            <Badge tone={grade.passed ? "good" : "bad"}>{grade.passed ? "Passed" : "Not passed"} · {grade.total}/21</Badge>
          </div>
          <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {RUBRIC.map((d) => (
              <div key={d.id} className="flex justify-between gap-3 border-b border-line py-1">
                <dt className="text-muted">{d.label}</dt>
                <dd>{grade.scores[d.id]} · {d.levels[grade.scores[d.id]]}</dd>
              </div>
            ))}
          </dl>
          {grade.reasons.length > 0 && (
            <ul className="mt-3 text-sm text-bad list-disc pl-5">{grade.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
          )}
          <p className="mt-3 text-sm whitespace-pre-wrap">{grade.feedback}</p>
        </Card>
      )}
    </div>
  );
}
