import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CircleDot,
  GitCommit,
  Minus,
  ShieldCheck,
  X,
} from "lucide-react";
import { LivePrControl } from "@/components/github/LivePrControl";
import type {
  AdrData,
  Artifact,
  BusinessCaseData,
  CodeData,
  CodeFile,
  CompetitiveData,
  DashboardData,
  DeploymentData,
  FeedbackData,
  GtmData,
  Idea,
  MarketBriefData,
  MockPrData,
  OptimizationData,
  QualityGateData,
  ScaffoldData,
  ScorecardData,
  TechPlanData,
  TestReportData,
  TriageData,
  UserStoryData,
} from "@/types";
import { formatCurrency, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ScoreBar } from "@/components/primitives/ScoreBar";
import { ScoreDonut } from "@/components/primitives/ScoreDonut";
import { RadarChart } from "@/components/primitives/RadarChart";
import { MetricTile } from "@/components/primitives/MetricTile";

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-foreground/90">{children}</p>;
}

function Bullets({ items, marker = "dot" }: { items: string[]; marker?: "dot" | "check" | "dash" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-sm leading-snug">
          {marker === "check" ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
          ) : marker === "dash" ? (
            <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <CircleDot className="mt-1 h-2.5 w-2.5 shrink-0 text-primary" />
          )}
          <span className="text-foreground/90">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <span
          key={i}
          className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
        >
          {it}
        </span>
      ))}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border bg-card p-2.5 text-center shadow-fluent">
      <div className={cn("text-base font-semibold tabular-nums", tone)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border bg-card p-3 shadow-fluent", className)}>{children}</div>;
}

function CodeBlock({ file }: { file: CodeFile }) {
  const lines = file.content.split("\n");
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/60 px-3 py-1.5">
        <span className="truncate font-mono text-[11px] font-medium">{file.path}</span>
        <span className="flex shrink-0 items-center gap-2 text-[11px] tabular-nums">
          <span className="text-success">+{file.additions}</span>
          <span className="text-destructive">−{file.deletions}</span>
        </span>
      </div>
      <pre className="scrollbar-thin overflow-x-auto p-3 font-mono text-[11px] leading-relaxed">
        <code>
          {lines.map((l, i) => (
            <div key={i} className="flex">
              <span className="mr-3 w-6 shrink-0 select-none text-right text-muted-foreground/40">
                {i + 1}
              </span>
              <span className="whitespace-pre text-foreground/90">{l || " "}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

const STATUS_DOT: Record<string, string> = {
  pass: "text-success",
  fail: "text-destructive",
  skip: "text-muted-foreground",
  warn: "text-warning",
  running: "text-info",
  pending: "text-muted-foreground",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "pass") return <Check className={cn("h-4 w-4", STATUS_DOT.pass)} />;
  if (status === "fail") return <X className={cn("h-4 w-4", STATUS_DOT.fail)} />;
  if (status === "warn") return <ShieldCheck className={cn("h-4 w-4", STATUS_DOT.warn)} />;
  return <Minus className={cn("h-4 w-4", STATUS_DOT[status] ?? "text-muted-foreground")} />;
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

function MarketBrief({ d }: { d: MarketBriefData }) {
  return (
    <div className="space-y-5">
      <Lead>{d.summary}</Lead>
      <Section title="Trends"><Bullets items={d.trends} /></Section>
      <div className="grid gap-5 sm:grid-cols-2">
        <Section title="Headwinds"><Bullets items={d.headwinds} marker="dash" /></Section>
        <Section title="Tailwinds"><Bullets items={d.tailwinds} marker="check" /></Section>
      </div>
      <Section title="Opportunities"><Bullets items={d.opportunities} /></Section>
      <Section title="Blue-sky concepts"><Chips items={d.blueSky} /></Section>
      <Section title="Sources">
        <div className="space-y-1.5">
          {d.sources.map((s, i) => (
            <Card key={i} className="flex items-center justify-between gap-3 p-2.5">
              <span className="text-xs font-medium">{s.name}</span>
              <span className="text-[11px] text-muted-foreground">{s.note}</span>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Competitive({ d }: { d: CompetitiveData }) {
  const max = Math.max(...d.competitors.map((c) => c.share), 1);
  return (
    <div className="space-y-5">
      <Lead>{d.positioning}</Lead>
      <Section title="Competitors">
        <div className="space-y-2">
          {d.competitors.map((c, i) => (
            <Card key={i} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">{c.focus}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.share / max) * 100}%` }} />
                </div>
                <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">{c.share}%</span>
              </div>
              <div className="grid gap-1 text-[11px] sm:grid-cols-2">
                <span className="text-success">+ {c.strength}</span>
                <span className="text-destructive">− {c.weakness}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="White space"><Bullets items={d.whiteSpace} marker="check" /></Section>
    </div>
  );
}

function IdeaRow({ idea, rank }: { idea: Idea; rank: number }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{idea.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{idea.summary}</p>
        </div>
        <ScoreDonut value={idea.scores.overall} size={56} stroke={6} />
      </div>
      <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        <ScoreBar label="Impact" value={idea.scores.impact} />
        <ScoreBar label="Feasibility" value={idea.scores.feasibility} />
        <ScoreBar label="Strategic fit" value={idea.scores.strategicFit} />
        <ScoreBar label="Risk (inv.)" value={idea.scores.risk} />
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        <span className="font-medium text-foreground">Why: </span>
        {idea.justification}
      </p>
      <Chips items={idea.tags} />
    </Card>
  );
}

function Scorecard({ d }: { d: ScorecardData }) {
  const top = [...d.ideas].sort((a, b) => a.rank - b.rank)[0];
  return (
    <div className="space-y-3">
      <Lead>{d.note}</Lead>
      {top && (
        <Card className="bg-muted/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Top recommendation
              </p>
              <p className="truncate text-sm font-semibold">{top.title}</p>
              <p className="text-[11px] text-muted-foreground">Impact score {top.impactScore}</p>
            </div>
            <ScoreDonut value={top.scores.overall} size={60} stroke={6} label="overall" />
          </div>
          <div className="mt-1 flex justify-center">
            <RadarChart scores={top.scores} size={236} />
          </div>
        </Card>
      )}
      {d.ideas.map((idea) => (
        <IdeaRow key={idea.id} idea={idea} rank={idea.rank} />
      ))}
    </div>
  );
}

function BusinessCase({ d }: { d: BusinessCaseData }) {
  const maxCost = Math.max(...d.costs.map((c) => c.amount), 1);
  return (
    <div className="space-y-5">
      <Section title="Problem"><Lead>{d.problem}</Lead></Section>
      <Section title="Solution"><Lead>{d.solution}</Lead></Section>
      <Section title="Addressable market"><Lead>{d.market}</Lead></Section>
      <Section title="Return on investment">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Investment" value={formatCurrency(d.roi.investment)} />
          <Stat label="Year 1" value={formatCurrency(d.roi.year1Return)} tone="text-success" />
          <Stat label="Year 3" value={formatCurrency(d.roi.year3Return)} tone="text-success" />
          <Stat label="Payback" value={`${d.roi.paybackMonths} mo`} />
        </div>
      </Section>
      <Section title="Cost breakdown">
        <div className="space-y-2">
          {d.costs.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-40 shrink-0 truncate text-xs">{c.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(c.amount / maxCost) * 100}%` }} />
              </div>
              <span className="w-12 text-right text-[11px] tabular-nums text-muted-foreground">
                {formatCurrency(c.amount)}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Timeline">
        <div className="flex flex-wrap gap-2">
          {d.timeline.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <Card className="px-3 py-1.5">
                <p className="text-xs font-medium">{t.phase}</p>
                <p className="text-[10px] text-muted-foreground">{t.duration}</p>
              </Card>
              {i < d.timeline.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </Section>
      <div className="grid gap-5 sm:grid-cols-2">
        <Section title="Risks"><Bullets items={d.risks} marker="dash" /></Section>
        <Section title="Strategy"><Bullets items={d.strategy} marker="check" /></Section>
      </div>
    </div>
  );
}

function Triage({ d }: { d: TriageData }) {
  return (
    <div className="space-y-5">
      <Section title="Selected to build">
        <Card className="border-success/40 bg-success/5">
          <div className="mb-1 flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span className="text-sm font-semibold">{d.chosen.title}</span>
          </div>
          <p className="text-xs text-foreground/90">{d.chosen.rationale}</p>
        </Card>
      </Section>
      <Section title="Not advanced (this cycle)">
        <div className="space-y-2">
          {d.notAdvanced.map((n, i) => (
            <Card key={i} className="flex items-start gap-2 p-2.5">
              <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">{n.reason}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function UserStory({ d }: { d: UserStoryData }) {
  return (
    <div className="space-y-5">
      <Card className="bg-muted/40">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-primary">{d.id}</span>
          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary">
            {d.storyPoints} pts
          </span>
        </div>
        <p className="text-sm leading-relaxed">
          <span className="text-muted-foreground">As a </span>
          <span className="font-medium">{d.asA}</span>
          <span className="text-muted-foreground">, I want </span>
          <span className="font-medium">{d.iWant}</span>
          <span className="text-muted-foreground">, so that </span>
          <span className="font-medium">{d.soThat}</span>.
        </p>
      </Card>
      <Section title="Acceptance criteria"><Bullets items={d.acceptance} marker="check" /></Section>
      <Section title="Non-functional requirements"><Bullets items={d.nfrs} /></Section>
      <Section title="Security & compliance"><Bullets items={d.security} marker="check" /></Section>
      <Section title="Definition of ready">
        <div className="space-y-1.5">
          {d.definitionOfReady.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {r.done ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={cn(r.done && "text-foreground/90")}>{r.label}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function TechPlan({ d }: { d: TechPlanData }) {
  return (
    <div className="space-y-4">
      <Lead>{d.summary}</Lead>
      <Section title="Tasks">
        <div className="space-y-2">
          {d.tasks.map((t) => (
            <Card key={t.id} className="flex items-start gap-3">
              <span className="font-mono text-[11px] font-semibold text-primary">{t.id}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{t.title}</p>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {t.estimate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Adr({ d }: { d: AdrData }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{d.title}</span>
        <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">
          {d.status}
        </span>
      </div>
      <Section title="Context"><Lead>{d.context}</Lead></Section>
      <Section title="Decisions">
        <div className="space-y-2">
          {d.decisions.map((dec, i) => (
            <Card key={i}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{dec.title}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-primary">{dec.choice}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{dec.rationale}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Azure services">
        <div className="grid gap-2 sm:grid-cols-2">
          {d.azureServices.map((s, i) => (
            <Card key={i} className="p-2.5">
              <p className="text-xs font-medium">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">{s.purpose}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Best practices applied"><Bullets items={d.bestPractices} marker="check" /></Section>
    </div>
  );
}

function Scaffold({ d }: { d: ScaffoldData }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary">
          {d.framework}
        </span>
      </div>
      <Lead>{d.note}</Lead>
      <Section title="Project structure">
        <div className="overflow-hidden rounded-lg border bg-muted/40 p-3 font-mono text-[11px]">
          {d.tree.map((node, i) => {
            const depth = (node.path.match(/\//g) || []).length;
            return (
              <div key={i} className="flex items-center gap-2 py-0.5" style={{ paddingLeft: depth * 14 }}>
                <span className={node.kind === "dir" ? "text-primary" : "text-foreground/80"}>
                  {node.kind === "dir" ? "📁" : "📄"} {node.path.split("/").filter(Boolean).pop()}
                </span>
                {node.note && <span className="text-muted-foreground">— {node.note}</span>}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Code({ d }: { d: CodeData }) {
  return (
    <div className="space-y-3">
      <Lead>{d.summary}</Lead>
      {d.files.map((f, i) => (
        <CodeBlock key={i} file={f} />
      ))}
    </div>
  );
}

function TestReport({ d }: { d: TestReportData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Passed" value={String(d.passed)} tone="text-success" />
        <Stat label="Failed" value={String(d.failed)} tone={d.failed ? "text-destructive" : undefined} />
        <Stat label="Skipped" value={String(d.skipped)} />
        <Stat label="Coverage" value={`${d.coverage}%`} tone="text-primary" />
      </div>
      {d.suites.map((suite, i) => (
        <Section key={i} title={suite.name}>
          <div className="space-y-1">
            {suite.tests.map((t, j) => (
              <div key={j} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5">
                <StatusIcon status={t.status} />
                <span className="min-w-0 flex-1 truncate text-xs">{t.name}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {t.durationMs ? `${t.durationMs}ms` : "—"}
                </span>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function QualityGate({ d }: { d: QualityGateData }) {
  return (
    <div className="space-y-2">
      {d.gates.map((g, i) => (
        <Card key={i} className="flex items-center gap-3">
          <StatusIcon status={g.status} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{g.name}</p>
            <p className="text-[11px] text-muted-foreground">{g.detail}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MockPr({ d }: { d: MockPrData }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{d.repo}</span>
          <span className="rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-medium text-success">
            #{d.number} open
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold">{d.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="font-mono">{d.branch}</span>
          <span>by {d.author}</span>
          <span>{d.filesChanged} files</span>
          <span className="text-success">+{d.additions}</span>
          <span className="text-destructive">−{d.deletions}</span>
        </div>
      </Card>
      <Section title="Commits">
        <div className="space-y-1">
          {d.commits.map((c, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5">
              <GitCommit className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-mono text-[10px] text-primary">{c.sha}</span>
              <span className="min-w-0 flex-1 truncate text-xs">{c.message}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Checks">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {d.checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5">
              <StatusIcon status={c.status} />
              <span className="text-xs">{c.name}</span>
            </div>
          ))}
        </div>
      </Section>
      <LivePrControl />
    </div>
  );
}

const DEPLOY_TONE: Record<string, string> = {
  healthy: "bg-success/12 text-success",
  deploying: "bg-info/15 text-info",
  degraded: "bg-warning/15 text-warning-foreground",
};

function Deployment({ d }: { d: DeploymentData }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{d.environment}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", DEPLOY_TONE[d.status])}>
            {d.status}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3">
          <div><span className="text-muted-foreground">Version </span><span className="font-mono">{d.version}</span></div>
          <div><span className="text-muted-foreground">Region </span>{d.region}</div>
          <div className="truncate"><span className="text-muted-foreground">URL </span><span className="font-mono text-primary">{d.url}</span></div>
        </div>
      </Card>
      <Section title="Release steps">
        <div className="space-y-1">
          {d.steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5">
              <StatusIcon status={s.status} />
              <span className="text-xs">{s.name}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Dashboard({ d }: { d: DashboardData }) {
  return (
    <div className="space-y-5">
      <Section title="Live metrics">
        <div className="grid gap-2 sm:grid-cols-2">
          {d.metrics.map((m, i) => (
            <MetricTile key={i} metric={m} />
          ))}
        </div>
      </Section>
      <Section title="Service-level objectives">
        <div className="space-y-2">
          {d.slos.map((s, i) => (
            <Card key={i} className="flex items-center gap-3 p-2.5">
              <Check className="h-4 w-4 shrink-0 text-success" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{s.name}</span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                target {s.target}
                {s.unit} · now <span className="font-semibold text-foreground">{s.current}{s.unit}</span>
              </span>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

const SEVERITY_TONE: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/15 text-warning-foreground",
  high: "bg-destructive/10 text-destructive",
};

function Optimization({ d }: { d: OptimizationData }) {
  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3 bg-primary/5">
        <ScoreDonut value={d.estimatedGainPct} size={56} stroke={6} label="gain" />
        <div className="min-w-0 flex-1">
          <Lead>{d.summary}</Lead>
        </div>
      </Card>
      <Section title="Findings">
        <div className="space-y-2">
          {d.findings.map((f, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{f.title}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", SEVERITY_TONE[f.severity])}>
                  {f.severity}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{f.detail}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Recommendation">
        <Card className="border-primary/30 bg-primary/5">
          <p className="text-xs text-foreground/90">{d.recommendation}</p>
          {d.requestChanges && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <ArrowRight className="h-3.5 w-3.5" /> Change request routed back to the Developer agent.
            </p>
          )}
        </Card>
      </Section>
    </div>
  );
}

function Gtm({ d }: { d: GtmData }) {
  return (
    <div className="space-y-5">
      <Lead>{d.summary}</Lead>
      <Section title="Target segments">
        <div className="grid gap-2 sm:grid-cols-3">
          {d.segments.map((s, i) => (
            <Card key={i} className="p-2.5">
              <p className="text-xs font-semibold">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">{s.note}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Messaging"><Bullets items={d.messaging} /></Section>
      <Section title="Channels">
        <div className="grid gap-2 sm:grid-cols-3">
          {d.channels.map((c, i) => (
            <Card key={i} className="p-2.5">
              <p className="text-xs font-semibold">{c.name}</p>
              <p className="text-[11px] text-muted-foreground">{c.note}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="KPIs">
        <div className="grid gap-2 sm:grid-cols-2">
          {d.kpis.map((k, i) => (
            <Card key={i} className="flex items-center justify-between gap-2 p-2.5">
              <span className="text-xs">{k.label}</span>
              <span className="text-xs font-semibold text-primary">{k.target}</span>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Launch plan">
        <div className="space-y-1.5">
          {d.launchSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border bg-card px-2.5 py-1.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs">{s.name}</span>
              <span className="text-[10px] text-muted-foreground">{s.when}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

const SENTIMENT_TONE: Record<string, string> = {
  positive: "border-success/30 bg-success/5",
  neutral: "border-border bg-card",
  negative: "border-destructive/30 bg-destructive/5",
};

function Feedback({ d }: { d: FeedbackData }) {
  return (
    <div className="space-y-4">
      <Lead>{d.summary}</Lead>
      <div className="space-y-2">
        {d.items.map((it, i) => (
          <Card key={i} className={cn("space-y-1", SENTIMENT_TONE[it.sentiment])}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold">{it.source}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {it.persona}
              </span>
            </div>
            <p className="text-xs text-foreground/90">“{it.text}”</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function ArtifactBody({ artifact }: { artifact: Artifact }) {
  switch (artifact.type) {
    case "market_brief":
      return <MarketBrief d={artifact.data} />;
    case "competitive":
      return <Competitive d={artifact.data} />;
    case "scorecard":
      return <Scorecard d={artifact.data} />;
    case "business_case":
      return <BusinessCase d={artifact.data} />;
    case "triage":
      return <Triage d={artifact.data} />;
    case "user_story":
      return <UserStory d={artifact.data} />;
    case "tech_plan":
      return <TechPlan d={artifact.data} />;
    case "adr":
      return <Adr d={artifact.data} />;
    case "scaffold":
      return <Scaffold d={artifact.data} />;
    case "code":
      return <Code d={artifact.data} />;
    case "test_report":
      return <TestReport d={artifact.data} />;
    case "quality_gate":
      return <QualityGate d={artifact.data} />;
    case "mock_pr":
      return <MockPr d={artifact.data} />;
    case "deployment":
      return <Deployment d={artifact.data} />;
    case "dashboard":
      return <Dashboard d={artifact.data} />;
    case "optimization":
      return <Optimization d={artifact.data} />;
    case "gtm_plan":
      return <Gtm d={artifact.data} />;
    case "feedback":
      return <Feedback d={artifact.data} />;
    default:
      return null;
  }
}
