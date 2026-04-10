import { useMemo } from 'react'
import { useColor } from '../../hooks/useColor'
import { SwatchCard } from '../../components/SwatchCard/SwatchCard'
import { ContrastResult } from '../../components/ContrastResult/ContrastResult'
import { ColorExample } from '../../components/ColorExample/ColorExample'
import { contrastRatio, contrastTextColor, getContrastColour } from '../../utils/contrastRatio'
import { hex2Str } from '../../utils/convertColours'
import { getPassFail } from '../../utils/passFail'

const DEFAULT_LINK = '#0000FF'
const DEFAULT_TEXT = '#222222'
const DEFAULT_BG = '#FFFFFF'

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
    text.set({ hex: textHex, rgb: textRgb, hsl: textHsl }, hex2Str(textHex), true)

    const { hex: linkHex, rgb: linkRgb, hsl: linkHsl } = getContrastColour({ color: textRgb, wcag: 'A', direction })
    link.set({ hex: linkHex, rgb: linkRgb, hsl: linkHsl }, hex2Str(linkHex), true)
  }

  return (
    <main className="main">
      <section className="flex flex--grid">
        <SwatchCard id="linkColor" title="Links"
          color={link.color} sourceColor={link.sourceColor} inputValue={link.inputValue}
          onInputChange={link.update} onSetColor={link.set} />
        <SwatchCard id="textColor" title="Text"
          color={text.color} sourceColor={text.sourceColor} inputValue={text.inputValue}
          onInputChange={text.update} onSetColor={text.set} />
        <SwatchCard id="bgColor" title="Background"
          color={bg.color} sourceColor={bg.sourceColor} inputValue={bg.inputValue}
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
