import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorInput } from './ColorInput'

const defaultProps = {
  id: 'test-input',
  label: 'Links',
  value: '',
  onChange: vi.fn(),
}

beforeEach(() => {
  defaultProps.onChange = vi.fn()
})

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('ColorInput — rendering', () => {
  it('renders a text input associated with its label', () => {
    render(<ColorInput {...defaultProps} />)
    expect(screen.getByLabelText('Links')).toBeInTheDocument()
    expect(screen.getByLabelText('Links')).toHaveAttribute('type', 'text')
  })

  it('renders the label visibly by default', () => {
    render(<ColorInput {...defaultProps} />)
    const label = screen.getByText('Links')
    expect(label).not.toHaveClass('visually-hidden')
  })

  it('hides the label visually when hideLabel is true', () => {
    render(<ColorInput {...defaultProps} hideLabel />)
    expect(screen.getByText('Links')).toHaveClass('visually-hidden')
  })

  it('reflects the controlled value', () => {
    render(<ColorInput {...defaultProps} value="#abc123" />)
    expect(screen.getByLabelText('Links')).toHaveValue('#abc123')
  })

  it('renders a placeholder', () => {
    render(<ColorInput {...defaultProps} />)
    expect(screen.getByLabelText('Links')).toHaveAttribute('placeholder')
  })
})

// ─── Warning ─────────────────────────────────────────────────────────────────

describe('ColorInput — warning', () => {
  it('renders a warning message when provided', () => {
    render(<ColorInput {...defaultProps} warning="Invalid colour" />)
    expect(screen.getByText('Invalid colour')).toBeInTheDocument()
  })

  it('does not render a warning element when omitted', () => {
    render(<ColorInput {...defaultProps} />)
    expect(screen.queryByText('Invalid colour')).not.toBeInTheDocument()
  })
})

// ─── Interaction ──────────────────────────────────────────────────────────────

describe('ColorInput — interaction', () => {
  it('calls onChange with the typed character', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorInput {...defaultProps} onChange={onChange} />)

    await user.type(screen.getByLabelText('Links'), '#')

    expect(onChange).toHaveBeenCalledWith('#')
  })

  it('calls onChange once per character typed', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorInput {...defaultProps} onChange={onChange} />)

    await user.type(screen.getByLabelText('Links'), 'abc')

    expect(onChange).toHaveBeenCalledTimes(3)
  })
})
