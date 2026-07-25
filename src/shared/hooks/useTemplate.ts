import { useEffect, useRef, useState } from 'react'
import { fetchJson } from '../api/client'

// If draftId is provided, this hook will fetch the draft-backed endpoint
// and return both the selected `template` content and the `draft` object.
export const useTemplate = (templateId = 'tmpl_001', draftId?: string | null) => {
  const [template, setTemplate] = useState<any | null>(null)
  const [draft, setDraft] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reloadRef = useRef(0)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        if (draftId) {
          // draft-backed loader (private)
          const body = await fetchJson(`/api/v1/user-draft/${draftId}/template-content`, {
            method: 'GET',
            signal: ac.signal,
          })
          const tpl = body?.data?.templateContent ?? null
          const dr = body?.data?.draft ?? null
          // prefer draft content when present (FE may later run a merge)
          const chosen = (dr?.content ?? tpl?.content) ?? null
          setTemplate(chosen)
          setDraft(dr)
        } else {
          const body = await fetchJson(`/api/v1/template-content/${templateId}`, {
            method: 'GET',
            signal: ac.signal,
          })
          const content = body?.data?.content ?? null
          setTemplate(content)
          setDraft(null)
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        setError(err?.message ?? String(err))
      } finally {
        setLoading(false)
      }
    })()

    return () => ac.abort()
  }, [templateId, draftId, reloadRef.current])

  const reload = () => {
    reloadRef.current += 1
  }

  return { template, draft, loading, error, reload }
}

export default useTemplate
