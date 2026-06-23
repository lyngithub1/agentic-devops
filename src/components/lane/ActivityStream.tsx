import { useEffect, useRef } from "react";
import type { ActivityEvent } from "@/types";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const LEVEL_DOT: Record<string, string> = {
  info: "bg-muted-foreground/50",
  success: "bg-success",
  warn: "bg-warning",
  error: "bg-destructive",
};

interface ActivityStreamProps {
  activity: ActivityEvent[];
}

export function ActivityStream({ activity }: ActivityStreamProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activity.length]);

  return (
    <div className="space-y-1">
      <p className="px-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Activity
      </p>
      <div
        ref={ref}
        className="scrollbar-thin max-h-44 space-y-1.5 overflow-y-auto rounded-lg border bg-muted/30 p-2"
      >
        {activity.length === 0 ? (
          <p className="px-1 py-2 text-[11px] text-muted-foreground">No activity yet.</p>
        ) : (
          activity.map((e) => (
            <div key={e.id} className="flex gap-2 text-[11px] leading-snug animate-fade-in-up">
              <span
                className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", LEVEL_DOT[e.level])}
              />
              <div className="min-w-0 flex-1">
                <span className="text-foreground">{e.text}</span>
                <span className="ml-1 whitespace-nowrap text-[10px] text-muted-foreground">
                  {e.agent ? `· ${e.agent} ` : ""}
                  {formatTime(e.ts)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
