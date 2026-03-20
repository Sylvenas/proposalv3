'use client';

import { useMemo, useState } from 'react';

import type { Widget } from './types';
import DraggableCard from './DraggableCard';

interface WidgetPanelProps {
  widgets: Widget[];
  placedWidgetIds: string[];
}

export default function WidgetPanel({
  widgets,
  placedWidgetIds,
}: WidgetPanelProps) {
  const groups = useMemo(
    () => ['Company', 'Sales', 'Products', 'Payment', 'Help Center'],
    []
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Company: true,
    Sales: false,
    Products: true,
    Payment: false,
    'Help Center': true,
  });

  const widgetsByCategory = widgets.reduce<Record<string, Widget[]>>((acc, widget) => {
    acc[widget.category] ??= [];
    acc[widget.category].push(widget);
    return acc;
  }, {});

  function toggleGroup(group: string) {
    setOpenGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[color:var(--builder-line)] bg-[color:var(--builder-paper)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[color:var(--builder-line)] px-3 py-3">
        <p className="m-0 text-[0.66rem] uppercase tracking-[0.2em] text-[color:var(--builder-muted)]">
          Components
        </p>
        <h2 className="m-0 mt-1.5 text-[1.05rem] font-semibold tracking-[-0.03em] text-[color:var(--builder-deep)]">
          Widget Library
        </h2>
      </div>

      <div className="scrollbar-none flex-1 overflow-y-auto px-2.5 py-2.5">
        <div className="grid gap-1.5">
          {groups.map((group) => {
            const groupWidgets = widgetsByCategory[group] ?? [];
            const isOpen = openGroups[group];

            return (
              <section key={group} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="flex w-full items-center justify-between border-b border-[color:var(--builder-line)] px-1.5 py-3 text-left"
                >
                  <div>
                    <p className="m-0 text-[13px] font-semibold text-[color:var(--builder-deep)]">
                      {group}
                    </p>
                  </div>
                  <span className="text-sm text-[color:var(--builder-muted)]">
                    {isOpen ? '⌄' : '›'}
                  </span>
                </button>

                {isOpen ? (
                  <div className="bg-[color:var(--builder-paper)] py-2">
                    <div className="grid grid-cols-3 gap-x-1.5 gap-y-2">
                      {groupWidgets.map((widget) => (
                        <DraggableCard
                          key={widget.id}
                          widget={widget}
                          disabled={placedWidgetIds.includes(widget.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
