import { redirect } from "next/navigation";
import { signInDemo } from "@/app/actions";
import { EmailSignIn } from "@/components/email-sign-in";
import { getCurrentUser } from "@/lib/session";
import { isDemoMode } from "@/lib/store";
import { DEMO_USERS } from "@/lib/store/local";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "grader" ? "/grade" : "/learn");

  return (
    <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] items-start">
      <section className="space-y-4">
        <p className="text-sm font-medium text-accent">For Medical Science Liaisons</p>
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">
          Build AI workflows for your real MSL week, without crossing a compliance line.
        </h1>
        <p className="text-muted max-w-prose">
          Five gate modules come first: task anchoring, non-promotional guardrails, data governance, adverse-event
          routing, and a graded practical assessment. Every module ends in something you build, and a person grades it.
        </p>
        <ul className="text-sm space-y-1 text-muted">
          <li>Units of 15 minutes or less</li>
          <li>Synthetic cases only: no real patient, HCP or company data</li>
          <li>One rubric for every build, graded by a person</li>
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <h2 className="font-semibold">Sign in</h2>
        {isDemoMode ? (
          <>
            <p className="text-sm text-muted">Demo mode keeps data in a local file. Pick a role to explore.</p>
            <div className="grid gap-2">
              {DEMO_USERS.map((u) => (
                <form key={u.id} action={signInDemo}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button className="w-full rounded-lg border border-line px-4 py-3 text-left hover:border-accent">
                    <span className="font-medium">{u.name}</span>
                    <span className="block text-sm text-muted">
                      {u.role === "learner" ? "Work through the gate modules" : "Grade submitted builds"}
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </>
        ) : (
          <EmailSignIn />
        )}
      </section>
    </div>
  );
}
