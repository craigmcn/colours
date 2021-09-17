import { initClipboardCopy } from './clipboard'
import { contrastTextColor, getContrastColour } from './contrastRatio'
import { rgb2Hex, hsl2Rgb, hex2Str, hsl2Str, hex2Rgb } from './convertColours'
import { splitHsl, parseText, splitHex } from './parseValues'
import { updateValues, updateExample, updateCopy, updateColor } from './update'

const inputColor = document.querySelectorAll('.js-inputColor')
inputColor.forEach(el =>
    el.addEventListener('input', () => {
        const card = el.closest('.card')
        const val = el.value
        const [hex, rgb, hsl] = parseText(val, el.dataset.default)

        updateValues(card, hex, rgb, hsl, true)

        const source = card.querySelector('.swatch__source')
        const compare = card.querySelector(
            '.swatch__compare',
        )
        const textColor = contrastTextColor(rgb)

        source.style.backgroundColor = hex2Str(hex)
        source.style.color = hex2Str(textColor.AAA.hex)
        compare.style.backgroundColor = hsl2Str(hsl)
        compare.style.color = hex2Str(textColor.AAA.hex)

        updateExample()
        updateCopy(hex, rgb, hsl, card.querySelector('.card__body'))
    }),
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

        updateValues(swatch, hex, rgb, hsl, false)

        const compare = swatch.querySelector(
            '.swatch__compare',
        )
        const textColor = contrastTextColor(rgb)

        compare.style.backgroundColor = hsl2Str(hsl)
        compare.style.color = hex2Str(textColor.AAA.hex)

        updateExample()
        updateCopy(hex, rgb, hsl, e.target.closest('.card__body'))
    }),
)

document.querySelectorAll('.js-calculateWcag').forEach(el => {
    el.addEventListener('click', e => {
        const bgColorCard = document.getElementById('bgColor').closest('.card__body')
        const bgColor = bgColorCard.querySelector('.swatch__compare > .swatch__values > .value-hex').innerText

        const hex = splitHex(bgColor)
        const rgb = hex2Rgb(hex)
        const wcag = contrastTextColor(rgb)
        const { hex: textHex, rgb: textRgb, hsl: textHsl, direction } = wcag[el.dataset.wcag]

        const textColor = document.getElementById('textColor')
        const textColorCard = textColor.closest('.card__body')
        const textColorCardColor = contrastTextColor(textRgb)

        textColor.value = hex2Str(textHex)
        updateValues(textColorCard, textHex, textRgb, textHsl, true)
        updateColor(textColorCard, textHex, textColorCardColor.AAA.hex)

        const { hex: linkHex, rgb: linkRgb, hsl: linkHsl } = getContrastColour({ color: textRgb, wcag: 'A', direction })
        const linkColor = document.getElementById('linkColor')
        const linkColorCard = linkColor.closest('.card__body')
        const linkColorCardColor = contrastTextColor(linkRgb)

        linkColor.value = hex2Str(linkHex)
        updateValues(linkColorCard, linkHex, linkRgb, linkHsl, true)
        updateColor(linkColorCard, linkHex, linkColorCardColor.AAA.hex)

        updateExample()

        el.blur()
    })
})

if (inputColor.length) {
    updateExample()
    inputColor.forEach(el => {
        const val = el.value
        const [hex, rgb, hsl] = parseText(val, el.dataset.default)

        updateCopy(hex, rgb, hsl, el.closest('.card__body'))
    })
}

initClipboardCopy()
