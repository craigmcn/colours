import {
  generateThemePalette,
  generateDarkThemePalette,
  roleToKebab,
  THEME_ROLES,
} from "./themePalette";
import { rgb2Hsl } from "./convertColours";
import type { RGB } from "../types/colour";

const hueOf = (rgb: RGB): number => rgb2Hsl(rgb)[0];
const satOf = (rgb: RGB): number => parseInt(rgb2Hsl(rgb)[1]);
const lightOf = (rgb: RGB): number => parseInt(rgb2Hsl(rgb)[2]);

// Hue comparisons allow slack for RGB<->HSL round-trip rounding.
const expectHueNear = (rgb: RGB, target: number, tolerance = 3) => {
  const diff = Math.abs(hueOf(rgb) - target);
  expect(Math.min(diff, 360 - diff)).toBeLessThanOrEqual(tolerance);
};

describe("generateThemePalette", () => {
  it("returns all 12 theme roles", () => {
    const palette = generateThemePalette([13, 110, 253]);
    expect(Object.keys(palette).sort()).toEqual([...THEME_ROLES].sort());
  });

  it("keeps the primary role identical to the input colour", () => {
    const input: RGB = [13, 110, 253];
    expect(generateThemePalette(input).primary).toEqual(input);
  });

  it("rotates success/danger/warning/info to fixed semantic hues regardless of brand hue", () => {
    const palette = generateThemePalette([13, 110, 253]); // blue brand
    expectHueNear(palette.success, 134);
    expectHueNear(palette.danger, 354);
    expectHueNear(palette.warning, 45);
    expectHueNear(palette.info, 190);
  });

  it("keeps secondary/light/dark on the brand's own hue", () => {
    const input: RGB = [13, 110, 253];
    const palette = generateThemePalette(input);
    const brandHue = hueOf(input);
    // Wider tolerance than the semantic roles: secondary/light are heavily
    // desaturated by design, and hue becomes noisy under rounding as
    // saturation approaches zero.
    expectHueNear(palette.secondary, brandHue, 6);
    expectHueNear(palette.light, brandHue, 6);
    expectHueNear(palette.dark, brandHue, 6);
  });

  it("light is a very pale tint and dark is a very deep shade", () => {
    const palette = generateThemePalette([13, 110, 253]);
    expect(lightOf(palette.light)).toBeGreaterThanOrEqual(90);
    expect(lightOf(palette.dark)).toBeLessThanOrEqual(25);
  });

  it("secondary is markedly less saturated than the brand colour", () => {
    const input: RGB = [13, 110, 253];
    const palette = generateThemePalette(input);
    expect(satOf(palette.secondary)).toBeLessThan(satOf(input));
  });

  it("produces a recognisable green/red/amber/cyan even for a fully desaturated (grey) brand colour", () => {
    const palette = generateThemePalette([128, 128, 128]);
    expectHueNear(palette.success, 134);
    expectHueNear(palette.danger, 354);
    expectHueNear(palette.warning, 45);
    expectHueNear(palette.info, 190);
    expect(satOf(palette.success)).toBeGreaterThan(0);
    expect(satOf(palette.danger)).toBeGreaterThan(0);
    expect(satOf(palette.warning)).toBeGreaterThan(0);
    expect(satOf(palette.info)).toBeGreaterThan(0);
  });

  it("handles pure black and pure white brand colours without producing NaN", () => {
    for (const input of [
      [0, 0, 0],
      [255, 255, 255],
    ] as RGB[]) {
      const palette = generateThemePalette(input);
      for (const role of THEME_ROLES) {
        for (const channel of palette[role]) {
          expect(Number.isNaN(channel)).toBe(false);
          expect(channel).toBeGreaterThanOrEqual(0);
          expect(channel).toBeLessThanOrEqual(255);
        }
      }
    }
  });

  it("is a pure function — same input always produces the same output", () => {
    const input: RGB = [200, 40, 90];
    expect(generateThemePalette(input)).toEqual(generateThemePalette(input));
  });

  describe("a11y neutrals — white/grayLight/grayDark/black", () => {
    it("are fully desaturated regardless of the brand colour", () => {
      const palette = generateThemePalette([200, 40, 90]); // highly saturated brand
      expect(satOf(palette.white)).toBe(0);
      expect(satOf(palette.grayLight)).toBe(0);
      expect(satOf(palette.grayDark)).toBe(0);
      expect(satOf(palette.black)).toBe(0);
    });

    it("are off-white/off-black rather than pure #fff/#000, to reduce eye strain", () => {
      const palette = generateThemePalette([13, 110, 253]);
      expect(palette.white).not.toEqual([255, 255, 255]);
      expect(palette.black).not.toEqual([0, 0, 0]);
      expect(lightOf(palette.white)).toBeGreaterThanOrEqual(95);
      expect(lightOf(palette.black)).toBeLessThanOrEqual(15);
    });

    it("form a light-to-dark scale: white > grayLight > grayDark > black", () => {
      const palette = generateThemePalette([13, 110, 253]);
      expect(lightOf(palette.white)).toBeGreaterThan(
        lightOf(palette.grayLight),
      );
      expect(lightOf(palette.grayLight)).toBeGreaterThan(
        lightOf(palette.grayDark),
      );
      expect(lightOf(palette.grayDark)).toBeGreaterThan(lightOf(palette.black));
    });

    it("are identical across very different brand colours (brand-independent)", () => {
      const a = generateThemePalette([13, 110, 253]);
      const b = generateThemePalette([220, 20, 60]);
      expect(a.white).toEqual(b.white);
      expect(a.grayLight).toEqual(b.grayLight);
      expect(a.grayDark).toEqual(b.grayDark);
      expect(a.black).toEqual(b.black);
    });
  });
});

describe("generateDarkThemePalette", () => {
  it("returns all 12 theme roles", () => {
    const palette = generateDarkThemePalette([13, 110, 253]);
    expect(Object.keys(palette).sort()).toEqual([...THEME_ROLES].sort());
  });

  it("keeps primary on the brand's own hue but lifts its lightness for a dark background", () => {
    const input: RGB = [13, 110, 253];
    const lightPrimary = generateThemePalette(input).primary;
    const darkPrimary = generateDarkThemePalette(input).primary;
    expectHueNear(darkPrimary, hueOf(input));
    expect(lightOf(darkPrimary)).toBeGreaterThan(lightOf(lightPrimary));
  });

  it("re-lightens a dark, saturated brand colour into a legible dark-mode primary", () => {
    // #005b99 — hue 204°, l≈30% — reads fine on white but is nearly invisible
    // against a near-black background unless lightened.
    const input: RGB = [0, 91, 153];
    const darkPrimary = generateDarkThemePalette(input).primary;
    expectHueNear(darkPrimary, 204);
    expect(lightOf(darkPrimary)).toBeGreaterThanOrEqual(55);
  });

  it("rotates success/danger/warning/info to the same fixed semantic hues as light mode", () => {
    const palette = generateDarkThemePalette([13, 110, 253]);
    expectHueNear(palette.success, 134);
    expectHueNear(palette.danger, 354);
    expectHueNear(palette.warning, 45);
    expectHueNear(palette.info, 190);
  });

  it("lifts success/danger/warning/info/secondary into a higher lightness band than light mode", () => {
    const input: RGB = [13, 110, 253];
    const lightPalette = generateThemePalette(input);
    const darkPalette = generateDarkThemePalette(input);
    for (const role of [
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
    ] as const) {
      expect(lightOf(darkPalette[role])).toBeGreaterThan(
        lightOf(lightPalette[role]),
      );
    }
  });

  it("swaps the light/dark brand-tinted surfaces relative to light mode", () => {
    const input: RGB = [13, 110, 253];
    const lightPalette = generateThemePalette(input);
    const darkPalette = generateDarkThemePalette(input);
    expect(darkPalette.light).toEqual(lightPalette.dark);
    expect(darkPalette.dark).toEqual(lightPalette.light);
  });

  it("swaps the a11y neutrals (white/grayLight/grayDark/black) relative to light mode, mirroring light/dark", () => {
    const input: RGB = [13, 110, 253];
    const lightPalette = generateThemePalette(input);
    const darkPalette = generateDarkThemePalette(input);
    expect(darkPalette.white).toEqual(lightPalette.black);
    expect(darkPalette.black).toEqual(lightPalette.white);
    expect(darkPalette.grayLight).toEqual(lightPalette.grayDark);
    expect(darkPalette.grayDark).toEqual(lightPalette.grayLight);
  });

  it("handles pure black and pure white brand colours without producing NaN", () => {
    for (const input of [
      [0, 0, 0],
      [255, 255, 255],
    ] as RGB[]) {
      const palette = generateDarkThemePalette(input);
      for (const role of THEME_ROLES) {
        for (const channel of palette[role]) {
          expect(Number.isNaN(channel)).toBe(false);
          expect(channel).toBeGreaterThanOrEqual(0);
          expect(channel).toBeLessThanOrEqual(255);
        }
      }
    }
  });

  it("is a pure function — same input always produces the same output", () => {
    const input: RGB = [200, 40, 90];
    expect(generateDarkThemePalette(input)).toEqual(
      generateDarkThemePalette(input),
    );
  });
});

describe("roleToKebab", () => {
  it("leaves single-word roles unchanged", () => {
    expect(roleToKebab("primary")).toBe("primary");
    expect(roleToKebab("white")).toBe("white");
  });

  it("converts camelCase roles to kebab-case", () => {
    expect(roleToKebab("grayLight")).toBe("gray-light");
    expect(roleToKebab("grayDark")).toBe("gray-dark");
  });
});
