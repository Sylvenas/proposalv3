'use client';

import { useEffect } from 'react';

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

// ── Asset URLs (Figma CDN, valid ~7 days from 2026-04-16) ─────────────────────
const IMG_OPTION_1 =
  'https://www.figma.com/api/mcp/asset/3643021f-a5a0-4176-b6b3-285af4cbfc8c';
const IMG_OPTION_2 =
  'https://www.figma.com/api/mcp/asset/999b2703-913c-4e42-9210-5a600d6d6801';
const IMG_OPTION_3 =
  'https://www.figma.com/api/mcp/asset/d05a2609-a97d-4179-8622-b18fb5c24762';
const IMG_PRODUCT_THUMB =
  'https://www.figma.com/api/mcp/asset/8cbcfb74-6f95-4363-859d-41ca96d5642d';
const IMG_INFO_ICON =
  'https://www.figma.com/api/mcp/asset/bddc0c74-8884-45db-be5f-5f3a491c881a';
const IMG_ARROW_UP =
  'https://www.figma.com/api/mcp/asset/f97149e2-e44d-4ecb-9159-18c930790340';

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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OptionsPageResponsive() {
  useSyncCardSectionHeights();

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
            <p className="text-[12px] font-semibold leading-normal mb-1">
              Need support choosing a option?{' '}
            </p>
            <p className="text-[12px] font-light leading-normal">
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
            className="hidden md:flex flex-col items-center gap-1 px-1 py-1.5 rounded-[4px] cursor-pointer"
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
        <div data-card-container className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
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
