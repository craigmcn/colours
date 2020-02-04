import { splitHex, splitHsl } from './parseValues'
import { hex2Rgb, rgb2Hex, rgb2Hsl, hsl2Rgb } from './convertColours'
import { contrastRatio, rL } from './contrastRatio'

let hex, rgb, hsl

/* Index */
const inputColor = document.querySelectorAll('.js-inputColor')
Array.from(inputColor).forEach(i =>
  i.addEventListener('input', e => {
    const el = e.target,
      card = el.closest('.card'),
      val = el.value,
      match = val.match(
        /^((#)?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\))|(hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\))$/
      )
    hex = splitHex(el.dataset.default)
    rgb = hex2Rgb(hex)
    hsl = rgb2Hsl(rgb)
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
    }
    card
      .querySelectorAll('.value-rgb')
      .forEach(val => (val.innerHTML = `rgb(${rgb.join(', ')})`))
    card
      .querySelectorAll('.value-hsl')
      .forEach(val => (val.innerHTML = `hsl(${hsl.join(', ')})`))
    card
      .querySelectorAll('.value-hex')
      .forEach(val => (val.innerHTML = `#${hex.join('')}`))
    card.querySelector('.swatch__source').style.backgroundColor = `#${hex.join(
      ''
    )}`
    card.querySelector(
      '.swatch__compare'
    ).style.backgroundColor = `hsl(${hsl.join(', ')})`
    card.querySelector('.saturation').value = hsl[1].substring(
      0,
      hsl[1].length - 1
    )
    card.querySelector('.lightness').value = hsl[2].substring(
      0,
      hsl[2].length - 1
    )
    update()
  })
)

const update = () => {
  const exLink =
      document
        .getElementById('linkColor')
        .closest('.card')
        .querySelector('.swatch__compare + .swatch__values > .value-hex')
        .innerText || document.getElementById('linkColor').dataset.default,
    exText =
      document
        .getElementById('textColor')
        .closest('.card')
        .querySelector('.swatch__compare + .swatch__values > .value-hex')
        .innerText || document.getElementById('textColor').dataset.default,
    exBg =
      document
        .getElementById('bgColor')
        .closest('.card')
        .querySelector('.swatch__compare + .swatch__values > .value-hex')
        .innerText || document.getElementById('bgColor').dataset.default,
    link2Body = contrastRatio(
      hex2Rgb(splitHex(exLink)),
      hex2Rgb(splitHex(exText))
    ),
    link2Bg = contrastRatio(hex2Rgb(splitHex(exLink)), hex2Rgb(splitHex(exBg))),
    body2Bg = contrastRatio(hex2Rgb(splitHex(exText)), hex2Rgb(splitHex(exBg)))

  document.querySelector('.exText').style.color = exText
  document.querySelector('.exLink').style.color = exLink
  const exLinkStyle = document.getElementById('exLinkStyle')
  if (exLinkStyle) exLinkStyle.remove()
  const styles = `.exLink:focus{ box-shadow: 0 0 0 0.2rem rgba(${hex2Rgb(
    splitHex(exLink)
  )},0.5) }`
  const styleTag = document.createElement('style')
  styleTag.id = 'exLinkStyle'
  if (styleTag.styleSheet) {
    styleTag.styleSheet.cssText = styles
  } else {
    styleTag.appendChild(document.createTextNode(styles))
  }
  document.getElementsByTagName('head')[0].appendChild(styleTag)
  document.querySelector('.exBg').style.backgroundColor = exBg
  document.querySelector('.exBg').style.borderColor = exText

  document
    .getElementById('link2Body')
    .querySelector('.contrast__value').innerText = link2Body
  document
    .getElementById('link2Bg')
    .querySelector('.contrast__value').innerText = link2Bg
  document
    .getElementById('body2Bg')
    .querySelector('.contrast__value').innerText = body2Bg

  if (link2Body < 3) {
    document.getElementById('link2Body').classList.remove('pass')
    document
      .getElementById('link2Body')
      .querySelector('.label--wcagA>span')
      .classList.remove('pass')
    document
      .getElementById('link2Body')
      .querySelector('.label--wcagA>span').innerText = 'Fail'
  } else {
    document.getElementById('link2Body').classList.add('pass')
    document
      .getElementById('link2Body')
      .querySelector('.label--wcagA>span')
      .classList.add('pass')
    document
      .getElementById('link2Body')
      .querySelector('.label--wcagA>span').innerText = 'Pass'
  }

  if (link2Bg < 4.5) {
    document.getElementById('link2Bg').classList.remove('pass')
    document
      .getElementById('link2Bg')
      .querySelector('.label--wcagAA>span')
      .classList.remove('pass')
    document
      .getElementById('link2Bg')
      .querySelector('.label--wcagAA>span').innerText = 'Fail'
    document
      .getElementById('link2Bg')
      .querySelector('.label--wcagAAA>span')
      .classList.remove('pass')
    document
      .getElementById('link2Bg')
      .querySelector('.label--wcagAAA>span').innerText = 'Fail'
  } else {
    document.getElementById('link2Bg').classList.add('pass')
    document
      .getElementById('link2Bg')
      .querySelector('.label--wcagAA>span')
      .classList.add('pass')
    document
      .getElementById('link2Bg')
      .querySelector('.label--wcagAA>span').innerText = 'Pass'
    if (link2Bg < 7) {
      document
        .getElementById('link2Bg')
        .querySelector('.label--wcagAAA>span')
        .classList.remove('pass')
      document
        .getElementById('link2Bg')
        .querySelector('.label--wcagAAA>span').innerText = 'Fail'
    } else {
      document.getElementById('link2Bg').classList.add('pass')
      document
        .getElementById('link2Bg')
        .querySelector('.label--wcagAA>span')
        .classList.add('pass')
      document
        .getElementById('link2Bg')
        .querySelector('.label--wcagAA>span').innerText = 'Pass'
      document
        .getElementById('link2Bg')
        .querySelector('.label--wcagAAA>span')
        .classList.add('pass')
      document
        .getElementById('link2Bg')
        .querySelector('.label--wcagAAA>span').innerText = 'Pass'
    }
  }

  if (body2Bg < 4.5) {
    document.getElementById('body2Bg').classList.remove('pass')
    document
      .getElementById('body2Bg')
      .querySelector('.label--wcagAA>span')
      .classList.remove('pass')
    document
      .getElementById('body2Bg')
      .querySelector('.label--wcagAA>span').innerText = 'Fail'
    document
      .getElementById('body2Bg')
      .querySelector('.label--wcagAAA>span')
      .classList.remove('pass')
    document
      .getElementById('body2Bg')
      .querySelector('.label--wcagAAA>span').innerText = 'Fail'
  } else {
    document.getElementById('body2Bg').classList.add('pass')
    document
      .getElementById('body2Bg')
      .querySelector('.label--wcagAA>span')
      .classList.add('pass')
    document
      .getElementById('body2Bg')
      .querySelector('.label--wcagAA>span').innerText = 'Pass'
    if (body2Bg < 7) {
      document
        .getElementById('body2Bg')
        .querySelector('.label--wcagAAA>span')
        .classList.remove('pass')
      document
        .getElementById('body2Bg')
        .querySelector('.label--wcagAAA>span').innerText = 'Fail'
    } else {
      document.getElementById('body2Bg').classList.add('pass')
      document
        .getElementById('body2Bg')
        .querySelector('.label--wcagAA>span')
        .classList.add('pass')
      document
        .getElementById('body2Bg')
        .querySelector('.label--wcagAA>span').innerText = 'Pass'
      document
        .getElementById('body2Bg')
        .querySelector('.label--wcagAAA>span')
        .classList.add('pass')
      document
        .getElementById('body2Bg')
        .querySelector('.label--wcagAAA>span').innerText = 'Pass'
    }
  }
}

const ctrlSaturation = document.querySelectorAll('.saturation')
const ctrlLightness = document.querySelectorAll('.lightness')

Array.from(ctrlSaturation).forEach(i =>
  i.addEventListener('input', e => {
    const swatch = e.target
      .closest('.swatches')
      .querySelector('.swatch--compare')
    let hsl = splitHsl(swatch.querySelector('.value-hsl').innerText)
    hsl[1] = e.target.value
    const rgb = hsl2Rgb(hsl)
    const hex = rgb2Hex(rgb, false)
    hsl[1] += '%'
    hsl[2] += '%'
    swatch.querySelector('.value-rgb').innerText = `rgb(${rgb.join(', ')})`
    swatch.querySelector('.value-hsl').innerText = `hsl(${hsl.join(', ')})`
    swatch.querySelector('.value-hex').innerText = `#${hex.join('')}`
    swatch.querySelector(
      '.swatch__compare'
    ).style.backgroundColor = `hsl(${hsl.join(', ')})`
    update()
  })
)

Array.from(ctrlLightness).forEach(i =>
  i.addEventListener('input', e => {
    const swatch = e.target
      .closest('.swatches')
      .querySelector('.swatch--compare')
    let hsl = splitHsl(swatch.querySelector('.value-hsl').innerText)
    hsl[2] = e.target.value
    const rgb = hsl2Rgb(hsl)
    const hex = rgb2Hex(rgb, false)
    hsl[1] += '%'
    hsl[2] += '%'
    swatch.querySelector('.value-rgb').innerText = `rgb(${rgb.join(', ')})`
    swatch.querySelector('.value-hsl').innerText = `hsl(${hsl.join(', ')})`
    swatch.querySelector('.value-hex').innerText = `#${hex.join('')}`
    swatch.querySelector(
      '.swatch__compare'
    ).style.backgroundColor = `hsl(${hsl.join(', ')})`
    update()
  })
)

if (inputColor.length) update()
