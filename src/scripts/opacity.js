import { splitHex, parseText } from './parseValues'
import { hex2Rgb, rgb2Hex, rgb2Hsl } from './convertColours'
import { calculateColorArray, calculateOpacity, useDecimal } from './calculate'
import { initClipboardCopy } from './clipboard'
import { updateSwatch } from './update'
import { addWarning, clearWarnings } from './warnings'

const opacityColor = document.querySelectorAll('.js-opacityColor')
const opacityEl = document.getElementById('opacity')
const opacityDecEl = document.getElementById('opacityDec')
const opacityPercentEl = document.getElementById('opacityPercent')

let bgRGB, fgRGB, resRGB

// load foreground, background, result
opacityColor.forEach(el => {
    // on load
    let hex, rgb, hsl
    if (el.id === 'bg' || el.id === 'fg') {
        hex = splitHex(el.dataset.default)
        rgb = hex2Rgb(hex)
        hsl = rgb2Hsl(rgb)

        if (el.id === 'bg') {
            bgRGB = rgb
        } else {
            fgRGB = rgb
        }
    } else {
        resRGB = calculateColorArray(0.25, bgRGB, fgRGB) // default opacity = 0.25
        hex = rgb2Hex(resRGB, false)
        rgb = resRGB
        hsl = rgb2Hsl(resRGB)
    }
    updateSwatch(el.dataset.target, hex, rgb, hsl)

    // on input
    el.addEventListener('input', () => {
        clearWarnings()
        let [hex, rgb, hsl] = parseText(el.value, el.dataset.default)

        if (el.id === 'bg') {
            bgRGB = rgb
        } else if (el.id === 'fg') {
            fgRGB = rgb
        } else if (el.id === 'res') {
            if (!el.value) {
                rgb = calculateColorArray(opacityDecEl.value, bgRGB, fgRGB)
                hex = rgb2Hex(rgb, false)
                hsl = rgb2Hsl(rgb)
            }
            resRGB = rgb
        }
        updateSwatch(el.dataset.target, hex, rgb, hsl)

        if (el.id === 'bg' || el.id === 'fg') {
            // calculate resulting colour
            resRGB = calculateColorArray(0.25, bgRGB, fgRGB) // default opacity = 0.25
            hex = rgb2Hex(resRGB, false)
            hsl = rgb2Hsl(resRGB)
            updateSwatch('resSwatch', hex, resRGB, hsl)
        }
    })
})

if (opacityEl) {
    opacityEl.addEventListener('input', () => {
        const val = +opacityEl.value
        opacityDecEl.innerText = useDecimal(val / 100)
        opacityPercentEl.innerText = `${val.toFixed(0)}%`
    })
}

document.querySelectorAll('.js-calculateResult').forEach(el =>
    el.addEventListener('input', () => {
        clearWarnings()

        if (el.id === 'res' && el.value) {
            const tmpOpacity = resRGB
                .map((c, i) => calculateOpacity(bgRGB[i], fgRGB[i], c))
                .filter(o => (o > 0 ? o : false))

            const opacityDec =
        tmpOpacity.reduce((a, c) => a + c, 0) / tmpOpacity.length
            opacityDecEl.innerText = useDecimal(opacityDec)
            opacityPercentEl.innerText = `${(opacityDec * 100).toFixed(0)}%`
            opacityEl.value = opacityDec * 100

            const resRGBNew = calculateColorArray(opacityDec, bgRGB, fgRGB)
            if (resRGBNew.join(',') !== resRGB.join(',')) {
                addWarning(
                    el,
                    `${el.value} is not a valid transparency result. New result uses average opacity.`,
                )
                resRGB = resRGBNew
            }
        } else if (el.id === 'opacity') {
            document.getElementById('res').value = ''
            resRGB = calculateColorArray(+opacityDecEl.innerText, bgRGB, fgRGB)
        }
        updateSwatch(
            el.dataset.target,
            rgb2Hex(resRGB, false),
            resRGB,
            rgb2Hsl(resRGB),
        )
    }),
)

initClipboardCopy()
