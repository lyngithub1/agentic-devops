<#
.SYNOPSIS
  Provisions Azure Static Web Apps + GitHub OIDC for the deploy workflow.
  Idempotent where practical.

.DESCRIPTION
  Creates (or reuses):
    * a resource group + Static Web App (infra/main.bicep)
    * a Microsoft Entra app registration used as the GitHub OIDC identity,
      with federated credentials for the 'production'/'preview' environments
      and pull_request, so NO long-lived cloud secret is ever stored
    * a least-privilege Contributor role assignment scoped to the SWA
    * GitHub repo secrets (AZURE_CLIENT_ID/TENANT_ID/SUBSCRIPTION_ID) and
      variables (AZURE_SWA_NAME/AZURE_RESOURCE_GROUP)

  After running, flip the deploy switch:  gh variable set DEPLOY_ENABLED -b true

.PREREQUISITES
  - Azure CLI (az) logged in to the target subscription:  az login
  - GitHub CLI (gh) logged in:  gh auth login
  - Run from the repository root.

.EXAMPLE
  ./scripts/setup-azure.ps1 -ResourceGroup rg-agentic-devops -Location eastus2
#>
[CmdletBinding()]
param(
  [string]$Owner = '',
  [string]$Repo = 'agentic-devops',
  [string]$ResourceGroup = 'rg-agentic-devops',
  [ValidateSet('centralus', 'eastus2', 'westus2', 'eastasia', 'westeurope')][string]$Location = 'eastus2',
  [string]$SwaName = 'agentic-devops-web',
  [string]$AppName = 'gh-oidc-agentic-devops'
)

$ErrorActionPreference = 'Stop'
az version | Out-Null
gh --version | Out-Null
if (-not $Owner) { $Owner = (gh api user --jq '.login').Trim() }
$slug = "$Owner/$Repo"

$subId = (az account show --query id -o tsv)
$tenantId = (az account show --query tenantId -o tsv)
Write-Host "Subscription: $subId  Tenant: $tenantId" -ForegroundColor Cyan

# --- Resource group + Static Web App ---------------------------------------
Write-Host "`n[1/5] Provisioning resource group + Static Web App..." -ForegroundColor Yellow
az group create -n $ResourceGroup -l $Location -o none
az deployment group create -g $ResourceGroup `
  --template-file infra/main.bicep `
  --parameters infra/main.parameters.json name=$SwaName location=$Location -o none
$swaId = (az staticwebapp show -n $SwaName -g $ResourceGroup --query id -o tsv)
Write-Host "  SWA: $swaId" -ForegroundColor Green

# --- Entra app (OIDC identity) ---------------------------------------------
Write-Host "`n[2/5] Configuring Microsoft Entra OIDC app..." -ForegroundColor Yellow
$appId = (az ad app list --display-name $AppName --query '[0].appId' -o tsv)
if (-not $appId) { $appId = (az ad app create --display-name $AppName --query appId -o tsv) }
az ad sp show --id $appId *> $null; if ($LASTEXITCODE -ne 0) { az ad sp create --id $appId -o none }
Write-Host "  App (client) id: $appId" -ForegroundColor Green

# --- Federated credentials (one per OIDC subject) ---------------------------
Write-Host "`n[3/5] Adding federated credentials..." -ForegroundColor Yellow
$subjects = @{
  'gh-env-production' = "repo:${slug}:environment:production"
  'gh-env-preview'    = "repo:${slug}:environment:preview"
  'gh-pull-request'   = "repo:${slug}:pull_request"
  'gh-branch-main'    = "repo:${slug}:ref:refs/heads/main"
}
$existingFc = (az ad app federated-credential list --id $appId --query '[].name' -o tsv) 2>$null
foreach ($name in $subjects.Keys) {
  if ($existingFc -split "`n" | Where-Object { $_ -eq $name }) { continue }
  $p = @{ name = $name; issuer = 'https://token.actions.githubusercontent.com'; subject = $subjects[$name]; audiences = @('api://AzureADTokenExchange') } | ConvertTo-Json -Compress
  $p | az ad app federated-credential create --id $appId --parameters '@-' -o none
  Write-Host "  + $name -> $($subjects[$name])"
}

# --- Least-privilege RBAC (scoped to the SWA) -------------------------------
Write-Host "`n[4/5] Assigning Contributor on the Static Web App..." -ForegroundColor Yellow
az role assignment create --assignee $appId --role Contributor --scope $swaId -o none 2>$null
Write-Host "  Role assignment ensured." -ForegroundColor Green

# --- GitHub secrets + variables --------------------------------------------
Write-Host "`n[5/5] Setting GitHub secrets + variables..." -ForegroundColor Yellow
gh secret set AZURE_CLIENT_ID       -b $appId    -R $slug | Out-Null
gh secret set AZURE_TENANT_ID       -b $tenantId -R $slug | Out-Null
gh secret set AZURE_SUBSCRIPTION_ID -b $subId    -R $slug | Out-Null
gh variable set AZURE_SWA_NAME       -b $SwaName       -R $slug | Out-Null
gh variable set AZURE_RESOURCE_GROUP -b $ResourceGroup -R $slug | Out-Null
Write-Host "  Done." -ForegroundColor Green

Write-Host @"

Azure + OIDC ready. To turn deployments on:
  gh variable set DEPLOY_ENABLED -b true -R $slug

Then: push to main deploys to production; PRs get preview environments.
Note: live (LLM) mode needs a server-side proxy in production — see the plan
(SWA managed Functions + managed identity). Simulation mode works fully static.
"@ -ForegroundColor Cyan
