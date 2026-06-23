import { useEffect, useState } from "react";
import { Loader2, Moon, Pause, Play, Plus, RotateCcw, Sun, Workflow } from "lucide-react";
import { BUSINESS_MAP, BUSINESSES } from "@/data/businesses";
import { usePipelineStore } from "@/store/pipelineStore";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomCompanyDialog } from "@/components/shell/CustomCompanyDialog";

const SPEEDS = [0.5, 1, 2, 4];
const CUSTOM_ACTION = "__custom__";

function BusinessSelector() {
  const business = usePipelineStore((s) => s.business);
  const selectBusiness = usePipelineStore((s) => s.selectBusiness);
  const started = usePipelineStore((s) => s.started);
  const [dialogOpen, setDialogOpen] = useState(false);

  const onValueChange = (v: string) => {
    if (v === CUSTOM_ACTION) {
      setDialogOpen(true);
      return;
    }
    const target =
      BUSINESS_MAP[v] ?? (business && business.id === v ? business : null);
    selectBusiness(target);
  };

  return (
    <>
      <Select value={business?.id ?? ""} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-[230px] bg-card" aria-label="Select a business">
          <SelectValue placeholder="Select a business to begin…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {BUSINESSES.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: b.accent }}
                  />
                  <span className="font-medium">{b.name}</span>
                  <span className="text-muted-foreground">· {b.industry}</span>
                </span>
              </SelectItem>
            ))}
            {business?.custom && (
              <SelectItem key={business.id} value={business.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: business.accent }}
                  />
                  <span className="font-medium">{business.name}</span>
                  <span className="text-muted-foreground">· {business.industry}</span>
                </span>
              </SelectItem>
            )}
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value={CUSTOM_ACTION}>
            <span className="flex items-center gap-2 font-medium text-primary">
              <Plus className="h-3.5 w-3.5" />
              {business?.custom ? "Edit your company…" : "Tailor to your company…"}
            </span>
          </SelectItem>
        </SelectContent>
        {started && (
          <span className="sr-only">Changing the business resets the current run.</span>
        )}
      </Select>
      <CustomCompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

function ModeToggle() {
  const mode = usePipelineStore((s) => s.mode);
  const setMode = usePipelineStore((s) => s.setMode);
  const started = usePipelineStore((s) => s.started);
  const live = usePipelineStore((s) => s.live);
  const checkLiveHealth = usePipelineStore((s) => s.checkLiveHealth);

  // Probe the LLM proxy once so the toggle can reflect provider availability.
  useEffect(() => {
    void checkLiveHealth();
  }, [checkLiveHealth]);

  const dotClass =
    live.available === true
      ? "bg-emerald-500"
      : live.available === false
        ? "bg-rose-500"
        : "bg-amber-400";

  const liveTip =
    live.available === true
      ? `Live via ${live.provider}${live.model ? ` · ${live.model}` : ""} — the model authors a run tailored to this company.`
      : live.available === false
        ? "No LLM provider configured. Add Azure OpenAI or OpenAI keys to .env and restart the dev server."
        : "Checking for a configured LLM provider…";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="inline-flex items-center rounded-md border bg-card p-0.5">
        {(["simulation", "live"] as const).map((m) => {
          const active = mode === m;
          const btn = (
            <button
              key={m}
              type="button"
              disabled={started}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs font-medium capitalize transition-colors disabled:opacity-50",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "live" && (
                <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} aria-hidden />
              )}
              {m}
            </button>
          );
          return m === "live" ? (
            <Tooltip key={m}>
              <TooltipTrigger asChild>{btn}</TooltipTrigger>
              <TooltipContent className="max-w-[240px]">{liveTip}</TooltipContent>
            </Tooltip>
          ) : (
            btn
          );
        })}
      </div>
    </TooltipProvider>
  );
}

/**
 * Model picker for Live mode. Lets the demo switch between the configured model
 * profiles (e.g. a fast model vs. a deep-reasoning model). Hidden in simulation
 * and when fewer than two models are configured. Locked while a run is active.
 */
function ModelToggle() {
  const mode = usePipelineStore((s) => s.mode);
  const started = usePipelineStore((s) => s.started);
  const models = usePipelineStore((s) => s.live.models);
  const selectedModelId = usePipelineStore((s) => s.live.selectedModelId);
  const setLiveModel = usePipelineStore((s) => s.setLiveModel);

  if (mode !== "live" || models.length < 2) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="inline-flex items-center rounded-md border bg-card p-0.5">
        {models.map((m) => {
          const active = selectedModelId === m.id;
          return (
            <Tooltip key={m.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={started || !m.configured}
                  onClick={() => setLiveModel(m.id)}
                  className={cn(
                    "rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m.label}
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px]">
                {m.configured
                  ? m.description || `Use ${m.label} for this run.`
                  : `${m.label} isn't configured in .env.`}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="h-9 w-9"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function RunControls() {
  const business = usePipelineStore((s) => s.business);
  const started = usePipelineStore((s) => s.started);
  const running = usePipelineStore((s) => s.running);
  const finished = usePipelineStore((s) => s.finished);
  const speed = usePipelineStore((s) => s.speed);
  const mode = usePipelineStore((s) => s.mode);
  const liveStatus = usePipelineStore((s) => s.live.status);
  const start = usePipelineStore((s) => s.start);
  const pause = usePipelineStore((s) => s.pause);
  const resume = usePipelineStore((s) => s.resume);
  const reset = usePipelineStore((s) => s.reset);
  const setSpeed = usePipelineStore((s) => s.setSpeed);

  const generating = mode === "live" && liveStatus === "generating";

  const primary = (() => {
    if (generating) {
      return (
        <Button disabled className="gap-1.5">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating…
        </Button>
      );
    }
    if (finished) {
      return (
        <Button onClick={() => { reset(); start(); }} className="gap-1.5">
          <RotateCcw className="h-4 w-4" /> Run again
        </Button>
      );
    }
    if (!started) {
      return (
        <Button onClick={start} disabled={!business} className="gap-1.5">
          <Play className="h-4 w-4" /> Run pipeline
        </Button>
      );
    }
    if (running) {
      return (
        <Button variant="secondary" onClick={pause} className="gap-1.5">
          <Pause className="h-4 w-4" /> Pause
        </Button>
      );
    }
    return (
      <Button onClick={resume} className="gap-1.5">
        <Play className="h-4 w-4" /> Resume
      </Button>
    );
  })();

  return (
    <div className="flex items-center gap-2">
      <Select value={String(speed)} onValueChange={(v) => setSpeed(Number(v))}>
        <SelectTrigger className="h-9 w-[72px] bg-card" aria-label="Playback speed">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPEEDS.map((s) => (
            <SelectItem key={s} value={String(s)}>
              {s}×
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {primary}
      {started && (
        <Button variant="ghost" size="icon" onClick={reset} aria-label="Reset run" className="h-9 w-9">
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function Header() {
  return (
    <header className="z-20 flex h-16 shrink-0 items-center gap-4 border-b bg-app-rail/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-app-rail/60">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground shadow-fluent">
          <Workflow className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2 text-sm font-semibold">
            Agentic DevOps
            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
              Magentic
            </span>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            Enterprise idea-to-market pipeline
          </div>
        </div>
      </div>

      <div className="ml-2 hidden md:block">
        <BusinessSelector />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden lg:block">
          <ModeToggle />
        </div>
        <div className="hidden lg:block">
          <ModelToggle />
        </div>
        <ThemeToggle />
        <RunControls />
      </div>
    </header>
  );
}

/** Compact business selector shown on small screens below the header. */
export function MobileBusinessBar() {
  return (
    <div className="flex items-center gap-2 border-b bg-app-rail/60 px-4 py-2 md:hidden">
      <BusinessSelector />
    </div>
  );
}
