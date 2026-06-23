import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { MetricSeries } from "@/types";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/primitives/Sparkline";

interface MetricTileProps {
  metric: MetricSeries;
  className?: string;
}

/** Observability KPI tile: value, good/bad delta, and trend sparkline. */
export function MetricTile({ metric, className }: MetricTileProps) {
  const up = metric.deltaPct >= 0;
  const isGood =
    (metric.good === "up" && up) || (metric.good === "down" && !up);
  const tone = isGood ? "text-success" : "text-destructive";
  const Arrow = up ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={cn("rounded-lg border bg-card p-3 shadow-fluent", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">{metric.label}</span>
        <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", tone)}>
          <Arrow className="h-3 w-3" />
          {formatPct(metric.deltaPct)}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold tabular-nums">{metric.value}</span>
        <span className="text-xs text-muted-foreground">{metric.unit}</span>
      </div>
      <div className={cn("mt-2 h-8", tone)}>
        <Sparkline data={metric.series} width={160} height={32} className="w-full" />
      </div>
    </div>
  );
}
