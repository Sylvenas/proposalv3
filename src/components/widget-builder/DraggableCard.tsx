'use client';

import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';

import type { Widget } from './types';

interface DraggableCardProps {
  widget: Widget;
  disabled: boolean;
}

function WidgetGlyph({ widget }: { widget: Widget }) {
  if (widget.id === 'company-info') {
    return (
      <div className="grid h-12 w-12 grid-cols-2 gap-1">
        <div className="rounded-[0.25rem] bg-[color:var(--builder-deep)]" />
        <div className="rounded-[0.25rem] bg-[color:var(--builder-deep)]" />
        <div className="h-2 rounded-full bg-[color:var(--builder-deep)]" />
        <div className="h-2 rounded-full bg-[color:var(--builder-deep)]" />
      </div>
    );
  }

  if (widget.id === 'sales-info') {
    return (
      <div className="relative h-12 w-12">
        <div className="absolute inset-x-3 top-2 h-5 rounded-full border-[2px] border-[color:var(--builder-deep)]" />
        <div className="absolute inset-x-1.5 bottom-3 h-5 rounded-[0.9rem] border-[2px] border-[color:var(--builder-deep)]" />
        <div className="absolute left-0.5 top-4.5 h-4 w-2.5 rounded-full border-[2px] border-[color:var(--builder-deep)]" />
        <div className="absolute right-0.5 top-4.5 h-4 w-2.5 rounded-full border-[2px] border-[color:var(--builder-deep)]" />
      </div>
    );
  }

  if (widget.id === 'product-list-priced') {
    return (
      <div className="grid h-12 w-12 grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[0.15rem] border-[2px] border-[color:var(--builder-deep)]"
          />
        ))}
      </div>
    );
  }

  if (widget.id === 'product-list-plain') {
    return (
      <div className="grid h-12 w-12 content-center gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[2px] rounded-full bg-[color:var(--builder-deep)]"
          />
        ))}
      </div>
    );
  }

  if (widget.id === 'help-center') {
    return (
      <div className="relative h-12 w-12">
        <div className="absolute inset-1.5 rounded-full border-[2px] border-[color:var(--builder-deep)]" />
        <div className="absolute left-1/2 top-[0.62rem] h-4 w-4 -translate-x-1/2 rounded-full bg-[color:var(--builder-deep)] text-center text-[10px] font-semibold leading-4 text-white">
          ?
        </div>
        <div className="absolute bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[color:var(--builder-deep)]" />
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12">
      <div className="absolute inset-2.5 rotate-45 border-[2px] border-[color:var(--builder-deep)]" />
      <div className="absolute inset-[0.9rem] rotate-45 border-[2px] border-[color:var(--builder-deep)]" />
    </div>
  );
}

export default function DraggableCard({ widget, disabled }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: widget.id,
    disabled,
    data: {
      type: 'WIDGET_DROP',
      widgetId: widget.id,
      defaultSize: widget.defaultSize,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.25 : disabled ? 0.42 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={`group relative w-full overflow-hidden rounded-lg border px-1.5 py-1.5 text-center transition duration-150 ${
        disabled
          ? 'cursor-not-allowed border-[color:var(--builder-line)] bg-[color:var(--builder-panel)]'
          : 'cursor-grab border-[color:transparent] bg-[color:var(--builder-paper)] hover:bg-[color:var(--builder-panel)] active:cursor-grabbing'
      }`}
      {...listeners}
      {...attributes}
    >
      <div
        className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklab, white 76%, var(--builder-paper-2) 24%), transparent)',
        }}
      />
      <div className="relative grid justify-items-center gap-1.5">
        <div
          className="grid h-14 w-full place-items-center rounded-lg"
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--builder-paper) 65%, var(--builder-panel) 35%)',
          }}
        >
          <WidgetGlyph widget={widget} />
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-[12px] font-medium leading-4 tracking-[-0.01em] text-[color:var(--builder-deep)]">
            {widget.label}
          </h3>
          {widget.group ? (
            <p className="m-0 mt-0.5 text-[10px] leading-3.5 text-[color:var(--builder-muted)]">
              {widget.group}
            </p>
          ) : null}
        </div>
        {disabled ? (
          <span className="text-[10px] text-[color:var(--builder-muted)]">
            In use
          </span>
        ) : null}
      </div>
    </button>
  );
}
