import { contrastTextColor } from './contrastRatio'

const calculateColorSingle = (o, b, f) => Math.round((1 - o) * b + o * f)

export const calculateColorArray = (o, b, f) =>
  f.map((c, i) => {
    const r = calculateColorSingle(o, b[i], c)
    return isNaN(r) ? 0 : r
  })

export const calculateOpacity = (b, f, r) => {
  const o = Math.max(Math.min((b - r) / (b - f), 1), 0)
  return isNaN(o) ? 0 : o
}

export const updateSwatch = (id, hex, rgb, hsl) => {
  const target = document.getElementById(id)
  target.style.backgroundColor = `rgb(${rgb.join(',')}`
  target.style.color = contrastTextColor(rgb)
  target.querySelector('.js-hex').innerHTML = `#${hex.join('')}`
  target.querySelector('.js-rgb').innerHTML = `rgb(${rgb.join(', ')})`
  target.querySelector('.js-hsl').innerHTML = `hsl(${hsl.join(', ')})`
}

export const updateCopy = (hex, rgb, hsl) => {
  let copy = document.querySelector('.js-hex[data-copy]')
  let text = `#${hex.join('')}`
  copy.dataset.copy = text
  copy.title = `Copy ${text}`

  copy = document.querySelector('.js-rgb[data-copy]')
  text = `rgb(${rgb.join(', ')})`
  copy.dataset.copy = text
  copy.title = `Copy ${text}`

  copy = document.querySelector('.js-hsl[data-copy]')
  text = `hsl(${hsl.join(', ')})`
  copy.dataset.copy = text
  copy.title = `Copy ${text}`
}
