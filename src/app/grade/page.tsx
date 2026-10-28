import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { getGate } from "@/lib/content/gates";
import { requireUser } from "@/lib/session";
import { store } from "@/lib/store";

export default async function GradeQueue() {
  const grader = await requireUser("grader");
  const [pending, all, users] = await Promise.all([
    store.listSubmissions({ status: "pending" }),
    store.listSubmissions({}),
    store.listUsers(),
  ]);
  const name = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown learner";
  const recent = all.filter((s) => s.status !== "pending").slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Grading queue</h1>
        <p className="text-muted mt-1">Oldest first. Score every build on the seven-line rubric; the pass rule is applied for you.</p>
      </div>

      {pending.length === 0 ? (
        <Card><p className="text-sm text-muted">No builds are waiting.</p></Card>
      ) : (
        <div className="grid gap-2">
          {[...pending].reverse().map((s) => (
            <Link key={s.id} href={`/grade/${s.id}`} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-accent">
              <span className="font-medium">{name(s.userId)}</span>
              <span className="text-sm text-muted">Gate {getGate(s.gateId)?.number}: {getGate(s.gateId)?.build.title}</span>
              <span className="ml-auto text-xs text-muted">Attempt {s.attempt} · {new Date(s.createdAt).toLocaleString()}</span>
              {s.userId === grader.id && <Badge tone="warn">Your own · cannot grade</Badge>}
            </Link>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Recently graded</h2>
          <div className="grid gap-2">
            {recent.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2 text-sm">
                <span>{name(s.userId)}</span>
                <span className="text-muted">Gate {getGate(s.gateId)?.number} · attempt {s.attempt}</span>
                <span className="ml-auto"><Badge tone={s.status === "passed" ? "good" : "bad"}>{s.status === "passed" ? "Passed" : "Not passed"}</Badge></span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
