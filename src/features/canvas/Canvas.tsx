import Moveable from 'react-moveable'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
  BackdropGrid,
  CanvasArea,
  CanvasObject,
  CanvasWrapper,
  EditableText,
  ObjectText,
  PageSurface,
  ShapeBox,
  Workspace,
} from './Canvas.styles'
import { useCanvasInteractions } from './useCanvasInteractions'
import type { EditorObject } from '../../shared/types/editor'
import { DEFAULT_TEXT_HEIGHT } from '../../shared/constants/editorGeometry'

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

  const enterTextEdit = (object: EditorObject) => {
    if (object.type !== 'text') return
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
            {objects.map((object) => (
              <CanvasObject
                key={object.id}
                data-testid={`canvas-object-${object.id}`}
                ref={(node) => setTargetRef(object.id, node)}
                selected={selectedId === object.id}
                style={{
                  left: object.x,
                  top: object.y,
                  width: object.width,
                  height: object.height,
                  transform: `rotate(${object.rotate}deg)`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
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
                ) : (
                  <ShapeBox style={{ background: object.color }} />
                )}
              </CanvasObject>
            ))}
          </PageSurface>
        </Workspace>

        {selectedObject && editingId === null && (
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
