import './Sidebar.css'

export const Sidebar = ({ selectedObject, objects, onSelectObject, onDeleteObject }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Layers</h3>
        <span className="layer-count">{objects.length}</span>
      </div>

      <div className="layers-list">
        {objects.length === 0 ? (
          <p className="empty-message">No objects yet</p>
        ) : (
          objects.map((obj, index) => (
            <div
              key={obj.id}
              className={`layer-item ${selectedObject?.id === obj.id ? 'active' : ''}`}
              onClick={() => onSelectObject(obj.id)}
            >
              <span className="layer-icon">
                {obj.type === 'text' ? '📄' : '⬜'}
              </span>
              <span className="layer-name">
                {obj.type === 'text' ? 'Text' : 'Shape'} {index + 1}
              </span>
              <button
                className="layer-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteObject(obj.id)
                }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {selectedObject && (
        <div className="properties-panel">
          <h4>Properties</h4>
          <div className="property-group">
            <label>Type</label>
            <p>{selectedObject.type}</p>
          </div>
          <div className="property-group">
            <label>Position</label>
            <p>X: {Math.round(selectedObject.x)}px</p>
            <p>Y: {Math.round(selectedObject.y)}px</p>
          </div>
          <div className="property-group">
            <label>Size</label>
            <p>W: {selectedObject.width}px</p>
            <p>H: {selectedObject.height}px</p>
          </div>
          <div className="property-group">
            <label>Rotation</label>
            <p>{Math.round(selectedObject.rotate)}°</p>
          </div>
        </div>
      )}
    </div>
  )
}
