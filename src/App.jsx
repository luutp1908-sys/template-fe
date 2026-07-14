import { useRef, useState } from 'react'
import Moveable from 'react-moveable'
import './App.css'

const initialObjects = [
  {
    id: 1,
    type: 'rect',
    x: 90,
    y: 80,
    width: 180,
    height: 120,
    rotate: 0,
    color: '#6366f1',
  },
  {
    id: 2,
    type: 'text',
    x: 320,
    y: 180,
    width: 220,
    height: 90,
    rotate: -6,
    text: 'Your design',
    color: '#111827',
  },
]

function App() {
  const [objects, setObjects] = useState(initialObjects)
  const [selectedId, setSelectedId] = useState(1)
  const targetRefs = useRef({})

  const selectedObject = objects.find((object) => object.id === selectedId)

  const updateObject = (id, updates) => {
    setObjects((current) =>
      current.map((object) => (object.id === id ? { ...object, ...updates } : object)),
    )
  }

  const addShape = () => {
    const newId = Date.now()
    const newShape = {
      id: newId,
      type: 'rect',
      x: 120,
      y: 120,
      width: 140,
      height: 100,
      rotate: 0,
      color: '#14b8a6',
    }

    setObjects((current) => [...current, newShape])
    setSelectedId(newId)
  }

  const addText = () => {
    const newId = Date.now() + 1
    const newText = {
      id: newId,
      type: 'text',
      x: 150,
      y: 250,
      width: 220,
      height: 90,
      rotate: 0,
      text: 'New text',
      color: '#111827',
    }

    setObjects((current) => [...current, newText])
    setSelectedId(newId)
  }

  const deleteSelected = () => {
    if (!selectedObject) return

    const remaining = objects.filter((object) => object.id !== selectedId)
    setObjects(remaining)
    setSelectedId(remaining[0]?.id ?? null)
  }

  return (
    <div className="editor-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Design Studio</p>
          <h1>Graphic Editor</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="secondary-btn" onClick={addShape}>
            Add shape
          </button>
          <button type="button" className="secondary-btn" onClick={addText}>
            Add text
          </button>
          <button type="button" className="primary-btn" onClick={deleteSelected}>
            Delete selected
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="tools-panel">
          <h2>Tools</h2>
          <p>Pick an element, then drag, resize, or rotate it.</p>
          <ul>
            <li>Text</li>
            <li>Shapes</li>
            <li>Images</li>
          </ul>
        </aside>

        <main className="canvas-panel">
          <div className="canvas-toolbar">
            <span>Canvas</span>
            <span>{objects.length} items</span>
          </div>

          <div className="canvas-area" onClick={() => setSelectedId(null)}>
            <div className="canvas-grid" />

            {objects.map((object) => (
              <div
                key={object.id}
                ref={(node) => {
                  if (node) {
                    targetRefs.current[object.id] = node
                  } else {
                    delete targetRefs.current[object.id]
                  }
                }}
                className={`canvas-object ${selectedId === object.id ? 'selected' : ''}`}
                style={{
                  left: object.x,
                  top: object.y,
                  width: object.width,
                  height: object.height,
                  transform: `rotate(${object.rotate}deg)`,
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedId(object.id)
                }}
              >
                {object.type === 'text' ? (
                  <span>{object.text}</span>
                ) : (
                  <div className="shape-mark" style={{ background: object.color }} />
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
                  updateObject(selectedId, { x: left, y: top })
                }}
                onResize={({ target, width, height, left, top }) => {
                  target.style.width = `${width}px`
                  target.style.height = `${height}px`
                  target.style.left = `${left}px`
                  target.style.top = `${top}px`
                  updateObject(selectedId, { width, height, x: left, y: top })
                }}
                onRotate={({ target, rotate }) => {
                  target.style.transform = `rotate(${rotate}deg)`
                  updateObject(selectedId, { rotate })
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
