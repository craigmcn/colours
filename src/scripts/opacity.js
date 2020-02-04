/* Opacity
 * splitHex, hex2Rgb, rgb2Hex, rgb2Hsl, hsl2Rgb, rL already imported in index.js
 */

import {
  calculateColorArray,
  calculateOpacity,
  updateCopy,
  updateSwatch,
} from './calculate'
import { initClipboardCopy } from './clipboard'
import { addWarning, clearWarnings } from './warnings'

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
    resRGB = calculateColorArray(0.25, bgRGB, fgRGB) // default opacity = 0.25
    updateSwatch(
      el.dataset.target,
      rgb2Hex(resRGB, false),
      resRGB,
      rgb2Hsl(resRGB)
    )
    updateCopy(rgb2Hex(resRGB, false), resRGB, rgb2Hsl(resRGB))
  }
})

Array.from(opacityColor).forEach(i =>
  i.addEventListener('input', e => {
    clearWarnings()
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

    if (el.id === 'bg') {
      bgHEX = hex
      bgRGB = rgb
      bgHSL = hsl
    } else if (el.id === 'fg') {
      fgHEX = hex
      fgRGB = rgb
      fgHSL = hsl
    } else if (el.id === 'res') {
      if (!el.value) {
        rgb = calculateColorArray(opacityDec, bgRGB, fgRGB)
        hex = rgb2Hex(rgb, false)
        hsl = rgb2Hsl(rgb)
      }
      resHEX = hex
      resRGB = rgb
      resHSL = hsl
    }
    updateSwatch(el.dataset.target, hex, rgb, hsl)
    el.dataset.target === 'resSwatch' && updateCopy(hex, rgb, hsl)

    if (el.id === 'bg' || el.id === 'fg') {
      // calculate resulting colour
      resRGB = calculateColorArray(0.25, bgRGB, fgRGB) // default opacity = 0.25
      updateSwatch('resSwatch', rgb2Hex(resRGB, false), resRGB, rgb2Hsl(resRGB))
      updateCopy(rgb2Hex(resRGB, false), resRGB, rgb2Hsl(resRGB))
    }
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
    clearWarnings()
    const el = e.target

    // Calculate remaining value
    if (el.id === 'res' && el.value) {
      // calculate resulting opacity
      const tmpOpacity = resRGB
        .map((c, i) => calculateOpacity(bgRGB[i], fgRGB[i], c))
        .filter(o => (o > 0 ? o : false))

      opacityDec = tmpOpacity.reduce((a, c) => a + c, 0) / tmpOpacity.length
      document.getElementById('opacityDec').innerHTML = opacityDec.toPrecision(
        3
      )
      document.getElementById('opacityPercent').innerHTML = `${(
        opacityDec * 100
      ).toPrecision(3)}%`
      document.getElementById('opacity').value = `${(
        opacityDec * 100
      ).toPrecision(3)}%`

      // calculate resulting colour
      const resRGBNew = calculateColorArray(opacityDec, bgRGB, fgRGB)
      if (resRGBNew.join(',') !== resRGB.join(',')) {
        addWarning(
          el,
          `${el.value} is not a valid transparency result. New result uses average opacity.`
        )
        updateSwatch(
          el.dataset.target,
          rgb2Hex(resRGBNew, false),
          resRGBNew,
          rgb2Hsl(resRGBNew)
        )
        updateCopy(rgb2Hex(resRGBNew, false), resRGBNew, rgb2Hsl(resRGBNew))
      }
      document.getElementById('opacity').value = opacityDec * 100
    } else if (el.id === 'opacity') {
      // calculate resulting colour
      resRGB = calculateColorArray(opacityDec, bgRGB, fgRGB)

      updateSwatch(
        el.dataset.target,
        rgb2Hex(resRGB, false),
        resRGB,
        rgb2Hsl(resRGB)
      )
      updateCopy(rgb2Hex(resRGB, false), resRGB, rgb2Hsl(resRGB))
    }
  })
)

initClipboardCopy()
