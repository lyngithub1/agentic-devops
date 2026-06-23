import type { BusinessProfile, Idea } from "@/types";
import type { RunContent } from "@/data/content/types";
import { BUSINESS_MAP } from "@/data/businesses";
import {
  CONTENT_BY_BUSINESS,
} from "@/data/content";
import { buildCustomContent } from "@/data/content/custom";
import { contosoContent } from "@/data/content/contoso";
import { llmComplete, parseJsonObject } from "@/engine/llm/client";
import {
  SYSTEM_PROMPT,
  buildContext,
  stage1User,
  stage2User,
  stage3User,
  stage4User,
} from "@/engine/llm/prompts";
import {
  coerceAdr,
  coerceBusinessCase,
  coerceCode,
  coerceCompetitive,
  coerceDashboard,
  coerceDeployment,
  coerceFeedback,
  coerceGtm,
  coerceIdeas,
  coerceMarketBrief,
  coerceMockPr,
  coerceOptimization,
  coerceQualityGate,
  coerceScaffold,
  coerceTechPlan,
  coerceTestReport,
  coerceTriage,
  coerceUserStory,
} from "@/engine/llm/coerce";

export type LiveStageStatus = "running" | "done" | "fallback";

export interface LiveStageUpdate {
  index: number; // 1-based
  total: number;
  label: string;
  status: LiveStageStatus;
  detail?: string;
}

export interface GenerateOptions {
  onStage?: (u: LiveStageUpdate) => void;
  signal?: AbortSignal;
  model?: string;
}

/** Pick the authored scenario a live run is modeled after. */
function pickTemplate(business: BusinessProfile): {
  content: RunContent;
  profile: BusinessProfile;
} {
  const own = CONTENT_BY_BUSINESS[business.id];
  if (own && BUSINESS_MAP[business.id]) {
    return { content: own, profile: BUSINESS_MAP[business.id] };
  }
  if (business.templateId && CONTENT_BY_BUSINESS[business.templateId]) {
    return { content: CONTENT_BY_BUSINESS[business.templateId], profile: BUSINESS_MAP[business.templateId] };
  }
  return { content: contosoContent, profile: BUSINESS_MAP["contoso-retail"] };
}

const STAGE_LABELS = [
  "Ideate — market research & idea generation",
  "Planner — business case & user story",
  "Developer — architecture, scaffold & code",
  "Validator & Operator — tests, deploy, GTM",
];

/** Labels for the four staged LLM calls, exposed for progress UI. */
export const LIVE_STAGE_LABELS: readonly string[] = STAGE_LABELS;

/**
 * Generate tailored {@link RunContent} for a business via staged LLM calls.
 *
 * Starts from a rebranded template (always valid) and overlays each phase's
 * generated content on top. A stage that fails simply keeps the template's
 * content for that phase, so the result is always a complete, valid run.
 *
 * Throws only if EVERY stage fails (e.g. provider/network down), so the caller
 * can surface a clear error instead of presenting a non-live run as live.
 */
export async function generateLiveContent(
  business: BusinessProfile,
  opts: GenerateOptions = {},
): Promise<RunContent> {
  const { base, ctx } = buildLiveBase(business);
  const total = STAGE_LABELS.length;
  let successes = 0;
  for (const stage of [1, 2, 3, 4] as StageId[]) {
    const label = STAGE_LABELS[stage - 1];
    opts.onStage?.({ index: stage, total, label, status: "running" });
    const outcome = await applyLiveStage(stage, base, ctx, { signal: opts.signal, model: opts.model });
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (outcome.ok) successes += 1;
    opts.onStage?.({
      index: stage,
      total,
      label,
      status: outcome.ok ? "done" : "fallback",
      detail: outcome.detail,
    });
  }

  if (successes === 0) {
    throw new Error(
      "Live generation failed — no stages completed. Check the LLM provider configuration and try again.",
    );
  }

  return base;
}

export type StageId = 1 | 2 | 3 | 4;

export interface LiveBase {
  base: RunContent;
  ctx: string;
}

/**
 * Build the always-valid baseline (rebranded template) plus the prompt context.
 * Live stages overlay generated content onto {@link LiveBase.base} in place.
 */
export function buildLiveBase(business: BusinessProfile): LiveBase {
  const { content: templateContent, profile: templateProfile } = pickTemplate(business);
  const base = buildCustomContent(business, templateContent, templateProfile);
  const ctx = buildContext(business);
  return { base, ctx };
}

export interface StageOutcome {
  ok: boolean;
  detail?: string;
}

/**
 * Run one live generation stage and overlay its content onto {@link base}.
 *
 * Never throws for model/parse failures — it keeps the baseline content for
 * that phase and returns `{ ok: false }`. Only an aborted signal propagates.
 *
 * Stage map: 1 → Ideate, 2 → Planner, 3 → Developer, 4 → Validator + Operator.
 */
export async function applyLiveStage(
  stage: StageId,
  base: RunContent,
  ctx: string,
  opts: { signal?: AbortSignal; model?: string } = {},
): Promise<StageOutcome> {
  const model = opts.model;
  try {
    if (stage === 1) {
      const obj = parseJsonObject(
        await llmComplete({ system: SYSTEM_PROMPT, user: stage1User(ctx), maxTokens: 2400, model, signal: opts.signal }),
      );
      if (typeof obj.ideaTheme === "string" && obj.ideaTheme.trim()) {
        base.ideaTheme = obj.ideaTheme.trim();
      }
      base.marketBrief = coerceMarketBrief(obj.marketBrief, base.marketBrief);
      base.competitive = coerceCompetitive(obj.competitive, base.competitive);
      const { ideas, chosenIdeaId } = coerceIdeas(obj.ideas, base.ideas);
      base.ideas = ideas;
      base.chosenIdeaId = chosenIdeaId;
      return { ok: true };
    }

    const chosen: Idea = base.ideas.find((i) => i.id === base.chosenIdeaId) ?? base.ideas[0];

    if (stage === 2) {
      const obj = parseJsonObject(
        await llmComplete({ system: SYSTEM_PROMPT, user: stage2User(ctx, chosen), maxTokens: 2000, model, signal: opts.signal }),
      );
      base.triage = coerceTriage(obj.triage, base.triage, chosen, base.ideas.slice(1));
      base.businessCase = coerceBusinessCase(obj.businessCase, base.businessCase);
      base.userStory = coerceUserStory(obj.userStory, base.userStory);
      return { ok: true };
    }

    if (stage === 3) {
      const obj = parseJsonObject(
        await llmComplete({ system: SYSTEM_PROMPT, user: stage3User(ctx, chosen), maxTokens: 2800, model, signal: opts.signal }),
      );
      base.techPlan = coerceTechPlan(obj.techPlan, base.techPlan);
      base.adr = coerceAdr(obj.adr, base.adr);
      base.scaffold = coerceScaffold(obj.scaffold, base.scaffold);
      base.code = coerceCode(obj.code, base.code);
      return { ok: true };
    }

    // stage === 4 — Validator + Operator
    const obj = parseJsonObject(
      await llmComplete({ system: SYSTEM_PROMPT, user: stage4User(ctx, chosen), maxTokens: 3400, model, signal: opts.signal }),
    );
    base.testReport = coerceTestReport(obj.testReport, base.testReport);
    base.qualityGate = coerceQualityGate(obj.qualityGate, base.qualityGate);
    base.pr = coerceMockPr(obj.pr, base.pr);
    base.deployment = coerceDeployment(obj.deployment, base.deployment);
    base.dashboard = coerceDashboard(obj.dashboard, base.dashboard);
    base.optimization = coerceOptimization(obj.optimization, base.optimization);
    base.gtm = coerceGtm(obj.gtm, base.gtm);
    base.feedback = coerceFeedback(obj.feedback, base.feedback);
    return { ok: true };
  } catch (err) {
    if (opts.signal?.aborted) throw err;
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}
