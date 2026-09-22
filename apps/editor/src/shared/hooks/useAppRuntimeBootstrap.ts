import { useEffect, useRef, useState } from 'react'
import { PAGE_HEIGHT, PAGE_WIDTH, WORKSPACE_PADDING } from '../constants/editorGeometry'
import { computeFitZoom } from './useEditor'
import {
  clearStoredActiveWorkspaceId,
  fetchActiveWorkspaceIdFromBridge,
  getStoredActiveWorkspaceId,
  storeActiveWorkspaceId,
} from '../workspaces/activeWorkspaceBridge'

type UseAppRuntimeBootstrapInput = {
  activeWorkspaceId: string | null
  setZoom: (nextZoom: number) => void
}

const centerCanvasViewport = (viewportEl: HTMLDivElement) => {
  const left = Math.max(0, (viewportEl.scrollWidth - viewportEl.clientWidth) / 2)
  const top = Math.max(0, (viewportEl.scrollHeight - viewportEl.clientHeight) / 2)
  viewportEl.scrollTo({ left, top, behavior: 'auto' })
}

export const useAppRuntimeBootstrap = ({
  activeWorkspaceId,
  setZoom,
}: UseAppRuntimeBootstrapInput) => {
  const [bridgeWorkspaceId, setBridgeWorkspaceId] = useState<string | null>(() => getStoredActiveWorkspaceId())
  const [bridgeWorkspaceResolved, setBridgeWorkspaceResolved] = useState(false)
  const canvasViewportRef = useRef<HTMLDivElement | null>(null)
  const hasAutoFitApplied = useRef(false)

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

      setZoom(fitZoom)
      hasAutoFitApplied.current = true

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          centerCanvasViewport(viewportEl)
        })
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [setZoom])

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

  useEffect(() => {
    if (!activeWorkspaceId) return
    storeActiveWorkspaceId(activeWorkspaceId)
  }, [activeWorkspaceId])

  return {
    bridgeWorkspaceId,
    bridgeWorkspaceResolved,
    canvasViewportRef,
  }
}

export default useAppRuntimeBootstrap