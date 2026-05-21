'use client';

import { useEffect, useRef, useState } from 'react';
import { ContactSalesButton } from './SummaryPageResponsive';

// ── Overpaid Sticky Footer ───────────────────────────────────────────────────
// Mobile (lg:hidden) sticky footer shown on the Change Order Project Hub's
// Invoices & Payments tab when the existing payment is Over Paid AND the
// change order has been approved. Forked from ContractDocStickyFooter so
// future copy / layout tweaks specific to the overpaid flow can be made
// here in isolation, without touching the Contract Document tab's footer
// or the pre-approval pending-CO footer (which both still live in
// ContractDocSection.tsx).
//
// Behavior:
//   • Primary button is the shared ContactSalesButton (phone icon + label;
//     opens the standard ContactSalesModal). The overpaid flow surfaces
//     "talk to a person about a refund" as the natural next step.
//   • Collapsed: a truncated overpaid-alert line — "This contract has been
//     overpaid by $X.", with the dollar phrase in the orange refund palette.
//     Tapping "Read more" expands a longer guidance sentence.
//   • Reports its rendered height to the parent so sticky floating siblings
//     can track it as Read more grows the panel.
export function OverpaidStickyFooter({
  refundAmount,
  onHeightChange,
  topAction,
  visible = true,
  expandedDescription,
}: {
  /** The overpaid amount as a formatted string (e.g., "$999"). Rendered
   *  inside the collapsed alert line in the orange refund palette. */
  refundAmount: string;
  onHeightChange: (height: number) => void;
  /** Optional override for the primary button slot. When provided, replaces
   *  the default ContactSalesButton. */
  topAction?: React.ReactNode;
  /** When false, the footer slides off-screen via translateY. Defaults to
   *  true (always shown). */
  visible?: boolean;
  /** Optional override for the long guidance sentence shown after "Read
   *  more". Defaults to the standard refund-request copy. */
  expandedDescription?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Report the footer's rendered height to the parent so sticky floating
  // siblings (view controls, Back-to-Top clearance) can track it as it grows
  // when "Read more" expands the panel.
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const report = () => onHeightChange(el.getBoundingClientRect().height);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange]);

  return (
    <div
      ref={ref}
      // z-51 keeps this above any sibling ProjectHubStickyFooter (z-50) so
      // their box-shadow halos don't bleed onto this surface when they
      // translate off-screen.
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[51] bg-white flex flex-col gap-4 items-end justify-center p-4 sm:p-6 w-full"
      style={{
        boxShadow: '0px -4px 24px rgba(0,0,0,0.18)',
        fontFamily: 'Segoe UI, sans-serif',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s',
      }}
    >
      {topAction ?? <ContactSalesButton />}

      {/* Collapsed alert line — "This contract has been overpaid by $X." with
          the overpaid phrase in orange so the alert reads at a glance. The
          line truncates with an ellipsis when narrow; Read more expands the
          guidance paragraph below. */}
      <div className="flex gap-3 items-center w-full" style={{ minHeight: 32 }}>
        <p
          className={
            expanded
              ? 'flex-1 min-w-0 text-[12px] text-[#262626] leading-[1.5]'
              : 'flex-1 min-w-0 text-[12px] text-[#262626] leading-[1.5] overflow-hidden text-ellipsis whitespace-nowrap'
          }
          style={{ fontWeight: 350, letterSpacing: '-0.24px' }}
        >
          This contract has been{' '}
          <span style={{ color: '#f97316' }}>overpaid by {refundAmount}</span>.
        </p>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[12px] text-center underline whitespace-nowrap cursor-pointer border-0 bg-transparent p-0"
            style={{ color: 'rgba(0,0,0,0.85)' }}
          >
            Read more
          </button>
        )}
      </div>

      {/* Expanded guidance — appears BELOW the alert row, pushing downward.
          Standard copy directs the user to talk to a sales rep about a refund;
          a Show less affordance collapses the footer again. */}
      {expanded && (
        <>
          <p
            className="text-[12px] text-[#262626] leading-[1.5] w-full"
            style={{ fontWeight: 350, letterSpacing: '-0.24px' }}
          >
            {expandedDescription ?? (
              <>
                Please contact your sales representative to request a refund or
                get further assistance.
              </>
            )}
          </p>
          <div className="flex justify-end w-full">
            <button
              onClick={() => setExpanded(false)}
              className="text-[12px] text-center underline whitespace-nowrap cursor-pointer border-0 bg-transparent p-0"
              style={{ color: 'rgba(0,0,0,0.85)' }}
            >
              Show less
            </button>
          </div>
        </>
      )}
    </div>
  );
}
