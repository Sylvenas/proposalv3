import type { CanvasItem, CanvasState, EditorAction } from './types';

const MIN_WIDTH = 100;
const MIN_HEIGHT = 60;
const CANVAS_GROW_THRESHOLD = 120;
const CANVAS_GROW_PADDING = 320;
const STACKED_GUTTER = 12;
const STACKED_MIN_HEIGHT = 140;

function getRequiredHeight(items: CanvasItem[]) {
  if (items.length === 0) {
    return 0;
  }

  return Math.max(...items.map((item) => item.y + item.h));
}

function getExpandedHeight(height: number, items: CanvasItem[]) {
  const requiredHeight = getRequiredHeight(items);

  if (requiredHeight >= height - CANVAS_GROW_THRESHOLD) {
    return requiredHeight + CANVAS_GROW_PADDING;
  }

  return height;
}

function clampPosition(
  canvas: CanvasState,
  layoutMode: CanvasItem['layoutMode'],
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (layoutMode === 'stacked') {
    const safeWidth = Math.max(MIN_WIDTH, canvas.width - STACKED_GUTTER * 2);
    const safeHeight = Math.min(Math.max(h, STACKED_MIN_HEIGHT), canvas.height);

    return {
      x: STACKED_GUTTER,
      y: Math.min(Math.max(0, y), canvas.height - safeHeight),
      w: safeWidth,
      h: safeHeight,
    };
  }

  const safeWidth = Math.min(Math.max(w, MIN_WIDTH), canvas.width);
  const safeHeight = Math.min(Math.max(h, MIN_HEIGHT), canvas.height);

  return {
    x: Math.min(Math.max(0, x), canvas.width - safeWidth),
    y: Math.min(Math.max(0, y), canvas.height - safeHeight),
    w: safeWidth,
    h: safeHeight,
  };
}

function createCanvasItem(
  canvas: CanvasState,
  action: Extract<EditorAction, { type: 'ADD_ITEM' }>
): CanvasItem {
  const { x, y, w, h } = clampPosition(
    canvas,
    action.layoutMode,
    action.position.x,
    action.position.y,
    action.size.w,
    action.size.h
  );

  return {
    id: action.id,
    widgetId: action.widgetId,
    layoutMode: action.layoutMode,
    x,
    y,
    w,
    h,
  };
}

export function canvasReducer(state: CanvasState, action: EditorAction): CanvasState {
  switch (action.type) {
    case 'SET_CANVAS_SIZE': {
      const width = Math.max(MIN_WIDTH, Math.round(action.width));
      const baseHeight = Math.max(MIN_HEIGHT, Math.round(action.height));
      const height = Math.max(baseHeight, state.height, getRequiredHeight(state.items) + CANVAS_GROW_PADDING);

      return {
        width,
        height,
        items: state.items.map((item) => {
          const next = clampPosition(
            { ...state, width, height },
            item.layoutMode,
            item.x,
            item.y,
            item.w,
            item.h
          );
          return { ...item, ...next };
        }),
      };
    }

    case 'ADD_ITEM': {
      if (state.items.some((item) => item.widgetId === action.widgetId)) {
        return state;
      }

      const newItem = createCanvasItem(state, action);
      const items = [...state.items, newItem];

      return {
        ...state,
        height: getExpandedHeight(state.height, items),
        items,
      };
    }

    case 'MOVE_ITEM': {
      const items = state.items.map((item) => {
        if (item.id !== action.id) {
          return item;
        }

        const normalized = clampPosition(
          state,
          item.layoutMode,
          action.x,
          action.y,
          item.w,
          item.h
        );
        return { ...item, x: normalized.x, y: normalized.y, w: normalized.w, h: normalized.h };
      });

      return {
        ...state,
        height: getExpandedHeight(state.height, items),
        items,
      };
    }

    case 'RESIZE_ITEM': {
      const items = state.items.map((item) => {
        if (item.id !== action.id) {
          return item;
        }

        const next = clampPosition(
          state,
          item.layoutMode,
          action.x,
          action.y,
          action.w,
          action.h
        );
        return { ...item, ...next };
      });

      return {
        ...state,
        height: getExpandedHeight(state.height, items),
        items,
      };
    }

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };

    case 'SET_ITEM_LAYOUT_MODE': {
      const items = state.items.map((item) => {
        if (item.id !== action.id) {
          return item;
        }

        const next = clampPosition(
          state,
          action.layoutMode,
          item.x,
          item.y,
          item.w,
          item.h
        );

        return {
          ...item,
          layoutMode: action.layoutMode,
          ...next,
        };
      });

      return {
        ...state,
        height: getExpandedHeight(state.height, items),
        items,
      };
    }

    default:
      return state;
  }
}
