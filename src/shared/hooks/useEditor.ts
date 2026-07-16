import { useState } from 'react'
import { MAX_ZOOM, MIN_ZOOM } from '../constants/editorGeometry'
import type { ActiveTool, EditorObject, EditorObjectType, FitZoomInput } from '../types/editor'

export const computeFitZoom = ({
  viewportWidth,
  viewportHeight,
  pageWidth,
  pageHeight,
  padding = 0,
}: FitZoomInput): number | null => {
  if (!viewportWidth || !viewportHeight || !pageWidth || !pageHeight) return null
  const usableWidth = viewportWidth - padding * 2
  const usableHeight = viewportHeight - padding * 2
  if (usableWidth <= 0 || usableHeight <= 0) return null

  const fitZoom = Math.min(usableWidth / pageWidth, usableHeight / pageHeight)
  if (!Number.isFinite(fitZoom)) return null

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, fitZoom))
}

export const useEditor = (initialObjects: EditorObject[]) => {
  const [objects, setObjects] = useState<EditorObject[]>(initialObjects)
  const [selectedId, setSelectedId] = useState<number | null>(initialObjects[0]?.id || null)
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)
  const [zoom, setZoomState] = useState(1)

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  const updateObject = (id: number, updates: Partial<EditorObject>) => {
    setObjects((current) =>
      current.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
    )
  }

  const addObject = (type: EditorObjectType, defaults: Partial<EditorObject> = {}) => {
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

  const deleteObject = (id: number) => {
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

  const setZoom = (nextZoom: number) => {
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
