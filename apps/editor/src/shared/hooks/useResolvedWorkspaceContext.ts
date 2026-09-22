import { useEffect, useState } from 'react'
import {
  clearStoredActiveWorkspaceId,
  fetchActiveWorkspaceIdFromBridge,
  getStoredActiveWorkspaceId,
  storeActiveWorkspaceId,
} from '../workspaces/activeWorkspaceBridge'

type UseResolvedWorkspaceContextInput = {
  draftWorkspaceId?: string | null
  workspaceIdFromQuery?: string | null
}

export const useResolvedWorkspaceContext = ({
  draftWorkspaceId = null,
  workspaceIdFromQuery = null,
}: UseResolvedWorkspaceContextInput) => {
  const [bridgeWorkspaceId, setBridgeWorkspaceId] = useState<string | null>(() => getStoredActiveWorkspaceId())
  const [bridgeWorkspaceResolved, setBridgeWorkspaceResolved] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const workspaceId = await fetchActiveWorkspaceIdFromBridge()
        if (cancelled) return

        if (workspaceId) {
          setBridgeWorkspaceId(workspaceId)
          return
        }

        setBridgeWorkspaceId((prev) => {
          if (!prev) return null
          clearStoredActiveWorkspaceId()
          return null
        })
      } catch {
        // Keep local fallback path when homepage bridge is unavailable.
      } finally {
        if (!cancelled) {
          setBridgeWorkspaceResolved(true)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const activeWorkspaceId = draftWorkspaceId || workspaceIdFromQuery || null
  const resolvedActiveWorkspaceId = bridgeWorkspaceId || activeWorkspaceId

  useEffect(() => {
    if (!resolvedActiveWorkspaceId) return
    storeActiveWorkspaceId(resolvedActiveWorkspaceId)
  }, [resolvedActiveWorkspaceId])

  return {
    activeWorkspaceId,
    bridgeWorkspaceResolved,
    bridgeWorkspaceId,
    resolvedActiveWorkspaceId,
  }
}

export default useResolvedWorkspaceContext