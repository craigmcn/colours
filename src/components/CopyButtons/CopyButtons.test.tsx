import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyButtons } from './CopyButtons'
import { useClipboard } from '../../hooks/useClipboard'
import type { Hex, RGB, HSL } from '../../types/colour'

vi.mock('../../hooks/useClipboard')

const hex: Hex = ['ff', '00', '00']
const rgb: RGB = [255, 0, 0]
const hsl: HSL = [0, '100%', '50%']

// ─── Clipboard not supported ──────────────────────────────────────────────────

describe('CopyButtons — clipboard not supported', () => {
  beforeEach(() => {
    vi.mocked(useClipboard).mockReturnValue({ copy: vi.fn() as (text: string, key: string) => void, copiedKey: null, isSupported: false })
  })

  it('renders nothing', () => {
    const { container } = render(<CopyButtons hex={hex} rgb={rgb} hsl={hsl} />)
    expect(container).toBeEmptyDOMElement()
  })
})

// ─── Clipboard supported ──────────────────────────────────────────────────────

describe('CopyButtons — clipboard supported', () => {
  let mockCopy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockCopy = vi.fn()
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy as (text: string, key: string) => void, copiedKey: null, isSupported: true })
  })

  it('renders HEX, RGB and HSL copy buttons', () => {
    render(<CopyButtons hex={hex} rgb={rgb} hsl={hsl} />)
    expect(screen.getByRole('button', { name: 'HEX' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RGB' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'HSL' })).toBeInTheDocument()
  })

  it('calls copy with the formatted hex string when HEX is clicked', async () => {
    const user = userEvent.setup()
    render(<CopyButtons hex={hex} rgb={rgb} hsl={hsl} />)

    await user.click(screen.getByRole('button', { name: 'HEX' }))

    expect(mockCopy).toHaveBeenCalledWith('#ff0000', expect.any(String))
  })

  it('calls copy with the formatted rgb string when RGB is clicked', async () => {
    const user = userEvent.setup()
    render(<CopyButtons hex={hex} rgb={rgb} hsl={hsl} />)

    await user.click(screen.getByRole('button', { name: 'RGB' }))

    expect(mockCopy).toHaveBeenCalledWith('rgb(255, 0, 0)', expect.any(String))
  })

  it('calls copy with the formatted hsl string when HSL is clicked', async () => {
    const user = userEvent.setup()
    render(<CopyButtons hex={hex} rgb={rgb} hsl={hsl} />)

    await user.click(screen.getByRole('button', { name: 'HSL' }))

    expect(mockCopy).toHaveBeenCalledWith('hsl(0, 100%, 50%)', expect.any(String))
  })

  it('accepts a custom id prop without throwing', () => {
    render(<CopyButtons hex={hex} rgb={rgb} hsl={hsl} id="linkColor" />)
    expect(screen.getByRole('button', { name: 'HEX' })).toBeInTheDocument()
  })

  it('each button has a descriptive title attribute', () => {
    render(<CopyButtons hex={hex} rgb={rgb} hsl={hsl} />)
    expect(screen.getByRole('button', { name: 'HEX' })).toHaveAttribute('title', 'Copy #ff0000')
    expect(screen.getByRole('button', { name: 'RGB' })).toHaveAttribute('title', 'Copy rgb(255, 0, 0)')
    expect(screen.getByRole('button', { name: 'HSL' })).toHaveAttribute('title', 'Copy hsl(0, 100%, 50%)')
  })
})
