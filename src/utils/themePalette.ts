import type { RGB } from "../types/colour";
import { rgb2Hsl, hsl2Rgb } from "./convertColours";
import { contrastRatio } from "./contrastRatio";

export type ThemeRole =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "white"
  | "grayLight"
  | "grayDark"
  | "black";

export type ThemeMode = "light" | "dark";

export type ThemePalette = Record<ThemeRole, RGB>;

export const THEME_ROLES: ThemeRole[] = [
  "primary",
  "secondary",
  "accent",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
  "white",
  "grayLight",
  "grayDark",
  "black",
];

// CSS custom property names use kebab-case, e.g. "grayLight" → "gray-light".
export const roleToKebab = (role: ThemeRole): string =>
  role.replace(/([A-Z])/g, "-$1").toLowerCase();

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const buildColor = (hue: number, saturation: number, lightness: number): RGB =>
  hsl2Rgb([hue, clamp(saturation, 0, 100), clamp(lightness, 0, 100)]);

// Fixed, brand-independent neutrals recommended for web accessibility: pure
// #fff/#000 read as harsh and can cause eye strain (halation) at high contrast,
// so these off-white/off-black tones (plus two mid greys for a usable scale)
// are used instead. Like light/dark, white/black and grayLight/grayDark swap
// between modes, so e.g. --theme-white stays "the neutral you'd reach for on
// this mode's background" rather than always resolving to the same hex.
const A11Y_NEUTRALS = {
  white: 98,
  grayLight: 82,
  grayDark: 35,
  black: 10,
} as const;

// Fixed hue anchors matching Bootstrap's default status-colour hues.
const SEMANTIC_HUES: Record<"success" | "danger" | "warning" | "info", number> =
  {
    success: 134,
    danger: 354,
    warning: 45,
    info: 190,
  };

interface SaturationLightnessBand {
  minSat: number;
  maxSat: number;
  minLight: number;
  maxLight: number;
}

// Per-mode legibility bands for the status roles. Saturation/lightness stay
// tied to the brand colour (clamped into these bands), so the palette reads
// as "your brand's success/danger/warning/info" rather than a generic theme —
// but dark mode's band sits higher (~55–70% lightness) than light mode's
// (~30–60%), because the same colours read as muddy/low-contrast against a
// near-black background unless lightened.
const STATUS_BANDS: Record<
  ThemeMode,
  Record<"success" | "danger" | "warning" | "info", SaturationLightnessBand>
> = {
  light: {
    success: { minSat: 45, maxSat: 80, minLight: 30, maxLight: 45 },
    danger: { minSat: 45, maxSat: 80, minLight: 40, maxLight: 55 },
    warning: { minSat: 70, maxSat: 100, minLight: 45, maxLight: 60 },
    info: { minSat: 45, maxSat: 85, minLight: 40, maxLight: 60 },
  },
  dark: {
    success: { minSat: 40, maxSat: 75, minLight: 55, maxLight: 70 },
    danger: { minSat: 40, maxSat: 75, minLight: 55, maxLight: 70 },
    warning: { minSat: 65, maxSat: 100, minLight: 55, maxLight: 70 },
    info: { minSat: 40, maxSat: 80, minLight: 55, maxLight: 70 },
  },
};

const SECONDARY_LIGHTNESS_BAND: Record<ThemeMode, [number, number]> = {
  light: [35, 55],
  dark: [60, 75],
};

// Secondary shares primary's hue (just desaturated), so if primary's own
// lightness already falls inside SECONDARY_LIGHTNESS_BAND, clamping alone
// leaves the two nearly indistinguishable — e.g. primary #677fa3 (l=52%)
// produces secondary #7d838c, a contrast ratio of only ~1.07:1. Secondary is
// meant for less prominent, supporting elements that shouldn't compete with
// primary, so its lightness is walked away from primary's actual rendered
// lightness (lighter if primary is dark-ish, darker otherwise) until it
// clears this minimum — a "clearly distinct swatch" bar, not the 4.5:1 WCAG
// text-contrast bar, since these are two UI accents, not text-on-background.
const MIN_SECONDARY_CONTRAST = 1.6;
const SECONDARY_LIGHTNESS_SEARCH_BOUNDS: [number, number] = [10, 92];

const ensureSecondaryContrast = (
  hue: number,
  saturation: number,
  startLightness: number,
  against: RGB,
): RGB => {
  const [boundMin, boundMax] = SECONDARY_LIGHTNESS_SEARCH_BOUNDS;
  const againstLightness = parseInt(rgb2Hsl(against)[2]);
  const direction = againstLightness < 50 ? 1 : -1;

  let lightness = startLightness;
  let candidate = buildColor(hue, saturation, lightness);
  while (
    contrastRatio(against, candidate) < MIN_SECONDARY_CONTRAST &&
    lightness > boundMin &&
    lightness < boundMax
  ) {
    lightness = clamp(lightness + direction, boundMin, boundMax);
    candidate = buildColor(hue, saturation, lightness);
  }
  return candidate;
};

// In dark mode, even the primary brand colour itself usually needs lightening:
// a dark, highly saturated brand blue like #005b99 (hue 204°, l≈30%) reads
// fine on a white background but is nearly invisible against a near-black
// one. Light mode leaves primary untouched (it *is* the brand colour), but
// dark mode re-bands it the same way as the other status roles. Accent (see
// below) reuses this same band, since it's equally a brand-defining colour
// that needs to stay legible in dark mode.
const DARK_PRIMARY_BAND: SaturationLightnessBand = {
  minSat: 50,
  maxSat: 100,
  minLight: 55,
  maxLight: 70,
};

// Given a single brand colour, derives a full Bootstrap-style "theme colors"
// palette for the given mode.
//
// - primary is the brand colour itself in light mode; in dark mode (and for
//   accent, in both modes' dark variant) it's re-banded via DARK_PRIMARY_BAND
//   so it stays legible against a near-black background.
// - accent sits on the opposite side of the colour wheel from primary (hue
//   +180°) for a standout colour that reads as clearly distinct from primary
//   by hue alone, e.g. for a call-to-action that shouldn't be mistaken for a
//   primary-coloured element.
// - secondary keeps primary's hue but is desaturated and pushed to a
//   guaranteed-distinguishable lightness (see ensureSecondaryContrast) so it
//   reads as "supporting", not as a near-duplicate of primary.
// - success/danger/warning/info keep the brand's hue/saturation but re-band
//   their lightness per mode (see STATUS_BANDS).
// - light/dark are brand-tinted "surface" endpoints and invert between modes
//   — light mode's near-white "light" surface becomes dark mode's near-black
//   one, and vice versa.
// - white/grayLight/grayDark/black are fixed a11y neutrals (see
//   A11Y_NEUTRALS) that don't depend on the brand colour, but — like
//   light/dark — swap ends between modes.
const buildPalette = (primary: RGB, mode: ThemeMode): ThemePalette => {
  const [hue, satStr, lightStr] = rgb2Hsl(primary);
  const saturation = parseInt(satStr);
  const lightness = parseInt(lightStr);
  const bands = STATUS_BANDS[mode];
  const [secMin, secMax] = SECONDARY_LIGHTNESS_BAND[mode];
  const complementHue = (hue + 180) % 360;

  const nearWhiteSurface = buildColor(hue, saturation * 0.3, 96);
  const nearBlackSurface = buildColor(hue, saturation * 0.6, 18);

  const white = buildColor(0, 0, A11Y_NEUTRALS.white);
  const black = buildColor(0, 0, A11Y_NEUTRALS.black);
  const grayLight = buildColor(0, 0, A11Y_NEUTRALS.grayLight);
  const grayDark = buildColor(0, 0, A11Y_NEUTRALS.grayDark);

  const finalPrimary =
    mode === "light"
      ? primary
      : buildColor(
          hue,
          clamp(saturation, DARK_PRIMARY_BAND.minSat, DARK_PRIMARY_BAND.maxSat),
          clamp(
            lightness,
            DARK_PRIMARY_BAND.minLight,
            DARK_PRIMARY_BAND.maxLight,
          ),
        );

  const finalAccent =
    mode === "light"
      ? buildColor(complementHue, saturation, lightness)
      : buildColor(
          complementHue,
          clamp(saturation, DARK_PRIMARY_BAND.minSat, DARK_PRIMARY_BAND.maxSat),
          clamp(
            lightness,
            DARK_PRIMARY_BAND.minLight,
            DARK_PRIMARY_BAND.maxLight,
          ),
        );

  const finalSecondary = ensureSecondaryContrast(
    hue,
    saturation * 0.25,
    clamp(lightness, secMin, secMax),
    finalPrimary,
  );

  return {
    primary: finalPrimary,
    secondary: finalSecondary,
    accent: finalAccent,
    success: buildColor(
      SEMANTIC_HUES.success,
      clamp(saturation, bands.success.minSat, bands.success.maxSat),
      clamp(lightness, bands.success.minLight, bands.success.maxLight),
    ),
    danger: buildColor(
      SEMANTIC_HUES.danger,
      clamp(saturation, bands.danger.minSat, bands.danger.maxSat),
      clamp(lightness, bands.danger.minLight, bands.danger.maxLight),
    ),
    warning: buildColor(
      SEMANTIC_HUES.warning,
      clamp(saturation, bands.warning.minSat, bands.warning.maxSat),
      clamp(lightness, bands.warning.minLight, bands.warning.maxLight),
    ),
    info: buildColor(
      SEMANTIC_HUES.info,
      clamp(saturation, bands.info.minSat, bands.info.maxSat),
      clamp(lightness, bands.info.minLight, bands.info.maxLight),
    ),
    light: mode === "light" ? nearWhiteSurface : nearBlackSurface,
    dark: mode === "light" ? nearBlackSurface : nearWhiteSurface,
    white: mode === "light" ? white : black,
    grayLight: mode === "light" ? grayLight : grayDark,
    grayDark: mode === "light" ? grayDark : grayLight,
    black: mode === "light" ? black : white,
  };
};

export const generateThemePalette = (primary: RGB): ThemePalette =>
  buildPalette(primary, "light");

export const generateDarkThemePalette = (primary: RGB): ThemePalette =>
  buildPalette(primary, "dark");
