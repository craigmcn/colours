import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColourBlender } from './ColourBlender'
import { useClipboard } from '../../hooks/useClipboard'

vi.mock('../../hooks/useClipboard')

// Default state:
//   Start  #005b99  rgb(0, 91, 153)
//   End    #ffffff  rgb(255, 255, 255)
//   Steps  5
//
// Default blend (6 swatches, i=0..5):
//   0: #005b99  rgb(0, 91, 153)    hsl(204, 100%, 30%)
//   1: #337cad  rgb(51, 124, 173)
//   2: #669dc2  rgb(102, 157, 194)
//   3: #99bdd6  rgb(153, 189, 214)
//   4: #ccdeeb  rgb(204, 222, 235)
//   5: #ffffff  rgb(255, 255, 255)
//
// Each swatch is a role="group" aria-label={hexStr} container.
// Values are rendered as <span> elements, queryable via getByText() / within().
// Steps is a plain text <input> — use fireEvent.change, not userEvent.type.

beforeEach(() => {
  vi.mocked(useClipboard).mockReturnValue({
    copy: vi.fn() as (text: string, key: string) => void,
    copiedKey: null,
    isSupported: true,
  })
})

const renderComponent = () => render(<ColourBlender />)
const stepsInput = () => screen.getByLabelText('Steps')
const setSteps = (n: number) => fireEvent.change(stepsInput(), { target: { value: String(n) } })
const hexButtonCount = () => screen.getAllByRole('button', { name: 'HEX' }).length
const swatchGroups = () => screen.getAllByRole('group')

// ─── Initial render ───────────────────────────────────────────────────────────

describe('initial render', () => {
  it('renders the page heading', () => {
    renderComponent()
    expect(screen.getByRole('heading', { name: /colour blender/i })).toBeInTheDocument()
  })

  it('renders Start, End, and Steps inputs', () => {
    renderComponent()
    expect(screen.getByLabelText('Start')).toBeInTheDocument()
    expect(screen.getByLabelText('End')).toBeInTheDocument()
    expect(stepsInput()).toBeInTheDocument()
  })

  it('colour inputs start empty', () => {
    renderComponent()
    expect(screen.getByLabelText('Start')).toHaveValue('')
    expect(screen.getByLabelText('End')).toHaveValue('')
  })

  it('Steps input defaults to 5', () => {
    renderComponent()
    expect(stepsInput()).toHaveValue('5')
  })

  it('renders 6 swatches by default (steps + 1)', () => {
    renderComponent()
    expect(hexButtonCount()).toBe(6)
  })

  it('each swatch has HEX, RGB, and HSL copy buttons', () => {
    renderComponent()
    expect(screen.getAllByRole('button', { name: 'HEX' })).toHaveLength(6)
    expect(screen.getAllByRole('button', { name: 'RGB' })).toHaveLength(6)
    expect(screen.getAllByRole('button', { name: 'HSL' })).toHaveLength(6)
  })
})

// ─── Default blend swatches ───────────────────────────────────────────────────

describe('default blend swatches', () => {
  it('first swatch is the start colour', () => {
    renderComponent()
    expect(within(swatchGroups()[0]).getByText('rgb(0, 91, 153)')).toBeInTheDocument()
    expect(within(swatchGroups()[0]).getByText('#005b99')).toBeInTheDocument()
  })

  it('last swatch is the end colour', () => {
    renderComponent()
    const groups = swatchGroups()
    expect(within(groups[groups.length - 1]).getByText('rgb(255, 255, 255)')).toBeInTheDocument()
    expect(within(groups[groups.length - 1]).getByText('#ffffff')).toBeInTheDocument()
  })

  it('contains all intermediate blend colours', () => {
    renderComponent()
    expect(screen.getByText('rgb(51, 124, 173)')).toBeInTheDocument()
    expect(screen.getByText('rgb(102, 157, 194)')).toBeInTheDocument()
    expect(screen.getByText('rgb(153, 189, 214)')).toBeInTheDocument()
    expect(screen.getByText('rgb(204, 222, 235)')).toBeInTheDocument()
  })

  it('first swatch includes hsl value', () => {
    renderComponent()
    expect(within(swatchGroups()[0]).getByText('hsl(204, 100%, 30%)')).toBeInTheDocument()
  })
})

// ─── Steps input ──────────────────────────────────────────────────────────────

describe('Steps input', () => {
  it('changing to 1 renders 2 swatches (start + end only)', () => {
    renderComponent()
    setSteps(1)
    expect(hexButtonCount()).toBe(2)
  })

  it('changing to 2 renders 3 swatches', () => {
    renderComponent()
    setSteps(2)
    expect(hexButtonCount()).toBe(3)
  })

  it('changing to 10 renders 11 swatches', () => {
    renderComponent()
    setSteps(10)
    expect(hexButtonCount()).toBe(11)
  })

  it('entering 0 falls back to 1 step minimum (2 swatches)', () => {
    renderComponent()
    setSteps(0)
    expect(hexButtonCount()).toBe(2)
  })

  it('clearing the field falls back to 1 step minimum (2 swatches)', () => {
    renderComponent()
    fireEvent.change(stepsInput(), { target: { value: '' } })
    expect(hexButtonCount()).toBe(2)
  })

  it('increasing steps adds intermediate swatches', () => {
    renderComponent()
    setSteps(3)
    expect(hexButtonCount()).toBe(4)
    setSteps(7)
    expect(hexButtonCount()).toBe(8)
  })
})

// ─── Start colour input ───────────────────────────────────────────────────────

describe('Start colour input', () => {
  it('accepts a hex colour and shows it in the first swatch', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), '#ff0000')
    expect(screen.getByText('#ff0000')).toBeInTheDocument()
    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument()
  })

  it('accepts an rgb() colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), 'rgb(255, 0, 0)')
    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument()
  })

  it('accepts an hsl() colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), 'hsl(0, 100%, 50%)')
    expect(screen.getByText('hsl(0, 100%, 50%)')).toBeInTheDocument()
  })

  it('changing Start removes the old first swatch colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), '#ff0000')
    expect(screen.queryByText('rgb(0, 91, 153)')).not.toBeInTheDocument()
  })
})

// ─── End colour input ─────────────────────────────────────────────────────────

describe('End colour input', () => {
  it('accepts a hex colour and shows it in the last swatch', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('End'), '#000000')
    expect(screen.getByText('#000000')).toBeInTheDocument()
  })

  it('changing End removes the old last swatch colour', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('End'), '#000000')
    expect(screen.queryByText('rgb(255, 255, 255)')).not.toBeInTheDocument()
  })
})

// ─── Blend correctness ────────────────────────────────────────────────────────

describe('blend correctness', () => {
  it('black to white at 2 steps produces a grey midpoint', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), '#000000')
    await user.type(screen.getByLabelText('End'), '#ffffff')
    setSteps(2)
    expect(screen.getByText('rgb(128, 128, 128)')).toBeInTheDocument()
  })

  it('same start and end colour produces identical-looking swatches', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), '#ff0000')
    await user.type(screen.getByLabelText('End'), '#ff0000')
    setSteps(2)
    // All 3 swatches should be red — count <span> elements containing #ff0000
    expect(screen.getAllByText('#ff0000').length).toBeGreaterThanOrEqual(3)
  })

  it('at 1 step only start and end are shown', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), '#000000')
    await user.type(screen.getByLabelText('End'), '#ffffff')
    setSteps(1)
    expect(hexButtonCount()).toBe(2)
    expect(screen.getByText('#000000')).toBeInTheDocument()
    expect(screen.getByText('#ffffff')).toBeInTheDocument()
  })

  it('intermediate swatches are strictly between start and end brightness', async () => {
    const user = userEvent.setup()
    renderComponent()
    // Black → white: all intermediate R channels should be strictly 0 < R < 255
    await user.type(screen.getByLabelText('Start'), '#000000')
    await user.type(screen.getByLabelText('End'), '#ffffff')
    // Steps already = 5, so intermediates at 1/5, 2/5, 3/5, 4/5
    const groups = swatchGroups()
    const intermediates = groups.slice(1, -1)
    expect(intermediates.length).toBeGreaterThan(0)
    for (const group of intermediates) {
      const rgbEl = within(group).getByText(/^rgb\(\d+, \d+, \d+\)$/)
      const r = parseInt(rgbEl.textContent!.match(/rgb\((\d+)/)![1])
      expect(r).toBeGreaterThan(0)
      expect(r).toBeLessThan(255)
    }
  })

  it('swatches lighten from start to end when blending dark to light', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.type(screen.getByLabelText('Start'), '#000000')
    await user.type(screen.getByLabelText('End'), '#ffffff')
    setSteps(2)
    const groups = swatchGroups()
    const idx0 = groups.findIndex(g => g.textContent!.includes('rgb(0, 0, 0)'))
    const idx1 = groups.findIndex(g => g.textContent!.includes('rgb(128, 128, 128)'))
    const idx2 = groups.findIndex(g => g.textContent!.includes('rgb(255, 255, 255)'))
    expect(idx0).toBeLessThan(idx1)
    expect(idx1).toBeLessThan(idx2)
  })
})

// ─── Copy interactions ────────────────────────────────────────────────────────

describe('copy interactions', () => {
  it('clicking HEX calls copy with a valid hex string', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(within(swatchGroups()[0]).getByRole('button', { name: 'HEX' }))

    expect(mockCopy).toHaveBeenCalledWith(
      expect.stringMatching(/^#[0-9a-f]{6}$/),
      expect.any(String),
    )
  })

  it('clicking RGB calls copy with an rgb() string', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(within(swatchGroups()[0]).getByRole('button', { name: 'RGB' }))

    expect(mockCopy).toHaveBeenCalledWith(
      expect.stringMatching(/^rgb\(\d+, \d+, \d+\)$/),
      expect.any(String),
    )
  })

  it('clicking HSL calls copy with an hsl() string', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(within(swatchGroups()[0]).getByRole('button', { name: 'HSL' }))

    expect(mockCopy).toHaveBeenCalledWith(
      expect.stringMatching(/^hsl\(\d+, \d+%, \d+%\)$/),
      expect.any(String),
    )
  })

  it('first swatch HEX button copies the start colour', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(within(screen.getByRole('group', { name: '#005b99' })).getByRole('button', { name: 'HEX' }))

    expect(mockCopy).toHaveBeenCalledWith('#005b99', expect.any(String))
  })

  it('last swatch HEX button copies the end colour', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    await user.click(within(screen.getByRole('group', { name: '#ffffff' })).getByRole('button', { name: 'HEX' }))

    expect(mockCopy).toHaveBeenCalledWith('#ffffff', expect.any(String))
  })

  it('each button uses a unique copy key', async () => {
    const mockCopy = vi.fn() as (text: string, key: string) => void
    vi.mocked(useClipboard).mockReturnValue({ copy: mockCopy, copiedKey: null, isSupported: true })
    const user = userEvent.setup()
    renderComponent()

    const groups = swatchGroups()
    await user.click(within(groups[0]).getByRole('button', { name: 'HEX' }))
    await user.click(within(groups[1]).getByRole('button', { name: 'HEX' }))

    const key0 = (mockCopy as ReturnType<typeof vi.fn>).mock.calls[0][1]
    const key1 = (mockCopy as ReturnType<typeof vi.fn>).mock.calls[1][1]
    expect(key0).not.toBe(key1)
  })
})

// ─── Swatch layout ────────────────────────────────────────────────────────────

describe('swatch layout', () => {
  it('first swatch shows rgb, hsl, and hex for the start colour', () => {
    renderComponent()
    const first = swatchGroups()[0]
    expect(within(first).getByText('rgb(0, 91, 153)')).toBeInTheDocument()
    expect(within(first).getByText('hsl(204, 100%, 30%)')).toBeInTheDocument()
    expect(within(first).getByText('#005b99')).toBeInTheDocument()
  })

  it('swatches are ordered start → end (dark to light for default colours)', () => {
    renderComponent()
    const groups = swatchGroups()
    const idx0 = groups.findIndex(g => g.textContent!.includes('rgb(0, 91, 153)'))
    const idx1 = groups.findIndex(g => g.textContent!.includes('rgb(51, 124, 173)'))
    const idx2 = groups.findIndex(g => g.textContent!.includes('rgb(255, 255, 255)'))
    expect(idx0).toBeLessThan(idx1)
    expect(idx1).toBeLessThan(idx2)
  })

  it('changing steps re-renders without stale swatches', () => {
    renderComponent()
    setSteps(2)
    // Should now have exactly 3 swatches, not 6
    expect(hexButtonCount()).toBe(3)
    // Intermediate colours from steps=5 should not appear
    expect(screen.queryByText('rgb(51, 124, 173)')).not.toBeInTheDocument()
    expect(screen.queryByText('rgb(102, 157, 194)')).not.toBeInTheDocument()
  })
})
