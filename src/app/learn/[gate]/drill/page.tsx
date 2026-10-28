import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { loadRecords } from "@/app/actions";
import { AbstractSet, Gate2Drill, Gate3Drill, Gate4Drill } from "@/components/drills";
import { ABSTRACT_KEY, ABSTRACTS, INBOX, SEEDED_DRAFT, SNIPPETS } from "@/lib/content/drills";
import { getGate } from "@/lib/content/gates";
import { gateStates } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function DrillPage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate: id } = await params;
  const gate = getGate(id);
  if (!gate) notFound();
  const user = await requireUser("learner");
  if (!gateStates(await loadRecords(user.id)).find((s) => s.gate.id === gate.id)!.unlocked) redirect("/learn");

  return (
    <div className="space-y-5">
      <Link href={`/learn/${gate.id}`} className="text-sm text-muted hover:text-foreground">← {gate.title}</Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{gate.drillTitle}</h1>
        <p className="text-muted mt-1 max-w-prose">{gate.drillIntro}</p>
        <p className="text-xs text-muted mt-2">All products, people, trials and numbers are invented.</p>
      </div>
      {/* Answer keys are stripped here so they never reach the browser; scoring runs on the server. */}
      {gate.id === "g1" && <AbstractSet abstracts={ABSTRACTS} answerKey={ABSTRACT_KEY} />}
      {gate.id === "g2" && <Gate2Drill sentences={SEEDED_DRAFT.map(({ id, text }) => ({ id, text }))} />}
      {gate.id === "g3" && <Gate3Drill snippets={SNIPPETS.map(({ id, text }) => ({ id, text }))} />}
      {gate.id === "g4" && <Gate4Drill items={INBOX.map(({ id, source, from, subject, body }) => ({ id, source, from, subject, body }))} />}
    </div>
  );
}
