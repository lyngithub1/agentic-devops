// Browser-side client for the dev GitHub proxy (see vite.github-proxy.ts).
// The proxy keeps the GitHub credential server-side; the browser only ever
// speaks to /api/github and never sees a token.

export interface GitHubHealth {
  configured: boolean;
  repo: string;
  mode: "pat" | "app" | "none";
}

export interface LivePrFile {
  path: string;
  content: string;
}

export interface OpenPrRequest {
  branch: string;
  title: string;
  body?: string;
  base?: string;
  commitMessage?: string;
  files: LivePrFile[];
  signal?: AbortSignal;
}

export interface LivePr {
  number: number;
  htmlUrl: string;
  branch: string;
  base: string;
  headSha: string;
  title: string;
  state: string;
}

export type LiveCheckStatus = "queued" | "in_progress" | "completed";
export type LiveCheckConclusion =
  | "success"
  | "failure"
  | "neutral"
  | "cancelled"
  | "skipped"
  | "timed_out"
  | "action_required"
  | null;

export interface LivePrCheck {
  name: string;
  status: LiveCheckStatus;
  conclusion: LiveCheckConclusion;
}

export interface LivePrStatus {
  number: number;
  state: string;
  merged: boolean;
  mergeable: boolean | null;
  mergeableState: string;
  htmlUrl: string;
  headSha: string;
  checks: LivePrCheck[];
}

interface ErrorBody {
  error?: string;
}

/** Report whether GitHub live mode is configured (gates the feature in the UI). */
export async function githubHealth(): Promise<GitHubHealth> {
  try {
    const resp = await fetch("/api/github/health");
    if (!resp.ok) return { configured: false, repo: "", mode: "none" };
    return (await resp.json()) as GitHubHealth;
  } catch {
    return { configured: false, repo: "", mode: "none" };
  }
}

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = (await resp.json().catch(() => ({}))) as ErrorBody;
  if (!resp.ok) throw new Error(data.error || `Request failed (${resp.status}).`);
  return data as T;
}

/** Create a branch, commit the given files, and open (or reuse) a real PR. */
export function openPr(req: OpenPrRequest): Promise<LivePr> {
  const { signal, ...body } = req;
  return postJson<LivePr>("/api/github/pr", body, signal);
}

/** Fetch the live state + check runs for a PR. */
export async function prStatus(prNumber: number, signal?: AbortSignal): Promise<LivePrStatus> {
  const resp = await fetch(`/api/github/pr-status?number=${prNumber}`, { signal });
  const data = (await resp.json().catch(() => ({}))) as LivePrStatus & ErrorBody;
  if (!resp.ok) throw new Error(data.error || `Status request failed (${resp.status}).`);
  return data;
}

/** Merge a PR (defaults to squash). */
export function mergePr(
  prNumber: number,
  method: "merge" | "squash" | "rebase" = "squash",
): Promise<unknown> {
  return postJson("/api/github/merge", { number: prNumber, method });
}
