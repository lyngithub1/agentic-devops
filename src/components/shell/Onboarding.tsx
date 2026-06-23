import { useState } from "react";
import { ArrowRight, Building2, Plus, Sparkles, Target } from "lucide-react";
import { BUSINESSES } from "@/data/businesses";
import { PHASES, ORCHESTRATOR } from "@/lib/constants";
import { usePipelineStore } from "@/store/pipelineStore";
import { CustomCompanyDialog } from "@/components/shell/CustomCompanyDialog";

export function Onboarding() {
  const selectBusiness = usePipelineStore((s) => s.selectBusiness);
  const Orchestrator = ORCHESTRATOR.icon;
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-fluent">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Multi-agent product pipeline · Magentic orchestration
          </span>
          <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            From product idea to go-to-market, run by agents
          </h1>
          <p className="mt-3 text-balance text-sm text-muted-foreground sm:text-base">
            Agentic DevOps coordinates five specialist agent teams — Ideate, Planner, Developer,
            Validator, and Operator — under a single orchestrator that keeps the big picture.
            Pick a business to generate ideas and watch the pipeline run end to end.
          </p>
        </div>

        {/* business picker */}
        <div className="mt-8">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Choose a business to begin
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {BUSINESSES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => selectBusiness(b)}
                className="group flex flex-col rounded-xl border bg-card p-4 text-left shadow-fluent transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-fluent-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-lg text-white"
                    style={{ backgroundColor: b.accent }}
                  >
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{b.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{b.industry}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{b.description}</p>
                <div className="mt-3 space-y-1">
                  {b.strategicGoals.slice(0, 2).map((g, i) => (
                    <p key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                      <Target className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      {g}
                    </p>
                  ))}
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Select & run
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>

          {/* tailor-to-your-company CTA */}
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Tailor the demo to your company</span>
              <span className="block text-xs text-muted-foreground">
                Use your own company name and industry — your brand is woven through every agent and artifact.
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <CustomCompanyDialog open={customOpen} onOpenChange={setCustomOpen} />

        {/* pipeline preview */}
        <div className="mt-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-foreground/90 text-background">
              <Orchestrator className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold">{ORCHESTRATOR.name}</p>
              <p className="text-[11px] text-muted-foreground">{ORCHESTRATOR.role}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PHASES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.id} className="rounded-xl border bg-card/60 p-3 shadow-fluent">
                  <div className="mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: p.color }} />
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-7 w-7 place-items-center rounded-md"
                      style={{ backgroundColor: `${p.color}1A`, color: p.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold">{p.name}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{p.description}</p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    {p.agents.length} sub-agents
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
