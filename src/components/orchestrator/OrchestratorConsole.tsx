import { useEffect, useRef, useState } from "react";
import { ChevronDown, ListChecks, MessageSquare, Radio, Sparkles } from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { ORCHESTRATOR } from "@/lib/constants";
import type { OrchestratorStatus, PhaseId } from "@/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type TabKey = "reasoning" | "ledger" | "messages" | "progress";

const STATUS_LABEL: Record<OrchestratorStatus, string> = {
  idle: "Idle",
  planning: "Planning",
  coordinating: "Coordinating",
  complete: "Complete",
};

const STATUS_TONE: Record<OrchestratorStatus, string> = {
  idle: "bg-white/10 text-white/70",
  planning: "bg-info/30 text-white",
  coordinating: "bg-primary/40 text-white",
  complete: "bg-success/40 text-white",
};

export function OrchestratorConsole() {
  const orch = usePipelineStore((s) => s.orchestrator);
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<TabKey>("reasoning");

  const Icon = ORCHESTRATOR.icon;
  const active = orch.status === "planning" || orch.status === "coordinating";

  const tabs: { key: TabKey; label: string; icon: typeof Icon; count: number }[] = [
    { key: "reasoning", label: "Reasoning", icon: Sparkles, count: orch.reasoning.length },
    { key: "ledger", label: "Task ledger", icon: ListChecks, count: orch.taskLedger.plan.length },
    { key: "messages", label: "Messages", icon: MessageSquare, count: orch.messages.length },
    { key: "progress", label: "Progress", icon: Radio, count: orch.progress.length },
  ];

  return (
    <div className="z-20 shrink-0 border-t bg-app-console text-app-console-foreground">
      {/* header bar */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
      >
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">
          {active && (
            <span className="absolute h-8 w-8 rounded-lg bg-white/20 animate-pulse-ring" />
          )}
          <Icon className="relative h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {ORCHESTRATOR.name}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                STATUS_TONE[orch.status],
              )}
            >
              {STATUS_LABEL[orch.status]}
            </span>
          </div>
          <p className="hidden truncate text-[11px] text-white/60 sm:block">
            {ORCHESTRATOR.role}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-info to-primary transition-[width] duration-700"
                style={{ width: `${orch.overallProgress}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-white/80">
              {Math.round(orch.overallProgress)}%
            </span>
          </div>
          <ChevronDown
            className={cn("h-4 w-4 text-white/70 transition-transform", open && "rotate-180")}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10">
          {/* tabs */}
          <div className="flex items-center gap-1 px-3 pt-2">
            {tabs.map((t) => {
              const TabIcon = t.icon;
              const activeTab = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors",
                    activeTab
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:text-white/80",
                  )}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {t.label}
                  {t.count > 0 && (
                    <span className="rounded-full bg-white/15 px-1.5 text-[10px] tabular-nums">
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="scrollbar-thin h-[180px] overflow-y-auto bg-black/15 px-4 py-3 text-[12px] leading-relaxed">
            {tab === "reasoning" && <ReasoningView reasoning={orch.reasoning} />}
            {tab === "ledger" && <LedgerView ledger={orch.taskLedger} />}
            {tab === "messages" && <MessagesView messages={orch.messages} />}
            {tab === "progress" && <ProgressView progress={orch.progress} />}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-white/40">{text}</p>;
}

function useAutoScroll(dep: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollIntoView({ block: "end" });
  }, [dep]);
  return ref;
}

function ReasoningView({ reasoning }: { reasoning: { id: string; ts: number; text: string }[] }) {
  const anchor = useAutoScroll(reasoning.length);
  if (!reasoning.length) return <EmptyHint text="The orchestrator's chain-of-thought will stream here once the run starts." />;
  return (
    <div className="space-y-1.5 font-mono">
      {reasoning.map((r) => (
        <div key={r.id} className="flex gap-2 animate-fade-in-up">
          <span className="shrink-0 text-white/35">{formatTime(r.ts)}</span>
          <span className="text-white/85">{r.text}</span>
        </div>
      ))}
      <div ref={anchor} />
    </div>
  );
}

function LedgerColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">{title}</p>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i} className="flex gap-1.5 text-white/80">
              <span className="text-white/35">›</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/35">—</p>
      )}
    </div>
  );
}

function LedgerView({
  ledger,
}: {
  ledger: { facts: string[]; assumptions: string[]; plan: string[]; phaseGoals: Partial<Record<PhaseId, string>> };
}) {
  const goals = Object.entries(ledger.phaseGoals);
  const empty =
    !ledger.facts.length && !ledger.assumptions.length && !ledger.plan.length && !goals.length;
  if (empty) return <EmptyHint text="The Magentic task ledger (facts, assumptions, plan) populates during planning." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <LedgerColumn title="Facts" items={ledger.facts} />
      <LedgerColumn title="Assumptions" items={ledger.assumptions} />
      <LedgerColumn title="Plan" items={ledger.plan} />
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
          Phase goals
        </p>
        {goals.length ? (
          <ul className="space-y-1">
            {goals.map(([phase, goal]) => (
              <li key={phase} className="text-white/80">
                <span className="font-medium capitalize text-white">{phase}: </span>
                {goal}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white/35">—</p>
        )}
      </div>
    </div>
  );
}

function MessagesView({
  messages,
}: {
  messages: { id: string; ts: number; from: string; to: string; text: string }[];
}) {
  const anchor = useAutoScroll(messages.length);
  if (!messages.length) return <EmptyHint text="Agent-to-orchestrator messages will appear here." />;
  return (
    <div className="space-y-1.5">
      {messages.map((m) => (
        <div key={m.id} className="flex gap-2 animate-fade-in-up">
          <span className="shrink-0 text-white/35">{formatTime(m.ts)}</span>
          <span className="shrink-0 font-medium text-info">
            {m.from} <span className="text-white/40">→</span> {m.to}
          </span>
          <span className="text-white/80">{m.text}</span>
        </div>
      ))}
      <div ref={anchor} />
    </div>
  );
}

function ProgressView({
  progress,
}: {
  progress: { id: string; ts: number; phase: PhaseId | "orchestrator"; speaker: string; instruction: string; complete: boolean }[];
}) {
  const anchor = useAutoScroll(progress.length);
  if (!progress.length) return <EmptyHint text="The orchestrator's progress ledger (next-speaker decisions) streams here." />;
  return (
    <div className="space-y-1.5">
      {progress.map((p) => (
        <div key={p.id} className="flex items-start gap-2 animate-fade-in-up">
          <span
            className={cn(
              "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
              p.complete ? "bg-success" : "bg-info",
            )}
          />
          <span className="shrink-0 font-medium capitalize text-white/90">{p.phase}</span>
          <span className="text-white/75">{p.instruction}</span>
        </div>
      ))}
      <div ref={anchor} />
    </div>
  );
}
