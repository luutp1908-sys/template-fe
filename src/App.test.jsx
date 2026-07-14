import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('react-moveable', () => ({
  default: () => null,
}))

describe('App integration', () => {
  it('syncs sidebar properties when selecting object from canvas', () => {
    render(<App />)

    expect(screen.getByText('rect')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Your design'))

    expect(screen.getByText('text')).toBeInTheDocument()
    expect(screen.getByText('X: 450px')).toBeInTheDocument()
    expect(screen.getByText('Y: 200px')).toBeInTheDocument()
  })

  it('deselects object when clicking the canvas backdrop', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Your design'))
    expect(screen.getByText('Properties')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('canvas-area'))

    expect(screen.queryByText('Properties')).not.toBeInTheDocument()
  })

  it('wires add and delete actions across menu and sidebar', () => {
    render(<App />)

    expect(screen.getAllByTitle('Delete')).toHaveLength(2)

    fireEvent.click(screen.getByTitle('Add Text'))

    expect(screen.getByText('Text 3')).toBeInTheDocument()
    expect(screen.getAllByTitle('Delete')).toHaveLength(3)

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[2])

    expect(screen.queryByText('Text 3')).not.toBeInTheDocument()
    expect(screen.getAllByTitle('Delete')).toHaveLength(2)
  })
})
