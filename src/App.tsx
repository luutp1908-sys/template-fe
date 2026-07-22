import { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { computeFitZoom, useEditor } from './shared/hooks/useEditor'
import { DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT } from './shared/constants/editorGeometry'
import useTemplate from './shared/hooks/useTemplate'
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  WORKSPACE_PADDING,
} from './shared/constants/editorGeometry'
import { HEADER_HEIGHT } from './shared/constants/layout'
import { MenuBar } from './widgets/MenuBar'
import AuthModal from './widgets/AuthModal'
import useAuth from './shared/hooks/useAuth'
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

const defaultLocalTemplate = {
  id: 'tmpl_001',
  title: 'Starter Template',
  thumbnail: '/assets/thumbs/tmpl_001.png',
  metadata: {},
  pages: [
    {
      id: 'page_1',
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      background: { color: '#ffffff' },
      layers: [],
    },
  ],
}

function App() {
  const { template, loading, error } = useTemplate('tmpl_001')
  if (error) console.error('Template load error:', error)

  const auth = useAuth()
  const { user } = auth
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const editor = useEditor(template || defaultLocalTemplate)
  const [sidebarPanel, setSidebarPanel] = useState<'none' | 'image' | 'background'>('none')
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
    setSidebarPanel('none')
  }

  const handleAddImageFromStock = (src: string) => {
    editor.addObject('image', {
      imageConfig: {
        size: { width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT },
        width: DEFAULT_IMAGE_WIDTH,
        height: DEFAULT_IMAGE_HEIGHT,
        translate: [0, 0],
        rotate: 0,
        url: src,
        tagNames: [],
        colorConfig: {},
        cropImage: { width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT, translate: [0, 0] },
        scaleX: 1,
        scaleY: 1,
        replaced: false,
        isPro: false,
        isLoading: false,
        isLocked: false,
      },
    })
    setSidebarPanel('none')
  }

  const handleSetBackgroundColor = (color: string) => {
    editor.setPageBackground({ color })
  }

  const handleSetBackgroundImage = (src: string) => {
    editor.setPageBackground({ image: { src, fit: 'cover' } })
  }

  const handleToolSelect = (tool: 'element' | 'text' | 'image' | 'frame') => {
    editor.setActiveTool(tool)
    if (tool === 'image') {
      return
    }
    setSidebarPanel('none')
  }

  const handleOpenImageStock = () => {
    editor.setActiveTool('image')
    setSidebarPanel('image')
  }

  const handleOpenBackgroundPanel = () => {
    setSidebarPanel('background')
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
          isBackgroundPanelOpen={sidebarPanel === 'background'}
          onToolSelect={handleToolSelect}
          onAddShape={handleAddShape}
          onAddText={handleAddText}
          onOpenImageStock={handleOpenImageStock}
          onOpenBackgroundPanel={handleOpenBackgroundPanel}
          onOpenAuth={() => setAuthModalOpen(true)}
          user={user}
          onLogout={() => auth.logout()}
        />

        <AuthModal
          visible={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSignIn={auth.signIn}
          onSignUp={auth.signUp}
          loading={auth.loading}
          error={auth.error}
        />

        <Sidebar
          selectedObject={editor.selectedObject}
          objects={editor.objects}
          onSelectObject={editor.setSelectedId}
          onDeleteObject={editor.deleteObject}
          panel={sidebarPanel}
          backgroundColor={editor.currentPageBackground?.color || '#ffffff'}
          onChangeBackgroundColor={handleSetBackgroundColor}
          onSelectStockImage={handleAddImageFromStock}
          onSelectBackgroundImage={handleSetBackgroundImage}
        />

        <Canvas
          objects={editor.objects}
          selectedId={editor.selectedId}
          onSelectObject={editor.setSelectedId}
          onUpdateObject={editor.updateObject}
          onDuplicateObject={editor.duplicateObject}
          onDeleteObject={editor.deleteObject}
          onToggleObjectLock={editor.toggleObjectLock}
          pageBackgroundColor={editor.currentPageBackground?.color || '#ffffff'}
          pageBackgroundImage={editor.currentPageBackground?.image?.src}
          pageWidth={editor.pages?.[editor.currentPageIndex]?.width}
          pageHeight={editor.pages?.[editor.currentPageIndex]?.height}
          zoom={editor.zoom}
          viewportRef={canvasViewportRef}
        />
      </AppContainer>
    </AppShell>
  )
}

export default App
