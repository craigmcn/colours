# CLAUDE.md

## Project overview

React + TypeScript SPA (Vite) with four colour tools: Contrast Checker, Opacity Calculator, Palette Generator, and Colour Blender. Deployed to both Netlify (root) and GitHub Pages (`/colours/` subdirectory) — the dual-build distinction matters for routing and asset paths.

## Commands

```bash
yarn dev             # dev server on port 3060
yarn test --run      # run tests once (omit --run for watch mode)
yarn lint            # run ESLint across src/
yarn format          # format all files with Prettier
yarn format:check    # check formatting without writing (used in CI)
yarn build           # production build
yarn build:netlify   # dual build for Netlify + GitHub Pages
```

Always run `yarn test --run` to verify changes before committing. The pre-commit hook does this automatically, along with `yarn prettier --check`, `yarn lint`, and `tsc -b`.

## Architecture

```
src/
  types/colour.ts       # shared types: Hex, RGB, HSL, ColorValue, ContrastColor(s), WcagLevel
  utils/                # pure functions, each with a co-located .test.ts
  hooks/                # useColor, useClipboard — each with a co-located .test.ts
  components/           # shared UI components — each with co-located .test.tsx and .module.scss
  pages/                # one directory per tool — each with co-located .test.tsx
```

### Core types

- `Hex` — `[string, string, string]` two-char lowercase pairs, e.g. `['ff', '00', 'aa']`
- `RGB` — `[number, number, number]` integers clamped to `[0, 255]`
- `HSL` — `[number, string, string]` where sat/light include the `%` suffix, e.g. `[240, '100%', '50%']`
- `ColorValue` — `{ hex: Hex, rgb: RGB, hsl: HSL }`

### Key utilities

- `parseValues.ts` — parses hex/rgb/hsl strings into `[Hex, RGB, HSL]`; RGB channels are clamped to [0, 255]
- `convertColours.ts` — conversion and formatting functions (`hex2Rgb`, `rgb2Hsl`, `hex2Str`, `rgb2Str`, etc.)
- `contrastRatio.ts` — WCAG contrast ratio calculation and `contrastTextColor` (returns accessible text colour for a given background). **`contrastRatio()` returns an unrounded float** — rounding to 2dp happens only at the display layer (`ContrastResult`). Do not round elsewhere; pass/fail and search-loop comparisons must use the precise value.
- `calculate.ts` — opacity blending maths (`calculateColorArray`, `calculateFg`, `calculateBg`, `calculateOpacity`)
- `passFail.ts` — WCAG pass/fail logic

## Conventions

- **Spelling**: "colour" in UI-facing text and filenames (e.g. `ColourBlender`), "color" in React/CSS convention filenames (e.g. `ColorInput`, `useColor`).
- **CSS**: CSS Modules (`.module.scss`) for component styles; `camelCase` locals convention (set in `vite.config.ts`). Global styles in `src/styles/global.scss`.
- **Testing**: Vitest + React Testing Library, `happy-dom` environment. Tests live alongside source files. Run all tests with `yarn test --run`. Do not mock internal utilities — test against real implementations.
- **TypeScript**: strict mode with `noUnusedLocals` and `noUnusedParameters` — the build will fail if unused symbols are introduced.
- **Linting**: ESLint v9 flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-config-prettier` (last in chain, disables rules that conflict with Prettier).
- **Formatting**: Prettier with default settings (`.prettierrc` is `{}`). Run `yarn format` to write, `yarn format:check` to verify. The pre-commit hook runs `prettier --check` before lint/type-check/tests. CI also runs `yarn format:check`.
- **Commit messages**: enforced by the `commit-msg` hook. Format: `type(optional-scope): description`. Valid types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`.

## CI

A GitHub Actions workflow (`.github/workflows/test.yml`) runs `yarn format:check` and `yarn test --run` on every push to `main` and on every pull request. The pre-commit hook runs prettier check + lint + type-check + tests locally before each commit, so CI failures on a PR should be rare.

## Repository protection

`.github/CODEOWNERS` assigns `@craigmcn` as the owner of all files. The ruleset enforces `require_code_owner_review`, so reviews must come from `@craigmcn`.

A repository ruleset ("Branch Protection Best Practices") is active and applies to the default branch (`main`) and `feature-*` branches (excludes `dev-*`). It enforces:

- **Pull request required** — 1 approving review required, must be from a code owner (`@craigmcn`), and the last pusher cannot self-approve
- **Stale reviews dismissed** — approval is invalidated when new commits are pushed
- **Status checks must pass** — the `test` job in the CI workflow must be green before merging
- **No deletion** — the protected branches cannot be deleted
- **No force-pushes** — history cannot be rewritten on protected branches

`@craigmcn` (as repository admin) can bypass all rules and merge without a review. No one else can merge without `@craigmcn`'s explicit approval.

## Progress

### Completed (2026-05-01)

- Added `.github/CODEOWNERS` (`* @craigmcn`) — PR #64, commit `29c105a`; closes cross-repo task A from the repo-modernization plan
- Confirmed branch protection ruleset (14897154) already had 1 required approval + Admin role bypass; closed cross-repo task B
- Fixed gap vs. standard: enabled `dismiss_stale_reviews_on_push` on the ruleset via `gh api`

### Completed (2026-05-04) — PR #65

- Removed legacy `.eslintrc.json` (superseded by `eslint.config.js`)
- Migrated npm → Yarn 4 (`yarn@4.14.1`, node-modules linker); binary committed at `.yarn/releases/`; `package-lock.json` replaced by `yarn.lock`
- Added `@testing-library/dom` as explicit dev dep — required because Yarn 4 does not auto-hoist peer deps
- Upgraded Vite 6 → 8 and `@vitejs/plugin-react` 4 → 6
- Updated `.husky/pre-commit` and `.github/workflows/test.yml` from npm to yarn
- Committed pre-existing `.editorconfig` that was untracked
- `colours` is now fully aligned with the cross-repo standard stack

### Completed (2026-05-07) — PR #66

- Added Prettier (`prettier@3`, `eslint-config-prettier`) with default settings
- Added `.prettierrc` (`{}`), `.prettierignore` (dist/netlify/coverage/.yarn/lock files)
- Extended `eslint.config.js` with `prettierConfig` as final entry
- Added `format` / `format:check` scripts to `package.json`
- Added `yarn prettier --check .` as first step of `.husky/pre-commit`
- Added `yarn format:check` to `.github/workflows/test.yml` CI
- Applied initial format pass across all source files (whitespace/quote/semicolon only — no logic changes)
- Fixed README CSS code block that Prettier mangled: added `<!-- prettier-ignore -->` and restored each custom property to its own line with trailing semicolons

### Completed (2026-05-07) — PR #67

- Added Router basename trailing-slash redirect script in `index.html` using `%BASE_URL%` (Vite template variable); preserves query string and hash on redirect; no-op for Netlify build
- Appended trailing semicolon to each CSS custom property line in Palette Generator output; tightened copy-block test assertions to verify format

### Completed (2026-05-07) — PR #68

- Docs-only: removed stale "(open, pending merge)" qualifier from PR #67 entry; merged directly by admin

### Completed (2026-05-21) — PR #71 (pending)

- Migrated `OpacityCalculator` "Solve for" button group from custom module SCSS to AlbertCSS `.button-group` / `.button-group__input` pattern
- Restructured JSX from wrapper-label to sibling `<input id="…">` + `<label htmlFor="…">` pattern
- `<fieldset>` + `<legend>` provide group semantics and accessible name implicitly; no `role` or `aria-labelledby` needed on the inner `.button-group` div
- Deleted `.buttonGroup` and `.buttonGroupItem` blocks from `OpacityCalculator.module.scss`

### Outstanding / next (this repo)

No known outstanding work for `colours` specifically.

### Outstanding / next (cross-repo — other repos)

- `order` — remove `.eslintrc.cjs` (next in the sync plan)
- `unixtime` — upgrade React 18.2 → 19; clean up `resolutions` block
- `currency`, `markdown`, `math-tiles`, `number-magic`, `unixtime`, `words` — add Husky pre-commit hooks and `.github/CODEOWNERS`
- `albertcss`, `words`, `cryptogram` — branch-protection ruleset alignment (tasks A & B)
- Low-priority: rename `vite.config.js` → `.ts` in `words`, `unixtime`, `cryptogram`; fix cryptogram PnP → node-modules; bump Yarn in several repos

### Key decisions

- `require_code_owner_review: true` is ON in the ruleset (CLAUDE.md previously said it was off — corrected 2026-05-01)
- `dismiss_stale_reviews` aligned to cross-repo standard; all other ruleset parameters left unchanged
- `@testing-library/dom` must be listed explicitly in `devDependencies` — Yarn 4 does not auto-hoist peer deps the way npm does
- `yarn test --run` (not `yarn vitest run`) is the canonical test command — matches the `test` script in `package.json`
- `.prettierrc` is `{}` (empty) — Prettier defaults apply (double quotes, semicolons); intentional, not a placeholder
- Router basename redirect uses Vite's `%BASE_URL%` template so the same `index.html` works for both builds; the redirect also forwards `location.search` and `location.hash`
- Palette Generator CSS custom property lines end with `;` — output is valid CSS ready to paste into `:root {}`
- AlbertCSS button group pattern uses **sibling** `<input class="button-group__input">` + `<label class="button button--*">` (not wrapper-label); checked state driven by CSS `input:checked + .button` — do not use `:has(:checked)` or wrap input inside label

## External dependencies

- **albertcss** (`https://www.craigmcn.com/albertcss/`) — external CSS framework loaded via `index.html`; provides `.form__group`, `.form__label`, `.form__control`, `.button`, `.nav__*`, `.card`, `.alert`, etc. Do not replicate these styles locally.
- **Font Awesome** — loaded via kit script in `index.html`; use `<span className="far fa-* fa-fw" />` pattern.
- **React Router** (`BrowserRouter`) — basename is set at runtime from `import.meta.env.BASE_URL` to support both deployments. Use `NavLink`/`Link` for in-app navigation. The brand logo `<a href="/">` is intentionally a plain anchor (links to deployed root, not the SPA root).
