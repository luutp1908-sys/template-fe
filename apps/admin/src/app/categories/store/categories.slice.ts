import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryDTO, ReorderMoveDTO } from '../../api/dtos';

export interface CategoriesState {
  byId: Record<string, CategoryDTO>;
  ids: string[];
  childrenByParent: Record<string | null, string[]>;
  ui: {
    selectedId?: string | null;
    expandedIds: string[];
    loading: boolean;
    error?: string | null;
  };
}

const initialState: CategoriesState = {
  byId: {},
  ids: [],
  childrenByParent: {},
  ui: { selectedId: null, expandedIds: [], loading: false, error: null },
};

function ensureArray<T>(v: T[] | undefined): T[] {
  return Array.isArray(v) ? v : [];
}

const slice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<CategoryDTO[]>) {
      state.byId = {};
      state.ids = [];
      state.childrenByParent = {};
      for (const c of action.payload) {
        state.byId[c.id] = c;
        state.ids.push(c.id);
        const key = c.parentId ?? null;
        if (!state.childrenByParent[key]) state.childrenByParent[key] = [];
        state.childrenByParent[key].push(c.id);
      }
      // ensure children arrays are ordered by sortOrder
      for (const k of Object.keys(state.childrenByParent)) {
        state.childrenByParent[k].sort((a, b) => (state.byId[a].sortOrder ?? 0) - (state.byId[b].sortOrder ?? 0));
      }
    },

    addCategory(state, action: PayloadAction<CategoryDTO>) {
      const c = action.payload;
      state.byId[c.id] = c;
      if (!state.ids.includes(c.id)) state.ids.push(c.id);
      const key = c.parentId ?? null;
      if (!state.childrenByParent[key]) state.childrenByParent[key] = [];
      // insert by sortOrder
      const siblings = state.childrenByParent[key];
      let inserted = false;
      for (let i = 0; i < siblings.length; i++) {
        const sid = siblings[i];
        if ((state.byId[sid].sortOrder ?? 0) > (c.sortOrder ?? 0)) {
          siblings.splice(i, 0, c.id);
          inserted = true;
          break;
        }
      }
      if (!inserted) siblings.push(c.id);
    },

    updateCategory(state, action: PayloadAction<{ id: string; changes: Partial<CategoryDTO> }>) {
      const { id, changes } = action.payload;
      const existing = state.byId[id];
      if (!existing) return;
      state.byId[id] = { ...existing, ...changes } as CategoryDTO;
    },

    removeCategory(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.byId[id]) return;
      const parentKey = state.byId[id].parentId ?? null;
      delete state.byId[id];
      state.ids = state.ids.filter((x) => x !== id);
      if (state.childrenByParent[parentKey]) state.childrenByParent[parentKey] = state.childrenByParent[parentKey].filter((x) => x !== id);
      // remove any children mapping for the removed node (but do not cascade here)
      delete state.childrenByParent[id];
    },

    setChildrenForParent(state, action: PayloadAction<{ parentId?: string | null; children: CategoryDTO[] }>) {
      const { parentId, children } = action.payload;
      const key = parentId ?? null;
      state.childrenByParent[key] = children.map((c) => c.id);
      for (const c of children) {
        state.byId[c.id] = c;
        if (!state.ids.includes(c.id)) state.ids.push(c.id);
      }
    },

    moveCategory(state, action: PayloadAction<{ id: string; newParentId?: string | null; newSortOrder: number }>) {
      const { id, newParentId, newSortOrder } = action.payload;
      const node = state.byId[id];
      if (!node) return;
      const oldParent = node.parentId ?? null;
      const newParent = newParentId ?? null;
      // Remove from old parent's children
      if (state.childrenByParent[oldParent]) state.childrenByParent[oldParent] = state.childrenByParent[oldParent].filter((x) => x !== id);
      // Update node
      node.parentId = newParentId ?? null;
      node.sortOrder = newSortOrder;
      state.byId[id] = { ...node };
      // Insert into new parent's children at correct position
      if (!state.childrenByParent[newParent]) state.childrenByParent[newParent] = [];
      const siblings = state.childrenByParent[newParent];
      let inserted = false;
      for (let i = 0; i < siblings.length; i++) {
        const sid = siblings[i];
        if ((state.byId[sid].sortOrder ?? 0) > newSortOrder) {
          siblings.splice(i, 0, id);
          inserted = true;
          break;
        }
      }
      if (!inserted) siblings.push(id);
    },

    reorderChildren(state, action: PayloadAction<{ parentId?: string | null; orderedIds: string[] }>) {
      const { parentId, orderedIds } = action.payload;
      const key = parentId ?? null;
      state.childrenByParent[key] = orderedIds.slice();
      // update sortOrder to match index
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        if (state.byId[id]) state.byId[id].sortOrder = i;
      }
    },

    setExpanded(state, action: PayloadAction<string[]>) {
      state.ui.expandedIds = action.payload.slice();
    },

    toggleExpanded(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.ui.expandedIds.indexOf(id);
      if (idx >= 0) state.ui.expandedIds.splice(idx, 1);
      else state.ui.expandedIds.push(id);
    },

    setSelected(state, action: PayloadAction<string | null>) {
      state.ui.selectedId = action.payload;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.ui.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.ui.error = action.payload;
    },
  },
});

export const {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setChildrenForParent,
  moveCategory,
  reorderChildren,
  setExpanded,
  toggleExpanded,
  setSelected,
  setLoading,
  setError,
} = slice.actions;

export default slice.reducer;
