import type { EditorObject } from '../../shared/types/editor'
import { InlineToolbar, ToolbarButton } from './Canvas.styles'

type InlineObjectToolbarProps = {
  selectedObject: EditorObject
  onDuplicateObject: (id: number) => void
  onDeleteObject: (id: number) => void
  onToggleObjectLock: (id: number) => void
  onDownloadTemplate: () => void
}

export const InlineObjectToolbar = ({
  selectedObject,
  onDuplicateObject,
  onDeleteObject,
  onToggleObjectLock,
  onDownloadTemplate,
}: InlineObjectToolbarProps) => {
  return (
    <InlineToolbar
      data-testid="inline-toolbar"
      aria-label="Inline Toolbar"
      style={{
        left: selectedObject.x + selectedObject.width / 2,
        top: Math.max(10, selectedObject.y - 10),
        transform: 'translate(-50%, -100%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ToolbarButton
        type="button"
        aria-label="Duplicate Selected"
        onClick={() => onDuplicateObject(selectedObject.id)}
      >
        Duplicate
      </ToolbarButton>
      <ToolbarButton
        type="button"
        aria-label="Delete Selected"
        onClick={() => onDeleteObject(selectedObject.id)}
      >
        Delete
      </ToolbarButton>
      <ToolbarButton
        type="button"
        aria-label={selectedObject.locked ? 'Unlock Selected' : 'Lock Selected'}
        onClick={() => onToggleObjectLock(selectedObject.id)}
      >
        {selectedObject.locked ? 'Unlock' : 'Lock'}
      </ToolbarButton>
      <ToolbarButton
        type="button"
        aria-label="Download Template"
        onClick={onDownloadTemplate}
        className='download-template-button'
      >
        Download Template
      </ToolbarButton>
    </InlineToolbar>
  )
}