"use client";

import { useActionState } from "react";
import { signInWithEmail } from "@/app/actions";

export function EmailSignIn() {
  const [state, action, pending] = useActionState(signInWithEmail, { message: "" });
  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm">
        Work email
        <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2" />
      </label>
      <button disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state.message && <p className="text-sm text-muted">{state.message}</p>}
    </form>
  );
}
