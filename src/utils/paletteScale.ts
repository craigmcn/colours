import type { RGB } from "../types/colour";
import { calculateColorArray } from "./calculate";

// Step names for the 12 colours buildPaletteScale returns, in order. 50 is an
// extra near-light tint squeezed between 0 and 100, Tailwind-style.
export const PALETTE_STEPS = [
  0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
] as const;

// Bump whenever the same input produces a different scale; see
// THEME_ALGORITHM_VERSION and the golden test in paletteScale.test.ts.
export const PALETTE_ALGORITHM_VERSION = 1;

// Shared by the page and the CLI so both fill unspecified inputs the same way.
export const PALETTE_DEFAULTS = {
  base: "#808080",
  light: "#ffffff",
  dark: "#222222",
} as const;

export type PaletteStep = (typeof PALETTE_STEPS)[number];

export const buildPaletteScale = (base: RGB, light: RGB, dark: RGB): RGB[] => {
  const result: RGB[] = [];
  for (let i = 0; i < 5; i++)
    result.push(calculateColorArray(i / 5, light, base));
  for (let i = 0; i < 6; i++)
    result.push(calculateColorArray(i / 5, base, dark));
  result.splice(1, 0, calculateColorArray(0.05, light, base));
  return result;
};
