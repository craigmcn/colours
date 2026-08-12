# Onboarding: colours

Welcome! This doc walks through how the `colours` app is put together, in plain
English, assuming you're comfortable with React/TypeScript basics but new to
this specific codebase.

## What this app is

`colours` is a small React + TypeScript single-page app with five browser-based
colour tools: a **Contrast Checker**, an **Opacity Calculator**, a **Palette
Generator**, a **Colour Blender**, and a **Theme Colours** generator. There's no
backend and no database — everything runs client-side, in the browser, using
plain math on RGB/HSL numbers.

Think of it as five independent "pages," each built from the same small set of
shared building blocks (colour math functions, a colour-input hook, and some
shared UI components), wired together with React Router.

## Getting it running

```bash
yarn dev             # starts a dev server at http://localhost:3060
yarn test --run      # runs the full test suite once
yarn lint             # ESLint
yarn format           # Prettier, writes changes
yarn build             # production build (type-checks first)
```

A pre-commit hook (Husky) runs prettier → lint → typecheck → tests automatically
before every commit, so if `yarn dev` and `yarn test --run` both work, you're in
good shape.

## Architecture, top to bottom

```
src/
  types/colour.ts   ← the shared vocabulary (see below)
  utils/            ← pure functions: colour math, no React
  hooks/            ← two small React hooks that wrap the utils for use in pages
  components/       ← shared UI pieces used by more than one page
  pages/            ← one folder per tool, each a full page/route
  App.tsx           ← wires pages to URL routes
  main.tsx          ← React entry point
```

The dependency direction only ever flows one way: **pages depend on components,
components depend on hooks and utils, hooks depend on utils, utils depend on
nothing (except `types`).** Utils never import from components or pages. This
is worth internalising early, because it tells you where to go looking for
something: if you want to change _how a number is calculated_, look in `utils/`;
if you want to change _how it looks on screen_, look in `components/` or
`pages/`.

### The shared vocabulary (`src/types/colour.ts`)

Every colour in this app is represented three ways at once, in one object:

```ts
interface ColorValue {
  hex: Hex; // ['ff', '00', 'aa']  — array of three two-char strings
  rgb: RGB; // [255, 0, 170]       — array of three 0–255 integers
  hsl: HSL; // [240, '100%', '50%'] — hue as number, sat/light as strings with a % suffix
}
```

Two quirks that trip people up the first time:

- **`Hex` is an array of three strings, not one string.** `['ff', '00', 'aa']`,
  not `'#ff00aa'`. Use `hex2Str()` from `convertColours.ts` whenever you need
  the `#ff00aa` display form.
- **`HSL`'s saturation and lightness are strings with a trailing `%`**, e.g.
  `'50%'`, not the number `50`. This is because they're meant to be dropped
  straight into a CSS `hsl(...)` string. When you need to do math on them
  you'll see code doing `parseInt(color.hsl[1])` to strip the `%` back off.

All conversions between the three formats live in `utils/convertColours.ts`
(`hex2Rgb`, `rgb2Hsl`, `hsl2Rgb`, `rgb2Hex`, plus `*2Str` helpers that format
each type as a display string like `#ff00aa`, `rgb(255, 0, 170)`,
`hsl(240, 100%, 50%)`).

### Utils — the pure colour math (`src/utils/`)

These are all plain functions with no React and no side effects, which is why
they're easy to unit test directly (each has a co-located `.test.ts`). This is
usually the best place to start reading if you want to understand _what the
app actually computes_, before worrying about how it's displayed.

| File                   | What it does                                                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `convertColours.ts`    | Converts between hex/RGB/HSL, and formats each as a display string                                                                                                                                                                                          |
| `parseValues.ts`       | Parses free-text user input (`#c00`, `rgb(10, 20, 30)`, `hsl(10, 20%, 30%)`) into hex/RGB/HSL. Anything that doesn't match one of those patterns falls back to a default colour rather than erroring                                                        |
| `contrastRatio.ts`     | WCAG contrast-ratio math (the core of the Contrast Checker). `contrastRatio()` returns an **unrounded** float — rounding to 2 decimal places only happens at display time, because rounding earlier could turn a borderline 4.495 ratio into a false "pass" |
| `passFail.ts`          | Turns a contrast ratio into a Pass/Fail verdict against WCAG A/AA/AAA thresholds                                                                                                                                                                            |
| `calculate.ts`         | Opacity-blending math: given a background, foreground, and opacity, work out the resulting flattened colour — and the reverse (solve for foreground, background, or opacity given the other three)                                                          |
| `nearestNamedColor.ts` | Given an RGB value, finds the closest match in `data/named-colors.json` by straight-line distance in RGB space. Used by the Palette Generator to suggest a name                                                                                             |
| `themePalette.ts`      | Generates a full semantic colour palette (primary, secondary, accent, success, danger, etc.) from a single brand colour, for light or dark mode                                                                                                             |

### Hooks (`src/hooks/`)

Two small hooks wrap the utils above into something pages can use directly:

- **`useColor(initialHex)`** — the workhorse. Every colour input on every page
  goes through this hook. It tracks three things: the _current_ colour value
  (which can be nudged by sliders), the _source_ colour (what the user actually
  typed, frozen until they type something new), and the raw _text_ they typed
  into the input box. It exposes `update(text)` (call this when the user types)
  and `set(value, displayText?, updateSource?)` (call this when something else,
  like a slider, changes the colour programmatically).
- **`useClipboard()`** — wraps `navigator.clipboard.writeText`, and tracks which
  "copy" button was last clicked (`copiedKey`) so the UI can flash a
  success state on the right button for ~1.2 seconds.

### Shared components (`src/components/`)

These are UI pieces reused across two or more pages:

- **`Layout`** — the page chrome: header, logo, nav links to all five tools.
  Every page renders inside this.
- **`ColorInput`** — a labelled text input for typing a hex/RGB/HSL value,
  with an optional warning message.
- **`SwatchCard`** — used only by the Contrast Checker: shows a colour's
  "source" (frozen, as-typed) and "compare" (live, slider-adjusted) swatches
  side by side, plus saturation/lightness sliders and copy buttons.
- **`SwatchControls`** — the saturation/lightness range sliders inside a
  `SwatchCard`.
- **`ColorExample`** — the "here's how it actually looks" preview block on the
  Contrast Checker (real link/body text/background colours applied to sample
  copy).
- **`ContrastResult`** — renders one contrast-ratio result row (ratio number +
  Pass/Fail badges) on the Contrast Checker.
- **`ColorSwatch`** — a single flat colour swatch.
- **`CopyButtons`** — the row of HEX / RGB / HSL copy buttons that appears on
  most pages, built on top of `useClipboard`.

Each component owns its own `.module.scss` file for styling (CSS Modules,
`camelCase` class names) alongside a co-located `.test.tsx`.

## The five pages (`src/pages/`)

Routing is defined in `App.tsx` — five routes, each rendering one page inside
`Layout`:

| Route      | Page                  | What it does                                                                                                                                                                                                                                            |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`        | **ContrastChecker**   | Enter link/text/background colours; see WCAG contrast ratios (Link↔Body, Link↔Background, Body↔Background) and pass/fail against AA/AAA. Two buttons auto-calculate the darkest/lightest text+link colour that passes AA or AAA against your background |
| `/opacity` | **OpacityCalculator** | Enter foreground, background, and opacity to see the flattened result colour — or pick which of the four values (fg/bg/result/opacity) to _solve for_ and let the tool work backwards from the other three                                              |
| `/palette` | **PaletteGenerator**  | Enter a base colour (plus light/dark endpoints) and get a 12-step tint/shade scale, output as ready-to-paste CSS custom properties (`--colour-name-0` … `--colour-name-500`)                                                                            |
| `/blender` | **ColourBlender**     | Enter a start and end colour plus a step count; get an evenly-spaced gradient of in-between colours                                                                                                                                                     |
| `/theme`   | **ThemeColours**      | Enter one brand colour; generates a full semantic palette (primary, secondary, accent, success/danger/warning/info, light/dark, greys, white/black) for light or dark mode, output as CSS custom properties with a configurable prefix                  |

Each page follows roughly the same shape: one or more `useColor()` instances
for the inputs, a `useMemo`'d derived calculation via a `utils/` function, and
a render that shows swatches plus copy buttons. If you understand
`ContrastChecker.tsx`, the other four will look very familiar — they're
variations on the same pattern (`PaletteGenerator`, `ColourBlender`, and
`ThemeColours` in particular are almost structurally identical: pick colours →
build an array of RGB steps → render one swatch row per step with copy
buttons).

## Data (`src/data/`)

There's one static data file, `named-colors.json` — a list of `{ name, rgb }`
entries used by `nearestNamedColor.ts` to suggest a human-readable name (e.g.
"steelblue") for whatever colour the user picked in the Palette Generator.
There is no other persisted data anywhere in the app — nothing is saved to a
server or even to local storage; every value lives only in React state and
resets on page reload.

## Tests

Everything is tested with **Vitest + React Testing Library**, running in a
`happy-dom` environment. The rule of thumb: **every source file has a
co-located `.test.ts`/`.test.tsx` file next to it**, and tests exercise the
real implementation — the project convention is _not_ to mock internal utils,
so a component test for, say, `SwatchCard` runs the real
`contrastRatio`/`convertColours` code underneath rather than stubbing it out.

Run the whole suite with `yarn test --run` (drop `--run` for watch mode).
`App.test.tsx` also runs `vitest-axe` accessibility checks against all five
routes, so an accessibility regression (like a skipped heading level or a
missing accessible name) will fail CI, not just look wrong visually.

On top of the unit tests, there's a small **Playwright** end-to-end suite in
`e2e/` — one spec per tool plus a cross-tool navigation spec — that drives a
real Chromium browser against `yarn dev` on port 3060. Run it locally with
`yarn test:e2e`. It's intentionally _not_ part of the pre-commit hook (booting
a browser is too slow for a hook) — it only runs in CI.

## Deployment

The app is built and deployed twice from the same source, to two different
places:

- **Netlify**, serving from the site root (`/`)
- **GitHub Pages**, serving from a subdirectory (`/colours/`), since it's one
  of several tools hosted under `craigmcn.com`

That's why `yarn build:netlify` runs Vite twice with different `--base` /
`--outDir` flags — same code, two output bundles with different asset paths.
`index.html` uses Vite's `%BASE_URL%` template variable plus a small redirect
script so that a hard refresh on a route like `/colours/opacity` still resolves
correctly under either deployment.

CI (`.github/workflows/test.yml`) runs on every push to `main` and every PR:
format check → unit tests → Playwright e2e. Merging to `main` requires a
review from the repo's one code owner; there's no separate deploy step in CI —
Netlify and GitHub Pages build from the repository directly.

## A few conventions worth knowing up front

- **Spelling**: "colour" (British) is used in UI text and tool names (e.g. the
  `ColourBlender` folder); "color" (American) is used in code that follows a
  React/CSS naming convention (e.g. `ColorInput`, `useColor`, `RGB` type). This
  split is intentional, not inconsistent.
- **Heading hierarchy matters here** — it's checked by the axe accessibility
  tests. `Layout` renders the site's one `<h1>` ("Colours"); each page also
  renders its own `<h1>` (the page title); anything nested inside a page (like
  a card title) has to step down one level at a time, never skipping from
  `h1` straight to `h3`.
- **Commit messages** follow `type(scope): description` (`feat`, `fix`,
  `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`,
  `revert`), enforced by a commit-msg hook.
