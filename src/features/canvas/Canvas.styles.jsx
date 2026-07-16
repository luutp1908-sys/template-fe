import styled from 'styled-components'

export const PAGE_WIDTH = 1200
export const PAGE_HEIGHT = 800

export const CanvasWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f8fc;
  overflow: hidden;
`

export const CanvasArea = styled.div`
  position: relative;
  flex: 1;
  overflow: auto;
  background: #eef2f7;
`

export const Workspace = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ $zoom = 1 }) => PAGE_WIDTH * $zoom + 480}px;
  min-height: ${({ $zoom = 1 }) => PAGE_HEIGHT * $zoom + 320}px;
  padding: 160px 240px;
`

export const BackdropGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(133, 146, 166, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(133, 146, 166, 0.16) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`

export const PageSurface = styled.div`
  position: relative;
  width: ${PAGE_WIDTH}px;
  height: ${PAGE_HEIGHT}px;
  transform: ${({ $zoom = 1 }) => `scale(${$zoom})`};
  transform-origin: center center;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 18px 45px rgba(19, 35, 65, 0.12), 0 2px 8px rgba(19, 35, 65, 0.08);
  overflow: hidden;
`

export const CanvasObject = styled.div`
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

export const ObjectText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
  padding: 8px;
  text-align: center;
`

export const ShapeBox = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
`