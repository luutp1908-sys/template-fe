# Canva-Style Centered Page Canvas Checklist

## 1. Define page model
- [ ] Add explicit page state: width, height, background, and optional preset name.
- [ ] Keep object coordinates page-relative (origin at top-left of page, not backdrop).
- [ ] Confirm whether out-of-page placement is allowed (bleed) or clamped.

## 2. Split canvas into layers in Canvas.jsx
- [ ] Backdrop layer: full canvas workspace, subtle neutral tone/pattern.
- [ ] Viewport layer: scroll/pan container.
- [ ] Centering layer: always centers the page when possible.
- [ ] Page layer: white surface with shadow where objects are rendered.

## 3. Move object rendering to page surface
- [ ] Render all CanvasObject elements inside the page container only.
- [ ] Keep absolute positioning relative to page container.
- [ ] Ensure selection/deselection behavior distinguishes backdrop click vs page click.

## 4. Preserve Moveable alignment
- [ ] Keep Moveable target bound to elements inside the page surface.
- [ ] Keep updateRect sync calls after drag/resize/rotate end.
- [ ] Re-run updateRect after page resize/recenter events.
- [ ] Verify alignment at page edges and after quick drag-release.

## 5. Viewport and centering behavior
- [ ] Initial load: page is centered in available viewport.
- [ ] If page larger than viewport: allow scroll while preserving page coordinate model.
- [ ] On window resize: recenter without changing object coordinates.
- [ ] Maintain stable selection while scrolling.

## 6. Sidebar semantics in Sidebar.jsx
- [ ] Keep X/Y/W/H as page-relative values.
- [ ] Add optional Page section: size, preset, orientation.
- [ ] Clarify units (px) in properties.

## 7. State integration in useEditor.js
- [ ] Store page metadata alongside object state.
- [ ] Keep object CRUD unchanged except for optional bounds checks.
- [ ] Add helper for page bounds validation if clamp mode is enabled.

## 8. UX polish
- [ ] Backdrop click deselects current object.
- [ ] Page has clear shadow and visual separation from backdrop.
- [ ] Keep current menu/sidebar dimensions and app shell layout in App.jsx.

## 9. QA acceptance criteria
- [ ] Drag, resize, rotate remain visually synced with Moveable after mouse release.
- [ ] No jitter/desync when object is near page boundaries.
- [ ] Centering remains correct across desktop and small laptop widths.
- [ ] Build passes without warnings that affect behavior.

## 10. Optional phase 2
- [ ] Zoom around page center.
- [ ] Hand tool for panning backdrop.
- [ ] Multiple page presets and custom dimensions.