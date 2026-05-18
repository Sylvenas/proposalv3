'use client';

// ── PricingDisclaimers ────────────────────────────────────────────────────────
// Collapsible "①②" footnote block shown at the bottom of the Summary panel
// (regular proposal) and the Change Order summary panel.
//
// Behavior:
//   Collapsed (default) — single-line truncated note ① with an inline
//     "Read more" link.
//   Expanded            — full ① and ② paragraphs with a "Show less" link.
//
// Sharing this block between Summary and Change Order keeps the truncate
// rule, font sizes, link styling, and copy text in one place.

import { useState } from 'react';

export default function PricingDisclaimers() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-start pt-6 w-full">
      {expanded ? (
        <div className="flex flex-col gap-3 items-start w-full">
          <p
            className="text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px]"
            style={{ fontWeight: 300 }}
          >
            <span style={{ fontSize: 7.74 }}>1 </span>
            Total project pricing is subject to change based on applicable taxes, fees, payment timing,
            and any final project adjustments. The final amount presented at the time of payment will control.
          </p>
          <p
            className="text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px]"
            style={{ fontWeight: 300 }}
          >
            <span style={{ fontSize: 7.74 }}>2 </span>
            Any monthly payment information shown is an estimate only and is not a financing offer.
            Final payment amounts, interest rates, and loan terms are subject to lender review and will
            be confirmed during the formal application process.
          </p>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="bg-transparent border-0 p-0 cursor-pointer text-[12px] text-[rgba(0,0,0,0.85)] text-center"
          >
            <span className="underline leading-normal" style={{ textDecorationSkipInk: 'none' }}>
              Show less
            </span>
          </button>
        </div>
      ) : (
        <div className="flex gap-3 items-start w-full">
          <p
            className="flex-[1_0_0] min-w-0 text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px] overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ fontWeight: 300 }}
          >
            <span style={{ fontSize: 7.74 }}>1 </span>
            Total project pricing is subject to change based on applicable taxes, fees, payment timing,
            and any final project adjustments. The final amount presented at the time of payment will control.
          </p>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 bg-transparent border-0 p-0 cursor-pointer flex flex-col justify-center text-[12px] text-[rgba(0,0,0,0.85)] text-center"
          >
            <span className="underline leading-normal" style={{ textDecorationSkipInk: 'none' }}>
              Read more
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
