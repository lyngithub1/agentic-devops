import type { PhaseMeta } from "@/lib/constants";
import { PHASE_STATUS_STYLE } from "@/lib/constants";
import type { PhaseStatus } from "@/types";
import { StatusPill } from "@/components/primitives/StatusPill";

interface LaneHeaderProps {
  meta: PhaseMeta;
  status: PhaseStatus;
  progress: number;
  artifactCount: number;
}

export function LaneHeader({ meta, status, progress, artifactCount }: LaneHeaderProps) {
  const style = PHASE_STATUS_STYLE[status];
  const Icon = meta.icon;

  return (
    <div className="relative overflow-hidden rounded-t-xl border-b bg-card/60 p-3">
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: meta.color }} />
      <div className="flex items-center gap-2.5 pt-1">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold">{meta.name}</h2>
            <span className="text-[10px] font-medium text-muted-foreground">
              {String(meta.index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">{meta.tagline}</p>
        </div>
        <StatusPill style={style} pulse={status === "running" || status === "needs_human"} />
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: meta.color }}
          />
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {artifactCount} {artifactCount === 1 ? "artifact" : "artifacts"}
        </span>
      </div>
    </div>
  );
}
