import { Check, Loader2 } from "lucide-react";
import type { PhaseMeta } from "@/lib/constants";
import { IQ_LANES, SUBAGENT_STATUS_STYLE } from "@/lib/constants";
import type { SubAgent } from "@/types";
import { cn } from "@/lib/utils";

interface SubAgentListProps {
  meta: PhaseMeta;
  subAgents: SubAgent[];
}

export function SubAgentList({ meta, subAgents }: SubAgentListProps) {
  return (
    <div className="space-y-1">
      <p className="px-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Sub-agents
      </p>
      <ul className="space-y-1">
        {subAgents.map((agent) => {
          const metaAgent = meta.agents.find((a) => a.id === agent.id);
          const Icon = metaAgent?.icon;
          const iq = metaAgent ? IQ_LANES[metaAgent.iq] : undefined;
          const style = SUBAGENT_STATUS_STYLE[agent.status];
          const working = agent.status === "working";
          const done = agent.status === "done";

          return (
            <li
              key={agent.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors",
                working
                  ? "border-primary/30 bg-primary/5"
                  : done
                    ? "border-success/25 bg-success/5"
                    : "border-transparent bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-md",
                  working
                    ? "bg-primary/12 text-primary"
                    : done
                      ? "bg-success/12 text-success"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-xs font-medium">{agent.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{agent.role}</p>
              </div>
              {iq ? (
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold leading-none"
                  style={{ backgroundColor: `${iq.color}1A`, color: iq.color }}
                  title={iq.description}
                >
                  {iq.label}
                </span>
              ) : null}
              {working ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : done ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
