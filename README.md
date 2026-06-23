# Agentic DevOps

> A multi-agent product pipeline that takes an enterprise from **product idea → triage → development → validation → go-to-market**, coordinated by a single orchestrator using the **Magentic** pattern.

Agentic DevOps is a highly interactive, single-page demo that visualizes how five specialist agent teams collaborate — each a multi-agent flow in its own right — under an orchestrator that keeps the big picture. Pick a business, press **Run**, and watch ideas get generated, scored, planned, built, tested, shipped, and grown end to end.

![Microsoft / Azure themed](https://img.shields.io/badge/theme-Microsoft%20%2F%20Azure-0078D4) ![React](https://img.shields.io/badge/React-18-149ECA) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

---

## The pipeline

A global **Magentic Orchestrator** maintains a task ledger (facts, assumptions, plan), decides the next speaker, and tracks overall progress. It coordinates five phases, shown as five vertical slices:

| # | Phase | Sub-agents | Output |
|---|-------|-----------|--------|
| 1 | **Ideate** | Market Research · Idea Generation · Cost–Benefit · Risk · Competitive · Synthesis | Market brief, competitive landscape, top-5 scored ideas |
| 2 | **Planner** | Idea Review · Business Case · Competitive Strategy · Triage · Story & Docs | Business case, triage decision, DevSecOps-ready user story |
| 3 | **Developer** | Planning · Architecture · Scaffolding · Coder | Tech plan, ADR, scaffold, code change set — with a **human code review gate** |
| 4 | **Validator** | Unit Tests · Smoke/Integration · Security & Quality · Source Control | Test report, quality gates, **mocked** GitHub PR |
| 5 | **Operator** | Deployment · Observability · Optimization · Feedback · Go-to-Market | Deployment, live dashboard, optimization (can **request changes** back to Developer), feedback, GTM plan — with a **human ops gate** |

Two **human-in-the-loop gates** pause the run for approval (code review and operations feedback), and the Operator can route an optimization **back to the Developer** — closing the loop.

## Features

- **Five live agent lanes** with per-sub-agent status, streaming activity logs, and progress.
- **Global pipeline rail** showing your overall place in the process and percent complete.
- **Magentic orchestrator console** (dockable) streaming reasoning, the task ledger, agent-to-agent messages, and the progress ledger.
- **18 rich artifact types** rendered in a side drawer — market briefs, scorecards with radar charts, business cases with ROI, ADRs, code diffs, test reports, mocked PRs, observability dashboards, GTM plans, and more.
- **Human-in-the-loop gates** with approve / request-changes and optional notes.
- **Three sample businesses**, each with a fully authored, distinct end-to-end run.
- **Tailor to your own company** — enter a company name (plus optional industry, region, size, description and brand accent) and the whole run is rebranded to you in seconds.
- **Live (LLM) mode** — point it at Azure OpenAI or OpenAI and the run is *generated* for your company in real time, so ideas, business case, code and GTM are genuinely specific to whoever you're demoing to.
- **Microsoft / Azure theming** (Segoe UI, Azure blue, Fluent-style surfaces) with light/dark modes and reduced-motion support.
- **Simulation / Live** mode toggle and adjustable playback speed (0.5×–4×).

## Tech stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives), re-themed to Azure
- **Zustand** for state
- **lucide-react** icons
- Dependency-free custom SVG charts (radar, sparkline, donut, score bars)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build      # bundle to dist/ (Vite/esbuild)
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit (run separately — the build does not type-check)
```

Then: select a business (header dropdown or onboarding cards) → press **Run pipeline** → approve the gates when prompted.

## How it works

The UI is fully decoupled from execution behind an `AgentRunner` interface:

```
buildScript(business, content)  ->  SimStep[]   (a choreographed timeline of SimEvents)
        │
        ▼
SimulatedRunner  ──emits SimEvents──►  pipelineStore (Zustand reducer)  ──►  React UI
```

- **`src/engine/buildScript.ts`** turns per-business *content* into a timeline of events (orchestrator reasoning, sub-agent state changes, activity, artifacts, gates).
- **`SimulatedRunner`** plays the timeline with `setTimeout` (scaled by speed) and halts at gate steps until the user resolves them.
- **`pipelineStore`** reduces events into immutable state; the UI is a pure projection.
- Because everything sits behind `AgentRunner`, **Live mode** uses a real LLM to author the per-run *content*, then plays it through the very same runner and UI — **zero UI changes** (see below).

> GitHub repository/PR creation and deployment are **mocked** by design, so the demo runs fully offline and deterministically.

## Project structure

```
src/
  engine/        AgentRunner contract, SimulatedRunner, buildScript (the timeline)
    llm/         Live mode: proxy client, staged prompts, generateLiveContent, coercers
  store/         Zustand pipeline store (single source of truth)
  data/
    businesses.ts          three sample businesses
    content/               per-business authored runs (contoso, fabrikam, northwind)
  components/
    primitives/  StatusPill, Sparkline, ScoreBar, ScoreDonut, RadarChart, MetricTile
    shell/       Header (selectors, mode/theme/run controls), Onboarding
    pipeline/    PipelineRail (global stepper + overall %)
    lane/        PhaseLane, LaneHeader, SubAgentList, ActivityStream, ArtifactCard, HumanGateBanner
    orchestrator/OrchestratorConsole (reasoning, ledger, messages, progress)
    artifacts/   ArtifactDrawer + 18 polymorphic renderers
    ui/          shadcn/ui primitives (Azure-themed)
  lib/           constants (phases, sub-agents, styles), formatting helpers
  types/         shared domain contracts
```

## Tailor a demo to your company

For a quick, tightly-tailored demo you don't need to author anything. Click **"Tailor to your company"** (on the welcome screen or in the business dropdown) and enter your **company name** — optionally an industry, region, size, description and brand accent. Pick which built-in scenario to **model the run after** (Retail, Financial, or Logistics) and the entire pipeline — orchestrator reasoning, every agent, and all 18 artifacts — is rebranded to your company on the fly.

- Implemented in `src/data/content/custom.ts` (`makeCustomBusiness`, `buildCustomContent`) and resolved by `resolveContent()` in `src/data/content/index.ts`.
- The chosen scenario's product idea is reused; your company name and brand token are deep-swapped throughout, while GitHub/deployment stay simulated.

## Live mode (real LLM)

Simulation mode replays authored/rebranded content. **Live mode** instead asks a real model (Azure OpenAI or OpenAI) to generate the run for the selected company, so the ideas, scores, business case, architecture, code, and go-to-market are genuinely specific to — say — *Vizient* rather than a renamed template.

**Setup**

1. `cp .env.example .env` and fill in **one** provider:
   - **Azure OpenAI:** `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`, `AZURE_OPENAI_API_KEY`
   - **OpenAI:** `OPENAI_API_KEY` (optional `OPENAI_MODEL`, `OPENAI_BASE_URL`)
2. `npm run dev` and flip the header toggle to **Live**. The dot turns green when a provider is detected (amber = checking, red = not configured — hover for details).
3. Pick (or tailor) a company and press **Run pipeline**. A progress overlay shows four staged generations; then the normal run plays.

**How it works**

- A tiny **dev-only proxy** lives in `vite.config.ts` (`POST /api/llm`, `GET /api/llm/health`). Keys are read server-side via `loadEnv` and **never reach the browser bundle**.
- `src/engine/llm/generateLiveContent.ts` runs **four sequential LLM calls** (Ideate → Plan → Build → Validate/Operate), each returning strict JSON.
- `src/engine/llm/coerce.ts` validates and coerces every field, so the output always conforms to `RunContent`. Generation starts from a **rebranded-template baseline**, and any stage that fails (network/JSON/validation) simply keeps that baseline — the demo never hard-fails.
- The result feeds the same `buildScript` → `SimulatedRunner` → store → UI path as simulation.

> Live mode requires the **dev server** (the proxy only runs under `npm run dev`); the static production build has no server and falls back to simulation. Keys stay local in `.env` (git-ignored) — never commit them.

## Add a new business

For a fully bespoke scenario (custom product, ideas, and artifacts):

1. Append a `BusinessProfile` to `src/data/businesses.ts`.
2. Create `src/data/content/<id>.ts` exporting a `RunContent` (use `contoso.ts` as the reference — it fills all 18 artifact payloads).
3. Register it in `src/data/content/index.ts`.

That's it — the orchestration, UI, and artifact rendering are all data-driven.

## Design notes

- Theming follows Microsoft/Azure: Segoe UI type ramp, Azure blue `#0078D4` primary, Fluent neutrals and elevation, distinct accent per phase.
- Accessibility: semantic controls, ARIA labels, focus-visible rings, and `prefers-reduced-motion` honored.
- See **`SPEC.md`** for the full product/architecture specification.
