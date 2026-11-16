import type { RGB } from "../types/colour";
import { rgb2Hex } from "./convertColours";
import { PALETTE_STEPS } from "./paletteScale";
import { roleToKebab, THEME_ROLES, type ThemePalette } from "./themePalette";

export interface CssToken {
  name: string;
  value: string;
}

export const toCssIdent = (s: string, fallback: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") || fallback;

// Formatters take the raw user-typed prefix/name so every consumer (pages now,
// a CLI later) sanitises it the same way, with the same per-tool fallback.
export const themeTokens = (
  palette: ThemePalette,
  prefix: string,
): CssToken[] => {
  const ident = toCssIdent(prefix, "theme");
  return THEME_ROLES.map((role) => ({
    name: `--${ident}-${roleToKebab(role)}`,
    value: rgb2Hex(palette[role], true),
  }));
};

export const paletteTokens = (scale: RGB[], name: string): CssToken[] => {
  const ident = toCssIdent(name, "colour");
  return scale.map((rgb, index) => ({
    name: `--${ident}-${PALETTE_STEPS[index]}`,
    value: rgb2Hex(rgb, true),
  }));
};

export const cssDeclarations = (tokens: CssToken[]): string[] =>
  tokens.map(({ name, value }) => `${name}: ${value};`);
