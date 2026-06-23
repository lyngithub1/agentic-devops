import { PHASE_ORDER } from "@/lib/constants";
import { usePipelineStore } from "@/store/pipelineStore";
import { Header, MobileBusinessBar } from "@/components/shell/Header";
import { PipelineRail } from "@/components/pipeline/PipelineRail";
import { PhaseLane } from "@/components/lane/PhaseLane";
import { OrchestratorConsole } from "@/components/orchestrator/OrchestratorConsole";
import { ArtifactDrawer } from "@/components/artifacts/ArtifactDrawer";
import { Onboarding } from "@/components/shell/Onboarding";
import { LiveGenerationOverlay } from "@/components/shell/LiveGenerationOverlay";

export default function App() {
  const business = usePipelineStore((s) => s.business);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-shell text-foreground">
      <Header />
      <MobileBusinessBar />
      <PipelineRail />

      <main className="relative min-h-0 flex-1 overflow-hidden">
        {business ? (
          <div className="scrollbar-thin flex h-full gap-3 overflow-x-auto p-3 sm:p-4">
            {PHASE_ORDER.map((id) => (
              <PhaseLane key={id} id={id} />
            ))}
          </div>
        ) : (
          <Onboarding />
        )}
        <LiveGenerationOverlay />
      </main>

      <OrchestratorConsole />
      <ArtifactDrawer />
    </div>
  );
}
