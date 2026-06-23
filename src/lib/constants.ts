import {
  Activity,
  BadgeCheck,
  Boxes,
  BrainCircuit,
  ClipboardList,
  Code2,
  Cpu,
  FileSearch,
  FlaskConical,
  GaugeCircle,
  GitPullRequest,
  Layers,
  Lightbulb,
  LineChart,
  type LucideIcon,
  Megaphone,
  MessagesSquare,
  PencilRuler,
  Rocket,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  TrendingUp,
  Workflow,
} from "lucide-react";
import type { ArtifactType, PhaseId, PhaseStatus, SubAgentStatus } from "@/types";

/**
 * Microsoft "IQ" grounding layers each sub-agent draws on. Illustrative labels
 * shown in the UI to hint where an agent's intelligence is sourced:
 * - Work IQ    → Microsoft 365 work data (people, comms, work items, GitHub).
 * - Fabric IQ  → enterprise business data & telemetry in Microsoft Fabric.
 * - Foundry IQ → model reasoning & knowledge grounding in Azure AI Foundry.
 */
export type IqLane = "work" | "fabric" | "foundry";

export interface IqMeta {
  label: string;
  description: string;
  color: string; // hex
}

export const IQ_LANES: Record<IqLane, IqMeta> = {
  work: {
    label: "Work IQ",
    description: "Grounded in Microsoft 365 work data — people, communications, work items and GitHub.",
    color: "#0F6CBD",
  },
  fabric: {
    label: "Fabric IQ",
    description: "Grounded in enterprise business data, metrics and telemetry in Microsoft Fabric.",
    color: "#117865",
  },
  foundry: {
    label: "Foundry IQ",
    description: "Model reasoning and knowledge grounding in Azure AI Foundry.",
    color: "#8661C5",
  },
};

export interface SubAgentMeta {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  iq: IqLane;
}

export interface PhaseMeta {
  id: PhaseId;
  index: number;
  name: string;
  tagline: string;
  description: string;
  /** One-line "why this matters" — the value this slice adds to the pipeline. */
  value: string;
  color: string;
  icon: LucideIcon;
  agents: SubAgentMeta[];
}

export const ORCHESTRATOR = {
  name: "Magentic Orchestrator",
  short: "Orchestrator",
  role: "Maintains the big picture, plans, and coordinates every phase",
  color: "#0F6CBD",
  icon: BrainCircuit,
};

// Distinct, cohesive Fluent accent colors per phase.
export const PHASES: PhaseMeta[] = [
  {
    id: "ideate",
    index: 0,
    name: "Ideate",
    tagline: "Generate & rank ideas",
    description:
      "Researches the market and invents, scores, and ranks new product ideas for the selected business.",
    value:
      "Turns noisy market signals into a ranked shortlist — so the team funds the highest-impact bets instead of guessing.",
    color: "#0078D4",
    icon: Lightbulb,
    agents: [
      { id: "ideate.research", name: "Market Research", role: "Trends, headwinds & blue-sky", icon: FileSearch, iq: "foundry" },
      { id: "ideate.generate", name: "Idea Generation", role: "Candidate concepts", icon: Sparkles, iq: "foundry" },
      { id: "ideate.costbenefit", name: "Cost–Benefit", role: "Value vs. cost", icon: Scale, iq: "fabric" },
      { id: "ideate.risk", name: "Risk Analysis", role: "Risk to the business", icon: ShieldCheck, iq: "fabric" },
      { id: "ideate.competitive", name: "Competitive Analysis", role: "Landscape & white space", icon: Target, iq: "foundry" },
      { id: "ideate.synthesis", name: "Synthesis & Ranking", role: "Score & rank top 5", icon: TrendingUp, iq: "foundry" },
    ],
  },
  {
    id: "planner",
    index: 1,
    name: "Planner",
    tagline: "Business case & user stories",
    description:
      "Triages the top ideas, builds the business case, and authors DevSecOps-ready work items.",
    value:
      "Converts the winning idea into a defensible business case and build-ready work items — aligning value, cost, and scope before any code is written.",
    color: "#6B69D6",
    icon: ClipboardList,
    agents: [
      { id: "planner.review", name: "Idea Review", role: "Validate assumptions", icon: FileSearch, iq: "work" },
      { id: "planner.case", name: "Business Case", role: "Problem, ROI & cost", icon: LineChart, iq: "fabric" },
      { id: "planner.strategy", name: "Competitive Strategy", role: "Recommend next steps", icon: Target, iq: "foundry" },
      { id: "planner.triage", name: "Triage", role: "Select the one to build", icon: BadgeCheck, iq: "work" },
      { id: "planner.story", name: "Story & Docs", role: "User story, AC, NFR, security", icon: ClipboardList, iq: "work" },
    ],
  },
  {
    id: "developer",
    index: 2,
    name: "Developer",
    tagline: "Architect, scaffold & code",
    description:
      "Plans the work, sets the architecture to Microsoft best practices, scaffolds, and writes the code.",
    value:
      "Translates the plan into well-architected, working software — applying Microsoft best practices so quality is built in, not bolted on.",
    color: "#038387",
    icon: Code2,
    agents: [
      { id: "developer.plan", name: "Planning", role: "Technical task plan", icon: ClipboardList, iq: "foundry" },
      { id: "developer.architecture", name: "Architecture", role: "Well-Architected design", icon: PencilRuler, iq: "foundry" },
      { id: "developer.scaffold", name: "Scaffolding", role: "Framework & structure", icon: Layers, iq: "foundry" },
      { id: "developer.coder", name: "Coder", role: "Assemble the implementation", icon: Code2, iq: "foundry" },
    ],
  },
  {
    id: "validator",
    index: 3,
    name: "Validator",
    tagline: "Test, validate & PR",
    description:
      "Runs unit, smoke, and quality gates, then prepares the (mocked) GitHub repository and pull request.",
    value:
      "Proves the build is correct, secure, and shippable — catching issues and packaging a clean pull request before anything reaches users.",
    color: "#498205",
    icon: FlaskConical,
    agents: [
      { id: "validator.unit", name: "Unit Tests", role: "Generate & run unit tests", icon: TestTube2, iq: "foundry" },
      { id: "validator.smoke", name: "Smoke / Integration", role: "Smoke & integration checks", icon: FlaskConical, iq: "foundry" },
      { id: "validator.security", name: "Security & Quality", role: "SAST & quality gates", icon: ShieldCheck, iq: "foundry" },
      { id: "validator.scm", name: "Source Control", role: "Repo, commits & PR (mock)", icon: GitPullRequest, iq: "work" },
    ],
  },
  {
    id: "operator",
    index: 4,
    name: "Operator",
    tagline: "Deploy, observe & grow",
    description:
      "Deploys, observes telemetry, recommends optimizations, gathers feedback, and drives go-to-market.",
    value:
      "Ships, observes, and grows the product — closing the loop with real telemetry and feedback that fuels the next round of ideas.",
    color: "#CA5010",
    icon: Rocket,
    agents: [
      { id: "operator.deploy", name: "Deployment", role: "Ship the release (sim)", icon: Rocket, iq: "foundry" },
      { id: "operator.observe", name: "Observability", role: "Telemetry & SLOs", icon: GaugeCircle, iq: "fabric" },
      { id: "operator.optimize", name: "Optimization", role: "Find & request improvements", icon: Activity, iq: "fabric" },
      { id: "operator.feedback", name: "Feedback", role: "Human & user feedback", icon: MessagesSquare, iq: "work" },
      { id: "operator.gtm", name: "Go-to-Market", role: "Launch, positioning & growth", icon: Megaphone, iq: "work" },
    ],
  },
];

export const PHASE_MAP: Record<PhaseId, PhaseMeta> = PHASES.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<PhaseId, PhaseMeta>,
);

export const PHASE_ORDER: PhaseId[] = PHASES.map((p) => p.id);

// ----------------------------------------------------------------------------
// Status presentation
// ----------------------------------------------------------------------------

export interface StatusStyle {
  label: string;
  /** tailwind classes for a soft pill */
  pill: string;
  dot: string;
}

export const PHASE_STATUS_STYLE: Record<PhaseStatus, StatusStyle> = {
  idle: {
    label: "Idle",
    pill: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  waiting: {
    label: "Waiting",
    pill: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  running: {
    label: "Running",
    pill: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  needs_human: {
    label: "Needs review",
    pill: "bg-warning/15 text-warning-foreground",
    dot: "bg-warning",
  },
  blocked: {
    label: "Blocked",
    pill: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  complete: {
    label: "Complete",
    pill: "bg-success/12 text-success",
    dot: "bg-success",
  },
};

export const SUBAGENT_STATUS_STYLE: Record<SubAgentStatus, StatusStyle> = {
  idle: { label: "Idle", pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40" },
  working: { label: "Working", pill: "bg-primary/10 text-primary", dot: "bg-primary" },
  done: { label: "Done", pill: "bg-success/12 text-success", dot: "bg-success" },
  error: { label: "Error", pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

// ----------------------------------------------------------------------------
// Artifact presentation
// ----------------------------------------------------------------------------

export const ARTIFACT_META: Record<ArtifactType, { label: string; icon: LucideIcon }> = {
  market_brief: { label: "Market Research Brief", icon: FileSearch },
  competitive: { label: "Competitive Landscape", icon: Target },
  scorecard: { label: "Idea Scorecard — Top 5", icon: TrendingUp },
  business_case: { label: "Business Case", icon: LineChart },
  triage: { label: "Triage Decision", icon: BadgeCheck },
  user_story: { label: "User Story", icon: ClipboardList },
  tech_plan: { label: "Technical Plan", icon: ClipboardList },
  adr: { label: "Architecture Decision Record", icon: PencilRuler },
  scaffold: { label: "Scaffold Manifest", icon: Boxes },
  code: { label: "Code Change Set", icon: Code2 },
  test_report: { label: "Test Report", icon: TestTube2 },
  quality_gate: { label: "Quality Gates", icon: ShieldCheck },
  mock_pr: { label: "Pull Request (mock)", icon: GitPullRequest },
  deployment: { label: "Deployment", icon: Rocket },
  dashboard: { label: "Observability Dashboard", icon: GaugeCircle },
  optimization: { label: "Optimization Report", icon: Activity },
  gtm_plan: { label: "Go-to-Market Plan", icon: Megaphone },
  feedback: { label: "Feedback Log", icon: MessagesSquare },
};

export const MISC_ICONS = { Workflow, Cpu };
