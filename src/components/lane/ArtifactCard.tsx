import { ChevronRight } from "lucide-react";
import type { Artifact } from "@/types";
import { ARTIFACT_META } from "@/lib/constants";
import { usePipelineStore } from "@/store/pipelineStore";
import { cn } from "@/lib/utils";

interface ArtifactCardProps {
  artifact: Artifact;
  accent: string;
}

export function ArtifactCard({ artifact, accent }: ArtifactCardProps) {
  const selectArtifact = usePipelineStore((s) => s.selectArtifact);
  const selectedId = usePipelineStore((s) => s.selectedArtifactId);
  const meta = ARTIFACT_META[artifact.type];
  const Icon = meta.icon;
  const selected = selectedId === artifact.id;

  return (
    <button
      type="button"
      onClick={() => selectArtifact(artifact.id)}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left shadow-fluent transition-all animate-fade-in-up hover:-translate-y-0.5 hover:shadow-fluent-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "ring-2 ring-primary",
      )}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-xs font-semibold">{artifact.title}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {artifact.subtitle ? artifact.subtitle : meta.label}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
