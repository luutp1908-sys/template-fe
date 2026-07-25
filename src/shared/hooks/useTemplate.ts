import { useQueryClient, useQuery } from '@tanstack/react-query'
import { fetchJson } from '../api/client'
import { getAccessToken } from '../auth/tokenStore'

// If draftId is provided, this hook will fetch the draft-backed endpoint
// and return both the selected `template` content and the `draft` object.
export const useTemplate = (templateId = 'tmpl_001', draftId?: string | null) => {
  const queryClient = useQueryClient()

  // Draft-backed content — private, requires auth.
  // enabled: !!draftId && !!getAccessToken() prevents the 401 race.
  const draftQuery = useQuery({
    queryKey: ['draft-content', draftId],
    queryFn: async () => {
      const body = await fetchJson(`/api/v1/user-draft/${draftId}/template-content`)
      const tpl = body?.data?.templateContent ?? null
      const dr = body?.data ?? null
      return { template: (dr?.content ?? tpl?.content) ?? null, draft: dr }
    },
    enabled: !!draftId && !!getAccessToken(),
    staleTime: 30 * 1000,
    retry: false,
  })

  // Canonical (public) template content — no auth required.
  const templateQuery = useQuery({
    queryKey: ['template-content', templateId],
    queryFn: async () => {
      const body = await fetchJson(`/api/v1/template-content/${templateId}`)
      return body?.data?.content ?? null
    },
    enabled: !draftId,
    staleTime: 5 * 60 * 1000,
  })

  const reload = () => {
    if (draftId) {
      queryClient.invalidateQueries({ queryKey: ['draft-content', draftId] })
    } else {
      queryClient.invalidateQueries({ queryKey: ['template-content', templateId] })
    }
  }

  if (draftId) {
    return {
      template: draftQuery.data?.template ?? null,
      draft: draftQuery.data?.draft ?? null,
      loading: draftQuery.isLoading,
      error: draftQuery.error ? String((draftQuery.error as any)?.message ?? draftQuery.error) : null,
      reload,
    }
  }

  return {
    template: templateQuery.data ?? null,
    draft: null,
    loading: templateQuery.isLoading,
    error: templateQuery.error ? String((templateQuery.error as any)?.message ?? templateQuery.error) : null,
    reload,
  }
}

export default useTemplate
