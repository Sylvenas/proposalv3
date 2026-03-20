# Data Model: Drag-and-Drop Widget Builder

**Phase**: 1 — Design
**Date**: 2026-03-19
**Feature**: 001-drag-drop-widget-builder

---

## Entities

### Widget (组件定义)

A static definition of a Proposal module type. Defined at build-time; never mutated by the user.

```
Widget {
  id:          string          // unique type key, e.g. "company-info"
  label:       string          // display name, e.g. "公司信息"
  icon:        string          // icon identifier or emoji
  defaultSize: { w: number, h: number }  // initial width/height when dropped (px)
  fields:      WidgetField[]   // ordered list of display fields
}

WidgetField {
  key:         string          // field identifier
  label:       string          // display label
  placeholder: string          // static placeholder text shown in prototype
  type:        "text" | "image" | "list"
}
```

**Predefined Widgets**:

| id | label | defaultSize |
|----|-------|-------------|
| `company-info` | 公司信息 | 300 × 160 |
| `sales-info` | 销售信息 | 280 × 200 |
| `product-list` | 产品列表 | 480 × 300 |
| `payment-plan` | 付款计划 | 360 × 220 |

---

### CanvasItem (画布实例)

A runtime instance of a Widget placed on the canvas. Created on drop; mutated on move/resize; deleted on remove.

```
CanvasItem {
  id:        string    // unique instance ID (e.g. uuid)
  widgetId:  string    // references Widget.id
  x:         number    // left offset from canvas origin (px)
  y:         number    // top offset from canvas origin (px)
  w:         number    // current width (px)
  h:         number    // current height (px)
}
```

**Constraints**:
- `x >= 0`, `y >= 0`
- `x + w <= canvas.width`, `y + h <= canvas.height` (boundary enforcement)
- At most one CanvasItem per unique `widgetId` (single-instance rule per spec Assumptions)

---

### Canvas (画布状态)

The root state object that owns all CanvasItems and defines the canvas dimensions.

```
Canvas {
  width:  number         // fixed canvas width (px), e.g. 900
  height: number         // fixed canvas height (px), e.g. 1200 (scrollable if items overflow)
  items:  CanvasItem[]   // ordered list of placed items
}
```

---

### WidgetPanel (组件面板)

The left-side panel's view model. Derived from the full Widget registry minus already-placed widgetIds.

```
WidgetPanel {
  available: Widget[]    // widgets not yet placed on canvas (computed)
  placed:    string[]    // widgetIds currently on canvas (mirrors Canvas.items[*].widgetId)
}
```

No persistence — computed from Canvas state on every render.

---

## State Transitions

```
WIDGET_PANEL  ──[drag & drop]──►  CANVAS (CanvasItem created)
                                       │
                              [drag reposition]
                                       │
                              [resize handles]
                                       │
                              [delete button]──►  CANVAS (CanvasItem removed)
```

---

## Validation Rules

| Rule | Condition | Behavior |
|------|-----------|---------|
| Boundary clamp | item.x < 0 | Set x = 0 |
| Boundary clamp | item.y < 0 | Set y = 0 |
| Boundary clamp | item.x + item.w > canvas.width | Clamp x = canvas.width - item.w |
| Boundary clamp | item.y + item.h > canvas.height | Clamp y = canvas.height - item.h |
| Minimum size | item.w < 100 or item.h < 60 | Enforce minimum dimensions during resize |
| Single instance | widgetId already in Canvas.items | Block drop; widget appears disabled in panel |
