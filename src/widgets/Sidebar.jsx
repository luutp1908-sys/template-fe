import styled from 'styled-components'

const StyledSidebar = styled.div`
  width: 300px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #1a1a1a;
    font-weight: 600;
  }
`

const LayerCount = styled.span`
  background: #e3f0ff;
  color: #0066cc;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`

const LayersList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  padding: 20px;
  margin: 0;
`

const LayerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  background: #f5f8fc;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e3f0ff;
  }

  ${(props) => props.active && `
    background: #0066cc;
    color: white;
  `}
`

const LayerIcon = styled.span`
  font-size: 1.1rem;
  flex-shrink: 0;
`

const LayerName = styled.span`
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
`

const LayerDelete = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
    color: #cc0000;
  }
`

const PropertiesPanel = styled.div`
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;

  h4 {
    margin: 0 0 12px;
    font-size: 0.9rem;
    color: #1a1a1a;
    font-weight: 600;
  }
`

const PropertyGroup = styled.div`
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #0066cc;
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
  }
`

export const Sidebar = ({ selectedObject, objects, onSelectObject, onDeleteObject }) => {
  return (
    <StyledSidebar>
      <SidebarHeader>
        <h3>Layers</h3>
        <LayerCount>{objects.length}</LayerCount>
      </SidebarHeader>

      <LayersList>
        {objects.length === 0 ? (
          <EmptyMessage>No objects yet</EmptyMessage>
        ) : (
          objects.map((obj, index) => (
            <LayerItem
              key={obj.id}
              active={selectedObject?.id === obj.id}
              onClick={() => onSelectObject(obj.id)}
            >
              <LayerIcon>
                {obj.type === 'text' ? '📄' : '⬜'}
              </LayerIcon>
              <LayerName>
                {obj.type === 'text' ? 'Text' : 'Shape'} {index + 1}
              </LayerName>
              <LayerDelete
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteObject(obj.id)
                }}
                title="Delete"
              >
                ✕
              </LayerDelete>
            </LayerItem>
          ))
        )}
      </LayersList>

      {selectedObject && (
        <PropertiesPanel>
          <h4>Properties</h4>
          <PropertyGroup>
            <label>Type</label>
            <p>{selectedObject.type}</p>
          </PropertyGroup>
          <PropertyGroup>
            <label>Position</label>
            <p>X: {Math.round(selectedObject.x)}px</p>
            <p>Y: {Math.round(selectedObject.y)}px</p>
          </PropertyGroup>
          <PropertyGroup>
            <label>Size</label>
            <p>W: {selectedObject.width}px</p>
            <p>H: {selectedObject.height}px</p>
          </PropertyGroup>
          <PropertyGroup>
            <label>Rotation</label>
            <p>{Math.round(selectedObject.rotate)}°</p>
          </PropertyGroup>
        </PropertiesPanel>
      )}
    </StyledSidebar>
  )
}
