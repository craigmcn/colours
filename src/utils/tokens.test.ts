import {
  cssDeclarations,
  paletteRecipe,
  paletteTokens,
  themeRecipe,
  themeTokens,
  toCssIdent,
} from "./tokens";
import { buildPaletteScale } from "./paletteScale";
import { generateThemePalette, THEME_ROLES } from "./themePalette";

describe("toCssIdent", () => {
  it("lowercases and hyphenates whitespace", () => {
    expect(toCssIdent("Brand Blue", "x")).toBe("brand-blue");
  });

  it("trims surrounding whitespace before hyphenating", () => {
    expect(toCssIdent("  blue  ", "x")).toBe("blue");
  });

  it("strips characters that aren't valid in an identifier", () => {
    expect(toCssIdent("blue!@#2", "x")).toBe("blue2");
  });

  it("returns the fallback when nothing usable remains", () => {
    expect(toCssIdent("   ", "theme")).toBe("theme");
    expect(toCssIdent("!!!", "colour")).toBe("colour");
  });
});

describe("themeTokens", () => {
  const palette = generateThemePalette([13, 110, 253]);

  it("emits one token per role, in role order, kebab-cased", () => {
    const names = themeTokens(palette, "brand").map((t) => t.name);
    expect(names).toHaveLength(THEME_ROLES.length);
    expect(names[0]).toBe("--brand-primary");
    expect(names).toContain("--brand-gray-light");
  });

  it("uses lowercase #rrggbb values", () => {
    const [primary] = themeTokens(palette, "brand");
    expect(primary.value).toBe("#0d6efd");
  });

  it("falls back to the 'theme' prefix", () => {
    expect(themeTokens(palette, " ")[0].name).toBe("--theme-primary");
  });
});

describe("paletteTokens", () => {
  const scale = buildPaletteScale(
    [128, 128, 128],
    [255, 255, 255],
    [34, 34, 34],
  );

  it("names tokens by step, 0 through 1000", () => {
    const names = paletteTokens(scale, "grey").map((t) => t.name);
    expect(names[0]).toBe("--grey-0");
    expect(names[1]).toBe("--grey-50");
    expect(names[2]).toBe("--grey-100");
    expect(names[11]).toBe("--grey-1000");
  });

  it("falls back to the 'colour' prefix", () => {
    expect(paletteTokens(scale, "")[0].name).toBe("--colour-0");
  });

  it("throws when the scale doesn't have one colour per step", () => {
    expect(() => paletteTokens(scale.slice(1), "grey")).toThrow(RangeError);
    expect(() => paletteTokens([...scale, scale[0]], "grey")).toThrow(
      RangeError,
    );
  });
});

describe("cssDeclarations", () => {
  it("formats tokens as semicolon-terminated custom property lines", () => {
    expect(
      cssDeclarations([
        { name: "--a-0", value: "#ffffff" },
        { name: "--a-50", value: "#f9f9f9" },
      ]),
    ).toEqual(["--a-0: #ffffff;", "--a-50: #f9f9f9;"]);
  });
});

describe("themeRecipe", () => {
  const recipe = (prefix: string) =>
    themeRecipe({
      brand: ["33", "66", "cc"],
      mode: "dark",
      prefix,
      appUrl: "https://example.com/colours/",
    });

  it("records tool, version, inputs and a full reproducible URL", () => {
    expect(recipe("brand")).toBe(
      "/* colours theme v1: brand #3366cc, mode dark, prefix brand\n" +
        "   https://example.com/colours/theme?brand=3366cc&mode=dark&prefix=brand */",
    );
  });

  it("adds the trailing slash when appUrl lacks one, keeping any subpath", () => {
    const at = (appUrl: string) =>
      themeRecipe({
        brand: ["33", "66", "cc"],
        mode: "light",
        prefix: "theme",
        appUrl,
      }).split("\n")[1];
    expect(at("https://example.com")).toContain("https://example.com/theme?");
    expect(at("https://example.com/colours")).toContain(
      "https://example.com/colours/theme?",
    );
  });

  it("can't be closed early by a hostile appUrl", () => {
    const header = themeRecipe({
      brand: ["33", "66", "cc"],
      mode: "light",
      prefix: "theme",
      appUrl: "https://x.com/a*/ body{}\n/* b/",
    });
    expect(header.indexOf("*/")).toBe(header.length - 2);
    expect(header.split("\n")).toHaveLength(2);
    expect(header).toContain("https://x.com/a*%2F body{}/* b/theme?");
  });

  it("can't be closed early by a hostile prefix", () => {
    const header = recipe("x */ body { display: none } /*");
    expect(header.indexOf("*/")).toBe(header.length - 2);
  });
});

describe("paletteRecipe", () => {
  it("records every input, including defaults", () => {
    expect(
      paletteRecipe({
        base: ["80", "80", "80"],
        light: ["ff", "ff", "ff"],
        dark: ["22", "22", "22"],
        name: "Grey",
        appUrl: "https://example.com/",
      }),
    ).toBe(
      "/* colours palette v1: base #808080, light #ffffff, dark #222222, name grey\n" +
        "   https://example.com/palette?base=808080&light=ffffff&dark=222222&name=grey */",
    );
  });

  it("adds the trailing slash when appUrl lacks one", () => {
    const header = paletteRecipe({
      base: ["80", "80", "80"],
      light: ["ff", "ff", "ff"],
      dark: ["22", "22", "22"],
      name: "grey",
      appUrl: "https://example.com/colours",
    });
    expect(header).toContain("https://example.com/colours/palette?");
  });

  it("can't be closed early by a hostile appUrl", () => {
    const header = paletteRecipe({
      base: ["80", "80", "80"],
      light: ["ff", "ff", "ff"],
      dark: ["22", "22", "22"],
      name: "grey",
      appUrl: "https://x.com/*/\r\n",
    });
    expect(header.indexOf("*/")).toBe(header.length - 2);
    expect(header.split("\n")).toHaveLength(2);
  });

  it("can't be closed early by a hostile name", () => {
    const header = paletteRecipe({
      base: ["80", "80", "80"],
      light: ["ff", "ff", "ff"],
      dark: ["22", "22", "22"],
      name: "*/ evil /*",
      appUrl: "https://example.com/",
    });
    expect(header.indexOf("*/")).toBe(header.length - 2);
  });
});
