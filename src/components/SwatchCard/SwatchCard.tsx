import type { ColorValue } from '../../types/colour'
import { ColorInput } from '../ColorInput/ColorInput'
import { CopyButtons } from '../CopyButtons/CopyButtons'
import { SwatchControls } from '../SwatchControls/SwatchControls'
import { contrastTextColor } from '../../utils/contrastRatio'
import { hsl2Rgb, rgb2Hex, rgb2Hsl, hex2Str, rgb2Str, hsl2Str } from '../../utils/convertColours'
import styles from './SwatchCard.module.scss'

export interface SwatchCardProps {
  id: string
  title: string
  color: ColorValue
  sourceColor: ColorValue
  inputValue: string
  onInputChange: (v: string) => void
  onSetColor: (c: ColorValue, display?: string) => void
}

export const SwatchCard = ({ id, title, color, sourceColor, inputValue, onInputChange, onSetColor }: SwatchCardProps) => {
  const sourceFg = hex2Str(contrastTextColor(sourceColor.rgb).AAA.hex)
  const compareFg = hex2Str(contrastTextColor(color.rgb).AAA.hex)
  const sourceBg = hex2Str(sourceColor.hex)
  const compareBg = hsl2Str(color.hsl)

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
          <div className={styles.swatchSource} style={{ backgroundColor: sourceBg, color: sourceFg }}>
            <p className={styles.swatchValues}>
              <span>{rgb2Str(sourceColor.rgb)}</span><br />
              <span>{hsl2Str(sourceColor.hsl)}</span><br />
              <span>{hex2Str(sourceColor.hex)}</span>
            </p>
          </div>
          <div className={styles.swatchCompare} style={{ backgroundColor: compareBg, color: compareFg }}>
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
