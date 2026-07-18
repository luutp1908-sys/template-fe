export type LayerType = 'rect' | 'text' | 'image' | 'frame'

export interface BaseLayer {
  id: number
  type: LayerType
  x: number
  y: number
  width: number
  height: number
  rotate: number
  visible?: boolean
  locked?: boolean
  zIndex?: number
}

export interface RectLayer extends BaseLayer {
  type: 'rect'
  color?: string
}

export type TextAlign = 'left' | 'center' | 'right'
export type TextWeight = 'normal' | 'bold'

export interface TextLayer extends BaseLayer {
  type: 'text'
  text?: string
  textColor?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: TextWeight
  textAlign?: TextAlign
  lineHeight?: number
  wrapMode?: 'fixed'
}

export interface ImageLayer extends BaseLayer {
  type: 'image'
  src?: string
  fitMode?: 'contain' | 'cover'
  opacity?: number
  cornerRadius?: number
}

export interface FrameLayer extends BaseLayer {
  type: 'frame'
  borderColor?: string
  borderWidth?: number
}

export type Layer = RectLayer | TextLayer | ImageLayer | FrameLayer

export type EditorObjectType = LayerType
export type EditorObject = Layer

export type ActiveTool = 'element' | 'text' | 'image' | 'frame' | null

export interface FitZoomInput {
  viewportWidth: number
  viewportHeight: number
  pageWidth: number
  pageHeight: number
  padding?: number
}
