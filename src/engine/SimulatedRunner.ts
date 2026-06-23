import {
  type AgentRunner,
  type RunnerApi,
  type RunScript,
  isGateStep,
} from "@/engine/AgentRunner";
import type { GateDecision, PhaseId } from "@/types";

/**
 * Plays a scripted timeline of {@link SimEvent}s into the store.
 *
 * Supports pause/resume and halts automatically when a human-in-the-loop gate
 * is reached, resuming only when {@link resolveGate} is called. A LiveRunner can
 * later implement the same {@link AgentRunner} contract with real model calls.
 */
export class SimulatedRunner implements AgentRunner {
  private steps: RunScript = [];
  private index = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private paused = true;
  private disposed = false;
  private speed = 1;

  constructor(private api: RunnerApi) {}

  load(script: RunScript): void {
    this.cancelTimer();
    this.steps = script;
    this.index = 0;
    this.paused = true;
    this.disposed = false;
  }

  start(): void {
    if (this.disposed) return;
    this.paused = false;
    this.scheduleNext();
  }

  pause(): void {
    this.paused = true;
    this.cancelTimer();
  }

  resume(): void {
    if (this.disposed || !this.paused) return;
    this.paused = false;
    this.scheduleNext();
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0.25, speed);
  }

  isRunning(): boolean {
    return !this.paused && !this.disposed && this.index < this.steps.length;
  }

  resolveGate(phase: PhaseId, decision: GateDecision, note?: string): void {
    this.api.resolveGate(phase, decision, note);
    this.paused = false;
    this.scheduleNext();
  }

  dispose(): void {
    this.disposed = true;
    this.cancelTimer();
  }

  private cancelTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNext(): void {
    this.cancelTimer();
    if (this.disposed || this.paused) return;
    if (this.index >= this.steps.length) {
      this.api.onComplete();
      return;
    }
    const step = this.steps[this.index];
    const delay = Math.max(0, step.delay / this.speed);
    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.disposed || this.paused) return;
      for (const event of step.events) this.api.apply(event);
      const halt = isGateStep(step);
      this.index += 1;
      if (halt) {
        // Pause and wait for the human decision via resolveGate().
        this.paused = true;
        return;
      }
      this.scheduleNext();
    }, delay);
  }
}
