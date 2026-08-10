import type { RGB } from "../types/colour";
import { rgb2Hsl, hsl2Rgb } from "./convertColours";

export type ThemeRole =
  | "primary"
  | "secondary"
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

export type ThemePalette = Record<ThemeRole, RGB>;

export const THEME_ROLES: ThemeRole[] = [
  "primary",
  "secondary",
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
// are used instead — unlike "light"/"dark" above, which intentionally keep the
// brand's own hue.
const A11Y_NEUTRALS = {
  white: 98,
  grayLight: 82,
  grayDark: 35,
  black: 10,
} as const;

// Fixed hue anchors matching Bootstrap's default status-colour hues. Saturation
// and lightness stay tied to the input colour (clamped to a band that keeps each
// role legible), so the generated palette reads as "your brand's success/danger/
// warning/info", not a generic Bootstrap theme dropped on top of it.
const SEMANTIC_HUES: Record<"success" | "danger" | "warning" | "info", number> =
  {
    success: 134,
    danger: 354,
    warning: 45,
    info: 190,
  };

// Given a single brand colour, derives a full Bootstrap-style "theme colors"
// palette by keeping the brand colour's hue for the neutral-leaning roles
// (secondary/light/dark) and rotating to fixed semantic hues for the status
// roles, carrying over the brand's own saturation/lightness (clamped per role)
// throughout. white/grayLight/grayDark/black are fixed a11y-recommended
// neutrals — see A11Y_NEUTRALS — and don't depend on the brand colour at all.
export const generateThemePalette = (primary: RGB): ThemePalette => {
  const [hue, satStr, lightStr] = rgb2Hsl(primary);
  const saturation = parseInt(satStr);
  const lightness = parseInt(lightStr);

  return {
    primary,
    secondary: buildColor(hue, saturation * 0.25, clamp(lightness, 35, 55)),
    success: buildColor(
      SEMANTIC_HUES.success,
      clamp(saturation, 45, 80),
      clamp(lightness, 30, 45),
    ),
    danger: buildColor(
      SEMANTIC_HUES.danger,
      clamp(saturation, 45, 80),
      clamp(lightness, 40, 55),
    ),
    warning: buildColor(
      SEMANTIC_HUES.warning,
      clamp(saturation, 70, 100),
      clamp(lightness, 45, 60),
    ),
    info: buildColor(
      SEMANTIC_HUES.info,
      clamp(saturation, 45, 85),
      clamp(lightness, 40, 60),
    ),
    light: buildColor(hue, saturation * 0.3, 96),
    dark: buildColor(hue, saturation * 0.6, 18),
    white: buildColor(0, 0, A11Y_NEUTRALS.white),
    grayLight: buildColor(0, 0, A11Y_NEUTRALS.grayLight),
    grayDark: buildColor(0, 0, A11Y_NEUTRALS.grayDark),
    black: buildColor(0, 0, A11Y_NEUTRALS.black),
  };
};
