export type PassFailResult = 'Pass' | 'Fail'

export interface ContrastPassFail {
  link2Body: { A: PassFailResult }
  link2Bg: { AA: PassFailResult; AAA: PassFailResult }
  body2Bg: { AA: PassFailResult; AAA: PassFailResult }
}

export function getPassFail(ratio: number, test: 'link2Body'): { A: PassFailResult }
export function getPassFail(ratio: number, test: 'link2Bg' | 'body2Bg'): { AA: PassFailResult; AAA: PassFailResult }
export function getPassFail(
  ratio: number,
  test: 'link2Body' | 'link2Bg' | 'body2Bg',
): { A: PassFailResult } | { AA: PassFailResult; AAA: PassFailResult } {
  if (test === 'link2Body') {
    return { A: ratio >= 3 ? 'Pass' : 'Fail' }
  }
  return {
    AA: ratio >= 4.5 ? 'Pass' : 'Fail',
    AAA: ratio >= 7 ? 'Pass' : 'Fail',
  }
}
