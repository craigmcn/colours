import { useMemo } from 'react'
import type { ColorValue } from '../../types/colour'
import { useColor } from '../../hooks/useColor'
import { ColorInput } from '../../components/ColorInput/ColorInput'
import { CopyButtons } from '../../components/CopyButtons/CopyButtons'
import { SwatchControls } from '../../components/SwatchControls/SwatchControls'
import { ContrastResult } from '../../components/ContrastResult/ContrastResult'
import { ColorExample } from '../../components/ColorExample/ColorExample'
import { contrastRatio, contrastTextColor, getContrastColour } from '../../utils/contrastRatio'
import { hsl2Rgb, rgb2Hex, rgb2Hsl, hex2Str, rgb2Str, hsl2Str } from '../../utils/convertColours'
import { getPassFail } from '../../utils/passFail'
import styles from './ContrastChecker.module.scss'

const DEFAULT_LINK = '#0000FF'
const DEFAULT_TEXT = '#222222'
const DEFAULT_BG = '#FFFFFF'

interface SwatchCardProps {
  id: string
  title: string
  color: ColorValue
  inputValue: string
  onInputChange: (v: string) => void
  onSetColor: (c: ColorValue, display?: string) => void
}

const SwatchCard = ({ id, title, color, inputValue, onInputChange, onSetColor }: SwatchCardProps) => {
  const textColor = contrastTextColor(color.rgb)
  const sourceBg = hex2Str(color.hex)
  const compareBg = hsl2Str(color.hsl)
  const fg = hex2Str(textColor.AAA.hex)

  const handleSatChange = (sat: number) => {
    const h = color.hsl[0]
    const l = parseInt(color.hsl[2])
    const rgb = hsl2Rgb([h, sat, l])
    const hex = rgb2Hex(rgb, false)
    const hsl = rgb2Hsl(rgb)
    onSetColor({ hex, rgb, hsl })
  }

  const handleLightChange = (light: number) => {
    const h = color.hsl[0]
    const s = parseInt(color.hsl[1])
    const rgb = hsl2Rgb([h, s, light])
    const hex = rgb2Hex(rgb, false)
    const hsl = rgb2Hsl(rgb)
    onSetColor({ hex, rgb, hsl })
  }

  const sat = parseInt(color.hsl[1])
  const light = parseInt(color.hsl[2])

  return (
    <div className="card flex__item flex__item--12 flex__item--4-lg">
      <div className="card__title"><h3>{title}</h3></div>
      <div className="card__body">
        <ColorInput id={id} label={title} value={inputValue} onChange={onInputChange} hideLabel />

        <div className={styles.swatches}>
          <div className={styles.swatchSource} style={{ backgroundColor: sourceBg, color: fg }}>
            <p className={styles.swatchValues}>
              <span>{rgb2Str(color.rgb)}</span><br />
              <span>{hsl2Str(color.hsl)}</span><br />
              <span>{hex2Str(color.hex)}</span>
            </p>
          </div>
          <div className={styles.swatchCompare} style={{ backgroundColor: compareBg, color: fg }}>
            <p className={styles.swatchValues}>
              <span>{rgb2Str(color.rgb)}</span><br />
              <span>{hsl2Str(color.hsl)}</span><br />
              <span>{hex2Str(color.hex)}</span>
            </p>
          </div>
          <div className={styles.swatchControls}>
            <SwatchControls
              id={id}
              saturation={sat}
              lightness={light}
              onSaturationChange={handleSatChange}
              onLightnessChange={handleLightChange}
            />
          </div>
        </div>

        <CopyButtons hex={color.hex} rgb={color.rgb} hsl={color.hsl} id={id} />
      </div>
    </div>
  )
}

export const ContrastChecker = () => {
  const link = useColor(DEFAULT_LINK)
  const text = useColor(DEFAULT_TEXT)
  const bg = useColor(DEFAULT_BG)

  const link2Body = useMemo(() => contrastRatio(link.color.rgb, text.color.rgb), [link.color.rgb, text.color.rgb])
  const link2Bg = useMemo(() => contrastRatio(link.color.rgb, bg.color.rgb), [link.color.rgb, bg.color.rgb])
  const body2Bg = useMemo(() => contrastRatio(text.color.rgb, bg.color.rgb), [text.color.rgb, bg.color.rgb])

  const handleCalculateWcag = (level: 'AA' | 'AAA') => {
    const wcagText = contrastTextColor(bg.color.rgb)
    const { hex: textHex, rgb: textRgb, hsl: textHsl, direction } = wcagText[level]
    text.set({ hex: textHex, rgb: textRgb, hsl: textHsl }, hex2Str(textHex))

    const { hex: linkHex, rgb: linkRgb, hsl: linkHsl } = getContrastColour({ color: textRgb, wcag: 'A', direction })
    link.set({ hex: linkHex, rgb: linkRgb, hsl: linkHsl }, hex2Str(linkHex))
  }

  return (
    <main className="main">
      <section className="flex flex--grid">
        <SwatchCard id="linkColor" title="Links"
          color={link.color} inputValue={link.inputValue}
          onInputChange={link.update} onSetColor={link.set} />
        <SwatchCard id="textColor" title="Text"
          color={text.color} inputValue={text.inputValue}
          onInputChange={text.update} onSetColor={text.set} />
        <SwatchCard id="bgColor" title="Background"
          color={bg.color} inputValue={bg.inputValue}
          onInputChange={bg.update} onSetColor={bg.set} />
      </section>

      <section className="m-v-md">
        <ColorExample
          linkColor={hex2Str(link.color.hex)}
          textColor={hex2Str(text.color.hex)}
          bgColor={hex2Str(bg.color.hex)}
        />
      </section>

      <div className="flex flex--grid">
        <div className="flex__item flex__item--12 flex__item--9-lg m-v-md">
          <section>
            <ContrastResult type="link2Body" label="Link to Body text"
              ratio={link2Body} results={getPassFail(link2Body, 'link2Body')} />
          </section>
          <section className="m-v-md">
            <ContrastResult type="link2Bg" label="Link to Background"
              ratio={link2Bg} results={getPassFail(link2Bg, 'link2Bg')} />
          </section>
          <section>
            <ContrastResult type="body2Bg" label="Body text to Background"
              ratio={body2Bg} results={getPassFail(body2Bg, 'body2Bg')} />
          </section>
        </div>

        <div className="card flex__item flex__item--12 flex__item--3-lg m-v-md">
          <div className="card__body">
            <p>Calculate text and link colours for background</p>
            <button className="button" type="button" style={{ display: 'block', width: '100%' }}
              onClick={() => handleCalculateWcag('AA')}>WCAG AA</button>
            <button className="button" type="button" style={{ display: 'block', width: '100%' }}
              onClick={() => handleCalculateWcag('AAA')}>WCAG AAA</button>
          </div>
        </div>
      </div>

      <p className="m-v-md">
        <a href="https://webaim.org/blog/wcag-2-0-and-link-colors/" target="_blank" rel="noreferrer">
          WebAIM: WCAG 2.0 and Link Colors
        </a>
      </p>
    </main>
  )
}
