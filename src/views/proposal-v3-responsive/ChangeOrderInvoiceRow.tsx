'use client';

import { useMemo } from 'react';
import { useDevConsole } from './DevConsoleContext';
import { buildInvoicesData } from './InvoicesPaymentsSection';
import type { ExistingPayment } from './DevConsoleContext';

// ── Shared payment blocks ─────────────────────────────────────────────────────
// Single source of truth for the small payment-related cards used by:
//   • ChangeOrderPage's Invoices & Payments "Before / After" comparison panels
//   • ChangeHistoryView's "Payment Progress & Schedule" snapshot
// Keeping them here avoids duplicating layout/typography between the two
// views, and avoids the circular import that would happen if ChangeHistoryView
// imported them directly from ChangeOrderPage (its parent).

// Color palette for the Over Paid warning indications. Toggled via the
// Developer Console's "Overpaid Indication" Section — 'red' is the alert
// palette, 'yellow' is the softer amber/orange variant.
const OVERPAID_PALETTE = {
  red: {
    solid: '#e0455e',
    hatchBase: '#f4cdcf',
    hatchStripe: '#e57180',
    text: '#d41a32',
  },
  yellow: {
    solid: '#fb923c',
    hatchBase: '#fed7aa',
    // Stripe sits one step lighter than the solid bar (orange-400 →
    // orange-300) so the hatched segment reads as a softer continuation
    // of the solid bar without dipping into the base color.
    hatchStripe: '#fdba74',
    // Text uses orange-500 (one step lighter than orange-600) so it
    // sits closer to the orange-400 solid bar's tone while still
    // remaining readable at small sizes.
    text: '#f97316',
  },
} as const;

function useOverpaidPalette() {
  const { config } = useDevConsole();
  return { ...OVERPAID_PALETTE[config.overpaidIndication], mode: config.overpaidIndication };
}

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
  labelClassName = 'text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal',
  outstandingMode = 'normal',
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
  /** Override classes for the progress label. ComparisonPanel passes the
   *  Invoices/Payments tab's heavier-weight style so its PROGRESS label
   *  matches the sibling INVOICES heading; Change History keeps the
   *  default lighter style. */
  labelClassName?: string;
  /** 'normal' (default) shows "Outstanding · {amount}" in neutral text.
   *  'refund' renders "Need Refund · {amount}" with the amount in red —
   *  used by the Over Paid state on the Change Order Invoices tab.
   *  'paidInFull' replaces the cell with a single green "Paid in Full"
   *  indicator (no amount) — used when the contract is fully settled. */
  outstandingMode?: 'normal' | 'refund' | 'paidInFull';
}) {
  const overpaidPalette = useOverpaidPalette();
  return (
    <div
      className="flex flex-col gap-2 w-full"
      style={{ background: bg, borderRadius: 8, padding }}
    >
      <p className={labelClassName}>
        {progressLabel}
      </p>
      {/* 6px pill track on #e5e5e5. Default palette = green: solid #04b50b
          received + hatched #6fd073 / #c4ecc6 processing. When
          outstandingMode === 'refund' (Over Paid), the bar swaps to the
          Overpaid Indication palette (red by default, yellow via the dev
          console toggle) — signaling that the cumulative payment has
          overshot the contract. */}
      {(() => {
        const isRefund = outstandingMode === 'refund';
        const solidColor = isRefund ? overpaidPalette.solid : '#04b50b';
        const hatchBase = isRefund ? overpaidPalette.hatchBase : '#c4ecc6';
        const hatchStripe = isRefund ? overpaidPalette.hatchStripe : '#6fd073';
        return (
          <div
            className="relative w-full"
            style={{ height: 6, background: '#e5e5e5', borderRadius: 999 }}
          >
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 999 }}>
              <div
                className="absolute top-0 left-0 h-full"
                style={{ width: `${receivedPct}%`, background: solidColor }}
              />
              <div
                className="absolute top-0 h-full"
                style={{
                  left: `${receivedPct}%`,
                  width: `${processingPct}%`,
                  backgroundColor: hatchBase,
                  backgroundImage: `repeating-linear-gradient(-45deg, ${hatchStripe} 0, ${hatchStripe} 4px, transparent 4px, transparent 8px)`,
                }}
              />
            </div>
          </div>
        );
      })()}
      <div className="flex flex-row justify-between w-full text-[12px] sm:text-[14px] xl:text-[14px] text-[#737373]">
        <div className="flex flex-col gap-0.5">
          <span>
            Received · <span className="text-[#04b50b]">{received}</span>
          </span>
          <span>
            Processing · <span className="text-[#04b50b]">{processing}</span>
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          {outstandingMode === 'paidInFull' ? (
            <span style={{ color: '#04b50b' }}>Paid in Full</span>
          ) : (
            <span>
              {outstandingMode === 'refund' ? 'Need Refund' : 'Outstanding'} ·{' '}
              <span
                style={{
                  color:
                    outstandingMode === 'refund' ? overpaidPalette.text : '#262626',
                }}
              >
                {outstandingMode === 'refund' ? outstanding.replace(/^-/, '') : outstanding}
              </span>
            </span>
          )}
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
  /** 'paid' — fully settled (solid green bar, "Paid on …").
   *  'processing' — fully paid but at least part of the payment is still
   *  in transit (hatched green bar, "Submitted on …") — matches the
   *  Invoices & Payments table's PROCESSING row treatment.
   *  'overPaid' — settled with cumulative payments exceeding the invoice
   *  amount (solid red bar, paid amount rendered in red). Used by the
   *  Over Paid state on the After-CO comparison panel.
   *  'partial' — partially paid (solid blue bar).
   *  'pending' — unpaid (grey bar). */
  status: 'paid' | 'processing' | 'overPaid' | 'partial' | 'pending';
  /** When true, the `total` field is rendered with a strikethrough — used
   *  for invoices whose total was fully absorbed by a contract reduction
   *  (i.e., the new total is $0 and the row needs a full refund). The
   *  `total` value should be the *original* amount so the strikethrough
   *  communicates "this $500 invoice is now voided". */
  voided?: boolean;
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
  const overpaidPalette = useOverpaidPalette();
  // Accent bar: solid green for paid, hatched green for processing
  // (matches InvoicesPaymentsSection's PROCESSING row treatment — light
  // green base #c4ecc6 with -45° diagonal #6fd073 stripes), hatched
  // overpaid-palette colors (red or yellow via the dev console toggle)
  // for over paid — same palette as the over-paid progress bar so the
  // row reads as "settled, but exceeds invoice total" — solid blue for
  // partial, neutral grey for pending.
  const barStyle: React.CSSProperties =
    row.status === 'processing'
      ? {
          backgroundColor: '#c4ecc6',
          backgroundImage:
            'repeating-linear-gradient(-45deg, #6fd073 0px, #6fd073 4px, transparent 4px, transparent 8px)',
        }
      : row.status === 'overPaid'
        ? // Yellow palette uses a solid bar (matches the row's overall
          // softer treatment); red keeps the hatched accent for stronger
          // alert affordance.
          overpaidPalette.mode === 'yellow'
          ? { background: overpaidPalette.solid }
          : {
              backgroundColor: overpaidPalette.hatchBase,
              backgroundImage: `repeating-linear-gradient(-45deg, ${overpaidPalette.hatchStripe} 0px, ${overpaidPalette.hatchStripe} 4px, transparent 4px, transparent 8px)`,
            }
        : {
            background:
              row.status === 'paid'
                ? '#04b50b'
                : row.status === 'partial'
                  ? '#3b82f6'
                  : '#9ca3af',
          };
  const settledColors =
    row.status === 'paid' || row.status === 'processing' || row.status === 'overPaid';
  // Color for the leading "paid" amount: green for settled rows, the
  // overpaid-palette text color for over paid (signals the dollar
  // overshoot), grey for unpaid pending.
  const paidAmountColor =
    row.status === 'overPaid'
      ? overpaidPalette.text
      : row.status === 'pending'
        ? '#9ca3af'
        : '#04b50b';
  return (
    <div className="flex w-full overflow-hidden" style={{ background: bg }}>
      <div style={{ width: 4, flexShrink: 0, ...barStyle }} />
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
            style={{ color: settledColors ? '#04b50b' : '#737373' }}
          >
            {row.statusLine}
          </p>
          <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal whitespace-nowrap">
            {row.status === 'overPaid' && (
              <span style={{ color: paidAmountColor }}>Overpaid </span>
            )}
            <span style={{ color: paidAmountColor }}>{row.paid}</span>
            <span> / </span>
            <span
              style={row.voided ? { textDecoration: 'line-through' } : undefined}
            >
              {row.total}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared Change Order panel data ───────────────────────────────────────────
// Builds the Before-CO / After-CO comparison-panel data and the augmented
// Payment Records list. The Invoices & Payments tab on the Change Order
// Approval page and the Payment Progress & Schedule snapshot in the
// Change History view both consume these so they stay in lockstep — both
// react to the Developer Console's "Existing Payment" toggle.

export type ChangeOrderInvoicePanel = {
  progressLabel: string;
  received: string;
  processing: string;
  invoiceTotal: string;
  outstanding: string;
  outstandingMode?: 'normal' | 'refund' | 'paidInFull';
  invoicesHeading: string;
  invoices: InvoiceRowData[];
};

export function getChangeOrderInvoicePanels(
  existingPayment: ExistingPayment,
): { before: ChangeOrderInvoicePanel; after: ChangeOrderInvoicePanel } {
  if (existingPayment === 'overPaid') {
    return {
      before: {
        // Over Paid: 2104 brings the total paid up to $12,999 — the full
        // pre-CO current contract. The last invoice's amount is dialed
        // down to $500 with the difference rolled into Inv #3 so the
        // After-CO cascade has to spill onto a second invoice.
        progressLabel: 'Current Progress · 100%',
        received: '$10,999',
        processing: '$2,000',
        invoiceTotal: '$12,999',
        outstanding: '$0',
        outstandingMode: 'paidInFull',
        invoicesHeading: 'Current Invoices · 3',
        invoices: [
          { num: 1, label: 'Deposit (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Submitted on Mar 23, 2026', status: 'processing' },
          { num: 2, label: 'Balance (32%)', paid: '$3,999', total: '$3,999', statusLine: 'Paid on May 2, 2026', status: 'paid' },
          { num: 3, label: 'Balance (50%)', paid: '$6,500', total: '$6,500', statusLine: 'Paid on Jun 11, 2026', status: 'paid' },
          { num: 4, label: 'Balance (4%)', paid: '$500', total: '$500', statusLine: 'Paid on Aug 20, 2026', status: 'paid' },
        ],
      },
      after: {
        // $12,999 paid against a $12,000 revised contract — a $999 overshoot.
        // Fully-paid invoices are immutable, so the Before-CO schedule is
        // inherited. The $999 contract reduction cascades from the tail:
        // Inv #4 ($500) absorbs $500, dropping to $0; the remaining $499
        // comes off Inv #3 ($6,500 → $6,001). Both rows end up over paid.
        progressLabel: 'Revised Progress · 108% (Overpaid)',
        received: '$10,999',
        processing: '$2,000',
        invoiceTotal: '$12,000',
        outstanding: '$999',
        outstandingMode: 'refund',
        invoicesHeading: 'Revised Invoices · 4',
        invoices: [
          { num: 1, label: 'Deposit (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Submitted on Mar 23, 2026', status: 'processing' },
          { num: 2, label: 'Balance (32%)', paid: '$3,999', total: '$3,999', statusLine: 'Paid on May 2, 2026', status: 'paid' },
          { num: 3, label: 'Balance (50%)', paid: '$6,500', total: '$6,001', statusLine: 'Paid on Jun 11, 2026', status: 'overPaid' },
          { num: 4, label: 'Balance (4%)', paid: '$500', total: '$500', voided: true, statusLine: 'Paid on Aug 20, 2026', status: 'overPaid' },
        ],
      },
    };
  }
  if (existingPayment === 'fullyPaid') {
    return {
      before: {
        // Fully Paid: $12,000 covers the full revised contract but leaves
        // $999 unpaid against the older $12,999 contract.
        progressLabel: 'Current Progress · 92%',
        received: '$10,000',
        processing: '$2,000',
        invoiceTotal: '$12,999',
        outstanding: '$999',
        invoicesHeading: 'Current Invoices · 3',
        invoices: [
          { num: 1, label: 'Deposit (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Submitted on Mar 23, 2026', status: 'processing' },
          { num: 2, label: 'Balance (32%)', paid: '$3,999', total: '$3,999', statusLine: 'Paid on May 2, 2026', status: 'paid' },
          { num: 3, label: 'Balance (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Paid on Jun 11, 2026', status: 'paid' },
          { num: 4, label: 'Balance (38%)', paid: '$4,001', total: '$5,000', statusLine: 'Due on Aug 20, 2026', status: 'partial' },
        ],
      },
      after: {
        // Inherits Before-CO schedule. Inv #4 was the only invoice still
        // partial ($4,001 / $5,000) — the $999 contract reduction lands
        // on its total, bringing it down to the amount already received.
        progressLabel: 'Revised Progress · 100%',
        received: '$10,000',
        processing: '$2,000',
        invoiceTotal: '$12,000',
        outstanding: '$0',
        outstandingMode: 'paidInFull',
        invoicesHeading: 'Revised Invoices · 4',
        invoices: [
          { num: 1, label: 'Deposit (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Submitted on Mar 23, 2026', status: 'processing' },
          { num: 2, label: 'Balance (32%)', paid: '$3,999', total: '$3,999', statusLine: 'Paid on May 2, 2026', status: 'paid' },
          { num: 3, label: 'Balance (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Paid on Jun 11, 2026', status: 'paid' },
          { num: 4, label: 'Balance (38%)', paid: '$4,001', total: '$4,001', statusLine: 'Paid on Aug 20, 2026', status: 'paid' },
        ],
      },
    };
  }
  // underPaid (default): $4,000 total paid (1030 $2,000 processing + 1091
  // $2,000 received). Inv #1 covered by processing; Inv #2 partial; Inv
  // #3 / #4 pending against the $12,999 contract.
  return {
    before: {
      progressLabel: 'Current Progress · 31%',
      received: '$2,000',
      processing: '$2,000',
      invoiceTotal: '$12,999',
      outstanding: '$8,999',
      invoicesHeading: 'Current Invoices · 3',
      invoices: [
        { num: 1, label: 'Deposit (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Submitted on Mar 23, 2026', status: 'processing' },
        { num: 2, label: 'Balance (32%)', paid: '$2,000', total: '$3,999', statusLine: 'Due on May 2, 2026', status: 'partial' },
        { num: 3, label: 'Balance (15%)', paid: '-', total: '$2,000', statusLine: 'Due on Jun 11, 2026', status: 'pending' },
        { num: 4, label: 'Balance (38%)', paid: '-', total: '$5,000', statusLine: 'Due on Aug 20, 2026', status: 'pending' },
      ],
    },
    after: {
      progressLabel: 'Revised Progress · 33%',
      received: '$2,000',
      processing: '$2,000',
      invoiceTotal: '$12,000',
      outstanding: '$8,000',
      invoicesHeading: 'Revised Invoices · 4',
      invoices: [
        { num: 1, label: 'Deposit (16%)', paid: '$2,000', total: '$2,000', statusLine: 'Submitted on Mar 23, 2026', status: 'processing' },
        { num: 2, label: 'Balance (42%)', paid: '$2,000', total: '$5,000', statusLine: 'Due on May 2, 2026', status: 'partial' },
        { num: 3, label: 'Balance (42%)', paid: '-', total: '$5,000', statusLine: 'Due on Jun 11, 2026', status: 'pending' },
      ],
    },
  };
}

/** Hook variant of {@link getChangeOrderInvoicePanels} — reads
 *  `existingPayment` from the Developer Console. */
export function useChangeOrderInvoicePanels() {
  const { config } = useDevConsole();
  return useMemo(
    () => getChangeOrderInvoicePanels(config.existingPayment),
    [config.existingPayment],
  );
}

/** Returns the Change Order Approval page's Payment Records, augmented per
 *  `existingPayment`. underPaid → 2 records (1091 / 1030); fullyPaid &
 *  overPaid → 3 records (2104 / 1091 / 1030), where 2104's amount is
 *  $8,000 for fullyPaid and $8,999 for overPaid. */
export function useChangeOrderPaymentRecords() {
  const { config } = useDevConsole();
  return useMemo(() => {
    const base = buildInvoicesData(12999);
    const overridden = base.PAYMENT_RECORDS.map((rec, i) => {
      // PAYMENT_RECORDS is newest-first. Index 0 = 1091 (newer, $2,000
      // completed); index 1 = 1030 (older, $2,000 processing).
      const isProcessing = i === 1;
      return {
        ...rec,
        amountApplied: 2000,
        platformFee: 0,
        amountPaid: 2000,
        method: isProcessing ? rec.method : 'Cash',
        status: isProcessing ? ('processing' as const) : ('completed' as const),
      };
    });
    if (config.existingPayment === 'fullyPaid' || config.existingPayment === 'overPaid') {
      const topUp = config.existingPayment === 'overPaid' ? 8999 : 8000;
      const template = overridden[overridden.length - 1];
      overridden.unshift({
        ...template,
        paymentId: '2104',
        paidOn: 'Apr 22, 2026',
        amountApplied: topUp,
        platformFee: 0,
        amountPaid: topUp,
        method: overridden[0]?.method ?? template.method,
        status: 'completed' as const,
      });
    }
    return { ...base, PAYMENT_RECORDS: overridden };
  }, [config.existingPayment]);
}
