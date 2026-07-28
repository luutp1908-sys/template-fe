# Category Management — Architecture Design

Overview
-------
- Purpose: Admin Category Management for `fe/apps/admin` enabling editors to manage hierarchical categories that contain templates, support unlimited depth, drag-and-drop reorder, search, breadcrumbs, expand/collapse, and prevent cycles.
- Tech assumptions: React + TypeScript (Nx workspace). Recommended libs: Redux Toolkit + RTK Query, dnd-kit, react-virtual, React Router.

High-level data model
---------------------
- Category
  - `id: string` — UUID
  - `name: string`
  - `slug: string`
  - `description?: string`
  - `parentId?: string | null`
  - `editorTypeId: number` (`0=graphic`, `1=document`, `2=whiteboard`, `3=form`)
  - `templateCount: number`
  - `sortOrder: number`
  - `createdAt: string`
  - `updatedAt: string`
  - `version?: number` — optimistic concurrency

- EditorType (hardcoded constant)
  - `{ id: 0, type: 'graphic' }`
  - `{ id: 1, type: 'document' }`
  - `{ id: 2, type: 'whiteboard' }`
  - `{ id: 3, type: 'form' }`

Design decisions
----------------
- Representation: `parentId` + `sortOrder` keeps server schema simple and supports unlimited depth.
- `version` or ETag used to detect concurrent updates.
- Normalize records on the client (byId + childrenByParent) for fast lookup and tree operations.

API Layer (contract summary)
----------------------------
- Base: `/api/admin/editor-types/:editorTypeId/categories`
- Endpoints:
  - `GET /?parentId=&q=&page=&limit=&loadChildren=false` — list children or search
  - `GET /tree?editorTypeId=&depth=&lazy=true` — full or partial tree
  - `GET /:id` — category detail
  - `POST /` — create { name, description?, parentId?, editorTypeId }
  - `PATCH /:id` — partial update; server validates cycles
  - `DELETE /:id` — delete (cascade or block)
  - `POST /reorder` — batch reorder; body: `[{ id, parentId, sortOrder }]`
  - `GET /:id/ancestors` — for breadcrumbs
  - `GET /search?q=&editorTypeId=&limit=` — server-side search

Server-side cycle prevention
---------------------------
- Validate parent change by walking parent chain or via recursive CTE; reject with `CYCLE_DETECTED`.
- Enforce `editorTypeId` consistency between parent and child.

State management
----------------
- Use Redux Toolkit + RTK Query.
- Normalized store shape:
  - `categories: { byId: Record<string, Category>, ids: string[] }`
  - `childrenByParent: Record<string|null, string[]>` (ordered)
  - `ui: { selectedCategoryId?, expandedIds: Set<string>, searchQuery? }`
- Selectors: `selectCategory`, `selectChildren`, `selectAncestors`, `selectDescendants`, `selectTreeForEditor`.
- Optimistic updates for reorder and inline edits; RTK Query tags for invalidation.

Component hierarchy
-------------------
- `CategoryManagementPage`
  - `ToolbarArea` (Search, Create)
  - `SplitLayout`:
    - `CategoryTreePanel` (Left)
    - `CategoryDetailPanel` (Right)
- `CategoryTree` (virtualized flattened list)
- `TreeNode` (drag handle, caret, actions)
- `CategoryFormModal`, `ConfirmDialog`, `Breadcrumbs`

Drag-and-drop
--------------
- Use `dnd-kit`. Flatten tree to list with depth metadata for drag logic.
- On drop: compute minimal `moves` array, optimistic update, call `POST /reorder`.
- Client prevents dropping node into its own descendant.

Search & Breadcrumbs
--------------------
- Server-side search for authoritative results; client-side filter for loaded nodes.
- Breadcrumbs computed from `selectAncestors(selectedId)`.

Loading states & UX
-------------------
- Lazy-load children on expand, show per-node spinner.
- Virtualize large trees with `react-virtual`.
- Skeletons for tree and detail panel; optimistic UI for reorder.

Error handling
--------------
- Surface validation errors inline; show toasts for non-blocking errors.
- On cycle detection return `CYCLE_DETECTED` and show explanatory message.
- Revert optimistic updates on failure and re-fetch affected parents.

Folder structure (feature scope)
------------------------------
fe/apps/admin/src/app/categories/
- api/
  - dtos.ts
  - categories.api.ts
- components/
  - CategoryManagementPage.tsx
  - Toolbar.tsx
  - CategoryTreePanel.tsx
  - CategoryTree.tsx
  - TreeNode.tsx
  - CategoryDetailPanel.tsx
  - CategoryFormModal.tsx
  - Breadcrumbs.tsx
- hooks/
  - useCategoryTree.ts
  - useCategoryDnD.ts
- store/
  - categories.slice.ts
  - selectors.ts
- utils/
  - treeUtils.ts
  - validation.ts
- tests/

Testing strategy
----------------
- Unit: selectors, tree utils, validators.
- Integration: components with mocked RTK Query and dnd-kit.
- E2E: Playwright for create/edit/move/search flows.

Next steps
----------
1. Define TypeScript models and API DTOs.
2. Design state management and selectors (normalized shape).
3. Scaffold components and folder structure.
4. Implement RTK Query endpoints and normalized slice.
5. Build `CategoryTree` with `dnd-kit`, virtualization and lazy loading.
6. Add detail panel, breadcrumbs, search and tests.

Rationale: this document is intended for developers implementing the feature; keep it up-to-date in `fe/apps/admin/docs`.
