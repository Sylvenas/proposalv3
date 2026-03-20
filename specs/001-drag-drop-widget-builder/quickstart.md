# Quickstart: Drag-and-Drop Widget Builder

**Feature**: 001-drag-drop-widget-builder
**Date**: 2026-03-19

---

## Prerequisites

Node.js 20+ and the project running via `npm run dev`.

Install the two new dependencies before starting implementation:

```bash
npm install @dnd-kit/core @dnd-kit/utilities react-rnd
```

---

## Architecture in 60 Seconds

项目使用 Next.js 15 App Router。新增 `/widget-builder` 路由页面：

```
app/
└── widget-builder/
    └── page.tsx                       ← Server Component 路由入口，渲染 WidgetBuilderEditor

src/
├── data/
│   └── widgetDefinitions.ts           ← 静态 Widget 定义数组（4 种）
└── components/
    └── widget-builder/
        ├── WidgetBuilderEditor.tsx     ← "use client" 编辑器根组件，owns EditorState + DndContext
        ├── WidgetPanel.tsx             ← 左列：可拖拽组件卡片列表
        ├── DraggableCard.tsx           ← 单个 @dnd-kit 拖拽卡片
        ├── BuilderCanvas.tsx           ← 中列：drop target + CanvasItem 列表
        ├── CanvasItem.tsx              ← react-rnd 包裹的单个画布实例
        └── PreviewPane.tsx             ← 右列：等比缩放只读预览
```

**访问**: `http://localhost:3000/widget-builder`

---

## Implementation Order

Follow this order to have a working demo after each step:

### Step 1 — 创建路由页面 + 静态三列布局
新建 `app/widget-builder/page.tsx`（Server Component），导入并渲染 `WidgetBuilderEditor`。新建 `src/components/widget-builder/WidgetBuilderEditor.tsx`（`"use client"`），实现三列 shell（`WidgetPanel`、`BuilderCanvas`、`PreviewPane` 为空占位）。访问 `http://localhost:3000/widget-builder` 验证三列可见。

### Step 2 — Widget Definitions
Create `data/widgetDefinitions.ts` with the four `Widget` objects (company-info, sales-info, product-list, payment-plan). Render them as static cards in `WidgetPanel`.

### Step 3 — Drop Zone (P1 core)
Wrap `WidgetBuilderPage` in `DndContext` from `@dnd-kit/core`. Make each widget card a `useDraggable` source. Make `BuilderCanvas` a `useDroppable` target. On `onDragEnd`, dispatch a drop action that creates a new `CanvasItem` in state.

### Step 4 — Render CanvasItems
For each item in `canvas.items`, render a `CanvasItem` inside `BuilderCanvas` using `react-rnd`. Position with `x`/`y`, size with `w`/`h`. Show widget label + placeholder fields inside.

### Step 5 — Move & Resize (P2)
Wire `react-rnd`'s `onDragStop` and `onResizeStop` callbacks to dispatch position/size update actions. Pass `bounds="parent"` to enforce canvas boundary.

### Step 6 — Delete (P4)
Add a `×` button to `CanvasItem`. On click, dispatch a delete action. Verify the item disappears from canvas and preview, and re-appears as available in the panel.

### Step 7 — Live Preview (P3)
In `PreviewPane`, read `canvas.items` from shared state and render scaled read-only divs. Compute `scale = previewWidth / canvas.width` and apply via CSS transform.

---

## Key Code Patterns

### Drop payload (attached to draggable)
```tsx
const { attributes, listeners, setNodeRef } = useDraggable({
  id: widget.id,
  data: { type: 'WIDGET_DROP', widgetId: widget.id, defaultSize: widget.defaultSize },
});
```

### Receiving a drop on canvas
```tsx
function handleDragEnd(event: DragEndEvent) {
  if (!event.over || event.active.data.current?.type !== 'WIDGET_DROP') return;
  const { widgetId, defaultSize } = event.active.data.current;
  const dropPosition = computeDropPosition(event); // cursor - canvas origin - drag offset
  dispatch({ type: 'ADD_ITEM', widgetId, position: dropPosition, size: defaultSize });
}
```

### Resize + move with boundary
```tsx
<Rnd
  bounds="parent"
  position={{ x: item.x, y: item.y }}
  size={{ width: item.w, height: item.h }}
  minWidth={100}
  minHeight={60}
  onDragStop={(_, d) => dispatch({ type: 'MOVE_ITEM', id: item.id, x: d.x, y: d.y })}
  onResizeStop={(_, __, ref, ___, pos) =>
    dispatch({ type: 'RESIZE_ITEM', id: item.id,
      w: parseInt(ref.style.width), h: parseInt(ref.style.height), ...pos })
  }
>
  <CanvasItemContent widget={widget} onDelete={() => dispatch({ type: 'DELETE_ITEM', id: item.id })} />
</Rnd>
```

### Scaled preview
```tsx
const scale = previewWidth / canvasWidth;
<div style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
  {items.map(item => (
    <div key={item.id} style={{ position: 'absolute', left: item.x, top: item.y, width: item.w, height: item.h }}>
      <PreviewItemContent widget={widgets.find(w => w.id === item.widgetId)!} />
    </div>
  ))}
</div>
```
