import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { OpacityCalculator } from './OpacityCalculator'
import { useClipboard } from '../../hooks/useClipboard'

vi.mock('../../hooks/useClipboard')

// Default state:
//   Foreground  #005b99   rgb(0, 91, 153)
//   Background  #ffffff   rgb(255, 255, 255)
//   Opacity     25%
//   Result      #bfd6e6   rgb(191, 214, 230)  — calculated
//   Solve for   Result    (default)
//
// Because both the radio labels and the colour inputs share text like
// "Foreground", "Background", "Result", and "Opacity", we use role-based
// queries to disambiguate:
//   text inputs  → getByRole('textbox', { name: '...' })
//   range slider → getByRole('slider', { name: 'Opacity' })
//   radios       → getByRole('radio',  { name: '...' })

beforeEach(() => {
  vi.mocked(useClipboard).mockReturnValue({
    copy: vi.fn() as (text: string, key: string) => void,
    copiedKey: null,
    isSupported: true,
  })
})

const renderComponent = () => render(<OpacityCalculator />)

// helpers
const fgInput  = () => screen.getByRole('textbox', { name: 'Foreground' })
const bgInput  = () => screen.getByRole('textbox', { name: 'Background' })
const resInput = () => screen.getByRole('textbox', { name: 'Result' })
const opSlider = () => screen.getByRole('slider',  { name: 'Opacity' })

// ─── Initial render ───────────────────────────────────────────────────────────

describe('initial render', () => {
  it('renders the page heading', () => {
    renderComponent()
    expect(screen.getByRole('heading', { name: /calculate opacity/i })).toBeInTheDocument()
  })

  it('renders Foreground, Background, and Result text inputs', () => {
    renderComponent()
    expect(fgInput()).toBeInTheDocument()
    expect(bgInput()).toBeInTheDocument()
    expect(resInput()).toBeInTheDocument()
  })

  it('renders the opacity range slider', () => {
    renderComponent()
    expect(opSlider()).toBeInTheDocument()
    expect(opSlider()).toHaveAttribute('type', 'range')
  })

  it('renders solve-for radio options for all four fields', () => {
    renderComponent()
    expect(screen.getByRole('radio', { name: 'Foreground' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Background' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Result' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Opacity' })).toBeInTheDocument()
  })

  it('defaults to "Result" as the solved field', () => {
    renderComponent()
    expect(screen.getByRole('radio', { name: 'Result' })).toBeChecked()
  })

  it('Result input is disabled by default (it is the solved field)', () => {
    renderComponent()
    expect(resInput()).toBeDisabled()
  })

  it('Foreground and Background inputs are enabled by default', () => {
    renderComponent()
    expect(fgInput()).not.toBeDisabled()
    expect(bgInput()).not.toBeDisabled()
  })

  it('opacity slider is enabled by default', () => {
    renderComponent()
    expect(opSlider()).not.toBeDisabled()
  })

  it('opacity slider starts at 25', () => {
    renderComponent()
    expect(opSlider()).toHaveValue('25')
  })

  it('displays three colour swatches', () => {
    renderComponent()
    // Each swatch title is in a <strong>; other instances are radio labels or form labels
    const strongs = document.querySelectorAll('strong')
    const titles = Array.from(strongs).map(el => el.textContent)
    expect(titles).toContain('Foreground')
    expect(titles).toContain('Result')
    expect(titles).toContain('Background')
  })

  it('displays opacity as decimal fraction and percentage', () => {
    renderComponent()
    expect(screen.getByText('0.25')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })
})

// ─── Solve for Result (default) ───────────────────────────────────────────────

describe('solve for Result', () => {
  it('Result input shows the computed hex', () => {
    renderComponent()
    expect(resInput()).toHaveValue('#bfd6e6')
  })

  it('at opacity 0%, result equals background', () => {
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '0' } })
    expect(resInput()).toHaveValue('#ffffff')
  })

  it('at opacity 100%, result equals foreground', () => {
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '100' } })
    expect(resInput()).toHaveValue('#005b99')
  })

  it('Result updates when the opacity slider changes', () => {
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '50' } })
    // Any blend between fg and bg — just not the default value
    expect(resInput()).not.toHaveValue('#bfd6e6')
  })

  it('Result updates when Foreground input changes', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(fgInput(), '#ff0000')
    expect(resInput()).not.toHaveValue('#bfd6e6')
  })

  it('Result updates when Background input changes', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(bgInput(), '#000000')
    expect(resInput()).not.toHaveValue('#bfd6e6')
  })
})

// ─── Solve for Opacity ────────────────────────────────────────────────────────

describe('solve for Opacity', () => {
  it('selecting Opacity radio disables the slider', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Opacity' }))
    expect(opSlider()).toBeDisabled()
  })

  it('enables the Result input after switching', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Opacity' }))
    expect(resInput()).not.toBeDisabled()
  })

  it('seeds the Result input with the previously computed result', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Opacity' }))
    expect(resInput()).toHaveValue('#bfd6e6')
  })

  it('calculates a high opacity when result is close to foreground', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Opacity' }))
    await user.clear(resInput())
    await user.type(resInput(), '#005b99')
    expect(parseInt((opSlider() as HTMLInputElement).value)).toBeGreaterThanOrEqual(90)
  })

  it('shows 0% opacity when result equals background', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Opacity' }))
    await user.clear(resInput())
    await user.type(resInput(), '#ffffff')
    expect((opSlider() as HTMLInputElement).value).toBe('0')
  })
})

// ─── Solve for Foreground ─────────────────────────────────────────────────────

describe('solve for Foreground', () => {
  it('disables the Foreground input', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Foreground' }))
    expect(fgInput()).toBeDisabled()
  })

  it('enables the Result input', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Foreground' }))
    expect(resInput()).not.toBeDisabled()
  })

  it('computes a valid hex foreground colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Foreground' }))
    expect((fgInput() as HTMLInputElement).value).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('shows a warning at opacity 0%', async () => {
    const user = userEvent.setup()
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '0' } })
    await user.click(screen.getByRole('radio', { name: 'Foreground' }))
    expect(screen.getByText(/opacity is 0%/i)).toBeInTheDocument()
  })

  it('shows no warning when opacity is above 0%', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Foreground' }))
    expect(screen.queryByText(/opacity is 0%/i)).not.toBeInTheDocument()
  })
})

// ─── Solve for Background ─────────────────────────────────────────────────────

describe('solve for Background', () => {
  it('disables the Background input', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Background' }))
    expect(bgInput()).toBeDisabled()
  })

  it('enables the Result input', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Background' }))
    expect(resInput()).not.toBeDisabled()
  })

  it('computes a valid hex background colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Background' }))
    expect((bgInput() as HTMLInputElement).value).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('shows a warning at opacity 100%', async () => {
    const user = userEvent.setup()
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '100' } })
    await user.click(screen.getByRole('radio', { name: 'Background' }))
    expect(screen.getByText(/opacity is 100%/i)).toBeInTheDocument()
  })

  it('shows no warning when opacity is below 100%', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Background' }))
    expect(screen.queryByText(/opacity is 100%/i)).not.toBeInTheDocument()
  })
})

// ─── Switching between modes ──────────────────────────────────────────────────

describe('switching solve-for mode', () => {
  it('only one radio is checked at a time', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Foreground' }))
    expect(screen.getByRole('radio', { name: 'Foreground' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Background' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Result' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Opacity' })).not.toBeChecked()
  })

  it('each mode disables exactly its own input', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('radio', { name: 'Foreground' }))
    expect(fgInput()).toBeDisabled()
    expect(bgInput()).not.toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Background' }))
    expect(bgInput()).toBeDisabled()
    expect(fgInput()).not.toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Result' }))
    expect(resInput()).toBeDisabled()
    expect(fgInput()).not.toBeDisabled()
    expect(bgInput()).not.toBeDisabled()
  })

  it('switching from Result mode seeds the Result input with the last computed value', async () => {
    const user = userEvent.setup()
    renderComponent()
    // Default computed result is #bfd6e6
    await user.click(screen.getByRole('radio', { name: 'Opacity' }))
    expect(resInput()).toHaveValue('#bfd6e6')
  })

  it('switching from Opacity mode seeds the slider with the solved opacity', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('radio', { name: 'Opacity' }))

    // Type #ffffff as result → opacity should be 0
    await user.clear(resInput())
    await user.type(resInput(), '#ffffff')

    await user.click(screen.getByRole('radio', { name: 'Result' }))
    expect(opSlider()).toHaveValue('0')
  })
})

// ─── Opacity display ──────────────────────────────────────────────────────────

describe('opacity display text', () => {
  it('shows 25% as 0.25', () => {
    renderComponent()
    expect(screen.getByText('0.25')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('shows 50% as 0.50', () => {
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '50' } })
    expect(screen.getByText('0.50')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows 100% as integer 1', () => {
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '100' } })
    // useDecimal(1) returns the number 1, not '1.00'
    expect(screen.getByText(/opacity:/)).toHaveTextContent('opacity: 1')
  })

  it('shows 0% as integer 0', () => {
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '0' } })
    expect(screen.getByText(/opacity:/)).toHaveTextContent('opacity: 0')
  })
})

// ─── Colour swatches ──────────────────────────────────────────────────────────

// The swatch titles are in <strong> elements, making them uniquely locatable
// without colliding with the radio-button labels or form labels.
const swatchFor = (title: string) =>
  Array.from(document.querySelectorAll('strong'))
    .find(el => el.textContent === title)!
    .closest('div')!

describe('colour swatches', () => {
  it('foreground swatch shows the default foreground colour values', () => {
    renderComponent()
    const fgSwatch = swatchFor('Foreground')
    expect(within(fgSwatch).getByText('#005b99')).toBeInTheDocument()
    expect(within(fgSwatch).getByText('rgb(0, 91, 153)')).toBeInTheDocument()
  })

  it('background swatch shows the default background colour values', () => {
    renderComponent()
    const bgSwatch = swatchFor('Background')
    expect(within(bgSwatch).getByText('#ffffff')).toBeInTheDocument()
    expect(within(bgSwatch).getByText('rgb(255, 255, 255)')).toBeInTheDocument()
  })

  it('result swatch shows the default computed result', () => {
    renderComponent()
    const resSwatch = swatchFor('Result')
    expect(within(resSwatch).getByText('#bfd6e6')).toBeInTheDocument()
    expect(within(resSwatch).getByText('rgb(191, 214, 230)')).toBeInTheDocument()
  })

  it('result swatch updates when opacity changes to 100%', () => {
    renderComponent()
    fireEvent.change(opSlider(), { target: { value: '100' } })
    const resSwatch = swatchFor('Result')
    expect(within(resSwatch).getByText('#005b99')).toBeInTheDocument()
  })
})
