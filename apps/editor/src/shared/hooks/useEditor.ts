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
import type { EditorCommand } from './editorCommands'
import { toPersistedEditorContent } from './editorPersistence'
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
  const persistedContent = useMemo(() => toPersistedEditorContent(pages), [pages])

  const dispatchCommand = (command: EditorCommand) => {
    switch (command.type) {
      case 'updateObject': {
        setPages((current) =>
          current.map((p, idx) =>
            idx === currentPageIndex
              ? {
                ...p,
                layers: p.layers.map((obj) =>
                  obj.id === command.id ? { ...obj, ...command.updates } : obj,
                ),
              }
              : p,
          ),
        )
        return null
      }

      case 'addObject': {
        const newId = nextObjectIdRef.current()
        const newObject = {
          id: newId,
          ...getDefaultLayerProps(command.objectType),
          ...(command.defaults || {}),
        } as EditorObject

        setPages((current) =>
          current.map((p, idx) =>
            idx === currentPageIndex ? { ...p, layers: [...p.layers, newObject] } : p,
          ),
        )
        setSelectedId(newId)
        return newObject
      }

      case 'deleteObject': {
        let nextSelectedId: number | null | undefined

        setPages((current) =>
          current.map((p, idx) => {
            if (idx !== currentPageIndex) return p
            const remainingLayers = p.layers.filter((obj) => obj.id !== command.id)
            if (selectedId === command.id) {
              nextSelectedId = remainingLayers[0]?.id || null
            }
            return { ...p, layers: remainingLayers }
          }),
        )

        if (nextSelectedId !== undefined) {
          setSelectedId(nextSelectedId)
        }
        return null
      }

      case 'duplicateObject': {
        let duplicatedObject: EditorObject | null = null

        setPages((current) =>
          current.map((p, idx) => {
            if (idx !== currentPageIndex) return p

            const source = p.layers.find((obj) => obj.id === command.id)
            if (!source) return p

            const duplicateId = nextObjectIdRef.current()
            duplicatedObject = {
              ...source,
              id: duplicateId,
              x: source.x + 20,
              y: source.y + 20,
            }

            return { ...p, layers: [...p.layers, duplicatedObject] }
          }),
        )

        if (duplicatedObject) {
          setSelectedId(duplicatedObject.id)
        }
        return duplicatedObject
      }

      case 'toggleObjectLock': {
        setPages((current) =>
          current.map((p, idx) =>
            idx === currentPageIndex
              ? {
                ...p,
                layers: p.layers.map((obj) =>
                  obj.id === command.id ? { ...obj, locked: !(obj.locked ?? false) } : obj,
                ),
              }
              : p,
          ),
        )
        return null
      }

      case 'addPage': {
        const page = command.page || {}
        const newPage: Page = {
          id: page.id || nextPageIdRef.current(),
          width: page.width || 1024,
          height: page.height || 768,
          background: page.background || { color: '#ffffff' },
          layers: page.layers || [],
        }

        let newPageIndex = 0
        setPages((current) => {
          newPageIndex = current.length
          return [...current, newPage]
        })
        setCurrentPageIndexState(newPageIndex)
        return newPage
      }

      case 'setCurrentPageIndex': {
        const safe = Math.max(0, Math.min(command.index, pages.length - 1))
        setCurrentPageIndexState(safe)
        return safe
      }

      case 'setPageBackground': {
        setPages((current) =>
          current.map((p, idx) =>
            idx === currentPageIndex
              ? { ...p, background: { ...(p.background || {}), ...command.background } }
              : p,
          ),
        )
        return null
      }

      default:
        return null
    }
  }

  const updateObject = (id: number, updates: Partial<EditorObject>) => {
    dispatchCommand({ type: 'updateObject', id, updates })
  }

  const addObject = (type: EditorObjectType, defaults: Partial<EditorObject> = {}) => {
    const result = dispatchCommand({ type: 'addObject', objectType: type, defaults })
    return result as EditorObject
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
    dispatchCommand({ type: 'deleteObject', id })
  }

  const deleteSelected = () => {
    if (selectedObject) {
      deleteObject(selectedId)
    }
  }

  const duplicateObject = (id: number) => {
    return dispatchCommand({ type: 'duplicateObject', id }) as EditorObject | null
  }

  const toggleObjectLock = (id: number) => {
    dispatchCommand({ type: 'toggleObjectLock', id })
  }

  const setZoom = (nextZoom: number) => {
    const numericZoom = Number(nextZoom)
    if (Number.isNaN(numericZoom)) return
    setZoomState(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, numericZoom)))
  }

  const addPage = (page: Partial<Page> = {}) => {
    return dispatchCommand({ type: 'addPage', page }) as Page
  }

  const setCurrentPageIndex = (index: number) => {
    dispatchCommand({ type: 'setCurrentPageIndex', index })
  }

  const setPageBackground = (bg: PageBackground) => {
    dispatchCommand({ type: 'setPageBackground', background: bg })
  }

  return {
    // page-level state
    pages,
    persistedContent,
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
    dispatchCommand,
    updateObject,
    addObject,
    addFrameLayer,
    duplicateObject,
    deleteObject,
    deleteSelected,
    toggleObjectLock,
  }
}
