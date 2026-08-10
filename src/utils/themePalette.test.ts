import { generateThemePalette, THEME_ROLES } from "./themePalette";
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
  it("returns all 8 theme roles", () => {
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
});
