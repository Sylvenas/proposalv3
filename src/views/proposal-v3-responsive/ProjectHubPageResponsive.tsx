'use client';

import { useEffect, useRef, useState } from 'react';
import PageHeader from './PageHeader';
import BackToTopButton from './BackToTopButton';
import ProjectHubStickyHeader, { type ProjectHubTab } from './ProjectHubStickyHeader';

// ── Asset paths ───────────────────────────────────────────────────────────────
const BASE = '/images/proposal-v3-responsive';
const IMG_LEFT_ARROW        = `${BASE}/left-arrow.svg`;
const IMG_LEFT_ARROW_24     = `${BASE}/left-arrow-24.svg`;
const IMG_MINUS_ICON        = `${BASE}/minus-icon.svg`;
const IMG_DRAWING           = `${BASE}/summary-drawing.webp`;
const IMG_PRODUCT_THUMB     = `${BASE}/product-thumb.webp`;
const IMG_INFO_ICON         = `${BASE}/info-icon.svg`;
const IMG_INFO_DUOTONE_BG   = `${BASE}/info-duotone-bg.svg`;
const IMG_INFO_DUOTONE_FG   = `${BASE}/info-duotone-fg.svg`;
const IMG_CHEVRON_RIGHT     = `${BASE}/chevron-right.svg`;
const IMG_DROPDOWN_BTN      = `${BASE}/dropdown-btn.svg`;
const IMG_ZOOM_IN           = `${BASE}/zoom-in.svg`;
const IMG_ZOOM_OUT          = `${BASE}/zoom-out.svg`;
const IMG_ZOOM_FIT          = `${BASE}/zoom-fit.svg`;
const IMG_CALCULATOR        = `${BASE}/calculator.svg`;
const IMG_PHONE             = `${BASE}/phone.svg`;
const IMG_DOWNLOAD          = `${BASE}/download.svg`;
const IMG_CHECKMARK         = `${BASE}/checkmark.svg`;

// ── Types ─────────────────────────────────────────────────────────────────────
export type FenceOption = {
  id: number;
  label: string;
  features: string;
  constructionTime: string;
  price: string;
  contractTotal: string;
  monthly: string;
  image: string;
  products: { name: string; qty: string; unit: string }[];
  /** Base materials cost (before any addons) used to compute dynamic financials. */
  baseMaterials: number;
};

type AddonItem = {
  id: number;
  name: string;
  qty: string;
  unit: string;
  price: string;
  selected: boolean;
};

// ── Sample data ───────────────────────────────────────────────────────────────
const DEFAULT_ADDONS: AddonItem[] = [
  { id: 1, name: 'Gate Opener – LiftMaster 8500W',     qty: '1',   unit: 'ea.', price: '450',  selected: false },
  { id: 2, name: 'Privacy Slats – Black PVC',          qty: '240', unit: 'lf.', price: '680',  selected: false },
  { id: 3, name: 'Post Lighting – Solar LED',          qty: '6',   unit: 'ea.', price: '320',  selected: false },
  { id: 4, name: 'Concrete Pads – Standard 12"',       qty: '4',   unit: 'ea.', price: '180',  selected: false },
  { id: 5, name: 'Security Camera Mount – Adjustable', qty: '2',   unit: 'ea.', price: '140',  selected: false },
];

// ── Financial calculation ─────────────────────────────────────────────────────
// Rules (simple, realistic):
//   materials  = baseMaterials + sum of selected addon prices
//   discount   = round(materials × 5%)
//   afterDisc  = materials − discount
//   tax        = round(afterDisc × 8%)
//   total      = afterDisc + tax
//   monthly    = total / 24  (0%-interest 24-month estimate)
type Financials = {
  materials: number;
  discount: number;
  tax: number;
  contractTotal: number;
  monthly: number;
};

function computeFinancials(baseMaterials: number, addons: AddonItem[]): Financials {
  const addonTotal = addons
    .filter((a) => a.selected)
    .reduce((sum, a) => sum + parseInt(a.price, 10), 0);
  const materials = baseMaterials + addonTotal;
  const discount = Math.round(materials * 0.05);
  const afterDiscount = materials - discount;
  const tax = Math.round(afterDiscount * 0.08);
  const contractTotal = afterDiscount + tax;
  const monthly = contractTotal / 24;
  return { materials, discount, tax, contractTotal, monthly };
}

// ── Format helper ─────────────────────────────────────────────────────────────
function fmtDollars(n: number, decimals = 0): string {
  return (
    '$' +
    n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

// ── Animated number hook ──────────────────────────────────────────────────────
// Smoothly eases from the previous value to a new target value using rAF.
// First render: no animation (instant display of initial value).
// Subsequent changes: ease-out cubic over 500 ms.
// Interrupted animations start from the current displayed value (no jump).
function useAnimatedNumber(target: number): number {
  const DURATION = 500;
  const [displayed, setDisplayed] = useState(target);
  // Track current displayed value for smooth interruption
  const displayedRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      displayedRef.current = target;
      setDisplayed(target);
      return;
    }

    const from = displayedRef.current;
    const to = target;
    if (Math.abs(from - to) < 0.005) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      displayedRef.current = current;
      setDisplayed(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        displayedRef.current = to;
        setDisplayed(to);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return displayed;
}

// ── AnimatedDollar ────────────────────────────────────────────────────────────
// Renders an animated dollar value as an inline <span>.
// `decimals=0` → whole dollars (rounds during animation)
// `decimals=2` → cents shown (animates through fractional values)
function AnimatedDollar({
  value,
  decimals = 0,
  suffix = '',
  className,
  style,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const displayed = useAnimatedNumber(value);
  const text = fmtDollars(displayed, decimals) + suffix;
  return (
    <span className={className} style={style}>
      {text}
    </span>
  );
}

// ── ActionHeader ──────────────────────────────────────────────────────────────
// Mobile (<md):  h-40px, icon 16×16 (clip 15.75px, inner 10.5×9px), text 12px, gap-[2px], p-1
// Desktop (md+): h-52px + border-b-[0.5px], icon 24×24 (inner 13.969×12.008px), text 14px, gap-1, px-1 py-[6px]
function ActionHeader({ onBack }: { onBack: () => void }) {
  return (
    <>
      {/* Mobile (< md) */}
      <div className="md:hidden bg-white flex items-center w-full" style={{ height: 40, paddingTop: 8, paddingBottom: 8 }}>
        <button
          onClick={onBack}
          className="flex items-center gap-[2px] p-1 rounded-[4px] cursor-pointer bg-transparent border-0"
        >
          <img src={IMG_LEFT_ARROW} alt="" style={{ width: 16, height: 16, display: 'block', flexShrink: 0 }} />
          <span
            className="text-[12px] text-[#262626] leading-[16px] whitespace-nowrap"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Change Option
          </span>
        </button>
      </div>

      {/* Desktop (md+) */}
      <div
        className="hidden md:flex bg-white items-center w-full lg:border-b-[0.5px] lg:border-[rgba(0,0,0,0.1)]"
        style={{ height: 52, paddingTop: 2, paddingBottom: 2 }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-[4px] cursor-pointer bg-transparent border-0"
          style={{ height: 32, paddingLeft: 4, paddingRight: 4, paddingTop: 6, paddingBottom: 6 }}
        >
          <div className="flex items-center justify-end shrink-0" style={{ width: 20 }}>
            <div className="relative shrink-0 overflow-clip" style={{ width: 24, height: 24 }}>
              <div className="absolute" style={{ width: 13.969, height: 12.008, left: 'calc(50% - 0.02px)', top: 'calc(50% + 0.02px)', transform: 'translate(-50%, -50%)' }}>
                <img src={IMG_LEFT_ARROW_24} alt="" className="absolute inset-0 block w-full h-full" style={{ maxWidth: 'none' }} />
              </div>
            </div>
          </div>
          <span
            className="text-[14px] text-[#262626] leading-[18px] whitespace-nowrap"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Change Option
          </span>
        </button>
      </div>
    </>
  );
}

// ── OptionSummaryTitleBlock ───────────────────────────────────────────────────
// showSummaryLabel: shows "SUMMARY" header label (used in the Summary panel below scope)
// hideSummaryLabel: omits it (used in the mobile "Option Header" above scope)
function OptionSummaryTitleBlock({
  option,
  showSummaryLabel = false,
}: {
  option: FenceOption;
  showSummaryLabel?: boolean;
}) {
  return (
    <div
      className="bg-white flex flex-col items-start w-full leading-normal text-[#262626]"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {showSummaryLabel && (
        // Mobile (XS/S): --font-m → 14px / 16px
        // Desktop (M-XXL): --font-l → 20px / 24px
        <p className="text-[14px] sm:text-[16px] md:text-[20px] xl:text-[24px] font-semibold w-full">
          SUMMARY
        </p>
      )}
      {/* Option name — --font-l both variants: 16px / 20px / 24px */}
      <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-semibold w-full">
        {option.label}
      </p>
      {/* Address — --font-m both variants: 14px / 16px / 20px */}
      <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full">
        1722 Willis Ave NW, Grand Rapids, MI 49504
      </p>
    </div>
  );
}

// ── ProjectHomeTitleBlock ────────────────────────────────────────────────────
// Title block shown at the top of the Project Home Details area on all
// breakpoints. Replaces option-level labels with the proposal-level ones:
//   "CONTRACT DETAIL"          ← section label (was "SUMMARY")
//   "FENCE REPLACEMENT PROPOSAL" ← proposal name (was option.label)
//   address
function ProjectHomeTitleBlock({ approvedAt }: { approvedAt?: Date | null }) {
  // Formats `approvedAt` as M/D/YYYY (e.g. 3/18/2026) without leading zeros.
  // Falls back to today's date if the caller didn't capture an approval time
  // (safety net for direct renders that skipped the Summary → approve flow).
  const approvalDate = approvedAt ?? new Date();
  const approvedLabel =
    `Proposal Approved on ` +
    `${approvalDate.getMonth() + 1}/${approvalDate.getDate()}/${approvalDate.getFullYear()}`;

  return (
    <div
      className="bg-white flex flex-col items-start w-full leading-normal text-[#262626]"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Address — shown above the proposal name (same responsive size
          steps as the line below, font-normal). */}
      <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full">
        1722 Willis Ave NW, Grand Rapids, MI 49504
      </p>
      {/* Proposal name */}
      <p className="text-[16px] sm:text-[20px] xl:text-[24px] font-semibold w-full">
        FENCE REPLACEMENT PROPOSAL
      </p>
      {/* Approval timestamp — replaces the duplicated address line.
          Extra top padding (Spacing S = 8px) separates it from the
          proposal name above. */}
      <p className="text-[14px] sm:text-[16px] xl:text-[20px] font-normal w-full pt-2">
        {approvedLabel}
      </p>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────
// Internal px follows the Figma --margin-(component) variable per breakpoint:
//   XS: 16px  S/M: 32px  L: 24px  XL: 32px  XXL: 48px
function SectionCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        'bg-white flex flex-col gap-3 items-start w-full',
        'rounded-[12px]',
        'shadow-[0px_1px_5px_0px_rgba(0,0,0,0.2)]',
        'py-6',
        // Internal horizontal padding per breakpoint
        'px-4 sm:px-8 lg:px-6 xl:px-8 2xl:px-12',
      ].join(' ')}
    >
      {/* Section label row */}
      <div className="flex items-center justify-between w-full shrink-0">
        <p
          className="font-semibold text-[12px] sm:text-[14px] xl:text-[16px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap leading-normal"
          style={{ fontFamily: 'Segoe UI, sans-serif' }}
        >
          {label}
        </p>
        <img src={IMG_MINUS_ICON} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
      </div>
      {/* Content */}
      {children}
    </div>
  );
}

// ── Drawing section ───────────────────────────────────────────────────────────
function DrawingSection() {
  return (
    <SectionCard label="Drawing">
      <div className="flex flex-col gap-4 lg:gap-3 items-start w-full">
        {/* Drawing image — aspect ratio 2306:1548 ≈ 3:2 */}
        <div className="relative w-full overflow-hidden rounded-[2px]" style={{ aspectRatio: '2306 / 1548' }}>
          <img
            src={IMG_DRAWING}
            alt="Site drawing"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        {/* Zoom controls — dark glass morphism buttons */}
        <div className="flex gap-3 items-end justify-center w-full">
          {([IMG_ZOOM_IN, IMG_ZOOM_OUT, IMG_ZOOM_FIT] as const).map((icon, i) => (
            <button
              key={i}
              className="flex items-center justify-center rounded-[4px] cursor-pointer shrink-0"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(2px)',
                boxShadow: '0px 0px 2px 0px rgba(0,0,0,0.25)',
                border: 'none',
                paddingLeft: i < 2 ? 2 : 0,
              }}
              aria-label={['Zoom in', 'Zoom out', 'Fit to view'][i]}
            >
              <img src={icon} alt="" style={{ width: 24, height: 24 }} />
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ── Category label row ────────────────────────────────────────────────────────
function CategoryLabel({ name, count }: { name: string; count: number }) {
  return (
    <div className="bg-white flex gap-1 items-center w-full" style={{ height: 48 }}>
      <p
        className="font-semibold text-[14px] sm:text-[16px] xl:text-[20px] text-[#262626] whitespace-nowrap leading-normal shrink-0"
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        {name}
      </p>
      {/* Count badge */}
      <div
        className="bg-[#f0f0f0] flex flex-col items-center justify-center py-[2px] rounded-[4px] shrink-0"
        style={{ width: 18, height: 18 }}
      >
        <span
          className="text-[12px] sm:text-[14px] xl:text-[16px] text-[#262626] leading-normal text-center"
          style={{ fontFamily: 'Segoe UI, sans-serif', fontWeight: 300 }}
        >
          {count}
        </span>
      </div>
    </div>
  );
}

// ── Product line item ─────────────────────────────────────────────────────────
// Mobile (< md): name + info on row 1, qty on row 2, upgrade on row 3
// Desktop (md+): single row — [Name flex-1][Qty w-110px][Info w-48px][Upgrade w-80px], h-48px
type ProductItem = { name: string; qty: string; unit: string; hasUpgrade?: boolean };

function ProductLineItem({ item }: { item: ProductItem }) {
  return (
    <div className="bg-white border-t-[0.5px] border-[rgba(0,0,0,0.1)] flex gap-2 items-start py-3 w-full">
      {/* Thumbnail */}
      <div className="flex flex-col items-start p-[2px] rounded-[4px] shrink-0" style={{ width: 48, height: 48 }}>
        <div className="relative w-full aspect-square rounded-[2px] overflow-hidden">
          <img
            src={IMG_PRODUCT_THUMB}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-[2px]"
          />
        </div>
      </div>

      {/* Mobile layout (< md): stacked rows */}
      <div className="flex md:hidden flex-[1_0_0] flex-col gap-1 items-start min-w-0 pr-1">
        {/* Row 1: name + info */}
        <div className="flex gap-4 items-center w-full min-w-0">
          <p
            className="flex-[1_0_0] min-w-0 text-[14px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {item.name}
          </p>
          <div className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24 }}>
            <img src={IMG_INFO_ICON} alt="Info" style={{ width: 16.33, height: 16.33 }} />
          </div>
        </div>
        {/* Row 2: qty */}
        <div
          className="flex flex-[1_0_0] gap-2 items-center text-[14px] text-[#737373]"
          style={{ fontFamily: 'Segoe UI, sans-serif', fontWeight: 300 }}
        >
          <span className="whitespace-nowrap">{item.qty}</span>
          <span style={{ width: 32 }}>{item.unit}</span>
        </div>
        {/* Row 3: upgrade control */}
        {item.hasUpgrade && (
          <div className="flex items-center">
            <span
              className="text-[14px] font-semibold text-[#262626] tracking-[-0.56px] whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ fontFamily: 'Segoe UI, sans-serif' }}
            >
              Change
            </span>
            <div className="flex items-center justify-center" style={{ width: 24, height: 24 }}>
              <img src={IMG_CHEVRON_RIGHT} alt="" style={{ width: 16, height: 16 }} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop layout (md+): single row, fixed-height 48px */}
      <div className="hidden md:flex flex-[1_0_0] min-w-0 items-center gap-2 pr-1" style={{ height: 48 }}>
        {/* Name — flex-1 */}
        <p
          className="flex-[1_0_0] min-w-0 text-[16px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ fontFamily: 'Segoe UI, sans-serif' }}
        >
          {item.name}
        </p>
        {/* Qty — w-110px */}
        <div
          className="flex gap-2 items-center shrink-0 text-[16px] text-[#737373]"
          style={{ width: 110, fontFamily: 'Segoe UI, sans-serif', fontWeight: 300 }}
        >
          <span className="whitespace-nowrap">{item.qty}</span>
          <span style={{ width: 36 }}>{item.unit}</span>
        </div>
        {/* Info — w-48px h-24px */}
        <div className="flex items-center justify-center shrink-0" style={{ width: 48, height: 24 }}>
          <img src={IMG_INFO_ICON} alt="Info" style={{ width: 16.33, height: 16.33 }} />
        </div>
        {/* Upgrade control — w-80px */}
        <div className="flex items-center justify-end shrink-0" style={{ width: 80 }}>
          {item.hasUpgrade && (
            <div className="flex items-start">
              <span
                className="text-[16px] font-semibold text-[#262626] tracking-[-0.64px] whitespace-nowrap"
                style={{ fontFamily: 'Segoe UI, sans-serif' }}
              >
                Change
              </span>
              <div className="flex items-center justify-center" style={{ width: 24, height: 24 }}>
                <img src={IMG_CHEVRON_RIGHT} alt="" style={{ width: 16, height: 16 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Included Products section ─────────────────────────────────────────────────
// All line items render as plain Type=Product (no Upgrade control, no addon
// configuration). Selected addons from the Summary page appear as a new
// "Add-ons" category at the end of the list when any are selected.
function ProductsSection({
  products,
  selectedAddons,
}: {
  products: { name: string; qty: string; unit: string }[];
  selectedAddons: AddonItem[];
}) {
  // Extra secondary category (always shown as demo data)
  const secondaryItems: ProductItem[] = [
    { name: 'Gate Hardware Set – Heavy Duty',  qty: '2',   unit: 'set' },
    { name: 'Concrete – Fast-Set 50lb',        qty: '24',  unit: 'bag' },
    { name: 'Wire Ties – Galvanised 9ga',      qty: '100', unit: 'ea.' },
  ];

  return (
    <SectionCard label="Included Products">
      <div className="flex flex-col gap-4 items-start w-full">
        {/* Category 1 */}
        <div className="flex flex-col items-start overflow-hidden w-full">
          <CategoryLabel name="Category Name" count={products.length} />
          {products.map((p, i) => (
            <ProductLineItem key={i} item={p} />
          ))}
        </div>
        {/* Category 2 */}
        <div className="flex flex-col items-start overflow-hidden w-full">
          <CategoryLabel name="Category Name" count={secondaryItems.length} />
          {secondaryItems.map((p, i) => (
            <ProductLineItem key={i} item={p} />
          ))}
        </div>
        {/* Add-ons category — only rendered when the user selected any
            add-ons on the Summary page. Selected add-ons display as plain
            Type=Product line items (no configurability here). */}
        {selectedAddons.length > 0 && (
          <div className="flex flex-col items-start overflow-hidden w-full">
            <CategoryLabel name="Add-ons" count={selectedAddons.length} />
            {selectedAddons.map((a) => (
              <ProductLineItem
                key={a.id}
                item={{ name: a.name, qty: a.qty, unit: a.unit }}
              />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
      {/* Background */}
      <div
        className={`absolute inset-0 rounded-[2px] ${
          checked ? 'bg-[#262626]' : 'border border-solid border-black'
        }`}
      />
      {/* Checkmark */}
      {checked && (
        <div className="absolute inset-[18.75%_21.88%_25%_18.75%]">
          <img src={IMG_CHECKMARK} alt="" className="block w-full h-full object-contain" />
        </div>
      )}
    </div>
  );
}

// ── Add-on line item ──────────────────────────────────────────────────────────
// Mobile (< md): stacked rows — name+info / qty+price / added+checkbox
// Desktop (md+): single row — [Name flex-1][Qty w-110px][Price w-88px][Info w-48px][Checkbox w-64px], outer items-center h-80px
//
// Interaction model:
//   Touch (XS/S/M): tap anywhere on the card toggles the addon.
//     - onPointerDown captures pointerType; onClick only fires on tap (not scroll) → safe toggle.
//     - Checkbox button stops propagation so the outer onClick doesn't double-fire.
//   Mouse (all sizes): only the checkbox button toggles (outer onClick ignores mouse).
function AddonLineItem({ item, onToggle }: { item: AddonItem; onToggle: () => void }) {
  // Captures the input type on press so onClick can distinguish touch from mouse.
  const pointerTypeRef = useRef<string>('');

  return (
    <div
      className={`bg-white flex gap-2 items-start md:items-center px-2 py-3 md:py-0 md:h-[80px] rounded-[8px] w-full border-solid ${
        item.selected ? 'border-[#262626]' : 'border-[#d9d9d9]'
      }`}
      style={{ borderWidth: '1.5px' }}
      onPointerDown={(e) => { pointerTypeRef.current = e.pointerType; }}
      onClick={() => {
        // Touch/stylus tap anywhere → toggle.
        // Mouse clicks are handled exclusively by the checkbox button (which stops propagation).
        if (pointerTypeRef.current !== 'mouse') onToggle();
      }}
    >
      {/* Thumbnail — always shown, stays 48×48 */}
      <div className="flex flex-col items-start p-[2px] rounded-[4px] shrink-0" style={{ width: 48, height: 48 }}>
        <div className="relative w-full aspect-square rounded-[2px] overflow-hidden">
          <img
            src={IMG_PRODUCT_THUMB}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-[2px]"
          />
        </div>
      </div>

      {/* Mobile layout (< md): stacked rows */}
      <div className="flex md:hidden flex-[1_0_0] flex-col gap-1 items-start min-w-0 pr-1">
        {/* Row 1: name + info */}
        <div className="flex gap-4 items-center w-full min-w-0">
          <p
            className="flex-[1_0_0] min-w-0 text-[14px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {item.name}
          </p>
          <div className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24 }}>
            <img src={IMG_INFO_ICON} alt="Info" style={{ width: 16.33, height: 16.33 }} />
          </div>
        </div>
        {/* Row 2: qty + price */}
        <div
          className="flex items-center justify-between w-full text-[14px]"
          style={{ fontFamily: 'Segoe UI, sans-serif', fontWeight: 300 }}
        >
          <div className="flex flex-[1_0_0] gap-2 items-center text-[#737373]">
            <span className="whitespace-nowrap">{item.qty}</span>
            <span style={{ width: 32 }}>{item.unit}</span>
          </div>
          <div className="flex flex-[1_0_0] gap-[2px] items-center justify-end text-[#262626] whitespace-nowrap">
            <span>+$</span>
            <span className="text-right">{item.price}</span>
          </div>
        </div>
        {/* Row 3: Added/Add label + checkbox */}
        <div className="flex gap-2 items-center justify-end w-full" style={{ height: 24 }}>
          <div
            className={`flex flex-[1_0_0] flex-col justify-center text-[14px] font-semibold text-[#262626] tracking-[-0.56px] whitespace-nowrap overflow-hidden text-ellipsis ${
              !item.selected ? 'opacity-0' : ''
            }`}
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {item.selected ? 'Added' : 'Add'}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="cursor-pointer bg-transparent border-0 p-0 shrink-0"
          >
            <Checkbox checked={item.selected} />
          </button>
        </div>
      </div>

      {/* Desktop layout (md+): single row, fixed-height 48px content */}
      <div className="hidden md:flex flex-[1_0_0] min-w-0 items-center gap-2 pr-1" style={{ height: 48 }}>
        {/* Name — flex-1 */}
        <p
          className="flex-[1_0_0] min-w-0 text-[16px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ fontFamily: 'Segoe UI, sans-serif' }}
        >
          {item.name}
        </p>
        {/* Qty — w-110px */}
        <div
          className="flex gap-2 items-center shrink-0 text-[16px] text-[#737373]"
          style={{ width: 110, fontFamily: 'Segoe UI, sans-serif', fontWeight: 300 }}
        >
          <span className="whitespace-nowrap">{item.qty}</span>
          <span style={{ width: 36 }}>{item.unit}</span>
        </div>
        {/* Price — w-88px */}
        <div
          className="flex gap-[2px] items-center shrink-0 text-[16px] text-[#262626] whitespace-nowrap"
          style={{ width: 88, fontFamily: 'Segoe UI, sans-serif', fontWeight: 300 }}
        >
          <span>+$</span>
          <span>{item.price}</span>
        </div>
        {/* Info — w-48px h-24px */}
        <div className="flex items-center justify-center shrink-0" style={{ width: 48, height: 24 }}>
          <img src={IMG_INFO_ICON} alt="Info" style={{ width: 16.33, height: 16.33 }} />
        </div>
        {/* Checkbox in w-64px upgrade-control slot */}
        <div className="flex items-center justify-center shrink-0" style={{ width: 64 }}>
          {/* 64×64 touch target centred on the 20×20 checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center"
            style={{ width: 64, height: 64 }}
          >
            <Checkbox checked={item.selected} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add-ons section ───────────────────────────────────────────────────────────
// State is lifted to SummaryPageResponsive so financials can react to changes.
function AddonsSection({
  addons,
  onToggle,
}: {
  addons: AddonItem[];
  onToggle: (id: number) => void;
}) {
  return (
    <SectionCard label="Add-ons">
      <div className="flex flex-col gap-4 items-start w-full">
        {addons.map((addon) => (
          <AddonLineItem key={addon.id} item={addon} onToggle={() => onToggle(addon.id)} />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Sticky Header ─────────────────────────────────────────────────────────────
// XS/S/M only (lg:hidden). Appears when the top OptionSummaryTitleBlock scrolls
// off screen; disappears when the bottom one is fully visible.
// Slides in from top / slides out to top with 0.3s ease.
function StickyHeader({ option, visible }: { option: FenceOption; visible: boolean }) {
  return (
    <div
      className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-[0.5px] border-[rgba(0,0,0,0.2)] flex items-center gap-2 px-4 sm:px-6 w-full"
      style={{
        paddingTop: 12,
        paddingBottom: 12,
        boxShadow: '0px 4px 3px 0px rgba(123,123,123,0.1)',
        fontFamily: 'Segoe UI, sans-serif',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Option name — flex-1, semibold 14px, truncated */}
      <p className="flex-1 min-w-0 text-[14px] sm:text-[16px] font-semibold text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap">
        {option.label}
      </p>
      {/* Chevron rotated 90° → points down */}
      <div className="shrink-0 flex items-center justify-center" style={{ width: 16, height: 16, transform: 'rotate(90deg)' }}>
        <img src={IMG_DROPDOWN_BTN} alt="" style={{ width: 16, height: 16, display: 'block' }} />
      </div>
    </div>
  );
}

// ── Sticky Footer ─────────────────────────────────────────────────────────────
// XS  (mobileLayout=Yes): --margin=8px, --xs=4px,  font-s=12px
// S/M (mobileLayout=No):  --margin=8px, --l=16px,  font-m=14px
// Shown on XS/S/M only (lg:hidden). Disappears when first CTA button is visible.
// Numbers animate via useAnimatedNumber when financials change.
function InfoDuotoneIcon() {
  return (
    <div className="relative shrink-0 overflow-clip" style={{ width: 16, height: 16 }}>
      {/* bg circle */}
      <div className="absolute" style={{ width: 12, height: 12, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <img src={IMG_INFO_DUOTONE_BG} alt="" className="absolute inset-0 block w-full h-full" style={{ maxWidth: 'none' }} />
      </div>
      {/* i glyph */}
      <div className="absolute" style={{ width: 3, height: 6, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <img src={IMG_INFO_DUOTONE_FG} alt="" className="absolute inset-0 block w-full h-full" style={{ maxWidth: 'none' }} />
      </div>
    </div>
  );
}

function StickyFooter({
  visible,
  financials,
  onScrollToSummary,
  onSignApprove,
}: {
  visible: boolean;
  financials: Financials;
  onScrollToSummary: () => void;
  onSignApprove: () => void;
}) {
  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white flex gap-1 items-center justify-end w-full p-4 sm:p-6"
      style={{
        boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.12), 0px 4px 24px 0px rgba(0,0,0,0.2)',
        fontFamily: 'Segoe UI, sans-serif',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Pricing — flex-1 */}
      <div className="flex flex-1 flex-col items-start min-w-0">
        {/* Contract Total + info icon */}
        <div className="flex gap-1 items-center w-full shrink-0">
          <p className="text-[20px] sm:text-[24px] font-semibold text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap shrink-0">
            <AnimatedDollar value={financials.contractTotal} decimals={2} />
          </p>
          <InfoDuotoneIcon />
        </div>
        {/* Subtitle — XS=12px, S/M=16px */}
        <p
          className="text-[12px] sm:text-[16px] text-[#737373] leading-normal overflow-hidden text-ellipsis whitespace-nowrap w-full"
          style={{ fontWeight: 400 }}
        >
          Starting at <AnimatedDollar value={financials.monthly} decimals={2} /> / mo
        </p>
      </div>

      {/* Summary button — XS px=12px, S/M px=32px */}
      <div className="flex items-center self-stretch">
        <button
          onClick={onScrollToSummary}
          className="bg-white border-[0.5px] border-solid border-[#262626] flex items-center justify-center h-full rounded-[2px] cursor-pointer px-3 sm:px-8"
          style={{ paddingTop: 6, paddingBottom: 6 }}
        >
          <span className="text-[14px] sm:text-[16px] text-[rgba(0,0,0,0.85)] leading-[18px] whitespace-nowrap">
            Summary
          </span>
        </button>
      </div>

      {/* Sign & Approve button — XS px=12px, S/M px=32px */}
      <div className="flex items-center self-stretch">
        <button
          onClick={onSignApprove}
          className="bg-[#d41a32] flex items-center justify-center h-full rounded-[2px] cursor-pointer border-0 px-3 sm:px-8"
          style={{ paddingTop: 4, paddingBottom: 4 }}
        >
          <span className="text-[14px] sm:text-[16px] font-semibold text-white leading-[16px] whitespace-nowrap tracking-[-0.48px] sm:tracking-[-0.56px]">
            Sign &amp; Approve
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Credit Card icon (inline SVG — no separate asset file needed) ─────────────
function CreditCardIcon() {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Card outline */}
      <rect x="1" y="1" width="18" height="14" rx="2" stroke="rgba(0,0,0,0.85)" strokeWidth="1.2" />
      {/* Magnetic stripe — thin stroke line */}
      <line x1="1" y1="5.5" x2="19" y2="5.5" stroke="rgba(0,0,0,0.85)" strokeWidth="1.2" />
      {/* Chip — outline only */}
      <rect x="3" y="9" width="4" height="3" rx="0.5" stroke="rgba(0,0,0,0.85)" strokeWidth="1" />
    </svg>
  );
}

// ── Project Home Details ──────────────────────────────────────────────────────
// The financial summary + Project-Hub–specific action buttons.
// Used in both the mobile top-of-page slot AND the desktop right column.
//
// Low density  (XS/S, < lg): --gutter=8px,  --xs=4px  → py-2, gap-1
// Med density  (L/XL/XXL, lg+): --gutter=12px, --xs=8px → py-3, gap-2
// Disclaimer: mobile (< lg) truncated single line + inline "Read more";
//             desktop (lg+) two full paragraphs stacked + "Read more" below.
function ProjectHomeDetails({
  option,
  financials,
}: {
  option: FenceOption;
  financials: Financials;
}) {
  // ── Payment progress (prototype values) ──────────────────────────────────
  // Demo: the user has already paid a fixed $5,000 deposit. The contract
  // total comes from `financials`, which reflects any addons selected on the
  // Summary page. Remaining = total − paid, clamped ≥ 0. The progress bar
  // fill is the paid / total ratio (clamped to 100%).
  const PAID_AMOUNT = 5000;
  const contractTotal = financials.contractTotal;
  const remaining     = Math.max(0, contractTotal - PAID_AMOUNT);
  const progressRatio = contractTotal > 0
    ? Math.min(1, PAID_AMOUNT / contractTotal)
    : 0;

  return (
    <div className="bg-white flex flex-col items-start w-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>

      {/* Contract Amount
           Low density  (< lg):  py=Gutter(8px)=py-2,  gap=XS(4px)=gap-1
           Med density  (lg+):   py=Gutter(12px)=py-3, gap=XS(8px)=gap-2 */}
      <div className="border-t-[0.5px] border-[rgba(0,0,0,0.2)] flex flex-col gap-4 lg:gap-3 items-start py-4 lg:py-3 w-full">

        {/* Payment Progress */}
        <div className="flex flex-col items-start gap-1 w-full">
          <p className="text-[12px] xl:text-[14px] text-[#737373] leading-[0] overflow-hidden text-ellipsis w-full whitespace-nowrap">
            <span className="leading-normal">Payment Progress </span>
            <span className="leading-normal" style={{ fontSize: 7.74 }}>1</span>
          </p>
          <p
            className="text-[16px] sm:text-[20px] xl:text-[24px] text-[#262626] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap"
            style={{ fontWeight: 300 }}
          >
            {fmtDollars(PAID_AMOUNT)}{' '}
            <span style={{ color: '#a0a0a0' }}>/ {fmtDollars(contractTotal)}</span>
          </p>
          {/* Progress bar — ~3/5 width, thin 2px track */}
          <div className="rounded-full overflow-hidden" style={{ width: '60%', height: 2, background: '#e0e0e0' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progressRatio * 100}%`, background: '#262626' }}
            />
          </div>
        </div>

        {/* Next Payment */}
        <div className="flex flex-col items-start w-full">
          <p className="text-[12px] xl:text-[14px] text-[#737373] leading-[0] overflow-hidden text-ellipsis w-full whitespace-nowrap">
            <span className="leading-normal">Next Payment </span>
            <span className="leading-normal" style={{ fontSize: 7.74 }}>2</span>
          </p>
          <p className="text-[20px] sm:text-[24px] xl:text-[32px] text-[#262626] overflow-hidden text-ellipsis w-full leading-normal whitespace-nowrap">
            {fmtDollars(remaining)}
          </p>
          <p className="text-[14px] sm:text-[16px] 2xl:text-[20px] font-normal text-[#262626] leading-normal w-full pt-4 lg:pt-3">
            100% balance due at project completion &lt;5/26/2028&gt;
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 lg:gap-3 items-start pt-4 lg:pt-6 pb-2 lg:pb-3 w-full">
        <div className="flex flex-col gap-3 items-start w-full">

          {/* Make A Payment — primary red */}
          <button className="bg-[#d41a32] border-0 flex items-center justify-center h-10 px-4 rounded-[4px] w-full cursor-pointer">
            <span className="text-[14px] font-semibold text-white text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
              Make A Payment
            </span>
          </button>

          {/* Financing Service */}
          <button className="bg-white border border-solid border-[#262626] flex gap-[6px] h-10 items-center justify-center px-4 rounded-[4px] w-full cursor-pointer">
            <div className="flex items-center justify-center shrink-0" style={{ width: 20, height: 20 }}>
              <img src={IMG_CALCULATOR} alt="" style={{ width: 14.9, height: 20 }} />
            </div>
            <span className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
              Financing Service
            </span>
          </button>

          {/* Contact Sales */}
          <button className="bg-white border border-solid border-[#262626] flex gap-[6px] h-10 items-center justify-center px-4 rounded-[4px] w-full cursor-pointer">
            <div className="flex items-center justify-center shrink-0" style={{ width: 20, height: 20 }}>
              <img src={IMG_PHONE} alt="" style={{ width: 20, height: 18 }} />
            </div>
            <span className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
              Contact Sales
            </span>
          </button>

          {/* Download Contract [PDF] */}
          <button className="bg-white border border-solid border-[#262626] flex gap-[6px] h-10 items-center justify-center px-4 rounded-[4px] w-full cursor-pointer">
            <div className="flex items-center justify-center shrink-0" style={{ width: 20, height: 20 }}>
              <img src={IMG_DOWNLOAD} alt="" style={{ width: 16, height: 17 }} />
            </div>
            <span className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap" style={{ lineHeight: '18px' }}>
              Download Contract [PDF]
            </span>
          </button>

        </div>

          {/* Payment Schedule & Records — link-style, gutter gap from bordered buttons */}
          <button className="bg-transparent border-0 flex gap-[8px] items-center justify-start px-0 py-1 w-full cursor-pointer mt-4 lg:mt-3">
            <CreditCardIcon />
            <span className="text-[14px] text-[rgba(0,0,0,0.85)] whitespace-nowrap" style={{ lineHeight: '18px' }}>
              Payment Schedule &amp; Records
            </span>
          </button>

        {/* Disclaimers */}
        <div className="flex flex-col items-start pt-6 w-full">

          {/* Mobile (< lg): note ① only, single-line truncated + "Read more" inline */}
          <div className="lg:hidden flex gap-3 items-start w-full">
            <p className="flex-[1_0_0] min-w-0 text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px] overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ fontWeight: 300 }}>
              <span style={{ fontSize: 7.74 }}>1 </span>
              Total project pricing is subject to change based on applicable taxes, fees, payment timing,
              and any final project adjustments. The final amount presented at the time of payment will control.
            </p>
            <div className="shrink-0 flex flex-col justify-center text-[12px] text-[rgba(0,0,0,0.85)] text-center">
              <span className="underline leading-normal" style={{ textDecorationSkipInk: 'none' }}>
                Read more
              </span>
            </div>
          </div>

          {/* Desktop (lg+): notes ①② fully expanded + "Read more" below */}
          <div className="hidden lg:flex flex-col gap-3 items-start w-full">
            <p className="text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px]" style={{ fontWeight: 300 }}>
              <span style={{ fontSize: 7.74 }}>1 </span>
              Total project pricing is subject to change based on applicable taxes, fees, payment timing,
              and any final project adjustments. The final amount presented at the time of payment will control.
            </p>
            <p className="text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px]" style={{ fontWeight: 300 }}>
              <span style={{ fontSize: 7.74 }}>2 </span>
              Any monthly payment information shown is an estimate only and is not a financing offer.
              Final payment amounts, interest rates, and loan terms are subject to lender review and will
              be confirmed during the formal application process.
            </p>
            <div className="text-[12px] text-[rgba(0,0,0,0.85)] text-center">
              <span className="underline leading-normal" style={{ textDecorationSkipInk: 'none' }}>
                Read more
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Project Hub Page ────────────────────────────────────────────────────
export default function ProjectHubPageResponsive({
  option,
  onShowCover,
  addons = DEFAULT_ADDONS,
  approvedAt = null,
}: {
  option: FenceOption;
  onShowCover: () => void;
  /** Shared addon selections from the Summary page. Selected items appear
   *  as a new "Add-ons" category inside Included Products. */
  addons?: AddonItem[];
  /** Timestamp the user approved the proposal (set in OptionsPageResponsive
   *  when the signature flow completes). Shown in the title block. */
  approvedAt?: Date | null;
}) {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Active hub tab (shared by the sticky header mobile + desktop) ──────────
  const [activeTab, setActiveTab] = useState<ProjectHubTab>('home');

  // ── Selected addons (read-only on Project Hub) ─────────────────────────────
  const selectedAddons = addons.filter((a) => a.selected);

  // ── Computed financials ────────────────────────────────────────────────────
  const financials = computeFinancials(option.baseMaterials, addons);

  // ── Sticky header: show when top title scrolls out; hide when bottom title fully visible ──
  const topTitleRef    = useRef<HTMLDivElement>(null);
  const bottomTitleRef = useRef<HTMLDivElement>(null);
  const [topTitleVisible,         setTopTitleVisible]         = useState(true);
  const [bottomTitleFullyVisible, setBottomTitleFullyVisible] = useState(false);
  const showStickyHeader = !topTitleVisible && !bottomTitleFullyVisible;

  useEffect(() => {
    const topEl    = topTitleRef.current;
    const bottomEl = bottomTitleRef.current;
    if (!topEl || !bottomEl) return;

    const topObs = new IntersectionObserver(
      ([e]) => setTopTitleVisible(e.isIntersecting),
      { threshold: 0 }
    );
    const bottomObs = new IntersectionObserver(
      ([e]) => setBottomTitleFullyVisible(e.isIntersecting),
      { threshold: 1 }
    );

    topObs.observe(topEl);
    bottomObs.observe(bottomEl);
    return () => { topObs.disconnect(); bottomObs.disconnect(); };
  }, []);

  // ── Sticky footer: hide when the CTA block scrolls into view ──────────────
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showStickyFooter, setShowStickyFooter] = useState(true);

  // ── Bottom padding: dynamically calculated so the max scroll position lands
  //    exactly with the mobile Summary section top aligned to the viewport top.
  const mobileSummaryRef = useRef<HTMLDivElement>(null);
  // pbRef and contentPb both start at 0 so their values are always in sync.
  // (Mismatch caused baseDocH to include stale padding on first recalc.)
  const pbRef = useRef(0);
  const [contentPb, setContentPb] = useState(0);

  useEffect(() => {
    const el = mobileSummaryRef.current;
    if (!el) return;

    const recalc = () => {
      if (window.innerWidth >= 1024) {
        pbRef.current = 32;
        setContentPb(32);
        return;
      }
      const rect = el.getBoundingClientRect();
      const summaryAbsTop = rect.top + window.scrollY;
      const viewportH = window.innerHeight;
      // Subtract the padding we previously added to get base document height
      const baseDocH = document.documentElement.scrollHeight - pbRef.current;
      // extra = amount needed so that maxScroll = summaryAbsTop
      const extra = Math.max(0, summaryAbsTop - (baseDocH - viewportH));
      pbRef.current = extra;
      setContentPb(extra);
    };

    // rAF ensures layout is fully settled before measuring
    const raf = requestAnimationFrame(recalc);
    window.addEventListener('resize', recalc);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', recalc);
    };
  }, []);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyFooter(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Unused here (Project Hub uses tab navigation instead of a sticky
  // title/footer pair) — reference them to satisfy the lint / unused checks
  // without removing the state in case we wire them up again later.
  void showStickyHeader;
  void showStickyFooter;
  void topTitleRef;
  void bottomTitleRef;
  void ctaRef;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader onShowCover={onShowCover} />

      {/*
        Sticky Project Hub header — replaces the "Change Option" action.
        Mobile: collapsible single-row dropdown; Desktop: horizontal tabs.
        Both stick to the top beneath the PageHeader.
      */}
      <div className="sticky top-0 z-40 bg-white">
        <div className="mx-auto w-full" style={{ minWidth: 360, maxWidth: 2160 }}>
          <ProjectHubStickyHeader active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/*
        Content container
        XS: px-4 (16px)   S: px-6 (24px)   M: px-6 (24px)
        L: px-6 (24px)   XL: px-6 (24px)  XXL: px-6 (24px)
      */}
      <div className="mx-auto flex flex-col gap-4 px-4 sm:px-6 lg:pt-4" style={{ minWidth: 360, maxWidth: 2160, paddingBottom: contentPb }}>

        {/*
          Mobile (XS/S/M < lg): Project Home Details at the very top of the
          content area — title + financials + action buttons — above all section
          cards (Drawing, Products, Add-ons).
        */}
        <div ref={mobileSummaryRef} className="lg:hidden flex flex-col gap-4 pt-8 sm:pt-12 w-full">
          <ProjectHomeTitleBlock approvedAt={approvedAt} />
          <ProjectHomeDetails option={option} financials={financials} />
        </div>

        {/*
          Main content area:
            XS / S / M: flex-col (stacked) — scope cards below Project Home Details
            L+: flex-row side-by-side, Scope 2/3 + Project Home Details 1/3, gap 12px
        */}
        <div className="flex flex-col lg:flex-row gap-3 w-full mt-4 lg:mt-0 lg:pt-4">

          {/* ── Scope Details column ── */}
          <div className="flex flex-col gap-4 w-full lg:flex-[2_1_0] min-w-0">
            <DrawingSection />
            <ProductsSection products={option.products} selectedAddons={selectedAddons} />
            {/* Back to Top — inside Scope Details on L+ */}
            <div className="hidden lg:flex lg:justify-center">
              <BackToTopButton onClick={scrollToTop} />
            </div>
          </div>

          {/* ── Project Home Details column — desktop (lg+) only, sticky ── */}
          <div className="hidden lg:block w-full lg:flex-[1_1_0] min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-6 xl:gap-8 2xl:gap-12 px-3 w-full">
              <ProjectHomeTitleBlock approvedAt={approvedAt} />
              <ProjectHomeDetails option={option} financials={financials} />
            </div>
          </div>
        </div>

        {/* Back to Top — below scope cards on mobile (< lg) */}
        <div className="lg:hidden flex justify-center">
          <BackToTopButton onClick={scrollToTop} />
        </div>
      </div>
    </div>
  );
}
