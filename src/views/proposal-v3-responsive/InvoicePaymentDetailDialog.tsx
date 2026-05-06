'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect on the server is a noop and triggers a warning during SSR;
// fall back to useEffect for the SSR pass to keep the console clean. The
// dialog's measurements only matter once the browser has laid out, so this
// fallback never affects the actual animation.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ─── Types ───────────────────────────────────────────────────────────────────
type InvoiceStatus = 'paid' | 'partial' | 'unpaid';

export type InvoiceDetail = {
  number: number;
  label: string;          // e.g. 'Deposit (20%)'
  itemName: string;       // e.g. 'Henderson Backyard Fence'
  status: InvoiceStatus;
  amount: number;
  received: number;
  dueDate: string;
  /** Payments that landed against this invoice (newest first). Each entry
   *  is the slice of a parent payment that was applied to this invoice —
   *  one parent payment can produce multiple entries across invoices. */
  payments: { paymentId: string; paidOn: string; amount: number }[];
};

export type PaymentDetail = {
  paymentId: string;
  paidOnFull: string;     // 'Mar 23, 2025, 9:43:33 p.m.'
  /** Money applied against invoices (sum of appliedTo). */
  amountApplied: number;
  /** Platform processing fee. 0 for cash/check. */
  platformFee: number;
  /** Total the user paid = amountApplied + platformFee. */
  amountPaid: number;
  processedWith: string;  // 'ArcSite Payment'
  method: string;
  paidBy: string;
  appliedTo: { amount: number; invoiceNumber: number; invoiceLabel: string }[];
};

export type DetailContent =
  | { type: 'invoice'; invoice: InvoiceDetail }
  | { type: 'payment'; record: PaymentDetail };

// ─── Status palette ──────────────────────────────────────────────────────────
const STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid:    'PAID',
  partial: 'PARTIALLY PAID',
  unpaid:  'UNPAID',
};

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  paid:    '#04b50b',
  partial: '#398ae7',
  unpaid:  '#737373',
};

// ─── Format helpers ──────────────────────────────────────────────────────────
function fmtDollars(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

// ─── Animation tuning ────────────────────────────────────────────────────────
const ANIM_MS = 280;
const EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN  = 'cubic-bezier(0.4, 0, 1, 1)';
// Cross-content swap (e.g. clicking (#1091) inside an invoice). The new
// content slides in from the right edge while fading in, and the modal box
// transitions its height (FLIP) so the swap reads as a navigation step.
// Held a touch longer than the open/close animation so the height growth is
// readable, and only triggered on actual content swaps — never on the
// initial open of the dialog.
const SWAP_MS = 460;
const SWAP_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

// ─── Inline icons (no external SVG asset for credit card / arrow-right) ──────
function CreditCardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 16) / 20}
      viewBox="0 0 20 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="1" y="1" width="18" height="14" rx="2" stroke="rgba(0,0,0,0.85)" strokeWidth="1.2" />
      <line x1="1" y1="5.5" x2="19" y2="5.5" stroke="rgba(0,0,0,0.85)" strokeWidth="1.2" />
      <rect x="3" y="9" width="4" height="3" rx="0.5" stroke="rgba(0,0,0,0.85)" strokeWidth="1" />
    </svg>
  );
}

function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ size = 16, rotated = false }: { size?: number; rotated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
      }}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 3L13 13M13 3L3 13"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M3 3.5C3 2.67157 3.67157 2 4.5 2H5.78L7 5L5.5 6C6.16 7.5 7.5 8.84 9 9.5L10 8L13 9.22V10.5C13 11.3284 12.3284 12 11.5 12C7.27 12 3 7.73 3 3.5Z"
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Field row (label + value) ───────────────────────────────────────────────
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal whitespace-nowrap">
        {label}
      </p>
      <div className="text-[#262626] leading-normal w-full">{children}</div>
    </div>
  );
}

// ─── Outline / primary buttons ───────────────────────────────────────────────
function OutlineButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-solid border-[#262626] flex items-center justify-center gap-[6px] h-10 px-4 rounded-[4px] w-full cursor-pointer"
    >
      <span
        className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
        style={{ lineHeight: '18px' }}
      >
        {children}
      </span>
    </button>
  );
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#d41a32] border-0 flex items-center justify-center h-10 px-4 rounded-[4px] w-full cursor-pointer"
    >
      <span
        className="text-[14px] font-semibold text-white text-center whitespace-nowrap"
        style={{ lineHeight: '18px' }}
      >
        {children}
      </span>
    </button>
  );
}

// ─── Invoice content ─────────────────────────────────────────────────────────
function InvoiceContent({
  invoice,
  onOpenPayment,
}: {
  invoice: InvoiceDetail;
  onOpenPayment?: (paymentId: string) => void;
}) {
  const remaining = Math.max(0, invoice.amount - invoice.received);
  const [showRecords, setShowRecords] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header — invoice #, item label, project name */}
      <div className="flex flex-col gap-1 w-full">
        <p className="text-[10px] sm:text-[12px] font-semibold text-[#737373] tracking-[0.5px] uppercase leading-normal">
          INVOICE #{invoice.number}
        </p>
        <p className="text-[16px] sm:text-[18px] font-semibold text-[#262626] leading-normal">
          {invoice.label}
        </p>
        <p className="text-[14px] sm:text-[16px] text-[#262626] leading-normal">
          {invoice.itemName}
        </p>
      </div>

      <FieldRow label="Status">
        <span className="text-[14px] sm:text-[16px] font-semibold" style={{ color: STATUS_COLOR[invoice.status] }}>
          {STATUS_LABEL[invoice.status]}
        </span>
      </FieldRow>

      <FieldRow label="Invoice Amount">
        <p className="text-[20px] sm:text-[24px] font-semibold text-[#262626]">
          {fmtDollars(invoice.amount)}
        </p>
      </FieldRow>

      <FieldRow label="Paid Amount Total">
        <p
          className="text-[20px] sm:text-[24px] font-semibold"
          style={{ color: invoice.received > 0 ? '#04b50b' : '#737373' }}
        >
          {fmtDollars(invoice.received)}
        </p>
      </FieldRow>

      {invoice.status !== 'paid' && (
        <FieldRow label="Amount Remaining">
          <p className="text-[20px] sm:text-[24px] font-semibold" style={{ color: '#398ae7' }}>
            {fmtDollars(remaining)}
          </p>
        </FieldRow>
      )}

      {/* Show Invoice Payment Records — one-shot reveal. The link only
          renders while collapsed; clicking replaces it with the section
          ("Invoice Payment Records" label + per-payment slice list). UNPAID
          invoices have nothing to show, so neither surface renders. */}
      {invoice.received > 0 && invoice.payments.length > 0 && (
        <>
          {!showRecords && (
            <button
              type="button"
              onClick={() => setShowRecords(true)}
              className="bg-transparent border-0 flex items-center gap-2 px-0 py-1 cursor-pointer self-start"
            >
              <CreditCardIcon size={20} />
              <span
                className="text-[14px] text-[rgba(0,0,0,0.85)] whitespace-nowrap"
                style={{ lineHeight: '18px' }}
              >
                Show Invoice Payment Records
              </span>
            </button>
          )}

          {showRecords && (
            // Grid trick: animating grid-template-rows from 0fr → 1fr is the
            // modern way to transition to the row's intrinsic height. The
            // inner div uses min-height:0 + overflow:hidden so the content
            // clips while the row size is below its natural value.
            <div
              className="w-full"
              style={{
                display: 'grid',
                animation: 'detailExpandDown 320ms cubic-bezier(0.32, 0.72, 0, 1) both',
              }}
            >
              <div style={{ minHeight: 0, overflow: 'hidden' }}>
                <FieldRow label="Invoice Payment Records">
                  <div className="flex flex-col gap-2 w-full">
                    {invoice.payments.map((p) => (
                      <p
                        key={p.paymentId}
                        className="text-[14px] sm:text-[16px] leading-normal"
                      >
                        <span style={{ color: '#04b50b' }} className="font-semibold">
                          {fmtDollars(p.amount)}
                        </span>
                        <span className="text-[#262626]">{' '}Paid on {p.paidOn} </span>
                        {onOpenPayment ? (
                          <button
                            type="button"
                            onClick={() => onOpenPayment(p.paymentId)}
                            className="bg-transparent border-0 p-0 cursor-pointer text-[#737373] hover:text-[#262626] transition-colors"
                            style={{ font: 'inherit' }}
                          >
                            (#{p.paymentId})
                          </button>
                        ) : (
                          <span className="text-[#737373]">(#{p.paymentId})</span>
                        )}
                      </p>
                    ))}
                  </div>
                </FieldRow>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Payment record content ──────────────────────────────────────────────────
function PaymentContent({
  record,
  onOpenInvoice,
}: {
  record: PaymentDetail;
  onOpenInvoice?: (invoiceNumber: number) => void;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <FieldRow label="Payment ID">
        <p className="text-[16px] sm:text-[18px] text-[#262626] leading-normal">
          {record.paymentId}
        </p>
      </FieldRow>

      <div className="flex flex-col gap-1 w-full">
        <p className="text-[14px] sm:text-[16px] text-[#262626] leading-normal">
          Payment Made On
        </p>
        <p className="text-[16px] sm:text-[18px] text-[#262626] leading-normal">
          {record.paidOnFull}
        </p>
      </div>

      <FieldRow label="Amount Paid">
        <p className="text-[20px] sm:text-[24px] font-semibold" style={{ color: '#04b50b' }}>
          {fmtDollars(record.amountPaid)}
        </p>
        {/* Breakdown — Amount Applied is always present; Platform Fee
            only when there's a non-zero processing fee. A green vertical
            bar on the left visually ties the breakdown back to the
            Amount Paid total above. */}
        <div
          className="flex flex-col gap-1 mt-3 pl-4 text-[14px] sm:text-[16px] leading-normal"
          style={{ borderLeft: '2px solid #04b50b' }}
        >
          <p className="text-[#262626]">
            <span className="font-semibold">{fmtDollars(record.amountApplied)}</span>
            <span className="text-[#737373]">{'  -  '}</span>
            Amount Applied
          </p>
          {record.platformFee > 0 && (
            <p className="text-[#262626]">
              <span className="font-semibold">{fmtDollars(record.platformFee)}</span>
              <span className="text-[#737373]">{'  -  '}</span>
              Platform Fee ({Math.round((record.platformFee / record.amountApplied) * 100)}%)
            </p>
          )}
        </div>
      </FieldRow>

      <FieldRow label="Processed With">
        <p className="text-[14px] sm:text-[16px] text-[#262626] leading-normal">
          {record.processedWith}
        </p>
      </FieldRow>

      <FieldRow label="Payment Method">
        <p className="text-[14px] sm:text-[16px] text-[#262626] leading-normal">
          {record.method}
        </p>
      </FieldRow>

      <FieldRow label="Paid By">
        <p className="text-[14px] sm:text-[16px] text-[#262626] leading-normal">
          {record.paidBy}
        </p>
      </FieldRow>

      <FieldRow label="Applied to Invoice">
        <div className="flex flex-col gap-2 w-full">
          {record.appliedTo.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-[14px] sm:text-[16px] leading-normal">
              <span style={{ color: '#04b50b' }} className="font-semibold">
                {fmtDollars(entry.amount)}
              </span>
              <ArrowRightIcon size={16} />
              {onOpenInvoice ? (
                <button
                  type="button"
                  onClick={() => onOpenInvoice(entry.invoiceNumber)}
                  className="bg-transparent border-0 p-0 cursor-pointer text-[#262626] hover:text-[#737373] transition-colors text-left"
                  style={{ font: 'inherit' }}
                >
                  {entry.invoiceLabel}
                </button>
              ) : (
                <span className="text-[#262626]">{entry.invoiceLabel}</span>
              )}
            </div>
          ))}
        </div>
      </FieldRow>
    </div>
  );
}

// ─── Main dialog ─────────────────────────────────────────────────────────────
//
// Renders nothing when `content` is null. When `content` becomes non-null:
//   • mounts the backdrop + container in DOM
//   • next frame, flips `open=true` → CSS transitions slide/scale into view
// On close, `open=false` first (animations play), then unmount after ANIM_MS.
//
// XS / S / M (lg:hidden):  bottom sheet sliding up from the bottom edge.
// L+ (hidden lg:flex):     centered modal scaling in from 96%.
export default function InvoicePaymentDetailDialog({
  content,
  onClose,
  onMakePayment,
  onOpenPayment,
  onOpenInvoice,
}: {
  content: DetailContent | null;
  onClose: () => void;
  onMakePayment?: () => void;
  /** Optional: when provided, the (#paymentId) tokens inside an invoice's
   *  expanded payment-records list become clickable and call this with the
   *  selected payment id. The host swaps the dialog content. */
  onOpenPayment?: (paymentId: string) => void;
  /** Optional: when provided, the invoice rows inside a payment's "Applied
   *  to Invoice" section become clickable and call this with the selected
   *  invoice number. The host swaps the dialog content. */
  onOpenInvoice?: (invoiceNumber: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  // Last non-null content kept around so the dialog can keep rendering while
  // it animates out (after the parent sets content back to null).
  const [last, setLast]       = useState<DetailContent | null>(null);
  // Outgoing content kept rendered as an overlay during a swap so we can
  // animate the previous panel sliding off the left while the new panel
  // slides in from the right. Cleared after SWAP_MS.
  const [outgoing, setOutgoing] = useState<DetailContent | null>(null);
  // Mirror of `last` accessed from the open-effect without listing `last` in
  // its deps (which would cause an infinite loop). Reading the ref lets us
  // capture the previous panel as `outgoing` and update `last` in the same
  // batch so the next render already has both states aligned.
  const lastRef = useRef<DetailContent | null>(null);
  useEffect(() => { lastRef.current = last; }, [last]);

  useEffect(() => {
    if (content) {
      const prev = lastRef.current;
      // Only treat the new content as a *swap* (which animates an outgoing
      // panel sliding off-left) when the dialog was already open. A fresh
      // open from closed state must not surface a stale `lastRef` as outgoing
      // — otherwise the previous session's content briefly flashes back in.
      if (mounted && prev !== null && prev !== content) {
        setOutgoing(prev);
      }
      setLast(content);
      setMounted(true);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setOpen(true));
        // Stash so we can cancel on unmount
        (r1 as unknown as { _r2: number })._r2 = r2;
      });
      return () => cancelAnimationFrame(r1);
    }
    if (!mounted) return;
    setOpen(false);
    const t = window.setTimeout(() => {
      setMounted(false);
    }, ANIM_MS);
    return () => window.clearTimeout(t);
  }, [content, mounted]);

  // Clear the outgoing overlay once the swap animation is done. Each new
  // outgoing snapshot starts a fresh timer so consecutive swaps don't strand
  // an old overlay on screen.
  useEffect(() => {
    if (!outgoing) return;
    const t = window.setTimeout(() => setOutgoing(null), SWAP_MS);
    return () => window.clearTimeout(t);
  }, [outgoing]);

  // Body scroll lock while open
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Esc to close
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  // Stable identifier of the currently-rendered content. When this changes
  // (e.g. invoice → payment via the (#xxxx) link) the keyed wrapper unmounts
  // and remounts, replaying the slide-in animation. The modal/sheet box
  // simultaneously transitions its height to fit the new content.
  // Falls back to a placeholder while `last` is null so this hook ordering
  // stays stable across renders (rules of hooks).
  const contentKey = last
    ? last.type === 'invoice'
      ? `inv-${last.invoice.number}`
      : `pay-${last.record.paymentId}`
    : 'none';

  // Distinguish "first content render after the dialog opened" (no swap
  // animation) from "content changed while already open" (swap animation).
  // The ref is reset to null whenever the dialog is unmounted, so the next
  // open is treated as initial again.
  const prevKeyRef = useRef<string | null>(null);
  const isSwap =
    mounted &&
    prevKeyRef.current !== null &&
    prevKeyRef.current !== contentKey;

  // FLIP-style height animation across content swaps.
  //
  // `height: auto` doesn't transition when only the resolved size changes
  // (the property value never changes). On every content *swap* we:
  //   1. measure the box's new natural height (DOM already has new content)
  //   2. snap the box back to the *previous* height with transition disabled
  //   3. force reflow, then re-enable the transition and target the new height
  //   4. clear the inline overrides once the transition finishes
  // To avoid a scrollbar flickering on/off as the box height grows past the
  // content's natural size, we also pin the scroll area to overflow:hidden
  // for the duration of the transition.
  const sheetRef   = useRef<HTMLDivElement>(null);
  const modalRef   = useRef<HTMLDivElement>(null);
  const lastSheetH = useRef<number>(0);
  const lastModalH = useRef<number>(0);
  // True for the duration of a swap. Drives `overflow: hidden` on the scroll
  // areas so a scrollbar doesn't briefly appear while the box grows past the
  // content's intrinsic height (and vice versa).
  const [swapping, setSwapping] = useState(false);
  // True for a short window after the user actively scrolls a content area.
  // Drives the `is-scrolling` class so the auto-hiding scrollbar thumb fades
  // in only while scrolling, never on plain hover.
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollHideTimerRef = useRef<number | null>(null);
  const onScroll = () => {
    setIsScrolling(true);
    if (scrollHideTimerRef.current !== null) {
      window.clearTimeout(scrollHideTimerRef.current);
    }
    scrollHideTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollHideTimerRef.current = null;
    }, 700);
  };

  useIsoLayoutEffect(() => {
    // Update the prev-key tracker every render. Reset to null when the dialog
    // is unmounted so re-opening doesn't read stale state.
    if (mounted) {
      prevKeyRef.current = contentKey;
    } else {
      prevKeyRef.current = null;
      lastSheetH.current = 0;
      lastModalH.current = 0;
      return;
    }

    const cleanups: Array<() => void> = [];
    let didAnimate = false;

    const animate = (
      el: HTMLDivElement | null,
      lastRef: { current: number },
    ) => {
      if (!el) return;
      const newH = el.offsetHeight;
      const oldH = lastRef.current;
      lastRef.current = newH;
      // First run for this open, or unchanged size — nothing to do.
      if (oldH === 0 || oldH === newH) return;

      didAnimate = true;
      const prevTransition = el.style.transition;

      el.style.transition = 'none';
      el.style.height = `${oldH}px`;
      void el.offsetHeight; // force a reflow before the second update
      el.style.transition = `${prevTransition}, height ${SWAP_MS}ms ${SWAP_EASE}`;
      el.style.height = `${newH}px`;

      const t = window.setTimeout(() => {
        el.style.height = '';
        el.style.transition = prevTransition;
      }, SWAP_MS + 40);
      cleanups.push(() => window.clearTimeout(t));
    };

    animate(sheetRef.current, lastSheetH);
    animate(modalRef.current, lastModalH);

    if (didAnimate) {
      setSwapping(true);
      const tOverflow = window.setTimeout(() => setSwapping(false), SWAP_MS + 40);
      cleanups.push(() => window.clearTimeout(tOverflow));
    }

    return () => {
      cleanups.forEach((c) => c());
    };
  }, [contentKey, mounted]);

  if (!mounted || !last) return null;

  // Footer actions split by surface:
  //   `actionsFor(c)`  → contextual actions (Make A Payment / Contact Sales)
  //   mobile sheet adds a trailing "Close" outline button
  //   desktop modal omits "Close" (the X icon in the top-right handles dismiss)
  // Computed per content so an outgoing (sliding-out) panel keeps its own
  // footer for the duration of the swap.
  const actionsFor = (c: DetailContent): React.ReactNode => {
    if (c.type === 'payment') {
      return (
        <OutlineButton onClick={() => { /* prototype no-op */ }}>
          <span className="flex items-center gap-[6px]">
            <PhoneIcon size={16} />
            Contact Sales
          </span>
        </OutlineButton>
      );
    }
    if (c.invoice.status === 'paid') return null;
    if (onMakePayment) {
      return <PrimaryButton onClick={onMakePayment}>Make A Payment</PrimaryButton>;
    }
    // Not payable yet (sequential rule). Show explanatory note + disabled
    // Make A Payment button with a lock icon so the affordance stays
    // visible but clearly inactive.
    return (
      <>
        <p className="text-[12px] sm:text-[14px] xl:text-[14px] text-[#737373] italic leading-normal">
          Pay previous invoices first to proceed with this invoice.
        </p>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="bg-[#f0f0f0] border-0 flex items-center justify-center gap-[6px] h-10 px-4 rounded-[4px] w-full cursor-not-allowed text-[#737373]"
        >
          <LockIcon size={16} />
          <span
            className="text-[14px] font-semibold text-center whitespace-nowrap"
            style={{ lineHeight: '18px' }}
          >
            Make A Payment
          </span>
        </button>
      </>
    );
  };
  const actionButtons       = actionsFor(last);
  const desktopHasFooter    = actionButtons !== null;
  const outgoingActions     = outgoing ? actionsFor(outgoing) : null;
  const outgoingHasFooter   = outgoingActions !== null;

  return (
    <>
      {/* Cross-content swap keyframes. Forward navigation feel:
          • the previous panel slides out to the LEFT (translateX 0 → -100%)
          • the new panel slides in from the RIGHT (translateX 100% → 0)
          • both fade slightly to soften the cross-fade. */}
      <style>{`
        @keyframes detailSwapInRight {
          0%   { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0);    opacity: 1; }
        }
        @keyframes detailSwapOutLeft {
          0%   { transform: translateX(0);     opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        /* Reveal animation for the "Show Invoice Payment Records" section.
           grid-template-rows transitions between 0fr (collapsed, fully
           clipped by the inner overflow:hidden) and 1fr (expanded, content
           takes its natural height) — the modern way to animate height:auto. */
        @keyframes detailExpandDown {
          0%   { grid-template-rows: 0fr; opacity: 0; }
          100% { grid-template-rows: 1fr; opacity: 1; }
        }
        /* Auto-hiding scrollbar for the dialog's scroll areas. Default:
           track + thumb are transparent (scrollbar invisible). While the
           user is actively scrolling, the JS-driven is-scrolling class
           fades the thumb in. Hover alone never reveals the scrollbar.
           Native up/down buttons are removed via display:none. */
        .detail-scroll {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .detail-scroll.is-scrolling {
          scrollbar-color: rgba(0, 0, 0, 0.28) transparent;
        }
        .detail-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .detail-scroll::-webkit-scrollbar-track { background: transparent; }
        .detail-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 3px;
          transition: background-color 200ms ease;
        }
        .detail-scroll.is-scrolling::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.28);
        }
        .detail-scroll.is-scrolling::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.45);
        }
        .detail-scroll::-webkit-scrollbar-button { display: none; }
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

      {/* ── Mobile (XS/S/M) — bottom sheet ─────────────────────────────────
          `interpolate-size: allow-keywords` (Chromium 129+) lets `height`
          animate from one auto-sized layout to the next, so the sheet
          smoothly grows/shrinks as content swaps. Older browsers just
          snap, but the slide-in animation keeps the swap perceptible. */}
      <div
        ref={sheetRef}
        className="lg:hidden fixed left-0 right-0 bottom-0 z-[81] bg-white flex flex-col overflow-hidden"
        style={{
          fontFamily: 'Segoe UI, sans-serif',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '90vh',
          boxShadow: '0px -4px 24px rgba(0,0,0,0.18)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: open
            ? `transform ${ANIM_MS}ms ${EASE_OUT}`
            : `transform ${ANIM_MS}ms ${EASE_IN}`,
        }}
      >
        {/* Drag handle (static — sits outside the keyed swap wrapper) */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="rounded-full bg-[#d9d9d9]" style={{ width: 36, height: 4 }} />
        </div>

        {/* Swap stage — `relative` so the absolutely-positioned outgoing
            overlay lays on top of the in-flow incoming. Sized by the
            in-flow incoming's natural height. `flex-1 min-h-0` lets the
            scroll area inside still shrink/scroll when content > maxHeight. */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* Incoming (current `last`) — in flow, slides in from the right
              on a swap; on initial open it just appears (no animation). */}
          <div
            key={`in-${contentKey}`}
            className="flex flex-col flex-1 min-h-0"
            style={{
              animation: outgoing
                ? `detailSwapInRight ${SWAP_MS}ms ${SWAP_EASE} both`
                : 'none',
            }}
          >
            {/* Scrollable content */}
            <div
              data-swap-scroll
              onScroll={onScroll}
              className={`detail-scroll flex-1 min-h-0 px-4 sm:px-6 pt-6${isScrolling ? ' is-scrolling' : ''}`}
              style={{ overflowY: swapping ? 'hidden' : 'auto' }}
            >
              {last.type === 'invoice' ? (
                <InvoiceContent invoice={last.invoice} onOpenPayment={onOpenPayment} />
              ) : (
                <PaymentContent record={last.record} onOpenInvoice={onOpenInvoice} />
              )}
            </div>

            {/* Footer actions — separated from content by spacing only (no rule) */}
            <div className="flex flex-col gap-3 px-4 sm:px-6 pt-10 sm:pt-12 pb-6 shrink-0">
              {actionButtons}
              <OutlineButton onClick={onClose}>Close</OutlineButton>
            </div>
          </div>

          {/* Outgoing (previous `last` snapshot) — absolutely positioned
              overlay that slides off to the left while the incoming slides in.
              Pointer events disabled so clicks fall through to incoming. */}
          {outgoing && (
            <div
              className="absolute inset-0 flex flex-col bg-white pointer-events-none"
              style={{
                animation: `detailSwapOutLeft ${SWAP_MS}ms ${SWAP_EASE} both`,
              }}
            >
              <div className="flex-1 min-h-0 px-4 sm:px-6 pt-6 overflow-hidden">
                {outgoing.type === 'invoice' ? (
                  <InvoiceContent invoice={outgoing.invoice} />
                ) : (
                  <PaymentContent record={outgoing.record} />
                )}
              </div>
              <div className="flex flex-col gap-3 px-4 sm:px-6 pt-10 sm:pt-12 pb-6 shrink-0">
                {outgoingActions}
                <OutlineButton onClick={onClose}>Close</OutlineButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop (L+) — centered modal ──────────────────────────────────
          • [X] close button anchored top-right
          • Footer (when present) separated from content by spacing only — no rule
          • For PAID invoice (no actionButtons) the footer is omitted entirely;
            modal just has bottom padding instead. */}
      <div
        className="hidden lg:flex fixed inset-0 z-[81] items-center justify-center pointer-events-none"
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        <div
          ref={modalRef}
          className="bg-white flex flex-col pointer-events-auto relative"
          style={{
            width: 520,
            maxHeight: '85vh',
            borderRadius: 16,
            boxShadow: '0px 8px 32px rgba(0,0,0,0.24), 0px 2px 8px rgba(0,0,0,0.12)',
            transform: open ? 'scale(1)' : 'scale(0.96)',
            opacity: open ? 1 : 0,
            transition: open
              ? `transform ${ANIM_MS}ms ${EASE_OUT}, opacity ${ANIM_MS}ms ${EASE_OUT}`
              : `transform ${ANIM_MS}ms ${EASE_IN}, opacity ${ANIM_MS}ms ${EASE_IN}`,
          }}
        >
          {/* Top-right close button — the icon's top edge aligns with the
              scroll area's top (y=32 from modal top). The button is 32×32
              for a comfortable click target; the icon is centered inside,
              so we offset the button up by half its padding (8px) so the
              icon top lands at y=32 (button top: 24, icon top: 32). */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute z-10 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-[4px] hover:bg-[rgba(0,0,0,0.04)]"
            style={{ top: 24, right: 32, width: 32, height: 32 }}
          >
            <CloseIcon size={16} />
          </button>

          {/* Swap stage — overflow:hidden clips the panels as they slide
              past the modal's edges. */}
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Incoming (current `last`) — in flow, slides in from the right
                on a swap; on initial open just appears (modal scale+fade
                handles the first reveal). */}
            <div
              key={`in-${contentKey}`}
              className="flex flex-col flex-1 min-h-0"
              style={{
                animation: outgoing
                  ? `detailSwapInRight ${SWAP_MS}ms ${SWAP_EASE} both`
                  : 'none',
              }}
            >
              {/* Scrollable content.
                  • marginTop: 32 puts the content top at the same y as the
                    [X] icon's top (y=32 from modal top) so the icon
                    aligns flush with the first row of content.
                  • marginRight: 16 keeps the scrollbar inside the modal's
                    rounded corner.
                  • paddingRight: 64 + marginRight: 16 → 80px right
                    clearance so first-row text never tucks under the [X].
                    The scrollbar itself (6px wide) sits 10px to the right
                    of the X button, so they don't visually collide. */}
              <div
                data-swap-scroll
                onScroll={onScroll}
                className={`detail-scroll flex-1 min-h-0 pl-8${isScrolling ? ' is-scrolling' : ''}`}
                style={{
                  marginTop: 32,
                  paddingRight: 64,
                  marginRight: 16,
                  paddingBottom: desktopHasFooter ? 0 : 32,
                  overflowY: swapping ? 'hidden' : 'auto',
                }}
              >
                {last.type === 'invoice' ? (
                  <InvoiceContent invoice={last.invoice} onOpenPayment={onOpenPayment} />
                ) : (
                  <PaymentContent record={last.record} onOpenInvoice={onOpenInvoice} />
                )}
              </div>

              {/* Footer actions — only rendered when there's a contextual
                  action. Separated from content by 48px of breathing room
                  (no border). */}
              {desktopHasFooter && (
                <div className="flex flex-col gap-3 px-8 pt-12 pb-8 shrink-0">
                  {actionButtons}
                </div>
              )}
            </div>

            {/* Outgoing (previous `last` snapshot) — absolute overlay that
                slides off to the left. Pointer events disabled so clicks
                fall through to incoming. */}
            {outgoing && (
              <div
                className="absolute inset-0 flex flex-col bg-white pointer-events-none"
                style={{
                  animation: `detailSwapOutLeft ${SWAP_MS}ms ${SWAP_EASE} both`,
                }}
              >
                <div
                  className="flex-1 min-h-0 pl-8 pt-8 overflow-hidden"
                  style={{
                    paddingRight: 80,
                    paddingBottom: outgoingHasFooter ? 0 : 32,
                  }}
                >
                  {outgoing.type === 'invoice' ? (
                    <InvoiceContent invoice={outgoing.invoice} />
                  ) : (
                    <PaymentContent record={outgoing.record} />
                  )}
                </div>
                {outgoingHasFooter && (
                  <div className="flex flex-col gap-3 px-8 pt-12 pb-8 shrink-0">
                    {outgoingActions}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
