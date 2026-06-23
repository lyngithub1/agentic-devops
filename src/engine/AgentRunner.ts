import type {
  ActivityLevel,
  AgentMessage,
  Artifact,
  GateDecision,
  HumanGate,
  OrchestratorStatus,
  PhaseId,
  PhaseStatus,
  SubAgentStatus,
  TaskLedger,
} from "@/types";

// ----------------------------------------------------------------------------
// Simulation event protocol — the runner emits these; the store reduces them.
// ----------------------------------------------------------------------------

export type SimEvent =
  | { kind: "orch.status"; status: OrchestratorStatus }
  | { kind: "orch.reason"; text: string }
  | { kind: "orch.ledger"; ledger: Partial<TaskLedger> }
  | { kind: "orch.message"; from: string; to: string; text: string }
  | {
      kind: "orch.progress";
      speaker: string;
      phase: PhaseId | "orchestrator";
      instruction: string;
      complete: boolean;
    }
  | { kind: "orch.overall"; progress: number; currentPhase: PhaseId | null }
  | { kind: "phase.status"; phase: PhaseId; status: PhaseStatus }
  | { kind: "phase.progress"; phase: PhaseId; progress: number }
  | { kind: "subagent"; phase: PhaseId; agentId: string; status: SubAgentStatus }
  | {
      kind: "activity";
      phase: PhaseId;
      agent?: string;
      text: string;
      level?: ActivityLevel;
    }
  | { kind: "artifact"; artifact: Artifact }
  | { kind: "gate"; gate: HumanGate };

export interface SimStep {
  /** ms to wait (at 1x speed) before applying this step's events */
  delay: number;
  events: SimEvent[];
}

export type RunScript = SimStep[];

export function isGateStep(step: SimStep): boolean {
  return step.events.some((e) => e.kind === "gate");
}

// ----------------------------------------------------------------------------
// Runner contract — a SimulatedRunner ships now, a LiveRunner can be added
// later behind the exact same interface (UI/store unchanged).
// ----------------------------------------------------------------------------

export interface RunnerApi {
  apply: (event: SimEvent) => void;
  resolveGate: (phase: PhaseId, decision: GateDecision, note?: string) => void;
  onComplete: () => void;
}

export interface AgentRunner {
  load(script: RunScript): void;
  start(): void;
  pause(): void;
  resume(): void;
  setSpeed(speed: number): void;
  resolveGate(phase: PhaseId, decision: GateDecision, note?: string): void;
  dispose(): void;
  isRunning(): boolean;
}
