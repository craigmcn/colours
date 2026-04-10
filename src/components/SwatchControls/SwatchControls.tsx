import styles from './SwatchControls.module.scss'

interface Props {
  id: string
  saturation: number
  lightness: number
  onSaturationChange: (value: number) => void
  onLightnessChange: (value: number) => void
}

export const SwatchControls = ({ id, saturation, lightness, onSaturationChange, onLightnessChange }: Props) => (
  <div className={styles.controls}>
    <p>
      <label className="flex text--small">
        <input
          type="range"
          id={`${id}Sat`}
          className={`${styles.range} m-r-sm`}
          min={0} max={100} step={1}
          value={saturation}
          onChange={e => onSaturationChange(Number(e.target.value))}
        />
        saturation
      </label>
    </p>
    <p>
      <label className="flex text--small">
        <input
          type="range"
          id={`${id}Light`}
          className={`${styles.range} m-r-sm`}
          min={0} max={100} step={1}
          value={lightness}
          onChange={e => onLightnessChange(Number(e.target.value))}
        />
        lightness
      </label>
    </p>
  </div>
)
