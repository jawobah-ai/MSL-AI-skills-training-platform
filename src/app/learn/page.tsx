import Link from "next/link";
import { loadRecords } from "@/app/actions";
import { Badge, buildBadge, Card, drillBadge } from "@/components/ui";
import { assessmentGate, gateStates } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function LearnPage() {
  const user = await requireUser("learner");
  const states = gateStates(await loadRecords(user.id));
  const g5 = assessmentGate(states);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your gate modules</h1>
        <p className="text-muted mt-1">
          Pass all five gates to qualify for the certificate. Each module unlocks once the modules it builds on are done
          and their builds are submitted.
        </p>
      </div>

      <div className="grid gap-3">
        {states.map((s) => (
          <Card key={s.gate.id} className={s.unlocked ? "" : "opacity-60"}>
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-60">
                <p className="text-xs text-muted">
                  Gate {s.gate.number} · {s.gate.rubricId}
                </p>
                <h2 className="font-semibold mt-0.5">
                  {s.unlocked ? <Link href={`/learn/${s.gate.id}`} className="hover:text-accent">{s.gate.title}</Link> : s.gate.title}
                </h2>
                <p className="text-sm text-muted mt-1">{s.gate.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 text-right">
                {s.passed ? <Badge tone="good">Gate passed</Badge> : !s.unlocked ? <Badge tone="neutral">Locked</Badge> : null}
                <span className="text-xs text-muted">{s.unitsDone} of {s.unitsTotal} units</span>
                <Badge tone={drillBadge[s.drill][0]}>{drillBadge[s.drill][1]}</Badge>
                <Badge tone={buildBadge[s.build][0]}>{buildBadge[s.build][1]}</Badge>
              </div>
            </div>
          </Card>
        ))}

        <Card className="border-dashed">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-60">
              <p className="text-xs text-muted">Gate 5 · D5.1</p>
              <h2 className="font-semibold mt-0.5">Graded practical assessment</h2>
              <p className="text-sm text-muted mt-1">
                Not a separate module: a trained grader scores every build above on the same seven-line rubric.
              </p>
            </div>
            <Badge tone={g5.met ? "good" : "neutral"}>
              {g5.passed} of {g5.total} builds passed
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
