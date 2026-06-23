import type { BusinessProfile } from "@/types";
import type { RunContent } from "@/data/content/types";
import { BUSINESS_MAP } from "@/data/businesses";
import { buildCustomContent } from "@/data/content/custom";
import { contosoContent } from "@/data/content/contoso";
import { fabrikamContent } from "@/data/content/fabrikam";
import { northwindContent } from "@/data/content/northwind";

export const CONTENT_BY_BUSINESS: Record<string, RunContent> = {
  "contoso-retail": contosoContent,
  "fabrikam-financial": fabrikamContent,
  "northwind-logistics": northwindContent,
};

/**
 * Resolve the run content for any business — a built-in returns its authored
 * content directly; a custom company returns its template content with the
 * company name/brand swapped in.
 */
export function resolveContent(business: BusinessProfile): RunContent | null {
  const direct = CONTENT_BY_BUSINESS[business.id];
  if (direct) return direct;

  if (business.custom && business.templateId) {
    const templateContent = CONTENT_BY_BUSINESS[business.templateId];
    const templateProfile = BUSINESS_MAP[business.templateId];
    if (templateContent && templateProfile) {
      return buildCustomContent(business, templateContent, templateProfile);
    }
  }
  return null;
}
