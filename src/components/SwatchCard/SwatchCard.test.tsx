import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SwatchCard } from './SwatchCard'
import type { SwatchCardProps } from './SwatchCard'
import type { ColorValue } from '../../types/colour'
import { useClipboard } from '../../hooks/useClipboard'

vi.mock('../../hooks/useClipboard')

const red: ColorValue = {
  hex: ['ff', '00', '00'],
  rgb: [255, 0, 0],
  hsl: [0, '100%', '50%'],
}

const blue: ColorValue = {
  hex: ['00', '00', 'ff'],
  rgb: [0, 0, 255],
  hsl: [240, '100%', '50%'],
}

const makeProps = (overrides: Partial<SwatchCardProps> = {}): SwatchCardProps => ({
  id: 'testColor',
  title: 'Links',
  color: red,
  sourceColor: red,
  inputValue: '',
  onInputChange: vi.fn(),
  onSetColor: vi.fn(),
  ...overrides,
})

beforeEach(() => {
  vi.mocked(useClipboard).mockReturnValue({ copy: vi.fn(), copiedKey: null, isSupported: true })
})

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('SwatchCard — rendering', () => {
  it('renders the card title as a heading', () => {
    render(<SwatchCard {...makeProps()} />)
    expect(screen.getByRole('heading', { name: 'Links' })).toBeInTheDocument()
  })

  it('renders a text input labelled with the title', () => {
    render(<SwatchCard {...makeProps()} />)
    expect(screen.getByLabelText('Links')).toHaveAttribute('type', 'text')
  })

  it('reflects the inputValue in the text input', () => {
    render(<SwatchCard {...makeProps({ inputValue: '#ff0000' })} />)
    expect(screen.getByLabelText('Links')).toHaveValue('#ff0000')
  })

  it('renders saturation and lightness sliders', () => {
    render(<SwatchCard {...makeProps()} />)
    expect(screen.getByLabelText(/saturation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lightness/i)).toBeInTheDocument()
  })
})

// ─── Source swatch ────────────────────────────────────────────────────────────

describe('SwatchCard — source swatch', () => {
  it('displays the source colour values', () => {
    render(<SwatchCard {...makeProps({ sourceColor: red })} />)
    // Each value should appear at least once (source swatch)
    expect(screen.getAllByText('rgb(255, 0, 0)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('#ff0000').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('hsl(0, 100%, 50%)').length).toBeGreaterThanOrEqual(1)
  })

  it('keeps the source swatch stable when color and sourceColor differ', () => {
    render(<SwatchCard {...makeProps({ color: blue, sourceColor: red })} />)
    // Both sets of values should be in the document simultaneously
    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument()
    expect(screen.getByText('rgb(0, 0, 255)')).toBeInTheDocument()
  })
})

// ─── Compare swatch ───────────────────────────────────────────────────────────

describe('SwatchCard — compare swatch', () => {
  it('shows the compare colour values when color differs from sourceColor', () => {
    render(<SwatchCard {...makeProps({ color: blue, sourceColor: red })} />)
    expect(screen.getByText('rgb(0, 0, 255)')).toBeInTheDocument()
    expect(screen.getByText('#0000ff')).toBeInTheDocument()
  })
})

// ─── Input interaction ────────────────────────────────────────────────────────

describe('SwatchCard — text input interaction', () => {
  it('calls onInputChange when the user types in the input', async () => {
    const onInputChange = vi.fn()
    const user = userEvent.setup()
    render(<SwatchCard {...makeProps({ onInputChange })} />)

    await user.type(screen.getByLabelText('Links'), '#')

    expect(onInputChange).toHaveBeenCalledWith('#')
  })

  it('does not call onSetColor when the user types', async () => {
    const onSetColor = vi.fn()
    const user = userEvent.setup()
    render(<SwatchCard {...makeProps({ onSetColor })} />)

    await user.type(screen.getByLabelText('Links'), '#')

    expect(onSetColor).not.toHaveBeenCalled()
  })
})

// ─── Slider interaction ───────────────────────────────────────────────────────

describe('SwatchCard — slider interaction', () => {
  it('calls onSetColor when the saturation slider changes', () => {
    const onSetColor = vi.fn()
    render(<SwatchCard {...makeProps({ onSetColor })} />)

    fireEvent.change(document.getElementById('testColorSat')!, { target: { value: '50' } })

    expect(onSetColor).toHaveBeenCalledTimes(1)
    expect(onSetColor).toHaveBeenCalledWith(
      expect.objectContaining({
        hex: expect.any(Array),
        rgb: expect.any(Array),
        hsl: expect.any(Array),
      }),
    )
  })

  it('calls onSetColor when the lightness slider changes', () => {
    const onSetColor = vi.fn()
    render(<SwatchCard {...makeProps({ onSetColor })} />)

    fireEvent.change(document.getElementById('testColorLight')!, { target: { value: '30' } })

    expect(onSetColor).toHaveBeenCalledTimes(1)
  })

  it('does not call onInputChange when sliders change', () => {
    const onInputChange = vi.fn()
    render(<SwatchCard {...makeProps({ onInputChange })} />)

    fireEvent.change(document.getElementById('testColorSat')!, { target: { value: '50' } })
    fireEvent.change(document.getElementById('testColorLight')!, { target: { value: '30' } })

    expect(onInputChange).not.toHaveBeenCalled()
  })

  it('passes a colour derived from the new saturation to onSetColor', () => {
    const onSetColor = vi.fn()
    // Start with red: hsl(0, 100%, 50%)
    render(<SwatchCard {...makeProps({ color: red, onSetColor })} />)

    // Reduce saturation to 0 → grey
    fireEvent.change(document.getElementById('testColorSat')!, { target: { value: '0' } })

    const [calledWith] = onSetColor.mock.calls[0]
    // A fully desaturated red at 50% lightness should be mid-grey
    expect(calledWith.rgb[0]).toBe(calledWith.rgb[1])
    expect(calledWith.rgb[1]).toBe(calledWith.rgb[2])
  })
})
