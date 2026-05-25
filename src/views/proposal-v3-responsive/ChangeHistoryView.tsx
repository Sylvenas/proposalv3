'use client';

// ── ChangeHistoryView ─────────────────────────────────────────────────────────
// Rendered as the Change Order page's `bodyOverride` when the Change History
// tab is active. Two-column layout (4:8 — list on the left, detail on the
// right). The list is a vertical timeline of change orders + the original
// contract; selecting an item swaps the detail content on the right.

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SectionCard, type FenceProduct } from './SummaryPageResponsive';
import {
  DesktopPaymentRecordRow,
  InvoicesDataContext,
  buildInvoicesData,
  type ExtraPaymentSpec,
  type Invoice,
  type InvoiceMode,
  type InvoiceSpec,
} from './InvoicesPaymentsSection';
import {
  DrawingSection as ProjectHubDrawingSection,
  ProductsSection as ProjectHubProductsSection,
} from './ProjectHubPageResponsive';
import { PdfPages } from './ContractDocSection';
import BorderlessLinkButton from './BorderlessLinkButton';
import BackToTopButton from './BackToTopButton';
import { ContactSalesModal } from './SalesContactCard';
import {
  InvoiceComparisonRow,
  PaymentProgressBlock,
  useChangeOrderInvoicePanels,
  useChangeOrderPaymentRecords,
} from './ChangeOrderInvoiceRow';
import ScrollHintArrows from './ScrollHintArrows';

const BASE = '/images/proposal-v3-responsive';
const IMG_DOWNLOAD = `${BASE}/download.svg`;
const IMG_PHONE = `${BASE}/phone.svg`;

// ── Data model ────────────────────────────────────────────────────────────────
type HistoryStatus = 'pending' | 'expired' | 'approved' | 'outOfDate' | 'original';

type HistoryItem = {
  id: string;
  /** Small uppercase label — "CHANGE ORDER #3" / "ORIGINAL CONTRACT". */
  label: string;
  /** Right-aligned signed amount — "- $999" / "+ $2,000" / "$9,999". */
  amount: string;
  /** Title shown below the label. */
  title: string;
  status: HistoryStatus;
  /** Date used in the status line ("on Mar 23, 2025" / "Valid Until Mar 23, 2025"). */
  date: string;
  /** Headline contract total shown in the detail block. */
  contractTotal: string;
  /** Signed net change shown in the totals row — "+$2,000.00" / "-$999.00".
   *  Omitted for the original contract (no delta against itself). */
  netChange?: string;
  /** "Approved on …" or "Out of date as of …" — shown in detail metadata. */
  approvedOn?: string;
  /** "Valid until …" — only for the pending change order. */
  validUntil?: string;
  /** Address — same for every record at the moment. */
  address: string;
};

const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: 'co-3',
    label: 'CHANGE ORDER #3',
    amount: '- $999',
    title: 'Remove East-Side Run',
    status: 'pending',
    date: 'Mar 23, 2025',
    contractTotal: '$12,000.00',
    netChange: '-$999.00',
    validUntil: 'Apr 30, 2026',
    address: '1722 Willis Ave NW, Grand Rapids, MI 49504',
  },
  {
    id: 'co-2',
    label: 'CHANGE ORDER #2',
    amount: '+ $2,000',
    title: 'Add Pool-Side Gates & Extra Panels',
    status: 'approved',
    date: 'Mar 23, 2025',
    contractTotal: '$12,999.00',
    netChange: '+$2,000.00',
    approvedOn: 'Mar 23, 2025',
    address: '1722 Willis Ave NW, Grand Rapids, MI 49504',
  },
  {
    id: 'co-1',
    label: 'CHANGE ORDER #1',
    amount: '+ $1,000',
    title: 'Upgrade Heavy Duty Post Hardware',
    status: 'outOfDate',
    date: 'Feb 14, 2025',
    contractTotal: '$10,999.00',
    netChange: '+$1,000.00',
    approvedOn: 'Feb 14, 2025',
    address: '1722 Willis Ave NW, Grand Rapids, MI 49504',
  },
  {
    id: 'original',
    label: 'ORIGINAL CONTRACT',
    amount: '$9,999',
    title: 'FENCE REPLACEMENT PROPOSAL',
    status: 'original',
    date: 'Jan 02, 2025',
    contractTotal: '$9,999.00',
    approvedOn: 'Jan 02, 2025',
    address: '1722 Willis Ave NW, Grand Rapids, MI 49504',
  },
];

// Status → colors (used both for the timeline dot and the amount text).
const STATUS_DOT: Record<HistoryStatus, string> = {
  pending: '#3b82f6',
  // Expired carries the same warning-red as the primary CTA so the timeline
  // dot + "EXPIRED" label read as an alert rather than a passive state. The
  // yellow background on the detail-panel banner stays untouched — it's the
  // notification surface, not the warning indicator.
  expired: '#d41a32',
  approved: '#04b50b',
  outOfDate: '#a0a0a0',
  original: '#a0a0a0',
};

// Single-line title that truncates to fit its container's width and
// appends "..." (three ASCII dots — CSS `text-overflow: ellipsis` would
// render the single `…` glyph). Measures the rendered <p> directly with
// scrollWidth/clientWidth, binary-searches for the longest fitting prefix,
// and recomputes on resize.
function TruncatedTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(text);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recalc = () => {
      const max = el.clientWidth;
      if (max === 0) return;

      // Use a detached probe attached to <body> with the same typography
      // (font, weight, letter-spacing, etc.) as the visible <p>. Measuring
      // off-tree avoids feedback loops where mutating el.textContent during
      // measurement perturbs the row's layout.
      const cs = getComputedStyle(el);
      const probe = document.createElement('span');
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.whiteSpace = 'nowrap';
      probe.style.font = cs.font;
      probe.style.letterSpacing = cs.letterSpacing;
      probe.style.fontFamily = cs.fontFamily;
      probe.style.fontSize = cs.fontSize;
      probe.style.fontWeight = cs.fontWeight;
      document.body.appendChild(probe);

      try {
        probe.textContent = text;
        if (probe.scrollWidth <= max) {
          setDisplay(text);
          return;
        }
        let lo = 0;
        let hi = text.length;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          probe.textContent = text.slice(0, mid).trimEnd() + '...';
          if (probe.scrollWidth <= max) lo = mid;
          else hi = mid - 1;
        }
        setDisplay(text.slice(0, lo).trimEnd() + '...');
      } finally {
        document.body.removeChild(probe);
      }
    };

    const t1 = window.setTimeout(recalc, 0);
    const t2 = window.setTimeout(recalc, 500);
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {display}
    </p>
  );
}

// Color the change amount by its sign rather than by status. Rule:
//   • negative (starts with "-") → red
//   • numerically zero            → dark grey (the change had no $ impact)
//   • positive (starts with "+")  → green
//   • no sign prefix (the original contract baseline) → green
function getAmountColor(amount: string): string {
  const trimmed = amount.trim();
  if (trimmed.startsWith('-')) return '#d41a32';
  const numericMatch = trimmed.match(/\$([\d,]+(?:\.\d+)?)/);
  const numericValue = numericMatch
    ? parseFloat(numericMatch[1].replace(/,/g, ''))
    : NaN;
  if (numericValue === 0) return '#262626';
  return '#04b50b';
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function ChangeHistoryView({
  products,
  onViewPendingChangeOrder,
  onViewCurrentApprovedContract,
  onMakePayment,
  onRequestSign,
  signatureRequired = true,
  approved = false,
  approvedAt = null,
  expired = false,
  extraPayments = [],
  revisedContractTotal = 12000,
  revisedInvoicesOverrides,
  invoiceMode = 'happyPath',
}: {
  products: FenceProduct[];
  /** Invoked when the user taps "View Pending Change Order" from an approved
   *  change order's detail panel. The host (ChangeOrderPage) routes this to
   *  the Project Home tab, where the pending change order is the headline. */
  onViewPendingChangeOrder?: () => void;
  /** Invoked when the user taps "View Current Approved Contract" from an
   *  out-of-date / original-contract detail panel. The host routes this to
   *  the Current Approved Contract tab. */
  onViewCurrentApprovedContract?: () => void;
  /** Invoked when the user taps "Make A Payment" from the current approved
   *  change order's detail panel (post-approval only). The host opens the
   *  same MakePaymentDialog used by the Invoices & Payments tab. */
  onMakePayment?: () => void;
  /** Invoked when the user taps "Sign & Approve" from the pending change
   *  order's detail panel. The host opens the same SignatureOverlay used by
   *  the Change Order Approval Page's primary CTA. */
  onRequestSign?: () => void;
  /** DevConsole → Signature toggle. Forwarded to the pending CO's primary
   *  CTA so its label tracks the same Sign & Approve / Approve mode the
   *  Approval Page uses. */
  signatureRequired?: boolean;
  /** When true, the latest pending CO has just been approved — flip its
   *  status from 'pending' to 'approved' (with an `approvedOn` date) and
   *  demote the previously-approved CO to 'outOfDate'. */
  approved?: boolean;
  approvedAt?: Date | null;
  /** When true (Change Order Status = Expired, pre-approval), flip the
   *  pending CO timeline row from 'pending' → 'expired': yellow dot,
   *  "EXPIRED on …" status line, yellow detail-panel banner with the
   *  ExpiredNotice copy, and the EXPIRED ON totals cell. Mirrors the
   *  Change Order Approval Page's expired treatment. */
  expired?: boolean;
  /** User-confirmed Make-A-Payment entries cascaded into the latest
   *  approved CO's Payment Snapshot so progress + invoice statuses +
   *  Payment Records track real-time payments. */
  extraPayments?: ExtraPaymentSpec[];
  /** Revised contract total post-approval — drives the live snapshot's
   *  totals when payments are applied. */
  revisedContractTotal?: number;
  /** Invoice schedule shape for the live snapshot — same overrides
   *  Invoices & Payments uses so the cascade matches. */
  revisedInvoicesOverrides?: {
    invoiceSpecs?: InvoiceSpec[];
    staticChronology?: ExtraPaymentSpec[];
  };
  invoiceMode?: InvoiceMode;
}) {
  // Promote / demote statuses once the pending CO has been approved so the
  // Change History timeline reflects the new contract chain: the newest CO
  // is now the active one, and the prior active CO drops to "out of date".
  const items = useMemo<HistoryItem[]>(() => {
    if (!approved) {
      if (!expired) return HISTORY_ITEMS;
      // Pre-approval expired state — flip the pending CO to 'expired'.
      // The previously-approved row stays approved (it's still the active
      // contract; the locked-while-pending advisory continues to apply).
      return HISTORY_ITEMS.map((it) =>
        it.status === 'pending' ? { ...it, status: 'expired' } : it,
      );
    }
    const d = approvedAt ?? new Date();
    const approvedOnLabel = `${d.toLocaleString('en-US', { month: 'short' })} ${d
      .getDate()
      .toString()
      .padStart(2, '0')}, ${d.getFullYear()}`;
    return HISTORY_ITEMS.map((it) => {
      if (it.status === 'pending') {
        const { validUntil: _validUntil, ...rest } = it;
        return {
          ...rest,
          status: 'approved',
          approvedOn: approvedOnLabel,
          // Timeline status line ("APPROVED on …") reads from `date`, so
          // keep the two in lockstep when the status flips.
          date: approvedOnLabel,
        };
      }
      if (it.status === 'approved') return { ...it, status: 'outOfDate' };
      return it;
    });
  }, [approved, approvedAt, expired]);
  // Default selection — the latest node on the timeline (newest-first ordering).
  const [selectedId, setSelectedId] = useState<string>(items[0].id);
  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? items[0],
    [items, selectedId],
  );

  // Live payment status for the current approved CO — drives both the
  // PaymentSnapshotSection live overlay and the DetailCtaRow's swap from
  // "Make A Payment" to the "Payment submitted in full" / "Contract Paid in
  // Full" completion line.
  const livePaymentStatus = useMemo(() => {
    const data = buildInvoicesData(
      revisedContractTotal,
      extraPayments,
      invoiceMode,
      revisedInvoicesOverrides,
    );
    const nextDue = data.INVOICES.find((inv) => inv.received < inv.amount);
    const hasProcessing = data.PAYMENT_RECORDS.some((rec) => rec.status === 'processing');
    return {
      isFullyPaid: !nextDue,
      hasProcessing,
      fullyPaidOn: data.PAYMENT_RECORDS[0]?.paidOn,
    };
  }, [revisedContractTotal, extraPayments, invoiceMode, revisedInvoicesOverrides]);

  // Mobile (< lg) shows a paginated layout: the timeline list and the detail
  // panel are separate "pages". Tapping a timeline card sets the selection
  // AND flips mobileView to 'detail'. The detail page exposes an "All" back
  // button at the top that returns to the list. Desktop ignores this state
  // and always shows both columns side-by-side.
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Mobile timeline list scroll viewport — height-capped to the remaining
  // viewport so the page itself never scrolls on the list page. If the
  // timeline overflows that area, the scrollbar is hidden and ScrollHintArrows
  // hint that more content sits above/below.
  const listScrollRef = useRef<HTMLDivElement>(null);

  // Switching records replaces the detail panel content. If the user has
  // already scrolled past the top of the detail panel, reset their view to
  // the panel's top (sitting just below the sticky tab bar). If they're
  // still above that point, don't scroll — they'd jump downward, which is
  // disorienting.
  const detailRef = useRef<HTMLDivElement>(null);
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window === 'undefined') return;
    // On mobile (< lg) treat the selection as a page navigation: flip into
    // the detail view and reset scroll to the top so the user lands on the
    // record's header rather than wherever they were on the list.
    const isMobile = window.matchMedia('(max-width: 1023.98px)').matches;
    if (isMobile) {
      setMobileView('detail');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const el = detailRef.current;
    if (!el) return;
    const stickyTabBar = document.querySelector(
      '.sticky.top-0',
    ) as HTMLElement | null;
    const stickyHeight = stickyTabBar?.offsetHeight ?? 50;
    const detailTopY =
      el.getBoundingClientRect().top + window.scrollY - stickyHeight;
    if (window.scrollY > detailTopY) {
      window.scrollTo({ top: Math.max(detailTopY, 0), behavior: 'instant' as ScrollBehavior });
    }
  };

  const handleMobileBack = () => {
    setMobileView('list');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  return (
    <div
      // Mobile (< lg): outer is `relative` + `overflow-hidden` so the
      // off-screen panel is clipped on BOTH axes. Hiding only `overflow-x`
      // leaves `overflow-y` computed as `auto` (CSS spec rule), which then
      // exposes the absolute-positioned inactive panel's tall scrollHeight
      // as a vertical scroll on the list page even though every node fits.
      // Desktop (>= lg): reverts to overflow visible so the list column's
      // sticky positioning continues to work.
      className="relative flex flex-col lg:flex-row gap-3 w-full overflow-hidden lg:overflow-visible"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* ── Left: history list ─────────────────────────────────────────── */}
      {/* Mobile slide animation: the inactive panel is taken out of normal
          flow (`absolute inset-x-0 top-0`) so the wrapper height matches the
          active panel only — no empty scroll space. The active panel sits at
          `translate-x-0`; the inactive panel sits one viewport-width off the
          opposite side (`-translate-x-full` left, `translate-x-full` right).
          The `transition-transform duration-300 ease-out` interpolates that
          transform when `mobileView` flips. Desktop: `lg:` variants restore
          static position, zero transform, and auto inset. */}
      <div
        className={`w-full lg:flex-[1_1_0] min-w-0 lg:sticky lg:top-12 lg:self-start pt-6 lg:pr-4 transition-transform duration-300 ease-out lg:transition-none lg:translate-x-0 lg:relative lg:inset-auto ${
          mobileView === 'detail'
            ? 'absolute inset-x-0 top-0 -translate-x-full'
            : 'translate-x-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        {/* Mobile: the timeline scrolls inside a height-capped viewport so
            the page itself never scrolls on the list page. The native
            scrollbar is hidden and ScrollHintArrows fade in at the top/bottom
            when more rows sit off-screen. On desktop the constraints unwind
            (overflow-visible, no max-height) and the list flows naturally
            inside its sticky column — the arrows are hidden by `lg:hidden`. */}
        <style>{`
          .change-history-list-scroll { scrollbar-width: none; -ms-overflow-style: none; }
          .change-history-list-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        `}</style>
        <div className="relative">
          <div
            ref={listScrollRef}
            className="change-history-list-scroll overflow-y-auto lg:overflow-visible max-h-[calc(100dvh-140px)] lg:max-h-none"
          >
            <HistoryList
              items={items}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
          <div className="lg:hidden">
            <ScrollHintArrows targetRef={listScrollRef} topInset={4} bottomInset={4} />
          </div>
        </div>
      </div>

      {/* ── Right: detail (tinted background) ─────────────────────────── */}
      {/* Same paginated-slide treatment as the list above; this panel enters
          from the right (`translate-x-full` when inactive). `lg:-mb-8` reaches
          into the page container's lg paddingBottom (32px) so the tinted bg
          meets the page bottom with no gap on desktop. */}
      <div
        ref={detailRef}
        className={`w-full lg:flex-[2_1_0] min-w-0 flex flex-col gap-4 px-1.5 lg:px-8 pt-6 pb-6 lg:-mb-8 lg:bg-[#f5f5f5] transition-transform duration-300 ease-out lg:transition-none lg:translate-x-0 lg:relative lg:inset-auto ${
          mobileView === 'list'
            ? 'absolute inset-x-0 top-0 translate-x-full'
            : 'translate-x-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        {/* Mobile back button — returns to the timeline list. Hidden on
            desktop where both columns are always visible. */}
        <button
          type="button"
          onClick={handleMobileBack}
          className="lg:hidden flex items-center gap-1 self-start text-[14px] text-[#262626] cursor-pointer bg-transparent border-0 p-0"
          style={{ fontFamily: 'Segoe UI, sans-serif' }}
        >
          <BackArrowGlyph />
          <span>All Change History</span>
        </button>
        <DetailHeader item={selected} />
        <DetailNotice status={selected.status} approved={approved} />
        <DetailTotalsRow item={selected} />
        <DetailCtaRow
          status={selected.status}
          onViewPendingChangeOrder={onViewPendingChangeOrder}
          onViewCurrentApprovedContract={onViewCurrentApprovedContract}
          onMakePayment={onMakePayment}
          onRequestSign={onRequestSign}
          signatureRequired={signatureRequired}
          // Post-approval the just-approved CO is the current contract (no
          // pending CO sits above it). Identify it as the first 'approved'
          // row in the timeline so its CTA reads "Make A Payment".
          isCurrentApprovedCo={
            approved &&
            selected.status === 'approved' &&
            items.find((i) => i.status === 'approved')?.id === selected.id
          }
          isFullyPaid={livePaymentStatus.isFullyPaid}
          hasProcessing={livePaymentStatus.hasProcessing}
          fullyPaidOn={livePaymentStatus.fullyPaidOn}
        />
        <PaymentSnapshotSection
          item={selected}
          isLatestApproved={
            approved &&
            selected.status === 'approved' &&
            items.find((i) => i.status === 'approved')?.id === selected.id
          }
          extraPayments={extraPayments}
          revisedContractTotal={revisedContractTotal}
          revisedInvoicesOverrides={revisedInvoicesOverrides}
          invoiceMode={invoiceMode}
        />
        <ProjectHubDrawingSection />
        <ProjectHubProductsSection
          products={products}
          selectedAddons={[]}
          onOpenProduct={() => {}}
          onOpenAddon={() => {}}
          noImageThumb
        />
        <SectionCard label="Signed Contract">
          <PdfPages />
        </SectionCard>
        {/* Back to Top — matches the regular Project Hub / Summary layout
            where the affordance sits at the bottom of the Scope Details
            column. */}
        <div className="flex justify-center w-full pt-2">
          <BackToTopButton
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            transparent
          />
        </div>
      </div>
    </div>
  );
}

// ── List ──────────────────────────────────────────────────────────────────────
function HistoryList({
  items,
  selectedId,
  onSelect,
}: {
  items: HistoryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white flex flex-col gap-4 w-full">
      {/* Search input */}
      <div
        className="flex items-center gap-2 w-full"
        style={{
          height: 32,
          paddingLeft: 12,
          paddingRight: 12,
          border: '1px solid #d4d4d4',
          borderRadius: 4,
        }}
      >
        <SearchGlyph />
        <input
          type="text"
          placeholder="Search Change History"
          className="flex-1 min-w-0 bg-transparent outline-none border-0 text-[14px] text-[#262626] placeholder:text-[#a0a0a0]"
          style={{ fontFamily: 'Segoe UI, sans-serif' }}
        />
      </div>

      {/* Timeline list — each row paints its own connector segments so the
          rail naturally starts at the first dot and ends at the last dot
          (no overhang above the first or below the last node). The 12px
          gap between rows is bridged by each row's bottom connector
          (which extends 12px past row.bottom — see HistoryRow). */}
      <div className="relative w-full pl-6">
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <HistoryRow
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
              isFirst={i === 0}
              isLast={i === items.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryRow({
  item,
  selected,
  onSelect,
  isFirst,
  isLast,
}: {
  item: HistoryItem;
  selected: boolean;
  onSelect: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const dotColor = STATUS_DOT[item.status];
  const amountColor = getAmountColor(item.amount);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative flex flex-col items-start gap-1.5 w-full text-left cursor-pointer border-0 bg-transparent"
      style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 }}
    >
      {/* Top connector — row's top edge down to this dot's center. Omitted
          for the very first row so the rail doesn't overhang above the
          first dot. The dot's horizontal center sits at x=-16 (dot left
          -22 + width 12 / 2); `translateX(-50%)` puts the 1px line's
          center at the same column so the rail threads cleanly through
          the dot. */}
      {!isFirst && (
        <span
          aria-hidden
          className="absolute"
          style={{
            left: -16,
            top: 0,
            height: 24,
            width: 1,
            background: '#d4d4d4',
            transform: 'translateX(-50%)',
          }}
        />
      )}
      {/* Bottom connector — this dot's center down to the row's bottom edge,
          extended an extra 12px to bridge the flex `gap-3` between rows so
          the rail reads as continuous. Omitted on the last row so the rail
          terminates at the last dot. */}
      {!isLast && (
        <span
          aria-hidden
          className="absolute"
          style={{
            left: -16,
            top: 24,
            bottom: -12,
            width: 1,
            background: '#d4d4d4',
            transform: 'translateX(-50%)',
          }}
        />
      )}
      {/* Selected background highlight — sits inside the row only so the
          timeline dot to the left stays visually separate from the card.
          Desktop-only: on mobile the list is a paginated view (tapping a
          card navigates away), so a persistent "selected" state would be
          misleading — every card reads as idle until tapped. */}
      {selected && (
        <span
          aria-hidden
          className="absolute hidden lg:block"
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: '#f1f1f1',
            borderRadius: 4,
          }}
        />
      )}

      {/* Dot — sits in the left rail, vertically centered with the
          "CHANGE ORDER #N" label (padding-top 16 + half label line-height 8
          = label center 24 → dot top = 24 − dot half-height 6 = 18). */}
      <span
        aria-hidden
        className="absolute"
        style={{
          left: -22,
          top: 18,
          width: 12,
          height: 12,
          borderRadius: 999,
          background: dotColor,
          border: '2px solid #fff',
          boxShadow: '0 0 0 2px #fff',
        }}
      />

      {/* Label + amount */}
      <div className="relative flex items-baseline justify-between w-full">
        <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-[0.04em] leading-[16px]">
          {item.label}
        </span>
        <span
          className="text-[12px] font-semibold leading-[16px] whitespace-nowrap"
          style={{ color: amountColor }}
        >
          {item.amount}
        </span>
      </div>

      {/* Title — single line that measures its container width and
          truncates to fit with a three-dot "..." suffix. */}
      <TruncatedTitle
        text={item.title}
        className="relative text-[14px] sm:text-[16px] text-[#262626] leading-[21px] w-full overflow-hidden whitespace-nowrap"
      />

      {/* Status line */}
      <div className="relative text-[12px] leading-[16px] w-full">
        <StatusLine item={item} />
      </div>
    </button>
  );
}

function StatusLine({ item }: { item: HistoryItem }) {
  switch (item.status) {
    case 'pending':
      return (
        <>
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>PENDING</span>
          <span className="text-[#737373]"> Valid Until {item.date}</span>
        </>
      );
    case 'expired':
      // "EXPIRED on {validUntil}" — the date shown is the actual expiration
      // (item.validUntil), not item.date. `item.date` is the CO's creation
      // timestamp surfaced in the pending row's "Valid Until" status line by
      // historical convention, but once the row flips to expired the meaningful
      // anchor is when the CO *expired*, which is item.validUntil. Keeping the
      // two surfaces (timeline status line + detail-panel "EXPIRED ON" cell)
      // pointing at the same field avoids the visible date mismatch.
      //
      // The EXPIRED label uses the warning-red (#d41a32) shared with the
      // primary CTA so the row reads as an alert rather than the softer
      // pending blue / approved green / out-of-date amber. The detail-panel
      // banner stays yellow (notification surface).
      return (
        <>
          <span style={{ color: '#d41a32', fontWeight: 600 }}>EXPIRED</span>
          <span className="text-[#737373]"> on {item.validUntil ?? item.date}</span>
        </>
      );
    case 'approved':
      return (
        <>
          <span style={{ color: '#04b50b', fontWeight: 600 }}>APPROVED</span>
          <span className="text-[#737373]"> on {item.date}</span>
        </>
      );
    case 'outOfDate':
    case 'original':
      return (
        <span style={{ color: '#d97706', fontWeight: 600 }}>OUT OF DATE</span>
      );
  }
}

// ── Detail blocks ─────────────────────────────────────────────────────────────
function DetailHeader({ item }: { item: HistoryItem }) {
  return (
    <div className="flex flex-col items-start w-full leading-normal text-[#262626]">
      <p className="text-[14px] sm:text-[16px] xl:text-[18px] font-semibold text-[#737373] uppercase w-full">
        {item.label}
      </p>
      <p className="text-[20px] sm:text-[24px] xl:text-[32px] font-semibold w-full leading-[1.2]">
        {item.title}
      </p>
    </div>
  );
}

function DetailNotice({
  status,
  approved,
}: {
  status: HistoryStatus;
  /** Whether the latest Change Order is already approved. When false, a
   *  pending CO sits above the currently-approved one — that approved row
   *  still represents the active contract but is "locked" until the
   *  pending CO is either approved or withdrawn. */
  approved: boolean;
}) {
  if (status === 'pending') {
    return (
      <div
        className="rounded-[6px] px-4 py-3 w-full"
        style={{ background: '#d1e7ff' }}
      >
        <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
          This change order is pending approval. Numbers shown reflect the
          proposed scope; the active contract still applies until you sign and
          approve.
        </p>
      </div>
    );
  }
  if (status === 'expired') {
    // Yellow banner that mirrors the Change Order Approval Page's
    // ExpiredNotice copy — same `#facc15` background as the right-column
    // pill, same body text so the two surfaces stay in lockstep.
    return (
      <div
        className="rounded-[6px] px-4 py-3 w-full"
        style={{ background: '#facc15' }}
      >
        <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
          This change order has expired. Some information may be out of date.
          Please contact your sales representative for an updated change order
          or to withdraw this one.
        </p>
      </div>
    );
  }
  if (status === 'approved') {
    // The "locked while a change order is pending" advisory applies only
    // when a pending CO actually sits above this approved one (i.e.
    // `approved === false` — the pending row hasn't been signed yet, and
    // this approved row is the still-active-but-locked current contract).
    // Once the pending CO is approved, it takes this row's place; the
    // newly-approved row carries no pending CO above it, so no notice
    // applies and we render nothing.
    if (approved) return null;
    return (
      <div
        className="rounded-[6px] px-4 py-3 w-full"
        style={{ background: '#d1e7ff' }}
      >
        <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
          This contract is locked while a change order is pending. Approve the
          change order to continue, or contact your sales representative to
          withdraw it.
        </p>
      </div>
    );
  }
  // outOfDate / original — historical record warning (Figma yellow).
  return (
    <div
      className="rounded-[6px] px-4 py-3 w-full"
      style={{ background: '#fbcc1f' }}
    >
      <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
        You're viewing a historical contract for reference only. The
        information below may be out of date. Please refer to the latest
        approved contract for the current project scope.
      </p>
    </div>
  );
}

export type TotalsRowCell = { label: string; value: string; valueColor?: string };

/** Reusable label/value cell row — extracted so both ChangeHistoryView's
 *  DetailTotalsRow and ChangeOrderPage's Pending Change Order card render
 *  the same typography, dividers, and value baseline. */
export function TotalsRow({
  cells,
  valueClassName = 'text-[18px] sm:text-[20px] xl:text-[24px] leading-normal whitespace-nowrap font-normal pt-1 mt-auto',
}: {
  cells: TotalsRowCell[];
  /** Override the value-row typography. ChangeOrderInvoicesView's Pending
   *  Change Order card passes a one-notch-smaller scale on desktop so the
   *  card sits more compactly next to the comparison panels. */
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-row items-stretch w-full py-2">
      {cells.map((c, i) => (
        <div
          key={i}
          className="flex flex-col flex-1 min-w-0 px-4 first:pl-0"
          style={
            i > 0
              ? { borderLeft: '1px solid rgba(0,0,0,0.12)' }
              : undefined
          }
        >
          {/* Label is allowed to wrap to multiple lines — narrow mobile
              columns can't fit "NEW CONTRACT TOTAL" / "VALID UNTIL" on one
              line, and nowrap caused neighboring labels to visually overlap. */}
          <p className="text-[11px] xl:text-[12px] font-semibold text-[#737373] uppercase tracking-[0.06em] leading-[16px]">
            {c.label}
          </p>
          {/* `mt-auto` pushes the value to the bottom of the column so all
              three columns share the same value baseline even when one label
              wraps to multiple lines (e.g., "NEW CONTRACT TOTAL" on mobile). */}
          <p
            className={valueClassName}
            style={{ color: c.valueColor ?? '#262626' }}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function DetailTotalsRow({ item }: { item: HistoryItem }) {
  // Build up to 3 cells based on which fields the record carries. Each cell
  // can override its value color (used for the green/red NET CHANGE row).
  const cells: TotalsRowCell[] = [];

  if (item.netChange) {
    cells.push({
      label: 'NET CHANGE',
      value: item.netChange,
      valueColor: getAmountColor(item.netChange),
    });
  }
  cells.push({
    label:
      item.status === 'pending' || item.status === 'expired'
        ? 'NEW CONTRACT TOTAL'
        : 'CONTRACT TOTAL',
    value: item.contractTotal,
  });
  if (item.validUntil) {
    cells.push({
      label: item.status === 'expired' ? 'EXPIRED ON' : 'VALID UNTIL',
      value: item.validUntil,
    });
  } else if (item.approvedOn) {
    cells.push({ label: 'APPROVED ON', value: item.approvedOn });
  }

  return <TotalsRow cells={cells} />;
}

function DetailCtaRow({
  status,
  onViewPendingChangeOrder,
  onViewCurrentApprovedContract,
  onMakePayment,
  onRequestSign,
  isCurrentApprovedCo = false,
  signatureRequired = true,
  isFullyPaid = false,
  hasProcessing = false,
  fullyPaidOn,
}: {
  status: HistoryStatus;
  onViewPendingChangeOrder?: () => void;
  onViewCurrentApprovedContract?: () => void;
  onMakePayment?: () => void;
  /** Pending CO detail panel mirrors the Project Home's primary action —
   *  opens the same SignatureOverlay used by the Change Order Approval
   *  Page's Sign & Approve button. */
  onRequestSign?: () => void;
  /** True for the just-approved (current) Change Order — no pending CO sits
   *  above it, so swap the "View Pending Change Order" link for a Make A
   *  Payment CTA that opens the same MakePaymentDialog the Project Hub uses. */
  isCurrentApprovedCo?: boolean;
  /** DevConsole → Signature toggle. When false, the pending CO's primary
   *  CTA reads "Approve" instead of "Sign & Approve" — same wording shift
   *  the Approval Page applies on its primary buttons. */
  signatureRequired?: boolean;
  /** When `isCurrentApprovedCo` and every invoice has been covered, the
   *  Make A Payment button is replaced with a payment-completion line
   *  mirroring the Project Home's PaymentProgressAndNextPayment copy. */
  isFullyPaid?: boolean;
  /** When `isFullyPaid` and at least one payment is still settling, the
   *  line reads "Payment submitted in full on …" (vs. "Contract Paid in
   *  Full on …" once everything clears). */
  hasProcessing?: boolean;
  /** Display date used in the fully-paid completion line — most recent
   *  payment's paid-on date. */
  fullyPaidOn?: string;
}) {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <div className="flex flex-col items-start w-full">
      {status === 'pending' && (
        <button
          type="button"
          onClick={onRequestSign}
          className="bg-[#d41a32] border-0 flex items-center justify-center h-10 px-4 rounded-[4px] w-full cursor-pointer mt-4 lg:mt-3"
        >
          <span className="text-[14px] font-semibold text-white text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
            {signatureRequired ? <>Sign &amp; Approve</> : 'Approve'}
          </span>
        </button>
      )}
      {status === 'approved' && isCurrentApprovedCo && !isFullyPaid && (
        <button
          type="button"
          onClick={onMakePayment}
          className="bg-[#d41a32] border-0 flex items-center justify-center h-10 px-4 rounded-[4px] w-full cursor-pointer mt-4 lg:mt-3"
        >
          <span className="text-[14px] font-semibold text-white text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
            Make A Payment
          </span>
        </button>
      )}
      {status === 'approved' && isCurrentApprovedCo && isFullyPaid && (
        // Mirrors the `check` variant of PaymentProgressAndNextPayment so
        // the snapshot row reads "✓ Contract Paid in Full on …" with the
        // same green pill + white tick.
        <div className="flex items-center gap-2 w-full mt-4 lg:mt-3 mb-2">
          <span
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 20, height: 20, background: '#04b50b' }}
            aria-hidden
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7.2 L5.6 9.8 L11 4.4"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="text-[12px] sm:text-[14px] xl:text-[16px] font-normal text-[#262626] leading-normal">
            {hasProcessing ? 'Payment submitted in full on' : 'Contract Paid in Full on'}{' '}
            {fullyPaidOn ?? ''}
          </p>
        </div>
      )}
      {status === 'approved' && !isCurrentApprovedCo && (
        <BorderlessLinkButton
          icon={<JumpArrowGlyph />}
          label="View Pending Change Order"
          onClick={onViewPendingChangeOrder}
        />
      )}
      {(status === 'outOfDate' || status === 'original') && (
        <BorderlessLinkButton
          icon={<JumpArrowGlyph />}
          label="View Current Approved Contract"
          onClick={onViewCurrentApprovedContract}
        />
      )}
      <BorderlessLinkButton
        icon={<img src={IMG_DOWNLOAD} alt="" style={{ width: 14, height: 16 }} />}
        label="Download Contract Document [PDF]"
      />
      <BorderlessLinkButton
        icon={<PhoneGlyph />}
        label="Contact Sales"
        onClick={() => setContactOpen(true)}
      />
      <ContactSalesModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M3 5.5C3 4.119 4.119 3 5.5 3h2.379a1.5 1.5 0 0 1 1.426 1.026l1.06 3.18a1.5 1.5 0 0 1-.39 1.547l-1.293 1.293a16 16 0 0 0 5.772 5.772l1.293-1.293a1.5 1.5 0 0 1 1.547-.39l3.18 1.06A1.5 1.5 0 0 1 21 16.621V19a2 2 0 0 1-2 2h-1C9.611 21 3 14.389 3 6V5.5Z"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Live panel builder ───────────────────────────────────────────────────────
// Converts a `buildInvoicesData()` result + the static panel template into
// the panel shape PaymentSnapshotSection renders. Used only for the latest
// approved CO so Make-A-Payment confirmations flow into Progress totals,
// per-invoice rows, and the progress percentage label.
function buildLivePanel(
  data: ReturnType<typeof buildInvoicesData>,
  template: {
    progressLabel: string;
    invoicesHeading: string;
    outstandingMode?: 'paidInFull' | 'refund';
  },
): {
  progressLabel: string;
  received: string;
  processing: string;
  invoiceTotal: string;
  outstanding: string;
  outstandingMode?: 'paidInFull' | 'refund';
  invoicesHeading: string;
  invoices: ReturnType<typeof invoiceToRowData>[];
} {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  let received = 0;
  let processing = 0;
  for (const rec of data.PAYMENT_RECORDS) {
    if (rec.status === 'completed') received += rec.amountApplied;
    else if (rec.status === 'processing') processing += rec.amountApplied;
  }
  const invoiceTotal = data.INVOICES.reduce((s, inv) => s + inv.amount, 0);
  const outstanding = Math.max(0, invoiceTotal - received - processing);
  // Progress = received + processing as a fraction of invoice total — mirrors
  // the Invoices & Payments view's two-segment bar.
  const pct = invoiceTotal > 0
    ? Math.round(((received + processing) / invoiceTotal) * 100)
    : 0;
  // Preserve the template's "Current Progress" / "Revised Progress" prefix so
  // the label stays in sync with whichever record this snapshot belongs to.
  const progressLabelPrefix = template.progressLabel.replace(/·.*$/, '').trim();
  const outstandingMode: 'paidInFull' | 'refund' | undefined =
    outstanding === 0 ? 'paidInFull' : template.outstandingMode;
  return {
    progressLabel: `${progressLabelPrefix} · ${pct}%`,
    received: fmt(received),
    processing: fmt(processing),
    invoiceTotal: fmt(invoiceTotal),
    outstanding: fmt(outstanding),
    outstandingMode,
    invoicesHeading: template.invoicesHeading.replace(/·.*$/, `· ${data.INVOICES.length}`),
    invoices: data.INVOICES.map((inv) => invoiceToRowData(inv, data.paidOnDate)),
  };
}

// Converts an `Invoice` (from buildInvoicesData) into the `InvoiceRowData`
// shape used by InvoiceComparisonRow — same status-line wording the Invoices
// & Payments mobile cards use.
function invoiceToRowData(
  inv: Invoice,
  paidOnDate: (n: number) => string | undefined,
): {
  num: number;
  label: string;
  paid: string;
  total: string;
  statusLine: string;
  status: 'paid' | 'processing' | 'overPaid' | 'partial' | 'pending';
} {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const isFullyCovered = inv.received >= inv.amount && inv.received > 0;
  let statusLine: string;
  if (isFullyCovered) {
    const prefix = inv.status === 'processing' ? 'Submitted on' : 'Paid on';
    statusLine = `${prefix} ${paidOnDate(inv.number) ?? inv.dueDate}`;
  } else {
    statusLine = `Due on ${inv.dueDate}`;
  }
  const status: 'paid' | 'processing' | 'overPaid' | 'partial' | 'pending' =
    inv.status === 'paid' ? 'paid'
      : inv.status === 'processing' ? 'processing'
      : inv.status === 'partial' ? 'partial'
      : 'pending';
  return {
    num: inv.number,
    label: inv.label,
    paid: inv.received > 0 ? fmt(inv.received) : '-',
    total: fmt(inv.amount),
    statusLine,
    status,
  };
}

// ── Payment Snapshot ──────────────────────────────────────────────────────────
// Mini version of InvoicesPaymentsSection's progress + invoices + payments,
// styled to match the Figma "Payment Snapshot" section.
function PaymentSnapshotSection({
  item,
  isLatestApproved = false,
  extraPayments = [],
  revisedContractTotal = 12000,
  revisedInvoicesOverrides,
  invoiceMode = 'happyPath',
}: {
  item: HistoryItem;
  /** True only for the latest approved CO's snapshot — the one whose
   *  current schedule is in effect. Live payment cascades land here so
   *  older approved/out-of-date snapshots stay frozen as history. */
  isLatestApproved?: boolean;
  extraPayments?: ExtraPaymentSpec[];
  revisedContractTotal?: number;
  revisedInvoicesOverrides?: {
    invoiceSpecs?: InvoiceSpec[];
    staticChronology?: ExtraPaymentSpec[];
  };
  invoiceMode?: InvoiceMode;
}) {
  // Mirror the Invoices & Payments tab — pending records render the After
  // CO panel (revised schedule); approved records render the Before CO
  // panel (current schedule). Both react to the Developer Console's
  // Existing Payment toggle via the shared hook.
  const { before, after } = useChangeOrderInvoicePanels();
  const staticInvoicesData = useChangeOrderPaymentRecords();
  // For the live (latest-approved) snapshot, rebuild the schedule + payment
  // chronology via the same `buildInvoicesData` Invoices & Payments uses so
  // every Make-A-Payment confirmation cascades into Progress, per-invoice
  // status, and Payment Records.
  const liveData = useMemo(
    () =>
      isLatestApproved && extraPayments.length > 0
        ? buildInvoicesData(
            revisedContractTotal,
            extraPayments,
            invoiceMode,
            revisedInvoicesOverrides,
          )
        : null,
    [isLatestApproved, extraPayments, revisedContractTotal, invoiceMode, revisedInvoicesOverrides],
  );
  // Panel selection:
  //  • Pending CO     → `after`  (the schedule the CO proposes once approved).
  //  • Latest approved CO → `after`  (its post-approval state IS the current
  //                                   active contract; falling back to `before`
  //                                   would surface the previous contract's
  //                                   total, not what the customer owes now).
  //  • Older approved / out-of-date / original → `before`
  //                                   (frozen historical pre-CO snapshot).
  const staticPanel =
    item.status === 'pending' || item.status === 'expired' || isLatestApproved ? after : before;
  const livePanel = liveData ? buildLivePanel(liveData, staticPanel) : null;
  const panel = livePanel ?? staticPanel;
  const invoicesData = liveData ?? staticInvoicesData;
  // Bar segment widths derived from the panel's received / processing
  // strings so the bar tracks the Invoices & Payments view exactly.
  const parseDollars = (s: string) => Number(s.replace(/[^\d.-]/g, '')) || 0;
  const totalNum = parseDollars(panel.invoiceTotal);
  const receivedPct = totalNum > 0 ? (parseDollars(panel.received) / totalNum) * 100 : 0;
  const processingPct = totalNum > 0 ? (parseDollars(panel.processing) / totalNum) * 100 : 0;

  // Section title varies by record status:
  //   • pending     → "Pending Revised Payment Progress & Schedule" — the
  //                   schedule shown is a proposal, not yet in effect.
  //   • approved    → "Payment Progress & Schedule" — active billing cadence.
  //   • outOfDate / original → "Payment Snapshot" — historical figures only.
  const sectionLabel =
    item.status === 'pending' || item.status === 'expired'
      ? 'Pending Revised Payment Progress & Schedule'
      : item.status === 'approved'
        ? 'Payment Progress & Schedule'
        : 'Payment Snapshot';

  return (
    <SectionCard label={sectionLabel}>
      {/* Inner tinted card wrappers (background, border-radius, padding) are
          dropped here — the three sub-blocks (Progress, Invoices, Payment)
          render flush against the parent SectionCard's own white background
          instead of nesting another tier of cards. */}
      <div className="flex flex-col gap-6 w-full">
        <PaymentProgressBlock
          progressLabel={panel.progressLabel.replace(/.*Progress · /, 'PROGRESS · ')}
          received={panel.received}
          processing={panel.processing}
          invoiceTotal={panel.invoiceTotal}
          outstanding={panel.outstanding}
          outstandingMode={panel.outstandingMode}
          receivedPct={receivedPct}
          processingPct={processingPct}
          bg="transparent"
          padding="0"
        />

        <div className="flex flex-col gap-2 w-full">
          <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal">
            INVOICES · {panel.invoices.length}
          </p>
          <div className="flex flex-col gap-2 w-full">
            {panel.invoices.map((inv) => (
              <InvoiceComparisonRow key={inv.num} row={inv} bg="#fafafa" />
            ))}
          </div>
        </div>

        {/* Payment Records — compact variant of the Invoices & Payments
            table's desktop row, scoped via InvoicesDataContext so the row's
            internal `useInvoicesData()` resolves. */}
        <InvoicesDataContext.Provider value={invoicesData}>
          <div className="flex flex-col gap-2 w-full">
            <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal">
              PAYMENT · {invoicesData.PAYMENT_RECORDS.length}
            </p>
            <div className="flex flex-col gap-1 w-full">
              {invoicesData.PAYMENT_RECORDS.map((rec) => (
                <DesktopPaymentRecordRow
                  key={rec.paymentId}
                  rec={rec}
                  onOpen={() => {}}
                  compact
                  bg="#fafafa"
                />
              ))}
            </div>
          </div>
        </InvoicesDataContext.Provider>
      </div>
    </SectionCard>
  );
}

// ── Glyphs ────────────────────────────────────────────────────────────────────
function SearchGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5" stroke="#737373" strokeWidth="1.4" />
      <line x1="11" y1="11" x2="14" y2="14" stroke="#737373" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BackArrowGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M10 3L5 8L10 13"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JumpArrowGlyph() {
  return (
    <svg
      width="16"
      height="16"
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

// Suppress unused-import warning for IMG_PHONE while ContactSalesButton owns
// its own icon — kept here for future iterations of the CTA row.
void IMG_PHONE;
