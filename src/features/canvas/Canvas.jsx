import { useRef } from 'react'
import styled from 'styled-components'
import Moveable from 'react-moveable'

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
  background: linear-gradient(45deg, #f9fafb 25%, transparent 25%, transparent 75%, #f9fafb 75%, #f9fafb),
              linear-gradient(45deg, #f9fafb 25%, transparent 25%, transparent 75%, #f9fafb 75%, #f9fafb);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  background-color: white;
`

const CanvasGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(#e5e7eb 1px, transparent 1px),
    linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
  pointer-events: none;
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
  transition: all 0.15s ease;

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

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  return (
    <CanvasWrapper>
      <CanvasArea onClick={() => onSelectObject(null)}>
        <CanvasGrid />

        {objects.map((object) => (
          <CanvasObject
            key={object.id}
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

        {selectedObject && (
          <Moveable
            target={targetRefs.current[selectedId]}
            draggable
            resizable
            rotatable
            keepRatio={false}
            throttleDrag={0}
            throttleResize={0}
            throttleRotate={0}
            onDrag={({ target, left, top }) => {
              target.style.left = `${left}px`
              target.style.top = `${top}px`
              onUpdateObject(selectedId, { x: left, y: top })
            }}
            onResize={({ target, width, height, left, top }) => {
              target.style.width = `${width}px`
              target.style.height = `${height}px`
              target.style.left = `${left}px`
              target.style.top = `${top}px`
              onUpdateObject(selectedId, { width, height, x: left, y: top })
            }}
            onRotate={({ target, rotate }) => {
              target.style.transform = `rotate(${rotate}deg)`
              onUpdateObject(selectedId, { rotate })
            }}
          />
        )}
      </CanvasArea>
    </CanvasWrapper>
  )
}
