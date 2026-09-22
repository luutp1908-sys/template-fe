import { useRef, useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useEditor } from './shared/hooks/useEditor'
import { DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT, DEFAULT_TEXT_WIDTH, DEFAULT_TEXT_HEIGHT, DEFAULT_TEXT_COLOR, DEFAULT_TEXT_FONT_SIZE } from './shared/constants/editorGeometry'
import useEditorRuntimeContext from './shared/hooks/useEditorRuntimeContext'
import useTemplate from './shared/hooks/useTemplate'
import { postJson, patchJson, putJson, fetchJson, fetchBlob } from './shared/api/client'
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from './shared/constants/editorGeometry'
import { HEADER_HEIGHT } from './shared/constants/layout'
import { MenuBar } from './widgets/MenuBar'
import FRAME_PRESETS from './data/framePresets'
import AuthModal from './widgets/LoginPopup'
import useAuth from './shared/hooks/useAuth'
import useAppRuntimeBootstrap from './shared/hooks/useAppRuntimeBootstrap'
import useResolvedWorkspaceContext from './shared/hooks/useResolvedWorkspaceContext'
import { Sidebar } from './widgets/Sidebar'
import { Canvas } from './features/canvas/Canvas'
import type { EditorObject } from './shared/types/editor'

const AppShell = styled.div<{ $withHeader: boolean }>`
  height: 100vh;
  box-sizing: border-box;
  padding-top: ${({ $withHeader }) => ($withHeader ? `${HEADER_HEIGHT}px` : '0px')};
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

const SecondaryButton = styled.button`
  padding: 8px 12px;
  background: #eef4ff;
  color: #1248a8;
  border: 1px solid #cfe0ff;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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
  const auth = useAuth()
  const { user } = auth
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const {
    canonicalTemplateId,
    draftIdFromPath,
    isAdminEditMode,
    modeConfig,
    requestLoginPrompt,
    runtimeMode,
    templateIdFromQuery,
    workspaceIdFromQuery,
  } = useEditorRuntimeContext({
    onRequestStandaloneLogin: () => setAuthModalOpen(true),
  })

  const { template, draft, error } = useTemplate(canonicalTemplateId, draftIdFromPath ?? undefined)
  if (error) console.error('Template load error: ', error)

  const [saveError, setSaveError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const editor = useEditor(template || defaultLocalTemplate)
  const [isSaving, setIsSaving] = useState(false)
  const exportPollRef = useRef<number | null>(null)
  const [localDraftId, setLocalDraftId] = useState<string | null>(null)
  const [sidebarPanel, setSidebarPanel] = useState<'none' | 'image' | 'background' | 'layers' | 'frames'>('none')
  const {
    activeWorkspaceId,
    bridgeWorkspaceResolved,
    resolvedActiveWorkspaceId,
  } = useResolvedWorkspaceContext({
    draftWorkspaceId: draft?.workspaceId,
    workspaceIdFromQuery,
  })
  const { canvasViewportRef } = useAppRuntimeBootstrap({ setZoom: editor.setZoom })

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

  const stopExportPolling = useCallback(() => {
    if (exportPollRef.current !== null) {
      window.clearInterval(exportPollRef.current)
      exportPollRef.current = null
    }
  }, [])

  const handleSave = useCallback(async () => {
    const shouldSaveCanonical = !draftIdFromPath && isAdminEditMode && !!templateIdFromQuery
    const isCreatingNewDraft = !localDraftId && !draftIdFromPath

    if (!user && !shouldSaveCanonical) {
      requestLoginPrompt()
      return
    }

    if (!shouldSaveCanonical && isCreatingNewDraft && !resolvedActiveWorkspaceId) {
      if (!bridgeWorkspaceResolved) {
        setSaveError('Resolving active workspace context. Please try saving again in a moment.')
        return
      }

      setSaveError('Please select a workspace before saving this template as a draft.')
      return
    }

    setSaveError(null)
    setIsSaving(true)
    try {
      if (shouldSaveCanonical) {
        const resolvedTemplateId = templateIdFromQuery
        if (!resolvedTemplateId) {
          console.warn('No template loaded to save')
          return
        }

        await putJson(`/api/v1/template-content/${resolvedTemplateId}`, {
          content: { pages: editor.pages },
        })
        console.info('Canonical template content saved')
        return
      }

      const payload = {
        name: template?.title || template?.name || `Draft ${new Date().toISOString()}`,
        content: { pages: editor.pages },
        ...(resolvedActiveWorkspaceId ? { workspaceId: resolvedActiveWorkspaceId } : {}),
      }
      if (localDraftId) {
        await patchJson(`/api/v1/user-draft/${localDraftId}`, payload)
        console.info('Draft updated')
        return
      }

      const res = await postJson('/api/v1/user-draft', payload)
      const id = res?.data?.id ?? null
      if (id) {
        const nextPath = `/draft/${encodeURIComponent(id)}`
        window.history.replaceState({}, '', nextPath)
        setLocalDraftId(id)
      }
      console.info('Draft saved')
    } catch (err) {
      console.error('Save draft failed', err)
      console.warn('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [
    requestLoginPrompt,
    user,
    draftIdFromPath,
    isAdminEditMode,
    templateIdFromQuery,
    template,
    editor.pages,
    resolvedActiveWorkspaceId,
    localDraftId,
    bridgeWorkspaceResolved,
  ])

  const handleDownloadPdf = useCallback(async () => {
    if (!user) {
      requestLoginPrompt()
      return
    }

    const payload = {
      format: 'pdf',
      content: { pages: editor.pages },
      ...(draft?.id ? { draftId: draft.id } : {}),
      ...(templateIdFromQuery ? { templateId: templateIdFromQuery } : {}),
      ...(resolvedActiveWorkspaceId ? { workspaceId: resolvedActiveWorkspaceId } : {}),
      templateName: template?.title || template?.name || 'template',
    }

    setExportError(null)
    setIsExporting(true)
    try {
      const created = await postJson('/api/v1/export/jobs', payload)
      const jobId = created?.id ?? created?.data?.id
      if (!jobId) {
        throw new Error('Export job was not created')
      }

      const pollJob = async () => {
        try {
          const statusRes = await fetchJson(`/api/v1/export/jobs/${jobId}`)
          const job = statusRes?.data ?? statusRes
          const nextStatus = job?.status

          if (nextStatus === 'completed') {
            stopExportPolling()
            setIsExporting(false)

            try {
              const blob = await fetchBlob(`/api/v1/export/jobs/${jobId}/download`)
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.setAttribute('download', job?.fileName || `${payload.templateName || 'template'}.pdf`)
              document.body.appendChild(link)
              link.click()
              link.remove()
              URL.revokeObjectURL(url)
              return
            } catch (downloadError) {
              console.error('Failed to download export PDF via fetch', downloadError)
              setExportError(downloadError instanceof Error ? downloadError.message : 'Unable to download PDF export')
            }
            return
          }

          if (nextStatus === 'failed') {
            stopExportPolling()
            setIsExporting(false)
            setExportError(job?.errorMessage || 'PDF export failed')
          }
        } catch (error) {
          stopExportPolling()
          setIsExporting(false)
          setExportError(error instanceof Error ? error.message : 'Unable to track export job status')
        }
      }

      await pollJob()
      exportPollRef.current = window.setInterval(() => {
        void pollJob()
      }, 1500)
    } catch (error) {
      setIsExporting(false)
      setExportError(error instanceof Error ? error.message : 'Unable to start PDF export')
    }
  }, [
    requestLoginPrompt,
    user,
    draft,
    template,
    templateIdFromQuery,
    resolvedActiveWorkspaceId,
    editor.pages,
    stopExportPolling,
  ])

  useEffect(() => {
    return () => {
      stopExportPolling()
    }
  }, [stopExportPolling])

  const shouldSaveCanonical = !draftIdFromPath && isAdminEditMode && !!templateIdFromQuery

  return (
    <AppShell data-editor-mode={runtimeMode} $withHeader={modeConfig.showHeader}>
      {modeConfig.showHeader ? (
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
          <ActionGroup>
            <SecondaryButton onClick={handleDownloadPdf} disabled={isSaving || isExporting}>
              {isExporting ? 'Exporting…' : 'Download PDF'}
            </SecondaryButton>
            <SaveButton onClick={handleSave} disabled={isSaving || isExporting}>
              {isSaving ? 'Saving…' : shouldSaveCanonical ? 'Save Template Content' : 'Save Draft'}
            </SaveButton>
          </ActionGroup>
        </HeaderContent>
        {saveError ? <p style={{ margin: '0 20px', color: '#b91c1c', fontSize: '0.85rem' }}>{saveError}</p> : null}
        {exportError ? <p style={{ margin: '0 20px', color: '#b91c1c', fontSize: '0.85rem' }}>{exportError}</p> : null}
      </TopHeader>
      ) : null}

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
          onOpenAuth={requestLoginPrompt}
          user={user}
          onLogout={() => auth.logout()}
        />

        {modeConfig.showAuthModal ? (
        <AuthModal
          visible={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSignIn={auth.signIn}
          onSignUp={auth.signUp}
          loading={auth.loading}
          error={auth.error}
        />
        ) : null}

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
          onDownloadTemplate={handleDownloadPdf}
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
