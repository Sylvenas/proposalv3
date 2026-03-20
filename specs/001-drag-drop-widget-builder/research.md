# Research: Drag-and-Drop Widget Builder

**Phase**: 0 — Research
**Date**: 2026-03-19
**Feature**: 001-drag-drop-widget-builder

---

## Decision 1: Drag-and-Drop Library

**Decision**: Use `@dnd-kit/core` for all drag-and-drop interactions.

**Rationale**:
- Explicitly architected for "drag from external panel → drop on canvas" scenarios via `useDraggable` / `useDroppable` hooks.
- ~9.8M weekly npm downloads; strongest adoption among modern React DnD libraries.
- Full React 19 support confirmed; fully typed with TypeScript.
- Collision detection API enables precise drop-target resolution on a free-form canvas.
- Hook-based, headless design means full control over visual feedback and positioning.

**Alternatives Considered**:
| Library | Reason Rejected |
|---------|----------------|
| `react-rnd` | Bundles drag+resize in a single component — excellent for resizing already-placed items, but does not cover "drag from panel" pattern natively |
| `react-draggable` + `react-resizable` | Older API; more manual wiring; lower adoption than dnd-kit |
| `react-grid-layout` | Grid/snap-to-cell architecture; incompatible with requirement for free-form absolute positioning |

---

## Decision 2: Resize Library

**Decision**: Use `react-rnd` for in-canvas item resizing (and potentially movement after initial drop).

**Rationale**:
- `react-rnd` provides built-in resize handles (8 directions) and bounded drag within a parent container — the exact behavior needed for already-placed canvas items.
- Combining `@dnd-kit` (for panel-to-canvas drop) with `react-rnd` (for in-canvas move + resize) covers the full lifecycle cleanly:
  1. Drag from panel → `@dnd-kit` handles this.
  2. Reposition / resize on canvas → `react-rnd` handles this.
- ~483K weekly downloads; actively maintained; built-in TypeScript types.
- `bounds="parent"` prop enforces canvas boundary constraint (FR-010) with zero extra code.

**Alternatives Considered**:
| Library | Reason Rejected |
|---------|----------------|
| `react-resizable` alone | No built-in drag-to-reposition; requires manual position management |
| Pure CSS resize handles | Not practical for a production-grade prototype; no boundary enforcement |

---

## Decision 3: State Management

**Decision**: React `useState` / `useReducer` with Context — no external state library.

**Rationale**:
- This is a prototype with a single-page editor; no cross-route state sharing needed.
- Canvas state (list of CanvasItems with position + size) fits naturally in a top-level reducer.
- Adding Redux / Zustand would introduce unnecessary complexity for the prototype scope.
- PreviewPane simply reads the same state — no derived/computed state complexity.

---

## Decision 4: Canvas Layout Approach

**Decision**: Absolute positioning within a fixed-size scrollable canvas div.

**Rationale**:
- Spec requires free-form placement at arbitrary (x, y) coordinates.
- A `position: relative` canvas container + `position: absolute` CanvasItems is the simplest model.
- Canvas overflow set to `auto` enables scrolling when items exceed visible area (Edge Case in spec).
- `react-rnd`'s `bounds="parent"` enforces the boundary constraint automatically.

---

## Decision 5: Preview Rendering

**Decision**: The PreviewPane renders the same CanvasItem list using read-only positioned divs, scaled to fit the preview column width.

**Rationale**:
- No separate data model needed; preview reads the shared canvas state directly.
- CSS `transform: scale(factor)` applied to a wrapper div achieves proportional scaling without recalculating pixel values.
- Scale factor = `previewWidth / canvasWidth`; updates reactively as state changes.

---

## Summary of Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | latest | Panel-to-canvas drag and drop |
| `@dnd-kit/utilities` | latest | CSS transform helpers for dnd-kit |
| `react-rnd` | latest | In-canvas item movement + resize with boundary enforcement |
