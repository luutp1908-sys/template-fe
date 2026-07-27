import { createSelector } from '@reduxjs/toolkit';
import { CategoryDTO } from '../api/dtos';
import { RootState } from '../../store';
import { ROOT_PARENT_KEY } from './categories.slice';

// Assumes the feature slice is mounted at `state.categories`.
const selectState = (state: RootState) => state.categories;

export const selectCategoriesById = (state: RootState) => selectState(state).byId;

export const selectCategoryById = (state: RootState, id: string | undefined | null) => {
  if (!id) return undefined;
  return selectState(state).byId[id];
};

export const selectChildren = createSelector(
  [selectState, (_: RootState, parentId: string | null = null) => parentId],
  (state, parentId) => {
    const key = parentId ?? ROOT_PARENT_KEY;
    const ids = state.childrenByParent[key] ?? [];
    return ids.map((id) => state.byId[id]).filter(Boolean);
  }
);

export const selectAncestors = (state: RootState, id: string | undefined | null) => {
  if (!id) return [];
  const s = selectState(state);
  const out: CategoryDTO[] = [];
  let current = s.byId[id];
  while (current && current.parentId) {
    const parent = s.byId[current.parentId];
    if (!parent) break;
    out.unshift(parent);
    current = parent;
  }
  return out;
};

export const selectDescendants = (state: RootState, id: string | undefined | null) => {
  if (!id) return [];
  const s = selectState(state);
  const out: CategoryDTO[] = [];
  const stack = [...(s.childrenByParent[id] ?? [])];
  while (stack.length) {
    const cid = stack.shift()!;
    const node = s.byId[cid];
    if (!node) continue;
    out.push(node);
    const children = s.childrenByParent[cid] ?? [];
    stack.push(...children);
  }
  return out;
};

export const selectBreadcrumbs = (state: RootState, id: string | undefined | null) => {
  if (!id) return [];
  const ancestors = selectAncestors(state, id);
  const self = selectCategoryById(state, id);
  return [...ancestors, ...(self ? [self] : [])];
};

export const selectTreeRootsForEditor = createSelector(
  [selectState, (_: RootState, editorTypeId: string) => editorTypeId],
  (state, editorTypeId) => {
    const roots = state.childrenByParent[ROOT_PARENT_KEY] ?? [];
    return roots
      .map((id: string) => state.byId[id])
      .filter((c: CategoryDTO) => c && (editorTypeId ? c.editorTypeId === editorTypeId : true));
  }
);

export const selectExpandedIds = (state: RootState) => selectState(state).ui.expandedIds;

export const selectSelectedId = (state: RootState) => selectState(state).ui.selectedId;
