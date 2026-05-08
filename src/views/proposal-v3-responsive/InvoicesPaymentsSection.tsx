'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import BackToTopButton from './BackToTopButton';
import InvoicePaymentDetailDialog, {
  type DetailContent,
  type InvoiceDetail,
  type PaymentDetail,
} from './InvoicePaymentDetailDialog';

// ── Types ─────────────────────────────────────────────────────────────────────
type InvoiceStatus = 'paid' | 'partial' | 'unpaid';

type Invoice = {
  number: number;
  label: string;       // e.g. "Deposit (20%)" / "Balance (60%)"
  amount: number;      // total invoice amount
  received: number;    // amount paid so far (≥ 0)
  status: InvoiceStatus;
  dueDate: string;     // displayed string e.g. "May 2, 2026"
};

type PaymentRecord = {
  paymentId: string;
  paidOn: string;        // e.g. "Mar 23, 2025"
  /** Money applied against invoices (sum of `appliedTo` amounts). */
  amountApplied: number;
  /** Processing fee charged by the payment platform (0 for cash/check). */
  platformFee: number;
  /** Total the user actually paid = amountApplied + platformFee. */
  amountPaid: number;
  paidBy: string;
  method: string;
};

// ── Status colors / labels ────────────────────────────────────────────────────
const STATUS_BAR_COLOR: Record<InvoiceStatus, string> = {
  paid:    '#04b50b', // success/primary
  partial: '#398ae7', // action/primary
  unpaid:  '#737373', // secondary (mobile bar) — desktop uses #bfbfbf
};

const STATUS_BAR_COLOR_DESKTOP: Record<InvoiceStatus, string> = {
  paid:    '#04b50b',
  partial: '#398ae7',
  unpaid:  '#bfbfbf', // tertiary
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid:    'PAID',
  partial: 'PARTIALLY PAID',
  unpaid:  'UNPAID',
};

const STATUS_LABEL_COLOR: Record<InvoiceStatus, string> = {
  paid:    '#04b50b',
  partial: '#398ae7',
  unpaid:  '#737373',
};

// ── Sample data (matches Figma) ───────────────────────────────────────────────
// Project name shown inside the invoice detail sheet/modal.
const PROJECT_NAME = 'Henderson Backyard Fence';

// Static invoice metadata. Amounts are derived live from `contractTotal × percent`.
const INVOICE_BLUEPRINT: {
  number: number;
  label: string;
  percent: number;
  dueDate: string;
}[] = [
  { number: 1, label: 'Deposit (20%)', percent: 20, dueDate: 'May 2, 2026' },
  { number: 2, label: 'Balance (60%)', percent: 60, dueDate: 'May 2, 2026' },
  { number: 3, label: 'Balance (20%)', percent: 20, dueDate: 'Jun 11, 2026' },
];

// Credit card processing fee — applied on top of the amount that lands on
// invoices for the ArcSite Payment record. Cash/check payments carry no fee.
const CARD_PROCESSING_FEE_RATE = 0.03;

// Spec for an additional, user-confirmed payment recorded after the initial
// chronology. Lets the Make-A-Payment dialog feed new payments back into the
// Invoices & Payments tab without InvoicesPaymentsSection owning that state.
export type ExtraPaymentSpec = {
  paymentId: string;
  paidOn: string;        // e.g. "May 8, 2026"
  paidOnFull: string;    // e.g. "May 8, 2026, 4:31:02 p.m."
  amountApplied: number; // dollars that hit invoices (excluding fees)
  platformFee: number;
  paidBy: string;
  method: string;        // e.g. "Credit Card (***4242)" or "Bank Transfer (ACH)"
  processedWith: string; // e.g. "ArcSite Payment"
};

// Total money applied against invoices, derived from the live contract total
// + any user-confirmed payments. Drives the Project Home "Payment Progress"
// figure so it stays in lockstep with the Invoices & Payments tab.
export function computeTotalAmountApplied(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
): number {
  return buildInvoicesData(contractTotal, extraPayments).totalAmountApplied;
}

// "Next due invoice" — the first invoice that isn't fully paid yet. Drives
// the Next Payment amount + subtitle ("60% balance due ... on May 2, 2026")
// on Project Home and the sticky footer. Returns null once every invoice
// is fully paid.
export type NextDueInvoice = {
  /** Outstanding balance on this invoice. */
  remaining: number;
  /** Percent share of the contract total this invoice represents
   *  (parsed from the label, e.g. "Balance (60%)" → 60). */
  percent: number;
  /** Human-readable due date string, e.g. "May 2, 2026". */
  dueDate: string;
  /** Invoice number (1-based). */
  number: number;
  /** Full invoice label, e.g. "Balance (60%)". */
  label: string;
};

export function getNextDueInvoice(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
): NextDueInvoice | null {
  const next = buildInvoicesData(contractTotal, extraPayments).INVOICES.find(
    (inv) => inv.received < inv.amount,
  );
  if (!next) return null;
  const match = next.label.match(/\((\d+)%\)/);
  const percent = match ? parseInt(match[1], 10) : 0;
  return {
    remaining: Math.max(0, next.amount - next.received),
    percent,
    dueDate: next.dueDate,
    number: next.number,
    label: next.label,
  };
}

// Backwards-compatible thin wrapper — returns just the dollar amount.
export function computeNextPaymentAmount(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
): number {
  return getNextDueInvoice(contractTotal, extraPayments)?.remaining ?? 0;
}

// Most recent payment's display date (e.g. "May 8, 2026"). Used by Project
// Home to show "All payments completed on …" once everything is paid off.
export function getLastPaymentDate(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
): string | null {
  // PAYMENT_RECORDS is newest-first.
  return buildInvoicesData(contractTotal, extraPayments).PAYMENT_RECORDS[0]?.paidOn ?? null;
}

// ── Invoices/Payments data — derived from the active contract total ──────────
type PaymentDetailExtras = {
  paidOnFull: string;
  processedWith: string;
  appliedTo: { amount: number; invoiceNumber: number; invoiceLabel: string }[];
};

type InvoicesData = {
  INVOICES: Invoice[];
  PAYMENT_RECORDS: PaymentRecord[];
  totalAmountApplied: number;
  isInvoicePayable: (invNumber: number) => boolean;
  paymentsForInvoice: (invNumber: number) => InvoiceDetail['payments'];
  paidOnDate: (invNumber: number) => string | undefined;
  toInvoiceDetail: (inv: Invoice) => InvoiceDetail;
  toPaymentDetail: (rec: PaymentRecord) => PaymentDetail;
};

function buildInvoicesData(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
): InvoicesData {
  // Invoice amounts: precise percentages of the contract total — sums to
  // contractTotal up to ±$1 rounding.
  const invSpecs = INVOICE_BLUEPRINT.map((bp) => ({
    number: bp.number,
    label:  bp.label,
    amount: Math.round((contractTotal * bp.percent) / 100),
    dueDate: bp.dueDate,
  }));

  // Static payment chronology, oldest → newest:
  //   1030 — pays half of INVOICE #1 (leaves #1 partial).
  //   1091 — pays the remainder of INVOICE #1 + half of INVOICE #2.
  // After these we apply the dynamic `extraPayments` (user-confirmed payments
  // recorded via the Make A Payment dialog).
  const inv1Amount = invSpecs[0].amount;
  const inv2Amount = invSpecs[1].amount;
  const p1030Applied = Math.round(inv1Amount / 2);
  const p1091ToInv1  = Math.max(0, inv1Amount - p1030Applied);
  const p1091ToInv2  = Math.round(inv2Amount / 2);
  const p1091Applied = p1091ToInv1 + p1091ToInv2;
  const p1091Fee     = Math.round(p1091Applied * CARD_PROCESSING_FEE_RATE);

  const staticChronology: ExtraPaymentSpec[] = [
    {
      paymentId:     '1030',
      paidOn:        'Jan 2, 2025',
      paidOnFull:    'Jan 2, 2025, 2:14:09 p.m.',
      amountApplied: p1030Applied,
      platformFee:   0,
      paidBy:        'Junyu Zhang',
      method:        'Check',
      processedWith: 'Manual Entry',
    },
    {
      paymentId:     '1091',
      paidOn:        'Mar 23, 2025',
      paidOnFull:    'Mar 23, 2025, 9:43:33 p.m.',
      amountApplied: p1091Applied,
      platformFee:   p1091Fee,
      paidBy:        'Junyu Zhang',
      method:        'Credit Card (***4242)',
      processedWith: 'ArcSite Payment',
    },
  ];

  // Walk every payment in chronological order, cascading dollars onto the
  // lowest unpaid invoice first (sequential payment rule). Builds up
  // received-per-invoice + a per-payment `appliedTo` map.
  const allPaymentsChronological = [...staticChronology, ...extraPayments];
  const received = invSpecs.map(() => 0);
  const PAYMENT_DETAIL_EXTRAS: Record<string, PaymentDetailExtras> = {};

  for (const p of allPaymentsChronological) {
    let remainingFunds = p.amountApplied;
    const appliedTo: PaymentDetailExtras['appliedTo'] = [];
    for (let i = 0; i < invSpecs.length && remainingFunds > 0; i++) {
      const owed = invSpecs[i].amount - received[i];
      if (owed <= 0) continue;
      const apply = Math.min(remainingFunds, owed);
      received[i] += apply;
      appliedTo.push({
        amount:        apply,
        invoiceNumber: invSpecs[i].number,
        invoiceLabel:  `INVOICE #${invSpecs[i].number} - ${invSpecs[i].label}`,
      });
      remainingFunds -= apply;
    }
    PAYMENT_DETAIL_EXTRAS[p.paymentId] = {
      paidOnFull:    p.paidOnFull,
      processedWith: p.processedWith,
      appliedTo,
    };
  }

  const statusFor = (amount: number, rec: number): InvoiceStatus =>
    rec >= amount ? 'paid' : rec > 0 ? 'partial' : 'unpaid';

  const INVOICES: Invoice[] = invSpecs.map((s, i) => ({
    number:   s.number,
    label:    s.label,
    amount:   s.amount,
    received: received[i],
    status:   statusFor(s.amount, received[i]),
    dueDate:  s.dueDate,
  }));

  // PAYMENT_RECORDS is newest-first, so reverse the chronological list.
  const PAYMENT_RECORDS: PaymentRecord[] = allPaymentsChronological
    .slice()
    .reverse()
    .map((p) => ({
      paymentId:     p.paymentId,
      paidOn:        p.paidOn,
      amountApplied: p.amountApplied,
      platformFee:   p.platformFee,
      amountPaid:    p.amountApplied + p.platformFee,
      paidBy:        p.paidBy,
      method:        p.method,
    }));

  const totalAmountApplied = PAYMENT_RECORDS.reduce(
    (sum, rec) => sum + rec.amountApplied,
    0,
  );

  // Sequential payment rule: a non-paid invoice can only be paid once every
  // invoice before it (lower number) is fully paid. So Invoice #N gets the
  // "Make A Payment" CTA only when invoices #1..#N-1 are all `paid`.
  function isInvoicePayable(invNumber: number): boolean {
    return INVOICES
      .filter((i) => i.number < invNumber)
      .every((i) => i.status === 'paid');
  }

  // Inverse mapping of PAYMENT_DETAIL_EXTRAS.appliedTo: for a given invoice
  // number, return all per-payment slices that landed on it (newest first,
  // matching PAYMENT_RECORDS list order).
  function paymentsForInvoice(invNumber: number): InvoiceDetail['payments'] {
    const labelPrefix = `INVOICE #${invNumber}`;
    return PAYMENT_RECORDS.flatMap((rec) => {
      const extras = PAYMENT_DETAIL_EXTRAS[rec.paymentId];
      if (!extras) return [];
      return extras.appliedTo
        .filter((entry) => entry.invoiceLabel.startsWith(labelPrefix))
        .map((entry) => ({
          paymentId: rec.paymentId,
          paidOn:    rec.paidOn,
          amount:    entry.amount,
        }));
    });
  }

  // For a PAID invoice, the user-facing "paid on" date is the date of the
  // final payment that brought `received` up to `amount` — i.e., the latest
  // payment that landed on this invoice. `paymentsForInvoice` returns
  // newest-first, so we just take the first entry.
  function paidOnDate(invNumber: number): string | undefined {
    const payments = paymentsForInvoice(invNumber);
    return payments[0]?.paidOn;
  }

  function toInvoiceDetail(inv: Invoice): InvoiceDetail {
    return {
      number:   inv.number,
      label:    inv.label,
      itemName: PROJECT_NAME,
      status:   inv.status,
      amount:   inv.amount,
      received: inv.received,
      dueDate:  inv.dueDate,
      payments: paymentsForInvoice(inv.number),
    };
  }

  function toPaymentDetail(rec: PaymentRecord): PaymentDetail {
    const extras = PAYMENT_DETAIL_EXTRAS[rec.paymentId];
    return {
      paymentId:     rec.paymentId,
      paidOnFull:    extras?.paidOnFull    ?? rec.paidOn,
      amountApplied: rec.amountApplied,
      platformFee:   rec.platformFee,
      amountPaid:    rec.amountPaid,
      processedWith: extras?.processedWith ?? '—',
      method:        rec.method,
      paidBy:        rec.paidBy,
      appliedTo:     extras?.appliedTo     ?? [],
    };
  }

  return {
    INVOICES,
    PAYMENT_RECORDS,
    totalAmountApplied,
    isInvoicePayable,
    paymentsForInvoice,
    paidOnDate,
    toInvoiceDetail,
    toPaymentDetail,
  };
}

// React Context: subcomponents inside this file consume the live data via
// `useInvoicesData()` so they don't need to receive every helper as a prop.
const InvoicesDataContext = createContext<InvoicesData | null>(null);
function useInvoicesData(): InvoicesData {
  const ctx = useContext(InvoicesDataContext);
  if (!ctx) {
    throw new Error('useInvoicesData must be used inside InvoicesPaymentsSection');
  }
  return ctx;
}

// ── Format helpers ────────────────────────────────────────────────────────────
function fmtDollars(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile (XS / S / M, < lg) — card layout
// XS: heading 12px, INVOICE# 10px, label 14px, amount 20px, date 12px, py-8
// S/M: heading 16px, INVOICE# 12px, label 16px, amount 24px, date 14px, py-12
// ─────────────────────────────────────────────────────────────────────────────
function MobileInvoiceCard({ inv, onOpen }: { inv: Invoice; onOpen: () => void }) {
  const { paidOnDate } = useInvoicesData();
  const barColor = STATUS_BAR_COLOR[inv.status];
  const labelColor = STATUS_LABEL_COLOR[inv.status];

  // Amount / received presentation:
  //   PAID    → green amount, no fraction
  //   PARTIAL → green received + black "/ total"
  //   UNPAID  → black amount
  const amountNode = (() => {
    if (inv.status === 'paid') {
      return (
        <span style={{ color: '#04b50b' }}>{fmtDollars(inv.amount)}</span>
      );
    }
    if (inv.status === 'partial') {
      return (
        <>
          <span style={{ color: '#04b50b' }}>{fmtDollars(inv.received)}</span>
          <span style={{ color: '#262626' }}> / {fmtDollars(inv.amount)}</span>
        </>
      );
    }
    return <span style={{ color: '#262626' }}>{fmtDollars(inv.amount)}</span>;
  })();

  const dateText =
    inv.status === 'paid'
      ? `Paid on ${paidOnDate(inv.number) ?? inv.dueDate}`
      : `Due on ${inv.dueDate}`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="bg-[#fafafa] flex gap-2 items-stretch w-full overflow-hidden text-left p-0 border-0 cursor-pointer"
    >
      {/* Left status bar */}
      <div className="shrink-0" style={{ width: 5, background: barColor }} />
      {/* Content */}
      <div className="flex flex-col gap-2 items-start py-2 flex-1 min-w-0 pr-2">
        {/* Row 1: INVOICE #N · STATUS */}
        <div className="flex gap-2 items-start w-full">
          <p className="text-[10px] sm:text-[12px] font-semibold text-[#262626] whitespace-nowrap leading-normal">
            INVOICE #{inv.number}
          </p>
          <p
            className="text-[10px] sm:text-[12px] font-semibold whitespace-nowrap leading-normal"
            style={{ color: labelColor }}
          >
            {STATUS_LABEL[inv.status]}
          </p>
        </div>
        {/* Row 2: Label + Amount (stacked) */}
        <div className="flex flex-col items-start w-full">
          <p className="text-[14px] sm:text-[16px] text-[#bfbfbf] whitespace-nowrap leading-normal">
            {inv.label}
          </p>
          <p className="text-[20px] sm:text-[24px] whitespace-nowrap leading-normal">
            {amountNode}
          </p>
        </div>
        {/* Row 3: Date footer */}
        <p className="text-[12px] sm:text-[14px] text-[#262626] whitespace-nowrap leading-normal">
          {dateText}
        </p>
      </div>
    </button>
  );
}

function MobilePaymentRecordCard({ rec, onOpen }: { rec: PaymentRecord; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="bg-[#fafafa] flex gap-2 items-stretch w-full overflow-hidden text-left p-0 border-0 cursor-pointer"
    >
      <div className="shrink-0" style={{ width: 5, background: '#04b50b' }} />
      <div className="flex flex-col gap-2 items-start py-2 flex-1 min-w-0 pr-2">
        <p className="text-[12px] sm:text-[14px] text-[#262626] whitespace-nowrap leading-normal">
          Paid on {rec.paidOn}
        </p>
        <p className="text-[20px] sm:text-[24px] whitespace-nowrap leading-normal" style={{ color: '#04b50b' }}>
          {fmtDollars(rec.amountPaid)}
        </p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop (L / XL / XXL, lg+) — table layout
//
// L (1024) is the baseline. All invoice-table column widths, gaps, and
// row padding scale proportionally with the viewport width above L using a
// `--cs` (column-scale) CSS variable set on the desktop wrapper:
//
//   --cs: clamp(1, 100vw / 1024, 2.109375)
//
// 2.109375 = page maxWidth 2160 / baseline 1024, so the scale stops growing
// once the page reaches its maxWidth. The Payment Records table keeps its
// discrete breakpoint widths (it's a different visual structure).
//
// L baseline column widths (used inside `cs(px)`):
//   margin-component=24, gutter=12, Invoice#=100 (data) / 72 (header),
//   Amount/Received/Remaining=72 each, Spacer=24, Status=128, Due Date=230.
//   The Label column is flex, so it absorbs the leftover space.
// ─────────────────────────────────────────────────────────────────────────────
const cs = (px: number) => `calc(${px}px * var(--cs))`;
function DesktopInvoicesTable({
  onOpenInvoice,
  onMakePayment,
}: {
  onOpenInvoice: (inv: Invoice) => void;
  onMakePayment?: () => void;
}) {
  const { INVOICES } = useInvoicesData();
  return (
    <div className="hidden lg:flex flex-col items-start gap-1 w-full">
      <p className="text-[14px] xl:text-[16px] font-semibold text-[#262626] whitespace-nowrap leading-normal">
        INVOICES · {INVOICES.length}
      </p>

      {/* Header row */}
      <div
        className="flex items-end w-full pb-1"
        style={{
          height: 36,
          fontFamily: 'Segoe UI, sans-serif',
          gap: cs(12),
          paddingRight: cs(24),
        }}
      >
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] leading-[14px]" style={{ width: cs(100) }}>
          Invoice
        </p>
        {/* Invisible spacer matching the label flex column */}
        <p className="flex-1 min-w-0 font-semibold text-[12px] xl:text-[14px] text-[#737373] opacity-0 whitespace-nowrap leading-[14px]" aria-hidden="true">
          Invoices
        </p>
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] text-right leading-[14px]" style={{ width: cs(72) }}>
          Amount
        </p>
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] text-right leading-[14px]" style={{ width: cs(72) }}>
          Received
        </p>
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] text-right leading-[14px]" style={{ width: cs(72) }}>
          Remaining
        </p>
        <div className="shrink-0" style={{ width: cs(24) }} />
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] whitespace-nowrap leading-[14px]" style={{ width: cs(128) }}>
          Status
        </p>
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] whitespace-nowrap leading-[14px]" style={{ width: cs(230) }}>
          Due Date
        </p>
      </div>

      {INVOICES.map((inv) => (
        <DesktopInvoiceRow key={inv.number} inv={inv} onOpen={onOpenInvoice} onMakePayment={onMakePayment} />
      ))}
    </div>
  );
}

function DesktopInvoiceRow({
  inv,
  onOpen,
  onMakePayment,
}: {
  inv: Invoice;
  onOpen: (inv: Invoice) => void;
  onMakePayment?: () => void;
}) {
  const { paidOnDate, isInvoicePayable } = useInvoicesData();
  const barColor = STATUS_BAR_COLOR_DESKTOP[inv.status];
  const labelColor = STATUS_LABEL_COLOR[inv.status];
  const remaining = Math.max(0, inv.amount - inv.received);

  return (
    <div
      onClick={() => onOpen(inv)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(inv);
        }
      }}
      className="group bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors border-l-4 border-solid flex items-center w-full cursor-pointer"
      style={{
        height: 48,
        borderColor: barColor,
        fontFamily: 'Segoe UI, sans-serif',
        gap: cs(12),
        paddingLeft: cs(24),
        paddingRight: cs(24),
      }}
    >
      {/* Invoice # */}
      <p
        className="text-[14px] xl:text-[16px] text-[#262626] whitespace-nowrap leading-normal overflow-hidden text-ellipsis"
        style={{ width: cs(100) }}
      >
        INVOICE #{inv.number}
      </p>
      {/* Label (flex column) */}
      <p className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-[#262626] whitespace-nowrap leading-normal overflow-hidden text-ellipsis">
        {inv.label}
      </p>
      {/* Amount */}
      <p
        className="text-[14px] xl:text-[16px] text-[#262626] text-right whitespace-nowrap leading-normal"
        style={{ width: cs(72) }}
      >
        {fmtDollars(inv.amount)}
      </p>
      {/* Received */}
      <p
        className="text-[14px] xl:text-[16px] text-right whitespace-nowrap leading-normal"
        style={{ color: '#04b50b', width: cs(72) }}
      >
        {inv.received > 0 ? fmtDollars(inv.received) : '-'}
      </p>
      {/* Remaining */}
      <p
        className="text-[14px] xl:text-[16px] text-right whitespace-nowrap leading-normal"
        style={{ color: '#398ae7', width: cs(72) }}
      >
        {remaining > 0 ? fmtDollars(remaining) : '-'}
      </p>
      {/* Spacer (matches Figma --xs/--m) */}
      <div className="shrink-0" style={{ width: cs(24) }} />
      {/* Status */}
      <p
        className="text-[14px] xl:text-[16px] whitespace-nowrap leading-normal"
        style={{ color: labelColor, width: cs(128) }}
      >
        {STATUS_LABEL[inv.status]}
      </p>
      {/* Due Date column — paid: green "Paid on …" with "Fully paid" hint on
          hover (centered); partial: date + button when payable, or date with
          "Pay previous invoices first" hint centered on hover; unpaid: plain
          date with the same hint on hover when not payable. The date fades
          out as the hint fades in so they don't visually overlap. */}
      <div className="relative flex items-center" style={{ width: cs(230), gap: cs(12) }}>
        {inv.status === 'paid' && (
          <>
            <p className="text-[14px] xl:text-[16px] whitespace-nowrap leading-normal" style={{ color: '#04b50b' }}>
              Paid on {paidOnDate(inv.number) ?? inv.dueDate}
            </p>
            <span
              className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[12px] xl:text-[14px] text-[#737373] italic whitespace-nowrap"
            >
              Fully paid
            </span>
          </>
        )}
        {inv.status === 'partial' && (
          <>
            <p className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-[#262626] whitespace-nowrap leading-normal overflow-hidden text-ellipsis">
              {inv.dueDate}
            </p>
            {isInvoicePayable(inv.number) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMakePayment?.();
                }}
                className="bg-[#d41a32] flex items-center justify-center rounded-[4px] cursor-pointer border-0 shrink-0"
                style={{ height: 32, paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6 }}
              >
                <span
                  className="text-[10px] xl:text-[12px] font-semibold text-white text-center whitespace-nowrap"
                  style={{ lineHeight: '14px' }}
                >
                  Make A Payment
                </span>
              </button>
            ) : (
              <span
                className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[12px] xl:text-[14px] text-[#737373] italic whitespace-nowrap"
              >
                Pay previous invoices first
              </span>
            )}
          </>
        )}
        {inv.status === 'unpaid' && (
          <>
            <p className="text-[14px] xl:text-[16px] text-[#737373] whitespace-nowrap leading-normal">
              {inv.dueDate}
            </p>
            {!isInvoicePayable(inv.number) && (
              <span
                className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[12px] xl:text-[14px] text-[#737373] italic whitespace-nowrap"
              >
                Pay previous invoices first
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DesktopPaymentRecordsTable({
  onOpenPayment,
}: {
  onOpenPayment: (rec: PaymentRecord) => void;
}) {
  const { PAYMENT_RECORDS } = useInvoicesData();
  return (
    <div className="hidden lg:flex flex-col items-start gap-1 w-full">
      <p className="text-[14px] xl:text-[16px] font-semibold text-[#262626] whitespace-nowrap leading-normal">
        PAYMENT RECORDS · {PAYMENT_RECORDS.length}
      </p>

      {/* Header row.
          Columns (left → right):
            • Payment ID — fixed
            • Paid On — flex
            • Method — fixed
            • [spacer]
            • Amount Applied — flex, right-aligned
            • Platform Fee — flex, right-aligned
            • Amount Paid — flex, right-aligned
          (Paid By is intentionally absent here — it lives on the detail
          modal/sheet only.) */}
      <div
        className="flex gap-3 items-end w-full pb-1 pr-8 xl:pr-12 2xl:pr-20"
        style={{ height: 36, fontFamily: 'Segoe UI, sans-serif' }}
      >
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] leading-[14px] w-[124px] xl:w-[176px]">
          Payment ID
        </p>
        <p className="flex-1 min-w-0 font-semibold text-[12px] xl:text-[14px] text-[#737373] whitespace-nowrap leading-[14px]">
          Paid On
        </p>
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] whitespace-nowrap leading-[14px] w-[160px] xl:w-[200px]">
          Method
        </p>
        {/* Spacer between left-aligned text columns and the right-aligned
            amount columns — scales with viewport via --cs. */}
        <div className="shrink-0" style={{ width: cs(16) }} />
        <p className="flex-1 min-w-0 font-semibold text-[12px] xl:text-[14px] text-[#737373] text-right whitespace-nowrap leading-[14px]">
          Amount Applied
        </p>
        <p className="flex-1 min-w-0 font-semibold text-[12px] xl:text-[14px] text-[#737373] text-right whitespace-nowrap leading-[14px]">
          Platform Fee
        </p>
        <p className="flex-1 min-w-0 font-semibold text-[12px] xl:text-[14px] text-[#737373] text-right whitespace-nowrap leading-[14px]">
          Amount Paid
        </p>
      </div>

      {PAYMENT_RECORDS.map((rec) => (
        <DesktopPaymentRecordRow key={rec.paymentId} rec={rec} onOpen={onOpenPayment} />
      ))}
    </div>
  );
}

function DesktopPaymentRecordRow({
  rec,
  onOpen,
}: {
  rec: PaymentRecord;
  onOpen: (rec: PaymentRecord) => void;
}) {
  return (
    <div
      onClick={() => onOpen(rec)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(rec);
        }
      }}
      className="bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors border-l-4 border-solid border-[#04b50b] flex gap-3 items-center w-full pl-6 pr-8 xl:pl-8 xl:pr-12 2xl:pl-12 2xl:pr-20 cursor-pointer"
      style={{ height: 48, fontFamily: 'Segoe UI, sans-serif' }}
    >
      <p className="text-[14px] xl:text-[16px] text-[#262626] whitespace-nowrap leading-normal w-[100px] xl:w-[144px] overflow-hidden text-ellipsis">
        {rec.paymentId}
      </p>
      <p className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-[#262626] whitespace-nowrap leading-normal overflow-hidden text-ellipsis">
        {rec.paidOn}
      </p>
      <p className="text-[14px] xl:text-[16px] text-[#262626] whitespace-nowrap leading-normal w-[160px] xl:w-[200px] overflow-hidden text-ellipsis">
        {rec.method}
      </p>
      {/* Spacer matching the header — viewport-scaled gap between left-
          aligned text columns and the right-aligned amount columns. */}
      <div className="shrink-0" style={{ width: cs(16) }} />
      {/* Amount Applied — invoice-paying portion (gray/black) */}
      <p className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-[#262626] text-right whitespace-nowrap leading-normal overflow-hidden text-ellipsis">
        {fmtDollars(rec.amountApplied)}
      </p>
      {/* Platform Fee — dash when zero */}
      <p className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-[#262626] text-right whitespace-nowrap leading-normal overflow-hidden text-ellipsis">
        {rec.platformFee > 0 ? fmtDollars(rec.platformFee) : '-'}
      </p>
      {/* Amount Paid — total user paid (green for emphasis), same size as
          the other amount columns. */}
      <p
        className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-right whitespace-nowrap leading-normal overflow-hidden text-ellipsis"
        style={{ color: '#04b50b' }}
      >
        {fmtDollars(rec.amountPaid)}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
//
// The component is rendered inside the same outer container used by the other
// Project Hub tabs (px-4 sm:px-6) so horizontal margins come from the page
// shell. On lg+ we add a small extra column gap (gap-12 between sections) to
// match the desktop "vertical stack" with --xl gutter.
//
// `onScrollToTop` powers the Back-to-Top button on XS/S/M (the desktop tabs
// don't render that button, matching Figma).
export default function InvoicesPaymentsSection({
  onScrollToTop,
  onMakePayment,
  contractTotal,
  extraPayments = [],
}: {
  onScrollToTop: () => void;
  /** Open the Make-A-Payment utility (managed by ProjectHubPageResponsive). */
  onMakePayment?: () => void;
  /** Live contract total from the approved option + addons. Drives invoice
   *  amounts (from each invoice's percentage label) and the scaled payment
   *  records / received values. */
  contractTotal: number;
  /** Payments confirmed at runtime via the Make A Payment dialog. They get
   *  cascaded onto invoices in the order received and appended to the
   *  PAYMENT RECORDS list (newest-first). */
  extraPayments?: ExtraPaymentSpec[];
}) {
  // Build per-contract data once per `contractTotal` change. Helpers and
  // tables consume it via InvoicesDataContext so subcomponents don't have
  // to receive every helper individually.
  const data = useMemo(
    () => buildInvoicesData(contractTotal, extraPayments),
    [contractTotal, extraPayments],
  );
  const { INVOICES, PAYMENT_RECORDS, isInvoicePayable, toInvoiceDetail, toPaymentDetail } = data;

  // Currently-open detail (null = closed). Drives the bottom-sheet (XS/S/M)
  // and centered modal (L+) inside InvoicePaymentDetailDialog.
  const [detail, setDetail] = useState<DetailContent | null>(null);

  const openInvoice = (inv: Invoice) =>
    setDetail({ type: 'invoice', invoice: toInvoiceDetail(inv) });
  const openPayment = (rec: PaymentRecord) =>
    setDetail({ type: 'payment', record: toPaymentDetail(rec) });

  return (
    <InvoicesDataContext.Provider value={data}>
    <div className="flex flex-col w-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      {/* ── XS / S / M (lg:hidden) — card layout ──────────────────────────── */}
      <div className="lg:hidden flex flex-col gap-16 pt-4 sm:pt-6 w-full">
        {/* Invoices */}
        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-[12px] sm:text-[16px] font-semibold text-[#262626] leading-normal">
            Invoices
          </p>
          <div className="flex flex-col gap-3 w-full">
            {INVOICES.map((inv) => (
              <MobileInvoiceCard
                key={inv.number}
                inv={inv}
                onOpen={() => openInvoice(inv)}
              />
            ))}
          </div>
        </div>

        {/* Payment Records */}
        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-[12px] sm:text-[16px] font-semibold text-[#262626] leading-normal">
            Payment Records
          </p>
          <div className="flex flex-col gap-3 w-full">
            {PAYMENT_RECORDS.map((rec) => (
              <MobilePaymentRecordCard
                key={rec.paymentId}
                rec={rec}
                onOpen={() => openPayment(rec)}
              />
            ))}
          </div>
        </div>

        {/* Back to Top — matches Project Home (mobile) */}
        <div className="flex justify-center pt-0 pb-36 sm:pb-44">
          <BackToTopButton onClick={onScrollToTop} />
        </div>
      </div>

      {/* ── L / XL / XXL — table layout ────────────────────────────────────
          --cs is the column-scale variable used by the invoice table to
          scale all its column widths, gaps, and row padding proportionally
          with viewport width (L baseline = 1024). */}
      <div
        className="hidden lg:flex flex-col gap-8 xl:gap-12 2xl:gap-16 w-full pt-8 pb-6"
        style={{ '--cs': 'clamp(1, calc(100vw / 1024px), 2.109375)' } as React.CSSProperties}
      >
        <DesktopInvoicesTable onOpenInvoice={openInvoice} onMakePayment={onMakePayment} />
        <DesktopPaymentRecordsTable onOpenPayment={openPayment} />
      </div>

      {/* Detail dialog — sheet on XS/S/M, centered modal on L+
          The Make-A-Payment CTA is only enabled when the open invoice is
          the next-payable one (sequential rule — see isInvoicePayable).
          onOpenPayment lets the (#1091) tokens inside an invoice's record
          list jump straight to that payment's detail. */}
      <InvoicePaymentDetailDialog
        content={detail}
        onClose={() => setDetail(null)}
        onMakePayment={
          detail?.type === 'invoice' && isInvoicePayable(detail.invoice.number)
            ? () => {
                setDetail(null);
                onMakePayment?.();
              }
            : undefined
        }
        onOpenPayment={(paymentId) => {
          const rec = PAYMENT_RECORDS.find((r) => r.paymentId === paymentId);
          if (rec) openPayment(rec);
        }}
        onOpenInvoice={(invoiceNumber) => {
          const inv = INVOICES.find((i) => i.number === invoiceNumber);
          if (inv) openInvoice(inv);
        }}
      />
    </div>
    </InvoicesDataContext.Provider>
  );
}
