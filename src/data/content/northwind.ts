import type { RunContent } from "@/data/content/types";

// ============================================================================
// Northwind Logistics — "ETA Radar" predictive delivery + exception prevention
// ============================================================================

export const northwindContent: RunContent = {
  businessId: "northwind-logistics",
  ideaTheme: "Predictive, proactive supply-chain visibility",

  marketBrief: {
    summary:
      "Shippers expect Amazon-grade predictability. Carriers that predict delays and act before they happen win loyalty and protect margin.",
    trends: [
      "Customers expect proactive, accurate ETAs — not after-the-fact tracking.",
      "Disruptions (weather, ports, labor) increasingly volatile.",
      "Control-tower visibility moving from nice-to-have to table stakes.",
      "AI demand-and-disruption forecasting maturing fast.",
    ],
    headwinds: [
      "Fragmented telematics + EDI data quality.",
      "Thin margins limit appetite for big bets.",
      "Driver and partner change-management.",
    ],
    tailwinds: [
      "Rich GPS, telematics, and order history signal.",
      "Existing Azure data estate and IoT ingestion.",
      "Executive mandate to cut late deliveries + expedite costs.",
    ],
    opportunities: [
      "Predict delays early and re-plan automatically.",
      "Proactive customer ETA updates that cut WISMO calls.",
      "Reusable exception-prediction fabric across lanes.",
    ],
    blueSky: [
      "Self-healing routes that re-optimize mid-transit.",
      "Carbon-aware routing as a premium service.",
    ],
    sources: [
      { name: "Ops data", note: "On-time rate 87.4%, expedite spend rising" },
      { name: "Customer research", note: "Predictability outranks raw speed" },
      { name: "Disruption scan", note: "Weather + port events drive most misses" },
    ],
  },

  competitive: {
    positioning:
      "Win on prediction + proactive action, not just visibility dashboards — prevent exceptions before they hit the customer.",
    competitors: [
      { name: "SwiftFreight", focus: "Asset-heavy carrier", strength: "Network scale", weakness: "Reactive tracking only", share: 28 },
      { name: "VisibilityCo", focus: "Visibility SaaS", strength: "Slick dashboards", weakness: "No action, predict-only", share: 16 },
      { name: "GlobalForward", focus: "3PL", strength: "Relationships", weakness: "Legacy tech", share: 26 },
      { name: "Northwind Logistics", focus: "Regional 3PL", strength: "First-party signal + Azure", weakness: "Reactive exception handling", share: 19 },
    ],
    whiteSpace: [
      "Early delay prediction with automated re-planning.",
      "Proactive, accurate customer ETA communications.",
      "Exception-prevention fabric reusable across lanes.",
    ],
  },

  ideas: [
    {
      id: "i1",
      rank: 1,
      title: "ETA Radar — Predictive Delivery & Exception Prevention",
      summary:
        "Predicts delivery delays early using telematics, weather, and order signals, then auto-re-plans and proactively updates customers.",
      scores: { impact: 94, feasibility: 80, cost: 70, risk: 72, strategicFit: 95, timeToMarket: 76, overall: 85 },
      impactScore: 94,
      justification: "Directly lifts on-time rate and cuts expedite spend, reuses first-party telematics + Azure, and is differentiated on action not just visibility.",
      costBenefit: "~$1.4M build; ~$19M/yr from fewer late deliveries + expedite savings.",
      riskNotes: "Data quality across carriers; mitigated by signal fusion + confidence scoring.",
      competitiveNotes: "Occupies the predict-and-act white space visibility vendors lack.",
      tags: ["Predictive", "Supply chain", "IoT"],
    },
    {
      id: "i2", rank: 2, title: "Dynamic Load Optimizer",
      summary: "AI load consolidation and routing to cut empty miles.",
      scores: { impact: 84, feasibility: 74, cost: 64, risk: 70, strategicFit: 86, timeToMarket: 68, overall: 78 },
      impactScore: 84,
      justification: "Strong margin impact; benefits from ETA Radar's predictions.",
      costBenefit: "~$1.2M build; fuel + utilization savings.",
      riskNotes: "Optimization complexity across constraints.",
      competitiveNotes: "Complements prediction; sequence second.",
      tags: ["Optimization", "Cost"],
    },
    {
      id: "i3", rank: 3, title: "Warehouse Demand Forecaster",
      summary: "Forecasts inbound volume to balance labor and dock capacity.",
      scores: { impact: 77, feasibility: 72, cost: 66, risk: 72, strategicFit: 80, timeToMarket: 66, overall: 74 },
      impactScore: 77,
      justification: "Good efficiency play; less customer-facing.",
      costBenefit: "~$1.0M build; labor + throughput gains.",
      riskNotes: "Forecast accuracy at site level.",
      competitiveNotes: "Internal efficiency, not differentiation.",
      tags: ["Forecasting", "Warehouse"],
    },
    {
      id: "i4", rank: 4, title: "Carbon-Aware Routing",
      summary: "Optional lower-emission routing as a premium service.",
      scores: { impact: 70, feasibility: 64, cost: 58, risk: 66, strategicFit: 72, timeToMarket: 56, overall: 66 },
      impactScore: 70,
      justification: "ESG upside but narrower near-term demand.",
      costBenefit: "~$0.9M build; premium service revenue.",
      riskNotes: "Emissions data fidelity.",
      competitiveNotes: "Emerging differentiator.",
      tags: ["Sustainability"],
    },
    {
      id: "i5", rank: 5, title: "Self-Service Booking Copilot",
      summary: "Conversational shipment booking for SMB shippers.",
      scores: { impact: 68, feasibility: 70, cost: 62, risk: 70, strategicFit: 64, timeToMarket: 64, overall: 64 },
      impactScore: 68,
      justification: "Convenience play; lower strategic urgency.",
      costBenefit: "~$0.8M build; SMB acquisition.",
      riskNotes: "Quote accuracy + integration.",
      competitiveNotes: "Parity with digital freight brokers.",
      tags: ["GenAI", "SMB"],
    },
  ],
  chosenIdeaId: "i1",

  triage: {
    chosen: { ideaId: "i1", title: "ETA Radar — Predictive Delivery & Exception Prevention", rationale: "Highest weighted score (85), top strategic fit, largest measurable impact on on-time rate and expedite spend, reuses telematics + Azure." },
    notAdvanced: [
      { title: "Dynamic Load Optimizer", reason: "Strong fast-follow once predictions exist." },
      { title: "Warehouse Demand Forecaster", reason: "Efficiency play, less customer-facing." },
      { title: "Carbon-Aware Routing", reason: "Narrower near-term demand." },
      { title: "Self-Service Booking Copilot", reason: "Lower strategic urgency." },
    ],
  },

  businessCase: {
    problem: "On-time delivery sits at 87.4% while expedite spend rises; exceptions are handled reactively, eroding customer trust and margin.",
    solution: "ETA Radar — predicts delays early from telematics, weather, and order signals, auto-re-plans, and proactively updates customers.",
    market: "All managed shipments (initial focus: high-volume regional lanes).",
    roi: { investment: 1_400_000, year1Return: 19_000_000, year3Return: 61_000_000, paybackMonths: 6 },
    costs: [
      { label: "Engineering (build)", amount: 760_000 },
      { label: "Azure platform (IoT, ML, Maps)", amount: 300_000 },
      { label: "Data integration (telematics/EDI)", amount: 220_000 },
      { label: "Rollout & change mgmt", amount: 120_000 },
    ],
    timeline: [
      { phase: "Signal fusion + ingestion", duration: "4 weeks" },
      { phase: "Delay prediction model", duration: "5 weeks" },
      { phase: "Auto re-plan + customer ETAs", duration: "4 weeks" },
      { phase: "Pilot lanes → scale", duration: "4 weeks" },
    ],
    risks: [
      "Data quality across carriers — mitigated by signal fusion + confidence scoring.",
      "Change management for dispatch — phased rollout + human override.",
      "Prediction accuracy — continuous evaluation + retraining.",
    ],
    strategy: [
      "Differentiate on prevention, not just visibility.",
      "Reuse first-party telematics as a defensible moat.",
      "Build a reusable exception-prediction fabric.",
    ],
  },

  userStory: {
    id: "NW-1442",
    asA: "shipper and dispatch coordinator",
    iWant: "early warning of delivery delays with an automatic re-plan and proactive customer updates",
    soThat: "we prevent late deliveries and avoid costly expedites",
    acceptance: [
      "Given a shipment, an ETA with confidence is produced and refreshed in near-real-time.",
      "Given a predicted delay, the system proposes a re-plan and notifies the customer.",
      "Given a high-risk exception, dispatch is alerted with recommended actions.",
      "Given low data quality, confidence is lowered and flagged.",
    ],
    nfrs: [
      "ETA refresh latency < 60s from new signal.",
      "99.9% availability for prediction API.",
      "Model evaluation + drift monitoring in place.",
      "Graceful degradation to last-known ETA.",
    ],
    security: [
      "Managed identity for all service-to-service calls.",
      "No secrets in code; Key Vault for credentials.",
      "Least-privilege access to telematics + customer data.",
      "Encryption in transit and at rest; regional residency.",
    ],
    definitionOfReady: [
      { label: "Problem & value validated", done: true },
      { label: "Acceptance criteria agreed", done: true },
      { label: "NFRs & SLOs defined", done: true },
      { label: "Data sources confirmed", done: true },
      { label: "Dependencies identified", done: true },
    ],
    storyPoints: 13,
  },

  techPlan: {
    summary: "An event-driven prediction service on Azure that fuses telematics, weather, and order signals to forecast delays and trigger re-plans.",
    tasks: [
      { id: "T1", title: "Signal ingestion", detail: "IoT Hub + Event Hubs for telematics; weather + order feeds.", estimate: "4d" },
      { id: "T2", title: "Feature + fusion", detail: "Stream Analytics features with confidence scoring.", estimate: "4d" },
      { id: "T3", title: "Prediction service", detail: "Azure ML endpoint for ETA + delay probability.", estimate: "5d" },
      { id: "T4", title: "Re-plan + notify", detail: "Functions to re-plan and push customer ETAs.", estimate: "4d" },
      { id: "T5", title: "Monitoring", detail: "Drift detection, App Insights, dispatch alerts.", estimate: "3d" },
    ],
  },

  adr: {
    title: "ADR-001: Event-driven predictive ETA on Azure",
    status: "Accepted",
    context: "Need near-real-time delay prediction and automated re-planning with resilient degradation, aligned to the Well-Architected Framework.",
    decisions: [
      { title: "Ingestion", choice: "Azure IoT Hub + Event Hubs", rationale: "Scalable telematics + event ingestion." },
      { title: "Features", choice: "Stream Analytics + signal fusion", rationale: "Low-latency features with confidence." },
      { title: "Prediction", choice: "Azure ML online endpoint", rationale: "Managed, autoscaling ETA + delay model." },
      { title: "Orchestration", choice: "Azure Functions", rationale: "Event-driven re-plan + notifications." },
      { title: "Degradation", choice: "Last-known ETA fallback", rationale: "Resilience on low data quality (Reliability)." },
    ],
    azureServices: [
      { name: "Azure IoT Hub", purpose: "Telematics ingestion" },
      { name: "Azure Event Hubs", purpose: "Order + event streaming" },
      { name: "Azure Stream Analytics", purpose: "Real-time feature fusion" },
      { name: "Azure Machine Learning", purpose: "ETA + delay prediction endpoint" },
      { name: "Azure Functions", purpose: "Re-plan + customer notifications" },
      { name: "Azure Maps", purpose: "Routing + travel-time signals" },
      { name: "Azure Cosmos DB", purpose: "Shipment state + ETA history" },
      { name: "Application Insights", purpose: "Telemetry, drift & alerts" },
    ],
    bestPractices: [
      "Graceful degradation to last-known ETA (WAF: Reliability).",
      "Confidence scoring + drift monitoring (Responsible AI).",
      "Managed identity + Key Vault, least privilege (Security).",
      "Autoscaling + consumption Functions for cost (Cost Optimization).",
    ],
  },

  scaffold: {
    framework: "Azure Functions (orchestration) · Azure ML (prediction) · Bicep (infra)",
    note: "Prediction service, event-driven re-plan, and infrastructure-as-code.",
    tree: [
      { path: "functions/", kind: "dir" },
      { path: "functions/predictEta.ts", kind: "file", note: "ETA + delay prediction handler" },
      { path: "functions/replan.ts", kind: "file", note: "Re-plan + notify on predicted delay" },
      { path: "scoring/", kind: "dir" },
      { path: "scoring/score.py", kind: "file", note: "Azure ML ETA model" },
      { path: "infra/", kind: "dir" },
      { path: "infra/main.bicep", kind: "file", note: "Azure resources" },
      { path: "azure.yaml", kind: "file", note: "azd deployment config" },
    ],
  },

  code: {
    summary: "Representative slices: the predicted-delay re-plan handler and the Azure infrastructure.",
    files: [
      {
        path: "functions/replan.ts",
        language: "typescript",
        additions: 40,
        deletions: 0,
        content: [
          'import { app, InvocationContext } from "@azure/functions";',
          'import { predictEta } from "./mlClient";',
          'import { notifyCustomer } from "./notify";',
          'import { reroute } from "./routing";',
          "",
          "const DELAY_RISK = 0.7;",
          "",
          "export async function replan(event: any, ctx: InvocationContext): Promise<void> {",
          "  const { shipmentId, signal } = event;",
          "  const { etaMinutes, delayProbability, confidence } = await predictEta(signal);",
          "",
          "  if (delayProbability >= DELAY_RISK && confidence > 0.6) {",
          "    const plan = await reroute(shipmentId); // propose recovery route",
          "    await notifyCustomer(shipmentId, { etaMinutes, reason: 'weather/traffic' });",
          "    ctx.log(`Re-planned ${shipmentId}: saved ${plan.minutesSaved}m`);",
          "  }",
          "}",
          "",
          'app.eventHub("replan", { connection: "EH_CONN", eventHubName: "signals", handler: replan });',
        ].join("\n"),
      },
      {
        path: "infra/main.bicep",
        language: "bicep",
        additions: 24,
        deletions: 0,
        content: [
          "param location string = resourceGroup().location",
          "param namePrefix string = 'etaradar'",
          "",
          "module iot 'modules/iothub.bicep' = { name: 'iot', params: { name: '${namePrefix}-iot', location: location } }",
          "module hub 'modules/eventhubs.bicep' = { name: 'hub', params: { name: '${namePrefix}-hub', location: location } }",
          "module aml 'modules/aml.bicep' = { name: 'aml', params: { name: '${namePrefix}-aml', location: location } }",
          "module fn 'modules/functions.bicep' = { name: 'fn', params: { name: '${namePrefix}-fn', location: location } }",
          "module rbac 'modules/rbac.bicep' = { name: 'rbac', params: { principalId: fn.outputs.principalId, amlName: aml.outputs.name } }",
        ].join("\n"),
      },
    ],
  },

  patch: {
    summary: "Operator-requested optimization: batch customer notifications to cut function executions and cost during disruption spikes.",
    files: [
      {
        path: "functions/notify.ts",
        language: "typescript",
        additions: 12,
        deletions: 2,
        content: [
          "// Debounce + batch notifications during disruption spikes",
          "const queue = new Map<string, number>();",
          "const WINDOW_MS = 30_000;",
          "",
          "export function enqueueNotify(shipmentId: string, etaMinutes: number) {",
          "  queue.set(shipmentId, etaMinutes); // collapse rapid updates",
          "}",
        ].join("\n"),
      },
    ],
  },

  testReport: {
    passed: 71, failed: 0, skipped: 3, coverage: 87,
    suites: [
      { name: "prediction", tests: [
        { name: "produces ETA + confidence", status: "pass", durationMs: 142 },
        { name: "flags low data quality", status: "pass", durationMs: 66 },
        { name: "degrades to last-known ETA", status: "pass", durationMs: 58 },
      ] },
      { name: "replan", tests: [
        { name: "triggers on high delay risk", status: "pass", durationMs: 88 },
        { name: "notifies customer once", status: "pass", durationMs: 61 },
        { name: "skips when confidence low", status: "pass", durationMs: 54 },
      ] },
      { name: "resilience", tests: [
        { name: "handles missing telematics", status: "pass", durationMs: 70 },
        { name: "chaos: endpoint timeout", status: "skip", durationMs: 0 },
      ] },
    ],
  },

  qualityGate: {
    gates: [
      { name: "Unit tests", status: "pass", detail: "71 passed · 0 failed · 87% coverage" },
      { name: "SAST (CodeQL)", status: "pass", detail: "No high/critical findings" },
      { name: "Dependency scan", status: "pass", detail: "0 known vulnerabilities" },
      { name: "Secret scan", status: "pass", detail: "No secrets detected" },
      { name: "IaC validation (bicep)", status: "pass", detail: "What-if clean; WAF aligned" },
      { name: "Data-quality checks", status: "warn", detail: "One carrier feed below freshness target" },
    ],
  },

  pr: {
    repo: "northwind/eta-radar",
    branch: "feature/eta-radar",
    number: 207,
    title: "feat: ETA Radar predictive delivery + exception prevention (NW-1442)",
    author: "developer-agent",
    filesChanged: 21,
    additions: 968,
    deletions: 22,
    commits: [
      { sha: "a91c4d2", message: "feat(ingestion): IoT Hub + Event Hubs signal intake" },
      { sha: "5f7b9e0", message: "feat(ml): ETA + delay probability endpoint" },
      { sha: "c2d6a18", message: "feat(functions): re-plan + customer notifications" },
      { sha: "8e1f3b7", message: "test: prediction, replan, resilience suites" },
    ],
    checks: [
      { name: "build", status: "pass" },
      { name: "unit-tests", status: "pass" },
      { name: "codeql", status: "pass" },
      { name: "bicep-validate", status: "pass" },
    ],
  },

  deployment: {
    environment: "Production (pilot lanes)",
    version: "v1.0.0",
    region: "Central US + West Europe",
    status: "healthy",
    url: "https://eta-radar.northwind.internal",
    steps: [
      { name: "Provision infra (azd up)", status: "pass" },
      { name: "Deploy ML endpoint", status: "pass" },
      { name: "Deploy functions", status: "pass" },
      { name: "Enable pilot lanes", status: "pass" },
    ],
  },

  dashboard: {
    metrics: [
      { label: "Shipments tracked", value: "212K", unit: "/day", deltaPct: 5, good: "up", series: [188, 192, 196, 199, 202, 205, 207, 209, 210, 211, 212] },
      { label: "On-time rate", value: "94.6", unit: "%", deltaPct: 8, good: "up", series: [87.4, 88.6, 89.8, 90.9, 91.8, 92.6, 93.3, 93.8, 94.1, 94.4, 94.6] },
      { label: "Expedite spend", value: "-27", unit: "%", deltaPct: -27, good: "down", series: [100, 96, 92, 88, 84, 80, 77, 75, 73, 72, 73] },
      { label: "ETA refresh", value: "42", unit: "s", deltaPct: -19, good: "down", series: [62, 58, 55, 52, 50, 48, 46, 45, 44, 43, 42] },
    ],
    slos: [
      { name: "Availability", target: 99.9, current: 99.96, unit: "%" },
      { name: "ETA refresh latency", target: 60, current: 42, unit: "s" },
      { name: "Prediction precision", target: 85, current: 90, unit: "%" },
      { name: "Drift alerts actioned", target: 95, current: 97, unit: "%" },
    ],
  },

  optimization: {
    summary: "During disruption spikes, per-event notifications inflate function executions and cost. Batching updates reduces spend without hurting timeliness.",
    estimatedGainPct: 16,
    requestChanges: true,
    findings: [
      { title: "Notification fan-out", detail: "Rapid ETA changes trigger many sends per shipment.", severity: "high" },
      { title: "Spiky execution cost", detail: "Function spend peaks during weather events.", severity: "medium" },
      { title: "Redundant predictions", detail: "Low-movement shipments re-scored too often.", severity: "low" },
    ],
    recommendation: "Add a 30s debounce/batch on notifications and movement-gated re-scoring; target ~16% lower execution cost.",
  },

  gtm: {
    summary: "Launch ETA Radar on pilot lanes, lead with predictability and proactive updates, then scale network-wide.",
    segments: [
      { name: "High-volume regional lanes", note: "Best signal density + impact" },
      { name: "Retail shippers", note: "Predictability drives loyalty" },
      { name: "SMB shippers", note: "Expand after pilot proves out" },
    ],
    messaging: [
      "“Know before it's late.”",
      "Proactive ETAs, fewer surprises.",
      "Prevent exceptions — don't just watch them.",
    ],
    channels: [
      { name: "Customer portal + alerts", note: "Proactive ETA notifications" },
      { name: "Dispatch console", note: "Recommended recovery actions" },
      { name: "Account teams", note: "Predictability as a differentiator" },
    ],
    kpis: [
      { label: "On-time rate", target: "≥ 94% by Q2" },
      { label: "Expedite spend", target: "-25%" },
      { label: "WISMO contacts", target: "-30%" },
      { label: "Customer NPS", target: "+10" },
    ],
    launchSteps: [
      { name: "Pilot lanes (proactive ETAs)", when: "Week 1" },
      { name: "Enable auto re-plan", when: "Week 3" },
      { name: "Scale to all regional lanes", when: "Week 6" },
      { name: "Network-wide rollout", when: "Week 10" },
    ],
  },

  feedback: {
    summary: "Dispatchers and shippers value the early warnings; main asks are tuning alert thresholds and adding carrier-level data-quality views.",
    items: [
      { source: "Dispatch coordinator", persona: "Ops", text: "Early delay alerts let us recover before the customer notices.", sentiment: "positive" },
      { source: "Shipper", persona: "Customer", text: "Proactive ETA updates cut our check-in calls dramatically.", sentiment: "positive" },
      { source: "Ops reviewer", persona: "Human-in-the-loop", text: "Approve — let us tune alert thresholds per lane.", sentiment: "neutral" },
      { source: "Data engineer", persona: "Platform", text: "Add a carrier-level data-quality view to triage feeds.", sentiment: "neutral" },
    ],
  },
};
