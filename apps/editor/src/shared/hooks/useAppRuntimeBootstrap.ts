import { useEffect, useRef } from 'react'
import { PAGE_HEIGHT, PAGE_WIDTH, WORKSPACE_PADDING } from '../constants/editorGeometry'
import { computeFitZoom } from './useEditor'

type UseAppRuntimeBootstrapInput = {
  setZoom: (nextZoom: number) => void
}

const centerCanvasViewport = (viewportEl: HTMLDivElement) => {
  const left = Math.max(0, (viewportEl.scrollWidth - viewportEl.clientWidth) / 2)
  const top = Math.max(0, (viewportEl.scrollHeight - viewportEl.clientHeight) / 2)
  viewportEl.scrollTo({ left, top, behavior: 'auto' })
}

export const useAppRuntimeBootstrap = ({ setZoom }: UseAppRuntimeBootstrapInput) => {
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
  return {
    canvasViewportRef,
  }
}

export default useAppRuntimeBootstrap