import { useEffect, useRef, useState } from 'react'
import type { EditorObject } from '../../shared/types/editor'
import { DEFAULT_TEXT_HEIGHT } from '../../shared/constants/editorGeometry'

type UseCanvasTextEditingInput = {
  objects: EditorObject[]
  zoom: number
  onSelectObject: (id: number | null) => void
  onUpdateObject: (id: number, updates: Partial<EditorObject>) => void
  onAfterEditSettled: () => void
}

export const useCanvasTextEditing = ({
  objects,
  zoom,
  onSelectObject,
  onUpdateObject,
  onAfterEditSettled,
}: UseCanvasTextEditingInput) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftText, setDraftText] = useState('')
  const originalTextRef = useRef('')
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingHeightRef = useRef<number | null>(null)

  const getObjectById = (id: number | null) => objects.find((obj) => obj.id === id)

  useEffect(() => {
    if (editingId === null || !textAreaRef.current) return
    textAreaRef.current.focus()
    textAreaRef.current.select()
  }, [editingId])

  useEffect(() => {
    if (editingId === null || !textAreaRef.current) return
    const object = getObjectById(editingId)
    if (!object || object.type !== 'text') return

    const element = textAreaRef.current
    element.style.height = '0px'
    const nextHeightPx = Math.max(element.scrollHeight, DEFAULT_TEXT_HEIGHT)
    element.style.height = `${nextHeightPx}px`

    const normalizedHeight = nextHeightPx / zoom
    if (Math.abs(object.height - normalizedHeight) < 0.5) return

    pendingHeightRef.current = normalizedHeight
    onUpdateObject(object.id, { height: normalizedHeight })
  }, [draftText, editingId, objects, zoom, onUpdateObject])

  const enterTextEdit = (object: EditorObject) => {
    if (object.type !== 'text' || object.locked) return
    onSelectObject(object.id)
    setEditingId(object.id)
    const text = object.text ?? ''
    originalTextRef.current = text
    setDraftText(text)
  }

  const commitTextEdit = () => {
    if (editingId === null) return
    const pendingHeight = pendingHeightRef.current
    onUpdateObject(editingId, {
      text: draftText,
      ...(pendingHeight !== null ? { height: pendingHeight } : {}),
    })
    pendingHeightRef.current = null
    setEditingId(null)
    requestAnimationFrame(() => {
      onAfterEditSettled()
    })
  }

  const cancelTextEdit = () => {
    if (editingId === null) return
    onUpdateObject(editingId, { text: originalTextRef.current })
    pendingHeightRef.current = null
    setEditingId(null)
    setDraftText(originalTextRef.current)
    requestAnimationFrame(() => {
      onAfterEditSettled()
    })
  }

  const handleCanvasAreaClick = () => {
    if (editingId !== null) {
      commitTextEdit()
      return
    }
    onSelectObject(null)
  }

  const handleObjectClick = (objectId: number) => {
    if (editingId !== null && editingId !== objectId) {
      commitTextEdit()
    }
    onSelectObject(objectId)
  }

  return {
    editingId,
    draftText,
    setDraftText,
    textAreaRef,
    enterTextEdit,
    commitTextEdit,
    cancelTextEdit,
    handleCanvasAreaClick,
    handleObjectClick,
  }
}