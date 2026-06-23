<#
.SYNOPSIS
  One-time GitHub setup for Agentic DevOps: creates the repo, enables GitHub
  Advanced Security features, creates the human-in-the-loop environment, and
  applies branch + push rulesets. Idempotent - safe to re-run.

.DESCRIPTION
  This script performs the REMOTE / hard-to-reverse actions that were
  intentionally kept out of the agent's local changes:
    * git init + create PUBLIC repo on your personal account + push
    * enable secret scanning, push protection, Dependabot alerts/fixes,
      private vulnerability reporting
    * create labels used by the PR Guard workflow
    * create the 'human-review', 'production' and 'preview' environments
      (human-review requires your approval - the human-in-the-loop gate)
    * apply a branch ruleset on main (required checks, no force-push, linear
      history, PR required, conversation resolution)
    * apply a push ruleset (block committing secret-like files)

  Public visibility is used so that environment required-reviewers, rulesets,
  CodeQL, secret scanning and Dependabot are all available for free on a
  personal account.

.PREREQUISITES
  - GitHub CLI (gh) authenticated to your personal account:  gh auth login
  - git
  - Run from the repository root.

.EXAMPLE
  ./scripts/setup-github.ps1
  ./scripts/setup-github.ps1 -Owner lyngithub1 -Repo agentic-devops -Force
#>
[CmdletBinding()]
param(
  [string]$Owner = '',
  [string]$Repo = 'agentic-devops',
  [ValidateSet('public', 'private')][string]$Visibility = 'public',
  [switch]$Force
)

# 'Continue' (not 'Stop'): under Windows PowerShell 5.1, native commands
# (git/gh) that write progress to stderr can raise spurious terminating errors
# when ErrorActionPreference is 'Stop'. Critical steps check $LASTEXITCODE.
$ErrorActionPreference = 'Continue'
$PSNativeCommandUseErrorActionPreference = $false

function Confirm-Step([string]$Message) {
  if ($Force) { return $true }
  $ans = Read-Host "$Message [y/N]"
  return $ans -match '^(y|yes)$'
}

# --- Preconditions ----------------------------------------------------------
gh --version | Out-Null
if (-not $Owner) { $Owner = (gh api user --jq '.login').Trim() }
$ownerId = (gh api user --jq '.id').Trim()
$slug = "$Owner/$Repo"
Write-Host "Target repository: $slug ($Visibility)" -ForegroundColor Cyan

# --- Pre-flight secret audit ------------------------------------------------
Write-Host "`n[1/8] Pre-flight secret audit..." -ForegroundColor Yellow
if (Test-Path '.env') {
  $tracked = (git ls-files --error-unmatch .env) 2>$null
  if ($LASTEXITCODE -eq 0) { throw "SECURITY: .env is tracked by git. Remove it before going public: git rm --cached .env" }
  Write-Host "  .env present but not tracked. Good." -ForegroundColor Green
}
if (Test-Path '.env.example') {
  # Flag uncommented lines that look like they hold a real key value.
  $exampleHits = Select-String -Path '.env.example' -Pattern '^[^#]*(sk-[A-Za-z0-9]|_API_KEY=\S)'
  if ($exampleHits) { Write-Warning "  .env.example may contain a real value - please review before publishing." }
}

# --- git init + create/push -------------------------------------------------
Write-Host "`n[2/8] Repository + initial push..." -ForegroundColor Yellow
if (-not (Test-Path '.git')) { git init -b main *> $null }
# Ensure at least one commit exists (robust to a pre-initialized repo).
git rev-parse --verify HEAD *> $null
if ($LASTEXITCODE -ne 0) {
  git add -A
  # Safety: never commit real local secrets. Allow the .env.example template.
  $stagedEnv = git diff --cached --name-only 2>$null |
    Where-Object { $_ -match '(^|/)\.env(\.|$)' -and $_ -notmatch '(^|/)\.env\.example$' }
  if ($stagedEnv) { throw "SECURITY: secret-like files are staged: $stagedEnv. Aborting." }
  git commit -m "chore: initial commit - Agentic DevOps + CI/CD, security & PR HITL" *> $null
  if ($LASTEXITCODE -ne 0) { throw "git commit failed (exit $LASTEXITCODE)." }
}
$repoExists = $true
gh repo view $slug *> $null; if ($LASTEXITCODE -ne 0) { $repoExists = $false }
if (-not $repoExists) {
  if (Confirm-Step "Create $Visibility repo $slug and push?") {
    $out = gh repo create $slug "--$Visibility" --source=. --remote=origin --push 2>&1
    if ($LASTEXITCODE -ne 0) { throw "gh repo create failed: $out" }
  }
  else { Write-Host "  Skipped repo creation."; return }
}
else {
  Write-Host "  Repo exists. Ensuring 'origin' + pushing main..."
  if (-not (git remote 2>$null | Select-String -Quiet '^origin$')) {
    git remote add origin "https://github.com/$slug.git"
  }
  $out = git push -u origin main 2>&1
  if ($LASTEXITCODE -ne 0) { throw "git push failed: $out" }
}

# --- Advanced Security ------------------------------------------------------
Write-Host "`n[3/8] Enabling GitHub Advanced Security features..." -ForegroundColor Yellow
$sec = '{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}'
$sec | gh api --method PATCH "repos/$slug" --input - *> $null
gh api --method PUT "repos/$slug/vulnerability-alerts" *> $null            # Dependabot alerts
gh api --method PUT "repos/$slug/automated-security-fixes" *> $null         # Dependabot security updates
gh api --method PUT "repos/$slug/private-vulnerability-reporting" *> $null  # private reporting
Write-Host "  Secret scanning, push protection, Dependabot alerts/fixes, private reporting." -ForegroundColor Green

# --- Labels (used by PR Guard) ---------------------------------------------
Write-Host "`n[4/8] Creating labels..." -ForegroundColor Yellow
gh label create 'needs-human-review' --color 'B60205' --description 'Requires human approval before merge' --force | Out-Null
gh label create 'large-pr'           --color 'D93F0B' --description 'Exceeds the size threshold'           --force | Out-Null
gh label create 'destructive-change' --color 'E99695' --description 'Deletes files or touches sensitive paths' --force | Out-Null
gh label create 'dependencies'       --color '0366D6' --description 'Dependency updates'                   --force | Out-Null
gh label create 'github-actions'     --color '000000' --description 'GitHub Actions updates'               --force | Out-Null

# --- Environments (human-in-the-loop gate) ----------------------------------
Write-Host "`n[5/8] Creating environments..." -ForegroundColor Yellow
$reviewerBody = @"
{ "wait_timer": 0, "prevent_self_review": false,
  "reviewers": [ { "type": "User", "id": $ownerId } ],
  "deployment_branch_policy": null }
"@
$reviewerBody | gh api --method PUT "repos/$slug/environments/human-review" --input - *> $null
$reviewerBody | gh api --method PUT "repos/$slug/environments/production"   --input - *> $null
gh api --method PUT "repos/$slug/environments/preview" *> $null
Write-Host "  human-review + production require your approval; preview is open." -ForegroundColor Green

# --- Branch ruleset on main -------------------------------------------------
Write-Host "`n[6/8] Applying branch ruleset on main..." -ForegroundColor Yellow
$branchRuleset = @"
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
"@
# Replace if a ruleset with this name already exists (idempotent).
$existing = (gh api "repos/$slug/rulesets" --jq '.[] | select(.name=="main-protection") | .id') 2>$null
if ($existing) { $branchRuleset | gh api --method PUT "repos/$slug/rulesets/$existing" --input - *> $null }
else { $branchRuleset | gh api --method POST "repos/$slug/rulesets" --input - *> $null }
Write-Host "  Required checks: build-test, secret-scan, analyze-pr, human-approval, dependency-review." -ForegroundColor Green
Write-Host "  NOTE: solo accounts can't approve their own PR review, so required reviews = 0 and the" -ForegroundColor DarkGray
Write-Host "        human-review ENVIRONMENT approval is the gate of record. Add CodeQL contexts via UI." -ForegroundColor DarkGray

# --- Push ruleset (block secret-like files) ---------------------------------
# NOTE: GitHub only permits PUSH rulesets on ORG-owned repos. On a personal
# public repo this 422s, which is expected. Native push protection (enabled in
# step 3), .gitignore, and the CI gitleaks job already cover secret blocking.
Write-Host "`n[7/8] Applying push ruleset..." -ForegroundColor Yellow
$pushRuleset = @"
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
"@
$existingPush = (gh api "repos/$slug/rulesets" --jq '.[] | select(.name=="block-secrets-and-large-files") | .id') 2>$null
if ($existingPush) {
  $pushRuleset | gh api --method PUT "repos/$slug/rulesets/$existingPush" --input - *> $null
  Write-Host "  Push ruleset applied." -ForegroundColor Green
}
else {
  $pushOut = $pushRuleset | gh api --method POST "repos/$slug/rulesets" --input - 2>&1
  if ($LASTEXITCODE -ne 0) {
    if ("$pushOut" -match 'org-owned|public repos cannot') {
      Write-Host "  Push ruleset skipped: GitHub only allows push rulesets on org-owned repos." -ForegroundColor DarkYellow
      Write-Host "  (Push protection + .gitignore + CI gitleaks already block committed secrets.)" -ForegroundColor DarkGray
    }
    else { Write-Warning "  Push ruleset could not be applied: $pushOut" }
  }
  else { Write-Host "  Push ruleset applied." -ForegroundColor Green }
}

# --- Done -------------------------------------------------------------------
Write-Host "`n[8/8] Done." -ForegroundColor Green
Write-Host @"

Next steps:
  * Open a small test PR  -> CI + CodeQL run, no gate, mergeable.
  * Open a >300-line or destructive PR -> 'human-approval' pauses on the
    'human-review' environment; approve it under the PR Guard workflow run.
  * (Optional) Enable deployment: run scripts/setup-azure.ps1, then set the
    repo variable DEPLOY_ENABLED=true.
  * Add CodeQL checks to required status checks in the UI once they've run once
    (Settings -> Rules -> main-protection).
"@ -ForegroundColor Cyan
