'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import PreviewWidgetContent from './PreviewWidgetContent';
import type { CanvasState, Widget } from './types';

interface PreviewPaneProps {
  canvas: CanvasState;
  widgets: Widget[];
}

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Helvetica', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Trebuchet', value: '"Trebuchet MS", "Segoe UI", sans-serif' },
  { label: 'Courier', value: '"Courier New", Courier, monospace' },
  { label: 'Palatino', value: '"Palatino Linotype", Palatino, serif' },
];

export default function PreviewPane({ canvas, widgets }: PreviewPaneProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState(320);
  const [previewHeight, setPreviewHeight] = useState(canvas.height);
  const [pageBackground, setPageBackground] = useState('#ffffff');
  const [pageTextColor, setPageTextColor] = useState('#1f2937');
  const [pageFont, setPageFont] = useState(FONT_OPTIONS[0].value);
  const [pageFontSize, setPageFontSize] = useState(100);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) {
      return;
    }

    const updateWidth = () => {
      setPreviewWidth(Math.max(260, Math.floor(node.clientWidth)));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const stackedItems = useMemo(
    () =>
      canvas.items
        .filter((item) => item.layoutMode === 'stacked')
        .sort((a, b) => a.y - b.y),
    [canvas.items]
  );
  const freeItems = useMemo(
    () => canvas.items.filter((item) => item.layoutMode === 'free'),
    [canvas.items]
  );
  const floatingItems = useMemo(
    () => canvas.items.filter((item) => item.layoutMode === 'floating'),
    [canvas.items]
  );

  useEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }

    const updateHeight = () => {
      setPreviewHeight(
        Math.max(canvas.height, freeItems.length > 0 ? node.offsetHeight : 0, node.scrollHeight)
      );
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => observer.disconnect();
  }, [canvas.height, freeItems.length, stackedItems.length]);

  const scale = previewWidth / canvas.width;
  const contentScale = pageFontSize / 100;
  const previewTheme = useMemo(
    () =>
      ({
        '--builder-paper': pageBackground,
        '--builder-paper-2': pageBackground,
        '--builder-deep': pageTextColor,
        '--builder-ink': pageTextColor,
        '--builder-muted': `color-mix(in srgb, ${pageTextColor} 72%, white 28%)`,
        fontFamily: pageFont,
        color: pageTextColor,
        backgroundColor: pageBackground,
      }) as CSSProperties,
    [pageBackground, pageFont, pageTextColor]
  );

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)]">
      <div className="border-b border-[color:var(--builder-line)] px-3 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_96px] items-start gap-4">
          <div className="grid min-h-[126px] min-w-0 grid-rows-[auto_auto_1fr]">
            <p className="m-0 h-4 text-[12px] uppercase tracking-[0.16em] text-[color:var(--builder-muted)]">
              Preview
            </p>
            <h2 className="m-0 mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-[color:var(--builder-deep)]">
              Live Preview
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-1.5 xl:grid-cols-4">
              <label className="grid gap-1.5 text-[10px] text-[color:var(--builder-muted)]">
                <span className="text-[10px]">Background</span>
                <div className="flex h-7 items-center rounded border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] px-2">
                  <input
                    type="color"
                    value={pageBackground}
                    onChange={(event) => setPageBackground(event.target.value)}
                    className="h-4 w-7 cursor-pointer rounded border border-[color:var(--builder-line)] bg-transparent p-0.5"
                  />
                </div>
              </label>

              <label className="grid gap-1.5 text-[10px] text-[color:var(--builder-muted)]">
                <span className="text-[10px]">Text</span>
                <div className="flex h-7 items-center rounded border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] px-2">
                  <input
                    type="color"
                    value={pageTextColor}
                    onChange={(event) => setPageTextColor(event.target.value)}
                    className="h-4 w-7 cursor-pointer rounded border border-[color:var(--builder-line)] bg-transparent p-0.5"
                  />
                </div>
              </label>

              <label className="grid gap-1.5 text-[10px] text-[color:var(--builder-muted)]">
                <span className="text-[10px]">Font</span>
                <select
                  value={pageFont}
                  onChange={(event) => setPageFont(event.target.value)}
                  className="h-7 min-w-0 rounded border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] px-2 text-[12px] text-[color:var(--builder-deep)] outline-none"
                >
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-[10px] text-[color:var(--builder-muted)]">
                <span className="text-[10px]">Text Size</span>
                <div className="flex h-7 items-center gap-2 rounded border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] px-2">
                  <input
                    type="range"
                    min="85"
                    max="125"
                    step="5"
                    value={pageFontSize}
                    onChange={(event) => setPageFontSize(Number(event.target.value))}
                    className="min-w-0 flex-1 accent-[color:var(--builder-deep)]"
                  />
                  <span className="min-w-[2.75rem] text-right text-[12px] text-[color:var(--builder-deep)]">
                    {pageFontSize}%
                  </span>
                </div>
              </label>
            </div>
          </div>
          <div className="grid min-h-[126px] content-start justify-items-end gap-0 px-0.5 py-0 text-right text-[10px] leading-4 text-[color:var(--builder-muted)]">
            <p className="m-0 text-[10px] text-[color:var(--builder-deep)]">
              Scale {Math.round(scale * 100)}%
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[color:var(--builder-panel)] px-3 py-3">
        {floatingItems.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div className="mx-auto h-full w-full max-w-[760px] px-2">
              <div className="relative mx-auto" style={{ width: previewWidth, height: 0 }}>
                {floatingItems.map((item) => {
                  const widget = widgets.find((entry) => entry.id === item.widgetId);
                  if (!widget) {
                    return null;
                  }

                  return (
                    <div
                      key={item.id}
                      className="absolute"
                      style={{
                        left: item.x * scale,
                        top: item.y * scale,
                        width: item.w * scale,
                        height: item.h * scale,
                      }}
                    >
                      <div
                        className="h-full w-full origin-top-left"
                        style={{
                          width: `${100 / contentScale}%`,
                          height: `${100 / contentScale}%`,
                          transform: `scale(${contentScale})`,
                        }}
                      >
                        <PreviewWidgetContent widget={widget} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="h-full overflow-auto">
          <div className="relative mx-auto w-full max-w-[760px]">
            <div
            ref={frameRef}
            className="mx-auto w-full max-w-[760px] p-2"
            style={{
              backgroundColor:
                'color-mix(in oklab, var(--builder-paper) 70%, var(--builder-panel) 30%)',
            }}
          >
            <div
              className="relative overflow-hidden bg-[color:var(--builder-paper)]"
              style={{
                ...previewTheme,
                width: previewWidth,
                height: previewHeight * scale,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at top, rgba(115,146,196,0.06), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.55), transparent 20%)',
                }}
              />

              <div
                ref={contentRef}
                className="absolute left-0 top-0 origin-top-left"
                style={{
                  width: canvas.width,
                  minHeight: freeItems.length > 0 ? canvas.height : 0,
                  transform: `scale(${scale})`,
                }}
              >
                <div className="grid gap-3 px-3 py-3">
                  {stackedItems.map((item) => {
                    const widget = widgets.find((entry) => entry.id === item.widgetId);
                    if (!widget) {
                      return null;
                    }

                    return (
                      <div key={item.id} style={{ width: '100%' }}>
                        <div
                          className="h-full w-full origin-top-left"
                          style={{
                            width: `${100 / contentScale}%`,
                            transform: `scale(${contentScale})`,
                          }}
                        >
                          <PreviewWidgetContent widget={widget} autoHeight />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {freeItems.map((item) => {
                  const widget = widgets.find((entry) => entry.id === item.widgetId);
                  if (!widget) {
                    return null;
                  }

                  return (
                    <div
                      key={item.id}
                      className="absolute"
                      style={{
                        left: item.x,
                        top: item.y,
                        width: item.w,
                        height: item.h,
                      }}
                    >
                      <div
                        className="h-full w-full origin-top-left"
                        style={{
                          width: `${100 / contentScale}%`,
                          height: `${100 / contentScale}%`,
                          transform: `scale(${contentScale})`,
                        }}
                      >
                        <PreviewWidgetContent widget={widget} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </aside>
  );
}
