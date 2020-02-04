const splitHex = hex => {
  if (!hex) return ['00', '00', '00']
  const h = hex.replace('#', '').toLowerCase()
  if (!h.match(/^[a-f0-9]{3}$/) && !h.match(/^[a-f0-9]{6}$/))
    return ['00', '00', '00']
  if (h.length === 3) {
    return h.split('').map(c => c + c)
  } else {
    const a = h.match(/^(.{2})(.{2})(.{2})$/)
    return [a[1], a[2], a[3]]
  }
}

const splitRgb = rgb => {
  if (!rgb) return [0, 0, 0]
  const m = rgb.match(/^rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\)$/)
  return [m[1], m[2], m[3]]
}

const splitHsl = hsl => {
  if (!hsl) return [0, '0%', '0%']
  const m = hsl.match(/^hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\)$/)
  return [m[1], m[2], m[3]]
}

export { splitHex, splitRgb, splitHsl }
