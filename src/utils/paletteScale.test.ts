import {
  buildPaletteScale,
  PALETTE_ALGORITHM_VERSION,
  PALETTE_STEPS,
} from "./paletteScale";
import { rgb2Hex } from "./convertColours";
import type { RGB } from "../types/colour";

const WHITE: RGB = [255, 255, 255];
const GREY: RGB = [128, 128, 128];
const DARK: RGB = [34, 34, 34];

describe("buildPaletteScale", () => {
  it("returns one colour per palette step", () => {
    expect(buildPaletteScale(GREY, WHITE, DARK)).toHaveLength(
      PALETTE_STEPS.length,
    );
  });

  it("starts at the light colour, ends at the dark colour", () => {
    const scale = buildPaletteScale(GREY, WHITE, DARK);
    expect(scale[0]).toEqual(WHITE);
    expect(scale[scale.length - 1]).toEqual(DARK);
  });

  it("puts the base colour at step 500", () => {
    const scale = buildPaletteScale(GREY, WHITE, DARK);
    expect(scale[PALETTE_STEPS.indexOf(500)]).toEqual(GREY);
  });

  // Golden test: if this fails, the algorithm's output changed. Bump
  // PALETTE_ALGORITHM_VERSION (copied tokens record it), then update the values.
  it("is version 1", () => {
    expect(PALETTE_ALGORITHM_VERSION).toBe(1);
  });

  it("produces the expected default grey scale", () => {
    const hexes = buildPaletteScale(GREY, WHITE, DARK).map((rgb) =>
      rgb2Hex(rgb, true),
    );
    expect(hexes).toEqual([
      "#ffffff",
      "#f9f9f9",
      "#e6e6e6",
      "#cccccc",
      "#b3b3b3",
      "#999999",
      "#808080",
      "#6d6d6d",
      "#5a5a5a",
      "#484848",
      "#353535",
      "#222222",
    ]);
  });
});
