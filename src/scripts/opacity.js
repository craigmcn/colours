import { splitHex } from './parseValues'
import { hex2Rgb, rgb2Hex, rgb2Hsl, hsl2Rgb } from './convertColours'
import { rL } from './contrastRatio'
import '../styles/index.scss'

/* https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
 * This polyfill adds compatibility to all Browsers supporting ES5
 */
;(function() {
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach
  }
})()

let hex, rgb, hsl

let bgHEX,
  bgRGB,
  bgHSL,
  fgHEX,
  fgRGB,
  fgHSL,
  resHEX,
  resRGB,
  resHSL,
  opacityDec,
  opacityPercent

const opacityColor = document.querySelectorAll('.js-opacityColor')
const inputOpacity = document.querySelectorAll('.js-inputOpacity')
const calculateResult = document.querySelectorAll('.js-calculateResult')

const updateSwatch = (id, hex, rgb, hsl) => {
  const target = document.getElementById(id)
  target.style.backgroundColor = `rgb(${rgb.join(',')}`
  target.style.color = rL(rgb) <= 0.1833 ? 'white' : 'black'
  target.querySelector('.js-hex').innerHTML = `#${hex.join('')}`
  target.querySelector('.js-rgb').innerHTML = `rgb(${rgb.join(', ')})`
  target.querySelector('.js-hsl').innerHTML = `hsl(${hsl.join(', ')})`
}

// load foreground, background, result
Array.from(opacityColor).forEach(el => {
  if (el.id === 'bg' || el.id === 'fg') {
    hex = splitHex(el.dataset.default)
    rgb = hex2Rgb(hex)
    hsl = rgb2Hsl(rgb)

    if (el.id === 'bg') {
      bgRGB = rgb
    } else {
      fgRGB = rgb
    }

    updateSwatch(el.dataset.target, hex, rgb, hsl)
  } else {
    // calculate resulting colour
    resRGB = fgRGB.map(
      (c, i) => Math.round(0.75 * bgRGB[i] + 0.25 * c) // default opacity = 0.25
    )
    updateSwatch(
      el.dataset.target,
      rgb2Hex(resRGB, false),
      resRGB,
      rgb2Hsl(resRGB)
    )
  }
})

Array.from(opacityColor).forEach(i =>
  i.addEventListener('input', e => {
    const el = e.target,
      val = el.value,
      match = val.match(
        /^((#)?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\))|(hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\))$/
      )
    if (match) {
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
    } else {
      hex = splitHex(el.dataset.default)
      rgb = hex2Rgb(hex)
      hsl = rgb2Hsl(rgb)
    }

    if (el.id === 'bg' || el.id === 'fg') resetCalculateResult()

    if (el.id === 'bg') {
      bgHEX = hex
      bgRGB = rgb
      bgHSL = hsl
    } else if (el.id === 'fg') {
      fgHEX = hex
      fgRGB = rgb
      fgHSL = hsl
    } else if (el.id === 'res') {
      resHEX = hex
      resRGB = rgb
      resHSL = hsl
    }
    updateSwatch(el.dataset.target, hex, rgb, hsl)
  })
)

Array.from(inputOpacity).forEach(i =>
  i.addEventListener('input', e => {
    const el = e.target,
      val = +el.value
    opacityDec = (val / 100).toPrecision(3)
    opacityPercent = val.toPrecision(3)
    document.getElementById('opacityDec').innerHTML = opacityDec
    document.getElementById('opacityPercent').innerHTML = `${opacityPercent}%`
  })
)

Array.from(calculateResult).forEach(i =>
  i.addEventListener('input', e => {
    const el = e.target
    // Calculate remaining value
    if (el.id === 'res') {
      // calculate resulting opacity
      opacityDec = (bgRGB[0] - resRGB[0]) / (bgRGB[0] - fgRGB[0])
      document.getElementById('opacityDec').innerHTML = opacityDec.toPrecision(
        3
      )
      document.getElementById('opacityPercent').innerHTML = `${(
        opacityDec * 100
      ).toPrecision(3)}%`
      document.getElementById('opacity').value = `${(
        opacityDec * 100
      ).toPrecision(3)}%`
    } else if (el.id === 'opacity') {
      // calculate resulting colour
      resRGB = fgRGB.map((c, i) =>
        Math.round((1 - opacityDec) * bgRGB[i] + opacityDec * c)
      )

      document.getElementById('resHEX').innerHTML = `${rgb2Hex(resRGB, true)}`
      document.getElementById('resRGB').innerHTML = `rgb(${resRGB.join(', ')})`
      document.getElementById('resHSL').innerHTML = `hsl(${rgb2Hsl(resRGB).join(
        ', '
      )})`
      document.getElementById('res').value = `rgb(${resRGB.join(', ')})`
      const target = document.getElementById(el.dataset.target)
      target.style.backgroundColor = `rgb(${resRGB.join(',')}`
      target.style.color = rL(resRGB) >= 0.175 ? 'black' : 'white'
    }
  })
)

const resetCalculateResult = () => {
  Array.from(calculateResult).forEach(i => (i.value = i.dataset.default))
}
