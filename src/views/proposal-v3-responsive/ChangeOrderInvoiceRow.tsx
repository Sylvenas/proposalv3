'use client';

// ── Shared payment blocks ─────────────────────────────────────────────────────
// Single source of truth for the small payment-related cards used by:
//   • ChangeOrderPage's Invoices & Payments "Before / After" comparison panels
//   • ChangeHistoryView's "Payment Progress & Schedule" snapshot
// Keeping them here avoids duplicating layout/typography between the two
// views, and avoids the circular import that would happen if ChangeHistoryView
// imported them directly from ChangeOrderPage (its parent).

// ── Progress block ────────────────────────────────────────────────────────────
// Tinted card with: uppercase label, slim pill progress bar (received +
// hatched processing segments), and a two-column amounts row underneath.
export function PaymentProgressBlock({
  progressLabel,
  received,
  processing,
  invoiceTotal,
  outstanding,
  receivedPct = 15,
  processingPct = 15,
  bg = '#f5f5f5',
  padding = '24px 20px',
}: {
  progressLabel: string;
  received: string;
  processing: string;
  invoiceTotal: string;
  outstanding: string;
  /** Width (0-100) of the solid green received segment. */
  receivedPct?: number;
  /** Width (0-100) of the hatched processing segment. */
  processingPct?: number;
  /** Card fill color. Neutral comparison = #f5f5f5, blue (After CO) = #eef2f9. */
  bg?: string;
  /** Card padding. Defaults to '24px 20px' (Comparison Panel use); the
   *  PaymentScheduleDialog use passes '0' to drop the inner card chrome. */
  padding?: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 w-full"
      style={{ background: bg, borderRadius: 8, padding }}
    >
      <p className="text-[12px] font-semibold text-[#262626] uppercase tracking-[0.06em]">
        {progressLabel}
      </p>
      {/* 6px pill track on #e5e5e5, solid #04b50b received segment, hatched
          diagonal #6fd073 over #c4ecc6 processing segment. */}
      <div
        className="relative w-full"
        style={{ height: 6, background: '#e5e5e5', borderRadius: 999 }}
      >
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 999 }}>
          <div
            className="absolute top-0 left-0 h-full"
            style={{ width: `${receivedPct}%`, background: '#04b50b' }}
          />
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${receivedPct}%`,
              width: `${processingPct}%`,
              backgroundColor: '#c4ecc6',
              backgroundImage:
                'repeating-linear-gradient(-45deg, #6fd073 0, #6fd073 4px, transparent 4px, transparent 8px)',
            }}
          />
        </div>
      </div>
      <div className="flex flex-row justify-between w-full text-[12px] xl:text-[14px] text-[#737373]">
        <div className="flex flex-col gap-0.5">
          <span>
            Received · <span className="text-[#04b50b]">{received}</span>
          </span>
          <span>
            Processing · <span className="text-[#04b50b]">{processing}</span>
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span>
            Outstanding · <span className="text-[#262626]">{outstanding}</span>
          </span>
          <span>
            Invoice Total · <span className="text-[#262626]">{invoiceTotal}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export type InvoiceRowData = {
  num: number;
  label: string;
  paid: string;
  total: string;
  statusLine: string;
  status: 'paid' | 'partial' | 'pending';
};

export function InvoiceComparisonRow({
  row,
  bg = '#ffffff',
}: {
  row: InvoiceRowData;
  /** Body fill color. Defaults to white (used by the Invoices & Payments
   *  comparison panels where the row sits on a tinted card). Change History's
   *  Payment Snapshot passes `#f5f5f5` so the row reads as a card on the
   *  section's white background. */
  bg?: string;
}) {
  const accentColor =
    row.status === 'paid' ? '#04b50b' : row.status === 'partial' ? '#3b82f6' : '#9ca3af';
  return (
    <div className="flex w-full overflow-hidden" style={{ background: bg }}>
      <div style={{ width: 4, background: accentColor, flexShrink: 0 }} />
      <div className="flex-1 flex flex-row items-start justify-between px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[12px] xl:text-[14px] font-semibold text-[#737373] leading-normal">
            INVOICE #{row.num}
          </p>
          <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal">{row.label}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <p
            className="text-[12px] xl:text-[14px] leading-normal whitespace-nowrap"
            style={{ color: row.status === 'paid' ? '#04b50b' : '#737373' }}
          >
            {row.statusLine}
          </p>
          <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal whitespace-nowrap">
            <span style={{ color: row.status === 'pending' ? '#9ca3af' : '#04b50b' }}>
              {row.paid}
            </span>
            <span> / {row.total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
