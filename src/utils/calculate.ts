import type { RGB } from '../types/colour'

const calculateColorSingle = (o: number, b: number, f: number): number =>
  Math.round((1 - o) * b + o * f)

export const calculateColorArray = (o: number, b: RGB, f: RGB): RGB =>
  f.map((c, i) => {
    const r = calculateColorSingle(o, b[i], c)
    return isNaN(r) ? 0 : r
  }) as RGB

export const calculateFg = (o: number, bg: RGB, result: RGB): RGB =>
  result.map((r, i) => {
    if (o === 0) return 0
    const v = (r - (1 - o) * bg[i]) / o
    return isNaN(v) ? 0 : Math.round(Math.max(0, Math.min(255, v)))
  }) as RGB

export const calculateBg = (o: number, fg: RGB, result: RGB): RGB =>
  result.map((r, i) => {
    if (o === 1) return 0
    const v = (r - o * fg[i]) / (1 - o)
    return isNaN(v) ? 0 : Math.round(Math.max(0, Math.min(255, v)))
  }) as RGB

export const calculateOpacity = (b: number, f: number, r: number): number => {
  const o = Math.max(Math.min((b - r) / (b - f), 1), 0)
  return isNaN(o) ? 0 : o
}

export const useDecimal = (value: number): number | string =>
  Number.isInteger(value) ? value : value.toFixed(2)
