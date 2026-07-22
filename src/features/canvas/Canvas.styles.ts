import styled from 'styled-components'
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  WORKSPACE_PADDING,
} from '../../shared/constants/editorGeometry'

export const CanvasWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: #f5f8fc;
  overflow: hidden;
`

export const CanvasArea = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: auto;
  background: #eef2f7;
`

export const Workspace = styled.div<{ $zoom?: number; $pageWidth?: number; $pageHeight?: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ $zoom = 1, $pageWidth = PAGE_WIDTH }) => $pageWidth * $zoom + WORKSPACE_PADDING * 2}px;
  min-height: ${({ $zoom = 1, $pageHeight = PAGE_HEIGHT }) => $pageHeight * $zoom + WORKSPACE_PADDING * 2}px;
  padding: ${WORKSPACE_PADDING}px;
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

export const PageSurface = styled.div<{
  $zoom?: number
  $backgroundColor?: string
  $backgroundImage?: string
  $pageWidth?: number
  $pageHeight?: number
}>`
  position: relative;
  width: ${({ $pageWidth = PAGE_WIDTH }) => `${$pageWidth}px`};
  height: ${({ $pageHeight = PAGE_HEIGHT }) => `${$pageHeight}px`};
  transform: ${({ $zoom = 1 }) => `scale(${$zoom})`};
  transform-origin: center center;
  background-color: ${({ $backgroundColor = '#ffffff' }) => $backgroundColor};
  background-image: ${({ $backgroundImage }) => ($backgroundImage ? `url(${$backgroundImage})` : 'none')};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  box-shadow: 0 18px 45px rgba(19, 35, 65, 0.12), 0 2px 8px rgba(19, 35, 65, 0.08);
  overflow: hidden;
`

export const CanvasObject = styled.div<{ selected: boolean; $locked?: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: ${({ $locked }) => ($locked ? 'not-allowed' : 'grab')};
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

type ObjectTextProps = {
  $fontSize?: number
  $fontWeight?: 'normal' | 'bold'
  $textAlign?: 'left' | 'center' | 'right'
  $textColor?: string
  $lineHeight?: number
  $fontFamily?: string
}

export const ObjectText = styled.span<ObjectTextProps>`
  width: 100%;
  font-size: ${({ $fontSize = 32 }) => `${$fontSize}px`};
  font-weight: ${({ $fontWeight = 'normal' }) => $fontWeight};
  font-family: ${({ $fontFamily = 'Arial, sans-serif' }) => $fontFamily};
  color: ${({ $textColor = '#1a1a1a' }) => $textColor};
  padding: 8px;
  text-align: ${({ $textAlign = 'left' }) => $textAlign};
  line-height: ${({ $lineHeight = 1.2 }) => $lineHeight};
  overflow-wrap: break-word;
  white-space: pre-wrap;
`

export const EditableText = styled.textarea<ObjectTextProps>`
  width: 100%;
  height: 100%;
  resize: none;
  border: 2px solid #0066cc;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  background: #ffffff;
  font-size: ${({ $fontSize = 32 }) => `${$fontSize}px`};
  font-weight: ${({ $fontWeight = 'normal' }) => $fontWeight};
  font-family: ${({ $fontFamily = 'Arial, sans-serif' }) => $fontFamily};
  color: ${({ $textColor = '#1a1a1a' }) => $textColor};
  padding: 8px;
  text-align: ${({ $textAlign = 'left' }) => $textAlign};
  line-height: ${({ $lineHeight = 1.2 }) => $lineHeight};
  overflow: hidden;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`

type CanvasImageContainerProps = {
  $opacity?: number
  $cornerRadius?: number
}

export const CanvasImageContainer = styled.div<CanvasImageContainerProps>`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2f7;
  opacity: ${({ $opacity = 1 }) => $opacity};
  border-radius: ${({ $cornerRadius = 0 }) => `${$cornerRadius}px`};
  overflow: hidden;
`

type CanvasImageProps = {
  $fitMode?: 'contain' | 'cover'
}

export const CanvasImage = styled.img<CanvasImageProps>`
  width: 100%;
  height: 100%;
  object-fit: ${({ $fitMode = 'contain' }) => $fitMode};
  user-select: none;
  -webkit-user-drag: none;
`

export const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
  text-align: center;
  font-size: 0.85rem;
  color: #4b5563;
  background: repeating-linear-gradient(
    -45deg,
    #f3f4f6,
    #f3f4f6 8px,
    #e5e7eb 8px,
    #e5e7eb 16px
  );
`

export const ImageErrorPlaceholder = styled(ImagePlaceholder)`
  flex-direction: column;
  gap: 8px;
  color: #b91c1c;
  background: #fee2e2;
`

export const RetryButton = styled.button`
  border: none;
  border-radius: 6px;
  background: #b91c1c;
  color: #ffffff;
  padding: 6px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
`

export const ShapeBox = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
`

export const InlineToolbar = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 8px;
  background: rgba(17, 24, 39, 0.95);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  z-index: 2000;
`

export const ToolbarButton = styled.button`
  border: none;
  border-radius: 6px;
  background: #1f2937;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;

  &:hover {
    background: #374151;
  }
`

export { PAGE_WIDTH, PAGE_HEIGHT, WORKSPACE_PADDING }