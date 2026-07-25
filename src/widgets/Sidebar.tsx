import styled from 'styled-components'
import { SIDEBAR_WIDTH } from '../shared/constants/layout'
import type { EditorObject } from '../shared/types/editor'
import { STOCK_IMAGES } from '../shared/constants/stockImages'

type SidebarPanel = 'none' | 'image' | 'background' | 'layers'

type SidebarProps = {
  selectedObject?: EditorObject
  objects: EditorObject[]
  onSelectObject: (id: number) => void
  onDeleteObject: (id: number) => void
  panel?: SidebarPanel
  backgroundColor?: string
  onChangeBackgroundColor?: (color: string) => void
  onSelectStockImage?: (src: string) => void
  onSelectBackgroundImage?: (src: string) => void
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

const BackgroundPanel = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
`

const BackgroundPickerLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.8rem;
  color: #1f2937;
  font-weight: 600;

  input {
    width: 40px;
    height: 28px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    padding: 0;
    background: #ffffff;
  }
`

const StockPanel = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
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

export const Sidebar = ({
  selectedObject,
  objects,
  onSelectObject,
  onDeleteObject,
  panel = 'none',
  backgroundColor = '#ffffff',
  onChangeBackgroundColor,
  onSelectStockImage,
  onSelectBackgroundImage,
}: SidebarProps) => {
  const showImageStockPanel = panel === 'image'
  const showBackgroundPanel = panel === 'background'
  const showStockPanel = showImageStockPanel || showBackgroundPanel

  return (
    <StyledSidebar>
      <SidebarHeader>
        <h3>Layers</h3>
        <LayerCount>{objects.length}</LayerCount>
      </SidebarHeader>

      {showBackgroundPanel && (
        <BackgroundPanel aria-label="Background Sidebar">
          <BackgroundPickerLabel htmlFor="sidebar-background-color">
            Background Color
            <input
              id="sidebar-background-color"
              type="color"
              aria-label="Background Sidebar Color"
              value={backgroundColor}
              onChange={(e) => onChangeBackgroundColor?.(e.target.value)}
            />
          </BackgroundPickerLabel>
        </BackgroundPanel>
      )}

      {showStockPanel && (
        <StockPanel aria-label={showImageStockPanel ? 'Left Stock Panel' : 'Background Stock Panel'}>
          {STOCK_IMAGES.map((image) => (
            <StockCard
              key={image.id}
              type="button"
              aria-label={`Stock ${image.title}`}
              onClick={() => {
                if (showImageStockPanel) {
                  onSelectStockImage?.(image.url)
                  return
                }
                onSelectBackgroundImage?.(image.url)
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
    </StyledSidebar>
  )
}
