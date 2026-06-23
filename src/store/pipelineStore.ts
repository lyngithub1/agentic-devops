import { create } from "zustand";
import { buildScript, buildSegments, type SegmentKey } from "@/engine/buildScript";
import type { RunScript, RunnerApi, SimEvent } from "@/engine/AgentRunner";
import { SimulatedRunner } from "@/engine/SimulatedRunner";
import { resolveContent } from "@/data/content";
import { llmHealth } from "@/engine/llm/client";
import { githubHealth, openPr, prStatus } from "@/engine/github/client";
import {
  buildLiveBase,
  applyLiveStage,
  type StageId,
} from "@/engine/llm/generateLiveContent";
import type { LiveStageUpdate } from "@/engine/llm/generateLiveContent";
import { PHASE_MAP, PHASE_ORDER } from "@/lib/constants";
import { uid } from "@/lib/format";
import type {
  Artifact,
  BusinessProfile,
  CodeData,
  GateDecision,
  GithubState,
  LivePrCheckView,
  LivePrState,
  LiveState,
  OrchestratorState,
  PhaseId,
  PhaseState,
  PipelineState,
  RunMode,
} from "@/types";

const ACTIVITY_CAP = 160;
const LOG_CAP = 120;

function makePhase(id: PhaseId): PhaseState {
  return {
    id,
    status: "idle",
    progress: 0,
    subAgents: PHASE_MAP[id].agents.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: "idle",
    })),
    activity: [],
    artifacts: [],
    gate: null,
  };
}

function makePhases(): Record<PhaseId, PhaseState> {
  return PHASE_ORDER.reduce(
    (acc, id) => {
      acc[id] = makePhase(id);
      return acc;
    },
    {} as Record<PhaseId, PhaseState>,
  );
}

function makeOrchestrator(): OrchestratorState {
  return {
    status: "idle",
    reasoning: [],
    messages: [],
    progress: [],
    taskLedger: { facts: [], assumptions: [], plan: [], phaseGoals: {} },
    overallProgress: 0,
    currentPhase: null,
  };
}

function makeLive(): LiveState {
  return {
    available: null,
    provider: null,
    model: null,
    status: "idle",
    stages: [],
    error: null,
    models: [],
    selectedModelId: null,
  };
}

function makeLivePr(): LivePrState {
  return {
    status: "idle",
    number: null,
    htmlUrl: null,
    branch: null,
    headSha: null,
    checks: [],
    error: null,
  };
}

function makeGithub(): GithubState {
  return {
    available: null,
    configured: false,
    repo: "",
    mode: "none",
    pr: makeLivePr(),
  };
}

function capEnd<T>(arr: T[], cap: number): T[] {
  return arr.length > cap ? arr.slice(arr.length - cap) : arr;
}

interface Actions {
  selectBusiness: (business: BusinessProfile | null) => void;
  setMode: (mode: RunMode) => void;
  setSpeed: (speed: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  resolveGate: (phase: PhaseId, decision: GateDecision, note?: string) => void;
  selectArtifact: (id: string | null) => void;
  checkLiveHealth: () => Promise<void>;
  setLiveModel: (id: string) => void;
  checkGithubHealth: () => Promise<void>;
  createLivePr: () => Promise<void>;
  refreshLivePr: () => Promise<void>;
  resetLivePr: () => void;
  // internal — driven by the runner
  _applyEvent: (event: SimEvent) => void;
  _applyGateResolution: (phase: PhaseId, decision: GateDecision, note?: string) => void;
  _complete: () => void;
  _startLive: () => Promise<void>;
  _liveStage: (update: LiveStageUpdate) => void;
}

export type PipelineStore = PipelineState & Actions;

function initialState(): PipelineState {
  return {
    business: null,
    mode: "simulation",
    running: false,
    started: false,
    finished: false,
    speed: 1,
    phases: makePhases(),
    orchestrator: makeOrchestrator(),
    selectedArtifactId: null,
    live: makeLive(),
    github: makeGithub(),
  };
}

export const usePipelineStore = create<PipelineStore>((set, get) => {
  let runner: SimulatedRunner | null = null;
  let liveAbort: AbortController | null = null;
  let prPoll: ReturnType<typeof setTimeout> | null = null;
  // When live mode plays the run one segment at a time, this resolves the
  // currently-awaited segment instead of completing the whole run. Simulation
  // leaves it null, so the runner finishing the script means the run is done.
  let segmentDone: (() => void) | null = null;

  const api: RunnerApi = {
    apply: (event) => get()._applyEvent(event),
    resolveGate: (phase, decision, note) =>
      get()._applyGateResolution(phase, decision, note),
    onComplete: () => {
      if (segmentDone) {
        const done = segmentDone;
        segmentDone = null;
        done();
      } else {
        get()._complete();
      }
    },
  };

  function ensureRunner(): SimulatedRunner {
    if (!runner) runner = new SimulatedRunner(api);
    return runner;
  }

  return {
    ...initialState(),

    selectBusiness: (business) => {
      // changing the business resets any in-progress run
      liveAbort?.abort();
      liveAbort = null;
      segmentDone = null;
      if (prPoll) {
        clearTimeout(prPoll);
        prPoll = null;
      }
      runner?.dispose();
      runner = null;
      const prevLive = get().live;
      const prevGithub = get().github;
      set({
        ...initialState(),
        business,
        mode: get().mode,
        speed: get().speed,
        // keep the probed provider health so the toggle stays informed
        live: {
          ...makeLive(),
          available: prevLive.available,
          provider: prevLive.provider,
          model: prevLive.model,
          models: prevLive.models,
          selectedModelId: prevLive.selectedModelId,
        },
        // keep GitHub health; reset only the per-run PR state
        github: {
          ...makeGithub(),
          available: prevGithub.available,
          configured: prevGithub.configured,
          repo: prevGithub.repo,
          mode: prevGithub.mode,
        },
      });
    },

    setMode: (mode) => {
      set({ mode });
      if (mode === "live" && get().live.available === null) {
        void get().checkLiveHealth();
      }
    },

    setSpeed: (speed) => {
      runner?.setSpeed(speed);
      set({ speed });
    },

    start: () => {
      const { business, started, speed, mode } = get();
      if (!business || started) return;
      if (mode === "live") {
        void get()._startLive();
        return;
      }
      const content = resolveContent(business);
      if (!content) return;
      const script = buildScript(business, content);
      const r = ensureRunner();
      r.load(script);
      r.setSpeed(speed);
      set({
        phases: makePhases(),
        orchestrator: makeOrchestrator(),
        started: true,
        running: true,
        finished: false,
        selectedArtifactId: null,
      });
      r.start();
    },

    pause: () => {
      runner?.pause();
      set({ running: false });
    },

    resume: () => {
      const { finished } = get();
      if (finished) return;
      runner?.resume();
      set({ running: true });
    },

    reset: () => {
      liveAbort?.abort();
      liveAbort = null;
      segmentDone = null;
      if (prPoll) {
        clearTimeout(prPoll);
        prPoll = null;
      }
      runner?.dispose();
      runner = null;
      const { business, mode, speed, live, github } = get();
      set({
        ...initialState(),
        business,
        mode,
        speed,
        live: {
          ...makeLive(),
          available: live.available,
          provider: live.provider,
          model: live.model,
          models: live.models,
          selectedModelId: live.selectedModelId,
        },
        github: {
          ...makeGithub(),
          available: github.available,
          configured: github.configured,
          repo: github.repo,
          mode: github.mode,
        },
      });
    },

    resolveGate: (phase, decision, note) => {
      ensureRunner().resolveGate(phase, decision, note);
    },

    selectArtifact: (id) => set({ selectedArtifactId: id }),

    checkLiveHealth: async () => {
      const health = await llmHealth();
      set((state) => {
        const models = (health.models ?? []).map((m) => ({
          id: m.id,
          label: m.label,
          description: m.description,
          provider: m.provider,
          model: m.model,
          configured: m.configured,
        }));
        const prev = state.live.selectedModelId;
        const selectedModelId =
          (prev && models.some((m) => m.id === prev) ? prev : null) ??
          (health.default && models.some((m) => m.id === health.default)
            ? health.default
            : null) ??
          models.find((m) => m.configured)?.id ??
          models[0]?.id ??
          null;
        const sel = models.find((m) => m.id === selectedModelId);
        return {
          live: {
            ...state.live,
            available: sel ? sel.configured : health.configured,
            provider: sel ? sel.provider : health.configured ? health.provider : null,
            model: sel ? sel.model : health.model || null,
            models,
            selectedModelId,
          },
        };
      });
    },

    setLiveModel: (id) => {
      set((state) => {
        if (state.started) return {} as Partial<PipelineState>; // locked during a run
        const sel = state.live.models.find((m) => m.id === id);
        if (!sel) return {} as Partial<PipelineState>;
        return {
          live: {
            ...state.live,
            selectedModelId: id,
            provider: sel.provider,
            model: sel.model,
            available: sel.configured,
          },
        };
      });
    },

    checkGithubHealth: async () => {
      const h = await githubHealth();
      set((state) => ({
        github: {
          ...state.github,
          available: h.configured,
          configured: h.configured,
          repo: h.repo,
          mode: h.mode,
        },
      }));
    },

    createLivePr: async () => {
      const { business, github } = get();
      if (!business || !github.configured) return;
      if (github.pr.status === "creating" || github.pr.status === "polling") return;

      // Collect the latest generated code change set produced by the run.
      let code: CodeData | null = null;
      const phases = get().phases;
      for (const id of PHASE_ORDER) {
        for (const a of phases[id].artifacts) {
          if (a.type === "code") {
            code = a.data;
            break;
          }
        }
        if (code) break;
      }
      if (!code || code.files.length === 0) {
        set((s) => ({
          github: {
            ...s.github,
            pr: {
              ...makeLivePr(),
              status: "error",
              error: "No generated code yet - run the pipeline through the Developer phase first.",
            },
          },
        }));
        return;
      }

      const slug = business.id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const branch = `agentic/${slug}-${Date.now().toString(36)}`;
      const runDir = `agentic-runs/${slug}/${stamp}`;
      const files = [
        {
          path: `${runDir}/README.md`,
          content:
            `# Agentic DevOps run - ${business.name}\n\n${code.summary}\n\n` +
            `Generated by the Agentic DevOps pipeline. The change set below is sandboxed under ` +
            `\`${runDir}/\` so it never overwrites real source. This PR is safe to review and close.\n`,
        },
        ...code.files.slice(0, 60).map((f) => ({
          path: `${runDir}/${f.path.replace(/^\/+/, "")}`,
          content: f.content,
        })),
      ];

      set((s) => ({ github: { ...s.github, pr: { ...makeLivePr(), status: "creating" } } }));
      try {
        const pr = await openPr({
          branch,
          title: `Agentic run: ${business.name} (${slug})`,
          body:
            `Automated change set proposed by the **Agentic DevOps** pipeline for **${business.name}**.\n\n` +
            `${code.summary}\n\n> Files are sandboxed under \`${runDir}/\` so this PR never modifies real source. Safe to close.`,
          commitMessage: `feat(agentic): proposed change set for ${business.name}`,
          files,
        });
        set((s) => ({
          github: {
            ...s.github,
            pr: {
              status: "open",
              number: pr.number,
              htmlUrl: pr.htmlUrl,
              branch: pr.branch,
              headSha: pr.headSha,
              checks: [],
              error: null,
            },
          },
        }));
        void get().refreshLivePr();
      } catch (e) {
        set((s) => ({
          github: {
            ...s.github,
            pr: {
              ...makeLivePr(),
              status: "error",
              error: e instanceof Error ? e.message : String(e),
            },
          },
        }));
      }
    },

    refreshLivePr: async () => {
      const n = get().github.pr.number;
      if (!n) return;
      try {
        const st = await prStatus(n);
        const checks: LivePrCheckView[] = st.checks.map((c) => ({
          name: c.name,
          status: c.status,
          conclusion: c.conclusion,
        }));
        const allComplete = checks.length > 0 && checks.every((c) => c.status === "completed");
        const merged = st.state === "closed" && st.merged;
        set((s) => ({
          github: {
            ...s.github,
            pr: {
              ...s.github.pr,
              status: merged ? "merged" : "polling",
              checks,
              htmlUrl: st.htmlUrl ?? s.github.pr.htmlUrl,
              headSha: st.headSha ?? s.github.pr.headSha,
              error: null,
              lastPolledAt: Date.now(),
            },
          },
        }));
        if (prPoll) {
          clearTimeout(prPoll);
          prPoll = null;
        }
        if (!merged && !allComplete) {
          prPoll = setTimeout(() => {
            void get().refreshLivePr();
          }, 6000);
        }
      } catch (e) {
        set((s) => ({
          github: {
            ...s.github,
            pr: { ...s.github.pr, error: e instanceof Error ? e.message : String(e) },
          },
        }));
      }
    },

    resetLivePr: () => {
      if (prPoll) {
        clearTimeout(prPoll);
        prPoll = null;
      }
      set((s) => ({ github: { ...s.github, pr: makeLivePr() } }));
    },

    // ----- internal reducers ------------------------------------------------

    _applyEvent: (event) =>
      set((state) => {
        switch (event.kind) {
          case "orch.status":
            return { orchestrator: { ...state.orchestrator, status: event.status } };

          case "orch.reason":
            return {
              orchestrator: {
                ...state.orchestrator,
                reasoning: capEnd(
                  [
                    ...state.orchestrator.reasoning,
                    { id: uid("rsn"), ts: Date.now(), text: event.text },
                  ],
                  LOG_CAP,
                ),
              },
            };

          case "orch.ledger":
            return {
              orchestrator: {
                ...state.orchestrator,
                taskLedger: {
                  facts: event.ledger.facts ?? state.orchestrator.taskLedger.facts,
                  assumptions:
                    event.ledger.assumptions ?? state.orchestrator.taskLedger.assumptions,
                  plan: event.ledger.plan ?? state.orchestrator.taskLedger.plan,
                  phaseGoals: {
                    ...state.orchestrator.taskLedger.phaseGoals,
                    ...event.ledger.phaseGoals,
                  },
                },
              },
            };

          case "orch.message":
            return {
              orchestrator: {
                ...state.orchestrator,
                messages: capEnd(
                  [
                    ...state.orchestrator.messages,
                    {
                      id: uid("msg"),
                      ts: Date.now(),
                      from: event.from,
                      to: event.to,
                      text: event.text,
                    },
                  ],
                  LOG_CAP,
                ),
              },
            };

          case "orch.progress":
            return {
              orchestrator: {
                ...state.orchestrator,
                progress: capEnd(
                  [
                    ...state.orchestrator.progress,
                    {
                      id: uid("prg"),
                      ts: Date.now(),
                      phase: event.phase,
                      speaker: event.speaker,
                      instruction: event.instruction,
                      complete: event.complete,
                    },
                  ],
                  LOG_CAP,
                ),
              },
            };

          case "orch.overall":
            return {
              orchestrator: {
                ...state.orchestrator,
                overallProgress: event.progress,
                currentPhase: event.currentPhase,
              },
            };

          case "phase.status": {
            const prev = state.phases[event.phase];
            const patch: Partial<PhaseState> = { status: event.status };
            if (event.status === "running" && !prev.startedAt) {
              patch.startedAt = Date.now();
            }
            if (event.status === "complete") {
              patch.completedAt = Date.now();
              patch.progress = 100;
              patch.gate = prev.gate
                ? prev.gate
                : null;
            }
            return {
              phases: { ...state.phases, [event.phase]: { ...prev, ...patch } },
            };
          }

          case "phase.progress":
            return {
              phases: {
                ...state.phases,
                [event.phase]: {
                  ...state.phases[event.phase],
                  progress: event.progress,
                },
              },
            };

          case "subagent": {
            const prev = state.phases[event.phase];
            return {
              phases: {
                ...state.phases,
                [event.phase]: {
                  ...prev,
                  subAgents: prev.subAgents.map((a) =>
                    a.id === event.agentId ? { ...a, status: event.status } : a,
                  ),
                },
              },
            };
          }

          case "activity": {
            const prev = state.phases[event.phase];
            return {
              phases: {
                ...state.phases,
                [event.phase]: {
                  ...prev,
                  activity: capEnd(
                    [
                      ...prev.activity,
                      {
                        id: uid("act"),
                        ts: Date.now(),
                        phase: event.phase,
                        agent: event.agent,
                        text: event.text,
                        level: event.level ?? "info",
                      },
                    ],
                    ACTIVITY_CAP,
                  ),
                },
              },
            };
          }

          case "artifact": {
            const stamped: Artifact = { ...event.artifact, createdAt: Date.now() };
            const prev = state.phases[stamped.phase];
            return {
              phases: {
                ...state.phases,
                [stamped.phase]: {
                  ...prev,
                  artifacts: [...prev.artifacts, stamped],
                },
              },
            };
          }

          case "gate": {
            const prev = state.phases[event.gate.phase];
            return {
              running: false,
              phases: {
                ...state.phases,
                [event.gate.phase]: {
                  ...prev,
                  status: "needs_human",
                  gate: event.gate,
                },
              },
            };
          }

          default:
            return {};
        }
      }),

    _applyGateResolution: (phase, decision, note) =>
      set((state) => {
        const prev = state.phases[phase];
        if (!prev.gate) return { running: true };
        const resolvedGate = {
          ...prev.gate,
          status:
            decision === "approve"
              ? ("approved" as const)
              : ("changes_requested" as const),
          note,
        };
        const extraActivity = [
          {
            id: uid("act"),
            ts: Date.now(),
            phase,
            agent: "Human reviewer",
            text:
              decision === "approve"
                ? `Approved${note ? `: ${note}` : "."}`
                : `Requested changes${note ? `: ${note}` : "."}`,
            level: decision === "approve" ? ("success" as const) : ("warn" as const),
          },
        ];
        return {
          running: true,
          phases: {
            ...state.phases,
            [phase]: {
              ...prev,
              status: "running",
              gate: resolvedGate,
              activity: capEnd([...prev.activity, ...extraActivity], ACTIVITY_CAP),
            },
          },
        };
      }),

    _complete: () =>
      set((state) => ({
        running: false,
        finished: true,
        orchestrator: { ...state.orchestrator, status: "complete" },
      })),

    _startLive: async () => {
      const { business, speed } = get();
      if (!business) return;
      const controller = new AbortController();
      liveAbort?.abort();
      liveAbort = controller;

      // Build the always-valid baseline. Each phase's real content is generated
      // just before that phase animates, so the pipeline behaves like simulation.
      const { base, ctx } = buildLiveBase(business);
      const modelId = get().live.selectedModelId ?? undefined;

      set({
        started: true,
        running: true,
        finished: false,
        selectedArtifactId: null,
        phases: makePhases(),
        orchestrator: makeOrchestrator(),
        live: { ...get().live, status: "generating", stages: [], error: null },
      });

      const r = ensureRunner();
      r.setSpeed(speed);

      // Play one segment and resolve when the runner finishes it (gates included).
      const playSegment = (steps: RunScript): Promise<void> =>
        new Promise<void>((resolve) => {
          if (controller.signal.aborted) {
            resolve();
            return;
          }
          const finish = () => {
            controller.signal.removeEventListener("abort", finish);
            segmentDone = null;
            resolve();
          };
          segmentDone = finish;
          controller.signal.addEventListener("abort", finish, { once: true });
          r.load(steps);
          r.start();
        });

      // Rebuild the named segment from the latest (mutated) base content.
      const segmentSteps = (key: SegmentKey): RunScript => {
        const seg = buildSegments(business, base).find((s) => s.key === key);
        return seg ? seg.steps : [];
      };

      const apply = (event: SimEvent) => get()._applyEvent(event);

      // Author a phase live: show its team pick up the work, call the model,
      // then play the phase's segment built from the freshly generated content.
      const authorPhase = async (
        stage: StageId,
        phase: PhaseId,
        firstAgentId: string,
        firstAgentName: string,
      ): Promise<void> => {
        if (controller.signal.aborted) return;
        apply({ kind: "phase.status", phase, status: "running" });
        apply({ kind: "subagent", phase, agentId: firstAgentId, status: "working" });
        apply({
          kind: "activity",
          phase,
          agent: firstAgentName,
          text: "Calling the live model to author this phase…",
        });
        get()._liveStage({
          index: stage,
          total: 4,
          label: `Phase ${stage}`,
          status: "running",
        });

        const outcome = await applyLiveStage(stage, base, ctx, { signal: controller.signal, model: modelId });
        if (controller.signal.aborted) return;

        if (!outcome.ok) {
          apply({
            kind: "activity",
            phase,
            agent: firstAgentName,
            text: `Live model unavailable — using a baseline for this phase.${outcome.detail ? ` (${outcome.detail})` : ""}`,
          });
        }
        get()._liveStage({
          index: stage,
          total: 4,
          label: `Phase ${stage}`,
          status: outcome.ok ? "done" : "fallback",
          detail: outcome.detail,
        });

        await playSegment(segmentSteps(phase));
      };

      try {
        // Intro orchestration plays from the rebranded baseline.
        await playSegment(segmentSteps("intro"));
        if (controller.signal.aborted) return;

        await authorPhase(1, "ideate", "ideate.research", "Market Research");
        if (controller.signal.aborted) return;
        await authorPhase(2, "planner", "planner.review", "Idea Review");
        if (controller.signal.aborted) return;
        await authorPhase(3, "developer", "developer.plan", "Planning");
        if (controller.signal.aborted) return;
        // Stage 4 generates BOTH validator and operator content.
        await authorPhase(4, "validator", "validator.unit", "Unit Tests");
        if (controller.signal.aborted) return;
        // Operator content is already generated; just play its segment.
        await playSegment(segmentSteps("operator"));
        if (controller.signal.aborted) return;
        await playSegment(segmentSteps("wrap"));
        if (controller.signal.aborted) return;

        set((state) => ({ live: { ...state.live, status: "ready" } }));
        get()._complete();
      } catch (err) {
        if (controller.signal.aborted) return;
        set((state) => ({
          started: false,
          running: false,
          live: {
            ...state.live,
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          },
        }));
      } finally {
        if (liveAbort === controller) liveAbort = null;
        segmentDone = null;
      }
    },

    _liveStage: (update) =>
      set((state) => {
        const stages = [...state.live.stages];
        const at = stages.findIndex((s) => s.index === update.index);
        if (at >= 0) stages[at] = update;
        else stages.push(update);
        return { live: { ...state.live, stages } };
      }),
  };
});

// Convenience selector used by the artifact drawer.
export function selectArtifactById(
  state: PipelineState,
  id: string | null,
): Artifact | null {
  if (!id) return null;
  for (const phase of PHASE_ORDER) {
    const found = state.phases[phase].artifacts.find((a) => a.id === id);
    if (found) return found;
  }
  return null;
}
