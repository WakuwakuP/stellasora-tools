---
description: Weekly automated npm package upgrade with AI-driven verification
on:
  schedule: weekly on sunday around 10pm
  workflow_dispatch:
permissions: read-all
tools:
  github:
    toolsets: [default]
  cache-memory: true
network:
  allowed:
    - defaults
    - node
    - fonts
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: "24"
  - run: corepack enable
  - run: yarn install --immutable
safe-outputs:
  create-pull-request:
    title-prefix: "📦 "
    labels: [dependencies, maintenance, automated]
    draft: false
    expires: 7
---

# 📦 Weekly Package Upgrade Agent

You are an AI agent responsible for upgrading npm packages in this Next.js / TypeScript project.
The project uses **Yarn 4** (with corepack) as the package manager and **Biome** for linting and formatting.

## Your Task

Systematically upgrade outdated npm packages, verify each upgrade works, and create a pull request with all successful upgrades.

## Step 0: Configure Yarn Proxy

The agent runs inside a sandboxed environment with a network firewall proxy. Yarn 4 does not correctly use the `HTTP_PROXY`/`HTTPS_PROXY` environment variables, so you **must** configure Yarn's proxy settings explicitly before running any yarn network commands.

Run the following commands at the start:

```bash
yarn config set --home httpProxy "$HTTP_PROXY"
yarn config set --home httpsProxy "$HTTPS_PROXY"
```

The `--home` flag writes the proxy settings to `~/.yarnrc.yml` (user-level config) instead of the project's `.yarnrc.yml`, so the proxy configuration stays local to the agent environment and does not pollute the repository.

This ensures Yarn can reach the npm registry through the firewall. **Do not clear or override these proxy settings later.**

## Step 1: Check Cache Memory

Read cache memory to check if there were any previously failed upgrades or packages that should be skipped.
Use this information to avoid retrying known-incompatible upgrades.

## Step 2: Check for Outdated Packages

Run the following command to identify outdated packages:

```bash
yarn outdated || true
```

If there are no outdated packages, call the `noop` safe output with the message: "All packages are already up to date. No upgrades needed." and stop.

## Step 3: Create a Working Branch

Create a branch for the upgrades:

```bash
BRANCH_NAME="weekly-package-upgrade-$(date +%Y%m%d)"
git checkout -b "$BRANCH_NAME"
```

## Step 4: Upgrade Packages One by One

For each outdated package, follow this procedure. Process packages **one at a time** (or as related groups):

### 3-1. Grouping Rules

- **Always upgrade a package together with its `@types/*` counterpart** (e.g., `react` + `@types/react`, `react-dom` + `@types/react-dom`)
- **Upgrade related ecosystem packages together** (e.g., `react`, `react-dom`, `@types/react`, `@types/react-dom` as one group)
- **Upgrade Tailwind CSS ecosystem packages together** (e.g., `tailwindcss`, `@tailwindcss/postcss`)
- All other packages should be upgraded individually

### 3-2. Perform the Upgrade

```bash
yarn up [package-name]@latest
# If a @types/* counterpart exists:
yarn up @types/[package-name]@latest
```

### 3-3. Run Format & Lint Fix

After every upgrade, **always** run:

```bash
yarn check:fix
```

### 3-4. Verify the Upgrade

Run the following commands **in this exact order**. If any command fails, the upgrade must be investigated:

```bash
# 1. Formatter & Linter check
yarn check

# 2. Build verification
yarn build
```

### 3-5. Handle Failures

If verification fails after an upgrade:

1. **Read the error messages carefully** and attempt to fix the issue (e.g., update import paths, adjust API usage for breaking changes)
2. After fixing, run `yarn check:fix`, then re-run `yarn check` and `yarn build`
3. If you cannot resolve the issue after 2 attempts, **revert the upgrade**:
   ```bash
   git checkout -- package.json yarn.lock
   yarn install --immutable
   ```
4. **Record the failed package in cache memory** with the error reason so it can be skipped in future runs

### 3-6. Commit Successful Upgrades

After each successful upgrade (or group of related upgrades):

```bash
git add .
git commit -m "chore: upgrade [package-name] to [new-version]"
```

## Step 5: Handle Major Version Upgrades with Extra Care

For **major version upgrades** (e.g., v1.x → v2.x):

- Check for breaking changes by reviewing the package's changelog or release notes using web-fetch if available
- Pay special attention to these packages:
  - **Next.js**: Check React version compatibility
  - **React / React DOM**: Upgrade together with `@types/react` and `@types/react-dom`; check the `resolutions` field in `package.json`
  - **TypeScript**: Check for type compatibility issues across the codebase
  - **Tailwind CSS**: Configuration or plugin changes may be needed
  - **Biome**: Configuration schema changes may be needed

## Step 6: Create the Pull Request

After all upgrades are complete, push the branch and create a pull request:

```bash
git push origin HEAD
```

Use the `create-pull-request` safe output with:
- **Title**: `📦 Weekly Package Upgrade (YYYY-MM-DD)` (use today's date)
- **Body**: Include a summary of all upgraded packages with their old and new versions, and note any packages that were skipped or reverted due to issues

## Step 7: Update Cache Memory

Before finishing, update the cache memory with:
- List of successfully upgraded packages and their versions
- List of packages that failed and why (to skip in future runs)
- Clear any previously failed packages that were successfully upgraded this time

## Guidelines

- **Never skip the verification step** — every upgrade must pass `yarn check` and `yarn build`
- **Do not modify source code unnecessarily** — only make changes required to fix breaking changes from upgrades
- **Preserve the `resolutions` field** in `package.json` if it exists — update version numbers there when upgrading resolved packages
- **Keep commits atomic** — one commit per package (or related package group)
- If there were no successful upgrades at all, call the `noop` safe output explaining which packages were attempted and why they failed

## Safe Outputs

- **If upgrades were made**: Use `create-pull-request` to submit the changes for review
- **If no upgrades were needed or possible**: Use `noop` with a clear explanation
