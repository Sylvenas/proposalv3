'use client';

import { Rnd } from 'react-rnd';

import type { Dispatch } from 'react';

import CanvasItemContent from './CanvasItemContent';
import type { CanvasItem as CanvasItemModel, EditorAction, Widget } from './types';

interface CanvasItemProps {
  item: CanvasItemModel;
  widget: Widget;
  canvasWidth: number;
  selected: boolean;
  onSelect: (id: string) => void;
  dispatch: Dispatch<EditorAction>;
}

export default function CanvasItem({
  item,
  widget,
  canvasWidth,
  selected,
  onSelect,
  dispatch,
}: CanvasItemProps) {
  const isStacked = item.layoutMode === 'stacked';
  const displayedWidth = isStacked ? Math.max(100, canvasWidth - 24) : item.w;
  const displayedX = isStacked ? 12 : item.x;

  return (
    <Rnd
      bounds="parent"
      dragHandleClassName="widget-drag-handle"
      size={{ width: displayedWidth, height: item.h }}
      position={{ x: displayedX, y: item.y }}
      minWidth={100}
      minHeight={isStacked ? 140 : 60}
      dragAxis={isStacked ? 'y' : 'both'}
      onDragStop={(_, data) =>
        dispatch({
          type: 'MOVE_ITEM',
          id: item.id,
          x: isStacked ? 12 : data.x,
          y: data.y,
        })
      }
      onResizeStop={(_, __, ref, ___, position) =>
        dispatch({
          type: 'RESIZE_ITEM',
          id: item.id,
          x: isStacked ? 12 : position.x,
          y: position.y,
          w: isStacked ? displayedWidth : parseFloat(ref.style.width),
          h: parseFloat(ref.style.height),
        })
      }
      enableResizing={
        isStacked
          ? {
              top: false,
              right: false,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }
          : undefined
      }
      className="group"
      style={{ zIndex: 2 }}
      enableUserSelectHack={false}
    >
      <div
        className={`relative h-full w-full ${selected ? 'ring-1 ring-[color:var(--builder-deep)] ring-offset-1 ring-offset-[color:var(--builder-panel)]' : ''}`}
        onMouseDown={() => onSelect(item.id)}
      >
        <button
          type="button"
          aria-label={`Remove ${widget.label}`}
          onClick={() => dispatch({ type: 'DELETE_ITEM', id: item.id })}
          className="absolute right-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-md border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] text-sm text-[color:var(--builder-muted)] opacity-0 transition hover:text-[color:var(--builder-ink)] group-hover:opacity-100"
        >
          ×
        </button>

        <div className="widget-drag-handle h-full w-full cursor-move">
          <CanvasItemContent widget={widget} />
        </div>
      </div>
    </Rnd>
  );
}
