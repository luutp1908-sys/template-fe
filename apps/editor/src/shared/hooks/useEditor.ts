import { useState } from 'react'
import {
  MAX_ZOOM,
  MIN_ZOOM,
} from '../constants/editorGeometry'
import useEditorDomain from './useEditorDomain'
import type {
  ActiveTool,
  EditorObject,
  FitZoomInput,
  TemplateContent,
} from '../types/editor'

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

export const useEditor = (initialTemplate?: TemplateContent | EditorObject[] | null) => {
  const domain = useEditorDomain(initialTemplate)
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)
  const [zoom, setZoomState] = useState(1)

  const setZoom = (nextZoom: number) => {
    const numericZoom = Number(nextZoom)
    if (Number.isNaN(numericZoom)) return
    setZoomState(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, numericZoom)))
  }

  return {
    ...domain,
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
  }
}
