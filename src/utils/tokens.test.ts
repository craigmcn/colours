import {
  cssDeclarations,
  paletteTokens,
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
