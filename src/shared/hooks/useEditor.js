import { useState } from 'react'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 4

export const computeFitZoom = ({
  viewportWidth,
  viewportHeight,
  pageWidth,
  pageHeight,
  padding = 0,
}) => {
  if (!viewportWidth || !viewportHeight || !pageWidth || !pageHeight) return null
  const usableWidth = viewportWidth - padding * 2
  const usableHeight = viewportHeight - padding * 2
  if (usableWidth <= 0 || usableHeight <= 0) return null

  const fitZoom = Math.min(usableWidth / pageWidth, usableHeight / pageHeight)
  if (!Number.isFinite(fitZoom)) return null

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, fitZoom))
}

export const useEditor = (initialObjects) => {
  const [objects, setObjects] = useState(initialObjects)
  const [selectedId, setSelectedId] = useState(initialObjects[0]?.id || null)
  const [activeTool, setActiveTool] = useState(null)
  const [zoom, setZoomState] = useState(1)

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  const updateObject = (id, updates) => {
    setObjects((current) =>
      current.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
    )
  }

  const addObject = (type, defaults = {}) => {
    const newId = Date.now()
    const newObject = {
      id: newId,
      type,
      x: 200,
      y: 200,
      width: 140,
      height: 100,
      rotate: 0,
      ...defaults,
    }

    setObjects((current) => [...current, newObject])
    setSelectedId(newId)
    return newObject
  }

  const deleteObject = (id) => {
    const remaining = objects.filter((obj) => obj.id !== id)
    setObjects(remaining)
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id || null)
    }
  }

  const deleteSelected = () => {
    if (selectedObject) {
      deleteObject(selectedId)
    }
  }

  const setZoom = (nextZoom) => {
    const numericZoom = Number(nextZoom)
    if (Number.isNaN(numericZoom)) return
    setZoomState(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, numericZoom)))
  }

  return {
    objects,
    selectedId,
    setSelectedId,
    selectedObject,
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    updateObject,
    addObject,
    deleteObject,
    deleteSelected,
  }
}
