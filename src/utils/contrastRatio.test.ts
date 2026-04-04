import { contrastRatio, contrastTextColor, getContrastColour } from './contrastRatio'
import type { RGB } from '../types/colour'

// ─── contrastRatio ────────────────────────────────────────────────────────────

describe('contrastRatio', () => {
  it('returns 21 for black against white (maximum possible contrast)', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBe(21)
  })

  it('returns 1 for identical colours (minimum possible contrast)', () => {
    expect(contrastRatio([128, 128, 128], [128, 128, 128])).toBe(1)
    expect(contrastRatio([0, 0, 0], [0, 0, 0])).toBe(1)
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBe(1)
  })

  it('is commutative — argument order does not affect the result', () => {
    const a: RGB = [255, 0, 0]
    const b: RGB = [255, 255, 255]
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a))
  })

  it('returns 8.59 for blue (#0000FF) against white', () => {
    expect(contrastRatio([0, 0, 255], [255, 255, 255])).toBe(8.59)
  })

  it('returns a ratio ≥ 15 for dark grey (#222222) against white', () => {
    expect(contrastRatio([34, 34, 34], [255, 255, 255])).toBeGreaterThanOrEqual(15)
  })

  it('returns a ratio between 1 and 21 for any colour pair', () => {
    const pairs: [RGB, RGB][] = [
      [[255, 0, 0], [0, 255, 0]],
      [[128, 64, 192], [255, 200, 100]],
      [[10, 10, 10], [245, 245, 245]],
    ]
    for (const [c1, c2] of pairs) {
      const r = contrastRatio(c1, c2)
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(21)
    }
  })

  it('rounds the result to two decimal places', () => {
    const r = contrastRatio([0, 0, 255], [255, 255, 255])
    expect(r.toString()).toMatch(/^\d+\.\d{1,2}$/)
  })
})

// ─── contrastTextColor ────────────────────────────────────────────────────────

describe('contrastTextColor', () => {
  it('returns a result with A, AA, and AAA keys', () => {
    const result = contrastTextColor([255, 255, 255])
    expect(result).toHaveProperty('A')
    expect(result).toHaveProperty('AA')
    expect(result).toHaveProperty('AAA')
  })

  it('each level meets its WCAG contrast threshold against the input colour', () => {
    const bg: RGB = [255, 255, 255]
    const { A, AA, AAA } = contrastTextColor(bg)
    expect(contrastRatio(bg, A.rgb)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(bg, AA.rgb)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(bg, AAA.rgb)).toBeGreaterThanOrEqual(7)
  })

  it('suggests a dark text colour for a light background', () => {
    const { AA } = contrastTextColor([255, 255, 255])
    expect(AA.direction).toBe('D')
  })

  it('suggests a light text colour for a dark background', () => {
    const { AA } = contrastTextColor([0, 0, 0])
    expect(AA.direction).toBe('L')
  })

  it('returns hex, rgb, and hsl on each result', () => {
    const { AA } = contrastTextColor([200, 100, 50])
    expect(AA).toHaveProperty('hex')
    expect(AA).toHaveProperty('rgb')
    expect(AA).toHaveProperty('hsl')
    expect(AA.hex).toHaveLength(3)
    expect(AA.rgb).toHaveLength(3)
    expect(AA.hsl).toHaveLength(3)
  })
})

// ─── getContrastColour ────────────────────────────────────────────────────────

describe('getContrastColour — WCAG thresholds', () => {
  const white: RGB = [255, 255, 255]

  it('meets the AA threshold (4.5) by default', () => {
    const result = getContrastColour({ color: white })
    expect(contrastRatio(white, result.rgb)).toBeGreaterThanOrEqual(4.5)
  })

  it('meets the A threshold (3) when wcag is "A"', () => {
    const result = getContrastColour({ color: white, wcag: 'A' })
    expect(contrastRatio(white, result.rgb)).toBeGreaterThanOrEqual(3)
  })

  it('meets the AAA threshold (7) when wcag is "AAA"', () => {
    const result = getContrastColour({ color: white, wcag: 'AAA' })
    expect(contrastRatio(white, result.rgb)).toBeGreaterThanOrEqual(7)
  })
})

describe('getContrastColour — direction', () => {
  it('lightens (direction L) for a dark input colour by default', () => {
    const result = getContrastColour({ color: [10, 10, 10] })
    expect(result.direction).toBe('L')
  })

  it('darkens (direction D) for a light input colour by default', () => {
    const result = getContrastColour({ color: [245, 245, 245] })
    expect(result.direction).toBe('D')
  })

  it('respects an explicit direction of L', () => {
    const result = getContrastColour({ color: [200, 200, 200], direction: 'L' })
    expect(result.direction).toBe('L')
  })

  it('respects an explicit direction of D', () => {
    const result = getContrastColour({ color: [50, 50, 50], direction: 'D' })
    expect(result.direction).toBe('D')
  })
})

describe('getContrastColour — result shape', () => {
  it('returns hex, rgb, hsl, and direction', () => {
    const result = getContrastColour({ color: [128, 128, 128] })
    expect(result).toHaveProperty('hex')
    expect(result).toHaveProperty('rgb')
    expect(result).toHaveProperty('hsl')
    expect(result).toHaveProperty('direction')
  })

  it('hex has three two-char string elements', () => {
    const { hex } = getContrastColour({ color: [128, 128, 128] })
    expect(hex).toHaveLength(3)
    for (const part of hex) {
      expect(part).toMatch(/^[0-9a-f]{2}$/)
    }
  })
})
