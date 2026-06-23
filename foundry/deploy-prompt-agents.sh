#!/usr/bin/env bash
#
# Deploys the Agentic DevOps prompt agents to a next-gen Microsoft Foundry project.
#
# Reads agents.manifest.json and creates/updates each agent via the next-gen
# Microsoft Foundry Agent Service REST API (Foundry projects "new" API):
#
#     POST {PROJECT_ENDPOINT}/agents?api-version=v1
#     body: { "name": "<agent>", "definition": { "kind": "prompt", "model": "...", "instructions": "..." } }
#
# Each successful call creates a new immutable agent version. Re-running adds a
# new version of each agent (it does not duplicate them).
#
# This is a VIEW-ONLY demo export. Foundry prompt agents run independently and do
# NOT perform the Agentic DevOps app's multi-agent orchestration. Deploying these
# agents does not affect the app.
#
# Prerequisites:
#   - az login
#   - jq installed
#   - A Foundry project with the model deployments referenced in the manifest
#     (gpt-4.1 and gpt-5.4), and the "Foundry User" role on the project.
#
# Usage:
#   export PROJECT_ENDPOINT="https://<resource>.services.ai.azure.com/api/projects/<project>"
#   ./deploy-prompt-agents.sh
#
set -euo pipefail

API_VERSION="${API_VERSION:-v1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="${MANIFEST:-$SCRIPT_DIR/agents.manifest.json}"

if [[ -z "${PROJECT_ENDPOINT:-}" ]]; then
  echo "ERROR: PROJECT_ENDPOINT is required." >&2
  echo "Format: https://<resource>.services.ai.azure.com/api/projects/<project>" >&2
  exit 1
fi
PROJECT_ENDPOINT="${PROJECT_ENDPOINT%/}"

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required (https://jqlang.github.io/jq/)." >&2
  exit 1
fi

echo "Acquiring Foundry access token (scope https://ai.azure.com/.default)..."
TOKEN="$(az account get-access-token --scope 'https://ai.azure.com/.default' --query accessToken -o tsv)"
if [[ -z "$TOKEN" ]]; then
  echo "ERROR: could not acquire token. Run 'az login' first." >&2
  exit 1
fi

COUNT="$(jq '.agents | length' "$MANIFEST")"
echo "Loaded $COUNT agent definitions from manifest."
echo "Target project: $PROJECT_ENDPOINT (api-version=$API_VERSION)"
echo

OK=0
FAIL=0
URI="$PROJECT_ENDPOINT/agents?api-version=$API_VERSION"

# Iterate agents; each line is a compact { name, definition } object.
while IFS= read -r payload; do
  NAME="$(echo "$payload" | jq -r '.name')"
  MODEL="$(echo "$payload" | jq -r '.definition.model')"
  HTTP_CODE="$(curl -sS -o /tmp/ad_agent_resp.json -w '%{http_code}' \
    -X POST "$URI" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload")" || HTTP_CODE="000"

  if [[ "$HTTP_CODE" =~ ^2 ]]; then
    VER="$(jq -r '.version // empty' /tmp/ad_agent_resp.json)"
    printf '  [ok]  %-32s -> %s%s\n' "$NAME" "$MODEL" "${VER:+ v$VER}"
    OK=$((OK+1))
  else
    ERR="$(jq -r '.error.message // .message // empty' /tmp/ad_agent_resp.json 2>/dev/null || true)"
    printf '  [err] %-32s -> HTTP %s %s\n' "$NAME" "$HTTP_CODE" "$ERR"
    FAIL=$((FAIL+1))
  fi
done < <(jq -c '.agents[] | {name, definition}' "$MANIFEST")

echo
echo "Done. Created/updated: $OK, Failed: $FAIL"
[[ "$FAIL" -eq 0 ]]
