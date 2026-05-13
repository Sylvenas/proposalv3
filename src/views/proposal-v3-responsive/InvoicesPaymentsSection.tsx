'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import BackToTopButton from './BackToTopButton';
import InvoicePaymentDetailDialog, {
  type DetailContent,
  type InvoiceDetail,
  type PaymentDetail,
} from './InvoicePaymentDetailDialog';

// ── Types ─────────────────────────────────────────────────────────────────────
// 'returned' = a previously-applied payment was reversed by the bank, so the
// invoice is back outstanding. Renders in the same red palette as a returned
// payment record. Treated as a payable state (sequential cascade still
// applies — it's effectively unpaid with extra context).
// 'processing' = at least some of the invoice's received amount came from an
// in-flight ACH bank transfer. Takes precedence over paid / partial — as
// soon as any portion is in processing, the whole invoice surfaces in this
// state until the funds clear. Treated as paid for the sequential-payment
// rule so the next invoice becomes payable immediately.
type InvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'returned' | 'processing';

/** Sub-state of the Due Date column for unpaid/partial invoices.
 *  - normal:  due date is in the future, render as plain date.
 *  - today:   due date == today, render with "Due Today" badge.
 *  - overdue: due date is in the past, render with "Overdue" badge.
 *  - none:    no due date set on the invoice — render a dash. */
type DueState = 'normal' | 'today' | 'overdue' | 'none';

/** Project Hub → Invoice toggle. Re-exported via DevConsoleContext but
 *  kept locally typed too so this module doesn't take a runtime dependency
 *  on the dev console. */
export type InvoiceMode = 'happyPath' | 'enumerate';

type Invoice = {
  number: number;
  label: string;       // e.g. "Deposit (20%)" / "Balance (60%)"
  amount: number;      // total invoice amount
  received: number;    // amount paid so far (≥ 0) — includes processing money
  status: InvoiceStatus;
  dueDate: string;     // displayed string e.g. "May 2, 2026"
  /** Due-date sub-state — drives the "Due Today" / "Overdue" badge. */
  dueState: DueState;
};

/** Settlement status of a payment record.
 *  - completed: money has cleared and applied to invoices (default — green).
 *  - processing: ACH-style transfer in transit (1–3 business days) — blue.
 *  - returned:  bank rejected / bounced the transfer — red. */
type PaymentRecordStatus = 'completed' | 'processing' | 'returned';

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
  /** Settlement status — completed/processing/returned. Defaults to
   *  completed for the existing happy-path chronology. */
  status: PaymentRecordStatus;
};

// ── Payment-record status palette ────────────────────────────────────────────
// Bar = left status rail color (mobile + desktop)
// Amount = Amount Paid / mobile amount text color
// Label = small status pill text color
const PAYMENT_STATUS_COLOR: Record<PaymentRecordStatus, { bar: string; amount: string; label: string }> = {
  completed:  { bar: '#04b50b', amount: '#04b50b', label: '#04b50b' },
  processing: { bar: '#398ae7', amount: '#398ae7', label: '#398ae7' },
  returned:   { bar: '#d41a32', amount: '#d41a32', label: '#d41a32' },
};
const PAYMENT_STATUS_LABEL: Record<PaymentRecordStatus, string> = {
  completed:  '',
  processing: 'Processing',
  returned:   'Returned',
};

// ── Status colors / labels ────────────────────────────────────────────────────
const STATUS_BAR_COLOR: Record<InvoiceStatus, string> = {
  paid:       '#04b50b', // success/primary
  processing: '#04b50b', // ACH in-flight — same green as paid; the label says PROCESSING
  partial:    '#398ae7', // action/primary
  unpaid:     '#737373', // secondary (mobile bar) — desktop uses #bfbfbf
  returned:   '#d41a32', // error — payment was reversed
};

const STATUS_BAR_COLOR_DESKTOP: Record<InvoiceStatus, string> = {
  paid:       '#04b50b',
  processing: '#04b50b',
  partial:    '#398ae7',
  unpaid:     '#bfbfbf', // tertiary
  returned:   '#d41a32',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid:       'PAID',
  processing: 'PROCESSING',
  partial:    'PARTIALLY PAID',
  unpaid:     'UNPAID',
  returned:   'PAYMENT RETURNED',
};

const STATUS_LABEL_COLOR: Record<InvoiceStatus, string> = {
  paid:       '#04b50b',
  processing: '#04b50b',
  partial:    '#398ae7',
  unpaid:     '#737373',
  returned:   '#d41a32',
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
  /** Settlement status. Defaults to 'completed' for the static chronology;
   *  Make-A-Payment passes 'processing' for ACH bank transfers awaiting the
   *  1-3 business day clearance window. Processing payments DO cascade onto
   *  invoices and DO count toward the Payment Progress total — the invoice
   *  they cover is marked PAID · PROCESSING (blue) until the funds clear. */
  status?: 'completed' | 'processing';
};

// Total money applied against invoices, derived from the live contract total
// + any user-confirmed payments. Drives the Project Home "Payment Progress"
// figure so it stays in lockstep with the Invoices & Payments tab.
export function computeTotalAmountApplied(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
  mode: InvoiceMode = 'happyPath',
): number {
  return buildInvoicesData(contractTotal, extraPayments, mode).totalAmountApplied;
}

// Settlement breakdown of the applied total — separates fully-cleared
// dollars (status='completed') from in-flight ACH dollars
// (status='processing'). Returned amounts are intentionally excluded
// from both since the bank reversed those transfers. Used by the Project
// Home progress bar to render the processing portion as a distinct
// pulsing slice when the contract is fully covered.
export function computePaymentBreakdown(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
  mode: InvoiceMode = 'happyPath',
): { received: number; processing: number } {
  const records = buildInvoicesData(contractTotal, extraPayments, mode).PAYMENT_RECORDS;
  const received   = records.filter((r) => r.status === 'completed') .reduce((s, r) => s + r.amountApplied, 0);
  const processing = records.filter((r) => r.status === 'processing').reduce((s, r) => s + r.amountApplied, 0);
  return { received, processing };
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
  mode: InvoiceMode = 'happyPath',
): NextDueInvoice | null {
  const next = buildInvoicesData(contractTotal, extraPayments, mode).INVOICES.find(
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
  mode: InvoiceMode = 'happyPath',
): number {
  return getNextDueInvoice(contractTotal, extraPayments, mode)?.remaining ?? 0;
}

// Most recent payment's display date (e.g. "May 8, 2026"). Used by Project
// Home to show "All payments completed on …" once everything is paid off.
export function getLastPaymentDate(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
  mode: InvoiceMode = 'happyPath',
): string | null {
  // PAYMENT_RECORDS is newest-first.
  return buildInvoicesData(contractTotal, extraPayments, mode).PAYMENT_RECORDS[0]?.paidOn ?? null;
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
  /** True when the data was built in DevConsole "Enumerate States" mode.
   *  Renderers use this to suppress flow-only UI (Make-A-Payment button,
   *  "Fully paid" / "Pay previous invoices first" hover hints) so the
   *  enumeration view stays a clean visual matrix. */
  isEnumerate: boolean;
};

// ── Enumerate-mode builder ───────────────────────────────────────────────────
// QA preset that surfaces every status × due-date variant the Invoices &
// Payments tab can render. Produces 14 invoices in this fixed order:
//   1.  Paid       · paid-on date
//   2.  Processing · fully covered, future due
//   3.  Returned   · Overdue           (half received)
//   4.  Returned   · Due Today
//   5.  Returned   · normal future
//   6.  Returned   · no due date
//   7.  Partial    · Overdue
//   8.  Partial    · Due Today
//   9.  Partial    · normal future
//   10. Partial    · no due date
//   11. Unpaid     · Overdue
//   12. Unpaid     · Due Today
//   13. Unpaid     · normal future
//   14. Unpaid     · no due date
// Each invoice's amount = contractTotal / 14 (rounded), with the first
// invoice absorbing any rounding remainder so the per-invoice amounts sum
// to contractTotal. Partial invoices receive ~50% of their amount.
//
// Synthetic payment records are generated for each Paid + Partial invoice
// (one record per partial slice, plus one for the fully-paid invoice) and
// returned newest-first.
function buildEnumeratedInvoicesData(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
): InvoicesData {
  // CLAUDE.md anchors "today" at 2026-05-08; we hardcode the same so the
  // dates we render visibly match Due Today / Overdue intent.
  const TODAY        = 'May 8, 2026';
  const FUTURE_DATE  = 'Jun 11, 2026';
  const OVERDUE_DATE = 'Apr 22, 2026';
  const PAID_ON_DATE = 'May 1, 2026';
  const PARTIAL_PAID_ON = 'Apr 28, 2026';

  type Spec = {
    number: number;
    label: string;
    status: InvoiceStatus;
    dueState: DueState;
    dueDate: string;
    /** When set, the invoice has already received some money even though
     *  its status isn't 'partial'. Used for the first returned invoice
     *  (one half settled, the other was returned by the bank). */
    halfReceived?: boolean;
  };
  // Labels mirror the happy-path schedule's "Deposit (X%)" / "Balance (X%)"
  // convention — first invoice is the Deposit, the rest are Balance. Percent
  // is ~7% per invoice (1/15) since enumerate mode splits evenly across all
  // valid status × due-state combinations.
  // Order: Paid → Processing → Payment Returned → Partially Paid → Unpaid.
  // Inside each status group the rows sort by Due Date urgency:
  //   Overdue → Due Today → Future (normal) → No due date.
  // PROCESSING is only ever "fully covered" — by system rule there's no
  // "partially paid + still processing" state, so the half-covered blue
  // PROCESSING rows that used to live here have been removed.
  // Paid invoices always render "Paid on {date}" regardless of dueState, so
  // the old (paid · none) row was visually identical to the (paid · normal)
  // case — that combination has been dropped to keep each enumerated row
  // unique. The remaining 14 invoices renumber 1..14 contiguously.
  const specs: Spec[] = [
    { number: 1,  label: 'Deposit (5%)', status: 'paid',       dueState: 'normal',  dueDate: PAID_ON_DATE },
    { number: 2,  label: 'Balance (5%)', status: 'processing', dueState: 'normal',  dueDate: FUTURE_DATE },                          // green — fully covered
    { number: 3,  label: 'Balance (5%)', status: 'returned',   dueState: 'overdue', dueDate: OVERDUE_DATE, halfReceived: true },
    { number: 4,  label: 'Balance (5%)', status: 'returned',   dueState: 'today',   dueDate: TODAY },
    { number: 5,  label: 'Balance (5%)', status: 'returned',   dueState: 'normal',  dueDate: FUTURE_DATE },
    { number: 6,  label: 'Balance (5%)', status: 'returned',   dueState: 'none',    dueDate: '' },
    { number: 7,  label: 'Balance (5%)', status: 'partial',    dueState: 'overdue', dueDate: OVERDUE_DATE },
    { number: 8,  label: 'Balance (5%)', status: 'partial',    dueState: 'today',   dueDate: TODAY },
    { number: 9,  label: 'Balance (5%)', status: 'partial',    dueState: 'normal',  dueDate: FUTURE_DATE },
    { number: 10, label: 'Balance (5%)', status: 'partial',    dueState: 'none',    dueDate: '' },
    { number: 11, label: 'Balance (5%)', status: 'unpaid',     dueState: 'overdue', dueDate: OVERDUE_DATE },
    { number: 12, label: 'Balance (5%)', status: 'unpaid',     dueState: 'today',   dueDate: TODAY },
    { number: 13, label: 'Balance (5%)', status: 'unpaid',     dueState: 'normal',  dueDate: FUTURE_DATE },
    { number: 14, label: 'Balance (5%)', status: 'unpaid',     dueState: 'none',    dueDate: '' },
  ];

  // Even split with the remainder folded into invoice #1.
  const baseAmount    = Math.round(contractTotal / specs.length);
  const remainder     = contractTotal - baseAmount * specs.length;
  const amountFor     = (i: number) => baseAmount + (i === 0 ? remainder : 0);
  // Per-status received amount:
  //   paid       → full amount (closed out).
  //   processing → full amount (green; an in-flight ACH covers the whole
  //                invoice — there's no partial-processing state).
  //   partial    → half.
  //   returned   → 0 by default (full reversal); halfReceived=true means
  //                the bank settled one attempt and bounced the other.
  //   unpaid     → 0.
  const receivedFor = (s: Spec, amt: number): number => {
    if (s.status === 'paid') return amt;
    if (s.status === 'processing') return amt;
    if (s.status === 'partial') return Math.round(amt / 2);
    if (s.halfReceived) return Math.round(amt / 2);
    return 0;
  };

  // Per-invoice running state. `received` starts from the spec; the
  // cascade below adds user-confirmed extra payments on top. `processingApplied`
  // tracks how much of `received` came from in-flight ACH (initial spec
  // contribution + later extras with status='processing'), which keeps the
  // PAID · PROCESSING split working after extras land.
  const received = specs.map((s, i) => receivedFor(s, amountFor(i)));
  const processingApplied = specs.map((s, i) =>
    s.status === 'processing' ? received[i] : 0,
  );
  const extraTouched = specs.map(() => false);

  // INVOICES_INITIAL captures the spec-derived state — the synthetic seed
  // loop below reads from it so each existing seed's amountApplied stays
  // anchored to the original demo amounts even after extraPayments cascade.
  const INVOICES_INITIAL: Invoice[] = specs.map((s, i) => ({
    number:   s.number,
    label:    s.label,
    amount:   amountFor(i),
    received: received[i],
    status:   s.status,
    dueDate:  s.dueDate,
    dueState: s.dueState,
  }));

  // Synthetic payment records — one per invoice that has any received funds,
  // ordered newest-first by paymentId. We tag each payment with the matching
  // invoice slice so the detail dialog still has appliedTo data.
  //
  // Two types of seeds:
  //   1. Card / check seeds (status='completed') — apply to a specific invoice.
  //   2. ACH seeds (status='processing' or 'returned') — visual-only, do
  //      NOT cascade onto invoices. ACH transfers take 1-3 business days,
  //      so they show up in the records list as in-flight (blue) or
  //      bounced (red), with no `appliedTo` impact until they settle.
  type PaymentSeed = {
    paymentId: string;
    paidOn: string;
    paidOnFull: string;
    method: string;
    processedWith: string;
    /** Status drives the row's color theme + status pill. */
    status: PaymentRecordStatus;
    /** When status='completed', which invoice this payment applies to. */
    appliedToInvoice?: number;
    /** When status='processing'|'returned', the gross dollar amount the
     *  user submitted (visual-only; does not reduce invoice balances). */
    amount?: number;
  };
  // Newest first; IDs descend with realistic non-uniform gaps (as if other
  // customers' payments slot between ours in a global sequence).
  const paymentSeeds: PaymentSeed[] = [
    // Processing demo — single full-coverage ACH against invoice #2 (green
    // PROCESSING). The half-covered blue PROCESSING rows that used to live
    // here are gone (the system has no "partial + processing" state), so
    // there's only one processing seed left.
    { paymentId: '2204', paidOn: 'May 8, 2026',  paidOnFull: 'May 8, 2026, 9:12:33 a.m.',     method: 'Bank Transfer (ACH)',  processedWith: 'ArcSite Payment', status: 'processing', appliedToInvoice: 2 },
    // Invoice #3 (Returned, Overdue): one ACH transfer settled (#2151),
    // the other (#2155) was returned by the bank. The pair leaves the
    // invoice half-received with PAYMENT RETURNED status.
    { paymentId: '2155', paidOn: 'May 5, 2026',  paidOnFull: 'May 5, 2026, 3:18:54 p.m.',     method: 'Bank Transfer (ACH)',  processedWith: 'ArcSite Payment', status: 'returned',   appliedToInvoice: 3 },
    { paymentId: '2151', paidOn: 'May 4, 2026',  paidOnFull: 'May 4, 2026, 9:11:04 a.m.',     method: 'Bank Transfer (ACH)',  processedWith: 'ArcSite Payment', status: 'completed', appliedToInvoice: 3 },
    // Invoices #4-#6 (Returned, no funds received): each has a single ACH
    // transfer the bank reversed. The payment record carries the full
    // invoice amount as the attempted figure; nothing actually landed on
    // the invoice (received stays at 0). One returned ACH per invoice
    // keeps the records list aligned with the invoice list.
    { paymentId: '2150', paidOn: 'May 4, 2026',  paidOnFull: 'May 4, 2026, 2:33:18 p.m.',     method: 'Bank Transfer (ACH)',  processedWith: 'ArcSite Payment', status: 'returned',   appliedToInvoice: 4 },
    { paymentId: '2148', paidOn: 'May 3, 2026',  paidOnFull: 'May 3, 2026, 11:57:42 a.m.',    method: 'Bank Transfer (ACH)',  processedWith: 'ArcSite Payment', status: 'returned',   appliedToInvoice: 5 },
    { paymentId: '2146', paidOn: 'May 2, 2026',  paidOnFull: 'May 2, 2026, 4:09:27 p.m.',     method: 'Bank Transfer (ACH)',  processedWith: 'ArcSite Payment', status: 'returned',   appliedToInvoice: 6 },
    { paymentId: '2143', paidOn: PARTIAL_PAID_ON, paidOnFull: 'Apr 28, 2026, 11:02:14 a.m.', method: 'Credit Card (***4242)', processedWith: 'ArcSite Payment', status: 'completed', appliedToInvoice: 9 },
    { paymentId: '2129', paidOn: PARTIAL_PAID_ON, paidOnFull: 'Apr 28, 2026, 10:48:09 a.m.', method: 'Credit Card (***4242)', processedWith: 'ArcSite Payment', status: 'completed', appliedToInvoice: 8 },
    { paymentId: '2118', paidOn: PARTIAL_PAID_ON, paidOnFull: 'Apr 28, 2026, 10:31:22 a.m.', method: 'Credit Card (***4242)', processedWith: 'ArcSite Payment', status: 'completed', appliedToInvoice: 7 },
    // Half-payment record for invoice #10 (partial, no due date) — the
    // spec gives this row $416 received, so it needs a matching payment
    // record. Without it, the Progress bar's "received" total under-
    // counts the invoice list by $416.
    { paymentId: '2117', paidOn: PARTIAL_PAID_ON, paidOnFull: 'Apr 28, 2026, 10:18:55 a.m.', method: 'Credit Card (***4242)', processedWith: 'ArcSite Payment', status: 'completed', appliedToInvoice: 10 },
    { paymentId: '2094', paidOn: PAID_ON_DATE,    paidOnFull: 'May 1, 2026, 9:14:00 a.m.',   method: 'Check',                 processedWith: 'Manual Entry',    status: 'completed', appliedToInvoice: 1 },
  ];

  const PAYMENT_DETAIL_EXTRAS: Record<string, PaymentDetailExtras> = {};
  const PAYMENT_RECORDS: PaymentRecord[] = paymentSeeds.flatMap((seed) => {
    // Processing / returned ACH payments — no cascade impact, but they
    // can still be tied to a specific invoice for the detail dialog
    // (e.g. a returned ACH was attempting to clear a particular invoice).
    if (seed.status !== 'completed') {
      let amountApplied = 0;
      let appliedTo: PaymentDetailExtras['appliedTo'] = [];
      if (seed.appliedToInvoice != null) {
        const inv = INVOICES_INITIAL.find((i) => i.number === seed.appliedToInvoice);
        if (inv) {
          // Processing: the in-flight ACH that's still landing on the
          //   invoice — its amount equals what we've already credited as
          //   `received` (full for a green row, half for a blue row).
          // Returned: the bounced half of a paired settled+returned pair —
          //   its amount is the still-unsettled remainder of the invoice.
          amountApplied = seed.status === 'processing'
            ? inv.received
            : Math.max(0, inv.amount - inv.received);
          appliedTo = [{
            amount:        amountApplied,
            invoiceNumber: inv.number,
            invoiceLabel:  `INVOICE #${inv.number} - ${inv.label}`,
          }];
        }
      } else {
        amountApplied = seed.amount ?? 0;
      }
      PAYMENT_DETAIL_EXTRAS[seed.paymentId] = {
        paidOnFull:    seed.paidOnFull,
        processedWith: seed.processedWith,
        appliedTo,
      };
      return [{
        paymentId:     seed.paymentId,
        paidOn:        seed.paidOn,
        amountApplied,
        platformFee:   0,
        amountPaid:    amountApplied,
        paidBy:        'Junyu Zhang',
        method:        seed.method,
        status:        seed.status,
      }];
    }
    const inv = INVOICES_INITIAL.find((i) => i.number === seed.appliedToInvoice);
    if (!inv || inv.received <= 0) return [];
    const amountApplied = inv.received;
    const isCard        = seed.method.startsWith('Credit Card');
    const platformFee   = isCard ? Math.round(amountApplied * CARD_PROCESSING_FEE_RATE) : 0;
    PAYMENT_DETAIL_EXTRAS[seed.paymentId] = {
      paidOnFull:    seed.paidOnFull,
      processedWith: seed.processedWith,
      appliedTo: [{
        amount:        amountApplied,
        invoiceNumber: inv.number,
        invoiceLabel:  `INVOICE #${inv.number} - ${inv.label}`,
      }],
    };
    return [{
      paymentId:     seed.paymentId,
      paidOn:        seed.paidOn,
      amountApplied,
      platformFee,
      amountPaid:    amountApplied + platformFee,
      paidBy:        'Junyu Zhang',
      method:        seed.method,
      status:        'completed',
    }];
  });

  // Apply user-confirmed extra payments (e.g. a Make-A-Payment bank transfer)
  // on top of the seed-derived state. Each extra cascades onto the lowest
  // invoice that still has remaining balance, mirroring the happy-path
  // sequential rule, and gets appended to the records list (newest first)
  // with its own appliedTo entries.
  for (const p of extraPayments) {
    let remainingFunds = p.amountApplied;
    const appliedTo: PaymentDetailExtras['appliedTo'] = [];
    for (let i = 0; i < specs.length && remainingFunds > 0; i++) {
      const owed = amountFor(i) - received[i];
      if (owed <= 0) continue;
      const apply = Math.min(remainingFunds, owed);
      received[i] += apply;
      extraTouched[i] = true;
      if (p.status === 'processing') processingApplied[i] += apply;
      appliedTo.push({
        amount:        apply,
        invoiceNumber: specs[i].number,
        invoiceLabel:  `INVOICE #${specs[i].number} - ${specs[i].label}`,
      });
      remainingFunds -= apply;
    }
    PAYMENT_DETAIL_EXTRAS[p.paymentId] = {
      paidOnFull:    p.paidOnFull,
      processedWith: p.processedWith,
      appliedTo,
    };
    PAYMENT_RECORDS.unshift({
      paymentId:     p.paymentId,
      paidOn:        p.paidOn,
      amountApplied: p.amountApplied,
      platformFee:   p.platformFee,
      amountPaid:    p.amountApplied + p.platformFee,
      paidBy:        p.paidBy,
      method:        p.method,
      status:        p.status ?? 'completed',
    });
  }

  // Final INVOICES — same shape as INVOICES_INITIAL but with cascade-updated
  // received and a recomputed status for any row an extraPayment touched.
  // Untouched rows keep their spec status (preserves the historical demo
  // states like 'returned' even when later invoices receive extras).
  const INVOICES: Invoice[] = specs.map((s, i) => {
    const amount = amountFor(i);
    let status: InvoiceStatus = s.status;
    if (extraTouched[i]) {
      status = processingApplied[i] > 0 ? 'processing'
        : received[i] >= amount ? 'paid'
        : received[i] > 0 ? 'partial'
        : 'unpaid';
    }
    return {
      number:   s.number,
      label:    s.label,
      amount,
      received: received[i],
      status,
      dueDate:  s.dueDate,
      dueState: s.dueState,
    };
  });

  // Both completed and processing payments roll up into the contract's
  // paid total — same rule as happy-path mode.
  const totalAmountApplied = PAYMENT_RECORDS
    .reduce((sum, r) => sum + r.amountApplied, 0);

  // Sequential rule: an invoice is payable once every prior invoice is
  // fully covered (received ≥ amount). Mirrors the happy-path rule, so
  // green PROCESSING (received = amount) unlocks the next row, while blue
  // PROCESSING (received < amount) still blocks subsequent invoices.
  function isInvoicePayable(invNumber: number): boolean {
    return INVOICES.filter((i) => i.number < invNumber).every((i) => i.received >= i.amount);
  }

  function paymentsForInvoice(invNumber: number) {
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
          status:    rec.status,
        }));
    });
  }

  function paidOnDate(invNumber: number): string | undefined {
    return paymentsForInvoice(invNumber)[0]?.paidOn;
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
      status:        rec.status,
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
    isEnumerate: true,
  };
}

export function buildInvoicesData(
  contractTotal: number,
  extraPayments: ExtraPaymentSpec[] = [],
  mode: InvoiceMode = 'happyPath',
): InvoicesData {
  if (mode === 'enumerate') {
    return buildEnumeratedInvoicesData(contractTotal, extraPayments);
  }
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
  // received-per-invoice + a per-payment `appliedTo` map. Processing
  // (in-flight ACH) payments cascade exactly like completed ones — the
  // invoice they cover is marked PAID · PROCESSING via `processingApplied`
  // until the funds clear.
  const allPaymentsChronological = [...staticChronology, ...extraPayments];
  const received           = invSpecs.map(() => 0);
  const processingApplied  = invSpecs.map(() => 0);
  const PAYMENT_DETAIL_EXTRAS: Record<string, PaymentDetailExtras> = {};

  for (const p of allPaymentsChronological) {
    let remainingFunds = p.amountApplied;
    const appliedTo: PaymentDetailExtras['appliedTo'] = [];
    for (let i = 0; i < invSpecs.length && remainingFunds > 0; i++) {
      const owed = invSpecs[i].amount - received[i];
      if (owed <= 0) continue;
      const apply = Math.min(remainingFunds, owed);
      received[i] += apply;
      if (p.status === 'processing') processingApplied[i] += apply;
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

  // Any in-flight ACH money against the invoice promotes its status to
  // 'processing' regardless of whether the funds fully cover it. This takes
  // precedence over paid / partial — once a portion is in transit, the
  // whole invoice surfaces as PROCESSING until the bank clears it.
  const statusFor = (amount: number, rec: number, proc: number): InvoiceStatus =>
    proc > 0 ? 'processing'
    : rec >= amount ? 'paid'
    : rec > 0 ? 'partial'
    : 'unpaid';

  const INVOICES: Invoice[] = invSpecs.map((s, i) => ({
    number:   s.number,
    label:    s.label,
    amount:   s.amount,
    received: received[i],
    status:   statusFor(s.amount, received[i], processingApplied[i]),
    dueDate:  s.dueDate,
    dueState: 'normal',
  }));

  // PAYMENT_RECORDS is newest-first, so reverse the chronological list.
  // Static chronology entries are completed; user-confirmed extras may be
  // 'processing' (in-flight ACH).
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
      status:        p.status ?? 'completed',
    }));

  // Both completed and processing payments roll up into the contract's
  // paid total — once the user confirms a bank transfer, the dollars are
  // earmarked against the invoice (PAID · PROCESSING) and counted toward
  // payment progress, even though the funds haven't fully cleared yet.
  const totalAmountApplied = PAYMENT_RECORDS
    .reduce((sum, rec) => sum + rec.amountApplied, 0);

  // Sequential payment rule: a non-paid invoice can only be paid once every
  // invoice before it (lower number) has been fully covered (received ≥
  // amount). Fully-covered green PROCESSING invoices unlock the next
  // invoice immediately — but a half-covered blue PROCESSING invoice still
  // owes money, so the chain stops there until the user pays the rest.
  function isInvoicePayable(invNumber: number): boolean {
    return INVOICES
      .filter((i) => i.number < invNumber)
      .every((i) => i.received >= i.amount);
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
          status:    rec.status,
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
      status:        rec.status,
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
    isEnumerate: false,
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

// Renders the Due Date column text for unpaid/partial invoices, with a red
// "Overdue" / "Due Today" prefix when applicable. The plain date is shown
// in `mutedColor` (matches the column's existing palette: #262626 for
// partial, #737373 for unpaid).
function DueDateText({
  dueState,
  dueDate,
  mutedColor,
}: {
  dueState: DueState;
  dueDate: string;
  mutedColor: string;
}) {
  // Due Today: warning amber, "{date} (Today)".
  // Overdue:   error red,    "Overdue · {date}".
  // None:      no due date on this invoice, render a dash placeholder.
  if (dueState === 'none') {
    return <span style={{ color: mutedColor }}>—</span>;
  }
  if (dueState === 'today') {
    return <span style={{ color: '#d97706' }}>{dueDate} (Today)</span>;
  }
  if (dueState === 'overdue') {
    return <span style={{ color: '#d41a32' }}>Overdue · {dueDate}</span>;
  }
  return <span style={{ color: mutedColor }}>{dueDate}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile (XS / S / M, < lg) — card layout
// XS: heading 12px, INVOICE# 10px, label 14px, amount 20px, date 12px, py-8
// S/M: heading 16px, INVOICE# 12px, label 16px, amount 24px, date 14px, py-12
// ─────────────────────────────────────────────────────────────────────────────
function MobileInvoiceCard({ inv, onOpen }: { inv: Invoice; onOpen: () => void }) {
  const { paidOnDate } = useInvoicesData();
  // PROCESSING with a remaining balance still pending the user's next
  // payment renders in the same blue as PARTIAL, since the invoice isn't
  // fully covered yet. Fully-covered PROCESSING uses the green PAID palette.
  const isPartlyProcessing = inv.status === 'processing' && inv.received < inv.amount;
  const barColor   = isPartlyProcessing ? '#398ae7' : STATUS_BAR_COLOR[inv.status];
  const labelColor = isPartlyProcessing ? '#398ae7' : STATUS_LABEL_COLOR[inv.status];

  // Amount / received presentation:
  //   PAID / PROCESSING fully  → green amount, no fraction
  //   PARTIAL / PROCESSING partly / RETURNED w/ received>0 → green received +
  //     black "/ total" (covers the half-paid Returned case too)
  //   UNPAID / RETURNED w/0   → black amount
  const amountNode = (() => {
    if (inv.received >= inv.amount && inv.received > 0) {
      return (
        <span style={{ color: '#04b50b' }}>{fmtDollars(inv.amount)}</span>
      );
    }
    if (inv.received > 0) {
      return (
        <>
          <span style={{ color: '#04b50b' }}>{fmtDollars(inv.received)}</span>
          <span style={{ color: '#262626' }}> / {fmtDollars(inv.amount)}</span>
        </>
      );
    }
    return <span style={{ color: '#262626' }}>{fmtDollars(inv.amount)}</span>;
  })();

  // Mobile date text — for unpaid/partial we fold the due-state into the
  // line itself ("Overdue · {date}", "{date} (Today)") so the card
  // surfaces the same information the desktop badge does, with the same
  // shorthand (no "Due on" prefix). Today is amber (warning); Overdue is
  // red (error). When the invoice has no due date ('none'), render a
  // dash regardless of status.
  // Both fully-paid and fully-covered-but-still-processing invoices read as
  // "Paid on {date}" on the date line — the status pill ("PAID" vs.
  // "PROCESSING") carries the clearance distinction.
  const isFullyCovered = inv.received >= inv.amount && inv.received > 0;
  // Fully-covered invoices surface the real payment date — checked before
  // the `dueState === 'none'` branch so a paid invoice without an original
  // due date still shows when the money landed instead of a dash. Wording
  // follows the clearance state: cleared funds read "Paid on …"; an
  // in-flight ACH (PROCESSING) reads "Submitted on …" since the money
  // hasn't actually settled yet.
  const fullyCoveredPrefix = inv.status === 'processing' ? 'Submitted on' : 'Paid on';
  const dateText = isFullyCovered
    ? `${fullyCoveredPrefix} ${paidOnDate(inv.number) ?? inv.dueDate}`
    : inv.dueState === 'none'
    ? '—'
    : inv.dueState === 'overdue'
    ? `Overdue · ${inv.dueDate}`
    : inv.dueState === 'today'
    ? `${inv.dueDate} (Today)`
    : inv.dueDate;
  const dateColor = isFullyCovered
    ? '#262626'
    : inv.dueState === 'none'    ? '#737373'
    : inv.dueState === 'overdue' ? '#d41a32'
    : inv.dueState === 'today'   ? '#d97706'
    : '#262626';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="bg-[#fafafa] flex gap-2 items-stretch w-full overflow-hidden text-left p-0 border-0 cursor-pointer"
    >
      {/* Left status bar — processing uses the same hatched fill (light-green
          base + dark-green diagonal stripes) as the desktop row's strip and
          the desktop progress-bar processing slice, so the in-flight state
          reads the same across breakpoints. */}
      {inv.status === 'processing' ? (
        <div
          className="shrink-0"
          style={{
            width: 5,
            backgroundColor: '#c4ecc6',
            backgroundImage:
              'repeating-linear-gradient(-45deg, #6fd073 0, #6fd073 4px, transparent 4px, transparent 8px)',
          }}
        />
      ) : (
        <div className="shrink-0" style={{ width: 5, background: barColor }} />
      )}
      {/* Content */}
      <div className="flex flex-col gap-2 items-start py-2 flex-1 min-w-0 pr-2">
        {/* Row 1: INVOICE #N · STATUS */}
        <div className="flex gap-2 items-start w-full">
          <p className="text-[10px] sm:text-[12px] font-semibold text-[#0a0a0a] whitespace-nowrap leading-normal">
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
        {/* Row 3: Date footer — colored red for Overdue / Due Today */}
        <p
          className="text-[12px] sm:text-[14px] whitespace-nowrap leading-normal"
          style={{ color: dateColor }}
        >
          {dateText}
        </p>
      </div>
    </button>
  );
}

function MobilePaymentRecordCard({ rec, onOpen }: { rec: PaymentRecord; onOpen: () => void }) {
  const palette = PAYMENT_STATUS_COLOR[rec.status];
  const statusLabel = PAYMENT_STATUS_LABEL[rec.status];
  // Date prefix swaps for in-flight / failed states. The stored date is
  // when the user submitted the payment, so processing AND returned both
  // read as "Submitted on …" (the bank reversal happens later, off the
  // record's date). Matches the wording used in the detail dialog.
  const datePrefix =
    (rec.status === 'processing' || rec.status === 'returned') ? 'Submitted on'
    : 'Paid on';
  return (
    <button
      type="button"
      onClick={onOpen}
      className="bg-[#fafafa] flex gap-2 items-stretch w-full overflow-hidden text-left p-0 border-0 cursor-pointer"
    >
      <div className="shrink-0" style={{ width: 5, background: palette.bar }} />
      <div className="flex flex-col gap-2 items-start py-2 flex-1 min-w-0 pr-2">
        <p className="text-[12px] sm:text-[14px] text-[#262626] whitespace-nowrap leading-normal">
          {datePrefix} {rec.paidOn}
        </p>
        {/* Amount line — mirrors the Amount Paid display in the detail
            dialog: dollar figure first (semibold), then a small uppercase
            status tag for non-completed rows (PROCESSING / RETURNED).
            Returned amounts are struck through to read as "attempted but
            reversed". */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <p
            className="text-[20px] sm:text-[24px] font-semibold whitespace-nowrap leading-normal"
            style={{
              color: palette.amount,
              textDecoration: rec.status === 'returned' ? 'line-through' : undefined,
            }}
          >
            {fmtDollars(rec.amountPaid)}
          </p>
          {statusLabel && (
            <span
              className="text-[12px] sm:text-[14px] font-semibold tracking-[0.5px] uppercase whitespace-nowrap leading-normal"
              style={{ color: palette.label }}
            >
              {statusLabel}
            </span>
          )}
        </div>
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

// "Paid in Full" seal — same SVG asset used by the Project Home payment
// progress block. Surfaced inside the Next Payment card on the Invoices &
// Payments tab when every invoice is covered.
const SEAL_IMG = '/images/proposal-v3-responsive/paid-seal.svg';

// ─── Desktop summary row (PROGRESS + NEXT PAYMENT) ───────────────────────────
// Two-up summary that sits above the invoice table on L+ viewports.
//
// Layout: 12-column grid — Progress occupies cols 1-8, Next Payment cols 9-12.
//
// Progress card:
//   • Bar segments: dark green = received (cleared), light green =
//     processing (in-flight ACH); rest of the track stays gray.
//   • A segment renders only when its amount is > 0 — when nothing is in
//     flight the light-green slice disappears entirely (per the spec).
//   • Returned dollars never accumulate against the contract — they're
//     bounced ACH attempts — so they're absent from both segments and the
//     received/processing labels.
//
// Next Payment card:
//   • Amount + due date come from the next invoice that still has a
//     remaining balance (sequential rule).
//   • The CTA mirrors the Make-A-Payment button on the invoice table.
function DesktopProgressAndNextPayment({
  contractTotal,
  onMakePayment,
}: {
  contractTotal: number;
  onMakePayment?: () => void;
}) {
  const { INVOICES, PAYMENT_RECORDS } = useInvoicesData();
  // The next-payment slice on the progress bar is gated on the user
  // hovering the Next Payment card — surfaces the connection between the
  // card and the bar segment without cluttering the bar in the default
  // state. Toggled by onMouseEnter/onMouseLeave on the card.
  const [nextPaymentHovered, setNextPaymentHovered] = useState(false);
  // Which bar segment the user is currently pointing at — drives the
  // segment's "highlighted" visual + the tooltip rendered above the bar.
  // Reverts to null on mouse-leave so the tooltip dismisses cleanly.
  const [barHover, setBarHover] = useState<'received' | 'processing' | 'next' | null>(null);

  // Settlement breakdown — completed dollars sit in the dark-green slice,
  // in-flight ACH dollars in the light-green slice. Returned amounts are
  // excluded from both (the bank reversed the transfer; nothing landed).
  const receivedAmount   = PAYMENT_RECORDS
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amountApplied, 0);
  const processingAmount = PAYMENT_RECORDS
    .filter((r) => r.status === 'processing')
    .reduce((sum, r) => sum + r.amountApplied, 0);
  const outstanding = Math.max(0, contractTotal - receivedAmount - processingAmount);

  // Bar segment widths as percentages of the contract total. Clamped so a
  // ±$1 rounding error in the synthetic data never overflows the track.
  const receivedPct   = contractTotal > 0
    ? Math.min(100, (receivedAmount / contractTotal) * 100)
    : 0;
  const processingPct = contractTotal > 0
    ? Math.min(100 - receivedPct, (processingAmount / contractTotal) * 100)
    : 0;

  // Next due invoice — first row that still has a remaining balance.
  // Mirrors getNextDueInvoice's sequential rule (consumed by Project Home).
  const nextDue = INVOICES.find((inv) => inv.received < inv.amount);
  const nextDueRemaining = nextDue ? Math.max(0, nextDue.amount - nextDue.received) : 0;
  // Date the contract reached full coverage — the most-recent payment
  // record (PAYMENT_RECORDS is newest-first). Surfaces in the fully-paid
  // copy ("Paid in full on …" / "Payment submitted in full on …").
  const paidOnDateLabel = !nextDue ? PAYMENT_RECORDS[0]?.paidOn : undefined;
  // Next-payment slice on the bar — sits right after the received +
  // processing segments. Its width represents the remaining balance on
  // the next-due invoice. Clamped so it never extends past 100% even if
  // a rounding glitch accumulates upstream.
  const nextDuePct = contractTotal > 0
    ? Math.min(100 - receivedPct - processingPct, (nextDueRemaining / contractTotal) * 100)
    : 0;

  return (
    <div className="hidden lg:grid w-full" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', columnGap: cs(24) }}>
      {/* PROGRESS — cols 1-8 */}
      <div className="col-span-8 flex flex-col gap-3">
        <p className="text-[14px] xl:text-[16px] font-semibold text-[#262626] tracking-[0.5px] uppercase leading-normal">
          Progress
        </p>
        <div
          className="bg-[#fafafa] flex flex-col justify-center gap-1 w-full flex-1"
          style={{ borderRadius: 12, padding: cs(24) }}
        >
          {/* Bar — dark green (received) | light green (processing) | gray rest.
              Segments stack horizontally; the gray track is just the
              container's background showing through past the colored slices.
              The wrapper inherits the same font-size + leading-normal as
              the Next Payment card's `$X` figure so the bar's vertical
              midpoint lines up with the dollar amount's midpoint on the
              right (a single empty inline-flex row sized by line-height). */}
          {(() => {
            const showNextSlice = nextPaymentHovered || barHover === 'next';
            // Tooltip text + center-of-segment x-position (% of track) keyed
            // off the currently-hovered segment. Anchors the tooltip to the
            // middle of whichever slice the pointer is on.
            const tooltipText =
              barHover === 'received'   ? `Received · ${fmtDollars(receivedAmount)}`
            : barHover === 'processing' ? `Processing · ${fmtDollars(processingAmount)}`
            : barHover === 'next'       ? `Next Payment · ${fmtDollars(nextDueRemaining)}`
            : null;
            const tooltipPct =
              barHover === 'received'   ? receivedPct / 2
            : barHover === 'processing' ? receivedPct + processingPct / 2
            : barHover === 'next'       ? receivedPct + processingPct + nextDuePct / 2
            : 0;
            return (
              <div
                className="text-[24px] xl:text-[28px] leading-normal flex items-center w-full"
                style={{ height: '1lh' }}
              >
                {/* Bar wrapper — `relative` so the tooltip can anchor here.
                    No overflow:hidden so the tooltip can escape upward. The
                    inner clip-mask div handles the rounded clipping for the
                    segments themselves. */}
                <div
                  className="relative w-full"
                  style={{ height: 10, background: '#e5e5e5', borderRadius: 999 }}
                >
                  {/* Clip mask — segments live inside, get clipped to the
                      pill shape via overflow:hidden + matching radius. */}
                  <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 999 }}>
                    {receivedAmount > 0 && (
                      <div
                        className="absolute top-0 left-0 h-full transition-[filter] duration-150"
                        onMouseEnter={() => setBarHover('received')}
                        onMouseLeave={() => setBarHover(null)}
                        style={{
                          width: `${receivedPct}%`,
                          background: '#04b50b',
                          filter: barHover === 'received' ? 'brightness(1.15)' : undefined,
                          cursor: 'help',
                        }}
                      />
                    )}
                    {processingAmount > 0 && (
                      // Processing slice — hatched fill (diagonal stripes of
                      // dark green over a light-green base) to convey the
                      // in-flight "still settling" state.
                      <div
                        className="absolute top-0 h-full transition-[filter] duration-150"
                        onMouseEnter={() => setBarHover('processing')}
                        onMouseLeave={() => setBarHover(null)}
                        style={{
                          left: `${receivedPct}%`,
                          width: `${processingPct}%`,
                          backgroundColor: '#c4ecc6',
                          backgroundImage:
                            'repeating-linear-gradient(-45deg, #6fd073 0, #6fd073 4px, transparent 4px, transparent 8px)',
                          filter: barHover === 'processing' ? 'brightness(0.92)' : undefined,
                          cursor: 'help',
                        }}
                      />
                    )}
                    {nextDueRemaining > 0 && (
                      // Next-payment slice — always present as a hit area for
                      // hover/tooltip; visually transparent until either the
                      // Next Payment card is hovered or the user points
                      // directly at this slice. Pulses on a 1.6s cycle while
                      // visible.
                      <div
                        className="absolute top-0 h-full transition-[filter] duration-150"
                        onMouseEnter={() => setBarHover('next')}
                        onMouseLeave={() => setBarHover(null)}
                        style={{
                          left: `${receivedPct + processingPct}%`,
                          width: `${nextDuePct}%`,
                          background: showNextSlice ? '#a3c9f2' : 'transparent',
                          animation: showNextSlice ? 'progressNextPulse 1.6s ease-in-out infinite' : undefined,
                          filter: barHover === 'next' ? 'brightness(1.1)' : undefined,
                          cursor: 'help',
                        }}
                      />
                    )}
                  </div>

                  {/* Tooltip — sits above the bar track, anchored to the
                      hovered segment's horizontal midpoint. Pointer-events
                      disabled so it never interferes with the underlying
                      hover detection on the segment. */}
                  {tooltipText !== null && (
                    <div
                      className="absolute pointer-events-none whitespace-nowrap"
                      style={{
                        left: `${tooltipPct}%`,
                        bottom: '100%',
                        marginBottom: 8,
                        transform: 'translateX(-50%)',
                        background: '#262626',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.2,
                        zIndex: 10,
                      }}
                    >
                      {tooltipText}
                      {/* Arrow — small triangle pointing at the segment. */}
                      <span
                        className="absolute"
                        aria-hidden
                        style={{
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          borderTop: '4px solid #262626',
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          width: 0,
                          height: 0,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <style>{`
            @keyframes progressNextPulse {
              0%, 100% { opacity: 1; }
              50%      { opacity: 0.45; }
            }
          `}</style>

          {/* Caption row: settlement labels on the left, outstanding on the right.
              Either label disappears when its amount is zero. */}
          <div className="flex items-center justify-between gap-4 text-[12px] xl:text-[14px] leading-normal">
            <div className="flex items-center gap-6 text-[#262626] flex-wrap">
              {receivedAmount > 0 && (
                <p>
                  <span>Received · </span>
                  <span className="font-semibold" style={{ color: '#04b50b' }}>
                    {fmtDollars(receivedAmount)}
                  </span>
                </p>
              )}
              {processingAmount > 0 && (
                <p>
                  <span>Processing · </span>
                  <span className="font-semibold" style={{ color: '#04b50b' }}>
                    {fmtDollars(processingAmount)}
                  </span>
                </p>
              )}
            </div>
            {/* Right-aligned summary — three states:
                  • Outstanding > 0:    "$X outstanding of $Y"
                  • Fully covered + processing in flight: "Paid / Submitted in full · $Y"
                  • Fully covered + nothing processing:    "Paid in full · $Y" */}
            <p className="whitespace-nowrap">
              {outstanding > 0 ? (
                <>
                  <span className="font-semibold text-[#262626]">{fmtDollars(outstanding)}</span>
                  <span className="text-[#737373]">{' '}outstanding of {fmtDollars(contractTotal)}</span>
                </>
              ) : (
                <>
                  <span className="text-[#737373]">
                    {processingAmount > 0 ? 'Paid / Submitted in full · ' : 'Paid in full · '}
                  </span>
                  <span className="font-semibold text-[#262626]">{fmtDollars(contractTotal)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* NEXT PAYMENT — cols 9-12 */}
      <div className="col-span-4 flex flex-col gap-3">
        <p className="text-[14px] xl:text-[16px] font-semibold text-[#262626] tracking-[0.5px] uppercase leading-normal">
          Next Payment
        </p>
        <div
          className="relative flex items-center justify-between gap-4 w-full flex-1 transition-colors overflow-hidden"
          onMouseEnter={() => setNextPaymentHovered(true)}
          onMouseLeave={() => setNextPaymentHovered(false)}
          style={{
            borderRadius: 12,
            padding: cs(24),
            // Hovered: a pale-blue tint in the same hue family as the
            // pulsing next-payment slice on the bar — visually links the
            // card to the slice it's about to surface. Resting: same
            // fafafa as the Progress card so both read as neutral. The
            // hover tint is suppressed in the fully-paid state (nothing
            // left to surface).
            background: !nextDue ? '#fafafa'
                       : nextPaymentHovered ? '#e6f0fa'
                       : '#fafafa',
          }}
        >
          {nextDue ? (
            <>
              {/* Inner stack — dollar figure with the due date directly
                  below it (gap-1). The whole group is vertically centered
                  in the card via the outer `items-center`. */}
              <div className="flex flex-col gap-1 min-w-0">
                <p
                  className="text-[24px] xl:text-[28px] font-semibold leading-normal whitespace-nowrap"
                  style={{ color: '#398ae7' }}
                >
                  {fmtDollars(nextDueRemaining)}
                </p>
                <p className="text-[12px] xl:text-[14px] text-[#737373] leading-normal whitespace-nowrap">
                  {nextDue.dueDate ? `Due ${nextDue.dueDate}` : 'No due date'}
                </p>
              </div>
              {onMakePayment && (
                <button
                  type="button"
                  onClick={onMakePayment}
                  className="bg-[#d41a32] border-0 flex items-center justify-center text-white font-semibold whitespace-nowrap cursor-pointer shrink-0"
                  style={{
                    height: 40,
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                >
                  Make A Payment
                </button>
              )}
            </>
          ) : (
            // Fully-paid state — replace the dollar/Due/CTA stack with a
            // status line + the rotated "PAID IN FULL" seal on the right.
            // Seal is multiply-blended at 50% opacity so it absorbs the
            // card background instead of sitting opaquely on top.
            <>
              <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal">
                {processingAmount > 0 ? 'Payment submitted in full' : 'Contract paid in full'}
                {paidOnDateLabel && <> on {paidOnDateLabel}</>}
              </p>
              <img
                src={SEAL_IMG}
                alt="Paid in full"
                className="absolute pointer-events-none"
                style={{
                  width: 84,
                  height: 84,
                  right: cs(16),
                  top: '50%',
                  transform: 'translateY(-50%) rotate(-15deg)',
                  transformOrigin: 'center',
                  opacity: 0.5,
                  mixBlendMode: 'multiply',
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
        <div className="shrink-0" style={{ width: cs(24) }} />
        <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] whitespace-nowrap leading-[14px]" style={{ width: cs(155) }}>
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
  const { paidOnDate } = useInvoicesData();
  const remaining = Math.max(0, inv.amount - inv.received);
  // Fully-covered invoices (paid OR processing-with-received≥amount) render
  // a "Paid on {date}" line in the Due Date column instead of a due date.
  const isFullyCovered = inv.received >= inv.amount && inv.received > 0;
  // PROCESSING palette splits on remaining balance: fully covered → green
  // (matches PAID); some still owed → blue (matches PARTIAL).
  const isPartlyProcessing = inv.status === 'processing' && !isFullyCovered;
  const barColor   = isPartlyProcessing ? '#398ae7' : STATUS_BAR_COLOR_DESKTOP[inv.status];
  const labelColor = isPartlyProcessing ? '#398ae7' : STATUS_LABEL_COLOR[inv.status];

  // Processing rows render their left status strip as a hatched fill —
  // dark-green diagonal stripes over a light-green base — to match the
  // hatched processing slice on the desktop progress bar (same 4px:4px
  // ratio, same colors). All other statuses keep the solid 4px CSS
  // border. The hatch is rendered as an absolutely-positioned 4px-wide
  // overlay since CSS borders can't carry a hatched fill.
  const isProcessingStatus = inv.status === 'processing';
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
      className={`relative group bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors flex items-center w-full cursor-pointer ${isProcessingStatus ? '' : 'border-l-4 border-solid'}`}
      style={{
        height: 48,
        borderColor: isProcessingStatus ? undefined : barColor,
        fontFamily: 'Segoe UI, sans-serif',
        gap: cs(12),
        // Add the 4px the missing border would have taken so processing
        // rows align with the rest of the table at the same content
        // start-x.
        paddingLeft: isProcessingStatus ? `calc(${cs(24)} + 4px)` : cs(24),
        paddingRight: cs(24),
      }}
    >
      {isProcessingStatus && (
        <div
          className="absolute top-0 left-0 h-full pointer-events-none"
          style={{
            width: 4,
            backgroundColor: '#c4ecc6',
            backgroundImage:
              'repeating-linear-gradient(-45deg, #6fd073 0, #6fd073 4px, transparent 4px, transparent 8px)',
          }}
        />
      )}
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
      {/* Spacer between Status and Due Date — mirrors the header row. */}
      <div className="shrink-0" style={{ width: cs(24) }} />
      {/* Due Date column — fully-covered (paid OR processing-with-received≥
          amount): green "Paid on …"; partial / partly-processing: due date
          with overdue/today badge; unpaid: plain due date. */}
      <div className="relative flex items-center" style={{ width: cs(155), gap: cs(12) }}>
        {/* Fully-covered — surface the real payment date even when the
            invoice has no original due date. Wording follows the clearance
            state: a paid invoice reads "Paid on …"; an in-flight ACH that
            covers the full amount but hasn't cleared yet reads
            "Submitted on …", since the funds aren't actually paid yet. */}
        {isFullyCovered && (
          <p className="text-[14px] xl:text-[16px] whitespace-nowrap leading-normal" style={{ color: '#04b50b' }}>
            {inv.status === 'processing' ? 'Submitted on' : 'Paid on'} {paidOnDate(inv.number) ?? inv.dueDate}
          </p>
        )}
        {(inv.status === 'partial' || (inv.status === 'processing' && !isFullyCovered)) && (
          <p className="flex-1 min-w-0 text-[14px] xl:text-[16px] whitespace-nowrap leading-normal overflow-hidden text-ellipsis">
            <DueDateText dueState={inv.dueState} dueDate={inv.dueDate} mutedColor="#262626" />
          </p>
        )}
        {inv.status === 'unpaid' && (
          <p className="text-[14px] xl:text-[16px] whitespace-nowrap leading-normal">
            <DueDateText dueState={inv.dueState} dueDate={inv.dueDate} mutedColor="#262626" />
          </p>
        )}
        {inv.status === 'returned' && (
          <p className="text-[14px] xl:text-[16px] whitespace-nowrap leading-normal">
            <DueDateText dueState={inv.dueState} dueDate={inv.dueDate} mutedColor="#737373" />
          </p>
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
        <p
          className="min-w-0 font-semibold text-[12px] xl:text-[14px] text-[#737373] text-right whitespace-nowrap leading-[14px]"
          style={{ flex: '1.5 1 0' }}
        >
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
  const palette = PAYMENT_STATUS_COLOR[rec.status];
  const statusLabel = PAYMENT_STATUS_LABEL[rec.status];
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
      className="bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors border-l-4 border-solid flex gap-3 items-center w-full pl-6 pr-8 xl:pl-8 xl:pr-12 2xl:pl-12 2xl:pr-20 cursor-pointer"
      style={{ height: 48, fontFamily: 'Segoe UI, sans-serif', borderColor: palette.bar }}
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
      {/* Amount Applied — invoice-paying portion. Completed: black. In-flight:
          blue. Returned: red + strikethrough so the row reads as "this much
          was attempted, but the bank reversed it." */}
      <p
        className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-right whitespace-nowrap leading-normal overflow-hidden text-ellipsis"
        style={{
          color: rec.status === 'completed' ? '#262626' : palette.amount,
          textDecoration: rec.status === 'returned' ? 'line-through' : undefined,
        }}
      >
        {fmtDollars(rec.amountApplied)}
      </p>
      {/* Platform Fee — dash when zero */}
      <p className="flex-1 min-w-0 text-[14px] xl:text-[16px] text-[#262626] text-right whitespace-nowrap leading-normal overflow-hidden text-ellipsis">
        {rec.platformFee > 0 ? fmtDollars(rec.platformFee) : '-'}
      </p>
      {/* Amount Paid — total user submitted, colored by status (green
          completed / blue processing / red returned). Non-completed rows
          prefix with the status word ("Processing · $800"). */}
      <p
        className="min-w-0 text-[14px] xl:text-[16px] text-right whitespace-nowrap leading-normal overflow-hidden text-ellipsis"
        style={{ color: palette.amount, flex: '1.5 1 0' }}
      >
        {statusLabel ? `${statusLabel} · ${fmtDollars(rec.amountPaid)}` : fmtDollars(rec.amountPaid)}
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
  invoiceMode = 'happyPath',
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
  /** DevConsole → Project Hub → Invoice toggle. 'happyPath' keeps the
   *  existing 3-invoice schedule; 'enumerate' replaces it with a synthetic
   *  list covering every status × due-date variant. */
  invoiceMode?: InvoiceMode;
}) {
  // Build per-contract data once per `contractTotal` change. Helpers and
  // tables consume it via InvoicesDataContext so subcomponents don't have
  // to receive every helper individually.
  const data = useMemo(
    () => buildInvoicesData(contractTotal, extraPayments, invoiceMode),
    [contractTotal, extraPayments, invoiceMode],
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
        <DesktopProgressAndNextPayment
          contractTotal={contractTotal}
          onMakePayment={onMakePayment}
        />
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
