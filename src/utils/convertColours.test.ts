import { describe, it, expect } from 'vitest'
import { hex2Rgb, rgb2Hex, rgb2Hsl, hsl2Rgb, hex2Str, rgb2Str, hsl2Str } from './convertColours'
import type { Hex, RGB } from '../types/colour'

// ─── hex2Rgb ──────────────────────────────────────────────────────────────────

describe('hex2Rgb', () => {
  it('converts a hex tuple to an RGB triple', () => {
    expect(hex2Rgb(['ff', '00', '00'])).toEqual([255, 0, 0])
    expect(hex2Rgb(['00', '00', 'ff'])).toEqual([0, 0, 255])
    expect(hex2Rgb(['22', '22', '22'])).toEqual([34, 34, 34])
    expect(hex2Rgb(['ff', 'ff', 'ff'])).toEqual([255, 255, 255])
  })

  it('defaults to black when called with no argument', () => {
    expect(hex2Rgb()).toEqual([0, 0, 0])
  })
})

// ─── rgb2Hex ──────────────────────────────────────────────────────────────────

describe('rgb2Hex', () => {
  it('returns a lowercase hex colour string by default', () => {
    expect(rgb2Hex([255, 0, 0])).toBe('#ff0000')
    expect(rgb2Hex([0, 0, 255])).toBe('#0000ff')
    expect(rgb2Hex([34, 34, 34])).toBe('#222222')
    expect(rgb2Hex([255, 255, 255])).toBe('#ffffff')
  })

  it('returns a Hex tuple when asString is false', () => {
    expect(rgb2Hex([255, 0, 0], false)).toEqual(['ff', '00', '00'])
    expect(rgb2Hex([0, 0, 255], false)).toEqual(['00', '00', 'ff'])
    expect(rgb2Hex([0, 128, 0], false)).toEqual(['00', '80', '00'])
  })

  it('pads single-digit hex values', () => {
    expect(rgb2Hex([0, 0, 0], false)).toEqual(['00', '00', '00'])
    expect(rgb2Hex([1, 2, 3], false)).toEqual(['01', '02', '03'])
  })

  it('defaults to black when called with no argument', () => {
    expect(rgb2Hex()).toBe('#000000')
  })
})

// ─── rgb2Hsl ──────────────────────────────────────────────────────────────────

describe('rgb2Hsl', () => {
  it('converts primary colours', () => {
    expect(rgb2Hsl([255, 0, 0])).toEqual([0, '100%', '50%'])
    expect(rgb2Hsl([0, 128, 0])).toEqual([120, '100%', '25%'])
    expect(rgb2Hsl([0, 0, 255])).toEqual([240, '100%', '50%'])
  })

  it('converts achromatic colours', () => {
    expect(rgb2Hsl([0, 0, 0])).toEqual([0, '0%', '0%'])
    expect(rgb2Hsl([255, 255, 255])).toEqual([0, '0%', '100%'])
    expect(rgb2Hsl([128, 128, 128])).toEqual([0, '0%', '50%'])
  })

  it('handles hues that wrap below zero (e.g. magenta)', () => {
    const [h] = rgb2Hsl([255, 0, 128])
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThan(360)
  })
})

// ─── hsl2Rgb ──────────────────────────────────────────────────────────────────

describe('hsl2Rgb', () => {
  it('converts primary colours using numeric saturation/lightness', () => {
    expect(hsl2Rgb([0, 100, 50])).toEqual([255, 0, 0])
    expect(hsl2Rgb([120, 100, 50])).toEqual([0, 255, 0])
    expect(hsl2Rgb([240, 100, 50])).toEqual([0, 0, 255])
  })

  it('accepts string percentages for saturation and lightness', () => {
    expect(hsl2Rgb([0, '100%', '50%'])).toEqual([255, 0, 0])
    expect(hsl2Rgb([240, '100%', '50%'])).toEqual([0, 0, 255])
    expect(hsl2Rgb([120, '100%', '25%'])).toEqual([0, 128, 0])
  })

  it('converts achromatic colours', () => {
    expect(hsl2Rgb([0, 0, 0])).toEqual([0, 0, 0])
    expect(hsl2Rgb([0, 0, 100])).toEqual([255, 255, 255])
    expect(hsl2Rgb([0, 0, 50])).toEqual([128, 128, 128])
  })

  it('covers all six hue sectors', () => {
    // sector 0°–60°: orange
    const [r0, g0, b0] = hsl2Rgb([30, 100, 50])
    expect(r0).toBe(255)
    expect(g0).toBeGreaterThan(0)
    expect(b0).toBe(0)

    // sector 60°–120°: yellow-green
    const [r1, g1, b1] = hsl2Rgb([90, 100, 50])
    expect(r1).toBeGreaterThan(0)
    expect(g1).toBe(255)
    expect(b1).toBe(0)

    // sector 180°–240°: cyan-blue
    const [r2, g2, b2] = hsl2Rgb([210, 100, 50])
    expect(r2).toBe(0)
    expect(g2).toBeGreaterThan(0)
    expect(b2).toBe(255)

    // sector 300°–360°: magenta
    const [r3, g3, b3] = hsl2Rgb([330, 100, 50])
    expect(r3).toBe(255)
    expect(g3).toBe(0)
    expect(b3).toBeGreaterThan(0)
  })
})

// ─── Formatter functions ───────────────────────────────────────────────────────

describe('hex2Str', () => {
  it('joins a Hex tuple with a leading #', () => {
    expect(hex2Str(['ff', '00', '00'])).toBe('#ff0000')
    expect(hex2Str(['00', '00', 'ff'])).toBe('#0000ff')
    expect(hex2Str(['ab', 'cd', 'ef'])).toBe('#abcdef')
  })
})

describe('rgb2Str', () => {
  it('formats an RGB triple as rgb(r, g, b)', () => {
    expect(rgb2Str([255, 0, 0])).toBe('rgb(255, 0, 0)')
    expect(rgb2Str([0, 128, 0])).toBe('rgb(0, 128, 0)')
    expect(rgb2Str([0, 0, 0])).toBe('rgb(0, 0, 0)')
  })
})

describe('hsl2Str', () => {
  it('formats an HSL tuple as hsl(h, s%, l%)', () => {
    expect(hsl2Str([0, '100%', '50%'])).toBe('hsl(0, 100%, 50%)')
    expect(hsl2Str([240, '100%', '50%'])).toBe('hsl(240, 100%, 50%)')
    expect(hsl2Str([120, '50%', '25%'])).toBe('hsl(120, 50%, 25%)')
  })
})

// ─── Round-trip conversions ────────────────────────────────────────────────────

describe('round-trip conversions', () => {
  it('hex → rgb → hex is lossless for standard colours', () => {
    const hex: Hex = ['22', '33', 'aa']
    expect(rgb2Hex(hex2Rgb(hex), false)).toEqual(hex)
  })

  it('rgb → hsl → rgb round-trips cleanly for primary colours', () => {
    const colours: RGB[] = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [0, 0, 0],
      [255, 255, 255],
    ]
    for (const rgb of colours) {
      const [h, s, l] = rgb2Hsl(rgb)
      expect(hsl2Rgb([h, s, l])).toEqual(rgb)
    }
  })
})
