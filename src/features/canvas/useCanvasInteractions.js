import { useCallback, useEffect, useMemo, useRef } from 'react'

export const useCanvasInteractions = ({ objects, selectedId, zoom, onUpdateObject }) => {
  const targetRefs = useRef({})
  const moveableRef = useRef(null)

  const selectedObject = useMemo(
    () => objects.find((obj) => obj.id === selectedId),
    [objects, selectedId],
  )

  const updateMoveableRect = useCallback(() => {
    moveableRef.current?.updateRect()
  }, [])

  useEffect(() => {
    if (!selectedObject) return

    const frame = requestAnimationFrame(() => {
      updateMoveableRect()
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedObject, zoom, updateMoveableRect])

  const setTargetRef = useCallback((id, node) => {
    if (node) {
      targetRefs.current[id] = node
      return
    }
    delete targetRefs.current[id]
  }, [])

  const handleDrag = useCallback(
    ({ target, left, top }) => {
      if (!selectedId) return

      const normalizedLeft = left / zoom
      const normalizedTop = top / zoom
      target.style.left = `${left}px`
      target.style.top = `${top}px`
      onUpdateObject(selectedId, { x: normalizedLeft, y: normalizedTop })
    },
    [onUpdateObject, selectedId, zoom],
  )

  const handleResize = useCallback(
    ({ target, width, height, left, top }) => {
      if (!selectedId) return

      const normalizedWidth = width / zoom
      const normalizedHeight = height / zoom
      const normalizedLeft = left / zoom
      const normalizedTop = top / zoom

      target.style.width = `${width}px`
      target.style.height = `${height}px`
      target.style.left = `${left}px`
      target.style.top = `${top}px`

      onUpdateObject(selectedId, {
        width: normalizedWidth,
        height: normalizedHeight,
        x: normalizedLeft,
        y: normalizedTop,
      })
    },
    [onUpdateObject, selectedId, zoom],
  )

  const handleRotate = useCallback(
    ({ target, rotate }) => {
      if (!selectedId) return

      target.style.transform = `rotate(${rotate}deg)`
      onUpdateObject(selectedId, { rotate })
    },
    [onUpdateObject, selectedId],
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