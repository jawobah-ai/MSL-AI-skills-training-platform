import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { completeUnit, loadRecords } from "@/app/actions";
import { Card } from "@/components/ui";
import { getGate } from "@/lib/content/gates";
import { gateStates } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function UnitPage({ params }: { params: Promise<{ gate: string; unit: string }> }) {
  const { gate: gateId, unit: unitId } = await params;
  const gate = getGate(gateId);
  const index = gate?.units.findIndex((u) => u.id === unitId) ?? -1;
  if (!gate || index < 0) notFound();
  const user = await requireUser("learner");
  const records = await loadRecords(user.id);
  if (!gateStates(records).find((s) => s.gate.id === gate.id)!.unlocked) redirect("/learn");

  const unit = gate.units[index];
  const next = gate.units[index + 1];
  const done = records.progress.some((p) => p.gateId === gate.id && p.unitId === unit.id);

  async function markDone() {
    "use server";
    await completeUnit(gate!.id, unit.id);
    redirect(next ? `/learn/${gate!.id}/unit/${next.id}` : `/learn/${gate!.id}`);
  }

  return (
    <article className="max-w-2xl space-y-5">
      <Link href={`/learn/${gate.id}`} className="text-sm text-muted hover:text-foreground">← {gate.title}</Link>
      <div>
        <p className="text-xs text-muted">Unit {index + 1} of {gate.units.length} · {unit.minutes} min</p>
        <h1 className="text-2xl font-semibold tracking-tight">{unit.title}</h1>
      </div>
      {unit.paragraphs.map((p) => <p key={p.slice(0, 32)} className="leading-relaxed">{p}</p>)}
      <Card>
        <h2 className="text-sm font-semibold">Key points</h2>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">{unit.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
      </Card>
      <form action={markDone}>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
          {done ? (next ? "Next unit" : "Back to the module") : next ? "Mark done and continue" : "Mark done"}
        </button>
      </form>
    </article>
  );
}
