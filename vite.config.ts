import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

const execAsync = promisify(exec);

type EnvMap = Record<string, string>;

interface ProviderConfig {
  configured: boolean;
  provider: "azure-openai" | "openai" | "none";
  model: string;
}

interface ModelInfo {
  id: string;
  label: string;
  description: string;
  provider: ProviderConfig["provider"];
  model: string;
  configured: boolean;
}

const TRUTHY = new Set(["1", "true", "yes", "on"]);

/** Whether to authenticate to Azure OpenAI with an Entra ID token instead of a key. */
function azureUsesAad(env: EnvMap): boolean {
  const explicit = env.AZURE_OPENAI_USE_AAD?.trim().toLowerCase();
  if (explicit) return TRUTHY.has(explicit);
  // Fall back to AAD when an endpoint+deployment are configured but no key is provided.
  return Boolean(
    env.AZURE_OPENAI_ENDPOINT?.trim() &&
      env.AZURE_OPENAI_DEPLOYMENT?.trim() &&
      !env.AZURE_OPENAI_API_KEY?.trim(),
  );
}

/** gpt-5 and o-series reasoning models require `max_completion_tokens` (not `max_tokens`). */
function usesCompletionTokens(deployment: string): boolean {
  return /^(gpt-5|o1|o3|o4)/i.test(deployment.trim());
}

function resolveProvider(env: EnvMap): ProviderConfig {
  const azureEndpoint = env.AZURE_OPENAI_ENDPOINT?.trim();
  const azureKey = env.AZURE_OPENAI_API_KEY?.trim();
  const azureDeployment = env.AZURE_OPENAI_DEPLOYMENT?.trim();
  if (azureEndpoint && azureDeployment && (azureKey || azureUsesAad(env))) {
    return { configured: true, provider: "azure-openai", model: azureDeployment };
  }
  const openaiKey = env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return { configured: true, provider: "openai", model: env.OPENAI_MODEL?.trim() || "gpt-4o" };
  }
  return { configured: false, provider: "none", model: "" };
}

// --- Multi-model registry ---------------------------------------------------
// A run can offer several model profiles (e.g. a fast model and a deep-reasoning
// model). Define them in .env with `LLM_MODELS=fast,deep` plus prefixed vars:
//   LLM_MODEL_fast_LABEL=GPT-4.1
//   LLM_MODEL_fast_AZURE_OPENAI_ENDPOINT=...
//   LLM_MODEL_fast_AZURE_OPENAI_DEPLOYMENT=gpt-4.1
//   ... (any AZURE_OPENAI_* / OPENAI_* key, optionally LABEL + DESCRIPTION)
// If `LLM_MODELS` is absent, the flat AZURE_OPENAI_* / OPENAI_* vars act as a
// single model with id "default" (back-compat).

function modelIds(env: EnvMap): string[] {
  const list = env.LLM_MODELS?.trim();
  return list ? list.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

/** Extract the env subset for one model id, stripping the `LLM_MODEL_<id>_` prefix. */
function buildModelEnv(env: EnvMap, id: string): EnvMap {
  const prefix = `LLM_MODEL_${id}_`;
  const sub: EnvMap = {};
  for (const k of Object.keys(env)) {
    if (k.startsWith(prefix)) sub[k.slice(prefix.length)] = env[k];
  }
  return sub;
}

function defaultModelId(env: EnvMap): string {
  const explicit = env.LLM_DEFAULT_MODEL?.trim();
  if (explicit) return explicit;
  return modelIds(env)[0] ?? "default";
}

/** Resolve the env to use for a request — a model subset, or the flat env. */
function resolveModelEnv(env: EnvMap, id?: string): EnvMap {
  const ids = modelIds(env);
  if (ids.length === 0) return env; // flat single-model mode
  const chosen = id && ids.includes(id) ? id : defaultModelId(env);
  return buildModelEnv(env, chosen);
}

/** The list of available model profiles, with provider/config status. */
function listModels(env: EnvMap): ModelInfo[] {
  const ids = modelIds(env);
  if (ids.length === 0) {
    const cfg = resolveProvider(env);
    return [
      {
        id: "default",
        label: cfg.model || "default",
        description: "",
        provider: cfg.provider,
        model: cfg.model,
        configured: cfg.configured,
      },
    ];
  }
  return ids.map((id) => {
    const sub = buildModelEnv(env, id);
    const cfg = resolveProvider(sub);
    return {
      id,
      label: sub.LABEL?.trim() || cfg.model || id,
      description: sub.DESCRIPTION?.trim() || "",
      provider: cfg.provider,
      model: cfg.model,
      configured: cfg.configured,
    };
  });
}

// In-memory cache for Entra ID access tokens, keyed by subscription (dev-only proxy).
const aadTokens = new Map<string, { value: string; expiresAt: number }>();

/** Obtain an Entra ID token for Azure Cognitive Services via the logged-in Azure CLI. */
async function getAzureAadToken(env: EnvMap): Promise<string> {
  const now = Date.now();
  // Pin the token to a specific subscription so it targets the right tenant
  // regardless of the CLI's active subscription (different models may live in
  // different tenants). Cache per-subscription so multiple models coexist.
  const sub = env.AZURE_OPENAI_AAD_SUBSCRIPTION?.trim() ?? "";
  const cached = aadTokens.get(sub);
  if (cached && cached.expiresAt - 120_000 > now) return cached.value;
  const subArg = sub ? ` --subscription "${sub.replace(/"/g, "")}"` : "";
  const { stdout } = await execAsync(
    `az account get-access-token --resource https://cognitiveservices.azure.com${subArg} --output json`,
    { maxBuffer: 1024 * 1024 },
  );
  const parsed = JSON.parse(stdout) as { accessToken: string; expires_on?: number; expiresOn?: string };
  const expiresAt = parsed.expires_on
    ? parsed.expires_on * 1000
    : parsed.expiresOn
      ? new Date(parsed.expiresOn).getTime()
      : now + 30 * 60_000;
  aadTokens.set(sub, { value: parsed.accessToken, expiresAt });
  return parsed.accessToken;
}

async function callProvider(
  env: EnvMap,
  body: { system: string; user: string; maxTokens?: number; temperature?: number },
): Promise<string> {
  const cfg = resolveProvider(env);
  const messages = [
    { role: "system", content: body.system },
    { role: "user", content: body.user },
  ];
  const payload: Record<string, unknown> = {
    messages,
    response_format: { type: "json_object" },
  };

  let url: string;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (cfg.provider === "azure-openai") {
    const endpoint = env.AZURE_OPENAI_ENDPOINT!.trim().replace(/\/+$/, "");
    const deployment = env.AZURE_OPENAI_DEPLOYMENT!.trim();
    const apiVersion = env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
    url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    if (usesCompletionTokens(deployment)) {
      // gpt-5 / o-series: hidden reasoning tokens share the completion budget, so
      // give generous headroom and minimize reasoning to keep JSON output intact.
      // These models only support the default temperature (1), so we omit it.
      payload.max_completion_tokens = Math.max(body.maxTokens ?? 2400, 8000);
      payload.reasoning_effort = "minimal";
    } else {
      payload.temperature = body.temperature ?? 0.7;
      payload.max_tokens = body.maxTokens ?? 2400;
    }
    if (azureUsesAad(env)) {
      headers["Authorization"] = `Bearer ${await getAzureAadToken(env)}`;
    } else {
      headers["api-key"] = env.AZURE_OPENAI_API_KEY!.trim();
    }
  } else if (cfg.provider === "openai") {
    const base = env.OPENAI_BASE_URL?.trim().replace(/\/+$/, "") || "https://api.openai.com/v1";
    url = `${base}/chat/completions`;
    headers["Authorization"] = `Bearer ${env.OPENAI_API_KEY!.trim()}`;
    payload.temperature = body.temperature ?? 0.7;
    payload.max_tokens = body.maxTokens ?? 2400;
    payload.model = env.OPENAI_MODEL?.trim() || "gpt-4o";
  } else {
    throw new Error(
      "No LLM provider configured. Set AZURE_OPENAI_* or OPENAI_API_KEY in .env (see .env.example).",
    );
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Provider ${cfg.provider} returned ${resp.status}: ${text.slice(0, 500)}`);
  }

  const data: any = await resp.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Provider returned an empty completion.");
  return content;
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error("Request body too large"));
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

/**
 * Dev-only middleware that proxies LLM chat completions so the API key stays
 * server-side (never shipped to the browser bundle). Supports Azure OpenAI and
 * OpenAI, selected from environment variables.
 */
function llmProxy(env: EnvMap): Plugin {
  return {
    name: "agentic-devops-llm-proxy",
    configureServer(server) {
      server.middlewares.use("/api/llm/health", (_req, res) => {
        const models = listModels(env);
        const def = defaultModelId(env);
        const defaultModel = models.find((m) => m.id === def) ?? models[0];
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            configured: defaultModel?.configured ?? false,
            provider: defaultModel?.provider ?? "none",
            model: defaultModel?.model ?? "",
            models,
            default: defaultModel?.id ?? def,
          }),
        );
      });

      server.middlewares.use("/api/llm", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        res.setHeader("Content-Type", "application/json");
        try {
          const raw = await readBody(req);
          const parsed = raw ? JSON.parse(raw) : {};
          if (!parsed.system || !parsed.user) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Missing 'system' or 'user' in request body." }));
            return;
          }
          const subEnv = resolveModelEnv(
            env,
            typeof parsed.model === "string" ? parsed.model : undefined,
          );
          const content = await callProvider(subEnv, parsed);
          res.end(JSON.stringify({ content }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // load *all* env vars (no prefix filter) so server-side keys are available to
  // the proxy without exposing them to the client bundle.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), llmProxy(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
