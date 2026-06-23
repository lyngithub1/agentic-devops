import { clamp, scoreTone } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<string, string> = {
  success: "text-success",
  primary: "text-primary",
  warning: "text-warning",
  destructive: "text-destructive",
};

interface ScoreDonutProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}

/** Circular score gauge. Ring color follows the score tone. */
export function ScoreDonut({ value, size = 76, stroke = 7, className, label }: ScoreDonutProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp(value) / 100;
  const dash = circumference * pct;
  const tone = TONE_TEXT[scoreTone(value)] ?? "text-primary";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Score ${Math.round(value)}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn("transition-[stroke-dasharray] duration-700 ease-out", tone)}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold leading-none tabular-nums">{Math.round(value)}</span>
        {label && <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
