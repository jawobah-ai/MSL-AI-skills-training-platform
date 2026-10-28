import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { loadRecords, submitBuild } from "@/app/actions";
import { BuildForm } from "@/components/build-form";
import { getGate } from "@/lib/content/gates";
import { gateStates } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function BuildPage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate: id } = await params;
  const gate = getGate(id);
  if (!gate) notFound();
  const user = await requireUser("learner");
  const state = gateStates(await loadRecords(user.id)).find((s) => s.gate.id === gate.id)!;
  if (!state.unlocked || !state.nextAttempt) redirect(`/learn/${gate.id}`);

  return (
    <div className="max-w-2xl space-y-5">
      <Link href={`/learn/${gate.id}`} className="text-sm text-muted hover:text-foreground">← {gate.title}</Link>
      <div>
        <p className="text-xs text-muted">Attempt {state.nextAttempt} of 2 · {gate.build.minutes} min</p>
        <h1 className="text-2xl font-semibold tracking-tight">Build: {gate.build.title}</h1>
      </div>
      <ol className="list-decimal pl-5 space-y-1 text-sm">{gate.build.instructions.map((s) => <li key={s}>{s}</li>)}</ol>
      <p className="rounded-lg bg-warn-soft text-warn text-sm px-4 py-3">
        Use synthetic or public material only. Do not paste real patient, HCP or company data into this form.
      </p>
      <BuildForm fields={gate.build.fields} action={submitBuild.bind(null, gate.id)} />
    </div>
  );
}
