# CLAUDE.md

## Project overview

React + TypeScript SPA (Vite) with four colour tools: Contrast Checker, Opacity Calculator, Palette Generator, and Colour Blender. Deployed to both Netlify (root) and GitHub Pages (`/colours/` subdirectory) — the dual-build distinction matters for routing and asset paths.

## Commands

```bash
yarn dev             # dev server on port 3060
yarn test --run      # run tests once (omit --run for watch mode)
yarn lint            # run ESLint across src/
yarn build           # production build
yarn build:netlify   # dual build for Netlify + GitHub Pages
```

Always run `yarn test --run` to verify changes before committing. The pre-commit hook does this automatically, along with `yarn lint` and `tsc -b`.

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
- **Linting**: ESLint v9 flat config (`eslint.config.js`) with `typescript-eslint` and `eslint-plugin-react-hooks`.
- **Commit messages**: enforced by the `commit-msg` hook. Format: `type(optional-scope): description`. Valid types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`, `revert`.

## CI

A GitHub Actions workflow (`.github/workflows/test.yml`) runs `yarn test --run` on every push to `main` and on every pull request. The pre-commit hook runs lint + type-check + tests locally before each commit, so CI failures on a PR should be rare.

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

- Added `.github/CODEOWNERS` (`* @craigmcn`) — PR #64, commit `29c105a`; closes cross-repo task A from the repo-modernisation plan
- Confirmed branch protection ruleset (14897154) already had 1 required approval + Admin role bypass; closed cross-repo task B
- Fixed gap vs. standard: enabled `dismiss_stale_reviews_on_push` on the ruleset via `gh api`

### Completed (2026-05-04)

- Removed legacy `.eslintrc.json` (superseded by `eslint.config.js`)
- Migrated npm → Yarn 4 (`yarn@4.14.1`, node-modules linker); added `@testing-library/dom` as explicit dev dep to resolve Yarn 4 peer resolution
- Upgraded Vite 6 → 8 and `@vitejs/plugin-react` 4 → 6
- Updated husky pre-commit hook and all doc/command references from npm to yarn

### Outstanding / next

- Cross-repo tasks A & B (CODEOWNERS + branch-protection update) still needed for: `albertcss`, `words`, `cryptogram`

### Key decisions

- `require_code_owner_review: true` is ON in the ruleset (CLAUDE.md previously said it was off — corrected above)
- `dismiss_stale_reviews` aligned to cross-repo standard; all other ruleset parameters left unchanged
- `@testing-library/dom` must be listed explicitly in `devDependencies` — Yarn 4 does not auto-hoist peer deps the way npm does

## External dependencies

- **albertcss** (`https://www.craigmcn.com/albertcss/`) — external CSS framework loaded via `index.html`; provides `.form__group`, `.form__label`, `.form__control`, `.button`, `.nav__*`, `.card`, `.alert`, etc. Do not replicate these styles locally.
- **Font Awesome** — loaded via kit script in `index.html`; use `<span className="far fa-* fa-fw" />` pattern.
- **React Router** (`BrowserRouter`) — basename is set at runtime from `import.meta.env.BASE_URL` to support both deployments. Use `NavLink`/`Link` for in-app navigation. The brand logo `<a href="/">` is intentionally a plain anchor (links to deployed root, not the SPA root).
