import React from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectCategoryById } from '../store/selectors'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TreeNode({ id, depth, hasChildren, isExpanded, onToggle }: { id: string; depth: number; hasChildren: boolean; isExpanded: boolean; onToggle: () => void }) {
  const category = useAppSelector((s) => selectCategoryById(s, id as any))
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: 8 + depth * 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties

  if (!category) return null

  return (
    <div ref={setNodeRef} style={style} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-level={depth + 1} {...attributes}>
      {hasChildren ? (
        <button onClick={onToggle} aria-label={isExpanded ? 'Collapse' : 'Expand'}>{isExpanded ? '▾' : '▸'}</button>
      ) : (
        <span style={{ width: 20 }} />
      )}
      <div {...listeners} style={{ cursor: 'grab', padding: '4px 8px', borderRadius: 4 }} aria-label={`Drag ${category.name}`}>
        {category.name}
      </div>
    </div>
  )
}
