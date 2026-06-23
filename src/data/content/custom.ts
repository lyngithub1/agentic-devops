import type { BusinessProfile } from "@/types";
import type { RunContent } from "@/data/content/types";
import { BUSINESS_MAP, BUSINESSES } from "@/data/businesses";

/**
 * Runtime "tailor to your company" support.
 *
 * A custom company is modeled after one of the authored built-in businesses
 * (the "template"). We reuse that template's fully authored {@link RunContent}
 * but swap every reference to the template company's name and brand token for
 * the user's company, so a demo reads as if it were built for them.
 */

export interface CustomCompanyInput {
  name: string;
  industry?: string;
  region?: string;
  description?: string;
  size?: BusinessProfile["size"];
  accent?: string;
  templateId: string;
}

/** Lightweight options for the "model the demo after" picker. */
export const TEMPLATE_OPTIONS = BUSINESSES.map((b) => ({
  id: b.id,
  name: b.name,
  industry: b.industry,
  accent: b.accent,
}));

export const CUSTOM_BUSINESS_ID = "custom-company";

function firstWord(value: string): string {
  return value.trim().split(/\s+/)[0] ?? value.trim();
}

function replaceInString(input: string, pairs: Array<[string, string]>): string {
  let out = input;
  for (const [from, to] of pairs) {
    if (from && from !== to) out = out.split(from).join(to);
  }
  return out;
}

/** Deep, immutable string substitution across a plain-data structure. */
function deepReplace(value: unknown, pairs: Array<[string, string]>): unknown {
  if (typeof value === "string") return replaceInString(value, pairs);
  if (Array.isArray(value)) return value.map((item) => deepReplace(item, pairs));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = deepReplace(val, pairs);
    }
    return out;
  }
  return value;
}

/**
 * Build a synthetic {@link BusinessProfile} from the custom-company form,
 * inheriting any blank fields from the chosen template.
 */
export function makeCustomBusiness(input: CustomCompanyInput): BusinessProfile {
  const tpl = BUSINESS_MAP[input.templateId];
  const name = input.name.trim();
  return {
    id: CUSTOM_BUSINESS_ID,
    name,
    tagline: tpl?.tagline ?? "Tailored product pipeline",
    industry: input.industry?.trim() || tpl?.industry || "Technology",
    size: input.size ?? tpl?.size ?? "enterprise",
    region: input.region?.trim() || tpl?.region || "Global",
    currentProducts: tpl?.currentProducts ?? [],
    strategicGoals: tpl?.strategicGoals ?? [],
    description:
      input.description?.trim() ||
      `${name} — a tailored Agentic DevOps demo modeled after ${tpl?.name ?? "an enterprise"}.`,
    accent: input.accent?.trim() || tpl?.accent || "#0078D4",
    custom: true,
    templateId: input.templateId,
  };
}

/**
 * Produce tailored {@link RunContent} for a custom business by swapping the
 * template company's name/brand for the custom company's throughout.
 */
export function buildCustomContent(
  business: BusinessProfile,
  templateContent: RunContent,
  templateProfile: BusinessProfile,
): RunContent {
  const pairs: Array<[string, string]> = [
    // longest first so the full name is matched before the bare brand token
    [templateProfile.name, business.name],
    [firstWord(templateProfile.name), firstWord(business.name)],
  ];
  const cloned = deepReplace(templateContent, pairs) as RunContent;
  return { ...cloned, businessId: business.id };
}
