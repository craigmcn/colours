import type { Hex } from "../types/colour";
import type { ThemeMode } from "./themePalette";

// Colours travel as bare hex (no "#", which would need escaping as %23) so a
// URL like /theme?brand=3366cc is easy to hand-write in downstream docs.
const HEX_PARAM = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

export const readColourParam = (value: string | null): string => {
  const match = value?.trim().match(HEX_PARAM);
  return match ? `#${match[1].toLowerCase()}` : "";
};

export const THEME_DEFAULT_PREFIX = "theme";

export interface ThemeParams {
  brand: string;
  mode: ThemeMode;
  prefix: string;
}

export const readThemeParams = (params: URLSearchParams): ThemeParams => ({
  brand: readColourParam(params.get("brand")),
  mode: params.get("mode") === "dark" ? "dark" : "light",
  prefix: params.get("prefix") ?? THEME_DEFAULT_PREFIX,
});

// Defaults are omitted so an untouched page keeps a clean URL. A colour is
// only written once the user has entered one (hex is undefined otherwise).
// includeDefaults writes every value, for links that must survive a future
// change of defaults (the copied-output recipe header).
export const writeThemeParams = (
  {
    brand,
    mode,
    prefix,
  }: {
    brand?: Hex;
    mode: ThemeMode;
    prefix: string;
  },
  { includeDefaults = false } = {},
): URLSearchParams => {
  const params = new URLSearchParams();
  if (brand) params.set("brand", brand.join(""));
  if (includeDefaults || mode !== "light") params.set("mode", mode);
  if (includeDefaults || prefix !== THEME_DEFAULT_PREFIX)
    params.set("prefix", prefix);
  return params;
};

export interface PaletteParams {
  base: string;
  light: string;
  dark: string;
  name: string;
}

export const readPaletteParams = (params: URLSearchParams): PaletteParams => ({
  base: readColourParam(params.get("base")),
  light: readColourParam(params.get("light")),
  dark: readColourParam(params.get("dark")),
  name: params.get("name") ?? "",
});

export const writePaletteParams = (
  {
    base,
    light,
    dark,
    name,
  }: {
    base?: Hex;
    light?: Hex;
    dark?: Hex;
    name: string;
  },
  { includeDefaults = false } = {},
): URLSearchParams => {
  const params = new URLSearchParams();
  if (base) params.set("base", base.join(""));
  if (light) params.set("light", light.join(""));
  if (dark) params.set("dark", dark.join(""));
  if (includeDefaults || name) params.set("name", name);
  return params;
};
