import { useEffect, useRef } from 'react'
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

export const Canvas = ({
  objects,
  selectedId,
  onSelectObject,
  onUpdateObject,
  zoom = 1,
  viewportRef,
}) => {
  const targetRefs = useRef({})
  const moveableRef = useRef(null)

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  useEffect(() => {
    if (!selectedObject) return

    const frame = requestAnimationFrame(() => {
      moveableRef.current?.updateRect()
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedObject, zoom])

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
                ref={(node) => {
                  if (node) targetRefs.current[object.id] = node
                  else delete targetRefs.current[object.id]
                }}
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
            onDrag={({ target, left, top }) => {
              const normalizedLeft = left / zoom
              const normalizedTop = top / zoom
              target.style.left = `${left}px`
              target.style.top = `${top}px`
              onUpdateObject(selectedId, { x: normalizedLeft, y: normalizedTop })
            }}
            onDragEnd={() => {
              moveableRef.current?.updateRect()
            }}
            onResize={({ target, width, height, left, top }) => {
              const normalizedWidth = width / zoom
              const normalizedHeight = height / zoom
              const normalizedLeft = left / zoom
              const normalizedTop = top / zoom
              target.style.width = `${width}px`
              target.style.height = `${height}px`
              target.style.left = `${left}px`
              target.style.top = `${top}px`
              onUpdateObject(selectedId, {
                width: normalizedWidth,
                height: normalizedHeight,
                x: normalizedLeft,
                y: normalizedTop,
              })
            }}
            onResizeEnd={() => {
              moveableRef.current?.updateRect()
            }}
            onRotate={({ target, rotate }) => {
              target.style.transform = `rotate(${rotate}deg)`
              onUpdateObject(selectedId, { rotate })
            }}
            onRotateEnd={() => {
              moveableRef.current?.updateRect()
            }}
          />
        )}
      </CanvasArea>
    </CanvasWrapper>
  )
}
