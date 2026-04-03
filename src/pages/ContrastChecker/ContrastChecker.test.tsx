import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContrastChecker } from './ContrastChecker'

// Default colors:
//   Link    #0000FF  rgb(0, 0, 255)    hsl(240, 100%, 50%)
//   Text    #222222  rgb(34, 34, 34)   hsl(0, 0%, 13%)
//   Bg      #FFFFFF  rgb(255, 255, 255) hsl(0, 0%, 100%)
//
// Default contrast ratios:
//   link2Body  1.85  (Fail A)
//   link2Bg    8.59  (Pass AA, Pass AAA)
//   body2Bg   15.9   (Pass AA, Pass AAA)

const renderComponent = () => render(<ContrastChecker />)

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('initial render', () => {
  it('renders a labeled input for each swatch card', () => {
    renderComponent()
    expect(screen.getByLabelText('Links')).toBeInTheDocument()
    expect(screen.getByLabelText('Text')).toBeInTheDocument()
    expect(screen.getByLabelText('Background')).toBeInTheDocument()
  })

  it('renders all three contrast result sections', () => {
    renderComponent()
    expect(screen.getByText('Link to Body text')).toBeInTheDocument()
    expect(screen.getByText('Link to Background')).toBeInTheDocument()
    expect(screen.getByText('Body text to Background')).toBeInTheDocument()
  })

  it('renders WCAG AA and WCAG AAA calculation buttons', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: 'WCAG AA' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'WCAG AAA' })).toBeInTheDocument()
  })

  it('renders the colour preview example', () => {
    renderComponent()
    expect(screen.getByText(/foreground text/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'link text' })).toBeInTheDocument()
  })

  it('displays default colour values in source and compare swatches', () => {
    renderComponent()
    // Each swatch shows source + compare — all identical at startup
    expect(screen.getAllByText('#0000ff').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('rgb(0, 0, 255)').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('hsl(240, 100%, 50%)').length).toBeGreaterThanOrEqual(2)
  })

  it('inputs start empty', () => {
    renderComponent()
    expect(screen.getByLabelText('Links')).toHaveValue('')
    expect(screen.getByLabelText('Text')).toHaveValue('')
    expect(screen.getByLabelText('Background')).toHaveValue('')
  })
})

// ─── Default contrast ratios ──────────────────────────────────────────────────

describe('default contrast ratios', () => {
  it('displays the link-to-body ratio (1.85)', () => {
    renderComponent()
    expect(screen.getByText('1.85')).toBeInTheDocument()
  })

  it('displays the link-to-background ratio (8.59)', () => {
    renderComponent()
    expect(screen.getByText('8.59')).toBeInTheDocument()
  })

  it('displays the body-to-background ratio (≥15)', () => {
    renderComponent()
    const section = screen.getByText('Body text to Background').closest('section')!
    const ratioText = within(section).getByText(/^\d+\.\d+$/).textContent
    expect(parseFloat(ratioText!)).toBeGreaterThanOrEqual(15)
  })

  it('link-to-body fails WCAG A by default', () => {
    renderComponent()
    const section = screen.getByText('Link to Body text').closest('section')!
    expect(within(section).getByText('Fail')).toBeInTheDocument()
    expect(within(section).queryByText('Pass')).not.toBeInTheDocument()
  })

  it('link-to-background passes WCAG AA and AAA by default', () => {
    renderComponent()
    const section = screen.getByText('Link to Background').closest('section')!
    expect(within(section).getAllByText('Pass')).toHaveLength(2)
  })

  it('body-to-background passes WCAG AA and AAA by default', () => {
    renderComponent()
    const section = screen.getByText('Body text to Background').closest('section')!
    expect(within(section).getAllByText('Pass')).toHaveLength(2)
  })
})

// ─── Colour input changes ─────────────────────────────────────────────────────

describe('colour input changes', () => {
  it('accepts a hex colour and updates the compare swatch', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#ff0000')

    expect(screen.getAllByText('rgb(255, 0, 0)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('#ff0000').length).toBeGreaterThanOrEqual(1)
  })

  it('accepts an rgb() colour string', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), 'rgb(0, 128, 0)')

    expect(screen.getAllByText('rgb(0, 128, 0)').length).toBeGreaterThanOrEqual(1)
  })

  it('accepts an hsl() colour string', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), 'hsl(120, 100%, 25%)')

    expect(screen.getAllByText('hsl(120, 100%, 25%)').length).toBeGreaterThanOrEqual(1)
  })

  it('updates contrast ratios when a colour changes', async () => {
    const user = userEvent.setup()
    renderComponent()

    // #FFFFFF on #FFFFFF → ratio 1
    await user.type(screen.getByLabelText('Links'), '#ffffff')

    expect(screen.queryByText('8.59')).not.toBeInTheDocument()
  })

  it('updates the colour preview example inline styles', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#cc0000')

    const link = screen.getByRole('link', { name: 'link text' })
    expect(link).toHaveStyle({ color: '#cc0000' })
  })
})

// ─── Source swatch stays frozen on slider changes ─────────────────────────────

describe('source swatch stays frozen on slider changes', () => {
  it('source swatch keeps original hex when saturation slider moves', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#ff0000')

    fireEvent.change(document.getElementById('linkColorSat')!, { target: { value: '50' } })

    // Source swatch still shows typed colour
    expect(screen.getAllByText('#ff0000').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('rgb(255, 0, 0)').length).toBeGreaterThanOrEqual(1)
  })

  it('source swatch keeps original hex when lightness slider moves', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Text'), '#333333')

    fireEvent.change(document.getElementById('textColorLight')!, { target: { value: '70' } })

    expect(screen.getAllByText('#333333').length).toBeGreaterThanOrEqual(1)
  })

  it('source swatch for Background stays frozen when its sliders move', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Background'), '#f5f5f5')

    fireEvent.change(document.getElementById('bgColorSat')!, { target: { value: '30' } })

    expect(screen.getAllByText('#f5f5f5').length).toBeGreaterThanOrEqual(1)
  })
})

// ─── Input value stays static on slider changes ───────────────────────────────

describe('input value stays static on slider changes', () => {
  it('Links input value is unchanged after saturation slider moves', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#ff0000')
    fireEvent.change(document.getElementById('linkColorSat')!, { target: { value: '50' } })

    expect(screen.getByLabelText('Links')).toHaveValue('#ff0000')
  })

  it('Links input value is unchanged after lightness slider moves', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#ff0000')
    fireEvent.change(document.getElementById('linkColorLight')!, { target: { value: '30' } })

    expect(screen.getByLabelText('Links')).toHaveValue('#ff0000')
  })

  it('Text input value is unchanged after saturation slider moves', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Text'), '#444444')
    fireEvent.change(document.getElementById('textColorSat')!, { target: { value: '20' } })

    expect(screen.getByLabelText('Text')).toHaveValue('#444444')
  })

  it('Background input value is unchanged after lightness slider moves', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Background'), '#f0f0f0')
    fireEvent.change(document.getElementById('bgColorLight')!, { target: { value: '60' } })

    expect(screen.getByLabelText('Background')).toHaveValue('#f0f0f0')
  })
})

// ─── Slider updates compare colour ───────────────────────────────────────────

describe('sliders update the compare colour', () => {
  it('saturation slider changes the compare swatch values', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#ff0000')
    // ff0000 = hsl(0, 100%, 50%) — reduce sat to 50%
    fireEvent.change(document.getElementById('linkColorSat')!, { target: { value: '50' } })

    // compare swatch should now show hsl(0, 50%, 50%)
    expect(screen.getAllByText('hsl(0, 50%, 50%)').length).toBeGreaterThanOrEqual(1)
  })

  it('lightness slider changes the compare swatch values', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#ff0000')
    fireEvent.change(document.getElementById('linkColorLight')!, { target: { value: '30' } })

    expect(screen.getAllByText('hsl(0, 100%, 30%)').length).toBeGreaterThanOrEqual(1)
  })

  it('slider changes update the contrast ratios', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Links'), '#0000ff')
    expect(screen.getByText('8.59')).toBeInTheDocument()

    fireEvent.change(document.getElementById('linkColorLight')!, { target: { value: '10' } })

    // Ratio should have changed (darker blue has different contrast against white)
    expect(screen.queryByText('8.59')).not.toBeInTheDocument()
  })
})

// ─── WCAG calculation buttons ─────────────────────────────────────────────────

describe('WCAG AA button', () => {
  it('sets Text and Link inputs to calculated hex values', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AA' }))

    expect((screen.getByLabelText('Text') as HTMLInputElement).value).toMatch(/^#[0-9a-f]{6}$/)
    expect((screen.getByLabelText('Links') as HTMLInputElement).value).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('does not change the Background input', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AA' }))

    expect(screen.getByLabelText('Background')).toHaveValue('')
  })

  it('produces body-to-background that passes WCAG AA', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AA' }))

    const section = screen.getByText('Body text to Background').closest('section')!
    const aaRow = within(section).getByText(/WCAG AA:/)
    expect(aaRow).toHaveTextContent('Pass')
  })

  it('updates the source swatch for Text and Link', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AA' }))

    const textValue = (screen.getByLabelText('Text') as HTMLInputElement).value
    // Source swatch should display the WCAG-calculated hex
    expect(screen.getAllByText(textValue).length).toBeGreaterThanOrEqual(1)
  })

  it('source swatch remains frozen after subsequent slider changes', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AA' }))

    const textInput = screen.getByLabelText('Text') as HTMLInputElement
    const wcagValue = textInput.value

    fireEvent.change(document.getElementById('textColorLight')!, { target: { value: '80' } })

    expect(textInput).toHaveValue(wcagValue)
    expect(screen.getAllByText(wcagValue).length).toBeGreaterThanOrEqual(1)
  })
})

describe('WCAG AAA button', () => {
  it('sets Text and Link inputs to calculated hex values', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AAA' }))

    expect((screen.getByLabelText('Text') as HTMLInputElement).value).toMatch(/^#[0-9a-f]{6}$/)
    expect((screen.getByLabelText('Links') as HTMLInputElement).value).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('does not change the Background input', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AAA' }))

    expect(screen.getByLabelText('Background')).toHaveValue('')
  })

  it('produces body-to-background that passes WCAG AAA', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AAA' }))

    const section = screen.getByText('Body text to Background').closest('section')!
    const aaaRow = within(section).getByText(/WCAG AAA:/)
    expect(aaaRow).toHaveTextContent('Pass')
  })

  it('produces higher-contrast colours than WCAG AA', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'WCAG AA' }))
    const aaBodyRatio = parseFloat(
      screen.getByText('Body text to Background').closest('section')!
        .querySelector('[class]')!.textContent!
    )

    await user.click(screen.getByRole('button', { name: 'WCAG AAA' }))
    const aaaBodyRatio = parseFloat(
      screen.getByText('Body text to Background').closest('section')!
        .querySelector('[class]')!.textContent!
    )

    expect(aaaBodyRatio).toBeGreaterThanOrEqual(aaBodyRatio)
  })
})
