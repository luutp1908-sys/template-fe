import './MenuBar.css'

export const MenuBar = ({ activeTool, onToolSelect, onAddShape, onAddText, onAddImage }) => {
  return (
    <div className="menu-bar">
      <button
        className={`menu-item ${activeTool === 'element' ? 'active' : ''}`}
        onClick={() => onToolSelect('element')}
        title="Elements"
      >
        ⬜
      </button>
      <button
        className={`menu-item ${activeTool === 'text' ? 'active' : ''}`}
        onClick={() => onToolSelect('text')}
        title="Text"
      >
        T
      </button>
      <button
        className={`menu-item ${activeTool === 'image' ? 'active' : ''}`}
        onClick={() => onToolSelect('image')}
        title="Image"
      >
        🖼️
      </button>
      <div className="menu-divider" />
      <button className="menu-item" onClick={onAddShape} title="Add Shape">
        ➕
      </button>
      <button className="menu-item" onClick={onAddText} title="Add Text">
        📝
      </button>
      <button className="menu-item" onClick={onAddImage} title="Add Image">
        📤
      </button>
    </div>
  )
}
