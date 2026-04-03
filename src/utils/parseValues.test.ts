import { describe, it, expect } from 'vitest'
import { splitHex, splitRgb, splitHsl, parseText } from './parseValues'

// ─── splitHex ─────────────────────────────────────────────────────────────────

describe('splitHex', () => {
  it('splits a 6-character hex string (with #) into a tuple', () => {
    expect(splitHex('#ff0000')).toEqual(['ff', '00', '00'])
    expect(splitHex('#0000ff')).toEqual(['00', '00', 'ff'])
    expect(splitHex('#222222')).toEqual(['22', '22', '22'])
  })

  it('splits a 6-character hex string (without #)', () => {
    expect(splitHex('ff0000')).toEqual(['ff', '00', '00'])
    expect(splitHex('ffffff')).toEqual(['ff', 'ff', 'ff'])
  })

  it('expands a 3-character shorthand hex string', () => {
    expect(splitHex('#f00')).toEqual(['ff', '00', '00'])
    expect(splitHex('#abc')).toEqual(['aa', 'bb', 'cc'])
    expect(splitHex('#fff')).toEqual(['ff', 'ff', 'ff'])
  })

  it('is case-insensitive', () => {
    expect(splitHex('#FF0000')).toEqual(['ff', '00', '00'])
    expect(splitHex('#ABCDEF')).toEqual(['ab', 'cd', 'ef'])
  })

  it('returns black for undefined input', () => {
    expect(splitHex()).toEqual(['00', '00', '00'])
  })

  it('returns black for an empty string', () => {
    expect(splitHex('')).toEqual(['00', '00', '00'])
  })

  it('returns black for invalid hex strings', () => {
    expect(splitHex('not-a-color')).toEqual(['00', '00', '00'])
    expect(splitHex('#zzzzzz')).toEqual(['00', '00', '00'])
    expect(splitHex('#1234')).toEqual(['00', '00', '00'])
  })
})

// ─── splitRgb ─────────────────────────────────────────────────────────────────

describe('splitRgb', () => {
  it('splits an rgb() string into a numeric triple', () => {
    expect(splitRgb('rgb(255, 0, 0)')).toEqual([255, 0, 0])
    expect(splitRgb('rgb(0, 128, 0)')).toEqual([0, 128, 0])
    expect(splitRgb('rgb(0, 0, 255)')).toEqual([0, 0, 255])
  })

  it('accepts rgb() without spaces', () => {
    expect(splitRgb('rgb(255,0,0)')).toEqual([255, 0, 0])
  })
})

// ─── splitHsl ─────────────────────────────────────────────────────────────────

describe('splitHsl', () => {
  it('splits an hsl() string into its components', () => {
    // Note: the numeric captures do not include the % sign
    expect(splitHsl('hsl(120, 100%, 25%)')).toEqual([120, '100', '25'])
    expect(splitHsl('hsl(240, 100%, 50%)')).toEqual([240, '100', '50'])
    expect(splitHsl('hsl(0, 0%, 0%)')).toEqual([0, '0', '0'])
  })

  it('returns zero values for undefined input', () => {
    expect(splitHsl()).toEqual([0, '0%', '0%'])
  })
})

// ─── parseText ────────────────────────────────────────────────────────────────

describe('parseText — hex input', () => {
  it('parses a 6-character hex string with a leading #', () => {
    const [hex, rgb, hsl] = parseText('#ff0000')
    expect(hex).toEqual(['ff', '00', '00'])
    expect(rgb).toEqual([255, 0, 0])
    expect(hsl).toEqual([0, '100%', '50%'])
  })

  it('parses a 6-character hex string without a leading #', () => {
    const [hex] = parseText('0000ff')
    expect(hex).toEqual(['00', '00', 'ff'])
  })

  it('parses a 3-character shorthand hex string', () => {
    const [hex, rgb] = parseText('#f00')
    expect(hex).toEqual(['ff', '00', '00'])
    expect(rgb).toEqual([255, 0, 0])
  })
})

describe('parseText — rgb() input', () => {
  it('parses an rgb() string into hex, RGB, and HSL', () => {
    const [hex, rgb, hsl] = parseText('rgb(0, 128, 0)')
    expect(rgb).toEqual([0, 128, 0])
    expect(hex).toEqual(['00', '80', '00'])
    expect(hsl).toEqual([120, '100%', '25%'])
  })

  it('derives consistent hex from the rgb values', () => {
    const [hex, rgb] = parseText('rgb(255, 0, 0)')
    expect(hex).toEqual(['ff', '00', '00'])
    expect(rgb).toEqual([255, 0, 0])
  })
})

describe('parseText — hsl() input', () => {
  it('parses an hsl() string into hex, RGB, and HSL', () => {
    const [hex, rgb, hsl] = parseText('hsl(240, 100%, 50%)')
    expect(hsl).toEqual([240, '100%', '50%'])
    expect(rgb).toEqual([0, 0, 255])
    expect(hex).toEqual(['00', '00', 'ff'])
  })
})

describe('parseText — invalid input', () => {
  it('falls back to the supplied default hex for unrecognised input', () => {
    const [hex] = parseText('not-a-color', '#ff0000')
    expect(hex).toEqual(['ff', '00', '00'])
  })

  it('falls back to black when no default is provided', () => {
    const [hex] = parseText('not-a-color')
    expect(hex).toEqual(['00', '00', '00'])
  })

  it('rejects partial hex strings', () => {
    const [hex] = parseText('#gg0000', '#0000ff')
    expect(hex).toEqual(['00', '00', 'ff'])
  })
})
