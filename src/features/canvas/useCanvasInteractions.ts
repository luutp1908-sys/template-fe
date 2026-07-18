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

      const normalizedWidth = toCanvasUnit(width, selectedObject?.width ?? width)
      const normalizedHeight = toCanvasUnit(height, selectedObject?.height ?? height)
      const normalizedLeft = toCanvasUnit(left, selectedObject?.x ?? left)
      const normalizedTop = toCanvasUnit(top, selectedObject?.y ?? top)

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
    [editingId, onUpdateObject, selectedId, selectedObject, toCanvasUnit],
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