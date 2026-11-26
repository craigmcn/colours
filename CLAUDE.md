# CLAUDE.md

## Project overview

React + TypeScript SPA (Vite) with five colour tools (plus the `colours-tokens` CLI for theme/palette): Contrast Checker, Opacity Calculator, Palette Generator, Colour Blender, and Theme Colours (`/theme`). Deployed to both Netlify (root) and GitHub Pages (`/colours/` subdirectory) — the dual-build distinction matters for routing and asset paths.

## Commands

```bash
yarn husky           # once per fresh clone: enables the git hooks
yarn dev             # dev server on port 3060
yarn test --run      # run tests once (omit --run for watch mode)
yarn lint            # run ESLint across src/
yarn format          # format all files with Prettier
yarn format:check    # check formatting without writing (used in CI)
yarn build           # production build
yarn build:netlify   # dual build for Netlify + GitHub Pages
yarn build:cli       # rebuild the committed CLI bundle bin/colours-tokens.mjs
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
- `themePalette.ts` — Theme Colours generator (`generateThemePalette` / `generateDarkThemePalette`, 13 roles)
- `paletteScale.ts` — Palette Generator's 12-step scale (`buildPaletteScale`, `PALETTE_STEPS`)
- `tokens.ts` — CSS custom-property output shared by both generators: `toCssIdent`, `themeTokens`, `paletteTokens`, `cssDeclarations`. Pages must stay thin wrappers over these (no colour or formatting logic in components), so the output can be reused outside the UI (#109).
- `toolParams.ts` — URL query params for `/theme` (`brand`, `mode`, `prefix`) and `/palette` (`base`, `light`, `dark`, `name`). Colours are bare hex (`?brand=3366cc`); defaults and untouched colour inputs are omitted; malformed values are ignored. Pages read them once on mount (`useColor`'s `initialInput` pre-fills the input as if typed) and mirror state back with `useSearchParamsSync` (`replace: true`, so no history entry per keystroke). These URLs are a public contract for downstream docs (#109): don't rename params without a fallback.
- **Algorithm versions** — `THEME_ALGORITHM_VERSION` (`themePalette.ts`) and `PALETTE_ALGORITHM_VERSION` (`paletteScale.ts`). **Bump the relevant one whenever the same input produces different output.** Golden tests in `themePalette.test.ts` and `paletteScale.test.ts` pin the output for fixed inputs and fail on any change; when that happens, bump the version and then update the expected values (`yarn vitest run <file> -u` for the inline snapshots). Never update the golden values without bumping.
- **CLI (`colours-tokens`)** — logic in `src/cli/run.ts` (pure `run(argv) → {stdout, stderr, code}`, no Node APIs, unit-tested); `cli/main.ts` is the thin Node entry (type-checked via `tsconfig.node.json`). `vite.cli.config.ts` bundles it into `bin/colours-tokens.mjs`, which **is committed** so `npx github:craigmcn/colours#<tag>` and raw-file downloads need no build, and a tag pins the exact bytes. **After changing anything in `src/utils` or `src/cli`, run `yarn build:cli` and commit `bin/`**; CI rebuilds it and fails on any diff. `bin/` is excluded from ESLint and Prettier and isn't executable in git (npm sets the bit on install). `yarn add`/`yarn remove` chmod it to 755, so run `yarn build:cli` (which writes 644) before committing a dependency change, or CI's diff check fails. CSS output must stay identical to the page's Copy text (tests enforce this). Defaults are shared through `THEME_DEFAULT_BRAND` and `PALETTE_DEFAULTS`. An npm git install (`npx github:`) does a full install from the public registry, devDependencies included, because the repo has a `build` script (npm also does this for `prepare`, `prepack` and the install hooks). So **Font Awesome Pro packages live in `optionalDependencies`**: npm skips them when it gets a 404, while Yarn, CI and Netlify (which have the token) install them as normal. `src/packageJson.test.ts` enforces this. A cold `npx github:` takes about 25s because of that full install. Yarn 4 never runs `prepare`, so in a fresh clone run `yarn husky` once to enable the hooks.
- **`public/llms.txt`** — hand-written docs for agents: tools, URL params, output format, CLI usage and the theme/palette algorithms in prose. Vite copies it into both builds, and Netlify serves it as a static file ahead of the SPA rewrite. `src/llmsTxt.test.ts` runs every documented CLI command, checks the example CSS against real output, and checks the version line; `e2e/llms-txt.spec.ts` opens each example URL. **When an algorithm changes, update its prose section along with the version bump.** The pinned release tag in the CLI examples isn't tested, so update it when publishing a release that changes output.
- **Copy recipe header** — the custom-properties Copy button prepends a two-line CSS comment (`themeRecipe` / `paletteRecipe` in `tokens.ts`) recording the tool, algorithm version, every input (defaults included) and a full reproducible URL, so pasted tokens describe how to regenerate them. It's in the copied text only, not the on-screen `<pre>`, and a caption under the button says so. The header is built only from sanitised idents, hex values, URL-encoded params and a normalised `appUrl` (line breaks dropped, `*/` encoded as `*%2F`), so no input, including the CLI's `--app-url`, can close the comment with `*/`. The CLI also rejects a non-http(s) `--app-url`.

## Security headers

`netlify.toml` sets a strict CSP (no `'unsafe-inline'` or `'unsafe-eval'`) plus `nosniff`, `Referrer-Policy` and `Permissions-Policy`. These apply on Netlify only; GitHub Pages can't set headers. `www.craigmcn.com/colours/` proxies Netlify, so it gets them too. The only external origins are albertcss (CSS and nav JS) and Google Fonts. Adding a CDN, a runtime `<style>` injector or a new fetch target needs a CSP change. Vite bakes `%BASE_URL%` into `index.html`'s inline redirect script, so the CSP allows one hash per build base. `src/securityHeaders.test.ts` fails if the script changes without updating both hashes.

## Conventions

- **Spelling**: "colour" in UI-facing text and filenames (e.g. `ColourBlender`), "color" in React/CSS convention filenames (e.g. `ColorInput`, `useColor`).
- **CSS**: CSS Modules (`.module.scss`) for component styles; `camelCase` locals convention (set in `vite.config.ts`). Global styles in `src/styles/global.scss`.
- **Testing**: Vitest + React Testing Library, `happy-dom` environment. Tests live alongside source files. Run all tests with `yarn test --run`. Do not mock internal utilities — test against real implementations.
- **TypeScript**: strict mode with `noUnusedLocals` and `noUnusedParameters` — the build will fail if unused symbols are introduced.
- **Linting**: ESLint v9 flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-config-prettier` (last in chain, disables rules that conflict with Prettier).
- **Formatting**: Prettier with default settings (`.prettierrc` is `{}`). Run `yarn format` to write, `yarn format:check` to verify. The pre-commit hook runs `prettier --check` before lint/type-check/tests. CI also runs `yarn format:check`.
- **Commit messages**: enforced by the `commit-msg` hook. Format: `type(optional-scope): description`. Valid types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`.

## CI

A GitHub Actions workflow (`.github/workflows/test.yml`) runs `yarn format:check` and `yarn test --run` on every pull request, plus a weekly scheduled run on `main` (no push-to-`main` run: branch protection requires PRs to be up to date). The pre-commit hook runs prettier check + lint + type-check + tests locally before each commit, so CI failures on a PR should be rare.

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

### Completed (2026-05-21) — PR #71

- Migrated `OpacityCalculator` "Solve for" button group from custom module SCSS to AlbertCSS `.button-group` / `.button-group__input` pattern
- Restructured JSX from wrapper-label to sibling `<input id="…">` + `<label htmlFor="…">` pattern
- `<fieldset>` + `<legend>` provide group semantics and accessible name implicitly; no `role` or `aria-labelledby` needed on the inner `.button-group` div
- Deleted `.buttonGroup` and `.buttonGroupItem` blocks from `OpacityCalculator.module.scss`
- Added "solve-for button group" test block (group accessible name + radio value attributes); 380 tests total

### Completed (2026-07-13)

- Bumped `.github/workflows/test.yml` action versions: `actions/checkout@v4` → `v7`, `actions/setup-node@v4` → `v6`; closes cross-repo task 0a (bump GitHub Actions to current majors) for this repo

### Completed (2026-07-21) — PR #92

- Added Playwright E2E testing, rolling out the wordle-helper/sudoku pattern: `playwright.config.ts` (chromium project, `webServer` runs `yarn dev` on port 3060), `e2e/` directory, `test:e2e` script, CI browser caching/install/run steps
- Five specs: cross-tool navigation plus one golden-path spec per tool; all 11 verified locally against a real Chromium build
- `yarn lint` now covers `e2e/` and `playwright.config.ts`; `tsconfig.node.json` includes both for typechecking; vitest's `test.exclude` keeps `e2e/**` out of the unit runner
- Not added to the pre-commit hook — E2E runs in CI only, per the cross-repo standard (browser install + startup too slow for a hook)
- Closes #80

### Completed (2026-07-21) — PR #90

- Switched `index.html`'s AlbertCSS `<link>`/`<script>` from the legacy `www.craigmcn.com/albertcss/` path to the canonical `albertcss.craigmcn.com` host; closes #83

### Completed (2026-07-21) — PR #91

- Added `eslint-plugin-jsx-a11y` (flat config recommended ruleset) and `vitest-axe` (pinned `1.0.0-pre.5`, matching wordle-helper/math-tiles/order/number-magic/currency); axe checks now run against all four routes in `App.test.tsx`
- Fixed a real heading-order violation the new tooling caught: `ContrastChecker` had no page-level `h1`, so `SwatchCard`'s `h3` card titles skipped a level under `Layout`'s `h1`. Added the missing `h1` to `ContrastChecker` and changed `SwatchCard`'s title from `h3` to `h2`, matching the `h1`→`h2` pattern `PaletteGenerator` already uses for its card title
- `ColorExample`'s decorative `href="#"` preview link triggered `anchor-is-valid`; disabled inline with a comment rather than restructuring — it's intentionally not a real navigation target, and existing tests query it by `role="link"`
- Closes #79

### Outstanding / next

Open TODOs (including the former cross-repo carry-forward list, now confirmed resolved elsewhere) are tracked as issues in the [colours GitHub Project](https://github.com/users/craigmcn/projects/2).

### Key decisions

- `require_code_owner_review: true` is ON in the ruleset (CLAUDE.md previously said it was off — corrected 2026-05-01)
- `dismiss_stale_reviews` aligned to cross-repo standard; all other ruleset parameters left unchanged
- `@testing-library/dom` must be listed explicitly in `devDependencies` — Yarn 4 does not auto-hoist peer deps the way npm does
- `yarn test --run` (not `yarn vitest run`) is the canonical test command — matches the `test` script in `package.json`
- `.prettierrc` is `{}` (empty) — Prettier defaults apply (double quotes, semicolons); intentional, not a placeholder
- Router basename redirect uses Vite's `%BASE_URL%` template so the same `index.html` works for both builds; the redirect also forwards `location.search` and `location.hash`
- Palette Generator CSS custom property lines end with `;` — output is valid CSS ready to paste into `:root {}`
- AlbertCSS button group pattern uses **sibling** `<input class="button-group__input">` + `<label class="button button--*">` (not wrapper-label); checked state driven by CSS `input:checked + .button` — do not use `:has(:checked)` or wrap input inside label
- Page heading hierarchy: `Layout` renders the site `h1` ("colours"); each page also renders its own `h1` (page title); any card/section titles nested under a page must step down one level at a time (`PaletteGenerator`'s card title is `h2`; `SwatchCard`'s card title is `h2` for the same reason) — do not skip straight to `h3`

## External dependencies

- **albertcss** (`https://www.craigmcn.com/albertcss/`) — external CSS framework loaded via `index.html`; provides `.form__group`, `.form__label`, `.form__control`, `.button`, `.nav__*`, `.card`, `.alert`, etc. Do not replicate these styles locally.
- **Font Awesome 7 Pro** — npm SVG packages, Sharp Duotone Light style only (`@fortawesome/sharp-duotone-light-svg-icons`). Re-export each icon from `src/icons.ts` (which also sets `autoAddCss = false` and bundles the CSS) and render it with `<FontAwesomeIcon icon={faX} />`; don't bring back the kit or add other icon styles. Installing needs `FONTAWESOME_NPM_AUTH_TOKEN` (`.yarnrc.yml`), set locally, as a GitHub Actions secret and on the Netlify site.
- **React Router** (`BrowserRouter`) — basename is set at runtime from `import.meta.env.BASE_URL` to support both deployments. Use `NavLink`/`Link` for in-app navigation. The brand logo `<a href="/">` is intentionally a plain anchor (links to deployed root, not the SPA root).
