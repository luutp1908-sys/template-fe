import { useCallback, useMemo } from 'react'
import { useEditorHostBridge } from '../../embedded/EditorHostBridge'

export type EditorRuntimeMode = 'standalone' | 'embedded'

type UseEditorRuntimeContextInput = {
  onRequestStandaloneLogin: () => void
}

export const useEditorRuntimeContext = ({
  onRequestStandaloneLogin,
}: UseEditorRuntimeContextInput) => {
  const bridge = useEditorHostBridge()
  const runtimeMode: EditorRuntimeMode = bridge?.isEmbedded ? 'embedded' : 'standalone'

  const modeConfig = useMemo(
    () => ({
      showHeader: runtimeMode === 'standalone',
      showAuthModal: runtimeMode === 'standalone',
    }),
    [runtimeMode],
  )

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const templateIdFromQuery = useMemo(() => searchParams.get('templateId'), [searchParams])
  const workspaceIdFromQuery = useMemo(() => searchParams.get('workspaceId'), [searchParams])
  const adminEditParam = useMemo(() => (searchParams.get('adminEdit') || '').toLowerCase(), [searchParams])
  const isAdminEditMode = adminEditParam === '1' || adminEditParam === 'true'

  const draftIdFromPath = useMemo(() => {
    try {
      const match = window.location.pathname.match(/^\/draft\/([^/]+)$/)
      return match ? decodeURIComponent(match[1]) : null
    } catch {
      return null
    }
  }, [])

  const canonicalTemplateId = draftIdFromPath ? null : (templateIdFromQuery || null)

  const requestLoginPrompt = useCallback(() => {
    if (runtimeMode === 'embedded') {
      bridge?.callbacks?.onRequestLogin?.()
      return
    }

    onRequestStandaloneLogin()
  }, [bridge, onRequestStandaloneLogin, runtimeMode])

  return {
    canonicalTemplateId,
    draftIdFromPath,
    isAdminEditMode,
    modeConfig,
    requestLoginPrompt,
    runtimeMode,
    templateIdFromQuery,
    workspaceIdFromQuery,
  }
}

export default useEditorRuntimeContext