export type EditorObjectType = 'rect' | 'text' | 'image'

export interface EditorObject {
  id: number
  type: EditorObjectType
  x: number
  y: number
  width: number
  height: number
  rotate: number
  color?: string
  text?: string
  src?: string
}

export type ActiveTool = 'element' | 'text' | 'image' | null

export interface FitZoomInput {
  viewportWidth: number
  viewportHeight: number
  pageWidth: number
  pageHeight: number
  padding?: number
}
