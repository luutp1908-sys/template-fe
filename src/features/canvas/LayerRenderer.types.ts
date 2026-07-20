import type { RefObject } from 'react'
import type { EditorObject } from '../../shared/types/editor'
import type { ImageLoadStatus } from './useCanvasImageLifecycle'

export type TextEditingHandlers = {
  editingId: number | null
  draftText: string
  textAreaRef: RefObject<HTMLTextAreaElement | null>
  setDraftText: (value: string) => void
  onCommitTextEdit: () => void
  onCancelTextEdit: () => void
  onEnterTextEdit: (object: EditorObject) => void
}

export type ImageLifecycleHandlers = {
  imageLoadStates: Record<number, ImageLoadStatus>
  imageRetryTokens: Record<number, number>
  onImageLoad: (id: number) => void
  onImageError: (id: number) => void
  onImageRetry: (id: number) => void
}

export type LayerRendererProps = {
  object: EditorObject
  selected: boolean
  setTargetRef: (id: number, node: HTMLDivElement | null) => void
  textEditing: TextEditingHandlers
  imageLifecycle: ImageLifecycleHandlers
  onSelectObject: (id: number) => void
}