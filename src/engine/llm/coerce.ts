// Validation + coercion for LLM output. Every field falls back to the
// (rebranded) template value, so a flaky completion can never produce an
// invalid RunContent — at worst a stage silently reuses template content.

import type {
  AdrData,
  BusinessCaseData,
  CodeData,
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
  ScoreBreakdown,
  TechPlanData,
  TestReportData,
  TriageData,
  UserStoryData,
} from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** string or fallback */
function S(v: any, fb: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fb;
}

/** finite number or fallback */
function N(v: any, fb: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fb;
}

/** boolean or fallback */
function B(v: any, fb: boolean): boolean {
  return typeof v === "boolean" ? v : fb;
}

/** array of strings (trimmed, non-empty); falls back when empty/invalid */
function SA(v: any, fb: string[]): string[] {
  if (!Array.isArray(v)) return fb;
  const out = v.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim());
  return out.length ? out : fb;
}

function oneOf<T extends string>(v: any, allowed: readonly T[], fb: T): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fb;
}

/** map an LLM array through a coercer; fall back to `fb` when missing/empty */
function mapArr<T>(v: any, fb: T[], coerce: (item: any, i: number) => T): T[] {
  if (!Array.isArray(v) || v.length === 0) return fb;
  return v.map((item, i) => coerce(item ?? {}, i));
}

// ---------------------------------------------------------------------------

function coerceScores(raw: any, fb: ScoreBreakdown): ScoreBreakdown {
  const impact = clamp(N(raw?.impact, fb.impact), 0, 100);
  const feasibility = clamp(N(raw?.feasibility, fb.feasibility), 0, 100);
  const cost = clamp(N(raw?.cost, fb.cost), 0, 100);
  const risk = clamp(N(raw?.risk, fb.risk), 0, 100);
  const strategicFit = clamp(N(raw?.strategicFit, fb.strategicFit), 0, 100);
  const timeToMarket = clamp(N(raw?.timeToMarket, fb.timeToMarket), 0, 100);
  const overallRaw = raw?.overall;
  const overall = Number.isFinite(Number(overallRaw))
    ? clamp(N(overallRaw, fb.overall), 0, 100)
    : Math.round((impact + feasibility + cost + risk + strategicFit + timeToMarket) / 6);
  return { impact, feasibility, cost, risk, strategicFit, timeToMarket, overall };
}

function coerceIdea(raw: any, i: number, fb: Idea): Idea {
  return {
    id: `i${i + 1}`,
    rank: i + 1,
    title: S(raw?.title, fb.title),
    summary: S(raw?.summary, fb.summary),
    scores: coerceScores(raw?.scores, fb.scores),
    impactScore: clamp(N(raw?.impactScore, fb.impactScore), 0, 100),
    justification: S(raw?.justification, fb.justification),
    costBenefit: S(raw?.costBenefit, fb.costBenefit),
    riskNotes: S(raw?.riskNotes, fb.riskNotes),
    competitiveNotes: S(raw?.competitiveNotes, fb.competitiveNotes),
    tags: SA(raw?.tags, fb.tags).slice(0, 5),
  };
}

/** Build exactly 5 ranked ideas; returns ideas + the chosen id (rank 1). */
export function coerceIdeas(raw: any, fb: Idea[]): { ideas: Idea[]; chosenIdeaId: string } {
  const list: any[] = Array.isArray(raw) ? raw.slice(0, 5) : [];
  // pad to 5 from the fallback set if the model under-delivered
  while (list.length < 5) list.push(fb[list.length % fb.length] ?? fb[0]);
  // coerce with a template idea as the per-item fallback
  const coerced = list.map((item, i) => coerceIdea(item, i, fb[i % fb.length] ?? fb[0]));
  // rank by overall score, then renumber ids/ranks deterministically
  coerced.sort((a, b) => b.scores.overall - a.scores.overall);
  const ideas = coerced.map((idea, i) => ({ ...idea, id: `i${i + 1}`, rank: i + 1 }));
  return { ideas, chosenIdeaId: ideas[0].id };
}

export function coerceMarketBrief(raw: any, fb: MarketBriefData): MarketBriefData {
  return {
    summary: S(raw?.summary, fb.summary),
    trends: SA(raw?.trends, fb.trends),
    headwinds: SA(raw?.headwinds, fb.headwinds),
    tailwinds: SA(raw?.tailwinds, fb.tailwinds),
    opportunities: SA(raw?.opportunities, fb.opportunities),
    blueSky: SA(raw?.blueSky, fb.blueSky),
    sources: mapArr(raw?.sources, fb.sources, (s, i) => ({
      name: S(s?.name, fb.sources[i % fb.sources.length]?.name ?? "Industry source"),
      note: S(s?.note, fb.sources[i % fb.sources.length]?.note ?? ""),
    })),
  };
}

export function coerceCompetitive(raw: any, fb: CompetitiveData): CompetitiveData {
  return {
    positioning: S(raw?.positioning, fb.positioning),
    competitors: mapArr(raw?.competitors, fb.competitors, (c, i) => {
      const f = fb.competitors[i % fb.competitors.length];
      return {
        name: S(c?.name, f?.name ?? "Competitor"),
        focus: S(c?.focus, f?.focus ?? ""),
        strength: S(c?.strength, f?.strength ?? ""),
        weakness: S(c?.weakness, f?.weakness ?? ""),
        share: clamp(N(c?.share, f?.share ?? 10), 0, 100),
      };
    }),
    whiteSpace: SA(raw?.whiteSpace, fb.whiteSpace),
  };
}

export function coerceTriage(raw: any, fb: TriageData, chosen: Idea, others: Idea[]): TriageData {
  return {
    chosen: {
      ideaId: chosen.id,
      title: chosen.title,
      rationale: S(raw?.chosen?.rationale, chosen.justification || fb.chosen.rationale),
    },
    notAdvanced: others.map((idea, i) => ({
      title: idea.title,
      reason: S(
        Array.isArray(raw?.notAdvanced) ? raw.notAdvanced[i]?.reason : undefined,
        "Strong concept; sequenced behind the top pick for this cycle.",
      ),
    })),
  };
}

export function coerceBusinessCase(raw: any, fb: BusinessCaseData): BusinessCaseData {
  const roi = raw?.roi ?? {};
  return {
    problem: S(raw?.problem, fb.problem),
    solution: S(raw?.solution, fb.solution),
    market: S(raw?.market, fb.market),
    roi: {
      investment: N(roi.investment, fb.roi.investment),
      year1Return: N(roi.year1Return, fb.roi.year1Return),
      year3Return: N(roi.year3Return, fb.roi.year3Return),
      paybackMonths: N(roi.paybackMonths, fb.roi.paybackMonths),
    },
    costs: mapArr(raw?.costs, fb.costs, (c, i) => ({
      label: S(c?.label, fb.costs[i % fb.costs.length]?.label ?? "Cost"),
      amount: N(c?.amount, fb.costs[i % fb.costs.length]?.amount ?? 0),
    })),
    timeline: mapArr(raw?.timeline, fb.timeline, (t, i) => ({
      phase: S(t?.phase, fb.timeline[i % fb.timeline.length]?.phase ?? "Phase"),
      duration: S(t?.duration, fb.timeline[i % fb.timeline.length]?.duration ?? "4 weeks"),
    })),
    risks: SA(raw?.risks, fb.risks),
    strategy: SA(raw?.strategy, fb.strategy),
  };
}

export function coerceUserStory(raw: any, fb: UserStoryData): UserStoryData {
  return {
    id: S(raw?.id, fb.id),
    asA: S(raw?.asA, fb.asA),
    iWant: S(raw?.iWant, fb.iWant),
    soThat: S(raw?.soThat, fb.soThat),
    acceptance: SA(raw?.acceptance, fb.acceptance),
    nfrs: SA(raw?.nfrs, fb.nfrs),
    security: SA(raw?.security, fb.security),
    definitionOfReady: mapArr(raw?.definitionOfReady, fb.definitionOfReady, (d, i) => ({
      label: S(d?.label, fb.definitionOfReady[i % fb.definitionOfReady.length]?.label ?? "Ready"),
      done: B(d?.done, true),
    })),
    storyPoints: clamp(N(raw?.storyPoints, fb.storyPoints), 1, 100),
  };
}

export function coerceTechPlan(raw: any, fb: TechPlanData): TechPlanData {
  return {
    summary: S(raw?.summary, fb.summary),
    tasks: mapArr(raw?.tasks, fb.tasks, (t, i) => {
      const f = fb.tasks[i % fb.tasks.length];
      return {
        id: S(t?.id, f?.id ?? `T${i + 1}`),
        title: S(t?.title, f?.title ?? "Task"),
        detail: S(t?.detail, f?.detail ?? ""),
        estimate: S(t?.estimate, f?.estimate ?? "1d"),
      };
    }),
  };
}

export function coerceAdr(raw: any, fb: AdrData): AdrData {
  return {
    title: S(raw?.title, fb.title),
    status: S(raw?.status, fb.status),
    context: S(raw?.context, fb.context),
    decisions: mapArr(raw?.decisions, fb.decisions, (d, i) => {
      const f = fb.decisions[i % fb.decisions.length];
      return {
        title: S(d?.title, f?.title ?? "Decision"),
        choice: S(d?.choice, f?.choice ?? ""),
        rationale: S(d?.rationale, f?.rationale ?? ""),
      };
    }),
    azureServices: mapArr(raw?.azureServices, fb.azureServices, (a, i) => {
      const f = fb.azureServices[i % fb.azureServices.length];
      return {
        name: S(a?.name, f?.name ?? "Azure service"),
        purpose: S(a?.purpose, f?.purpose ?? ""),
      };
    }),
    bestPractices: SA(raw?.bestPractices, fb.bestPractices),
  };
}

export function coerceScaffold(raw: any, fb: ScaffoldData): ScaffoldData {
  return {
    framework: S(raw?.framework, fb.framework),
    note: S(raw?.note, fb.note),
    tree: mapArr(raw?.tree, fb.tree, (t, i) => {
      const f = fb.tree[i % fb.tree.length];
      return {
        path: S(t?.path, f?.path ?? "src/file.ts"),
        kind: oneOf(t?.kind, ["dir", "file"] as const, f?.kind ?? "file"),
        note: t?.note ? S(t.note, "") : f?.note,
      };
    }),
  };
}

export function coerceCode(raw: any, fb: CodeData): CodeData {
  return {
    summary: S(raw?.summary, fb.summary),
    files: mapArr(raw?.files, fb.files, (f, i) => {
      const ff = fb.files[i % fb.files.length];
      const content = S(f?.content, ff?.content ?? "");
      const additions = N(f?.additions, content.split("\n").length);
      return {
        path: S(f?.path, ff?.path ?? `src/file${i + 1}.ts`),
        language: S(f?.language, ff?.language ?? "typescript"),
        content,
        additions: clamp(additions, 0, 100000),
        deletions: clamp(N(f?.deletions, ff?.deletions ?? 0), 0, 100000),
      };
    }),
  };
}

export function coerceTestReport(raw: any, fb: TestReportData): TestReportData {
  return {
    passed: clamp(N(raw?.passed, fb.passed), 0, 100000),
    failed: clamp(N(raw?.failed, fb.failed), 0, 100000),
    skipped: clamp(N(raw?.skipped, fb.skipped), 0, 100000),
    coverage: clamp(N(raw?.coverage, fb.coverage), 0, 100),
    suites: mapArr(raw?.suites, fb.suites, (s, i) => {
      const f = fb.suites[i % fb.suites.length];
      return {
        name: S(s?.name, f?.name ?? "Suite"),
        tests: mapArr(s?.tests, f?.tests ?? [], (t, j) => ({
          name: S(t?.name, f?.tests?.[j]?.name ?? "test"),
          status: oneOf(t?.status, ["pass", "fail", "skip"] as const, "pass"),
          durationMs: clamp(N(t?.durationMs, 20), 0, 600000),
        })),
      };
    }),
  };
}

export function coerceQualityGate(raw: any, fb: QualityGateData): QualityGateData {
  return {
    gates: mapArr(raw?.gates, fb.gates, (g, i) => {
      const f = fb.gates[i % fb.gates.length];
      return {
        name: S(g?.name, f?.name ?? "Gate"),
        status: oneOf(g?.status, ["pass", "warn", "fail"] as const, f?.status ?? "pass"),
        detail: S(g?.detail, f?.detail ?? ""),
      };
    }),
  };
}

export function coerceMockPr(raw: any, fb: MockPrData): MockPrData {
  return {
    repo: S(raw?.repo, fb.repo),
    branch: S(raw?.branch, fb.branch),
    number: clamp(N(raw?.number, fb.number), 1, 999999),
    title: S(raw?.title, fb.title),
    author: S(raw?.author, fb.author),
    filesChanged: clamp(N(raw?.filesChanged, fb.filesChanged), 0, 100000),
    additions: clamp(N(raw?.additions, fb.additions), 0, 1000000),
    deletions: clamp(N(raw?.deletions, fb.deletions), 0, 1000000),
    commits: mapArr(raw?.commits, fb.commits, (c, i) => {
      const f = fb.commits[i % fb.commits.length];
      return {
        sha: S(c?.sha, f?.sha ?? Math.random().toString(16).slice(2, 9)),
        message: S(c?.message, f?.message ?? "commit"),
      };
    }),
    checks: mapArr(raw?.checks, fb.checks, (c, i) => {
      const f = fb.checks[i % fb.checks.length];
      return {
        name: S(c?.name, f?.name ?? "check"),
        status: oneOf(c?.status, ["pass", "running", "fail"] as const, f?.status ?? "pass"),
      };
    }),
  };
}

export function coerceDeployment(raw: any, fb: DeploymentData): DeploymentData {
  return {
    environment: S(raw?.environment, fb.environment),
    version: S(raw?.version, fb.version),
    region: S(raw?.region, fb.region),
    status: oneOf(raw?.status, ["healthy", "degraded", "deploying"] as const, fb.status),
    url: S(raw?.url, fb.url),
    steps: mapArr(raw?.steps, fb.steps, (s, i) => {
      const f = fb.steps[i % fb.steps.length];
      return {
        name: S(s?.name, f?.name ?? "step"),
        status: oneOf(s?.status, ["pass", "running", "pending"] as const, f?.status ?? "pass"),
      };
    }),
  };
}

export function coerceDashboard(raw: any, fb: DashboardData): DashboardData {
  return {
    metrics: mapArr(raw?.metrics, fb.metrics, (m, i) => {
      const f = fb.metrics[i % fb.metrics.length];
      const series = Array.isArray(m?.series)
        ? m.series.map((x: any) => N(x, 0)).slice(0, 24)
        : f?.series ?? [1, 2, 3];
      return {
        label: S(m?.label, f?.label ?? "Metric"),
        value: S(m?.value, f?.value ?? "0"),
        unit: S(m?.unit, f?.unit ?? ""),
        deltaPct: N(m?.deltaPct, f?.deltaPct ?? 0),
        good: oneOf(m?.good, ["up", "down"] as const, f?.good ?? "up"),
        series: series.length ? series : [1, 2, 3],
      };
    }),
    slos: mapArr(raw?.slos, fb.slos, (s, i) => {
      const f = fb.slos[i % fb.slos.length];
      return {
        name: S(s?.name, f?.name ?? "SLO"),
        target: N(s?.target, f?.target ?? 99),
        current: N(s?.current, f?.current ?? 99),
        unit: S(s?.unit, f?.unit ?? "%"),
      };
    }),
  };
}

export function coerceOptimization(raw: any, fb: OptimizationData): OptimizationData {
  return {
    summary: S(raw?.summary, fb.summary),
    estimatedGainPct: clamp(N(raw?.estimatedGainPct, fb.estimatedGainPct), 0, 100),
    requestChanges: B(raw?.requestChanges, fb.requestChanges),
    findings: mapArr(raw?.findings, fb.findings, (f, i) => {
      const ff = fb.findings[i % fb.findings.length];
      return {
        title: S(f?.title, ff?.title ?? "Finding"),
        detail: S(f?.detail, ff?.detail ?? ""),
        severity: oneOf(f?.severity, ["low", "medium", "high"] as const, ff?.severity ?? "medium"),
      };
    }),
    recommendation: S(raw?.recommendation, fb.recommendation),
  };
}

export function coerceGtm(raw: any, fb: GtmData): GtmData {
  return {
    summary: S(raw?.summary, fb.summary),
    segments: mapArr(raw?.segments, fb.segments, (s, i) => {
      const f = fb.segments[i % fb.segments.length];
      return { name: S(s?.name, f?.name ?? "Segment"), note: S(s?.note, f?.note ?? "") };
    }),
    messaging: SA(raw?.messaging, fb.messaging),
    channels: mapArr(raw?.channels, fb.channels, (c, i) => {
      const f = fb.channels[i % fb.channels.length];
      return { name: S(c?.name, f?.name ?? "Channel"), note: S(c?.note, f?.note ?? "") };
    }),
    kpis: mapArr(raw?.kpis, fb.kpis, (k, i) => {
      const f = fb.kpis[i % fb.kpis.length];
      return { label: S(k?.label, f?.label ?? "KPI"), target: S(k?.target, f?.target ?? "—") };
    }),
    launchSteps: mapArr(raw?.launchSteps, fb.launchSteps, (l, i) => {
      const f = fb.launchSteps[i % fb.launchSteps.length];
      return { name: S(l?.name, f?.name ?? "Step"), when: S(l?.when, f?.when ?? "Week 1") };
    }),
  };
}

export function coerceFeedback(raw: any, fb: FeedbackData): FeedbackData {
  return {
    summary: S(raw?.summary, fb.summary),
    items: mapArr(raw?.items, fb.items, (it, i) => {
      const f = fb.items[i % fb.items.length];
      return {
        source: S(it?.source, f?.source ?? "User"),
        persona: S(it?.persona, f?.persona ?? "Customer"),
        text: S(it?.text, f?.text ?? ""),
        sentiment: oneOf(
          it?.sentiment,
          ["positive", "neutral", "negative"] as const,
          f?.sentiment ?? "positive",
        ),
      };
    }),
  };
}
