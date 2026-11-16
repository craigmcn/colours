import type { Hex, RGB } from "../types/colour";
import { hex2Str, rgb2Hex } from "./convertColours";
import { PALETTE_ALGORITHM_VERSION, PALETTE_STEPS } from "./paletteScale";
import {
  roleToKebab,
  THEME_ALGORITHM_VERSION,
  THEME_ROLES,
  type ThemeMode,
  type ThemePalette,
} from "./themePalette";
import { writePaletteParams, writeThemeParams } from "./toolParams";

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
  // Step names are positional, so a scale of the wrong length would silently
  // mislabel tokens (or emit "--x-undefined") rather than fail.
  if (scale.length !== PALETTE_STEPS.length)
    throw new RangeError(
      `paletteTokens expects ${PALETTE_STEPS.length} colours, got ${scale.length}`,
    );
  const ident = toCssIdent(name, "colour");
  return scale.map((rgb, index) => ({
    name: `--${ident}-${PALETTE_STEPS[index]}`,
    value: rgb2Hex(rgb, true),
  }));
};

export const cssDeclarations = (tokens: CssToken[]): string[] =>
  tokens.map(({ name, value }) => `${name}: ${value};`);

// The header only ever contains sanitised idents, hex and URL-encoded params,
// so user input can't close the comment early with "*/".
const recipeComment = (
  tool: string,
  version: number,
  inputs: [string, string][],
  url: string,
): string =>
  `/* colours ${tool} v${version}: ${inputs
    .map(([label, value]) => `${label} ${value}`)
    .join(", ")}\n   ${url} */`;

// appUrl is the app's root with a trailing slash, e.g. "https://host/colours/".
export const themeRecipe = ({
  brand,
  mode,
  prefix,
  appUrl,
}: {
  brand: Hex;
  mode: ThemeMode;
  prefix: string;
  appUrl: string;
}): string => {
  const ident = toCssIdent(prefix, "theme");
  const params = writeThemeParams(
    { brand, mode, prefix: ident },
    { includeDefaults: true },
  );
  return recipeComment(
    "theme",
    THEME_ALGORITHM_VERSION,
    [
      ["brand", hex2Str(brand)],
      ["mode", mode],
      ["prefix", ident],
    ],
    `${appUrl}theme?${params}`,
  );
};

export const paletteRecipe = ({
  base,
  light,
  dark,
  name,
  appUrl,
}: {
  base: Hex;
  light: Hex;
  dark: Hex;
  name: string;
  appUrl: string;
}): string => {
  const ident = toCssIdent(name, "colour");
  const params = writePaletteParams(
    { base, light, dark, name: ident },
    { includeDefaults: true },
  );
  return recipeComment(
    "palette",
    PALETTE_ALGORITHM_VERSION,
    [
      ["base", hex2Str(base)],
      ["light", hex2Str(light)],
      ["dark", hex2Str(dark)],
      ["name", ident],
    ],
    `${appUrl}palette?${params}`,
  );
};
