import { clamp, scoreTone } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONE_BG: Record<string, string> = {
  success: "bg-success",
  primary: "bg-primary",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
}

/** Labeled horizontal score meter, colored by score tone. */
export function ScoreBar({ label, value, max = 100, className, showValue = true }: ScoreBarProps) {
  const pct = clamp((value / max) * 100);
  const tone = TONE_BG[scoreTone(value)] ?? "bg-primary";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {showValue && <span className="text-xs font-semibold tabular-nums">{Math.round(value)}</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
