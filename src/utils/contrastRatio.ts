import type { RGB, ContrastColor, ContrastColors, WcagLevel } from '../types/colour'
import { hsl2Rgb, rgb2Hex, rgb2Hsl } from './convertColours'

const sRgb = (c: number): number => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

const rL = ([r, g, b]: RGB): number =>
  0.2126 * sRgb(r) + 0.7152 * sRgb(g) + 0.0722 * sRgb(b)

export const contrastRatio = (c1: RGB, c2: RGB): number => {
  const rL1 = rL(c1)
  const rL2 = rL(c2)
  const l = rL1 > rL2 ? rL1 : rL2
  const d = rL1 > rL2 ? rL2 : rL1
  return (l + 0.05) / (d + 0.05)
}

export const contrastTextColor = (color: RGB): ContrastColors => ({
  A: getContrastColour({ color, wcag: 'A' }),
  AA: getContrastColour({ color }),
  AAA: getContrastColour({ color, wcag: 'AAA' }),
})

export const getContrastColour = ({
  color,
  wcag = 'AA',
  direction,
}: {
  color: RGB
  wcag?: WcagLevel
  direction?: 'L' | 'D'
}): ContrastColor => {
  let dir = direction
  const hslRaw = rgb2Hsl(color)
  const h = hslRaw[0]
  const s = parseInt(hslRaw[1])
  let l = parseInt(hslRaw[2])

  if (!dir) {
    dir = rL(color) <= 0.1833 ? 'L' : 'D'
  }

  const ratio = wcag === 'AA' ? 4.5 : wcag === 'A' ? 3 : 7
  const limit = dir === 'L' ? 100 : 0
  let retHsl: [number, number, number] = [h, s, l]
  let retRgb = hsl2Rgb(retHsl)

  while (
    contrastRatio(color, retRgb) < ratio &&
    ((limit === 0 && l > limit) || (limit === 100 && l < limit))
  ) {
    l += dir === 'L' ? 1 : -1
    retHsl = [h, s, l]
    retRgb = hsl2Rgb(retHsl)
  }

  return {
    hex: rgb2Hex(retRgb, false),
    rgb: retRgb,
    hsl: [retHsl[0], `${retHsl[1]}%`, `${retHsl[2]}%`],
    direction: dir,
  }
}
