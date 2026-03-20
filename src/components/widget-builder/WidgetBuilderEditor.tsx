'use client';

import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import BuilderCanvas from './BuilderCanvas';
import CanvasItemContent from './CanvasItemContent';
import PreviewPane from './PreviewPane';
import WidgetPanel from './WidgetPanel';
import { canvasReducer } from './canvasReducer';
import type { CanvasState, Widget } from './types';
import { WIDGETS } from '@/data/widgetDefinitions';

const INITIAL_CANVAS: CanvasState = {
  width: 900,
  height: 1200,
  items: [],
};

function BuilderDragOverlay({ widget }: { widget: Widget | null }) {
  if (!widget) {
    return null;
  }

  return (
    <div className="w-[300px] rotate-[-3deg] opacity-95 shadow-[0_30px_70px_rgba(24,37,52,0.2)]">
      <CanvasItemContent widget={widget} />
    </div>
  );
}

export default function WidgetBuilderEditor() {
  const [canvas, dispatch] = useReducer(canvasReducer, INITIAL_CANVAS);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const boardColumnRef = useRef<HTMLDivElement | null>(null);

  const activeWidget = useMemo(
    () => WIDGETS.find((widget) => widget.id === activeWidgetId) ?? null,
    [activeWidgetId]
  );

  const placedWidgetIds = useMemo(
    () => canvas.items.map((item) => item.widgetId),
    [canvas.items]
  );
  const selectedItem = useMemo(
    () => canvas.items.find((item) => item.id === selectedItemId) ?? null,
    [canvas.items, selectedItemId]
  );

  useEffect(() => {
    const node = boardColumnRef.current;
    if (!node) {
      return;
    }

    const updateCanvasSize = () => {
      const availableWidth = node.clientWidth;
      const nextWidth = Math.max(560, Math.min(availableWidth - 88, 1400));
      const nextHeight = Math.max(1200, Math.round(nextWidth * 1.1));

      if (nextWidth !== canvas.width || nextHeight > canvas.height) {
        dispatch({ type: 'SET_CANVAS_SIZE', width: nextWidth, height: nextHeight });
      }
    };

    updateCanvasSize();

    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, [canvas.height, canvas.width]);

  function handleDragEnd(event: DragEndEvent) {
    setActiveWidgetId(null);

    if (event.over?.id !== 'canvas' || !canvasRef.current) {
      return;
    }

    const data = event.active.data.current;
    if (!data || data.type !== 'WIDGET_DROP') {
      return;
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const translated = event.active.rect.current.translated;
    const initial = event.active.rect.current.initial;
    if (!initial) {
      return;
    }

    const left = translated?.left ?? initial.left + event.delta.x;
    const top = translated?.top ?? initial.top + event.delta.y;
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${data.widgetId}-${Date.now()}`;

    dispatch({
      type: 'ADD_ITEM',
      id,
      widgetId: data.widgetId,
      layoutMode: 'free',
      position: {
        x: left - canvasRect.left,
        y: top - canvasRect.top,
      },
      size: data.defaultSize,
    });
    setSelectedItemId(id);
  }

  return (
    <DndContext
      onDragStart={(event) => {
        const widgetId = event.active.data.current?.widgetId;
        if (typeof widgetId === 'string') {
          setActiveWidgetId(widgetId);
        }
      }}
      onDragCancel={() => setActiveWidgetId(null)}
      onDragEnd={handleDragEnd}
    >
      <main
        className="min-h-screen"
        style={
          {
            '--builder-shell': 'oklch(0.965 0.005 95)',
            '--builder-panel': 'oklch(0.978 0.003 95)',
            '--builder-paper': 'oklch(0.995 0.002 95)',
            '--builder-paper-2': 'oklch(0.952 0.006 95)',
            '--builder-ink': 'oklch(0.24 0.01 260)',
            '--builder-muted': 'oklch(0.48 0.01 255)',
            '--builder-line': 'oklch(0.88 0.004 95)',
            '--builder-accent-amber': 'oklch(0.62 0.12 72)',
            '--builder-accent-sage': 'oklch(0.57 0.07 160)',
            '--builder-accent-coral': 'oklch(0.64 0.11 34)',
            '--builder-accent-ink': 'oklch(0.36 0.03 245)',
            '--builder-deep': 'oklch(0.2 0.01 255)',
          } as CSSProperties
        }
      >
        <div
          className="min-h-screen"
          style={{
            background:
              'linear-gradient(180deg, var(--builder-panel), var(--builder-shell))',
          }}
        >
          <header className="border-b border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] px-4 py-3">
            <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-6">
              <div>
                <h1 className="m-0 text-[1.35rem] font-semibold tracking-[-0.04em] text-[color:var(--builder-deep)]">
                  Dynamic Proposal Builder
                </h1>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[color:var(--builder-muted)]">
                <div className="rounded border border-[color:var(--builder-line)] bg-[color:var(--builder-panel)] px-2 py-1.5">
                  Canvas {canvas.width} × {canvas.height}
                </div>
                <div className="rounded border border-[color:var(--builder-line)] bg-[color:var(--builder-panel)] px-2 py-1.5">
                  Prototype only
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto flex h-[calc(100vh-61px)] max-w-[1680px] min-h-[680px] gap-2 px-3 py-3">
            <div className="w-[260px] shrink-0">
              <WidgetPanel widgets={WIDGETS} placedWidgetIds={placedWidgetIds} />
            </div>

            <div ref={boardColumnRef} className="min-w-0 flex-1 basis-0">
              <BuilderCanvas
                ref={canvasRef}
                canvas={canvas}
                widgets={WIDGETS}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItemId}
                dispatch={dispatch}
              />
            </div>

            <div className="min-w-0 flex-1 basis-0">
              <PreviewPane canvas={canvas} widgets={WIDGETS} />
            </div>
          </div>
        </div>
      </main>

      <DragOverlay dropAnimation={null}>
        <BuilderDragOverlay widget={activeWidget} />
      </DragOverlay>
    </DndContext>
  );
}
