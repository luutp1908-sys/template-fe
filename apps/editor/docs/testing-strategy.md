# Test Strategy for Canva-Style Canvas Editor

## Purpose
This document defines the testing strategy for canvas interactions, object editing, centered page layout, and Moveable sync behavior.

## Why Testing Is Needed
- Geometry and transform bugs are easy to miss in manual checks.
- Selection and state updates can regress when layout changes.
- The known Moveable sync issue shows we need browser-level confidence.

## Testing Layers

### 1. Unit Tests: State and Logic
Scope:
- src/shared/hooks/useEditor.js

Goals:
- Verify add object behavior for shape, text, and image.
- Verify update object behavior for x, y, width, height, rotate, and content fields.
- Verify delete object and delete selected object behavior.
- Verify selected id and active tool transitions.
- Verify edge cases for missing id and empty collections.

Guidelines:
- Keep unit tests deterministic and fast.
- Avoid DOM or layout assertions in this layer.

### 2. Integration Tests: Component Wiring
Scope:
- src/features/canvas/Canvas.jsx
- src/widgets/Sidebar.jsx
- src/App.jsx

Goals:
- Click object selects the object.
- Click backdrop deselects the object.
- Layer click in sidebar selects matching object in canvas.
- Object updates are reflected in sidebar properties.
- Add and delete flows are correctly wired.

Guidelines:
- Validate event wiring and visible state.
- Do not rely on pixel-perfect layout assertions in this layer.

### 3. End-to-End Tests: Real Browser Geometry
Primary focus:
- Moveable alignment and centered page behavior in actual browser rendering.

Critical scenarios:
- Drag then release: Moveable box stays aligned with target.
- Resize then release: control handles stay aligned.
- Rotate then release: control box tracks transformed bounds.
- Re-select after transform: no offset or stale rect.
- Window resize: centered page remains stable and selection remains valid.

Guidelines:
- Use small tolerance thresholds for geometry comparisons.
- Keep the E2E suite focused on high-risk user journeys.

## Priority Test Cases
1. Drag release alignment
- Precondition: select one object.
- Action: drag object and release.
- Expected: Moveable controls overlap target bounds within tolerance.

2. Resize release alignment
- Precondition: select one object.
- Action: resize from corner and release.
- Expected: controls remain aligned with updated object size and position.

3. Rotate release alignment
- Precondition: select one object.
- Action: rotate and release.
- Expected: control box aligns with rotated target bounds.

4. Backdrop deselection
- Precondition: one object selected.
- Action: click backdrop area.
- Expected: selection cleared and controls hidden.

5. Center persistence on viewport change
- Precondition: page centered with selected object.
- Action: resize viewport.
- Expected: page remains centered and selection remains consistent.

## Pass Criteria
- No visual desync between Moveable and target after interaction end.
- No jitter near page edges during drag and release.
- Selection and sidebar values remain page-relative and consistent.
- Build and tests pass in CI on every merge.

## Rollout Plan
Phase 1:
- Add unit tests for editor state logic.

Phase 2:
- Add integration tests for selection and sidebar sync.

Phase 3:
- Add E2E tests for drag, resize, rotate, and viewport resize alignment.

## Maintenance Rules
- Add at least one test for every bugfix touching canvas geometry.
- Keep flaky geometry tests isolated and monitored.
- Prefer fewer high-value E2E tests over many fragile ones.
