import type { Hex, RGB, HSL } from '../../types/colour'
import { hex2Str, rgb2Str, hsl2Str } from '../../utils/convertColours'
import { useClipboard } from '../../hooks/useClipboard'
import styles from './CopyButtons.module.scss'

interface Props {
  hex: Hex
  rgb: RGB
  hsl: HSL
  id?: string
}

export const CopyButtons = ({ hex, rgb, hsl, id = 'copy' }: Props) => {
  const { copy, copiedKey, isSupported } = useClipboard()

  if (!isSupported) return null

  const hexStr = hex2Str(hex)
  const rgbStr = rgb2Str(rgb)
  const hslStr = hsl2Str(hsl)
  const prefix = id

  return (
    <div className={`flex flex--ai-center flex--jc-center p-t-xs ${styles.copyButtons}`}>
      <span className="fad fa-copy" aria-hidden="true" />
      <span className="visually-hidden">Copy</span>
      <button
        className={`m-t-0 m-l-xs button button--sm${copiedKey === `${prefix}-hex` ? ' button--success' : ''}`}
        onClick={() => copy(hexStr, `${prefix}-hex`)}
        title={`Copy ${hexStr}`}
      >
        HEX
      </button>
      <button
        className={`m-t-0 m-l-xs button button--sm${copiedKey === `${prefix}-rgb` ? ' button--success' : ''}`}
        onClick={() => copy(rgbStr, `${prefix}-rgb`)}
        title={`Copy ${rgbStr}`}
      >
        RGB
      </button>
      <button
        className={`m-t-0 m-l-xs button button--sm${copiedKey === `${prefix}-hsl` ? ' button--success' : ''}`}
        onClick={() => copy(hslStr, `${prefix}-hsl`)}
        title={`Copy ${hslStr}`}
      >
        HSL
      </button>
    </div>
  )
}
