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

  it('updates text style from sidebar controls', () => {
    render(<App />)

    const textNode = screen.getByText('Your design')
    fireEvent.click(textNode)

    fireEvent.change(screen.getByLabelText('Font Size'), { target: { value: '48' } })
    fireEvent.change(screen.getByLabelText('Font Weight'), { target: { value: 'bold' } })
    fireEvent.click(screen.getByLabelText('Align Right'))
    fireEvent.change(screen.getByLabelText('Text Color'), { target: { value: '#ff0000' } })

    expect(textNode).toHaveStyle({
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'right',
      color: 'rgb(255, 0, 0)',
    })
  })

  it('enters text edit mode on double click and saves on blur', () => {
    render(<App />)

    const textNode = screen.getByText('Your design')
    fireEvent.doubleClick(textNode)

    const editor = screen.getByLabelText('Text Editor')
    fireEvent.change(editor, { target: { value: 'Edited title' } })
    fireEvent.blur(editor)

    expect(screen.getByText('Edited title')).toBeInTheDocument()
  })

  it('cancels text edit on Escape and restores previous value', () => {
    render(<App />)

    const textNode = screen.getByText('Your design')
    fireEvent.doubleClick(textNode)

    const editor = screen.getByLabelText('Text Editor')
    fireEvent.change(editor, { target: { value: 'Temp value' } })
    fireEvent.keyDown(editor, { key: 'Escape' })

    expect(screen.getByText('Your design')).toBeInTheDocument()
    expect(screen.queryByText('Temp value')).not.toBeInTheDocument()
  })

  it('auto-grows text box height while typing long wrapped content', () => {
    render(<App />)

    const textObject = screen.getByTestId('canvas-object-2')
    const initialHeight = Number.parseFloat(textObject.style.height)

    fireEvent.doubleClick(screen.getByText('Your design'))
    const editor = screen.getByLabelText('Text Editor')

    Object.defineProperty(editor, 'scrollHeight', {
      configurable: true,
      get: () => 220,
    })

    fireEvent.change(editor, {
      target: {
        value: 'Long text that should wrap over multiple lines and force taller editor bounds.',
      },
    })

    fireEvent.blur(editor)

    const updatedHeight = Number.parseFloat(screen.getByTestId('canvas-object-2').style.height)
    expect(updatedHeight).toBeGreaterThan(initialHeight)
  })
})
