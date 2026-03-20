'use client';

import { widgetPreviewMock } from '@/data/widgetPreviewMock';

import CanvasItemContent from './CanvasItemContent';
import type { Widget } from './types';

interface PreviewWidgetContentProps {
  widget: Widget;
  autoHeight?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PreviewWidgetContent({
  widget,
  autoHeight = false,
}: PreviewWidgetContentProps) {
  if (widget.id === 'help-center') {
    return (
      <div className={`w-full bg-transparent ${autoHeight ? '' : 'h-full'}`}>
        <div className="flex h-full w-full items-center justify-center p-1">
          <button
            type="button"
            className="grid aspect-square h-full place-items-center rounded-full bg-[color:var(--builder-deep)] text-white shadow-[0_6px_18px_rgba(15,23,42,0.18)]"
            aria-label="Open help center"
            onClick={() => {
              window.alert('Help Center clicked');
            }}
          >
            <span className="text-[1.1rem] font-semibold leading-none">?</span>
          </button>
        </div>
      </div>
    );
  }

  if (widget.id === 'product-list-priced') {
    return (
      <div className={`flex flex-col overflow-hidden bg-[color:var(--builder-paper)] ${autoHeight ? '' : 'h-full'}`}>
        <div className={`flex flex-col p-3 ${autoHeight ? '' : 'h-full'}`}>
          <div className="border-b border-[color:var(--builder-line)] pb-2">
            <div className="grid grid-cols-[1.7fr_0.65fr_0.8fr] gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--builder-muted)]">
              <span>Description</span>
              <span>Quantity</span>
              <span className="text-right">Amount</span>
            </div>
          </div>

          <div className={`grid gap-1.5 pt-2 text-[0.74rem] ${autoHeight ? '' : 'flex-1'}`}>
            {widgetPreviewMock.productList.map((item) => (
              <div
                key={item.name}
                className="grid cursor-pointer grid-cols-[1.7fr_0.65fr_0.8fr] gap-3 border-b border-[color:color-mix(in_oklab,var(--builder-line)_70%,transparent)] py-2 transition hover:bg-[color:color-mix(in_oklab,var(--builder-paper)_92%,var(--builder-panel)_8%)] last:border-b-0"
                onClick={() => {
                  window.alert(item.name);
                }}
              >
                <div>
                  <p className="m-0 font-medium text-[color:var(--builder-deep)]">
                    {item.name}
                  </p>
                  <p className="m-0 mt-1 text-[0.72rem] leading-5 text-[color:var(--builder-muted)]">
                    {item.subtitle}
                  </p>
                </div>
                <p className="m-0 text-[color:var(--builder-deep)]">{item.quantity}</p>
                <p className="m-0 text-right font-medium text-[color:var(--builder-deep)]">
                  {item.amount}
                </p>
              </div>
            ))}

            <div className="mt-auto grid gap-1 pt-2 text-[0.74rem]">
              {widgetPreviewMock.productSummary.map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between ${
                    row.label === 'Total'
                      ? 'font-semibold text-[color:var(--builder-deep)]'
                      : 'text-[color:var(--builder-muted)]'
                  }`}
                >
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (widget.id === 'product-list-plain') {
    return (
      <div className={`flex flex-col overflow-hidden bg-[color:var(--builder-paper)] p-4 ${autoHeight ? '' : 'h-full'}`}>
        <p className="m-0 text-[1rem] font-semibold text-[color:var(--builder-deep)]">
          {widgetPreviewMock.plainProductList.headline}
        </p>
        <ul className="m-0 mt-3 grid gap-2 pl-5 text-[0.8rem] text-[color:var(--builder-deep)]">
          {widgetPreviewMock.plainProductList.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (widget.id === 'payment-plan') {
    return (
      <div className={`flex flex-col overflow-hidden bg-[color:var(--builder-paper)] p-4 ${autoHeight ? '' : 'h-full'}`}>
        <p className="m-0 text-[1.02rem] font-semibold text-[color:var(--builder-deep)]">
          Project Summary
        </p>

        <div className="mt-3 grid gap-1.5 text-[0.78rem]">
          {widgetPreviewMock.paymentSummary.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 text-[color:var(--builder-muted)]"
            >
              <span>{row.label}</span>
              <span className="text-right text-[color:var(--builder-deep)]">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-1.5 text-[0.79rem]">
          {widgetPreviewMock.paymentDetails.map((row) => (
            <div
              key={row.label}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 ${
                row.emphatic
                  ? 'text-[1.04rem] font-semibold text-[color:var(--builder-deep)]'
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

  const fieldValues: Partial<Record<string, string>> = {
    'company-info': {
      name: widgetPreviewMock.companyInfo.name,
      logo: 'Northwind logo',
      tagline: widgetPreviewMock.companyInfo.tagline,
    },
    'sales-info': {
      name: widgetPreviewMock.salesInfo.name,
      phone: widgetPreviewMock.salesInfo.phone,
      email: widgetPreviewMock.salesInfo.email,
      region: widgetPreviewMock.salesInfo.region,
    },
  }[widget.id] ?? {};

  const imageValues: Partial<Record<string, string>> = {
    'company-info': {
      logo: '/vite.svg',
    },
  }[widget.id] ?? {};

  return (
    <CanvasItemContent
      widget={widget}
      compact
      fieldValues={fieldValues}
      imageValues={imageValues}
      borderless
      autoHeight={autoHeight}
    />
  );
}
