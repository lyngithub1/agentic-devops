import type { PhaseId } from "@/types";
import { Sparkles } from "lucide-react";
import { PHASE_MAP } from "@/lib/constants";
import { usePipelineStore } from "@/store/pipelineStore";
import { cn } from "@/lib/utils";
import { LaneHeader } from "@/components/lane/LaneHeader";
import { SubAgentList } from "@/components/lane/SubAgentList";
import { ActivityStream } from "@/components/lane/ActivityStream";
import { ArtifactCard } from "@/components/lane/ArtifactCard";
import { HumanGateBanner } from "@/components/lane/HumanGateBanner";

interface PhaseLaneProps {
  id: PhaseId;
}

export function PhaseLane({ id }: PhaseLaneProps) {
  const phase = usePipelineStore((s) => s.phases[id]);
  const meta = PHASE_MAP[id];
  const dimmed = phase.status === "idle";

  return (
    <section
      id={`lane-${id}`}
      className={cn(
        "flex min-h-0 min-w-[290px] flex-1 flex-col rounded-xl border bg-app-shell/40 shadow-fluent transition-opacity",
        dimmed && "opacity-70",
      )}
    >
      <LaneHeader
        meta={meta}
        status={phase.status}
        progress={phase.progress}
        artifactCount={phase.artifacts.length}
      />

      <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <ValueBubble color={meta.color} value={meta.value} />

        <SubAgentList meta={meta} subAgents={phase.subAgents} />

        {phase.gate && phase.gate.status === "pending" && (
          <HumanGateBanner phase={id} gate={phase.gate} />
        )}

        {phase.artifacts.length > 0 && (
          <div className="space-y-1.5">
            <p className="px-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Artifacts
            </p>
            <div className="space-y-1.5">
              {phase.artifacts.map((a) => (
                <ArtifactCard key={a.id} artifact={a} accent={meta.color} />
              ))}
            </div>
          </div>
        )}

        <ActivityStream activity={phase.activity} />
      </div>
    </section>
  );
}

/**
 * A compact, themed "thought bubble" that frames the value each phase brings to
 * the overall pipeline — shown just above the sub-agent roster.
 */
function ValueBubble({ color, value }: { color: string; value: string }) {
  return (
    <div className="relative">
      <div
        className="rounded-2xl border p-2.5"
        style={{ backgroundColor: `${color}0D`, borderColor: `${color}2E` }}
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: `${color}24`, color }}
          >
            <Sparkles className="h-3 w-3" />
          </span>
          <div className="min-w-0">
            <p
              className="text-[9px] font-semibold uppercase tracking-wide"
              style={{ color }}
            >
              Why this matters
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-foreground/80">{value}</p>
          </div>
        </div>
      </div>
      {/* thought-bubble tail pointing toward the sub-agents below */}
      <span
        className="absolute -bottom-1 left-6 h-2.5 w-2.5 rotate-45 rounded-[2px] border-b border-r"
        style={{ backgroundColor: `${color}0D`, borderColor: `${color}2E` }}
        aria-hidden
      />
    </div>
  );
}
