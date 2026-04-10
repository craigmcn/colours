import { renderHook, act } from '@testing-library/react'
import { useColor } from './useColor'
import type { ColorValue } from '../types/colour'

const green: ColorValue = {
  hex: ['00', 'ff', '00'],
  rgb: [0, 255, 0],
  hsl: [120, '100%', '50%'],
}

// ─── Initial state ────────────────────────────────────────────────────────────

describe('useColor — initial state', () => {
  it('derives color from the initial hex', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    expect(result.current.color.rgb).toEqual([255, 0, 0])
    expect(result.current.color.hex).toEqual(['ff', '00', '00'])
  })

  it('sets sourceColor equal to color on mount', () => {
    const { result } = renderHook(() => useColor('#0000ff'))
    expect(result.current.sourceColor.rgb).toEqual([0, 0, 255])
  })

  it('starts with an empty inputValue', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    expect(result.current.inputValue).toBe('')
  })
})

// ─── update() ─────────────────────────────────────────────────────────────────

describe('useColor — update()', () => {
  it('sets inputValue to the typed string', () => {
    const { result } = renderHook(() => useColor('#000000'))
    act(() => { result.current.update('#ff0000') })
    expect(result.current.inputValue).toBe('#ff0000')
  })

  it('updates both color and sourceColor from the parsed value', () => {
    const { result } = renderHook(() => useColor('#000000'))
    act(() => { result.current.update('#ff0000') })
    expect(result.current.color.rgb).toEqual([255, 0, 0])
    expect(result.current.sourceColor.rgb).toEqual([255, 0, 0])
  })

  it('parses rgb() strings', () => {
    const { result } = renderHook(() => useColor('#000000'))
    act(() => { result.current.update('rgb(0, 128, 0)') })
    expect(result.current.color.rgb).toEqual([0, 128, 0])
    expect(result.current.sourceColor.rgb).toEqual([0, 128, 0])
  })

  it('parses hsl() strings', () => {
    const { result } = renderHook(() => useColor('#000000'))
    act(() => { result.current.update('hsl(240, 100%, 50%)') })
    expect(result.current.color.rgb).toEqual([0, 0, 255])
  })

  it('falls back to the initial hex for invalid input', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    act(() => { result.current.update('not-a-colour') })
    expect(result.current.color.rgb).toEqual([255, 0, 0])
    expect(result.current.sourceColor.rgb).toEqual([255, 0, 0])
  })
})

// ─── set() ────────────────────────────────────────────────────────────────────

describe('useColor — set() updates color', () => {
  it('updates color to the new value', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    act(() => { result.current.set(green) })
    expect(result.current.color.rgb).toEqual([0, 255, 0])
  })
})

describe('useColor — set() and inputValue', () => {
  it('does not change inputValue when no displayValue is provided', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    act(() => { result.current.update('#ff0000') })
    act(() => { result.current.set(green) })
    expect(result.current.inputValue).toBe('#ff0000')
  })

  it('updates inputValue when displayValue is provided', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    act(() => { result.current.set(green, '#00ff00') })
    expect(result.current.inputValue).toBe('#00ff00')
  })
})

describe('useColor — set() and sourceColor', () => {
  it('does not change sourceColor by default', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    act(() => { result.current.update('#ff0000') })
    act(() => { result.current.set(green) })
    // sourceColor stays frozen at the last update() value
    expect(result.current.sourceColor.rgb).toEqual([255, 0, 0])
  })

  it('updates sourceColor when updateSource is true', () => {
    const { result } = renderHook(() => useColor('#ff0000'))
    act(() => { result.current.set(green, '#00ff00', true) })
    expect(result.current.sourceColor.rgb).toEqual([0, 255, 0])
  })
})

describe('useColor — set() without displayValue after a slider-like sequence', () => {
  it('source stays frozen after multiple set() calls without displayValue', () => {
    const { result } = renderHook(() => useColor('#ff0000'))

    // Simulate user typing
    act(() => { result.current.update('#ff0000') })

    // Simulate slider moving (no display value, no source update)
    const dimmer: ColorValue = {
      hex: ['80', '00', '00'],
      rgb: [128, 0, 0],
      hsl: [0, '100%', '25%'],
    }
    act(() => { result.current.set(dimmer) })
    act(() => { result.current.set(dimmer) })

    expect(result.current.inputValue).toBe('#ff0000')
    expect(result.current.sourceColor.rgb).toEqual([255, 0, 0])
  })
})
