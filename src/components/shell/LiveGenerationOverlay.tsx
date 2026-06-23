import { AlertTriangle, RefreshCw } from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { Button } from "@/components/ui/button";

/**
 * Live mode now interleaves generation with the pipeline itself — each phase
 * authors its content just before it animates — so there's no separate progress
 * card. This overlay only surfaces a blocking modal when live generation can't
 * start at all (e.g. the provider is unreachable).
 */
export function LiveGenerationOverlay() {
  const mode = usePipelineStore((s) => s.mode);
  const live = usePipelineStore((s) => s.live);
  const business = usePipelineStore((s) => s.business);
  const reset = usePipelineStore((s) => s.reset);
  const start = usePipelineStore((s) => s.start);
  const setMode = usePipelineStore((s) => s.setMode);

  if (mode !== "live" || live.status !== "error") return null;

  const providerLine = live.provider
    ? `${live.provider}${live.model ? ` · ${live.model}` : ""}`
    : null;

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-app-shell/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-fluent-lg">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-primary-foreground shadow-fluent">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Live generation hit a snag</h2>
            <p className="truncate text-xs text-muted-foreground">
              {business ? business.name : "Selected company"}
              {providerLine ? ` · ${providerLine}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
            {live.error ?? "The model provider could not be reached."}
          </p>
          <p className="text-xs text-muted-foreground">
            Live mode needs a provider configured in <code className="font-mono">.env</code>{" "}
            (Azure OpenAI or OpenAI) with the dev server running. Verify the key and deployment,
            then retry — or continue with the scripted simulation.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                reset();
                start();
              }}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                reset();
                setMode("simulation");
              }}
            >
              Switch to simulation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
