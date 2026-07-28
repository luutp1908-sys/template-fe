export type EditorTypeCode = 'graphic' | 'document' | 'whiteboard' | 'form'

export interface EditorTypeOption {
  id: number
  type: EditorTypeCode
}

export const EDITOR_TYPES: EditorTypeOption[] = [
  { id: 0, type: 'graphic' },
  { id: 1, type: 'document' },
  { id: 2, type: 'whiteboard' },
  { id: 3, type: 'form' },
]

export const DEFAULT_EDITOR_TYPE_ID = 0

export const EDITOR_TYPE_LABELS: Record<number, string> = {
  0: 'Graphic',
  1: 'Document',
  2: 'Whiteboard',
  3: 'Form',
}

export function normalizeEditorTypeId(value: unknown): number {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value
  }

  const numeric = Number(value)
  if (Number.isInteger(numeric)) {
    return numeric
  }

  return DEFAULT_EDITOR_TYPE_ID
}