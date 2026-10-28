"use client";

import { startTransition, useActionState, useState } from "react";
import type { BuildSpec } from "@/lib/types";

type Action = (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;

export function BuildForm({ fields, action }: { fields: BuildSpec["fields"]; action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <form
      // `action` covers submits before hydration (a POST, never a GET with text in the URL).
      action={formAction}
      onSubmit={(e) => {
        // Once hydrated, submit via a transition: it skips React's automatic form reset after an action.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-4">
      {fields.map((f) => (
        <label key={f.id} className="block">
          <span className="text-sm font-medium">{f.label}</span>
          <span className="block text-xs text-muted">{f.help}</span>
          <textarea name={f.id} value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} required minLength={10} maxLength={8000} rows={5} className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </label>
      ))}
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Submitting…" : "Submit for grading"}
        </button>
        {state.error && <span className="text-sm text-bad">{state.error}</span>}
      </div>
    </form>
  );
}
