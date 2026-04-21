'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect runs synchronously before paint (prevents scrollbar flash).
// Falls back to useEffect on the server to avoid SSR warnings.
const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import SummaryPageResponsive from './SummaryPageResponsive';
import ProjectHubPageResponsive from './ProjectHubPageResponsive';
import type { FenceOption as SummaryFenceOption, AddonItem } from './SummaryPageResponsive';
import { DEFAULT_ADDONS } from './SummaryPageResponsive';
import PageHeader from './PageHeader';
import BackToTopButton from './BackToTopButton';

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
  /** Base materials cost (before any addons) used to compute dynamic financials on Summary page. */
  baseMaterials: number;
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
    // baseMaterials: 8397 → discount $420 → afterDisc $7,977 → tax $638 → total $8,615
    baseMaterials: 8397,
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
    // baseMaterials: 9745 → discount $487 → afterDisc $9,258 → tax $741 → total $9,999
    baseMaterials: 9745,
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
    price: '$12,480.00 USD',
    contractTotal: '$12,480.00',
    monthly: '$520.00 / mo',
    image: IMG_OPTION_3,
    // baseMaterials: 12164 → discount $608 → afterDisc $11,556 → tax $924 → total $12,480
    baseMaterials: 12164,
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

// ── OverflowNavigation ────────────────────────────────────────────────────────
// Figma node 846:16944.
// Prev / Next circular buttons (40×40, #f0f0f0) + Indicator pill.
//
// Indicator: one shape per option, same dark-gray (#737373). Consecutive
// fully-visible options merge into a single elongated pill:
//   • 1 option (not fully visible)  → 8×8 circle
//   • N consecutive fully-visible   → pill of width `20·N − 12`
//     (N=2 → 28px, matching Figma; N=3 → 48px; N=1 → 8px, same as a circle)
//
// Disabled state: 40% opacity when scroll is at its far edge in that direction.
function OverflowNavChevron({
  direction,
  disabled,
}: {
  direction: 'prev' | 'next';
  disabled?: boolean;
}) {
  // 10×10 SVG chevron. Prev = <  ; Next = >
  const d = direction === 'prev' ? 'M6.25 2.5 L3.75 5 L6.25 7.5' : 'M3.75 2.5 L6.25 5 L3.75 7.5';
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      // Only the icon dims when the button is disabled — the pill background
      // (#f0f0f0) stays at full opacity.
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <path d={d} stroke="#262626" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OverflowNavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-[#f0f0f0] rounded-full flex items-center justify-center border-0 shrink-0 cursor-pointer disabled:cursor-not-allowed"
      style={{ width: 40, height: 40 }}
      aria-label={direction === 'prev' ? 'Previous option' : 'Next option'}
    >
      <OverflowNavChevron direction={direction} disabled={disabled} />
    </button>
  );
}

// Indicator layout constants.
// DOT_GAP = 12 keeps the merged bar width at 28px for N=2 (matches Figma).
// Container content width is fixed at (N-1)·(DOT_SIZE+DOT_GAP) + DOT_SIZE, so
// the indicator pill never changes width regardless of which options are visible.
const INDICATOR_DOT_SIZE = 8;
const INDICATOR_DOT_GAP = 12;
// Matches typical native smooth-scroll duration in Chrome/Firefox/Safari
// (~300ms for a medium stride), so the bar shrink+extend resolves in sync
// with the horizontal card scroll.
const INDICATOR_ANIM_MS = 300;
// Ease-out cubic (emphasized) — fast start, slow end; used for the trailing edge
// that "catches up" first during a transition.
const INDICATOR_EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';
// Ease-in cubic (emphasized) — slow start, fast end; used for the leading edge
// that extends afterward.
const INDICATOR_EASE_IN = 'cubic-bezier(0.32, 0, 0.67, 0)';

function OverflowNavigation({
  visibility,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  visibility: boolean[];
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const N = visibility.length;
  // Fixed content width so the pill never visibly resizes between states.
  const contentWidth =
    N === 0 ? 0 : (N - 1) * (INDICATOR_DOT_SIZE + INDICATOR_DOT_GAP) + INDICATOR_DOT_SIZE;
  // Fixed absolute positions for each option's background dot.
  const dotPositions = Array.from(
    { length: N },
    (_, i) => i * (INDICATOR_DOT_SIZE + INDICATOR_DOT_GAP)
  );

  // Bar spans from the first visible option's dot to the last visible option's
  // dot (inclusive). Assumes contiguous visibility (true on real scroll).
  const firstVisible = visibility.indexOf(true);
  const lastVisible = visibility.lastIndexOf(true);
  const hasBar = firstVisible >= 0;
  const barLeft = hasBar ? dotPositions[firstVisible] : 0;
  const barRightEdge = hasBar ? dotPositions[lastVisible] + INDICATOR_DOT_SIZE : 0;
  const barRightOffset = contentWidth - barRightEdge;

  // Imperative animation so we can pick direction-specific easings per property.
  const barRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<{ left: number; right: number } | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const next = { left: barLeft, right: barRightOffset };

    // First paint after the bar mounts: set initial values, no animation.
    if (prevRef.current === null) {
      bar.style.left = `${next.left}px`;
      bar.style.right = `${next.right}px`;
      prevRef.current = next;
      return;
    }

    const prev = prevRef.current;
    if (prev.left === next.left && prev.right === next.right) return;

    // Pick the animation's start from the CURRENT computed style. If an
    // in-flight animation was interrupted, this avoids a snap.
    const cs = getComputedStyle(bar);
    const fromLeft = parseFloat(cs.left) || 0;
    const fromRight = parseFloat(cs.right) || 0;

    // Cancel any in-flight animations so the new ones take over cleanly.
    bar.getAnimations().forEach((a) => a.cancel());

    // Direction: 'right' when the bar is moving rightward (scroll Next),
    // 'left' when moving leftward (scroll Prev). Used to pick which edge is
    // the "trailing" (ease-out) vs "leading" (ease-in) side — this produces
    // the shrink-then-extend acceleration the user requested.
    const direction =
      next.left > prev.left
        ? 'right'
        : next.left < prev.left
        ? 'left'
        : next.right < prev.right
        ? 'right'
        : 'left';
    const leftEasing = direction === 'right' ? INDICATOR_EASE_OUT : INDICATOR_EASE_IN;
    const rightEasing = direction === 'right' ? INDICATOR_EASE_IN : INDICATOR_EASE_OUT;

    // Commit the target values as inline style so the bar stays there after
    // the animations finish (no `fill: forwards` needed).
    bar.style.left = `${next.left}px`;
    bar.style.right = `${next.right}px`;

    // Two separate animations, one per property, each with its own easing.
    bar.animate(
      [{ left: `${fromLeft}px` }, { left: `${next.left}px` }],
      { duration: INDICATOR_ANIM_MS, easing: leftEasing }
    );
    bar.animate(
      [{ right: `${fromRight}px` }, { right: `${next.right}px` }],
      { duration: INDICATOR_ANIM_MS, easing: rightEasing }
    );

    prevRef.current = next;
  }, [barLeft, barRightOffset]);

  return (
    <div className="w-full flex justify-center">
      <div className="flex gap-3 items-center justify-center">
        <OverflowNavButton direction="prev" disabled={!canPrev} onClick={onPrev} />

        {/* Indicator pill: fixed-width inner track, absolute-positioned dots + bar. */}
        <div
          className="bg-[#f0f0f0] rounded-full shrink-0"
          style={{ padding: 16 }}
        >
          <div style={{ position: 'relative', width: contentWidth, height: INDICATOR_DOT_SIZE }}>
            {/* Background dots — one per option, rendered at fixed positions.
                The bar overlay hides the ones it covers (same color). */}
            {dotPositions.map((pos, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: pos,
                  top: 0,
                  width: INDICATOR_DOT_SIZE,
                  height: INDICATOR_DOT_SIZE,
                  background: '#737373',
                  borderRadius: '50%',
                }}
              />
            ))}
            {/* Animated bar — covers the first-visible to last-visible dot range.
                left/right are set imperatively in the useEffect above. */}
            {hasBar && (
              <div
                ref={barRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  height: INDICATOR_DOT_SIZE,
                  background: '#737373',
                  borderRadius: INDICATOR_DOT_SIZE / 2,
                }}
              />
            )}
          </div>
        </div>

        <OverflowNavButton direction="next" disabled={!canNext} onClick={onNext} />
      </div>
    </div>
  );
}

// ── PrimaryOptionSlot ─────────────────────────────────────────────────────────
// Wraps an OptionCard in the Section 1 horizontal-scroll list.
// When the card is only partially visible (the "1/8 peek" on the right edge
// when there's overflow), the FIRST tap scrolls the card fully into view
// instead of firing the button underneath. Once fully visible, taps pass
// through normally to Select / Change Option.
//
// Full-visibility is tracked by an IntersectionObserver owned by the parent
// (OptionsPageResponsive) so that the indicator bar in OverflowNavigation can
// react to the same source of truth. The slot registers itself via
// `data-slot-index={index}` so the parent's observer can map each entry back
// to its position in OPTIONS.
function PrimaryOptionSlot({
  opt,
  index,
  isFullyVisible,
  onSelect,
}: {
  opt: FenceOption;
  index: number;
  isFullyVisible: boolean;
  onSelect: () => void;
}) {
  const slotRef = useRef<HTMLDivElement>(null);

  const handleClickCapture = (e: React.MouseEvent) => {
    if (isFullyVisible) return;
    // Stop the click from reaching any descendant (Select / Change Option buttons).
    e.stopPropagation();
    e.preventDefault();
    slotRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest', // horizontal: minimum scroll to make fully visible
      block: 'nearest',  // vertical: do nothing if already in view
    });
  };

  return (
    <div
      ref={slotRef}
      data-slot-index={index}
      className="md:shrink-0 md:w-[calc((100%-24px)/2.125)] lg:w-auto"
      onClickCapture={handleClickCapture}
    >
      <OptionCard opt={opt} onSelect={onSelect} />
    </div>
  );
}

// ── Option Card ───────────────────────────────────────────────────────────────
// Density-aware via Tailwind responsive classes:
//   Low density (< md):  gap-8 pt-6 pb-5 px-4, info gap-4
//   Medium density (md+): gap-6 pt-4 pb-6 px-6, info gap-3
// `onChangeOption`: when provided, renders a "Change Option" button below the
// Select CTA. Used only in the comparison-table header & footer cards in the
// overflow state (total options > visible comparison slots). The menu is a
// future iteration — the button is rendered but is a no-op for now.
function OptionCard({
  opt,
  onSelect,
  onChangeOption,
}: {
  opt: FenceOption;
  onSelect: () => void;
  onChangeOption?: () => void;
}) {
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

        {/* CTAs — Select (always) + Change Option (comparison overflow only) */}
        <div className="flex flex-col gap-4 md:gap-3 w-full">
          <button
            onClick={onSelect}
            className="w-full h-10 bg-[#d41a32] text-white text-[14px] font-semibold rounded-[4px] flex items-center justify-center cursor-pointer"
            style={{ fontFamily: 'Segoe UI, sans-serif', lineHeight: '18px' }}
          >
            Select
          </button>
          {/* Change Option — shown only when handler provided AND overflow exists.
              Hidden on lg+ because lg+ has enough slots to show all options (no overflow).
              Figma: h-40px, white bg, border #d9d9d9, 14px text, color rgba(0,0,0,0.85) */}
          {onChangeOption && (
            <button
              onClick={onChangeOption}
              className="lg:hidden w-full h-10 bg-white border border-solid border-[#d9d9d9] text-[14px] rounded-[4px] flex items-center justify-center cursor-pointer"
              style={{ fontFamily: 'Segoe UI, sans-serif', color: 'rgba(0,0,0,0.85)' }}
            >
              Change Option
            </button>
          )}
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
  //   Title   : XS=24  S=28  M=32  XL=40               → .cover-proposal-title (globals.css)
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
      {/* Logo — Mobile (<md): 1/3 content width, max-height 180px
               Desktop (md+): 1/5 content width, max-height 320px
               aspect-square keeps it square; min() applies both constraints at once */}
      <div className="shrink-0 aspect-square md:hidden" style={{ width: 'min(33.333%, 180px)' }}>
        <img src={IMG_COVER_LOGO} alt="Madison Fence Company" className="w-full h-full object-cover" />
      </div>
      <div className="shrink-0 aspect-square hidden md:block" style={{ width: 'min(20%, 320px)' }}>
        <img src={IMG_COVER_LOGO} alt="Madison Fence Company" className="w-full h-full object-cover" />
      </div>

      {/* Proposal Info */}
      <div className="flex flex-col items-center w-full">
        {/* Address — Font S: 12→14→16px across XS/S/XL */}
        <p className="text-[12px] sm:text-[14px] xl:text-[16px] font-light text-[#262626] text-center leading-normal">
          1722 Willis Ave NW, Grand Rapids, MI 49504
        </p>
        {/* Title — XS=24 S=28 M=32 XL=40px, via Tailwind responsive classes.
            Pure CSS (no JS) so the SSR HTML renders at the correct size on
            first paint — using useState + useLayoutEffect always produces a
            small-to-large flash because Next.js shows SSR HTML (smallest
            breakpoint, since window is undefined on server) before React
            hydrates and can run effects. */}
        <p
          className="font-light text-[#262626] text-center leading-normal text-[24px] sm:text-[28px] md:text-[32px] xl:text-[40px]"
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
  // scrollbar-gutter: stable (globals.css) keeps layout width constant,
  // so no paddingRight compensation is needed.
  //
  // Also set html background to pure white while the curtain is up:
  // `html` has `scrollbar-gutter: stable` which reserves a right-edge gutter,
  // and its default bg (--arc-paper = #fffdfa) is a subtle cream. The fixed
  // curtain covers body but NOT html's gutter area, so the cream shows as a
  // thin yellow strip next to the pure-white curtain. Forcing html white
  // during mount hides that strip.
  //
  // Cleanup ALWAYS clears both inline styles to empty string (not to the
  // previously-captured value): body was set to 'hidden' by SSR to prevent
  // scrollbar flash, so "restoring" that would leave the page un-scrollable
  // after dismiss. Clearing lets CSS defaults apply — body becomes scrollable,
  // html reverts to the --arc-paper cream.
  useBrowserLayoutEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.background = 'white';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.background = '';
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
  const [selectedOption, setSelectedOption] = useState<FenceOption | null>(null);
  // Once true, the signed Project Hub replaces the Summary page for the
  // currently-selected option. Resetting the selection also resets this.
  const [approved, setApproved] = useState(false);
  // Timestamp when the proposal was approved. Captured at the moment the
  // user signs on the Summary page; rendered on the Project Hub title block.
  const [approvedAt, setApprovedAt] = useState<Date | null>(null);
  // ── Shared addon state ─────────────────────────────────────────────────────
  // Owned here so selections made on the Summary page persist when the user
  // approves and navigates to Project Hub (which renders selected addons as a
  // new "Add-ons" category in the Included Products list).
  const [addons, setAddons] = useState<AddonItem[]>(DEFAULT_ADDONS);
  // ── Section 1 horizontal-scroll state ──────────────────────────────────────
  // Tracks:
  //   1. Per-option full-visibility (drives OverflowNavigation's indicator
  //      merging behavior AND PrimaryOptionSlot's click interception).
  //   2. Whether the list actually overflows horizontally (drives nav visibility).
  //   3. Whether the scroll is at its left/right edge (drives prev/next disabled).
  // Callback-ref pattern: we need BOTH a ref (for synchronous access inside
  // click handlers like scrollPrimaryByCard) AND a reactive state (for the
  // useEffects that observe the scroll container). Why both:
  // - OptionsPageResponsive early-returns <SummaryPageResponsive/> when an
  //   option is selected, which unmounts the scroll container div. Returning
  //   later re-mounts a NEW div. A plain `useRef` + `useEffect([])` would
  //   leave the observers attached to the stale (detached) div, so overflow
  //   detection on resize silently reads invalid values. Storing the element
  //   in state re-triggers the observer setup every time the div re-mounts.
  const primaryScrollRef = useRef<HTMLDivElement | null>(null);
  const [primaryScrollEl, setPrimaryScrollEl] = useState<HTMLDivElement | null>(null);
  const setPrimaryScrollNode = useCallback((el: HTMLDivElement | null) => {
    primaryScrollRef.current = el;
    setPrimaryScrollEl(el);
  }, []);
  // Default `false` (conservative): before the IntersectionObserver fires its
  // first callback, show dots — not a (potentially wrong) merged pill. The
  // observer corrects to `true` for any slot that's actually fully visible.
  const [primaryVisibility, setPrimaryVisibility] = useState<boolean[]>(
    () => OPTIONS.map(() => false)
  );
  const [primaryHasOverflow, setPrimaryHasOverflow] = useState(false);
  const [primaryCanPrev, setPrimaryCanPrev] = useState(false);
  const [primaryCanNext, setPrimaryCanNext] = useState(false);

  // When the user clicks Prev/Next we set visibility to the *predicted* final
  // state immediately, so the bar animates once (matching scroll duration)
  // rather than in two sequential phases. During this window we must ignore
  // IntersectionObserver callbacks — otherwise the intermediate [F,T,F] state
  // it reports mid-scroll would cancel and re-trigger the animation.
  const primaryAnimatingRef = useRef(false);
  const primaryAnimatingTimeoutRef = useRef<number | null>(null);

  // Observe each slot's intersection with the scroll container.
  // Slots identify themselves via `data-slot-index`.
  // Depends on `primaryScrollEl` so it re-runs when the scroll container is
  // re-mounted (e.g. after returning from the Summary page).
  useEffect(() => {
    const root = primaryScrollEl;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Ignore observer updates during a click-driven bar animation window
        // — the predicted visibility is already in state, and intermediate
        // ratios from the in-flight scroll would trigger extra animations.
        if (primaryAnimatingRef.current) return;
        setPrimaryVisibility((prev) => {
          const next = [...prev];
          let changed = false;
          for (const entry of entries) {
            const idxAttr = (entry.target as HTMLElement).dataset.slotIndex;
            const idx = idxAttr == null ? -1 : parseInt(idxAttr, 10);
            if (idx >= 0 && idx < next.length) {
              // 0.99 tolerates sub-pixel rounding from calc()
              const v = entry.intersectionRatio >= 0.99;
              if (next[idx] !== v) {
                next[idx] = v;
                changed = true;
              }
            }
          }
          // Skip re-render when nothing actually changed.
          return changed ? next : prev;
        });
      },
      { root, threshold: [0, 0.99, 1] }
    );

    root.querySelectorAll<HTMLElement>('[data-slot-index]').forEach((el) =>
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, [primaryScrollEl]);

  // Track scroll position & overflow state (for nav visibility + button disabled state).
  //
  // Robustness notes (overflow detection across breakpoint changes):
  //  - ResizeObserver only fires on box-size changes. When the layout switches
  //    from L+ grid (3-col, no overflow) to M flex-row (2-col + 1/8 peek),
  //    the root's clientWidth is still 100% of its parent and may barely
  //    change — but scrollWidth jumps from clientWidth to ~1.5× it. Observing
  //    only the root misses this. We also observe each child slot: the child
  //    widths change dramatically (grid auto → fixed calc()) so their Resize
  //    events reliably fire on breakpoint crossings.
  //  - rAF-throttle: multiple triggers (resize/scroll/RO/MQL) in one tick all
  //    collapse to a single DOM read after layout settles.
  //  - Media-query listeners for md and lg act as a final safety net for any
  //    browser where the above events fire before CSS reflow completes.
  //
  // Depends on `primaryScrollEl` so listeners re-bind to a newly-mounted
  // scroll container after returning from the Summary page.
  useEffect(() => {
    const root = primaryScrollEl;
    if (!root) return;

    let rafId = 0;
    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!root.isConnected) return;
        const overflow = root.scrollWidth > root.clientWidth + 1;
        setPrimaryHasOverflow(overflow);
        setPrimaryCanPrev(root.scrollLeft > 1);
        setPrimaryCanNext(root.scrollLeft + root.clientWidth < root.scrollWidth - 1);
      });
    };

    scheduleUpdate();
    root.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    // Observe root + each slot. Slot-level observation catches layout-mode
    // switches (grid → flex) that don't change the root's own box size.
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(root);
    root
      .querySelectorAll<HTMLElement>('[data-slot-index]')
      .forEach((el) => ro.observe(el));

    // Explicit breakpoint listeners as a final safety net.
    const mqlMd = window.matchMedia('(min-width: 768px)');
    const mqlLg = window.matchMedia('(min-width: 1024px)');
    mqlMd.addEventListener('change', scheduleUpdate);
    mqlLg.addEventListener('change', scheduleUpdate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      root.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      ro.disconnect();
      mqlMd.removeEventListener('change', scheduleUpdate);
      mqlLg.removeEventListener('change', scheduleUpdate);
    };
  }, [primaryScrollEl]);

  // Scroll by one card "stride" (card width + gap). Measured from actual DOM.
  // Also: predict the final visibility array and set it immediately, so the
  // bar runs a SINGLE 300ms animation that lines up with the native smooth
  // scroll — instead of two sequential animations triggered mid-scroll by
  // the IntersectionObserver.
  const scrollPrimaryByCard = (direction: 1 | -1) => {
    const root = primaryScrollRef.current;
    if (!root) return;
    const slots = root.querySelectorAll<HTMLElement>('[data-slot-index]');
    if (slots.length < 2) return;
    const stride =
      slots[1].getBoundingClientRect().left - slots[0].getBoundingClientRect().left;
    root.scrollBy({ left: stride * direction, behavior: 'smooth' });

    // Predict new visibility: shift the current visible run by one slot in
    // the scroll direction. If prediction exceeds bounds, leave state alone.
    setPrimaryVisibility((prev) => {
      const firstVisible = prev.indexOf(true);
      const lastVisible = prev.lastIndexOf(true);
      if (firstVisible < 0) return prev;
      const nextFirst = firstVisible + direction;
      const nextLast = lastVisible + direction;
      if (nextFirst < 0 || nextLast >= prev.length) return prev;
      const next = prev.map(() => false);
      for (let i = nextFirst; i <= nextLast; i++) next[i] = true;
      return next;
    });

    // Block observer-driven updates for the duration of the animation so the
    // intermediate [F,T,F] ratios don't override our prediction. Use a slight
    // buffer beyond INDICATOR_ANIM_MS to ensure the bar anim has fully settled.
    primaryAnimatingRef.current = true;
    if (primaryAnimatingTimeoutRef.current !== null) {
      window.clearTimeout(primaryAnimatingTimeoutRef.current);
    }
    primaryAnimatingTimeoutRef.current = window.setTimeout(() => {
      primaryAnimatingRef.current = false;
      primaryAnimatingTimeoutRef.current = null;
    }, INDICATOR_ANIM_MS + 50);
  };

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectOption(opt: FenceOption) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedOption(opt);
  }

  function dismissCurtain() {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setCurtainMounted(false);
  }

  // Smart scroll target: when the comparison mini-header cards are rendered
  // AND visible (overflow state on XS/S/M), jump to their top edge;
  // otherwise fall back to the Parameter Comparison heading.
  // `offsetParent === null` means the element is `display:none` (or hidden via
  // a lg:hidden ancestor), so it's in the DOM but not visible.
  function scrollToCompareArea() {
    const cards = document.getElementById('comparison-cards');
    const target =
      cards && cards.offsetParent !== null
        ? cards
        : document.getElementById('comparison');
    target?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Comparison overflow state ──────────────────────────────────────────────
  // When total options > visible comparison slots (overflow), two options are
  // shown side-by-side on < lg and a "Change Option" button is exposed so the
  // user can swap in any hidden option via a menu (menu is a future iteration).
  //
  // Visible slots per breakpoint:
  //   XS/S/M (< lg):  2 slots  → overflow if OPTIONS.length > 2
  //   L+ (lg+):       3 slots  → overflow if OPTIONS.length > 3
  //
  // `comparisonPair` holds the IDs of the 2 options currently being compared
  // on < lg. Rendering: we still iterate all OPTIONS in document order and hide
  // the ones NOT in the pair via `hidden lg:block/flex`, so lg+ always sees all
  // options regardless of pair state, and grid auto-flow places the 2 visible
  // items in the 2 columns in document order.
  const [comparisonPair, _setComparisonPair] = useState<[number, number]>(
    [OPTIONS[0].id, OPTIONS[1].id]
  );
  const isInPair = (id: number) => comparisonPair.includes(id);
  const hasOverflow = OPTIONS.length > 2;
  // Change Option button: stub for now; menu is a future iteration.
  const openChangeOptionMenu = (_optId: number) => {
    // no-op — menu will be implemented in a later iteration
  };

  const comparisonOptions = OPTIONS; // rendered with CSS visibility per column

  // Once approved, the Project Hub page replaces Summary for the chosen option.
  if (selectedOption && approved) {
    return (
      <ProjectHubPageResponsive
        option={selectedOption as SummaryFenceOption}
        addons={addons}
        approvedAt={approvedAt}
        onShowCover={() => {
          setSelectedOption(null);
          setApproved(false);
          setApprovedAt(null);
          setCurtainMounted(true);
        }}
      />
    );
  }

  // Show Summary page when an option is selected but not yet approved.
  if (selectedOption) {
    return (
      <SummaryPageResponsive
        option={selectedOption as SummaryFenceOption}
        addons={addons}
        setAddons={setAddons}
        onBack={() => {
          setSelectedOption(null);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        onShowCover={() => {
          setSelectedOption(null);
          setCurtainMounted(true);
        }}
        onApproved={() => {
          setApproved(true);
          setApprovedAt(new Date());
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {curtainMounted && (
        <CoverCurtain onDismiss={dismissCurtain} />
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

        {/* ── Section 1: Primary All Option List ─────────────────────────────
          Horizontal overflow strategy (total > visible columns → horizontal scroll):
            XS/S  (< md):   flex-col, all cards stacked vertically (no horizontal overflow)
            M     (md):     flex-row, horizontal scroll when total > 2
                            Card width: (100% − 2 × 12px gap) / (2 + 1/8)
                            → 2 full cards + 1/8 of next card peeking on the right
            L+    (lg+):    3-col grid (currently total = 3, no overflow)
                            Future iteration: add scroll on L+ when total > 3

          Why calc((100%−24px)/2.125): 2 full cards + 2 gaps + 1/8 card = visible width
            cardW = (visibleW − 2·gap) / (2 + 1/8)
        */}
        {/*
          md:overflow-y-hidden is explicit on purpose: the IntersectionObserver
          spec expands the root's intersection rect to include any axis that
          has `overflow: visible` (including the default). Without an explicit
          overflow-y on M, the observer may mistakenly report horizontally-
          overflowing cards as fully visible.
        */}
        <div
          ref={setPrimaryScrollNode}
          data-card-container
          className="flex flex-col gap-4 md:flex-row md:gap-3 md:overflow-x-auto md:overflow-y-hidden scrollbar-none lg:grid lg:grid-cols-3 lg:overflow-visible"
        >
          {OPTIONS.map((opt, i) => (
            <PrimaryOptionSlot
              key={opt.id}
              opt={opt}
              index={i}
              isFullyVisible={primaryVisibility[i] ?? true}
              onSelect={() => selectOption(opt)}
            />
          ))}
        </div>

        {/* Overflow Navigation — shown only when the All Option List actually
            overflows horizontally (scrollWidth > clientWidth). Disabled arrows
            at the scroll edges; indicator merges consecutive fully-visible
            option dots into a single pill.

            Spacing: total gap between the list and nav = Spacing M
              Low density (XS/S):   24px  = parent gap-4 (16) + mt-2 (8)
              Medium density (md+): 16px  = parent gap-3 (12) + md:mt-1 (4) */}
        {primaryHasOverflow && (
          <div className="mt-2 md:mt-1">
            <OverflowNavigation
              visibility={primaryVisibility}
              canPrev={primaryCanPrev}
              canNext={primaryCanNext}
              onPrev={() => scrollPrimaryByCard(-1)}
              onNext={() => scrollPrimaryByCard(1)}
            />
          </div>
        )}

        {/* ── Back to Top (mobile only, between main cards and need-support) */}
        <div className="flex justify-center md:hidden">
          <BackToTopButton onClick={scrollToTop} />
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
            onClick={scrollToCompareArea}
            className="md:hidden w-full h-10 bg-white border border-[#262626] rounded-[4px] text-[14px] text-[rgba(0,0,0,0.85)] flex items-center justify-center gap-0.5 cursor-pointer"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            COMPARE OPTIONS
          </button>

          {/* Desktop: text link with chevron-down */}
          <button
            onClick={scrollToCompareArea}
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

        {/*
          Mini comparison header cards.
          Show on XS/S/M when there's overflow (total > 2 visible slots);
          hidden on L+ since the comparison table already shows all options.
          The card NOT in comparisonPair is hidden via `hidden lg:block`.
        */}
        {hasOverflow && (
          <div id="comparison-cards" data-card-container className="grid grid-cols-2 gap-4 lg:hidden">
            {comparisonOptions.map((opt) => (
              <div key={opt.id} className={isInPair(opt.id) ? '' : 'hidden lg:block'}>
                <OptionCard
                  opt={opt}
                  onSelect={() => selectOption(opt)}
                  onChangeOption={() => openChangeOptionMenu(opt.id)}
                />
              </div>
            ))}
          </div>
        )}

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

          {/* Param columns: 2-col on <lg (shows comparisonPair), 3-col on lg+ (all) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
            {comparisonOptions.map((opt) => (
              <div
                key={opt.id}
                className={`bg-white flex flex-col${isInPair(opt.id) ? '' : ' hidden lg:flex'}`}
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

          {/* Product columns: 2-col on <lg (shows comparisonPair), 3-col on lg+ (all) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
            {comparisonOptions.map((opt) => (
              <div
                key={opt.id}
                className={`flex flex-col${isInPair(opt.id) ? '' : ' hidden lg:flex'}`}
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

        {/*
          Section 5: Bottom option cards (mirror of the comparison header — same pair on < lg, all on lg+).
          Change Option button exposed only on the two pair-visible cards, matching the header.
        */}
        <div id="section-5-cards" data-card-container className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
          {comparisonOptions.map((opt) => (
            <div key={opt.id} className={isInPair(opt.id) ? '' : 'hidden lg:block'}>
              <OptionCard
                opt={opt}
                onSelect={() => selectOption(opt)}
                // Button auto-hidden on lg+ inside OptionCard via `lg:hidden`.
                onChangeOption={hasOverflow ? () => openChangeOptionMenu(opt.id) : undefined}
              />
            </div>
          ))}
        </div>

      </div>
      </div>
    </div>
  );
}
