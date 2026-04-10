import type { RGB } from '../types/colour'
import namedColors from '../data/named-colors.json'

const distance = ([r1, g1, b1]: RGB, arr: number[]): number =>
  Math.sqrt((arr[0] - r1) ** 2 + (arr[1] - g1) ** 2 + (arr[2] - b1) ** 2)

export const nearestNamedColor = (color: RGB): string => {
  const namedColor = (namedColors as Array<{ name: string; rgb: { array: number[] } }>).reduce<[string | undefined, number]>(
    (r, c) => {
      const currentDistance = distance(color, c.rgb.array)
      if (currentDistance < r[1]) {
        return [c.name, currentDistance]
      }
      return r
    },
    [undefined, 1000],
  )
  return namedColor[0] ?? 'unknown'
}
