# Weekly package upgrade

Upgrade outdated dependencies in this Yarn 4 / Node.js 24 project, leaving all
successful changes in the working tree. Read `AGENTS.md` (if present),
`package.json`, the Yarn configuration, and relevant implementation before
editing.

Use `yarn outdated || true` to inspect available updates. Upgrade packages one
at a time or in tightly related groups, and keep only upgrades that can be made
compatible with the application. Pair packages with their `@types/*` counterparts, and upgrade these ecosystems together when applicable:

- `react`, `react-dom`, `@types/react`, and `@types/react-dom`
- `tailwindcss` and `@tailwindcss/postcss`
- `@zenstackhq/cli`, `@zenstackhq/orm`, `@zenstackhq/schema`

Take special care with React, Next.js, TypeScript, Biome, major-version changes, ZenStack.
Preserve and update `package.json` `resolutions` / `overrides` when needed.
Do not force an incompatible major upgrade just because it is newer.

`next-env.d.ts` may be gitignored. Do not commit `next-env.d.ts` or `.next/**`.
Do not run `yarn db:generate` or rewrite generated `src/zenstack/**` files.
After each package group, use `yarn check:fix` as needed and verify with this
exact sequence:

1. `yarn check`
2. `yarn test:run`
3. `yarn build`

If a group fails verification, undo only that group by restoring the previous
`package.json` and `yarn.lock` contents you observed before the upgrade, then
run `yarn install --immutable`. Leave the working tree passing the verification
sequence above. Never leave a broken tree for the workflow to sort out.

Hard constraints:

- Do not run `git`, `gh`, or any command that commits, pushes, or creates a pull
  request. The workflow performs those operations after verification.
- Do not read or write secrets, credentials, `.env*`, `.git/**`, or key files.
- Do not edit `.agents/**`, `.github/**`, `.claude/**`, `.cursor/**`,
  `.cursorignore`, `.cursorrules`, `.codex/**`, `.husky/**`, `AGENTS.md`,
  `CLAUDE.md`, `scripts/**`, or generated `src/zenstack/**` files.
- Do not make product changes unrelated to compatibility with an upgrade.
- Do not use npm, npx, pnpm, or another package manager.

If everything is already current, leave the working tree unchanged and say so
in the final response. Otherwise, make the upgrades and compatibility fixes;
do not merely describe them. End with a short list of upgraded packages and
any groups you reverted.
