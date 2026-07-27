import Moveable from 'react-moveable'
import { useRef } from 'react'
import type { RefObject } from 'react'
import {
  BackdropGrid,
  CanvasArea,
  CanvasWrapper,
  PageSurface,
  Workspace,
} from './Canvas.styles'
import { useCanvasInteractions } from './useCanvasInteractions'
import { InlineObjectToolbar } from './InlineObjectToolbar'
import { LayerRenderer } from '../layers'
import { useCanvasImageLifecycle } from './useCanvasImageLifecycle'
import { useCanvasTextEditing } from './useCanvasTextEditing'
import type { EditorObject } from '../../shared/types/editor'

type CanvasProps = {
  objects: EditorObject[]
  selectedId: number | null
  onSelectObject: (id: number | null) => void
  onUpdateObject: (id: number, updates: Partial<EditorObject>) => void
  onDuplicateObject: (id: number) => void
  onDeleteObject: (id: number) => void
  onToggleObjectLock: (id: number) => void
  pageBackgroundColor?: string
  pageBackgroundImage?: string
  pageWidth?: number
  pageHeight?: number
  zoom?: number
  viewportRef?: RefObject<HTMLDivElement | null>
}

export const Canvas = ({
  objects,
  selectedId,
  onSelectObject,
  onUpdateObject,
  onDuplicateObject,
  onDeleteObject,
  onToggleObjectLock,
  pageBackgroundColor = '#ffffff',
  pageBackgroundImage,
  pageWidth,
  pageHeight,
  zoom = 1,
  viewportRef,
}: CanvasProps) => {
  const updateMoveableRectRef = useRef<() => void>(() => undefined)

  const {
    editingId,
    draftText,
    setDraftText,
    textAreaRef,
    enterTextEdit,
    commitTextEdit,
    cancelTextEdit,
    handleCanvasAreaClick,
    handleObjectClick,
  } = useCanvasTextEditing({
    objects,
    zoom,
    onSelectObject,
    onUpdateObject,
    onAfterEditSettled: () => updateMoveableRectRef.current(),
  })

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
  updateMoveableRectRef.current = updateMoveableRect

  const {
    imageLoadStates,
    imageRetryTokens,
    handleImageLoad,
    handleImageError,
    handleRetry,
  } = useCanvasImageLifecycle({
    objects,
    onImageLoaded: updateMoveableRect,
  })

  return (
    <CanvasWrapper>
      <CanvasArea
        data-testid="canvas-area"
        ref={viewportRef}
        onClick={handleCanvasAreaClick}
      >
        <Workspace $zoom={zoom}>
          <BackdropGrid />

          <PageSurface
            $zoom={zoom}
            $backgroundColor={pageBackgroundColor}
            $backgroundImage={pageBackgroundImage}
            $pageWidth={pageWidth}
            $pageHeight={pageHeight}
            data-testid="page-surface"
          >
            {objects.map((object) => (
              <LayerRenderer
                key={object.id}
                object={object}
                selected={selectedId === object.id}
                setTargetRef={setTargetRef}
                textEditing={{
                  editingId,
                  draftText,
                  textAreaRef,
                  setDraftText,
                  onCommitTextEdit: commitTextEdit,
                  onCancelTextEdit: cancelTextEdit,
                  onEnterTextEdit: enterTextEdit,
                }}
                imageLifecycle={{
                  imageLoadStates,
                  imageRetryTokens,
                  onImageLoad: handleImageLoad,
                  onImageError: handleImageError,
                  onImageRetry: handleRetry,
                }}
                onSelectObject={handleObjectClick}
              />
            ))}

            {selectedObject && editingId === null && (
              <InlineObjectToolbar
                selectedObject={selectedObject}
                onDuplicateObject={onDuplicateObject}
                onDeleteObject={onDeleteObject}
                onToggleObjectLock={onToggleObjectLock}
              />
            )}
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
