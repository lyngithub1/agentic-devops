#!/usr/bin/env bash
# One-time GitHub setup for Agentic DevOps (bash port of setup-github.ps1).
# Creates the repo, enables Advanced Security, creates the human-in-the-loop
# environment, and applies branch + push rulesets. Idempotent.
#
# Prereqs: gh (authenticated), git. Run from the repository root.
# Usage: ./scripts/setup-github.sh [owner] [repo] [public|private]
set -euo pipefail

OWNER="${1:-$(gh api user --jq .login)}"
REPO="${2:-agentic-devops}"
VISIBILITY="${3:-public}"
SLUG="$OWNER/$REPO"
OWNER_ID="$(gh api user --jq .id)"
echo "Target repository: $SLUG ($VISIBILITY)"

echo "[1/8] Pre-flight secret audit..."
if [ -f .env ] && git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "SECURITY: .env is tracked by git. Run: git rm --cached .env" >&2; exit 1
fi

echo "[2/8] Repository + initial push..."
if [ ! -d .git ]; then
  git init -b main >/dev/null
  git add -A
  git commit -m "chore: initial commit — Agentic DevOps + CI/CD, security & PR HITL" >/dev/null
fi
if gh repo view "$SLUG" >/dev/null 2>&1; then
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$SLUG.git"
  git push -u origin main
else
  gh repo create "$SLUG" "--$VISIBILITY" --source=. --remote=origin --push
fi

echo "[3/8] Enabling Advanced Security features..."
printf '%s' '{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}' \
  | gh api --method PATCH "repos/$SLUG" --input - >/dev/null
gh api --method PUT "repos/$SLUG/vulnerability-alerts" >/dev/null
gh api --method PUT "repos/$SLUG/automated-security-fixes" >/dev/null
gh api --method PUT "repos/$SLUG/private-vulnerability-reporting" >/dev/null

echo "[4/8] Creating labels..."
gh label create needs-human-review --color B60205 --description 'Requires human approval before merge' --force >/dev/null
gh label create large-pr           --color D93F0B --description 'Exceeds the size threshold'           --force >/dev/null
gh label create destructive-change --color E99695 --description 'Deletes files or touches sensitive paths' --force >/dev/null
gh label create dependencies       --color 0366D6 --description 'Dependency updates'                   --force >/dev/null
gh label create github-actions     --color 000000 --description 'GitHub Actions updates'               --force >/dev/null

echo "[5/8] Creating environments (human-in-the-loop)..."
REVIEWER_BODY=$(printf '{"wait_timer":0,"prevent_self_review":false,"reviewers":[{"type":"User","id":%s}],"deployment_branch_policy":null}' "$OWNER_ID")
printf '%s' "$REVIEWER_BODY" | gh api --method PUT "repos/$SLUG/environments/human-review" --input - >/dev/null
printf '%s' "$REVIEWER_BODY" | gh api --method PUT "repos/$SLUG/environments/production"   --input - >/dev/null
gh api --method PUT "repos/$SLUG/environments/preview" >/dev/null

echo "[6/8] Applying branch ruleset on main..."
BRANCH_RULESET=$(cat <<'JSON'
{
  "name": "main-protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "build-test" },
          { "context": "secret-scan" },
          { "context": "analyze-pr" },
          { "context": "human-approval" },
          { "context": "dependency-review" } ] } }
  ],
  "bypass_actors": [ { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" } ]
}
JSON
)
EXISTING=$(gh api "repos/$SLUG/rulesets" --jq '.[] | select(.name=="main-protection") | .id' 2>/dev/null || true)
if [ -n "$EXISTING" ]; then
  printf '%s' "$BRANCH_RULESET" | gh api --method PUT "repos/$SLUG/rulesets/$EXISTING" --input - >/dev/null
else
  printf '%s' "$BRANCH_RULESET" | gh api --method POST "repos/$SLUG/rulesets" --input - >/dev/null
fi

echo "[7/8] Applying push ruleset (org-owned repos only; expected to skip on personal repos)..."
PUSH_RULESET=$(cat <<'JSON'
{
  "name": "block-secrets-and-large-files",
  "target": "push",
  "enforcement": "active",
  "rules": [
    { "type": "file_path_restriction", "parameters": {
        "restricted_file_paths": [ "**/.env", "**/.env.*", "**/*.pem", "**/*.pfx", "**/id_rsa", "**/*.p12" ] } },
    { "type": "max_file_size", "parameters": { "max_file_size": 5 } }
  ]
}
JSON
)
EXISTING_PUSH=$(gh api "repos/$SLUG/rulesets" --jq '.[] | select(.name=="block-secrets-and-large-files") | .id' 2>/dev/null || true)
if [ -n "$EXISTING_PUSH" ]; then
  printf '%s' "$PUSH_RULESET" | gh api --method PUT "repos/$SLUG/rulesets/$EXISTING_PUSH" --input - >/dev/null || echo "  (push ruleset skipped)"
else
  printf '%s' "$PUSH_RULESET" | gh api --method POST "repos/$SLUG/rulesets" --input - >/dev/null || echo "  (push ruleset skipped)"
fi

echo "[8/8] Done. Open a test PR to verify the gates."
