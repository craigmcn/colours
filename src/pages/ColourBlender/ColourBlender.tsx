import { useState } from 'react'
import type { RGB } from '../../types/colour'
import { useColor } from '../../hooks/useColor'
import { ColorInput } from '../../components/ColorInput/ColorInput'
import { useClipboard } from '../../hooks/useClipboard'
import { calculateColorArray } from '../../utils/calculate'
import { rgb2Hex, rgb2Hsl, rgb2Str, hsl2Str, hex2Str } from '../../utils/convertColours'
import { contrastTextColor } from '../../utils/contrastRatio'
import styles from './ColourBlender.module.scss'

const DEFAULT_START = '#005b99'
const DEFAULT_END = '#ffffff'

const blend = (start: RGB, end: RGB, steps: number): RGB[] => {
  const result: RGB[] = []
  for (let i = 0; i <= steps; i++) {
    result.push(calculateColorArray(i / steps, start, end))
  }
  return result
}

export const ColourBlender = () => {
  const start = useColor(DEFAULT_START)
  const end = useColor(DEFAULT_END)
  const [steps, setSteps] = useState(5)
  const { copy, copiedKey } = useClipboard()

  const colors = blend(start.color.rgb, end.color.rgb, steps)

  return (
    <main className="main main--fixed">
      <h1>Colour blender</h1>

      <div className="flex flex--grid">
        <div className="flex__item flex__item--12 flex__item--6-sm">
          <ColorInput id="start" label="Start" value={start.inputValue} onChange={start.update} />
          <ColorInput id="end" label="End" value={end.inputValue} onChange={end.update} />
          <div className="form__group">
            <label className="form__label" htmlFor="steps">Steps</label>
            <input
              id="steps"
              className="form__control input input--large"
              value={steps}
              inputMode="numeric"
              onChange={e => setSteps(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="card flex__item flex__item--12 flex__item--6-sm">
          <div className="card__body">
            {colors.map((rgb, i) => {
              const hex = rgb2Hex(rgb, false)
              const hexStr = hex2Str(hex)
              const rgbStr = rgb2Str(rgb)
              const hslStr = hsl2Str(rgb2Hsl(rgb))
              const textColor = hex2Str(contrastTextColor(rgb).AAA.hex)
              const key = `${i}-${rgbStr}`
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
      </div>
    </main>
  )
}
