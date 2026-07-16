import Moveable from 'react-moveable'
import {
  BackdropGrid,
  CanvasArea,
  CanvasObject,
  CanvasWrapper,
  ObjectText,
  PageSurface,
  ShapeBox,
  Workspace,
} from './Canvas.styles'
import { useCanvasInteractions } from './useCanvasInteractions'

export const Canvas = ({
  objects,
  selectedId,
  onSelectObject,
  onUpdateObject,
  zoom = 1,
  viewportRef,
}) => {
  const {
    moveableRef,
    selectedObject,
    setTargetRef,
    targetRefs,
    updateMoveableRect,
    handleDrag,
    handleResize,
    handleRotate,
  } = useCanvasInteractions({ objects, selectedId, zoom, onUpdateObject })

  return (
    <CanvasWrapper>
      <CanvasArea
        data-testid="canvas-area"
        ref={viewportRef}
        onClick={() => onSelectObject(null)}
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
                  onSelectObject(object.id)
                }}
              >
                {object.type === 'text' ? (
                  <ObjectText>{object.text}</ObjectText>
                ) : (
                  <ShapeBox style={{ background: object.color }} />
                )}
              </CanvasObject>
            ))}
          </PageSurface>
        </Workspace>

        {selectedObject && (
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
