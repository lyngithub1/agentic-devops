import { Check } from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { PHASES, PHASE_STATUS_STYLE } from "@/lib/constants";
import type { PhaseId, PhaseStatus } from "@/types";
import { cn } from "@/lib/utils";

function scrollToLane(id: PhaseId) {
  const el = document.getElementById(`lane-${id}`);
  el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

interface NodeProps {
  index: number;
  id: PhaseId;
  name: string;
  tagline: string;
  color: string;
  icon: typeof PHASES[number]["icon"];
  status: PhaseStatus;
  isCurrent: boolean;
  connectorFilled: boolean;
  isFirst: boolean;
}

function PipelineNode({
  index,
  id,
  name,
  tagline,
  color,
  icon: Icon,
  status,
  isCurrent,
  connectorFilled,
  isFirst,
}: NodeProps) {
  const done = status === "complete";
  const active = status === "running" || status === "needs_human";
  const style = PHASE_STATUS_STYLE[status];

  return (
    <li className="flex min-w-0 flex-1 items-center">
      {!isFirst && (
        <div className="relative mx-1 h-0.5 flex-1 rounded-full bg-border sm:mx-2">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500",
              connectorFilled ? "w-full" : "w-0",
            )}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => scrollToLane(id)}
        className="group flex min-w-0 items-center gap-2.5 rounded-lg px-1.5 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${name} — ${style.label}`}
      >
        <span className="relative grid place-items-center">
          {active && (
            <span
              className="absolute h-9 w-9 rounded-full animate-pulse-ring"
              style={{ backgroundColor: color, opacity: 0.3 }}
            />
          )}
          <span
            className={cn(
              "relative grid h-9 w-9 place-items-center rounded-full border-2 transition-colors",
              done || active ? "text-white" : "bg-card text-muted-foreground",
            )}
            style={
              done || active
                ? { backgroundColor: color, borderColor: color }
                : { borderColor: "hsl(var(--border))" }
            }
          >
            {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
          </span>
        </span>
        <span className="hidden min-w-0 flex-col lg:flex">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="truncate">{name}</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {isCurrent ? style.label : tagline}
          </span>
        </span>
      </button>
    </li>
  );
}

export function PipelineRail() {
  const phases = usePipelineStore((s) => s.phases);
  const overall = usePipelineStore((s) => s.orchestrator.overallProgress);
  const currentPhase = usePipelineStore((s) => s.orchestrator.currentPhase);
  const finished = usePipelineStore((s) => s.finished);

  return (
    <div className="shrink-0 border-b bg-app-rail px-4 py-3 sm:px-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pipeline progress
          </span>
          {currentPhase && !finished && (
            <span className="text-xs text-muted-foreground">
              · currently in{" "}
              <span className="font-medium text-foreground capitalize">{currentPhase}</span>
            </span>
          )}
          {finished && (
            <span className="text-xs font-medium text-success">· complete</span>
          )}
        </div>
        <span className="text-sm font-semibold tabular-nums">{Math.round(overall)}%</span>
      </div>

      <ol className="flex items-center">
        {PHASES.map((p, i) => {
          const status = phases[p.id].status;
          const connectorFilled = PHASES[i - 1]
            ? phases[PHASES[i - 1].id].status === "complete"
            : false;
          return (
            <PipelineNode
              key={p.id}
              index={i}
              id={p.id}
              name={p.name}
              tagline={p.tagline}
              color={p.color}
              icon={p.icon}
              status={status}
              isCurrent={currentPhase === p.id}
              connectorFilled={connectorFilled}
              isFirst={i === 0}
            />
          );
        })}
      </ol>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-info transition-[width] duration-700 ease-out"
          style={{ width: `${overall}%` }}
        />
      </div>
    </div>
  );
}
