import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('react-moveable', () => ({
  default: () => null,
}))

describe('App integration', () => {
  it('renders initial layers in sidebar', () => {
    render(<App />)

    expect(screen.getByText('Shape 1')).toBeInTheDocument()
    expect(screen.getByText('Text 2')).toBeInTheDocument()
  })

  it('does not render a properties panel', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Your design'))
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

  it('opens stock list in sidebar from add image menu action', () => {
    render(<App />)

    fireEvent.click(screen.getByTitle('Add Image'))

    expect(screen.getByLabelText('Left Stock Panel')).toBeInTheDocument()
  })

  it('adds image layer from left stock list', () => {
    render(<App />)

    fireEvent.click(screen.getByTitle('Add Image'))
    fireEvent.click(screen.getByLabelText('Stock Mountain Lake'))

    expect(screen.getByText('Image 3')).toBeInTheDocument()
  })

  it('selects stock image from left menu stock list', () => {
    render(<App />)

    fireEvent.click(screen.getByTitle('Add Image'))
    fireEvent.click(screen.getByLabelText('Stock Mountain Lake'))

    const renderedImage = document.querySelector('img[data-testid^="canvas-image-"]') as HTMLImageElement
    expect(renderedImage).toBeTruthy()
    expect(renderedImage).toHaveAttribute('src')
    expect(renderedImage.getAttribute('src')).toContain('picsum.photos')
  })

  it('closes stock list when switching to a non-image tool', () => {
    render(<App />)

    fireEvent.click(screen.getByTitle('Add Image'))
    expect(screen.getByLabelText('Left Stock Panel')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Text'))
    expect(screen.queryByLabelText('Left Stock Panel')).not.toBeInTheDocument()
  })

  it('shows inline toolbar for selected object and hides on backdrop click', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Your design'))
    expect(screen.getByLabelText('Inline Toolbar')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('canvas-area'))
    expect(screen.queryByLabelText('Inline Toolbar')).not.toBeInTheDocument()
  })

  it('duplicates selected object from inline toolbar', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Your design'))
    fireEvent.click(screen.getByLabelText('Duplicate Selected'))

    expect(screen.getByText('Text 3')).toBeInTheDocument()
  })

  it('toggles lock and unlock labels from inline toolbar', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Your design'))
    const lockButton = screen.getByLabelText('Lock Selected')
    fireEvent.click(lockButton)

    expect(screen.getByLabelText('Unlock Selected')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Unlock Selected'))
    expect(screen.getByLabelText('Lock Selected')).toBeInTheDocument()
  })

  it('deletes selected object from inline toolbar', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Your design'))
    fireEvent.click(screen.getByLabelText('Delete Selected'))

    expect(screen.queryByText('Your design')).not.toBeInTheDocument()
  })
})
