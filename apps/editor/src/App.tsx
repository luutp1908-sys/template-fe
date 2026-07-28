import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { computeFitZoom, useEditor } from './shared/hooks/useEditor'
import { DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT, DEFAULT_TEXT_WIDTH, DEFAULT_TEXT_HEIGHT, DEFAULT_TEXT_COLOR, DEFAULT_TEXT_FONT_SIZE } from './shared/constants/editorGeometry'
import useTemplate from './shared/hooks/useTemplate'
import { postJson, patchJson, putJson } from './shared/api/client'
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  WORKSPACE_PADDING,
} from './shared/constants/editorGeometry'
import { HEADER_HEIGHT } from './shared/constants/layout'
import { MenuBar } from './widgets/MenuBar'
import FRAME_PRESETS from './data/framePresets'
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

const SaveButton = styled.button`
  padding: 8px 12px;
  background: #0066cc;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
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
  blocks: [
    {
      uuid: 'page_1',
      config: {
        width: `${PAGE_WIDTH}px`,
        height: `${PAGE_HEIGHT}px`,
        backgroundImg: '',
      },
      layers: [],
    },
  ],
}

function App() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const templateIdFromQuery = useMemo(() => searchParams.get('templateId'), [searchParams])
  const adminEditParam = useMemo(() => (searchParams.get('adminEdit') || '').toLowerCase(), [searchParams])
  const isAdminEditMode = adminEditParam === '1' || adminEditParam === 'true'

  const draftIdFromPath = useMemo(() => {
    try {
      const m = window.location.pathname.match(/^\/draft\/([^/]+)$/)
      return m ? decodeURIComponent(m[1]) : null
    } catch (e) {
      return null
    }
  }, [])

  const auth = useAuth()
  const { user } = auth

  const canonicalTemplateId = draftIdFromPath ? null : (templateIdFromQuery || null)
  const { template, draft, loading, error } = useTemplate(canonicalTemplateId, draftIdFromPath ?? undefined)
  if (error) console.error('Template load error:', error)

  const [authModalOpen, setAuthModalOpen] = useState(false)

  const editor = useEditor(template || defaultLocalTemplate)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('untitled')
  const [localDraftId, setLocalDraftId] = useState<string | null>(null)
  const [sidebarPanel, setSidebarPanel] = useState<'none' | 'image' | 'background' | 'layers' | 'frames'>('none')
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

  useEffect(() => {
    if (draft?.id) setLocalDraftId(draft.id)
  }, [draft])

  const handleAddShape = () => {
    editor.addObject('rect', {
      color: '#0066cc',
    })
  }

  const handleAddText = () => {
    editor.addObject('text', {
      text: 'New text',
      textColor: DEFAULT_TEXT_COLOR,
      textConfig: {
        value: 'New text',
        type: 'text-box',
        width: `${DEFAULT_TEXT_WIDTH}px`,
        height: `${DEFAULT_TEXT_HEIGHT}px`,
        translate: [0, 0],
        rotate: 0,
        fontFamily: 'Arial, sans-serif',
        fontSize: `${DEFAULT_TEXT_FONT_SIZE}px`,
        fontColor: DEFAULT_TEXT_COLOR,
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: '0px',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isCapital: false,
        presentationType: 'body',
        colorPaletteType: null,
        externalFontUrl: null,
        isLogoQrCode: false,
      },
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
      setSidebarPanel('image')
      return
    }
    if (tool === 'frame') {
      setSidebarPanel('frames')
      return
    }
    setSidebarPanel('none')
  }

  const handleAddFrame = (presetId: string) => {
    const preset = FRAME_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    if (typeof editor.addFrameLayer === 'function') {
      editor.addFrameLayer({ width: preset.width, height: preset.height, shape: preset.shape })
    } else {
      editor.addObject('frame', {
        width: preset.width,
        height: preset.height,
        // store preset shape for later mask rendering
        // @ts-ignore - relaxed property for now
        shape: preset.shape,
      } as any)
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

  const handleSave = useCallback(async () => {
    const shouldSaveCanonical = !draftIdFromPath && isAdminEditMode && !!templateIdFromQuery

    if (!user && !shouldSaveCanonical) {
      setAuthModalOpen(true)
      return
    }

    const resolvedTemplateId = shouldSaveCanonical
      ? templateIdFromQuery
      : (template?.id ?? template?.templateId ?? defaultLocalTemplate.id)

    if (!resolvedTemplateId) {
      console.warn('No template loaded to save')
      return
    }

    setIsSaving(true)
    try {
      if (shouldSaveCanonical) {
        await putJson(`/api/v1/template-content/${resolvedTemplateId}`, {
          content: { pages: editor.pages },
        })
        console.info('Canonical template content saved')
        return
      }

      // ensure templateId is a UUID to satisfy backend DTO validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      let templateIdToSend = String(resolvedTemplateId)
      if (!uuidRegex.test(templateIdToSend)) {
        // use browser crypto.randomUUID when available
        try {
          // @ts-ignore - crypto.randomUUID exists in modern browsers
          templateIdToSend = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
            ? (crypto as any).randomUUID()
            : templateIdToSend
        } catch (e) {
          // fallback: leave as-is (server mock may still accept), but prefer a generated UUID
        }
      }

      const payload = {
        templateId: templateIdToSend,
        name: template?.title || template?.name || `Draft ${new Date().toISOString()}`,
        content: { pages: editor.pages },
      }
      if (localDraftId) {
        const res = await patchJson(`/api/v1/user-draft/${localDraftId}`, payload)
        console.info('Draft updated')
        return
      }

      const res = await postJson('/api/v1/user-draft', payload)
      const id = res?.data?.id ?? null
      if (id) {
        window.history.replaceState({}, '', `/draft/${encodeURIComponent(id)}`)
        setLocalDraftId(id)
      }
      console.info('Draft saved')
    } catch (err) {
      console.error('Save draft failed', err)
      console.warn('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [user, draftIdFromPath, isAdminEditMode, templateIdFromQuery, template, editor.pages])

  const shouldSaveCanonical = !draftIdFromPath && isAdminEditMode && !!templateIdFromQuery

  return (
    <AppShell>
      <TopHeader>
        <HeaderContent>
          <h1>{shouldSaveCanonical ? 'Canva Editor · Admin Template Mode' : 'Canva Editor'}</h1>
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
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : shouldSaveCanonical ? 'Save Template Content' : 'Save Draft'}
          </SaveButton>
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
          onAddFrame={handleAddFrame}
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
          onAddFrame={handleAddFrame}
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
