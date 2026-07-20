import { CanvasObject } from './Canvas.styles'
import { FrameLayerContent } from './FrameLayerContent'
import { ImageLayerContent } from './ImageLayerContent'
import { RectLayerContent } from './RectLayerContent'
import { TextLayerContent } from './TextLayerContent'
import type {
  ImageLifecycleHandlers,
  LayerRendererProps,
  TextEditingHandlers,
} from './LayerRenderer.types'
import type { EditorObject } from '../../shared/types/editor'

const renderLayerContent = (
  object: EditorObject,
  textEditing: TextEditingHandlers,
  imageLifecycle: ImageLifecycleHandlers,
) => {
  switch (object.type) {
    case 'text':
      return (
        <TextLayerContent
          object={object}
          editingId={textEditing.editingId}
          draftText={textEditing.draftText}
          textAreaRef={textEditing.textAreaRef}
          setDraftText={textEditing.setDraftText}
          onCommitTextEdit={textEditing.onCommitTextEdit}
          onCancelTextEdit={textEditing.onCancelTextEdit}
        />
      )
    case 'image':
      return <ImageLayerContent object={object} {...imageLifecycle} />
    case 'frame':
      return <FrameLayerContent object={object} />
    default:
      return <RectLayerContent object={object} />
  }
}

export const LayerRenderer = ({
  object,
  selected,
  setTargetRef,
  textEditing,
  imageLifecycle,
  onSelectObject,
}: LayerRendererProps) => {
  if (!(object.visible ?? true)) return null

  return (
    <CanvasObject
      data-testid={`canvas-object-${object.id}`}
      ref={(node) => setTargetRef(object.id, node)}
      selected={selected}
      $locked={object.locked ?? false}
      style={{
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        transform: `rotate(${object.rotate}deg)`,
        zIndex: object.zIndex,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelectObject(object.id)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        textEditing.onEnterTextEdit(object)
      }}
    >
      {renderLayerContent(object, textEditing, imageLifecycle)}
    </CanvasObject>
  )
}