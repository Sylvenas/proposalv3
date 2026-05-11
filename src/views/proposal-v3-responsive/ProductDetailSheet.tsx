'use client';

import { useEffect, useRef, useState } from 'react';
import { useBodyScrollLock } from './useBodyScrollLock';
import ScrollHintArrows from './ScrollHintArrows';

// --- Assets -----------------------------------------------------------------
const BASE = '/images/proposal-v3-responsive';
const IMG_CHECKMARK = `${BASE}/checkmark.svg`;
const IMG_NO_PRODUCT_LOGO = `${BASE}/no-image-logo.png`;

// --- Animation tokens (match other dialogs in this folder) ------------------
const ANIM_MS = 240;
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN = 'cubic-bezier(0.7, 0, 0.84, 0)';

// --- Types ------------------------------------------------------------------
export type UpgradeOption = {
  id: string;
  title: string;          // e.g. '4"x4" Standard White Vinyl Line Posts'
  description: string;
  thumb?: string;         // Square thumbnail shown in the swatch row; falls
                          // back to the white-logo placeholder when omitted.
  images?: string[];      // Optional hero photos for this option
  priceDelta: number;     // 0 for the baseline option; signed delta vs baseline
};

export type ProductDetailContent =
  | {
      kind: 'product';
      category: string;
      qtyLabel: string;
      description: string;
      images?: string[];
      /** Footer label below the description. Defaults to
       *  "Included in this option" (matches the Options flow). Project Hub
       *  overrides this to "Included in the scope" to fit its post-approval
       *  vocabulary. */
      includedLabel?: string;
    }
  | {
      kind: 'upgrade';
      category: string;
      qtyLabel: string;
      options: UpgradeOption[];
      currentOptionId: string;
      onSelect: (id: string) => void;
      /** When true, the sheet acts as a read-only browser: users can flip
       *  through swatches and read each option's details, but no Select /
       *  Option Selected CTA is shown. Used by the Options comparison table
       *  where committing a change is not the intent. */
      readOnly?: boolean;
    }
  | {
      kind: 'addon';
      name: string;
      qtyLabel: string;
      description: string;
      priceDelta: number;
      images?: string[];
      selected: boolean;
      onToggle: () => void;
    };

// --- Helpers ----------------------------------------------------------------
function formatPriceDelta(n: number): string {
  if (n === 0) return '+$0';
  const sign = n > 0 ? '+' : '-';
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

// Label preceding the price delta in the upgrade sheet. The baseline option
// (priceDelta === 0) is "Standard Option"; everything above baseline is an
// "Upgrade". Format: "Standard Option +$0" / "Upgrade +$450".
function formatOptionPriceLabel(n: number): string {
  const kind = n === 0 ? 'Standard Option' : 'Upgrade';
  return `${kind} ${formatPriceDelta(n)}`;
}

// --- Sub-components ---------------------------------------------------------
// Matches the Invoice / Payment Detail Modal close button:
// transparent background, 4px-radius hover hit area, 16x16 stroke icon.
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-[4px] hover:bg-[rgba(0,0,0,0.04)]"
      style={{ width: 32, height: 32 }}
    >
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 3L13 13M13 3L3 13"
          stroke="#262626"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
      <div
        className={`absolute inset-0 rounded-[2px] ${
          checked ? 'bg-[#262626]' : 'border border-solid border-black'
        }`}
      />
      {checked && (
        <div className="absolute inset-[18.75%_21.88%_25%_18.75%]">
          <img src={IMG_CHECKMARK} alt="" className="block w-full h-full object-contain" />
        </div>
      )}
    </div>
  );
}

// Greyed-out 16x16 inline checkmark used inside the "Option Selected" pill on mobile.
function MiniCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} aria-hidden="true">
      <path
        d="M3 8.5l3 3 7-7"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Square thumbnail-sized "no image" placeholder for line-item rows.
 *  Same visual language as the big hero placeholder (light gray bg +
 *  centered white logo) so the fallback feels consistent across the
 *  proposal. Logo defaults to ~58% of the thumb size. */
export function NoImageThumb({ size = 48 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-black/10 rounded-[4px] shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={IMG_NO_PRODUCT_LOGO}
        alt=""
        className="object-contain"
        style={{ width: Math.round(size * 0.58), height: Math.round(size * 0.58) }}
      />
    </div>
  );
}

/** "No product image" placeholder block. Aspect-ratio 3:2 (width drives
 *  height) so it matches the hero-image slot in any variant / breakpoint. */
function NoImagePlaceholder({ logoSizePx }: { logoSizePx: number }) {
  return (
    <div
      className="bg-black/10 flex flex-col items-center justify-center w-full rounded-[8px] lg:rounded-[8px]"
      style={{ aspectRatio: '3 / 2' }}
    >
      <img
        src={IMG_NO_PRODUCT_LOGO}
        alt=""
        className="object-contain"
        style={{ width: logoSizePx, height: logoSizePx }}
      />
      <p
        className="text-center text-white"
        style={{ fontFamily: 'Segoe UI, sans-serif', fontSize: 16, marginTop: 8 }}
      >
        No product image
      </p>
    </div>
  );
}

// --- Main component ---------------------------------------------------------
export default function ProductDetailSheet({
  open,
  content,
  onClose,
}: {
  open: boolean;
  content: ProductDetailContent | null;
  onClose: () => void;
}) {
  useBodyScrollLock(open);

  // Keep last content visible during close animation
  const [last, setLast] = useState<ProductDetailContent | null>(content);
  useEffect(() => {
    if (content) setLast(content);
  }, [content]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Scroll viewport for the mobile bottom-sheet — observed by ScrollHintArrows
  // so the bouncing chevrons appear when there's more content above/below.
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  // Upgrade variant state — lifted up so the sticky mobile footer can mirror
  // the active swatch in the scroll body. Resets to the freshly-opened
  // upgrade's committed selection whenever the content swaps.
  const [upgradeActiveId, setUpgradeActiveId] = useState<string>('');
  useEffect(() => {
    if (content?.kind === 'upgrade') {
      setUpgradeActiveId(content.currentOptionId);
    }
  }, [content]);

  if (!last) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/60"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          backdropFilter: open ? 'blur(10px)' : 'blur(0px)',
          WebkitBackdropFilter: open ? 'blur(10px)' : 'blur(0px)',
          transition: open
            ? `opacity ${ANIM_MS}ms ${EASE_OUT}, backdrop-filter ${ANIM_MS}ms ${EASE_OUT}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_OUT}`
            : `opacity ${ANIM_MS}ms ${EASE_IN}, backdrop-filter ${ANIM_MS}ms ${EASE_IN}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_IN}`,
        }}
      />

      {/* Sheet (bottom-anchored, both mobile + desktop).
          Max-height caps:
            XS/S/M (<lg) — `100vh − 48px` so the floating PageHeader (h-12 =
              48px) stays visible above the sheet. If the body still
              overflows past that height, ScrollHintArrows show the bouncing
              chevrons.
            L+ — 90vh (unchanged; desktop has no fixed top bar to clear). */}
      <div
        className="fixed left-0 right-0 bottom-0 z-[81] bg-white flex flex-col overflow-hidden max-h-[calc(100vh-48px)] lg:max-h-[90vh]"
        style={{
          fontFamily: 'Segoe UI, sans-serif',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          boxShadow: '0px 2px 4px rgba(0,0,0,0.12), 0px 4px 24px rgba(0,0,0,0.20)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: open
            ? `transform ${ANIM_MS}ms ${EASE_OUT}`
            : `transform ${ANIM_MS}ms ${EASE_IN}`,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Desktop close button - anchored to top-right inside the sheet, 24px from edges.
            Hidden on mobile (mobile uses the Close button in the sticky footer instead). */}
        <div className="hidden lg:flex absolute top-0 right-0 pt-6 pr-6 z-10">
          <CloseButton onClick={onClose} />
        </div>

        {/* Scrollable content area — wrapped in a `relative flex flex-col`
            container so the bouncing scroll-hint arrows can anchor to the
            scroll viewport's edges without affecting layout. */}
        <div className="relative flex flex-col flex-1 min-h-0">
          <div ref={mobileScrollRef} className="flex-1 min-h-0 overflow-y-auto">
            <SheetContent
              content={last}
              onClose={onClose}
              upgradeActiveId={upgradeActiveId}
              setUpgradeActiveId={setUpgradeActiveId}
            />
          </div>
          {/* Bouncing chevrons — mobile only; the desktop layout uses its
              own column-anchored CTA and rarely overflows the sheet. */}
          <div className="lg:hidden">
            <ScrollHintArrows targetRef={mobileScrollRef} />
          </div>
        </div>

        {/* Sticky footer — XS/S/M only. Hosts the variant-specific bottom
            CTAs (Close on Product, Select+Close on Upgrade, Add/Remove+Close
            on Add-on) so they remain visible even when the body content
            overflows the viewport. */}
        <div className="lg:hidden shrink-0 px-4 pt-4 pb-6 bg-white">
          <SheetMobileFooter
            content={last}
            onClose={onClose}
            upgradeActiveId={upgradeActiveId}
          />
        </div>
      </div>
    </>
  );
}

// --- Mobile sticky footer router ------------------------------------------
// Renders the bottom-CTA stack for the currently-open variant. Lifted out of
// each body so it can be pinned to the bottom of the sheet while the body
// content scrolls behind it.
function SheetMobileFooter({
  content,
  onClose,
  upgradeActiveId,
}: {
  content: ProductDetailContent;
  onClose: () => void;
  /** Currently-previewed swatch (upgrade variant only). Sourced from the
   *  sheet's lifted state so this footer mirrors what the body shows. */
  upgradeActiveId: string;
}) {
  if (content.kind === 'product') {
    return (
      <button
        onClick={onClose}
        className="w-full h-10 bg-white border-[0.5px] border-[#262626] text-[12px] text-[rgba(0,0,0,0.85)] rounded-[2px] cursor-pointer"
      >
        Close
      </button>
    );
  }
  if (content.kind === 'upgrade') {
    return <UpgradeMobileFooter content={content} onClose={onClose} activeId={upgradeActiveId} />;
  }
  return <AddonMobileFooter content={content} onClose={onClose} />;
}

function UpgradeMobileFooter({
  content,
  onClose,
  activeId,
}: {
  content: Extract<ProductDetailContent, { kind: 'upgrade' }>;
  onClose: () => void;
  activeId: string;
}) {
  const { options, currentOptionId, onSelect, readOnly } = content;
  const active = options.find((o) => o.id === activeId) ?? options[0];
  const isActiveTheCurrentSelection = active.id === currentOptionId;
  return (
    <div className="flex flex-col gap-2 w-full">
      {!readOnly && (
        isActiveTheCurrentSelection ? (
          <div
            className="h-10 w-full flex items-center justify-center gap-2 rounded-[2px]"
            style={{ backgroundColor: '#bfbfbf' }}
          >
            <MiniCheckIcon />
            <span className="text-[12px] text-white">Option Selected</span>
          </div>
        ) : (
          <button
            onClick={() => onSelect(active.id)}
            className="h-10 w-full bg-white border-[0.5px] border-[#262626] text-[12px] text-[rgba(0,0,0,0.85)] rounded-[2px] cursor-pointer"
          >
            Select This Option
          </button>
        )
      )}
      <button
        onClick={onClose}
        className="h-10 w-full bg-white border-[0.5px] border-[#262626] text-[12px] text-[rgba(0,0,0,0.85)] rounded-[2px] cursor-pointer"
      >
        Close
      </button>
    </div>
  );
}

function AddonMobileFooter({
  content,
  onClose,
}: {
  content: Extract<ProductDetailContent, { kind: 'addon' }>;
  onClose: () => void;
}) {
  const { selected, onToggle } = content;
  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={onToggle}
        className="h-10 w-full bg-white border-[0.5px] border-[#262626] text-[12px] text-[rgba(0,0,0,0.85)] rounded-[2px] cursor-pointer"
      >
        {selected ? 'Remove' : 'Add'}
      </button>
      <button
        onClick={onClose}
        className="h-10 w-full bg-white border-[0.5px] border-[#262626] text-[12px] text-[rgba(0,0,0,0.85)] rounded-[2px] cursor-pointer"
      >
        Close
      </button>
    </div>
  );
}

// --- Content router (decides which variant body to render) -----------------
function SheetContent({
  content,
  onClose,
  upgradeActiveId,
  setUpgradeActiveId,
}: {
  content: ProductDetailContent;
  onClose: () => void;
  /** Currently-previewed swatch for the upgrade variant. Lifted to the sheet
   *  so the sticky mobile footer can mirror it. */
  upgradeActiveId: string;
  setUpgradeActiveId: (id: string) => void;
}) {
  if (content.kind === 'product') return <ProductBody content={content} onClose={onClose} />;
  if (content.kind === 'upgrade')
    return (
      <UpgradeBody
        content={content}
        onClose={onClose}
        activeId={upgradeActiveId}
        setActiveId={setUpgradeActiveId}
      />
    );
  return <AddonBody content={content} onClose={onClose} />;
}

// --- Product variant -------------------------------------------------------
function ProductBody({
  content,
  onClose,
}: {
  content: Extract<ProductDetailContent, { kind: 'product' }>;
  onClose: () => void;
}) {
  const { category, qtyLabel, description, images, includedLabel } = content;
  const includedText = includedLabel ?? 'Included in this option';
  const hasImages = !!images && images.length > 0;
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="w-full">
      {/* Mobile (<lg) */}
      <div className="lg:hidden flex flex-col gap-6 px-4 pt-8 pb-8 w-full">
        {hasImages ? (
          <div
            className="w-full overflow-hidden rounded-[4px] bg-[#f0f0f0]"
            style={{ aspectRatio: '732 / 510' }}
          >
            <img src={images![activeImage] ?? images![0]} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <NoImagePlaceholder logoSizePx={69} />
        )}

        <div className="flex flex-col gap-4 w-full">
          <p className="text-[16px] font-semibold text-[#262626]" style={{ letterSpacing: '-0.64px' }}>
            {category}
          </p>
          <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
            {qtyLabel}
          </p>
          <p className="text-[12px] text-[#262626] font-light whitespace-pre-line">{description}</p>
        </div>

        <p className="text-[12px] text-[#737373]" style={{ letterSpacing: '-0.48px' }}>
          {includedText}
        </p>
      </div>

      {/* Desktop (lg+) */}
      <div className="hidden lg:flex gap-8 px-12 py-12 w-full max-w-[1440px] mx-auto items-start">
        {/* Left column - image / placeholder */}
        <div className="flex-[8] min-w-0 flex flex-col gap-3">
          {hasImages ? (
            <div
              className="w-full overflow-hidden rounded-[8px] bg-[#f0f0f0]"
              style={{ aspectRatio: '732 / 510' }}
            >
              <img src={images![activeImage] ?? images![0]} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <NoImagePlaceholder logoSizePx={175} />
          )}
          {/* Thumbnails (desktop only, hidden when single image / placeholder) */}
          {hasImages && images!.length > 1 && (
            <div className="flex gap-2 items-center pt-3">
              {images!.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="shrink-0 cursor-pointer"
                  style={{
                    width: 86,
                    height: 64,
                    borderRadius: 4,
                    padding: 2,
                    border: i === activeImage ? '1.5px solid #000' : '1.5px solid transparent',
                  }}
                >
                  <div className="w-full h-full overflow-hidden rounded-[2px]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex-[4] min-w-0 flex flex-col gap-6 self-stretch">
          <div className="flex flex-col gap-4 w-full">
            <p className="text-[20px] font-semibold text-[#262626]" style={{ letterSpacing: '-0.8px' }}>
              {category}
            </p>
            <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
              {qtyLabel}
            </p>
            <p className="text-[12px] text-[#262626] font-light whitespace-pre-line">{description}</p>
          </div>
          <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
            {includedText}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Upgrade variant -------------------------------------------------------
function UpgradeBody({
  content,
  onClose,
  activeId,
  setActiveId,
}: {
  content: Extract<ProductDetailContent, { kind: 'upgrade' }>;
  onClose: () => void;
  /** Currently-previewed swatch — controlled by the sheet so the sticky
   *  mobile footer can mirror this value. */
  activeId: string;
  setActiveId: (id: string) => void;
}) {
  const { category, qtyLabel, options, currentOptionId, onSelect, readOnly } = content;

  const active = options.find((o) => o.id === activeId) ?? options[0];
  const isActiveTheCurrentSelection = active.id === currentOptionId;

  // Per-option hero image index — local; resets whenever the active swatch
  // changes via handleSwatchClick.
  const [imgIdx, setImgIdx] = useState(0);
  const activeImages = active.images ?? [];
  const hasImages = activeImages.length > 0;
  const mainImage = activeImages[imgIdx] ?? activeImages[0];

  const handleSwatchClick = (id: string) => {
    setActiveId(id);
    setImgIdx(0);
  };

  const handleSelectThisOption = () => {
    if (!isActiveTheCurrentSelection) onSelect(active.id);
  };

  return (
    <div className="w-full">
      {/* Mobile (<lg) */}
      <div className="lg:hidden flex flex-col gap-6 px-4 pt-8 pb-8 w-full">
        {/* Hero image + thumbnails of the active option */}
        <div className="flex flex-col gap-2 w-full">
          {hasImages ? (
            <div
              className="w-full overflow-hidden rounded-[4px] bg-[#f0f0f0]"
              style={{ aspectRatio: '732 / 510' }}
            >
              <img src={mainImage} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <NoImagePlaceholder logoSizePx={69} />
          )}
          {hasImages && activeImages.length > 1 && (
            <div className="flex gap-2 items-center">
              {activeImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className="shrink-0 cursor-pointer"
                  style={{
                    width: 43,
                    height: 32,
                    borderRadius: 2,
                    padding: 1,
                    border: i === imgIdx ? '1px solid #000' : '1px solid transparent',
                  }}
                >
                  <div className="w-full h-full overflow-hidden rounded-[1px]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category + qty + swatch row (bottom border) */}
        <div
          className="flex flex-col gap-3 pb-6 w-full"
          style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-[14px] md:text-[16px] font-semibold text-[#262626]">{category}</p>
            <p className="text-[14px] md:text-[16px] text-[#737373] tracking-[-0.04em]">
              {qtyLabel}
            </p>
          </div>
          <div className="flex gap-[10px] items-center">
            {options.map((opt) => {
              const selected = opt.id === activeId;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSwatchClick(opt.id)}
                  className="shrink-0 cursor-pointer"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 4,
                    padding: 2,
                    border: selected ? '1.5px solid #000' : '1.5px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <div className="w-full h-full overflow-hidden rounded-[2px] bg-black/10 flex items-center justify-center">
                    {opt.thumb ? (
                      <img src={opt.thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={IMG_NO_PRODUCT_LOGO}
                        alt=""
                        className="object-contain"
                        style={{ width: '58%', height: '58%' }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {/* Price label for the currently-active swatch — typography matches
              the qty line ("24 ea.") above so the two read as a pair. */}
          <p className="text-[14px] md:text-[16px] text-[#737373] tracking-[-0.04em]">
            {formatOptionPriceLabel(active.priceDelta)}
          </p>
        </div>

        {/* Active option title + description */}
        <div className="flex flex-col gap-4 w-full">
          <p className="text-[16px] font-semibold text-[#262626]" style={{ letterSpacing: '-0.64px' }}>
            {active.title}
          </p>
          <p className="text-[12px] text-[#262626] font-light">{active.description}</p>
        </div>

      </div>

      {/* Desktop (lg+) */}
      <div className="hidden lg:flex gap-8 px-12 py-12 w-full max-w-[1440px] mx-auto items-start">
        {/* Left column: hero + thumbs */}
        <div className="flex-[8] min-w-0 flex flex-col gap-3">
          {hasImages ? (
            <div
              className="w-full overflow-hidden rounded-[8px] bg-[#f0f0f0]"
              style={{ aspectRatio: '732 / 510' }}
            >
              <img src={mainImage} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <NoImagePlaceholder logoSizePx={175} />
          )}
          {hasImages && activeImages.length > 1 && (
            <div className="flex gap-2 items-center">
              {activeImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className="shrink-0 cursor-pointer"
                  style={{
                    width: 86,
                    height: 64,
                    borderRadius: 4,
                    padding: 2,
                    border: i === imgIdx ? '1.5px solid #000' : '1.5px solid transparent',
                  }}
                >
                  <div className="w-full h-full overflow-hidden rounded-[2px]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: category, swatches, option details, price, button */}
        <div className="flex-[4] min-w-0 flex flex-col gap-6 self-stretch">
          <div className="flex flex-col gap-8">
            {/* Category + qty + swatches (bottom border) */}
            <div
              className="flex flex-col gap-3 pb-6"
              style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}
            >
              <div className="flex flex-col gap-1">
                <p className="text-[16px] font-semibold text-[#262626]">{category}</p>
                <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
                  {qtyLabel}
                </p>
              </div>
              <div className="flex gap-[10px] items-center">
                {options.map((opt) => {
                  const selected = opt.id === activeId;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSwatchClick(opt.id)}
                      className="shrink-0 cursor-pointer"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 4,
                        padding: 2,
                        border: selected ? '1.5px solid #000' : '1.5px solid rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className="w-full h-full overflow-hidden rounded-[2px] bg-black/10 flex items-center justify-center">
                        {opt.thumb ? (
                          <img src={opt.thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={IMG_NO_PRODUCT_LOGO}
                            alt=""
                            className="object-contain"
                            style={{ width: '58%', height: '58%' }}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Price label for the currently-active swatch — typography
                  matches the qty line ("24 ea.") above so the two read as a
                  pair. */}
              <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
                {formatOptionPriceLabel(active.priceDelta)}
              </p>
            </div>

            {/* Active option title + description */}
            <div className="flex flex-col gap-4">
              <p className="text-[20px] font-semibold text-[#262626]" style={{ letterSpacing: '-0.8px' }}>
                {active.title}
              </p>
              <p className="text-[14px] xl:text-[16px] text-[#262626] font-light">{active.description}</p>
            </div>
          </div>

          {/* CTA — anchored to the bottom of the right column via `mt-auto`
              so it sits flush with the bottom of the image on the left, even
              when the description text is short. Omitted in readOnly mode
              (browse-only context). */}
          {!readOnly && (
              <button
                onClick={handleSelectThisOption}
                disabled={isActiveTheCurrentSelection}
                className="flex items-center justify-center rounded-[4px] cursor-pointer mt-auto w-full"
                style={{
                  height: 44,
                  padding: '6px 16px',
                  backgroundColor: isActiveTheCurrentSelection ? '#737373' : '#262626',
                  color: isActiveTheCurrentSelection ? '#333' : '#fff',
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: '18px',
                  cursor: isActiveTheCurrentSelection ? 'default' : 'pointer',
                }}
              >
                {isActiveTheCurrentSelection ? 'Option Selected' : 'Select This Option'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

// --- Add-on variant --------------------------------------------------------
function AddonBody({
  content,
  onClose,
}: {
  content: Extract<ProductDetailContent, { kind: 'addon' }>;
  onClose: () => void;
}) {
  const { name, qtyLabel, description, priceDelta, images, selected, onToggle } = content;
  const hasImages = !!images && images.length > 0;
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="w-full">
      {/* Mobile (<lg) */}
      <div className="lg:hidden flex flex-col gap-6 px-4 pt-8 pb-8 w-full">
        {hasImages ? (
          <div
            className="w-full overflow-hidden rounded-[4px] bg-[#f0f0f0]"
            style={{ aspectRatio: '732 / 510' }}
          >
            <img src={images![activeImage] ?? images![0]} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <NoImagePlaceholder logoSizePx={69} />
        )}

        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col">
            <p className="text-[12px] font-semibold text-[#262626]">Add-on</p>
            <p
              className="text-[16px] font-semibold text-[#262626]"
              style={{ letterSpacing: '-0.64px' }}
            >
              {name}
            </p>
          </div>
          <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
            {qtyLabel}
          </p>
          <p className="text-[12px] text-[#262626] font-light">{description}</p>
        </div>

        {/* Checkbox row: [Checkbox] [Add to Selection] | +$450 */}
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full bg-transparent border-0 p-0 cursor-pointer"
        >
          <Checkbox checked={selected} />
          <span className="text-[12px] font-semibold text-[#262626]">Add to Selection</span>
          <span className="text-[12px] text-[#bfbfbf]">|</span>
          <span className="text-[12px] text-[#262626] font-light">{formatPriceDelta(priceDelta)}</span>
        </button>
      </div>

      {/* Desktop (lg+) */}
      <div className="hidden lg:flex gap-8 px-12 py-12 w-full max-w-[1440px] mx-auto items-start">
        {/* Left column: image / placeholder */}
        <div className="flex-[8] min-w-0">
          {hasImages ? (
            <div
              className="w-full overflow-hidden rounded-[8px] bg-[#f0f0f0]"
              style={{ aspectRatio: '732 / 510' }}
            >
              <img src={images![activeImage] ?? images![0]} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <NoImagePlaceholder logoSizePx={175} />
          )}
        </div>

        {/* Right column */}
        <div className="flex-[4] min-w-0 flex flex-col gap-6 self-stretch">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-[16px] font-semibold text-[#262626]">Add-on</p>
                <p
                  className="text-[20px] font-semibold text-[#262626]"
                  style={{ letterSpacing: '-0.8px' }}
                >
                  {name}
                </p>
              </div>
              <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
                {qtyLabel}
              </p>
              <p className="text-[12px] text-[#262626] font-light">{description}</p>
            </div>
            <p className="text-[24px] text-[#262626] font-light">{formatPriceDelta(priceDelta)}</p>
          </div>

          {/* Checkbox + label (desktop has no extra Add/Close buttons - top X closes) */}
          <button
            onClick={onToggle}
            className="flex items-center gap-3 h-11 bg-transparent border-0 p-0 cursor-pointer self-start"
          >
            <Checkbox checked={selected} />
            <span
              className="text-[14px] font-semibold text-[#262626]"
              style={{ fontFamily: 'Roboto, sans-serif', lineHeight: '18px' }}
            >
              {selected ? 'Added to Selection' : 'Add to Selection'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
