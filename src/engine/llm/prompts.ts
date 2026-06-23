import type { BusinessProfile, Idea } from "@/types";

// Prompt construction for Live mode. The model returns strict JSON per stage;
// coerce.ts then guarantees conformance to the RunContent data interfaces.

export const SYSTEM_PROMPT = [
  "You are the Agentic DevOps engine — a coordinated team of expert product, strategy, architecture,",
  "engineering, QA and go-to-market agents working an enterprise product-idea pipeline.",
  "You produce realistic, specific, board-ready artifacts tailored to a particular company and industry.",
  "",
  "Rules:",
  "- Return ONLY a single JSON object. No markdown, no code fences, no commentary.",
  "- Match the requested schema EXACTLY: same keys, same value types, no extra keys.",
  "- Be concrete and specific to the company and its industry — name real-sounding products,",
  "  segments, competitors, metrics and Azure services. Avoid generic filler.",
  "- Numbers must be plain numbers (no $ signs, units, or commas). Money is whole USD.",
  "- Scores are 0–100 integers. For 'cost' and 'risk', higher means BETTER (lower cost / lower risk).",
  "- Keep prose tight: one or two sentences per field unless a list is requested.",
].join("\n");

export function buildContext(business: BusinessProfile): string {
  const lines = [
    `Company: ${business.name}`,
    `Industry: ${business.industry}`,
    `Company size: ${business.size}`,
    `Primary region(s): ${business.region}`,
  ];
  if (business.description) lines.push(`About: ${business.description}`);
  // Only include inherited products/goals for the authored built-ins; custom
  // companies inherit template values that may not fit, so let the model infer.
  if (!business.custom) {
    if (business.currentProducts?.length)
      lines.push(`Current products: ${business.currentProducts.join(", ")}`);
    if (business.strategicGoals?.length)
      lines.push(`Strategic goals: ${business.strategicGoals.join("; ")}`);
  }
  return lines.join("\n");
}

function chosenBlock(idea: Idea): string {
  return [
    `Chosen idea to build: "${idea.title}"`,
    `Summary: ${idea.summary}`,
    idea.justification ? `Why it won: ${idea.justification}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// ---- Stage 1: Ideate -------------------------------------------------------

export function stage1User(ctx: string): string {
  return `${ctx}

TASK: Run the Ideate phase. Research the market and generate the top 5 product/feature ideas
for THIS company, scored and ranked. Make every idea distinctly relevant to the company's
industry and strategic situation.

Return JSON with this exact shape:
{
  "ideaTheme": "one short line naming the overall theme of the idea set",
  "marketBrief": {
    "summary": "2-3 sentences on the market context for this company",
    "trends": ["..."], "headwinds": ["..."], "tailwinds": ["..."],
    "opportunities": ["..."], "blueSky": ["1-2 not-yet-available moonshot ideas"],
    "sources": [{"name": "analyst/source name", "note": "what it tells us"}]
  },
  "competitive": {
    "positioning": "how this company should position",
    "competitors": [{"name": "...", "focus": "...", "strength": "...", "weakness": "...", "share": 0}],
    "whiteSpace": ["unserved needs / openings"]
  },
  "ideas": [
    {
      "title": "...", "summary": "1-2 sentences",
      "scores": {"impact": 0, "feasibility": 0, "cost": 0, "risk": 0, "strategicFit": 0, "timeToMarket": 0, "overall": 0},
      "impactScore": 0,
      "justification": "why this scores as it does",
      "costBenefit": "cost vs benefit summary",
      "riskNotes": "key risks",
      "competitiveNotes": "competitive angle",
      "tags": ["2-4 short tags"]
    }
  ]
}
Provide EXACTLY 5 ideas. 3-5 competitors. 3-6 items in each list.`;
}

// ---- Stage 2: Planner ------------------------------------------------------

export function stage2User(ctx: string, chosen: Idea): string {
  return `${ctx}

${chosenBlock(chosen)}

TASK: Run the Planner phase for the chosen idea — triage rationale, a business case, and a
DevSecOps-ready user story following Microsoft best practices.

Return JSON with this exact shape:
{
  "triage": {
    "chosen": {"rationale": "why this idea is the one to build now"},
    "notAdvanced": [{"title": "an other idea title", "reason": "why it waits"}]
  },
  "businessCase": {
    "problem": "...", "solution": "...", "market": "TAM/SAM framing",
    "roi": {"investment": 0, "year1Return": 0, "year3Return": 0, "paybackMonths": 0},
    "costs": [{"label": "...", "amount": 0}],
    "timeline": [{"phase": "...", "duration": "e.g. 6 weeks"}],
    "risks": ["..."], "strategy": ["recommended next steps"]
  },
  "userStory": {
    "id": "e.g. ${chosen.title.split(" ")[0].toUpperCase()}-1042",
    "asA": "persona", "iWant": "capability", "soThat": "outcome",
    "acceptance": ["Given/When/Then style criteria"],
    "nfrs": ["non-functional requirements"],
    "security": ["security/compliance requirements"],
    "definitionOfReady": [{"label": "...", "done": true}],
    "storyPoints": 0
  }
}
Money is whole USD numbers. 3-5 costs, 3-4 timeline phases, 4-6 acceptance criteria.`;
}

// ---- Stage 3: Developer ----------------------------------------------------

export function stage3User(ctx: string, chosen: Idea): string {
  return `${ctx}

${chosenBlock(chosen)}

TASK: Run the Developer phase — a technical task plan, an Architecture Decision Record aligned
to the Azure Well-Architected Framework, a scaffold/file tree, and a concise real code change set.

Return JSON with this exact shape:
{
  "techPlan": {"summary": "...", "tasks": [{"id": "T1", "title": "...", "detail": "...", "estimate": "e.g. 2d"}]},
  "adr": {
    "title": "...", "status": "Accepted", "context": "...",
    "decisions": [{"title": "...", "choice": "...", "rationale": "..."}],
    "azureServices": [{"name": "Azure ...", "purpose": "..."}],
    "bestPractices": ["Well-Architected pillars applied"]
  },
  "scaffold": {"framework": "e.g. TypeScript + Azure Functions", "note": "...", "tree": [{"path": "src/...", "kind": "file", "note": "optional"}]},
  "code": {
    "summary": "what the change set does",
    "files": [{"path": "src/...", "language": "typescript", "content": "real, compilable code", "additions": 0, "deletions": 0}]
  }
}
Provide 1-2 code files, each at most 40 lines. 4-6 tasks. 3-4 ADR decisions. 4-8 tree entries.
Code 'content' must be plain source (use \\n for newlines inside the JSON string).`;
}

// ---- Stage 4: Validator + Operator ----------------------------------------

export function stage4User(ctx: string, chosen: Idea): string {
  return `${ctx}

${chosenBlock(chosen)}

TASK: Run the Validator and Operator phases — test report, quality gates, a mocked GitHub PR,
a deployment, an observability dashboard, an optimization finding, a go-to-market plan, and
early feedback. Make metrics and segments specific to this company and idea.

Return JSON with this exact shape:
{
  "testReport": {"passed": 0, "failed": 0, "skipped": 0, "coverage": 0,
    "suites": [{"name": "...", "tests": [{"name": "...", "status": "pass", "durationMs": 0}]}]},
  "qualityGate": {"gates": [{"name": "...", "status": "pass", "detail": "..."}]},
  "pr": {"repo": "org/repo", "branch": "feature/...", "number": 100, "title": "...", "author": "agentic-devops[bot]",
    "filesChanged": 0, "additions": 0, "deletions": 0,
    "commits": [{"sha": "abc1234", "message": "..."}],
    "checks": [{"name": "...", "status": "pass"}]},
  "deployment": {"environment": "Production", "version": "v1.0.0", "region": "e.g. East US 2",
    "status": "healthy", "url": "https://...", "steps": [{"name": "...", "status": "pass"}]},
  "dashboard": {"metrics": [{"label": "...", "value": "...", "unit": "...", "deltaPct": 0, "good": "up", "series": [1,2,3,4,5,6]}],
    "slos": [{"name": "...", "target": 99.9, "current": 99.9, "unit": "%"}]},
  "optimization": {"summary": "...", "estimatedGainPct": 0, "requestChanges": false,
    "findings": [{"title": "...", "detail": "...", "severity": "medium"}], "recommendation": "..."},
  "gtm": {"summary": "...", "segments": [{"name": "...", "note": "..."}], "messaging": ["..."],
    "channels": [{"name": "...", "note": "..."}], "kpis": [{"label": "...", "target": "..."}],
    "launchSteps": [{"name": "...", "when": "e.g. Week 1"}]},
  "feedback": {"summary": "...", "items": [{"source": "...", "persona": "...", "text": "...", "sentiment": "positive"}]}
}
Status enums: test status pass|fail|skip; gate/PR check status pass|warn|fail or pass|running|fail;
deployment status healthy|degraded|deploying; metric good up|down; severity low|medium|high;
sentiment positive|neutral|negative. Keep mostly green/healthy. 3-4 dashboard metrics with 6+ series points.`;
}
