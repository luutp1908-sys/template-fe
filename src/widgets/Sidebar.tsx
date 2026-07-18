import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import styled from 'styled-components'
import { SIDEBAR_WIDTH } from '../shared/constants/layout'
import type { EditorObject } from '../shared/types/editor'
import { STOCK_IMAGES } from '../shared/constants/stockImages'
import {
  DEFAULT_IMAGE_CORNER_RADIUS,
  DEFAULT_IMAGE_FIT_MODE,
  DEFAULT_IMAGE_OPACITY,
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

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.85rem;
  color: #1a1a1a;
`

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
`

const ActionButton = styled.button`
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 8px;
  cursor: pointer;
`

const StockPanel = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`

const StockCard = styled.button`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0;
  overflow: hidden;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
`

const StockThumb = styled.img`
  width: 100%;
  height: 72px;
  object-fit: cover;
  display: block;
`

const StockMeta = styled.div`
  padding: 6px;

  strong {
    display: block;
    font-size: 0.72rem;
    color: #111827;
    margin-bottom: 2px;
  }

  span {
    font-size: 0.66rem;
    color: #6b7280;
  }
`

export const Sidebar = ({
  selectedObject,
  objects,
  onSelectObject,
  onDeleteObject,
  onUpdateObject,
}: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [showStockPanel, setShowStockPanel] = useState(false)

  const handleLayerUpdate = (updates: Partial<EditorObject>) => {
    if (!selectedObject) return
    onUpdateObject(selectedObject.id, updates)
  }

  const handleTextUpdate = (updates: Partial<EditorObject>) => {
    if (!selectedObject || selectedObject.type !== 'text') return
    handleLayerUpdate(updates)
  }

  const handleImageUpdate = (updates: Partial<EditorObject>) => {
    if (!selectedObject || selectedObject.type !== 'image') return
    handleLayerUpdate(updates)
  }

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedObject || selectedObject.type !== 'image') return
    if (!file.type.startsWith('image/')) return

    const objectUrl = URL.createObjectURL(file)
    handleImageUpdate({ src: objectUrl })
    setShowStockPanel(false)
    event.target.value = ''
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
                {obj.type === 'text' ? '📄' : obj.type === 'image' ? '🖼️' : '⬜'}
              </LayerIcon>
              <LayerName>
                {obj.type === 'text' ? 'Text' : obj.type === 'image' ? 'Image' : 'Shape'} {index + 1}
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

          <PropertyGroup>
            <label>Layer</label>
            <ToggleRow htmlFor="layer-visible">
              Visible
              <input
                id="layer-visible"
                aria-label="Layer Visible"
                type="checkbox"
                checked={selectedObject.visible ?? true}
                onChange={(e) => handleLayerUpdate({ visible: e.target.checked })}
              />
            </ToggleRow>
            <ToggleRow htmlFor="layer-locked">
              Locked
              <input
                id="layer-locked"
                aria-label="Layer Locked"
                type="checkbox"
                checked={selectedObject.locked ?? false}
                onChange={(e) => handleLayerUpdate({ locked: e.target.checked })}
              />
            </ToggleRow>
          </PropertyGroup>

          <PropertyGroup>
            <label htmlFor="layer-z-index">Layer Order</label>
            <PropertyInput
              id="layer-z-index"
              aria-label="Layer Z-Index"
              type="number"
              value={selectedObject.zIndex ?? 0}
              onChange={(e) => {
                handleLayerUpdate({ zIndex: Number(e.target.value) || 0 })
              }}
            />
          </PropertyGroup>

          {selectedObject.type === 'image' && (
            <>
              <PropertyGroup>
                <label>Image Source</label>
                <ActionRow>
                  <ActionButton
                    type="button"
                    title="Replace image"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </ActionButton>
                  <ActionButton
                    type="button"
                    title="Browse stock images"
                    aria-label="Browse Stock"
                    onClick={() => setShowStockPanel((current) => !current)}
                  >
                    Stock
                  </ActionButton>
                </ActionRow>

                {showStockPanel && (
                  <StockPanel>
                    {STOCK_IMAGES.map((image) => (
                      <StockCard
                        key={image.id}
                        type="button"
                        aria-label={`Stock ${image.title}`}
                        onClick={() => {
                          handleImageUpdate({ src: image.url })
                          setShowStockPanel(false)
                        }}
                      >
                        <StockThumb src={image.url} alt={image.title} />
                        <StockMeta>
                          <strong>{image.title}</strong>
                          <span>{image.attribution}</span>
                        </StockMeta>
                      </StockCard>
                    ))}
                  </StockPanel>
                )}

                <input
                  ref={fileInputRef}
                  aria-label="Image File Input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />
              </PropertyGroup>

              <PropertyGroup>
                <label htmlFor="image-fit-mode">Fit Mode</label>
                <PropertySelect
                  id="image-fit-mode"
                  aria-label="Image Fit Mode"
                  value={selectedObject.fitMode ?? DEFAULT_IMAGE_FIT_MODE}
                  onChange={(e) => {
                    handleImageUpdate({ fitMode: e.target.value === 'cover' ? 'cover' : 'contain' })
                  }}
                >
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                </PropertySelect>
              </PropertyGroup>

              <PropertyGroup>
                <label htmlFor="image-opacity">Opacity</label>
                <PropertyInput
                  id="image-opacity"
                  aria-label="Image Opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedObject.opacity ?? DEFAULT_IMAGE_OPACITY}
                  onChange={(e) => {
                    handleImageUpdate({ opacity: Number(e.target.value) || DEFAULT_IMAGE_OPACITY })
                  }}
                />
              </PropertyGroup>

              <PropertyGroup>
                <label htmlFor="image-corner-radius">Corner Radius</label>
                <PropertyInput
                  id="image-corner-radius"
                  aria-label="Image Corner Radius"
                  type="number"
                  min={0}
                  max={400}
                  value={selectedObject.cornerRadius ?? DEFAULT_IMAGE_CORNER_RADIUS}
                  onChange={(e) => {
                    handleImageUpdate({
                      cornerRadius: Math.max(0, Number(e.target.value) || DEFAULT_IMAGE_CORNER_RADIUS),
                    })
                  }}
                />
              </PropertyGroup>
            </>
          )}

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
