import { hsl2Rgb, hsl2Str, rgb2Hex, rgb2Hsl, rgb2Str } from './convertColours'

const sRgb = c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

const rL = ([r, g, b]) => 0.2126 * sRgb(r) + 0.7152 * sRgb(g) + 0.0722 * sRgb(b)

export const contrastRatio = ([r1, g1, b1], [r2, g2, b2]) => {
    const rL1 = rL([r1, g1, b1])
    const rL2 = rL([r2, g2, b2])
    const l = rL1 > rL2 ? rL1 : rL2
    const d = rL1 > rL2 ? rL2 : rL1
    return parseFloat((l + 0.05) / (d + 0.05)).toFixed(2)
}

// color = rgb => [r, g, b]
export const contrastTextColor = (color) => ({
    AA: getContrastColour(color),
    AAA: getContrastColour(color, 'AAA')
})

const getContrastColour = (color, wcag = 'AA') => {
    let [h, s, l] = rgb2Hsl(color)
    s = parseInt(s)
    l = parseInt(l)

    // https://ux.stackexchange.com/questions/107318/formula-for-color-contrast-between-text-and-background
    // lighter - increase lightness to >= contrastRatio
    // darker  - decrease lightness to >= contrastRatio
    const direction = rL(color) <= 0.1833 ? 'L' : 'D'

    const ratio = wcag === 'AA' ? 4.5 : 7
    const limit = direction === 'L' ? 100 : 0
    let retHsl = [h, s, l]
    let retRgb = hsl2Rgb(retHsl)

    // eslint-disable-next-line no-unmodified-loop-condition
    while (contrastRatio(color, retRgb) < ratio && ((limit === 0 && l >= limit) || (limit === 100 && l < limit))) {
        l += direction === 'L' ? 1 : -1
        retHsl = [h, s, l]
        retRgb = hsl2Rgb(retHsl)
    }

    return {
        hex: rgb2Hex(retRgb, true),
        rgb: rgb2Str(retRgb),
        hsl: hsl2Str(retHsl)
    }
}
