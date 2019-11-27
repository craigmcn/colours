import '../styles/index.scss'

/* https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
 * This polyfill adds compatibility to all Browsers supporting ES5
 */
;(function() {
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach
  }
})()

const splitHex = hex => {
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
  const m = rgb.match(/^rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\)$/)
  return [m[1], m[2], m[3]]
}

const splitHsl = hsl => {
  const m = hsl.match(/^hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\)$/)
  return [m[1], m[2], m[3]]
}

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
  if (asString) {
    return '#' + a.join('')
  }
  return a
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
    Math.round(l * 100, 0) + '%'
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

const sRgb = c => {
  const s = c / 255
  if (s <= 0.03928) {
    return s / 12.92
  } else {
    return Math.pow((s + 0.055) / 1.055, 2.4)
  }
}

const rL = ([r, g, b]) => 0.2126 * sRgb(r) + 0.7152 * sRgb(g) + 0.0722 * sRgb(b)

const contrastRatio = ([r1, g1, b1], [r2, g2, b2]) => {
  const rL1 = rL([r1, g1, b1]),
    rL2 = rL([r2, g2, b2]),
    l = rL1 > rL2 ? rL1 : rL2,
    d = rL1 > rL2 ? rL2 : rL1
  return parseFloat((l + 0.05) / (d + 0.05)).toFixed(2)
}

const inputColor = document.querySelectorAll('.js-inputColor')
Array.from(inputColor).forEach(i =>
  i.addEventListener('input', e => {
    const el = e.target,
      card = el.closest('.card'),
      val = el.value,
      match = val.match(
        /^((#)?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))|(rgb\((\d{1,3}),[\s]?(\d{1,3}),[\s]?(\d{1,3})\))|(hsl\((\d{1,3}),[\s]?(\d{1,3})%,[\s]?(\d{1,3})%\))$/
      )
    let hex = splitHex(el.dataset.default),
      rgb = hex2Rgb(hex),
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

update()
