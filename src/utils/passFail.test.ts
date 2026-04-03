import { describe, it, expect } from 'vitest'
import { getPassFail } from './passFail'

// ─── link2Body (WCAG A threshold: 3:1) ───────────────────────────────────────

describe('getPassFail — link2Body', () => {
  it('passes WCAG A at exactly 3', () => {
    expect(getPassFail(3, 'link2Body')).toEqual({ A: 'Pass' })
  })

  it('passes WCAG A above 3', () => {
    expect(getPassFail(5, 'link2Body')).toEqual({ A: 'Pass' })
    expect(getPassFail(21, 'link2Body')).toEqual({ A: 'Pass' })
  })

  it('fails WCAG A below 3', () => {
    expect(getPassFail(2.99, 'link2Body')).toEqual({ A: 'Fail' })
    expect(getPassFail(1, 'link2Body')).toEqual({ A: 'Fail' })
  })

  it('returns only an A key — no AA or AAA', () => {
    const result = getPassFail(5, 'link2Body')
    expect(result).not.toHaveProperty('AA')
    expect(result).not.toHaveProperty('AAA')
  })
})

// ─── link2Bg (WCAG AA: 4.5, AAA: 7) ─────────────────────────────────────────

describe('getPassFail — link2Bg', () => {
  it('fails both AA and AAA below 4.5', () => {
    expect(getPassFail(4.49, 'link2Bg')).toEqual({ AA: 'Fail', AAA: 'Fail' })
    expect(getPassFail(1, 'link2Bg')).toEqual({ AA: 'Fail', AAA: 'Fail' })
  })

  it('passes AA at exactly 4.5 but fails AAA', () => {
    expect(getPassFail(4.5, 'link2Bg')).toEqual({ AA: 'Pass', AAA: 'Fail' })
  })

  it('passes AA between 4.5 and 7 but fails AAA', () => {
    expect(getPassFail(6, 'link2Bg')).toEqual({ AA: 'Pass', AAA: 'Fail' })
  })

  it('passes both AA and AAA at exactly 7', () => {
    expect(getPassFail(7, 'link2Bg')).toEqual({ AA: 'Pass', AAA: 'Pass' })
  })

  it('passes both AA and AAA above 7', () => {
    expect(getPassFail(21, 'link2Bg')).toEqual({ AA: 'Pass', AAA: 'Pass' })
  })

  it('returns AA and AAA keys — no A', () => {
    const result = getPassFail(5, 'link2Bg')
    expect(result).not.toHaveProperty('A')
  })
})

// ─── body2Bg (same thresholds as link2Bg) ────────────────────────────────────

describe('getPassFail — body2Bg', () => {
  it('fails both below 4.5', () => {
    expect(getPassFail(3, 'body2Bg')).toEqual({ AA: 'Fail', AAA: 'Fail' })
  })

  it('passes AA at 4.5 but fails AAA', () => {
    expect(getPassFail(4.5, 'body2Bg')).toEqual({ AA: 'Pass', AAA: 'Fail' })
  })

  it('passes both at 7', () => {
    expect(getPassFail(7, 'body2Bg')).toEqual({ AA: 'Pass', AAA: 'Pass' })
  })
})
