# Security Policy

## Reporting a vulnerability

**Please do not open public issues for security vulnerabilities.**

Report privately through GitHub's **Security Advisories**:

1. Go to the **Security** tab of this repository.
2. Click **Report a vulnerability** (Private vulnerability reporting).
3. Provide a description, reproduction steps, and impact.

You can also reach the maintainer privately if advisories are unavailable.

We aim to acknowledge reports within a few business days and will keep you
updated on remediation progress.

## Supported versions

This is a demonstration application. Security fixes are applied to the `main`
branch only.

## Handling of secrets

- No secrets are committed to the repository. Local configuration lives in
  `.env`, which is git-ignored (only `.env.example` with placeholders is
  tracked).
- The live-mode model proxy runs **server-side** in the Vite dev server; API
  keys never reach the browser bundle.
- GitHub **secret scanning** and **push protection** are enabled, and a
  `gitleaks` job runs in CI as defense-in-depth.

## Automated security controls

This repository follows GitHub and Microsoft security best practices:

- **CodeQL** code scanning for application code and GitHub Actions workflows.
- **Dependabot** alerts and version updates (npm + Actions).
- **Dependency review** on every pull request (fails on high-severity vulns).
- **OpenSSF Scorecard** supply-chain analysis.
- **Least-privilege** `GITHUB_TOKEN` permissions in every workflow.
- **OIDC** (federated identity) for Azure deployments — no long-lived cloud
  credentials are stored.
- A **human-in-the-loop** approval gate for large or destructive pull requests.
