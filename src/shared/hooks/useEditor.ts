import { useState } from 'react'
import {
  DEFAULT_IMAGE_CORNER_RADIUS,
  DEFAULT_IMAGE_FIT_MODE,
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_OPACITY,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_TEXT_FONT_WEIGHT,
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_LINE_HEIGHT,
  DEFAULT_TEXT_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../constants/editorGeometry'
import type {
  ActiveTool,
  EditorObject,
  EditorObjectType,
  FrameLayer,
  FitZoomInput,
  ImageLayer,
  RectLayer,
  TextLayer,
} from '../types/editor'

type DefaultLayerProps =
  | Omit<TextLayer, 'id'>
  | Omit<ImageLayer, 'id'>
  | Omit<FrameLayer, 'id'>
  | Omit<RectLayer, 'id'>

const getDefaultLayerProps = (type: EditorObjectType): DefaultLayerProps => {
  const base = {
    x: 200,
    y: 200,
    width: 140,
    height: 100,
    rotate: 0,
    visible: true,
    locked: false,
  }

  if (type === 'text') {
    return {
      ...base,
      type: 'text',
      width: DEFAULT_TEXT_WIDTH,
      height: DEFAULT_TEXT_HEIGHT,
      text: 'New text',
      textColor: DEFAULT_TEXT_COLOR,
      fontFamily: DEFAULT_TEXT_FONT_FAMILY,
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      fontWeight: DEFAULT_TEXT_FONT_WEIGHT,
      textAlign: DEFAULT_TEXT_ALIGN,
      lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
      wrapMode: 'fixed',
    } satisfies Omit<TextLayer, 'id'>
  }

  if (type === 'image') {
    return {
      ...base,
      type: 'image',
      width: DEFAULT_IMAGE_WIDTH,
      height: DEFAULT_IMAGE_HEIGHT,
      src: '',
      fitMode: DEFAULT_IMAGE_FIT_MODE,
      opacity: DEFAULT_IMAGE_OPACITY,
      cornerRadius: DEFAULT_IMAGE_CORNER_RADIUS,
    } satisfies Omit<ImageLayer, 'id'>
  }

  if (type === 'frame') {
    return {
      ...base,
      type: 'frame',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    } satisfies Omit<FrameLayer, 'id'>
  }

  return {
    ...base,
    type: 'rect',
    color: '#0066cc',
  } satisfies Omit<RectLayer, 'id'>
}

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
      ...getDefaultLayerProps(type),
      ...defaults,
    } as EditorObject

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

  const duplicateObject = (id: number) => {
    const source = objects.find((obj) => obj.id === id)
    if (!source) return null

    const duplicateId = Date.now()
    const duplicatedObject = {
      ...source,
      id: duplicateId,
      x: source.x + 20,
      y: source.y + 20,
    }

    setObjects((current) => [...current, duplicatedObject])
    setSelectedId(duplicateId)
    return duplicatedObject
  }

  const toggleObjectLock = (id: number) => {
    setObjects((current) =>
      current.map((obj) => (
        obj.id === id
          ? { ...obj, locked: !(obj.locked ?? false) }
          : obj
      )),
    )
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
    duplicateObject,
    deleteObject,
    deleteSelected,
    toggleObjectLock,
  }
}
