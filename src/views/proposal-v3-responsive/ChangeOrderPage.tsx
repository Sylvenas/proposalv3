'use client';

// ── ChangeOrderPage (placeholder) ─────────────────────────────────────────────
// Renders when DevConsole's Type toggle is set to "Change Order". Wraps
// SummaryPageResponsive: the left side (Drawing / Included Products / Add-ons)
// is re-used so toggles like Upgrade / Add-on / Optionx still flow through,
// while the right-side column is fully replaced via the `rightColumn` slot
// with a Change Order-specific summary panel (PENDING CHANGE ORDER header,
// new financial breakdown, and Change Order CTAs).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SummaryPageResponsive, {
  ADDON_DESCRIPTIONS,
  ContactSalesButton,
  DEFAULT_ADDONS,
  ExpiredNotice,
  OptionSummaryTitleBlock,
  SectionCard,
  type AddonItem,
  type FenceOption,
  type FenceProduct,
} from './SummaryPageResponsive';
import ProductDetailSheet, { type ProductDetailContent } from './ProductDetailSheet';
import SignatureOverlay from './SignatureOverlay';
import MakePaymentDialog, {
  type ConfirmedPaymentInfo,
  type PaymentTarget,
} from './MakePaymentDialog';
import {
  PaymentProgressAndNextPayment,
  ProjectHomeCTAs,
  ProjectHubStickyFooter,
} from './ProjectHubPageResponsive';
import ProjectHubStickyHeader, { type ProjectHubTab, type TabDef } from './ProjectHubStickyHeader';
import {
  DrawingSection as ProjectHubDrawingSection,
  ProductsSection as ProjectHubProductsSection,
} from './ProjectHubPageResponsive';
import ValidUntilPill from './ValidUntilPill';
import PricingDisclaimers from './PricingDisclaimers';
import ContractDocSection, { ContractDocStickyFooter, PdfPages } from './ContractDocSection';
import { OverpaidStickyFooter } from './OverpaidStickyFooter';
import BorderlessLinkButton from './BorderlessLinkButton';
import BackToTopButton from './BackToTopButton';
import InvoicesPaymentsSection, {
  DesktopPaymentRecordsTable,
  InvoicesDataContext,
  MobileInvoiceCard,
  MobilePaymentRecordCard,
  buildInvoicesData,
  type ExtraPaymentSpec,
  type Invoice as InvoiceData,
  type InvoiceSpec,
} from './InvoicesPaymentsSection';
import ChangeHistoryView, { TotalsRow } from './ChangeHistoryView';
import { useDevConsole } from './DevConsoleContext';
import PaymentScheduleDialog, {
  type PaymentScheduleData,
} from './PaymentScheduleDialog';
import {
  InvoiceComparisonRow,
  PaymentProgressBlock,
  useChangeOrderInvoicePanels,
  useChangeOrderPaymentRecords,
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

// Shared Change Order header — eyebrow + title + address + Valid Until pill.
// Rendered both at the top of the mobile layout (via SummaryPageResponsive's
// `mobileTopTitleOverride`) and inside the right-column summary panel.
// When Change Order Status = Expired the Valid Until pill is swapped for the
// shared ExpiredNotice (reused from the Summary page) with "change order" as
// the subject — the change order is no longer approvable, so the timestamp
// becomes a past-tense "Expired on" header plus a short body line.
function ChangeOrderHeaderBlock({ expired = false }: { expired?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <OptionSummaryTitleBlock
        eyebrow="Pending Change Order #3"
        titleOverride="Remove East-Side Run"
      />
      {expired ? (
        <ExpiredNotice subject="change order" />
      ) : (
        <ValidUntilPill date="April 30, 2026" className="self-start" />
      )}
    </div>
  );
}

// Approved variant — mirrors ProjectHomeTitleBlock from ProjectHubPageResponsive
// so the Type=Change Order approved state visually matches the Type=Proposal
// approved Project Home, with content swapped (CHANGE ORDER #3 + "Change
// Order Approved on M/D/YYYY"). Falls back to today's date if approvedAt is
// missing (safety net for direct renders that skipped the signature flow).
function ApprovedChangeOrderTitleBlock({
  approvedAt,
}: {
  approvedAt?: Date | null;
}) {
  const d = approvedAt ?? new Date();
  const approvedLabel =
    `Change Order Approved on ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  return (
    <div
      className="bg-white flex flex-col items-start w-full leading-normal text-[#262626]"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full">
        1722 Willis Ave NW, Grand Rapids, MI 49504
      </p>
      <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-semibold w-full">
        CHANGE ORDER #3
      </p>
      {/* Full change order name, same type ramp as the eyebrow above. */}
      <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-semibold w-full">
        Remove East-Side Run
      </p>
      <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full pt-2">
        {approvedLabel}
      </p>
    </div>
  );
}

// ── Right-column ──────────────────────────────────────────────────────────────
// Static Change Order summary panel. Numbers are placeholder constants so the
// page looks complete; the real wiring will replace these as the workflow
// gets built out.
function ChangeOrderRightColumn({
  onViewInvoices,
  onViewContract,
  onOpenSchedule,
  onRequestSign,
  onViewChangeHistory,
  onMakePayment,
  makePaymentBtnRef,
  extraPayments = [],
  invoicesOverrides,
  approved = false,
  approvedAt = null,
  expired = false,
}: {
  onViewInvoices?: () => void;
  onViewContract?: () => void;
  onOpenSchedule?: () => void;
  onRequestSign?: () => void;
  /** Wired only in the approved Change Order Project Hub — the "Change
   *  History" CTA that replaces "Download Contract [PDF]" navigates to the
   *  Change History tab. */
  onViewChangeHistory?: () => void;
  /** Wired only in the approved Change Order Project Hub — opens the same
   *  MakePaymentDialog the Invoices & Payments tab + Change History detail
   *  panel use, so all three Make A Payment buttons share one dialog. */
  onMakePayment?: () => void;
  /** Ref attached to the inline Make A Payment button — observed by the
   *  parent so the sticky footer only appears once this button has scrolled
   *  off (mirroring the Proposal Project Hub's sticky-footer gating). */
  makePaymentBtnRef?: React.Ref<HTMLButtonElement>;
  /** User-confirmed payments from the Make A Payment dialog. Cascaded into
   *  the invoice schedule so the Project Home progress block stays in
   *  lockstep with the Invoices & Payments tab. */
  extraPayments?: ExtraPaymentSpec[];
  /** Revised invoice schedule + chronology built from the after-CO panel.
   *  Supplied by ChangeOrderPage so the same `buildInvoicesData` call drives
   *  both this block and the Invoices tab. */
  invoicesOverrides?: {
    invoiceSpecs?: InvoiceSpec[];
    staticChronology?: ExtraPaymentSpec[];
  };
  /** When true, swap the pending header block for the approved variant and
   *  hide the Sign & Approve CTA — mirrors the Proposal Project Home post-
   *  approval layout. */
  approved?: boolean;
  approvedAt?: Date | null;
  /** When true (Change Order Status = Expired), swap the Valid Until pill
   *  for the ExpiredNotice and rework the pending CTA stack: drop the
   *  Sign & Approve primary, float Contact Sales to the top of the stack. */
  expired?: boolean;
}) {
  const { config } = useDevConsole();
  const showFinancing = config.financingEstimation === 'included';
  // Approved-state progress block reuses the Proposal Project Hub's
  // PaymentProgressAndNextPayment visual verbatim. Run the schedule through
  // `buildInvoicesData` with the revised CO overrides AND any user-confirmed
  // `extraPayments` so this block updates whenever the Make A Payment
  // dialog appends a new payment — same single source of truth the Invoices
  // & Payments tab uses.
  const invoiceData = useMemo(
    () =>
      buildInvoicesData(
        invoicesOverrides?.invoiceSpecs?.reduce((s, spec) => s + spec.amount, 0) ?? 0,
        extraPayments,
        config.invoiceMode,
        invoicesOverrides,
      ),
    [extraPayments, config.invoiceMode, invoicesOverrides],
  );
  // Voided invoices' totals are wiped by the contract reduction, so they
  // don't contribute to the contract total displayed in the Project Home
  // progress block (matches `afterPanel.invoiceTotal`).
  const contractTotalNum = invoiceData.INVOICES.reduce(
    (s, inv) => s + (inv.voided ? 0 : inv.amount),
    0,
  );
  const receivedNum = invoiceData.PAYMENT_RECORDS
    .filter((r) => r.status === 'completed')
    .reduce((s, r) => s + r.amountApplied, 0);
  const processingNum = invoiceData.PAYMENT_RECORDS
    .filter((r) => r.status === 'processing')
    .reduce((s, r) => s + r.amountApplied, 0);
  const paidAmountNum = invoiceData.totalAmountApplied;
  // Next-due invoice = first row that isn't fully settled. Pull the percent
  // from the label and use the invoice's dueDate verbatim.
  const nextDueRow = invoiceData.INVOICES.find((inv) => inv.received < inv.amount);
  const nextDue = nextDueRow
    ? {
        remaining: Math.max(0, nextDueRow.amount - nextDueRow.received),
        percent: Number(nextDueRow.label.match(/\((\d+)%\)/)?.[1] ?? 0),
        dueDate: nextDueRow.dueDate,
      }
    : null;
  // Fully-paid surface — most recent settled record's paidOn date. Falls
  // back to the latest invoice dueDate if no settled record exists.
  const fullyPaidOn =
    invoiceData.PAYMENT_RECORDS.find((r) => r.status === 'completed' || r.status === 'processing')
      ?.paidOn ??
    invoiceData.INVOICES[invoiceData.INVOICES.length - 1]?.dueDate ??
    '';
  return (
    <div
      className="flex flex-col gap-6 xl:gap-8 2xl:gap-12 w-full"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* ── Header block — approved variant matches ProjectHomeTitleBlock. ── */}
      {approved ? (
        <ApprovedChangeOrderTitleBlock approvedAt={approvedAt} />
      ) : (
        <ChangeOrderHeaderBlock expired={expired} />
      )}

      {/* ── Financials ── Approved swaps the pending CO total breakdown for the
          Invoices & Payments tab's PaymentProgressBlock (after-CO state),
          rendered borderless so it inherits the right column's white card. */}
      <div className="bg-white flex flex-col items-start w-full">
        {approved ? (
          <PaymentProgressAndNextPayment
            paidAmount={paidAmountNum}
            receivedAmount={receivedNum}
            processingAmount={processingNum}
            contractTotal={contractTotalNum}
            nextDue={nextDue}
            fullyPaidOn={fullyPaidOn}
            paymentCompletionIndication={config.paymentCompletionIndication}
          />
        ) : (
          <>
            <div className="border-t-[0.5px] border-[rgba(0,0,0,0.2)] flex flex-col gap-1 lg:gap-2 items-start py-2 lg:py-3 w-full">
              <Row label={<>New Contact Total <sup className="text-[7.74px]">1</sup></>} value="$12,000.00" valueLarge />
              <Row label="Change Order Net Change" value="-$999.00" valueRegular />
              {showFinancing && (
                <Row label={<>Estimated Monthly Payment <sup className="text-[7.74px]">2</sup></>} value="$469.06 / mo" />
              )}
            </div>

            {/* Breakdowns */}
            <div className="border-t-[0.5px] border-[rgba(0,0,0,0.2)] flex flex-col gap-1 lg:gap-2 items-start py-2 lg:py-3 w-full">
              <Row label="Materials & Installation" value="$13,420" />
              <Row label="Discount -5%" value="$500" />
              <Row label="Sales Tax" value="$500" />
            </div>
          </>
        )}

        {/* CTAs — approved swaps the pending Sign & Approve / Revised Schedule
            stack for the Proposal Project Hub's post-approval action set
            (Make A Payment / Invoice & Payment Record / Contact Sales /
            Download Contract) so the operations a customer can take after a
            Change Order is approved mirror those available after a Proposal
            is approved. */}
        <div className="flex flex-col gap-3 items-start py-2 lg:py-3 w-full">
          {approved ? (
            <ProjectHomeCTAs
              nextDue={!!nextDue}
              financingService={config.financingService}
              onShowPaymentRecords={onViewInvoices}
              onMakePayment={onMakePayment}
              paymentBtnRef={makePaymentBtnRef}
              downloadCtaOverride={
                <OutlinedButton onClick={onViewChangeHistory}>
                  <BackArrowGlyph />
                  Change History
                </OutlinedButton>
              }
              belowMainCtas={
                <BorderlessLinkButton
                  icon={<img src={IMG_DOWNLOAD} alt="" style={{ width: 14, height: 16 }} />}
                  label="Download Contract [PDF]"
                />
              }
            />
          ) : (
            <>
              {/* Sign & Approve — primary CTA, hidden when the change order
                  has expired (it isn't approvable in that state). When
                  expired we promote Contact Sales to the top of the stack
                  so the most useful affordance leads — mirrors the Proposal
                  Summary's expired CTA reordering. */}
              {expired ? (
                <ContactSalesButton />
              ) : (
                <button
                  type="button"
                  onClick={onRequestSign}
                  data-sticky-footer-anchor
                  className="bg-[#d41a32] flex h-10 items-center justify-center px-4 py-[6px] rounded-[4px] w-full cursor-pointer border-0"
                >
                  <span
                    className="text-[14px] font-semibold text-white text-center whitespace-nowrap"
                    style={{ fontFamily: 'Segoe UI, sans-serif', lineHeight: '18px' }}
                  >
                    {config.signatureRequired ? <>Sign &amp; Approve</> : 'Approve'}
                  </span>
                </button>
              )}

              {/* Revised Payment & Schedule — matches Summary's View Payment
                  Schedule style (icon-wrapper div, gap-[2px]). */}
              <CardOutlinedButton
                label="Revised Payment & Schedule"
                onClick={onOpenSchedule}
              />

              {/* Contact Sales — default mid-list position (omitted here in
                  Expired state since it's already rendered at the top). */}
              {!expired && <ContactSalesButton />}

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
            </>
          )}
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

// Shared Contract-tab header — CHANGE ORDER #2 eyebrow + title + address +
// "Approved on …" + the lock notice. Rendered both inside ContractTabRightColumn
// and at the top of the mobile layout via `mobileTopTitleOverride`.
function ContractTabHeaderBlock() {
  return (
    <div className="flex flex-col gap-6 xl:gap-8 2xl:gap-12 w-full">
      <div className="flex flex-col gap-3">
        <div className="bg-white flex flex-col items-start w-full leading-normal text-[#262626]">
          <p className="text-[12px] sm:text-[13px] xl:text-[14px] font-semibold text-[#737373] uppercase tracking-[0.06em] w-full">
            Change Order #2
          </p>
          <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-semibold w-full">
            Add Pool-Side Gates &amp; Extra Panels
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
      {/* Lock notice — pale blue advisory background, matching the
          Change History DetailNotice ("contract locked while a CO is
          pending") so both surfaces share one info-callout color across
          the app. Padding + text scale still mirror the ExpiredNotice
          pill so the callouts share dimensions. */}
      <div
        className="rounded-[6px] px-3 py-2.5 xl:px-4 xl:py-3 w-full"
        style={{ background: '#d1e7ff' }}
      >
        <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
          This contract is locked while a change order is pending. Approve the change order to
          continue, or contact your sales representative to withdraw it.
        </p>
      </div>
    </div>
  );
}

// ── "Current Approved Contract" tab right column ──────────────────────────────
// Placeholder content describing the most recently approved change order
// (CO #2) while CO #3 is pending. Mirrors the financial layout of the home
// tab's right column so the two tabs feel visually consistent.
function ContractTabRightColumn({
  onViewInvoices,
  onViewPendingChangeOrder,
  onViewChangeHistory,
  viewPendingButtonRef,
}: {
  onViewInvoices?: () => void;
  onViewPendingChangeOrder?: () => void;
  onViewChangeHistory?: () => void;
  /** Optional ref attached to the "View Pending Change Order" button's
   *  wrapper. ChangeOrderPage uses it with IntersectionObserver to hide
   *  the mobile sticky footer while this inline CTA is on screen. */
  viewPendingButtonRef?: React.Ref<HTMLDivElement>;
}) {
  // Pull the Before-CO panel for the current contract so the Payment
  // Progress block here tracks the Invoices & Payments tab and reacts
  // to the Existing Payment toggle.
  const { before: beforePanel } = useChangeOrderInvoicePanels();
  const parseDollars = (s: string) => Number(s.replace(/[^\d.-]/g, '')) || 0;
  const totalNum = parseDollars(beforePanel.invoiceTotal);
  const receivedNum = parseDollars(beforePanel.received);
  const processingNum = parseDollars(beforePanel.processing);
  const paidNum = receivedNum + processingNum;
  // Fill never exceeds 100% — Over Paid stops at the rail's end.
  const paidPct = totalNum > 0 ? Math.min(100, (paidNum / totalNum) * 100) : 0;
  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;
  return (
    <div
      className="flex flex-col gap-6 xl:gap-8 2xl:gap-12 w-full"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      <ContractTabHeaderBlock />

      {/* Financials */}
      <div className="bg-white flex flex-col items-start w-full">
        <div className="border-t-[0.5px] border-[rgba(0,0,0,0.2)] flex flex-col gap-1 lg:gap-2 items-start py-2 lg:py-3 w-full">
          {/* Payment Progress — paid (received + processing) over the
              current contract total, driven by the shared Before-CO data
              so it stays in sync with the Invoices & Payments tab. */}
          <div className="flex flex-col items-start gap-1 w-full">
            <p className="text-[12px] xl:text-[14px] text-[#737373] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap">
              Payment Progress
            </p>
            <p className="text-[16px] sm:text-[20px] xl:text-[24px] text-[#262626] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap">
              {fmt(paidNum)} <span style={{ color: '#a0a0a0' }}>/ {fmt(totalNum)}</span>
            </p>
            <div
              className="rounded-full overflow-hidden flex"
              style={{ width: '60%', height: 2, background: '#e0e0e0' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${paidPct}%`, background: '#262626' }}
              />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 items-start py-2 lg:py-3 w-full">
          <div ref={viewPendingButtonRef} className="w-full">
            <OutlinedButton onClick={onViewPendingChangeOrder}>
              <JumpArrowGlyph />
              View Pending Change Order
            </OutlinedButton>
          </div>
          {/* Contact Sales — reuse Summary's button so the click opens the
              ContactSalesModal exactly like the Summary page. */}
          <ContactSalesButton />
          <CardOutlinedButton
            label="Payment Records"
            onClick={onViewInvoices}
          />
          <OutlinedButton onClick={onViewChangeHistory}>
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
  viewPendingButtonRef,
}: {
  onViewPendingChangeOrder?: () => void;
  /** Optional ref attached to the mobile "View Pending Change Order" link's
   *  wrapper. ChangeOrderPage uses it with IntersectionObserver to hide the
   *  mobile sticky footer while this inline CTA is on screen. */
  viewPendingButtonRef?: React.Ref<HTMLDivElement>;
}) {
  // Before-CO / After-CO comparison-panel data is built by the shared
  // helper so the Change History snapshot (which mirrors the same Existing
  // Payment state) stays in lockstep.
  const { before: beforePanel, after: afterPanel } = useChangeOrderInvoicePanels();
  return (
    <div
      className="flex flex-col gap-8 w-full pt-6 lg:pt-8"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Section title + locked-state subtitle + Pending Change Order card —
          grouped with tighter spacing so the subtitle reads as a lead-in to
          the card, then a larger gap before the comparison panels. */}
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-col gap-3 w-full">
          {/* Mobile (XS-M): reuse the ChangeOrderPaymentRecords "Payment
              Records" component's typography (12px → 16px at sm, title case).
              Desktop (lg+): keep the uppercase "PROGRESS & SCHEDULE" heading
              aligned with the PAYMENT RECORDS · 2 desktop table heading. */}
          <p className="lg:hidden text-[12px] sm:text-[16px] font-semibold text-[#262626] leading-normal inline-flex items-center gap-1.5">
            <span>Progress &amp; Schedule</span>
            <LockGlyph />
          </p>
          <p className="hidden lg:inline-flex text-[14px] xl:text-[16px] font-semibold text-[#262626] whitespace-nowrap leading-normal items-center gap-1.5">
            <span>PROGRESS &amp; SCHEDULE</span>
            <LockGlyph />
          </p>
          <p className="font-normal text-[12px] xl:text-[14px] text-[#737373] leading-[1.5]">
            Payments are temporarily locked while this change order is pending approval. Approve it
            or contact your sales representative to withdraw it.
          </p>
        </div>

        {/* Pending Change Order card — guides user to approve.
            One unified outer padding; the inner children (title, totals,
            mobile CTA) carry no padding of their own. On desktop the card
            splits 1:1 with a thin vertical divider between the halves. */}
        <div className="bg-[#eef2f9] rounded-[6px] w-full py-4 px-4 sm:px-8 lg:py-6 lg:px-6 xl:py-7 xl:px-8 2xl:px-12">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-6">
            {/* Left half — change order name */}
            <div className="flex-1 min-w-0 basis-1/2 flex flex-col justify-center gap-1">
              <p className="text-[11px] sm:text-[12px] xl:text-[13px] font-semibold text-[#737373] tracking-[0.06em] uppercase">
                Pending Change Order #3
              </p>
              <p className="text-[16px] sm:text-[18px] lg:text-[16px] xl:text-[18px] font-medium text-[#262626] leading-tight">
                Remove East-Side Run
              </p>
            </div>

            {/* Center divider — desktop only. `lg:my-2` matches `TotalsRow`'s
                internal `py-2` so this divider's visible height equals the
                cell height (and therefore matches the NET CHANGE / NEW
                CONTRACT TOTAL inter-cell divider). */}
            <div className="hidden lg:block w-px bg-[#d6dceb] lg:my-2" aria-hidden="true" />

            {/* Right half — Net Change + Contract Total cells (via the
                shared `TotalsRow`) and, on desktop only, an inline "View
                Change Order" link as a 3rd column (matches the previous
                Net : Contract : Link = 1 : 1 : 1 width split inside the
                right half). On mobile the link is replaced by an outlined
                "View Pending Change Order" CTA below the totals. */}
            <div className="flex-1 min-w-0 basis-1/2 flex flex-col lg:flex-row lg:items-stretch">
              <div className="flex items-center w-full lg:w-auto lg:flex-[2]">
                <TotalsRow
                  cells={[
                    { label: 'NET CHANGE', value: '-$999.00', valueColor: '#d41a32' },
                    { label: 'REVISED TOTAL', value: '$12,000.00' },
                  ]}
                  valueClassName="text-[18px] sm:text-[20px] lg:text-[18px] xl:text-[20px] leading-normal whitespace-nowrap font-normal pt-1 mt-auto"
                />
              </div>
              {/* Desktop-only "View Change Order" column — matches the
                  TotalsRow cell divider (1px rgba(0,0,0,0.12) on the left).
                  `lg:my-2` shortens the column (and its left border) by
                  `TotalsRow`'s `py-2` so the divider height matches the
                  NET CHANGE / NEW CONTRACT TOTAL inter-cell divider. */}
              <div
                className="hidden lg:flex lg:flex-1 items-center justify-center px-4 lg:my-2"
                style={{ borderLeft: '1px solid rgba(0,0,0,0.12)' }}
              >
                <button
                  type="button"
                  onClick={onViewPendingChangeOrder}
                  className="bg-transparent border-0 p-0 cursor-pointer text-[14px] xl:text-[16px] font-normal text-[#737373] hover:text-[#1657c4] whitespace-nowrap hover:underline transition-colors"
                >
                  View Change Order
                </button>
              </div>
              {/* Mobile-only: borderless "View Pending Change Order" link
                  (matches the BorderlessLinkButton used in ChangeHistoryView's
                  DetailCtaRow so the two views share the same CTA style).
                  No leading icon — the label alone is the affordance here. */}
              <div ref={viewPendingButtonRef} className="lg:hidden w-full">
                <BorderlessLinkButton
                  icon={null}
                  label="View Pending Change Order"
                  onClick={onViewPendingChangeOrder}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 w-full">
        <ComparisonPanel
          className="order-2 lg:order-none"
          accent="neutral"
          heading="Before Change Order"
          {...beforePanel}
        />
        <ComparisonPanel
          className="order-1 lg:order-none"
          accent="blue"
          heading="After Change Order Approval"
          {...afterPanel}
        />
      </div>

      {/* Payment Records — reuse InvoicesPaymentsSection's tables verbatim,
          wrapped in its InvoicesDataContext so they pick up the real
          per-status accent bar, columns, mobile cards, and responsive
          rules. Placeholder contractTotal until the real wiring lands. */}
      <ChangeOrderPaymentRecords />

      {/* Back to Top — mobile only; matches the affordance at the bottom of
          the regular Project Hub / Invoices views. */}
      <div className="lg:hidden flex justify-center w-full pt-2">
        <BackToTopButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      </div>
    </div>
  );
}

function ChangeOrderPaymentRecords() {
  // Payment Records are sourced from the shared hook so the Change
  // History snapshot lists the same chronology + methods (Cash / Cash /
  // Check; $2,000 / $2,000 / $8,000 or $8,999).
  const data = useChangeOrderPaymentRecords();
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
  className,
  outstandingMode = 'normal',
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
  className?: string;
  /** Passed through to PaymentProgressBlock. 'refund' flips "Outstanding"
   *  → "Need Refund" (red amount); 'paidInFull' replaces the cell with a
   *  green "Paid in Full" indicator. */
  outstandingMode?: 'normal' | 'refund' | 'paidInFull';
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
    <div className={`flex flex-col gap-3 w-full lg:flex-1${className ? ` ${className}` : ''}`}>
      <p className="font-normal text-[12px] xl:text-[14px] text-[#737373] leading-[14px]">{heading}</p>
      {/* Single merged tinted card — Progress block and Invoices block share
          one outer background + border-radius + padding so they read as one
          card. `flex-1` lets it grow to match the sibling panel's height. */}
      <div
        className="flex flex-col gap-6 lg:gap-8 w-full flex-1 py-6 px-4 sm:px-8 lg:px-6 xl:px-8 2xl:px-12"
        style={{ background: bg, borderRadius: 8 }}
      >
        {/* Progress block — shared with ChangeHistoryView's Payment Snapshot.
            `padding="0"` drops its own card chrome so it sits flush inside
            the merged outer card. */}
        <PaymentProgressBlock
          progressLabel={progressLabel}
          received={received}
          processing={processing}
          invoiceTotal={invoiceTotal}
          outstanding={outstanding}
          receivedPct={receivedPct}
          processingPct={processingPct}
          bg="transparent"
          padding="0"
          labelClassName="text-[12px] font-semibold text-[#262626] uppercase tracking-[0.06em]"
          outstandingMode={outstandingMode}
        />

        {/* Invoices block — no own bg/padding/radius; inherits the merged
            outer card's chrome. `flex-1` lets it absorb the extra height in
            panels with fewer invoices so the merged card matches the
            sibling's height. */}
        <div className="flex flex-col gap-2 w-full flex-1">
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
  const { config, pageIntent, setPageIntent, restartTick } = useDevConsole();
  // Shared Before / After CO panel data drives the Pending Revised Payment
  // Schedule dialog so it matches the Invoices & Payments tab and the
  // Change History snapshot — all three react to the Existing Payment
  // toggle in lockstep.
  const { after: afterPanel } = useChangeOrderInvoicePanels();
  // Post-approval the Change Order Project Hub reuses the Proposal Project
  // Hub's InvoicesPaymentsSection verbatim. We feed it the revised schedule
  // (amounts straight from the after-CO panel, parsed dueDate from each
  // invoice's status line) and the revised payment chronology (the same
  // records that drive Payment Records on the existing Approval Page), so
  // the contract total / received / processing / per-invoice statuses match
  // the figures already shown in the Change Order Project Hub's Project Home
  // progress block.
  const coPaymentRecordsData = useChangeOrderPaymentRecords();
  const revisedInvoicesOverrides = useMemo(() => {
    const parseDollars = (s: string) => Number(s.replace(/[^\d.-]/g, '')) || 0;
    const stripDatePrefix = (s: string) =>
      s.replace(/^(Due on |Submitted on |Paid on )/, '');
    // Map afterPanel rows (panel-format `InvoiceRowData`) into the cascade's
    // `InvoiceSpec` format. Overpaid / voided rows carry explicit overrides
    // so the cascade doesn't try to redo the math:
    //   - voided:               amount stays as the original total (for the
    //                           strikethrough render) but the spec is
    //                           flagged so it's excluded from the contract
    //                           total used by the progress bar.
    //   - overPaid + voided:    receivedOverride = the paid amount (the
    //                           money already collected, now refundable)
    //                           and statusOverride = 'overPaid' so the row
    //                           renders the orange palette.
    //   - overPaid (not void):  receivedOverride = the paid amount (which
    //                           exceeds the invoice total).
    //   - paid / processing / partial / pending: cascade handles them.
    // paidOnOverride pins the panel's hand-authored "Paid on …" / "Submitted
    // on …" date so the row matches the comparison panel verbatim instead
    // of inheriting the last-payment's actual date.
    const invoiceSpecs: InvoiceSpec[] = afterPanel.invoices.map((inv) => {
      const total = parseDollars(inv.total);
      const paid = parseDollars(inv.paid);
      const dateText = stripDatePrefix(inv.statusLine);
      const isSettledFlavor = inv.status === 'paid' || inv.status === 'processing' || inv.status === 'overPaid';
      const spec: InvoiceSpec = {
        number: inv.num,
        label: inv.label,
        amount: total,
        dueDate: dateText,
      };
      if (inv.voided) spec.voided = true;
      if (inv.status === 'overPaid') {
        spec.receivedOverride = paid;
        spec.statusOverride = 'overPaid';
      }
      if (isSettledFlavor) spec.paidOnOverride = dateText;
      return spec;
    });
    // PAYMENT_RECORDS is newest-first; the cascade expects oldest-first.
    const staticChronology: ExtraPaymentSpec[] = [...coPaymentRecordsData.PAYMENT_RECORDS]
      .reverse()
      .map((rec) => ({
        paymentId: rec.paymentId,
        paidOn: rec.paidOn,
        paidOnFull: rec.paidOnFull,
        amountApplied: rec.amountApplied,
        platformFee: rec.platformFee,
        paidBy: rec.paidBy,
        method: rec.method,
        processedWith: rec.processedWith,
        status: rec.status === 'processing' ? ('processing' as const) : undefined,
      }));
    return { invoiceSpecs, staticChronology };
  }, [afterPanel, coPaymentRecordsData]);
  // Voided invoices' amounts have been wiped by the contract reduction, so
  // they don't contribute to the contract total used by the progress bar /
  // outstanding math (matches `afterPanel.invoiceTotal`).
  const revisedContractTotal = useMemo(
    () => revisedInvoicesOverrides.invoiceSpecs.reduce(
      (sum, s) => sum + (s.voided ? 0 : s.amount),
      0,
    ),
    [revisedInvoicesOverrides],
  );
  // Make-A-Payment state — mirrors the Proposal Project Hub. `extraPayments`
  // gets cascaded after the revised static chronology so user-confirmed
  // payments flow through to Payment Progress / Next Payment / per-invoice
  // status just like in the Proposal flow. `paymentTarget` non-null = dialog
  // open, snapshotting the next-due invoice's remaining balance + label.
  const [extraPayments, setExtraPayments] = useState<ExtraPaymentSpec[]>([]);
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(null);
  // Next-due invoice derived from the revised data — the same row
  // InvoicesPaymentsSection's "Next Payment" card surfaces. Drives the
  // Make-A-Payment dialog header so the user always sees the invoice they
  // were about to pay.
  const revisedNextDueInvoice = useMemo(() => {
    const data = buildInvoicesData(
      revisedContractTotal,
      extraPayments,
      config.invoiceMode,
      revisedInvoicesOverrides,
    );
    return data.INVOICES.find((inv) => inv.received < inv.amount) ?? null;
  }, [revisedContractTotal, extraPayments, config.invoiceMode, revisedInvoicesOverrides]);
  const openMakePayment = useCallback(() => {
    if (!revisedNextDueInvoice) return;
    setPaymentTarget({
      amount: Math.max(0, revisedNextDueInvoice.amount - revisedNextDueInvoice.received),
      description: `${revisedNextDueInvoice.label} · 1722 Willis Ave NW`,
    });
  }, [revisedNextDueInvoice]);
  const handlePaymentConfirmed = useCallback((info: ConfirmedPaymentInfo) => {
    setExtraPayments((prev) => {
      const nextId = String(2200 + prev.length);
      const now = new Date();
      const month = now.toLocaleString('en-US', { month: 'short' });
      const paidOn = `${month} ${now.getDate()}, ${now.getFullYear()}`;
      const time = now.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const paidOnFull = `${paidOn}, ${time.toLowerCase().replace('am', 'a.m.').replace('pm', 'p.m.')}`;
      return [
        ...prev,
        {
          paymentId: nextId,
          paidOn,
          paidOnFull,
          amountApplied: info.amountApplied,
          platformFee: info.platformFee,
          paidBy: 'Junyu Zhang',
          method: info.methodLabel,
          processedWith: 'ArcSite Payment',
          status: info.status,
        },
      ];
    });
  }, []);
  // Revised Payment & Schedule dialog — re-uses the proposal Summary's
  // PaymentScheduleDialog as a starting point. Values mirror the right-
  // column financials (New Contract Total, Estimated Monthly Payment).
  // Lifted to this level so the dialog renders OUTSIDE the sticky right
  // column (whose stacking context would otherwise pin the sticky tab
  // bar above the overlay).
  const [scheduleData, setScheduleData] = useState<PaymentScheduleData | null>(null);
  const openSchedule = () =>
    setScheduleData({
      optionLabel: 'Remove East-Side Run',
      projectName: '1722 Willis Ave NW, Grand Rapids, MI 49504',
      contractTotal: 12000,
      monthly: 469.06,
      loanAmount: 12000,
      termMonths: 12,
      apr: 4,
    });
  const closeSchedule = () => setScheduleData(null);
  // Signature overlay — reuses the Proposal flow's SignatureOverlay verbatim
  // so the Sign & Approve buttons (right column + mobile sticky footer) open
  // the same signature/approve modal as Type=Proposal.
  const [showSignatureOverlay, setShowSignatureOverlay] = useState(false);
  // Post-approval state — mirrors OptionsPageResponsive's approved/approvedAt
  // pair. Flipped behind the still-animating SignatureOverlay (onApproveStart)
  // so its exit reveals the Project Home tab in its Approved Change Order
  // layout, matching the Proposal Project Home post-approval format.
  //
  // Initialized from the shared `pageIntent` so toggling Type from the
  // Proposal Project Hub (pageIntent === 'hub.home') lands on the Change
  // Order Project Hub instead of the Approval Page; the inverse direction
  // is handled by OptionsPageResponsive, which already treats any
  // `hub.*` intent as "starts approved".
  const startsApproved = pageIntent === 'hub.home' || pageIntent === 'hub.contract' || pageIntent === 'hub.invoices' || pageIntent === 'hub.changes';
  const [approved, setApproved] = useState(startsApproved);
  const [approvedAt, setApprovedAt] = useState<Date | null>(
    startsApproved ? new Date() : null,
  );
  // Expired change orders can never be approved. The DevConsole toggle is the
  // only way to enter the expired state, and toggling INTO expired while the
  // page is mid-approval (e.g., the user already signed and the Project Hub
  // is showing) must roll the page back to the pre-approval Approval Page.
  // This effect handles the rollback in one place so all the downstream
  // surfaces — header block, right-column CTAs, Change History row, mobile
  // sticky footer — re-derive `expired` correctly from `!approved && status`.
  useEffect(() => {
    if (config.proposalStatus !== 'expired') return;
    setApproved(false);
    setApprovedAt(null);
    setShowSignatureOverlay(false);
  }, [config.proposalStatus]);
  const [addons, setAddons] = useState<AddonItem[]>(DEFAULT_ADDONS);
  // Initialize from the shared `pageIntent` so that switching from Proposal
  // mode lands on the equivalent CO tab.
  const [tab, setTab] = useState<ProjectHubTab>(() => {
    if (pageIntent === 'hub.contract') return 'contract';
    if (pageIntent === 'hub.invoices') return 'invoices';
    if (pageIntent === 'hub.changes') return 'changes';
    return 'home';
  });

  // Publish the current tab to the shared `pageIntent`. The Home tab maps
  // to 'summary' when pending (Change Order Approval Page ↔ Option Approval
  // Page) and to 'hub.home' once approved (Change Order Project Hub ↔
  // Proposal Project Hub) so Type toggles round-trip on the matching state.
  useEffect(() => {
    const map: Record<ProjectHubTab, 'summary' | 'hub.home' | 'hub.contract' | 'hub.invoices' | 'hub.changes'> = {
      home: approved ? 'hub.home' : 'summary',
      contract: 'hub.contract',
      invoices: 'hub.invoices',
      changes: 'hub.changes',
    };
    setPageIntent(map[tab]);
  }, [tab, approved, setPageIntent]);

  // Reset page scroll when switching between Change Order tabs so each tab
  // opens at the top instead of inheriting the previous tab's scroll offset.
  // `behavior: 'instant'` overrides the global `scroll-behavior: smooth` so
  // the reset is a hard jump, not an animated scroll-up.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [tab]);
  // Sticky footer — reuses ProjectHubStickyFooter from the Proposal Project
  // Hub. On the Home tab, only show it once the inline Make A Payment button
  // has scrolled off (parallel to how the Proposal hub gates its footer); on
  // the Invoices tab, always show it (no inline CTA there).
  //
  // The ref is attached only to the mobile-instance Make A Payment button
  // (`mobileChangeOrderRightColumn` passes it; `desktopChangeOrderRightColumn`
  // omits it). Without that split, the desktop instance — which is
  // `display:none` on XS/S/M — would clobber the ref and report
  // `isIntersecting:false` to IntersectionObserver, pinning the footer
  // permanently visible.
  const paymentBtnRef = useRef<HTMLButtonElement>(null);
  const [paymentBtnVisible, setPaymentBtnVisible] = useState(true);
  useEffect(() => {
    if (!approved) return;
    const el = paymentBtnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaymentBtnVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [approved, tab]);
  // Product detail sheet state — only used by the Current Approved Contract
  // tab. The Home tab's left column is owned by SummaryPageResponsive, which
  // manages its own sheet internally.
  const [productDetail, setProductDetail] = useState<ProductDetailContent | null>(null);

  // Restart Userflow — DevConsole's top button bumps `restartTick`. For
  // Type=Change Order we land back on the Home tab in the pre-approval
  // (Change Order Approval Page) state, mirroring how the Proposal flow
  // resets to its cover/landing page. Compared against a ref so this only
  // fires on an actual tick increment, not on the initial mount.
  const lastCoRestartTickRef = useRef(restartTick);
  useEffect(() => {
    if (lastCoRestartTickRef.current === restartTick) return;
    lastCoRestartTickRef.current = restartTick;
    setTab('home');
    setApproved(false);
    setApprovedAt(null);
    setShowSignatureOverlay(false);
    setExtraPayments([]);
    setPaymentTarget(null);
    setProductDetail(null);
    setScheduleData(null);
    setAddons(DEFAULT_ADDONS);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [restartTick]);
  // Track whether the inline "View Pending Change Order" button (top of the
  // mobile Contract tab) is on screen — if so, the mobile sticky footer
  // hides itself, then slides back in once the button scrolls out of view.
  const viewPendingButtonRef = useRef<HTMLDivElement>(null);
  const [pendingCtaVisible, setPendingCtaVisible] = useState(false);
  useEffect(() => {
    const el = viewPendingButtonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPendingCtaVisible(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tab]);

  const isContractTab = tab === 'contract';
  const isInvoicesTab = tab === 'invoices';
  const isChangesTab = tab === 'changes';
  const selectedAddons = addons.filter((a) => a.selected);
  // Post-approval the Change Order Project Hub mirrors the Proposal Project
  // Hub for the contract tab — same "Contract Document" label, same
  // ContractDocSection content. The Change History tab stays so the user can
  // still review the snapshot of the CO that was just approved.
  const isApprovedContractTab = approved && isContractTab;
  const hubTabs: TabDef[] | undefined = approved
    ? [
        { id: 'home', label: 'Project Home' },
        { id: 'contract', label: 'Contract Document' },
        { id: 'invoices', label: 'Invoices & Payments' },
        { id: 'changes', label: 'Change History' },
      ]
    : undefined;

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

  // Right-column summary — shared between the desktop sticky column and,
  // post-approval on mobile, the top-of-page slot so the approved Change
  // Order Project Hub mirrors the Proposal Project Hub's mobile layout
  // (Project Home Details above all section cards).
  //
  // Two variants: the mobile one carries `makePaymentBtnRef` so the sticky
  // footer can hide while the inline Make A Payment button is on-screen; the
  // desktop one omits the ref (it lives inside a `hidden lg:block` wrapper
  // that's `display:none` on XS/S/M, and IntersectionObserver would report
  // it as never-intersecting and pin the footer permanently visible).
  // Mirrors how ProjectHubPageResponsive only wires `paymentBtnRef` into the
  // mobile ProjectHomeDetails instance.
  // Change Order Status = Expired only matters in the pending state — once
  // the change order is approved the layout swaps to the post-approval
  // Project Hub which has no Sign & Approve to suppress.
  const expired = !approved && config.proposalStatus === 'expired';
  const renderChangeOrderRightColumn = (withPaymentBtnRef: boolean) => (
    <ChangeOrderRightColumn
      onViewInvoices={() => setTab('invoices')}
      onViewContract={() => setTab('contract')}
      onViewChangeHistory={() => setTab('changes')}
      onOpenSchedule={openSchedule}
      onRequestSign={() => setShowSignatureOverlay(true)}
      onMakePayment={openMakePayment}
      makePaymentBtnRef={withPaymentBtnRef ? paymentBtnRef : undefined}
      extraPayments={extraPayments}
      invoicesOverrides={revisedInvoicesOverrides}
      approved={approved}
      approvedAt={approvedAt}
      expired={expired}
    />
  );
  const mobileChangeOrderRightColumn = renderChangeOrderRightColumn(true);
  const desktopChangeOrderRightColumn = renderChangeOrderRightColumn(false);
  const isApprovedHomeTab = approved && tab === 'home';

  return (
    <>
      <SummaryPageResponsive
        option={STUB_OPTION}
        addons={addons}
        setAddons={setAddons}
        singleOptionMode
        signatureRequired={config.signatureRequired}
        onBack={() => {}}
        // Type=Change Order has no cover page — the PageHeader home icon
        // instead navigates back to the Project Home tab (Approval Page or
        // Project Hub variant, depending on `approved` state).
        onShowCover={() => setTab('home')}
        onRequestSign={() => setShowSignatureOverlay(true)}
        stickyHeader={<ProjectHubStickyHeader active={tab} onChange={setTab} tabs={hubTabs} />}
        bodyTransitionKey={tab}
        bodyTransitionDirection={slideDirection}
        rightColumnTopPx={80}
        mobileTopTitleOverride={
          // `-mt-2` trims 8px from above so every override lands 32px below
          // the sticky header bottom (matching the Proposal Project Hub).
          // ActionHeaderSpacer is 40px on XS; the target is pt-8 = 32px.
          isContractTab ? (
            <div className="-mt-2">
              <ContractTabRightColumn
                onViewInvoices={() => setTab('invoices')}
                onViewPendingChangeOrder={() => setTab('home')}
                onViewChangeHistory={() => setTab('changes')}
                viewPendingButtonRef={viewPendingButtonRef}
              />
            </div>
          ) : isApprovedHomeTab ? (
            // Approved Change Order Project Home (mobile): the right column
            // moves to the top of the page so the financial summary + CTAs
            // are the first thing the user sees, matching the Proposal
            // Project Hub's mobile layout. The mobile duplicate at the
            // bottom is suppressed via `hideMobileRightColumn`. `pb-5`
            // matches the Proposal Project Hub's mobile gap between the
            // top right column and the first scope card.
            <div className="-mt-2 pb-5">{mobileChangeOrderRightColumn}</div>
          ) : approved ? (
            <div className="-mt-2">
              <ApprovedChangeOrderTitleBlock approvedAt={approvedAt} />
            </div>
          ) : (
            <div className="-mt-2">
              <ChangeOrderHeaderBlock expired={expired} />
            </div>
          )
        }
        hideMobileRightColumn={isContractTab || isApprovedHomeTab}
        hideMobileStickyFooter={
          isChangesTab ||
          (tab === 'home' && approved) ||
          // Approved Contract Document tab has its own internal sticky
          // footer (rendered inside ContractDocSection), so suppress the
          // SummaryPageResponsive default.
          isApprovedContractTab ||
          // Approved Invoices & Payments tab — suppress the default
          // footer unless we're in Over Paid mode (which uses the
          // ContractDocStickyFooter via `mobileStickyFooterOverride` below).
          // Under Paid keeps the standalone ProjectHubStickyFooter
          // (rendered further down) for its "Make A Payment" CTA;
          // Fully Paid has no footer at all.
          (isInvoicesTab && approved && config.existingPayment !== 'overPaid')
        }
        mobileStickyFooterOverride={
          isApprovedContractTab ? undefined : isInvoicesTab && approved && config.existingPayment === 'overPaid' ? (
            // Approved Invoices & Payments tab on mobile, Over Paid mode —
            // rendered via the dedicated OverpaidStickyFooter so future
            // copy / layout tweaks specific to the overpaid flow stay
            // isolated from the Contract Document tab's footer and the
            // pre-approval pending-CO footer (both of which still use
            // ContractDocStickyFooter from ContractDocSection.tsx). The
            // refund amount is pulled from afterPanel.outstanding so the
            // sticky alert tracks the same dollar figure surfaced in the
            // Progress block + Amount Overpaid card on desktop.
            <OverpaidStickyFooter
              refundAmount={afterPanel.outstanding}
              onHeightChange={() => {}}
            />
          ) : isContractTab || isInvoicesTab ? (
            <ContractDocStickyFooter
              approvedAt={new Date()}
              onHeightChange={() => {}}
              visible={!pendingCtaVisible}
              hideApprovalLine
              topAction={
                <OutlinedButton onClick={() => setTab('home')}>
                  <JumpArrowGlyph />
                  View Pending Change Order
                </OutlinedButton>
              }
              expandedDescription={
                isInvoicesTab ? (
                  <>
                    Payments are temporarily locked while this change order is pending approval.
                    Approve it or contact your sales representative to withdraw it.
                  </>
                ) : (
                  <>
                    This contract is locked while a change order is pending. Approve the change
                    order to continue, or contact your sales representative to withdraw it.
                  </>
                )
              }
            />
          ) : undefined
        }
        rightColumn={
          isContractTab ? (
            <ContractTabRightColumn onViewInvoices={() => setTab('invoices')} onViewPendingChangeOrder={() => setTab('home')} onViewChangeHistory={() => setTab('changes')} />
          ) : (
            // SummaryPageResponsive's `rightColumn` slot renders inside both
            // the mobile (`lg:hidden`) and desktop (`hidden lg:block`)
            // wrappers. On the approved home tab, `hideMobileRightColumn` is
            // true so only the desktop wrapper materializes here (the mobile
            // copy moves to `mobileTopTitleOverride`); on the pending tab,
            // both wrappers render, but the pending right column has no Make
            // A Payment button so `paymentBtnRef` is irrelevant. Either way,
            // we want the no-ref desktop variant in this slot.
            desktopChangeOrderRightColumn
          )
        }
        replaceLeftColumn={isApprovedContractTab ? undefined : isContractTab ? contractLeftColumn : undefined}
        bodyOverride={
          isApprovedContractTab ? (
            // Post-approval the Change Order Project Hub reuses the Proposal
            // Project Hub's Contract Document tab verbatim — same component,
            // same sticky footer, same `approvedAt` plumbing.
            <div className="lg:pb-8">
              <ContractDocSection
                approvedAt={approvedAt ?? new Date()}
                onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            </div>
          ) : isInvoicesTab && approved ? (
            // Post-approval the Change Order Project Hub reuses the Proposal
            // Project Hub's Invoices & Payments tab verbatim, fed by the
            // revised invoice schedule + payment chronology.
            // `pt-4 lg:pt-0` adds 16px on mobile so the gap from the sticky
            // tab bar to the "Invoices" heading matches the approved home
            // tab (32px total: 16 outer + 16 InvoicesPaymentsSection's pt-4).
            <div className="pt-4 lg:pt-0 lg:pb-8">
              <InvoicesPaymentsSection
                onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                contractTotal={revisedContractTotal}
                extraPayments={extraPayments}
                invoiceMode={config.invoiceMode}
                overrides={revisedInvoicesOverrides}
                onMakePayment={openMakePayment}
              />
            </div>
          ) : isInvoicesTab ? (
            // `pt-2 lg:pt-0` adds 8px on mobile so the gap from the sticky
            // tab bar to the "Progress & Schedule" heading matches the
            // approved home tab (32px total: 8 outer + 24
            // ChangeOrderInvoicesView's pt-6).
            <div className="pt-2 lg:pt-0">
              <ChangeOrderInvoicesView
                onViewPendingChangeOrder={() => setTab('home')}
                viewPendingButtonRef={viewPendingButtonRef}
              />
            </div>
          ) : isChangesTab ? (
            // `pt-2 lg:pt-0` adds 8px on mobile so the gap from the sticky
            // tab bar to the search field matches the approved home tab
            // (32px total: 8 outer + 24 ChangeHistoryView's pt-6).
            <div className="pt-2 lg:pt-0">
              <ChangeHistoryView
                products={flattenSelectedUpgrades(STUB_OPTION.products)}
                onViewPendingChangeOrder={() => setTab('home')}
                onViewCurrentApprovedContract={() => setTab('contract')}
                onMakePayment={openMakePayment}
                onRequestSign={() => setShowSignatureOverlay(true)}
                signatureRequired={config.signatureRequired}
                approved={approved}
                approvedAt={approvedAt}
                expired={expired}
                extraPayments={extraPayments}
                revisedContractTotal={revisedContractTotal}
                revisedInvoicesOverrides={revisedInvoicesOverrides}
                invoiceMode={config.invoiceMode}
              />
            </div>
          ) : undefined
        }
      />
      <ProductDetailSheet
        open={productDetail !== null}
        content={productDetail}
        onClose={() => setProductDetail(null)}
      />
      <PaymentScheduleDialog
        data={scheduleData}
        onClose={closeSchedule}
        financingExcluded={config.financingEstimation === 'excluded'}
        scheduledPaymentsCount={config.scheduledPaymentsCount}
        title="Pending Revised Payment Schedule"
        optionLabelPrefix="Change Order #3"
        progressBlock={(() => {
          const parseDollars = (s: string) => Number(s.replace(/[^\d.-]/g, '')) || 0;
          const totalNum = parseDollars(afterPanel.invoiceTotal);
          const receivedPct = totalNum > 0 ? (parseDollars(afterPanel.received) / totalNum) * 100 : 0;
          const processingPct = totalNum > 0 ? (parseDollars(afterPanel.processing) / totalNum) * 100 : 0;
          return (
            <PaymentProgressBlock
              progressLabel={afterPanel.progressLabel}
              received={afterPanel.received}
              processing={afterPanel.processing}
              outstanding={afterPanel.outstanding}
              outstandingMode={afterPanel.outstandingMode}
              invoiceTotal={afterPanel.invoiceTotal}
              receivedPct={receivedPct}
              processingPct={processingPct}
              bg="transparent"
              padding="0"
            />
          );
        })()}
        scheduleList={
          <div className="flex flex-col gap-2 w-full">
            <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal">
              {afterPanel.invoicesHeading}
            </p>
            <div className="flex flex-col gap-2 w-full">
              {afterPanel.invoices.map((inv) => (
                <InvoiceComparisonRow key={inv.num} row={inv} bg="#f5f5f5" />
              ))}
            </div>
          </div>
        }
        mobileScheduleList={<RevisedInvoicesList invoices={afterPanel.invoices} heading={afterPanel.invoicesHeading} />}
      />
      {showSignatureOverlay && (
        <SignatureOverlay
          clientName="Michael Rozier"
          signatureRequired={config.signatureRequired}
          onClose={() => setShowSignatureOverlay(false)}
          onApproveStart={() => {
            // Flip approved state behind the still-playing exit animation so
            // the Project Home tab is already in its Approved layout when the
            // overlay finishes sliding out.
            setApproved(true);
            setApprovedAt(new Date());
          }}
          onApproved={() => setShowSignatureOverlay(false)}
        />
      )}
      {/* Make-A-Payment dialog — wired so the Change Order Project Hub's
          Invoices & Payments tab Make A Payment CTA behaves identically to
          the Proposal Project Hub: opens the same dialog, confirms append
          ExtraPaymentSpec → cascades into the revised schedule. */}
      <MakePaymentDialog
        target={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onConfirm={handlePaymentConfirmed}
        paymentResult={config.paymentResult}
        paymentInfoInput={config.paymentInfoInput}
      />
      {/* Sticky footer — reused verbatim from the Proposal Project Hub. Shows
          on the Home tab once the inline Make A Payment scrolls off and on
          the Invoices & Payments tab unconditionally. Hidden when every
          invoice is settled (no next-due row). */}
      {approved && revisedNextDueInvoice && (tab === 'home' || tab === 'invoices') && (
        <ProjectHubStickyFooter
          visible={(tab === 'home' && !paymentBtnVisible) || tab === 'invoices'}
          nextPaymentAmount={Math.max(0, revisedNextDueInvoice.amount - revisedNextDueInvoice.received)}
          nextPaymentPercent={Number(revisedNextDueInvoice.label.match(/\((\d+)%\)/)?.[1] ?? 0)}
          nextPaymentDueDate={revisedNextDueInvoice.dueDate}
          onMakePayment={openMakePayment}
          onShowNextInvoice={openMakePayment}
        />
      )}
    </>
  );
}

// Revised invoices rendered with the same MobileInvoiceCard used on the
// Invoices & Payments tab. Adapts the shared InvoiceRowData rows into the
// MobileInvoiceCard's InvoiceData shape so the bottom-sheet schedule stays
// in sync with the Existing Payment state.
function RevisedInvoicesList({
  invoices,
  heading,
}: {
  invoices: InvoiceRowData[];
  heading: string;
}) {
  const parseDollars = (s: string) => Number(s.replace(/[^\d.-]/g, '')) || 0;
  const data = useMemo(() => {
    const base = buildInvoicesData(12000);
    // Per-row paid-on date — extracted from the row's statusLine so the
    // bottom-sheet card stamps the correct date for any "Paid on …" row.
    const paidOnByInv = new Map<number, string>();
    for (const inv of invoices) {
      const match = inv.statusLine.match(/^(?:Paid|Submitted) on (.+)$/);
      if (match) paidOnByInv.set(inv.num, match[1]);
    }
    return {
      ...base,
      paidOnDate: (n: number) => paidOnByInv.get(n),
    };
  }, [invoices]);
  const mobileInvoices: InvoiceData[] = invoices.map((inv) => {
    const amount = parseDollars(inv.total);
    const received = inv.paid === '-' ? 0 : parseDollars(inv.paid);
    const status: InvoiceData['status'] =
      inv.status === 'paid' || inv.status === 'overPaid'
        ? 'paid'
        : inv.status === 'processing'
          ? 'processing'
          : inv.status === 'partial'
            ? 'partial'
            : 'unpaid';
    const dueMatch = inv.statusLine.match(/^Due on (.+)$/);
    return {
      number: inv.num,
      label: inv.label,
      amount,
      received,
      status,
      dueDate: dueMatch ? dueMatch[1] : '',
      dueState: status === 'unpaid' || status === 'partial' ? 'normal' : 'none',
    };
  });
  return (
    <InvoicesDataContext.Provider value={data}>
      <div className="flex flex-col gap-2 w-full">
        <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal">
          {heading}
        </p>
        <div className="flex flex-col gap-3 w-full">
          {mobileInvoices.map((inv) => (
            <MobileInvoiceCard key={inv.number} inv={inv} onOpen={() => {}} />
          ))}
        </div>
      </div>
    </InvoicesDataContext.Provider>
  );
}
