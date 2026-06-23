let _seq = 0;

/** Monotonic-ish unique id for events/artifacts. */
export function uid(prefix = "id"): string {
  _seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatPct(value: number, digits = 0): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** Map a 0-100 score to a semantic color token name. */
export function scoreTone(score: number): "success" | "primary" | "warning" | "destructive" {
  if (score >= 80) return "success";
  if (score >= 65) return "primary";
  if (score >= 50) return "warning";
  return "destructive";
}

export const SCORE_DIMENSIONS: { key: keyof import("@/types").ScoreBreakdown; label: string }[] = [
  { key: "impact", label: "Impact" },
  { key: "feasibility", label: "Feasibility" },
  { key: "cost", label: "Cost" },
  { key: "risk", label: "Risk" },
  { key: "strategicFit", label: "Strategic fit" },
  { key: "timeToMarket", label: "Time-to-market" },
];
