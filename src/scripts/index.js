import { rgb2Hex, hsl2Rgb, hex2Str, hsl2Str } from './convertColours'
import { splitHsl, parseText } from './parseValues'
import { updateValues, updateExample } from './update'

const inputColor = document.querySelectorAll('.js-inputColor')
inputColor.forEach(el =>
    el.addEventListener('input', () => {
        const card = el.closest('.card')
        const val = el.value
        const [hex, rgb, hsl] = parseText(val, el.dataset.default)

        updateValues(card, hex, rgb, hsl)

        card.querySelector('.swatch__source').style.backgroundColor = hex2Str(hex)
        card.querySelector(
            '.swatch__compare'
        ).style.backgroundColor = hsl2Str(hsl)
        card.querySelector('.saturation').value = hsl[1].substring(
            0,
            hsl[1].length - 1
        )
        card.querySelector('.lightness').value = hsl[2].substring(
            0,
            hsl[2].length - 1
        )
        updateExample()
    })
)

document.querySelectorAll('.saturation, .lightness').forEach(i =>
    i.addEventListener('input', e => {
        const swatch = e.target
            .closest('.swatches')
            .querySelector('.swatch--compare')
        const hsl = splitHsl(swatch.querySelector('.value-hsl').innerText)
        if (i.classList.contains('saturation')) {
            hsl[1] = e.target.value
        } else {
            hsl[2] = e.target.value
        }
        const rgb = hsl2Rgb(hsl)
        const hex = rgb2Hex(rgb, false)
        hsl[1] += '%'
        hsl[2] += '%'

        updateValues(swatch, hex, rgb, hsl)

        swatch.querySelector(
            '.swatch__compare'
        ).style.backgroundColor = hsl2Str(hsl)
        updateExample()
    })
)

if (inputColor.length) updateExample()
