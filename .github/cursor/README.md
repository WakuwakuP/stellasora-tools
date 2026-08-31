# Cursor weekly package upgrade

`cursor-weekly-package-upgrade.yml` is the only Cursor Actions workflow in this
repository. It upgrades dependencies on a weekly schedule and opens a pull
request after the same checks as the PR gates, plus a production build.

Jobs are isolated: `upgrade` has `contents: read` and the Cursor secret;
`verify` reinstalls from the updated lockfile with GitHub tokens unset;
`publish` holds write tokens and does not run package CLIs. The PR body
includes a `## 更新パッケージ` table from
`.github/cursor/render-package-upgrade-table.mjs`. Allow only
`Shell(<package-cli>)` — not `Shell(true)` or `Shell(*)`.

## Repository configuration

- Actions repository secret `CURSOR_API_KEY` (required)
- Actions repository variable `CURSOR_AGENT_MODEL` (optional Cursor model ID;
  a variable, not a secret)
- Existing `GH_AW_GITHUB_TOKEN` (optional; used so bot-created PRs can trigger
  downstream workflows). Fine-grained PAT for this repo: Contents, Pull
  requests, and Issues at read and write.
- **Settings → Actions → General → Workflow permissions → Allow GitHub Actions
  to create and approve pull requests**

The shared action in `.github/actions/run-cursor` downloads a pinned Cursor CLI
archive, verifies its SHA-256 digest before extraction, applies the
`maintenance` permission profile, and runs the verified binary by absolute path
in non-interactive mode. It does not execute Cursor's mutable installer or add
its install directory to `PATH`.

Cursor never receives `GITHUB_TOKEN`, `GH_TOKEN`, or `GH_AW_GITHUB_TOKEN`, and
every checkout uses `persist-credentials: false`. The action prepends PATH
wrappers so package CLIs drop `CURSOR_API_KEY` before lifecycle scripts run,
and uses a private `TMPDIR` instead of `$RUNNER_TEMP`. GitHub mutations are
performed by later deterministic steps. Publication uses `GH_AW_GITHUB_TOKEN`
when configured and otherwise falls back to the built-in token.

The `maintenance` profile is reserved for the fixed, trusted weekly
package-upgrade prompt, where the repository package CLI is required. That
shell allowance can run package scripts and is therefore not a sandbox
boundary; never reuse this action with Issue, PR, or other untrusted prompt
content.

Native write allowances are materialized as absolute paths under the current
`GITHUB_WORKSPACE`. The action also resolves and revalidates its output
directory after the agent exits, rejects symlink outputs, and atomically
installs the result from a temporary file in that verified directory.

Cursor also receives a fresh temporary `HOME`, isolating any CLI cache or
credential material it creates during the run.

The profile uses Cursor's `static` channel and the action also passes
`--disable-auto-update`, so the verified binary cannot replace itself at run
time. Project Cursor configs are disabled, and the action fails closed if it
finds a project CLI, MCP, or hook configuration (including Claude hooks or
permissions entries). Native reads of Cursor's credential and configuration
directories are denied as well.

### Updating the pinned Cursor CLI

The version, archive URL, and SHA-256 digest are constants in
`.github/actions/run-cursor/action.yml`. Cursor does not currently publish a
documented stable download API or checksum manifest for this archive, so treat
an update as a supply-chain-sensitive code change:

1. Inspect `https://cursor.com/install` and identify the exact Linux x64 build
   and archive URL it selects.
2. Download that archive independently, calculate its SHA-256 digest, and
   inspect its contents before changing the constants.
3. Verify that the extracted `cursor-agent --version` exactly matches the
   pinned build, then run the workflow validation before merging.

The action performs the digest and version checks again on every run and fails
closed on any mismatch.
