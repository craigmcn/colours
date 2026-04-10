# Colours

A set of tools for working with colours on the web.

[![Netlify Status](https://api.netlify.com/api/v1/badges/2078914d-df15-4326-8b0f-b7d5580e295e/deploy-status)](https://app.netlify.com/sites/priceless-payne-88b1ed/deploys)
[![Test](https://github.com/craigmcn/colours/actions/workflows/test.yml/badge.svg)](https://github.com/craigmcn/colours/actions/workflows/test.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node](https://img.shields.io/badge/node-v24-brightgreen)](https://nodejs.org)

Enter a colour in hex (`#ff0000`), RGB (`rgb(255, 0, 0)`), or HSL (`hsl(0, 100%, 50%)`) format and the app will convert it, calculate contrast ratios, blend colours together, and more.

---

## Pages

### Contrast Checker

The main tool. It helps you check whether your text and link colours are readable against a background — which is a requirement under the Web Content Accessibility Guidelines (WCAG).

**See the [Contrast Checker section](#contrast-checker-in-depth) below for a full explanation.**

---

### Opacity Calculator

Enter a foreground colour, a background colour, and an opacity level (0–100%) and this tool shows you the solid colour that a semi-transparent foreground would actually look like on screen. You can also work backwards: type in a result colour and the tool will calculate what opacity would produce it.

**See the [Opacity Calculator section](#opacity-calculator-in-depth) below for a full explanation.**

---

### Colour Blender

Enter a start colour and an end colour and choose how many steps you want. The tool produces a smooth gradient of in-between colours. You can copy any colour in the list as a HEX, RGB, or HSL value.

**See the [Colour Blender section](#colour-blender-in-depth) below for a full explanation.**

---

### Palette Generator

Enter a base colour (plus optional light and dark endpoint colours) and the tool builds a 12-step palette — similar to the colour scales used in design systems like Tailwind or Material Design. It also outputs the palette as CSS custom properties so you can paste them straight into your stylesheet.

**See the [Palette Generator section](#palette-generator-in-depth) below for a full explanation.**

---

## Contrast Checker — in depth

### What is contrast ratio?

When you put text on a coloured background, some combinations are easy to read and some are very hard. The difference between the brightness of the text and the brightness of the background is called the **contrast ratio**. It is expressed as a number from 1:1 (no difference at all — invisible text) to 21:1 (pure black on pure white — the maximum).

### What is WCAG?

The **Web Content Accessibility Guidelines** (WCAG) are a set of rules published by the World Wide Web Consortium (W3C) that describe how to make websites usable by people with disabilities, including those with low vision or colour blindness. Two compliance levels are commonly tested:

| Level | Body text | Large text (18pt+ or 14pt bold) |
|-------|-----------|----------------------------------|
| **AA** | 4.5:1 minimum | 3:1 minimum |
| **AAA** | 7:1 minimum | 4.5:1 minimum |

Meeting **AA** is considered the standard requirement. **AAA** is the stricter gold standard.

### How to use the Contrast Checker

The page has three colour cards: **Links**, **Text**, and **Background**.

1. **Type a colour** into any card's text box. You can use a hex code (`#3a86ff`), an `rgb()` value, or an `hsl()` value.
2. The card shows two colour swatches side by side:
   - The **left swatch** (source) is frozen — it always shows the colour you typed.
   - The **right swatch** (compare) updates as you drag the sliders.
3. **Drag the saturation or lightness sliders** to explore variations of that colour. The contrast ratios update in real time, but your original typed colour is preserved in the left swatch and the input box.
4. The three **contrast result panels** below show the calculated ratio for each colour pair:
   - **Link to Body text** — checked against WCAG A (3:1). If the link colour is too close to the body text colour, users cannot tell them apart. A warning message suggests using an underline or other non-colour indicator as a backup.
   - **Link to Background** — checked against WCAG AA (4.5:1) and AAA (7:1).
   - **Body text to Background** — checked against WCAG AA (4.5:1) and AAA (7:1).
5. The **colour preview** in the middle of the page shows how your chosen colours look with real foreground text, body text, and a background — so you can get a visual impression alongside the numbers.

### WCAG AA and WCAG AAA buttons

These two buttons save you time when you need to find a compliant colour combination. Click either button and the tool will automatically calculate the darkest or lightest version of the current background colour that passes that WCAG level, and fill in the **Text** and **Link** inputs for you. The result meets the chosen WCAG threshold against the background.

### Copy buttons

Each colour card has HEX, RGB, and HSL copy buttons. Click one to copy that format to your clipboard, ready to paste into your code or design tool.

---

## Colour Blender — in depth

### What does the Colour Blender do?

The Colour Blender takes two colours — a **Start** and an **End** — and creates a smooth series of in-between colours. Each colour is an equal step along the way from start to finish, like rungs on a ladder. This is useful when you need a set of colours that fade gradually from one shade to another, such as a chart colour scale, a gradient background, or a custom tint ramp.

### How the blending works

The tool blends in the **RGB** colour space. For each step, it adds an equal fraction of the difference in red, green, and blue between the two colours. For example, blending black (`rgb(0, 0, 0)`) to white (`rgb(255, 255, 255)`) in 2 steps gives you one midpoint at `rgb(128, 128, 128)` — a medium grey.

### How to use the Colour Blender

1. **Type a Start colour** — the colour at the beginning of the blend. You can use a hex code (`#005b99`), an `rgb()` value, or an `hsl()` value.
2. **Type an End colour** — the colour at the end of the blend. Same format options as Start.
3. **Set the number of Steps** — how many colours you want *between* the start and end. The total number of swatches shown is always steps + 1 (because the start and end are included). The default is 5 steps, giving you 6 swatches.
4. The colour swatches update instantly as you type. Each swatch shows the colour's RGB, HSL, and hex values.
5. Click **HEX**, **RGB**, or **HSL** below any swatch to copy that colour value to your clipboard.

### Steps examples

| Steps | Total swatches | What you get |
|-------|---------------|--------------|
| 1     | 2             | Start and End only — no blending |
| 2     | 3             | Start, one midpoint, End |
| 5     | 6             | Start, four intermediate colours, End |
| 10    | 11            | A fine-grained scale with 9 intermediates |

### Copy buttons

Each swatch has three copy buttons:

- **HEX** — copies the 6-character hex code (e.g. `#669dc2`)
- **RGB** — copies the `rgb()` value (e.g. `rgb(102, 157, 194)`)
- **HSL** — copies the `hsl()` value (e.g. `hsl(204, 44%, 58%)`)

---

## Palette Generator — in depth

### What is a colour palette?

A colour palette (or colour scale) is a set of shades of a single colour, ranging from very light to very dark. Design systems use palettes to give you a consistent set of options for backgrounds, text, borders, and hover states — instead of picking random shades each time. Tailwind CSS, for example, names its steps 50, 100, 200 … 900. This tool uses a similar scale that also includes a 0 step (the lightest possible) and a 1000 step (the darkest).

### How the palette is built

The generator divides the range from your **Light** endpoint to your **Base** colour, and then from your **Base** colour to your **Dark** endpoint, blending linearly between them. This gives you 12 swatches:

| Step | Description |
|------|-------------|
| 0    | Equal to the Light colour |
| 50   | A very subtle tint — 5% of the way from Light to Base |
| 100  | 20% of the way from Light to Base |
| 200  | 40% |
| 300  | 60% |
| 400  | 80% |
| 500  | Equal to the Base colour |
| 600  | 20% of the way from Base to Dark |
| 700  | 40% |
| 800  | 60% |
| 900  | 80% |
| 1000 | Equal to the Dark colour |

The 50 step is deliberately compressed (only 5% of the Light-to-Base range) so you always have a near-white tint available even when your base colour is fairly light.

### How to use the Palette Generator

1. **Type a Base colour** — this is the main colour of your palette (e.g. your brand blue). You can use hex, `rgb()`, or `hsl()`.
2. **Optionally change Light** — the lightest end of the scale. Defaults to white (`#ffffff`). Change this if you want a tinted light end (e.g. a very pale blue instead of pure white).
3. **Optionally change Dark** — the darkest end of the scale. Defaults to near-black (`#222222`). Change this to keep the dark end within a hue family rather than going to neutral grey.
4. **Optionally type a Name** — this becomes the prefix for all CSS custom property names (e.g. `brand` → `--brand-500`). If you leave it empty, the tool guesses the closest standard CSS colour name for the base (e.g. `cornflowerblue`, `tomato`).
5. The 12 swatches update instantly as you type. Each swatch shows its RGB, HSL, and hex values, plus HEX, RGB, and HSL copy buttons.
6. The **Custom properties** panel on the right shows all 12 variables ready to paste into a CSS `:root {}` block. Click **Copy** to copy the whole block at once.

### CSS custom properties output

The output looks like this (using `brand` as the name and a blue base):

```css
--brand-0: #ffffff
--brand-50: #f0f4ff
--brand-100: #c9d8fe
--brand-200: #93b1fd
--brand-300: #5d8afc
--brand-400: #2763fb
--brand-500: #003cfa
--brand-600: #0031cf
--brand-700: #0026a4
--brand-800: #001b79
--brand-900: #00104e
--brand-1000: #222222
```

Paste this inside a `:root {}` rule in your stylesheet, then use `var(--brand-500)` anywhere in your CSS.

---

## Opacity Calculator — in depth

### What is opacity?

Opacity describes how see-through something is. At 0% opacity, a colour is completely invisible — only the background shows through. At 100% opacity, the colour is completely solid. Anywhere in between, the two colours blend together on screen. The blended colour you actually see is called the **result**.

Browsers calculate the result using this formula for each colour channel (red, green, and blue):

```
result = (1 − opacity) × background + opacity × foreground
```

So at 25% opacity, 75% of the background colour and 25% of the foreground colour mix together to produce the result.

### The four-way solver

Most tools only let you go in one direction: pick a foreground, a background, and an opacity, and see the result. This tool lets you solve for **any one of the four values** when you know the other three.

Use the **Solve for** button group to choose which value you want to calculate:

| Solve for | You provide | The tool calculates |
|-----------|-------------|---------------------|
| **Result** (default) | Foreground, Background, Opacity | The blended colour |
| **Opacity** | Foreground, Background, Result | What opacity produces that result |
| **Foreground** | Background, Result, Opacity | What foreground colour was used |
| **Background** | Foreground, Result, Opacity | What background colour was used |

The solved field is shown as disabled (greyed out) and updates automatically. The other three fields remain editable.

### How to use the Opacity Calculator

**Forward mode (solve for Result):**
1. Type your **Foreground** colour — the colour of the element with opacity applied.
2. Type your **Background** colour — the colour behind it.
3. Drag the **Opacity** slider to the percentage you want.
4. The **Result** field and the centre swatch show the solid colour that would appear on screen.

**Reverse mode (solve for Opacity):**
1. Click **Opacity** in the Solve for group.
2. Type the **Foreground** and **Background** colours.
3. Type the target **Result** colour — the solid colour you want to end up with.
4. The **Opacity** slider shows the percentage that produces that result.

**Solve for Foreground or Background** works the same way — select the field you want to find, fill in the other three, and the answer appears immediately.

### Edge cases

- **Solve for Foreground at 0% opacity** — the foreground has no effect on the result at all, so there is no single answer. A warning is shown.
- **Solve for Background at 100% opacity** — the background is completely hidden, so it cannot be recovered from the result. A warning is shown.
- When the result colour cannot be achieved exactly (e.g. the typed result is outside the mathematically possible range for the given foreground and background), the tool clamps the output to the nearest valid value.

### Colour swatches

Three swatches across the top show the current **Foreground**, **Result**, and **Background** colours at all times, updating live as you make changes. Use the HEX, RGB, and HSL copy buttons below the swatches to copy the Result colour in whichever format you need.

---

## Colour formats
|--------|---------|-------|
| Hex | `#3a86ff` or `#38f` | The most common format in CSS. The shorthand (`#38f`) is expanded automatically. |
| RGB | `rgb(58, 134, 255)` | Red, green, and blue values from 0 to 255. |
| HSL | `hsl(217, 100%, 61%)` | Hue (0–360°), saturation (0–100%), and lightness (0–100%). Often easier to reason about when adjusting a colour. |

---

## Development

```bash
npm install
npm run dev      # start local dev server at http://localhost:3060
npm run build    # production build
npm run test     # run unit tests (Vitest)
```
