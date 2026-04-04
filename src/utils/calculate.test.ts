import { describe, it, expect } from 'vitest'
import { calculateColorArray, calculateFg, calculateBg, calculateOpacity, useDecimal } from './calculate'
import type { RGB } from '../types/colour'

// ─── calculateColorArray ──────────────────────────────────────────────────────

describe('calculateColorArray', () => {
  it('returns background at opacity 0', () => {
    expect(calculateColorArray(0, [255, 255, 255], [0, 0, 0])).toEqual([255, 255, 255])
  })

  it('returns foreground at opacity 1', () => {
    expect(calculateColorArray(1, [255, 255, 255], [0, 91, 153])).toEqual([0, 91, 153])
  })

  it('blends at 50% opacity', () => {
    // (1-0.5)*0 + 0.5*255 = 127.5 → rounds to 128
    expect(calculateColorArray(0.5, [0, 0, 0], [255, 255, 255])).toEqual([128, 128, 128])
  })

  it('blends at 25% opacity — default scenario', () => {
    // fg=#005b99 → [0,91,153], bg=#ffffff → [255,255,255], opacity=0.25
    // R: 0.75*255 + 0.25*0   = 191.25 → 191
    // G: 0.75*255 + 0.25*91  = 191.25 + 22.75 = 214.0 → 214
    // B: 0.75*255 + 0.25*153 = 191.25 + 38.25 = 229.5 → 230
    expect(calculateColorArray(0.25, [255, 255, 255], [0, 91, 153])).toEqual([191, 214, 230])
  })

  it('handles NaN inputs per-channel by returning 0', () => {
    const result = calculateColorArray(NaN, [255, 255, 255], [0, 0, 0])
    for (const c of result) expect(c).toBe(0)
  })

  it('blends each channel independently', () => {
    const result = calculateColorArray(0.5, [0, 100, 200], [100, 200, 0])
    expect(result[0]).toBe(50)
    expect(result[1]).toBe(150)
    expect(result[2]).toBe(100)
  })
})

// ─── calculateFg ─────────────────────────────────────────────────────────────

describe('calculateFg', () => {
  it('is the inverse of calculateColorArray — recovers original fg within ±2', () => {
    // Two rounds of rounding (blend, then invert) can introduce up to ±2 per channel
    const fg: RGB = [0, 91, 153]
    const bg: RGB = [255, 255, 255]
    const opacity = 0.25
    const result = calculateColorArray(opacity, bg, fg)
    const recovered = calculateFg(opacity, bg, result)
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(recovered[i] - fg[i])).toBeLessThanOrEqual(2)
    }
  })

  it('returns zeros for all channels when opacity is 0', () => {
    expect(calculateFg(0, [255, 255, 255], [200, 200, 200])).toEqual([0, 0, 0])
  })

  it('recovers fg exactly at opacity 1 (result equals fg)', () => {
    const fg: RGB = [100, 150, 200]
    expect(calculateFg(1, [255, 255, 255], fg)).toEqual(fg)
  })

  it('clamps results to 0–255', () => {
    // Pathological: result much darker than bg at very low opacity extrapolates below 0
    const result = calculateFg(0.1, [200, 200, 200], [0, 0, 0])
    for (const c of result) {
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(255)
    }
  })

  it('handles NaN gracefully — returns 0 per channel', () => {
    const result = calculateFg(0.5, [255, 255, 255], [NaN as unknown as number, 100, 100])
    expect(result[0]).toBe(0)
  })
})

// ─── calculateBg ─────────────────────────────────────────────────────────────

describe('calculateBg', () => {
  it('is the inverse of calculateColorArray — recovers original bg within ±2', () => {
    const fg: RGB = [0, 91, 153]
    const bg: RGB = [255, 255, 255]
    const opacity = 0.25
    const result = calculateColorArray(opacity, bg, fg)
    const recovered = calculateBg(opacity, fg, result)
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(recovered[i] - bg[i])).toBeLessThanOrEqual(2)
    }
  })

  it('returns zeros for all channels when opacity is 1', () => {
    expect(calculateBg(1, [0, 91, 153], [200, 200, 200])).toEqual([0, 0, 0])
  })

  it('recovers bg exactly at opacity 0 (result equals bg)', () => {
    const bg: RGB = [240, 240, 240]
    expect(calculateBg(0, [0, 91, 153], bg)).toEqual(bg)
  })

  it('clamps results to 0–255', () => {
    const result = calculateBg(0.9, [0, 0, 0], [255, 255, 255])
    for (const c of result) {
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(255)
    }
  })

  it('handles NaN gracefully — returns 0 per channel', () => {
    const result = calculateBg(0.5, [0, 0, 0], [NaN as unknown as number, 100, 100])
    expect(result[0]).toBe(0)
  })
})

// ─── calculateOpacity ─────────────────────────────────────────────────────────

describe('calculateOpacity', () => {
  it('returns 0 when result equals background', () => {
    // (b - r) / (b - f) = (255 - 255) / (255 - 0) = 0
    expect(calculateOpacity(255, 0, 255)).toBe(0)
  })

  it('returns 1 when result equals foreground', () => {
    // (b - r) / (b - f) = (255 - 0) / (255 - 0) = 1
    expect(calculateOpacity(255, 0, 0)).toBe(1)
  })

  it('returns ~0.5 for a midpoint blend', () => {
    // (255 - 128) / (255 - 0) ≈ 0.498
    expect(calculateOpacity(255, 0, 128)).toBeCloseTo(0.498, 2)
  })

  it('clamps values above 1 to 1', () => {
    // b=100, f=200, r=50: (100-50)/(100-200) = 50/-100 = -0.5 → clamped to 0
    // For above 1: b=200, f=100, r=50: (200-50)/(200-100) = 1.5 → clamped to 1
    expect(calculateOpacity(200, 100, 50)).toBe(1)
  })

  it('clamps values below 0 to 0', () => {
    // b=200, f=100, r=250: (200-250)/(200-100) = -50/100 = -0.5 → clamped to 0
    expect(calculateOpacity(200, 100, 250)).toBe(0)
  })

  it('returns 0 when bg and fg are equal (NaN guard)', () => {
    // b - f = 0 → division by zero → NaN → returns 0
    expect(calculateOpacity(128, 128, 128)).toBe(0)
  })

  it('is the inverse of calculateColorSingle — recovers opacity', () => {
    const b = 255, f = 0, o = 0.25
    const r = Math.round((1 - o) * b + o * f)
    expect(calculateOpacity(b, f, r)).toBeCloseTo(o, 1)
  })
})

// ─── useDecimal ───────────────────────────────────────────────────────────────

describe('useDecimal', () => {
  it('returns the number unchanged when it is an integer', () => {
    expect(useDecimal(0)).toBe(0)
    expect(useDecimal(1)).toBe(1)
    expect(useDecimal(100)).toBe(100)
  })

  it('returns a string rounded to 2 decimal places for non-integers', () => {
    expect(useDecimal(0.5)).toBe('0.50')
    expect(useDecimal(0.25)).toBe('0.25')
    expect(useDecimal(0.123)).toBe('0.12')
  })

  it('returns a string type for non-integers', () => {
    expect(typeof useDecimal(0.5)).toBe('string')
  })

  it('returns a number type for integers', () => {
    expect(typeof useDecimal(1)).toBe('number')
  })
})

// ─── Inverse consistency — all four functions ─────────────────────────────────

describe('four-way inverse consistency', () => {
  const cases: Array<{ fg: RGB; bg: RGB; opacity: number }> = [
    { fg: [0, 91, 153], bg: [255, 255, 255], opacity: 0.25 },
    { fg: [34, 34, 34], bg: [255, 255, 255], opacity: 0.75 },
    { fg: [200, 50, 100], bg: [10, 20, 30], opacity: 0.5 },
  ]

  for (const { fg, bg, opacity } of cases) {
    it(`recovers fg/bg/opacity at opacity=${opacity}`, () => {
      const result = calculateColorArray(opacity, bg, fg)

      // Solve for fg — allow ±2 per channel due to double-rounding
      const recovFg = calculateFg(opacity, bg, result)
      for (let i = 0; i < 3; i++) {
        expect(Math.abs(recovFg[i] - fg[i])).toBeLessThanOrEqual(2)
      }

      // Solve for bg — allow ±2 per channel
      const recovBg = calculateBg(opacity, fg, result)
      for (let i = 0; i < 3; i++) {
        expect(Math.abs(recovBg[i] - bg[i])).toBeLessThanOrEqual(2)
      }

      // Solve for opacity (average of channel opacities)
      const ops = result
        .map((c, i) => calculateOpacity(bg[i], fg[i], c))
        .filter(o => o > 0)
      const avgOpacity = ops.reduce((a, b) => a + b, 0) / ops.length
      expect(avgOpacity).toBeCloseTo(opacity, 1)
    })
  }
})
