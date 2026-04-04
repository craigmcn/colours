import { describe, it, expect } from 'vitest'
import { nearestNamedColor } from './nearestNamedColor'

// ─── Exact matches ────────────────────────────────────────────────────────────

describe('nearestNamedColor — exact colour matches', () => {
  it('returns "red" for pure red', () => {
    expect(nearestNamedColor([255, 0, 0])).toBe('red')
  })

  it('returns "lime" for pure green', () => {
    // CSS named colour "lime" is rgb(0, 255, 0)
    expect(nearestNamedColor([0, 255, 0])).toBe('lime')
  })

  it('returns "blue" for pure blue', () => {
    expect(nearestNamedColor([0, 0, 255])).toBe('blue')
  })

  it('returns "white" for rgb(255, 255, 255)', () => {
    expect(nearestNamedColor([255, 255, 255])).toBe('white')
  })

  it('returns "black" for rgb(0, 0, 0)', () => {
    expect(nearestNamedColor([0, 0, 0])).toBe('black')
  })

  it('returns "grey" or "gray" for rgb(128, 128, 128)', () => {
    const result = nearestNamedColor([128, 128, 128])
    expect(['grey', 'gray']).toContain(result)
  })
})

// ─── Nearest approximations ───────────────────────────────────────────────────

describe('nearestNamedColor — nearest approximations', () => {
  it('returns a string for any valid RGB input', () => {
    const result = nearestNamedColor([100, 149, 237])
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a consistent result for the same input', () => {
    const a = nearestNamedColor([100, 149, 237])
    const b = nearestNamedColor([100, 149, 237])
    expect(a).toBe(b)
  })

  it('returns a colour closer to red for a near-red input', () => {
    // rgb(250, 10, 10) is very close to red
    const result = nearestNamedColor([250, 10, 10])
    expect(result).toBe('red')
  })

  it('returns a colour closer to blue for a near-blue input', () => {
    const result = nearestNamedColor([10, 10, 250])
    expect(result).toBe('blue')
  })

  it('never returns "unknown" for standard in-gamut colours', () => {
    // The dataset should cover any reasonable RGB value
    const testColors: [number, number, number][] = [
      [128, 0, 0],
      [0, 128, 128],
      [255, 165, 0],
      [75, 0, 130],
    ]
    for (const rgb of testColors) {
      expect(nearestNamedColor(rgb)).not.toBe('unknown')
    }
  })
})
