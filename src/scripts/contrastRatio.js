export const sRgb = c => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export const rL = ([r, g, b]) =>
  0.2126 * sRgb(r) + 0.7152 * sRgb(g) + 0.0722 * sRgb(b)

export const contrastRatio = ([r1, g1, b1], [r2, g2, b2]) => {
  const rL1 = rL([r1, g1, b1]),
    rL2 = rL([r2, g2, b2]),
    l = rL1 > rL2 ? rL1 : rL2,
    d = rL1 > rL2 ? rL2 : rL1
  return parseFloat((l + 0.05) / (d + 0.05)).toFixed(2)
}

export const contrastTextColor = color =>
  rL(color) <= 0.1833 ? 'white' : 'black'
