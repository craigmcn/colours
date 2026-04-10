import type { Hex, RGB, HSL } from '../types/colour'
import { hex2Rgb, rgb2Hsl, rgb2Hex, hsl2Rgb } from './convertColours'

export const splitHex = (hex?: string): Hex => {
  if (!hex) return ['00', '00', '00']
  const h = hex.replace('#', '').toLowerCase()
  if (!h.match(/^[a-f0-9]{3}$/) && !h.match(/^[a-f0-9]{6}$/)) return ['00', '00', '00']
  if (h.length === 3) {
    return h.split('').map(c => c + c) as Hex
  }
  const a = h.match(/^(.{2})(.{2})(.{2})$/)! // This regex will always match because of the previous checks
  return [a[1], a[2], a[3]] as Hex
}

const clampRgb = (v: number): number => Math.min(255, Math.max(0, v))

export const splitRgb = (rgb?: string): RGB => {
  if (!rgb) return [0, 0, 0]
  const m = rgb.match(/^rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\)$/)
  if (!m) return [0, 0, 0]
  return [clampRgb(Number(m[1])), clampRgb(Number(m[2])), clampRgb(Number(m[3]))]
}

export const splitHsl = (hsl?: string): [number, string, string] => {
  if (!hsl) return [0, '0%', '0%']
  const m = hsl.match(/^hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\)$/)
  if (!m) return [0, '0%', '0%']
  return [Number(m[1]), m[2], m[3]]
}

export const parseText = (text: string, defaultHex?: string): [Hex, RGB, HSL] => {
  let hex: Hex, rgb: RGB, hsl: HSL
  const match = text.match(
    /^((#)?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))$|^(rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\))$|^(hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\))$/,
  )
  if (!match) {
    hex = splitHex(defaultHex)
    rgb = hex2Rgb(hex)
    hsl = rgb2Hsl(rgb)
  } else {
    if (match[1]) {
      hex = splitHex(match[3])
      rgb = hex2Rgb(hex)
      hsl = rgb2Hsl(rgb)
    } else if (match[4]) {
      rgb = [clampRgb(Number(match[5])), clampRgb(Number(match[6])), clampRgb(Number(match[7]))]
      hex = rgb2Hex(rgb, false)
      hsl = rgb2Hsl(rgb)
    } else {
      rgb = hsl2Rgb([Number(match[9]), match[10]!, match[11]!])
      hex = rgb2Hex(rgb, false)
      hsl = [Number(match[9]), match[10] + '%', match[11] + '%']
    }
  }
  return [hex, rgb, hsl]
}
