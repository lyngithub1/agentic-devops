// ============================================================================
// Agentic DevOps — shared domain types
// Contracts shared by the simulation engine, the store, and the UI.
// ============================================================================

export type PhaseId =
  | "ideate"
  | "planner"
  | "developer"
  | "validator"
  | "operator";

export type PhaseStatus =
  | "idle" // not reached yet
  | "waiting" // upstream artifact required
  | "running" // sub-agents working
  | "needs_human" // paused at an approval gate
  | "blocked" // exit criteria failed
  | "complete"; // artifacts produced & validated

export type SubAgentStatus = "idle" | "working" | "done" | "error";

export type RunMode = "simulation" | "live";

export type ActivityLevel = "info" | "success" | "warn" | "error";

// ----------------------------------------------------------------------------
// Business context
// ----------------------------------------------------------------------------

export interface BusinessProfile {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  size: "startup" | "midmarket" | "enterprise";
  region: string;
  currentProducts: string[];
  strategicGoals: string[];
  description: string;
  accent: string; // hex used for subtle per-business branding
  custom?: boolean; // true when authored at runtime via the custom-company form
  templateId?: string; // which built-in business this custom run is modeled after
}

// ----------------------------------------------------------------------------
// Agents
// ----------------------------------------------------------------------------

export interface SubAgent {
  id: string;
  name: string;
  role: string;
  status: SubAgentStatus;
}

// ----------------------------------------------------------------------------
// Scoring (shared rubric). cost & risk are pre-inverted: higher == better.
// ----------------------------------------------------------------------------

export interface ScoreBreakdown {
  impact: number;
  feasibility: number;
  cost: number;
  risk: number;
  strategicFit: number;
  timeToMarket: number;
  overall: number;
}

export interface Idea {
  id: string;
  rank: number;
  title: string;
  summary: string;
  scores: ScoreBreakdown;
  impactScore: number;
  justification: string;
  costBenefit: string;
  riskNotes: string;
  competitiveNotes: string;
  tags: string[];
}

// ----------------------------------------------------------------------------
// Activity log
// ----------------------------------------------------------------------------

export interface ActivityEvent {
  id: string;
  ts: number;
  phase: PhaseId;
  agent?: string;
  text: string;
  level: ActivityLevel;
}

// ----------------------------------------------------------------------------
// Artifacts — discriminated union keyed by `type`
// ----------------------------------------------------------------------------

export type ArtifactType =
  | "market_brief"
  | "competitive"
  | "scorecard"
  | "business_case"
  | "triage"
  | "user_story"
  | "tech_plan"
  | "adr"
  | "scaffold"
  | "code"
  | "test_report"
  | "quality_gate"
  | "mock_pr"
  | "deployment"
  | "dashboard"
  | "optimization"
  | "gtm_plan"
  | "feedback";

interface ArtifactBase {
  id: string;
  phase: PhaseId;
  title: string;
  subtitle?: string;
  createdAt: number;
}

export interface MarketBriefData {
  summary: string;
  trends: string[];
  headwinds: string[];
  tailwinds: string[];
  opportunities: string[];
  blueSky: string[];
  sources: { name: string; note: string }[];
}

export interface CompetitiveData {
  positioning: string;
  competitors: {
    name: string;
    focus: string;
    strength: string;
    weakness: string;
    share: number;
  }[];
  whiteSpace: string[];
}

export interface ScorecardData {
  ideas: Idea[];
  note: string;
}

export interface BusinessCaseData {
  problem: string;
  solution: string;
  market: string;
  roi: {
    investment: number;
    year1Return: number;
    year3Return: number;
    paybackMonths: number;
  };
  costs: { label: string; amount: number }[];
  timeline: { phase: string; duration: string }[];
  risks: string[];
  strategy: string[];
}

export interface TriageData {
  chosen: { ideaId: string; title: string; rationale: string };
  notAdvanced: { title: string; reason: string }[];
}

export interface UserStoryData {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptance: string[];
  nfrs: string[];
  security: string[];
  definitionOfReady: { label: string; done: boolean }[];
  storyPoints: number;
}

export interface TechPlanData {
  summary: string;
  tasks: { id: string; title: string; detail: string; estimate: string }[];
}

export interface AdrData {
  title: string;
  status: string;
  context: string;
  decisions: { title: string; choice: string; rationale: string }[];
  azureServices: { name: string; purpose: string }[];
  bestPractices: string[];
}

export interface ScaffoldData {
  framework: string;
  note: string;
  tree: { path: string; kind: "dir" | "file"; note?: string }[];
}

export interface CodeFile {
  path: string;
  language: string;
  content: string;
  additions: number;
  deletions: number;
}

export interface CodeData {
  summary: string;
  files: CodeFile[];
}

export interface TestReportData {
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
  suites: {
    name: string;
    tests: {
      name: string;
      status: "pass" | "fail" | "skip";
      durationMs: number;
    }[];
  }[];
}

export interface QualityGateData {
  gates: { name: string; status: "pass" | "warn" | "fail"; detail: string }[];
}

export interface MockPrData {
  repo: string;
  branch: string;
  number: number;
  title: string;
  author: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  commits: { sha: string; message: string }[];
  checks: { name: string; status: "pass" | "running" | "fail" }[];
}

export interface DeploymentData {
  environment: string;
  version: string;
  region: string;
  status: "healthy" | "degraded" | "deploying";
  url: string;
  steps: { name: string; status: "pass" | "running" | "pending" }[];
}

export interface MetricSeries {
  label: string;
  value: string;
  unit: string;
  deltaPct: number;
  good: "up" | "down";
  series: number[];
}

export interface DashboardData {
  metrics: MetricSeries[];
  slos: { name: string; target: number; current: number; unit: string }[];
}

export interface OptimizationData {
  summary: string;
  estimatedGainPct: number;
  requestChanges: boolean;
  findings: {
    title: string;
    detail: string;
    severity: "low" | "medium" | "high";
  }[];
  recommendation: string;
}

export interface GtmData {
  summary: string;
  segments: { name: string; note: string }[];
  messaging: string[];
  channels: { name: string; note: string }[];
  kpis: { label: string; target: string }[];
  launchSteps: { name: string; when: string }[];
}

export interface FeedbackData {
  summary: string;
  items: {
    source: string;
    persona: string;
    text: string;
    sentiment: "positive" | "neutral" | "negative";
  }[];
}

export type ArtifactData =
  | { type: "market_brief"; data: MarketBriefData }
  | { type: "competitive"; data: CompetitiveData }
  | { type: "scorecard"; data: ScorecardData }
  | { type: "business_case"; data: BusinessCaseData }
  | { type: "triage"; data: TriageData }
  | { type: "user_story"; data: UserStoryData }
  | { type: "tech_plan"; data: TechPlanData }
  | { type: "adr"; data: AdrData }
  | { type: "scaffold"; data: ScaffoldData }
  | { type: "code"; data: CodeData }
  | { type: "test_report"; data: TestReportData }
  | { type: "quality_gate"; data: QualityGateData }
  | { type: "mock_pr"; data: MockPrData }
  | { type: "deployment"; data: DeploymentData }
  | { type: "dashboard"; data: DashboardData }
  | { type: "optimization"; data: OptimizationData }
  | { type: "gtm_plan"; data: GtmData }
  | { type: "feedback"; data: FeedbackData };

export type Artifact = ArtifactBase & ArtifactData;

// ----------------------------------------------------------------------------
// Human-in-the-loop gates
// ----------------------------------------------------------------------------

export interface HumanGate {
  phase: PhaseId;
  kind: "code_review" | "ops_feedback";
  title: string;
  prompt: string;
  status: "pending" | "approved" | "changes_requested";
  note?: string;
  approveLabel: string;
  rejectLabel: string;
}

export type GateDecision = "approve" | "request_changes";

// ----------------------------------------------------------------------------
// Orchestrator (Magentic pattern)
// ----------------------------------------------------------------------------

export interface ReasoningEvent {
  id: string;
  ts: number;
  text: string;
}

export interface AgentMessage {
  id: string;
  ts: number;
  from: string;
  to: string;
  text: string;
}

export interface ProgressEntry {
  id: string;
  ts: number;
  phase: PhaseId | "orchestrator";
  speaker: string;
  instruction: string;
  complete: boolean;
}

export interface TaskLedger {
  facts: string[];
  assumptions: string[];
  plan: string[];
  phaseGoals: Partial<Record<PhaseId, string>>;
}

export type OrchestratorStatus =
  | "idle"
  | "planning"
  | "coordinating"
  | "complete";

export interface OrchestratorState {
  status: OrchestratorStatus;
  reasoning: ReasoningEvent[];
  messages: AgentMessage[];
  progress: ProgressEntry[];
  taskLedger: TaskLedger;
  overallProgress: number;
  currentPhase: PhaseId | null;
}

// ----------------------------------------------------------------------------
// Phase + pipeline state
// ----------------------------------------------------------------------------

export interface PhaseState {
  id: PhaseId;
  status: PhaseStatus;
  progress: number;
  subAgents: SubAgent[];
  activity: ActivityEvent[];
  artifacts: Artifact[];
  gate: HumanGate | null;
  startedAt?: number;
  completedAt?: number;
}

export interface PipelineState {
  business: BusinessProfile | null;
  mode: RunMode;
  running: boolean;
  started: boolean;
  finished: boolean;
  speed: number;
  phases: Record<PhaseId, PhaseState>;
  orchestrator: OrchestratorState;
  selectedArtifactId: string | null;
  live: LiveState;
  github: GithubState;
}

// ----------------------------------------------------------------------------
// Live (LLM) mode
// ----------------------------------------------------------------------------

export type LiveStatus = "idle" | "generating" | "ready" | "error";

export interface LiveStageInfo {
  index: number; // 1-based stage number
  total: number;
  label: string;
  status: "running" | "done" | "fallback";
  detail?: string;
}

export interface LiveModelInfo {
  id: string;
  label: string;
  description?: string;
  provider: string;
  model: string;
  configured: boolean;
}

export interface LiveState {
  available: boolean | null; // null = not yet probed
  provider: string | null; // "azure-openai" | "openai" when available
  model: string | null;
  status: LiveStatus;
  stages: LiveStageInfo[];
  error: string | null;
  models: LiveModelInfo[];
  selectedModelId: string | null;
}

// ----------------------------------------------------------------------------
// GitHub live mode (Phase 2) - real branches, commits & pull requests
// ----------------------------------------------------------------------------

export type GithubAuthMode = "pat" | "app" | "none";

export type LivePrStatusKind =
  | "idle"
  | "creating"
  | "open"
  | "polling"
  | "merged"
  | "error";

export interface LivePrCheckView {
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required"
    | null;
}

export interface LivePrState {
  status: LivePrStatusKind;
  number: number | null;
  htmlUrl: string | null;
  branch: string | null;
  headSha: string | null;
  checks: LivePrCheckView[];
  error: string | null;
  lastPolledAt?: number;
}

export interface GithubState {
  available: boolean | null; // null = not yet probed
  configured: boolean;
  repo: string;
  mode: GithubAuthMode;
  pr: LivePrState;
}
