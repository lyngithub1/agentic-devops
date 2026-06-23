import {
  CheckCircle2,
  CircleDot,
  ExternalLink,
  GitMerge,
  GitPullRequest,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { Button } from "@/components/ui/button";
import type { LivePrCheckView } from "@/types";

function CheckRow({ check }: { check: LivePrCheckView }) {
  let icon = <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />;
  if (check.status === "completed") {
    const ok =
      check.conclusion === "success" ||
      check.conclusion === "skipped" ||
      check.conclusion === "neutral";
    icon = ok ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    ) : (
      <XCircle className="h-3.5 w-3.5 text-destructive" />
    );
  }
  return (
    <li className="flex items-center gap-2 text-xs">
      {icon}
      <span className="min-w-0 flex-1 truncate text-foreground">{check.name}</span>
      <span className="text-muted-foreground">
        {check.status === "completed" ? (check.conclusion ?? "done") : check.status}
      </span>
    </li>
  );
}

/**
 * Phase 2: turns the (simulated) PR artifact into a REAL pull request when
 * GitHub live mode is configured. Renders nothing otherwise, so the demo is
 * unchanged out of the box.
 */
export function LivePrControl() {
  const github = usePipelineStore((s) => s.github);
  const createLivePr = usePipelineStore((s) => s.createLivePr);
  const refreshLivePr = usePipelineStore((s) => s.refreshLivePr);
  const resetLivePr = usePipelineStore((s) => s.resetLivePr);

  if (!github.configured) return null;

  const pr = github.pr;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/[0.06] p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <GitPullRequest className="h-4 w-4 text-primary" />
        Real GitHub pull request
        <span className="ml-auto truncate font-mono text-[11px] font-normal text-muted-foreground">
          {github.repo} · {github.mode}
        </span>
      </div>

      {pr.status === "idle" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Open a real PR in{" "}
            <span className="font-mono">{github.repo}</span> from this run’s generated change set.
            Files are sandboxed under <span className="font-mono">agentic-runs/</span> so real source
            is never touched.
          </p>
          <Button size="sm" onClick={() => void createLivePr()}>
            <GitPullRequest className="mr-1.5 h-4 w-4" /> Create real PR
          </Button>
        </div>
      )}

      {pr.status === "creating" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Creating branch, commit &amp; pull request…
        </div>
      )}

      {(pr.status === "open" || pr.status === "polling" || pr.status === "merged") && pr.number && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {pr.status === "merged" ? (
              <GitMerge className="h-4 w-4 text-success" />
            ) : (
              <GitPullRequest className="h-4 w-4 text-primary" />
            )}
            <a
              href={pr.htmlUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              PR #{pr.number} <ExternalLink className="inline h-3 w-3" />
            </a>
            <span className="truncate font-mono text-[11px] text-muted-foreground">{pr.branch}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              title="Refresh checks"
              onClick={() => void refreshLivePr()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {pr.checks.length > 0 ? (
            <ul className="space-y-1 rounded-md border bg-card p-2">
              {pr.checks.map((c) => (
                <CheckRow key={c.name} check={c} />
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleDot className="h-3.5 w-3.5" /> Waiting for checks to start…
            </p>
          )}

          {pr.status === "merged" && (
            <p className="text-xs font-medium text-success">Merged ✓</p>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={resetLivePr}
          >
            Reset
          </Button>
        </div>
      )}

      {pr.status === "error" && (
        <div className="space-y-2">
          <p className="text-xs text-destructive">{pr.error}</p>
          <Button size="sm" variant="outline" onClick={() => void createLivePr()}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
