import { usePipelineStore, selectArtifactById } from "@/store/pipelineStore";
import { ARTIFACT_META, PHASE_MAP } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArtifactBody } from "@/components/artifacts/renderers";

export function ArtifactDrawer() {
  const artifact = usePipelineStore((s) => selectArtifactById(s, s.selectedArtifactId));
  const selectArtifact = usePipelineStore((s) => s.selectArtifact);

  const meta = artifact ? ARTIFACT_META[artifact.type] : null;
  const phaseMeta = artifact ? PHASE_MAP[artifact.phase] : null;
  const Icon = meta?.icon;

  return (
    <Sheet open={!!artifact} onOpenChange={(open) => !open && selectArtifact(null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {artifact && meta && phaseMeta && (
          <>
            <SheetHeader className="space-y-0 border-b bg-card/60 px-5 py-4 text-left">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `${phaseMeta.color}1A`, color: phaseMeta.color }}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-base">{artifact.title}</SheetTitle>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: phaseMeta.color }}
                    />
                    {phaseMeta.name} · {meta.label}
                    <span className="text-muted-foreground/60">· {formatTime(artifact.createdAt)}</span>
                  </p>
                </div>
              </div>
            </SheetHeader>

            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5">
              <ArtifactBody artifact={artifact} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
