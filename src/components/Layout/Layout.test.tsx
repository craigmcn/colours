import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from './Layout'

const renderLayout = (children = <div>content</div>) =>
  render(<MemoryRouter><Layout>{children}</Layout></MemoryRouter>)

// ─── Children ─────────────────────────────────────────────────────────────────

describe('Layout — children', () => {
  it('renders children', () => {
    renderLayout(<p>hello world</p>)
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })
})

// ─── Header ───────────────────────────────────────────────────────────────────

describe('Layout — header', () => {
  it('renders the site title heading', () => {
    renderLayout()
    expect(screen.getByRole('heading', { name: /colours/i })).toBeInTheDocument()
  })

  it('renders the brand link', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /craigmcn/i })).toBeInTheDocument()
  })

  it('renders the mobile menu toggle button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument()
  })
})

// ─── Navigation links ─────────────────────────────────────────────────────────

describe('Layout — navigation links', () => {
  it('renders a Contrast link', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /contrast/i })).toBeInTheDocument()
  })

  it('renders an Opacity link', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /opacity/i })).toBeInTheDocument()
  })

  it('renders a Palette link', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /palette/i })).toBeInTheDocument()
  })

  it('renders a Blender link', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /blender/i })).toBeInTheDocument()
  })

  it('Contrast link points to /', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /^contrast$/i })).toHaveAttribute('href', '/')
  })

  it('Opacity link points to /opacity', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /^opacity$/i })).toHaveAttribute('href', '/opacity')
  })

  it('Palette link points to /palette', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /^palette$/i })).toHaveAttribute('href', '/palette')
  })

  it('Blender link points to /blender', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /^blender$/i })).toHaveAttribute('href', '/blender')
  })
})

// ─── Noscript warning ─────────────────────────────────────────────────────────

describe('Layout — noscript', () => {
  it('includes a noscript element', () => {
    renderLayout()
    expect(document.querySelector('noscript')).toBeInTheDocument()
  })
})
