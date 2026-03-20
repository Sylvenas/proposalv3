export type WidgetFieldType = 'text' | 'image' | 'list';
export type LayoutMode = 'stacked' | 'free' | 'floating';

export interface WidgetField {
  key: string;
  label: string;
  placeholder: string;
  type: WidgetFieldType;
}

export interface Widget {
  id: string;
  label: string;
  category: string;
  group?: string;
  icon: string;
  accent: string;
  defaultSize: {
    w: number;
    h: number;
  };
  fields: WidgetField[];
}

export interface CanvasItem {
  id: string;
  widgetId: string;
  layoutMode: LayoutMode;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CanvasState {
  width: number;
  height: number;
  items: CanvasItem[];
}

export type EditorAction =
  | {
      type: 'ADD_ITEM';
      id: string;
      widgetId: string;
      layoutMode: LayoutMode;
      position: { x: number; y: number };
      size: { w: number; h: number };
    }
  | {
      type: 'SET_CANVAS_SIZE';
      width: number;
      height: number;
    }
  | {
      type: 'MOVE_ITEM';
      id: string;
      x: number;
      y: number;
    }
  | {
      type: 'RESIZE_ITEM';
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  | {
      type: 'DELETE_ITEM';
      id: string;
    }
  | {
      type: 'SET_ITEM_LAYOUT_MODE';
      id: string;
      layoutMode: LayoutMode;
    };
