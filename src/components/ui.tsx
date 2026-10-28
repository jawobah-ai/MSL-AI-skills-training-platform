import type { BuildStatus, DrillStatus } from "@/lib/progress";

type Tone = "good" | "warn" | "bad" | "neutral" | "accent";

const tones: Record<Tone, string> = {
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  neutral: "bg-background text-muted border border-line",
  accent: "bg-accent-soft text-accent",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export const drillBadge: Record<DrillStatus, [Tone, string]> = {
  reference: ["neutral", "Reference set"],
  "not-started": ["neutral", "Drill not started"],
  failed: ["bad", "Drill not passed"],
  passed: ["good", "Drill passed"],
};

export const buildBadge: Record<BuildStatus, [Tone, string]> = {
  "not-submitted": ["neutral", "Build not submitted"],
  pending: ["warn", "Build awaiting grading"],
  "failed-can-resubmit": ["bad", "Build not passed · one resubmission open"],
  "failed-final": ["bad", "Build not passed · contact your program lead"],
  passed: ["good", "Build passed"],
};

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface p-5 ${className}`}>{children}</div>;
}
