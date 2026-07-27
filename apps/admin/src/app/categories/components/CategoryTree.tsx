import React from 'react'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectTreeRootsForEditor, selectCategoriesById, selectChildren, selectExpandedIds } from '../store/selectors'
import { flattenTree, collectDescendantIds } from '../utils/treeUtils'
import TreeNode from './TreeNode'
import { setExpanded, moveCategory, updateCategory, reorderChildren } from '../store/categories.slice'

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
    // Determine drop behavior:
    // - if target has children and is expanded -> drop as first child
    // - else -> drop as sibling after target
    const targetNode = byId[targetId]
    const draggedNode = byId[draggedId]
    if (!targetNode || !draggedNode) return

    let newParent: string | null = null
    let insertIndex = 0

    const targetChildren = childrenByParent[targetId] ?? []
    const targetHasChildrenAndExpanded = targetChildren.length > 0 && expandedIds.includes(targetId)
    if (targetHasChildrenAndExpanded) {
      newParent = targetId
      insertIndex = 0
    } else {
      newParent = targetNode.parentId ?? null
      const siblings = childrenByParent[newParent] ?? []
      const targetIdx = siblings.indexOf(targetId)
      insertIndex = targetIdx >= 0 ? targetIdx + 1 : siblings.length
    }

    const oldParent = draggedNode.parentId ?? null

    // Build new sibling lists (remove draggedId from wherever it was)
    const newParentSiblings = (childrenByParent[newParent] ?? []).filter((id) => id !== draggedId)
    newParentSiblings.splice(insertIndex, 0, draggedId)

    const oldParentSiblings = (childrenByParent[oldParent] ?? []).filter((id) => id !== draggedId)

    // Build moves payload (all affected nodes get new parentId/sortOrder)
    const moves: Array<{ id: string; parentId?: string | null; sortOrder: number }> = []
    newParentSiblings.forEach((id, idx) => moves.push({ id, parentId: newParent, sortOrder: idx }))
    if (oldParent !== newParent) {
      oldParentSiblings.forEach((id, idx) => moves.push({ id, parentId: oldParent, sortOrder: idx }))
    }

    // Optimistically apply changes to local state
    // update moved node's parent and sortOrder
    dispatch(updateCategory({ id: draggedId, changes: { parentId: newParent, sortOrder: insertIndex } }))
    // update ordering for new and old parents
    dispatch(reorderChildren({ parentId: newParent, orderedIds: newParentSiblings }))
    if (oldParent !== newParent) dispatch(reorderChildren({ parentId: oldParent, orderedIds: oldParentSiblings }))

    // Prepare server payload
    const payload = { moves }
    // TODO: call API to persist moves. For now we log the payload.
    console.log('Reorder payload prepared:', JSON.stringify(payload, null, 2))
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
