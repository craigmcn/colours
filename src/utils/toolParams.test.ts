import {
  readColourParam,
  readPaletteParams,
  readThemeParams,
  writePaletteParams,
  writeThemeParams,
} from "./toolParams";

const params = (s: string) => new URLSearchParams(s);

describe("readColourParam", () => {
  it("accepts 6- and 3-digit hex, with or without #", () => {
    expect(readColourParam("3366CC")).toBe("#3366cc");
    expect(readColourParam("#3366cc")).toBe("#3366cc");
    expect(readColourParam("36c")).toBe("#36c");
  });

  it("returns empty for missing or malformed values", () => {
    expect(readColourParam(null)).toBe("");
    expect(readColourParam("")).toBe("");
    expect(readColourParam("12345g")).toBe("");
    expect(readColourParam("rgb(1,2,3)")).toBe("");
  });
});

describe("readThemeParams", () => {
  it("returns defaults for an empty query", () => {
    expect(readThemeParams(params(""))).toEqual({
      brand: "",
      mode: "light",
      prefix: "theme",
    });
  });

  it("reads every param", () => {
    expect(
      readThemeParams(params("brand=3366cc&mode=dark&prefix=brand")),
    ).toEqual({ brand: "#3366cc", mode: "dark", prefix: "brand" });
  });

  it("treats an unknown mode as light", () => {
    expect(readThemeParams(params("mode=DARK")).mode).toBe("light");
  });
});

describe("writeThemeParams", () => {
  it("omits defaults", () => {
    expect(
      writeThemeParams({ mode: "light", prefix: "theme" }).toString(),
    ).toBe("");
  });

  it("writes brand as bare hex, plus non-default mode and prefix", () => {
    expect(
      writeThemeParams({
        brand: ["33", "66", "cc"],
        mode: "dark",
        prefix: "my brand",
      }).toString(),
    ).toBe("brand=3366cc&mode=dark&prefix=my+brand");
  });

  it("round-trips through readThemeParams", () => {
    const written = writeThemeParams({
      brand: ["33", "66", "cc"],
      mode: "dark",
      prefix: "brand",
    });
    expect(readThemeParams(written)).toEqual({
      brand: "#3366cc",
      mode: "dark",
      prefix: "brand",
    });
  });
});

describe("readPaletteParams / writePaletteParams", () => {
  it("returns empty values for an empty query", () => {
    expect(readPaletteParams(params(""))).toEqual({
      base: "",
      light: "",
      dark: "",
      name: "",
    });
  });

  it("writes only the values that are set, in a stable order", () => {
    expect(
      writePaletteParams({
        base: ["ff", "00", "00"],
        dark: ["11", "11", "11"],
        name: "red",
      }).toString(),
    ).toBe("base=ff0000&dark=111111&name=red");
  });

  it("round-trips", () => {
    const written = writePaletteParams({
      base: ["ff", "00", "00"],
      light: ["fa", "fa", "fa"],
      dark: ["11", "11", "11"],
      name: "brand",
    });
    expect(readPaletteParams(written)).toEqual({
      base: "#ff0000",
      light: "#fafafa",
      dark: "#111111",
      name: "brand",
    });
  });
});
