import { type RunScript, type SimEvent, type SimStep } from "@/engine/AgentRunner";
import type { RunContent } from "@/data/content/types";
import { uid } from "@/lib/format";
import type {
  Artifact,
  ArtifactData,
  BusinessProfile,
  HumanGate,
  PhaseId,
} from "@/types";

class Script {
  steps: SimStep[] = [];

  add(delay: number, ...events: SimEvent[]): this {
    this.steps.push({ delay, events });
    return this;
  }

  build(): RunScript {
    return this.steps;
  }
}

function artifact(
  phase: PhaseId,
  title: string,
  payload: ArtifactData,
  subtitle?: string,
): Artifact {
  return { id: uid("art"), phase, title, subtitle, createdAt: 0, ...payload };
}

export type SegmentKey =
  | "intro"
  | "ideate"
  | "planner"
  | "developer"
  | "validator"
  | "operator"
  | "wrap";

export interface RunSegment {
  key: SegmentKey;
  steps: RunScript;
}

/**
 * Build the run as ordered, per-phase segments. Live mode plays these one at a
 * time, generating each phase's content just before its segment animates, so
 * the pipeline UI behaves exactly like simulation. Simulation flattens them.
 */
export function buildSegments(business: BusinessProfile, c: RunContent): RunSegment[] {
  return [
    { key: "intro", steps: segIntro(business, c) },
    { key: "ideate", steps: segIdeate(business, c) },
    { key: "planner", steps: segPlanner(business, c) },
    { key: "developer", steps: segDeveloper(business, c) },
    { key: "validator", steps: segValidator(business, c) },
    { key: "operator", steps: segOperator(business, c) },
    { key: "wrap", steps: segWrap(business, c) },
  ];
}

/**
 * Compose a full, choreographed run for one business from its {@link RunContent}.
 * The same structure drives every business, so the demo stays consistent while
 * each business tells its own story.
 */
export function buildScript(business: BusinessProfile, c: RunContent): RunScript {
  return buildSegments(business, c).flatMap((seg) => seg.steps);
}

function segIntro(business: BusinessProfile, c: RunContent): RunScript {
  const s = new Script();
  const chosen = c.ideas.find((i) => i.id === c.chosenIdeaId) ?? c.ideas[0];
  const name = business.name;

  // ===========================================================================
  // 0. Orchestrator — build the Task Ledger and plan the run (Magentic)
  // ===========================================================================
  s.add(200, { kind: "orch.status", status: "planning" });
  s.add(500, {
    kind: "orch.reason",
    text: `New product-pipeline run requested for ${name}. Establishing the task ledger and decomposing the work across the five phase teams.`,
  });
  s.add(650, {
    kind: "orch.ledger",
    ledger: {
      facts: [
        `Business: ${name} — ${business.industry} (${business.size}).`,
        `Strategic goals: ${business.strategicGoals.join("; ")}.`,
        `Current products: ${business.currentProducts.join(", ")}.`,
      ],
      assumptions: [
        "Synthetic market data is representative for this demo.",
        "GitHub and deployment actions are mocked end-to-end.",
      ],
      plan: [
        "Ideate — research, generate, score and rank ideas.",
        "Planner — business case, triage to one idea, DevSecOps stories.",
        "Developer — architect, scaffold and code (human review gate).",
        "Validator — test, quality-gate and open a pull request.",
        "Operator — deploy, observe, optimize and go-to-market.",
      ],
      phaseGoals: {
        ideate: `Return the top 5 scored ideas for ${name}.`,
        planner: "Advance exactly one idea with a fundable business case + stories.",
        developer: "Produce reviewed, best-practice-aligned code.",
        validator: "Green tests, passing quality gates, an opened PR.",
        operator: "A healthy deployment with optimization + GTM plan.",
      },
    },
  });
  s.add(450, {
    kind: "orch.progress",
    speaker: "Orchestrator",
    phase: "orchestrator",
    instruction: "Plan established. Assigning the Ideate team to begin.",
    complete: true,
  });
  s.add(350, { kind: "orch.overall", progress: 3, currentPhase: "ideate" });
  s.add(300, { kind: "orch.status", status: "coordinating" });
  return s.build();
}

function segIdeate(business: BusinessProfile, c: RunContent): RunScript {
  const s = new Script();
  const chosen = c.ideas.find((i) => i.id === c.chosenIdeaId) ?? c.ideas[0];
  const name = business.name;

  // ===========================================================================
  // 1. Ideate
  // ===========================================================================
  s.add(500, {
    kind: "orch.message",
    from: "Orchestrator",
    to: "Ideate",
    text: `Generate and rank new product ideas for ${name}.`,
  });
  s.add(250, { kind: "phase.status", phase: "ideate", status: "running" });
  s.add(120, { kind: "phase.progress", phase: "ideate", progress: 6 });

  // Market research
  s.add(300, { kind: "subagent", phase: "ideate", agentId: "ideate.research", status: "working" });
  s.add(520, { kind: "activity", phase: "ideate", agent: "Market Research", text: `Scanning ${business.industry} trends, headwinds and adjacent-industry signals…` });
  s.add(640, { kind: "activity", phase: "ideate", agent: "Market Research", text: "Synthesizing demand signals and theorizing not-yet-available concepts." });
  s.add(360, { kind: "phase.progress", phase: "ideate", progress: 18 });
  s.add(220, { kind: "artifact", artifact: artifact("ideate", "Market Research Brief", { type: "market_brief", data: c.marketBrief }, business.industry) });
  s.add(180, { kind: "subagent", phase: "ideate", agentId: "ideate.research", status: "done" });

  // Idea generation
  s.add(280, { kind: "subagent", phase: "ideate", agentId: "ideate.generate", status: "working" });
  s.add(560, { kind: "activity", phase: "ideate", agent: "Idea Generation", text: `Drafting ${c.ideas.length + 7} candidate concepts grounded in the research.` });
  s.add(420, { kind: "phase.progress", phase: "ideate", progress: 30 });
  s.add(220, { kind: "subagent", phase: "ideate", agentId: "ideate.generate", status: "done" });

  // Cost-benefit
  s.add(260, { kind: "subagent", phase: "ideate", agentId: "ideate.costbenefit", status: "working" });
  s.add(540, { kind: "activity", phase: "ideate", agent: "Cost–Benefit", text: "Modeling value vs. build/run cost for each candidate." });
  s.add(360, { kind: "phase.progress", phase: "ideate", progress: 42 });
  s.add(200, { kind: "subagent", phase: "ideate", agentId: "ideate.costbenefit", status: "done" });

  // Risk
  s.add(240, { kind: "subagent", phase: "ideate", agentId: "ideate.risk", status: "working" });
  s.add(520, { kind: "activity", phase: "ideate", agent: "Risk Analysis", text: "Assessing delivery, market and compliance risk per idea." });
  s.add(340, { kind: "phase.progress", phase: "ideate", progress: 54 });
  s.add(200, { kind: "subagent", phase: "ideate", agentId: "ideate.risk", status: "done" });

  // Competitive
  s.add(240, { kind: "subagent", phase: "ideate", agentId: "ideate.competitive", status: "working" });
  s.add(540, { kind: "activity", phase: "ideate", agent: "Competitive Analysis", text: "Mapping competitors, positioning and white space." });
  s.add(360, { kind: "phase.progress", phase: "ideate", progress: 68 });
  s.add(220, { kind: "artifact", artifact: artifact("ideate", "Competitive Landscape", { type: "competitive", data: c.competitive }) });
  s.add(180, { kind: "subagent", phase: "ideate", agentId: "ideate.competitive", status: "done" });

  // Synthesis & ranking
  s.add(260, { kind: "subagent", phase: "ideate", agentId: "ideate.synthesis", status: "working" });
  s.add(560, { kind: "activity", phase: "ideate", agent: "Synthesis & Ranking", text: "Applying the weighted rubric and ranking the field." });
  s.add(420, { kind: "phase.progress", phase: "ideate", progress: 90 });
  s.add(220, {
    kind: "artifact",
    artifact: artifact("ideate", "Idea Scorecard — Top 5", { type: "scorecard", data: { ideas: c.ideas, note: c.ideaTheme } }, `${c.ideas.length} ranked ideas`),
  });
  s.add(180, { kind: "subagent", phase: "ideate", agentId: "ideate.synthesis", status: "done" });
  s.add(160, { kind: "activity", phase: "ideate", agent: "Synthesis & Ranking", text: `Top idea: “${c.ideas[0].title}” (score ${c.ideas[0].scores.overall}).`, level: "success" });
  s.add(240, { kind: "phase.progress", phase: "ideate", progress: 100 });
  s.add(240, { kind: "phase.status", phase: "ideate", status: "complete" });
  s.add(360, {
    kind: "orch.message",
    from: "Ideate",
    to: "Orchestrator",
    text: `Delivered 5 scored ideas. Strongest: “${c.ideas[0].title}”.`,
  });
  s.add(260, {
    kind: "orch.reason",
    text: "Ideate met its exit criteria (≥5 scored ideas with justification and impact). Handing the top ideas to the Planner.",
  });
  s.add(220, {
    kind: "orch.progress",
    speaker: "Orchestrator",
    phase: "ideate",
    instruction: "Top-5 validated. Engage Planner to build the case and triage.",
    complete: true,
  });
  s.add(260, { kind: "orch.overall", progress: 20, currentPhase: "planner" });
  return s.build();
}

function segPlanner(business: BusinessProfile, c: RunContent): RunScript {
  const s = new Script();
  const chosen = c.ideas.find((i) => i.id === c.chosenIdeaId) ?? c.ideas[0];
  const name = business.name;

  // ===========================================================================
  // 2. Planner
  // ===========================================================================
  s.add(420, { kind: "orch.message", from: "Orchestrator", to: "Planner", text: "Review the top ideas, build the business case, and advance exactly one." });
  s.add(240, { kind: "phase.status", phase: "planner", status: "running" });
  s.add(120, { kind: "phase.progress", phase: "planner", progress: 8 });

  s.add(280, { kind: "subagent", phase: "planner", agentId: "planner.review", status: "working" });
  s.add(540, { kind: "activity", phase: "planner", agent: "Idea Review", text: "Validating assumptions and demand evidence behind the top ideas." });
  s.add(320, { kind: "phase.progress", phase: "planner", progress: 22 });
  s.add(200, { kind: "subagent", phase: "planner", agentId: "planner.review", status: "done" });

  s.add(260, { kind: "subagent", phase: "planner", agentId: "planner.case", status: "working" });
  s.add(560, { kind: "activity", phase: "planner", agent: "Business Case", text: "Modeling problem, solution, market, ROI and cost." });
  s.add(360, { kind: "phase.progress", phase: "planner", progress: 40 });
  s.add(220, { kind: "artifact", artifact: artifact("planner", "Business Case", { type: "business_case", data: c.businessCase }, chosen.title) });
  s.add(180, { kind: "subagent", phase: "planner", agentId: "planner.case", status: "done" });

  s.add(240, { kind: "subagent", phase: "planner", agentId: "planner.strategy", status: "working" });
  s.add(520, { kind: "activity", phase: "planner", agent: "Competitive Strategy", text: "Comparing against the landscape and recommending next steps." });
  s.add(340, { kind: "phase.progress", phase: "planner", progress: 56 });
  s.add(200, { kind: "subagent", phase: "planner", agentId: "planner.strategy", status: "done" });

  s.add(240, { kind: "subagent", phase: "planner", agentId: "planner.triage", status: "working" });
  s.add(540, { kind: "activity", phase: "planner", agent: "Triage", text: `Selecting the single best idea to advance…` });
  s.add(360, { kind: "phase.progress", phase: "planner", progress: 72 });
  s.add(220, { kind: "artifact", artifact: artifact("planner", "Triage Decision", { type: "triage", data: c.triage }) });
  s.add(160, { kind: "activity", phase: "planner", agent: "Triage", text: `Advancing “${chosen.title}”.`, level: "success" });
  s.add(180, { kind: "subagent", phase: "planner", agentId: "planner.triage", status: "done" });

  s.add(240, { kind: "subagent", phase: "planner", agentId: "planner.story", status: "working" });
  s.add(560, { kind: "activity", phase: "planner", agent: "Story & Docs", text: "Authoring the user story, acceptance criteria, NFRs and security notes (DevSecOps)." });
  s.add(420, { kind: "phase.progress", phase: "planner", progress: 92 });
  s.add(220, { kind: "artifact", artifact: artifact("planner", "User Story", { type: "user_story", data: c.userStory }, "Definition of Ready ✓") });
  s.add(180, { kind: "subagent", phase: "planner", agentId: "planner.story", status: "done" });
  s.add(220, { kind: "phase.progress", phase: "planner", progress: 100 });
  s.add(240, { kind: "phase.status", phase: "planner", status: "complete" });
  s.add(360, { kind: "orch.message", from: "Planner", to: "Orchestrator", text: "One idea advanced with a fundable case and ready-to-build stories." });
  s.add(260, { kind: "orch.reason", text: "Definition of Ready satisfied — the Developer can proceed without further guidance." });
  s.add(220, { kind: "orch.progress", speaker: "Orchestrator", phase: "planner", instruction: "Stories ready. Engage Developer to design and build.", complete: true });
  s.add(260, { kind: "orch.overall", progress: 38, currentPhase: "developer" });
  return s.build();
}

function segDeveloper(business: BusinessProfile, c: RunContent): RunScript {
  const s = new Script();
  const chosen = c.ideas.find((i) => i.id === c.chosenIdeaId) ?? c.ideas[0];
  const name = business.name;

  // ===========================================================================
  // 3. Developer (with human code-review gate)
  // ===========================================================================
  s.add(420, { kind: "orch.message", from: "Orchestrator", to: "Developer", text: `Build “${chosen.title}” to the approved story and Microsoft best practices.` });
  s.add(240, { kind: "phase.status", phase: "developer", status: "running" });
  s.add(120, { kind: "phase.progress", phase: "developer", progress: 8 });

  s.add(280, { kind: "subagent", phase: "developer", agentId: "developer.plan", status: "working" });
  s.add(540, { kind: "activity", phase: "developer", agent: "Planning", text: "Breaking the story into a sequenced technical task plan." });
  s.add(320, { kind: "phase.progress", phase: "developer", progress: 22 });
  s.add(220, { kind: "artifact", artifact: artifact("developer", "Technical Plan", { type: "tech_plan", data: c.techPlan }) });
  s.add(180, { kind: "subagent", phase: "developer", agentId: "developer.plan", status: "done" });

  s.add(260, { kind: "subagent", phase: "developer", agentId: "developer.architecture", status: "working" });
  s.add(560, { kind: "activity", phase: "developer", agent: "Architecture", text: "Validating the design against the Azure Well-Architected Framework." });
  s.add(360, { kind: "phase.progress", phase: "developer", progress: 40 });
  s.add(220, { kind: "artifact", artifact: artifact("developer", "Architecture Decision Record", { type: "adr", data: c.adr }) });
  s.add(180, { kind: "subagent", phase: "developer", agentId: "developer.architecture", status: "done" });

  s.add(240, { kind: "subagent", phase: "developer", agentId: "developer.scaffold", status: "working" });
  s.add(520, { kind: "activity", phase: "developer", agent: "Scaffolding", text: `Laying out the ${c.scaffold.framework} project structure.` });
  s.add(340, { kind: "phase.progress", phase: "developer", progress: 56 });
  s.add(220, { kind: "artifact", artifact: artifact("developer", "Scaffold Manifest", { type: "scaffold", data: c.scaffold }) });
  s.add(180, { kind: "subagent", phase: "developer", agentId: "developer.scaffold", status: "done" });

  s.add(240, { kind: "subagent", phase: "developer", agentId: "developer.coder", status: "working" });
  s.add(520, { kind: "activity", phase: "developer", agent: "Coder", text: "Implementing components and wiring the pieces together…" });
  s.add(560, { kind: "activity", phase: "developer", agent: "Coder", text: `Generated ${c.code.files.length} files (+${c.code.files.reduce((a, f) => a + f.additions, 0)} lines).` });
  s.add(380, { kind: "phase.progress", phase: "developer", progress: 84 });
  s.add(220, { kind: "artifact", artifact: artifact("developer", "Code Change Set", { type: "code", data: c.code }, `${c.code.files.length} files`) });
  s.add(180, { kind: "subagent", phase: "developer", agentId: "developer.coder", status: "done" });

  // Human gate: code review
  s.add(420, { kind: "activity", phase: "developer", agent: "Coder", text: "Change set ready for human code review.", level: "warn" });
  s.add(260, { kind: "orch.reason", text: "Reached the human-in-the-loop code review gate. Pausing for a reviewer decision before validation." });
  s.add(220, {
    kind: "gate",
    gate: gate("developer", "code_review", "Human code review", `Review the change set for “${chosen.title}” — architecture aligned to Azure best practices, ${c.code.files.length} files changed. Approve to proceed to validation, or request changes.`, "Approve & continue", "Request changes"),
  });
  // (runner halts here until resolveGate)
  s.add(360, { kind: "phase.progress", phase: "developer", progress: 100 });
  s.add(240, { kind: "phase.status", phase: "developer", status: "complete" });
  s.add(320, { kind: "orch.message", from: "Developer", to: "Orchestrator", text: "Code review approved. Handing off to the Validator." });
  s.add(220, { kind: "orch.progress", speaker: "Orchestrator", phase: "developer", instruction: "Code approved. Engage Validator to test and open a PR.", complete: true });
  s.add(260, { kind: "orch.overall", progress: 60, currentPhase: "validator" });
  return s.build();
}

function segValidator(business: BusinessProfile, c: RunContent): RunScript {
  const s = new Script();
  const chosen = c.ideas.find((i) => i.id === c.chosenIdeaId) ?? c.ideas[0];
  const name = business.name;

  // ===========================================================================
  // 4. Validator
  // ===========================================================================
  s.add(420, { kind: "orch.message", from: "Orchestrator", to: "Validator", text: "Run tests and quality gates, then open the pull request (mocked)." });
  s.add(240, { kind: "phase.status", phase: "validator", status: "running" });
  s.add(120, { kind: "phase.progress", phase: "validator", progress: 8 });

  s.add(280, { kind: "subagent", phase: "validator", agentId: "validator.unit", status: "working" });
  s.add(540, { kind: "activity", phase: "validator", agent: "Unit Tests", text: `Generating and running ${c.testReport.passed + c.testReport.failed} unit tests…` });
  s.add(360, { kind: "phase.progress", phase: "validator", progress: 28 });
  s.add(220, { kind: "artifact", artifact: artifact("validator", "Test Report", { type: "test_report", data: c.testReport }, `${c.testReport.coverage}% coverage`) });
  s.add(160, { kind: "activity", phase: "validator", agent: "Unit Tests", text: `${c.testReport.passed} passed, ${c.testReport.failed} failed.`, level: c.testReport.failed > 0 ? "warn" : "success" });
  s.add(180, { kind: "subagent", phase: "validator", agentId: "validator.unit", status: "done" });

  s.add(240, { kind: "subagent", phase: "validator", agentId: "validator.smoke", status: "working" });
  s.add(520, { kind: "activity", phase: "validator", agent: "Smoke / Integration", text: "Running smoke and integration checks against the build." });
  s.add(340, { kind: "phase.progress", phase: "validator", progress: 48 });
  s.add(200, { kind: "subagent", phase: "validator", agentId: "validator.smoke", status: "done" });

  s.add(240, { kind: "subagent", phase: "validator", agentId: "validator.security", status: "working" });
  s.add(520, { kind: "activity", phase: "validator", agent: "Security & Quality", text: "Running SAST, dependency and quality gates." });
  s.add(360, { kind: "phase.progress", phase: "validator", progress: 68 });
  s.add(220, { kind: "artifact", artifact: artifact("validator", "Quality Gates", { type: "quality_gate", data: c.qualityGate }) });
  s.add(180, { kind: "subagent", phase: "validator", agentId: "validator.security", status: "done" });

  s.add(240, { kind: "subagent", phase: "validator", agentId: "validator.scm", status: "working" });
  s.add(520, { kind: "activity", phase: "validator", agent: "Source Control", text: `Creating repo, committing and opening PR #${c.pr.number} (mock).` });
  s.add(380, { kind: "phase.progress", phase: "validator", progress: 90 });
  s.add(220, { kind: "artifact", artifact: artifact("validator", "Pull Request (mock)", { type: "mock_pr", data: c.pr }, `${c.pr.repo} #${c.pr.number}`) });
  s.add(160, { kind: "activity", phase: "validator", agent: "Source Control", text: "All checks passing on the pull request.", level: "success" });
  s.add(180, { kind: "subagent", phase: "validator", agentId: "validator.scm", status: "done" });
  s.add(220, { kind: "phase.progress", phase: "validator", progress: 100 });
  s.add(240, { kind: "phase.status", phase: "validator", status: "complete" });
  s.add(360, { kind: "orch.message", from: "Validator", to: "Orchestrator", text: "Green tests, passing gates, PR opened. Ready to operate." });
  s.add(220, { kind: "orch.progress", speaker: "Orchestrator", phase: "validator", instruction: "Validation passed. Engage Operator to deploy and grow.", complete: true });
  s.add(260, { kind: "orch.overall", progress: 80, currentPhase: "operator" });
  return s.build();
}

function segOperator(business: BusinessProfile, c: RunContent): RunScript {
  const s = new Script();
  const chosen = c.ideas.find((i) => i.id === c.chosenIdeaId) ?? c.ideas[0];
  const name = business.name;

  // ===========================================================================
  // 5. Operator (with backward edge + human ops-feedback gate)
  // ===========================================================================
  s.add(420, { kind: "orch.message", from: "Orchestrator", to: "Operator", text: "Deploy, observe, optimize, and lead go-to-market." });
  s.add(240, { kind: "phase.status", phase: "operator", status: "running" });
  s.add(120, { kind: "phase.progress", phase: "operator", progress: 8 });

  s.add(280, { kind: "subagent", phase: "operator", agentId: "operator.deploy", status: "working" });
  s.add(560, { kind: "activity", phase: "operator", agent: "Deployment", text: `Deploying ${c.deployment.version} to ${c.deployment.environment} (${c.deployment.region})…` });
  s.add(360, { kind: "phase.progress", phase: "operator", progress: 24 });
  s.add(220, { kind: "artifact", artifact: artifact("operator", "Deployment", { type: "deployment", data: c.deployment }, c.deployment.status) });
  s.add(160, { kind: "activity", phase: "operator", agent: "Deployment", text: "Deployment healthy.", level: "success" });
  s.add(180, { kind: "subagent", phase: "operator", agentId: "operator.deploy", status: "done" });

  s.add(260, { kind: "subagent", phase: "operator", agentId: "operator.observe", status: "working" });
  s.add(540, { kind: "activity", phase: "operator", agent: "Observability", text: "Streaming telemetry and evaluating SLOs." });
  s.add(360, { kind: "phase.progress", phase: "operator", progress: 44 });
  s.add(220, { kind: "artifact", artifact: artifact("operator", "Observability Dashboard", { type: "dashboard", data: c.dashboard }, "live metrics") });
  s.add(180, { kind: "subagent", phase: "operator", agentId: "operator.observe", status: "done" });

  s.add(260, { kind: "subagent", phase: "operator", agentId: "operator.optimize", status: "working" });
  s.add(540, { kind: "activity", phase: "operator", agent: "Optimization", text: "Analyzing telemetry for optimization opportunities." });
  s.add(360, { kind: "phase.progress", phase: "operator", progress: 58 });
  s.add(220, { kind: "artifact", artifact: artifact("operator", "Optimization Report", { type: "optimization", data: c.optimization }, `~${c.optimization.estimatedGainPct}% gain`) });

  // Backward edge: Operator -> Developer change request
  if (c.optimization.requestChanges) {
    s.add(300, { kind: "activity", phase: "operator", agent: "Optimization", text: "Filing a change request back to the Developer team.", level: "warn" });
    s.add(280, { kind: "orch.reason", text: "Operator found a high-value optimization. Routing a change request back to the Developer (backward edge) before go-to-market." });
    s.add(260, { kind: "orch.message", from: "Orchestrator", to: "Developer", text: c.optimization.recommendation });
    s.add(240, { kind: "phase.status", phase: "developer", status: "running" });
    s.add(220, { kind: "subagent", phase: "developer", agentId: "developer.coder", status: "working" });
    s.add(560, { kind: "activity", phase: "developer", agent: "Coder", text: "Applying the requested optimization patch." });
    s.add(220, { kind: "artifact", artifact: artifact("developer", "Optimization Patch", { type: "code", data: c.patch }, "hotfix") });
    s.add(200, { kind: "subagent", phase: "developer", agentId: "developer.coder", status: "done" });
    s.add(220, { kind: "phase.status", phase: "developer", status: "complete" });
    s.add(240, { kind: "orch.message", from: "Developer", to: "Operator", text: "Optimization shipped. Resuming operations." });
  }

  s.add(220, { kind: "subagent", phase: "operator", agentId: "operator.optimize", status: "done" });
  s.add(160, { kind: "phase.progress", phase: "operator", progress: 66 });

  // Human gate: ops feedback
  s.add(360, { kind: "subagent", phase: "operator", agentId: "operator.feedback", status: "working" });
  s.add(420, { kind: "activity", phase: "operator", agent: "Feedback", text: "Awaiting operator review of optimizations and launch readiness.", level: "warn" });
  s.add(260, { kind: "orch.reason", text: "Reached the operations feedback gate. Pausing for a human decision on optimizations and go-to-market." });
  s.add(220, {
    kind: "gate",
    gate: gate("operator", "ops_feedback", "Operations feedback", `Telemetry is healthy and an optimization is in place for “${chosen.title}”. Approve to incorporate feedback and launch go-to-market, or request changes.`, "Approve & launch", "Request changes"),
  });
  // (runner halts here until resolveGate)
  s.add(360, { kind: "artifact", artifact: artifact("operator", "Feedback Log", { type: "feedback", data: c.feedback }, "human + user") });
  s.add(200, { kind: "subagent", phase: "operator", agentId: "operator.feedback", status: "done" });
  s.add(160, { kind: "phase.progress", phase: "operator", progress: 82 });

  s.add(260, { kind: "subagent", phase: "operator", agentId: "operator.gtm", status: "working" });
  s.add(540, { kind: "activity", phase: "operator", agent: "Go-to-Market", text: "Building launch, positioning and growth plan." });
  s.add(360, { kind: "phase.progress", phase: "operator", progress: 96 });
  s.add(220, { kind: "artifact", artifact: artifact("operator", "Go-to-Market Plan", { type: "gtm_plan", data: c.gtm }) });
  s.add(180, { kind: "subagent", phase: "operator", agentId: "operator.gtm", status: "done" });
  s.add(200, { kind: "phase.progress", phase: "operator", progress: 100 });
  s.add(240, { kind: "phase.status", phase: "operator", status: "complete" });
  return s.build();
}

function segWrap(business: BusinessProfile, c: RunContent): RunScript {
  const s = new Script();
  const chosen = c.ideas.find((i) => i.id === c.chosenIdeaId) ?? c.ideas[0];
  const name = business.name;

  // Wrap-up
  s.add(360, { kind: "orch.message", from: "Operator", to: "Orchestrator", text: `“${chosen.title}” is live, optimized, and ready to grow.` });
  s.add(260, { kind: "orch.reason", text: `All five phases complete. ${name} moved from idea to operating model with humans approving at each gate.` });
  s.add(220, { kind: "orch.progress", speaker: "Orchestrator", phase: "orchestrator", instruction: "Pipeline complete — operating model live.", complete: true });
  s.add(240, { kind: "orch.overall", progress: 100, currentPhase: null });
  s.add(240, { kind: "orch.status", status: "complete" });

  return s.build();
}

function gate(
  phase: PhaseId,
  kind: HumanGate["kind"],
  title: string,
  prompt: string,
  approveLabel: string,
  rejectLabel: string,
): HumanGate {
  return { phase, kind, title, prompt, status: "pending", approveLabel, rejectLabel };
}
