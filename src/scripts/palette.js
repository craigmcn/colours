import {
    parseText,
} from './parseValues'
import {
    hsl2Str,
    hex2Str,
    rgb2Hex,
    rgb2Hsl,
    rgb2Str,
} from './convertColours'
import {
    calculateColorArray,
} from './calculate'
import {
    contrastTextColor,
} from './contrastRatio'
import {
    nearestNamedColor,
} from './nearestNamedColor'
import {
    copyComponent,
    initClipboardCopy,
} from './clipboard'

const calculatePalette = () => {
    const start = document.getElementById('start')
    const end = document.getElementById('end')
    const base = document.getElementById('base')

    const baseColor = parseText(base.value || base.dataset.default)
    const startColor = parseText(start.value || start.dataset.default)
    const endColor = parseText(end.value || end.dataset.default)
    const resultArray = []

    for (let i = 0; i < 5; i++) {
        resultArray.push(calculateColorArray(i / 5, startColor[1], baseColor[1]))
    }

    for (let i = 0; i < 6; i++) {
        resultArray.push(calculateColorArray(i / 5, baseColor[1], endColor[1]))
    }

    resultArray.splice(1, 0, calculateColorArray(0.05, startColor[1], baseColor[1]))

    drawCustomProperties(resultArray)
    drawSwatches(resultArray)
}

const drawSwatches = (colorArray) => {
    const results = document.getElementById('results')
    results.innerHTML = ''

    colorArray.forEach((color) => {
        const hex = rgb2Hex(color, true)
        const rgb = rgb2Str(color)
        const hsl = hsl2Str(rgb2Hsl(color))

        const result = document.createElement('div')
        result.classList = 'flex'
        result.innerHTML = `${rgb}<br>${hsl}<br>${hex}`
        result.style.color = hex2Str(contrastTextColor(color).AAA.hex)
        result.style.backgroundColor = rgb
        result.style.marginBottom = '2px'
        result.style.padding = '0.5rem'

        result.appendChild(copyComponent(hex, rgb, hsl))

        results.appendChild(result)
    })

    initClipboardCopy()
}

const drawCustomProperties = (colorArray) => {
    const name = document.getElementById('name')
    const base = document.getElementById('base')
    const baseColor = parseText(base.value || base.dataset.default)

    const variables = document.getElementById('variables')
    variables.innerHTML = ''

    const copyButton = variables.parentElement.querySelector('button[data-copy]')

    let colorName = name.value || name.dataset.default
    if (base.value && !name.value) {
        colorName = nearestNamedColor(baseColor[1])
    }

    colorArray.forEach((color, index) => {
        const i = index === 0 ? 0 : index === 1 ? 50 : (index - 1) * 100
        const result = `--${colorName}-${i}: ${rgb2Hex(color, true)}`
        variables.innerHTML += `${result}<br>`

        copyButton.dataset.copy += `${result}\n`
    })
}

const paletteColors = document.querySelectorAll('.js-paletteColor')
if (paletteColors.length) {
    paletteColors.forEach((el) => {
        el.addEventListener('input', calculatePalette)
    })

    document.getElementById('name').addEventListener('input', calculatePalette)

    calculatePalette()
}
