import { useEffect, useState } from "react";
import { Building2, Sparkles } from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { BUSINESS_MAP } from "@/data/businesses";
import {
  TEMPLATE_OPTIONS,
  makeCustomBusiness,
} from "@/data/content/custom";
import type { BusinessProfile } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACCENTS = ["#0078D4", "#6B69D6", "#038387", "#498205", "#CA5010", "#8764B8"];
const SIZES: BusinessProfile["size"][] = ["startup", "midmarket", "enterprise"];
const DEFAULT_TEMPLATE = TEMPLATE_OPTIONS[0]?.id ?? "contoso-retail";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomCompanyDialog({ open, onOpenChange }: Props) {
  const selectBusiness = usePipelineStore((s) => s.selectBusiness);
  const existing = usePipelineStore((s) => s.business);

  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE);
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [size, setSize] = useState<BusinessProfile["size"]>("enterprise");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState(ACCENTS[0]);

  const tpl = BUSINESS_MAP[templateId];

  // Prefill from an in-progress custom company so edits round-trip; otherwise
  // present a clean form each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    if (existing?.custom) {
      setName(existing.name);
      setTemplateId(existing.templateId ?? DEFAULT_TEMPLATE);
      setIndustry(existing.industry);
      setRegion(existing.region);
      setSize(existing.size);
      setDescription(existing.description);
      setAccent(existing.accent);
    } else {
      setName("");
      setTemplateId(DEFAULT_TEMPLATE);
      setIndustry("");
      setRegion("");
      setSize("enterprise");
      setDescription("");
      setAccent(ACCENTS[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onTemplateChange = (value: string) => {
    setTemplateId(value);
    const next = BUSINESS_MAP[value];
    if (next) setAccent(next.accent);
  };

  const valid = name.trim().length > 1;

  const submit = () => {
    if (!valid) return;
    selectBusiness(
      makeCustomBusiness({ name, templateId, industry, region, size, description, accent }),
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="grid h-7 w-7 place-items-center rounded-md text-white"
              style={{ backgroundColor: accent }}
            >
              <Building2 className="h-4 w-4" />
            </span>
            Tailor the demo to your company
          </DialogTitle>
          <DialogDescription>
            Use your own company name and details. The pipeline is modeled after a built-in
            scenario, with your brand woven through every agent, artifact and the orchestrator.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="cc-name">
              Company name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="e.g. Acme Corporation"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cc-template">Model the demo after</Label>
              <Select value={templateId} onValueChange={onTemplateChange}>
                <SelectTrigger id="cc-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: t.accent }}
                        />
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-size">Company size</Label>
              <Select value={size} onValueChange={(v) => setSize(v as BusinessProfile["size"])}>
                <SelectTrigger id="cc-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cc-industry">Industry</Label>
              <Input
                id="cc-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder={tpl?.industry ?? "Industry"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-region">Region</Label>
              <Input
                id="cc-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder={tpl?.region ?? "Region"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cc-desc">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="cc-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={tpl?.description ?? "A short description of the company"}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Brand accent</Label>
            <div className="flex items-center gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  aria-label={`Use accent ${c}`}
                  className={cn(
                    "h-6 w-6 rounded-full ring-offset-2 ring-offset-background transition",
                    accent.toLowerCase() === c.toLowerCase() && "ring-2 ring-ring",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                aria-label="Custom accent color"
                className="ml-1 h-6 w-8 cursor-pointer rounded border bg-transparent p-0"
              />
            </div>
          </div>

          <p className="text-[11px] leading-snug text-muted-foreground">
            The chosen scenario's product idea drives the run; your company name, industry and
            brand are applied throughout. GitHub and deployment remain simulated.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid} className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Use this company
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
