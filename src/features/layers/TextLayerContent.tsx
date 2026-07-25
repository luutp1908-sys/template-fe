import { EditableText, ObjectText } from '../canvas/Canvas.styles'
import type { TextLayer } from '../../shared/types/editor'
import type { TextEditingHandlers } from './LayerRenderer.types'

type TextLayerContentProps = {
  object: TextLayer
} & Omit<TextEditingHandlers, 'onEnterTextEdit'>

export const TextLayerContent = ({
  object,
  editingId,
  draftText,
  textAreaRef,
  setDraftText,
  onCommitTextEdit,
  onCancelTextEdit,
}: TextLayerContentProps) => {
  if (editingId === object.id) {
    return (
      <EditableText
        ref={textAreaRef}
        aria-label="Text Editor"
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        onBlur={onCommitTextEdit}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            onCancelTextEdit()
          }
        }}
        $fontSize={object.fontSize}
        $fontWeight={object.fontWeight}
        $textAlign={object.textAlign}
        $textColor={object.textColor}
        $lineHeight={object.lineHeight}
        $fontFamily={object.fontFamily}
      />
    )
  }

  return (
    <ObjectText
      $fontSize={object.fontSize}
      $fontWeight={object.fontWeight}
      $textAlign={object.textAlign}
      $textColor={object.textColor}
      $lineHeight={object.lineHeight}
      $fontFamily={object.fontFamily}
    >
      {object.text}
    </ObjectText>
  )
}

export default TextLayerContent
