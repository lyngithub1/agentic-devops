import { cn } from "@/lib/utils";
import type { StatusStyle } from "@/lib/constants";

interface StatusPillProps {
  style: StatusStyle;
  pulse?: boolean;
  className?: string;
}

/** Soft, Fluent-style status pill with an optional pulsing indicator dot. */
export function StatusPill({ style, pulse = false, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
        style.pill,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-1.5 w-1.5 rounded-full animate-pulse-ring",
              style.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", style.dot)} />
      </span>
      {style.label}
    </span>
  );
}
