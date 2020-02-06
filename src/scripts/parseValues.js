import { hex2Rgb, rgb2Hsl, rgb2Hex } from './convertColours'

export const splitHex = hex => {
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

export const splitRgb = rgb => {
  if (!rgb) return [0, 0, 0]
  const m = rgb.match(/^rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\)$/)
  return [m[1], m[2], m[3]]
}

export const splitHsl = hsl => {
  if (!hsl) return [0, '0%', '0%']
  const m = hsl.match(/^hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\)$/)
  return [m[1], m[2], m[3]]
}

export const parseText = (text, defaultHex) => {
  let hex, rgb, hsl
  const match = text.match(
    /^((#)?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\))|(hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\))$/
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
      rgb = [match[5], match[6], match[7]]
      hex = rgb2Hex(rgb, false)
      hsl = rgb2Hsl(rgb)
    } else {
      rgb = hsl2Rgb([match[9], match[10], match[11]])
      hex = rgb2Hex(rgb, false)
      hsl = [match[9], match[10] + '%', match[11] + '%']
    }
  }
  return [hex, rgb, hsl]
}
