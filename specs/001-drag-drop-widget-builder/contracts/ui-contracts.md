# UI Contracts: Drag-and-Drop Widget Builder

**Phase**: 1 — Design
**Date**: 2026-03-19

These contracts define the behavioral interfaces between the three major UI zones and their sub-components. They are technology-agnostic and describe what each component receives and emits.

---

## Zone Layout Contract

The root editor page is split into three fixed zones:

| Zone | Width | Role |
|------|-------|------|
| WidgetPanel (left) | fixed ~240px | Source of draggable Widget definitions |
| Canvas (center) | flex-grow | Drop target; hosts positioned CanvasItems |
| PreviewPane (right) | fixed ~320px | Read-only, scaled live view of Canvas state |

---

## WidgetPanel Contract

**Receives**:
- `widgets: Widget[]` — full list of all widget definitions
- `placedWidgetIds: string[]` — IDs of widgets currently on canvas

**Emits**:
- Nothing directly. Initiates drag via DnD library when user starts dragging.

**Visual Rules**:
- Widgets in `placedWidgetIds` are rendered as visually disabled (reduced opacity, no drag cursor).
- Each widget card shows: icon, label, default size hint.
- Panel is scrollable if widget list overflows.

---

## DraggableWidgetCard Contract

**Receives**:
- `widget: Widget`
- `disabled: boolean` — true when already placed on canvas

**Drag Payload** (data transferred on drop):
```
{
  type: "WIDGET_DROP",
  widgetId: string,
  defaultSize: { w: number, h: number }
}
```

---

## Canvas Contract

**Receives**:
- `items: CanvasItem[]` — current placed items
- `canvasSize: { width: number, height: number }`

**Emits**:
- `onItemDrop(widgetId, position: { x, y })` — when a new widget is dropped
- `onItemMove(itemId, newPosition: { x, y })` — when an item is repositioned
- `onItemResize(itemId, newSize: { w, h }, newPosition: { x, y })` — when an item is resized
- `onItemDelete(itemId)` — when delete button is clicked

**Drop Behavior**:
- Accepts only drag payloads with `type === "WIDGET_DROP"`.
- Drop position = cursor coordinates relative to canvas origin, offset by drag start point to avoid snapping to corner.
- If `widgetId` already exists in `items`, drop is rejected silently.

---

## CanvasItem Contract

**Receives**:
- `item: CanvasItem`
- `widget: Widget` — resolved from widgetId
- `canvasBounds: { width: number, height: number }`

**Emits** (via parent Canvas handlers):
- Position changes while dragging (live)
- Final position on drag end
- Size changes while resizing (live)
- Final size on resize end
- Delete intent

**Visual Rules**:
- Shows widget label as a header bar.
- Shows a `×` delete button (visible on hover or always visible in prototype).
- Shows 8-direction resize handles (visible on hover).
- Content area renders the widget's `fields` as label + placeholder text rows.
- Minimum size enforced: 100px wide × 60px tall.

---

## PreviewPane Contract

**Receives**:
- `items: CanvasItem[]`
- `widgets: Widget[]` — for resolving widget definitions
- `canvasSize: { width: number, height: number }`
- `previewWidth: number` — available width of the preview column

**Emits**: Nothing (read-only).

**Rendering Rules**:
- Scale factor = `previewWidth / canvasSize.width`.
- All items rendered as `position: absolute` divs, coordinates multiplied by scale factor.
- No drag/resize handles rendered.
- Shows a page-frame border to suggest the final document boundary.

---

## State Shape Contract

The shared state managed by the top-level editor component:

```
EditorState {
  canvas: {
    width:  number           // e.g. 900
    height: number           // e.g. 1200
    items:  CanvasItem[]
  }
}
```

All three zones receive read access to this state. Only Canvas emits mutations via the four event handlers above.
