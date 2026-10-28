"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitDrill } from "@/app/actions";
import type { DrillResult } from "@/lib/scoring";
import type { Abstract, DataClass, InboxItem, RedFlagCategory, ToolTier } from "@/lib/types";

const CATEGORIES: { id: RedFlagCategory; label: string }[] = [
  { id: "promotional", label: "Promotional" },
  { id: "unbalanced", label: "Unbalanced efficacy/safety" },
  { id: "comparative", label: "Unsupported comparison" },
  { id: "off-label", label: "Unsolicited off-label" },
  { id: "uncited", label: "Uncited claim" },
];

const CLASSES: DataClass[] = ["public", "internal", "confidential", "restricted"];
const TIERS: { id: ToolTier; label: string }[] = [
  { id: "public-ai", label: "Public AI tool" },
  { id: "enterprise-ai", label: "Company enterprise AI" },
  { id: "approved-instance", label: "Tool approved for this data" },
  { id: "no-ai", label: "No AI" },
];

function useDrill(gateId: "g2" | "g3" | "g4") {
  const [result, setResult] = useState<DrillResult | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const submit = (answers: unknown) =>
    start(async () => {
      setError("");
      try {
        setResult(await submitDrill(gateId, answers));
      } catch {
        setError("Could not submit. Check your answers and try again.");
      }
    });
  return { result, error, pending, submit, reset: () => setResult(null) };
}

function ResultPanel({ result, gateId, onRetry }: { result: DrillResult; gateId: string; onRetry: () => void }) {
  return (
    <div className={`rounded-xl border p-5 ${result.passed ? "border-good bg-good-soft" : "border-bad bg-bad-soft"}`}>
      <p className="font-semibold">{result.passed ? "Passed" : "Not passed"} · {result.score} of {result.maxScore}</p>
      {result.feedback.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">{result.feedback.map((f) => <li key={f}>{f}</li>)}</ul>
      )}
      <div className="mt-4 flex gap-3 text-sm">
        <Link href={`/learn/${gateId}`} className="rounded-lg bg-accent px-4 py-2 font-medium text-white">Back to the module</Link>
        {!result.passed && <button onClick={onRetry} className="rounded-lg border border-line bg-surface px-4 py-2">Try again</button>}
      </div>
    </div>
  );
}

function SubmitBar({ pending, error, label = "Submit answers" }: { pending: boolean; error: string; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <button disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Scoring…" : label}
      </button>
      {error && <span className="text-sm text-bad">{error}</span>}
    </div>
  );
}

// ---- Gate 1: reference set ----------------------------------------------

export function AbstractSet({ abstracts, answerKey }: { abstracts: Abstract[]; answerKey: Record<string, { include: boolean; reason: string }> }) {
  const [reveal, setReveal] = useState(false);
  return (
    <div className="space-y-3">
      {abstracts.map((a, i) => (
        <div key={a.id} className="rounded-lg border border-line bg-surface p-4">
          <p className="text-xs text-muted">Abstract {i + 1} · {a.ta}</p>
          <p className="font-medium">{a.title}</p>
          <p className="text-sm mt-1">{a.text}</p>
          {reveal && (
            <p className={`text-sm mt-2 ${answerKey[a.id].include ? "text-good" : "text-muted"}`}>
              {answerKey[a.id].include ? "Include" : "Exclude"}: {answerKey[a.id].reason}
            </p>
          )}
        </div>
      ))}
      {!reveal && (
        <button onClick={() => setReveal(true)} className="rounded-lg border border-line bg-surface px-4 py-2 text-sm">
          I have run my prompt card: show the answer key
        </button>
      )}
      <p className="text-sm text-muted">Record what your prompt returned and what you corrected in the Gate 1 build.</p>
    </div>
  );
}

// ---- Gate 2 -------------------------------------------------------------

export function Gate2Drill({ sentences }: { sentences: { id: string; text: string }[] }) {
  const [answers, setAnswers] = useState<Record<string, RedFlagCategory | null>>({});
  const d = useDrill("g2");
  if (d.result) return <ResultPanel result={d.result} gateId="g2" onRetry={d.reset} />;

  return (
    <form onSubmit={(e) => { e.preventDefault(); d.submit(answers); }} className="space-y-3">
      <div className="rounded-xl border border-line bg-surface divide-y divide-line">
        {sentences.map((s) => (
          <div key={s.id} className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm">{s.text}</p>
            <select
              aria-label="Issue"
              value={answers[s.id] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [s.id]: (e.target.value || null) as RedFlagCategory | null })}
              className="rounded-lg border border-line bg-background px-2 py-1.5 text-sm"
            >
              <option value="">No issue</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        ))}
      </div>
      <SubmitBar pending={d.pending} error={d.error} />
    </form>
  );
}

// ---- Gate 3 -------------------------------------------------------------

export function Gate3Drill({ snippets }: { snippets: { id: string; text: string }[] }) {
  type A = { cls: DataClass | null; tier: ToolTier | null };
  const [answers, setAnswers] = useState<Record<string, A>>({});
  const d = useDrill("g3");
  if (d.result) return <ResultPanel result={d.result} gateId="g3" onRetry={d.reset} />;
  const set = (id: string, patch: Partial<A>) =>
    setAnswers({ ...answers, [id]: { ...(answers[id] ?? { cls: null, tier: null }), ...patch } });
  const complete = snippets.every((s) => answers[s.id]?.cls && answers[s.id]?.tier);

  return (
    <form onSubmit={(e) => { e.preventDefault(); d.submit(answers); }} className="space-y-3">
      <div className="rounded-xl border border-line bg-surface divide-y divide-line">
        {snippets.map((s, i) => (
          <div key={s.id} className="p-4 grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
            <p className="text-sm"><span className="text-muted mr-2">{i + 1}.</span>{s.text}</p>
            <select aria-label="Data class" value={answers[s.id]?.cls ?? ""} onChange={(e) => set(s.id, { cls: (e.target.value || null) as DataClass | null })} className="rounded-lg border border-line bg-background px-2 py-1.5 text-sm">
              <option value="">Data class…</option>
              {CLASSES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
            </select>
            <select aria-label="Tool tier" value={answers[s.id]?.tier ?? ""} onChange={(e) => set(s.id, { tier: (e.target.value || null) as ToolTier | null })} className="rounded-lg border border-line bg-background px-2 py-1.5 text-sm">
              <option value="">May go into…</option>
              {TIERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        ))}
      </div>
      {!complete && <p className="text-sm text-muted">Answer every snippet before submitting.</p>}
      {complete && <SubmitBar pending={d.pending} error={d.error} />}
    </form>
  );
}

// ---- Gate 4 -------------------------------------------------------------

export function Gate4Drill({ items }: { items: Omit<InboxItem, "plantedEvent">[] }) {
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const d = useDrill("g4");
  if (d.result) return <ResultPanel result={d.result} gateId="g4" onRetry={d.reset} />;
  const toggle = (id: string) => {
    const next = new Set(flagged);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFlagged(next);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); d.submit([...flagged]); }} className="space-y-3">
      <div className="rounded-xl border border-line bg-surface divide-y divide-line">
        {items.map((m) => (
          <label key={m.id} className={`p-4 flex gap-3 cursor-pointer ${flagged.has(m.id) ? "bg-warn-soft" : ""}`}>
            <input type="checkbox" checked={flagged.has(m.id)} onChange={() => toggle(m.id)} className="mt-1" />
            <span className="flex-1">
              <span className="text-xs text-muted">{m.source} · {m.from}</span>
              <span className="block font-medium text-sm">{m.subject}</span>
              <span className="block text-sm mt-0.5">{m.body}</span>
            </span>
            {flagged.has(m.id) && <span className="text-xs font-medium text-warn self-start">Hand to PV</span>}
          </label>
        ))}
      </div>
      <SubmitBar pending={d.pending} error={d.error} label={`Hand ${flagged.size} item(s) to PV`} />
    </form>
  );
}
