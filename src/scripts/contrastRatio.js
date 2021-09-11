import { hsl2Rgb, hsl2Str, rgb2Hex, rgb2Hsl, rgb2Str } from './convertColours'

export const BLACK = '#222'

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

export const contrastTextColor = (color) => { // color = rgb => [r, g, b]
    const [h, s, l] = rgb2Hsl(color)
    const rel = rL(color)
    let AA, AAA

    if ((h === 0 && s === '0%' && l === '100%') || rel > 0.98) {
        // return 'black'
        const black = [0, 0, 0]

        AA = {
            hex: rgb2Hex(black, true),
            rgb: rgb2Str(black),
            hsl: hsl2Str(black)
        }
        AAA = {
            hex: rgb2Hex(black, true),
            rgb: rgb2Str(black),
            hsl: hsl2Str(black)
        }
    } else {
        // https://ux.stackexchange.com/questions/107318/formula-for-color-contrast-between-text-and-background
        const direction = rel <= 0.1833 ? 'L' : 'D'

        AA = getContrastColour({ color, direction })
        AAA = getContrastColour({ color, wcag: 'AAA', direction })
    }

    return {
        AA,
        AAA
    }
}

// lighter
// - increase lightness to >= contrastRatio
// darker
// - set saturation to 100%
// - decrease lightness to >= contrastRatio
const getContrastColour = ({ color, direction, wcag = 'AA' }) => { // direction = 'lighter' || 'darker'
    const setHsl = (h, s, l) => direction === 'L' ? [h, s, l] : [h, 100, l]

    let [h, s, l] = rgb2Hsl(color)
    s = parseInt(s)
    l = parseInt(l)

    const ratio = wcag === 'AA' ? 4.5 : 7
    const limit = direction === 'L' ? 100 : 0
    let retHsl = setHsl(h, s, l)
    let retRgb = hsl2Rgb(retHsl)

    // eslint-disable-next-line no-unmodified-loop-condition
    while (contrastRatio(color, retRgb) < ratio && ((limit === 0 && l >= limit) || (limit === 100 && l <= limit))) {
        l += direction === 'L' ? 1 : -1
        retHsl = setHsl(h, s, l)
        retRgb = hsl2Rgb(retHsl)
    }

    return {
        hex: rgb2Hex(retRgb, true),
        rgb: rgb2Str(retRgb),
        hsl: hsl2Str(retHsl)
    }
}
