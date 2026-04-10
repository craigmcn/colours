import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaletteGenerator } from './PaletteGenerator'
import { useClipboard } from '../../hooks/useClipboard'

vi.mock('../../hooks/useClipboard')

// Default state:
//   Base   #808080  rgb(128, 128, 128)  — grey/gray
//   Light  #ffffff  rgb(255, 255, 255)
//   Dark   #222222  rgb(34, 34, 34)
//   Name   '' (empty → nearestNamedColor of base → 'grey'/'gray')
//
// Default palette (12 swatches, step: hex):
//   0:    #ffffff   50:   #f9f9f9   100:  #e6e6e6   200:  #cccccc
//   300:  #b3b3b3   400:  #999999   500:  #808080   600:  #6d6d6d
//   700:  #5a5a5a   800:  #484848   900:  #353535   1000: #222222
//
// Hex values live inside a <div> interleaved with <br> nodes (rgb, hsl, hex),
// so getByText(hexStr) won't find them. Instead we inspect the <pre> element,
// which renders each CSS variable as its own <span> text, e.g.:
//   --grey-500: #808080

beforeEach(() => {
  vi.mocked(useClipboard).mockReturnValue({
    copy: vi.fn() as (text: string, key: string) => void,
    copiedKey: null,
    isSupported: true,
  })
})

const renderComponent = () => render(<PaletteGenerator />)

// Helpers — the pre renders each variable as a <span> (with a <br> sibling)
const pre = () => document.querySelector('pre')!
const preText = () => pre().textContent!
const preLines = () => Array.from(pre().querySelectorAll('span')).map(s => s.textContent!)

// ─── Initial render ───────────────────────────────────────────────────────────

describe('initial render', () => {
  it('renders the page heading', () => {
    renderComponent()
    expect(screen.getByRole('heading', { name: /palette generator/i })).toBeInTheDocument()
  })

  it('renders Name, Base, Light, and Dark inputs', () => {
    renderComponent()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Base')).toBeInTheDocument()
    expect(screen.getByLabelText('Light')).toBeInTheDocument()
    expect(screen.getByLabelText('Dark')).toBeInTheDocument()
  })

  it('all colour inputs start empty', () => {
    renderComponent()
    expect(screen.getByLabelText('Base')).toHaveValue('')
    expect(screen.getByLabelText('Light')).toHaveValue('')
    expect(screen.getByLabelText('Dark')).toHaveValue('')
  })

  it('Name input starts empty', () => {
    renderComponent()
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('renders 12 palette swatches — one HEX copy button per swatch', () => {
    renderComponent()
    expect(screen.getAllByRole('button', { name: 'HEX' })).toHaveLength(12)
  })

  it('renders a Custom properties heading', () => {
    renderComponent()
    expect(screen.getByRole('heading', { name: /custom properties/i })).toBeInTheDocument()
  })

  it('renders a Copy button for the custom properties block', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })
})

// ─── Default palette — CSS variable output ────────────────────────────────────

describe('default palette CSS variable output', () => {
  it('produces 12 CSS variable lines', () => {
    renderComponent()
    expect(preLines()).toHaveLength(12)
  })

  it('uses all 12 step suffixes (0, 50, 100…1000)', () => {
    renderComponent()
    const text = preText()
    for (const step of ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '1000']) {
      expect(text).toMatch(new RegExp(`-${step}:`))
    }
  })

  it('each variable line contains a hex colour value', () => {
    renderComponent()
    for (const line of preLines()) {
      expect(line).toMatch(/#[0-9a-f]{6}/)
    }
  })

  it('step 0 is white (#ffffff)', () => {
    renderComponent()
    expect(preText()).toMatch(/-0: #ffffff/)
  })

  it('step 500 is the default base colour (#808080)', () => {
    renderComponent()
    expect(preText()).toMatch(/-500: #808080/)
  })

  it('step 1000 is the default dark colour (#222222)', () => {
    renderComponent()
    expect(preText()).toMatch(/-1000: #222222/)
  })

  it('step 50 is a near-white step (#f9f9f9)', () => {
    renderComponent()
    expect(preText()).toMatch(/-50: #f9f9f9/)
  })
})

// ─── CSS variable prefix / Name input ────────────────────────────────────────

describe('CSS variable prefix', () => {
  it('uses "grey" or "gray" as prefix when Name and Base are both empty', () => {
    renderComponent()
    expect(preText()).toMatch(/--gr[ae]y-0:/)
  })

  it('uses the typed Name as the variable prefix immediately', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Name'), 'brand')
    expect(preText()).toMatch(/--brand-0:/)
    expect(preText()).toMatch(/--brand-500:/)
    expect(preText()).not.toMatch(/--gr[ae]y-/)
  })

  it('uses nearestNamedColor as prefix when Base has a value but Name is empty', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Base'), '#ff0000')
    // pure red → nearestNamedColor → 'red'
    expect(preText()).toMatch(/--red-/)
  })

  it('Name takes precedence over nearestNamedColor when both are set', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Base'), '#ff0000')
    await user.type(screen.getByLabelText('Name'), 'primary')
    expect(preText()).toMatch(/--primary-/)
    expect(preText()).not.toMatch(/--red-/)
  })
})

// ─── Base colour input ────────────────────────────────────────────────────────

describe('Base colour input', () => {
  it('updates step 500 when a new base hex is typed', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Base'), '#ff0000')
    expect(preText()).toMatch(/-500: #ff0000/)
  })

  it('accepts rgb() input and updates step 500', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Base'), 'rgb(0, 0, 255)')
    expect(preText()).toMatch(/-500: #0000ff/)
  })

  it('accepts hsl() input and updates step 500', async () => {
    const user = userEvent.setup()
    renderComponent()
    // hsl(120, 100%, 25%) = #008000 (green)
    await user.type(screen.getByLabelText('Base'), 'hsl(120, 100%, 25%)')
    expect(preText()).toMatch(/-500: #008000/)
  })

  it('changing Base affects all intermediate swatch steps', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Base'), '#0000ff')
    // Step 0 is still light (white), step 500 is #0000ff, step 1000 is dark
    expect(preText()).toMatch(/-0: #ffffff/)
    expect(preText()).toMatch(/-500: #0000ff/)
    expect(preText()).toMatch(/-1000: #222222/)
  })
})

// ─── Light colour input ───────────────────────────────────────────────────────

describe('Light colour input', () => {
  it('changing Light updates step 0', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Light'), '#fffff0')
    expect(preText()).toMatch(/-0: #fffff0/)
  })

  it('changing Light affects the lighter intermediate steps', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Light'), '#000000')
    // When Light is black and Base is grey, step 0 should be black
    expect(preText()).toMatch(/-0: #000000/)
  })
})

// ─── Dark colour input ────────────────────────────────────────────────────────

describe('Dark colour input', () => {
  it('changing Dark updates step 1000', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Dark'), '#000000')
    expect(preText()).toMatch(/-1000: #000000/)
  })

  it('step 0 is unchanged when only Dark changes', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Dark'), '#000000')
    expect(preText()).toMatch(/-0: #ffffff/)
  })
})

// ─── Palette structure ────────────────────────────────────────────────────────

describe('palette structure', () => {
  it('each swatch has HEX, RGB, and HSL copy buttons', () => {
    renderComponent()
    expect(screen.getAllByRole('button', { name: 'HEX' })).toHaveLength(12)
    expect(screen.getAllByRole('button', { name: 'RGB' })).toHaveLength(12)
    expect(screen.getAllByRole('button', { name: 'HSL' })).toHaveLength(12)
  })

  it('step 0 equals the Light colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Light'), '#aabbcc')
    expect(preText()).toMatch(/-0: #aabbcc/)
  })

  it('step 1000 equals the Dark colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Dark'), '#112233')
    expect(preText()).toMatch(/-1000: #112233/)
  })

  it('all hex values in the variables are valid 6-char hex codes', () => {
    renderComponent()
    for (const line of preLines()) {
      const m = line.match(/(#[0-9a-f]+)/)
      expect(m).not.toBeNull()
      expect(m![1]).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('step values are monotonically darker from 0 to 1000 for a grey palette', () => {
    renderComponent()
    // For a grey palette, brightness (all channels equal) should decrease step by step
    const lines = preLines()
    const brightness = lines.map(line => {
      const m = line.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/)!
      return parseInt(m[1], 16) // R channel — equal to G and B for grey
    })
    for (let i = 1; i < brightness.length; i++) {
      expect(brightness[i]).toBeLessThanOrEqual(brightness[i - 1])
    }
  })
})

// ─── Copy interactions ────────────────────────────────────────────────────────

describe('copy interactions', () => {
  it('clicking a swatch HEX button calls copy with a hex colour string', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getAllByRole('button', { name: 'HEX' })[0])

    expect(mockCopy).toHaveBeenCalledWith(
      expect.stringMatching(/^#[0-9a-f]{6}$/),
      expect.any(String),
    )
  })

  it('clicking a swatch RGB button calls copy with an rgb() string', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getAllByRole('button', { name: 'RGB' })[0])

    expect(mockCopy).toHaveBeenCalledWith(
      expect.stringMatching(/^rgb\(\d+, \d+, \d+\)$/),
      expect.any(String),
    )
  })

  it('clicking the Copy button copies all 12 CSS variable lines', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: /copy/i }))

    const [text] = (mockCopy as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string]
    // variablesText = variables.join('\n') → 12 lines joined by newline
    expect(text.split('\n')).toHaveLength(12)
    expect(text).toMatch(/--gr[ae]y-0: #ffffff/)
    expect(text).toMatch(/--gr[ae]y-500: #808080/)
    expect(text).not.toMatch(/\n$/) // joined, not terminated
  })

  it('the copied variable block uses the typed Name when set', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByLabelText('Name'), 'brand')
    await user.click(screen.getByRole('button', { name: /copy/i }))

    const [text] = (mockCopy as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string]
    expect(text).toMatch(/--brand-500:/)
  })
})
