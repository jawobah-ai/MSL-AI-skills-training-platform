import { requireUser } from "@/lib/session";
import { store } from "@/lib/store";

export default async function AuditPage() {
  await requireUser("grader");
  const [entries, users] = await Promise.all([store.listAudit(200), store.listUsers()]);
  const name = (id: string) => users.find((u) => u.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-muted mt-1">Every drill attempt, build submission and grade, newest first. Entries cannot be edited.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">Who</th>
              <th className="px-4 py-2 font-medium">Action</th>
              <th className="px-4 py-2 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0 align-top">
                <td className="px-4 py-2 whitespace-nowrap text-muted">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 whitespace-nowrap">{name(e.actorId)}</td>
                <td className="px-4 py-2 whitespace-nowrap font-mono text-xs">{e.action}</td>
                <td className="px-4 py-2">{e.target.length < 8 ? `${e.target} · ` : ""}{e.detail}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">No activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
