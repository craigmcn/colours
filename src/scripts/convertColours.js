const hex2Rgb = (hex = ['00', '00', '00']) =>
  hex.reduce((r, c) => {
    r.push(parseInt(c, 16))
    return r
  }, [])

const rgb2Hex = (rgb = [0, 0, 0], asString = true) => {
  const a = rgb.map(c =>
    parseInt(c)
      .toString(16)
      .padStart(2, '0')
  )
  return asString ? '#' + a.join('') : a
}

const rgb2Hsl = ([r, g, b]) => {
  const _r = r / 255,
    _g = g / 255,
    _b = b / 255,
    cMax = Math.max(_r, _g, _b),
    cMin = Math.min(_r, _g, _b),
    _d = cMax - cMin,
    l = (cMax + cMin) / 2,
    s = _d === 0 ? 0 : _d / (1 - Math.abs(2 * l - 1))
  let h
  if (_d === 0) {
    h = 0
  } else if (cMax === _r) {
    h = 60 * (((_g - _b) / _d) % 6)
  } else if (cMax === _g) {
    h = 60 * ((_b - _r) / _d + 2)
  } else {
    h = 60 * ((_r - _g) / _d + 4)
  }
  if (h < 0) h += 360
  return [
    Math.round(h, 0),
    Math.round(s * 100, 0) + '%',
    Math.round(l * 100, 0) + '%',
  ]
}

const hsl2Rgb = ([h, s, l]) => {
  const C = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100),
    X = C * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l / 100 - C / 2
  let r, g, b
  if (h >= 0 && h < 60) {
    r = C
    ;(g = X), (b = 0)
  } else if (h >= 60 && h < 120) {
    r = X
    ;(g = C), (b = 0)
  } else if (h >= 120 && h < 180) {
    r = 0
    ;(g = C), (b = X)
  } else if (h >= 180 && h < 240) {
    r = 0
    ;(g = X), (b = C)
  } else if (h >= 240 && h < 300) {
    r = X
    ;(g = 0), (b = C)
  } else {
    r = C
    ;(g = 0), (b = X)
  }
  return [r, g, b].map(c => Math.round((c + m) * 255, 0))
}

export { hex2Rgb, rgb2Hex, rgb2Hsl, hsl2Rgb }
