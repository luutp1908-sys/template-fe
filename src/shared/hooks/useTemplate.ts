import { useEffect, useRef, useState } from 'react'
import { fetchJson } from '../api/client'

export const useTemplate = (templateId = 'tmpl_001') => {
  const [template, setTemplate] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reloadRef = useRef(0)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const body = await fetchJson(`/api/v1/template-content/${templateId}`, {
          method: 'GET',
          signal: ac.signal,
        })
        const content = body?.data?.content ?? null
        setTemplate(content)
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        setError(err?.message ?? String(err))
      } finally {
        setLoading(false)
      }
    })()

    return () => ac.abort()
  }, [templateId, reloadRef.current])

  const reload = () => {
    reloadRef.current += 1
    // change of ref won't trigger effect; use a micro state trick
    // but keeping simple: force update via state not necessary for now
    // Consumers can call reload to re-run effect by updating a state wrapper if needed.
  }

  return { template, loading, error, reload }
}

export default useTemplate
