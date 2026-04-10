import { useState } from 'react'
import type { RGB } from '../../types/colour'
import { useColor } from '../../hooks/useColor'
import { ColorInput } from '../../components/ColorInput/ColorInput'
import { useClipboard } from '../../hooks/useClipboard'
import { calculateColorArray } from '../../utils/calculate'
import { rgb2Hex, rgb2Hsl, rgb2Str, hsl2Str, hex2Str } from '../../utils/convertColours'
import { contrastTextColor } from '../../utils/contrastRatio'
import { nearestNamedColor } from '../../utils/nearestNamedColor'
import styles from './PaletteGenerator.module.scss'

const DEFAULT_BASE = '#808080'
const DEFAULT_LIGHT = '#ffffff'
const DEFAULT_DARK = '#222222'

const buildPalette = (base: RGB, light: RGB, dark: RGB): RGB[] => {
  const result: RGB[] = []
  for (let i = 0; i < 5; i++) result.push(calculateColorArray(i / 5, light, base))
  for (let i = 0; i < 6; i++) result.push(calculateColorArray(i / 5, base, dark))
  result.splice(1, 0, calculateColorArray(0.05, light, base))
  return result
}

export const PaletteGenerator = () => {
  const [name, setName] = useState('')
  const base = useColor(DEFAULT_BASE)
  const light = useColor(DEFAULT_LIGHT)
  const dark = useColor(DEFAULT_DARK)
  const { copy, copiedKey } = useClipboard()

  const palette = buildPalette(base.color.rgb, light.color.rgb, dark.color.rgb)
  const toCssIdent = (s: string): string =>
    s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'colour'

  const colorName = toCssIdent(name || (base.inputValue ? nearestNamedColor(base.color.rgb) : 'grey'))

  const variables = palette.map((rgb, index) => {
    const i = index === 0 ? 0 : index === 1 ? 50 : (index - 1) * 100
    return `--${colorName}-${i}: ${rgb2Hex(rgb, true)}`
  })
  const variablesText = variables.join('\n')

  return (
    <main className="main main--fixed">
      <h1>Palette generator</h1>

      <div className="flex flex--grid">
        <div className="flex__item flex__item--12 flex__item--3-sm">
          <div className="form__group">
            <label className="form__label" htmlFor="paletteName">Name</label>
            <input id="paletteName" className="form__control input input--large"
              placeholder="grey" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <ColorInput id="base" label="Base" value={base.inputValue} onChange={base.update} />
          <ColorInput id="paletteLight" label="Light" value={light.inputValue} onChange={light.update} />
          <ColorInput id="paletteDark" label="Dark" value={dark.inputValue} onChange={dark.update} />
        </div>

        <div className="card flex__item flex__item--12 flex__item--5-sm">
          <div className="card__body">
            {palette.map((rgb, index) => {
              const hex = rgb2Hex(rgb, false)
              const hexStr = hex2Str(hex)
              const rgbStr = rgb2Str(rgb)
              const hslStr = hsl2Str(rgb2Hsl(rgb))
              const textColor = hex2Str(contrastTextColor(rgb).AAA.hex)
              const key = `swatch-${index}`
              return (
                <div key={key} role="group" aria-label={hexStr} className={`flex ${styles.result}`}
                  style={{ color: textColor, backgroundColor: rgbStr }}>
                  <div><span>{rgbStr}</span><br /><span>{hslStr}</span><br /><span>{hexStr}</span></div>
                  <div className="flex flex__item--as-center m-l-auto m-b-0">
                    <div>
                      <span className="fad fa-copy m-r-xs" aria-hidden="true" />
                      <span className="visually-hidden">Copy</span>
                      <button className={`button button--sm${copiedKey === `${key}-hex` ? ' button--success' : ''}`}
                        onClick={() => copy(hexStr, `${key}-hex`)}>HEX</button>
                      <button className={`button button--sm${copiedKey === `${key}-rgb` ? ' button--success' : ''}`}
                        onClick={() => copy(rgbStr, `${key}-rgb`)}>RGB</button>
                      <button className={`button button--sm${copiedKey === `${key}-hsl` ? ' button--success' : ''}`}
                        onClick={() => copy(hslStr, `${key}-hsl`)}>HSL</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card flex__item flex__item--12 flex__item--4-sm">
          <div className="card__title"><h2>Custom properties</h2></div>
          <div className="card__body">
            <pre className={`text--small ${styles.variables}`}>
              {variables.map(v => <span key={v}>{v}<br /></span>)}
            </pre>
            <button className={`button button--sm${copiedKey === 'variables' ? ' button--success' : ''}`}
              onClick={() => copy(variablesText, 'variables')}>
              <span className="fad fa-copy" /> Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
