import { createSelector } from '@reduxjs/toolkit';
import { CategoryDTO } from '../../api/dtos';

// Assumes the feature slice is mounted at `state.categories`.
const selectState = (state: any) => state.categories as {
  byId: Record<string, CategoryDTO>;
  childrenByParent: Record<string | null, string[]>;
  ui: { selectedId?: string | null; expandedIds: string[] };
};

export const selectCategoriesById = (state: any) => selectState(state).byId;

export const selectCategoryById = (state: any, id: string | undefined | null) => {
  if (!id) return undefined;
  return selectState(state).byId[id];
};

export const selectChildren = createSelector(
  [selectState, (_: any, parentId: string | null = null) => parentId],
  (state, parentId) => {
    const key = parentId ?? null;
    const ids = state.childrenByParent[key] ?? [];
    return ids.map((id) => state.byId[id]).filter(Boolean);
  }
);

export const selectAncestors = (state: any, id: string | undefined | null) => {
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

export const selectDescendants = (state: any, id: string | undefined | null) => {
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

export const selectBreadcrumbs = (state: any, id: string | undefined | null) => {
  if (!id) return [];
  const ancestors = selectAncestors(state, id);
  const self = selectCategoryById(state, id);
  return [...ancestors, ...(self ? [self] : [])];
};

export const selectTreeRootsForEditor = createSelector(
  [selectState, (_: any, editorTypeId: string) => editorTypeId],
  (state, editorTypeId) => {
    const roots = state.childrenByParent[null] ?? [];
    return roots.map((id: string) => state.byId[id]).filter((c: CategoryDTO) => c && c.editorTypeId === editorTypeId);
  }
);

export const selectExpandedIds = (state: any) => selectState(state).ui.expandedIds;

export const selectSelectedId = (state: any) => selectState(state).ui.selectedId;
