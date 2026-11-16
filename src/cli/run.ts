import type { Hex } from "../types/colour";
import { hex2Rgb, hex2Str } from "../utils/convertColours";
import { nearestNamedColor } from "../utils/nearestNamedColor";
import {
  buildPaletteScale,
  PALETTE_ALGORITHM_VERSION,
  PALETTE_DEFAULTS,
} from "../utils/paletteScale";
import { splitHex } from "../utils/parseValues";
import {
  generateDarkThemePalette,
  generateThemePalette,
  THEME_ALGORITHM_VERSION,
  type ThemeMode,
} from "../utils/themePalette";
import { readColourParam } from "../utils/toolParams";
import {
  cssDeclarations,
  paletteRecipe,
  paletteRecipeUrl,
  paletteTokens,
  themeRecipe,
  themeRecipeUrl,
  themeTokens,
  toCssIdent,
  type CssToken,
} from "../utils/tokens";

export interface CliResult {
  stdout: string;
  stderr: string;
  code: number;
}

// Where the recipe header's link points by default; --app-url overrides it.
export const DEFAULT_APP_URL = "https://www.craigmcn.com/colours/";

export const USAGE = `Usage:
  colours-tokens theme --brand <hex> [--mode light|dark] [--prefix <name>]
  colours-tokens palette --base <hex> [--light <hex>] [--dark <hex>] [--name <name>]

Options (both commands):
  --format css|json   Output format (default: css)
  --app-url <url>     Base URL for the recipe link (default: ${DEFAULT_APP_URL})
  -h, --help          Show this help
  -v, --version       Show the algorithm versions

Colours are hex, with or without "#" (3 or 6 digits).
CSS output matches the app's Copy button: a recipe comment, then one custom
property per line.
`;

const COMMON_FLAGS = ["format", "app-url"];
const COMMAND_FLAGS: Record<string, string[]> = {
  theme: ["brand", "mode", "prefix", ...COMMON_FLAGS],
  palette: ["base", "light", "dark", "name", ...COMMON_FLAGS],
};

const ok = (stdout: string): CliResult => ({ stdout, stderr: "", code: 0 });
const fail = (message: string): CliResult => ({
  stdout: "",
  stderr: `colours-tokens: ${message}\nRun "colours-tokens --help" for usage.\n`,
  code: 1,
});

type Parsed =
  | { flags: Record<string, string>; positionals: string[] }
  | { error: string };

// Hand-rolled rather than node:util parseArgs so this module stays free of
// Node APIs and can be unit-tested (and bundled) like the rest of src/.
const parseArgs = (argv: string[]): Parsed => {
  const flags: Record<string, string> = {};
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") flags.help = "true";
    else if (arg === "-v" || arg === "--version") flags.version = "true";
    else if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      const key = eq === -1 ? arg.slice(2) : arg.slice(2, eq);
      const value = eq === -1 ? argv[++i] : arg.slice(eq + 1);
      if (value === undefined || (eq === -1 && value.startsWith("--")))
        return { error: `--${key} needs a value` };
      flags[key] = value;
    } else if (arg.startsWith("-")) return { error: `unknown option ${arg}` };
    else positionals.push(arg);
  }
  return { flags, positionals };
};

const parseColour = (
  flag: string,
  value: string | undefined,
  fallback?: string,
): Hex | string => {
  if (value === undefined) {
    if (fallback === undefined) return `--${flag} is required`;
    return splitHex(fallback);
  }
  const hex = readColourParam(value);
  return hex ? splitHex(hex) : `--${flag} must be a hex colour, got "${value}"`;
};

// Rejects typos and non-web schemes early; the header escapes "*/" separately
// because new URL() happily keeps it in a path.
const isHttpUrl = (value: string): boolean => {
  if (/[\r\n]/.test(value)) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const isError = (value: Hex | string): value is string =>
  typeof value === "string";

const render = (
  format: string,
  header: string,
  tokens: CssToken[],
  json: Record<string, unknown>,
): string =>
  format === "json"
    ? `${JSON.stringify(
        {
          ...json,
          tokens: Object.fromEntries(tokens.map((t) => [t.name, t.value])),
        },
        null,
        2,
      )}\n`
    : `${[header, ...cssDeclarations(tokens)].join("\n")}\n`;

const runTheme = (flags: Record<string, string>): CliResult => {
  const brand = parseColour("brand", flags.brand);
  if (isError(brand)) return fail(brand);
  const mode = (flags.mode ?? "light") as ThemeMode;
  if (mode !== "light" && mode !== "dark")
    return fail(`--mode must be light or dark, got "${flags.mode}"`);
  const prefix = flags.prefix ?? "theme";
  const appUrl = flags["app-url"] ?? DEFAULT_APP_URL;

  const rgb = hex2Rgb(brand);
  const palette =
    mode === "light"
      ? generateThemePalette(rgb)
      : generateDarkThemePalette(rgb);
  const tokens = themeTokens(palette, prefix);
  return ok(
    render(flags.format, themeRecipe({ brand, mode, prefix, appUrl }), tokens, {
      tool: "theme",
      version: THEME_ALGORITHM_VERSION,
      inputs: {
        brand: hex2Str(brand),
        mode,
        prefix: toCssIdent(prefix, "theme"),
      },
      url: themeRecipeUrl({ brand, mode, prefix, appUrl }),
    }),
  );
};

const runPalette = (flags: Record<string, string>): CliResult => {
  const base = parseColour("base", flags.base);
  if (isError(base)) return fail(base);
  const light = parseColour("light", flags.light, PALETTE_DEFAULTS.light);
  if (isError(light)) return fail(light);
  const dark = parseColour("dark", flags.dark, PALETTE_DEFAULTS.dark);
  if (isError(dark)) return fail(dark);
  // Same rule as the page: an explicit name wins, else the nearest CSS name.
  const name = flags.name?.trim() || nearestNamedColor(hex2Rgb(base));
  const appUrl = flags["app-url"] ?? DEFAULT_APP_URL;

  const scale = buildPaletteScale(hex2Rgb(base), hex2Rgb(light), hex2Rgb(dark));
  const tokens = paletteTokens(scale, name);
  return ok(
    render(
      flags.format,
      paletteRecipe({ base, light, dark, name, appUrl }),
      tokens,
      {
        tool: "palette",
        version: PALETTE_ALGORITHM_VERSION,
        inputs: {
          base: hex2Str(base),
          light: hex2Str(light),
          dark: hex2Str(dark),
          name: toCssIdent(name, "colour"),
        },
        url: paletteRecipeUrl({ base, light, dark, name, appUrl }),
      },
    ),
  );
};

export const run = (argv: string[]): CliResult => {
  const parsed = parseArgs(argv);
  if ("error" in parsed) return fail(parsed.error);
  const { flags, positionals } = parsed;

  if (flags.help) return ok(USAGE);
  if (flags.version)
    return ok(
      `theme algorithm v${THEME_ALGORITHM_VERSION}, palette algorithm v${PALETTE_ALGORITHM_VERSION}\n`,
    );

  const [command, ...extra] = positionals;
  if (!command) return fail("missing command (theme or palette)");
  if (!(command in COMMAND_FLAGS)) return fail(`unknown command "${command}"`);
  if (extra.length) return fail(`unexpected argument "${extra[0]}"`);

  const unknown = Object.keys(flags).find(
    (key) => !COMMAND_FLAGS[command].includes(key),
  );
  if (unknown) return fail(`unknown option --${unknown} for ${command}`);
  if (flags.format !== undefined && !["css", "json"].includes(flags.format))
    return fail(`--format must be css or json, got "${flags.format}"`);
  if (flags["app-url"] !== undefined && !isHttpUrl(flags["app-url"]))
    return fail(
      `--app-url must be an http(s) URL, got ${JSON.stringify(flags["app-url"])}`,
    );

  return command === "theme" ? runTheme(flags) : runPalette(flags);
};
