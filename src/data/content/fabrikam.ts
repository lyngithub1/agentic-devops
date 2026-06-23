import type { RunContent } from "@/data/content/types";

// ============================================================================
// Fabrikam Financial — "FraudShield" real-time explainable fraud decisioning
// ============================================================================

export const fabrikamContent: RunContent = {
  businessId: "fabrikam-financial",
  ideaTheme: "Trustworthy, real-time, explainable money decisions",

  marketBrief: {
    summary:
      "Digital fraud is rising while customers punish false declines. The winners pair real-time decisioning with explainability and regulatory trust.",
    trends: [
      "Real-time payments raise the bar for sub-second fraud decisions.",
      "Customers abandon after a single wrongful decline.",
      "Regulators expect explainable, auditable model decisions.",
      "Scams (APP fraud) shifting liability toward banks.",
    ],
    headwinds: [
      "Strict model-risk governance and audit requirements.",
      "Fraud patterns adversarial and fast-evolving.",
      "Legacy core-banking latency budgets.",
    ],
    tailwinds: [
      "Rich first-party transaction signal.",
      "Existing Azure data platform and Entra identity.",
      "Strong executive mandate to cut losses + false declines.",
    ],
    opportunities: [
      "Sub-second, explainable scoring that cuts false declines and losses together.",
      "Customer-facing transparency that builds trust.",
      "Reusable decisioning fabric across cards, payments, onboarding.",
    ],
    blueSky: [
      "Agentic scam-intervention that coaches a customer mid-transaction.",
      "Federated fraud signals across consortium banks.",
    ],
    sources: [
      { name: "Fraud ops data", note: "False-decline rate 6.8%, rising chargebacks" },
      { name: "Regulatory scan", note: "Explainability + model-risk expectations" },
      { name: "Customer research", note: "Declines are #1 driver of churn intent" },
    ],
  },

  competitive: {
    positioning:
      "Win on explainable, real-time decisions that reduce false declines and losses simultaneously — not a black-box score.",
    competitors: [
      { name: "NeoPay", focus: "Fintech payments", strength: "Fast iteration", weakness: "Thin governance", share: 22 },
      { name: "FirstColumn Bank", focus: "Incumbent", strength: "Scale & trust", weakness: "Slow, legacy decisioning", share: 30 },
      { name: "ChargeGuard", focus: "Fraud vendor", strength: "Mature models", weakness: "Black-box, costly", share: 14 },
      { name: "Fabrikam Financial", focus: "Digital bank", strength: "First-party signal + Azure", weakness: "Fragmented real-time decisioning", share: 18 },
    ],
    whiteSpace: [
      "Explainable decisions surfaced to customers and auditors.",
      "Joint optimization of losses AND false declines.",
      "Reusable decisioning fabric across products.",
    ],
  },

  ideas: [
    {
      id: "i1",
      rank: 1,
      title: "FraudShield — Real-Time Explainable Decisioning",
      summary:
        "A sub-second fraud decisioning service with reason codes and audit trails that lowers false declines and losses across cards and payments.",
      scores: { impact: 95, feasibility: 82, cost: 72, risk: 70, strategicFit: 96, timeToMarket: 78, overall: 86 },
      impactScore: 95,
      justification: "Hits the top strategic goal, reuses first-party signal + Azure, and is differentiated on explainability and trust.",
      costBenefit: "~$1.6M build; ~$24M/yr combined loss + false-decline reduction.",
      riskNotes: "Model-risk governance and adversarial drift — mitigated by monitoring + explainability.",
      competitiveNotes: "Occupies white space incumbents and black-box vendors can't easily match.",
      tags: ["Fraud", "Real-time", "Responsible AI"],
    },
    {
      id: "i2", rank: 2, title: "AI Onboarding Concierge",
      summary: "Conversational onboarding that lifts digital account-opening conversion.",
      scores: { impact: 83, feasibility: 80, cost: 70, risk: 76, strategicFit: 84, timeToMarket: 80, overall: 79 },
      impactScore: 83,
      justification: "Strong conversion impact; complements FraudShield's identity signals.",
      costBenefit: "~$0.9M build; onboarding conversion uplift.",
      riskNotes: "KYC/AML compliance complexity.",
      competitiveNotes: "Parity feature with fintechs; defensive.",
      tags: ["Onboarding", "GenAI"],
    },
    {
      id: "i3", rank: 3, title: "Smart Money Coach",
      summary: "Personalized, consented financial insights and nudges.",
      scores: { impact: 78, feasibility: 76, cost: 68, risk: 74, strategicFit: 82, timeToMarket: 70, overall: 75 },
      impactScore: 78,
      justification: "Deepens primary-bank relationships but lower urgency.",
      costBenefit: "~$1.0M build; engagement + retention.",
      riskNotes: "Advice/suitability regulation.",
      competitiveNotes: "Differentiates on trust.",
      tags: ["Personalization", "Engagement"],
    },
    {
      id: "i4", rank: 4, title: "Dispute Auto-Resolver",
      summary: "Automates dispute intake, evidence, and resolution.",
      scores: { impact: 72, feasibility: 66, cost: 60, risk: 64, strategicFit: 70, timeToMarket: 58, overall: 66 },
      impactScore: 72,
      justification: "Real cost savings but heavy back-office integration.",
      costBenefit: "~$1.3M build; ops cost reduction.",
      riskNotes: "Network/scheme rule complexity.",
      competitiveNotes: "Operationally useful, not customer-facing differentiation.",
      tags: ["Disputes", "Automation"],
    },
    {
      id: "i5", rank: 5, title: "SMB Cashflow Forecaster",
      summary: "Cashflow forecasting for business-banking customers.",
      scores: { impact: 70, feasibility: 60, cost: 56, risk: 62, strategicFit: 66, timeToMarket: 52, overall: 62 },
      impactScore: 70,
      justification: "Promising niche; longer build and narrower audience.",
      costBenefit: "~$1.5M build; SMB stickiness.",
      riskNotes: "Forecast accuracy expectations.",
      competitiveNotes: "Adjacent to accounting platforms.",
      tags: ["SMB", "Forecasting"],
    },
  ],
  chosenIdeaId: "i1",

  triage: {
    chosen: { ideaId: "i1", title: "FraudShield — Real-Time Explainable Decisioning", rationale: "Highest weighted score (86), top strategic fit, largest measurable financial impact, reuses first-party signal + Azure." },
    notAdvanced: [
      { title: "AI Onboarding Concierge", reason: "Strong fast-follow; sequence after FraudShield." },
      { title: "Smart Money Coach", reason: "High fit, lower urgency." },
      { title: "Dispute Auto-Resolver", reason: "Back-office integration heavy." },
      { title: "SMB Cashflow Forecaster", reason: "Narrower audience; longer build." },
    ],
  },

  businessCase: {
    problem: "False declines (6.8%) drive churn while fraud losses rise; decisioning is fragmented, slow, and hard to explain to customers and regulators.",
    solution: "FraudShield — a sub-second, explainable decisioning service with reason codes and full audit trails across cards and payments.",
    market: "All card + payment transactions (initial focus: card-not-present).",
    roi: { investment: 1_600_000, year1Return: 24_000_000, year3Return: 78_000_000, paybackMonths: 5 },
    costs: [
      { label: "Engineering (build)", amount: 880_000 },
      { label: "Azure platform (ML, Event Hubs, Stream Analytics)", amount: 320_000 },
      { label: "Model risk & compliance", amount: 240_000 },
      { label: "Integration & rollout", amount: 160_000 },
    ],
    timeline: [
      { phase: "Real-time signal + features", duration: "4 weeks" },
      { phase: "Decisioning + explainability", duration: "5 weeks" },
      { phase: "Customer + auditor transparency", duration: "3 weeks" },
      { phase: "Shadow, pilot, launch", duration: "4 weeks" },
    ],
    risks: [
      "Model-risk governance — mitigated by monitoring, explainability, human review.",
      "Adversarial drift — continuous evaluation + retraining.",
      "Latency budget — streaming features + caching.",
    ],
    strategy: [
      "Differentiate on explainability for customers and regulators.",
      "Optimize losses and false declines jointly, not separately.",
      "Build a reusable decisioning fabric for future products.",
    ],
  },

  userStory: {
    id: "FF-2087",
    asA: "card or payments customer",
    iWant: "legitimate transactions approved instantly and risky ones stopped with a clear reason",
    soThat: "I'm protected from fraud without being wrongly declined",
    acceptance: [
      "Given a transaction, a decision returns in < 300ms with a reason code.",
      "Given a declined transaction, the customer sees a clear, non-sensitive explanation.",
      "Given an auditor, every decision is reproducible with feature attributions.",
      "Given model drift, monitoring alerts and can fail safe to rules.",
    ],
    nfrs: [
      "P99 decision latency < 300ms.",
      "99.99% availability with rules-based fallback.",
      "Full decision audit retention per policy.",
      "Explainability for 100% of decisions.",
    ],
    security: [
      "PCI-DSS scope minimized; tokenized PANs only.",
      "Managed identity for all service calls; no secrets in code.",
      "Model-risk governance and access controls.",
      "Encryption in transit and at rest; regional residency.",
    ],
    definitionOfReady: [
      { label: "Problem & value validated", done: true },
      { label: "Acceptance criteria agreed", done: true },
      { label: "NFRs & SLOs defined", done: true },
      { label: "Model risk & compliance reviewed", done: true },
      { label: "Dependencies identified", done: true },
    ],
    storyPoints: 13,
  },

  techPlan: {
    summary: "A streaming decisioning service on Azure that scores transactions in real time with explainable outputs and a rules fallback.",
    tasks: [
      { id: "T1", title: "Streaming features", detail: "Event Hubs + Stream Analytics feature pipeline.", estimate: "4d" },
      { id: "T2", title: "Scoring service", detail: "Azure ML online endpoint with explainability (SHAP).", estimate: "5d" },
      { id: "T3", title: "Decision API", detail: "Container Apps API with rules fallback + reason codes.", estimate: "4d" },
      { id: "T4", title: "Transparency", detail: "Customer + auditor decision views.", estimate: "3d" },
      { id: "T5", title: "Monitoring", detail: "Drift detection, App Insights, alerts.", estimate: "3d" },
    ],
  },

  adr: {
    title: "ADR-001: Real-time explainable decisioning on Azure",
    status: "Accepted",
    context: "Need sub-300ms decisions with explainability, auditability, and a safe fallback, aligned to the Well-Architected Framework and model-risk policy.",
    decisions: [
      { title: "Streaming features", choice: "Event Hubs + Stream Analytics", rationale: "Low-latency feature computation at scale." },
      { title: "Scoring", choice: "Azure ML online endpoint", rationale: "Managed, autoscaling, with explainability tooling." },
      { title: "Explainability", choice: "SHAP attributions + reason codes", rationale: "Customer + regulator transparency." },
      { title: "Fallback", choice: "Deterministic rules engine", rationale: "Fail-safe on model/endpoint issues (Reliability)." },
      { title: "Edge", choice: "API Management gateway", rationale: "Throttling, auth, observability." },
    ],
    azureServices: [
      { name: "Azure Event Hubs", purpose: "Transaction event ingestion" },
      { name: "Azure Stream Analytics", purpose: "Real-time feature computation" },
      { name: "Azure Machine Learning", purpose: "Scoring + explainability endpoint" },
      { name: "Azure Container Apps", purpose: "Decision API + rules fallback" },
      { name: "Azure Cosmos DB", purpose: "Decision audit store" },
      { name: "API Management", purpose: "Gateway: auth, throttling, metrics" },
      { name: "Application Insights", purpose: "Latency, drift & decision telemetry" },
      { name: "Microsoft Entra + Managed Identity", purpose: "Secretless auth" },
    ],
    bestPractices: [
      "Rules fallback for fail-safe decisions (WAF: Reliability).",
      "Explainability + audit for every decision (Responsible AI).",
      "Managed identity, tokenized PANs, minimized PCI scope (Security).",
      "Autoscaling endpoints + caching for cost (Cost Optimization).",
    ],
  },

  scaffold: {
    framework: "Azure Container Apps (api) · Azure ML (scoring) · Bicep (infra)",
    note: "Decisioning service, scoring endpoint, and infrastructure-as-code.",
    tree: [
      { path: "api/", kind: "dir" },
      { path: "api/src/decision.ts", kind: "file", note: "Decision API + reason codes" },
      { path: "api/src/rules.ts", kind: "file", note: "Deterministic fallback" },
      { path: "scoring/", kind: "dir" },
      { path: "scoring/score.py", kind: "file", note: "Azure ML scoring + SHAP" },
      { path: "infra/", kind: "dir" },
      { path: "infra/main.bicep", kind: "file", note: "Azure resources" },
      { path: "azure.yaml", kind: "file", note: "azd deployment config" },
    ],
  },

  code: {
    summary: "Representative slices: the decision API with explainable reason codes and the Azure infrastructure.",
    files: [
      {
        path: "api/src/decision.ts",
        language: "typescript",
        additions: 44,
        deletions: 0,
        content: [
          'import { app, HttpRequest, HttpResponseInit } from "@azure/functions";',
          'import { score } from "./mlClient";',
          'import { ruleDecision } from "./rules";',
          "",
          "const THRESHOLD = 0.82;",
          "",
          "export async function decide(req: HttpRequest): Promise<HttpResponseInit> {",
          "  const txn = await req.json();",
          "  try {",
          "    const { risk, attributions } = await score(txn); // Azure ML online endpoint",
          "    const action = risk >= THRESHOLD ? 'decline' : 'approve';",
          "    return { status: 200, jsonBody: {",
          "      action, risk,",
          "      reasonCodes: topReasons(attributions), // explainable",
          "      decisionId: txn.id,",
          "    } };",
          "  } catch {",
          "    return { status: 200, jsonBody: ruleDecision(txn) }; // fail-safe fallback",
          "  }",
          "}",
          "",
          'app.http("decide", { methods: ["POST"], authLevel: "function", handler: decide });',
        ].join("\n"),
      },
      {
        path: "infra/main.bicep",
        language: "bicep",
        additions: 26,
        deletions: 0,
        content: [
          "param location string = resourceGroup().location",
          "param namePrefix string = 'fraudshield'",
          "",
          "module hub 'modules/eventhubs.bicep' = { name: 'hub', params: { name: '${namePrefix}-hub', location: location } }",
          "module asa 'modules/streamanalytics.bicep' = { name: 'asa', params: { name: '${namePrefix}-asa', location: location } }",
          "module aml 'modules/aml.bicep' = { name: 'aml', params: { name: '${namePrefix}-aml', location: location } }",
          "module api 'modules/containerapp.bicep' = { name: 'api', params: { name: '${namePrefix}-api', location: location, minReplicas: 2, maxReplicas: 40 } }",
          "module rbac 'modules/rbac.bicep' = { name: 'rbac', params: { principalId: api.outputs.principalId, amlName: aml.outputs.name } }",
        ].join("\n"),
      },
    ],
  },

  patch: {
    summary: "Operator-requested optimization: cache stable customer features to cut scoring latency at peak.",
    files: [
      {
        path: "api/src/featureCache.ts",
        language: "typescript",
        additions: 14,
        deletions: 1,
        content: [
          "// Cache slowly-changing customer features to trim P99 at peak",
          "const cache = new Map<string, { features: number[]; exp: number }>();",
          "const TTL_MS = 60_000;",
          "",
          "export function cachedFeatures(customerId: string): number[] | null {",
          "  const hit = cache.get(customerId);",
          "  if (hit && hit.exp > Date.now()) return hit.features;",
          "  return null;",
          "}",
        ].join("\n"),
      },
    ],
  },

  testReport: {
    passed: 76, failed: 0, skipped: 2, coverage: 89,
    suites: [
      { name: "decisioning", tests: [
        { name: "returns decision < 300ms", status: "pass", durationMs: 188 },
        { name: "emits reason codes", status: "pass", durationMs: 71 },
        { name: "falls back to rules on error", status: "pass", durationMs: 64 },
      ] },
      { name: "explainability", tests: [
        { name: "attributions reproducible", status: "pass", durationMs: 96 },
        { name: "no PII in customer explanation", status: "pass", durationMs: 58 },
      ] },
      { name: "governance", tests: [
        { name: "decision audit persisted", status: "pass", durationMs: 80 },
        { name: "drift alert fires", status: "pass", durationMs: 73 },
        { name: "shadow-mode parity", status: "skip", durationMs: 0 },
      ] },
    ],
  },

  qualityGate: {
    gates: [
      { name: "Unit tests", status: "pass", detail: "76 passed · 0 failed · 89% coverage" },
      { name: "SAST (CodeQL)", status: "pass", detail: "No high/critical findings" },
      { name: "Dependency scan", status: "pass", detail: "0 known vulnerabilities" },
      { name: "Secret scan", status: "pass", detail: "No secrets detected" },
      { name: "Model risk checks", status: "pass", detail: "Explainability + audit verified" },
      { name: "PCI scope review", status: "warn", detail: "Confirm tokenization on one legacy path" },
    ],
  },

  pr: {
    repo: "fabrikam/fraudshield",
    branch: "feature/fraudshield",
    number: 311,
    title: "feat: FraudShield real-time explainable decisioning (FF-2087)",
    author: "developer-agent",
    filesChanged: 19,
    additions: 902,
    deletions: 28,
    commits: [
      { sha: "f2a1b90", message: "feat(api): decision endpoint with reason codes" },
      { sha: "9c4e2a1", message: "feat(scoring): Azure ML endpoint + SHAP" },
      { sha: "7b3d8f6", message: "feat(infra): Event Hubs + Stream Analytics + ACA" },
      { sha: "1e8a5c2", message: "test: decisioning, explainability, governance" },
    ],
    checks: [
      { name: "build", status: "pass" },
      { name: "unit-tests", status: "pass" },
      { name: "codeql", status: "pass" },
      { name: "bicep-validate", status: "pass" },
    ],
  },

  deployment: {
    environment: "Production (shadow → 20%)",
    version: "v1.0.0",
    region: "East US 2 + North Europe",
    status: "healthy",
    url: "https://decisioning.fabrikam.internal",
    steps: [
      { name: "Provision infra (azd up)", status: "pass" },
      { name: "Deploy scoring endpoint", status: "pass" },
      { name: "Deploy decision API", status: "pass" },
      { name: "Shadow + 20% live", status: "pass" },
    ],
  },

  dashboard: {
    metrics: [
      { label: "Decisions", value: "3.9M", unit: "/day", deltaPct: 6, good: "up", series: [3.4, 3.5, 3.6, 3.6, 3.7, 3.8, 3.8, 3.9, 3.9, 3.9, 3.9] },
      { label: "False declines", value: "3.1", unit: "%", deltaPct: -54, good: "down", series: [6.8, 6.2, 5.6, 5.0, 4.6, 4.1, 3.8, 3.5, 3.3, 3.2, 3.1] },
      { label: "Fraud loss rate", value: "0.06", unit: "%", deltaPct: -31, good: "down", series: [0.09, 0.088, 0.084, 0.08, 0.076, 0.072, 0.069, 0.067, 0.065, 0.062, 0.06] },
      { label: "P99 latency", value: "240", unit: "ms", deltaPct: -14, good: "down", series: [290, 285, 278, 270, 264, 258, 252, 248, 244, 242, 240] },
    ],
    slos: [
      { name: "Availability", target: 99.99, current: 99.995, unit: "%" },
      { name: "P99 latency", target: 300, current: 240, unit: "ms" },
      { name: "Explainability coverage", target: 100, current: 100, unit: "%" },
      { name: "Drift alerts actioned", target: 95, current: 98, unit: "%" },
    ],
  },

  optimization: {
    summary: "Peak-hour P99 is feature-fetch bound. Caching slowly-changing customer features reduces latency and scoring cost.",
    estimatedGainPct: 14,
    requestChanges: true,
    findings: [
      { title: "Feature-fetch latency", detail: "Stable customer features re-fetched per decision.", severity: "high" },
      { title: "Peak cost", detail: "Scoring spend concentrated at busy hours.", severity: "medium" },
      { title: "Cold endpoints", detail: "Occasional cold-start on scale-out.", severity: "low" },
    ],
    recommendation: "Add a short-TTL feature cache and min-replica warm pool; target ~14% lower P99 and scoring cost.",
  },

  gtm: {
    summary: "Roll out FraudShield in shadow, then progressively to live traffic, leading with trust and fewer wrongful declines.",
    segments: [
      { name: "Card-not-present", note: "Highest fraud + false-decline exposure" },
      { name: "Real-time payments", note: "Sub-second decisions required" },
      { name: "Onboarding", note: "Reuse identity signals next" },
    ],
    messaging: [
      "“Protected without the false alarms.”",
      "Every decision comes with a clear reason.",
      "Trusted by design — explainable and auditable.",
    ],
    channels: [
      { name: "In-app notifications", note: "Clear decline explanations" },
      { name: "Risk ops console", note: "Analyst transparency + overrides" },
      { name: "Regulator briefings", note: "Auditability evidence pack" },
    ],
    kpis: [
      { label: "False-decline rate", target: "≤ 3.2% by Q2" },
      { label: "Fraud loss rate", target: "-30%" },
      { label: "Decision latency P99", target: "< 300ms" },
      { label: "Customer trust (NPS)", target: "+8" },
    ],
    launchSteps: [
      { name: "Shadow mode (no customer impact)", when: "Week 1" },
      { name: "20% live traffic", when: "Week 3" },
      { name: "100% card-not-present", when: "Week 5" },
      { name: "Extend to payments", when: "Week 8" },
    ],
  },

  feedback: {
    summary: "Risk ops and customers respond well to transparency; asks focus on analyst override tooling and more languages for explanations.",
    items: [
      { source: "Risk analyst", persona: "Ops", text: "Reason codes make reviews far faster.", sentiment: "positive" },
      { source: "Customer", persona: "Cardholder", text: "Finally a clear reason instead of a generic decline.", sentiment: "positive" },
      { source: "Ops reviewer", persona: "Human-in-the-loop", text: "Approve — add analyst override workflow next.", sentiment: "neutral" },
      { source: "Compliance", persona: "Auditor", text: "Audit trail is solid; document retention policy.", sentiment: "neutral" },
    ],
  },
};
