'use client';

import type { Widget } from './types';

interface CanvasItemContentProps {
  widget: Widget;
  compact?: boolean;
  fieldValues?: Partial<Record<string, string>>;
  imageValues?: Partial<Record<string, string>>;
  borderless?: boolean;
  autoHeight?: boolean;
}

function ProductListPlaceholder({ compact }: { compact: boolean }) {
  return (
    <div className={`flex h-full flex-col ${compact ? 'p-3' : 'p-3'}`}>
      <div className="border-b border-[color:var(--builder-line)] pb-2">
        <div className="grid grid-cols-[1.6fr_0.7fr_0.8fr] gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--builder-muted)]">
          <span>Description</span>
          <span>Quantity</span>
          <span className="text-right">Amount</span>
        </div>
      </div>

      <div className="grid flex-1 gap-2 pt-2">
        <div className="grid grid-cols-[1.6fr_0.7fr_0.8fr] gap-3 border-b border-[color:var(--builder-line)] py-2">
          <div>
            <p className="m-0 font-medium text-[color:var(--builder-deep)]">
              Product item
            </p>
            <p className="m-0 mt-1 text-[0.72rem] text-[color:var(--builder-muted)]">
              Short placeholder description
            </p>
          </div>
          <p className="m-0 text-[color:var(--builder-deep)]">24 pcs</p>
          <p className="m-0 text-right font-medium text-[color:var(--builder-deep)]">
            $1,920
          </p>
        </div>

        <div className="grid grid-cols-[1.6fr_0.7fr_0.8fr] gap-3 border-b border-[color:var(--builder-line)] py-2">
          <div>
            <p className="m-0 font-medium text-[color:var(--builder-deep)]">
              Additional item
            </p>
            <p className="m-0 mt-1 text-[0.72rem] text-[color:var(--builder-muted)]">
              Another line used for layout sizing
            </p>
          </div>
          <p className="m-0 text-[color:var(--builder-deep)]">12 sets</p>
          <p className="m-0 text-right font-medium text-[color:var(--builder-deep)]">
            $840
          </p>
        </div>

        <div className="mt-auto grid gap-1 pt-2 text-[0.76rem]">
          <div className="flex items-center justify-between text-[color:var(--builder-muted)]">
            <span>Subtotal</span>
            <span>$2,760</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-[color:var(--builder-deep)]">
            <span>Total</span>
            <span>$3,240</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlainProductListPlaceholder() {
  return (
    <div className="flex h-full flex-col p-4">
      <p className="m-0 text-[1rem] font-semibold text-[color:var(--builder-deep)]">
        Scope list placeholder
      </p>
      <ul className="m-0 mt-3 grid gap-2 pl-5 text-[0.8rem] text-[color:var(--builder-deep)]">
        <li>Primary installation item</li>
        <li>Gate or entry scope item</li>
        <li>Area-based work item</li>
        <li>Removal and haul-off scope</li>
        <li>Other material or accessory</li>
      </ul>
    </div>
  );
}

function PaymentPlanPlaceholder() {
  const summaryRows = [
    ['Primary category', '$16.00'],
    ['Line products', '$17,328'],
    ['Area products', '$26,300'],
    ['Other items', '$520'],
  ];

  const detailRows = [
    { label: 'Total investment', value: '$44,164', emphatic: true },
    { label: 'Discount amount', value: '-$4,006' },
    { label: 'Total contract price', value: '$40,158', emphatic: true },
    { label: 'Deposit paid', value: '$7,952' },
    { label: 'Amount due upon completion', value: '$32,207', emphatic: true },
    { label: 'Payment method', value: 'Financing' },
    { label: 'Estimated monthly payment', value: '$894', nested: true },
    { label: 'Term', value: '36 months', nested: true },
  ];

  return (
    <div className="flex h-full flex-col p-4">
      <p className="m-0 text-[0.98rem] font-semibold text-[color:var(--builder-deep)]">
        Project Summary
      </p>

      <div className="mt-3 grid gap-1.5 text-[0.74rem]">
        {summaryRows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 text-[color:var(--builder-muted)]"
          >
            <span>{label}</span>
            <span className="text-right text-[color:var(--builder-deep)]">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-1.5 text-[0.74rem]">
        {detailRows.map((row) => (
          <div
            key={row.label}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 ${
              row.emphatic
                ? 'text-[0.92rem] font-semibold text-[color:var(--builder-deep)]'
                : row.nested
                  ? 'pl-5 text-[color:var(--builder-muted)]'
                  : 'text-[color:var(--builder-muted)]'
            }`}
          >
            <span>{row.label}</span>
            <span className="text-right text-[color:var(--builder-deep)]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpCenterPlaceholder({ borderless }: { borderless: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-1">
      <div
        className={`grid aspect-square h-full place-items-center rounded-full ${
          borderless
            ? 'bg-[color:var(--builder-deep)] text-white'
            : 'border border-dashed border-[color:var(--builder-line)] bg-[color:var(--builder-paper-2)] text-[color:var(--builder-deep)]'
        }`}
      >
        <span className="text-[1.15rem] font-semibold leading-none">?</span>
      </div>
    </div>
  );
}

export default function CanvasItemContent({
  widget,
  compact = false,
  fieldValues,
  imageValues,
  borderless = false,
  autoHeight = false,
}: CanvasItemContentProps) {
  if (widget.id === 'product-list-priced') {
    return (
      <div
        className={`flex h-full flex-col overflow-hidden bg-[color:var(--builder-paper)] ${
          borderless
            ? ''
            : 'rounded-md border border-dashed border-[color:var(--builder-line)] shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
        }`}
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklab, white 92%, var(--builder-paper-2) 8%), color-mix(in oklab, var(--builder-paper) 86%, var(--builder-panel) 14%))',
        }}
      >
        <div style={{ borderTop: borderless ? 'none' : `3px solid ${widget.accent}` }}>
          <ProductListPlaceholder compact={compact} />
        </div>
      </div>
    );
  }

  if (widget.id === 'product-list-plain') {
    return (
      <div
        className={`flex h-full flex-col overflow-hidden bg-[color:var(--builder-paper)] ${
          borderless
            ? ''
            : 'rounded-md border border-dashed border-[color:var(--builder-line)] shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
        }`}
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklab, white 92%, var(--builder-paper-2) 8%), color-mix(in oklab, var(--builder-paper) 86%, var(--builder-panel) 14%))',
        }}
      >
        <div style={{ borderTop: borderless ? 'none' : `3px solid ${widget.accent}` }}>
          <PlainProductListPlaceholder />
        </div>
      </div>
    );
  }

  if (widget.id === 'payment-plan') {
    return (
      <div
        className={`flex h-full flex-col overflow-hidden bg-[color:var(--builder-paper)] ${
          borderless
            ? ''
            : 'rounded-md border border-dashed border-[color:var(--builder-line)] shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
        }`}
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklab, white 92%, var(--builder-paper-2) 8%), color-mix(in oklab, var(--builder-paper) 86%, var(--builder-panel) 14%))',
        }}
      >
        <div style={{ borderTop: borderless ? 'none' : `3px solid ${widget.accent}` }}>
          <PaymentPlanPlaceholder />
        </div>
      </div>
    );
  }

  if (widget.id === 'help-center') {
    return (
      <div className={`${autoHeight ? '' : 'h-full'} w-full bg-transparent`}>
        <HelpCenterPlaceholder borderless={borderless} />
      </div>
    );
  }

  return (
    <div
      className={`flex ${autoHeight ? '' : 'h-full'} flex-col overflow-hidden bg-[color:var(--builder-paper)] ${
        borderless
          ? ''
          : 'rounded-md border border-dashed border-[color:var(--builder-line)] shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
      }`}
      style={{
        background:
          'linear-gradient(180deg, color-mix(in oklab, white 92%, var(--builder-paper-2) 8%), color-mix(in oklab, var(--builder-paper) 86%, var(--builder-panel) 14%))',
      }}
    >
      <div
        className={`grid gap-2.5 ${autoHeight ? '' : 'flex-1'} ${compact ? 'p-3 text-[0.74rem]' : 'p-3 text-[0.8rem]'}`}
        style={{
          borderTop: borderless ? 'none' : `3px solid ${widget.accent}`,
        }}
      >
        {widget.fields.map((field, index) => {
          const isImage = field.type === 'image';
          const isList = field.type === 'list';

          return (
            <div
              key={field.key}
              className={`rounded-md border border-[color:var(--builder-line)] ${
                isImage ? 'min-h-16' : ''
              }`}
              style={{
                backgroundColor:
                  index % 2 === 0
                    ? 'color-mix(in oklab, var(--builder-paper) 76%, var(--builder-paper-2) 24%)'
                    : 'color-mix(in oklab, white 84%, var(--builder-panel) 16%)',
              }}
            >
              <div className="flex items-start justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  {!isImage ? (
                    <p className="m-0 break-words font-medium text-[color:var(--builder-deep)]">
                      {fieldValues?.[field.key] ?? field.placeholder}
                    </p>
                  ) : null}
                </div>
                {isImage ? (
                  imageValues?.[field.key] ? (
                    <img
                      src={imageValues[field.key]}
                      alt={fieldValues?.[field.key] ?? widget.label}
                      className="mt-0.5 h-11 w-14 shrink-0 rounded-md border border-[color:var(--builder-line)] object-contain bg-white p-1"
                    />
                  ) : (
                    <div
                      className="mt-0.5 h-11 w-14 shrink-0 rounded-md border border-dashed border-[color:var(--builder-line)]"
                      style={{ backgroundColor: 'color-mix(in oklab, white 62%, var(--builder-paper-2) 38%)' }}
                    />
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
