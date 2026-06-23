// Dev-only middleware that performs REAL GitHub operations server-side so the
// credential (a fine-grained PAT or a GitHub App installation token) never
// reaches the browser bundle. Mirrors the LLM proxy in vite.config.ts and uses
// only Node built-ins (no SDK), consistent with the rest of the project.
//
// Server-side env (never exposed to the client — Vite only ships VITE_*):
//   GITHUB_REPO=owner/repo                 (required)
//   GITHUB_PAT=github_pat_...              simplest local dev: a fine-grained PAT
//                                          (Contents: RW, Pull requests: RW,
//                                           Checks: R, Metadata: R) on that repo
//   ...or a GitHub App (recommended for shared/prod):
//   GITHUB_APP_ID=123456
//   GITHUB_APP_INSTALLATION_ID=12345678
//   GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...   (literal \n ok)
import crypto from "node:crypto";
import type { Plugin } from "vite";

type EnvMap = Record<string, string>;

interface GhConfig {
  repo: string; // owner/repo
  owner: string;
  name: string;
  pat?: string;
  appId?: string;
  installationId?: string;
  privateKey?: string;
}

interface FileChange {
  path: string;
  content: string;
}

const API = "https://api.github.com";
const UA = "agentic-devops-dev-proxy";

function readConfig(env: EnvMap): GhConfig | null {
  const repo = (env.GITHUB_REPO || "").trim();
  if (!repo || !repo.includes("/")) return null;
  const [owner, name] = repo.split("/", 2);
  const pat = (env.GITHUB_PAT || env.GITHUB_TOKEN || "").trim() || undefined;
  const appId = (env.GITHUB_APP_ID || "").trim() || undefined;
  const installationId = (env.GITHUB_APP_INSTALLATION_ID || "").trim() || undefined;
  let privateKey = (env.GITHUB_APP_PRIVATE_KEY || "").trim() || undefined;
  if (privateKey && privateKey.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");
  return { repo, owner, name, pat, appId, installationId, privateKey };
}

function authMode(cfg: GhConfig): "pat" | "app" | "none" {
  if (cfg.pat) return "pat";
  if (cfg.appId && cfg.installationId && cfg.privateKey) return "app";
  return "none";
}
function hasAuth(cfg: GhConfig): boolean {
  return authMode(cfg) !== "none";
}

// --- GitHub App JWT -> installation token (cached) --------------------------
function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}
function appJwt(cfg: GhConfig): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: cfg.appId }));
  const data = `${header}.${payload}`;
  const sig = crypto.createSign("RSA-SHA256").update(data).sign(cfg.privateKey as string, "base64url");
  return `${data}.${sig}`;
}

let tokenCache: { token: string; exp: number } | null = null;
async function installationToken(cfg: GhConfig): Promise<string> {
  if (tokenCache && tokenCache.exp - 60_000 > Date.now()) return tokenCache.token;
  const jwt = appJwt(cfg);
  const resp = await fetch(`${API}/app/installations/${cfg.installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      "User-Agent": UA,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!resp.ok) {
    throw new Error(`GitHub App auth failed (${resp.status}): ${(await resp.text()).slice(0, 300)}`);
  }
  const data: any = await resp.json();
  tokenCache = { token: data.token, exp: new Date(data.expires_at).getTime() };
  return data.token;
}

async function token(cfg: GhConfig): Promise<string> {
  if (cfg.pat) return cfg.pat;
  return installationToken(cfg);
}

async function gh(cfg: GhConfig, method: string, path: string, body?: unknown): Promise<any> {
  const tok = await token(cfg);
  const resp = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${tok}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": UA,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await resp.text();
  const data = text ? JSON.parse(text) : {};
  if (!resp.ok) {
    const err: any = new Error(`GitHub ${method} ${path} -> ${resp.status}: ${data?.message || resp.statusText}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

// --- Operations -------------------------------------------------------------
async function defaultBranch(cfg: GhConfig): Promise<string> {
  const repo = await gh(cfg, "GET", `/repos/${cfg.repo}`);
  return repo.default_branch as string;
}

interface OpenPrInput {
  branch: string;
  title: string;
  body?: string;
  base?: string;
  files: FileChange[];
  commitMessage: string;
}

async function openPr(cfg: GhConfig, input: OpenPrInput) {
  const base = input.base || (await defaultBranch(cfg));
  const baseRef = await gh(cfg, "GET", `/repos/${cfg.repo}/git/ref/heads/${encodeURIComponent(base)}`);
  const baseSha = baseRef.object.sha as string;
  const baseCommit = await gh(cfg, "GET", `/repos/${cfg.repo}/git/commits/${baseSha}`);
  const baseTree = baseCommit.tree.sha as string;

  const tree: Array<{ path: string; mode: string; type: string; sha: string }> = [];
  for (const f of input.files) {
    const blob = await gh(cfg, "POST", `/repos/${cfg.repo}/git/blobs`, {
      content: f.content,
      encoding: "utf-8",
    });
    tree.push({ path: f.path.replace(/^\/+/, ""), mode: "100644", type: "blob", sha: blob.sha });
  }
  const newTree = await gh(cfg, "POST", `/repos/${cfg.repo}/git/trees`, { base_tree: baseTree, tree });
  const commit = await gh(cfg, "POST", `/repos/${cfg.repo}/git/commits`, {
    message: input.commitMessage,
    tree: newTree.sha,
    parents: [baseSha],
  });

  const refPath = `heads/${input.branch}`;
  try {
    await gh(cfg, "POST", `/repos/${cfg.repo}/git/refs`, { ref: `refs/${refPath}`, sha: commit.sha });
  } catch (e: any) {
    if (e?.status === 422) {
      await gh(cfg, "PATCH", `/repos/${cfg.repo}/git/refs/${refPath}`, { sha: commit.sha, force: true });
    } else {
      throw e;
    }
  }

  let pr: any;
  try {
    pr = await gh(cfg, "POST", `/repos/${cfg.repo}/pulls`, {
      title: input.title,
      head: input.branch,
      base,
      body: input.body || "",
    });
  } catch (e: any) {
    if (e?.status === 422) {
      const existing = await gh(
        cfg,
        "GET",
        `/repos/${cfg.repo}/pulls?head=${cfg.owner}:${encodeURIComponent(input.branch)}&state=open`,
      );
      if (Array.isArray(existing) && existing.length) pr = existing[0];
      else throw e;
    } else {
      throw e;
    }
  }

  return {
    number: pr.number,
    htmlUrl: pr.html_url,
    branch: input.branch,
    base,
    headSha: commit.sha,
    title: pr.title,
    state: pr.state,
  };
}

async function prStatus(cfg: GhConfig, number: number) {
  const pr = await gh(cfg, "GET", `/repos/${cfg.repo}/pulls/${number}`);
  const headSha = pr.head.sha as string;
  const checks = await gh(cfg, "GET", `/repos/${cfg.repo}/commits/${headSha}/check-runs`);
  return {
    number,
    state: pr.state,
    merged: Boolean(pr.merged),
    mergeable: pr.mergeable,
    mergeableState: pr.mergeable_state,
    htmlUrl: pr.html_url,
    headSha,
    checks: (checks.check_runs || []).map((c: any) => ({
      name: c.name,
      status: c.status,
      conclusion: c.conclusion,
    })),
  };
}

async function mergePr(cfg: GhConfig, number: number, method = "squash") {
  return gh(cfg, "PUT", `/repos/${cfg.repo}/pulls/${number}/merge`, { merge_method: method });
}

// --- request body + plugin --------------------------------------------------
function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c: Buffer) => {
      raw += c;
      if (raw.length > 5_000_000) reject(new Error("Request body too large"));
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

export function githubProxy(env: EnvMap): Plugin {
  const cfg = readConfig(env);
  return {
    name: "agentic-devops-github-proxy",
    configureServer(server) {
      server.middlewares.use("/api/github/health", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            configured: Boolean(cfg && hasAuth(cfg)),
            repo: cfg?.repo ?? "",
            mode: cfg ? authMode(cfg) : "none",
          }),
        );
      });

      const handle =
        (fn: (body: any, url: URL) => Promise<any>) => async (req: any, res: any) => {
          res.setHeader("Content-Type", "application/json");
          if (!cfg || !hasAuth(cfg)) {
            res.statusCode = 503;
            res.end(
              JSON.stringify({
                error:
                  "GitHub live mode is not configured. Set GITHUB_REPO + GITHUB_PAT (or GitHub App vars) in .env.",
              }),
            );
            return;
          }
          try {
            const url = new URL(req.url, "http://localhost");
            const raw = req.method === "POST" ? await readBody(req) : "";
            const body = raw ? JSON.parse(raw) : {};
            res.end(JSON.stringify(await fn(body, url)));
          } catch (err: any) {
            const status = typeof err?.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
            res.statusCode = status;
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
        };

      // GET ?number= must be registered before /api/github/pr is fine (segment
      // boundaries differ), but we register status/merge explicitly anyway.
      server.middlewares.use(
        "/api/github/pr-status",
        handle(async (_body, url) => {
          const n = Number(url.searchParams.get("number"));
          if (!Number.isFinite(n) || n <= 0) {
            const e: any = new Error("Missing or invalid ?number=");
            e.status = 400;
            throw e;
          }
          return prStatus(cfg as GhConfig, n);
        }),
      );

      server.middlewares.use(
        "/api/github/merge",
        handle(async (body) => {
          const n = Number(body.number);
          if (!Number.isFinite(n) || n <= 0) {
            const e: any = new Error("Missing or invalid 'number'.");
            e.status = 400;
            throw e;
          }
          const method = ["merge", "squash", "rebase"].includes(body.method) ? body.method : "squash";
          return mergePr(cfg as GhConfig, n, method);
        }),
      );

      server.middlewares.use(
        "/api/github/pr",
        handle(async (body) => {
          if (!body.branch || !body.title || !Array.isArray(body.files) || body.files.length === 0) {
            const e: any = new Error("Missing 'branch', 'title', or non-empty 'files'.");
            e.status = 400;
            throw e;
          }
          if (body.files.length > 100) {
            const e: any = new Error("Too many files (max 100).");
            e.status = 400;
            throw e;
          }
          const files: FileChange[] = body.files.map((f: any) => ({
            path: String(f.path),
            content: String(f.content ?? ""),
          }));
          return openPr(cfg as GhConfig, {
            branch: String(body.branch),
            title: String(body.title),
            body: body.body ? String(body.body) : "",
            base: body.base ? String(body.base) : undefined,
            files,
            commitMessage: String(body.commitMessage || body.title),
          });
        }),
      );
    },
  };
}
