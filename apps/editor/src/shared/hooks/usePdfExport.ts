import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchBlob, fetchJson, postJson } from '../api/client'
import type { PersistedEditorContent } from './editorPersistence'

type TemplateSummary = {
  title?: string
  name?: string
} | null

type DraftSummary = {
  id?: string | null
} | null

type UsePdfExportInput = {
  draft: DraftSummary
  persistedContent: PersistedEditorContent
  requestLoginPrompt: () => void
  resolvedActiveWorkspaceId: string | null
  template: TemplateSummary
  templateIdFromQuery: string | null
  user: unknown
}

export const usePdfExport = ({
  draft,
  persistedContent,
  requestLoginPrompt,
  resolvedActiveWorkspaceId,
  template,
  templateIdFromQuery,
  user,
}: UsePdfExportInput) => {
  const [exportError, setExportError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const exportPollRef = useRef<number | null>(null)

  const stopExportPolling = useCallback(() => {
    if (exportPollRef.current !== null) {
      window.clearInterval(exportPollRef.current)
      exportPollRef.current = null
    }
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    if (!user) {
      requestLoginPrompt()
      return
    }

    const payload = {
      format: 'pdf',
      content: persistedContent,
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
    draft,
    persistedContent,
    requestLoginPrompt,
    resolvedActiveWorkspaceId,
    stopExportPolling,
    template,
    templateIdFromQuery,
    user,
  ])

  useEffect(() => {
    return () => {
      stopExportPolling()
    }
  }, [stopExportPolling])

  return {
    exportError,
    handleDownloadPdf,
    isExporting,
  }
}

export default usePdfExport