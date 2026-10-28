"use client";

import { startTransition, useActionState, useState } from "react";
import { evaluateRubric, type RUBRIC } from "@/lib/rubric";
import type { RubricScores } from "@/lib/types";

type Action = (prev: { error?: string }, formData: FormData) => Promise<{ error?: string }>;

// The live preview uses the same rule the server applies; the server result is the one recorded.
export function GradeForm({ rubric, passTotal, action }: { rubric: typeof RUBRIC; passTotal: number; action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [scores, setScores] = useState<Partial<RubricScores>>({});
  const [critical, setCritical] = useState({ restrictedDataToPublicTool: false, missedPlantedEvent: false });
  const [feedback, setFeedback] = useState("");
  const complete = rubric.every((d) => scores[d.id] !== undefined);
  const preview = complete ? evaluateRubric(scores as RubricScores, critical) : null;

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
      className="rounded-xl border border-line bg-surface p-5 space-y-4 lg:sticky lg:top-4">
      <h2 className="font-semibold">Rubric</h2>
      {rubric.map((d) => (
        <fieldset key={d.id}>
          <legend className="text-sm font-medium">{d.label}</legend>
          <div className="mt-1 grid grid-cols-4 gap-1">
            {d.levels.map((label, n) => (
              <label key={n} className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs leading-tight ${scores[d.id] === n ? "border-accent bg-accent-soft" : "border-line"}`}>
                <input type="radio" name={d.id} value={n} required className="sr-only" checked={scores[d.id] === n} onChange={() => setScores({ ...scores, [d.id]: n as 0 | 1 | 2 | 3 })} />
                <span className="font-semibold">{n}</span> {label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Critical failures (fail whatever the total)</legend>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="restrictedDataToPublicTool" checked={critical.restrictedDataToPublicTool} onChange={(e) => setCritical({ ...critical, restrictedDataToPublicTool: e.target.checked })} />
          Restricted data sent to a public tool
        </label>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="missedPlantedEvent" checked={critical.missedPlantedEvent} onChange={(e) => setCritical({ ...critical, missedPlantedEvent: e.target.checked })} />
          A planted adverse event was missed
        </label>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium">Feedback for the learner</span>
        <textarea name="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} required minLength={20} rows={4} className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm" />
      </label>

      {preview && (
        <div className={`rounded-lg px-3 py-2 text-sm ${preview.passed ? "bg-good-soft text-good" : "bg-bad-soft text-bad"}`}>
          <p className="font-medium">{preview.passed ? "Will pass" : "Will not pass"} · {preview.total}/21 (pass at {passTotal})</p>
          {preview.reasons.length > 0 && <ul className="list-disc pl-5">{preview.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button disabled={pending || !complete} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Saving…" : "Record grade"}
        </button>
        {state.error && <span className="text-sm text-bad">{state.error}</span>}
      </div>
    </form>
  );
}
