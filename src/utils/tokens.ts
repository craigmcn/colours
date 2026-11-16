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

// The header only ever contains sanitised idents, hex, URL-encoded params and
// a normalised appUrl, so no input can close the comment early with "*/".
const recipeComment = (
  tool: string,
  version: number,
  inputs: [string, string][],
  url: string,
): string =>
  `/* colours ${tool} v${version}: ${inputs
    .map(([label, value]) => `${label} ${value}`)
    .join(", ")}\n   ${url} */`;

// appUrl is the app's root, e.g. "https://host/colours/". The CLI takes it
// from the user, so line breaks are dropped and "*/" is percent-encoded (the
// URL still resolves) to keep the header comment intact. The slash is added
// when missing rather than resolved with new URL(), which would drop a
// slash-less subpath ("https://host/colours" + "theme" → "https://host/theme").
const normaliseAppUrl = (url: string): string => {
  const safe = url.replace(/[\r\n]/g, "").replace(/\*\//g, "*%2F");
  return safe.endsWith("/") ? safe : `${safe}/`;
};

// Full reproducible links: every input is written, defaults included, so the
// link survives a future change of defaults.
export const themeRecipeUrl = ({
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
  const params = writeThemeParams(
    { brand, mode, prefix: toCssIdent(prefix, "theme") },
    { includeDefaults: true },
  );
  return `${normaliseAppUrl(appUrl)}theme?${params}`;
};

export const paletteRecipeUrl = ({
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
  const params = writePaletteParams(
    { base, light, dark, name: toCssIdent(name, "colour") },
    { includeDefaults: true },
  );
  return `${normaliseAppUrl(appUrl)}palette?${params}`;
};

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
  return recipeComment(
    "theme",
    THEME_ALGORITHM_VERSION,
    [
      ["brand", hex2Str(brand)],
      ["mode", mode],
      ["prefix", ident],
    ],
    themeRecipeUrl({ brand, mode, prefix, appUrl }),
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
  return recipeComment(
    "palette",
    PALETTE_ALGORITHM_VERSION,
    [
      ["base", hex2Str(base)],
      ["light", hex2Str(light)],
      ["dark", hex2Str(dark)],
      ["name", ident],
    ],
    paletteRecipeUrl({ base, light, dark, name, appUrl }),
  );
};
