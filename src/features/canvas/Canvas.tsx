import Moveable from 'react-moveable'
import { useRef } from 'react'
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
import { InlineObjectToolbar } from './InlineObjectToolbar'
import { useCanvasImageLifecycle } from './useCanvasImageLifecycle'
import { useCanvasTextEditing } from './useCanvasTextEditing'
import type { EditorObject } from '../../shared/types/editor'
import {
  DEFAULT_IMAGE_CORNER_RADIUS,
  DEFAULT_IMAGE_FIT_MODE,
  DEFAULT_IMAGE_OPACITY,
} from '../../shared/constants/editorGeometry'

type CanvasProps = {
  objects: EditorObject[]
  selectedId: number | null
  onSelectObject: (id: number | null) => void
  onUpdateObject: (id: number, updates: Partial<EditorObject>) => void
  onDuplicateObject: (id: number) => void
  onDeleteObject: (id: number) => void
  onToggleObjectLock: (id: number) => void
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
                    handleObjectClick(object.id)
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
                            onLoad={() => handleImageLoad(object.id)}
                            onError={() => handleImageError(object.id)}
                          />

                          {imageLoadStates[object.id] === 'error' ? (
                            <ImageErrorPlaceholder>
                              Failed to load image
                              <RetryButton
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRetry(object.id)
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
                  ) : object.type === 'frame' ? (
                    <ShapeBox
                      style={{
                        background: 'transparent',
                        borderStyle: 'solid',
                        borderWidth: `${object.borderWidth ?? 1}px`,
                        borderColor: object.borderColor ?? '#e5e7eb',
                      }}
                    />
                  ) : (
                    <ShapeBox style={{ background: object.color ?? '#0066cc' }} />
                  )}
                </CanvasObject>
              )
            })}

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
