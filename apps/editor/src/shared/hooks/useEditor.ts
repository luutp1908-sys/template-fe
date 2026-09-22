import { useState, useEffect, useMemo, useRef } from 'react'
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
import {
  createObjectIdGenerator,
  createPageIdGenerator,
  getNextObjectIdSeed,
  getNextPageIdSeed,
} from './editorIdStrategy'
import {
  createTemplateContentFromObjects,
  resolvePagesFromTemplateContent,
} from './editorTemplateConversions'
import type {
  ActiveTool,
  EditorObject,
  EditorObjectType,
  FrameLayer,
  FrameShape,
  FitZoomInput,
  ImageLayer,
  RectLayer,
  TextLayer,
  TemplateContent,
  Page,
  PageBackground,
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
      textConfig: {
        value: 'New text',
        type: 'text-box',
        width: `${DEFAULT_TEXT_WIDTH}px`,
        height: `${DEFAULT_TEXT_HEIGHT}px`,
        translate: [0, 0],
        rotate: 0,
        fontFamily: DEFAULT_TEXT_FONT_FAMILY,
        fontSize: `${DEFAULT_TEXT_FONT_SIZE}px`,
        fontColor: DEFAULT_TEXT_COLOR,
        textAlign: DEFAULT_TEXT_ALIGN,
        lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
        letterSpacing: '0px',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isCapital: false,
        presentationType: 'body',
        colorPaletteType: null,
        externalFontUrl: null,
        isLogoQrCode: false,
      },
    } satisfies Omit<TextLayer, 'id'>
  }

  if (type === 'image') {
    return {
      ...base,
      type: 'image',
      width: DEFAULT_IMAGE_WIDTH,
      height: DEFAULT_IMAGE_HEIGHT,
      imageConfig: {
        size: { width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT },
        width: DEFAULT_IMAGE_WIDTH,
        height: DEFAULT_IMAGE_HEIGHT,
        translate: [0, 0],
        rotate: 0,
        url: '',
        tagNames: [],
        colorConfig: {},
        cropImage: { width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT, translate: [0, 0] },
        scaleX: 1,
        scaleY: 1,
        replaced: false,
        isPro: false,
        isLoading: false,
        isLocked: false,
      },
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
      shape: 'rect',
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

export const useEditor = (initialTemplate?: TemplateContent | EditorObject[] | null) => {
  // Normalize legacy input: if an array of EditorObject is provided, convert to TemplateContent
  const normalizedInitial: TemplateContent | null = useMemo(
    () => (Array.isArray(initialTemplate) ? createTemplateContentFromObjects(initialTemplate) : (initialTemplate ?? null)),
    [initialTemplate],
  )
  const initialPages: Page[] = resolvePagesFromTemplateContent(normalizedInitial)

  const [pages, setPages] = useState<Page[]>(initialPages)
  const [currentPageIndex, setCurrentPageIndexState] = useState<number>(0)
  const [selectedId, setSelectedId] = useState<number | null>(
    initialPages[0]?.layers?.[0]?.id || null,
  )
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)
  const [zoom, setZoomState] = useState(1)
  const nextObjectIdRef = useRef(createObjectIdGenerator(getNextObjectIdSeed(initialPages)))
  const nextPageIdRef = useRef(createPageIdGenerator(getNextPageIdSeed(initialPages)))

  useEffect(() => {
    if (!normalizedInitial) return
    const mappedPages = resolvePagesFromTemplateContent(normalizedInitial)
    nextObjectIdRef.current = createObjectIdGenerator(getNextObjectIdSeed(mappedPages))
    nextPageIdRef.current = createPageIdGenerator(getNextPageIdSeed(mappedPages))
    setPages(mappedPages)
    setCurrentPageIndexState(0)
    setSelectedId(mappedPages[0]?.layers?.[0]?.id || null)
  }, [normalizedInitial])

  const objects = pages[currentPageIndex]?.layers || []
  const selectedObject = objects.find((obj) => obj.id === selectedId)

  const updateObject = (id: number, updates: Partial<EditorObject>) => {
    setPages((current) =>
      current.map((p, idx) =>
        idx === currentPageIndex
          ? { ...p, layers: p.layers.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)) }
          : p,
      ),
    )
  }

  const addObject = (type: EditorObjectType, defaults: Partial<EditorObject> = {}) => {
    const newId = nextObjectIdRef.current()
    const newObject = {
      id: newId,
      ...getDefaultLayerProps(type),
      ...defaults,
    } as EditorObject

    setPages((current) =>
      current.map((p, idx) => (idx === currentPageIndex ? { ...p, layers: [...p.layers, newObject] } : p)),
    )
    setSelectedId(newId)
    return newObject
  }

  const addFrameLayer = (opts: { width?: number; height?: number; shape?: FrameShape; x?: number; y?: number } = {}) => {
    const defaults: Partial<FrameLayer> = {}
    if (opts.width !== undefined) defaults.width = opts.width
    if (opts.height !== undefined) defaults.height = opts.height
    if (opts.x !== undefined) defaults.x = opts.x
    if (opts.y !== undefined) defaults.y = opts.y
    if (opts.shape !== undefined) defaults.shape = opts.shape

    return addObject('frame', defaults)
  }

  const deleteObject = (id: number) => {
    setPages((current) =>
      current.map((p, idx) =>
        idx === currentPageIndex
          ? { ...p, layers: p.layers.filter((obj) => obj.id !== id) }
          : p,
      ),
    )
    if (selectedId === id) {
      const remaining = (pages[currentPageIndex]?.layers || []).filter((o) => o.id !== id)
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

    const duplicateId = nextObjectIdRef.current()
    const duplicatedObject = {
      ...source,
      id: duplicateId,
      x: source.x + 20,
      y: source.y + 20,
    }

    setPages((current) =>
      current.map((p, idx) => (idx === currentPageIndex ? { ...p, layers: [...p.layers, duplicatedObject] } : p)),
    )
    setSelectedId(duplicateId)
    return duplicatedObject
  }

  const toggleObjectLock = (id: number) => {
    setPages((current) =>
      current.map((p, idx) =>
        idx === currentPageIndex
          ? { ...p, layers: p.layers.map((obj) => (obj.id === id ? { ...obj, locked: !(obj.locked ?? false) } : obj)) }
          : p,
      ),
    )
  }

  const setZoom = (nextZoom: number) => {
    const numericZoom = Number(nextZoom)
    if (Number.isNaN(numericZoom)) return
    setZoomState(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, numericZoom)))
  }

  const addPage = (page: Partial<Page> = {}) => {
    const newPage: Page = {
      id: page.id || nextPageIdRef.current(),
      width: page.width || 1024,
      height: page.height || 768,
      background: page.background || { color: '#ffffff' },
      layers: page.layers || [],
    }
    setPages((current) => [...current, newPage])
    setCurrentPageIndexState((prev) => prev + 1)
    return newPage
  }

  const setCurrentPageIndex = (index: number) => {
    const safe = Math.max(0, Math.min(index, pages.length - 1))
    setCurrentPageIndexState(safe)
  }

  const setPageBackground = (bg: PageBackground) => {
    setPages((current) =>
      current.map((p, idx) => (idx === currentPageIndex ? { ...p, background: { ...(p.background || {}), ...bg } } : p)),
    )
  }

  return {
    // page-level state
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    addPage,
    // current page helpers
    objects,
    selectedId,
    setSelectedId,
    selectedObject,
    // page background helpers
    currentPageBackground: pages[currentPageIndex]?.background,
    setPageBackground,
    // editor tools
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    updateObject,
    addObject,
    addFrameLayer,
    duplicateObject,
    deleteObject,
    deleteSelected,
    toggleObjectLock,
  }
}
