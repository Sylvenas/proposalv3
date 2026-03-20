'use client';

import { forwardRef } from 'react';
import { useDroppable } from '@dnd-kit/core';

import type { Dispatch } from 'react';

import CanvasItem from './CanvasItem';
import type { CanvasItem as CanvasItemModel, CanvasState, EditorAction, LayoutMode, Widget } from './types';

interface BuilderCanvasProps {
  canvas: CanvasState;
  widgets: Widget[];
  selectedItem: CanvasItemModel | null;
  onSelectItem: (id: string) => void;
  dispatch: Dispatch<EditorAction>;
}

const BuilderCanvas = forwardRef<HTMLDivElement, BuilderCanvasProps>(
  function BuilderCanvas(
    { canvas, widgets, selectedItem, onSelectItem, dispatch },
    ref
  ) {
    const { setNodeRef, isOver } = useDroppable({
      id: 'canvas',
    });

    const composedRef = (node: HTMLDivElement | null) => {
      setNodeRef(node);

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const selectedLayoutMode: LayoutMode = selectedItem?.layoutMode ?? 'free';

    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)]">
        <div className="grid grid-cols-[minmax(0,1fr)_96px] items-start gap-4 border-b border-[color:var(--builder-line)] px-3 py-3">
          <div className="grid min-h-[126px] min-w-0 grid-rows-[auto_auto_1fr]">
            <p className="m-0 h-4 text-[12px] uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
              Canvas
            </p>
            <h2 className="m-0 mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-[color:var(--builder-deep)]">
              Freeform Layout
            </h2>
            <div className="mt-2 flex flex-col justify-start">
              <p className="m-0 text-[10px] text-[color:var(--builder-muted)]">
                Widget Settings
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {[
                  { key: 'stacked', label: 'Stacked' },
                  { key: 'free', label: 'Free' },
                  { key: 'floating', label: 'Floating' },
                ].map((option) => {
                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={!selectedItem}
                      onClick={() =>
                        selectedItem
                          ? dispatch({
                              type: 'SET_ITEM_LAYOUT_MODE',
                              id: selectedItem.id,
                              layoutMode: option.key as LayoutMode,
                            })
                          : undefined
                      }
                      className={`rounded border px-2 py-0.5 text-[10px] transition ${
                        selectedLayoutMode === option.key
                          ? 'border-[color:var(--builder-deep)] bg-[color:var(--builder-panel)] text-[color:var(--builder-deep)]'
                          : 'border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] text-[color:var(--builder-muted)]'
                      } ${selectedItem ? '' : 'cursor-not-allowed opacity-45'}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="m-0 mt-1.5 max-w-[40rem] text-[10px] leading-4 text-[color:var(--builder-muted)]">
                {selectedItem
                  ? {
                      stacked:
                        'Widgets stack like blocks to form the page. Use spacing controls to refine placement.',
                      free:
                        'Widgets can be dragged and attached freely inside the canvas. Hotspot modules usually use this mode.',
                      floating:
                        'Widgets can be dragged freely and stay pinned to a fixed screen position while the page scrolls.',
                    }[selectedLayoutMode]
                  : 'Select a widget on the canvas to change its layout mode.'}
              </p>
            </div>
          </div>
          <div className="grid min-h-[126px] shrink-0 content-start justify-items-end gap-0 px-0.5 py-0 text-right text-[10px] leading-4 text-[color:var(--builder-muted)]">
            <p className="m-0 text-[10px] text-[color:var(--builder-deep)]">
              Board {canvas.width}px × {canvas.height}px
            </p>
            <p className="m-0 text-[10px]">Responsive</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[color:var(--builder-panel)] px-3 py-3">
          <div className="inline-block min-w-full">
            <div
              className={`mx-auto w-max p-2 transition duration-150 ${
                isOver ? 'scale-[0.995]' : ''
              }`}
              style={{
                backgroundColor: isOver
                  ? 'color-mix(in oklab, var(--builder-panel) 76%, var(--builder-accent-ink) 24%)'
                  : 'color-mix(in oklab, var(--builder-paper) 70%, var(--builder-panel) 30%)',
              }}
            >
              <div
                ref={composedRef}
                className="relative overflow-hidden border border-dashed border-[color:var(--builder-line)] bg-[color:var(--builder-paper)]"
                style={{ width: canvas.width, height: canvas.height }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(75,90,116,0.06) 1px, transparent 1px), linear-gradient(rgba(75,90,116,0.06) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at 18% 22%, rgba(115,146,196,0.08), transparent 18%), radial-gradient(circle at 82% 76%, rgba(214,167,96,0.08), transparent 16%)',
                  }}
                />
                {canvas.items.length === 0 ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="max-w-md px-4 py-4 text-center">
                      <p className="m-0 text-[0.66rem] uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
                        Empty Canvas
                      </p>
                      <h3 className="m-0 mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-[color:var(--builder-deep)]">
                        Drag widgets here
                      </h3>
                      <p className="m-0 mt-2 text-[12px] leading-5 text-[color:var(--builder-muted)]">
                        Start by dropping a widget, then adjust position and size as needed. The preview updates on the right.
                      </p>
                    </div>
                  </div>
                ) : null}

                {canvas.items.map((item) => {
                  const widget = widgets.find((entry) => entry.id === item.widgetId);
                  if (!widget) {
                    return null;
                  }

                  return (
                    <CanvasItem
                      key={item.id}
                      item={item}
                      widget={widget}
                      canvasWidth={canvas.width}
                      selected={selectedItem?.id === item.id}
                      onSelect={onSelectItem}
                      dispatch={dispatch}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

export default BuilderCanvas;
