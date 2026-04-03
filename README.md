# Colours

A set of tools for working with colours on the web.

[![Netlify Status](https://api.netlify.com/api/v1/badges/2078914d-df15-4326-8b0f-b7d5580e295e/deploy-status)](https://app.netlify.com/sites/priceless-payne-88b1ed/deploys)

Enter a colour in hex (`#ff0000`), RGB (`rgb(255, 0, 0)`), or HSL (`hsl(0, 100%, 50%)`) format and the app will convert it, calculate contrast ratios, blend colours together, and more.

---

## Pages

### Contrast Checker

The main tool. It helps you check whether your text and link colours are readable against a background — which is a requirement under the Web Content Accessibility Guidelines (WCAG).

**See the [Contrast Checker section](#contrast-checker-in-depth) below for a full explanation.**

---

### Opacity Calculator

Enter a foreground colour, a background colour, and an opacity level (0–100%) and this tool shows you the solid colour that a semi-transparent foreground would actually look like on screen. You can also work backwards: type in a result colour and the tool will calculate what opacity would produce it.

---

### Colour Blender

Enter a start colour and an end colour and choose how many steps you want. The tool produces a smooth gradient of in-between colours. You can copy any colour in the list as a HEX, RGB, or HSL value.

---

### Palette Generator

Enter a base colour (plus optional light and dark endpoint colours) and the tool builds an 11-step palette — similar to the colour scales used in design systems like Tailwind or Material Design. It also outputs the palette as CSS custom properties so you can paste them straight into your stylesheet.

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

## Colour formats

| Format | Example | Notes |
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
