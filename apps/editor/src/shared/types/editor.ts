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

export interface Size {
  width: number
  height: number
}

export type Point = [number, number]

export interface CropImage {
  width: number
  height: number
  translate: Point
}

export type ColorConfig = Record<string, string>

export interface ImageConfig {
  size: Size;

  width: number;
  height: number;

  translate: Point;
  rotate: number;

  url: string;
  sourceId?: string;

  tagNames: string[];
  tags?: string[];

  colorConfig: ColorConfig;

  cropImage: CropImage;

  scaleX?: number;
  scaleY?: number;

  replaced?: boolean;
  isPro?: boolean;

  isLoading: boolean;
  isLocked: boolean;
}

export interface RectLayer extends BaseLayer {
  type: 'rect'
  color?: string
}

export type FrameShape = 'rect' | 'circle' | 'heart' | 'phone'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'
export type TextWeight = 'normal' | 'bold'

export interface TextConfig {
  // Content
  value: string;
  type: 'text-box' | string;

  // Size
  width: string;
  height: string;

  // Transform
  translate: Point;
  rotate: number;

  // Typography
  fontFamily: string;
  fontSize: string;
  fontColor: string;

  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number | string;
  letterSpacing: number | string;

  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isCapital?: boolean;

  // Metadata
  presentationType: string;
  colorPaletteType: string | null;
  externalFontUrl: string | null;
  isLogoQrCode: boolean;
}

// keep legacy flat fields for backward compatibility; prefer `textConfig` in new code
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
  textConfig?: TextConfig
}

export interface ImageLayer extends BaseLayer {
  type: 'image'
  imageConfig?: ImageConfig
  opacity?: number
  cornerRadius?: number
  fitMode?: 'contain' | 'cover'
}

export interface FrameLayer extends BaseLayer {
  type: 'frame'
  borderColor?: string
  borderWidth?: number
  shape?: FrameShape
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

export interface PageBackgroundImage {
  src: string
  fit?: 'cover' | 'contain' | 'stretch'
  position?: string
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  opacity?: number
}

export interface PageBackground {
  color?: string
  image?: PageBackgroundImage
  overlay?: { color?: string }
}

export interface Page {
  id: string
  width: number
  height: number
  background?: PageBackground
  layers: Layer[]
}

export interface BlockConfig {
  width: string
  height: string
  backgroundImg: string
}

export interface Block {
  uuid: string
  config: BlockConfig
  layers: Layer[]
}

export interface TemplateContent {
  id?: string
  title?: string
  thumbnail?: string
  metadata?: Record<string, any>
  // new primary field
  blocks?: Block[]
  // keep pages for backwards compatibility
  pages?: Page[]
}
