import { render, screen } from '@testing-library/react'
import { ColorSwatch } from './ColorSwatch'
import type { Hex, RGB, HSL } from '../../types/colour'

const red: { hex: Hex; rgb: RGB; hsl: HSL } = {
  hex: ['ff', '00', '00'],
  rgb: [255, 0, 0],
  hsl: [0, '100%', '50%'],
}

const white: { hex: Hex; rgb: RGB; hsl: HSL } = {
  hex: ['ff', 'ff', 'ff'],
  rgb: [255, 255, 255],
  hsl: [0, '0%', '100%'],
}

// ─── Value rendering ──────────────────────────────────────────────────────────

describe('ColorSwatch — value rendering', () => {
  it('renders the rgb value', () => {
    render(<ColorSwatch {...red} />)
    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument()
  })

  it('renders the hsl value', () => {
    render(<ColorSwatch {...red} />)
    expect(screen.getByText('hsl(0, 100%, 50%)')).toBeInTheDocument()
  })

  it('renders the hex value', () => {
    render(<ColorSwatch {...red} />)
    expect(screen.getByText('#ff0000')).toBeInTheDocument()
  })

  it('each value is in its own <span>', () => {
    render(<ColorSwatch {...red} />)
    expect(screen.getByText('rgb(255, 0, 0)').tagName).toBe('SPAN')
    expect(screen.getByText('hsl(0, 100%, 50%)').tagName).toBe('SPAN')
    expect(screen.getByText('#ff0000').tagName).toBe('SPAN')
  })
})

// ─── Label ───────────────────────────────────────────────────────────────────

describe('ColorSwatch — label', () => {
  it('renders the label as <strong> when provided', () => {
    render(<ColorSwatch {...red} label="Foreground" />)
    const label = screen.getByText('Foreground')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('STRONG')
  })

  it('does not render a <strong> when label is omitted', () => {
    render(<ColorSwatch {...red} />)
    expect(document.querySelector('strong')).not.toBeInTheDocument()
  })
})

// ─── Inline styles ────────────────────────────────────────────────────────────

describe('ColorSwatch — inline styles', () => {
  it('sets the background colour to the rgb value', () => {
    const { container } = render(<ColorSwatch {...red} />)
    const swatch = container.firstElementChild as HTMLElement
    expect(swatch.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('sets a text colour for contrast', () => {
    const { container } = render(<ColorSwatch {...red} />)
    const swatch = container.firstElementChild as HTMLElement
    expect(swatch.style.color).toBeTruthy()
  })

  it('uses a lighter text colour on dark backgrounds than on light backgrounds', () => {
    const black = { hex: ['00', '00', '00'] as Hex, rgb: [0, 0, 0] as RGB, hsl: [0, '0%', '0%'] as HSL }
    const { container: darkContainer } = render(<ColorSwatch {...black} />)
    const { container: lightContainer } = render(<ColorSwatch {...white} />)
    const darkTextColor = (darkContainer.firstElementChild as HTMLElement).style.color
    const lightTextColor = (lightContainer.firstElementChild as HTMLElement).style.color
    const rgbSum = (color: string): number => {
      const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (rgb) return Number(rgb[1]) + Number(rgb[2]) + Number(rgb[3])
      const hex = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
      if (hex) return parseInt(hex[1], 16) + parseInt(hex[2], 16) + parseInt(hex[3], 16)
      return 0
    }
    // Both should be set; the dark-background text should be lighter (higher RGB sum)
    expect(darkTextColor).toBeTruthy()
    expect(lightTextColor).toBeTruthy()
    expect(rgbSum(darkTextColor)).toBeGreaterThan(rgbSum(lightTextColor))
  })
})
