import type { PassFailResult } from '../../utils/passFail'
import styles from './ContrastResult.module.scss'

interface Link2BodyProps {
  type: 'link2Body'
  label: string
  ratio: number
  results: { A: PassFailResult }
}

interface Bg2Props {
  type: 'link2Bg' | 'body2Bg'
  label: string
  ratio: number
  results: { AA: PassFailResult; AAA: PassFailResult }
}

type Props = Link2BodyProps | Bg2Props

export const ContrastResult = (props: Props) => {
  const { label, ratio } = props
  const isPass = props.type === 'link2Body'
    ? props.results.A === 'Pass'
    : props.results.AA === 'Pass'

  return (
    <div className={`${styles.contrast}${isPass ? ` ${styles.pass}` : ''}`}>
      <div className={styles.ratio}>
        <span className={styles.value}>{ratio}</span>:1
      </div>
      <div className={styles.description}>
        <p className={styles.label}>{label}</p>
        {props.type === 'link2Body' ? (
          <>
            <p className="label--wcagA">
              WCAG A: <span className={props.results.A === 'Pass' ? 'pass' : ''}>{props.results.A}</span>
            </p>
            {props.results.A === 'Fail' && (
              <p className="label--warn text--info">
                <i className="fa-light fa-circle-info m-r-xs" />
                Use another method for differentiating links and text (e.g., underline)
              </p>
            )}
          </>
        ) : (
          <>
            <p className="label--wcagAA">
              WCAG AA: <span className={props.results.AA === 'Pass' ? 'pass' : ''}>{props.results.AA}</span>
            </p>
            <p className="label--wcagAAA">
              WCAG AAA: <span className={props.results.AAA === 'Pass' ? 'pass' : ''}>{props.results.AAA}</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
