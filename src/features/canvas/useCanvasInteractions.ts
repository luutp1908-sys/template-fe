import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { EditorObject } from '../../shared/types/editor'

type CanvasInteractionsInput = {
  objects: EditorObject[]
  selectedId: number | null
  zoom: number
  editingId: number | null
  onUpdateObject: (id: number, updates: Partial<EditorObject>) => void
}

export const useCanvasInteractions = ({
  objects,
  selectedId,
  zoom,
  editingId,
  onUpdateObject,
}: CanvasInteractionsInput) => {
  const targetRefs = useRef<Record<number, HTMLDivElement>>({})
  const moveableRef = useRef<any>(null)

  const selectedObject = useMemo(
    () => objects.find((obj) => obj.id === selectedId),
    [objects, selectedId],
  )

  const updateMoveableRect = useCallback(() => {
    moveableRef.current?.updateRect()
  }, [])

  useEffect(() => {
    if (selectedId === null) return

    const frame = requestAnimationFrame(() => {
      updateMoveableRect()
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedId, zoom, updateMoveableRect])

  const setTargetRef = useCallback((id: number, node: HTMLDivElement | null) => {
    if (node) {
      targetRefs.current[id] = node
      return
    }
    delete targetRefs.current[id]
  }, [])

  const toCanvasUnit = useCallback((value: number, current: number) => {
    if (!zoom || zoom === 1) return value
    const normalized = value / zoom
    return Math.abs(normalized - current) < Math.abs(value - current) ? normalized : value
  }, [zoom])

  const toSafeCanvasUnit = useCallback((value: unknown, current: number) => {
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
      return current
    }
    return toCanvasUnit(value, current)
  }, [toCanvasUnit])

  const handleDrag = useCallback(
    ({ target, left, top }: any) => {
      if (!selectedId || editingId !== null || selectedObject?.locked) return

      const normalizedLeft = toCanvasUnit(left, selectedObject?.x ?? left)
      const normalizedTop = toCanvasUnit(top, selectedObject?.y ?? top)
      target.style.left = `${normalizedLeft}px`
      target.style.top = `${normalizedTop}px`
      onUpdateObject(selectedId, { x: normalizedLeft, y: normalizedTop })
    },
    [editingId, onUpdateObject, selectedId, selectedObject, toCanvasUnit],
  )

  const handleResize = useCallback(
    ({ target, width, height, left, top }: any) => {
      if (!selectedId || editingId !== null || selectedObject?.locked) return

      const currentX = selectedObject?.x ?? 0
      const currentY = selectedObject?.y ?? 0
      const currentWidth = selectedObject?.width ?? 0
      const currentHeight = selectedObject?.height ?? 0

      const isSuspiciousOriginReset = left === 0 && top === 0 && (currentX !== 0 || currentY !== 0)

      const normalizedWidth = toSafeCanvasUnit(width, currentWidth)
      const normalizedHeight = toSafeCanvasUnit(height, currentHeight)
      const normalizedLeft = isSuspiciousOriginReset ? currentX : toSafeCanvasUnit(left, currentX)
      const normalizedTop = isSuspiciousOriginReset ? currentY : toSafeCanvasUnit(top, currentY)

      target.style.width = `${normalizedWidth}px`
      target.style.height = `${normalizedHeight}px`
      target.style.left = `${normalizedLeft}px`
      target.style.top = `${normalizedTop}px`

      onUpdateObject(selectedId, {
        width: normalizedWidth,
        height: normalizedHeight,
        x: normalizedLeft,
        y: normalizedTop,
      })
    },
    [editingId, onUpdateObject, selectedId, selectedObject, toSafeCanvasUnit],
  )

  const handleRotate = useCallback(
    ({ target, rotate }: any) => {
      if (!selectedId || editingId !== null || selectedObject?.locked) return

      target.style.transform = `rotate(${rotate}deg)`
      onUpdateObject(selectedId, { rotate })
    },
    [editingId, onUpdateObject, selectedId, selectedObject?.locked],
  )

  return {
    moveableRef,
    selectedObject,
    setTargetRef,
    targetRefs,
    updateMoveableRect,
    handleDrag,
    handleResize,
    handleRotate,
  }
}