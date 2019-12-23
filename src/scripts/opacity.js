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
      el.closest('div').style.backgroundColor = '#fff'
    }

    if (el.id === 'bg' || el.id === 'fg') resetCalculateResult()

    if (el.id === 'bg') {
      bgHEX = hex
      bgRGB = rgb
      bgHSL = hsl
      document.getElementById('bgHEX').innerHTML = `#${hex.join('')}`
      document.getElementById('bgRGB').innerHTML = `rgb(${rgb.join(', ')})`
      document.getElementById('bgHSL').innerHTML = `hsl(${hsl.join(', ')})`
    } else if (el.id === 'fg') {
      fgHEX = hex
      fgRGB = rgb
      fgHSL = hsl
      document.getElementById('fgHEX').innerHTML = `#${hex.join('')}`
      document.getElementById('fgRGB').innerHTML = `rgb(${rgb.join(', ')})`
      document.getElementById('fgHSL').innerHTML = `hsl(${hsl.join(', ')})`
    } else if (el.id === 'res') {
      resHEX = hex
      resRGB = rgb
      resHSL = hsl
      document.getElementById('resHEX').innerHTML = `#${hex.join('')}`
      document.getElementById('resRGB').innerHTML = `rgb(${rgb.join(', ')})`
      document.getElementById('resHSL').innerHTML = `hsl(${hsl.join(', ')})`
    }

    const target = document.getElementById(el.dataset.target)
    target.style.backgroundColor = `rgb(${rgb.join(',')}`
    target.style.color = rL(rgb) <= 0.1833 ? 'white' : 'black'
  })
)

Array.from(inputOpacity).forEach(i =>
  i.addEventListener('input', e => {
    const el = e.target,
      val = +el.value
    if (val > 1) {
      opacityDec = (val / 100).toPrecision(3)
      opacityPercent = val.toPrecision(3)
    } else {
      opacityDec = val.toPrecision(3)
      opacityPercent = (val * 100).toPrecision(3)
    }
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
      target.style.color = rL(resRGB) <= 0.1833 ? 'white' : 'black'
    }
  })
)

const resetCalculateResult = () => {
  Array.from(calculateResult).forEach(i => {
    i.value = ''
    const div = i.closest('div')
    div.style.backgroundColor = '#fff'
    Array.from(div.querySelectorAll('span')).forEach(s => (s.innerHTML = ''))
  })
}
