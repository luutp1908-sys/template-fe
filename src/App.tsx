import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { computeFitZoom, useEditor } from './shared/hooks/useEditor'
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  WORKSPACE_PADDING,
} from './shared/constants/editorGeometry'
import { HEADER_HEIGHT } from './shared/constants/layout'
import { MenuBar } from './widgets/MenuBar'
import { Sidebar } from './widgets/Sidebar'
import { Canvas } from './features/canvas/Canvas'
import type { EditorObject } from './shared/types/editor'

const AppShell = styled.div`
  height: 100vh;
  box-sizing: border-box;
  padding-top: ${HEADER_HEIGHT}px;
  background: #f5f8fc;
`

const TopHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: ${HEADER_HEIGHT}px;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;

  h1 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
  }
`

const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

const ZoomControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
`

const ZoomValue = styled.span`
  min-width: 52px;
  text-align: right;
  font-size: 0.85rem;
  color: #1a1a1a;
  font-weight: 600;
`

const ZoomSlider = styled.input`
  width: 160px;
  accent-color: #0066cc;
  cursor: pointer;
`

const AppContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background: #f5f8fc;
  overflow: hidden;
`

const initialObjects: EditorObject[] = [
  {
    id: 1,
    type: 'rect',
    x: 200,
    y: 150,
    width: 180,
    height: 120,
    rotate: 0,
    color: '#0066cc',
  },
  {
    id: 2,
    type: 'text',
    x: 450,
    y: 200,
    width: 220,
    height: 60,
    rotate: 0,
    text: 'Your design',
    textColor: '#1a1a1a',
  },
]

function App() {
  const editor = useEditor(initialObjects)
  const [isImageStockOpen, setIsImageStockOpen] = useState(false)
  const canvasViewportRef = useRef<HTMLDivElement | null>(null)
  const hasAutoFitApplied = useRef(false)

  const centerCanvasViewport = (viewportEl: HTMLDivElement) => {
    const left = Math.max(0, (viewportEl.scrollWidth - viewportEl.clientWidth) / 2)
    const top = Math.max(0, (viewportEl.scrollHeight - viewportEl.clientHeight) / 2)
    viewportEl.scrollTo({ left, top, behavior: 'auto' })
  }

  useEffect(() => {
    if (hasAutoFitApplied.current) return

    const frame = requestAnimationFrame(() => {
      const viewportEl = canvasViewportRef.current
      if (!viewportEl) return

      const rect = viewportEl.getBoundingClientRect()
      const fitZoom = computeFitZoom({
        viewportWidth: rect.width,
        viewportHeight: rect.height,
        pageWidth: PAGE_WIDTH,
        pageHeight: PAGE_HEIGHT,
        padding: WORKSPACE_PADDING,
      })
      if (!fitZoom) return
      editor.setZoom(fitZoom)
      hasAutoFitApplied.current = true

      // Wait for zoom-driven layout to flush, then center viewport scroll.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          centerCanvasViewport(viewportEl)
        })
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  const handleAddShape = () => {
    editor.addObject('rect', {
      color: '#0066cc',
    })
  }

  const handleAddText = () => {
    editor.addObject('text', {
      text: 'New text',
      textColor: '#1a1a1a',
    })
    setIsImageStockOpen(false)
  }

  const handleAddImageFromStock = (src: string) => {
    editor.addObject('image', {
      src,
    })
    setIsImageStockOpen(false)
  }

  const handleToolSelect = (tool: 'element' | 'text' | 'image' | 'frame') => {
    editor.setActiveTool(tool)
    if (tool !== 'image') {
      setIsImageStockOpen(false)
    }
  }

  const handleOpenImageStock = () => {
    editor.setActiveTool('image')
    setIsImageStockOpen(true)
  }

  return (
    <AppShell>
      <TopHeader>
        <HeaderContent>
          <h1>Canva Editor</h1>
          <ZoomControl>
            <ZoomSlider
              type="range"
              min="10"
              max="400"
              step="5"
              value={Math.round(editor.zoom * 100)}
              onChange={(e) => editor.setZoom(Number(e.target.value) / 100)}
              aria-label="Zoom"
            />
            <ZoomValue>{Math.round(editor.zoom * 100)}%</ZoomValue>
          </ZoomControl>
        </HeaderContent>
      </TopHeader>

      <AppContainer>
        <MenuBar
          activeTool={editor.activeTool}
          onToolSelect={handleToolSelect}
          onAddShape={handleAddShape}
          onAddText={handleAddText}
          onOpenImageStock={handleOpenImageStock}
        />

        <Sidebar
          selectedObject={editor.selectedObject}
          objects={editor.objects}
          onSelectObject={editor.setSelectedId}
          onDeleteObject={editor.deleteObject}
          showImageStockPanel={isImageStockOpen}
          onSelectStockImage={handleAddImageFromStock}
        />

        <Canvas
          objects={editor.objects}
          selectedId={editor.selectedId}
          onSelectObject={editor.setSelectedId}
          onUpdateObject={editor.updateObject}
          onDuplicateObject={editor.duplicateObject}
          onDeleteObject={editor.deleteObject}
          onToggleObjectLock={editor.toggleObjectLock}
          zoom={editor.zoom}
          viewportRef={canvasViewportRef}
        />
      </AppContainer>
    </AppShell>
  )
}

export default App
