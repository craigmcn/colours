import styles from './ColorInput.module.scss'

interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hideLabel?: boolean
  warning?: string
}

export const ColorInput = ({ id, label, value, onChange, hideLabel = false, warning }: Props) => (
  <p className="form__group">
    <label htmlFor={id} className={hideLabel ? 'visually-hidden' : 'form__label'}>{label}</label>
    {warning && <span className={styles.warning}>{warning}</span>}
    <input
      id={id}
      className={`form__control input input--large${warning ? ` ${styles.hasWarning}` : ''}`}
      type="text"
      placeholder="#0000FF, #c00, rgb(10, 20, 30), hsl(10, 20%, 30%)"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </p>
)
