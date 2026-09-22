# Editor Architecture Follow-Up Plan

This document captures the follow-up work from the architecture assessment of the editor app. Each task uses a checkbox placeholder so progress can be tracked directly in this file.

## Goal

Improve the editor architecture without disrupting current standalone and embedded flows.

## Phase 1: App Shell Decomposition

- [x] Extract runtime bootstrapping concerns from the app shell into a dedicated hook.
- [x] Extract URL and mode resolution into a dedicated hook for standalone versus embedded behavior.
- [x] Extract workspace resolution and persistence into a focused workspace context hook.
- [x] Extract draft save orchestration into a dedicated persistence hook.
- [ ] Extract export job creation, polling, and download handling into a dedicated export hook.
- [ ] Reduce the main app component to composition, layout, and wiring only.

## Phase 2: Domain Model Hardening

- [ ] Formalize frame shape in shared editor types instead of relying on loose casts.
- [ ] Remove `@ts-ignore` and `as any` escapes related to frame rendering.
- [ ] Align template, page, and block mapping rules behind typed conversion helpers.
- [ ] Replace `Date.now()` identifiers with a safer client-side id strategy.
- [ ] Separate persisted editor data from transient UI-only state where appropriate.

## Phase 3: Editor State Architecture

- [ ] Define explicit editor commands for add, update, delete, duplicate, lock, and page operations.
- [ ] Evaluate whether the current hook-based state should remain local or move to a reducer/store.
- [ ] Add a clear boundary between editor domain state and app integration state.
- [ ] Introduce a stable place for future undo and redo support.
- [ ] Document invariants for selection, page state, and object mutation behavior.

## Phase 4: Embedded Runtime Boundary

- [ ] Document the contract between the editor remote and the homepage host.
- [ ] Audit embedded auth expectations for token, cookie, and login redirect behavior.
- [ ] Confirm whether separate React and React Query instances are intentional long-term.
- [ ] Minimize direct host-specific assumptions inside the editor app shell.
- [ ] Add regression checks for embedded-only flows.

## Phase 5: API and Integration Cleanup

- [ ] Centralize API payload and response typing for auth, templates, drafts, and export jobs.
- [ ] Reduce repeated response unwrapping patterns across hooks.
- [ ] Isolate export API logic from UI event handlers.
- [ ] Isolate auth session bootstrapping from view-layer components.
- [ ] Review direct `window` access and move it behind narrow utility boundaries where useful.

## Phase 6: Testing and Verification

- [ ] Add tests for the extracted orchestration hooks.
- [ ] Add coverage for save flows in draft mode and admin template mode.
- [ ] Add coverage for embedded login-request behavior.
- [ ] Finish the remaining high-risk geometry E2E cases for drag, resize, rotate, and viewport recentering.
- [ ] Add regression coverage for frame shape rendering after type hardening.
- [ ] Ensure CI runs the highest-value unit, integration, and smoke E2E checks.

## Phase 7: Documentation Alignment

- [ ] Update the editor plan document so it matches the actual state-management approach.
- [ ] Document the current folder responsibilities for `features`, `shared`, `embedded`, and `widgets`.
- [ ] Add a short architecture overview for new contributors.
- [ ] Record the intended extension path for undo/redo, layers, and richer property editing.

## Suggested Execution Order

- [ ] Complete app shell decomposition first.
- [ ] Complete type and domain model hardening next.
- [ ] Then refactor state architecture behind the clearer boundaries.
- [ ] After that, tighten embedded/runtime integration.
- [ ] Finish with test expansion and doc alignment.