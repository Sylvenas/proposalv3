'use client';

import { useEffect, useRef, useState } from 'react';
import { useBodyScrollLock } from './useBodyScrollLock';
import ScrollHintArrows from './ScrollHintArrows';

// ─── Types ───────────────────────────────────────────────────────────────────
export type PaymentScheduleData = {
  /** Big title on the desktop modal — e.g. 'OPTION 2 - VINYL TRADITIONS FENCE'. */
  optionLabel: string;
  /** Subtitle on the desktop modal — e.g. 'Henderson Backyard Fence'. */
  projectName: string;
  /** Drives the three schedule line-item amounts (split 20 / 60 / 20). */
  contractTotal: number;
  /** Estimated monthly payment surfaced on both layouts. */
  monthly: number;
  /** Placeholder loan amount surfaced under the right-hand summary. */
  loanAmount: number;
  /** Placeholder loan term, in months. */
  termMonths: number;
  /** Placeholder APR percentage (e.g. 4 for 4%). */
  apr: number;
};

// ─── Schedule definitions ────────────────────────────────────────────────────
// Default 3-step split — 20 / 60 / 20 with cumulative percentages used by the
// progress bar. Driven by DevConsole → Number of Scheduled Payments = Common.
const SCHEDULE_COMMON = [
  { num: 1, label: 'Deposit (20%)', percent: 20, cumulative: 20,  due: 'Due within 7 days after approval' },
  { num: 2, label: 'Balance (60%)', percent: 60, cumulative: 80,  due: 'Due upon project completion' },
  { num: 3, label: 'Balance (20%)', percent: 20, cumulative: 100, due: 'Due at final inspection' },
] as const;

// 6-step demo schedule used to verify the bottom sheet's scrollable body and
// the desktop modal's left-column overflow when there are many line items.
// Driven by DevConsole → Number of Scheduled Payments = Overflow.
const SCHEDULE_OVERFLOW = [
  { num: 1, label: 'Deposit (20%)',  percent: 20, cumulative: 20,  due: 'Due within 7 days after approval' },
  { num: 2, label: 'Progress (15%)', percent: 15, cumulative: 35,  due: 'Due upon material delivery' },
  { num: 3, label: 'Progress (15%)', percent: 15, cumulative: 50,  due: 'Due upon site preparation' },
  { num: 4, label: 'Progress (20%)', percent: 20, cumulative: 70,  due: 'Due at midway inspection' },
  { num: 5, label: 'Balance (20%)',  percent: 20, cumulative: 90,  due: 'Due upon project completion' },
  { num: 6, label: 'Final (10%)',    percent: 10, cumulative: 100, due: 'Due at final inspection' },
] as const;

type ScheduleEntry = {
  num: number;
  label: string;
  percent: number;
  cumulative: number;
  due: string;
};

// ─── Animation tuning (mirrors InvoicePaymentDetailDialog / MakePaymentDialog) ─
const ANIM_MS = 280;
const EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN  = 'cubic-bezier(0.4, 0, 1, 1)';

// ─── Format helpers ──────────────────────────────────────────────────────────
function fmtMoney0(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}
function fmtMoney2(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Inline icons ────────────────────────────────────────────────────────────
function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3L13 13M13 3L3 13" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Schedule line-item card ─────────────────────────────────────────────────
// The vertical accent bar (left edge), numbered circle badge, label, due-text
// and amount line up identically on mobile + desktop — only the amount placement
// differs: stacked under the label on the narrow sheet, right-aligned on the
// wider modal.
function ScheduleLineItem({
  num,
  label,
  amount,
  due,
  variant,
}: {
  num: number;
  label: string;
  amount: number;
  due: string;
  /** 'mobile' = amount stacked under the label; 'desktop' = amount on the right. */
  variant: 'mobile' | 'desktop';
}) {
  const isMobile = variant === 'mobile';
  return (
    <div
      className="flex items-stretch w-full overflow-hidden"
      style={{
        background: '#f5f5f5',
      }}
    >
      {/* Vertical accent bar on the left edge — theme red, matches the
          Approve button fill so the schedule items read as part of the
          approval flow's primary action chain. */}
      <div style={{ width: 3, background: '#d41a32', flexShrink: 0 }} />

      <div
        className={`flex items-center gap-3 sm:gap-4 flex-1 min-w-0 ${
          isMobile ? 'py-4 pl-3 pr-4' : 'py-5 px-5'
        }`}
      >
        {/* Numbered circle badge */}
        <div
          className="flex items-center justify-center shrink-0 rounded-full"
          style={{
            width: isMobile ? 48 : 44,
            height: isMobile ? 48 : 44,
            background: '#ffffff',
            border: '1px solid #d9d9d9',
          }}
        >
          <span
            className="text-[12px] sm:text-[14px] text-[#737373] leading-none"
            style={{ letterSpacing: '0.2px' }}
          >
            #{num}
          </span>
        </div>

        {/* Text block — label + due (+ amount stacked on mobile) */}
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-[14px] sm:text-[16px] xl:text-[16px] font-semibold text-[#262626] leading-tight">
            {label}
          </p>
          {isMobile && (
            <p className="text-[20px] sm:text-[24px] text-[#262626] leading-tight mt-1" style={{ fontWeight: 300 }}>
              {fmtMoney0(amount)}
            </p>
          )}
          <p className="text-[12px] sm:text-[14px] text-[#737373] leading-normal mt-1">
            {due}
          </p>
        </div>

        {/* Amount — desktop only (right-aligned) */}
        {!isMobile && (
          <p className="text-[20px] xl:text-[24px] text-[#262626] leading-tight shrink-0" style={{ fontWeight: 300 }}>
            {fmtMoney0(amount)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Progress bar (desktop only) ─────────────────────────────────────────────
// Horizontal track with three numbered nodes positioned by the cumulative
// payment percentage (20 / 80 / 100). The first node is filled black to mark
// the upcoming step; the trailing nodes are outlined.
function PaymentProgressBar({ schedule }: { schedule: ReadonlyArray<ScheduleEntry> }) {
  return (
    <div
      className="relative w-full"
      style={{
        background: '#f5f5f5',
        borderRadius: 4,
        // Asymmetric vertical padding picked so the track line (at y=12
        // inside the 56-tall inner, i.e. the circle's vertical midpoint)
        // lands at the card's vertical centre. Math: tp − bp = (inner
        // height) − 2·(track-offset-within-inner) = 56 − 24 = 32.
        padding: '44px 32px 12px 32px',
      }}
    >
      <div className="relative w-full" style={{ height: 56 }}>
        {/* Inset wrapper — its width is (outer − 12px) so `left:100%` resolves
            to one circle-radius shy of the outer's right edge. Without this
            extra layer, percentage `left` on an absolute child resolves
            against the padding box of its containing block and ignores any
            paddingRight we'd set on the outer. */}
        <div className="absolute inset-y-0 left-0" style={{ right: 12 }}>
        {/* Track line — centered on the circle's vertical midpoint (y=12
            for a 24px tall node anchored at top:0). */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: 12,
            height: 0.5,
            transform: 'translateY(-50%)',
            background: '#262626',
          }}
        />

        {schedule.map((s) => {
          return (
            <div
              key={s.num}
              className="absolute flex flex-col items-center"
              style={{
                top: 0,
                // Position the node centre at the cumulative percentage.
                left: `${s.cumulative}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  background: '#262626',
                  border: '1px solid #262626',
                }}
              >
                <span
                  className="text-[10px] leading-none font-semibold"
                  style={{ color: '#ffffff' }}
                >
                  {s.num}
                </span>
              </div>
              <span
                className="text-[12px] text-[#737373] mt-1 leading-normal"
                style={{ whiteSpace: 'nowrap' }}
              >
                {s.cumulative}%
              </span>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// ─── Right-column key/value row (desktop summary) ────────────────────────────
// Mirrors the Make Payment dialog's DesktopSummaryColumn rows — muted
// #737373 type at 14px, label flex-fills, value right-aligned. Keeps the
// two surfaces visually consistent so the user reads them as the same
// "summary panel" treatment.
function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start w-full">
      <p className="flex-1 min-w-0 text-[14px] text-[#737373] leading-normal whitespace-nowrap">
        {label}
      </p>
      <p className="text-[14px] text-[#737373] leading-normal whitespace-nowrap">
        {value}
      </p>
    </div>
  );
}

// ─── Outline Done button (used by both layouts) ──────────────────────────────
// Matches the secondary "Done" button styling used elsewhere
// (SalesContactCardContent secondary CTA): plain weight, mixed case, no
// letter-spacing.
function DoneButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="bg-white border border-solid border-[#262626] flex items-center justify-center gap-[6px] h-10 px-4 rounded-[4px] w-full cursor-pointer"
    >
      <span
        className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
        style={{ lineHeight: '18px' }}
      >
        Done
      </span>
    </button>
  );
}

// ─── Main dialog ─────────────────────────────────────────────────────────────
//
// Renders nothing when `data` is null. When `data` becomes non-null:
//   • mounts the backdrop + container in DOM
//   • next frame, flips `open=true` → CSS transitions slide/scale into view
// On close, `open=false` first (animations play), then unmount after ANIM_MS.
//
// XS / S / M (lg:hidden):  bottom sheet sliding up from the bottom edge
//                          (mirrors InvoicePaymentDetailDialog).
// L+ (hidden lg:flex):     centered two-column modal (mirrors MakePaymentDialog
//                          — left = schedule, right = monthly estimation).
export default function PaymentScheduleDialog({
  data,
  onClose,
  financingExcluded = false,
  scheduledPaymentsCount = 'common',
  title = 'Payment Schedule',
  optionLabelPrefix,
  hideProjectName = false,
  progressBlock,
  scheduleList,
  mobileScheduleList,
}: {
  /** Non-null = open. Null = closed. */
  data: PaymentScheduleData | null;
  onClose: () => void;
  /** When true, hide every monthly-payment / loan affordance:
   *   • mobile sheet drops the Estimated Monthly Payment + Estimated Loan
   *     blocks (and the trailing disclaimer, which only describes those)
   *   • desktop modal renders without the right-hand estimation column;
   *     the X close + Done button move into the left column instead. */
  financingExcluded?: boolean;
  /** 'common' (default) shows the 3-step schedule. 'overflow' swaps in a
   *  6-step demo schedule used to verify scroll behaviour. */
  scheduledPaymentsCount?: 'common' | 'overflow';
  /** Uppercase eyebrow above the option label. Defaults to "Payment
   *  Schedule"; Change Order overrides this to "Revised Pending Payment
   *  & Schedule". Rendered with `text-transform: uppercase`. */
  title?: string;
  /** Optional prefix prepended to the option label (e.g. "Change Order #3")
   *  joined with " - ". Used by ChangeOrderPage to surface the change order
   *  number inline with the option name. */
  optionLabelPrefix?: string;
  /** When true, hide the project address line under the option label.
   *  Used by ChangeOrderPage's Revised Payment Schedule modal where the
   *  address is redundant with the surrounding Change Order context. */
  hideProjectName?: boolean;
  /** Optional override for the desktop progress section. When provided,
   *  this replaces the default 1-2-3 PaymentProgressBar — used by
   *  ChangeOrderPage to swap in the Revised Progress PaymentProgressBlock. */
  progressBlock?: React.ReactNode;
  /** Optional override for the desktop schedule list. When provided,
   *  this replaces the default Scheduled Payments rows — used by
   *  ChangeOrderPage to swap in the Revised Invoices tinted card. */
  scheduleList?: React.ReactNode;
  /** Optional override for the mobile sheet's schedule list only. When
   *  provided, this replaces the mobile rows; the desktop modal still uses
   *  `scheduleList`. Lets ChangeOrderPage render MobileInvoiceCard on
   *  mobile while keeping the InvoiceComparisonRow layout on desktop. */
  mobileScheduleList?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const [last, setLast]       = useState<PaymentScheduleData | null>(null);
  // Scroll viewports observed by ScrollHintArrows so up/down chevrons surface
  // whenever the user can still scroll further in that direction. Native
  // scrollbars are hidden on both surfaces; the chevrons are the only hint.
  const sheetScrollRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  // Mobile sheet only — toggled by the "Read more" link to swap the
  // single-line truncated disclaimer for the full two-sentence text. Reset
  // on every fresh open so a re-open starts from the collapsed state.
  const [readMoreExpanded, setReadMoreExpanded] = useState(false);
  // Pixels reserved at the top of the mobile sheet for the host page's
  // pinned chrome (e.g., the Project Hub / Summary sticky header). Measured
  // when the dialog opens — `position: fixed`/`sticky` elements still in view
  // contribute their bottom edge; transformed-out headers (rect.bottom ≤ 0)
  // don't. Defaults to 0 so the sheet always covers the full viewport in the
  // absence of pinned chrome.
  const [topInset, setTopInset] = useState(0);

  useEffect(() => {
    if (data) {
      setLast(data);
      setMounted(true);
      // Re-opening starts collapsed; expanding is sticky only within a
      // single session.
      setReadMoreExpanded(false);
      // Measure pinned chrome (sticky/fixed top: 0 elements currently in
      // view) so the bottom sheet can cap its height to fit beneath it.
      // Full-viewport overlays (modal backdrops, including this dialog's own
      // wrappers when re-opening mid-animation) are excluded so they don't
      // collapse the sheet to zero height.
      let maxBottom = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const cs = window.getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') return;
        const r = el.getBoundingClientRect();
        if (r.height <= 0 || r.width <= 0) return;
        if (r.top > 0 || r.bottom <= 0) return;
        // Likely a backdrop / scrim, not a sticky header.
        if (r.height >= vh * 0.9) return;
        if (r.bottom > maxBottom) maxBottom = r.bottom;
      });
      setTopInset(maxBottom);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setOpen(true));
        (r1 as unknown as { _r2: number })._r2 = r2;
      });
      return () => cancelAnimationFrame(r1);
    }
    if (!mounted) return;
    setOpen(false);
    const t = window.setTimeout(() => setMounted(false), ANIM_MS);
    return () => window.clearTimeout(t);
  }, [data, mounted]);

  // Body scroll lock while open — ref-counted so nested locks compose safely.
  useBodyScrollLock(mounted);

  // Esc to close
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  // Wheel-forward the global scroll wheel onto the active scroll viewport.
  // Without this, wheeling over the pinned header, the right-column
  // estimation panel, or the backdrop does nothing — only wheeling
  // directly over the Scheduled Payments list scrolls. Forwarding makes
  // the wheel work everywhere the dialog occupies, while still letting
  // native scrolling handle events that land inside the viewport itself.
  //
  // Direct wheel-over-the-list uses the browser's built-in smooth wheel
  // animation; a plain `scrollBy(deltaY)` snaps in instant 100px chunks
  // (one wheel notch ≈ one line item) and feels coarse by comparison.
  // To match the native feel we accumulate deltaY into a target
  // scrollTop and ease toward it via requestAnimationFrame.
  useEffect(() => {
    if (!mounted) return;

    let target: number | null = null;
    let rafId: number | null = null;

    const tick = () => {
      const sc = (window.innerWidth >= 1024 ? modalScrollRef : sheetScrollRef).current;
      if (!sc || target === null) {
        rafId = null;
        return;
      }
      const cur = sc.scrollTop;
      const diff = target - cur;
      // Stop animating once we're within half a pixel of the target;
      // otherwise rounding keeps the loop alive forever.
      if (Math.abs(diff) < 0.5) {
        sc.scrollTop = target;
        target = null;
        rafId = null;
        return;
      }
      sc.scrollTop = cur + diff * 0.2; // ease-out factor
      rafId = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const sc = (window.innerWidth >= 1024 ? modalScrollRef : sheetScrollRef).current;
      if (!sc) return;
      // Events inside the scroll viewport already scroll natively.
      if (sc.contains(e.target as Node)) {
        // Drop any in-flight forwarded animation when the user starts
        // wheeling directly on the list — otherwise our rAF tick and the
        // browser's native scroll would fight each other.
        target = null;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        return;
      }
      // Convert non-pixel wheel modes to a pixel delta. Most browsers
      // use DOM_DELTA_PIXEL today; older / Firefox can still send LINE
      // or PAGE deltas.
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;            // DOM_DELTA_LINE
      else if (e.deltaMode === 2) dy *= sc.clientHeight; // DOM_DELTA_PAGE
      const base = target ?? sc.scrollTop;
      const max  = sc.scrollHeight - sc.clientHeight;
      target = Math.max(0, Math.min(max, base + dy));
      if (rafId === null) rafId = requestAnimationFrame(tick);
      e.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [mounted]);

  if (!mounted || !last) return null;

  // Pick the schedule definition driven by the DevConsole toggle.
  const schedule: ReadonlyArray<ScheduleEntry> =
    scheduledPaymentsCount === 'overflow' ? SCHEDULE_OVERFLOW : SCHEDULE_COMMON;
  // Derive line-item amounts from the contract total.
  const amounts = schedule.map((s) => Math.round(last.contractTotal * s.percent / 100));

  // Loan summary string used inline on the mobile sheet.
  const loanSummary = `${fmtMoney0(last.loanAmount)} · ${last.termMonths} terms · ${last.apr}%`;
  // Mobile sheet: change-order prefix gets a smaller / semibold / uppercase
  // secondary-color treatment so the option name stays the primary anchor.
  const optionLabelDisplayMobile: React.ReactNode = optionLabelPrefix ? (
    <>
      <span className="text-[14px] sm:text-[16px] font-semibold text-[#737373] uppercase">
        {optionLabelPrefix}
      </span>
      <br />
      {last.optionLabel}
    </>
  ) : (
    last.optionLabel
  );
  // Desktop modal: prefix renders in the same font/size/weight/color as the
  // option label below it (inherits the parent <p>'s styles — no custom span).
  const optionLabelDisplayDesktop: React.ReactNode = optionLabelPrefix ? (
    <>
      {optionLabelPrefix}
      <br />
      {last.optionLabel}
    </>
  ) : (
    last.optionLabel
  );

  return (
    <>
      {/* Hide native scrollbars on the dialog's scroll viewports — the
          bouncing chevrons from ScrollHintArrows are the only affordance
          signalling that more content is off-screen. */}
      <style>{`
        .payment-schedule-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .payment-schedule-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/50"
        style={{
          opacity: open ? 1 : 0,
          backdropFilter: open ? 'blur(4px)' : 'blur(0px)',
          WebkitBackdropFilter: open ? 'blur(4px)' : 'blur(0px)',
          transition: open
            ? `opacity ${ANIM_MS}ms ${EASE_OUT}, backdrop-filter ${ANIM_MS}ms ${EASE_OUT}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_OUT}`
            : `opacity ${ANIM_MS}ms ${EASE_IN}, backdrop-filter ${ANIM_MS}ms ${EASE_IN}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_IN}`,
        }}
      />

      {/* ── Mobile (XS/S/M) — bottom sheet ───────────────────────────────── */}
      <div
        className="lg:hidden fixed left-0 right-0 bottom-0 z-[81] bg-white flex flex-col overflow-hidden"
        style={{
          fontFamily: 'Segoe UI, sans-serif',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          // Cap height so the sheet never reaches above the host page's
          // pinned chrome (measured into topInset on open). Falls back to
          // 90vh in the absence of any pinned header so behaviour matches
          // the prior baseline.
          maxHeight: topInset > 0 ? `calc(100vh - ${topInset}px)` : '90vh',
          boxShadow: '0px -4px 24px rgba(0,0,0,0.18)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: open
            ? `transform ${ANIM_MS}ms ${EASE_OUT}`
            : `transform ${ANIM_MS}ms ${EASE_IN}`,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="rounded-full bg-[#d9d9d9]" style={{ width: 36, height: 4 }} />
        </div>

        {/* Scrolling body — native scrollbar hidden; the bouncing chevrons
            from ScrollHintArrows are the only affordance signalling more
            content above/below. The info header (Payment Schedule eyebrow
            / option label / project name) lives inside the viewport on
            mobile so it scrolls away with the list rather than staying
            pinned to the top of the sheet. */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div
            ref={sheetScrollRef}
            className="payment-schedule-scroll flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-6 pb-4"
          >
            {/* Info header — option label only on mobile (eyebrow + project
                subtitle are intentionally omitted; the desktop modal keeps
                the full three-line header). Scrolls with the list. */}
            <div className="flex flex-col gap-1 w-full pb-6">
              <p className="text-[16px] sm:text-[18px] font-semibold text-[#262626] leading-normal">
                {optionLabelDisplayMobile}
              </p>
            </div>

            {/* Optional progress block — Change Order passes the Revised
                Progress card so the mobile sheet matches the desktop modal. */}
            {progressBlock && <div className="pb-6 w-full">{progressBlock}</div>}

            {/* Schedule line items — caller can override (e.g. Change Order's
                Revised Invoices list); default falls back to the standard
                ScheduleLineItem rows. Mobile takes `mobileScheduleList` first
                so callers can render a different layout on the sheet vs. the
                desktop modal. */}
            {mobileScheduleList ?? scheduleList ?? (
              <div className="flex flex-col gap-2 w-full">
                {schedule.map((s, i) => (
                  <ScheduleLineItem
                    key={s.num}
                    num={s.num}
                    label={s.label}
                    amount={amounts[i]}
                    due={s.due}
                    variant="mobile"
                  />
                ))}
              </div>
            )}

            {/* Financing blocks — Estimated Monthly Payment + Loan summary +
                disclaimer. Hidden together when DevConsole → Summary Page →
                Financing Estimation = Excluded. */}
            {!financingExcluded && (
              <>
                <div className="flex flex-col gap-1 w-full mt-8">
                  <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal">
                    Revised Estimated Monthly Payment
                  </p>
                  <p className="text-[20px] sm:text-[24px] font-semibold text-[#262626] leading-normal">
                    {fmtMoney2(last.monthly)} / mo
                  </p>
                </div>

                <div className="flex flex-col gap-1 w-full mt-8">
                  <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal">
                    Revised Estimated Loan Amount / Terms / APR
                  </p>
                  <p className="text-[20px] sm:text-[24px] text-[#262626] leading-normal" style={{ fontWeight: 300 }}>
                    {loanSummary}
                  </p>
                </div>

                {readMoreExpanded ? (
                  <p
                    ref={(el) => {
                      // Disclaimer is the last block in the sheet, so just
                      // pin the scroll container to its absolute bottom —
                      // reads more naturally than nudging the paragraph to
                      // the viewport's bottom edge with leftover content
                      // below.
                      if (!el) return;
                      requestAnimationFrame(() => {
                        const sc = sheetScrollRef.current;
                        if (!sc) return;
                        sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' });
                      });
                    }}
                    className="text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px] w-full mt-8 mb-2"
                    style={{ fontWeight: 300 }}
                  >
                    Any monthly payment information shown is an estimate only and is not a financing offer.
                    Final payment amounts, interest rates, and loan terms are subject to lender review and
                    will be confirmed during the formal application process.
                  </p>
                ) : (
                  <div className="flex gap-3 items-start w-full mt-8 mb-2">
                    <p
                      className="flex-[1_0_0] min-w-0 text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px] overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontWeight: 300 }}
                    >
                      Any monthly payment information shown is an estimate only and is not a financing offer.
                    </p>
                    <button
                      type="button"
                      onClick={() => setReadMoreExpanded(true)}
                      className="shrink-0 bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[rgba(0,0,0,0.85)] text-center"
                    >
                      <span className="underline leading-normal" style={{ textDecorationSkipInk: 'none' }}>
                        Read more
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <ScrollHintArrows targetRef={sheetScrollRef} topInset={4} bottomInset={4} />
        </div>

        {/* Footer — DONE button */}
        <div className="flex flex-col gap-3 px-4 sm:px-6 pt-4 pb-6 shrink-0">
          <DoneButton onClose={onClose} />
        </div>
      </div>

      {/* ── Desktop (L+) — centered two-column modal ─────────────────────── */}
      <div
        className="hidden lg:flex fixed inset-0 z-[81] items-center justify-center pointer-events-none"
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        <div
          className="bg-white flex pointer-events-auto relative overflow-hidden"
          style={{
            width: 'min(1000px, calc((100vw - 48px) * 5 / 6 - 2px))',
            maxHeight: '85vh',
            borderRadius: 12,
            boxShadow: '0px 8px 32px rgba(0,0,0,0.24), 0px 2px 8px rgba(0,0,0,0.12)',
            transform: open ? 'scale(1)' : 'scale(0.96)',
            opacity: open ? 1 : 0,
            transition: open
              ? `transform ${ANIM_MS}ms ${EASE_OUT}, opacity ${ANIM_MS}ms ${EASE_OUT}`
              : `transform ${ANIM_MS}ms ${EASE_IN}, opacity ${ANIM_MS}ms ${EASE_IN}`,
          }}
        >
          {/* Left column — schedule. When financing is excluded the right
              column is omitted entirely; this column expands to fill the
              modal and absorbs the close affordance.
              Header + progress bar are pinned at the top; only the
              Scheduled Payments list scrolls when the schedule overflows. */}
          <div
            className="flex flex-col min-w-0"
            style={{ flex: financingExcluded ? '1 1 0' : '6 1 0' }}
          >
            {/* Sticky top — header + progress bar. Bottom padding owns
                the visible breathing room between the progress bar and the
                scroll viewport so even mid-scroll the first schedule item
                never butts up against the progress bar.
                Wheel-forwarding lives at the window level (see effect below)
                so wheeling over the header, right column, or backdrop all
                scroll the Scheduled Payments list. */}
            <div className="flex flex-col gap-8 xl:gap-10 2xl:gap-12 items-start w-full shrink-0 px-6 pt-6 pb-8 xl:px-8 xl:pt-8 xl:pb-10 2xl:px-10 2xl:pt-10 2xl:pb-12">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 w-full">
                <div className="flex flex-col gap-1 items-start min-w-0 flex-1">
                  <p className="text-[12px] xl:text-[14px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal whitespace-nowrap">
                    {title}
                  </p>
                  <p className="text-[16px] xl:text-[20px] text-[#262626] leading-normal whitespace-nowrap mt-1">
                    {optionLabelDisplayDesktop}
                  </p>
                  {!hideProjectName && (
                    <p className="text-[12px] xl:text-[14px] text-[#737373] leading-normal whitespace-nowrap -mt-1">
                      {last.projectName}
                    </p>
                  )}
                </div>
                {/* Close X — only shown in this column when the right column
                    (which normally owns the X) is suppressed. */}
                {financingExcluded && (
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="bg-transparent border-0 cursor-pointer p-0 flex items-center justify-center shrink-0"
                    style={{ width: 16, height: 16 }}
                  >
                    <CloseIcon size={16} />
                  </button>
                )}
              </div>

              {/* Progress bar — defaults to the 1-2-3 schedule dots; the
                  Change Order caller passes a PaymentProgressBlock to
                  swap in the Revised Progress card. */}
              {progressBlock ?? <PaymentProgressBar schedule={schedule} />}
            </div>

            {/* Scrolling Scheduled Payments list. The relative wrapper lets
                ScrollHintArrows anchor to the scroll viewport without itself
                scrolling. */}
            <div className="relative flex-1 min-h-0 flex flex-col">
              <div
                ref={modalScrollRef}
                className="payment-schedule-scroll flex-1 min-h-0 overflow-y-auto px-6 xl:px-8 2xl:px-10 pb-6 xl:pb-8 2xl:pb-10"
              >
                {scheduleList ?? (
                  <div className="flex flex-col gap-2 w-full">
                    {schedule.map((s, i) => (
                      <ScheduleLineItem
                        key={s.num}
                        num={s.num}
                        label={s.label}
                        amount={amounts[i]}
                        due={s.due}
                        variant="desktop"
                      />
                    ))}
                  </div>
                )}
              </div>
              <ScrollHintArrows targetRef={modalScrollRef} topInset={6} bottomInset={6} />
            </div>
          </div>

          {/* Right column — monthly payment estimation. Hidden when
              financing is excluded. */}
          {!financingExcluded && (
          <div
            className="flex flex-col gap-4 xl:gap-6 2xl:gap-8 items-start p-6 xl:p-8 2xl:p-10 min-w-0"
            style={{
              flex: '4 1 0',
              borderLeft: '0.5px solid rgba(0,0,0,0.1)',
              background: '#fafafa',
            }}
          >
            {/* Header row with X */}
            <div className="flex items-start justify-between w-full">
              <p className="text-[12px] xl:text-[14px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal whitespace-nowrap">
                Revised Monthly Payment Estimation
              </p>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="bg-transparent border-0 cursor-pointer p-0 flex items-center justify-center"
                style={{ width: 16, height: 16 }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Loan / Term / APR rows — gap scale mirrors the Make Payment
                summary column so both surfaces breathe the same way across
                xl / 2xl breakpoints. */}
            <div className="flex flex-col gap-2 xl:gap-3 2xl:gap-4 items-start w-full">
              <SummaryRow label="Loan Amount" value={fmtMoney0(last.loanAmount)} />
              <SummaryRow label="Term" value={`${last.termMonths} months`} />
              <SummaryRow label="APR" value={`${last.apr}%`} />
            </div>

            {/* Divider + Monthly Payment row */}
            <div
              className="flex items-center justify-between w-full pt-4"
              style={{ borderTop: '0.5px solid rgba(0,0,0,0.15)' }}
            >
              <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal whitespace-nowrap">
                Monthly Payment
              </p>
              <p className="text-[16px] xl:text-[18px] 2xl:text-[20px] font-semibold text-[#262626] leading-normal whitespace-nowrap">
                {fmtMoney2(last.monthly)} / mo
              </p>
            </div>

            {/* Disclaimer — typography mirrors the Make Payment dialog's
                authorization paragraph (10px / 12px at xl+, leading-normal,
                default weight) so the two summary surfaces read identically. */}
            <p className="text-[10px] xl:text-[12px] text-[#737373] leading-normal">
              Any monthly payment information shown is an estimate only and is not a financing offer.
              Final payment amounts, interest rates, and loan terms are subject to lender review and will be
              confirmed during the formal application process.
            </p>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
