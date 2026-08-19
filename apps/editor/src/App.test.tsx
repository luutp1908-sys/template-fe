import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { postJson, fetchJson, setAuthHeaderGetter, fetchBlob } from './shared/api/client'

afterEach(() => {
  cleanup()
})

vi.mock('react-moveable', () => ({
  default: () => null,
}))

vi.mock('./shared/hooks/useAuth', () => ({
  default: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    loading: false,
    error: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    me: vi.fn(),
    signInState: {},
    signUpState: {},
  }),
}))

vi.mock('./shared/api/client', async () => {
  const actual = await vi.importActual<typeof import('./shared/api/client')>('./shared/api/client')
  return {
    ...actual,
    postJson: vi.fn(),
    fetchJson: vi.fn(),
  }
})

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App integration', () => {
  it('renders initial layers in sidebar', () => {
    renderApp()

    expect(screen.getByText('Shape 1')).toBeInTheDocument()
    expect(screen.getByText('Text 2')).toBeInTheDocument()
  })

  it('does not render a properties panel', () => {
    renderApp()

    fireEvent.click(screen.getByText('Your design'))
    fireEvent.click(screen.getByTestId('canvas-area'))

    expect(screen.queryByText('Properties')).not.toBeInTheDocument()
  })

  it('wires add and delete actions across menu and sidebar', () => {
    renderApp()

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
    renderApp()

    const textNode = screen.getByText('Your design')
    fireEvent.doubleClick(textNode)

    const editor = screen.getByLabelText('Text Editor')
    fireEvent.change(editor, { target: { value: 'Edited title' } })
    fireEvent.blur(editor)

    expect(screen.getByText('Edited title')).toBeInTheDocument()
  })

  it('cancels text edit on Escape and restores previous value', () => {
    renderApp()

    const textNode = screen.getByText('Your design')
    fireEvent.doubleClick(textNode)

    const editor = screen.getByLabelText('Text Editor')
    fireEvent.change(editor, { target: { value: 'Temp value' } })
    fireEvent.keyDown(editor, { key: 'Escape' })

    expect(screen.getByText('Your design')).toBeInTheDocument()
    expect(screen.queryByText('Temp value')).not.toBeInTheDocument()
  })

  it('auto-grows text box height while typing long wrapped content', () => {
    renderApp()

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
    renderApp()

    fireEvent.click(screen.getByTitle('Add Image'))

    expect(screen.getByLabelText('Left Stock Panel')).toBeInTheDocument()
  })

  it('adds image layer from left stock list', () => {
    renderApp()

    fireEvent.click(screen.getByTitle('Add Image'))
    fireEvent.click(screen.getByLabelText('Stock Mountain Lake'))

    expect(screen.getByText('Image 3')).toBeInTheDocument()
  })

  it('selects stock image from left menu stock list', () => {
    renderApp()

    fireEvent.click(screen.getByTitle('Add Image'))
    fireEvent.click(screen.getByLabelText('Stock Mountain Lake'))

    const renderedImage = document.querySelector('img[data-testid^="canvas-image-"]') as HTMLImageElement
    expect(renderedImage).toBeTruthy()
    expect(renderedImage).toHaveAttribute('src')
    expect(renderedImage.getAttribute('src')).toContain('picsum.photos')
  })

  it('closes stock list when switching to a non-image tool', () => {
    renderApp()

    fireEvent.click(screen.getByTitle('Add Image'))
    expect(screen.getByLabelText('Left Stock Panel')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Text'))
    expect(screen.queryByLabelText('Left Stock Panel')).not.toBeInTheDocument()
  })

  it('opens background sidebar from menu bar', () => {
    renderApp()

    fireEvent.click(screen.getByTitle('Background'))

    expect(screen.getByLabelText('Background Sidebar')).toBeInTheDocument()
    expect(screen.getByLabelText('Background Sidebar Color')).toBeInTheDocument()
    expect(screen.getByLabelText('Background Stock Panel')).toBeInTheDocument()
  })

  it('shows inline toolbar for selected object and hides on backdrop click', () => {
    renderApp()

    fireEvent.click(screen.getByText('Your design'))
    expect(screen.getByLabelText('Inline Toolbar')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('canvas-area'))
    expect(screen.queryByLabelText('Inline Toolbar')).not.toBeInTheDocument()
  })

  it('duplicates selected object from inline toolbar', () => {
    renderApp()

    fireEvent.click(screen.getByText('Your design'))
    fireEvent.click(screen.getByLabelText('Duplicate Selected'))

    expect(screen.getByText('Text 3')).toBeInTheDocument()
  })

  it('toggles lock and unlock labels from inline toolbar', () => {
    renderApp()

    fireEvent.click(screen.getByText('Your design'))
    const lockButton = screen.getByLabelText('Lock Selected')
    fireEvent.click(lockButton)

    expect(screen.getByLabelText('Unlock Selected')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Unlock Selected'))
    expect(screen.getByLabelText('Lock Selected')).toBeInTheDocument()
  })

  it('deletes selected object from inline toolbar', () => {
    renderApp()

    fireEvent.click(screen.getByText('Your design'))
    fireEvent.click(screen.getByLabelText('Delete Selected'))

    expect(screen.queryByText('Your design')).not.toBeInTheDocument()
  })

  it('updates page background color from background sidebar picker', () => {
    renderApp()

    fireEvent.click(screen.getByTitle('Background'))
    fireEvent.change(screen.getByLabelText('Background Sidebar Color'), { target: { value: '#ff0000' } })

    expect(screen.getByTestId('page-surface')).toHaveStyle({
      backgroundColor: '#ff0000',
    })
  })

  it('sets page background image from background sidebar stock list', () => {
    renderApp()

    fireEvent.click(screen.getByTitle('Background'))
    fireEvent.click(screen.getByLabelText('Stock Mountain Lake'))

    const backgroundImage = getComputedStyle(screen.getByTestId('page-surface')).backgroundImage
    expect(backgroundImage).toContain('picsum.photos')
  })

  it('creates an export job and starts polling when download pdf is clicked', async () => {
    vi.mocked(postJson).mockResolvedValue({ id: 'exp_123' })
    vi.mocked(fetchJson)
      .mockResolvedValueOnce({ id: 'exp_123', status: 'pending' })
      .mockResolvedValueOnce({ id: 'exp_123', status: 'completed', fileName: 'template.pdf' })

    renderApp()

    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))

    await waitFor(() => {
      expect(postJson).toHaveBeenCalledWith('/api/v1/export/jobs', expect.objectContaining({
        format: 'pdf',
        content: expect.objectContaining({ pages: expect.any(Array) }),
      }))
    })

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledWith('/api/v1/export/jobs/exp_123')
    })
  })

  it('fetches protected export downloads with credentials and auth headers', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/pdf' }),
      blob: vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
      text: vi.fn().mockResolvedValue('pdf'),
    } as Response)

    setAuthHeaderGetter(() => 'mock-token')

    const blob = await fetchBlob('/api/v1/export/jobs/exp_123/download')

    expect(blob).toBeInstanceOf(Blob)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/export/jobs/exp_123/download'),
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ Authorization: 'Bearer mock-token' }),
      }),
    )

    fetchSpy.mockRestore()
  })
})
