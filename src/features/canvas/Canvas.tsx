import Moveable from 'react-moveable'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
  BackdropGrid,
  CanvasImage,
  CanvasImageContainer,
  CanvasArea,
  CanvasObject,
  CanvasWrapper,
  EditableText,
  ImageErrorPlaceholder,
  ImagePlaceholder,
  ObjectText,
  PageSurface,
  RetryButton,
  ShapeBox,
  Workspace,
} from './Canvas.styles'
import { useCanvasInteractions } from './useCanvasInteractions'
import type { EditorObject } from '../../shared/types/editor'
import {
  DEFAULT_IMAGE_CORNER_RADIUS,
  DEFAULT_IMAGE_FIT_MODE,
  DEFAULT_IMAGE_OPACITY,
  DEFAULT_TEXT_HEIGHT,
} from '../../shared/constants/editorGeometry'

type ImageLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

type CanvasProps = {
  objects: EditorObject[]
  selectedId: number | null
  onSelectObject: (id: number | null) => void
  onUpdateObject: (id: number, updates: Partial<EditorObject>) => void
  zoom?: number
  viewportRef?: RefObject<HTMLDivElement | null>
}

export const Canvas = ({
  objects,
  selectedId,
  onSelectObject,
  onUpdateObject,
  zoom = 1,
  viewportRef,
}: CanvasProps) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftText, setDraftText] = useState('')
  const originalTextRef = useRef('')
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingHeightRef = useRef<number | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, ImageLoadStatus>>({})
  const [imageRetryTokens, setImageRetryTokens] = useState<Record<number, number>>({})
  const previousImageSrcRef = useRef<Record<number, string>>({})

  const {
    moveableRef,
    selectedObject,
    setTargetRef,
    targetRefs,
    updateMoveableRect,
    handleDrag,
    handleResize,
    handleRotate,
  } = useCanvasInteractions({ objects, selectedId, zoom, onUpdateObject, editingId })

  useEffect(() => {
    if (editingId === null || !textAreaRef.current) return
    textAreaRef.current.focus()
    textAreaRef.current.select()
  }, [editingId])

  const updateTextHeightFromElement = (object: EditorObject, element: HTMLTextAreaElement) => {
    if (object.type !== 'text') return

    element.style.height = '0px'
    const nextHeightPx = Math.max(element.scrollHeight, DEFAULT_TEXT_HEIGHT)
    element.style.height = `${nextHeightPx}px`

    const normalizedHeight = nextHeightPx / zoom
    if (Math.abs(object.height - normalizedHeight) < 0.5) return

    pendingHeightRef.current = normalizedHeight
    onUpdateObject(object.id, { height: normalizedHeight })
  }

  const getObjectById = (id: number | null) => objects.find((obj) => obj.id === id)

  useEffect(() => {
    if (editingId === null || !textAreaRef.current) return
    const object = getObjectById(editingId)
    if (!object || object.type !== 'text') return
    updateTextHeightFromElement(object, textAreaRef.current)
  }, [draftText, editingId, objects, zoom])

  useEffect(() => {
    const currentImageSrc: Record<number, string> = {}

    for (const obj of objects) {
      if (obj.type !== 'image') continue
      const src = obj.src ?? ''
      currentImageSrc[obj.id] = src

      const previousSrc = previousImageSrcRef.current[obj.id]
      if (previousSrc === src) continue

      if (previousSrc && previousSrc.startsWith('blob:')) {
        URL.revokeObjectURL(previousSrc)
      }

      setImageLoadStates((current) => ({
        ...current,
        [obj.id]: src ? 'loading' : 'idle',
      }))
    }

    for (const [idText, previousSrc] of Object.entries(previousImageSrcRef.current)) {
      const id = Number(idText)
      if (id in currentImageSrc) continue
      if (previousSrc.startsWith('blob:')) {
        URL.revokeObjectURL(previousSrc)
      }
      setImageLoadStates((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      setImageRetryTokens((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }

    previousImageSrcRef.current = currentImageSrc
  }, [objects])

  useEffect(() => {
    return () => {
      for (const src of Object.values(previousImageSrcRef.current)) {
        if (src.startsWith('blob:')) {
          URL.revokeObjectURL(src)
        }
      }
    }
  }, [])

  const enterTextEdit = (object: EditorObject) => {
    if (object.type !== 'text' || object.locked) return
    onSelectObject(object.id)
    setEditingId(object.id)
    const text = object.text ?? ''
    originalTextRef.current = text
    setDraftText(text)
  }

  const commitTextEdit = () => {
    if (editingId === null) return
    const pendingHeight = pendingHeightRef.current
    onUpdateObject(editingId, {
      text: draftText,
      ...(pendingHeight !== null ? { height: pendingHeight } : {}),
    })
    pendingHeightRef.current = null
    setEditingId(null)
    requestAnimationFrame(() => {
      updateMoveableRect()
    })
  }

  const cancelTextEdit = () => {
    if (editingId === null) return
    onUpdateObject(editingId, { text: originalTextRef.current })
    pendingHeightRef.current = null
    setEditingId(null)
    setDraftText(originalTextRef.current)
    requestAnimationFrame(() => {
      updateMoveableRect()
    })
  }

  return (
    <CanvasWrapper>
      <CanvasArea
        data-testid="canvas-area"
        ref={viewportRef}
        onClick={() => {
          if (editingId !== null) {
            commitTextEdit()
            return
          }
          onSelectObject(null)
        }}
      >
        <Workspace $zoom={zoom}>
          <BackdropGrid />

          <PageSurface $zoom={zoom} data-testid="page-surface">
            {objects.map((object) => {
              if (!(object.visible ?? true)) return null

              return (
                <CanvasObject
                  key={object.id}
                  data-testid={`canvas-object-${object.id}`}
                  ref={(node) => setTargetRef(object.id, node)}
                  selected={selectedId === object.id}
                  $locked={object.locked ?? false}
                  style={{
                    left: object.x,
                    top: object.y,
                    width: object.width,
                    height: object.height,
                    transform: `rotate(${object.rotate}deg)`,
                    zIndex: object.zIndex,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (object.locked) return
                    if (editingId !== null && editingId !== object.id) {
                      commitTextEdit()
                    }
                    onSelectObject(object.id)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    enterTextEdit(object)
                  }}
                >
                  {object.type === 'text' ? (
                    editingId === object.id ? (
                      <EditableText
                        ref={textAreaRef}
                        aria-label="Text Editor"
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        onBlur={commitTextEdit}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault()
                            cancelTextEdit()
                          }
                        }}
                        $fontSize={object.fontSize}
                        $fontWeight={object.fontWeight}
                        $textAlign={object.textAlign}
                        $textColor={object.textColor}
                        $lineHeight={object.lineHeight}
                        $fontFamily={object.fontFamily}
                      />
                    ) : (
                      <ObjectText
                        $fontSize={object.fontSize}
                        $fontWeight={object.fontWeight}
                        $textAlign={object.textAlign}
                        $textColor={object.textColor}
                        $lineHeight={object.lineHeight}
                        $fontFamily={object.fontFamily}
                      >
                        {object.text}
                      </ObjectText>
                    )
                  ) : object.type === 'image' ? (
                    <CanvasImageContainer
                      data-testid={`canvas-image-container-${object.id}`}
                      $opacity={object.opacity ?? DEFAULT_IMAGE_OPACITY}
                      $cornerRadius={object.cornerRadius ?? DEFAULT_IMAGE_CORNER_RADIUS}
                    >
                      {!object.src ? (
                        <ImagePlaceholder>No image selected</ImagePlaceholder>
                      ) : (
                        <>
                          <CanvasImage
                            key={`${object.id}-${imageRetryTokens[object.id] ?? 0}-${object.src}`}
                            data-testid={`canvas-image-${object.id}`}
                            src={object.src}
                            alt="Canvas image"
                            draggable={false}
                            $fitMode={object.fitMode ?? DEFAULT_IMAGE_FIT_MODE}
                            style={{ display: imageLoadStates[object.id] === 'loaded' ? 'block' : 'none' }}
                            onLoad={() => {
                              setImageLoadStates((current) => ({ ...current, [object.id]: 'loaded' }))
                              updateMoveableRect()
                            }}
                            onError={() => {
                              setImageLoadStates((current) => ({ ...current, [object.id]: 'error' }))
                            }}
                          />

                          {imageLoadStates[object.id] === 'error' ? (
                            <ImageErrorPlaceholder>
                              Failed to load image
                              <RetryButton
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setImageLoadStates((current) => ({ ...current, [object.id]: 'loading' }))
                                  setImageRetryTokens((current) => ({
                                    ...current,
                                    [object.id]: (current[object.id] ?? 0) + 1,
                                  }))
                                }}
                              >
                                Retry
                              </RetryButton>
                            </ImageErrorPlaceholder>
                          ) : imageLoadStates[object.id] !== 'loaded' ? (
                            <ImagePlaceholder>Loading image...</ImagePlaceholder>
                          ) : null}
                        </>
                      )}
                    </CanvasImageContainer>
                  ) : (
                    <ShapeBox style={{ background: object.color }} />
                  )}
                </CanvasObject>
              )
            })}
          </PageSurface>
        </Workspace>

        {selectedObject && editingId === null && !selectedObject.locked && (
          <Moveable
            ref={moveableRef}
            target={targetRefs.current[selectedId]}
            zoom={zoom}
            draggable
            resizable
            rotatable
            keepRatio={false}
            useResizeObserver
            useMutationObserver
            throttleDrag={0}
            throttleResize={0}
            throttleRotate={0}
            onDrag={handleDrag}
            onDragEnd={updateMoveableRect}
            onResize={handleResize}
            onResizeEnd={updateMoveableRect}
            onRotate={handleRotate}
            onRotateEnd={updateMoveableRect}
          />
        )}
      </CanvasArea>
    </CanvasWrapper>
  )
}
