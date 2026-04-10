import { render, screen, fireEvent } from '@testing-library/react'
import { SwatchControls } from './SwatchControls'

const defaultProps = {
  id: 'linkColor',
  saturation: 100,
  lightness: 50,
  onSaturationChange: vi.fn(),
  onLightnessChange: vi.fn(),
}

beforeEach(() => {
  defaultProps.onSaturationChange = vi.fn()
  defaultProps.onLightnessChange = vi.fn()
})

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('SwatchControls — rendering', () => {
  it('renders a saturation range slider', () => {
    render(<SwatchControls {...defaultProps} />)
    expect(screen.getByLabelText(/saturation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/saturation/i)).toHaveAttribute('type', 'range')
  })

  it('renders a lightness range slider', () => {
    render(<SwatchControls {...defaultProps} />)
    expect(screen.getByLabelText(/lightness/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lightness/i)).toHaveAttribute('type', 'range')
  })

  it('applies the given id as a prefix to each slider id', () => {
    render(<SwatchControls {...defaultProps} id="textColor" />)
    expect(document.getElementById('textColorSat')).toBeInTheDocument()
    expect(document.getElementById('textColorLight')).toBeInTheDocument()
  })

  it('reflects the current saturation value', () => {
    render(<SwatchControls {...defaultProps} saturation={75} />)
    expect(screen.getByLabelText(/saturation/i)).toHaveValue('75')
  })

  it('reflects the current lightness value', () => {
    render(<SwatchControls {...defaultProps} lightness={30} />)
    expect(screen.getByLabelText(/lightness/i)).toHaveValue('30')
  })

  it('sets min=0 and max=100 on both sliders', () => {
    render(<SwatchControls {...defaultProps} />)
    for (const slider of screen.getAllByRole('slider')) {
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '100')
    }
  })
})

// ─── Interaction ──────────────────────────────────────────────────────────────

describe('SwatchControls — interaction', () => {
  it('calls onSaturationChange with the new numeric value', () => {
    const onSaturationChange = vi.fn()
    render(<SwatchControls {...defaultProps} onSaturationChange={onSaturationChange} />)

    fireEvent.change(screen.getByLabelText(/saturation/i), { target: { value: '50' } })

    expect(onSaturationChange).toHaveBeenCalledWith(50)
  })

  it('calls onLightnessChange with the new numeric value', () => {
    const onLightnessChange = vi.fn()
    render(<SwatchControls {...defaultProps} onLightnessChange={onLightnessChange} />)

    fireEvent.change(screen.getByLabelText(/lightness/i), { target: { value: '20' } })

    expect(onLightnessChange).toHaveBeenCalledWith(20)
  })

  it('does not call onLightnessChange when the saturation slider changes', () => {
    const onLightnessChange = vi.fn()
    render(<SwatchControls {...defaultProps} onLightnessChange={onLightnessChange} />)

    fireEvent.change(screen.getByLabelText(/saturation/i), { target: { value: '60' } })

    expect(onLightnessChange).not.toHaveBeenCalled()
  })

  it('does not call onSaturationChange when the lightness slider changes', () => {
    const onSaturationChange = vi.fn()
    render(<SwatchControls {...defaultProps} onSaturationChange={onSaturationChange} />)

    fireEvent.change(screen.getByLabelText(/lightness/i), { target: { value: '60' } })

    expect(onSaturationChange).not.toHaveBeenCalled()
  })
})
