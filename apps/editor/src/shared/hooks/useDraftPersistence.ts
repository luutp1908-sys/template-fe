import { useCallback, useEffect, useState } from 'react'
import { patchJson, postJson, putJson } from '../api/client'
import type { PersistedEditorContent } from './editorPersistence'

type TemplateSummary = {
  title?: string
  name?: string
} | null

type DraftSummary = {
  id?: string | null
} | null

type UseDraftPersistenceInput = {
  bridgeWorkspaceResolved: boolean
  draft: DraftSummary
  draftIdFromPath: string | null
  persistedContent: PersistedEditorContent
  isAdminEditMode: boolean
  requestLoginPrompt: () => void
  resolvedActiveWorkspaceId: string | null
  template: TemplateSummary
  templateIdFromQuery: string | null
  user: unknown
}

export const useDraftPersistence = ({
  bridgeWorkspaceResolved,
  draft,
  draftIdFromPath,
  persistedContent,
  isAdminEditMode,
  requestLoginPrompt,
  resolvedActiveWorkspaceId,
  template,
  templateIdFromQuery,
  user,
}: UseDraftPersistenceInput) => {
  const [isSaving, setIsSaving] = useState(false)
  const [localDraftId, setLocalDraftId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (draft?.id) setLocalDraftId(draft.id)
  }, [draft])

  const shouldSaveCanonical = !draftIdFromPath && isAdminEditMode && !!templateIdFromQuery

  const handleSave = useCallback(async () => {
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
          content: persistedContent,
        })
        console.info('Canonical template content saved')
        return
      }

      const payload = {
        name: template?.title || template?.name || `Draft ${new Date().toISOString()}`,
        content: persistedContent,
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
    bridgeWorkspaceResolved,
    draftIdFromPath,
    persistedContent,
    isAdminEditMode,
    localDraftId,
    requestLoginPrompt,
    resolvedActiveWorkspaceId,
    shouldSaveCanonical,
    template,
    templateIdFromQuery,
    user,
  ])

  return {
    handleSave,
    isSaving,
    saveError,
    shouldSaveCanonical,
  }
}

export default useDraftPersistence