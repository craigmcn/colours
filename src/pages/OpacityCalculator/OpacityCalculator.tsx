import { useState, useEffect } from 'react'
import type { RGB } from '../../types/colour'
import { useColor } from '../../hooks/useColor'
import { ColorInput } from '../../components/ColorInput/ColorInput'
import { CopyButtons } from '../../components/CopyButtons/CopyButtons'
import { parseText } from '../../utils/parseValues'
import { calculateColorArray, calculateOpacity, useDecimal } from '../../utils/calculate'
import { rgb2Hex, rgb2Hsl, rgb2Str, hex2Str, hsl2Str } from '../../utils/convertColours'
import { contrastTextColor } from '../../utils/contrastRatio'
import styles from './OpacityCalculator.module.scss'

const DEFAULT_FG = '#005b99'
const DEFAULT_BG = '#ffffff'
const DEFAULT_OPACITY = 25

export const OpacityCalculator = () => {
  const fg = useColor(DEFAULT_FG)
  const bg = useColor(DEFAULT_BG)

  const [opacity, setOpacity] = useState(DEFAULT_OPACITY)
  const [resRGB, setResRGB] = useState<RGB>(() =>
    calculateColorArray(DEFAULT_OPACITY / 100, bg.color.rgb, fg.color.rgb)
  )
  const [resInput, setResInput] = useState('')
  const [warning, setWarning] = useState('')

  useEffect(() => {
    setResRGB(calculateColorArray(opacity / 100, bg.color.rgb, fg.color.rgb))
  }, [fg.color.rgb, bg.color.rgb, opacity])

  const handleResInput = (value: string) => {
    setResInput(value)
    setWarning('')
    if (!value) {
      setResRGB(calculateColorArray(opacity / 100, bg.color.rgb, fg.color.rgb))
      return
    }
    const [, rgb] = parseText(value, '')
    const opacities = rgb
      .map((c, i) => calculateOpacity(bg.color.rgb[i], fg.color.rgb[i], c))
      .filter(o => o > 0)
    const opacityDec = opacities.length > 0
      ? opacities.reduce((a, c) => a + c, 0) / opacities.length
      : opacity / 100
    const newRes = calculateColorArray(opacityDec, bg.color.rgb, fg.color.rgb)
    if (newRes.join(',') !== rgb.join(',')) {
      setWarning(`${value} is not a valid transparency result. New result uses average opacity.`)
    }
    setResRGB(newRes)
    setOpacity(Math.round(opacityDec * 100))
  }

  const handleOpacitySlider = (value: number) => {
    setOpacity(value)
    setResInput('')
    setWarning('')
  }

  const resHex = rgb2Hex(resRGB, false)
  const resHsl = rgb2Hsl(resRGB)

  const swatchStyle = (rgb: RGB) => ({
    backgroundColor: rgb2Str(rgb),
    color: hex2Str(contrastTextColor(rgb).AAA.hex),
  })

  return (
    <main className="main main--fixed">
      <h1>Calculate opacity</h1>

      <div className={`colours flex ${styles.swatches}`}>
        <div className={`colour ${styles.swatch}`} style={swatchStyle(fg.color.rgb)}>
          <strong>Foreground</strong><br />
          <span>{hex2Str(fg.color.hex)}</span><br />
          <span>{rgb2Str(fg.color.rgb)}</span><br />
          <span>{hsl2Str(fg.color.hsl)}</span>
        </div>
        <div className={`colour ${styles.swatch}`} style={swatchStyle(resRGB)}>
          <strong>Result</strong><br />
          <span>{hex2Str(resHex)}</span><br />
          <span>{rgb2Str(resRGB)}</span><br />
          <span>{hsl2Str(resHsl)}</span>
        </div>
        <div className={`colour ${styles.swatch}`} style={swatchStyle(bg.color.rgb)}>
          <strong>Background</strong><br />
          <span>{hex2Str(bg.color.hex)}</span><br />
          <span>{rgb2Str(bg.color.rgb)}</span><br />
          <span>{hsl2Str(bg.color.hsl)}</span>
        </div>
      </div>

      <CopyButtons hex={resHex} rgb={resRGB} hsl={resHsl} id="opacity-result" />

      <ColorInput id="fg" label="Foreground" value={fg.inputValue} onChange={fg.update} />
      <ColorInput id="bg" label="Background" value={bg.inputValue} onChange={bg.update} />
      <ColorInput id="res" label="Result" value={resInput} onChange={handleResInput} warning={warning} />

      <div className="form__group">
        <label className="form__label" htmlFor="opacity">Opacity</label>
        <input
          id="opacity"
          className="form__control input input--large"
          type="range"
          value={opacity}
          min={0} max={100}
          onChange={e => handleOpacitySlider(Number(e.target.value))}
        />
        <p className="text--muted">
          <code>opacity: <span>{useDecimal(opacity / 100)}</span> (<span>{opacity.toFixed(0)}%</span>)</code>
        </p>
      </div>
    </main>
  )
}
