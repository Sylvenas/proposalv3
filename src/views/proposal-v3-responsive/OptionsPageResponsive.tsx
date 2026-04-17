'use client';

import { useEffect, useRef, useState } from 'react';

// ── Equal-height hook ─────────────────────────────────────────────────────────
// For each [data-card-container], finds all [data-card-section="X"] elements,
// resets their heights, measures the tallest, then applies that height to all.
// Runs on mount and on every resize (also handles image-load reflows).
function useSyncCardSectionHeights() {
  useEffect(() => {
    const SECTION_TYPES = ['name', 'features', 'time', 'price'] as const;

    const sync = () => {
      const containers = document.querySelectorAll<HTMLElement>('[data-card-container]');

      containers.forEach((container) => {
        SECTION_TYPES.forEach((type) => {
          const els = [
            ...container.querySelectorAll<HTMLElement>(`[data-card-section="${type}"]`),
          ];
          if (els.length === 0) return;

          // 1. Reset to natural height so we can re-measure
          els.forEach((el) => { el.style.height = 'auto'; });

          // 2. Measure (elements with display:none have height 0 — intentional)
          const max = Math.max(...els.map((el) => el.getBoundingClientRect().height));

          // 3. Apply max height to all (including hidden ones, harmless)
          if (max > 0) {
            els.forEach((el) => { el.style.height = `${max}px`; });
          }
        });
      });
    };

    // Run once after first paint (images may not be loaded yet, handled by ResizeObserver)
    const rafId = requestAnimationFrame(sync);

    // Re-run on any resize (viewport change OR image load reflowing layout)
    const ro = new ResizeObserver(() => requestAnimationFrame(sync));
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);
}

// ── Asset URLs (local, served from /public/images/proposal-v3-responsive/) ────
const BASE = '/images/proposal-v3-responsive';
const IMG_OPTION_1       = `${BASE}/option-1.webp`;
const IMG_OPTION_2       = `${BASE}/option-2.webp`;
const IMG_OPTION_3       = `${BASE}/option-3.webp`;
const IMG_PRODUCT_THUMB  = `${BASE}/product-thumb.webp`;
const IMG_INFO_ICON      = `${BASE}/info-icon.svg`;
const IMG_ARROW_UP       = `${BASE}/arrow-up.svg`;
const IMG_DROPDOWN_ICON  = `${BASE}/dropdown-icon.svg`;
const IMG_HEADER_LOGO    = `${BASE}/header-logo.webp`;
const IMG_HEADER_HOME    = `${BASE}/header-home.svg`;
const IMG_HEADER_USER    = `${BASE}/header-user.svg`;
const IMG_COVER_LOGO     = `${BASE}/cover-logo.webp`;

// ── Mock Data ─────────────────────────────────────────────────────────────────
type FenceOption = {
  id: number;
  label: string;
  features: string;
  constructionTime: string;
  price: string;
  contractTotal: string;
  monthly: string;
  image: string;
  products: { name: string; qty: string; unit: string }[];
};

const OPTIONS: FenceOption[] = [
  {
    id: 1,
    label: 'OPTION 1 - CHAIN LINK FENCE',
    features: 'Durable / Cost Effective / Transparent',
    constructionTime: '2–3 Weeks',
    price: '$8,615.00 USD',
    contractTotal: '$8,615.00',
    monthly: '$404.13 / mo',
    image: IMG_OPTION_1,
    products: [
      { name: 'Chain Link Fabric', qty: '960', unit: 'sqf.' },
      { name: 'Line Posts', qty: '24', unit: 'ea.' },
      { name: 'Top Rail', qty: '320', unit: 'lf.' },
      { name: 'Hardware & Fittings', qty: '1', unit: 'set' },
    ],
  },
  {
    id: 2,
    label: 'OPTION 2 - VINYL TRADITIONS FENCE',
    features: 'Enhanced Privacy / Clean Appearance / Minimal Maintenance',
    constructionTime: '4–6 Weeks',
    price: '$9,999.00 USD',
    contractTotal: '$9,999.00',
    monthly: '$469.06 / mo',
    image: IMG_OPTION_2,
    products: [
      { name: 'Vinyl Panels', qty: '960', unit: 'sqf.' },
      { name: 'Vinyl Posts', qty: '24', unit: 'ea.' },
      { name: 'Post Caps', qty: '24', unit: 'ea.' },
      { name: 'Hardware & Fittings', qty: '1', unit: 'set' },
    ],
  },
  {
    id: 3,
    label: 'OPTION 3 - ALUMINUM ORNAMENTAL FENCE',
    features: 'Elegant Design / Rust Resistant / Long Lasting',
    constructionTime: '4–6 Weeks',
    price: '$9,999.00 USD',
    contractTotal: '$9,999.00',
    monthly: '$469.06 / mo',
    image: IMG_OPTION_3,
    products: [
      { name: 'Aluminum Panels', qty: '960', unit: 'sqf.' },
      { name: 'Aluminum Posts', qty: '24', unit: 'ea.' },
      { name: 'Finials & Decorative', qty: '96', unit: 'ea.' },
      { name: 'Hardware & Fittings', qty: '1', unit: 'set' },
    ],
  },
];

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function ArrowUpIcon() {
  return (
    <img src={IMG_ARROW_UP} alt="" style={{ width: 16, height: 16, display: 'block', flexShrink: 0 }} />
  );
}

function ChevronDownIcon({ size = 10 }: { size?: number }) {
  return (
    <span className="animate-bounce inline-flex">
      <svg
        width={size}
        height={size}
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.5 3.5L5 7L8.5 3.5"
          stroke="#262626"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ── Option Card ───────────────────────────────────────────────────────────────
// Density-aware via Tailwind responsive classes:
//   Low density (< md):  gap-8 pt-6 pb-5 px-4, info gap-4
//   Medium density (md+): gap-6 pt-4 pb-6 px-6, info gap-3
function OptionCard({ opt }: { opt: FenceOption }) {
  return (
    <div className="flex flex-col">
      {/* Hero image — aspect ratio 800:471 */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '800 / 471' }}>
        <img
          src={opt.image}
          alt={opt.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Card details */}
      <div
        className={[
          'flex flex-col w-full bg-[#eeeeee]',
          // Low density
          'gap-8 pt-6 pb-5 px-4',
          // Medium density
          'md:gap-6 md:pt-4 md:pb-6 md:px-6',
        ].join(' ')}
      >
        {/* Title — synced across cards via data-card-section="name" */}
        <p
          data-card-section="name"
          className="font-semibold text-[16px] text-[#262626] w-full leading-normal overflow-hidden"
          style={{ fontFamily: 'Segoe UI, sans-serif' }}
        >
          {opt.label}
        </p>

        {/* Features + time + price — each section synced independently */}
        <div className="flex flex-col gap-4 md:gap-3 w-full">
          <p
            data-card-section="features"
            className="text-[14px] text-[#262626] leading-normal tracking-[-0.14px] overflow-hidden"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {opt.features}
          </p>
          <p
            data-card-section="time"
            className="text-[14px] text-[#262626] leading-normal tracking-[-0.14px] overflow-hidden"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {opt.constructionTime} Estimated Construction Time
          </p>
          <p
            data-card-section="price"
            className="font-semibold text-[20px] text-[#262626] tracking-[-0.2px] overflow-hidden"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {opt.price}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-4 md:gap-3 w-full">
          <button
            className="w-full h-10 bg-[#d41a32] text-white text-[14px] font-semibold rounded-[4px] flex items-center justify-center cursor-pointer"
            style={{ fontFamily: 'Segoe UI, sans-serif', lineHeight: '18px' }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comparison Parameter row ──────────────────────────────────────────────────
function ComparisonParam({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex flex-col border-t border-t-[rgba(0,0,0,0.1)] w-full py-3 md:py-2"
      style={{ borderTopWidth: '0.5px' }}
    >
      <p
        className="text-[10px] md:text-[12px] text-[#737373] tracking-[-0.1px]"
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        {label}
      </p>
      <p
        className="font-semibold text-[16px] md:text-[20px] text-[#262626]"
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Product Line Item ─────────────────────────────────────────────────────────
function ProductLineItem({
  name,
  qty,
  unit,
  showThumb,
}: {
  name: string;
  qty: string;
  unit: string;
  showThumb?: boolean;
}) {
  return (
    <div
      className="flex gap-3 items-start bg-white border-t border-t-[rgba(0,0,0,0.1)] w-full py-3"
      style={{ borderTopWidth: '0.5px' }}
    >
      {/* Thumbnail — only on desktop (lg+) */}
      {showThumb && (
        <div className="hidden lg:flex flex-col items-start p-0.5 rounded shrink-0 w-12 h-12">
          <img
            src={IMG_PRODUCT_THUMB}
            alt=""
            className="w-full h-full object-cover rounded-[2px]"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 flex-1 min-w-0 pr-1">
        {/* Product name + info icon */}
        <div className="flex items-center gap-4 md:gap-3">
          <div className="flex flex-1 items-center min-w-0">
            <p
              className="flex-1 min-w-0 text-[14px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ fontFamily: 'Segoe UI, sans-serif' }}
            >
              {name}
            </p>
          </div>
          <div className="flex items-center justify-center shrink-0 w-6 h-6">
            <img src={IMG_INFO_ICON} alt="" className="w-[16.3px] h-[16.3px]" />
          </div>
        </div>
        {/* Quantity */}
        <div className="flex items-center">
          <div
            className="flex flex-1 items-center gap-2 text-[14px] text-[#737373] leading-normal"
            style={{ fontFamily: 'Segoe UI, sans-serif', fontWeight: 300 }}
          >
            <span className="whitespace-nowrap text-right">{qty}</span>
            <span className="w-8">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cover Page Content ────────────────────────────────────────────────────────
// Figma node 807-20477.
// Font XXL token: Low Density (<md) = 20px / Medium Density (md+) = 24px
// Mobile layout  (<md): logo 160×160, stacked CTAs (Valid Until → Explore → Inspection)
// Desktop layout (md+): logo 320×320, side-by-side CTAs (Inspection | Explore), then Valid Until
function CoverPageContent({ onExplore }: { onExplore: () => void }) {
  // ── Token table (from Figma variable defs per breakpoint frame) ──────────────
  // FONTS — viewport-responsive (change at sm and xl):
  //   Font S  : XS=12  S=14  M=14  L=14  XL=16  XXL=16  → text-[12px] sm:text-[14px] xl:text-[16px]
  //   Font M  : XS=14  S=16  M=16  L=16  XL=20  XXL=20  → text-[14px] sm:text-[16px] xl:text-[20px]
  //   Font L  : XS=16  S=20  M=20  L=20  XL=24  XXL=24  → text-[16px] sm:text-[20px] xl:text-[24px]
  //   Title   : XS=24  S=24  (24px across mobile)         → text-[24px]
  //           : M=32   L=32  XL=40  XXL=40 (Font XXL)    → md:text-[32px] xl:text-[40px]
  //   Combined: text-[24px] md:text-[32px] xl:text-[40px]
  //
  // SPACING — density-mode only (change only at md):
  //   Spacing XL: Low Density (XS/S)=48px  Medium Density (md+)=32px → gap-12 md:gap-8
  //   Mobile CTAs gap (Spacing S=16px, Low Density only)              → gap-4
  //   Desktop CTAs outer gap (Spacing L=24px, Medium Density only)    → gap-6
  //   Desktop button row gap: 12px hardcoded                          → gap-3
  return (
    <div
      // Overall section gap = Spacing XL: 48px Low Density → 32px Medium Density
      className="flex flex-col items-center justify-center gap-12 md:gap-8 w-full h-full px-4 sm:px-6 md:px-4 lg:px-6"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Logo: 160×160 mobile (<md), 320×320 desktop (md+) */}
      <div className="shrink-0 md:hidden" style={{ width: 160, height: 160 }}>
        <img src={IMG_COVER_LOGO} alt="Madison Fence Company" className="w-full h-full object-cover" />
      </div>
      <div className="shrink-0 hidden md:block" style={{ width: 320, height: 320 }}>
        <img src={IMG_COVER_LOGO} alt="Madison Fence Company" className="w-full h-full object-cover" />
      </div>

      {/* Proposal Info */}
      <div className="flex flex-col items-center w-full">
        {/* Address — Font S: 12→14→16px across XS/S/XL */}
        <p className="text-[12px] sm:text-[14px] xl:text-[16px] font-light text-[#262626] text-center leading-normal">
          1722 Willis Ave NW, Grand Rapids, MI 49504
        </p>
        {/* Title — Font XL on mobile (20→24px), Font XXL on desktop (32→40px) */}
        <p
          className="text-[24px] md:text-[32px] xl:text-[40px] font-light text-[#262626] text-center leading-normal"
          style={{ letterSpacing: '-0.03em' }}
        >
          FENCE REPLACEMENT PROPOSAL
        </p>
        {/* Client Name — Font L: 16→20→24px across XS/S/XL */}
        <div className="flex items-center justify-center w-full pt-2">
          <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-light text-[#262626] text-center leading-normal whitespace-nowrap">
            Prepared for Michael Rozier
          </p>
        </div>
      </div>

      {/* Tagline — Font M: 14→16→20px across XS/S/XL */}
      <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-light text-[#262626] text-center leading-normal">
        Build Your Dream Fence
      </p>

      {/* ── CTAs: Mobile (Low Density, <md) ────────────────────────────── */}
      {/* Order: Valid Until → Explore (red) → Inspection (outlined)       */}
      {/* Gap = Spacing S = 16px (Low Density)                             */}
      <div className="md:hidden flex flex-col gap-4 w-full">
        {/* Valid Until — Font M (mobile): XS=14px  S=16px */}
        <p className="text-[14px] sm:text-[16px] text-[#262626] text-center leading-normal">
          Valid Until: April 30, 2026
        </p>
        {/* Explore — h-10 (40px), font/size/body/medium = 14px fixed */}
        <button
          onClick={onExplore}
          className="w-full h-10 bg-[#d41a32] text-white text-[14px] font-semibold flex items-center justify-center cursor-pointer"
          style={{ lineHeight: '18px' }}
        >
          EXPLORE OPTIONS
        </button>
        {/* Inspection — h-10 (40px), font/size/body/medium = 14px fixed */}
        <button className="w-full h-10 bg-white border border-[#262626] text-[rgba(0,0,0,0.85)] text-[14px] flex items-center justify-center cursor-pointer">
          INSPECTION REPORT
        </button>
      </div>

      {/* ── CTAs: Desktop (Medium Density, md+) ────────────────────────── */}
      {/* Order: [Inspection | Explore] then Valid Until                    */}
      {/* Outer gap = Spacing L = 24px (Medium Density)                    */}
      <div className="hidden md:flex flex-col gap-6 w-full items-center">
        {/* Button row — 12px gap (hardcoded in design) */}
        <div className="flex gap-3 items-center justify-center w-full">
          {/* Inspection — flex-1, max-w-240px, h-11 (44px), --m = 16px */}
          <button className="flex-1 h-11 max-w-[240px] bg-white border border-[#262626] text-[rgba(0,0,0,0.85)] text-[16px] flex items-center justify-center cursor-pointer">
            INSPECTION REPORT
          </button>
          {/* Explore — flex-1, max-w-240px, h-11 (44px), --m = 16px */}
          <button
            onClick={onExplore}
            className="flex-1 h-11 max-w-[240px] bg-[#d41a32] text-white text-[16px] font-semibold flex items-center justify-center cursor-pointer"
            style={{ lineHeight: '18px' }}
          >
            EXPLORE OPTIONS
          </button>
        </div>
        {/* Valid Until — Font M (desktop): M/L=16px  XL/XXL=20px */}
        <p className="text-[16px] xl:text-[20px] text-[#262626] text-center leading-normal">
          Valid Until: April 30, 2026
        </p>
      </div>
    </div>
  );
}

// ── Cover Curtain ─────────────────────────────────────────────────────────────
// Full-viewport white curtain.
// Touch: curtain follows finger upward in real time; releasing past threshold
//   (20% of viewport height, max 120px) completes the slide-up and unmounts.
//   Releasing below threshold snaps the curtain back down (0.3s ease-out).
// Mouse wheel: no action — wheel scrolling does NOT dismiss the curtain.
// Button: "EXPLORE OPTIONS" and Home icon dismiss immediately.
// z-index 100 — above sticky comparison header (z-50).
function CoverCurtain({ onDismiss }: { onDismiss: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [snappingBack, setSnappingBack] = useState(false);
  const touchStartY = useRef<number | null>(null);

  // Lock body scroll while curtain is visible; restore on unmount.
  // Compensate for scrollbar width so content doesn't shift when the
  // scrollbar reappears after the curtain is dismissed.
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  const dismiss = () => {
    if (dismissed) return;
    setDismissed(true);
    setTimeout(onDismiss, 620);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (dismissed) return;
    touchStartY.current = e.touches[0].clientY;
    setSnappingBack(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || dismissed) return;
    const delta = touchStartY.current - e.touches[0].clientY;
    // Only track upward drag (positive delta); ignore downward pulls
    setDragY(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || dismissed) return;
    // Threshold: 20% of viewport height, capped at 120px
    const threshold = Math.min(120, window.innerHeight * 0.2);
    if (dragY >= threshold) {
      dismiss();
    } else {
      // Not far enough — snap back with a short transition
      setSnappingBack(true);
      setDragY(0);
      setTimeout(() => setSnappingBack(false), 320);
    }
    touchStartY.current = null;
  };

  // Compute transform & transition based on current state
  const transform = dismissed ? 'translateY(-100%)' : `translateY(-${dragY}px)`;
  const transition = dismissed
    ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    : snappingBack
      ? 'transform 0.3s ease-out'
      : 'none';

  return (
    <div
      className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden"
      style={{ transform, transition }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full flex items-center justify-center" style={{ maxWidth: 2160 }}>
        <CoverPageContent onExplore={dismiss} />
      </div>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
// Non-sticky, scrolls with the page.
// Figma variables: Low Density (XS/S <md): --margin=8px, --s=8px, h=48px
//                 Medium Density (M+ md+): --margin=12px, --s=12px, h=48px
function PageHeader({ onShowCover }: { onShowCover: () => void }) {
  return (
    <header
      className="w-full bg-white flex items-center justify-center h-12 px-4 sm:px-6 md:px-4 lg:px-6"
    >
      <div className="flex items-center justify-between w-full max-w-[1024px]">
        {/* Home icon: 24×24 clip box, vector 17.99×15.98px centred inside */}
        <button
          onClick={onShowCover}
          className="relative shrink-0 overflow-clip cursor-pointer bg-transparent border-0 p-0"
          style={{ width: 24, height: 24 }}
          aria-label="Back to cover"
        >
          <div className="absolute" style={{
            width: 17.99, height: 15.977,
            left: 'calc(50% - 0.02px)', top: 'calc(50% + 0.01px)',
            transform: 'translate(-50%, -50%)',
          }}>
            <img src={IMG_HEADER_HOME} alt="" className="absolute inset-0 block w-full h-full" style={{ maxWidth: 'none' }} />
          </div>
        </button>
        {/* Logo 87×24 */}
        <div className="relative shrink-0" style={{ width: 87, height: 24 }}>
          <img src={IMG_HEADER_LOGO} alt="Madison Fence Company" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ maxWidth: 'none' }} />
        </div>
        {/* User icon: 24×24 clip box, vector 14×15.98px centred inside */}
        <div className="relative shrink-0 overflow-clip" style={{ width: 24, height: 24 }}>
          <div className="absolute" style={{
            width: 14, height: 15.977,
            left: '50%', top: 'calc(50% + 0.01px)',
            transform: 'translate(-50%, -50%)',
          }}>
            <img src={IMG_HEADER_USER} alt="User" className="absolute inset-0 block w-full h-full" style={{ maxWidth: 'none' }} />
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Sticky Comparison Header ──────────────────────────────────────────────────
// Visible when #comparison has scrolled past the top of the viewport,
// hidden again once #section-5-cards becomes visible in the viewport.
function useStickyHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      const compEl = document.getElementById('comparison');
      const bottomEl = document.getElementById('section-5-cards');
      if (!compEl) return;

      const compTop = compEl.getBoundingClientRect().top;
      const comparisonPassed = compTop < 0;

      const vh = window.innerHeight || document.documentElement.clientHeight || 768;
      // Hide only when the section-5 cards are FULLY in the viewport (select buttons visible)
      // or have scrolled past the top — using .bottom ensures we don't hide prematurely
      // on tall viewports where s5 top enters before comp top passes 0.
      const s5Rect = bottomEl?.getBoundingClientRect();
      const bottomInView = s5Rect
        ? s5Rect.bottom < vh || s5Rect.top < 0
        : false;

      setVisible(comparisonPassed && !bottomInView);
    };

    // Poll every 100 ms — works regardless of which element is the scroll container
    const id = setInterval(check, 100);
    // Also listen to scroll events as a fast path
    window.addEventListener('scroll', check, { passive: true });
    document.addEventListener('scroll', check, { passive: true });
    check();

    return () => {
      clearInterval(id);
      window.removeEventListener('scroll', check);
      document.removeEventListener('scroll', check);
    };
  }, []);

  return visible;
}

function StickyComparisonHeader({
  options,
  visible,
}: {
  options: FenceOption[];
  visible: boolean;
}) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-[0px_4px_3px_0px_rgba(123,123,123,0.1)]"
      style={{
        borderBottomWidth: '0.5px',
        borderBottomColor: 'rgba(0,0,0,0.2)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 200ms ease-out',
      }}
    >
      <div
        className="mx-auto flex items-center gap-4 md:gap-3 px-4 sm:px-6 md:px-4 lg:px-6 py-2 md:py-3"
        style={{ minWidth: 360, maxWidth: 2160 }}
      >
        {options.map((opt, i) => (
          <div
            key={opt.id}
            className={`flex flex-1 items-center gap-1 px-2 min-w-0${
              i === 2 ? ' hidden lg:flex' : ''
            }`}
          >
            <p
              className="flex-1 font-semibold text-[14px] text-[#262626] truncate leading-normal"
              style={{ fontFamily: 'Segoe UI, sans-serif' }}
            >
              {opt.label}
            </p>
            <img
              src={IMG_DROPDOWN_ICON}
              alt=""
              className="rotate-90 shrink-0"
              style={{ width: 16, height: 16 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OptionsPageResponsive() {
  useSyncCardSectionHeights();
  const stickyVisible = useStickyHeader();
  const [curtainMounted, setCurtainMounted] = useState(true);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToComparison() {
    document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' });
  }

  function scrollToComparisonCards() {
    document.getElementById('comparison-cards')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Options visible in comparison at each breakpoint:
  // < lg  → first 2 options
  // lg+   → all 3 options
  const comparisonOptions = OPTIONS; // rendered with CSS visibility per column

  return (
    <div className="bg-white min-h-screen">
      {curtainMounted && (
        <CoverCurtain onDismiss={() => setCurtainMounted(false)} />
      )}
      <PageHeader onShowCover={() => setCurtainMounted(true)} />
      <StickyComparisonHeader options={OPTIONS} visible={stickyVisible} />
      {/*
        Width clamp: min 360px, max 2160px, centred.
        Below 360px the content stays 360px wide (horizontal scroll).
        Above 2160px the content stays 2160px wide with white side margins.
      */}
      <div className="mx-auto" style={{ minWidth: 360, maxWidth: 2160 }}>
      {/*
        Inner layout:
          XS: px-4  (16px)
          S:  px-6  (24px)
          M:  px-4  (16px)
          L+: px-6  (24px)
        Gap between sections:
          Low density (< md):    gap-4  (16px)
          Medium density (md+):  gap-3  (12px)
      */}
      <div className="flex flex-col px-4 sm:px-6 md:px-4 lg:px-6 py-4 sm:py-6 gap-4 md:gap-3">

        {/* ── Section 1: Primary option cards ─────────────────────────────── */}
        {/*
          Layout:
            XS/S  (< md):   flex-col — all 3 cards stacked
            M     (md):     2-col grid — show cards 1 & 2 only (card 3 hidden)
            L+    (lg+):    3-col grid — all 3 cards shown
        */}
        <div data-card-container className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-3">
          <OptionCard opt={OPTIONS[0]} />
          <OptionCard opt={OPTIONS[1]} />
          {/* Card 3: visible on mobile + desktop, hidden on tablet */}
          <div className="block md:hidden lg:block">
            <OptionCard opt={OPTIONS[2]} />
          </div>
        </div>

        {/* ── Back to Top (mobile only, between main cards and need-support) */}
        <div className="flex justify-center md:hidden">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 h-10 bg-white rounded-[4px] px-3 py-1.5 w-[276px] justify-center cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <ArrowUpIcon />
            <span className="text-[14px] text-[rgba(0,0,0,0.85)] leading-[18px] whitespace-nowrap">
              Back to Top
            </span>
          </button>
        </div>

        {/* ── Section 2: "Need support?" ──────────────────────────────────── */}
        <div
          className={[
            'flex flex-col items-center gap-4',
            // Low density py
            'py-5',
            // Medium density py
            'md:py-6',
          ].join(' ')}
        >
          {/* Support text */}
          <div
            className="text-center text-[#262626]"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            <p className="text-[12px] md:text-[14px] font-semibold leading-normal mb-1">
              Need support choosing a option?{' '}
            </p>
            <p className="text-[12px] md:text-[14px] font-light leading-normal">
              Compare different options to help you decide which one fits you best.
            </p>
          </div>

          {/* Mobile: full-width bordered button */}
          <button
            onClick={scrollToComparisonCards}
            className="md:hidden w-full h-10 bg-white border border-[#262626] rounded-[4px] text-[14px] text-[rgba(0,0,0,0.85)] flex items-center justify-center gap-0.5 cursor-pointer"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            COMPARE OPTIONS
          </button>

          {/* Desktop: text link with chevron-down */}
          <button
            onClick={scrollToComparison}
            className="hidden md:flex flex-col items-center gap-3 px-1 py-1.5 rounded-[4px] cursor-pointer"
            style={{ fontFamily: 'Segoe UI Variable, sans-serif', fontWeight: 300 }}
          >
            <span className="text-[16px] text-[#262626] leading-[18px] whitespace-nowrap">
              Compare Options
            </span>
            <ChevronDownIcon size={10} />
          </button>
        </div>

        {/* ── Section 3: Comparison area ──────────────────────────────────── */}
        {/*
          Mini comparison option cards (same OptionCard, in 2-col / 3-col grid)
          + Parameter table
          + Product table
        */}

        {/* Mini cards: XS/S only — hidden on md+ since primary cards are already horizontal */}
        <div id="comparison-cards" data-card-container className="grid grid-cols-2 gap-4 md:hidden">
          {comparisonOptions.map((opt, i) => (
            <div key={opt.id} className={i === 2 ? 'hidden lg:block' : ''}>
              <OptionCard opt={opt} />
            </div>
          ))}
        </div>

        {/* Parameter Comparison Section */}
        <div
          id="comparison"
          className="flex flex-col text-center gap-4 sm:gap-6 md:gap-4 lg:gap-6 pt-4 sm:pt-8 md:pt-6 xl:pt-8 2xl:pt-12"
        >
          {/* Heading */}
          <p
            className="font-semibold text-[16px] sm:text-[20px] xl:text-[24px] text-[#262626] w-full leading-normal"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            Schedule and Pricing
          </p>

          {/* Param columns: 2-col on <lg, 3-col on lg+ */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
            {comparisonOptions.map((opt, i) => (
              <div
                key={opt.id}
                className={`bg-white flex flex-col${i === 2 ? ' hidden lg:flex' : ''}`}
              >
                <ComparisonParam label="Contract Total" value={opt.contractTotal} />
                <ComparisonParam
                  label="Estimated Monthly Payment Starting at"
                  value={opt.monthly}
                />
                <ComparisonParam
                  label="Estimated Construction Time"
                  value={opt.constructionTime}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Comparison Section */}
        <div
          className="flex flex-col gap-4 sm:gap-6 md:gap-4 lg:gap-6 pt-4 sm:pt-8 md:pt-6 xl:pt-8 2xl:pt-12"
        >
          {/* Heading */}
          <p
            className="font-semibold text-[16px] sm:text-[20px] xl:text-[24px] text-[#262626] w-full text-center leading-normal"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            Fence Parts
          </p>

          {/* Product columns: 2-col on <lg, 3-col on lg+ */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
            {comparisonOptions.map((opt, i) => (
              <div
                key={opt.id}
                className={`flex flex-col${i === 2 ? ' hidden lg:flex' : ''}`}
              >
                {opt.products.map((p) => (
                  <ProductLineItem
                    key={p.name}
                    name={p.name}
                    qty={p.qty}
                    unit={p.unit}
                    showThumb
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: "Decision made?" ─────────────────────────────────── */}
        <div
          className="flex flex-col items-center gap-1 py-4 md:py-6"
        >
          <p
            className="font-semibold text-[20px] md:text-[24px] text-[#262626] text-center leading-normal"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            Decision made?
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-0.5 bg-white rounded-[4px] px-2 py-1 w-[91px] justify-center cursor-pointer"
            style={{ fontFamily: 'Segoe UI Variable, sans-serif' }}
          >
            <ArrowUpIcon />
            <span className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[16px] whitespace-nowrap">
              Back to Top
            </span>
          </button>
        </div>

        {/* ── Section 5: Bottom option cards (repeated for easy re-selection) */}
        <div id="section-5-cards" data-card-container className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
          {comparisonOptions.map((opt, i) => (
            <div key={opt.id} className={i === 2 ? 'hidden lg:block' : ''}>
              <OptionCard opt={opt} />
            </div>
          ))}
        </div>

      </div>
      </div>
    </div>
  );
}
