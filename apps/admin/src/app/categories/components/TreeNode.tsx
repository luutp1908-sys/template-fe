import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectCategoryById, selectSelectedId } from '../store/selectors'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { setSelected } from '../store/categories.slice'

export default function TreeNode({ id, depth, hasChildren, isExpanded, onToggle }: { id: string; depth: number; hasChildren: boolean; isExpanded: boolean; onToggle: () => void }) {
  const dispatch = useAppDispatch()
  const category = useAppSelector((s) => selectCategoryById(s, id as any))
  const selectedId = useAppSelector(selectSelectedId as any)
  const isSelected = selectedId === id
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: 8 + depth * 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties

  if (!category) return null

  const interactiveStyle: React.CSSProperties = {
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: 8,
    background: isSelected ? 'linear-gradient(120deg, #d6f5f0, #dbeafe)' : 'transparent',
    border: isSelected ? '1px solid rgba(12, 98, 114, 0.25)' : '1px solid transparent',
    fontWeight: isSelected ? 700 : 500,
    outline: 'none',
  }

  function handleSelect() {
    dispatch(setSelected(id))
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={depth + 1}
      {...attributes}
    >
      {hasChildren ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggle()
          }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▾' : '▸'}
        </button>
      ) : (
        <span style={{ width: 20 }} />
      )}
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${category.name}`}
        style={{
          cursor: 'grab',
          border: '1px solid rgba(26, 33, 49, 0.14)',
          borderRadius: 6,
          background: '#fff',
          width: 24,
          height: 24,
          lineHeight: '20px',
          color: '#637186',
          fontSize: 14,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        ≡
      </button>
      <div
        style={interactiveStyle}
        aria-label={`Select ${category.name}`}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleSelect()
          }
        }}
        tabIndex={0}
      >
        {category.name}
      </div>
    </div>
  )
}
