import { useState } from "react";
import { ShieldQuestion, ThumbsDown, ThumbsUp } from "lucide-react";
import type { HumanGate, PhaseId } from "@/types";
import { usePipelineStore } from "@/store/pipelineStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface HumanGateBannerProps {
  phase: PhaseId;
  gate: HumanGate;
}

export function HumanGateBanner({ phase, gate }: HumanGateBannerProps) {
  const resolveGate = usePipelineStore((s) => s.resolveGate);
  const [note, setNote] = useState("");

  return (
    <div className="space-y-2 rounded-lg border-2 border-warning/40 bg-warning/10 p-3 shadow-fluent animate-fade-in-up">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-warning/20 text-warning-foreground">
          <ShieldQuestion className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">{gate.title}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Human-in-the-loop
          </p>
        </div>
      </div>

      <p className="text-[11px] leading-snug text-foreground/90">{gate.prompt}</p>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note for the agents…"
        className="min-h-[44px] resize-none bg-card text-xs"
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          className="h-8 flex-1 gap-1.5 bg-success text-success-foreground hover:bg-success/90"
          onClick={() => resolveGate(phase, "approve", note.trim() || undefined)}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {gate.approveLabel}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex-1 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => resolveGate(phase, "request_changes", note.trim() || undefined)}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          {gate.rejectLabel}
        </Button>
      </div>
    </div>
  );
}
