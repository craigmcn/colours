import { contrastRatio, contrastTextColor } from './contrastRatio'
import { hex2Rgb } from './convertColours'
import { splitHex } from './parseValues'
import { passFail } from './passFail'

const updateContrast = obj => {
  Object.keys(obj).forEach(k => {
    document.getElementById(k).querySelector('.contrast__value').innerText =
      obj[k]
    passFail(k, obj[k])
  })
}

const updateFocusStyle = linkColor => {
  const exLinkStyle = document.getElementById('exLinkStyle')
  if (exLinkStyle) exLinkStyle.remove()
  const styles = `.exLink:focus{ box-shadow: 0 0 0 0.2rem rgba(${linkColor},0.5) }`
  const styleTag = document.createElement('style')
  styleTag.id = 'exLinkStyle'
  if (styleTag.styleSheet) {
    styleTag.styleSheet.cssText = styles
  } else {
    styleTag.appendChild(document.createTextNode(styles))
  }
  document.getElementsByTagName('head')[0].appendChild(styleTag)
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

export const updateExample = () => {
  const linkColor = document.getElementById('linkColor')
  const textColor = document.getElementById('textColor')
  const bgColor = document.getElementById('bgColor')
  const exBgEl = document.querySelector('.exBg')
  const selector = '.swatch__compare + .swatch__values > .value-hex'
  const exLink =
    linkColor.closest('.card').querySelector(selector).innerText ||
    linkColor.dataset.default
  const exText =
    textColor.closest('.card').querySelector(selector).innerText ||
    textColor.dataset.default
  const exBg =
    bgColor.closest('.card').querySelector(selector).innerText ||
    bgColor.dataset.default
  const linkRgb = hex2Rgb(splitHex(exLink))
  const textRgb = hex2Rgb(splitHex(exText))
  const exBgRgb = hex2Rgb(splitHex(exBg))
  const link2Body = contrastRatio(linkRgb, textRgb)
  const link2Bg = contrastRatio(linkRgb, exBgRgb)
  const body2Bg = contrastRatio(textRgb, exBgRgb)

  document.querySelector('.exLink').style.color = exLink
  document.querySelector('.exText').style.color = exText
  exBgEl.style.backgroundColor = exBg
  exBgEl.style.borderColor = exText

  updateFocusStyle(linkRgb)
  updateContrast({ link2Body, link2Bg, body2Bg })
}

export const updateSwatch = (id, hex, rgb, hsl) => {
  const target = document.getElementById(id)
  target.style.backgroundColor = `rgb(${rgb.join(',')}`
  target.style.color = contrastTextColor(rgb)
  target.querySelector('.js-hex').innerText = `#${hex.join('')}`
  target.querySelector('.js-rgb').innerText = `rgb(${rgb.join(', ')})`
  target.querySelector('.js-hsl').innerText = `hsl(${hsl.join(', ')})`

  id === 'resSwatch' && updateCopy(hex, rgb, hsl)
}

export const updateValues = (el, hex, rgb, hsl) => {
  el.querySelectorAll('.value-rgb').forEach(
    val => (val.innerText = `rgb(${rgb.join(', ')})`)
  )
  el.querySelectorAll('.value-hsl').forEach(
    val => (val.innerText = `hsl(${hsl.join(', ')})`)
  )
  el.querySelectorAll('.value-hex').forEach(
    val => (val.innerText = `#${hex.join('')}`)
  )
}
