'use client';

import { useEffect, useRef, useState } from 'react';
import BackToTopButton from './BackToTopButton';

// ── Asset paths ───────────────────────────────────────────────────────────────
// Same PDF pages shown in the signature flyout — this tab displays the
// contract PDF that the user signed in the signature step.
const BASE = '/images/proposal-v3-responsive';
const IMG_CONTRACT_P1 = `${BASE}/contract-page-1.png`;
const IMG_CONTRACT_P2 = `${BASE}/contract-page-2.png`;
const IMG_CONTRACT_P3 = `${BASE}/contract-page-3.png`;
const IMG_CONTRACT_P4 = `${BASE}/contract-page-4.png`;
const IMG_DOWNLOAD    = `${BASE}/download.svg`;
const IMG_ZOOM_IN     = `${BASE}/zoom-in.svg`;
const IMG_ZOOM_OUT    = `${BASE}/zoom-out.svg`;
const IMG_ZOOM_FIT    = `${BASE}/zoom-fit.svg`;

const PDF_PAGES: { src: string; ratio: string }[] = [
  { src: IMG_CONTRACT_P1, ratio: '2448/3168' },
  { src: IMG_CONTRACT_P2, ratio: '2193/2838' },
  { src: IMG_CONTRACT_P3, ratio: '1700/2200' },
  { src: IMG_CONTRACT_P4, ratio: '2487/4096' },
];

// ── Date formatting — M/D/YYYY ────────────────────────────────────────────────
function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// ── Zoom Button ──────────────────────────────────────────────────────────────
// Mirrors the Signature overlay's view-control button: 48×48 dark pill with a
// 24×24 white icon. Prototype — no onClick behavior yet.
function ZoomButton({ icon, alt }: { icon: string; alt: string }) {
  return (
    <button
      className="flex items-center justify-center rounded-[4px] shrink-0 cursor-pointer border-0"
      style={{
        width: 48,
        height: 48,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0px 0px 2px 0px rgba(0,0,0,0.25)',
      }}
    >
      <img src={icon} alt={alt} style={{ width: 24, height: 24 }} />
    </button>
  );
}

// ── Floating View Controls (anchored to the PDF column) ──────────────────────
// Sticky within the PDF column, pinned to the PDF viewer's bottom-left edge
// across every breakpoint. 0-height wrapper + `alignItems: flex-end` lets the
// buttons render ABOVE the wrapper line without taking flow space (so PDF
// pages aren't pushed down). Mobile `bottom` tracks the sticky footer height
// (which grows when "Read more" expands it); desktop pins 24px above viewport.
function ViewControls({ mobileBottomOffset }: { mobileBottomOffset: number }) {
  return (
    <div
      className="flex sticky z-20 pointer-events-none justify-start lg:!bottom-6"
      style={{ height: 0, alignItems: 'flex-end', bottom: mobileBottomOffset }}
    >
      <div className="flex gap-3 pointer-events-auto">
        <ZoomButton icon={IMG_ZOOM_IN} alt="Zoom in" />
        <ZoomButton icon={IMG_ZOOM_OUT} alt="Zoom out" />
        <ZoomButton icon={IMG_ZOOM_FIT} alt="Fit" />
      </div>
    </div>
  );
}

// ── Download Contract button (shared mobile footer + desktop sidebar) ─────────
function DownloadContractButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex gap-[2px] h-10 items-center justify-center px-4 py-1.5 relative rounded-[4px] shrink-0 w-full cursor-pointer bg-white border border-solid border-[#262626]"
    >
      <div className="flex items-center justify-center relative shrink-0 size-6">
        <img src={IMG_DOWNLOAD} alt="" style={{ width: 17, height: 18, display: 'block', flexShrink: 0 }} />
      </div>
      <span
        className="text-[14px] text-center whitespace-nowrap"
        style={{ fontFamily: 'Segoe UI, sans-serif', color: 'rgba(0,0,0,0.85)', lineHeight: '18px' }}
      >
        Download Contract [PDF]
      </span>
    </button>
  );
}

// ── PDF Pages list — used by both mobile and desktop layouts ──────────────────
function PdfPages() {
  return (
    <div className="flex flex-col gap-4 lg:gap-3 w-full">
      {PDF_PAGES.map((p, i) => (
        <div
          key={i}
          className="relative w-full border-[0.5px] border-[#d9d9d9] bg-white shrink-0"
          style={{ aspectRatio: p.ratio }}
        >
          <img
            src={p.src}
            alt={`Contract page ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </div>
      ))}
    </div>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────
// L+: occupies 4 of 12 grid columns, but the sidebar's inner content caps at
// 400px — the column stays 4/12 wide (dynamic with viewport), only the inner
// flex column stops growing past 400. Horizontal padding = gutter (12);
// gap=24 between items. Sticks just below the Project Hub tab bar so it stays
// pinned while the PDF column scrolls — matches the home tab's right column.
function AboutSidebar({ approvedAt }: { approvedAt: Date }) {
  return (
    <div
      className="hidden lg:flex flex-col gap-6 px-3 w-full lg:sticky lg:top-24 lg:self-start"
      style={{ maxWidth: 400, fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* All three lines use Font-S: L=14, XL/XXL=16. Title stays semibold. */}
      <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal font-semibold w-full">
        About This Document
      </p>
      <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal w-full">
        This contract was approved and signed on {formatDate(approvedAt)}
      </p>
      <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal w-full">
        This PDF is the executed contract associated with this project. It reflects
        the scope, pricing, and terms approved at the time of signing. Any later
        updates or approved changes may appear in the project record or change history.
      </p>
      <DownloadContractButton />
    </div>
  );
}

// ── Mobile sticky footer ──────────────────────────────────────────────────────
// XS: p=16, gap=16. S+: p=24. Shadow upward (mirrors Signature sticky bottom
// sheet — +y offsets negated so shadow falls UP over the content above).
// Collapsed: single-line date summary + "Read more" link.
// Expanded: full About This Document text (heading + date + long paragraph)
// above the Download button, with a "Show less" affordance to collapse.
function ContractDocStickyFooter({
  approvedAt,
  onHeightChange,
}: {
  approvedAt: Date;
  onHeightChange: (height: number) => void;
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white flex flex-col gap-4 items-end justify-center p-4 sm:p-6 w-full"
      style={{
        boxShadow: '0px -2px 4px 0px rgba(0,0,0,0.12), 0px -4px 24px 0px rgba(0,0,0,0.2)',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <DownloadContractButton />

      {/* About row — 12px date + Read more. Collapsed: single-line truncated.
          Expanded: date wraps to full length + Read more hides. */}
      <div className="flex gap-3 items-center w-full" style={{ minHeight: 32 }}>
        <p
          className={
            expanded
              ? 'flex-1 min-w-0 text-[12px] text-[#262626] leading-[1.5]'
              : 'flex-1 min-w-0 text-[12px] text-[#262626] leading-[1.5] overflow-hidden text-ellipsis whitespace-nowrap'
          }
          style={{ fontWeight: 350, letterSpacing: '-0.24px' }}
        >
          This contract was approved and signed on {formatDate(approvedAt)}
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

      {/* Expanded details — appear BELOW the date row, pushing downward.
          Long description + Show less link at the bottom to collapse again. */}
      {expanded && (
        <>
          <p
            className="text-[12px] text-[#262626] leading-[1.5] w-full"
            style={{ fontWeight: 350, letterSpacing: '-0.24px' }}
          >
            This PDF is the executed contract associated with this project. It reflects
            the scope, pricing, and terms approved at the time of signing. Any later
            updates or approved changes may appear in the project record or change history.
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

// ── Main section ──────────────────────────────────────────────────────────────
// Renders inside the Project Hub content container. The parent container
// already provides horizontal padding (px-4 / sm:px-6 / lg:px-6), so this
// component does not add outer padding — it just lays out its columns.
export default function ContractDocSection({
  approvedAt,
  onScrollToTop,
}: {
  /** When the user signed the contract. Falls back to "now" so the prototype
   *  always shows a valid date before the signature flow has been completed. */
  approvedAt: Date | null | undefined;
  onScrollToTop: () => void;
}) {
  const signedAt = approvedAt ?? new Date();

  // Measured height of the mobile sticky footer. Used to (a) offset the
  // floating view controls so they stay above the footer as it grows on
  // "Read more", and (b) keep the Back-to-Top button clear of the footer
  // at scroll-end (extra bottom padding on the mobile column).
  const [footerHeight, setFooterHeight] = useState(0);
  const viewControlsBottomOffset = footerHeight + 16; // 16px buffer above footer
  const mobileBottomClearance = footerHeight + 24;   // clearance below Back-to-Top

  return (
    <>
      {/*
        Content layout:
          XS/S/M (<lg): single column — PDF pages + Back-to-Top button.
                       The mobile sticky footer sits at the bottom of the
                       viewport; parent padding leaves clearance above it.
          L+ (lg+)   : flex row — sidebar takes 1/3 of the row but caps at
                       400px, PDF column fills all remaining space. While the
                       sidebar is below 400px this mirrors a 12-col 8/4 split;
                       once it caps, the PDF keeps expanding to fill the page.
                       Back-to-Top sits centered under the PDF pages.
      */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-3 w-full pt-4">
        {/* PDF pages — mobile full-width, lg+ flex-1 (fills remainder).
            Mobile bottom padding tracks the dynamic footer height so the
            Back-to-Top button stays clear of the footer at scroll-end.
            Desktop uses a fixed pb-16 since it has no sticky footer. */}
        <div
          className="flex flex-col gap-4 lg:gap-6 w-full min-w-0 lg:flex-1 lg:!pb-16"
          style={{ paddingBottom: mobileBottomClearance }}
        >
          <PdfPages />
          <div className="flex justify-center">
            <BackToTopButton onClick={onScrollToTop} />
          </div>
          {/* View controls — pinned to PDF column's bottom-left on all breakpoints */}
          <ViewControls mobileBottomOffset={viewControlsBottomOffset} />
        </div>

        {/* About sidebar — lg+ only, 1/3 width capped at 400 */}
        <div className="hidden lg:block lg:w-1/3 lg:max-w-[400px] lg:shrink-0 min-w-0">
          <AboutSidebar approvedAt={signedAt} />
        </div>
      </div>

      {/* Mobile sticky footer — download + about row */}
      <ContractDocStickyFooter approvedAt={signedAt} onHeightChange={setFooterHeight} />
    </>
  );
}
