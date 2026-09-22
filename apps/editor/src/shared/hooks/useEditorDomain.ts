import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_IMAGE_CORNER_RADIUS,
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
} from '../constants/editorGeometry'
import {
  createObjectIdGenerator,
  createPageIdGenerator,
  getNextObjectIdSeed,
  getNextPageIdSeed,
} from './editorIdStrategy'
import type { EditorCommand } from './editorCommands'
import useEditorHistory from './useEditorHistory'
import { toPersistedEditorContent } from './editorPersistence'
import {
  createTemplateContentFromObjects,
  resolvePagesFromTemplateContent,
} from './editorTemplateConversions'
import type {
  EditorObject,
  EditorObjectType,
  FrameLayer,
  FrameShape,
  ImageLayer,
  Page,
  PageBackground,
  RectLayer,
  TemplateContent,
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

export const useEditorDomain = (initialTemplate?: TemplateContent | EditorObject[] | null) => {
  const normalizedInitial: TemplateContent | null = useMemo(
    () => (Array.isArray(initialTemplate) ? createTemplateContentFromObjects(initialTemplate) : (initialTemplate ?? null)),
    [initialTemplate],
  )
  const initialPages: Page[] = resolvePagesFromTemplateContent(normalizedInitial)
  const initialState = useMemo(
    () => ({
      pages: initialPages,
      currentPageIndex: 0,
      selectedId: initialPages[0]?.layers?.[0]?.id || null,
    }),
    [initialPages],
  )

  const {
    present,
    canUndo,
    canRedo,
    updatePresent,
    resetHistory,
    undo,
    redo,
  } = useEditorHistory(initialState)
  const nextObjectIdRef = useRef(createObjectIdGenerator(getNextObjectIdSeed(initialPages)))
  const nextPageIdRef = useRef(createPageIdGenerator(getNextPageIdSeed(initialPages)))

  useEffect(() => {
    if (!normalizedInitial) return
    const mappedPages = resolvePagesFromTemplateContent(normalizedInitial)
    nextObjectIdRef.current = createObjectIdGenerator(getNextObjectIdSeed(mappedPages))
    nextPageIdRef.current = createPageIdGenerator(getNextPageIdSeed(mappedPages))
    resetHistory({
      pages: mappedPages,
      currentPageIndex: 0,
      selectedId: mappedPages[0]?.layers?.[0]?.id || null,
    })
  }, [normalizedInitial, resetHistory])

  const { pages, currentPageIndex, selectedId } = present

  const setSelectedId = (nextSelectedId: number | null) => {
    updatePresent(
      (current) => ({
        ...current,
        selectedId: nextSelectedId,
      }),
      { trackHistory: false },
    )
  }

  const objects = pages[currentPageIndex]?.layers || []
  const selectedObject = objects.find((obj) => obj.id === selectedId)
  const currentPageBackground = pages[currentPageIndex]?.background
  const persistedContent = useMemo(() => toPersistedEditorContent(pages), [pages])

  const dispatchCommand = (command: EditorCommand) => {
    switch (command.type) {
      case 'updateObject': {
        updatePresent((current) => ({
          ...current,
          pages: current.pages.map((page, idx) =>
            idx === current.currentPageIndex
              ? {
                ...page,
                layers: page.layers.map((obj) =>
                  obj.id === command.id ? { ...obj, ...command.updates } : obj,
                ),
              }
              : page,
          ),
        }))
        return null
      }

      case 'addObject': {
        const newId = nextObjectIdRef.current()
        const newObject = {
          id: newId,
          ...getDefaultLayerProps(command.objectType),
          ...(command.defaults || {}),
        } as EditorObject

        updatePresent((current) => ({
          ...current,
          pages: current.pages.map((page, idx) =>
            idx === current.currentPageIndex ? { ...page, layers: [...page.layers, newObject] } : page,
          ),
          selectedId: newId,
        }))
        return newObject
      }

      case 'deleteObject': {
        updatePresent((current) => {
          let nextSelectedId = current.selectedId

          return {
            ...current,
            pages: current.pages.map((page, idx) => {
              if (idx !== current.currentPageIndex) return page
              const remainingLayers = page.layers.filter((obj) => obj.id !== command.id)
              if (current.selectedId === command.id) {
                nextSelectedId = remainingLayers[0]?.id || null
              }
              return { ...page, layers: remainingLayers }
            }),
            selectedId: nextSelectedId,
          }
        })
        return null
      }

      case 'duplicateObject': {
        let duplicatedObject: EditorObject | null = null

        updatePresent((current) => ({
          ...current,
          pages: current.pages.map((page, idx) => {
            if (idx !== current.currentPageIndex) return page

            const source = page.layers.find((obj) => obj.id === command.id)
            if (!source) return page

            const duplicateId = nextObjectIdRef.current()
            duplicatedObject = {
              ...source,
              id: duplicateId,
              x: source.x + 20,
              y: source.y + 20,
            }

            return { ...page, layers: [...page.layers, duplicatedObject] }
          }),
          selectedId: duplicatedObject?.id ?? current.selectedId,
        }))
        return duplicatedObject
      }

      case 'toggleObjectLock': {
        updatePresent((current) => ({
          ...current,
          pages: current.pages.map((page, idx) =>
            idx === current.currentPageIndex
              ? {
                ...page,
                layers: page.layers.map((obj) =>
                  obj.id === command.id ? { ...obj, locked: !(obj.locked ?? false) } : obj,
                ),
              }
              : page,
          ),
        }))
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

        updatePresent((current) => ({
          ...current,
          pages: [...current.pages, newPage],
          currentPageIndex: current.pages.length,
        }))
        return newPage
      }

      case 'setCurrentPageIndex': {
        const safe = Math.max(0, Math.min(command.index, pages.length - 1))
        updatePresent(
          (current) => ({
            ...current,
            currentPageIndex: safe,
          }),
          { trackHistory: false },
        )
        return safe
      }

      case 'setPageBackground': {
        updatePresent((current) => ({
          ...current,
          pages: current.pages.map((page, idx) =>
            idx === current.currentPageIndex
              ? { ...page, background: { ...(page.background || {}), ...command.background } }
              : page,
          ),
        }))
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

  const addPage = (page: Partial<Page> = {}) => {
    return dispatchCommand({ type: 'addPage', page }) as Page
  }

  const setCurrentPageIndex = (index: number) => {
    dispatchCommand({ type: 'setCurrentPageIndex', index })
  }

  const setPageBackground = (background: PageBackground) => {
    dispatchCommand({ type: 'setPageBackground', background })
  }

  return {
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    addPage,
    objects,
    selectedId,
    setSelectedId,
    selectedObject,
    currentPageBackground,
    setPageBackground,
    persistedContent,
    canUndo,
    canRedo,
    undo,
    redo,
    dispatchCommand,
    updateObject,
    addObject,
    addFrameLayer,
    duplicateObject: (id: number) => dispatchCommand({ type: 'duplicateObject', id }) as EditorObject | null,
    deleteObject,
    deleteSelected,
    toggleObjectLock: (id: number) => {
      dispatchCommand({ type: 'toggleObjectLock', id })
    },
  }
}

export default useEditorDomain