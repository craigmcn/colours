import type { Hex, RGB, HSL } from '../../types/colour'
import { hex2Str, rgb2Str, hsl2Str } from '../../utils/convertColours'
import { contrastTextColor } from '../../utils/contrastRatio'
import styles from './ColorSwatch.module.scss'

interface Props {
  hex: Hex
  rgb: RGB
  hsl: HSL
  label?: string
}

export const ColorSwatch = ({ hex, rgb, hsl, label }: Props) => {
  const textColor = contrastTextColor(rgb)
  const bg = rgb2Str(rgb)
  const fg = hex2Str(textColor.AAA.hex)

  return (
    <div className={styles.swatch} style={{ backgroundColor: bg, color: fg }}>
      {label && <strong>{label}</strong>}
      <p className={styles.values}>
        <span>{rgb2Str(rgb)}</span><br />
        <span>{hsl2Str(hsl)}</span><br />
        <span>{hex2Str(hex)}</span>
      </p>
    </div>
  )
}
