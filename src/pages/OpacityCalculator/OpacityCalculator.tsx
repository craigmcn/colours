import { useState, useMemo } from 'react'
import type { RGB } from '../../types/colour'
import { useColor } from '../../hooks/useColor'
import { ColorInput } from '../../components/ColorInput/ColorInput'
import { CopyButtons } from '../../components/CopyButtons/CopyButtons'
import { parseText, splitHex } from '../../utils/parseValues'
import { calculateColorArray, calculateFg, calculateBg, calculateOpacity, useDecimal } from '../../utils/calculate'
import { rgb2Hex, rgb2Hsl, rgb2Str, hex2Str, hsl2Str, hex2Rgb } from '../../utils/convertColours'
import { contrastTextColor } from '../../utils/contrastRatio'
import styles from './OpacityCalculator.module.scss'

type SolveFor = 'fg' | 'bg' | 'result' | 'opacity'

const SOLVE_FOR_LABELS: Record<SolveFor, string> = {
  fg: 'Foreground',
  bg: 'Background',
  result: 'Result',
  opacity: 'Opacity',
}

const DEFAULT_FG = '#005b99'
const DEFAULT_BG = '#ffffff'
const DEFAULT_OPACITY = 25

export const OpacityCalculator = () => {
  const fg = useColor(DEFAULT_FG)
  const bg = useColor(DEFAULT_BG)
  const [solveFor, setSolveFor] = useState<SolveFor>('result')
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY)
  const [resultRgb, setResultRgb] = useState<RGB>(() =>
    calculateColorArray(DEFAULT_OPACITY / 100, hex2Rgb(splitHex(DEFAULT_BG)), hex2Rgb(splitHex(DEFAULT_FG)))
  )
  const [resultInputValue, setResultInputValue] = useState('')

  // ─── Derived values for each "solve for" mode ────────────────────────────────

  const solvedResult = useMemo(
    () => calculateColorArray(opacity / 100, bg.color.rgb, fg.color.rgb),
    [opacity, bg.color.rgb, fg.color.rgb],
  )

  const solvedOpacity = useMemo(() => {
    const ops = resultRgb
      .map((c, i) => calculateOpacity(bg.color.rgb[i], fg.color.rgb[i], c))
      .filter(o => o > 0)
    return ops.length > 0
      ? Math.round((ops.reduce((a, b) => a + b, 0) / ops.length) * 100)
      : 0
  }, [fg.color.rgb, bg.color.rgb, resultRgb])

  const solvedFg = useMemo(
    () => calculateFg(opacity / 100, bg.color.rgb, resultRgb),
    [opacity, bg.color.rgb, resultRgb],
  )

  const solvedBg = useMemo(
    () => calculateBg(opacity / 100, fg.color.rgb, resultRgb),
    [opacity, fg.color.rgb, resultRgb],
  )

  // ─── Display values (computed or user-entered depending on solveFor) ─────────

  const displayFgRgb: RGB = solveFor === 'fg' ? solvedFg : fg.color.rgb
  const displayBgRgb: RGB = solveFor === 'bg' ? solvedBg : bg.color.rgb
  const displayResultRgb: RGB = solveFor === 'result' ? solvedResult : resultRgb
  const displayOpacity: number = solveFor === 'opacity' ? solvedOpacity : opacity

  const fgInputValue = solveFor === 'fg' ? hex2Str(rgb2Hex(solvedFg, false)) : fg.inputValue
  const bgInputValue = solveFor === 'bg' ? hex2Str(rgb2Hex(solvedBg, false)) : bg.inputValue
  const resInputValue = solveFor === 'result' ? hex2Str(rgb2Hex(solvedResult, false)) : resultInputValue

  // ─── Edge-case warnings ───────────────────────────────────────────────────────

  const fgWarning = solveFor === 'fg' && opacity === 0
    ? 'Opacity is 0% — foreground has no effect on the result'
    : undefined
  const bgWarning = solveFor === 'bg' && opacity === 100
    ? 'Opacity is 100% — background is fully covered'
    : undefined

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const handleSolveForChange = (newSolveFor: SolveFor) => {
    // Seed previously-solved fields so they start with a coherent value
    if (solveFor === 'result') {
      setResultRgb(solvedResult)
      setResultInputValue(hex2Str(rgb2Hex(solvedResult, false)))
    }
    if (solveFor === 'opacity') {
      setOpacity(solvedOpacity)
    }
    setSolveFor(newSolveFor)
  }

  const handleResultInput = (value: string) => {
    setResultInputValue(value)
    if (!value) return
    const [, rgb] = parseText(value, '')
    setResultRgb(rgb)
  }

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const swatchStyle = (rgb: RGB) => ({
    backgroundColor: rgb2Str(rgb),
    color: hex2Str(contrastTextColor(rgb).AAA.hex),
  })

  const resHex = rgb2Hex(displayResultRgb, false)
  const resHsl = rgb2Hsl(displayResultRgb)

  return (
    <main className="main main--fixed">
      <h1>Calculate opacity</h1>

      <div className={`colours flex ${styles.swatches}`}>
        <div className={`colour ${styles.swatch}`} style={swatchStyle(displayFgRgb)}>
          <strong>Foreground</strong><br />
          <span>{hex2Str(rgb2Hex(displayFgRgb, false))}</span><br />
          <span>{rgb2Str(displayFgRgb)}</span><br />
          <span>{hsl2Str(rgb2Hsl(displayFgRgb))}</span>
        </div>
        <div className={`colour ${styles.swatch}`} style={swatchStyle(displayResultRgb)}>
          <strong>Result</strong><br />
          <span>{hex2Str(resHex)}</span><br />
          <span>{rgb2Str(displayResultRgb)}</span><br />
          <span>{hsl2Str(resHsl)}</span>
        </div>
        <div className={`colour ${styles.swatch}`} style={swatchStyle(displayBgRgb)}>
          <strong>Background</strong><br />
          <span>{hex2Str(rgb2Hex(displayBgRgb, false))}</span><br />
          <span>{rgb2Str(displayBgRgb)}</span><br />
          <span>{hsl2Str(rgb2Hsl(displayBgRgb))}</span>
        </div>
      </div>

      <CopyButtons hex={resHex} rgb={displayResultRgb} hsl={resHsl} id="opacity-result" />

      <fieldset className="form__group">
        <legend className="form__label">Solve for</legend>
        <div className={styles.buttonGroup}>
          {(['fg', 'bg', 'result', 'opacity'] as SolveFor[]).map(field => (
            <label key={field} className={styles.buttonGroupItem}>
              <input
                type="radio"
                name="solveFor"
                value={field}
                checked={solveFor === field}
                onChange={() => handleSolveForChange(field)}
              />
              <span>{SOLVE_FOR_LABELS[field]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <ColorInput id="fg" label="Foreground" value={fgInputValue} onChange={fg.update}
        disabled={solveFor === 'fg'} warning={fgWarning} />
      <ColorInput id="bg" label="Background" value={bgInputValue} onChange={bg.update}
        disabled={solveFor === 'bg'} warning={bgWarning} />
      <ColorInput id="res" label="Result" value={resInputValue} onChange={handleResultInput}
        disabled={solveFor === 'result'} />

      <div className="form__group">
        <label className="form__label" htmlFor="opacity">Opacity</label>
        <input
          id="opacity"
          className="form__control input input--large"
          type="range"
          value={displayOpacity}
          min={0} max={100}
          disabled={solveFor === 'opacity'}
          onChange={e => setOpacity(Number(e.target.value))}
        />
        <p className="text--muted">
          <code>opacity: <span>{useDecimal(displayOpacity / 100)}</span> (<span>{displayOpacity.toFixed(0)}%</span>)</code>
        </p>
      </div>
    </main>
  )
}
