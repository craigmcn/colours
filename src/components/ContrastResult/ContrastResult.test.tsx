import { render, screen } from '@testing-library/react'
import { ContrastResult } from './ContrastResult'

// ─── link2Body type ───────────────────────────────────────────────────────────

describe('ContrastResult — link2Body (WCAG A only)', () => {
  it('renders the label', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={1.85} results={{ A: 'Fail' }} />)
    expect(screen.getByText('Link to Body text')).toBeInTheDocument()
  })

  it('renders the contrast ratio', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={1.85} results={{ A: 'Fail' }} />)
    expect(screen.getByText('1.85')).toBeInTheDocument()
  })

  it('shows a WCAG A row', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={3} results={{ A: 'Pass' }} />)
    expect(screen.getByText(/WCAG A:/)).toBeInTheDocument()
  })

  it('does not show a WCAG AA or AAA row', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={3} results={{ A: 'Pass' }} />)
    expect(screen.queryByText(/WCAG AA:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/WCAG AAA:/)).not.toBeInTheDocument()
  })

  it('displays Pass when the A result is Pass', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={3} results={{ A: 'Pass' }} />)
    expect(screen.getByText('Pass')).toBeInTheDocument()
    expect(screen.queryByText('Fail')).not.toBeInTheDocument()
  })

  it('displays Fail when the A result is Fail', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={1.85} results={{ A: 'Fail' }} />)
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('shows the underline tip when A fails', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={1.85} results={{ A: 'Fail' }} />)
    expect(screen.getByText(/underline/i)).toBeInTheDocument()
  })

  it('hides the underline tip when A passes', () => {
    render(<ContrastResult type="link2Body" label="Link to Body text" ratio={3} results={{ A: 'Pass' }} />)
    expect(screen.queryByText(/underline/i)).not.toBeInTheDocument()
  })
})

// ─── link2Bg type ─────────────────────────────────────────────────────────────

describe('ContrastResult — link2Bg (WCAG AA + AAA)', () => {
  it('renders the label', () => {
    render(<ContrastResult type="link2Bg" label="Link to Background" ratio={8.59} results={{ AA: 'Pass', AAA: 'Pass' }} />)
    expect(screen.getByText('Link to Background')).toBeInTheDocument()
  })

  it('renders the contrast ratio', () => {
    render(<ContrastResult type="link2Bg" label="Link to Background" ratio={8.59} results={{ AA: 'Pass', AAA: 'Pass' }} />)
    expect(screen.getByText('8.59')).toBeInTheDocument()
  })

  it('shows WCAG AA and WCAG AAA rows', () => {
    render(<ContrastResult type="link2Bg" label="Link to Background" ratio={8.59} results={{ AA: 'Pass', AAA: 'Pass' }} />)
    expect(screen.getByText(/WCAG AA:/)).toBeInTheDocument()
    expect(screen.getByText(/WCAG AAA:/)).toBeInTheDocument()
  })

  it('does not show a WCAG A row', () => {
    render(<ContrastResult type="link2Bg" label="Link to Background" ratio={8.59} results={{ AA: 'Pass', AAA: 'Pass' }} />)
    expect(screen.queryByText(/WCAG A:/)).not.toBeInTheDocument()
  })

  it('shows Pass for both when both pass', () => {
    render(<ContrastResult type="link2Bg" label="Link to Background" ratio={8.59} results={{ AA: 'Pass', AAA: 'Pass' }} />)
    expect(screen.getAllByText('Pass')).toHaveLength(2)
  })

  it('shows Fail for AAA when only AA passes', () => {
    render(<ContrastResult type="link2Bg" label="Link to Background" ratio={5} results={{ AA: 'Pass', AAA: 'Fail' }} />)
    expect(screen.getByText('Pass')).toBeInTheDocument()
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('shows Fail for both when neither passes', () => {
    render(<ContrastResult type="link2Bg" label="Link to Background" ratio={3} results={{ AA: 'Fail', AAA: 'Fail' }} />)
    expect(screen.getAllByText('Fail')).toHaveLength(2)
  })
})

// ─── body2Bg type ─────────────────────────────────────────────────────────────

describe('ContrastResult — body2Bg (WCAG AA + AAA)', () => {
  it('renders the label and ratio', () => {
    render(<ContrastResult type="body2Bg" label="Body text to Background" ratio={15.91} results={{ AA: 'Pass', AAA: 'Pass' }} />)
    expect(screen.getByText('Body text to Background')).toBeInTheDocument()
    expect(screen.getByText('15.91')).toBeInTheDocument()
  })

  it('shows both WCAG rows', () => {
    render(<ContrastResult type="body2Bg" label="Body text to Background" ratio={15.91} results={{ AA: 'Pass', AAA: 'Pass' }} />)
    expect(screen.getByText(/WCAG AA:/)).toBeInTheDocument()
    expect(screen.getByText(/WCAG AAA:/)).toBeInTheDocument()
  })
})
