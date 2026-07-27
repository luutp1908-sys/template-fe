import React from 'react'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectTreeRootsForEditor, selectCategoriesById, selectChildren, selectExpandedIds } from '../store/selectors'
import { flattenTree, collectDescendantIds } from '../utils/treeUtils'
import TreeNode from './TreeNode'
import { setExpanded, moveCategory } from '../store/categories.slice'

export default function CategoryTree({ editorTypeId = '' }: { editorTypeId?: string }) {
  const dispatch = useAppDispatch()
  const byId = useAppSelector(selectCategoriesById as any)
  const childrenByParent = (useAppSelector((s) => (s as any).categories.childrenByParent) ?? {}) as Record<string | null, string[]>
  const roots = useAppSelector((s) => selectTreeRootsForEditor(s, editorTypeId))
  const expandedIds = useAppSelector(selectExpandedIds as any)

  const flattened = flattenTree(roots, byId, childrenByParent, expandedIds)

  function handleToggle(id: string) {
    dispatch(setExpanded(expandedIds.includes(id) ? expandedIds.filter((x) => x !== id) : [...expandedIds, id]))
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over) return
    const draggedId = active.id as string
    const targetId = over.id as string
    // Prevent dropping into descendants
    const descendants = collectDescendantIds(draggedId, childrenByParent)
    if (descendants.has(targetId)) return
    // For simplicity, place dragged node as sibling after target
    const targetNode = byId[targetId]
    const newParentId = targetNode.parentId ?? null
    const newSortOrder = (targetNode.sortOrder ?? 0) + 1
    dispatch(moveCategory({ id: draggedId, newParentId, newSortOrder }))
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={flattened.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        <div role="tree" aria-label="Category tree">
          {flattened.map((n) => (
            <TreeNode key={n.id} id={n.id} depth={n.depth} hasChildren={n.hasChildren} isExpanded={n.isExpanded} onToggle={() => handleToggle(n.id)} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>{/* optional overlay */}</DragOverlay>
    </DndContext>
  )
}
