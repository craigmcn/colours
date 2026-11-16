import { DEFAULT_APP_URL, run, USAGE } from "./run";
import { buildPaletteScale } from "../utils/paletteScale";
import {
  generateDarkThemePalette,
  generateThemePalette,
} from "../utils/themePalette";
import {
  cssDeclarations,
  paletteRecipe,
  paletteTokens,
  themeRecipe,
  themeTokens,
} from "../utils/tokens";

const ok = (argv: string[]) => {
  const result = run(argv);
  expect(result.stderr).toBe("");
  expect(result.code).toBe(0);
  return result.stdout;
};

const fails = (argv: string[], message: RegExp) => {
  const result = run(argv);
  expect(result.code).toBe(1);
  expect(result.stdout).toBe("");
  expect(result.stderr).toMatch(message);
};

describe("help and version", () => {
  it("prints usage for --help and -h", () => {
    expect(ok(["--help"])).toBe(USAGE);
    expect(ok(["theme", "-h"])).toBe(USAGE);
  });

  it("prints the algorithm versions", () => {
    expect(ok(["--version"])).toBe(
      "theme algorithm v1, palette algorithm v1\n",
    );
  });
});

describe("theme", () => {
  // The CLI must emit exactly what the app's Copy button copies (plus a
  // trailing newline), so the same inputs give the same tokens either way.
  it("matches the app's copied CSS for the same inputs", () => {
    const expected = [
      themeRecipe({
        brand: ["33", "66", "cc"],
        mode: "dark",
        prefix: "brand",
        appUrl: DEFAULT_APP_URL,
      }),
      ...cssDeclarations(
        themeTokens(generateDarkThemePalette([51, 102, 204]), "brand"),
      ),
    ].join("\n");
    expect(
      ok(["theme", "--brand", "3366cc", "--mode", "dark", "--prefix", "brand"]),
    ).toBe(`${expected}\n`);
  });

  it("defaults to light mode and the 'theme' prefix", () => {
    const out = ok(["theme", "--brand", "#3366cc"]);
    expect(out).toMatch(/^\/\* colours theme v1: brand #3366cc, mode light,/);
    expect(out).toContain("--theme-primary: #3366cc;");
  });

  it("accepts --flag=value and 3-digit hex", () => {
    expect(ok(["theme", "--brand=36c"])).toContain("--theme-primary: #3366cc;");
  });

  it("uses --app-url in the recipe link", () => {
    expect(
      ok(["theme", "--brand", "3366cc", "--app-url", "http://localhost:3060"]),
    ).toContain(
      "http://localhost:3060/theme?brand=3366cc&mode=light&prefix=theme */",
    );
  });

  it("emits JSON with inputs, version, URL and ordered tokens", () => {
    const out = JSON.parse(
      ok([
        "theme",
        "--brand",
        "3366cc",
        "--prefix",
        "My Brand",
        "--format=json",
      ]),
    );
    const palette = generateThemePalette([51, 102, 204]);
    expect(out).toEqual({
      tool: "theme",
      version: 1,
      inputs: { brand: "#3366cc", mode: "light", prefix: "my-brand" },
      url: `${DEFAULT_APP_URL}theme?brand=3366cc&mode=light&prefix=my-brand`,
      tokens: Object.fromEntries(
        themeTokens(palette, "My Brand").map((t) => [t.name, t.value]),
      ),
    });
    expect(Object.keys(out.tokens)[0]).toBe("--my-brand-primary");
  });

  it("rejects bad input with a usage hint", () => {
    fails(["theme"], /--brand is required/);
    fails(["theme", "--brand", "blue"], /--brand must be a hex colour/);
    fails(["theme", "--brand", "36c", "--mode", "dim"], /--mode must be/);
    fails(
      ["theme", "--brand", "36c", "--base", "fff"],
      /unknown option --base/,
    );
    fails(["theme", "--brand"], /--brand needs a value/);
    fails(["theme", "--brand", "36c", "--format", "xml"], /--format must be/);
  });
});

describe("palette", () => {
  it("matches the app's copied CSS for the same inputs", () => {
    const expected = [
      paletteRecipe({
        base: ["ff", "00", "00"],
        light: ["fa", "fa", "fa"],
        dark: ["11", "11", "11"],
        name: "brand",
        appUrl: DEFAULT_APP_URL,
      }),
      ...cssDeclarations(
        paletteTokens(
          buildPaletteScale([255, 0, 0], [250, 250, 250], [17, 17, 17]),
          "brand",
        ),
      ),
    ].join("\n");
    expect(
      ok([
        "palette",
        "--base",
        "ff0000",
        "--light",
        "fafafa",
        "--dark",
        "111111",
        "--name",
        "brand",
      ]),
    ).toBe(`${expected}\n`);
  });

  it("defaults light/dark like the app and names by nearest colour", () => {
    const out = ok(["palette", "--base", "ff0000"]);
    expect(out.split("\n")[0]).toBe(
      "/* colours palette v1: base #ff0000, light #ffffff, dark #222222, name red",
    );
    expect(out).toContain("--red-500: #ff0000;");
  });

  it("treats a blank --name as unset", () => {
    expect(ok(["palette", "--base", "ff0000", "--name", "  "])).toContain(
      "--red-500:",
    );
  });

  it("emits JSON", () => {
    const out = JSON.parse(
      ok(["palette", "--base", "808080", "--name", "grey", "--format", "json"]),
    );
    expect(out.tool).toBe("palette");
    expect(out.inputs).toEqual({
      base: "#808080",
      light: "#ffffff",
      dark: "#222222",
      name: "grey",
    });
    expect(Object.keys(out.tokens)).toHaveLength(12);
    expect(out.tokens["--grey-500"]).toBe("#808080");
  });

  it("rejects bad input", () => {
    fails(["palette"], /--base is required/);
    fails(["palette", "--base", "fff", "--dark", "nope"], /--dark must be/);
    fails(["palette", "--base", "fff", "--brand", "fff"], /unknown option/);
  });
});

describe("commands", () => {
  it("requires a known command", () => {
    fails([], /missing command/);
    fails(["blend"], /unknown command "blend"/);
    fails(["theme", "extra", "--brand", "fff"], /unexpected argument "extra"/);
    fails(["-x"], /unknown option -x/);
  });
});
