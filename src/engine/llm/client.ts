// Browser-side client for the dev LLM proxy (see vite.config.ts).
// The proxy keeps provider keys server-side; we only ever speak to /api/llm.

export interface LlmModelInfo {
  id: string;
  label: string;
  description?: string;
  provider: "azure-openai" | "openai" | "none";
  model: string;
  configured: boolean;
}

export interface LlmHealth {
  configured: boolean;
  provider: "azure-openai" | "openai" | "none";
  model: string;
  models?: LlmModelInfo[];
  default?: string;
}

export interface LlmRequest {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  /** Optional model id from the registry (see /api/llm/health → models). */
  model?: string;
  signal?: AbortSignal;
}

/** Report whether a provider is configured (used to gate Live mode in the UI). */
export async function llmHealth(): Promise<LlmHealth> {
  try {
    const resp = await fetch("/api/llm/health", { method: "GET" });
    if (!resp.ok) return { configured: false, provider: "none", model: "" };
    return (await resp.json()) as LlmHealth;
  } catch {
    return { configured: false, provider: "none", model: "" };
  }
}

/** Request a JSON completion from the proxy. Returns the raw assistant string. */
export async function llmComplete(req: LlmRequest): Promise<string> {
  const { signal, ...body } = req;
  const resp = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error((data && data.error) || `LLM request failed (${resp.status}).`);
  }
  if (!data.content) throw new Error("LLM returned no content.");
  return data.content as string;
}

/** Parse a JSON object from a model response, tolerating code fences / prose. */
export function parseJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  // strip ```json fences if present
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(unfenced) as Record<string, unknown>;
  } catch {
    // last resort: extract the outermost { ... }
    const start = unfenced.indexOf("{");
    const end = unfenced.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(unfenced.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("Model response was not valid JSON.");
  }
}
