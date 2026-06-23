# Agentic DevOps — Foundry Prompt Agents (demo export)

This folder exports every agent used in the **Agentic DevOps** demo app as a
**prompt agent** for the **next-gen Microsoft Foundry Agent Service** so you can
view the agents and their instructions in the Foundry portal under their own
project.

> **View-only / demo purpose.** Foundry prompt agents run **independently** —
> they do **not** perform multi-agent orchestration. The real Magentic
> orchestration runs inside the Agentic DevOps app. These definitions exist so a
> reviewer can browse each agent, its model, and its instructions in Foundry.
> **Deploying them does not affect the app or its behavior in any way.**

## What's here

| File | Purpose |
|------|---------|
| [`agents.manifest.json`](./agents.manifest.json) | All 25 prompt agents (1 Magentic Orchestrator + 24 phase sub-agents). Each entry has human metadata (`displayName`, `phase`, `iq`) plus a `definition` that conforms to the Foundry **PromptAgentDefinition** schema. |
| [`deploy-prompt-agents.ps1`](./deploy-prompt-agents.ps1) | PowerShell deploy script (Windows-friendly). |
| [`deploy-prompt-agents.sh`](./deploy-prompt-agents.sh) | Bash/curl + jq deploy script. |

## The agents (25)

| Phase | Agents | Default model |
|-------|--------|---------------|
| Orchestration | Magentic Orchestrator | `gpt-5.4` |
| Ideate | Market Research, Idea Generation, Cost-Benefit, Risk Analysis, Competitive Analysis, **Synthesis & Ranking** | `gpt-4.1` (Synthesis → `gpt-5.4`) |
| Planner | Idea Review, **Business Case**, **Competitive Strategy**, Triage, Story & Docs | `gpt-4.1` (Business Case, Strategy → `gpt-5.4`) |
| Developer | Planning, **Architecture**, Scaffolding, **Coder** | `gpt-4.1` (Architecture, Coder → `gpt-5.4`) |
| Validator | Unit Tests, Smoke / Integration, **Security & Quality**, Source Control | `gpt-4.1` (Security & Quality → `gpt-5.4`) |
| Operator | Deployment, Observability, **Optimization**, Feedback, Go-to-Market | `gpt-4.1` (Optimization → `gpt-5.4`) |

Reasoning-heavy agents are mapped to **`gpt-5.4`** (the app's deep-reasoning
model); everything else uses **`gpt-4.1`** (the app's fast, non-reasoning model).
This mirrors the dual-model strategy shown in `azure-architecture.html`.

## Next-gen Foundry API used

These target the **Foundry projects (new) API** (Azure AI Projects **2.x**), not
the deprecated classic Assistants API. Reference: *Microsoft Foundry Quickstart —
get started with code* and *What is Foundry Agent Service?* on Microsoft Learn.

**REST — create an agent version**

```http
POST {PROJECT_ENDPOINT}/agents?api-version=v1
Authorization: Bearer <token for https://ai.azure.com/.default>
Content-Type: application/json

{
  "name": "ad-ideate-market-research",
  "definition": {
    "kind": "prompt",
    "model": "gpt-4.1",
    "instructions": "You are the Market Research agent ...",
    "temperature": 0.5
  }
}
```

- **Project endpoint** format: `https://<resource>.services.ai.azure.com/api/projects/<project>`
- **PromptAgentDefinition** required fields: `kind` (`"prompt"`) and `model`.
  Optional: `instructions`, `temperature`, `top_p`, `tools`, `tool_choice`,
  `text`, `reasoning`, `rai_config`, `structured_inputs`.
- Each POST registers a **new immutable version** of that agent.

**Python SDK equivalent** (`pip install "azure-ai-projects>=2.0.0"`):

```python
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition
from azure.identity import DefaultAzureCredential

project = AIProjectClient(endpoint=PROJECT_ENDPOINT, credential=DefaultAzureCredential())
project.agents.create_version(
    agent_name="ad-ideate-market-research",
    definition=PromptAgentDefinition(model="gpt-4.1", instructions="You are the Market Research agent ..."),
)
```

## Deploy (optional — only when you want to view them in Foundry)

### 1. Create or pick a Foundry project

Create a project named e.g. **`agentic-devops`** in the Foundry portal
(<https://ai.azure.com>), and deploy two models named **`gpt-4.1`** and
**`gpt-5.4`** (or pass `-ModelMap` to point at your actual deployment names).
Copy the **project endpoint** from the project overview.

You need the **Foundry User** role on the project.

### 2. Sign in and deploy

PowerShell (Windows):

```powershell
az login
$env:PROJECT_ENDPOINT = "https://<resource>.services.ai.azure.com/api/projects/agentic-devops"
./deploy-prompt-agents.ps1
# Preview only:        ./deploy-prompt-agents.ps1 -WhatIf
# Remap a model name:  ./deploy-prompt-agents.ps1 -ModelMap @{ "gpt-5.4" = "gpt-5" }
```

Bash (requires `jq`):

```bash
az login
export PROJECT_ENDPOINT="https://<resource>.services.ai.azure.com/api/projects/agentic-devops"
./deploy-prompt-agents.sh
```

### 3. View

Open the project in the Foundry portal → **Agents**. You'll see all 25 agents
with their instructions, ready to inspect or chat with individually in the
playground.

## Notes & limitations

- **No orchestration.** Each prompt agent is standalone. The pipeline's
  phase-by-phase, human-gated, Magentic orchestration only runs in the app.
- **Tools are intentionally omitted.** The app's grounding (Work IQ / Fabric IQ
  / Foundry IQ) is described in each agent's instructions rather than wired as
  live Foundry tools, to keep this a safe, self-contained view-only export.
- **Re-running** the deploy script creates a new *version* of each agent — it
  won't create duplicates.
- **Models** `gpt-4.1` / `gpt-5.4` must exist as deployments in the target
  project, or be remapped via `-ModelMap` / the manifest.
