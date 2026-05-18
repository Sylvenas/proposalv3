'use client';

// ── ChangeOrderPage (placeholder) ─────────────────────────────────────────────
// Renders when DevConsole's Type toggle is set to "Change Order". Wraps
// SummaryPageResponsive: the left side (Drawing / Included Products / Add-ons)
// is re-used so toggles like Upgrade / Add-on / Optionx still flow through,
// while the right-side column is fully replaced via the `rightColumn` slot
// with a Change Order-specific summary panel (PENDING CHANGE ORDER header,
// new financial breakdown, and Change Order CTAs).

import { useEffect, useMemo, useRef, useState } from 'react';
import SummaryPageResponsive, {
  ADDON_DESCRIPTIONS,
  ContactSalesButton,
  DEFAULT_ADDONS,
  SectionCard,
  type AddonItem,
  type FenceOption,
  type FenceProduct,
} from './SummaryPageResponsive';
import ProductDetailSheet, { type ProductDetailContent } from './ProductDetailSheet';
import ProjectHubStickyHeader, { type ProjectHubTab } from './ProjectHubStickyHeader';
import {
  DrawingSection as ProjectHubDrawingSection,
  ProductsSection as ProjectHubProductsSection,
} from './ProjectHubPageResponsive';
import ValidUntilPill from './ValidUntilPill';
import PricingDisclaimers from './PricingDisclaimers';
import { PdfPages } from './ContractDocSection';
import BorderlessLinkButton from './BorderlessLinkButton';
import {
  DesktopPaymentRecordsTable,
  InvoicesDataContext,
  MobilePaymentRecordCard,
  buildInvoicesData,
} from './InvoicesPaymentsSection';
import ChangeHistoryView from './ChangeHistoryView';
import {
  InvoiceComparisonRow,
  PaymentProgressBlock,
  type InvoiceRowData,
} from './ChangeOrderInvoiceRow';

const BASE = '/images/proposal-v3-responsive';
const IMG_DOWNLOAD = `${BASE}/download.svg`;
const IMG_CHEVRON_RIGHT = `${BASE}/chevron-right.svg`;

// Minimal stub option — mirrors ALL_OPTIONS[0] in OptionsPageResponsive so
// SummaryPageResponsive renders the Drawing / Included Products / Add-ons
// columns just like the regular Summary page when Upgrade / Add-on are
// enabled in DevConsole.
const STUB_OPTION: FenceOption = {
  id: 1,
  label: 'OPTION 1 - CHAIN LINK FENCE',
  features: 'Durable / Cost Effective / Transparent',
  constructionTime: '2–3 Weeks',
  price: '$8,615.00 USD',
  contractTotal: '$8,615.00',
  monthly: '$404.13 / mo',
  image: `${BASE}/option-1.webp`,
  baseMaterials: 8397,
  products: [
    { name: 'Chain Link Fabric', qty: '960', unit: 'sqf.' },
    {
      name: 'Line Posts',
      qty: '24',
      unit: 'ea.',
      upgradeOptions: [
        {
          id: 'line-1-5',
          title: '1⅝" Light-Duty Galvanized Line Posts',
          description:
            'Cost-effective galvanized line posts at the most common residential gauge. The thinner 1⅝" diameter is well-suited to short runs and yards without high wind exposure.',
          priceDelta: 0,
        },
        {
          id: 'line-2',
          title: '2" Standard Galvanized Line Posts',
          description:
            'The most popular gauge for chain-link runs of any meaningful length. The 2" diameter improves rigidity and lifetime versus light-duty stock without a significant cost premium.',
          priceDelta: 120,
        },
        {
          id: 'line-2-5',
          title: '2½" Commercial-Grade Line Posts',
          description:
            'Heavier wall thickness and a larger 2½" profile for commercial yards, perimeter security, or sites with sustained wind load. Pairs well with heavier-gauge top rail.',
          priceDelta: 280,
        },
      ],
    },
    { name: 'Top Rail', qty: '320', unit: 'lf.' },
    { name: 'Hardware & Fittings', qty: '1', unit: 'set' },
  ],
};

// ── Right-column ──────────────────────────────────────────────────────────────
// Static Change Order summary panel. Numbers are placeholder constants so the
// page looks complete; the real wiring will replace these as the workflow
// gets built out.
function ChangeOrderRightColumn({
  onViewInvoices,
  onViewContract,
}: {
  onViewInvoices?: () => void;
  onViewContract?: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-6 xl:gap-8 2xl:gap-12 w-full"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* ── Header block ── */}
      <div className="flex flex-col gap-3">
        <div className="bg-white flex flex-col items-start w-full leading-normal text-[#262626]">
          <p className="text-[12px] sm:text-[13px] xl:text-[14px] font-semibold text-[#737373] uppercase tracking-[0.06em] w-full">
            Pending Change Order #3
          </p>
          <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-semibold w-full">
            Add Pool-Side Gates &amp; Extra Panels
          </p>
          <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full">
            1722 Willis Ave NW, Grand Rapids, MI 49504
          </p>
        </div>
        {/* Valid Until pill — shares the cover page's pill component so
            padding / text size / icon size stay aligned across both pages. */}
        <ValidUntilPill date="April 30, 2026" className="self-start" />
      </div>

      {/* ── Financials ── */}
      <div className="bg-white flex flex-col items-start w-full">
        <div className="border-t-[0.5px] border-[rgba(0,0,0,0.2)] flex flex-col gap-1 lg:gap-2 items-start py-2 lg:py-3 w-full">
          <Row label={<>New Contact Total <sup className="text-[7.74px]">1</sup></>} value="$12,000.00" valueLarge />
          <Row label="Change Order Net Change" value="-$999.00" valueRegular />
          <Row label={<>Estimated Monthly Payment <sup className="text-[7.74px]">2</sup></>} value="$469.06 / mo" />
        </div>

        {/* Breakdowns */}
        <div className="border-t-[0.5px] border-[rgba(0,0,0,0.2)] flex flex-col gap-1 lg:gap-2 items-start py-2 lg:py-3 w-full">
          <Row label="Materials & Installation" value="$13,420" />
          <Row label="Discount -5%" value="$500" />
          <Row label="Sales Tax" value="$500" />
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 items-start py-2 lg:py-3 w-full">
          {/* Sign & Approve */}
          <button
            type="button"
            className="bg-[#d41a32] flex h-10 items-center justify-center px-4 py-[6px] rounded-[4px] w-full cursor-pointer border-0"
          >
            <span
              className="text-[14px] font-semibold text-white text-center whitespace-nowrap"
              style={{ fontFamily: 'Segoe UI, sans-serif', lineHeight: '18px' }}
            >
              Sign &amp; Approve
            </span>
          </button>

          {/* Revised Payment & Schedule — matches Summary's View Payment
              Schedule style (icon-wrapper div, gap-[2px]). */}
          <CardOutlinedButton
            label="Revised Payment & Schedule"
            onClick={onViewInvoices}
          />

          {/* Contact Sales — reuse Summary's button so the icon, spacing,
              and onClick (opens ContactSalesModal) stay in sync. */}
          <ContactSalesButton />

          {/* Current Approved Contract */}
          <OutlinedButton onClick={onViewContract}>
            <JumpArrowGlyph />
            Current Approved Contract
          </OutlinedButton>

          {/* Download — shares the borderless link button component with
              Project Hub's "View Invoice & Payment Record". */}
          <BorderlessLinkButton
            icon={<img src={IMG_DOWNLOAD} alt="" style={{ width: 14, height: 16 }} />}
            label="Download Change Order Doc [PDF]"
          />
        </div>

        {/* Disclaimers — shared with Summary; collapsible ①② footnote. */}
        <PricingDisclaimers />
      </div>
    </div>
  );
}

// Single label+value row used throughout the financial blocks.
function Row({
  label,
  value,
  valueLarge = false,
  valueRegular = false,
}: {
  label: React.ReactNode;
  value: string;
  valueLarge?: boolean;
  /** Render the value at regular (400) weight instead of the default light
   *  (300). Used to emphasize specific rows (e.g. Change Order Net Change). */
  valueRegular?: boolean;
}) {
  return (
    <div className="flex flex-col items-start w-full">
      <p className="text-[12px] xl:text-[14px] text-[#737373] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap">
        {label}
      </p>
      <p
        className={
          valueLarge
            ? 'text-[20px] sm:text-[24px] xl:text-[32px] text-[#262626] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap'
            : 'text-[16px] sm:text-[20px] xl:text-[24px] text-[#262626] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap'
        }
        style={valueLarge ? undefined : { fontWeight: valueRegular ? 400 : 300 }}
      >
        {value}
      </p>
    </div>
  );
}

function OutlinedButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white border border-solid border-[#262626] flex gap-2 h-10 items-center justify-center px-4 py-[6px] rounded-[4px] w-full cursor-pointer"
    >
      <span
        className="inline-flex items-center gap-2 text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
        style={{ lineHeight: '18px' }}
      >
        {children}
      </span>
    </button>
  );
}

// Card-icon outlined button — visually identical to Summary's "View Payment
// Schedule" button (gap-[2px], icon wrapped in a centering div with px-[5px]).
// Used for "Revised Payment & Schedule" and "Payment Records" so the three
// card-icon CTAs across the app stay pixel-aligned.
function CardOutlinedButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white border border-solid border-[#262626] flex gap-[2px] h-10 items-center justify-center px-4 py-[6px] rounded-[4px] w-full cursor-pointer"
    >
      <div className="flex h-full items-center px-[5px] shrink-0">
        <CardGlyph />
      </div>
      <span
        className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
        style={{ lineHeight: '18px' }}
      >
        {label}
      </span>
    </button>
  );
}

function CardGlyph() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="18" height="14" rx="2" stroke="rgba(0,0,0,0.85)" strokeWidth="1.2" />
      <line x1="1" y1="5.5" x2="19" y2="5.5" stroke="rgba(0,0,0,0.85)" strokeWidth="1.2" />
      <rect x="3" y="9" width="4" height="3" rx="0.5" stroke="rgba(0,0,0,0.85)" strokeWidth="1" />
    </svg>
  );
}

// Small padlock glyph — used next to the Approved date in the Current
// Approved Contract right column to signal that the contract is locked
// while a change order is pending.
function LockGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.2"
        stroke="#262626"
        strokeWidth="1.2"
      />
      <path
        d="M5 7V5a3 3 0 1 1 6 0v2"
        stroke="#262626"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Curved right-arrow with a tail — "jump to" affordance used by the
// View Pending Change Order CTA. Distinct from the history clock glyph
// (BackArrowGlyph) which signals navigation to an earlier record.
function JumpArrowGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M3 11C3 7.68629 5.68629 5 9 5H14M14 5L10.5 2M14 5L10.5 8"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// "History / recent" clock glyph with a counter-clockwise arrow — used next
// to navigation CTAs that jump to prior or related records (View Pending
// Change Order, Current Approved Contract, Change History). Drawn with
// strokes (stroke-width 1.4) to match the line weight of the Phone, Card,
// Document, etc. glyphs used elsewhere on the page.
function BackArrowGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Clock body (open at top-left where the rewind arrow points back in). */}
      <path
        d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Counter-clockwise arrow tail at the top-left, suggesting "back". */}
      <path
        d="M3 3v5h5"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Clock hands. */}
      <path
        d="M12 7v5l4 2"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Suppress unused-import warning while keeping the asset path available for
// future iterations of the right column.
void IMG_CHEVRON_RIGHT;

// ── "Current Approved Contract" tab right column ──────────────────────────────
// Placeholder content describing the most recently approved change order
// (CO #2) while CO #3 is pending. Mirrors the financial layout of the home
// tab's right column so the two tabs feel visually consistent.
function ContractTabRightColumn({
  onViewInvoices,
}: {
  onViewInvoices?: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-6 xl:gap-8 2xl:gap-12 w-full"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Header block */}
      <div className="flex flex-col gap-3">
        <div className="bg-white flex flex-col items-start w-full leading-normal text-[#262626]">
          <p className="text-[12px] sm:text-[13px] xl:text-[14px] font-semibold text-[#737373] uppercase tracking-[0.06em] w-full">
            Change Order #2
          </p>
          <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-semibold w-full">
            Remove East-Side Run
          </p>
          <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full">
            1722 Willis Ave NW, Grand Rapids, MI 49504
          </p>
        </div>
        <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full pt-2 inline-flex items-center gap-1.5">
          <span>Approved on 4/22/2026</span>
          <LockGlyph />
        </p>
      </div>

      {/* Lock notice — pale neutral background per the latest mock; padding
          + text scale still mirror the ExpiredNotice pill so the two info
          callouts share dimensions across the app. */}
      <div className="bg-[#eef2f9] rounded-[6px] px-3 py-2.5 xl:px-4 xl:py-3 w-full">
        <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
          <span className="font-semibold">Note:</span> this contract is locked while a change order
          is pending. Approve the change order to continue, or contact your sales representative to
          withdraw it.
        </p>
      </div>

      {/* Financials */}
      <div className="bg-white flex flex-col items-start w-full">
        <div className="border-t-[0.5px] border-[rgba(0,0,0,0.2)] flex flex-col gap-1 lg:gap-2 items-start py-2 lg:py-3 w-full">
          {/* Payment Progress block — same shape as ProjectHomeDetails, with
              the 60%-width 2px track and ~50% black fill matching $5,000 of
              $9,999. */}
          <div className="flex flex-col items-start gap-1 w-full">
            <p className="text-[12px] xl:text-[14px] text-[#737373] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap">
              Payment Progress
            </p>
            <p className="text-[16px] sm:text-[20px] xl:text-[24px] text-[#262626] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap">
              $5,000 <span style={{ color: '#a0a0a0' }}>/ $9,999</span>
            </p>
            <div
              className="rounded-full overflow-hidden flex"
              style={{ width: '60%', height: 2, background: '#e0e0e0' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: '50%', background: '#262626' }}
              />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 items-start py-2 lg:py-3 w-full">
          <OutlinedButton>
            <JumpArrowGlyph />
            View Pending Change Order
          </OutlinedButton>
          {/* Contact Sales — reuse Summary's button so the click opens the
              ContactSalesModal exactly like the Summary page. */}
          <ContactSalesButton />
          <CardOutlinedButton
            label="Payment Records"
            onClick={onViewInvoices}
          />
          <OutlinedButton>
            <BackArrowGlyph />
            Change History
          </OutlinedButton>

          {/* Download — shared borderless link button. */}
          <BorderlessLinkButton
            icon={<img src={IMG_DOWNLOAD} alt="" style={{ width: 14, height: 16 }} />}
            label="Download Signed Contract [PDF]"
          />
        </div>
      </div>
    </div>
  );
}

// Signed Contract section — appended to the Scope Details column on the
// "Current Approved Contract" tab. Reuses the PDF page renderer from the
// Project Hub's Contract Doc tab.
function SignedContractSection() {
  return (
    <SectionCard label="Signed Contract">
      <PdfPages />
    </SectionCard>
  );
}

// ── Invoices & Payments tab view (Change Order page) ─────────────────────────
// Static placeholder mirroring the latest mockup: top banner about the pending
// change order, side-by-side "Before / After" comparison of progress + invoice
// schedule, and a payment-records table at the bottom. Numbers are hard-coded
// for now; real wiring will replace them as the workflow gets built out.
function ChangeOrderInvoicesView({
  onViewPendingChangeOrder,
}: {
  onViewPendingChangeOrder?: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-8 w-full pt-6 lg:pt-8"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Section title */}
      <p className="text-[12px] sm:text-[14px] xl:text-[16px] font-semibold text-[#262626] tracking-[0.06em] uppercase">
        Progress &amp; Schedule
      </p>

      {/* Banner — light blue notice about pending change order */}
      <div className="bg-[#eef2f9] rounded-[6px] px-5 py-4 w-full">
        <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
          A change order is pending your approval. Review the comparison below before making a
          decision. Invoice payments are temporarily locked until you approve the change order or
          contact your sales representative to withdraw it. If approved, the revised schedule will
          become the basis for future payments.{' '}
          <button
            type="button"
            onClick={onViewPendingChangeOrder}
            className="bg-transparent border-0 p-0 cursor-pointer text-[14px] xl:text-[16px] text-[#262626] underline align-baseline"
            style={{ textDecorationSkipInk: 'none' }}
          >
            View the pending Change Order
          </button>
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <ComparisonPanel
          accent="neutral"
          heading="Before Change Order"
          progressLabel="Current Progress · 31%"
          received="$1,000"
          processing="$3,000"
          invoiceTotal="$12,999"
          outstanding="$3,999"
          invoicesHeading="Current Invoices · 3"
          invoices={[
            { num: 1, label: 'Deposit (15%)', paid: '$2,000', total: '$2,000', statusLine: 'Paid on Mar 23, 2026', status: 'paid' },
            { num: 2, label: 'Balance (32%)', paid: '$2,000', total: '$3,999', statusLine: 'Due on May 2, 2026', status: 'partial' },
            { num: 3, label: 'Balance (15%)', paid: '-', total: '$2,000', statusLine: 'Due on Jun 11, 2026', status: 'pending' },
            { num: 4, label: 'Balance (38%)', paid: '-', total: '$5,000', statusLine: 'Due on Aug 20, 2026', status: 'pending' },
          ]}
        />
        <ComparisonPanel
          accent="blue"
          heading="After Change Order Approval"
          progressLabel="Revised Progress · 33%"
          received="$1,000"
          processing="$3,000"
          invoiceTotal="$12,000"
          outstanding="$3,999"
          invoicesHeading="Revised Invoices · 4"
          invoices={[
            { num: 1, label: 'Deposit (16%)', paid: '$2,000', total: '$2,000', statusLine: 'Paid on Mar 23, 2026', status: 'paid' },
            { num: 2, label: 'Balance (42%)', paid: '$2,000', total: '$5,000', statusLine: 'Due on May 2, 2026', status: 'partial' },
            { num: 3, label: 'Balance (42%)', paid: '-', total: '$5,000', statusLine: 'Due on Jun 11, 2026', status: 'pending' },
          ]}
        />
      </div>

      {/* Payment Records — reuse InvoicesPaymentsSection's tables verbatim,
          wrapped in its InvoicesDataContext so they pick up the real
          per-status accent bar, columns, mobile cards, and responsive
          rules. Placeholder contractTotal until the real wiring lands. */}
      <ChangeOrderPaymentRecords />
    </div>
  );
}

function ChangeOrderPaymentRecords() {
  // Override the synthetic PAYMENT_RECORDS from buildInvoicesData so the two
  // payment amounts reconcile to the invoice paid totals shown above. 1091
  // (newer, $3,000) is in `processing` so the progress bar's "Processing"
  // segment maps to a real, in-flight payment record. 1030 ($1,000) is the
  // settled "Received" portion.
  const data = useMemo(() => {
    const base = buildInvoicesData(12999);
    // Swap payment methods between the two records — 1030 should pay by
    // Credit Card and 1091 by Check (mirror of the synthetic defaults).
    const methods = base.PAYMENT_RECORDS.map((r) => r.method);
    const overridden = base.PAYMENT_RECORDS.map((rec, i) => {
      // Index 0 is newest-first (1091, Mar 23) — the $3,000 processing
      // payment. Index 1 (1030, Jan 2) is the $1,000 completed payment.
      const isProcessing = i === 0;
      const amount = isProcessing ? 3000 : 1000;
      // Swap method with the sibling record.
      const swappedMethod = methods[methods.length - 1 - i] ?? rec.method;
      return {
        ...rec,
        amountApplied: amount,
        platformFee: 0,
        amountPaid: amount,
        method: swappedMethod,
        status: isProcessing ? ('processing' as const) : ('completed' as const),
      };
    });
    return { ...base, PAYMENT_RECORDS: overridden };
  }, []);
  return (
    <InvoicesDataContext.Provider value={data}>
      <div className="w-full pt-4">
        {/* Desktop table (lg+) — owns its own "PAYMENT RECORDS · N" heading. */}
        <DesktopPaymentRecordsTable onOpenPayment={() => {}} />
        {/* Mobile (< lg) — heading + stacked cards matching InvoicesPaymentsSection. */}
        <div className="lg:hidden flex flex-col gap-2 items-start w-full">
          <p className="text-[12px] sm:text-[16px] font-semibold text-[#262626] leading-normal">
            Payment Records
          </p>
          <div className="flex flex-col gap-3 w-full">
            {data.PAYMENT_RECORDS.map((rec) => (
              <MobilePaymentRecordCard key={rec.paymentId} rec={rec} onOpen={() => {}} />
            ))}
          </div>
        </div>
      </div>
    </InvoicesDataContext.Provider>
  );
}

function ComparisonPanel({
  accent,
  heading,
  progressLabel,
  received,
  processing,
  invoiceTotal,
  outstanding,
  invoicesHeading,
  invoices,
}: {
  accent: 'neutral' | 'blue';
  heading: string;
  progressLabel: string;
  received: string;
  processing: string;
  invoiceTotal: string;
  outstanding: string;
  invoicesHeading: string;
  invoices: InvoiceRowData[];
}) {
  const bg = accent === 'blue' ? '#eef2f9' : '#f5f5f5';
  // Derive progress-bar segment widths from the dollar strings so the bar
  // proportions reflect Received / Processing against Invoice Total. The
  // strings come in as "$1,000" / "$12,999"; strip non-digits and divide.
  const parseDollars = (s: string) => Number(s.replace(/[^\d.-]/g, '')) || 0;
  const totalNum = parseDollars(invoiceTotal);
  const receivedPct = totalNum > 0 ? (parseDollars(received) / totalNum) * 100 : 0;
  const processingPct = totalNum > 0 ? (parseDollars(processing) / totalNum) * 100 : 0;
  return (
    <div className="flex flex-col gap-3 w-full lg:flex-1">
      <p className="font-semibold text-[12px] xl:text-[14px] text-[#737373] leading-[14px]">{heading}</p>
      {/* `flex-1` so the inner column grows to match the taller sibling's
          height on lg+. Each child (Progress / Invoices) carries its own
          background + radius + padding so the two read as separate cards
          with the page bg showing through between them. */}
      <div className="flex flex-col gap-3 w-full flex-1">
      {/* Progress block — shared with ChangeHistoryView's Payment Snapshot. */}
      <PaymentProgressBlock
        progressLabel={progressLabel}
        received={received}
        processing={processing}
        invoiceTotal={invoiceTotal}
        outstanding={outstanding}
        receivedPct={receivedPct}
        processingPct={processingPct}
        bg={bg}
      />

      {/* Invoices block — `flex-1` so the panel with fewer invoices stretches
          its tinted card down to match the sibling panel's taller invoices
          card. The rows stay top-aligned; the extra height becomes bottom
          padding inside the tinted card. */}
      <div
        className="flex flex-col gap-2 w-full flex-1"
        style={{ background: bg, borderRadius: 8, padding: '24px 20px' }}
      >
        <p className="text-[12px] font-semibold text-[#262626] uppercase tracking-[0.06em]">
          {invoicesHeading}
        </p>
        <div className="flex flex-col gap-2 w-full">
          {invoices.map((inv) => (
            <InvoiceComparisonRow key={inv.num} row={inv} />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

// Flatten the stub option's products so any upgradeable line item is
// presented as a plain product using the default (first) upgrade option's
// title and description. Used by the Current Approved Contract tab, where
// upgrades are no longer editable — the selected upgrade is shown as a
// regular product (clicking it still opens a detail sheet with the
// selected upgrade's description).
function flattenSelectedUpgrades(products: FenceProduct[]): FenceProduct[] {
  return products.map((p) => {
    if (!p.upgradeOptions || p.upgradeOptions.length === 0) return p;
    const selected = p.upgradeOptions[0];
    return {
      ...p,
      name: selected.title,
      description: selected.description,
      upgradeOptions: undefined,
    };
  });
}

export default function ChangeOrderPage() {
  const [addons, setAddons] = useState<AddonItem[]>(DEFAULT_ADDONS);
  const [tab, setTab] = useState<ProjectHubTab>('home');
  // Product detail sheet state — only used by the Current Approved Contract
  // tab. The Home tab's left column is owned by SummaryPageResponsive, which
  // manages its own sheet internally.
  const [productDetail, setProductDetail] = useState<ProductDetailContent | null>(null);

  const isContractTab = tab === 'contract';
  const isInvoicesTab = tab === 'invoices';
  const isChangesTab = tab === 'changes';
  const selectedAddons = addons.filter((a) => a.selected);

  // Body slide-in direction — derived from the previous tab so forward
  // navigation (Home → Contract → Invoices → Changes) slides in from the
  // right, and going back slides in from the left.
  const TAB_ORDER: ProjectHubTab[] = ['home', 'contract', 'invoices', 'changes'];
  const prevTabRef = useRef<ProjectHubTab>(tab);
  const slideDirection: 'left' | 'right' =
    TAB_ORDER.indexOf(tab) >= TAB_ORDER.indexOf(prevTabRef.current)
      ? 'right'
      : 'left';
  useEffect(() => {
    prevTabRef.current = tab;
  }, [tab]);

  const handleOpenProduct = (p: FenceProduct) => {
    setProductDetail({
      kind: 'product',
      category: p.name,
      qtyLabel: `${p.qty} ${p.unit}`,
      description:
        p.description ??
        'A quality component included in this option. Detailed specifications and product imagery for this line item will appear here.',
      includedLabel: 'Included in the scope',
    });
  };

  const handleOpenAddon = (a: AddonItem) => {
    setProductDetail({
      kind: 'product',
      category: a.name,
      qtyLabel: `${a.qty} ${a.unit}`,
      description:
        ADDON_DESCRIPTIONS[a.id] ??
        'An optional upgrade for this project. Details and product imagery for this add-on will appear here.',
      includedLabel: 'Included in the scope',
    });
  };

  // Contract tab — Project Hub-style products list: no Change pill, no
  // editable add-ons; selected upgrades and selected add-ons are folded
  // into Included Products as plain line items. Clicking opens the same
  // detail sheet used by Project Home.
  const contractLeftColumn = (
    <>
      <ProjectHubDrawingSection />
      <ProjectHubProductsSection
        products={flattenSelectedUpgrades(STUB_OPTION.products)}
        selectedAddons={selectedAddons}
        onOpenProduct={handleOpenProduct}
        onOpenAddon={handleOpenAddon}
        noImageThumb
      />
      <SignedContractSection />
    </>
  );

  return (
    <>
      <SummaryPageResponsive
        option={STUB_OPTION}
        addons={addons}
        setAddons={setAddons}
        singleOptionMode
        signatureRequired={false}
        onBack={() => {}}
        onShowCover={() => {}}
        onRequestSign={() => {}}
        stickyHeader={<ProjectHubStickyHeader active={tab} onChange={setTab} />}
        bodyTransitionKey={tab}
        bodyTransitionDirection={slideDirection}
        rightColumnTopPx={80}
        rightColumn={
          isContractTab ? (
            <ContractTabRightColumn onViewInvoices={() => setTab('invoices')} />
          ) : (
            <ChangeOrderRightColumn
              onViewInvoices={() => setTab('invoices')}
              onViewContract={() => setTab('contract')}
            />
          )
        }
        replaceLeftColumn={isContractTab ? contractLeftColumn : undefined}
        bodyOverride={
          isInvoicesTab ? (
            <ChangeOrderInvoicesView onViewPendingChangeOrder={() => setTab('home')} />
          ) : isChangesTab ? (
            <ChangeHistoryView products={flattenSelectedUpgrades(STUB_OPTION.products)} />
          ) : undefined
        }
      />
      <ProductDetailSheet
        open={productDetail !== null}
        content={productDetail}
        onClose={() => setProductDetail(null)}
      />
    </>
  );
}
