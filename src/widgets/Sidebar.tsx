import styled from 'styled-components'
import { SIDEBAR_WIDTH } from '../shared/constants/layout'
import type { EditorObject } from '../shared/types/editor'
import {
  DEFAULT_TEXT_ALIGN,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_TEXT_FONT_WEIGHT,
} from '../shared/constants/editorGeometry'

type SidebarProps = {
  selectedObject?: EditorObject
  objects: EditorObject[]
  onSelectObject: (id: number) => void
  onDeleteObject: (id: number) => void
  onUpdateObject: (id: number, updates: Partial<EditorObject>) => void
}

const StyledSidebar = styled.div`
  width: ${SIDEBAR_WIDTH}px;
  height: 100%;
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

const LayerItem = styled.div<{ active: boolean }>`
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

const PropertyInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #1a1a1a;
  background: #ffffff;
`

const PropertySelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #1a1a1a;
  background: #ffffff;
`

const AlignButtonRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`

const AlignButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#0066cc' : '#d1d5db')};
  background: ${({ $active }) => ($active ? '#e3f0ff' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#0066cc' : '#1a1a1a')};
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 4px;
`

export const Sidebar = ({
  selectedObject,
  objects,
  onSelectObject,
  onDeleteObject,
  onUpdateObject,
}: SidebarProps) => {
  const handleTextUpdate = (updates: Partial<EditorObject>) => {
    if (!selectedObject || selectedObject.type !== 'text') return
    onUpdateObject(selectedObject.id, updates)
  }

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

          {selectedObject.type === 'text' && (
            <>
              <PropertyGroup>
                <label htmlFor="text-font-size">Font Size</label>
                <PropertyInput
                  id="text-font-size"
                  aria-label="Font Size"
                  type="number"
                  min={8}
                  max={200}
                  value={selectedObject.fontSize ?? DEFAULT_TEXT_FONT_SIZE}
                  onChange={(e) => {
                    handleTextUpdate({ fontSize: Number(e.target.value) || DEFAULT_TEXT_FONT_SIZE })
                  }}
                />
              </PropertyGroup>

              <PropertyGroup>
                <label htmlFor="text-font-weight">Font Weight</label>
                <PropertySelect
                  id="text-font-weight"
                  aria-label="Font Weight"
                  value={selectedObject.fontWeight ?? DEFAULT_TEXT_FONT_WEIGHT}
                  onChange={(e) => {
                    handleTextUpdate({ fontWeight: e.target.value === 'bold' ? 'bold' : 'normal' })
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </PropertySelect>
              </PropertyGroup>

              <PropertyGroup>
                <label>Alignment</label>
                <AlignButtonRow>
                  <AlignButton
                    type="button"
                    aria-label="Align Left"
                    $active={(selectedObject.textAlign ?? DEFAULT_TEXT_ALIGN) === 'left'}
                    onClick={() => handleTextUpdate({ textAlign: 'left' })}
                  >
                    Left
                  </AlignButton>
                  <AlignButton
                    type="button"
                    aria-label="Align Center"
                    $active={(selectedObject.textAlign ?? DEFAULT_TEXT_ALIGN) === 'center'}
                    onClick={() => handleTextUpdate({ textAlign: 'center' })}
                  >
                    Center
                  </AlignButton>
                  <AlignButton
                    type="button"
                    aria-label="Align Right"
                    $active={(selectedObject.textAlign ?? DEFAULT_TEXT_ALIGN) === 'right'}
                    onClick={() => handleTextUpdate({ textAlign: 'right' })}
                  >
                    Right
                  </AlignButton>
                </AlignButtonRow>
              </PropertyGroup>

              <PropertyGroup>
                <label htmlFor="text-color">Text Color</label>
                <PropertyInput
                  id="text-color"
                  aria-label="Text Color"
                  type="color"
                  value={selectedObject.textColor ?? DEFAULT_TEXT_COLOR}
                  onChange={(e) => {
                    handleTextUpdate({ textColor: e.target.value })
                  }}
                />
              </PropertyGroup>
            </>
          )}
        </PropertiesPanel>
      )}
    </StyledSidebar>
  )
}
