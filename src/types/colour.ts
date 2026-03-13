// Hex as array of two-char strings: ['ff', '00', 'aa']
export type Hex = [string, string, string]

// RGB as array of numbers: [255, 0, 170]
export type RGB = [number, number, number]

// HSL as tuple: [240, '100%', '50%']
export type HSL = [number, string, string]

export interface ColorValue {
  hex: Hex
  rgb: RGB
  hsl: HSL
}

export type WcagLevel = 'A' | 'AA' | 'AAA'

export interface ContrastColor {
  hex: Hex
  rgb: RGB
  hsl: HSL
  direction: 'L' | 'D'
}

export interface ContrastColors {
  A: ContrastColor
  AA: ContrastColor
  AAA: ContrastColor
}
