import { renderHook, act } from '@testing-library/react'
import { useClipboard } from './useClipboard'

// ─── Clipboard not available ──────────────────────────────────────────────────

describe('useClipboard — clipboard not available', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { clipboard: undefined })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('isSupported is false', () => {
    const { result } = renderHook(() => useClipboard())
    expect(result.current.isSupported).toBe(false)
  })

  it('calling copy does nothing (no throw)', () => {
    const { result } = renderHook(() => useClipboard())
    expect(() => act(() => { result.current.copy('text', 'key') })).not.toThrow()
  })

  it('copiedKey remains null after a copy attempt', () => {
    const { result } = renderHook(() => useClipboard())
    act(() => { result.current.copy('text', 'key') })
    expect(result.current.copiedKey).toBeNull()
  })
})

// ─── Clipboard available ──────────────────────────────────────────────────────

describe('useClipboard — clipboard available', () => {
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('isSupported is true', () => {
    const { result } = renderHook(() => useClipboard())
    expect(result.current.isSupported).toBe(true)
  })

  it('calls navigator.clipboard.writeText with the supplied text', async () => {
    const { result } = renderHook(() => useClipboard())
    await act(async () => { result.current.copy('hello', 'my-key') })
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('sets copiedKey after a successful write', async () => {
    const { result } = renderHook(() => useClipboard())
    await act(async () => { result.current.copy('hello', 'my-key') })
    expect(result.current.copiedKey).toBe('my-key')
  })

  it('clears copiedKey after the default timeout (1200ms)', async () => {
    const { result } = renderHook(() => useClipboard())
    await act(async () => { result.current.copy('hello', 'my-key') })
    expect(result.current.copiedKey).toBe('my-key')

    await act(async () => { vi.advanceTimersByTime(1200) })
    expect(result.current.copiedKey).toBeNull()
  })

  it('clears copiedKey after a custom timeout', async () => {
    const { result } = renderHook(() => useClipboard(500))
    await act(async () => { result.current.copy('hello', 'my-key') })

    await act(async () => { vi.advanceTimersByTime(499) })
    expect(result.current.copiedKey).toBe('my-key')

    await act(async () => { vi.advanceTimersByTime(1) })
    expect(result.current.copiedKey).toBeNull()
  })

  it('replaces copiedKey when copy is called a second time before timeout', async () => {
    const { result } = renderHook(() => useClipboard())
    await act(async () => { result.current.copy('a', 'key-a') })
    await act(async () => { result.current.copy('b', 'key-b') })
    expect(result.current.copiedKey).toBe('key-b')
  })
})
