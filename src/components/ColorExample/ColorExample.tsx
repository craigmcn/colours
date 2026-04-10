import styles from './ColorExample.module.scss'

interface Props {
  linkColor: string
  textColor: string
  bgColor: string
}

export const ColorExample = ({ linkColor, textColor, bgColor }: Props) => (
  <div className={styles.exBg} style={{ backgroundColor: bgColor, borderColor: textColor }}>
    <p className={styles.exText} style={{ color: textColor }}>
      Foreground text{' '}
      <a href="#" className={styles.exLink} style={{ color: linkColor }}>link text</a>
      {' '}foreground text
    </p>
  </div>
)
