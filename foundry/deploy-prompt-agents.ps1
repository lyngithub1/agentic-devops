<#
.SYNOPSIS
  Deploys the Agentic DevOps prompt agents to a next-gen Microsoft Foundry project.

.DESCRIPTION
  Reads agents.manifest.json and creates/updates each agent via the next-gen
  Microsoft Foundry Agent Service REST API (Foundry projects "new" API):

      POST {ProjectEndpoint}/agents?api-version=v1
      body: { "name": "<agent>", "definition": { "kind": "prompt", "model": "...", "instructions": "..." } }

  Each successful call creates a new immutable agent version. Re-running the
  script adds a new version of each agent (it does not duplicate them).

  This is a VIEW-ONLY demo export. Foundry prompt agents run independently and
  do NOT perform the Agentic DevOps app's multi-agent orchestration. Deploying
  these agents does not affect the app in any way.

.PREREQUISITES
  - Azure CLI signed in:        az login
  - A Foundry project with the two model deployments referenced in the manifest
    (gpt-4.1 and gpt-5.4). Override names with -ModelMap if your deployments differ.
  - "Foundry User" role on the project (agents/*/read, agents/*/action).

.PARAMETER ProjectEndpoint
  Foundry project endpoint, e.g.
  https://<resource>.services.ai.azure.com/api/projects/<project>
  Defaults to the PROJECT_ENDPOINT environment variable.

.PARAMETER ApiVersion
  Foundry agents API version. Default: v1

.PARAMETER ModelMap
  Optional hashtable remapping manifest model names to your deployment names,
  e.g. @{ "gpt-4.1" = "gpt-4.1"; "gpt-5.4" = "gpt-5" }

.PARAMETER WhatIf
  Print what would be deployed without calling Foundry.

.EXAMPLE
  $env:PROJECT_ENDPOINT = "https://myres.services.ai.azure.com/api/projects/agentic-devops"
  ./deploy-prompt-agents.ps1

.EXAMPLE
  ./deploy-prompt-agents.ps1 -ProjectEndpoint $env:PROJECT_ENDPOINT -ModelMap @{ "gpt-5.4" = "gpt-5" }
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$ProjectEndpoint = $env:PROJECT_ENDPOINT,
  [string]$ApiVersion = "v1",
  [hashtable]$ModelMap = @{},
  [string]$ManifestPath = (Join-Path $PSScriptRoot "agents.manifest.json")
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ProjectEndpoint)) {
  throw "ProjectEndpoint is required. Set the PROJECT_ENDPOINT environment variable or pass -ProjectEndpoint. Format: https://<resource>.services.ai.azure.com/api/projects/<project>"
}
$ProjectEndpoint = $ProjectEndpoint.TrimEnd("/")

if (-not (Test-Path $ManifestPath)) {
  throw "Manifest not found at: $ManifestPath"
}

Write-Host "Acquiring Foundry access token (scope https://ai.azure.com/.default)..." -ForegroundColor Cyan
$token = (az account get-access-token --scope "https://ai.azure.com/.default" --query accessToken -o tsv)
if ([string]::IsNullOrWhiteSpace($token)) {
  throw "Could not acquire an access token. Run 'az login' first."
}

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type"  = "application/json"
}

$manifest = Get-Content -Raw -Path $ManifestPath | ConvertFrom-Json
$agents = $manifest.agents
Write-Host "Loaded $($agents.Count) agent definitions from manifest." -ForegroundColor Cyan
Write-Host "Target project: $ProjectEndpoint (api-version=$ApiVersion)" -ForegroundColor Cyan
Write-Host ""

$ok = 0
$fail = 0

foreach ($agent in $agents) {
  $name = $agent.name
  $definition = $agent.definition

  # Apply optional model remapping.
  if ($ModelMap.ContainsKey($definition.model)) {
    $definition.model = $ModelMap[$definition.model]
  }

  $body = @{ name = $name; definition = $definition } | ConvertTo-Json -Depth 12
  $uri = "$ProjectEndpoint/agents?api-version=$ApiVersion"

  if ($PSCmdlet.ShouldProcess($name, "Create/update prompt agent ($($definition.model))")) {
    try {
      $resp = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
      $ver = if ($resp.version) { " v$($resp.version)" } else { "" }
      Write-Host ("  [ok]  {0,-32} -> {1}{2}" -f $name, $definition.model, $ver) -ForegroundColor Green
      $ok++
    }
    catch {
      $msg = $_.Exception.Message
      if ($_.ErrorDetails.Message) { $msg = $_.ErrorDetails.Message }
      Write-Host ("  [err] {0,-32} -> {1}" -f $name, $msg) -ForegroundColor Red
      $fail++
    }
  }
}

Write-Host ""
Write-Host "Done. Created/updated: $ok, Failed: $fail" -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 }
