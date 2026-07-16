import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import Moveable from 'react-moveable'

const PAGE_WIDTH = 1200
const PAGE_HEIGHT = 800

const CanvasWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f8fc;
  overflow: hidden;
`

const CanvasArea = styled.div`
  position: relative;
  flex: 1;
  overflow: auto;
  background: #eef2f7;
`

const Workspace = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${PAGE_WIDTH + 480}px;
  min-height: ${PAGE_HEIGHT + 320}px;
  padding: 160px 240px;
`

const BackdropGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(133, 146, 166, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(133, 146, 166, 0.16) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`

const PageSurface = styled.div`
  position: relative;
  width: ${PAGE_WIDTH}px;
  height: ${PAGE_HEIGHT}px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 18px 45px rgba(19, 35, 65, 0.12), 0 2px 8px rgba(19, 35, 65, 0.08);
  overflow: hidden;
`

const CanvasObject = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  ${(props) => props.selected && `
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
  `}
`

const ObjectText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
  padding: 8px;
  text-align: center;
`

const ShapeBox = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
`

export const Canvas = ({ objects, selectedId, onSelectObject, onUpdateObject }) => {
  const targetRefs = useRef({})
  const moveableRef = useRef(null)

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  useEffect(() => {
    if (!selectedObject) return

    const frame = requestAnimationFrame(() => {
      moveableRef.current?.updateRect()
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedObject])

  return (
    <CanvasWrapper>
      <CanvasArea data-testid="canvas-area" onClick={() => onSelectObject(null)}>
        <Workspace>
          <BackdropGrid />

          <PageSurface data-testid="page-surface">
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
              target.style.left = `${left}px`
              target.style.top = `${top}px`
              onUpdateObject(selectedId, { x: left, y: top })
            }}
            onDragEnd={() => {
              moveableRef.current?.updateRect()
            }}
            onResize={({ target, width, height, left, top }) => {
              target.style.width = `${width}px`
              target.style.height = `${height}px`
              target.style.left = `${left}px`
              target.style.top = `${top}px`
              onUpdateObject(selectedId, { width, height, x: left, y: top })
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
