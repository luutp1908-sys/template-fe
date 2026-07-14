import { useRef } from 'react'
import Moveable from 'react-moveable'
import './Canvas.css'

export const Canvas = ({ objects, selectedId, onSelectObject, onUpdateObject }) => {
  const targetRefs = useRef({})

  const selectedObject = objects.find((obj) => obj.id === selectedId)

  return (
    <div className="canvas-wrapper">
      <div className="canvas-area" onClick={() => onSelectObject(null)}>
        <div className="canvas-grid" />

        {objects.map((object) => (
          <div
            key={object.id}
            ref={(node) => {
              if (node) targetRefs.current[object.id] = node
              else delete targetRefs.current[object.id]
            }}
            className={`canvas-object ${selectedId === object.id ? 'selected' : ''}`}
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
              <span>{object.text}</span>
            ) : (
              <div className="shape-box" style={{ background: object.color }} />
            )}
          </div>
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
      </div>
    </div>
  )
}
