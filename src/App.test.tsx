import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { useClipboard } from './hooks/useClipboard'

vi.mock('./hooks/useClipboard')

beforeEach(() => {
  vi.mocked(useClipboard).mockReturnValue({
    copy: vi.fn() as (text: string, key: string) => void,
    copiedKey: null,
    isSupported: true,
  })
  window.history.pushState({}, '', '/')
})

// ─── Default route ────────────────────────────────────────────────────────────

describe('App — default route', () => {
  it('renders ContrastChecker at /', () => {
    render(<App />)
    // ContrastChecker has SwatchCard headings for Links, Text, and Background
    expect(screen.getByRole('heading', { name: 'Links' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Text' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Background' })).toBeInTheDocument()
  })

  it('renders the Layout header', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /colours/i })).toBeInTheDocument()
  })

  it('renders all four nav links', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /^contrast$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^opacity$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^palette$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^blender$/i })).toBeInTheDocument()
  })
})

// ─── Client-side navigation ───────────────────────────────────────────────────

describe('App — navigation', () => {
  it('navigates to OpacityCalculator when Opacity is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: /^opacity$/i }))
    expect(screen.getByRole('heading', { name: /calculate opacity/i })).toBeInTheDocument()
  })

  it('navigates to PaletteGenerator when Palette is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: /^palette$/i }))
    expect(screen.getByRole('heading', { name: /palette generator/i })).toBeInTheDocument()
  })

  it('navigates to ColourBlender when Blender is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: /^blender$/i }))
    expect(screen.getByRole('heading', { name: /colour blender/i })).toBeInTheDocument()
  })

  it('navigates back to ContrastChecker when Contrast is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: /^opacity$/i }))
    await user.click(screen.getByRole('link', { name: /^contrast$/i }))
    expect(screen.getByRole('heading', { name: 'Links' })).toBeInTheDocument()
  })
})

// ─── Direct URL routes ────────────────────────────────────────────────────────

describe('App — direct URL routes', () => {
  it('renders OpacityCalculator at /opacity', () => {
    window.history.pushState({}, '', '/opacity')
    render(<App />)
    expect(screen.getByRole('heading', { name: /calculate opacity/i })).toBeInTheDocument()
  })

  it('renders PaletteGenerator at /palette', () => {
    window.history.pushState({}, '', '/palette')
    render(<App />)
    expect(screen.getByRole('heading', { name: /palette generator/i })).toBeInTheDocument()
  })

  it('renders ColourBlender at /blender', () => {
    window.history.pushState({}, '', '/blender')
    render(<App />)
    expect(screen.getByRole('heading', { name: /colour blender/i })).toBeInTheDocument()
  })
})
