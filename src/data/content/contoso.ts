import type { RunContent } from "@/data/content/types";

// ============================================================================
// Contoso Retail — "Aisle Copilot" conversational shopping assistant
// The fully-detailed golden-path demo run.
// ============================================================================

export const contosoContent: RunContent = {
  businessId: "contoso-retail",
  ideaTheme: "AI-personalized, unified omnichannel shopping",

  marketBrief: {
    summary:
      "Retail is consolidating spend around experiences that feel personal and effortless across web, app, and store. Generative AI is the first credible path to 1:1 assistance at scale.",
    trends: [
      "Conversational commerce moving from novelty to expected, especially on mobile.",
      "Shoppers reward retailers that remember context across channels (online ↔ store).",
      "Retail media networks make first-party data and engagement strategically valuable.",
      "Associates increasingly augmented with AI clienteling tools on the floor.",
    ],
    headwinds: [
      "Margin pressure and cautious discretionary spend.",
      "Privacy regulation (GDPR/CCPA) tightening data use.",
      "Customer distrust of generic chatbots after poor early experiences.",
    ],
    tailwinds: [
      "Mature first-party loyalty data (38M members) ready to activate.",
      "Existing Azure footprint shortens time-to-value.",
      "Store associates want better assist tools — high internal pull.",
    ],
    opportunities: [
      "Grounded, brand-safe assistant that spans discovery → purchase → store pickup.",
      "Turn loyalty data into real-time, consented personalization.",
      "Unlock retail-media-quality engagement signals from assisted sessions.",
    ],
    blueSky: [
      "Ambient in-aisle assistant via store Wi-Fi + electronic shelf labels.",
      "Agentic 'shop for me' that assembles baskets against a budget and occasion.",
    ],
    sources: [
      { name: "Internal loyalty analytics", note: "38M members, 22% lapsed in 12mo" },
      { name: "Industry trend scan", note: "Conversational commerce adoption curve" },
      { name: "Store ops survey", note: "Associates cite product lookup as #1 friction" },
    ],
  },

  competitive: {
    positioning:
      "Win on trust and unification: grounded answers from Contoso's own catalog + loyalty context, consistent online and in-store — not a generic bolt-on chatbot.",
    competitors: [
      {
        name: "MegaMart",
        focus: "Price & scale",
        strength: "Logistics and price leadership",
        weakness: "Impersonal, weak loyalty engagement",
        share: 34,
      },
      {
        name: "StyleHaus",
        focus: "Fashion DTC",
        strength: "Strong brand and styling content",
        weakness: "Thin omnichannel, no store network",
        share: 12,
      },
      {
        name: "QuickCart",
        focus: "Marketplace",
        strength: "Selection breadth",
        weakness: "Low trust, generic recommendations",
        share: 18,
      },
      {
        name: "Contoso Retail",
        focus: "Omnichannel + loyalty",
        strength: "Stores + 38M loyalty members",
        weakness: "Fragmented digital personalization",
        share: 16,
      },
    ],
    whiteSpace: [
      "Grounded assistant that cites real catalog + inventory.",
      "Cross-channel memory (cart and intent follow the shopper into the store).",
      "Consented, explainable personalization that builds trust.",
    ],
  },

  ideas: [
    {
      id: "i1",
      rank: 1,
      title: "Aisle Copilot — Conversational Shopping Assistant",
      summary:
        "A grounded, brand-safe AI assistant across web, app, and in-store kiosks that answers product questions, personalizes recommendations from loyalty context, and completes purchases or store pickup.",
      scores: {
        impact: 94,
        feasibility: 85,
        cost: 76,
        risk: 78,
        strategicFit: 96,
        timeToMarket: 82,
        overall: 87,
      },
      impactScore: 94,
      justification:
        "Directly advances all three strategic goals, leverages existing loyalty data and Azure footprint, and is differentiated on trust + unification.",
      costBenefit:
        "~$1.4M build; projected $11M incremental Y1 revenue via higher conversion and basket size.",
      riskNotes: "Hallucination and privacy risk — mitigated by RAG grounding and consent.",
      competitiveNotes: "Occupies the white space rivals can't easily match without stores + loyalty.",
      tags: ["GenAI", "Personalization", "Omnichannel"],
    },
    {
      id: "i2",
      rank: 2,
      title: "Predictive Replenishment Subscriptions",
      summary:
        "Auto-reorder of household essentials with AI-timed delivery and dynamic bundles.",
      scores: {
        impact: 82,
        feasibility: 78,
        cost: 70,
        risk: 74,
        strategicFit: 80,
        timeToMarket: 72,
        overall: 77,
      },
      impactScore: 82,
      justification: "Strong recurring revenue but narrower than a cross-journey assistant.",
      costBenefit: "~$0.9M build; steady subscription margin uplift.",
      riskNotes: "Forecast accuracy and over-shipping complaints.",
      competitiveNotes: "Table stakes vs. MegaMart; defensive more than differentiating.",
      tags: ["Subscriptions", "Forecasting"],
    },
    {
      id: "i3",
      rank: 3,
      title: "Unified Loyalty Wallet",
      summary: "Cross-channel loyalty wallet with personalized, consented offers.",
      scores: {
        impact: 79,
        feasibility: 74,
        cost: 66,
        risk: 72,
        strategicFit: 85,
        timeToMarket: 64,
        overall: 74,
      },
      impactScore: 79,
      justification: "High strategic fit but heavy integration across legacy POS.",
      costBenefit: "~$1.1M build; loyalty engagement lift.",
      riskNotes: "POS integration complexity across 1,200 stores.",
      competitiveNotes: "Strengthens the moat; complements the assistant.",
      tags: ["Loyalty", "Offers"],
    },
    {
      id: "i4",
      rank: 4,
      title: "AR Virtual Try-On",
      summary: "Augmented-reality try-on for apparel and home goods.",
      scores: {
        impact: 71,
        feasibility: 58,
        cost: 52,
        risk: 60,
        strategicFit: 66,
        timeToMarket: 50,
        overall: 62,
      },
      impactScore: 71,
      justification: "High delight, but costly content pipeline and narrower catalog fit.",
      costBenefit: "~$2.2M build; uncertain conversion lift.",
      riskNotes: "3D asset creation cost and device fragmentation.",
      competitiveNotes: "StyleHaus already partially here.",
      tags: ["AR", "Discovery"],
    },
    {
      id: "i5",
      rank: 5,
      title: "Dynamic Shelf Pricing & Demand Sensing",
      summary: "Electronic shelf labels driven by real-time demand and inventory AI.",
      scores: {
        impact: 74,
        feasibility: 55,
        cost: 48,
        risk: 56,
        strategicFit: 70,
        timeToMarket: 44,
        overall: 60,
      },
      impactScore: 74,
      justification: "Strong margin tool but hardware rollout is slow and capital-heavy.",
      costBenefit: "~$4M+ capex; margin optimization over 3 years.",
      riskNotes: "Hardware logistics and price-perception backlash.",
      competitiveNotes: "Operationally differentiating but not customer-facing.",
      tags: ["Pricing", "IoT"],
    },
  ],
  chosenIdeaId: "i1",

  triage: {
    chosen: {
      ideaId: "i1",
      title: "Aisle Copilot — Conversational Shopping Assistant",
      rationale:
        "Highest weighted score (87), best strategic fit, reuses loyalty data + Azure, and lands in defensible white space. Fastest credible path to measurable digital revenue.",
    },
    notAdvanced: [
      { title: "Predictive Replenishment Subscriptions", reason: "Strong but narrower; revisit as a fast-follow." },
      { title: "Unified Loyalty Wallet", reason: "High fit but POS integration risk; sequence after the assistant." },
      { title: "AR Virtual Try-On", reason: "Costly content pipeline; lower near-term ROI." },
      { title: "Dynamic Shelf Pricing", reason: "Capital-heavy hardware rollout; not customer-facing." },
    ],
  },

  businessCase: {
    problem:
      "Contoso's digital personalization is fragmented; shoppers get generic experiences and abandon, while 38M loyalty members are under-activated and store/online context is disconnected.",
    solution:
      "Aisle Copilot — a grounded conversational assistant spanning web, app, and store kiosks that personalizes from consented loyalty context and completes purchase or pickup.",
    market:
      "All digital shoppers (initial focus: 38M loyalty members; ~9M monthly active digital users).",
    roi: { investment: 1_400_000, year1Return: 11_000_000, year3Return: 42_000_000, paybackMonths: 7 },
    costs: [
      { label: "Engineering (build, 2 squads · 4 mo)", amount: 820_000 },
      { label: "Azure platform (OpenAI, AI Search, ACA, Cosmos)", amount: 260_000 },
      { label: "Data, security & compliance", amount: 180_000 },
      { label: "Change mgmt & store enablement", amount: 140_000 },
    ],
    timeline: [
      { phase: "Foundation & RAG grounding", duration: "4 weeks" },
      { phase: "Assistant + loyalty personalization", duration: "5 weeks" },
      { phase: "Store kiosk + pickup flow", duration: "4 weeks" },
      { phase: "Hardening, pilot, launch", duration: "3 weeks" },
    ],
    risks: [
      "Hallucination / brand safety — mitigated via retrieval grounding + guardrails.",
      "Privacy — explicit consent, data minimization, regional residency.",
      "Adoption — associate enablement and in-app nudges.",
    ],
    strategy: [
      "Differentiate on trust: cite real catalog + inventory, never invent.",
      "Lead with unification rivals can't match (stores + loyalty).",
      "Instrument every assisted session as a first-party engagement signal.",
    ],
  },

  userStory: {
    id: "CR-1042",
    asA: "loyalty shopper on web, app, or an in-store kiosk",
    iWant: "to ask natural questions and get personalized, accurate product help that remembers my context",
    soThat: "I can find the right items faster and check out or pick up in store with confidence",
    acceptance: [
      "Given a product question, the assistant answers using only grounded catalog + inventory data and cites the source items.",
      "Given a signed-in member with consent, recommendations reflect purchase history and stated preferences.",
      "Given low stock at the chosen store, the assistant offers pickup alternatives or ship-to-home.",
      "Given an out-of-scope or unsafe request, the assistant safely declines and offers a handoff.",
      "Conversation context persists across web, app, and kiosk for the same member.",
    ],
    nfrs: [
      "P95 response < 2.5s; streamed tokens begin < 800ms.",
      "99.9% availability; graceful degradation to search-only.",
      "WCAG 2.1 AA; full keyboard and screen-reader support.",
      "Cost per assisted session ≤ $0.04 at target volume.",
    ],
    security: [
      "Consent captured and enforced before using personal data.",
      "PII minimization; regional data residency (EU/NA).",
      "Prompt-injection and jailbreak guardrails; content safety filters.",
      "Managed identity for all Azure service-to-service calls; no secrets in code.",
    ],
    definitionOfReady: [
      { label: "Problem & value validated", done: true },
      { label: "Acceptance criteria agreed", done: true },
      { label: "NFRs & SLOs defined", done: true },
      { label: "Security & privacy reviewed", done: true },
      { label: "Dependencies identified", done: true },
    ],
    storyPoints: 13,
  },

  techPlan: {
    summary:
      "Deliver a streaming RAG assistant on Azure with loyalty-aware personalization, exposed to web/app/kiosk via a single API behind API Management.",
    tasks: [
      { id: "T1", title: "Retrieval index", detail: "Index catalog + inventory into Azure AI Search (hybrid + semantic).", estimate: "3d" },
      { id: "T2", title: "Chat orchestration", detail: "Azure Functions endpoint with Azure OpenAI, RAG grounding + guardrails.", estimate: "5d" },
      { id: "T3", title: "Personalization", detail: "Consented loyalty features from Cosmos DB; rank recommendations.", estimate: "4d" },
      { id: "T4", title: "Web/app widget", detail: "React streaming chat component with accessibility.", estimate: "4d" },
      { id: "T5", title: "Kiosk + pickup", detail: "Store mode, inventory check, pickup/ship fallback.", estimate: "4d" },
      { id: "T6", title: "Observability & cost", detail: "App Insights, token metrics, semantic cache.", estimate: "2d" },
    ],
  },

  adr: {
    title: "ADR-001: Grounded assistant architecture on Azure",
    status: "Accepted",
    context:
      "Need a low-latency, brand-safe assistant that grounds on first-party data, personalizes with consent, scales elastically, and aligns to the Azure Well-Architected Framework.",
    decisions: [
      { title: "RAG over fine-tuning", choice: "Retrieval-Augmented Generation with Azure AI Search", rationale: "Fresh catalog data, lower cost, fewer hallucinations, easier governance." },
      { title: "Compute", choice: "Azure Container Apps + Azure Functions", rationale: "Elastic scale-to-zero, simple ops, event-friendly." },
      { title: "Model", choice: "Azure OpenAI GPT-4o mini + embeddings", rationale: "Latency/cost balance with streaming; enterprise data boundary." },
      { title: "State", choice: "Cosmos DB (sessions + consented features)", rationale: "Global low-latency, flexible schema, TTL for session memory." },
      { title: "Edge", choice: "API Management as AI gateway", rationale: "Token limits, semantic caching, content safety, routing." },
    ],
    azureServices: [
      { name: "Azure OpenAI", purpose: "Chat + embeddings (RAG)" },
      { name: "Azure AI Search", purpose: "Hybrid + semantic retrieval over catalog/inventory" },
      { name: "Azure Container Apps", purpose: "Assistant API hosting" },
      { name: "Azure Functions", purpose: "Chat orchestration & tools" },
      { name: "Azure Cosmos DB", purpose: "Session memory & consented features" },
      { name: "API Management", purpose: "AI gateway: caching, token limits, safety" },
      { name: "Application Insights", purpose: "Telemetry, latency & token metrics" },
      { name: "Microsoft Entra + Managed Identity", purpose: "Secretless service auth" },
    ],
    bestPractices: [
      "Managed identity everywhere; no secrets in code (WAF: Security).",
      "Retrieval grounding + content safety (Responsible AI).",
      "Scale-to-zero and semantic caching for cost (WAF: Cost Optimization).",
      "Health probes, retries, and graceful degradation (WAF: Reliability).",
    ],
  },

  scaffold: {
    framework: "React 18 + TypeScript (web) · Azure Functions (api) · Bicep (infra)",
    note: "Monorepo with web widget, assistant API, and infrastructure-as-code.",
    tree: [
      { path: "web/", kind: "dir" },
      { path: "web/src/components/AisleCopilot.tsx", kind: "file", note: "Streaming chat widget" },
      { path: "web/src/lib/recommendations.ts", kind: "file", note: "Loyalty-aware ranking" },
      { path: "api/", kind: "dir" },
      { path: "api/src/functions/chat.ts", kind: "file", note: "RAG chat orchestration" },
      { path: "api/src/lib/retrieval.ts", kind: "file", note: "Azure AI Search client" },
      { path: "api/src/lib/guardrails.ts", kind: "file", note: "Safety + grounding checks" },
      { path: "infra/", kind: "dir" },
      { path: "infra/main.bicep", kind: "file", note: "Azure resources" },
      { path: "azure.yaml", kind: "file", note: "azd deployment config" },
    ],
  },

  code: {
    summary:
      "Representative slices of the change set: the streaming chat widget, the grounded chat orchestration function, and the Azure infrastructure.",
    files: [
      {
        path: "api/src/functions/chat.ts",
        language: "typescript",
        additions: 58,
        deletions: 0,
        content: [
          'import { app, HttpRequest, HttpResponseInit } from "@azure/functions";',
          'import { AzureOpenAI } from "openai";',
          'import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";',
          'import { retrieveGrounding } from "../lib/retrieval";',
          'import { isSafe, groundedSystemPrompt } from "../lib/guardrails";',
          "",
          "const credential = new DefaultAzureCredential();",
          'const scope = "https://cognitiveservices.azure.com/.default";',
          "const client = new AzureOpenAI({",
          "  azureADTokenProvider: getBearerTokenProvider(credential, scope),",
          '  endpoint: process.env.AOAI_ENDPOINT, apiVersion: "2024-08-01-preview",',
          "});",
          "",
          "export async function chat(req: HttpRequest): Promise<HttpResponseInit> {",
          "  const { message, memberId } = await req.json();",
          "  if (!isSafe(message)) {",
          '    return { status: 200, jsonBody: { reply: "I can only help with Contoso products." } };',
          "  }",
          "  // Ground answers in first-party catalog + inventory (RAG)",
          "  const context = await retrieveGrounding(message, memberId);",
          "  const completion = await client.chat.completions.create({",
          '    model: "gpt-4o-mini",',
          "    stream: true,",
          "    messages: [",
          "      { role: 'system', content: groundedSystemPrompt(context) },",
          "      { role: 'user', content: message },",
          "    ],",
          "  });",
          "  return { status: 200, body: toEventStream(completion) };",
          "}",
          "",
          'app.http("chat", { methods: ["POST"], authLevel: "anonymous", handler: chat });',
        ].join("\n"),
      },
      {
        path: "web/src/components/AisleCopilot.tsx",
        language: "tsx",
        additions: 47,
        deletions: 0,
        content: [
          'import { useState } from "react";',
          'import { streamChat } from "../lib/client";',
          "",
          "export function AisleCopilot({ memberId }: { memberId?: string }) {",
          "  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);",
          '  const [input, setInput] = useState("");',
          "",
          "  async function send() {",
          "    const text = input.trim();",
          "    if (!text) return;",
          '    setInput("");',
          "    setMessages((m) => [...m, { role: 'user', text }]);",
          "    let reply = '';",
          "    for await (const token of streamChat(text, memberId)) {",
          "      reply += token;",
          "      setMessages((m) => upsertAssistant(m, reply));",
          "    }",
          "  }",
          "",
          "  return (",
          '    <section className="copilot" role="log" aria-live="polite">',
          "      {messages.map((m, i) => (",
          '        <div key={i} className={m.role}>{m.text}</div>',
          "      ))}",
          '      <form onSubmit={(e) => { e.preventDefault(); send(); }}>',
          '        <input value={input} onChange={(e) => setInput(e.target.value)}',
          '          aria-label="Ask Aisle Copilot" placeholder="Ask about products, sizes, pickup…" />',
          "      </form>",
          "    </section>",
          "  );",
          "}",
        ].join("\n"),
      },
      {
        path: "infra/main.bicep",
        language: "bicep",
        additions: 34,
        deletions: 0,
        content: [
          "param location string = resourceGroup().location",
          "param namePrefix string = 'aisle'",
          "",
          "// Assistant API on Azure Container Apps (scale-to-zero)",
          "module api 'modules/containerapp.bicep' = {",
          "  name: 'api'",
          "  params: { name: '${namePrefix}-api', location: location, minReplicas: 0, maxReplicas: 30 }",
          "}",
          "",
          "// Azure OpenAI + AI Search for grounded RAG",
          "module aoai 'modules/openai.bicep' = { name: 'aoai', params: { name: '${namePrefix}-aoai', location: location } }",
          "module search 'modules/search.bicep' = { name: 'search', params: { name: '${namePrefix}-search', location: location } }",
          "",
          "// Cosmos DB for session memory + consented features (TTL enabled)",
          "module cosmos 'modules/cosmos.bicep' = { name: 'cosmos', params: { name: '${namePrefix}-cosmos', location: location } }",
          "",
          "// Managed identity role assignments (no secrets in code)",
          "module rbac 'modules/rbac.bicep' = {",
          "  name: 'rbac'",
          "  params: { principalId: api.outputs.principalId, aoaiName: aoai.outputs.name, searchName: search.outputs.name }",
          "}",
        ].join("\n"),
      },
    ],
  },

  patch: {
    summary: "Operator-requested optimization: add semantic caching at the AI gateway to cut latency and token cost.",
    files: [
      {
        path: "api/src/lib/cache.ts",
        language: "typescript",
        additions: 19,
        deletions: 2,
        content: [
          "// Semantic cache: reuse answers for semantically similar questions",
          'import { embed } from "./retrieval";',
          "",
          "const store = new Map<string, { vector: number[]; reply: string }>();",
          "const THRESHOLD = 0.93;",
          "",
          "export async function cachedReply(message: string): Promise<string | null> {",
          "  const v = await embed(message);",
          "  for (const entry of store.values()) {",
          "    if (cosine(v, entry.vector) >= THRESHOLD) return entry.reply; // hit",
          "  }",
          "  return null;",
          "}",
        ].join("\n"),
      },
    ],
  },

  testReport: {
    passed: 84,
    failed: 0,
    skipped: 3,
    coverage: 87,
    suites: [
      {
        name: "chat orchestration",
        tests: [
          { name: "grounds answers in retrieved catalog", status: "pass", durationMs: 142 },
          { name: "declines unsafe requests", status: "pass", durationMs: 88 },
          { name: "streams tokens within budget", status: "pass", durationMs: 210 },
          { name: "falls back to search-only on model error", status: "pass", durationMs: 96 },
        ],
      },
      {
        name: "personalization",
        tests: [
          { name: "uses consent before personal data", status: "pass", durationMs: 73 },
          { name: "ranks by loyalty history", status: "pass", durationMs: 119 },
          { name: "anonymous session has no PII", status: "pass", durationMs: 64 },
        ],
      },
      {
        name: "accessibility",
        tests: [
          { name: "keyboard navigable", status: "pass", durationMs: 51 },
          { name: "aria-live announces replies", status: "pass", durationMs: 47 },
          { name: "RTL locale rendering", status: "skip", durationMs: 0 },
        ],
      },
    ],
  },

  qualityGate: {
    gates: [
      { name: "Unit tests", status: "pass", detail: "84 passed · 0 failed · 87% coverage" },
      { name: "SAST (CodeQL)", status: "pass", detail: "No high/critical findings" },
      { name: "Dependency scan", status: "pass", detail: "0 known vulnerabilities" },
      { name: "Secret scan", status: "pass", detail: "No secrets detected (managed identity)" },
      { name: "Responsible AI checks", status: "pass", detail: "Grounding + content safety verified" },
      { name: "Accessibility (axe)", status: "warn", detail: "1 minor contrast note on kiosk theme" },
    ],
  },

  pr: {
    repo: "contoso/aisle-copilot",
    branch: "feature/aisle-copilot",
    number: 128,
    title: "feat: Aisle Copilot conversational shopping assistant (CR-1042)",
    author: "developer-agent",
    filesChanged: 24,
    additions: 1148,
    deletions: 36,
    commits: [
      { sha: "a1f9c20", message: "feat(api): grounded RAG chat orchestration" },
      { sha: "b7e4d81", message: "feat(web): streaming Aisle Copilot widget (a11y)" },
      { sha: "c3a8e55", message: "feat(infra): Container Apps + OpenAI + AI Search + Cosmos" },
      { sha: "d9b1f07", message: "test: orchestration, personalization, accessibility" },
    ],
    checks: [
      { name: "build", status: "pass" },
      { name: "unit-tests", status: "pass" },
      { name: "codeql", status: "pass" },
      { name: "bicep-validate", status: "pass" },
    ],
  },

  deployment: {
    environment: "Production (canary 10%)",
    version: "v1.0.0",
    region: "East US 2 + West Europe",
    status: "healthy",
    url: "https://shop.contoso.com (assistant enabled)",
    steps: [
      { name: "Provision infra (azd up)", status: "pass" },
      { name: "Deploy API to Container Apps", status: "pass" },
      { name: "Publish web widget", status: "pass" },
      { name: "Canary 10% + health checks", status: "pass" },
    ],
  },

  dashboard: {
    metrics: [
      { label: "Assisted sessions", value: "42.3K", unit: "/day", deltaPct: 18, good: "up", series: [21, 24, 26, 25, 29, 33, 36, 38, 40, 41, 42] },
      { label: "Conversion lift", value: "+9.4", unit: "%", deltaPct: 9.4, good: "up", series: [0, 2, 3, 4, 6, 7, 8, 8, 9, 9, 9] },
      { label: "P95 latency", value: "2.1", unit: "s", deltaPct: -12, good: "down", series: [2.9, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.3, 2.2, 2.1, 2.1] },
      { label: "Cost / session", value: "$0.031", unit: "", deltaPct: -22, good: "down", series: [0.05, 0.048, 0.046, 0.044, 0.041, 0.039, 0.037, 0.035, 0.033, 0.032, 0.031] },
    ],
    slos: [
      { name: "Availability", target: 99.9, current: 99.97, unit: "%" },
      { name: "P95 latency", target: 2.5, current: 2.1, unit: "s" },
      { name: "Grounded-answer rate", target: 98, current: 99.2, unit: "%" },
      { name: "CSAT (assisted)", target: 90, current: 93, unit: "%" },
    ],
  },

  optimization: {
    summary:
      "Telemetry shows ~31% of questions are semantically repetitive. Adding a semantic cache at the AI gateway cuts latency and token cost materially.",
    estimatedGainPct: 22,
    requestChanges: true,
    findings: [
      { title: "Repetitive intents", detail: "31% of prompts cluster into 40 intents (sizing, stock, returns).", severity: "medium" },
      { title: "Token spend", detail: "Cold-path completions dominate cost during peaks.", severity: "high" },
      { title: "Latency tail", detail: "P99 spikes during evening traffic on cold sessions.", severity: "low" },
    ],
    recommendation:
      "Add semantic caching for high-frequency intents at API Management; target ~22% lower cost/session and lower P95.",
  },

  gtm: {
    summary:
      "Launch Aisle Copilot to loyalty members first, then all digital shoppers, leading with trust and unification.",
    segments: [
      { name: "Loyalty members (38M)", note: "Personalized, consented experience — highest LTV" },
      { name: "Mobile-first shoppers", note: "Conversational discovery on the app" },
      { name: "In-store kiosk users", note: "Associate-assisted + self-serve lookup" },
    ],
    messaging: [
      "“Shopping that knows you — and gets you the right answer.”",
      "Grounded in real Contoso products and live inventory.",
      "Seamless from your phone to the aisle.",
    ],
    channels: [
      { name: "In-app + web", note: "Contextual entry points at PDP and search" },
      { name: "Loyalty email/push", note: "Targeted, consented announcement" },
      { name: "In-store signage + kiosks", note: "Associate enablement kit" },
    ],
    kpis: [
      { label: "Assisted conversion lift", target: "+10% by Q2" },
      { label: "Loyalty engagement", target: "+15% MAU" },
      { label: "Basket size", target: "+6%" },
      { label: "CSAT (assisted)", target: "≥ 92" },
    ],
    launchSteps: [
      { name: "Canary to 10% loyalty members", when: "Week 1" },
      { name: "Scale to all loyalty members", when: "Week 3" },
      { name: "Open to all digital shoppers", when: "Week 5" },
      { name: "Store kiosk rollout (200 pilot stores)", when: "Week 8" },
    ],
  },

  feedback: {
    summary:
      "Pilot feedback is strongly positive on trust and speed; requests center on broader catalog coverage and multilingual support.",
    items: [
      { source: "Pilot shopper", persona: "Loyalty member", text: "It actually knew my size history and found it in my store.", sentiment: "positive" },
      { source: "Store associate", persona: "Floor associate", text: "Cuts product lookups to seconds — huge on busy days.", sentiment: "positive" },
      { source: "Ops reviewer", persona: "Human-in-the-loop", text: "Approve — add Spanish next and expand grocery catalog.", sentiment: "neutral" },
      { source: "Pilot shopper", persona: "New customer", text: "Wanted it to cover home appliances too.", sentiment: "neutral" },
    ],
  },
};
