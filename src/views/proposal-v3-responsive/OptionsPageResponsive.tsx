'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect runs synchronously before paint (prevents scrollbar flash).
// Falls back to useEffect on the server to avoid SSR warnings.
const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import SummaryPageResponsive from './SummaryPageResponsive';
import ProjectHubPageResponsive from './ProjectHubPageResponsive';
import SignatureOverlay from './SignatureOverlay';
import type { FenceOption as SummaryFenceOption, AddonItem } from './SummaryPageResponsive';
import { DEFAULT_ADDONS } from './SummaryPageResponsive';
import PageHeader from './PageHeader';
import BackToTopButton from './BackToTopButton';
import ScrollHintArrows from './ScrollHintArrows';
import { DevConsoleProvider, useDevConsole } from './DevConsoleContext';
import DevConsole from './DevConsole';
import ChangeOrderPage from './ChangeOrderPage';
import type { ProjectHubTab } from './ProjectHubStickyHeader';
import ValidUntilPill from './ValidUntilPill';
import ProductDetailSheet, {
  Checkbox,
  NoImageThumb,
  type ProductDetailContent,
  type UpgradeOption,
} from './ProductDetailSheet';
import PaymentScheduleDialog, {
  type PaymentScheduleData,
} from './PaymentScheduleDialog';
import { ContactSalesModal } from './SalesContactCard';
import { CalendarIcon, DocumentIcon, NoSymbolIcon, PhoneIcon } from './SvgIcons';
import { ArrowUp, ChevronThin, ProductInfo, Recommended, XmarkLarge } from './icons';

// ── Equal-height hook ─────────────────────────────────────────────────────────
// For each [data-card-container], finds all [data-card-section="X"] elements,
// resets their heights, measures the tallest, then applies that height to all.
// Runs on mount and on every resize (also handles image-load reflows).
const CARD_SECTION_TYPES = ['name', 'features', 'time', 'price'] as const;

function syncCardSectionHeights() {
  const containers = document.querySelectorAll<HTMLElement>('[data-card-container]');
  containers.forEach((container) => {
    CARD_SECTION_TYPES.forEach((type) => {
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
}

function useSyncCardSectionHeights(...deps: unknown[]) {
  useEffect(() => {
    // Run once after first paint (images may not be loaded yet, handled by ResizeObserver)
    const rafId = requestAnimationFrame(syncCardSectionHeights);
    // Re-run on any resize (viewport change OR image load reflowing layout)
    const ro = new ResizeObserver(() => requestAnimationFrame(syncCardSectionHeights));
    ro.observe(document.documentElement);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
    // Re-run when callers pass deps that affect card content layout (e.g.
    // DevConsole's Option Image toggle swaps the image for a banner without
    // changing document height, so the ResizeObserver above doesn't fire).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
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
type FenceProduct = {
  name: string;
  qty: string;
  unit: string;
  /** Long-form description shown in the Product Detail sheet. */
  description?: string;
  /** When set, the product is "upgradeable" — clicking opens the Upgrade Detail
   *  sheet so the user can swap to a different option. */
  upgradeOptions?: UpgradeOption[];
};

type FenceOption = {
  id: number;
  label: string;
  features: string;
  constructionTime: string;
  price: string;
  contractTotal: string;
  monthly: string;
  image: string;
  products: FenceProduct[];
  /** Base materials cost (before any addons) used to compute dynamic financials on Summary page. */
  baseMaterials: number;
};

// Master list of demo options. The DevConsole controls how many of these are
// actually rendered via `config.optionCount` (1–4). When you add new entries
// here, also bump the max in DevConsole's selector.
const ALL_OPTIONS: FenceOption[] = [
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
      {
        name: 'Line Posts',
        qty: '24',
        unit: 'ea.',
        upgradeOptions: [
          {
            id: 'line-1-5',
            title: '1⅝" Light-Duty Galvanized Line Posts',
            description:
              'Cost-effective galvanized line posts at the most common residential gauge. The thinner 1⅝" diameter is well-suited to short runs and yards without high wind exposure.',
            priceDelta: 0,
          },
          {
            id: 'line-2',
            title: '2" Standard Galvanized Line Posts',
            description:
              'The most popular gauge for chain-link runs of any meaningful length. The 2" diameter improves rigidity and lifetime versus light-duty stock without a significant cost premium.',
            priceDelta: 120,
          },
          {
            id: 'line-2-5',
            title: '2½" Commercial-Grade Line Posts',
            description:
              'Heavier wall thickness and a larger 2½" profile for commercial yards, perimeter security, or sites with sustained wind load. Pairs well with heavier-gauge top rail.',
            priceDelta: 280,
          },
        ],
      },
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
      {
        name: 'Vinyl Panels',
        qty: '960',
        unit: 'sqf.',
        description:
          "A durable white vinyl fence panel designed for a clean, low-maintenance privacy fence. The 4'×6' panel format provides solid coverage while keeping the overall fence profile modest and residential-friendly. Its bright white finish creates a classic look and resists rot, peeling, and frequent repainting.",
      },
      {
        name: 'Vinyl Posts',
        qty: '24',
        unit: 'ea.',
        upgradeOptions: [
          {
            id: 'std-4x4',
            title: '4"×4" Standard White Vinyl Line Posts',
            description:
              'A clean, low-maintenance post option for standard fence runs. The 4" × 4" profile provides a simple residential look and pairs well with matching white vinyl panels, while the durable PVC construction helps resist moisture, rot, and repainting needs.',
            priceDelta: 0,
          },
          {
            id: 'std-5x5',
            title: '5"×5" Heavy-Duty White Vinyl Posts',
            description:
              'A heavier-gauge post option for fence runs that need extra rigidity. The 5" × 5" profile resists wind load better than standard line posts and pairs well with taller panels or longer spans.',
            priceDelta: 220,
          },
          {
            id: 'premium-alum',
            title: '5" × 5" Premium Aluminum-Insert Vinyl Posts',
            description:
              'A premium post option with an internal aluminum insert for added strength and long-term durability. The taller 7′ height provides additional embedment depth and stability, making it a strong choice for gates, corners, and higher-stress sections of the fence while maintaining the classic low-maintenance white vinyl finish.',
            priceDelta: 480,
          },
        ],
      },
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
      {
        name: 'Aluminum Posts',
        qty: '24',
        unit: 'ea.',
        upgradeOptions: [
          {
            id: 'alum-2x2-black',
            title: '2"×2" Standard Black Aluminum Posts',
            description:
              'The default residential post profile in matte black. A clean, ornamental look that pairs naturally with the matching panels and resists rust on long, exposed runs.',
            priceDelta: 0,
          },
          {
            id: 'alum-2-5-bronze',
            title: '2½"×2½" Architectural Bronze Posts',
            description:
              'A slightly heavier profile finished in textured bronze for a warmer, more architectural look. Best for projects where the fence is a visible front-yard feature.',
            priceDelta: 340,
          },
          {
            id: 'alum-3-hd',
            title: '3"×3" Heavy-Duty Black Posts',
            description:
              'A commercial-grade post for tall sections, gate openings, and exposed corners. The extra wall thickness handles taller panels and gate hardware without flex.',
            priceDelta: 520,
          },
        ],
      },
      { name: 'Finials & Decorative', qty: '96', unit: 'ea.' },
      { name: 'Hardware & Fittings', qty: '1', unit: 'set' },
    ],
  },
  {
    id: 4,
    label: 'OPTION 4 - WOOD PRIVACY FENCE',
    features: 'Natural Look / Customizable / Privacy',
    constructionTime: '3–5 Weeks',
    price: '$10,800.00 USD',
    contractTotal: '$10,800.00',
    monthly: '$507.00 / mo',
    // Reuses option-1 imagery — only 3 hero images exist in /public.
    image: IMG_OPTION_1,
    // baseMaterials: 10527 → discount $526 → afterDisc $10,001 → tax $800 → total ~$10,800
    baseMaterials: 10527,
    products: [
      { name: 'Wood Pickets', qty: '960', unit: 'sqf.' },
      {
        name: 'Wood Posts',
        qty: '24',
        unit: 'ea.',
        upgradeOptions: [
          {
            id: 'wood-pt-pine',
            title: '4"×4" Pressure-Treated Pine Posts',
            description:
              'The standard residential post — pressure-treated southern yellow pine. Affordable, easy to source, and resistant to rot when set in concrete.',
            priceDelta: 0,
          },
          {
            id: 'wood-cedar',
            title: '4"×4" Western Red Cedar Posts',
            description:
              'A natural rot- and insect-resistant cedar post. Ages to a soft silver-gray when left unfinished and pairs beautifully with cedar pickets.',
            priceDelta: 240,
          },
          {
            id: 'wood-cedar-6',
            title: '6"×6" Premium Cedar Posts',
            description:
              'A heavier 6"×6" cedar post for taller privacy fences, gate frames, and corner runs. The larger cross-section adds rigidity and a more substantial look.',
            priceDelta: 520,
          },
        ],
      },
      { name: 'Top & Bottom Rails', qty: '320', unit: 'lf.' },
      { name: 'Hardware & Fittings', qty: '1', unit: 'set' },
    ],
  },
];

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function ArrowUpIcon() {
  return (
    <ArrowUp size={16} color="#262626" />
  );
}

function ChevronDownIcon(_props: { size?: number } = {}) {
  // Was 10×10 inline; standardized to 16×16 via the DL `chevron-thin` glyph.
  return (
    <span className="animate-bounce inline-flex">
      <ChevronThin size={16} color="#262626" />
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
  // DL chevron rotated to face left (prev) or right (next). Only the icon
  // dims when the button is disabled — the pill background (#f0f0f0) stays
  // at full opacity.
  return (
    <ChevronThin
      size={16}
      color="#262626"
      rotate={direction === 'prev' ? 90 : 270}
      style={{ opacity: disabled ? 0.4 : 1 }}
    />
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
  totalOptions,
  isFullyVisible,
  onSelect,
}: {
  opt: FenceOption;
  index: number;
  totalOptions: number;
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

  // Slot widths per total-option count:
  //   2 options : '' — parent uses a 2-col grid that sizes children
  //   3 options : md = 2.125-card peek scroll, lg+ = `auto` inside grid-cols-3
  //   4+ options: md = 2.125-card peek, lg+ = 3.125-card peek (still scrolls)
  // 3.125-card formula: 3 visible + 1/8 peek with 3 gaps of 12px → (100%−36px)/3.125
  const slotClassName =
    totalOptions === 2
      ? ''
      : totalOptions === 3
      ? 'md:shrink-0 md:w-[calc((100%-24px)/2.125)] lg:w-auto'
      : 'md:shrink-0 md:w-[calc((100%-24px)/2.125)] lg:w-[calc((100%-36px)/3.125)]';

  return (
    <div
      ref={slotRef}
      data-slot-index={index}
      className={slotClassName}
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
// `changeOptionVisibleOnLg`: by default the button is `lg:hidden` because lg+
// fits 3 columns and 3-or-fewer options have no overflow. With 4+ options the
// lg+ comparison also overflows, so this flag drops the `lg:hidden` so users
// can swap options on desktop too.
function OptionCard({
  opt,
  onSelect,
  onChangeOption,
  changeOptionVisibleOnLg = false,
  selectLabel,
  selectDisabled = false,
  bottomCta,
  selected = false,
}: {
  opt: FenceOption;
  onSelect: () => void;
  onChangeOption?: () => void;
  changeOptionVisibleOnLg?: boolean;
  /** Override the Select button label (e.g. "Included in Comparison"). */
  selectLabel?: string;
  /** Render the Select button in its disabled state — no click handler,
   *  greyed bg/text, not-allowed cursor. Used in the Change Option picker
   *  for options already in the comparison list. */
  selectDisabled?: boolean;
  /** When provided, replaces the entire bottom CTA block (Select + optional
   *  Change Option) with this node. Used by the Change Option picker's
   *  checkbox variant to swap the button for an inline checkbox row. */
  bottomCta?: React.ReactNode;
  /** When true, wraps the card in a 2px black border — used by the
   *  Change Option picker's checkbox variant to mark options currently in
   *  the comparison list. Uses border (not outline) so the stroke renders
   *  INSIDE the card's box and isn't clipped by the scroll container's
   *  overflow-x-auto at the edges. A transparent 2px border is reserved
   *  in the unselected state so toggling doesn't shift card content. */
  selected?: boolean;
}) {
  const { config } = useDevConsole();
  const isRecommended = config.recommendedOption === opt.id;
  const imageExcluded = config.optionImage === 'exclude';
  const someoneRecommended = config.recommendedOption !== 0;
  return (
    <div
      className="flex flex-col"
      style={{
        border: '2px solid',
        borderColor: selected ? '#000000' : 'transparent',
      }}
    >
      {imageExcluded ? (
        <CardBanner isRecommended={isRecommended} compact={!someoneRecommended} />
      ) : (
        /* Hero image — aspect ratio 800:471 */
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '800 / 471' }}>
          <img
            src={opt.image}
            alt={opt.label}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {isRecommended && <RecommendedBadge />}
        </div>
      )}

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
          {config.constructionTimeInfo === 'include' && (
            <p
              data-card-section="time"
              className="text-[14px] text-[#262626] leading-normal tracking-[-0.14px] overflow-hidden"
              style={{ fontFamily: 'Segoe UI, sans-serif' }}
            >
              {opt.constructionTime} Estimated Construction Time
            </p>
          )}
          <p
            data-card-section="price"
            className="font-semibold text-[20px] text-[#262626] tracking-[-0.2px] overflow-hidden"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {opt.price}
          </p>
        </div>

        {/* CTAs — Select (always) + Change Option (comparison overflow only).
            When `bottomCta` is provided (e.g. Change Option picker's checkbox
            variant) it replaces the whole block. */}
        {bottomCta ?? (
          <div className="flex flex-col gap-4 md:gap-3 w-full">
            <button
              onClick={selectDisabled ? undefined : onSelect}
              disabled={selectDisabled}
              className={[
                'w-full h-10 text-[14px] font-semibold rounded-[4px] flex items-center justify-center',
                selectDisabled
                  ? 'bg-[#f5f5f5] text-[rgba(0,0,0,0.25)] cursor-not-allowed'
                  : 'bg-[#d41a32] text-white cursor-pointer',
              ].join(' ')}
              style={{ fontFamily: 'Segoe UI, sans-serif', lineHeight: '18px' }}
            >
              {selectLabel ?? 'Select'}
            </button>
            {/* Change Option — shown only when handler provided AND overflow exists.
                Hidden on lg+ because lg+ has enough slots to show all options (no overflow).
                Figma: h-40px, white bg, border #d9d9d9, 14px text, color rgba(0,0,0,0.85) */}
            {onChangeOption && (
              <button
                onClick={onChangeOption}
                className={`${changeOptionVisibleOnLg ? '' : 'lg:hidden '}w-full h-10 bg-white border border-solid border-[#d9d9d9] text-[14px] rounded-[4px] flex items-center justify-center cursor-pointer`}
                style={{ fontFamily: 'Segoe UI, sans-serif', color: 'rgba(0,0,0,0.85)' }}
              >
                Change Option
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Recommended label ─────────────────────────────────────────────────────────
// Inner icon + text used by both the floating image pill (`RecommendedBadge`)
// and the inline banner (`CardBanner`) so the typography stays consistent.
// Figma node 1084:24272: 10×10 thumb-up icon (scaled responsively to 12–14px),
// Barlow Semi Condensed SemiBold 12/14 → 13/15 → 14/16 white.
function RecommendedLabel({ color = 'white' }: { color?: string }) {
  return (
    <div
      className="flex items-center gap-[4px]"
      style={{ fontFamily: 'var(--font-barlow-semi-condensed), sans-serif', color }}
    >
      {/* DL recommended-16x16 — inherits the surrounding `color` via the
          `color` prop (e.g. white on the red pill). */}
      <Recommended size={16} color={color} />
      <p className="text-[12px] leading-[14px] md:text-[13px] md:leading-[15px] lg:text-[14px] lg:leading-[16px] font-semibold whitespace-nowrap">
        RECOMMENDED
      </p>
    </div>
  );
}

// ── Recommended badge ─────────────────────────────────────────────────────────
// Red pill in the bottom-left of the option card image. Visibility is driven by
// DevConsole's `recommendedOption` (matching the option's `id`).
function RecommendedBadge() {
  return (
    <div className="absolute bottom-3 left-4 md:left-6 bg-[#d41a32] rounded-[2px] px-[6px] py-[5px]">
      <RecommendedLabel />
    </div>
  );
}

// ── Card banner (image-excluded mode) ─────────────────────────────────────────
// Replaces the hero image when DevConsole's Option Image toggle is 'exclude'.
// All banners share the same neutral grey; the recommended option additionally
// renders the secondary-grey label inline, left-aligned with the card's text.
// `compact` collapses the banner to half height — used when no option is
// flagged recommended, so the banners read more as a decorative divider.
function CardBanner({
  isRecommended,
  compact,
}: {
  isRecommended: boolean;
  compact: boolean;
}) {
  return (
    <div
      className="w-full flex items-center px-4 md:px-6"
      style={{
        backgroundColor: '#e5e5e5',
        height: compact ? '20px' : '40px',
      }}
    >
      {!compact && (
        // Reserve label-sized space so all (non-compact) banners share height.
        <div style={{ visibility: isRecommended ? 'visible' : 'hidden' }}>
          <RecommendedLabel color="#737373" />
        </div>
      )}
    </div>
  );
}

// ── Comparison Parameter row ──────────────────────────────────────────────────
function ComparisonParam({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex flex-col border-t border-t-[rgba(0,0,0,0.1)] w-full py-3 md:py-2${onClick ? ' cursor-pointer' : ''}`}
      style={{ borderTopWidth: '0.5px' }}
      onClick={onClick}
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
  onClick,
  isUpgradeable,
}: {
  name: string;
  qty: string;
  unit: string;
  showThumb?: boolean;
  onClick?: () => void;
  /** When true, shows a "Change" pill on the row instead of just the info icon. */
  isUpgradeable?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 items-start bg-white border-t border-t-[rgba(0,0,0,0.1)] w-full py-3 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{ borderTopWidth: '0.5px' }}
      onClick={onClick}
    >
      {/* Thumbnail — only on desktop (lg+). No-image fallback (light gray bg +
          white logo) matches the big hero placeholder in the detail sheet. */}
      {showThumb && (
        <div className="hidden lg:flex">
          <NoImageThumb size={48} />
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
          {isUpgradeable ? (
            <div
              className="flex items-center justify-center shrink-0 h-6 px-2 rounded-[2px] border border-solid border-[#262626] text-[12px] text-[#262626]"
              style={{ fontFamily: 'Segoe UI, sans-serif' }}
            >
              Change
            </div>
          ) : (
            <div className="flex items-center justify-center shrink-0 w-6 h-6">
              <ProductInfo size={16} color="#262626" />
            </div>
          )}
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
function CoverPageContent({
  onExplore,
  singleOptionMode = false,
  showInspectionReport = true,
  recalled = false,
  expired = false,
  showCompanySlogan = true,
}: {
  onExplore: () => void;
  /** When true, the proposal has only one option, so the CTA reads
   *  "EXPLORE PROPOSAL" instead of "EXPLORE OPTIONS" — there's nothing to
   *  choose between, the curtain reveals the proposal itself. */
  singleOptionMode?: boolean;
  /** When false, the cover hides the "Inspection Report" CTA (used by the
   *  DevConsole to demo proposals without an attached inspection report). */
  showInspectionReport?: boolean;
  /** When true (Proposal Status = Recalled / Deleted / Lost / Void), the
   *  "Valid Until" line is replaced with a yellow "Proposal No Longer
   *  Available" pill, and the primary CTA becomes the secondary outlined
   *  "Contact Sales" button — the curtain itself is also locked. */
  recalled?: boolean;
  /** When true (Proposal Status = Expired), the "Valid Until" line is
   *  replaced with a yellow "Expired on April 30, 2026" pill plus an
   *  expiration note, and the CTAs become "View Expired Proposal" +
   *  "Contact Sales". The curtain is still dismissable — clicking
   *  View Expired Proposal opens the (out-of-date) proposal beneath. */
  expired?: boolean;
  /** When false (DevConsole Company Slogan = Disabled), the
   *  "Build Your Dream Fence" tagline row is omitted. */
  showCompanySlogan?: boolean;
}) {
  const exploreLabel = singleOptionMode ? 'EXPLORE PROPOSAL' : 'EXPLORE OPTIONS';
  // Pill padding tracks the pill text size — pills' text steps 14→16px at
  // xl, so padding steps one notch up at the same breakpoint
  // (px-5 py-2.5 → px-6 py-3). No other tiers; XS through L share one
  // padding, XL and XXL share the next.
  const pillPadding = 'px-5 py-2.5 xl:px-6 xl:py-3';
  // Regular state — light gray pill showing the validity date with a small
  // calendar glyph. Auto-width, horizontally centered inside the surrounding
  // flex column via self-center.
  const validUntilPill = (
    <ValidUntilPill date="April 30, 2026" className="self-center" />
  );
  // Recalled state — yellow status pill + supporting body copy. Replaces the
  // Valid Until pill (which doesn't apply once the proposal is recalled).
  const recallNotice = (
    <div className="flex flex-col items-center gap-3 w-full">
      <span
        className={`inline-flex items-center gap-2 bg-[#facc15] text-[#262626] text-[14px] xl:text-[16px] font-semibold ${pillPadding} rounded-[6px] leading-none`}
      >
        <NoSymbolIcon size={16} />
        Proposal No Longer Available
      </span>
      <p className="text-[12px] sm:text-[14px] xl:text-[16px] text-[#737373] text-center leading-normal max-w-[420px] xl:max-w-[520px]">
        For assistance or further requests, please contact your sales representative.
      </p>
    </div>
  );
  // Expired state — same yellow background as the recall pill, but with the
  // date (no NoSymbolIcon — it's still a date pill, just out of date) and a
  // soft "out of date" note. Curtain remains dismissable from this state.
  const expiredNotice = (
    <div className="flex flex-col items-center gap-3 w-full">
      <span
        className={`inline-flex items-center gap-2 bg-[#facc15] text-[#262626] text-[14px] xl:text-[16px] ${pillPadding} rounded-[6px] leading-none`}
      >
        <span>Expired on</span>
        {/* Icon + date on a tighter inner gap (4px) — matches the
            Valid Until pill so the calendar glyph reads as a prefix. */}
        <span className="inline-flex items-center gap-1">
          <CalendarIcon size={16} />
          <span>April 30, 2026</span>
        </span>
      </span>
      <p className="text-[12px] sm:text-[14px] xl:text-[16px] text-[#737373] text-center leading-normal max-w-[420px] xl:max-w-[520px]">
        This proposal has expired. Some information may be out of date. Please contact your sales representative for an updated proposal.
      </p>
    </div>
  );
  // Pick the right top block per state — only one of these renders at a time.
  const topBlock = recalled
    ? recallNotice
    : expired
      ? expiredNotice
      : validUntilPill;
  // Recalled-state Contact Sales dialog. Shares the same modal component
  // used by Project Hub so the dialog content is consistent across surfaces.
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  // Hidden affordance — triple-clicking the cover logo opens the DevConsole.
  // Lets us reach the console while the curtain is up (e.g. Recalled state
  // hides the PageHeader's developer-console button behind the curtain).
  // 500ms rolling window so a normal double-click never trips it.
  const { open: openDevConsole } = useDevConsole();
  const logoClickTimestamps = useRef<number[]>([]);
  const handleLogoClick = () => {
    const now = Date.now();
    const recent = logoClickTimestamps.current.filter((t) => now - t < 500);
    recent.push(now);
    logoClickTimestamps.current = recent;
    if (recent.length >= 3) {
      logoClickTimestamps.current = [];
      openDevConsole();
    }
  };
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
      <div
        onClick={handleLogoClick}
        className="shrink-0 aspect-square md:hidden"
        style={{ width: 'min(33.333%, 180px)' }}
      >
        <img src={IMG_COVER_LOGO} alt="Madison Fence Company" className="w-full h-full object-cover" />
      </div>
      <div
        onClick={handleLogoClick}
        className="shrink-0 aspect-square hidden md:block"
        style={{ width: 'min(20%, 320px)' }}
      >
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

      {/* Tagline — Font M: 14→16→20px across XS/S/XL.
          DevConsole Company Slogan = Disabled keeps the element in the
          DOM (visibility:hidden) so the surrounding gap-12/gap-8 between
          the proposal info and the CTAs stays identical with/without the
          tagline — i.e. flipping the toggle never shifts other elements. */}
      <p
        className="text-[14px] sm:text-[16px] xl:text-[20px] font-light text-[#262626] text-center leading-normal"
        style={showCompanySlogan ? undefined : { visibility: 'hidden' }}
        aria-hidden={showCompanySlogan ? undefined : true}
      >
        Build Your Dream Fence
      </p>

      {/* ── CTAs: Mobile (Low Density, <md) ────────────────────────────── */}
      {/* Order:
          Regular  : Valid Until pill → Explore (red) → Inspection (outlined)
          Recalled : Recall notice → Contact Sales (outlined)
          Expired  : Expired notice → Contact Sales (outlined) →
                     View Expired Proposal (outlined)                      */}
      {/* Gap = Spacing S = 16px (Low Density)                             */}
      <div className="md:hidden flex flex-col gap-4 w-full">
        {topBlock}
        {/* Recalled / Expired primary slot is the outlined Contact Sales
            button (same shape as Project Hub's Contact Sales — phone icon +
            sentence-case label, opens ContactSalesModal). Regular keeps the
            red Explore button. */}
        {recalled || expired ? (
          <button
            type="button"
            onClick={() => setContactSalesOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={contactSalesOpen}
            className="bg-white border border-solid border-[#262626] flex gap-[6px] h-10 items-center justify-center px-4 rounded-[4px] w-full cursor-pointer"
          >
            <PhoneIcon size={16} />
            <span className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
              Contact Sales
            </span>
          </button>
        ) : (
          <button
            onClick={onExplore}
            className="w-full h-10 bg-[#d41a32] text-white text-[14px] font-semibold flex items-center justify-center cursor-pointer"
            style={{ lineHeight: '18px' }}
          >
            {exploreLabel}
          </button>
        )}
        {/* Expired-only — outlined "View Expired Proposal" added BELOW
            Contact Sales. Clicking it dismisses the curtain like Explore. */}
        {expired && (
          <button
            type="button"
            onClick={onExplore}
            className="w-full h-10 bg-white border border-solid border-[#262626] flex items-center justify-center px-4 rounded-[4px] cursor-pointer"
          >
            <span className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
              View Expired Proposal
            </span>
          </button>
        )}
        {/* Inspection — h-10 (40px), font/size/body/medium = 14px fixed.
            Regular           : outlined full-width button below Explore.
            Recalled / Expired: borderless variant below the primary CTAs
                                (no border, no fill) — keeps the affordance
                                but visually demotes it.
            Hidden entirely when DevConsole's Inspection Report = Hidden. */}
        {showInspectionReport &&
          (recalled || expired ? (
            <button className="w-full h-10 bg-transparent text-[rgba(0,0,0,0.85)] text-[14px] flex gap-2 items-center justify-center cursor-pointer">
              <DocumentIcon size={16} />
              View Inspection Report
            </button>
          ) : (
            <button className="w-full h-10 bg-white border border-[#262626] text-[rgba(0,0,0,0.85)] text-[14px] flex items-center justify-center cursor-pointer">
              INSPECTION REPORT
            </button>
          ))}
      </div>

      {/* ── CTAs: Desktop (Medium Density, md+) ────────────────────────── */}
      {/* Order @ all md+: top block (pill / notice) → button row, via the
          order-first wrapper around the top block.
          Button row contents:
            Regular  : [Inspection (outlined) | Explore (red)]
            Recalled : [Contact Sales (outlined, full width)]
            Expired  : [View Expired Proposal (outlined) | Contact Sales (outlined)]
          Expired puts View Expired Proposal on the LEFT per the design spec. */}
      {/* Outer gap = Spacing L = 24px (Medium Density)                    */}
      <div className="hidden md:flex flex-col gap-6 w-full items-center">
        {/* Button row — 12px gap (hardcoded in design) */}
        <div className="flex gap-3 items-center justify-center w-full">
          {recalled ? (
            // Recalled: single full-width Contact Sales button (caps at
            // 492px — matches the original 2-button total width: 240 + 12 + 240).
            <button
              type="button"
              onClick={() => setContactSalesOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={contactSalesOpen}
              className="flex-1 h-11 max-w-[492px] bg-white border border-solid border-[#262626] flex gap-[6px] items-center justify-center px-4 rounded-[4px] cursor-pointer"
            >
              <PhoneIcon size={16} />
              <span className="text-[16px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
                Contact Sales
              </span>
            </button>
          ) : expired ? (
            // Expired: View Expired Proposal | Contact Sales, both outlined.
            <>
              <button
                type="button"
                onClick={onExplore}
                className="flex-1 h-11 max-w-[240px] bg-white border border-solid border-[#262626] flex items-center justify-center px-4 rounded-[4px] cursor-pointer"
              >
                <span className="text-[16px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
                  View Expired Proposal
                </span>
              </button>
              <button
                type="button"
                onClick={() => setContactSalesOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={contactSalesOpen}
                className="flex-1 h-11 max-w-[240px] bg-white border border-solid border-[#262626] flex items-center justify-center px-4 rounded-[4px] cursor-pointer"
              >
                {/* Text is the only flex child so it stays perfectly
                    centered in the button; phone icon hangs off the
                    left of the text via absolute positioning. */}
                <span className="relative text-[16px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
                  <span
                    className="absolute right-full top-1/2 -translate-y-1/2 mr-[6px] flex items-center justify-center shrink-0"
                  >
                    <PhoneIcon size={16} />
                  </span>
                  Contact Sales
                </span>
              </button>
            </>
          ) : (
            // Regular: Inspection (optional) + red Explore. Explore widens to
            // 492px when Inspection is hidden so the row width stays constant.
            <>
              {showInspectionReport && (
                <button className="flex-1 h-11 max-w-[240px] bg-white border border-[#262626] text-[rgba(0,0,0,0.85)] text-[16px] flex items-center justify-center cursor-pointer">
                  INSPECTION REPORT
                </button>
              )}
              <button
                onClick={onExplore}
                className={`flex-1 h-11 ${showInspectionReport ? 'max-w-[240px]' : 'max-w-[492px]'} bg-[#d41a32] text-white text-[16px] font-semibold flex items-center justify-center cursor-pointer`}
                style={{ lineHeight: '18px' }}
              >
                {exploreLabel}
              </button>
            </>
          )}
        </div>
        {/* Recalled / Expired Inspection Report — borderless text button
            below the primary CTA row (only when Inspection Report =
            Included). The Regular variant lives inside the button row
            alongside Explore. */}
        {(recalled || expired) && showInspectionReport && (
          <button className="self-center h-10 px-4 bg-transparent text-[rgba(0,0,0,0.85)] text-[16px] flex gap-2 items-center cursor-pointer">
            <DocumentIcon size={16} />
            View Inspection Report
          </button>
        )}
        {/* Top block — gray Valid Until pill (Regular) / yellow recall pill +
            body (Recalled) / yellow expired pill + body (Expired). Sits above
            the button row at every md+ breakpoint via order-first. */}
        <div className="flex flex-col items-center w-full order-first">
          {topBlock}
        </div>
      </div>
      {/* Recalled / Expired Contact Sales dialog. Mounted once so either the
          mobile or desktop button can open it. */}
      {(recalled || expired) && (
        <ContactSalesModal
          open={contactSalesOpen}
          onClose={() => setContactSalesOpen(false)}
        />
      )}
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
function CoverCurtain({
  onDismiss,
  singleOptionMode = false,
  showInspectionReport = true,
  recalled = false,
  expired = false,
  showCompanySlogan = true,
}: {
  onDismiss: () => void;
  singleOptionMode?: boolean;
  showInspectionReport?: boolean;
  /** When true (Proposal Status = Recalled / Deleted / Lost / Void), the
   *  curtain cannot be dragged up and the primary CTA is replaced by a
   *  non-dismissing Contact Sales button, so this curtain is the only thing
   *  the proposal ever renders. */
  recalled?: boolean;
  /** When true (Proposal Status = Expired), the cover content shows the
   *  Expired pill + dual CTAs but the curtain is still dismissable (touch
   *  drag-up + View Expired Proposal). */
  expired?: boolean;
  showCompanySlogan?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [snappingBack, setSnappingBack] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  // React synthetic events bubble through the React tree, not the DOM tree —
  // so touches on portaled descendants (e.g. ContactSalesModal in document.body)
  // would otherwise trigger curtain drag logic and a snap-back re-render, which
  // on touchscreens can swallow the synthetic click on the portaled content.
  // Gate on `currentTarget.contains(target)` to ignore those.
  const isInsideCurtain = (e: React.TouchEvent) =>
    curtainRef.current?.contains(e.target as Node) ?? false;

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
    // Recalled proposals lock the curtain up — every dismiss path is a no-op.
    if (recalled || dismissed) return;
    setDismissed(true);
    setTimeout(onDismiss, 620);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (recalled || dismissed) return;
    if (!isInsideCurtain(e)) return;
    touchStartY.current = e.touches[0].clientY;
    setSnappingBack(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (recalled || touchStartY.current === null || dismissed) return;
    if (!isInsideCurtain(e)) return;
    const delta = touchStartY.current - e.touches[0].clientY;
    // Only track upward drag (positive delta); ignore downward pulls
    setDragY(Math.max(0, delta));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (recalled || touchStartY.current === null || dismissed) return;
    if (!isInsideCurtain(e)) return;
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
      ref={curtainRef}
      className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden"
      style={{ transform, transition }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full flex items-center justify-center" style={{ maxWidth: 2160 }}>
        <CoverPageContent
          onExplore={dismiss}
          singleOptionMode={singleOptionMode}
          showInspectionReport={showInspectionReport}
          recalled={recalled}
          expired={expired}
          showCompanySlogan={showCompanySlogan}
        />
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
  isInPair,
  isInTriple,
  lgHasOverflow,
  lgShowsTwo,
  onSelectOption,
  onChangeOption,
}: {
  options: FenceOption[];
  visible: boolean;
  /** Whether the option is in the visible pair on <lg breakpoints. */
  isInPair: (id: number) => boolean;
  /** Whether the option is in the visible triple on lg+ when lg has overflow. */
  isInTriple: (id: number) => boolean;
  /** True when total options > 3 (lg+ also runs out of slots). */
  lgHasOverflow: boolean;
  /** True when lg+ shows exactly two columns (picker-driven 2-option
   *  comparison). Switches the lg+ layout from flex-equal-fill to a
   *  2-col grid capped at 720px each, matching the comparison table below. */
  lgShowsTwo: boolean;
  /** "Select This Option" → commit this option (go to Summary). */
  onSelectOption: (opt: FenceOption) => void;
  /** "Change Option" → open the Change Option picker. */
  onChangeOption: (opt: FenceOption) => void;
}) {
  // Which header button currently shows its dropdown menu (null = none).
  // Click again to toggle off; click outside the bar closes it too.
  const [openId, setOpenId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Close the dropdown whenever the header itself hides.
  useEffect(() => {
    if (!visible) setOpenId(null);
  }, [visible]);
  // Outside-click handling — intercept on the DOCUMENT capture phase so
  // we run BEFORE React's root-level event listeners. The first click
  // outside the sticky header closes the menu and is swallowed
  // (stopPropagation + stopImmediatePropagation + preventDefault), so the
  // click never reaches the underlying page or any React onClick handler.
  useEffect(() => {
    if (openId === null) return;
    const onCapture = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && containerRef.current?.contains(target)) {
        // Click inside the sticky header — let it through (e.g. clicking
        // another header button, or a menu item).
        return;
      }
      setOpenId(null);
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    document.addEventListener('mousedown', onCapture, true);
    document.addEventListener('click', onCapture, true);
    return () => {
      document.removeEventListener('mousedown', onCapture, true);
      document.removeEventListener('click', onCapture, true);
    };
  }, [openId]);
  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-[0px_4px_3px_0px_rgba(123,123,123,0.1)]"
      style={{
        borderBottomWidth: '0.5px',
        borderBottomColor: 'rgba(0,0,0,0.2)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 200ms ease-out',
      }}
    >
      {/* Inner row — items-stretch so each slot fills the full header
          height (no vertical padding here; padding lives on the buttons
          below). This makes each button's clickable hot area span the
          full sticky-header height. */}
      <div
        className={[
          'mx-auto flex items-stretch gap-4 md:gap-3 px-4 sm:px-6 md:px-4 lg:px-6',
          lgShowsTwo
            ? 'lg:grid lg:grid-cols-[repeat(2,minmax(0,720px))] lg:justify-center'
            : '',
        ].join(' ')}
        style={{ minWidth: 360, maxWidth: 2160 }}
      >
        {options.map((opt) => {
          const md = isInPair(opt.id);
          const lg = !lgHasOverflow || isInTriple(opt.id);
          let extra = '';
          if (!md) extra += ' hidden';
          if (md && !lg) extra += ' lg:hidden';
          else if (!md && lg) extra += ' lg:flex';
          const isOpen = openId === opt.id;
          return (
          // Slot wrapper is the positioning context for the dropdown
          // menu — the menu uses `top-full w-full` so it inherits the
          // slot's width, matching the comparison column width below.
          <div
            key={opt.id}
            className={`relative flex flex-1 min-w-0${extra}`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : opt.id)}
              className={[
                'flex flex-1 items-center gap-1 px-2 py-2 md:py-3 min-w-0 cursor-pointer border-0 transition-colors',
                isOpen ? 'bg-[#f0f0f0]' : 'bg-transparent hover:bg-[#f5f5f5]',
              ].join(' ')}
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              <p
                className="flex-1 font-semibold text-[14px] text-[#262626] truncate leading-normal text-left"
                style={{ fontFamily: 'Segoe UI, sans-serif' }}
              >
                {opt.label}
              </p>
              <ChevronThin
                size={16}
                color="#000000"
                rotate={isOpen ? 0 : 270}
                style={{ transition: 'transform 150ms ease-out' }}
              />
            </button>
            {isOpen && (
              <div
                role="menu"
                // top-[calc(100%+0.5px)] clears the header's 0.5px
                // border-bottom so the menu's top edge aligns flush with
                // the header's bottom edge instead of overlapping the
                // border.
                className="absolute top-[calc(100%+0.5px)] left-0 w-full bg-white border border-solid border-[#d9d9d9] flex flex-col z-10"
                style={{
                  boxShadow:
                    '0px 2px 4px rgba(0,0,0,0.06), 0px 4px 16px rgba(0,0,0,0.10)',
                }}
              >
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setOpenId(null);
                    onSelectOption(opt);
                  }}
                  className="flex items-center w-full px-3 py-3 text-left text-[14px] text-[#262626] bg-white hover:bg-[#f5f5f5] border-0 cursor-pointer"
                  style={{ fontFamily: 'Segoe UI, sans-serif' }}
                >
                  Select This Option
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setOpenId(null);
                    onChangeOption(opt);
                  }}
                  className="flex items-center w-full px-3 py-3 text-left text-[14px] text-[#262626] bg-white hover:bg-[#f5f5f5] border-0 cursor-pointer border-t border-solid border-[#f0f0f0]"
                  style={{ fontFamily: 'Segoe UI, sans-serif' }}
                >
                  Change Option
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
// The default export wires up the DevConsole provider + panel. OptionsPageContent
// reads `config.optionCount` and slices the master ALL_OPTIONS list. Internal
// state that depends on the option count (visibility array, comparison pair,
// selected option) is reconciled via a useEffect so we don't need to remount
// the whole tree — that way the curtain / scroll position / addons survive
// mid-demo data changes.
export default function OptionsPageResponsive() {
  return (
    <DevConsoleProvider>
      <PageRouter />
      <DevConsole />
    </DevConsoleProvider>
  );
}

// Reads `config.type` and swaps the entire page between the regular Proposal
// flow and the Change Order placeholder. Sits inside DevConsoleProvider so the
// Type toggle can flip back and forth without unmounting the console itself.
function PageRouter() {
  const { config } = useDevConsole();
  if (config.type === 'changeOrder') return <ChangeOrderPage />;
  return <OptionsPageContent />;
}

// ── useOverflowScroll ─────────────────────────────────────────────────────────
// Manages a horizontally-scrolling option list with an OverflowNavigation
// indicator. Returns:
//   • setScrollNode: callback ref for the scroll container
//   • visibility: boolean[] of per-slot full-visibility (drives indicator bar)
//   • hasOverflow: true when scrollWidth > clientWidth (drives nav visibility)
//   • canPrev / canNext: scroll-edge state (drives Prev/Next disabled)
//   • scrollByCard(direction): smooth-scroll by exactly one card stride,
//     pre-emptively predicting the next visibility array so the indicator
//     animates in a single 300ms pass instead of two.
// Slots must self-identify with `data-slot-index={index}` so the
// IntersectionObserver can map each entry back to its array position.
// The hook is used both for the page's primary "All Options" list and for the
// horizontally-scrolling option list inside the Change Option picker on lg+.
function useOverflowScroll(optionsLength: number) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const setScrollNode = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el;
    setScrollEl(el);
  }, []);
  const [visibility, setVisibility] = useState<boolean[]>(() =>
    Array.from({ length: optionsLength }, () => false)
  );
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const animatingRef = useRef(false);
  const animatingTimeoutRef = useRef<number | null>(null);

  // Reset visibility array when the slot count changes.
  useEffect(() => {
    setVisibility(Array.from({ length: optionsLength }, () => false));
  }, [optionsLength]);

  // IntersectionObserver — per-slot full-visibility.
  useEffect(() => {
    const root = scrollEl;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (animatingRef.current) return;
        setVisibility((prev) => {
          const next = [...prev];
          let changed = false;
          for (const entry of entries) {
            const idxAttr = (entry.target as HTMLElement).dataset.slotIndex;
            const idx = idxAttr == null ? -1 : parseInt(idxAttr, 10);
            if (idx >= 0 && idx < next.length) {
              const v = entry.intersectionRatio >= 0.99;
              if (next[idx] !== v) {
                next[idx] = v;
                changed = true;
              }
            }
          }
          return changed ? next : prev;
        });
      },
      { root, threshold: [0, 0.99, 1] }
    );
    root.querySelectorAll<HTMLElement>('[data-slot-index]').forEach((el) =>
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, [scrollEl, optionsLength]);

  // Scroll position + overflow detection.
  useEffect(() => {
    const root = scrollEl;
    if (!root) return;
    let rafId = 0;
    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!root.isConnected) return;
        const overflow = root.scrollWidth > root.clientWidth + 1;
        setHasOverflow(overflow);
        setCanPrev(root.scrollLeft > 1);
        setCanNext(root.scrollLeft + root.clientWidth < root.scrollWidth - 1);
      });
    };
    scheduleUpdate();
    root.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(root);
    root
      .querySelectorAll<HTMLElement>('[data-slot-index]')
      .forEach((el) => ro.observe(el));
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
  }, [scrollEl, optionsLength]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const root = scrollRef.current;
    if (!root) return;
    const slots = root.querySelectorAll<HTMLElement>('[data-slot-index]');
    if (slots.length < 2) return;
    const stride =
      slots[1].getBoundingClientRect().left -
      slots[0].getBoundingClientRect().left;
    root.scrollBy({ left: stride * direction, behavior: 'smooth' });
    setVisibility((prev) => {
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
    animatingRef.current = true;
    if (animatingTimeoutRef.current !== null) {
      window.clearTimeout(animatingTimeoutRef.current);
    }
    animatingTimeoutRef.current = window.setTimeout(() => {
      animatingRef.current = false;
      animatingTimeoutRef.current = null;
    }, INDICATOR_ANIM_MS + 50);
  }, []);

  return {
    setScrollNode,
    visibility,
    hasOverflow,
    canPrev,
    canNext,
    scrollByCard,
  };
}

function OptionsPageContent() {
  const { config, restartTick, pageIntent, setPageIntent } = useDevConsole();
  const optionCount = config.optionCount;
  // Slice the master list to the configured count. Everything below operates on
  // this trimmed array, so widget logic (overflow detection, comparison pair,
  // sticky header, etc.) automatically adapts.
  const OPTIONS = ALL_OPTIONS.slice(0, optionCount);
  useSyncCardSectionHeights(config.optionImage, config.recommendedOption, optionCount);
  const stickyVisible = useStickyHeader();
  // Initialize from the shared `pageIntent` so that switching from Change
  // Order mode lands on the equivalent Proposal page (e.g. CO Approval
  // Page → Summary). `pageIntent` defaults to 'cover' on first mount.
  const startsApproved = pageIntent.startsWith('hub.');
  const initialHubTab: ProjectHubTab =
    pageIntent === 'hub.contract'
      ? 'contract'
      : pageIntent === 'hub.invoices'
        ? 'invoices'
        : 'home';
  const [curtainMounted, setCurtainMounted] = useState(pageIntent === 'cover');
  const [selectedOption, setSelectedOption] = useState<FenceOption | null>(() =>
    pageIntent === 'cover' || pageIntent === 'options' ? null : (OPTIONS[0] ?? null),
  );
  // Once true, the signed Project Hub replaces the Summary page for the
  // currently-selected option. Resetting the selection also resets this.
  const [approved, setApproved] = useState(startsApproved);
  // Timestamp when the proposal was approved. Captured at the moment the
  // user signs on the Summary page; rendered on the Project Hub title block.
  const [approvedAt, setApprovedAt] = useState<Date | null>(
    startsApproved ? new Date() : null,
  );
  // Signature overlay mount state, lifted from Summary so the overlay
  // persists across the Summary → ProjectHub swap. Flow:
  //   – button → setShowSignatureOverlay(true) mounts the overlay on top of Summary.
  //   – overlay.onApproveStart → setApproved(true) swaps Summary for
  //     ProjectHub behind the still-animating overlay.
  //   – overlay.onApproved (exit complete) → setShowSignatureOverlay(false) unmounts.
  const [showSignatureOverlay, setShowSignatureOverlay] = useState(false);
  // ── Shared addon state ─────────────────────────────────────────────────────
  // Owned here so selections made on the Summary page persist when the user
  // approves and navigates to Project Hub (which renders selected addons as a
  // new "Add-ons" category in the Included Products list).
  const [addons, setAddons] = useState<AddonItem[]>(DEFAULT_ADDONS);

  // ── Product Detail sheet state ─────────────────────────────────────────────
  // Opened by clicking a product line item in the comparison section. Three
  // variants render off the same sheet: Product / Upgrade / Add-on.
  const [productDetail, setProductDetail] = useState<ProductDetailContent | null>(null);
  // ── Payment Schedule dialog state ──────────────────────────────────────────
  // Opened by clicking the Contract Total or Estimated Monthly Payment row in
  // any option's comparison column. Snapshot at click-time so the dialog stays
  // stable even if the user navigates underneath.
  const [scheduleData, setScheduleData] = useState<PaymentScheduleData | null>(null);
  const openSchedule = (opt: FenceOption) => {
    const contractTotalNum = Number(opt.contractTotal.replace(/[^0-9.]/g, '')) || 0;
    const monthlyNum = Number(opt.monthly.replace(/[^0-9.]/g, '')) || 0;
    setScheduleData({
      optionLabel: opt.label,
      projectName: 'Henderson Backyard Fence',
      contractTotal: contractTotalNum,
      monthly: monthlyNum,
      loanAmount: Math.round(contractTotalNum),
      termMonths: 12,
      apr: 4,
    });
  };
  const closeSchedule = () => setScheduleData(null);
  // Per-product selection of the upgrade option, keyed by `${optionId}:${productName}`.
  // The first option in `upgradeOptions` is the baseline (no override needed).
  const [upgradeSelections, setUpgradeSelections] = useState<Record<string, string>>({});

  const upgradeKey = (optId: number, productName: string) => `${optId}:${productName}`;

  const openProductDetail = (
    optId: number,
    p: FenceProduct,
    opts?: { readOnly?: boolean }
  ) => {
    const qtyLabel = `${p.qty} ${p.unit}`;
    // Upgrade variant whenever the product has options. The comparison-table
    // caller passes readOnly so the sheet is browse-only (no Select CTA).
    // When DevConsole upgrades = 'disable', collapse to the default option's
    // product detail (no swatch picker) so the sheet matches the line-item
    // representation elsewhere.
    if (
      p.upgradeOptions &&
      p.upgradeOptions.length > 0 &&
      config.upgrades !== 'disable'
    ) {
      const key = upgradeKey(optId, p.name);
      const currentOptionId = upgradeSelections[key] ?? p.upgradeOptions[0].id;
      setProductDetail({
        kind: 'upgrade',
        category: p.name,
        qtyLabel,
        options: p.upgradeOptions,
        currentOptionId,
        readOnly: opts?.readOnly,
        onSelect: (id) => {
          setUpgradeSelections((prev) => ({ ...prev, [key]: id }));
          // Keep the sheet open and switch the CTA to its "Option Selected"
          // state so the user can continue browsing the other swatches.
          setProductDetail((prev) =>
            prev && prev.kind === 'upgrade'
              ? { ...prev, currentOptionId: id }
              : prev
          );
        },
      });
      return;
    }
    // For products without their own description, fall back to the default
    // (= first) upgrade option's description so upgradeable products still
    // surface meaningful copy when opened via Product variant.
    const defaultUpgrade = p.upgradeOptions?.[0];
    setProductDetail({
      kind: 'product',
      // When the product carries upgrade options (and we landed here because
      // DevConsole disabled upgrades), surface the default option's title so
      // the sheet header matches the comparison-row label.
      category: defaultUpgrade?.title ?? p.name,
      qtyLabel,
      description:
        p.description ??
        defaultUpgrade?.description ??
        'A quality component included in this option. Detailed specifications and product imagery for this line item will appear here.',
    });
  };
  // Primary "All Options" list — horizontal-scroll nav state. Uses a
  // callback-ref under the hood (see useOverflowScroll) so the observers
  // re-attach when the scroll container is re-mounted after returning from
  // the Summary page.
  const primary = useOverflowScroll(OPTIONS.length);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectOption(opt: FenceOption) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedOption(opt);
  }

  // Locked statuses — those that disable the curtain entirely (vs. Expired,
  // which still allows the user to View Expired Proposal, and Signed On
  // Device, which skips the cover entirely and lands the user on the
  // approved Project Hub).
  const isLockedStatus =
    config.proposalStatus !== 'regular' &&
    config.proposalStatus !== 'expired' &&
    config.proposalStatus !== 'signedOnDevice';

  function dismissCurtain() {
    // Locked statuses (Recalled / Deleted / Lost / Void) can never leave the
    // cover curtain — no-op so any stray dismiss callbacks (mounted before
    // the toggle flipped) don't unmount the curtain underneath the recall
    // notice. Expired is dismissable like Regular.
    if (isLockedStatus) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setCurtainMounted(false);
  }

  // Flipping to a LOCKED status (Recalled / Deleted / Lost / Void) at
  // runtime re-raises the curtain and clears any in-progress page state —
  // the cover is the only thing those statuses are allowed to render.
  // Signed On Device jumps straight to the approved Project Hub: dismiss
  // the curtain, pick the first option as the contract, and flip the
  // approved flag + timestamp so the post-approval surface renders.
  // Expired keeps the user on whatever pre-approval page they were on
  // (Cover / Options / Summary) — BUT if they had already approved and
  // are sitting on Project Hub, that page is invalid under Expired, so
  // we bounce them back to the cover and clear the approval state.
  // Flipping back to Regular is intentionally NOT auto-reversed.
  useEffect(() => {
    if (isLockedStatus) {
      setCurtainMounted(true);
      setSelectedOption(null);
      setApproved(false);
      setApprovedAt(null);
    } else if (config.proposalStatus === 'signedOnDevice') {
      setCurtainMounted(false);
      setSelectedOption(OPTIONS[0] ?? null);
      setApproved(true);
      setApprovedAt(new Date());
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (config.proposalStatus === 'expired' && approved) {
      // On Project Hub when Expired flipped on → return to cover.
      setCurtainMounted(true);
      setSelectedOption(null);
      setApproved(false);
      setApprovedAt(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.proposalStatus]);

  // Publish the current page to the shared `pageIntent` so that toggling
  // `config.type` to Change Order lands on the equivalent CO page. We only
  // publish pre-ProjectHub pages here; once approved, ProjectHub itself
  // publishes its active tab.
  useEffect(() => {
    if (config.type !== 'proposal') return;
    if (curtainMounted) {
      setPageIntent('cover');
    } else if (!selectedOption) {
      setPageIntent('options');
    } else if (!approved) {
      setPageIntent('summary');
    }
  }, [curtainMounted, selectedOption, approved, config.type, setPageIntent]);

  // Restart Userflow — DevConsole's top button bumps `restartTick`. Each
  // bump returns the user to the starting page for the current Proposal
  // Status: Project Home for Signed On Device (re-using the approved
  // landing), Cover for every other status. We compare against a ref so
  // this only fires on an actual tick increment — not on mount and not
  // when the component remounts after a Type-toggle round trip through
  // Change Order (where restartTick may already be > 0 but the user is
  // intentionally landing on a page derived from `pageIntent`).
  const lastRestartTickRef = useRef(restartTick);
  useEffect(() => {
    if (lastRestartTickRef.current === restartTick) return;
    lastRestartTickRef.current = restartTick;
    if (config.proposalStatus === 'signedOnDevice') {
      setCurtainMounted(false);
      setSelectedOption(OPTIONS[0] ?? null);
      setApproved(true);
      setApprovedAt(new Date());
    } else {
      setCurtainMounted(true);
      setSelectedOption(null);
      setApproved(false);
      setApprovedAt(null);
    }
    // Always clear any open sheets/overlays + reset addon / upgrade
    // selections so the restart actually lands on a clean starting state.
    setShowSignatureOverlay(false);
    setAddons(DEFAULT_ADDONS);
    setProductDetail(null);
    setScheduleData(null);
    setUpgradeSelections({});
    window.scrollTo({ top: 0, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartTick]);

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
  // When optionCount < 2 (dev-mode 1-option demo), the second slot collapses
  // to id 0 — comparison rendering is gated by hasOverflow anyway, so the
  // duplicate id is never observed.
  const [comparisonPair, setComparisonPair] = useState<[number, number]>(
    [OPTIONS[0]?.id ?? 0, OPTIONS[1]?.id ?? OPTIONS[0]?.id ?? 0]
  );
  // lg+ analogue: which 3 options are visible in the comparison grid when there
  // are 4+ options (lg+ also overflows the 3 fixed columns). Defaults to the
  // first 3 options. Swap functionality TBD.
  const [comparisonTriple, setComparisonTriple] = useState<number[]>(
    () => OPTIONS.slice(0, 3).map((o) => o.id)
  );

  // Reconcile option-count-dependent state when the DevConsole changes the
  // count. We don't remount the whole tree (which would also reset the curtain,
  // scroll position, etc.) — instead we just resize the visibility array,
  // pick a fresh comparison pair, and clear the selection if it pointed at
  // an option that no longer exists.
  useEffect(() => {
    const sliced = ALL_OPTIONS.slice(0, optionCount);
    setComparisonPair([
      sliced[0]?.id ?? 0,
      optionCount >= 2 ? sliced[1]!.id : sliced[0]?.id ?? 0,
    ]);
    setComparisonTriple(sliced.slice(0, 3).map((o) => o.id));
    setSelectedOption((prev) =>
      prev && sliced.some((o) => o.id === prev.id) ? prev : null
    );
  }, [optionCount]);

  // Single-option mode: the Options page has nothing to choose between, so we
  // treat the sole option as the implicit selection — even when no actual
  // selection has been made and the cover curtain is still up. This keeps the
  // page UNDER the curtain on Summary, so when the curtain slides away it
  // reveals Summary directly instead of briefly flashing the Options page.
  const isSingleOptionMode = optionCount === 1 && !!OPTIONS[0];
  const effectiveSelectedOption =
    selectedOption ?? (isSingleOptionMode ? OPTIONS[0]! : null);
  const isInPair = (id: number) => comparisonPair.includes(id);
  const isInTriple = (id: number) => comparisonTriple.includes(id);
  // <lg overflow: there are too many options to show side-by-side in 2 cols.
  // lg+ overflow: the lg-grid runs out of its 3 fixed cols too.
  const hasOverflow = OPTIONS.length > 2;
  const lgHasOverflow = OPTIONS.length > 3;
  // ── Change Option picker (bottom sheet < lg / centered modal lg+) ──────────
  // Opened by any "Change Option" CTA in the comparison cards (and inside the
  // sticky-header option-card modal). Presents the full option list:
  //   < lg: bottom sheet — vertical card list (mirror of the page's mobile
  //          "Primary All Option List" at the top of OptionsPage)
  //   lg+ : centered modal — horizontal card list (mirror of the page's
  //          desktop layout)
  // Clicking Select on any card in the picker selects that option (advancing
  // to the Summary page) and dismisses the picker.
  const [changeOptionOpen, setChangeOptionOpen] = useState(false);
  // The option whose "Change Option" button opened the picker. Used to
  // determine which other comparison-list options should be locked out
  // (since they're already on screen, only the triggering slot is
  // available to receive a new option).
  const [changeOptionTriggerId, setChangeOptionTriggerId] = useState<number | null>(null);
  const openChangeOptionMenu = (optId: number) => {
    setChangeOptionTriggerId(optId);
    setChangeOptionOpen(true);
  };
  // Second independent scroll-nav instance for the picker's lg+ horizontal
  // list (the OverflowNavigation indicator + Prev/Next buttons).
  const pickerScroll = useOverflowScroll(OPTIONS.length);
  useEffect(() => {
    if (!changeOptionOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChangeOptionOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Equalise card-section heights inside the newly-mounted picker. The
    // global useSyncCardSectionHeights hook only re-runs on document-element
    // resize; mounting a new container doesn't trigger it on its own. Two
    // rAFs so the cards' images / fonts can settle before measuring.
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(syncCardSectionHeights);
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(rafId);
    };
  }, [changeOptionOpen]);
  // Staged-selection state — only used by the checkbox variant. Picks are
  // batched into this array and applied to the live comparison list only
  // when the user clicks "Compare Options" in the bottom control bar.
  // Initial state on each open: the FULL current comparison list (every
  // currently-shown option pre-checked, including the trigger). The first
  // pick of an unchecked card replaces the trigger's slot (see the card
  // click handler).
  const [stagedSelection, setStagedSelection] = useState<number[]>([]);
  // Ref for the picker's internal scroll area — wires the shared
  // ScrollHintArrows (used in the Invoice / Make-Payment sheets) so the
  // user sees bouncing chevrons when there's more content above/below
  // and the scrollbar itself is hidden.
  const pickerScrollAreaRef = useRef<HTMLDivElement | null>(null);
  // XS-M only: the bottom bar collapses the pill list into a compact
  // "X/N options ↑" toggle by default; tapping it expands the footer
  // upward to reveal the pills stacked vertically. Reset on every open.
  const [mobilePillsExpanded, setMobilePillsExpanded] = useState(false);
  useEffect(() => {
    if (!changeOptionOpen) setMobilePillsExpanded(false);
  }, [changeOptionOpen]);
  useEffect(() => {
    if (!changeOptionOpen) return;
    const baseList = isLgUp
      ? lgHasOverflow
        ? comparisonTriple
        : OPTIONS.map((o) => o.id)
      : hasOverflow
      ? comparisonPair
      : OPTIONS.map((o) => o.id);
    setStagedSelection(baseList);
    // Intentionally only reacts to picker open — once open, the picker
    // owns staged state until commit/dismiss.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeOptionOpen]);

  // Track lg+ breakpoint reactively (used by the picker's slot logic and a
  // few other layout decisions). Kept as React state via an MQL listener
  // so resizes across the lg boundary trigger re-renders.
  const [isLgUp, setIsLgUp] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsLgUp(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  // Per-option visibility classes for items in the comparison grids. The grid
  // itself stays at `grid-cols-2 lg:grid-cols-3` (when overflow exists) — we
  // hide non-pair / non-triple items via responsive classes so the visible
  // ones always lay out in the leftmost cells.
  // baseLg: the display utility to use when the item should show on lg+.
  function comparisonItemVisibilityClass(id: number, baseLg: 'flex' | 'block') {
    const md = !hasOverflow || isInPair(id);
    const lg = !lgHasOverflow || isInTriple(id);
    if (md && lg) return '';
    if (md && !lg) return ' lg:hidden';
    if (!md && lg) return ` hidden lg:${baseLg}`;
    return ' hidden';
  }

  // Order the comparison rendering by the current-breakpoint's comparison
  // list (comparisonTriple on lg+ when there's lg-overflow, comparisonPair
  // otherwise). Items NOT in the comparison list fall to the end in their
  // original OPTIONS order — they're hidden via comparisonItemVisibilityClass
  // anyway, but a stable order keeps DOM diffing happy. This makes the
  // committed pill order from the Change Option picker actually drive the
  // column order shown in the comparison cards / parameter rows / product
  // rows.
  const comparisonOrderedIds = isLgUp
    ? lgHasOverflow
      ? comparisonTriple
      : OPTIONS.map((o) => o.id)
    : hasOverflow
    ? comparisonPair
    : OPTIONS.map((o) => o.id);
  const comparisonOptions = [...OPTIONS].sort((a, b) => {
    const ai = comparisonOrderedIds.indexOf(a.id);
    const bi = comparisonOrderedIds.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Comparison grid layout: 3+ options use 2-col on <lg (showing the pair) +
  // 3-col on lg+; with exactly 2 options we drop the lg-3-col override so the
  // table fills the container instead of leaving an empty third column.
  //
  // Picker-driven 2-option case on lg+: when the user commits a 2-option
  // comparison from the Change Option picker (comparisonTriple length 2),
  // also drop the lg-3-col override so no empty column appears.
  //
  // 2-option cap: cards/columns are capped at 720px each. Beyond that, the
  // grid stops growing and `justify-center` keeps it centered in the wider
  // container so cards don't balloon on very large viewports.
  const lgComparisonShowsTwo =
    lgHasOverflow && comparisonTriple.length === 2;
  const comparisonGridClass =
    OPTIONS.length === 2 || lgComparisonShowsTwo
      ? OPTIONS.length === 2
        ? 'grid grid-cols-[repeat(2,minmax(0,720px))] gap-4 md:gap-3 justify-center'
        : 'grid grid-cols-2 lg:grid-cols-[repeat(2,minmax(0,720px))] gap-4 md:gap-3 lg:justify-center'
      : 'grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3';

  // When an option is selected, render either Summary (pre-approval) or
  // ProjectHub (post-approval) and overlay the signature sheet on top when
  // active. The overlay is rendered at THIS level so it stays mounted across
  // the Summary→ProjectHub swap: on successful sign, onApproveStart flips
  // `approved`, swapping the page behind the overlay; when the overlay's
  // slide-out finishes, onApproved unmounts it and the user sees ProjectHub.
  if (effectiveSelectedOption) {
    return (
      <>
        {approved ? (
          <ProjectHubPageResponsive
            // Re-mount whenever Restart Userflow is invoked so internal
            // state (active tab, extra payments, sticky-footer state) drops
            // back to defaults — without this, restart from a non-Home tab
            // would leave the user on that tab.
            key={`hub-${restartTick}`}
            option={effectiveSelectedOption as SummaryFenceOption}
            addons={addons}
            upgradeSelections={upgradeSelections}
            approvedAt={approvedAt}
            initialActiveTab={initialHubTab}
            onShowCover={() => {
              setSelectedOption(null);
              setApproved(false);
              setApprovedAt(null);
              setCurtainMounted(true);
            }}
          />
        ) : (
          <SummaryPageResponsive
            option={effectiveSelectedOption as SummaryFenceOption}
            addons={addons}
            setAddons={setAddons}
            singleOptionMode={isSingleOptionMode}
            signatureRequired={config.signatureRequired}
            onBack={() => {
              setSelectedOption(null);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onShowCover={() => {
              setSelectedOption(null);
              setCurtainMounted(true);
            }}
            onRequestSign={() => setShowSignatureOverlay(true)}
          />
        )}
        {/* In single-option mode the curtain sits on top of Summary so its
            slide-up reveals Summary directly. In multi-option mode this branch
            is only reached after a real selection — the curtain is already
            dismissed and curtainMounted is false, so this renders nothing. */}
        {curtainMounted && (
          <CoverCurtain
            onDismiss={dismissCurtain}
            singleOptionMode={isSingleOptionMode}
            showInspectionReport={config.inspectionReport}
            recalled={isLockedStatus}
            expired={config.proposalStatus === 'expired'}
            showCompanySlogan={config.companySlogan === 'enable'}
          />
        )}
        {showSignatureOverlay && (
          <SignatureOverlay
            clientName="Michael Rozier"
            signatureRequired={config.signatureRequired}
            onClose={() => setShowSignatureOverlay(false)}
            onApproveStart={() => {
              // Slide-out has just begun. Swap Summary for ProjectHub behind
              // the overlay so its exit reveals the destination page.
              setApproved(true);
              setApprovedAt(new Date());
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onApproved={() => {
              // Exit animation complete — tear the overlay down.
              setShowSignatureOverlay(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {curtainMounted && (
        <CoverCurtain
          onDismiss={dismissCurtain}
          singleOptionMode={isSingleOptionMode}
          showInspectionReport={config.inspectionReport}
          recalled={isLockedStatus}
          expired={config.proposalStatus === 'expired'}
          showCompanySlogan={config.companySlogan === 'enable'}
        />
      )}
      <PageHeader onShowCover={() => setCurtainMounted(true)} />
      <StickyComparisonHeader
        options={comparisonOptions}
        visible={stickyVisible}
        isInPair={isInPair}
        isInTriple={isInTriple}
        lgHasOverflow={lgHasOverflow}
        lgShowsTwo={lgComparisonShowsTwo}
        onSelectOption={(opt) => selectOption(opt)}
        onChangeOption={(opt) => openChangeOptionMenu(opt.id)}
      />
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
          ref={primary.setScrollNode}
          data-card-container
          className={
            // 2-option mode: 2-col grid that fills the container, capped at
            //   720px per card so they don't grow unboundedly on very wide
            //   viewports (grid is `justify-center` once the cap engages).
            // 3-option mode: flex-row scroll on md (2.125-card peek), 3-col
            //   grid on lg+ (no overflow — fits exactly).
            // 4+ options: flex-row scroll on BOTH md (2.125-card peek) and
            //   lg+ (3.125-card peek) — lg+ also runs out of room.
            OPTIONS.length === 2
              ? 'grid grid-cols-1 md:grid-cols-[repeat(2,minmax(0,720px))] gap-4 md:gap-3 md:justify-center'
              : OPTIONS.length === 3
              ? 'flex flex-col gap-4 md:flex-row md:gap-3 md:overflow-x-auto md:overflow-y-hidden scrollbar-none lg:grid lg:grid-cols-3 lg:overflow-visible'
              : 'flex flex-col gap-4 md:flex-row md:gap-3 md:overflow-x-auto md:overflow-y-hidden scrollbar-none'
          }
        >
          {OPTIONS.map((opt, i) => (
            <PrimaryOptionSlot
              key={opt.id}
              opt={opt}
              index={i}
              totalOptions={OPTIONS.length}
              isFullyVisible={primary.visibility[i] ?? true}
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
        {primary.hasOverflow && (
          <div className="mt-2 md:mt-1">
            <OverflowNavigation
              visibility={primary.visibility}
              canPrev={primary.canPrev}
              canNext={primary.canNext}
              onPrev={() => primary.scrollByCard(-1)}
              onNext={() => primary.scrollByCard(1)}
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

          {/* Text link with chevron-down — same style across all breakpoints */}
          <button
            onClick={scrollToCompareArea}
            className="flex flex-col items-center gap-3 px-1 py-1.5 rounded-[4px] cursor-pointer"
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
          Mini comparison header cards — mirror of the section-5 cards at the
          bottom, shown above the comparison table whenever the table itself
          has overflow at the current breakpoint:
            • <lg: visible when hasOverflow (count > 2) — shows the pair
            • lg+: visible when lgHasOverflow (count > 3) — shows the triple
          When there's no lg overflow the parent grid is `lg:hidden` so the
          whole row is dropped on desktop (the comparison table is enough).
        */}
        {hasOverflow && (
          <div
            id="comparison-cards"
            data-card-container
            className={
              lgHasOverflow
                ? comparisonGridClass
                : 'grid grid-cols-2 gap-4 md:gap-3 lg:hidden'
            }
          >
            {comparisonOptions.map((opt) => (
              <div
                key={opt.id}
                className={comparisonItemVisibilityClass(opt.id, 'block').trim()}
              >
                <OptionCard
                  opt={opt}
                  onSelect={() => selectOption(opt)}
                  onChangeOption={() => openChangeOptionMenu(opt.id)}
                  changeOptionVisibleOnLg={lgHasOverflow}
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
            {config.constructionTimeInfo === 'include' ? 'Schedule and Pricing' : 'Pricing'}
          </p>

          {/* Param columns: 2-col on <lg (shows comparisonPair), 3-col on lg+
              (shows comparisonTriple when there are 4+ options). */}
          <div className={comparisonGridClass}>
            {comparisonOptions.map((opt) => (
              <div
                key={opt.id}
                className={`bg-white flex flex-col${comparisonItemVisibilityClass(opt.id, 'flex')}`}
              >
                <ComparisonParam
                  label="Contract Total"
                  value={opt.contractTotal}
                  onClick={() => openSchedule(opt)}
                />
                <ComparisonParam
                  label="Estimated Monthly Payment Starting at"
                  value={opt.monthly}
                  onClick={() => openSchedule(opt)}
                />
                {config.constructionTimeInfo === 'include' && (
                  <ComparisonParam
                    label="Estimated Construction Time"
                    value={opt.constructionTime}
                  />
                )}
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

          {/* Product columns: 2-col on <lg (shows comparisonPair), 3-col on lg+
              (shows comparisonTriple when there are 4+ options). */}
          <div className={comparisonGridClass}>
            {comparisonOptions.map((opt) => (
              <div
                key={opt.id}
                className={`flex flex-col${comparisonItemVisibilityClass(opt.id, 'flex')}`}
              >
                {opt.products.map((p) => (
                  <ProductLineItem
                    key={p.name}
                    // For upgradeable products, surface the Standard Option's
                    // title (the baseline / first option) instead of the
                    // generic product name — comparison rows read better when
                    // the spec-level wording matches what a user would see
                    // after committing.
                    name={p.upgradeOptions?.[0]?.title ?? p.name}
                    qty={p.qty}
                    unit={p.unit}
                    showThumb
                    // No Change pill in the comparison row (intentional — keeps
                    // the table visually uniform). Clicking still opens the
                    // Upgrade variant when the product has options, but in
                    // read-only mode (no Select CTA) — comparison is browse-only.
                    onClick={() => openProductDetail(opt.id, p, { readOnly: true })}
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
        <div id="section-5-cards" data-card-container className={comparisonGridClass}>
          {comparisonOptions.map((opt) => (
            <div
              key={opt.id}
              className={comparisonItemVisibilityClass(opt.id, 'block').trim()}
            >
              <OptionCard
                opt={opt}
                onSelect={() => selectOption(opt)}
                onChangeOption={hasOverflow ? () => openChangeOptionMenu(opt.id) : undefined}
                changeOptionVisibleOnLg={lgHasOverflow}
              />
            </div>
          ))}
        </div>

      </div>
      </div>

      {/* Change Option picker — < lg renders a bottom sheet with a vertical
          card list; lg+ renders a centered modal with a horizontal card list,
          mirroring the page's primary all-option list at each breakpoint. */}
      {changeOptionOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 flex flex-col justify-end pt-[38px] md:pt-[46px] lg:items-center lg:justify-center lg:p-6"
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={() => setChangeOptionOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full h-full lg:w-5/6 lg:max-w-[1800px] lg:h-auto lg:max-h-[85vh] flex flex-col"
            style={{
              boxShadow:
                '0px 2px 4px rgba(0,0,0,0.12), 0px 4px 24px rgba(0,0,0,0.20)',
            }}
          >
            {/* Scrollable area — cards + overflow nav. min-h-0 lets the
                flex child actually shrink (and thus scroll) when the
                modal hits its 85vh cap; without it, content would push
                the control bar off-screen on short viewports. The bottom
                control bar (rendered below this block) stays pinned.
                Wrapped in a `relative` parent so the bouncing
                ScrollHintArrows can anchor to the viewport edges; the
                scrollbar itself is hidden via `scrollbar-none`. */}
            <div className="relative flex-1 min-h-0 flex flex-col">
            <div ref={pickerScrollAreaRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
            {/* Option list — vertical < lg, horizontal lg+. Layout matches
                the page-top primary list at each breakpoint. Tagged with
                `data-card-container` so useSyncCardSectionHeights equalises
                title / features / time / price band heights across cards,
                matching the page's primary list behavior. Dismissal: tap
                backdrop or press Escape — no explicit close button. */}
            <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-4 lg:pb-6">
            {/* Padding wrapper preserves the modal's left/right inset even
                when the 4+ option list scrolls horizontally — the scroll
                container (data-card-container) sits inside this wrapper, so
                its scrollable area is already inset from the modal edges. */}
            <div
              ref={pickerScroll.setScrollNode}
              data-card-container
              className={
                // Layout per option count:
                //   2 options: 1-col on XS, 2-col on S+ (sm+, md+, lg+)
                //   3 options: stacked on XS, 2-col on S–M (sm/md), 3-col on lg+
                //   4+: stacked on XS, 2-col on S–M (sm/md), horizontal-scroll
                //       3.125-peek on lg+
                OPTIONS.length === 2
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3'
                  : OPTIONS.length === 3
                  ? 'flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3'
                  : 'flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-3 lg:flex lg:flex-row lg:overflow-x-auto scrollbar-none'
              }
            >
              {OPTIONS.map((opt, i) => {
                const useCheckbox =
                  config.changeOptionInteraction === 'checkbox';
                const maxSlots = isLgUp ? 3 : 2;
                // Source-of-truth for "is this option currently included":
                //  • Checkbox mode → staged selection (the picker batches
                //    edits, commits on Compare Options)
                //  • Button mode  → live comparison list (each click is
                //    immediate)
                const comparisonIds = useCheckbox
                  ? stagedSelection
                  : isLgUp
                  ? lgHasOverflow
                    ? comparisonTriple
                    : []
                  : hasOverflow
                  ? comparisonPair
                  : [];
                const isTrigger = opt.id === changeOptionTriggerId;
                const inComparison = comparisonIds.includes(opt.id);
                // Three CTA states per row:
                //  • Trigger row → disabled "To Be Replaced" — this is the
                //    slot the user is swapping out
                //  • Already in comparison (non-trigger) → disabled
                //    "Included in Comparison"
                //  • Not in comparison → "Add to Comparison" — swaps this
                //    option for the trigger inside the comparison list, then
                //    closes the picker (no Summary navigation).
                const lockedAsIncluded = !isTrigger && inComparison;
                const isAddToComparison =
                  !isTrigger &&
                  !inComparison &&
                  changeOptionTriggerId !== null;
                const swapTriggerWith = (newId: number) => {
                  if (isLgUp) {
                    setComparisonTriple((prev) =>
                      prev.map((id) =>
                        id === changeOptionTriggerId ? newId : id
                      )
                    );
                  } else {
                    setComparisonPair(
                      (prev) =>
                        [
                          prev[0] === changeOptionTriggerId
                            ? newId
                            : prev[0],
                          prev[1] === changeOptionTriggerId
                            ? newId
                            : prev[1],
                        ] as [number, number]
                    );
                  }
                };
                // After a swap we keep the picker open so the user can
                // continue auditioning options for the same comparison slot.
                // The newly-swapped-in option becomes the trigger, so a
                // subsequent click swaps THAT back out (continuous toggle
                // for the slot).
                const handleAddToComparison = () => {
                  swapTriggerWith(opt.id);
                  setChangeOptionTriggerId(opt.id);
                };
                const handleSelect = isAddToComparison
                  ? handleAddToComparison
                  : () => {
                      setChangeOptionOpen(false);
                      selectOption(opt);
                    };
                const ctaDisabled = lockedAsIncluded || isTrigger;
                const ctaLabel = isTrigger
                  ? 'To Be Replaced'
                  : lockedAsIncluded
                  ? 'Included in Comparison'
                  : isAddToComparison
                  ? 'Add to Comparison'
                  : undefined;
                // Checkbox variant — DevConsole-toggled alternative to the
                // button CTA. Each card swaps its bottom button block for an
                // inline checkbox row (reusing the addon-sheet's Checkbox).
                // The whole card is the click target; the checkbox row is
                // purely a visual indicator. Semantics: clicking an
                // unchecked card appends its id to staged selection; once
                // staged is full, the next click replaces the LAST entry —
                // matching the bottom control bar's pill slot behavior.
                // Already-checked cards are non-interactive (use the X on a
                // pill to free that slot).
                const checkboxChecked = inComparison;
                const checkboxRow = useCheckbox ? (
                  <div className="flex items-center gap-3 w-full">
                    <Checkbox checked={checkboxChecked} />
                    <span className="text-[16px] font-semibold text-[#262626]">
                      Add to Comparison
                    </span>
                  </div>
                ) : undefined;
                const cardClickable = useCheckbox;
                const handleCheckboxCardClick = () => {
                  setStagedSelection((prev) => {
                    // Toggle: checked card → remove from staged
                    if (prev.includes(opt.id)) {
                      return prev.filter((x) => x !== opt.id);
                    }
                    // Unchecked with a free slot (user X'd one out) →
                    // append; trigger position is untouched
                    if (prev.length < maxSlots) return [...prev, opt.id];
                    // Unchecked, all slots full → replace the trigger's
                    // slot (or the last slot if the trigger has already
                    // been swapped out earlier). The just-swapped-in
                    // option becomes the new trigger so subsequent clicks
                    // continue to replace the SAME slot — a continuous
                    // swap-in-place behavior for that comparison column.
                    const triggerIdx = prev.indexOf(
                      changeOptionTriggerId ?? -1
                    );
                    const replaceIdx =
                      triggerIdx >= 0 ? triggerIdx : prev.length - 1;
                    const next = [...prev];
                    next[replaceIdx] = opt.id;
                    setChangeOptionTriggerId(opt.id);
                    return next;
                  });
                };
                return (
                  <div
                    key={opt.id}
                    data-slot-index={i}
                    onClick={cardClickable ? handleCheckboxCardClick : undefined}
                    className={[
                      OPTIONS.length >= 4
                        ? 'lg:shrink-0 lg:w-[calc((100%-36px)/3.125)]'
                        : '',
                      cardClickable
                        ? 'cursor-pointer'
                        : useCheckbox
                        ? 'cursor-not-allowed'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <OptionCard
                      opt={opt}
                      onSelect={handleSelect}
                      selectDisabled={ctaDisabled}
                      selectLabel={ctaLabel}
                      bottomCta={checkboxRow}
                      selected={useCheckbox && checkboxChecked}
                    />
                  </div>
                );
              })}
            </div>
            </div>
            {/* OverflowNavigation — only shown when the picker's list actually
                overflows (lg+ with 4+ options). Mirrors the page-top primary
                list's nav placement. */}
            {pickerScroll.hasOverflow && (
              <div className="px-4 lg:px-8 pb-4 lg:pb-6">
                <OverflowNavigation
                  visibility={pickerScroll.visibility}
                  canPrev={pickerScroll.canPrev}
                  canNext={pickerScroll.canNext}
                  onPrev={() => pickerScroll.scrollByCard(-1)}
                  onNext={() => pickerScroll.scrollByCard(1)}
                />
              </div>
            )}
            </div>
            {/* Bouncing chevrons fade in/out based on remaining scrollable
                content above (top) and below (bottom). Same component used
                in Invoice / Make-Payment sheets. */}
            <ScrollHintArrows targetRef={pickerScrollAreaRef} />
            </div>
            {/* Bottom toolbar — diverges per interaction mode.
                Checkbox mode: pill slots (one per comparison-table column at
                  the current breakpoint), Compare Options commit button,
                  and a close X. Picks are applied only on Compare Options;
                  X / backdrop / Escape discard.
                Button mode: simple centred Cancel — selection is already
                  live, the bar just closes the picker. */}
            {config.changeOptionInteraction === 'checkbox' ? (
              (() => {
                // Build the pill nodes ONCE, then re-render them in both
                // the lg+ horizontal row and (when expanded) the XS-M
                // vertical stack. Each pill is full-width inside its
                // container thanks to `flex-1 min-w-0`.
                const slotCount = isLgUp ? 3 : 2;
                const renderPill = (slotIdx: number) => {
                  const id = stagedSelection[slotIdx];
                  const opt =
                    id != null
                      ? OPTIONS.find((o) => o.id === id) ?? null
                      : null;
                  if (opt) {
                    return (
                      <div
                        key={slotIdx}
                        className="flex items-center gap-2 h-10 px-3 border border-solid border-[#262626] rounded-[4px] w-full lg:w-auto lg:flex-1 min-w-0"
                      >
                        <span
                          className="flex-1 truncate text-[14px] text-[#262626]"
                          style={{ fontFamily: 'Segoe UI, sans-serif' }}
                        >
                          {opt.label}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${opt.label}`}
                          onClick={() =>
                            setStagedSelection((prev) =>
                              prev.filter((x) => x !== opt.id)
                            )
                          }
                          className="shrink-0 flex items-center justify-center bg-transparent border-0 cursor-pointer"
                          style={{ width: 20, height: 20 }}
                        >
                          <XmarkLarge size={16} color="#262626" />
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={slotIdx}
                      className="flex items-center h-10 px-3 border border-solid border-[#d9d9d9] rounded-[4px] w-full lg:w-auto lg:flex-1 min-w-0"
                    >
                      <span
                        className="text-[14px] text-[#bfbfbf]"
                        style={{ fontFamily: 'Segoe UI, sans-serif' }}
                      >
                        Choose a option
                      </span>
                    </div>
                  );
                };
                const pillNodes = Array.from({ length: slotCount }).map(
                  (_, i) => renderPill(i)
                );
                return (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2 px-4 lg:px-8 pb-4 lg:pb-8 pt-6 lg:pt-8">
                {/* XS-M: compact "X/N options" toggle (with a chevron) —
                    tapping it expands the footer upward to reveal the
                    pills vertically stacked. Hidden on lg+. */}
                <div className="lg:hidden flex flex-col gap-2 w-full">
                  {mobilePillsExpanded && (
                    <div className="flex flex-col gap-2 w-full">{pillNodes}</div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setMobilePillsExpanded((v) => !v)
                    }
                    className={[
                      // px-3 (no negative margin) so the label aligns with
                      // the pill labels above (pills are w-full + px-3 →
                      // text sits at 12px from the container's left edge).
                      'self-start flex items-center gap-1 h-10 px-3 border-0 rounded-[4px] cursor-pointer transition-colors',
                      // Highlighted bg while expanded; subtle hover when
                      // collapsed.
                      mobilePillsExpanded
                        ? 'bg-[#f0f0f0]'
                        : 'bg-transparent hover:bg-[#f0f0f0]',
                    ].join(' ')}
                    aria-expanded={mobilePillsExpanded}
                  >
                    <span
                      className="text-[14px] text-[#262626]"
                      style={{ fontFamily: 'Segoe UI, sans-serif' }}
                    >
                      {stagedSelection.length}/{slotCount} options
                    </span>
                    <ChevronThin
                      size={16}
                      color="#262626"
                      rotate={mobilePillsExpanded ? 0 : 180}
                      style={{ transition: 'transform 150ms ease-out' }}
                    />
                  </button>
                </div>
                {/* lg+: original horizontal pills row, locked to the
                    width of 2 option cards + 1 12px gap above so the
                    pills span the same extent as 2 OptionCards. */}
                <div className="hidden lg:flex items-center gap-2 lg:flex-none lg:w-[calc((100%-36px)*2/3.125+12px)] min-w-0 overflow-x-auto scrollbar-none">
                  {pillNodes}
                </div>
                {/* Action buttons row.
                    XS-M: wrapper is a full-width flex row hosting Cancel
                      + Compare Options as equal-width buttons (matches
                      the SignatureOverlay confirm pattern). The Close X
                      is hidden — Cancel handles dismissal.
                    lg+: `lg:contents` dissolves this wrapper so Compare
                      Options and Close X become direct flex children of
                      the outer row, allowing `lg:ml-auto` to push them
                      to the right edge. */}
                <div className="flex gap-2 w-full lg:contents">
                  <button
                    type="button"
                    onClick={() => setChangeOptionOpen(false)}
                    className="flex-1 lg:hidden h-10 bg-white border border-solid border-[#d9d9d9] text-[14px] rounded-[4px] flex items-center justify-center cursor-pointer"
                    style={{ fontFamily: 'Segoe UI, sans-serif', color: 'rgba(0,0,0,0.85)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={stagedSelection.length < 2}
                    onClick={() => {
                      if (isLgUp) {
                        // lg+ supports a 2- OR 3-option comparison. We
                        // just commit whatever the user staged (length
                        // is already gated to >= 2 by the disabled check).
                        setComparisonTriple(stagedSelection);
                      } else {
                        setComparisonPair([
                          stagedSelection[0],
                          stagedSelection[1],
                        ] as [number, number]);
                      }
                      setChangeOptionOpen(false);
                    }}
                    className="flex-1 lg:flex-none lg:shrink-0 lg:ml-auto h-10 lg:px-6 text-[14px] font-semibold rounded-[4px] flex items-center justify-center bg-[#d41a32] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Segoe UI, sans-serif', lineHeight: '18px' }}
                  >
                    Compare Options
                  </button>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setChangeOptionOpen(false)}
                    className="hidden lg:flex shrink-0 items-center justify-center border border-solid border-[#d9d9d9] rounded-[4px] bg-white cursor-pointer"
                    style={{ width: 40, height: 40 }}
                  >
                    <XmarkLarge size={16} color="#262626" />
                  </button>
                </div>
              </div>
                );
              })()
            ) : (
              <div className="px-4 lg:px-8 pb-4 lg:pb-8 flex lg:justify-center">
                <button
                  type="button"
                  onClick={() => setChangeOptionOpen(false)}
                  className="w-full lg:w-[240px] h-10 bg-white border border-solid border-[#d9d9d9] text-[14px] rounded-[4px] flex items-center justify-center cursor-pointer"
                  style={{ fontFamily: 'Segoe UI, sans-serif', color: 'rgba(0,0,0,0.85)' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail bottom sheet — opened by clicking a product line item in
          the comparison section. Closed via backdrop, X (desktop), Close (mobile),
          or Escape. */}
      <ProductDetailSheet
        open={!!productDetail}
        content={productDetail}
        onClose={() => setProductDetail(null)}
      />

      {/* Payment Schedule dialog — opened by clicking Contract Total or
          Estimated Monthly Payment in any option's comparison column. */}
      <PaymentScheduleDialog
        data={scheduleData}
        onClose={closeSchedule}
        financingExcluded={config.financingEstimation === 'excluded'}
        scheduledPaymentsCount={config.scheduledPaymentsCount}
      />
    </div>
  );
}
