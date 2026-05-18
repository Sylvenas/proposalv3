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
} from './InvoicesPaymentsSection';
import {
  DrawingSection as ProjectHubDrawingSection,
  ProductsSection as ProjectHubProductsSection,
} from './ProjectHubPageResponsive';
import { PdfPages } from './ContractDocSection';
import BorderlessLinkButton from './BorderlessLinkButton';
import BackToTopButton from './BackToTopButton';
import { ContactSalesModal } from './SalesContactCard';
import { InvoiceComparisonRow, PaymentProgressBlock } from './ChangeOrderInvoiceRow';

const BASE = '/images/proposal-v3-responsive';
const IMG_DOWNLOAD = `${BASE}/download.svg`;
const IMG_PHONE = `${BASE}/phone.svg`;

// ── Data model ────────────────────────────────────────────────────────────────
type HistoryStatus = 'pending' | 'approved' | 'outOfDate' | 'original';

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
}: {
  products: FenceProduct[];
}) {
  // Default selection — the latest node on the timeline (newest-first ordering).
  const [selectedId, setSelectedId] = useState<string>(HISTORY_ITEMS[0].id);
  const selected = useMemo(
    () => HISTORY_ITEMS.find((i) => i.id === selectedId) ?? HISTORY_ITEMS[0],
    [selectedId],
  );

  // Switching records replaces the detail panel content. If the user has
  // already scrolled past the top of the detail panel, reset their view to
  // the panel's top (sitting just below the sticky tab bar). If they're
  // still above that point, don't scroll — they'd jump downward, which is
  // disorienting.
  const detailRef = useRef<HTMLDivElement>(null);
  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window === 'undefined') return;
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

  return (
    <div
      className="flex flex-col lg:flex-row gap-3 w-full"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* ── Left: history list ─────────────────────────────────────────── */}
      {/* `pt-6` matches the right detail panel's top padding so both columns
          start at the same vertical position under the sticky tab bar.
          `pr-6` adds breathing room between the list cards and the right
          detail panel's tinted background. */}
      <div className="w-full lg:flex-[1_1_0] min-w-0 lg:sticky lg:top-12 lg:self-start pt-6 lg:pr-4">
        <HistoryList
          items={HISTORY_ITEMS}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Right: detail (tinted background) ─────────────────────────── */}
      {/* `lg:-mb-8` reaches into the page container's lg paddingBottom (32px)
          so the panel's bg meets the page bottom with no gap. */}
      <div
        ref={detailRef}
        className="w-full lg:flex-[2_1_0] min-w-0 flex flex-col gap-4 px-4 sm:px-6 lg:px-8 pt-6 pb-6 lg:-mb-8"
        style={{ background: '#f5f5f5' }}
      >
        <DetailHeader item={selected} />
        <DetailNotice status={selected.status} />
        <DetailTotalsRow item={selected} />
        <DetailCtaRow status={selected.status} />
        <PaymentSnapshotSection item={selected} />
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
          first dot. */}
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
          }}
        />
      )}
      {/* Selected background highlight — sits inside the row only so the
          timeline dot to the left stays visually separate from the card. */}
      {selected && (
        <span
          aria-hidden
          className="absolute"
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
      <p className="text-[12px] sm:text-[13px] xl:text-[14px] font-semibold text-[#737373] uppercase tracking-[0.06em] w-full">
        {item.label}
      </p>
      <p className="text-[20px] sm:text-[24px] xl:text-[32px] font-semibold w-full leading-[1.2]">
        {item.title}
      </p>
    </div>
  );
}

function DetailNotice({ status }: { status: HistoryStatus }) {
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
  if (status === 'approved') {
    return (
      <div
        className="rounded-[6px] px-4 py-3 w-full"
        style={{ background: '#d1e7ff' }}
      >
        <p className="text-[14px] xl:text-[16px] text-[#262626] leading-[1.5]">
          <span className="font-semibold">Note:</span> this contract is locked
          while a change order is pending. Approve the change order to continue,
          or contact your sales representative to withdraw it.
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

function DetailTotalsRow({ item }: { item: HistoryItem }) {
  // Build up to 3 cells based on which fields the record carries. Each cell
  // can override its value color (used for the green/red NET CHANGE row).
  const cells: { label: string; value: string; valueColor?: string }[] = [];

  if (item.netChange) {
    cells.push({
      label: 'NET CHANGE',
      value: item.netChange,
      valueColor: getAmountColor(item.netChange),
    });
  }
  cells.push({
    label: item.status === 'pending' ? 'NEW CONTRACT TOTAL' : 'CONTRACT TOTAL',
    value: item.contractTotal,
  });
  if (item.validUntil) {
    cells.push({ label: 'VALID UNTIL', value: item.validUntil });
  } else if (item.approvedOn) {
    cells.push({ label: 'APPROVED ON', value: item.approvedOn });
  }

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
          <p className="text-[11px] xl:text-[12px] font-semibold text-[#737373] uppercase tracking-[0.06em] leading-[16px] whitespace-nowrap">
            {c.label}
          </p>
          <p
            className="text-[18px] sm:text-[20px] xl:text-[24px] leading-normal whitespace-nowrap font-normal pt-1"
            style={{ color: c.valueColor ?? '#262626' }}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function DetailCtaRow({ status }: { status: HistoryStatus }) {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <div className="flex flex-col items-start w-full">
      {status === 'approved' && (
        <BorderlessLinkButton
          icon={<JumpArrowGlyph />}
          label="View Pending Change Order"
        />
      )}
      {(status === 'outOfDate' || status === 'original') && (
        <BorderlessLinkButton
          icon={<JumpArrowGlyph />}
          label="View Current Approved Contract"
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

// ── Payment Snapshot ──────────────────────────────────────────────────────────
// Mini version of InvoicesPaymentsSection's progress + invoices + payments,
// styled to match the Figma "Payment Snapshot" section.
function PaymentSnapshotSection({ item }: { item: HistoryItem }) {
  // Static placeholder rows — these vary per record once real wiring lands.
  const totalCents = 12999;
  const received = 3000;
  const processing = 3000;
  const outstanding = totalCents - received - processing;

  const invoices = [
    { num: 1, label: 'Deposit (30%)', paid: '$2,000', total: '$3,000', statusLine: 'Paid on Mar 23, 2026', status: 'paid' as const },
    { num: 2, label: 'Balance (40%)', paid: '$2,000', total: '$3,999', statusLine: 'Due on May 2, 2026', status: 'partial' as const },
    { num: 3, label: 'Balance (30%)', paid: '-',      total: '$3,000', statusLine: 'Due on Jun 11, 2026', status: 'pending' as const },
  ];

  // Real payment records sourced from the same builder the Invoices & Payments
  // tab uses — keeps the per-record rows in lockstep with the rest of the app.
  const invoicesData = useMemo(() => buildInvoicesData(totalCents), [totalCents]);

  // Bar segment widths (percentages of contract total).
  const receivedPct  = (received    / totalCents) * 100;
  const processingPct = (processing / totalCents) * 100;
  void outstanding;

  void item; // reserved for per-record payment data wiring

  // Section title varies by record status:
  //   • pending     → "Pending Revised Payment Progress & Schedule" — the
  //                   schedule shown is a proposal, not yet in effect.
  //   • approved    → "Payment Progress & Schedule" — active billing cadence.
  //   • outOfDate / original → "Payment Snapshot" — historical figures only.
  const sectionLabel =
    item.status === 'pending'
      ? 'Pending Revised Payment Progress & Schedule'
      : item.status === 'approved'
        ? 'Payment Progress & Schedule'
        : 'Payment Snapshot';

  return (
    <SectionCard label={sectionLabel}>
      <div className="flex flex-col gap-6 w-full">
        {/* Progress block — shared with the Invoices & Payments comparison
            panels. Uses the same tinted card + bar + amounts layout. */}
        <PaymentProgressBlock
          progressLabel={`PROGRESS · ${Math.round(receivedPct + processingPct)}%`}
          received="$3,000"
          processing="$3,000"
          invoiceTotal="$12,999"
          outstanding="$3,999"
          receivedPct={receivedPct}
          processingPct={processingPct}
        />

        {/* Invoices — same tinted card wrapper as the progress block so the
            three blocks read as a consistent stack of cards. */}
        <div
          className="flex flex-col gap-2 w-full"
          style={{ background: '#f5f5f5', borderRadius: 8, padding: '24px 20px' }}
        >
          <p className="text-[12px] font-semibold text-[#262626] uppercase tracking-[0.06em]">
            INVOICES · {invoices.length}
          </p>
          <div className="flex flex-col gap-2 w-full">
            {invoices.map((inv) => (
              <InvoiceComparisonRow key={inv.num} row={inv} />
            ))}
          </div>
        </div>

        {/* Payment Records — compact variant of the Invoices & Payments
            table's desktop row, scoped via InvoicesDataContext so the row's
            internal `useInvoicesData()` resolves. */}
        <InvoicesDataContext.Provider value={invoicesData}>
          <div
            className="flex flex-col gap-2 w-full"
            style={{ background: '#f5f5f5', borderRadius: 8, padding: '24px 20px' }}
          >
            <p className="text-[12px] font-semibold text-[#262626] uppercase tracking-[0.06em]">
              PAYMENT · {invoicesData.PAYMENT_RECORDS.length}
            </p>
            <div className="flex flex-col gap-1 w-full">
              {invoicesData.PAYMENT_RECORDS.map((rec) => (
                <DesktopPaymentRecordRow
                  key={rec.paymentId}
                  rec={rec}
                  onOpen={() => {}}
                  compact
                  bg="#ffffff"
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
