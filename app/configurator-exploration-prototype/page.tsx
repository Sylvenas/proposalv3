'use client';

/**
 * Configurator Prototype — simulates the ArcSite iPad app experience.
 *
 * Mode 1 (prototype, outside the AntD product) + canvas-app + contract fidelity.
 * Per the arcsite-ds-apply skill: proposalv3 wires its own tokens via globals.css
 * (Tailwind + --arc-*), so we do NOT import bootstrap.css. This screen reproduces
 * the *actual* ArcSite iOS app, whose chrome uses iOS system colors and whose
 * drawing uses CAD render colors — neither is part of the ArcSite design tokens —
 * so colors here are matched literally to the source screenshot.
 *
 * Coordinate-space contract (canvas-prototype guide):
 *   - iPad chrome / toolbars / overlays:  viewport space, no zoom
 *   - Floor-plan geometry:                canvas space, lives inside ONE <g> so a
 *                                         future pan/zoom only transforms that group
 *   - Stroke widths:                      authored in canvas units; when zoom is
 *                                         added they become width / zoom
 * The whole iPad is rendered at a fixed design size and CSS-scaled to fit the
 * viewport (mirrors the proposalv3 --scale approach) so proportions stay locked.
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import ZoomControlsPill from '@/views/proposal-v3-responsive/ZoomControlsPill';
import {
  CloseButton as SheetCloseButton,
  Checkbox as SheetCheckbox,
  type ProductDetailContent,
} from '@/views/proposal-v3-responsive/ProductDetailSheet';
import {
  Home as HomeIcon,
  User as UserIcon,
  ProductInfo,
  ChevronThin,
  Card as CardIcon,
  DownloadStroke,
  Phone as PhoneStroke,
  CheckMark,
  Minus as MinusIcon,
  Search as SearchIcon,
  Calculator as CalculatorIcon,
  ArrowUp as ArrowUpIcon,
} from '@/views/proposal-v3-responsive/icons';

/* ------------------------------------------------------------------ */
/* Fixed design size of the iPad (logical points, landscape 11").      */
/* ------------------------------------------------------------------ */
const FRAME_W = 1194;
const FRAME_H = 834;
const BEZEL = 14;
const OUTER_W = FRAME_W + BEZEL * 2;
const OUTER_H = FRAME_H + BEZEL * 2;
const FOOTER_GAP = 28;
const FOOTER_H = 56;
const DESIGN_W = OUTER_W;
const DESIGN_H = OUTER_H + FOOTER_GAP + FOOTER_H;

/* Fixed design size of the homeowner's desktop browser window (Panel 2) —
   matched to the iPad device frame so the two panels share an identical
   footprint and the slide swap reads as one surface replacing another. */
const BROWSER_W = OUTER_W;
const BROWSER_H = OUTER_H + 130; // a touch taller than the iPad for more page real estate
const BROWSER_DESIGN_W = BROWSER_W;
const BROWSER_DESIGN_H = BROWSER_H + FOOTER_GAP + FOOTER_H;

/* ------------------------------------------------------------------ */
/* Flooring instances — the tappable hatch regions on the canvas.      */
/* Geometry is in floor-plan canvas coordinates (the SVG viewBox).     */
/* ------------------------------------------------------------------ */
type FloorInstance = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  product: string;
  category: string;
  area: number; // sq ft
  price: number; // USD
  baseId: string; // library id of the base (included) product
};

const FLOOR_INSTANCES: FloorInstance[] = [
  { id: 'bedroom3', x: 120, y: 262, w: 190, h: 168, product: 'Flooring - Oakwood | w5" | Staggered', category: 'Flooring', area: 130.2, price: 2604, baseId: 'oak-staggered' },
  { id: 'bedroom2', x: 120, y: 548, w: 190, h: 160, product: 'Flooring - Oakwood | w5" | Staggered', category: 'Flooring', area: 122.3, price: 2446, baseId: 'oak-staggered' },
  { id: 'master', x: 700, y: 210, w: 232, h: 238, product: 'Flooring - Oakwood | w5" | Staggered', category: 'Flooring', area: 162.9, price: 3258, baseId: 'oak-staggered' },
];

/* Product library shown by the "Add Upgrade Option" popover.
   refArea / refDelta are the figures for a REF_BASE_AREA-sized instance; they
   scale by (instance area / REF_BASE_AREA) for other rooms. */
const REF_BASE_AREA = 162.9;
const SOUNDPROOFING_CATEGORY = 'Soundproofing Treatment';
type LibraryItem = {
  id: string;
  name: string;
  color?: string;
  refArea?: number;
  refDelta?: number; // upgrade premium over base (for "Add Upgrade Option")
  refPrice?: number; // standalone price (for "Add Product")
  unit?: string; // unit of measure; when set it wins over the sq-ft/Each default
};
const PRODUCT_LIBRARY: { category: string; items: LibraryItem[] }[] = [
  {
    category: 'Flooring',
    items: [
      { id: 'oak-staggered', name: 'Flooring - Oakwood | w5" | Staggered', refArea: 162.9, refPrice: 3258 },
      { id: 'oak-herringbone', name: 'Flooring - Oakwood | w5” | Herringbone', refArea: 233.3, refDelta: 1640, refPrice: 4898 },
      { id: 'walnut-straight', name: 'Flooring - Walnut | w7” | Straight', refArea: 162.9, refDelta: 4704, refPrice: 7962 },
    ],
  },
  {
    category: SOUNDPROOFING_CATEGORY,
    items: [
      { id: 'acoustic-premium', name: 'Acoustic Underlayment | Premium', color: '#5cc46a', refArea: 162.9, refPrice: 2045 },
      { id: 'acoustic-standard', name: 'Acoustic Underlayment | Standard', color: '#4aa3ef', refArea: 162.9, refPrice: 1250 },
    ],
  },
];

/* One-time charges that don't exist on the CAD drawing and aren't tied to any
   material quantity (flat fees billed per job). They surface only in the Report
   Summary, each as its own line item with a fixed quantity and price. */
const OTHER_ITEMS_CATEGORY = 'Services & Fees';
type OtherItem = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  unitLabel?: string; // measure-column unit (e.g. "Each" for user-added items)
  thumb?: string; // swatch fill; falls back to the crossed-out empty swatch
  libId?: string; // source library product id (for user-added items); presets use `id`
};
const OTHER_ITEMS: OtherItem[] = [
  { id: 'fee-inspection', name: 'On-Site Inspection Fee', qty: 1, unitPrice: 250 },
  { id: 'fee-permit', name: 'Permit Filing & Processing', qty: 1, unitPrice: 180 },
  { id: 'fee-prep', name: 'Furniture Moving & Floor Prep', qty: 2, unitPrice: 175 },
];

/* The "Services & Fees" products offered in the Report Summary's "Add Other
   Items" picker: the same one-time services above (billed per service) plus two
   extended-warranty plans (billed per unit). Kept out of PRODUCT_LIBRARY so the
   upgrade / Add Product pickers stay flooring-only. */
const SERVICE_LIBRARY: { category: string; items: LibraryItem[] }[] = [
  {
    category: OTHER_ITEMS_CATEGORY,
    items: [
      ...OTHER_ITEMS.map((f) => ({ id: f.id, name: f.name, unit: 'service', refPrice: f.unitPrice })),
      { id: 'warranty-3yr', name: 'Extended Warranty - 3 years', unit: 'Each', refPrice: 299 },
      { id: 'warranty-5yr', name: 'Extended Warranty - 5 years', unit: 'Each', refPrice: 499 },
    ],
  },
];

/* Full candidate list for "Add Other Items": every flooring/soundproofing
   product plus the Services & Fees group. */
const ADD_OTHER_LIBRARY = [...PRODUCT_LIBRARY, ...SERVICE_LIBRARY];

const findLibraryItem = (id: string): LibraryItem | undefined =>
  ADD_OTHER_LIBRARY.flatMap((g) => g.items).find((it) => it.id === id);

const findLibraryEntry = (id: string): { item: LibraryItem; category: string } | undefined => {
  for (const g of ADD_OTHER_LIBRARY) {
    const item = g.items.find((it) => it.id === id);
    if (item) return { item, category: g.category };
  }
  return undefined;
};

/** A product's unit of measure and the price for one of that unit. Area-based
 *  products (everything with a reference area) are billed per square foot;
 *  anything else falls back to a per-item ("Each") charge. Drives the quantity
 *  step's unit label and the added line item's price. */
function unitOf(item: LibraryItem): { label: string; perUnit: number } {
  if (item.unit != null) return { label: item.unit, perUnit: item.refPrice ?? 0 };
  if (item.refArea != null) {
    return { label: 'sq ft', perUnit: item.refArea ? (item.refPrice ?? 0) / item.refArea : 0 };
  }
  return { label: 'Each', perUnit: item.refPrice ?? 0 };
}

const WALNUT_ORANGE = '#f6b15a';
const STAGGERED_FILL = '#eef4fd'; // flat light-blue tint (same lightness as the former magenta)

/** Map a product name to its canvas fill, keyed off the legend hatch style. */
function fillForProduct(product: string): string {
  if (product.includes('Herringbone')) return 'url(#hatchHerringbone)';
  if (product.includes('Straight')) return WALNUT_ORANGE;
  return STAGGERED_FILL; // Staggered → flat tint, no hatch
}

/* ------------------------------------------------------------------ */
/* Drawing-wide product configuration, shared between the canvas        */
/* (per-instance editing) and the Report sheet (whole-drawing summary). */
/* ------------------------------------------------------------------ */
type DrawingConfig = {
  selected: string | null;
  setSelected: React.Dispatch<React.SetStateAction<string | null>>;
  productModalOpen: boolean;
  setProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  upgrades: Record<string, string[]>;
  setUpgrades: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  added: Record<string, string[]>;
  setAdded: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  addon: Record<string, string[]>;
  setAddon: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  baseRemoved: Record<string, boolean>;
  setBaseRemoved: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

type SummaryUpgrade = {
  id: string;
  name: string;
  area: number;
  delta: number;
  thumb: string;
  measureText?: string; // overrides the sq-ft column (for fee/service upgrades)
};
type SummaryRow = {
  name: string;
  area: number;
  price: number;
  thumb: string;
  upgrades: SummaryUpgrade[];
  baseId: string; // this line item's library id (drives picker tags + actions)
  isBase: boolean; // true = a room's base product; false = an added product
  isAddon: boolean; // true = lives in the Optional Add-ons section
  instanceIds: string[]; // every instance folded into this line item
  feeId?: string; // set for a one-time fee (not a CAD product)
  unit?: string; // unit of measure (fees only — gates same-unit upgrade options)
  sourceId?: string; // library product id this row represents (excludes self from upgrades)
  measureText?: string; // overrides the sq-ft column (e.g. "Qty 1" for fees)
};
type SummaryCategory = { category: string; rows: SummaryRow[] };

/**
 * Roll every flooring instance on the drawing up into category → product rows,
 * summing area and price. This is the *aggregate* view: unlike the Product Setup
 * modal (which edits a single selected instance), the Summary collapses all
 * instances that share a product into one line item. Mirrors the modal's
 * first-level group set (base product unless removed, plus added products).
 *
 * Upgrade options are part of the grouping key: instances that carry an upgrade
 * option are kept as a *separate* line item from instances of the same base
 * product that don't — so their quantities never bleed together. The upgrade
 * itself is shown as an indented sub-row (matching the modal), with its area
 * and price delta summed across the instances that share it.
 */
function aggregateDrawing(
  added: Record<string, string[]>,
  baseRemoved: Record<string, boolean>,
  upgrades: Record<string, string[]>,
  addon: Record<string, string[]>,
  feeAddon: Record<string, boolean>,
  feeRemoved: Record<string, boolean>,
  customItems: OtherItem[] = [],
  feeUpgrades: Record<string, string[]> = {},
): SummaryCategory[] {
  type Flat = {
    category: string;
    name: string;
    area: number;
    price: number;
    thumb: string;
    upgradeSig: string;
    upgrades: SummaryUpgrade[];
    baseId: string;
    isBase: boolean;
    isAddon: boolean;
    instanceId: string;
  };
  const flat: Flat[] = [];
  FLOOR_INSTANCES.forEach((inst) => {
    const ratio = inst.area / REF_BASE_AREA;
    if (!(baseRemoved[inst.id] ?? false)) {
      // Upgrade options attach to the base flooring product. Their delta is
      // relative to the base product's reference price (same as the modal).
      const basePrice = findLibraryItem(inst.baseId)?.refPrice ?? 0;
      const ups = (upgrades[inst.id] ?? [])
        .map((id) => findLibraryItem(id))
        .filter((it): it is LibraryItem => !!it)
        .map((it) => ({
          id: it.id,
          name: it.name,
          area: (it.refArea ?? REF_BASE_AREA) * ratio,
          delta: ((it.refPrice ?? 0) - basePrice) * ratio,
          thumb: it.color ?? thumbBackground(it.name),
        }));
      flat.push({
        category: inst.category,
        name: inst.product,
        area: inst.area,
        price: inst.price,
        thumb: thumbBackground(inst.product),
        upgradeSig: ups.map((u) => u.id).sort().join(','),
        upgrades: ups,
        baseId: inst.baseId,
        isBase: true,
        isAddon: (addon[inst.id] ?? []).includes(inst.baseId),
        instanceId: inst.id,
      });
    }
    (added[inst.id] ?? []).forEach((id) => {
      const e = findLibraryEntry(id);
      if (!e) return;
      flat.push({
        category: e.category,
        name: e.item.name,
        area: (e.item.refArea ?? REF_BASE_AREA) * ratio,
        price: (e.item.refPrice ?? 0) * ratio,
        thumb: e.item.color ?? thumbBackground(e.item.name),
        upgradeSig: '',
        upgrades: [],
        baseId: e.item.id,
        isBase: false,
        isAddon: (addon[inst.id] ?? []).includes(e.item.id),
        instanceId: inst.id,
      });
    });
  });

  const cats: SummaryCategory[] = [];
  const keyFor = (g: Flat) => `${g.name}||${g.upgradeSig}||${g.isAddon}`;
  flat.forEach((g) => {
    let cat = cats.find((c) => c.category === g.category);
    if (!cat) {
      cat = { category: g.category, rows: [] };
      cats.push(cat);
    }
    const k = keyFor(g);
    let row = cat.rows.find(
      (r) => `${r.name}||${r.upgrades.map((u) => u.id).sort().join(',')}||${r.isAddon}` === k,
    );
    if (!row) {
      row = { name: g.name, area: 0, price: 0, thumb: g.thumb, upgrades: [], baseId: g.baseId, isBase: g.isBase, isAddon: g.isAddon, instanceIds: [] };
      cat.rows.push(row);
    }
    row.area += g.area;
    row.price += g.price;
    if (!row.instanceIds.includes(g.instanceId)) row.instanceIds.push(g.instanceId);
    // Merge the per-instance upgrade sub-rows by id (sum area + delta).
    g.upgrades.forEach((u) => {
      const ex = row!.upgrades.find((x) => x.id === u.id);
      if (ex) {
        ex.area += u.area;
        ex.delta += u.delta;
      } else {
        row!.upgrades.push({ ...u });
      }
    });
  });

  // One-time fees + user-added "Other Items" — each a standalone line item,
  // billed by quantity (not area). Custom items behave exactly like the preset
  // fees (removable / add-on toggle share the same feeRemoved / feeAddon maps).
  [...OTHER_ITEMS, ...customItems].forEach((f) => {
    if (feeRemoved[f.id]) return;
    let cat = cats.find((c) => c.category === OTHER_ITEMS_CATEGORY);
    if (!cat) {
      cat = { category: OTHER_ITEMS_CATEGORY, rows: [] };
      cats.push(cat);
    }
    const unit = f.unitLabel ?? 'service';
    const measureText = f.unitLabel
      ? `${f.qty} ${f.unitLabel}`
      : `${f.qty} service${f.qty === 1 ? '' : 's'}`;
    // Upgrade options for a fee are same-unit services billed at the fee's
    // quantity; the delta is the per-unit price difference times that quantity.
    const ups = (feeUpgrades[f.id] ?? [])
      .map((id) => findLibraryItem(id))
      .filter((it): it is LibraryItem => !!it)
      .map((it) => ({
        id: it.id,
        name: it.name,
        area: 0,
        delta: f.qty * ((it.refPrice ?? 0) - f.unitPrice),
        thumb: 'none',
        measureText,
      }));
    cat.rows.push({
      name: f.name,
      area: 0,
      price: f.qty * f.unitPrice,
      thumb: f.thumb ?? 'none', // no fill → render the crossed-out empty swatch
      upgrades: ups,
      baseId: f.id,
      isBase: true,
      isAddon: !!feeAddon[f.id],
      instanceIds: [],
      feeId: f.id,
      unit,
      sourceId: f.libId ?? f.id, // presets carry the library id in `id`; customs in `libId`
      measureText,
    });
  });

  const order = PRODUCT_LIBRARY.map((p) => p.category);
  const rank = (c: string) => {
    const i = order.indexOf(c);
    return i === -1 ? order.length : i; // unknown categories (fees) sort last
  };
  cats.sort((a, b) => rank(a.category) - rank(b.category));
  return cats;
}

export default function ConfiguratorPrototypePage() {
  const [scale, setScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Drawing-wide product configuration. Lifted here (rather than living inside
  // CanvasArea) because the Report sheet overlays the whole frame — toolbar
  // included — and needs to aggregate every instance's products.
  const [selected, setSelected] = useState<string | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [upgrades, setUpgrades] = useState<Record<string, string[]>>({});
  const [added, setAdded] = useState<Record<string, string[]>>({});
  const [addon, setAddon] = useState<Record<string, string[]>>({});
  const [baseRemoved, setBaseRemoved] = useState<Record<string, boolean>>({});
  // One-time fee line items (not on the CAD): which are flagged add-on / removed.
  const [feeAddon, setFeeAddon] = useState<Record<string, boolean>>({});
  const [feeRemoved, setFeeRemoved] = useState<Record<string, boolean>>({});
  // Upgrade options attached to a fee/service line item, keyed by fee id.
  const [feeUpgrades, setFeeUpgrades] = useState<Record<string, string[]>>({});
  // User-added "Other Items" line items (picked + given a quantity in the Report
  // Summary). Modeled as one-time fee rows so they share the fee add-on/remove maps.
  const [customItems, setCustomItems] = useState<OtherItem[]>([]);
  const customIdRef = useRef(0);
  const [reportOpen, setReportOpen] = useState(false);

  // Homeowner hand-off: once the setup is "sent", the iPad slides off to the
  // left and the browser (with the homeowner's Proposal Summary) slides in.
  const [sent, setSent] = useState(false);

  const cfg: DrawingConfig = {
    selected, setSelected,
    productModalOpen, setProductModalOpen,
    upgrades, setUpgrades,
    added, setAdded,
    addon, setAddon,
    baseRemoved, setBaseRemoved,
  };

  useEffect(() => {
    const fit = () => {
      const pad = 48;
      // The stage must fit whichever panel is larger (iPad vs. browser) so the
      // slide between them never rescales.
      const stageW = Math.max(DESIGN_W, BROWSER_DESIGN_W);
      const stageH = Math.max(DESIGN_H, BROWSER_DESIGN_H);
      const s = Math.min(
        (window.innerWidth - pad) / stageW,
        (window.innerHeight - pad) / stageH,
      );
      setScale(Math.min(s, 1));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const cell: React.CSSProperties = {
    width: '100vw',
    height: '100%',
    flex: '0 0 100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#2f3e4d',
        overflow: 'hidden',
      }}
    >
      {/* Two-panel sliding track: iPad (left) → browser (right). Sliding the
          whole track by one viewport width swaps panels regardless of scale. */}
      <div
        style={{
          display: 'flex',
          width: '200vw',
          height: '100%',
          transform: sent ? 'translateX(-100vw)' : 'translateX(0)',
          transition: 'transform 720ms cubic-bezier(0.66, 0, 0.34, 1)',
        }}
      >
      {/* ============ Panel 1 — the ArcSite iPad app ============ */}
      <div style={cell}>
      <div
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* iPad device frame */}
        <div
          style={{
            width: OUTER_W,
            height: OUTER_H,
            background: '#0a0a0c',
            borderRadius: 46,
            padding: BEZEL,
            boxShadow:
              '0 40px 90px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              width: FRAME_W,
              height: FRAME_H,
              background: '#ffffff',
              borderRadius: 32,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif',
              color: '#1c1c1e',
            }}
          >
            <StatusBar />
            <TopToolbar onOpenReports={() => setReportOpen(true)} />
            <RulerCorner />
            <CanvasArea {...cfg} />
            {reportOpen && (
              <ReportSheet
                categories={aggregateDrawing(added, baseRemoved, upgrades, addon, feeAddon, feeRemoved, customItems, feeUpgrades)}
                onAddUpgrade={(instanceIds, libId) =>
                  setUpgrades((prev) => {
                    const next = { ...prev };
                    instanceIds.forEach((id) => {
                      const cur = next[id] ?? [];
                      if (!cur.includes(libId)) next[id] = [...cur, libId];
                    });
                    return next;
                  })
                }
                onSwapUpgrade={(instanceIds, oldId, newId) =>
                  setUpgrades((prev) => {
                    const next = { ...prev };
                    instanceIds.forEach((id) => {
                      next[id] = (next[id] ?? []).map((x) => (x === oldId ? newId : x));
                    });
                    return next;
                  })
                }
                onRemoveUpgrade={(instanceIds, libId) =>
                  setUpgrades((prev) => {
                    const next = { ...prev };
                    instanceIds.forEach((id) => {
                      next[id] = (next[id] ?? []).filter((x) => x !== libId);
                    });
                    return next;
                  })
                }
                onToggleAddon={(instanceIds, key, makeAddon) =>
                  setAddon((prev) => {
                    const next = { ...prev };
                    instanceIds.forEach((id) => {
                      const cur = next[id] ?? [];
                      next[id] = makeAddon
                        ? cur.includes(key) ? cur : [...cur, key]
                        : cur.filter((x) => x !== key);
                    });
                    return next;
                  })
                }
                onRemoveProduct={(instanceIds, key, isBase) => {
                  if (isBase) {
                    setBaseRemoved((prev) => {
                      const next = { ...prev };
                      instanceIds.forEach((id) => {
                        next[id] = true;
                      });
                      return next;
                    });
                  } else {
                    setAdded((prev) => {
                      const next = { ...prev };
                      instanceIds.forEach((id) => {
                        next[id] = (next[id] ?? []).filter((x) => x !== key);
                      });
                      return next;
                    });
                    setAddon((prev) => {
                      const next = { ...prev };
                      instanceIds.forEach((id) => {
                        next[id] = (next[id] ?? []).filter((x) => x !== key);
                      });
                      return next;
                    });
                  }
                }}
                onToggleFeeAddon={(feeId, makeAddon) =>
                  setFeeAddon((prev) => ({ ...prev, [feeId]: makeAddon }))
                }
                onRemoveFee={(feeId) =>
                  setFeeRemoved((prev) => ({ ...prev, [feeId]: true }))
                }
                onAddFeeUpgrade={(feeId, libId) =>
                  setFeeUpgrades((prev) => {
                    const cur = prev[feeId] ?? [];
                    return cur.includes(libId) ? prev : { ...prev, [feeId]: [...cur, libId] };
                  })
                }
                onSwapFeeUpgrade={(feeId, oldId, newId) =>
                  setFeeUpgrades((prev) => ({
                    ...prev,
                    [feeId]: (prev[feeId] ?? []).map((x) => (x === oldId ? newId : x)),
                  }))
                }
                onRemoveFeeUpgrade={(feeId, libId) =>
                  setFeeUpgrades((prev) => ({
                    ...prev,
                    [feeId]: (prev[feeId] ?? []).filter((x) => x !== libId),
                  }))
                }
                onAddOtherItem={(libId, qty) => {
                  const it = findLibraryItem(libId);
                  if (!it) return;
                  const { label, perUnit } = unitOf(it);
                  customIdRef.current += 1;
                  setCustomItems((prev) => [
                    ...prev,
                    {
                      id: `custom-${customIdRef.current}`,
                      libId,
                      name: it.name,
                      qty,
                      unitPrice: perUnit,
                      unitLabel: label,
                      // No legend swatch — every Services & Fees line item uses the
                      // crossed-out placeholder, matching the preset fee rows.
                      thumb: 'none',
                    },
                  ]);
                }}
                onClose={() => setReportOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Primary CTA, floats on the dark background below the iPad */}
        <button
          type="button"
          onClick={() => setSent(true)}
          style={{
            marginTop: FOOTER_GAP,
            height: FOOTER_H,
            padding: '0 36px',
            background: '#1a8cff',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(26,140,255,0.35)',
          }}
        >
          Finish Setup &amp; Send to Homeowner
        </button>
      </div>
      </div>

      {/* ============ Panel 2 — the homeowner's browser ============ */}
      <div style={cell}>
        <div
          style={{
            width: BROWSER_DESIGN_W,
            height: BROWSER_DESIGN_H,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <BrowserWindow>
            <HomeownerProposal
              categories={aggregateDrawing(added, baseRemoved, upgrades, addon, feeAddon, feeRemoved, customItems, feeUpgrades)}
            />
          </BrowserWindow>

          {/* Return CTA, mirrors the iPad's send button on the far panel */}
          <button
            type="button"
            onClick={() => setSent(false)}
            style={{
              marginTop: FOOTER_GAP,
              height: FOOTER_H,
              padding: '0 36px',
              background: '#e8863a',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              boxShadow: '0 8px 22px rgba(232,134,58,0.35)',
            }}
          >
            Back to ArcSite App
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Status bar                                                          */
/* ================================================================== */
function StatusBar() {
  return (
    <div
      style={{
        height: 30,
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        fontSize: 14,
        fontWeight: 600,
        color: '#1c1c1e',
      }}
    >
      <div>
        14:58&nbsp;&nbsp;<span style={{ fontWeight: 600 }}>Mon Jun 29</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* wifi */}
        <svg width="18" height="13" viewBox="0 0 18 13" fill="#1c1c1e">
          <path d="M9 2.2c2.7 0 5.2 1 7.1 2.7l1.4-1.6C15.2 1.1 12.2 0 9 0S2.8 1.1.5 3.3l1.4 1.6C3.8 3.2 6.3 2.2 9 2.2Z" />
          <path d="M9 6.1c1.6 0 3.1.6 4.2 1.7l1.4-1.6C13.1 4.7 11.1 4 9 4s-4.1.7-5.6 2.2l1.4 1.6C5.9 6.7 7.4 6.1 9 6.1Z" />
          <path d="M9 10c.8 0 1.5.3 2 .9l-2 2.1-2-2.1c.5-.6 1.2-.9 2-.9Z" />
        </svg>
        {/* bluetooth */}
        <svg width="11" height="15" viewBox="0 0 11 15" fill="none" stroke="#1c1c1e" strokeWidth="1.3">
          <path d="M2 4l7 6.5L5.5 14V1l3.5 3.5L2 11" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600 }}>57%</span>
        {/* battery */}
        <svg width="26" height="14" viewBox="0 0 26 14">
          <rect x="0.5" y="0.5" width="21" height="13" rx="3.5" fill="none" stroke="#1c1c1e" strokeOpacity="0.4" />
          <rect x="2" y="2" width="13" height="10" rx="2" fill="#1c1c1e" />
          <rect x="23" y="4.5" width="2" height="5" rx="1" fill="#1c1c1e" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Top toolbar                                                         */
/* ================================================================== */
const BLUE = '#0a84ff';

function TopToolbar({ onOpenReports }: { onOpenReports: () => void }) {
  return (
    <div
      style={{
        height: 52,
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        borderBottom: '1px solid #ececec',
      }}
    >
      {/* left cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', color: BLUE, fontSize: 17 }}>
          <svg width="11" height="18" viewBox="0 0 11 18" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1L2 9l7 8" />
          </svg>
          <span style={{ marginLeft: 4 }}>Project 13</span>
        </span>
        <Icn title="undo">
          <path d="M7 7H15a5 5 0 010 10H9" />
          <path d="M7 7l4-4M7 7l4 4" />
        </Icn>
        <Icn title="redo">
          <path d="M17 7H9a5 5 0 000 10h6" />
          <path d="M17 7l-4-4M17 7l-4 4" />
        </Icn>
      </div>

      {/* center title */}
      <div style={{ fontSize: 17, fontWeight: 600, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        Drawing 10
      </div>

      {/* right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          onClick={onOpenReports}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: '#e1efff',
            color: BLUE,
            border: 'none',
            borderRadius: 9,
            padding: '6px 11px',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Reports
          <svg width="11" height="7" viewBox="0 0 11 7" fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l4.5 4.5L10 1" />
          </svg>
        </button>
        <Icn title="annotate-edit"><path d="M4 14l9-9 4 4-9 9H4v-4z" /><path d="M12 5l3 3" /></Icn>
        <Icn title="image"><rect x="3" y="4" width="16" height="14" rx="2" /><circle cx="8" cy="9" r="1.6" /><path d="M5 16l4-4 3 3 3-4 3 4" /></Icn>
        <Icn title="upload"><path d="M11 15V5M11 5L7 9M11 5l4 4" /><path d="M4 16v2a1 1 0 001 1h12a1 1 0 001-1v-2" /></Icn>
        <Icn title="export"><rect x="4" y="3" width="11" height="16" rx="1.5" /><path d="M9 8h7M9 11h7M9 14h4" /></Icn>
        <Icn title="share"><circle cx="6" cy="11" r="2.4" /><circle cx="16" cy="5" r="2.4" /><circle cx="16" cy="17" r="2.4" /><path d="M8 10l6-4M8 12l6 4" /></Icn>
        <Icn title="settings"><circle cx="11" cy="11" r="3" /><path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.5 4.5l2 2M15.5 15.5l2 2M17.5 4.5l-2 2M6.5 15.5l-2 2" /></Icn>
        <Icn title="help"><circle cx="11" cy="11" r="8.5" /><path d="M8.6 8.5a2.4 2.4 0 114.2 1.6c-.9.8-1.8 1.1-1.8 2.4" /><circle cx="11" cy="15.6" r="0.4" fill="currentColor" stroke="none" /></Icn>
        <span style={{ color: BLUE, fontSize: 16 }}>Debug</span>
      </div>
    </div>
  );
}

/** Stroke icon, 22px, gray. */
function Icn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="#5b5b60"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={title}
    >
      {children}
    </svg>
  );
}

/* ================================================================== */
/* Ruler corner + canvas                                               */
/* ================================================================== */
const RULER = 22; // ruler thickness
const TOOLRAIL = 78; // right tool rail width

/** Top horizontal ruler is rendered inside CanvasArea so it aligns with content. */
function RulerCorner() {
  return null;
}

function CanvasArea({
  selected, setSelected,
  productModalOpen, setProductModalOpen,
  upgrades, setUpgrades,
  added, setAdded,
  addon, setAddon,
  baseRemoved, setBaseRemoved,
}: DrawingConfig) {
  const selInst = FLOOR_INSTANCES.find((i) => i.id === selected) ?? null;

  // Product indicator shown beside "Product Setup". When the selected instance
  // has no products left (base removed + nothing added), there is no indicator.
  // With upgrades / add-ons attached, the subtitle shows their counts (e.g.
  // "2 upgrade options, 1 addon") instead of the category name.
  const selIndicator: { product: string; category: string } | null = (() => {
    if (!selInst) return null;
    const upgradeCount = (upgrades[selInst.id] ?? []).length;
    const addonCount = (addon[selInst.id] ?? []).length;
    const counts = [
      upgradeCount > 0 ? `${upgradeCount} upgrade option${upgradeCount > 1 ? 's' : ''}` : null,
      addonCount > 0 ? `${addonCount} addon${addonCount > 1 ? 's' : ''}` : null,
    ]
      .filter(Boolean)
      .join(', ');
    if (!(baseRemoved[selInst.id] ?? false)) {
      return { product: selInst.product, category: counts || selInst.category };
    }
    const firstAdded = (added[selInst.id] ?? [])[0];
    const entry = firstAdded ? findLibraryEntry(firstAdded) : undefined;
    return entry ? { product: entry.item.name, category: counts || entry.category } : null;
  })();

  // feet labels every 4'
  const hMarks: number[] = [];
  for (let f = 0; f <= 88; f += 4) hMarks.push(f);
  const vMarks = [8, 16, 24, 32, 40, 48]; // approximate visible vertical labels

  return (
    <div style={{ flex: '1 1 auto', position: 'relative', minHeight: 0 }}>
      {/* horizontal ruler */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: RULER,
          right: 0,
          height: RULER,
          background: '#f4f4f4',
          borderBottom: '1px solid #e2e2e2',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {hMarks.map((f) => (
          <div
            key={f}
            style={{
              width: `${100 / hMarks.length}%`,
              borderLeft: '1px solid #cfcfcf',
              height: '100%',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 3,
                top: 3,
                fontSize: 9.5,
                color: '#9a9a9a',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {f}&apos;
            </span>
          </div>
        ))}
      </div>

      {/* vertical ruler */}
      <div
        style={{
          position: 'absolute',
          top: RULER,
          left: 0,
          bottom: 0,
          width: RULER,
          background: '#f4f4f4',
          borderRight: '1px solid #e2e2e2',
          overflow: 'hidden',
        }}
      >
        {vMarks.map((f, i) => (
          <span
            key={f}
            style={{
              position: 'absolute',
              left: 3,
              top: `${10 + i * 15.5}%`,
              fontSize: 9.5,
              color: '#9a9a9a',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* drawing surface */}
      <div
        style={{
          position: 'absolute',
          top: RULER,
          left: RULER,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <FloorPlanSvg selected={selected} onSelect={setSelected} />

        {/* top-left overlays (screen space) */}
        <div style={{ position: 'absolute', top: 14, left: 16 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#3a3a3c',
              color: '#fff',
              borderRadius: 18,
              padding: '8px 16px 8px 12px',
              fontSize: 15,
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round">
              <path d="M9 2l7 3.5L9 9 2 5.5 9 2z" />
              <path d="M2 9l7 3.5L16 9M2 12.5L9 16l7-3.5" />
            </svg>
            Annotations
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              lineHeight: '17px',
              color: '#6b6b6b',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div style={{ background: '#ededed', display: 'inline-block', padding: '1px 4px' }}>
              Current Layer: Annotations, Zoom Level: 144.11%
            </div>
            <div>{selInst ? 'Selection: count = 1, layer = Annotations' : 'Selection: None'}</div>
            <div>Calibration Scale: 80.63</div>
          </div>
        </div>

        {/* legend (screen space, right of plan) */}
        <Legend />

        {/* bottom-left round buttons */}
        <div style={{ position: 'absolute', bottom: 18, left: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <RoundBtn label="Calibrate">
            <circle cx="13" cy="13" r="9" />
            <path d="M9 13l2.6 2.6L17 10" />
          </RoundBtn>
          <RoundBtn label="Lock">
            <rect x="6.5" y="12" width="13" height="9" rx="1.5" />
            <path d="M9 12V9a4 4 0 018 0" />
          </RoundBtn>
        </div>

        {/* ===== selection chrome (only when an instance is selected) ===== */}
        {selInst && (
          <>
            <ProductBar
              indicator={selIndicator}
              onSetup={() => setProductModalOpen(true)}
            />
            <ContextualMenu
              onDeselect={() => {
                setSelected(null);
                setProductModalOpen(false);
              }}
            />
          </>
        )}
      </div>

      {/* right tool rail */}
      <ToolRail />

      {/* product setup modal */}
      {productModalOpen && selInst && (
        <ProductItemModal
          inst={selInst}
          upgradeIds={upgrades[selInst.id] ?? []}
          addedIds={added[selInst.id] ?? []}
          onAddUpgrade={(libId) =>
            setUpgrades((prev) => {
              const cur = prev[selInst.id] ?? [];
              if (cur.includes(libId)) return prev;
              return { ...prev, [selInst.id]: [...cur, libId] };
            })
          }
          onSwapUpgrade={(oldId, newId) =>
            setUpgrades((prev) => ({
              ...prev,
              [selInst.id]: (prev[selInst.id] ?? []).map((x) => (x === oldId ? newId : x)),
            }))
          }
          onRemoveUpgrade={(libId) =>
            setUpgrades((prev) => ({
              ...prev,
              [selInst.id]: (prev[selInst.id] ?? []).filter((x) => x !== libId),
            }))
          }
          onAddProduct={(libId) =>
            setAdded((prev) => {
              const cur = prev[selInst.id] ?? [];
              if (cur.includes(libId)) return prev;
              return { ...prev, [selInst.id]: [...cur, libId] };
            })
          }
          addonIds={addon[selInst.id] ?? []}
          onToggleAddon={(libId) =>
            setAddon((prev) => {
              const cur = prev[selInst.id] ?? [];
              return {
                ...prev,
                [selInst.id]: cur.includes(libId) ? cur.filter((x) => x !== libId) : [...cur, libId],
              };
            })
          }
          baseRemoved={baseRemoved[selInst.id] ?? false}
          onRemove={(libId, isBase) => {
            if (isBase) {
              setBaseRemoved((prev) => ({ ...prev, [selInst.id]: true }));
            } else {
              setAdded((prev) => ({
                ...prev,
                [selInst.id]: (prev[selInst.id] ?? []).filter((x) => x !== libId),
              }));
              setAddon((prev) => ({
                ...prev,
                [selInst.id]: (prev[selInst.id] ?? []).filter((x) => x !== libId),
              }));
            }
          }}
          onClose={() => setProductModalOpen(false)}
        />
      )}
    </div>
  );
}

function RoundBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#4a4a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {children}
        </svg>
      </div>
      <span style={{ fontSize: 11, color: '#7a7a7a', fontFamily: 'Inter, system-ui, sans-serif' }}>{label}</span>
    </div>
  );
}

/* ================================================================== */
/* Selection chrome: top product indicator + bottom contextual menu    */
/* ================================================================== */
function ProductBar({
  indicator,
  onSetup,
}: {
  indicator: { product: string; category: string } | null;
  onSetup: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'stretch',
        gap: 10,
        fontFamily: 'Inter, system-ui, sans-serif',
        zIndex: 5,
      }}
    >
      {/* product indicator pill — omitted when the instance has no products */}
      {indicator && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            background: '#fff',
            borderRadius: 12,
            padding: '9px 18px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '1px solid #ececec',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#8a8a8a" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M3 3h7.2L19 11.8 11.8 19 3 10.2V3z" />
            <circle cx="7" cy="7" r="1.4" fill="#8a8a8a" stroke="none" />
          </svg>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>{indicator.product}</div>
            <div style={{ fontSize: 12, color: '#9a9a9a' }}>{indicator.category}</div>
          </div>
        </div>
      )}

      {/* product setup button — fixed height so it looks the same with or
          without the indicator pill (e.g. when the instance has no products) */}
      <button
        type="button"
        onClick={onSetup}
        style={{
          minHeight: 54,
          background: '#1a8cff',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '0 20px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(26,140,255,0.28)',
        }}
      >
        Product Setup
      </button>
    </div>
  );
}

function ContextualMenu({ onDeselect }: { onDeselect: () => void }) {
  const items: { key: string; label: string; node: React.ReactNode }[] = [
    {
      key: 'move',
      label: 'Move',
      node: (
        <>
          <path d="M11 3v16M3 11h16" />
          <path d="M11 3l-3 3M11 3l3 3M11 19l-3-3M11 19l3-3M3 11l3-3M3 11l3 3M19 11l-3-3M19 11l-3 3" />
        </>
      ),
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      node: (
        <>
          <rect x="7" y="7" width="11" height="11" rx="2" />
          <path d="M14 7V5a1 1 0 00-1-1H5a1 1 0 00-1 1v8a1 1 0 001 1h2" />
        </>
      ),
    },
    {
      key: 'zoom',
      label: 'Zoom to Fit',
      node: (
        <>
          <path d="M4 8V4h4M18 8V4h-4M4 14v4h4M18 14v4h-4" />
          <rect x="8.5" y="8.5" width="5" height="5" rx="1" />
        </>
      ),
    },
    {
      key: 'measure',
      label: 'Measure',
      node: (
        <>
          <path d="M3 14L14 3l5 5L8 19z" />
          <path d="M7 12l2 2M10 9l2 2M13 6l2 2" />
        </>
      ),
    },
    {
      key: 'attributes',
      label: 'Attributes',
      node: (
        <>
          <path d="M3 4h7l8 8-6 6-8-8z" />
          <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
        </>
      ),
    },
    {
      key: 'more',
      label: 'More',
      node: (
        <>
          <circle cx="5" cy="11" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="11" cy="11" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="17" cy="11" r="1.4" fill="currentColor" stroke="none" />
        </>
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: '#fff',
        borderRadius: 18,
        padding: 8,
        boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
        fontFamily: 'Inter, system-ui, sans-serif',
        zIndex: 5,
      }}
    >
      {/* deselect — boxed, with count */}
      <button
        type="button"
        onClick={onDeselect}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          background: '#f1f1f3',
          border: 'none',
          borderRadius: 12,
          padding: '8px 14px',
          cursor: 'pointer',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#4a4a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="3.5" width="15" height="15" rx="2.5" strokeDasharray="3 2.5" />
          <path d="M8 8l6 6M14 8l-6 6" />
        </svg>
        <span style={{ fontSize: 11, color: '#4a4a4f' }}>Deselect</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#5b5b60',
            background: '#fff',
            borderRadius: 6,
            padding: '0 7px',
            lineHeight: '15px',
          }}
        >
          1
        </span>
      </button>

      <Divider />

      {/* Move, Duplicate, Zoom to Fit */}
      {items.slice(0, 3).map((it) => (
        <MenuBtn key={it.key} label={it.label}>
          {it.node}
        </MenuBtn>
      ))}

      {/* Color & Styles */}
      <MenuBtn label="Color &amp; Styles">
        <circle cx="11" cy="11" r="7.5" fill="#c66bd6" stroke="none" />
        <circle cx="11" cy="11" r="7.5" stroke="#b657c8" />
      </MenuBtn>

      {/* Measure, Attributes, More */}
      {items.slice(3).map((it) => (
        <MenuBtn key={it.key} label={it.label}>
          {it.node}
        </MenuBtn>
      ))}

      <Divider />

      <MenuBtn label="Delete" tone="#e0352b">
        <path d="M4 6h14M9 6V4h4v2M6 6l1 13h8l1-13" />
        <path d="M9.5 9.5v6M12.5 9.5v6" />
      </MenuBtn>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, alignSelf: 'stretch', background: '#e6e6e6', margin: '4px 4px' }} />;
}

function MenuBtn({
  children,
  label,
  tone = '#4a4a4f',
}: {
  children: React.ReactNode;
  label: string;
  tone?: string;
}) {
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        background: 'transparent',
        border: 'none',
        borderRadius: 12,
        padding: '8px 12px',
        cursor: 'pointer',
        color: tone,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={tone} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
      <span
        style={{ fontSize: 11, color: tone, whiteSpace: 'nowrap' }}
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </button>
  );
}

/* ================================================================== */
/* Product Setup modal — lists products included on the instance       */
/* ================================================================== */
const fmtSqFt = (n: number) =>
  `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sq ft`;
const fmtUsd = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** CSS background for a product thumbnail — mirrors fillForProduct(). */
function thumbBackground(product: string): string {
  if (product.includes('Herringbone'))
    return 'repeating-linear-gradient(45deg,#fdeef6 0 3px,#dd9ec8 3px 4px)';
  if (product.includes('Straight')) return WALNUT_ORANGE;
  return STAGGERED_FILL; // Staggered → flat tint
}

const PRODUCT_ROW_ACTIONS = [
  'View Product Detail',
  'Find in Canvas',
  'Apply Visual Style',
  'Swap Product/Bundle',
  'Add Upgrade Option',
  'Set as Add-on',
  'Remove Product',
];

/** Row action items with the upgrade / add-on mutual-exclusion rules applied:
 *  once a product carries an upgrade option it can no longer be set as an add-on,
 *  and once a product lives in the Add-ons section it can no longer take an
 *  upgrade option. Used by both the Report Summary and the Product Setup modal. */
function rowActionsFor(hasUpgrade: boolean, isAddon: boolean): string[] {
  return PRODUCT_ROW_ACTIONS.filter((action) => {
    if (action === 'Set as Add-on' && hasUpgrade) return false;
    if (action === 'Add Upgrade Option' && isAddon) return false;
    return true;
  });
}

/** Library popover for picking a product. `isDisabled` / `tagFor` control
 *  which items are pickable and how they are labelled; `placement` positions
 *  the popover (the upgrade flow anchors to the row ••• ; Add Product anchors
 *  above the footer button). */
function ProductPickerPopover({
  title,
  isDisabled,
  tagFor,
  onPick,
  placement,
  library = PRODUCT_LIBRARY,
}: {
  title: string;
  isDisabled: (id: string) => boolean;
  tagFor: (id: string) => string;
  onPick: (libId: string) => void;
  placement: React.CSSProperties;
  library?: { category: string; items: LibraryItem[] }[];
}) {
  return (
    <div
      style={{
        position: 'absolute',
        width: 460,
        maxHeight: 560,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
        border: '1px solid #ececec',
        zIndex: 31,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...placement,
      }}
    >
      {/* header */}
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, color: '#1c1c1e', padding: '16px 0 12px' }}>
        {title}
      </div>

      {/* search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 12px' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f0f0f1',
            borderRadius: 10,
            padding: '9px 12px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9a9a9e" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <span style={{ color: '#9a9a9e', fontSize: 15 }}>Search</span>
        </div>
        <span style={{ color: BLUE, fontSize: 20, letterSpacing: '1px' }}>•••</span>
      </div>

      {/* grouped library */}
      <div style={{ overflowY: 'auto' }}>
        {library.map((group) => (
          <div key={group.category}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 18px',
                fontSize: 15,
                fontWeight: 600,
                color: '#3a3a3c',
                background: '#fafafa',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              {group.category}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9a9a9e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5l4 4 4-4" />
              </svg>
            </div>

            {group.items.map((item) => {
              const disabled = isDisabled(item.id);
              const tag = tagFor(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && onPick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    borderTop: '1px solid #f5f5f5',
                    background: 'transparent',
                    padding: '11px 18px',
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                  }}
                >
                  {group.category === OTHER_ITEMS_CATEGORY ? (
                    // Services & Fees products have no legend — show the same
                    // crossed-out placeholder swatch used by their line items.
                    <ProductSwatch thumb="none" size={44} />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        flex: '0 0 auto',
                        borderRadius: 8,
                        border: '1px solid #e6dde3',
                        background: item.color ?? thumbBackground(item.name),
                      }}
                    />
                  )}
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 16,
                      fontWeight: disabled ? 400 : 500,
                      color: disabled ? '#9a9a9e' : '#1c1c1e',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </span>
                  {tag && (
                    <span style={{ flex: '0 0 auto', color: '#9a9a9e', fontSize: 15 }}>{tag}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Second page of the "Add Other Items" flow: after a product is picked, the
 *  user enters a quantity here, then Add appends it to the summary line items. */
function OtherItemQuantityCard({
  name,
  unit,
  qty,
  onChangeQty,
  onCancel,
  onAdd,
  placement,
}: {
  name: string;
  unit: string;
  qty: number;
  onChangeQty: (qty: number) => void;
  onCancel: () => void;
  onAdd: () => void;
  placement: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        width: 460,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
        border: '1px solid #ececec',
        zIndex: 31,
        overflow: 'hidden',
        ...placement,
      }}
    >
      {/* header */}
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, color: '#1c1c1e', padding: '18px 0 22px' }}>
        Select a Product
      </div>

      <div style={{ padding: '0 28px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1c1c1e' }}>{name}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28 }}>
          <span style={{ fontSize: 17, color: '#1c1c1e' }}>Quantity</span>
          <input
            type="number"
            min={1}
            step="any"
            value={qty}
            onChange={(e) => onChangeQty(Math.max(1, Number(e.target.value) || 1))}
            style={{
              marginLeft: 'auto',
              width: 190,
              textAlign: 'right',
              fontSize: 17,
              padding: '10px 12px',
              border: '1px solid #d0d0d5',
              borderRadius: 8,
              background: '#fff',
              color: '#1c1c1e',
            }}
          />
          <span style={{ fontSize: 17, color: '#8a8a8e' }}>{unit}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '34px 0 28px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: '#fff', color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 10, padding: '11px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAdd}
            style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 46px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

type ProductGroup = {
  key: string;
  category: string;
  name: string;
  area: number;
  price: number;
  thumb: string;
  isBase: boolean;
};

/** Place a library picker anchored to its ••• trigger so it grows to fit its
 *  content but never past the available area: it opens on whichever side
 *  (below / above) has more room inside the nearest scroll container, and its
 *  maxHeight is capped to that room. Everything is converted back to design px
 *  (the whole iPad is CSS-scaled) via the button's rendered/layout width ratio. */
function pickerPlacement(btnEl: HTMLElement | null): React.CSSProperties {
  if (typeof window === 'undefined' || !btnEl) return { top: 28, right: 0, maxHeight: 520 };
  const rect = btnEl.getBoundingClientRect();
  const scale = btnEl.offsetWidth ? rect.width / btnEl.offsetWidth : 1;
  // Bound by the nearest scrollable ancestor (modal body / summary body),
  // falling back to the viewport.
  let top = 0;
  let bottom = window.innerHeight;
  for (let p = btnEl.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) {
      const r = p.getBoundingClientRect();
      top = Math.max(top, r.top);
      bottom = Math.min(bottom, r.bottom);
      break;
    }
  }
  const margin = 12;
  const below = (bottom - rect.bottom - margin) / scale;
  const above = (rect.top - top - margin) / scale;
  const openBelow = below >= above;
  const maxHeight = Math.max(200, Math.min(560, (openBelow ? below : above) - 6));
  return openBelow ? { top: 28, right: 0, maxHeight } : { bottom: 28, right: 0, maxHeight };
}

/** Place a fixed-height action menu so the WHOLE menu always stays inside the
 *  visible bounds of its clipping container (so it is never cut off and never
 *  needs to scroll): prefer just below the ••• button, flip above when there
 *  isn't room, then clamp within [containerTop, containerBottom]. Returns a
 *  `top` offset in design px relative to the button. */
function menuPlacement(btnEl: HTMLElement | null, menuHeight: number): React.CSSProperties {
  if (typeof window === 'undefined' || !btnEl) return { top: 28, right: 0 };
  const rect = btnEl.getBoundingClientRect();
  const scale = (btnEl.offsetWidth ? rect.width / btnEl.offsetWidth : 1) || 1;
  // Visible bounds of the nearest clipping ancestor (modal/summary body),
  // falling back to the whole viewport. Everything below is in viewport px.
  let top = 0;
  let bottom = window.innerHeight;
  for (let p = btnEl.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY)) {
      const r = p.getBoundingClientRect();
      top = Math.max(top, r.top);
      bottom = Math.min(bottom, r.bottom);
      break;
    }
  }
  const margin = 12;
  const menuH = menuHeight * scale;
  const gap = 6 * scale;
  const below = rect.bottom + gap;
  // Prefer below the button; flip above if the menu wouldn't fit below.
  let topVp = below + menuH <= bottom - margin ? below : rect.top - gap - menuH;
  // Clamp so the whole menu stays within the container.
  topVp = Math.min(Math.max(topVp, top + margin), bottom - margin - menuH);
  return { top: (topVp - rect.top) / scale, right: 0 };
}

/** A single nested upgrade-option row with its own More-Action menu.
 *  Shared by the Product Setup modal and the Report Summary so both surfaces
 *  behave identically: View Product Detail / Swap Upgrade Option (opens the
 *  library picker) / Remove Upgrade Option. `disableIds` are the library ids
 *  not pickable in the swap picker (the basic product + all current upgrades);
 *  `baseId` / `currentId` only drive the picker tags. */
function UpgradeActionRow({
  u,
  baseId,
  disableIds,
  library,
  onSwap,
  onRemove,
}: {
  u: { id: string; name: string; area: number; delta: number; thumb: string; measureText?: string };
  baseId: string | null;
  disableIds: string[];
  library?: { category: string; items: LibraryItem[] }[];
  onSwap: (newId: string) => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [place, setPlace] = useState<React.CSSProperties>({ top: 28, right: 0, maxHeight: 520 });
  const [menuPlace, setMenuPlace] = useState<React.CSSProperties>({ top: 28, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setMenuOpen(false);
    setSwapOpen(false);
  };
  const ACTIONS = ['View Product Detail', 'Swap Upgrade Option', 'Remove Upgrade Option'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 10 }}>
      {u.thumb === 'none' ? (
        <ProductSwatch thumb="none" />
      ) : (
        <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: 6, border: '1px solid #e0cdda', background: u.thumb }} />
      )}
      <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {u.name}
      </span>
      <span style={{ fontSize: 16, color: '#6b6b70', minWidth: 110, textAlign: 'right' }}>{u.measureText ?? fmtSqFt(u.area)}</span>
      <span style={{ fontSize: 17, fontWeight: 600, color: '#1c1c1e', minWidth: 120, textAlign: 'right' }}>
        {u.delta < 0 ? '− ' : '+ '}
        {fmtUsd(Math.abs(u.delta))}
      </span>
      <div style={{ position: 'relative', flex: '0 0 auto' }}>
        <button
          ref={btnRef}
          type="button"
          onClick={() => {
            setSwapOpen(false);
            if (!menuOpen) setMenuPlace(menuPlacement(btnRef.current, ACTIONS.length * 54));
            setMenuOpen((o) => !o);
          }}
          style={{ background: 'transparent', border: 'none', color: BLUE, fontSize: 22, letterSpacing: '2px', cursor: 'pointer', padding: '0 4px' }}
        >
          •••
        </button>

        {menuOpen && (
          <>
            <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
            {!swapOpen && (
              <div
                style={{
                  position: 'absolute',
                  width: 300,
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                  border: '1px solid #ececec',
                  overflow: 'hidden',
                  zIndex: 30,
                  ...menuPlace,
                }}
              >
                {ACTIONS.map((action, idx) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      if (action === 'Swap Upgrade Option') {
                        setPlace(pickerPlacement(btnRef.current));
                        setSwapOpen(true);
                      } else if (action === 'Remove Upgrade Option') {
                        onRemove();
                        close();
                      } else setMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0',
                      padding: '16px 22px',
                      fontSize: 17,
                      color: action === 'Remove Upgrade Option' ? '#e0352b' : '#1c1c1e',
                      cursor: 'pointer',
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {swapOpen && (
              <ProductPickerPopover
                title="Swap Upgrade Option"
                library={library}
                isDisabled={(id) => disableIds.includes(id)}
                tagFor={(id) =>
                  id === baseId
                    ? '(Basic Product)'
                    : id === u.id
                      ? '(Current)'
                      : disableIds.includes(id)
                        ? '(Selected)'
                        : ''
                }
                onPick={(newId) => {
                  onSwap(newId);
                  close();
                }}
                placement={place}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** The product line-item More-Action menu (the same PRODUCT_ROW_ACTIONS shown in
 *  the Product Setup modal), so the Report Summary line items behave identically.
 *  `canUpgrade` gates whether "Add Upgrade Option" opens the library picker (only
 *  the base flooring product owns upgrades, matching the modal). */
function ProductActionMenu({
  isAddon,
  hasUpgrade,
  canUpgrade,
  baseId,
  upgradeDisableIds,
  upgradeLibrary,
  onAddUpgrade,
  onToggleAddon,
  onRemove,
}: {
  isAddon: boolean;
  hasUpgrade: boolean;
  canUpgrade: boolean;
  baseId: string;
  upgradeDisableIds: string[];
  upgradeLibrary?: { category: string; items: LibraryItem[] }[];
  onAddUpgrade: (libId: string) => void;
  onToggleAddon: () => void;
  onRemove: () => void;
}) {
  const rowActions = rowActionsFor(hasUpgrade, isAddon);
  const [open, setOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [place, setPlace] = useState<React.CSSProperties>({ top: 28, right: 0, maxHeight: 520 });
  const [menuPlace, setMenuPlace] = useState<React.CSSProperties>({ top: 28, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    setUpgradeOpen(false);
  };
  return (
    <div style={{ position: 'relative', flex: '0 0 auto' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setUpgradeOpen(false);
          if (!open) setMenuPlace(menuPlacement(btnRef.current, rowActions.length * 54));
          setOpen((o) => !o);
        }}
        style={{ background: 'transparent', border: 'none', color: BLUE, fontSize: 22, letterSpacing: '2px', cursor: 'pointer', padding: '0 4px' }}
      >
        •••
      </button>

      {open && (
        <>
          <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
          {!upgradeOpen && (
            <div
              style={{
                position: 'absolute',
                width: 320,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                border: '1px solid #ececec',
                overflow: 'hidden',
                zIndex: 30,
                ...menuPlace,
              }}
            >
              {rowActions.map((action, idx) => {
                const isUpgradeAction = action === 'Add Upgrade Option';
                const isAddonAction = action === 'Set as Add-on';
                const isRemoveAction = action === 'Remove Product';
                const label = isAddonAction
                  ? isAddon
                    ? 'Move to Included Product'
                    : 'Set as Add-on'
                  : action;
                const active = isUpgradeAction && upgradeOpen;
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      if (isUpgradeAction && canUpgrade) {
                        setPlace(pickerPlacement(btnRef.current));
                        setUpgradeOpen(true);
                      } else if (isAddonAction) {
                        onToggleAddon();
                        close();
                      } else if (isRemoveAction) {
                        onRemove();
                        close();
                      } else setOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: active ? '#f2f7ff' : 'transparent',
                      border: 'none',
                      borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0',
                      padding: '16px 22px',
                      fontSize: 17,
                      color: isRemoveAction ? '#e0352b' : '#1c1c1e',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {upgradeOpen && (
            <ProductPickerPopover
              title="Add Upgrade Option"
              library={upgradeLibrary}
              isDisabled={(id) => upgradeDisableIds.includes(id)}
              tagFor={(id) =>
                id === baseId ? '(Basic Product)' : upgradeDisableIds.includes(id) ? '(Upgrade Option)' : ''
              }
              onPick={(libId) => {
                onAddUpgrade(libId);
                close();
              }}
              placement={place}
            />
          )}
        </>
      )}
    </div>
  );
}

function ProductItemModal({
  inst,
  upgradeIds,
  addedIds,
  addonIds,
  baseRemoved,
  onAddUpgrade,
  onSwapUpgrade,
  onRemoveUpgrade,
  onAddProduct,
  onToggleAddon,
  onRemove,
  onClose,
}: {
  inst: FloorInstance;
  upgradeIds: string[];
  addedIds: string[];
  addonIds: string[];
  baseRemoved: boolean;
  onAddUpgrade: (libId: string) => void;
  onSwapUpgrade: (oldId: string, newId: string) => void;
  onRemoveUpgrade: (libId: string) => void;
  onAddProduct: (libId: string) => void;
  onToggleAddon: (libId: string) => void;
  onRemove: (libId: string, isBase: boolean) => void;
  onClose: () => void;
}) {
  const MENU_H = 384; // design height of the row action menu
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const [menuTop, setMenuTop] = useState(6); // menu top offset (design px) relative to the ••• button
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradePlace, setUpgradePlace] = useState<React.CSSProperties>({ top: -104, right: 0 });
  const [addProductOpen, setAddProductOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const closeMenus = () => {
    setMenuKey(null);
    setUpgradeOpen(false);
  };

  // Open the row action menu, positioning it so the whole menu stays inside the
  // modal card (prefer below the button; flip up / clamp when there isn't room).
  const openRowMenu = (key: string, btnEl: HTMLElement) => {
    if (menuKey === key) {
      setMenuKey(null);
      return;
    }
    const btn = btnEl.getBoundingClientRect();
    const card = cardRef.current?.getBoundingClientRect();
    const body = bodyRef.current?.getBoundingClientRect();
    if (card && body) {
      const s = card.height / 688; // viewport px per design px
      const m = 10 * s;
      // Action menu: clamp inside the scrollable body so it is never clipped.
      const menuH = MENU_H * s;
      const below = btn.bottom + 6 * s;
      let topVp = below + menuH <= body.bottom - m ? below : btn.top - 6 * s - menuH;
      topVp = Math.min(Math.max(topVp, body.top + m), body.bottom - m - menuH);
      setMenuTop((topVp - btn.top) / s); // back to design px, relative to the button
      // Upgrade picker: pin to the top of the body and cap its height to the
      // body (its list scrolls internally), so it stays fully visible.
      setUpgradePlace({
        top: (body.top + m - btn.top) / s,
        right: 0,
        maxHeight: (body.height - 2 * m) / s,
      });
    } else {
      setMenuTop(6);
      setUpgradePlace({ top: -104, right: 0 });
    }
    setUpgradeOpen(false);
    setMenuKey(key);
  };

  const ratio = inst.area / REF_BASE_AREA;

  // The flooring product that owns the upgrades (the base, or the first flooring
  // re-added after the base was removed). Only this row offers Add Upgrade Option.
  const primaryFlooringKey = baseRemoved
    ? addedIds.map((id) => findLibraryEntry(id)).find((e) => e?.category === 'Flooring')?.item.id ?? null
    : inst.baseId;
  const primaryRefPrice = primaryFlooringKey ? findLibraryItem(primaryFlooringKey)?.refPrice ?? 0 : 0;

  // Upgrade options picked for this instance (nested under the primary flooring).
  // The delta is relative to the current primary product, so switching to a
  // cheaper option yields a negative (shown with a minus sign).
  const upgradeRows = upgradeIds
    .map((id) => findLibraryItem(id))
    .filter((it): it is LibraryItem => !!it)
    .map((it) => ({
      id: it.id,
      name: it.name,
      area: (it.refArea ?? REF_BASE_AREA) * ratio,
      delta: ((it.refPrice ?? 0) - primaryRefPrice) * ratio,
      thumb: it.color ?? thumbBackground(it.name),
    }));

  // First-level products: the base product + standalone added products.
  const baseGroup: ProductGroup = {
    key: inst.baseId,
    category: 'Flooring',
    name: inst.product,
    area: inst.area,
    price: inst.price,
    thumb: thumbBackground(inst.product),
    isBase: true,
  };
  const groups: ProductGroup[] = [
    ...(baseRemoved ? [] : [baseGroup]),
    ...addedIds
      .map((id) => findLibraryEntry(id))
      .filter((e): e is { item: LibraryItem; category: string } => !!e)
      .map((e) => ({
        key: e.item.id,
        category: e.category,
        name: e.item.name,
        area: (e.item.refArea ?? REF_BASE_AREA) * ratio,
        price: (e.item.refPrice ?? 0) * ratio,
        thumb: e.item.color ?? thumbBackground(e.item.name),
        isBase: false,
      })),
  ];
  const includedGroups = groups.filter((g) => !addonIds.includes(g.key));
  const addonGroups = groups.filter((g) => addonIds.includes(g.key));
  const isEmpty = groups.length === 0; // base removed and nothing added

  const byCategory = (gs: ProductGroup[]): [string, ProductGroup[]][] => {
    const m = new Map<string, ProductGroup[]>();
    gs.forEach((g) => {
      const arr = m.get(g.category) ?? [];
      arr.push(g);
      m.set(g.category, arr);
    });
    return [...m.entries()];
  };

  // ---- shared renderers ----------------------------------------------------
  const sectionBand = (label: string, count: number, marginTop = 0) => (
    <div
      style={{
        background: '#d9d9dc',
        borderRadius: 8,
        padding: '12px 18px',
        marginTop,
        fontSize: 16,
        fontWeight: 600,
        color: '#3a3a3c',
      }}
    >
      {label} ({count})
    </div>
  );

  // Upgrade block — nested inside the same card as its base product, matching
  // the Report Summary's merged-card form (label column + connector + bare rows).
  const renderUpgrades = () => (
    <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 12 }}>
      <div
        style={{
          width: 96,
          flex: '0 0 auto',
          paddingTop: 15,
          paddingRight: 18,
          textAlign: 'right',
          fontSize: 14,
          color: '#8a8a8e',
        }}
      >
        Upgrades
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: 'relative',
          paddingLeft: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#e1e1e4' }} />
        {upgradeRows.map((u) => (
          <UpgradeActionRow
            key={u.id}
            u={u}
            baseId={primaryFlooringKey}
            disableIds={[primaryFlooringKey, ...upgradeIds].filter((id): id is string => !!id)}
            onSwap={(newId) => onSwapUpgrade(u.id, newId)}
            onRemove={() => onRemoveUpgrade(u.id)}
          />
        ))}
      </div>
    </div>
  );

  // The base product row, without its own card chrome (so it can sit inside a
  // standalone card or a merged base+upgrades card).
  const renderRowInner = (g: ProductGroup) => {
    const isAddon = addonIds.includes(g.key);
    const ownsUpgrades = g.key === primaryFlooringKey;
    const hasUpgrade = ownsUpgrades && upgradeIds.length > 0;
    const rowActions = rowActionsFor(hasUpgrade, isAddon);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: 6, border: '1px solid #e0cdda', background: g.thumb }} />
        <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: 17, fontWeight: 600, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {g.name}
        </span>
        <span style={{ fontSize: 16, color: '#6b6b70', minWidth: 110, textAlign: 'right' }}>{fmtSqFt(g.area)}</span>
        <span style={{ fontSize: 17, fontWeight: 600, color: '#1c1c1e', minWidth: 120, textAlign: 'right' }}>{fmtUsd(g.price)}</span>
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <button
            type="button"
            onClick={(e) => openRowMenu(g.key, e.currentTarget)}
            style={{ background: 'transparent', border: 'none', color: BLUE, fontSize: 22, letterSpacing: '2px', cursor: 'pointer', padding: '0 4px' }}
          >
            •••
          </button>

          {menuKey === g.key && (
            <>
              <div onClick={closeMenus} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
              {!(upgradeOpen && ownsUpgrades) && (
                <div
                  style={{
                    position: 'absolute',
                    top: menuTop,
                    right: 0,
                    width: 320,
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                    border: '1px solid #ececec',
                    overflow: 'hidden',
                    zIndex: 30,
                  }}
                >
                  {rowActions.map((action, idx) => {
                    const isUpgradeAction = action === 'Add Upgrade Option';
                    const isAddonAction = action === 'Set as Add-on';
                    const isRemoveAction = action === 'Remove Product';
                    const label = isAddonAction
                      ? isAddon
                        ? 'Move to Included Product'
                        : 'Set as Add-on'
                      : action;
                    const active = isUpgradeAction && upgradeOpen;
                    return (
                      <button
                        key={action}
                        type="button"
                        onClick={() => {
                          if (isUpgradeAction && ownsUpgrades) setUpgradeOpen(true);
                          else if (isAddonAction) {
                            onToggleAddon(g.key);
                            closeMenus();
                          } else if (isRemoveAction) {
                            onRemove(g.key, g.isBase);
                            closeMenus();
                          } else setMenuKey(null);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          background: active ? '#f2f7ff' : 'transparent',
                          border: 'none',
                          borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0',
                          padding: '16px 22px',
                          fontSize: 17,
                          color: '#1c1c1e',
                          cursor: 'pointer',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {ownsUpgrades && upgradeOpen && (
                <ProductPickerPopover
                  title="Add Upgrade Option"
                  isDisabled={(id) => id === primaryFlooringKey || upgradeIds.includes(id)}
                  tagFor={(id) =>
                    id === primaryFlooringKey
                      ? '(Basic Product)'
                      : upgradeIds.includes(id)
                        ? `(Upgrade Option ${upgradeIds.indexOf(id) + 1})`
                        : ''
                  }
                  onPick={(libId) => {
                    onAddUpgrade(libId);
                    closeMenus();
                  }}
                  placement={upgradePlace}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // A standalone product card (no upgrades).
  const renderRow = (g: ProductGroup, marginBottom: number) => (
    <div style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', marginBottom }}>
      {renderRowInner(g)}
    </div>
  );

  const renderGroups = (gs: ProductGroup[]) =>
    byCategory(gs).map(([category, catGroups]) => (
      <div key={category}>
        <div style={{ fontSize: 13, color: '#8a8a8e', margin: '18px 4px 8px' }}>{category}</div>
        {catGroups.map((g) => {
          const ownsUpgrades = g.key === primaryFlooringKey && upgradeRows.length > 0;
          // Base option + its upgrade(s) share one card, matching the Summary.
          return ownsUpgrades ? (
            <div key={g.key} style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', marginBottom: 10 }}>
              {renderRowInner(g)}
              {renderUpgrades()}
            </div>
          ) : (
            <Fragment key={g.key}>{renderRow(g, 10)}</Fragment>
          );
        })}
      </div>
    ));

  return (
    <>
      {/* dim scrim over the canvas (toolbar stays visible above CanvasArea) */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,22,26,0.18)', zIndex: 20 }}
      />

      {/* modal card */}
      <div
        ref={cardRef}
        style={{
          position: 'absolute',
          top: 18,
          left: 150,
          right: 150,
          bottom: 46,
          background: '#f0f0f1',
          borderRadius: 16,
          boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 21,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
        }}
      >
        {/* header */}
        <div
          style={{
            position: 'relative',
            height: 60,
            flex: '0 0 auto',
            background: '#fff',
            borderBottom: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 600, color: '#1c1c1e' }}>
            Product Item List (1 Selected)
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: BLUE,
              fontSize: 17,
              fontWeight: 400,
              cursor: 'pointer',
            }}
          >
            Save &amp; Close
          </button>
        </div>

        {/* body — scrolls internally when content is long; the floating row
            popovers are clamped to this region so they stay fully visible */}
        <div ref={bodyRef} style={{ flex: '1 1 auto', overflowY: 'auto', padding: '18px 22px' }}>
          {sectionBand('Included Product', includedGroups.length)}
          {renderGroups(includedGroups)}
          {addonGroups.length > 0 && (
            <>
              {sectionBand('Optional Add-ons', addonGroups.length, 52)}
              {renderGroups(addonGroups)}
            </>
          )}
        </div>

        {/* footer */}
        <div
          style={{
            flex: '0 0 auto',
            height: 60,
            background: '#fff',
            borderTop: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setAddProductOpen((o) => !o)}
              style={{
                background: '#fff',
                color: BLUE,
                border: `1.5px solid ${BLUE}`,
                borderRadius: 10,
                padding: '8px 20px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Product
            </button>

            {addProductOpen && (
              <>
                <div
                  onClick={() => setAddProductOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 29 }}
                />
                <ProductPickerPopover
                  title="Add Product"
                  // Design intent: all products available (nothing restricted).
                  // Prototype: Soundproofing always adds; Flooring adds only when
                  // the instance is empty (so the user can re-pick its flooring).
                  isDisabled={() => false}
                  tagFor={() => ''}
                  onPick={(libId) => {
                    const cat = findLibraryEntry(libId)?.category;
                    if (cat === SOUNDPROOFING_CATEGORY || (isEmpty && cat === 'Flooring')) {
                      onAddProduct(libId);
                      setAddProductOpen(false);
                    }
                  }}
                  placement={{ bottom: 'calc(100% + 10px)', right: 0 }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* Legend                                                              */
/* ================================================================== */
function Legend() {
  const rows = [
    { kind: 'stagger', label: 'Oakwood Flooring | w 5" | Staggered' },
    { kind: 'herring', label: 'Oakwood Flooring | w 5" | Herringbone' },
    { kind: 'solid', label: 'Walnut Flooring | w 7" | Straight' },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        right: TOOLRAIL + 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LegendSwatch kind={r.kind} />
          <span style={{ fontSize: 13, color: '#3a3a3a' }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Legend swatch — same hatch styles/colors as the canvas fills so they correspond. */
function LegendSwatch({ kind }: { kind: string }) {
  const frame: React.CSSProperties = {
    width: 34,
    height: 22,
    borderRadius: 3,
    border: '1px solid #d9c3d2',
    display: 'block',
    flex: '0 0 auto',
  };
  if (kind === 'solid') {
    return <div style={{ ...frame, background: WALNUT_ORANGE }} />;
  }
  if (kind === 'stagger') {
    return <div style={{ ...frame, background: STAGGERED_FILL }} />;
  }
  return (
    <svg style={frame} viewBox="0 0 34 22" preserveAspectRatio="none">
      <rect width="34" height="22" fill="#fdeef6" />
      <g stroke="#dd9ec8" strokeWidth="1">
        {/* diagonal crosshatch (herringbone) */}
        {[-20, -8, 4, 16, 28, 40].map((o) => (
          <line key={`a${o}`} x1={o} y1="22" x2={o + 22} y2="0" />
        ))}
        {[-6, 6, 18, 30, 42].map((o) => (
          <line key={`b${o}`} x1={o} y1="0" x2={o + 22} y2="22" />
        ))}
      </g>
    </svg>
  );
}

/* ================================================================== */
/* Right tool rail                                                     */
/* ================================================================== */
function ToolRail() {
  const tools: { label: string; icon: React.ReactNode }[] = [
    { label: 'Products', icon: <><path d="M4 5h9l5 5-8 8-6-6z" /><circle cx="8" cy="9" r="1.3" /></> },
    { label: 'Multi-Select', icon: <><rect x="3.5" y="3.5" width="15" height="15" rx="1.5" strokeDasharray="3 2.5" /></> },
    { label: 'Draw', icon: <><path d="M4 17l1-3 9-9 2 2-9 9-3 1z" /><path d="M13 6l3 3" /></> },
    { label: 'Wall', icon: <><rect x="3" y="6" width="6" height="4" /><rect x="11" y="6" width="7" height="4" /><rect x="3" y="11" width="9" height="4" /><rect x="14" y="11" width="4" height="4" /></> },
    { label: 'Openings', icon: <><path d="M5 4v14M5 4h9v14H5" /><path d="M14 12a8 8 0 00-8-8" /></> },
    { label: 'Shapes', icon: <><circle cx="7.5" cy="8" r="3.5" /><rect x="11" y="10" width="7" height="7" /></> },
    { label: 'Fill', icon: <><path d="M9 3l7 7-6 6-7-7z" /><path d="M16 13c1.5 2 2 3 0 4" /></> },
    { label: 'Fence', icon: <><path d="M5 9l2-3 2 3v9H5zM13 9l2-3 2 3v9h-4z" /><path d="M3 12h16M3 15h16" /></> },
    { label: 'Measure', icon: <><rect x="2" y="7" width="18" height="8" rx="1" /><path d="M6 7v3M10 7v4M14 7v3" /></> },
    { label: 'Annotate', icon: <><rect x="4" y="4" width="14" height="14" rx="1.5" /><path d="M8 8h6M11 8v7" /></> },
    { label: 'Photo', icon: <><rect x="3" y="6" width="16" height="12" rx="1.5" /><circle cx="11" cy="12" r="3" /><path d="M8 6l1.5-2h3L14 6" /></> },
    { label: 'Edit', icon: <><circle cx="7" cy="6" r="2" /><circle cx="7" cy="16" r="2" /><path d="M9 6h8M9 16h8M17 6v10" /></> },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: TOOLRAIL,
        background: '#fbfbfb',
        borderLeft: '1px solid #ececec',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {tools.map((t) => (
        <div
          key={t.label}
          style={{
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            borderBottom: '1px solid #f1f1f1',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="#6a6a6f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            {t.icon}
          </svg>
          <span style={{ fontSize: 10.5, color: '#7c7c7c', fontFamily: 'Inter, system-ui, sans-serif' }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/* Floor plan (CAD drawing) — hand-built SVG.                          */
/* No vector source exists (raster screenshot, no Figma node); the     */
/* plan IS the deliverable, so it is reconstructed here. Geometry lives */
/* in one <g> (canvas space) ready for a future pan/zoom transform.     */
/* ================================================================== */
function FloorPlanSvg({
  selected,
  onSelect,
  viewBox = '0 0 1120 760',
  productOverrides,
  highlightIds,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** Override the viewBox to crop the plan (e.g. trim the empty top band
   *  when it is shown read-only in the homeowner proposal). */
  viewBox?: string;
  /** Per-instance product-name override (instanceId → product name) so a
   *  region's fill follows the homeowner's live upgrade selection instead of
   *  the base product. Falls back to the instance's own product. */
  productOverrides?: Record<string, string>;
  /** Instances to wash with the hover highlight (e.g. the geometry an
   *  add-on card in the homeowner configurator is hovering over). */
  highlightIds?: string[];
}) {
  const W = 13; // exterior wall stroke (canvas units)
  const Wi = 7; // interior wall stroke
  const black = '#0d0d0d';
  const selInst = FLOOR_INSTANCES.find((i) => i.id === selected) ?? null;

  return (
    <svg
      viewBox={viewBox}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid meet"
      onClick={() => onSelect(null)}
    >
      <defs>
        {/* Herringbone — diagonal crosshatch, matches the
            "Oakwood | Herringbone" legend swatch. */}
        <pattern id="hatchHerringbone" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="11" height="11" fill="#fdeef6" />
          <line x1="0" y1="0" x2="0" y2="11" stroke="#dd9ec8" strokeWidth="1" />
          <line x1="0" y1="0" x2="11" y2="0" stroke="#dd9ec8" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Plan geometry in one canvas-space group: scaled down + recentred
          (biased left/down) so the top-right legend has clear space.
          A future pan/zoom transform would compose on top of this. */}
      <g transform="translate(45 56) scale(0.82)">

      {/* ---- flooring fills (pattern matches each product's legend style) ---- */}
      {FLOOR_INSTANCES.map((i) => (
        <rect key={i.id} x={i.x} y={i.y} width={i.w} height={i.h} fill={fillForProduct(productOverrides?.[i.id] ?? i.product)} />
      ))}

      {/* ============ WALLS ============ */}
      <g stroke={black} strokeLinecap="square" fill="none">
        {/* exterior envelope (approximate outline of the house) */}
        <path
          strokeWidth={W}
          d="
            M120 262
            H300
            V150 H560 V262
            H700
            V210 H1010 V470
            H1080 V720
            H760 V708
            H600 V760
            H120 V548
            H120 Z
          "
        />

        {/* interior partitions */}
        <g strokeWidth={Wi}>
          {/* left bedrooms / bath stack */}
          <line x1="120" y1="430" x2="310" y2="430" />
          <line x1="310" y1="262" x2="310" y2="708" />
          {/* bath2 split */}
          <line x1="120" y1="500" x2="240" y2="500" />
          <line x1="240" y1="430" x2="240" y2="548" />

          {/* central: kitchen/nook top vs great room */}
          <line x1="310" y1="430" x2="610" y2="430" />
          {/* kitchen | nook divider */}
          <line x1="455" y1="262" x2="455" y2="430" />
          <line x1="610" y1="262" x2="610" y2="262" />

          {/* central right wall */}
          <line x1="610" y1="262" x2="610" y2="600" />

          {/* master suite block */}
          <line x1="700" y1="262" x2="700" y2="448" />
          <line x1="700" y1="448" x2="932" y2="448" />
          <line x1="932" y1="262" x2="932" y2="470" />

          {/* mstr bath right portion */}
          <line x1="932" y1="360" x2="1010" y2="360" />

          {/* laundry / wic */}
          <line x1="610" y1="520" x2="780" y2="520" />
          <line x1="780" y1="448" x2="780" y2="600" />
          <line x1="610" y1="600" x2="780" y2="600" />
          <line x1="780" y1="540" x2="1080" y2="540" />
          <line x1="700" y1="448" x2="700" y2="520" />
        </g>
      </g>

      {/* ============ WINDOWS (white gap + thin double line) ============ */}
      <g>
        {/* erase wall behind each window */}
        <g stroke="#fff">
          {/* left exterior — two bedrooms */}
          <line x1="120" y1="320" x2="120" y2="372" strokeWidth={W + 2} />
          <line x1="120" y1="600" x2="120" y2="652" strokeWidth={W + 2} />
          {/* covered porch top opening */}
          <line x1="360" y1="150" x2="500" y2="150" strokeWidth={W + 2} />
        </g>
        <g stroke="#3a3a3a" strokeWidth="1">
          <line x1="115" y1="320" x2="115" y2="372" /><line x1="125" y1="320" x2="125" y2="372" />
          <line x1="115" y1="600" x2="115" y2="652" /><line x1="125" y1="600" x2="125" y2="652" />
        </g>
      </g>

      {/* dashed footprint of the bottom covered porch + garage overhang */}
      <g stroke="#c9c9c9" strokeWidth="1" strokeDasharray="5 4" fill="none">
        <rect x="120" y="710" width="480" height="40" />
        <rect x="1010" y="470" width="80" height="250" />
      </g>

      {/* ============ DOOR OPENINGS ============ */}
      {/* Doors are shown only as wall breaks (no swing arcs): paint the room
          background over the wall segment where a doorway sits. */}
      <g stroke="#fff" strokeLinecap="butt">
        {/* bedroom 3 -> hall (x=310 wall) */}
        <line x1="310" y1="370" x2="310" y2="414" strokeWidth={Wi + 4} />
        {/* lower-left rooms -> hall (x=310 wall) */}
        <line x1="310" y1="598" x2="310" y2="642" strokeWidth={Wi + 4} />
        {/* bath 2 (x=240 wall) */}
        <line x1="240" y1="458" x2="240" y2="500" strokeWidth={Wi + 4} />
        {/* kitchen -> great room (y=430 wall) */}
        <line x1="354" y1="430" x2="398" y2="430" strokeWidth={Wi + 4} />
        {/* nook -> great room (y=430 wall) */}
        <line x1="496" y1="430" x2="540" y2="430" strokeWidth={Wi + 4} />
        {/* master suite (x=700 wall) */}
        <line x1="700" y1="334" x2="700" y2="380" strokeWidth={Wi + 4} />
        {/* great room -> laundry/hall (x=610 wall) */}
        <line x1="610" y1="468" x2="610" y2="512" strokeWidth={Wi + 4} />
        {/* mstr bath (x=932 wall) */}
        <line x1="932" y1="298" x2="932" y2="342" strokeWidth={Wi + 4} />
      </g>

      {/* ============ FIXTURES (schematic) ============ */}
      <g stroke="#8a8a8a" strokeWidth="1.2" fill="none">
        {/* kitchen counters along top + left */}
        <rect x="315" y="266" width="135" height="18" />
        <rect x="315" y="266" width="18" height="120" />
        <circle cx="330" cy="300" r="5" />
        <circle cx="330" cy="318" r="5" />
        {/* sink */}
        <rect x="360" y="269" width="34" height="12" />
        {/* master bath fixtures */}
        <rect x="940" y="268" width="26" height="26" />
        <rect x="970" y="268" width="26" height="26" />
        <path d="M940 268l26 26M966 268l-26 26M970 268l26 26M996 268l-26 26" />
        <rect x="940" y="300" width="60" height="34" rx="6" />
        <ellipse cx="950" cy="380" rx="9" ry="12" />
        {/* laundry appliances */}
        <rect x="618" y="528" width="30" height="30" />
        <rect x="650" y="528" width="30" height="30" />
        <circle cx="633" cy="543" r="9" />
        <circle cx="665" cy="543" r="9" />
      </g>

      {/* black porch posts (bottom covered porch) */}
      <g fill={black}>
        <rect x="120" y="700" width="22" height="22" />
        <rect x="290" y="700" width="22" height="22" />
        <rect x="450" y="700" width="22" height="22" />
        <rect x="578" y="700" width="22" height="22" />
      </g>

      {/* ============ ROOM LABELS ============ */}
      <g fontFamily="Inter, system-ui, sans-serif" textAnchor="middle">
        <RoomLabel x={215} y={320} name="BEDROOM 3" dim={'12\'-0" X 10\'-7"'} area="130.2 sq ft" />
        <RoomLabel x={215} y={606} name="BEDROOM 2" dim={'12\'-0" X 10\'-7"'} area="122.3 sq ft" />
        <RoomLabel x={816} y={306} name="MASTER SUITE" dim={'13\'-10" X 12\'-2"'} area="162.9 sq ft" />

        <SmallLabel x={385} y={356} name="KITCHEN" dim={'11\'-0" X 14\'-5"'} />
        <SmallLabel x={540} y={356} name="NOOK" dim={'9\'-5" X 14\'-5"'} />
        <SmallLabel x={430} y={150} name="COVERED PORCH" dim={'20\'-4" X 4\'-4"'} />
        <SmallLabel x={170} y={476} name="BATH 2" dim={'8\'-7" X 5\'-0"'} />
        <SmallLabel x={455} y={585} name="GREAT ROOM" dim={'18\'-0" X 14\'-4"'} />
        <SmallLabel x={695} y={566} name="LAUNDRY" dim={'9\'-1" X 6\'-1"'} />
        <SmallLabel x={930} y={500} name="W.I.C" dim={'13\'-9" X 6\'-1"'} />
        <SmallLabel x={975} y={300} name="MSTR. BT" dim={'9\'-0" X 12\'-1"'} />
        <SmallLabel x={930} y={650} name="2-CAR GARAGE" dim={'25\'-5" X 19\'-3"'} />
        <SmallLabel x={360} y={732} name="COVERED PORCH" dim={'37\'-6" X 5\'-5"'} />
      </g>

      {/* ============ HOVER HIGHLIGHT (linked from the configurator) ============ */}
      {(highlightIds ?? []).map((id) => {
        const inst = FLOOR_INSTANCES.find((i) => i.id === id);
        if (!inst) return null;
        return (
          <g key={id} pointerEvents="none">
            <rect x={inst.x} y={inst.y} width={inst.w} height={inst.h} rx={6} fill="#4aa3ff" fillOpacity={0.12} />
            <rect x={inst.x} y={inst.y} width={inst.w} height={inst.h} rx={6} fill="none" stroke="#4aa3ff" strokeWidth={2.4} />
          </g>
        );
      })}

      {/* ============ SELECTION HIGHLIGHT ============ */}
      {selInst && <SelectionOverlay inst={selInst} />}

      {/* ============ CLICK TARGETS (transparent, on top) ============ */}
      <g>
        {FLOOR_INSTANCES.map((i) => (
          <rect
            key={i.id}
            x={i.x}
            y={i.y}
            width={i.w}
            height={i.h}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(i.id);
            }}
          />
        ))}
      </g>

      </g>
    </svg>
  );
}

/** Selection highlight: blue solid + orange dashed outline, move handle,
 *  and a duplicate handle below — matching the app's selected-instance state. */
function SelectionOverlay({ inst }: { inst: FloorInstance }) {
  const { x, y, w, h } = inst;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const orange = '#e8632a';
  const blue = '#4aa3ff';
  return (
    <g pointerEvents="none">
      {/* light blue wash */}
      <rect x={x} y={y} width={w} height={h} rx={6} fill={blue} fillOpacity={0.1} />
      {/* blue solid border */}
      <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={blue} strokeWidth={2} />
      {/* orange dashed border */}
      <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={orange} strokeWidth={2.4} strokeDasharray="9 6" />

      {/* center move handle */}
      <g stroke={orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1={cx - 13} y1={cy} x2={cx + 13} y2={cy} />
        <line x1={cx} y1={cy - 13} x2={cx} y2={cy + 13} />
        <path d={`M${cx - 13} ${cy} l5 -4 M${cx - 13} ${cy} l5 4`} />
        <path d={`M${cx + 13} ${cy} l-5 -4 M${cx + 13} ${cy} l-5 4`} />
        <path d={`M${cx} ${cy - 13} l-4 5 M${cx} ${cy - 13} l4 5`} />
        <path d={`M${cx} ${cy + 13} l-4 -5 M${cx} ${cy + 13} l4 -5`} />
      </g>
      {/* small square handle near the area label */}
      <rect x={cx - 5} y={cy + 24} width={10} height={10} fill="#fff" stroke={orange} strokeWidth={2} />

      {/* duplicate handle below the shape */}
      <g transform={`translate(${cx} ${y + h + 24})`}>
        <rect x={-13} y={-13} width={26} height={26} rx={6} fill="#fff" stroke={orange} strokeWidth={2} />
        <g stroke={orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M-3 -5h7a1 1 0 011 1v7" />
          <path d="M5 -4l-9 9" />
          <path d="M-5 0v4a1 1 0 001 1h4" />
        </g>
      </g>
    </g>
  );
}

function RoomLabel({ x, y, name, dim, area }: { x: number; y: number; name: string; dim: string; area: string }) {
  return (
    <>
      <text x={x} y={y} fontSize="13" fill="#9a9a9a" letterSpacing="0.04em">{name}</text>
      <text x={x} y={y + 14} fontSize="10.5" fill="#a8a8a8">{dim}</text>
      <text x={x} y={y + 56} fontSize="20" fill="#5a5a5a">{area}</text>
    </>
  );
}

function SmallLabel({ x, y, name, dim }: { x: number; y: number; name: string; dim: string }) {
  return (
    <>
      <text x={x} y={y} fontSize="12" fill="#9a9a9a" letterSpacing="0.03em">{name}</text>
      <text x={x} y={y + 13} fontSize="9.5" fill="#aaa">{dim}</text>
    </>
  );
}

/* ================================================================== */
/* Report Setup — iOS page sheet presented over the drawing.           */
/* Shows the Summary step: a drawing-wide roll-up of every product.    */
/* ================================================================== */
const APPLE_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif';

/** Product legend swatch. A `thumb` of 'none' means the item has no CAD legend
 *  (e.g. a one-time fee) and is drawn as an empty box with a diagonal slash. */
function ProductSwatch({ thumb, size = 48 }: { thumb: string; size?: number }) {
  if (thumb === 'none') {
    return (
      <svg width={size} height={size} style={{ flex: '0 0 auto' }} aria-label="No legend">
        <rect x={0.75} y={0.75} width={size - 1.5} height={size - 1.5} rx={6} fill="none" stroke="#cfcfd6" strokeWidth={1.5} />
        <line x1={size * 0.12} y1={size * 0.88} x2={size * 0.88} y2={size * 0.12} stroke="#cfcfd6" strokeWidth={1.5} />
      </svg>
    );
  }
  return <div style={{ width: size, height: size, flex: '0 0 auto', borderRadius: 6, border: '1px solid #e0cdda', background: thumb }} />;
}

function ReportSheet({
  categories,
  onAddUpgrade,
  onSwapUpgrade,
  onRemoveUpgrade,
  onToggleAddon,
  onRemoveProduct,
  onToggleFeeAddon,
  onRemoveFee,
  onAddFeeUpgrade,
  onSwapFeeUpgrade,
  onRemoveFeeUpgrade,
  onAddOtherItem,
  onClose,
}: {
  categories: SummaryCategory[];
  onAddUpgrade: (instanceIds: string[], libId: string) => void;
  onSwapUpgrade: (instanceIds: string[], oldId: string, newId: string) => void;
  onRemoveUpgrade: (instanceIds: string[], libId: string) => void;
  onToggleAddon: (instanceIds: string[], key: string, makeAddon: boolean) => void;
  onRemoveProduct: (instanceIds: string[], key: string, isBase: boolean) => void;
  onToggleFeeAddon: (feeId: string, makeAddon: boolean) => void;
  onRemoveFee: (feeId: string) => void;
  onAddFeeUpgrade: (feeId: string, libId: string) => void;
  onSwapFeeUpgrade: (feeId: string, oldId: string, newId: string) => void;
  onRemoveFeeUpgrade: (feeId: string, libId: string) => void;
  onAddOtherItem: (libId: string, qty: number) => void;
  onClose: () => void;
}) {
  // The Total is a range once optional items exist: from the minimum (no add-ons,
  // every upgradeable item on its base option) up to the maximum (all add-ons on,
  // each upgradeable item on its most expensive option). Collapses to a single
  // figure when nothing is optional (no add-ons, no price-raising upgrades).
  const allRows = categories.flatMap((c) => c.rows);
  const maxUpgradeExtra = (r: SummaryRow) => Math.max(0, ...r.upgrades.map((u) => u.delta));
  const minTotal = allRows.filter((r) => !r.isAddon).reduce((s, r) => s + r.price, 0);
  const maxTotal = allRows.reduce((s, r) => s + r.price + maxUpgradeExtra(r), 0);

  // "Add Other Items" flow: pick a product (page 1) → enter a quantity (page 2)
  // → append it to the summary as a line item.
  const [addStep, setAddStep] = useState<'closed' | 'pick' | 'qty'>('closed');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const pickedItem = pickedId ? findLibraryItem(pickedId) : null;
  const closeAdd = () => {
    setAddStep('closed');
    setPickedId(null);
    setQty(1);
  };

  // Split the aggregated rows into the Included / Optional Add-ons sections,
  // mirroring the Product Setup modal. Each section keeps its category labels.
  const sectionCats = (keep: (r: SummaryRow) => boolean) =>
    categories
      .map((c) => ({ category: c.category, rows: c.rows.filter(keep) }))
      .filter((c) => c.rows.length > 0);
  const includedCats = sectionCats((r) => !r.isAddon);
  const addonCats = sectionCats((r) => r.isAddon);
  const countRows = (cats: { rows: SummaryRow[] }[]) => cats.reduce((s, c) => s + c.rows.length, 0);
  const includedCount = countRows(includedCats);
  const addonCount = countRows(addonCats);

  const sectionBand = (label: string, count: number, marginTop = 0) => (
    <div style={{ background: '#d9d9dc', borderRadius: 8, padding: '12px 18px', marginTop, fontSize: 16, fontWeight: 600, color: '#3a3a3c' }}>
      {label} ({count})
    </div>
  );

  const renderLineItem = (categoryName: string, row: SummaryRow) => {
    const hasUpgrades = row.upgrades.length > 0;
    const isFee = !!row.feeId;
    // A fee's upgrade candidates are the Services & Fees products sharing its
    // unit (service → service, Each → Each). The fee's own product stays in the
    // list but is disabled + tagged "(Basic Product)", mirroring the flooring picker.
    const feeUpgradeGroups =
      isFee && row.unit
        ? SERVICE_LIBRARY.map((g) => ({
            category: g.category,
            items: g.items.filter((it) => (it.unit ?? '') === row.unit),
          })).filter((g) => g.items.length > 0)
        : undefined;
    const canUpgrade = isFee
      ? !!feeUpgradeGroups && feeUpgradeGroups.length > 0
      : categoryName === 'Flooring' && row.isBase;
    // The library id this row represents (drives the "(Basic Product)" tag +
    // self-disable). For fees this is the source product; for flooring it's baseId.
    const upgradeBaseId = row.sourceId ?? row.baseId;
    const upgradeDisableIds = [upgradeBaseId, ...row.upgrades.map((u) => u.id)];
    return (
      // line item — base option + its upgrade(s) share one card/padding
      <div
        key={`${row.feeId ?? row.name}|${row.upgrades.map((u) => u.id).join(',')}|${row.isAddon}`}
        style={{ background: '#fff', borderRadius: 10, padding: '14px 20px', marginBottom: 10 }}
      >
        {/* base (basic) option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <ProductSwatch thumb={row.thumb} />
          <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: 17, fontWeight: 600, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.name}
          </span>
          <span style={{ fontSize: 16, color: '#6b6b70', minWidth: 110, textAlign: 'right' }}>{row.measureText ?? fmtSqFt(row.area)}</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#1c1c1e', minWidth: 120, textAlign: 'right' }}>{fmtUsd(row.price)}</span>
          <ProductActionMenu
            isAddon={row.isAddon}
            hasUpgrade={hasUpgrades}
            canUpgrade={canUpgrade}
            baseId={upgradeBaseId}
            upgradeDisableIds={upgradeDisableIds}
            upgradeLibrary={feeUpgradeGroups}
            onAddUpgrade={
              isFee
                ? (libId) => onAddFeeUpgrade(row.feeId!, libId)
                : (libId) => onAddUpgrade(row.instanceIds, libId)
            }
            onToggleAddon={
              isFee
                ? () => onToggleFeeAddon(row.feeId!, !row.isAddon)
                : () => onToggleAddon(row.instanceIds, row.baseId, !row.isAddon)
            }
            onRemove={isFee ? () => onRemoveFee(row.feeId!) : () => onRemoveProduct(row.instanceIds, row.baseId, row.isBase)}
          />
        </div>

        {/* upgrade option(s), nested inside the same card */}
        {hasUpgrades && (
          <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 12 }}>
            <div style={{ width: 96, flex: '0 0 auto', paddingTop: 15, paddingRight: 18, textAlign: 'right', fontSize: 14, color: '#8a8a8e' }}>
              Upgrades
            </div>
            <div style={{ flex: 1, minWidth: 0, position: 'relative', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#e1e1e4' }} />
              {row.upgrades.map((u) => (
                <UpgradeActionRow
                  key={u.id}
                  u={u}
                  baseId={upgradeBaseId}
                  disableIds={upgradeDisableIds}
                  library={feeUpgradeGroups}
                  onSwap={
                    isFee
                      ? (newId) => onSwapFeeUpgrade(row.feeId!, u.id, newId)
                      : (newId) => onSwapUpgrade(row.instanceIds, u.id, newId)
                  }
                  onRemove={
                    isFee
                      ? () => onRemoveFeeUpgrade(row.feeId!, u.id)
                      : () => onRemoveUpgrade(row.instanceIds, u.id)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSectionCats = (cats: { category: string; rows: SummaryRow[] }[]) =>
    cats.map((cat) => (
      <div key={cat.category}>
        <div style={{ fontSize: 13, color: '#8a8a8e', margin: '18px 4px 8px' }}>{cat.category}</div>
        {cat.rows.map((row) => renderLineItem(cat.category, row))}
      </div>
    ));

  return (
    <>
      {/* dim scrim — covers the toolbar + canvas, leaves the status bar bright */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', top: 30, left: 0, right: 0, bottom: 0, background: 'rgba(20,22,26,0.28)', zIndex: 50 }}
      />

      {/* sheet card */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 16,
          right: 16,
          bottom: 0,
          background: '#efeff4',
          borderRadius: '14px 14px 0 0',
          boxShadow: '0 -4px 50px rgba(0,0,0,0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 51,
          fontFamily: APPLE_FONT,
          color: '#1c1c1e',
        }}
      >
        {/* header */}
        <div
          style={{
            position: 'relative',
            height: 58,
            flex: '0 0 auto',
            background: '#fff',
            borderBottom: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 600 }}>Report Setup</span>
          <div style={{ position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#e1efff',
                color: BLUE,
                borderRadius: 9,
                padding: '7px 13px',
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              Create Reports
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l4.5 4.5L10 1" />
              </svg>
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: BLUE,
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                padding: '7px 18px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>

        {/* body: left step rail + content column */}
        <div style={{ flex: '1 1 auto', display: 'flex', minHeight: 0 }}>
          {/* step rail */}
          <div style={{ width: 216, flex: '0 0 auto', padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ReportStep label="1. Summary" active starred />
            <ReportStep label="2. Field Data" />
            <ReportStep label="3. Payment" />
          </div>

          {/* content */}
          <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* total / add-items bar */}
            <div
              style={{
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 28px',
                borderBottom: '1px solid #dcdce0',
              }}
            >
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setAddStep('pick')}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', color: BLUE, fontSize: 17, cursor: 'pointer', padding: 0 }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 3v12M3 9h12" />
                  </svg>
                  Add Other Items
                </button>

                {addStep !== 'closed' && (
                  <>
                    <div onClick={closeAdd} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
                    {addStep === 'pick' && (
                      <ProductPickerPopover
                        title="Select a Product"
                        library={ADD_OTHER_LIBRARY}
                        isDisabled={() => false}
                        tagFor={() => ''}
                        onPick={(libId) => {
                          setPickedId(libId);
                          setQty(1);
                          setAddStep('qty');
                        }}
                        placement={{ top: 'calc(100% + 12px)', left: 0 }}
                      />
                    )}
                    {addStep === 'qty' && pickedItem && (
                      <OtherItemQuantityCard
                        name={pickedItem.name}
                        unit={unitOf(pickedItem).label}
                        qty={qty}
                        onChangeQty={setQty}
                        onCancel={closeAdd}
                        onAdd={() => {
                          onAddOtherItem(pickedItem.id, qty);
                          closeAdd();
                        }}
                        placement={{ top: 'calc(100% + 12px)', left: 0 }}
                      />
                    )}
                  </>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, color: '#8a8a8e' }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>
                    {maxTotal > minTotal ? `${fmtUsd(minTotal)} – ${fmtUsd(maxTotal)}` : fmtUsd(minTotal)}
                  </span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#8a8a8e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 1.5l5 5 5-5" />
                  </svg>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="15" height="15" viewBox="0 0 15 15">
                    <circle cx="7.5" cy="7.5" r="7" fill="#e0352b" />
                    <rect x="6.8" y="3.6" width="1.4" height="4.6" rx="0.7" fill="#fff" />
                    <circle cx="7.5" cy="10.7" r="0.95" fill="#fff" />
                  </svg>
                  <span style={{ fontSize: 14, color: '#e0352b', fontWeight: 500 }}>0%</span>
                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" stroke="#9a9a9e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 1.5L14.5 5H1.5L8 1.5z" />
                    <path d="M2.5 5v6M6 5v6M10 5v6M13.5 5v6" />
                    <path d="M1.5 13.5h13" />
                  </svg>
                </div>
              </div>
            </div>

            {/* scrolling summary */}
            <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '24px 28px 40px' }}>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em' }}>Summary</div>
              <div style={{ marginTop: 6, fontSize: 16, color: '#8a8a8e' }}>
                Preview and edit your report/proposal data.
              </div>

              {sectionBand('Included Product', includedCount, 22)}
              {renderSectionCats(includedCats)}

              {addonCats.length > 0 && (
                <>
                  {sectionBand('Optional Add-ons', addonCount, 52)}
                  {renderSectionCats(addonCats)}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReportStep({ label, active = false, starred = false }: { label: string; active?: boolean; starred?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '15px 18px',
        borderRadius: 12,
        fontSize: 18,
        fontWeight: active ? 600 : 500,
        color: active ? BLUE : '#3a3a3c',
        background: active ? '#eaf3ff' : 'transparent',
        border: active ? `1.5px solid ${BLUE}` : '1.5px solid transparent',
      }}
    >
      {/* required marker — own column so the step numbers stay left-aligned */}
      <span style={{ width: 14, flex: '0 0 auto', color: '#e0352b', fontWeight: 600 }}>{starred ? '*' : ''}</span>
      <span>{label}</span>
    </div>
  );
}

/* ================================================================== */
/* Homeowner hand-off — desktop browser chrome + Proposal Summary.     */
/* The browser page reuses the proposal-v3-responsive Summary visual   */
/* language, but is driven entirely by the drawing config the          */
/* contractor just built on the iPad (the same aggregateDrawing rows   */
/* the Report sheet uses). Flooring project context is fabricated.     */
/* ================================================================== */
const PROP_FONT = 'Segoe UI, system-ui, -apple-system, sans-serif';
const PROPOSAL_TITLE = 'FLOORING REPLACEMENT PROPOSAL';
const PROPOSAL_ADDRESS = '2148 Plainfield Ave NE, Grand Rapids, MI 49505';
const PROPOSAL_URL = 'grflooring.com/proposal/1042';
const PROP_ACCENT = '#262626'; // black theme accent for the primary CTA
const PROP_INK = '#262626';

const fmtArea = (n: number) =>
  `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })} sq ft`;

/** Flooring company wordmark — supplied brand SVG. */
function FloorLogo() {
  return (
    <svg width={54} height={30} viewBox="0 0 426 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Groff Coggan Flooring">
      <path d="M121.314 0.0657638L246.373 0.103984L285.628 0.104532C291.691 0.104382 300.103 -0.171946 306.015 0.174557C307.793 1.38898 311.238 5.18098 312.853 6.8633C313.131 9.9018 312.93 16.844 312.928 20.1259L312.905 46.6276L312.908 116.336L312.925 141.639C312.93 146.353 312.825 151.304 312.991 155.99C294.965 138.462 277.046 120.143 259.183 102.386L226.48 69.6991C222.334 65.5343 216.786 60.4693 213.007 56.2115L144.412 124.751L122.345 146.731C119.438 149.64 115.82 152.977 113.101 155.951L113.062 62.4348L113.073 27.0786C113.069 20.6934 112.883 13.4162 113.12 7.09537C113.443 6.53173 114.148 5.58569 114.642 5.15057C116.57 3.45139 118.586 0.153038 121.314 0.0657638Z" fill="#492410"/>
      <path d="M118.282 9C118.962 9.23992 121.73 12.3274 122.458 13.0623L131.812 22.4261L167.175 57.7842C173.296 63.9053 179.487 70.3118 185.724 76.2806L175.455 86.457C172.206 89.8427 168.795 92.8595 165.676 96.442C161.821 92.3947 157.534 88.2294 153.565 84.2618L131.456 62.1555L123.693 54.4175C121.94 52.6933 119.557 50.5003 118.069 48.6171L118.061 22.461C118.057 19.6359 117.86 11.4052 118.282 9Z" fill="#B98A6F"/>
      <path d="M264.743 5.2047C266.198 5.10037 267.964 5.10263 269.436 5.13409C280.841 5.37797 292.558 4.71901 303.936 5.25663C302.51 6.59362 300.833 8.45748 299.374 9.90784L286.378 22.8766L246.391 62.9593C243.234 65.9506 239.824 69.5431 236.733 72.6658C235.291 71.6103 232.364 68.3191 230.936 66.9428C226.05 62.2377 221.492 57.2784 216.543 52.6209C217.837 51.4878 219.695 49.5096 220.958 48.2449L228.754 40.4592L252.297 16.8864L258.787 10.4373C259.976 9.23324 263.275 5.46084 264.743 5.2047Z" fill="#8A5334"/>
      <path d="M217.279 4.98438C219.517 5.28126 225.735 5.13549 228.314 5.13473L244.977 5.12886C248.792 5.12807 252.917 5.06522 256.701 5.28965C255.653 6.07095 252.528 9.41984 251.397 10.5449L238.307 23.6025C225.293 36.6723 211.898 49.7448 199.049 62.9256L189.181 72.7955C184.459 67.401 178.889 62.4321 173.909 57.2525C172.448 55.7338 170.753 54.0844 169.18 52.7018C179.618 42.0045 190.442 31.3955 201.021 20.8131L210.83 10.9492C212.754 9.03363 215.129 6.52423 217.279 4.98438Z" fill="#B98A6F"/>
      <path d="M260.341 56.4531C261.078 56.7165 303.177 99.1045 307.802 103.602L307.84 143.666L297.795 133.632L260.791 96.7053L249.695 85.6366C246.71 82.623 243.329 79.081 240.195 76.2466C241.9 74.7763 243.721 72.8773 245.341 71.2701C248.363 68.288 251.358 65.2794 254.327 62.2446C256.126 60.4217 258.428 58.0479 260.341 56.4531Z" fill="#B98A6F"/>
      <path d="M118.034 56.1953C120.063 57.4079 122.404 60.2328 124.194 62.0418L131.078 68.929L154.368 92.1769C156.083 93.8979 160.425 98.8323 162.085 99.7502C159.962 102.384 154.793 107.127 152.107 109.802C148.714 113.198 145.291 116.563 141.837 119.896C134.811 112.709 127.259 105.852 120.336 98.5343C117.541 95.5803 117.826 90.0406 117.924 86.1754C118.175 76.2863 117.514 66.0239 118.034 56.1953Z" fill="#8A5334"/>
      <path d="M169.533 5.13154L194.718 5.11533C199.191 5.11762 205.003 4.94987 209.335 5.30862C208.02 6.35549 206.369 8.1346 205.155 9.36089L198.559 15.9862L175.703 38.8166C172.52 42.0224 168.794 45.968 165.514 48.974C162.39 45.6517 159.005 42.3417 155.776 39.1074C152.436 35.762 148.98 32.2238 145.512 29.0281C148.137 26.0254 153.459 20.9671 156.426 18.0587C160.304 14.2584 165.57 8.52197 169.533 5.13154Z" fill="#B98A6F"/>
      <path d="M284.123 32.375C291.876 40.6828 300.011 48.3251 307.837 56.4368L307.834 82.9509C307.834 86.4186 307.658 93.3649 308 96.6066C305.454 93.7027 300.733 89.3498 297.799 86.4041L264.02 52.6557C264.73 52.0125 265.47 51.2371 266.145 50.5511C272.114 44.4842 278.215 38.4978 284.123 32.375Z" fill="#8A5334"/>
      <path d="M118.321 103.602C119.395 104.573 120.566 106.064 121.694 107.157C127.241 112.579 132.748 118.041 138.215 123.543C135.383 126.696 131.104 130.786 127.995 133.749C124.709 137.088 121.434 140.28 118.172 143.671C118.218 141.672 118.078 139.196 118.068 137.136L118.048 118.345C118.048 113.395 117.963 108.541 118.321 103.602Z" fill="#B98A6F"/>
      <path d="M307.603 9.11719C307.741 9.27548 307.822 45.2571 307.836 49.033C304.899 46.4316 300.642 41.8897 297.799 39.0374C294.435 35.635 291.019 32.285 287.551 28.9887C289.689 26.659 292.614 24.0247 294.912 21.6861C297.32 19.246 299.741 16.8202 302.179 14.4087C303.947 12.6347 305.718 10.7506 307.603 9.11719Z" fill="#E2C1A8"/>
      <path d="M130.907 5.22919C138.672 5.08151 146.484 5.19817 154.254 5.14278C156.828 5.12442 159.522 5.1148 162.09 5.26982C160.317 6.66708 157.843 9.31274 156.177 10.9954L147.209 19.984C145.441 21.767 143.692 23.5684 141.961 25.3876C139.77 23.0045 137.03 20.3793 134.723 18.0729L121.891 5.25982C124.773 5.367 127.998 5.26495 130.907 5.22919Z" fill="#E2C1A8"/>
      <path d="M216.486 132C222.269 131.903 228.238 131.99 234.04 131.969C234.02 133.953 234.137 148.959 233.831 149.51C228.222 149.35 222.204 149.478 216.565 149.516C216.297 143.972 216.722 137.697 216.486 132Z" fill="#492410"/>
      <path d="M191.954 131.984C197.744 131.883 203.604 132.074 209.415 131.97C209.444 137.818 209.442 143.665 209.407 149.513C203.596 149.461 197.785 149.463 191.974 149.518C191.889 143.737 191.984 137.788 191.954 131.984Z" fill="#492410"/>
      <path d="M192.077 107.93C193.742 108.029 196.232 107.943 197.999 107.943L209.448 107.97C209.354 113.709 209.425 119.679 209.415 125.435L191.983 125.465L191.947 113.771C191.944 112.668 191.864 108.778 192.077 107.93Z" fill="#492410"/>
      <path d="M216.552 107.94L234.044 107.938C233.949 113.712 234.019 119.647 233.975 125.446L216.563 125.432C216.525 119.601 216.521 113.77 216.552 107.94Z" fill="#492410"/>
      <g transform="translate(0 28)">
      <path d="M407.49 210.769C403.778 210.769 400.45 210.236 397.506 209.169C394.604 208.06 392.13 206.566 390.082 204.689C388.076 202.769 386.54 200.572 385.474 198.097C384.45 195.622 383.938 192.956 383.938 190.097C383.938 186.982 384.556 184.166 385.794 181.649C387.031 179.089 388.759 176.892 390.978 175.057C393.196 173.222 395.799 171.814 398.786 170.833C401.772 169.809 405.036 169.297 408.578 169.297C410.668 169.297 412.716 169.468 414.722 169.809C416.77 170.15 418.433 170.641 419.714 171.281C420.14 171.452 420.375 171.601 420.418 171.729C420.503 171.814 420.567 172.156 420.61 172.753L421.442 181.137C421.442 181.265 421.335 181.35 421.122 181.393C420.908 181.436 420.759 181.393 420.674 181.265C420.332 180.198 419.778 179.046 419.01 177.809C418.284 176.572 417.346 175.42 416.194 174.353C415.042 173.244 413.655 172.326 412.034 171.601C410.455 170.876 408.62 170.513 406.53 170.513C403.586 170.513 400.919 171.26 398.53 172.753C396.14 174.246 394.242 176.358 392.834 179.089C391.426 181.82 390.722 185.084 390.722 188.881C390.722 191.825 391.148 194.556 392.002 197.073C392.855 199.548 394.071 201.745 395.65 203.665C397.271 205.585 399.212 207.078 401.474 208.145C403.735 209.212 406.274 209.745 409.09 209.745C410.839 209.745 412.247 209.532 413.314 209.105C414.38 208.678 415.148 207.91 415.618 206.801C416.087 205.649 416.322 204.028 416.322 201.937C416.322 199.889 416.193 198.396 415.938 197.457C415.724 196.476 415.148 195.836 414.21 195.537C413.271 195.238 411.756 195.089 409.666 195.089C409.41 195.089 409.282 194.918 409.282 194.577C409.282 194.236 409.388 194.065 409.602 194.065C412.503 194.236 415.106 194.342 417.41 194.385C419.756 194.385 422.21 194.321 424.77 194.193C424.94 194.193 425.026 194.342 425.026 194.641C425.068 194.94 424.983 195.089 424.77 195.089C423.959 195.046 423.362 195.196 422.978 195.537C422.594 195.836 422.338 196.518 422.21 197.585C422.124 198.652 422.082 200.316 422.082 202.577C422.082 203.985 422.124 205.03 422.21 205.713C422.295 206.396 422.359 206.908 422.402 207.249C422.487 207.548 422.53 207.868 422.53 208.209C422.53 208.465 422.487 208.636 422.402 208.721C422.316 208.806 422.124 208.892 421.826 208.977C419.564 209.489 417.175 209.916 414.658 210.257C412.14 210.598 409.751 210.769 407.49 210.769Z" fill="#492410"/>
      <path d="M341.926 202.256V171.472L343.654 171.6V202.256C343.654 204.517 344.102 206.245 344.998 207.44C345.894 208.635 347.174 209.232 348.838 209.232C348.966 209.232 349.03 209.36 349.03 209.616C349.03 209.872 348.966 210 348.838 210C347.942 210 347.003 209.979 346.022 209.936C345.083 209.893 344.038 209.872 342.886 209.872C341.649 209.872 340.454 209.893 339.302 209.936C338.193 209.979 337.147 210 336.166 210C336.038 210 335.974 209.872 335.974 209.616C335.974 209.36 336.038 209.232 336.166 209.232C338.043 209.232 339.473 208.635 340.454 207.44C341.435 206.245 341.926 204.517 341.926 202.256ZM374.438 210.896C374.438 211.024 374.331 211.088 374.118 211.088C373.905 211.131 373.755 211.131 373.67 211.088L342.886 175.248C341.35 173.499 340.027 172.325 338.918 171.728C337.851 171.088 336.806 170.768 335.782 170.768C335.654 170.768 335.59 170.64 335.59 170.384C335.59 170.128 335.654 170 335.782 170C336.592 170 337.424 170.021 338.278 170.064C339.131 170.107 339.921 170.128 340.646 170.128C341.926 170.128 343.078 170.107 344.102 170.064C345.169 170.021 345.979 170 346.534 170C347.089 170 347.494 170.256 347.75 170.768C348.006 171.237 348.646 172.091 349.67 173.328L373.926 201.872L374.438 210.896ZM374.438 177.808V210.896L372.71 208.976V177.808C372.71 175.547 372.262 173.819 371.366 172.624C370.513 171.387 369.233 170.768 367.526 170.768C367.441 170.768 367.398 170.64 367.398 170.384C367.398 170.128 367.441 170 367.526 170C368.422 170 369.361 170.043 370.342 170.128C371.323 170.171 372.39 170.192 373.542 170.192C374.651 170.192 375.739 170.171 376.806 170.128C377.873 170.043 378.854 170 379.75 170C379.878 170 379.942 170.128 379.942 170.384C379.942 170.64 379.878 170.768 379.75 170.768C378.043 170.768 376.721 171.387 375.782 172.624C374.886 173.819 374.438 175.547 374.438 177.808Z" fill="#492410"/>
      <path d="M326.127 204.816C326.127 206.053 326.234 206.992 326.447 207.632C326.703 208.272 327.173 208.699 327.855 208.912C328.538 209.125 329.583 209.232 330.991 209.232C331.119 209.232 331.183 209.36 331.183 209.616C331.183 209.872 331.119 210 330.991 210C329.925 210 328.73 209.979 327.407 209.936C326.085 209.893 324.613 209.872 322.991 209.872C321.498 209.872 320.069 209.893 318.703 209.936C317.338 209.979 316.122 210 315.055 210C314.927 210 314.863 209.872 314.863 209.616C314.863 209.36 314.927 209.232 315.055 209.232C316.421 209.232 317.466 209.125 318.191 208.912C318.917 208.699 319.386 208.272 319.599 207.632C319.855 206.992 319.983 206.053 319.983 204.816V175.184C319.983 173.947 319.855 173.029 319.599 172.432C319.386 171.792 318.917 171.365 318.191 171.152C317.466 170.896 316.421 170.768 315.055 170.768C314.927 170.768 314.863 170.64 314.863 170.384C314.863 170.128 314.927 170 315.055 170C316.122 170 317.338 170.043 318.703 170.128C320.069 170.171 321.498 170.192 322.991 170.192C324.613 170.192 326.085 170.171 327.407 170.128C328.773 170.043 329.967 170 330.991 170C331.119 170 331.183 170.128 331.183 170.384C331.183 170.64 331.119 170.768 330.991 170.768C329.626 170.768 328.581 170.896 327.855 171.152C327.173 171.408 326.703 171.856 326.447 172.496C326.234 173.136 326.127 174.075 326.127 175.312V204.816Z" fill="#492410"/>
      <path d="M302.545 209.997C301.905 209.997 300.839 209.186 299.345 207.565C297.852 205.943 296.039 203.618 293.905 200.589C291.815 197.517 289.468 193.869 286.865 189.645L291.985 188.109C295.441 193.271 298.385 197.41 300.817 200.525C303.292 203.597 305.468 205.815 307.345 207.181C309.265 208.546 311.1 209.229 312.849 209.229C312.935 209.229 312.977 209.357 312.977 209.613C312.977 209.869 312.935 209.997 312.849 209.997C310.161 209.997 307.964 209.997 306.257 209.997C304.593 209.997 303.356 209.997 302.545 209.997ZM288.017 169.805C291.729 169.805 294.588 170.551 296.593 172.045C298.641 173.495 299.665 175.501 299.665 178.061C299.665 180.493 298.961 182.669 297.553 184.589C296.188 186.509 294.396 188.002 292.177 189.069C290.001 190.135 287.655 190.669 285.137 190.669C284.625 190.669 284.071 190.669 283.473 190.669C282.876 190.626 282.343 190.583 281.873 190.541V204.813C281.873 206.05 281.98 206.989 282.193 207.629C282.407 208.269 282.855 208.695 283.537 208.909C284.263 209.122 285.308 209.229 286.673 209.229C286.801 209.229 286.865 209.357 286.865 209.613C286.865 209.869 286.801 209.997 286.673 209.997C285.607 209.997 284.412 209.975 283.089 209.933C281.767 209.89 280.316 209.869 278.737 209.869C277.244 209.869 275.815 209.89 274.449 209.933C273.084 209.975 271.868 209.997 270.801 209.997C270.673 209.997 270.609 209.869 270.609 209.613C270.609 209.357 270.673 209.229 270.801 209.229C272.209 209.229 273.255 209.122 273.937 208.909C274.62 208.695 275.089 208.269 275.345 207.629C275.601 206.989 275.729 206.05 275.729 204.813V175.181C275.729 173.943 275.601 173.026 275.345 172.429C275.132 171.789 274.684 171.362 274.001 171.149C273.319 170.893 272.273 170.765 270.865 170.765C270.78 170.765 270.737 170.637 270.737 170.381C270.737 170.125 270.78 169.997 270.865 169.997C271.932 169.997 273.127 170.039 274.449 170.125C275.815 170.167 277.244 170.189 278.737 170.189C280.103 170.189 281.639 170.125 283.345 169.997C285.052 169.869 286.609 169.805 288.017 169.805ZM293.329 180.301C293.329 177.826 293.031 175.927 292.433 174.605C291.879 173.239 291.089 172.301 290.065 171.789C289.041 171.277 287.847 171.021 286.481 171.021C284.817 171.021 283.623 171.341 282.897 171.981C282.215 172.578 281.873 173.687 281.873 175.309V188.813C282.471 188.898 283.111 188.962 283.793 189.005C284.476 189.047 285.073 189.069 285.585 189.069C288.444 189.069 290.449 188.365 291.601 186.957C292.753 185.506 293.329 183.287 293.329 180.301Z" fill="#492410"/>
      <path d="M242.538 210.769C239.466 210.769 236.671 210.236 234.154 209.169C231.679 208.06 229.546 206.545 227.754 204.625C226.005 202.705 224.639 200.508 223.658 198.033C222.719 195.516 222.25 192.849 222.25 190.033C222.25 186.577 222.911 183.548 224.234 180.945C225.599 178.342 227.391 176.188 229.61 174.481C231.829 172.732 234.261 171.43 236.906 170.577C239.551 169.724 242.175 169.297 244.778 169.297C247.935 169.297 250.751 169.873 253.226 171.025C255.743 172.134 257.877 173.649 259.626 175.569C261.375 177.489 262.698 179.665 263.594 182.097C264.533 184.529 265.002 187.025 265.002 189.585C265.002 192.572 264.405 195.345 263.21 197.905C262.015 200.465 260.373 202.705 258.282 204.625C256.234 206.545 253.845 208.06 251.114 209.169C248.426 210.236 245.567 210.769 242.538 210.769ZM244.714 209.233C247.274 209.233 249.557 208.55 251.562 207.185C253.61 205.82 255.21 203.814 256.362 201.169C257.557 198.481 258.154 195.238 258.154 191.441C258.154 187.473 257.514 183.953 256.234 180.881C254.954 177.809 253.119 175.398 250.73 173.649C248.341 171.857 245.482 170.961 242.154 170.961C238.015 170.961 234.794 172.454 232.49 175.441C230.229 178.385 229.098 182.481 229.098 187.729C229.098 190.801 229.482 193.66 230.25 196.305C231.018 198.908 232.085 201.19 233.45 203.153C234.858 205.116 236.501 206.63 238.378 207.697C240.298 208.721 242.41 209.233 244.714 209.233Z" fill="#492410"/>
      <path d="M193.538 210.769C190.466 210.769 187.671 210.236 185.154 209.169C182.679 208.06 180.546 206.545 178.754 204.625C177.005 202.705 175.639 200.508 174.658 198.033C173.719 195.516 173.25 192.849 173.25 190.033C173.25 186.577 173.911 183.548 175.234 180.945C176.599 178.342 178.391 176.188 180.61 174.481C182.829 172.732 185.261 171.43 187.906 170.577C190.551 169.724 193.175 169.297 195.778 169.297C198.935 169.297 201.751 169.873 204.226 171.025C206.743 172.134 208.877 173.649 210.626 175.569C212.375 177.489 213.698 179.665 214.594 182.097C215.533 184.529 216.002 187.025 216.002 189.585C216.002 192.572 215.405 195.345 214.21 197.905C213.015 200.465 211.373 202.705 209.282 204.625C207.234 206.545 204.845 208.06 202.114 209.169C199.426 210.236 196.567 210.769 193.538 210.769ZM195.714 209.233C198.274 209.233 200.557 208.55 202.562 207.185C204.61 205.82 206.21 203.814 207.362 201.169C208.557 198.481 209.154 195.238 209.154 191.441C209.154 187.473 208.514 183.953 207.234 180.881C205.954 177.809 204.119 175.398 201.73 173.649C199.341 171.857 196.482 170.961 193.154 170.961C189.015 170.961 185.794 172.454 183.49 175.441C181.229 178.385 180.098 182.481 180.098 187.729C180.098 190.801 180.482 193.66 181.25 196.305C182.018 198.908 183.085 201.19 184.45 203.153C185.858 205.116 187.501 206.63 189.378 207.697C191.298 208.721 193.41 209.233 195.714 209.233Z" fill="#492410"/>
      <path d="M148.482 175.248V204.56C148.482 205.627 148.589 206.437 148.802 206.992C149.015 207.547 149.421 207.909 150.018 208.08C150.615 208.251 151.49 208.336 152.642 208.336H156.482C159.511 208.336 162.071 207.483 164.162 205.776C166.253 204.069 167.639 201.808 168.322 198.992C168.365 198.864 168.493 198.821 168.706 198.864C168.919 198.907 169.026 198.992 169.026 199.12C168.898 200.443 168.77 202.043 168.642 203.92C168.514 205.755 168.45 207.461 168.45 209.04C168.45 209.68 168.13 210 167.49 210H137.538C137.453 210 137.41 209.872 137.41 209.616C137.41 209.36 137.453 209.232 137.538 209.232C138.903 209.232 139.927 209.125 140.61 208.912C141.335 208.699 141.805 208.272 142.018 207.632C142.274 206.992 142.402 206.053 142.402 204.816V175.184C142.402 173.947 142.274 173.029 142.018 172.432C141.805 171.792 141.335 171.365 140.61 171.152C139.927 170.896 138.903 170.768 137.538 170.768C137.453 170.768 137.41 170.64 137.41 170.384C137.41 170.128 137.453 170 137.538 170C138.562 170 139.757 170.043 141.122 170.128C142.487 170.171 143.917 170.192 145.41 170.192C146.989 170.192 148.439 170.171 149.762 170.128C151.127 170.043 152.322 170 153.346 170C153.474 170 153.538 170.128 153.538 170.384C153.538 170.64 153.474 170.768 153.346 170.768C151.981 170.768 150.935 170.896 150.21 171.152C149.527 171.365 149.058 171.792 148.802 172.432C148.589 173.072 148.482 174.011 148.482 175.248Z" fill="#492410"/>
      <path d="M104.731 210C104.603 210 104.539 209.872 104.539 209.616C104.539 209.36 104.603 209.232 104.731 209.232C106.224 209.232 107.334 209.125 108.059 208.912C108.784 208.699 109.275 208.272 109.531 207.632C109.787 206.992 109.915 206.053 109.915 204.816V175.184C109.915 173.947 109.787 173.029 109.531 172.432C109.318 171.792 108.87 171.365 108.187 171.152C107.504 170.896 106.459 170.768 105.051 170.768C104.923 170.768 104.859 170.64 104.859 170.384C104.859 170.128 104.923 170 105.051 170H131.675C132.102 170 132.315 170.192 132.315 170.576L132.443 178.896C132.443 178.981 132.336 179.045 132.123 179.088C131.91 179.088 131.76 179.024 131.675 178.896C131.206 176.464 130.224 174.651 128.731 173.456C127.238 172.261 125.275 171.664 122.843 171.664H120.219C118.64 171.664 117.531 171.941 116.891 172.496C116.294 173.051 115.995 173.968 115.995 175.248V204.56C115.995 205.84 116.166 206.821 116.507 207.504C116.848 208.144 117.531 208.592 118.555 208.848C119.579 209.104 121.115 209.232 123.163 209.232C123.248 209.232 123.291 209.36 123.291 209.616C123.291 209.872 123.248 210 123.163 210C121.712 210 120.155 209.979 118.491 209.936C116.827 209.893 114.928 209.872 112.795 209.872C111.302 209.872 109.851 209.893 108.443 209.936C107.035 209.979 105.798 210 104.731 210ZM128.475 196.24C128.475 194.491 127.856 193.147 126.619 192.208C125.424 191.269 123.59 190.8 121.115 190.8H113.115V189.136H121.243C123.675 189.136 125.467 188.731 126.619 187.92C127.814 187.067 128.411 185.872 128.411 184.336C128.411 184.251 128.539 184.208 128.795 184.208C129.051 184.208 129.179 184.251 129.179 184.336C129.179 185.744 129.158 186.832 129.115 187.6C129.115 188.368 129.115 189.157 129.115 189.968C129.115 190.992 129.136 192.016 129.179 193.04C129.222 194.021 129.243 195.088 129.243 196.24C129.243 196.368 129.115 196.432 128.859 196.432C128.603 196.432 128.475 196.368 128.475 196.24Z" fill="#492410"/>
      <path d="M77.6704 209.997C77.0304 209.997 75.9637 209.186 74.4704 207.565C72.977 205.943 71.1637 203.618 69.0304 200.589C66.9397 197.517 64.593 193.869 61.9904 189.645L67.1104 188.109C70.5664 193.271 73.5104 197.41 75.9424 200.525C78.417 203.597 80.593 205.815 82.4704 207.181C84.3904 208.546 86.2251 209.229 87.9744 209.229C88.0597 209.229 88.1024 209.357 88.1024 209.613C88.1024 209.869 88.0597 209.997 87.9744 209.997C85.2864 209.997 83.089 209.997 81.3824 209.997C79.7184 209.997 78.481 209.997 77.6704 209.997ZM63.1424 169.805C66.8544 169.805 69.713 170.551 71.7184 172.045C73.7664 173.495 74.7904 175.501 74.7904 178.061C74.7904 180.493 74.0864 182.669 72.6784 184.589C71.313 186.509 69.521 188.002 67.3024 189.069C65.1264 190.135 62.7797 190.669 60.2624 190.669C59.7504 190.669 59.1957 190.669 58.5984 190.669C58.001 190.626 57.4677 190.583 56.9984 190.541V204.813C56.9984 206.05 57.105 206.989 57.3184 207.629C57.5317 208.269 57.9797 208.695 58.6624 208.909C59.3877 209.122 60.433 209.229 61.7984 209.229C61.9264 209.229 61.9904 209.357 61.9904 209.613C61.9904 209.869 61.9264 209.997 61.7984 209.997C60.7317 209.997 59.537 209.975 58.2144 209.933C56.8917 209.89 55.441 209.869 53.8624 209.869C52.369 209.869 50.9397 209.89 49.5744 209.933C48.209 209.975 46.993 209.997 45.9264 209.997C45.7984 209.997 45.7344 209.869 45.7344 209.613C45.7344 209.357 45.7984 209.229 45.9264 209.229C47.3344 209.229 48.3797 209.122 49.0624 208.909C49.745 208.695 50.2144 208.269 50.4704 207.629C50.7264 206.989 50.8544 206.05 50.8544 204.813V175.181C50.8544 173.943 50.7264 173.026 50.4704 172.429C50.257 171.789 49.809 171.362 49.1264 171.149C48.4437 170.893 47.3984 170.765 45.9904 170.765C45.905 170.765 45.8624 170.637 45.8624 170.381C45.8624 170.125 45.905 169.997 45.9904 169.997C47.057 169.997 48.2517 170.039 49.5744 170.125C50.9397 170.167 52.369 170.189 53.8624 170.189C55.2277 170.189 56.7637 170.125 58.4704 169.997C60.177 169.869 61.7344 169.805 63.1424 169.805ZM68.4544 180.301C68.4544 177.826 68.1557 175.927 67.5584 174.605C67.0037 173.239 66.2144 172.301 65.1904 171.789C64.1664 171.277 62.9717 171.021 61.6064 171.021C59.9424 171.021 58.7477 171.341 58.0224 171.981C57.3397 172.578 56.9984 173.687 56.9984 175.309V188.813C57.5957 188.898 58.2357 188.962 58.9184 189.005C59.601 189.047 60.1984 189.069 60.7104 189.069C63.569 189.069 65.5744 188.365 66.7264 186.957C67.8784 185.506 68.4544 183.287 68.4544 180.301Z" fill="#492410"/>
      <path d="M23.552 210.769C19.84 210.769 16.512 210.236 13.568 209.169C10.6667 208.06 8.192 206.566 6.144 204.689C4.13867 202.769 2.60267 200.572 1.536 198.097C0.512 195.622 0 192.956 0 190.097C0 186.982 0.618667 184.166 1.856 181.649C3.09333 179.089 4.82133 176.892 7.04 175.057C9.25867 173.222 11.8613 171.814 14.848 170.833C17.8347 169.809 21.0987 169.297 24.64 169.297C26.7307 169.297 28.7787 169.468 30.784 169.809C32.832 170.15 34.496 170.641 35.776 171.281C36.2027 171.452 36.4373 171.601 36.48 171.729C36.5653 171.814 36.6293 172.156 36.672 172.753L37.504 181.137C37.504 181.265 37.3973 181.35 37.184 181.393C36.9707 181.436 36.8213 181.393 36.736 181.265C36.3947 180.198 35.84 179.046 35.072 177.809C34.3467 176.572 33.408 175.42 32.256 174.353C31.104 173.244 29.7173 172.326 28.096 171.601C26.5173 170.876 24.6827 170.513 22.592 170.513C19.648 170.513 16.9813 171.26 14.592 172.753C12.2027 174.246 10.304 176.358 8.896 179.089C7.488 181.82 6.784 185.084 6.784 188.881C6.784 191.825 7.21067 194.556 8.064 197.073C8.91733 199.548 10.1333 201.745 11.712 203.665C13.3333 205.585 15.2747 207.078 17.536 208.145C19.7973 209.212 22.336 209.745 25.152 209.745C26.9013 209.745 28.3093 209.532 29.376 209.105C30.4427 208.678 31.2107 207.91 31.68 206.801C32.1493 205.649 32.384 204.028 32.384 201.937C32.384 199.889 32.256 198.396 32 197.457C31.7867 196.476 31.2107 195.836 30.272 195.537C29.3333 195.238 27.8187 195.089 25.728 195.089C25.472 195.089 25.344 194.918 25.344 194.577C25.344 194.236 25.4507 194.065 25.664 194.065C28.5653 194.236 31.168 194.342 33.472 194.385C35.8187 194.385 38.272 194.321 40.832 194.193C41.0027 194.193 41.088 194.342 41.088 194.641C41.1307 194.94 41.0453 195.089 40.832 195.089C40.0213 195.046 39.424 195.196 39.04 195.537C38.656 195.836 38.4 196.518 38.272 197.585C38.1867 198.652 38.144 200.316 38.144 202.577C38.144 203.985 38.1867 205.03 38.272 205.713C38.3573 206.396 38.4213 206.908 38.464 207.249C38.5493 207.548 38.592 207.868 38.592 208.209C38.592 208.465 38.5493 208.636 38.464 208.721C38.3787 208.806 38.1867 208.892 37.888 208.977C35.6267 209.489 33.2373 209.916 30.72 210.257C28.2027 210.598 25.8133 210.769 23.552 210.769Z" fill="#492410"/>
      </g>
    </svg>
  );
}

/** Chrome-style desktop browser window with a dark title + tool bar. */
function BrowserWindow({ children }: { children: React.ReactNode }) {
  const navIcon = (d: string) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9aa0a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  return (
    <div
      style={{
        width: BROWSER_W,
        height: BROWSER_H,
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 40px 90px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.35)',
        fontFamily: PROP_FONT,
      }}
    >
      {/* title bar */}
      <div style={{ height: 40, flex: '0 0 auto', background: '#1f2023', display: 'flex', alignItems: 'flex-end', paddingLeft: 16, gap: 10 }}>
        {/* traffic lights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>
        {/* active tab */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#2c2d31',
            borderRadius: '10px 10px 0 0',
            padding: '9px 12px 10px',
            width: 220,
            marginLeft: 6,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M45 24c0-1.6-.1-2.8-.4-4.1H24v7.8h12c-.2 1.9-1.5 4.8-4.4 6.7l6.7 5.2C42.4 36.1 45 30.6 45 24z" />
            <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.9-12.5-9.2l-7.1 5.5C7.6 40.8 15.2 46 24 46z" />
            <path fill="#FBBC05" d="M11.5 28.3c-.5-1.4-.7-2.8-.7-4.3s.3-2.9.7-4.3l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 9.8l7.1-5.5z" />
            <path fill="#EA4335" d="M24 10.8c3.2 0 5.4 1.4 6.6 2.5l5.9-5.8C32.9 4 27.9 2 24 2 15.2 2 7.6 7.2 4.4 14.2l7.1 5.5C13.3 14.7 18.2 10.8 24 10.8z" />
          </svg>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#e8eaed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Grand Rapids Flooring Co.
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" stroke="#9aa0a6" strokeWidth="1.4" strokeLinecap="round">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </div>
        <span style={{ color: '#9aa0a6', fontSize: 20, paddingBottom: 8, cursor: 'default' }}>+</span>
      </div>

      {/* tool bar */}
      <div style={{ height: 46, flex: '0 0 auto', background: '#2c2d31', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px' }}>
        {navIcon('M12 4l-6 6 6 6')}
        {navIcon('M8 4l6 6-6 6')}
        {navIcon('M15 5a7 7 0 10 1.8 5M15 5V2m0 3h-3')}
        {navIcon('M4 9l6-5 6 5v7a1 1 0 01-1 1H5a1 1 0 01-1-1z')}
        {/* address bar */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, background: '#3c3d41', borderRadius: 16, height: 32, padding: '0 14px', marginLeft: 4 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#9aa0a6" strokeWidth="1.5">
            <rect x="2.5" y="6.5" width="9" height="6" rx="1.2" />
            <path d="M4.5 6.5V4.5a2.5 2.5 0 015 0v2" />
          </svg>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#e8eaed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {PROPOSAL_URL}
          </span>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#9aa0a6" strokeWidth="1.4" strokeLinejoin="round">
            <path d="M8 2l1.8 3.7 4.1.6-3 2.9.7 4.1L8 11.9 4.4 13.3l.7-4.1-3-2.9 4.1-.6z" />
          </svg>
        </div>
        <span style={{ color: '#9aa0a6', fontSize: 18, letterSpacing: '1px', paddingLeft: 4 }}>⋮</span>
      </div>

      {/* page content */}
      <div style={{ flex: '1 1 auto', minHeight: 0, position: 'relative', background: '#fff' }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Proposal Summary building blocks (proposal-v3-responsive language).  */
/* ------------------------------------------------------------------ */
function HoSectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2)',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <p style={{ fontWeight: 600, fontSize: 16, color: PROP_INK }}>{label}</p>
        <MinusIcon size={16} color={PROP_INK} />
      </div>
      {children}
    </div>
  );
}

function HoCategoryLabel({ name, count }: { name: string; count: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: 48, width: '100%' }}>
      <p style={{ fontWeight: 600, fontSize: 20, color: PROP_INK, whiteSpace: 'nowrap' }}>{name}</p>
      <div style={{ background: '#f0f0f0', width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 300, color: PROP_INK }}>{count}</span>
      </div>
    </div>
  );
}

/** A single upgradeable / plain product line item. The whole row opens the
 *  product (or upgrade) detail sheet, matching the proposal-v3 behavior. */
function HoProductLine({
  name,
  measure,
  hasUpgrade,
  onOpen,
}: {
  name: string;
  measure: string;
  hasUpgrade: boolean;
  onOpen?: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      style={{
        borderTop: '0.5px solid rgba(0,0,0,0.1)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '12px 0',
        width: '100%',
        cursor: onOpen ? 'pointer' : 'default',
      }}
    >
      <HoThumb name={name} size={48} />
      <p style={{ flex: '1 1 0', minWidth: 0, fontSize: 16, color: PROP_INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name}
      </p>
      <div style={{ width: 130, flex: '0 0 auto', display: 'flex', gap: 8, alignItems: 'center', fontSize: 16, color: '#737373', fontWeight: 300 }}>
        <span style={{ whiteSpace: 'nowrap' }}>{measure}</span>
      </div>
      <div style={{ width: 48, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ProductInfo size={16} color={PROP_INK} />
      </div>
      <div style={{ width: 92, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {hasUpgrade && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: PROP_INK, letterSpacing: '-0.64px', whiteSpace: 'nowrap' }}>Change</span>
            <ChevronThin size={16} rotate={270} color="#000000" />
          </span>
        )}
      </div>
    </div>
  );
}

/** An optional add-on line item with a checkbox (proposal Add-ons section). */
function HoAddonLine({
  name,
  measure,
  price,
  selected,
  onToggle,
  onOpen,
}: {
  name: string;
  measure: string;
  price: number;
  selected: boolean;
  onToggle: () => void;
  onOpen?: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: '0 8px',
        height: 80,
        borderRadius: 8,
        border: `1.5px solid ${selected ? PROP_INK : '#d9d9d9'}`,
        width: '100%',
        cursor: 'pointer',
      }}
    >
      <HoThumb name={name} size={48} />
      <p style={{ flex: '1 1 0', minWidth: 0, fontSize: 16, color: PROP_INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name}
      </p>
      <div style={{ width: 130, flex: '0 0 auto', fontSize: 16, color: '#737373', fontWeight: 300, whiteSpace: 'nowrap' }}>{measure}</div>
      <div style={{ width: 96, flex: '0 0 auto', fontSize: 16, color: PROP_INK, fontWeight: 300, whiteSpace: 'nowrap' }}>
        +${price.toLocaleString('en-US')}
      </div>
      <div style={{ width: 48, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ProductInfo size={16} color={PROP_INK} />
      </div>
      <div style={{ width: 64, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}
        >
          <div style={{ position: 'relative', width: 20, height: 20 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 2, background: selected ? PROP_INK : 'transparent', border: selected ? 'none' : '1px solid #000' }} />
            {selected && <CheckMark size={16} color="#fff" style={{ position: 'absolute', inset: 2 }} />}
          </div>
        </button>
      </div>
    </div>
  );
}

type HoUpgradeOption = { id: string; title: string; delta: number };

/* ------------------------------------------------------------------ */
/* Product / Upgrade / Add-on detail sheet — a faithful port of the     */
/* proposal-v3-responsive ProductDetailSheet (desktop layout), but      */
/* bottom-anchored INSIDE the browser page so it stays within the       */
/* simulated browser rather than escaping to the real viewport.        */
/* ------------------------------------------------------------------ */
/** Gray "no image" brand mark (GR Flooring emblem + wordmark). */
function NoImageMark({ width = 175 }: { width?: number }) {
  return (
    <svg width={width} height={(width * 101) / 144} viewBox="0 0 144 101" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M31.7565 0.0289727L103.915 0.0460522C106.578 0.0459864 110.272 -0.0757521 112.868 0.0769025C113.649 0.611926 115.162 2.28252 115.871 3.02367C115.993 4.36231 115.905 7.42074 115.904 8.86661L115.903 62.3999C115.905 64.4769 115.859 66.6581 115.932 68.7223C108.016 61.0002 100.147 52.9297 92.3018 45.1068L77.9402 30.7064C76.1199 28.8716 73.6831 26.6402 72.0239 24.7644L41.9001 54.9602L32.2094 64.6433C30.9327 65.9249 29.3442 67.3953 28.1501 68.7052L28.1376 11.9297C28.136 9.11662 28.0545 5.9106 28.1582 3.12592C28.3003 2.8776 28.6099 2.46082 28.8267 2.26912C29.6733 1.52053 30.5587 0.0674219 31.7565 0.0289727Z" fill="white"/>
      <path d="M30.425 3.96501C30.7236 4.07071 31.9393 5.43094 32.2591 5.75467L51.8966 25.4572C54.5846 28.1539 57.3033 30.9764 60.0421 33.6059L55.5328 38.0892C54.106 39.5809 52.6078 40.9099 51.2383 42.4882C49.5451 40.7051 47.6626 38.8701 45.9198 37.1221L36.2105 27.3831L32.8015 23.974C32.0317 23.2144 30.9851 22.2483 30.3316 21.4186L30.3281 9.89535C30.3264 8.65073 30.2399 5.02464 30.425 3.96501Z" fill="#F3F3F3"/>
      <path d="M94.7433 2.29297C95.3823 2.24701 96.1582 2.248 96.8043 2.26186C101.813 2.3693 106.958 2.07899 111.955 2.31584C111.329 2.90487 110.593 3.726 109.952 4.36497L104.244 10.0785L86.6842 27.7372C85.2977 29.055 83.8002 30.6377 82.4429 32.0134C81.8098 31.5484 80.5245 30.0985 79.897 29.4921C77.7515 27.4192 75.7496 25.2344 73.5765 23.1825C74.1446 22.6833 74.9609 21.8118 75.5153 21.2546L78.939 17.8246L89.2779 7.43944L92.1279 4.59821C92.6501 4.06777 94.0989 2.40581 94.7433 2.29297Z" fill="#F3F3F3"/>
      <path d="M73.8997 2.1959C74.8825 2.3267 77.6132 2.26248 78.7457 2.26214L86.0635 2.25956C87.7384 2.25921 89.5501 2.23152 91.2117 2.33039C90.7518 2.6746 89.3795 4.14998 88.8826 4.64565L83.1341 10.3982C77.4189 16.1562 71.5365 21.9154 65.8938 27.7223L61.5606 32.0706C59.4867 29.694 57.0407 27.5049 54.8536 25.223C54.2123 24.5539 53.4676 23.8273 52.7769 23.2182C57.3608 18.5054 62.1141 13.8315 66.76 9.16936L71.0674 4.82377C71.9123 3.97983 72.9557 2.8743 73.8997 2.1959Z" fill="#F3F3F3"/>
      <path d="M92.8104 24.8708C93.1341 24.9869 111.622 43.6612 113.653 45.6425L113.67 63.2933L88.1354 37.7278C86.8242 36.4002 85.3396 34.8397 83.9634 33.591C84.7119 32.9432 85.5118 32.1066 86.2233 31.3985C87.5503 30.0847 88.8655 28.7593 90.1692 27.4223C90.9596 26.6192 91.9705 25.5734 92.8104 24.8708Z" fill="#F3F3F3"/>
      <path d="M30.3162 24.7572C31.207 25.2914 32.2354 26.536 33.0213 27.3329L36.0446 30.3671L46.2721 40.6092C47.0254 41.3674 48.9322 43.5413 49.6611 43.9457C48.7287 45.1062 46.4591 47.1955 45.2793 48.3742C43.7895 49.8701 42.286 51.3525 40.7693 52.821C37.6839 49.6546 34.3675 46.634 31.327 43.41C30.0996 42.1086 30.2247 39.668 30.2678 37.9652C30.3781 33.6085 30.0877 29.0873 30.3162 24.7572Z" fill="#F3F3F3"/>
      <path d="M52.9319 2.26074L63.9919 2.25359C65.9562 2.2546 68.5088 2.1807 70.4112 2.33875C69.8336 2.79996 69.1083 3.58376 68.5753 4.12401L65.6786 7.04285L55.6416 17.1009C54.2439 18.5132 52.6076 20.2515 51.167 21.5759C49.7951 20.1122 48.3088 18.654 46.8906 17.229C45.4239 15.7552 43.9061 14.1964 42.3831 12.7886C43.5361 11.4657 45.873 9.2372 47.1762 7.95591C48.8791 6.28163 51.1917 3.75441 52.9319 2.26074Z" fill="#F3F3F3"/>
      <path d="M103.254 14.263C106.659 17.9231 110.231 21.29 113.668 24.8636L113.667 36.5446C113.667 38.0723 113.59 41.1326 113.74 42.5607C112.622 41.2814 110.549 39.3637 109.26 38.0659L94.4258 23.1979C94.738 22.9145 95.0627 22.5729 95.3591 22.2707C97.9807 19.5978 100.66 16.9605 103.254 14.263Z" fill="#F3F3F3"/>
      <path d="M30.4424 45.6424C30.9139 46.0702 31.4279 46.7272 31.9234 47.209C34.3593 49.5974 36.7778 52.0039 39.1785 54.4279C37.9351 55.8169 36.0561 57.6189 34.6906 58.9239C33.2476 60.3949 31.8092 61.8012 30.3769 63.2953C30.3972 62.4146 30.3355 61.3237 30.3311 60.4163L30.3225 52.1375C30.3222 49.9571 30.2849 47.8187 30.4424 45.6424Z" fill="#F3F3F3"/>
      <path d="M113.565 4.01664C113.626 4.08638 113.662 19.9383 113.668 21.6018C112.378 20.4558 110.509 18.4548 109.26 17.1982C107.783 15.6993 106.283 14.2234 104.76 12.7712C105.699 11.7448 106.983 10.5842 107.992 9.55397C109.05 8.47898 110.113 7.41028 111.184 6.34788C111.96 5.5663 112.738 4.73626 113.565 4.01664Z" fill="#F3F3F3"/>
      <path d="M35.9694 2.30376C39.3793 2.2387 42.8102 2.29009 46.222 2.26569C47.3527 2.2576 48.5358 2.25336 49.6632 2.32166C48.8847 2.93723 47.7983 4.10279 47.0666 4.8441L43.1282 8.8041C42.3519 9.58962 41.5838 10.3832 40.8239 11.1847C39.8616 10.1348 38.6584 8.97826 37.6453 7.96212L32.0098 2.31725C33.2758 2.36447 34.6919 2.31951 35.9694 2.30376Z" fill="#F3F3F3"/>
      <path d="M73.5514 58.1534C76.0913 58.1108 78.7122 58.1493 81.2602 58.1397C81.2515 59.0138 81.303 65.6251 81.1687 65.8678C78.7051 65.7972 76.0626 65.8535 73.586 65.8704C73.4685 63.428 73.6551 60.6634 73.5514 58.1534Z" fill="white"/>
      <path d="M62.7784 58.1463C65.3207 58.1018 67.8942 58.1861 70.4462 58.1405C70.4591 60.7166 70.4579 63.2928 70.4427 65.869C67.8908 65.8462 65.3388 65.847 62.7869 65.8714C62.7496 63.3244 62.7912 60.7036 62.7784 58.1463Z" fill="white"/>
      <path d="M62.8322 47.5492C63.5633 47.5928 64.6567 47.5551 65.4329 47.555L70.4609 47.5668C70.4193 50.0952 70.4508 52.7256 70.4464 55.2614L62.7908 55.2745L62.7749 50.1227C62.7737 49.6366 62.7387 47.923 62.8322 47.5492Z" fill="white"/>
      <path d="M73.5806 47.5536L81.2618 47.5526C81.2203 50.0968 81.2511 52.7113 81.2318 55.266L73.5854 55.26C73.5684 52.6912 73.5668 50.1224 73.5806 47.5536Z" fill="white"/>
      <path d="M138.055 100.882C136.798 100.882 135.67 100.701 134.673 100.338C133.69 99.9613 132.851 99.4537 132.158 98.8157C131.478 98.1631 130.958 97.4163 130.596 96.5752C130.249 95.7341 130.076 94.8277 130.076 93.8561C130.076 92.7975 130.286 91.8404 130.705 90.9848C131.124 90.1147 131.709 89.3679 132.461 88.7443C133.213 88.1208 134.095 87.6422 135.106 87.3087C136.118 86.9607 137.224 86.7866 138.424 86.7866C139.132 86.7866 139.826 86.8446 140.505 86.9607C141.199 87.0767 141.763 87.2434 142.197 87.461C142.341 87.519 142.421 87.5697 142.435 87.6132C142.464 87.6422 142.486 87.7582 142.5 87.9613L142.782 90.8108C142.782 90.8543 142.746 90.8833 142.674 90.8978C142.601 90.9123 142.551 90.8978 142.522 90.8543C142.406 90.4918 142.218 90.1002 141.958 89.6797C141.712 89.2592 141.394 88.8676 141.004 88.5051C140.614 88.128 140.144 87.8162 139.595 87.5697C139.06 87.3232 138.438 87.1999 137.73 87.1999C136.733 87.1999 135.829 87.4537 135.02 87.9613C134.21 88.4688 133.567 89.1866 133.09 90.1147C132.613 91.0428 132.374 92.1522 132.374 93.4428C132.374 94.4435 132.519 95.3716 132.808 96.2272C133.097 97.0682 133.509 97.8151 134.044 98.4676C134.593 99.1202 135.251 99.6278 136.017 99.9903C136.783 100.353 137.643 100.534 138.597 100.534C139.19 100.534 139.667 100.462 140.028 100.317C140.39 100.172 140.65 99.9105 140.809 99.5335C140.968 99.142 141.048 98.5909 141.048 97.8803C141.048 97.1843 141.004 96.6767 140.917 96.3577C140.845 96.0241 140.65 95.8066 140.332 95.7051C140.014 95.6036 139.501 95.5528 138.793 95.5528C138.706 95.5528 138.662 95.4948 138.662 95.3788C138.662 95.2628 138.699 95.2048 138.771 95.2048C139.754 95.2628 140.636 95.299 141.416 95.3135C142.211 95.3135 143.042 95.2918 143.91 95.2483C143.967 95.2483 143.996 95.2991 143.996 95.4006C144.011 95.5021 143.982 95.5528 143.91 95.5528C143.635 95.5383 143.433 95.5891 143.303 95.7051C143.172 95.8066 143.086 96.0386 143.042 96.4012C143.013 96.7637 142.999 97.3293 142.999 98.0978C142.999 98.5764 143.013 98.9317 143.042 99.1637C143.071 99.3957 143.093 99.5698 143.107 99.6858C143.136 99.7873 143.151 99.896 143.151 100.012C143.151 100.099 143.136 100.157 143.107 100.186C143.078 100.215 143.013 100.244 142.912 100.273C142.146 100.447 141.337 100.592 140.484 100.708C139.631 100.824 138.821 100.882 138.055 100.882Z" fill="white"/>
      <path d="M115.844 97.9873V87.5244L116.429 87.5679V97.9873C116.429 98.7559 116.581 99.3432 116.884 99.7492C117.188 100.155 117.622 100.358 118.185 100.358C118.229 100.358 118.25 100.402 118.25 100.489C118.25 100.576 118.229 100.619 118.185 100.619C117.882 100.619 117.564 100.612 117.231 100.598C116.913 100.583 116.559 100.576 116.169 100.576C115.75 100.576 115.345 100.583 114.955 100.598C114.579 100.612 114.225 100.619 113.892 100.619C113.849 100.619 113.827 100.576 113.827 100.489C113.827 100.402 113.849 100.358 113.892 100.358C114.528 100.358 115.012 100.155 115.345 99.7492C115.677 99.3432 115.844 98.7559 115.844 97.9873ZM126.859 100.924C126.859 100.967 126.822 100.989 126.75 100.989C126.678 101.004 126.627 101.004 126.598 100.989L116.169 88.8078C115.649 88.2133 115.2 87.8145 114.825 87.6114C114.463 87.3939 114.109 87.2852 113.762 87.2852C113.719 87.2852 113.697 87.2416 113.697 87.1546C113.697 87.0676 113.719 87.0241 113.762 87.0241C114.037 87.0241 114.319 87.0314 114.608 87.0459C114.897 87.0604 115.164 87.0676 115.41 87.0676C115.844 87.0676 116.234 87.0604 116.581 87.0459C116.942 87.0314 117.217 87.0241 117.405 87.0241C117.593 87.0241 117.73 87.1111 117.817 87.2852C117.904 87.4447 118.12 87.7347 118.467 88.1552L126.685 97.8568L126.859 100.924ZM126.859 89.6779V100.924L126.273 100.271V89.6779C126.273 88.9093 126.121 88.322 125.818 87.916C125.529 87.4954 125.095 87.2852 124.517 87.2852C124.488 87.2852 124.473 87.2416 124.473 87.1546C124.473 87.0676 124.488 87.0241 124.517 87.0241C124.82 87.0241 125.138 87.0386 125.471 87.0676C125.803 87.0821 126.165 87.0894 126.555 87.0894C126.931 87.0894 127.299 87.0821 127.661 87.0676C128.022 87.0386 128.355 87.0241 128.658 87.0241C128.702 87.0241 128.723 87.0676 128.723 87.1546C128.723 87.2416 128.702 87.2852 128.658 87.2852C128.08 87.2852 127.632 87.4954 127.314 87.916C127.01 88.322 126.859 88.9093 126.859 89.6779Z" fill="white"/>
      <path d="M110.49 98.8574C110.49 99.2779 110.526 99.597 110.599 99.8145C110.685 100.032 110.844 100.177 111.076 100.25C111.307 100.322 111.661 100.358 112.138 100.358C112.182 100.358 112.203 100.402 112.203 100.489C112.203 100.576 112.182 100.619 112.138 100.619C111.777 100.619 111.372 100.612 110.924 100.598C110.476 100.583 109.977 100.576 109.428 100.576C108.922 100.576 108.438 100.583 107.975 100.598C107.512 100.612 107.101 100.619 106.739 100.619C106.696 100.619 106.674 100.576 106.674 100.489C106.674 100.402 106.696 100.358 106.739 100.358C107.202 100.358 107.556 100.322 107.802 100.25C108.047 100.177 108.206 100.032 108.279 99.8145C108.365 99.597 108.409 99.2779 108.409 98.8574V88.7861C108.409 88.3655 108.365 88.0537 108.279 87.8507C108.206 87.6332 108.047 87.4882 107.802 87.4157C107.556 87.3287 107.202 87.2852 106.739 87.2852C106.696 87.2852 106.674 87.2416 106.674 87.1546C106.674 87.0676 106.696 87.0241 106.739 87.0241C107.101 87.0241 107.512 87.0386 107.975 87.0676C108.438 87.0821 108.922 87.0894 109.428 87.0894C109.977 87.0894 110.476 87.0821 110.924 87.0676C111.386 87.0386 111.791 87.0241 112.138 87.0241C112.182 87.0241 112.203 87.0676 112.203 87.1546C112.203 87.2416 112.182 87.2852 112.138 87.2852C111.676 87.2852 111.321 87.3287 111.076 87.4157C110.844 87.5027 110.685 87.6549 110.599 87.8725C110.526 88.09 110.49 88.409 110.49 88.8296V98.8574Z" fill="white"/>
      <path d="M102.501 100.619C102.284 100.619 101.923 100.344 101.417 99.7926C100.911 99.2415 100.297 98.4512 99.5738 97.4216C98.8655 96.3775 98.0704 95.1376 97.1887 93.7019L98.9233 93.1799C100.094 94.9346 101.092 96.3412 101.916 97.3998C102.754 98.444 103.491 99.198 104.127 99.6621C104.778 100.126 105.399 100.358 105.992 100.358C106.021 100.358 106.035 100.402 106.035 100.489C106.035 100.576 106.021 100.619 105.992 100.619C105.081 100.619 104.337 100.619 103.759 100.619C103.195 100.619 102.776 100.619 102.501 100.619ZM97.5789 86.9587C98.8365 86.9587 99.8051 87.2125 100.484 87.7201C101.178 88.2131 101.525 88.8947 101.525 89.7648C101.525 90.5914 101.287 91.3309 100.81 91.9835C100.347 92.6361 99.74 93.1436 98.9883 93.5062C98.2511 93.8687 97.4561 94.05 96.6032 94.05C96.4297 94.05 96.2418 94.05 96.0395 94.05C95.8371 94.0355 95.6564 94.021 95.4974 94.0065V98.8573C95.4974 99.2778 95.5335 99.5968 95.6058 99.8144C95.6781 100.032 95.8299 100.177 96.0611 100.249C96.3069 100.322 96.661 100.358 97.1236 100.358C97.167 100.358 97.1887 100.402 97.1887 100.489C97.1887 100.576 97.167 100.619 97.1236 100.619C96.7622 100.619 96.3575 100.612 95.9094 100.597C95.4613 100.583 94.9698 100.576 94.4349 100.576C93.929 100.576 93.4447 100.583 92.9822 100.597C92.5196 100.612 92.1076 100.619 91.7462 100.619C91.7029 100.619 91.6812 100.576 91.6812 100.489C91.6812 100.402 91.7029 100.358 91.7462 100.358C92.2233 100.358 92.5774 100.322 92.8087 100.249C93.04 100.177 93.199 100.032 93.2857 99.8144C93.3725 99.5968 93.4158 99.2778 93.4158 98.8573V88.7859C93.4158 88.3654 93.3725 88.0536 93.2857 87.8506C93.2135 87.633 93.0617 87.488 92.8304 87.4155C92.5991 87.3285 92.245 87.285 91.7679 87.285C91.739 87.285 91.7246 87.2415 91.7246 87.1545C91.7246 87.0675 91.739 87.024 91.7679 87.024C92.1293 87.024 92.5341 87.0385 92.9822 87.0675C93.4447 87.082 93.929 87.0892 94.4349 87.0892C94.8975 87.0892 95.4179 87.0675 95.9961 87.024C96.5743 86.9805 97.1019 86.9587 97.5789 86.9587ZM99.3786 90.5261C99.3786 89.685 99.2774 89.0397 99.0751 88.5902C98.8871 88.1261 98.6197 87.8071 98.2728 87.6331C97.9259 87.459 97.5211 87.372 97.0586 87.372C96.4948 87.372 96.0901 87.4808 95.8443 87.6983C95.613 87.9013 95.4974 88.2784 95.4974 88.8294V93.4192C95.6998 93.4482 95.9166 93.4699 96.1479 93.4844C96.3792 93.4989 96.5815 93.5062 96.755 93.5062C97.7235 93.5062 98.4029 93.2669 98.7932 92.7884C99.1835 92.2953 99.3786 91.5412 99.3786 90.5261Z" fill="white"/>
      <path d="M82.1706 100.882C81.1298 100.882 80.183 100.701 79.3301 100.338C78.4917 99.9613 77.769 99.4465 77.1618 98.7939C76.5692 98.1414 76.1066 97.3945 75.7741 96.5534C75.4561 95.6978 75.2971 94.7915 75.2971 93.8344C75.2971 92.6598 75.5212 91.6302 75.9693 90.7456C76.4319 89.861 77.039 89.1286 77.7907 88.5486C78.5423 87.954 79.3663 87.5117 80.2625 87.2217C81.1587 86.9317 82.0477 86.7866 82.9295 86.7866C83.9992 86.7866 84.9532 86.9824 85.7916 87.374C86.6445 87.751 87.3672 88.2658 87.9599 88.9184C88.5526 89.5709 89.0007 90.3105 89.3043 91.1371C89.6223 91.9637 89.7813 92.812 89.7813 93.6821C89.7813 94.6972 89.5789 95.6398 89.1742 96.5099C88.7694 97.38 88.2129 98.1414 87.5046 98.7939C86.8107 99.4465 86.0012 99.9613 85.0761 100.338C84.1654 100.701 83.1969 100.882 82.1706 100.882ZM82.9078 100.36C83.7751 100.36 84.5485 100.128 85.2279 99.664C85.9217 99.2 86.4638 98.5184 86.8541 97.6193C87.2588 96.7057 87.4612 95.6036 87.4612 94.3129C87.4612 92.9643 87.2444 91.7679 86.8107 90.7238C86.3771 89.6797 85.7555 88.8604 84.946 88.2658C84.1365 87.6567 83.168 87.3522 82.0405 87.3522C80.6383 87.3522 79.547 87.8598 78.7664 88.8749C78.0003 89.8755 77.6172 91.2676 77.6172 93.0513C77.6172 94.0954 77.7473 95.067 78.0075 95.9661C78.2677 96.8507 78.6291 97.6266 79.0916 98.2936C79.5686 98.9607 80.1252 99.4755 80.7612 99.838C81.4117 100.186 82.1272 100.36 82.9078 100.36Z" fill="white"/>
      <path d="M65.5704 100.882C64.5296 100.882 63.5828 100.701 62.7299 100.338C61.8915 99.9613 61.1687 99.4465 60.5616 98.7939C59.969 98.1414 59.5064 97.3945 59.1739 96.5534C58.8559 95.6978 58.6969 94.7915 58.6969 93.8344C58.6969 92.6598 58.921 91.6302 59.3691 90.7456C59.8316 89.861 60.4388 89.1286 61.1904 88.5486C61.9421 87.954 62.7661 87.5117 63.6623 87.2217C64.5585 86.9317 65.4475 86.7866 66.3293 86.7866C67.399 86.7866 68.353 86.9824 69.1914 87.374C70.0443 87.751 70.767 88.2658 71.3597 88.9184C71.9524 89.5709 72.4005 90.3105 72.704 91.1371C73.022 91.9637 73.1811 92.812 73.1811 93.6821C73.1811 94.6972 72.9787 95.6398 72.5739 96.5099C72.1692 97.38 71.6127 98.1414 70.9044 98.7939C70.2105 99.4465 69.401 99.9613 68.4759 100.338C67.5652 100.701 66.5967 100.882 65.5704 100.882ZM66.3076 100.36C67.1749 100.36 67.9483 100.128 68.6277 99.664C69.3215 99.2 69.8636 98.5184 70.2539 97.6193C70.6586 96.7057 70.861 95.6036 70.861 94.3129C70.861 92.9643 70.6442 91.7679 70.2105 90.7238C69.7768 89.6797 69.1553 88.8604 68.3458 88.2658C67.5363 87.6567 66.5678 87.3522 65.4403 87.3522C64.0381 87.3522 62.9467 87.8598 62.1662 88.8749C61.4 89.8755 61.017 91.2676 61.017 93.0513C61.017 94.0954 61.1471 95.067 61.4073 95.9661C61.6675 96.8507 62.0288 97.6266 62.4914 98.2936C62.9684 98.9607 63.525 99.4755 64.161 99.838C64.8115 100.186 65.527 100.36 66.3076 100.36Z" fill="white"/>
      <path d="M50.3062 88.8078V98.7704C50.3062 99.1329 50.3424 99.4085 50.4146 99.597C50.4869 99.7855 50.6242 99.9088 50.8266 99.9668C51.029 100.025 51.3253 100.054 51.7156 100.054H53.0166C54.0429 100.054 54.9102 99.7637 55.6185 99.1837C56.3268 98.6036 56.7966 97.835 57.0279 96.8779C57.0424 96.8344 57.0857 96.8199 57.158 96.8344C57.2303 96.8489 57.2664 96.8779 57.2664 96.9214C57.2231 97.371 57.1797 97.9148 57.1363 98.5529C57.093 99.1764 57.0713 99.7565 57.0713 100.293C57.0713 100.511 56.9629 100.619 56.746 100.619H46.5984C46.5695 100.619 46.5551 100.576 46.5551 100.489C46.5551 100.402 46.5695 100.358 46.5984 100.358C47.061 100.358 47.4079 100.322 47.6392 100.25C47.885 100.177 48.044 100.032 48.1162 99.8145C48.203 99.597 48.2463 99.2779 48.2463 98.8574V88.7861C48.2463 88.3655 48.203 88.0537 48.1162 87.8507C48.044 87.6332 47.885 87.4882 47.6392 87.4157C47.4079 87.3287 47.061 87.2852 46.5984 87.2852C46.5695 87.2852 46.5551 87.2416 46.5551 87.1546C46.5551 87.0676 46.5695 87.0241 46.5984 87.0241C46.9454 87.0241 47.3501 87.0386 47.8127 87.0676C48.2753 87.0821 48.7595 87.0894 49.2654 87.0894C49.8003 87.0894 50.2918 87.0821 50.7399 87.0676C51.2024 87.0386 51.6072 87.0241 51.9541 87.0241C51.9975 87.0241 52.0192 87.0676 52.0192 87.1546C52.0192 87.2416 51.9975 87.2852 51.9541 87.2852C51.4915 87.2852 51.1374 87.3287 50.8917 87.4157C50.6604 87.4882 50.5014 87.6332 50.4146 87.8507C50.3424 88.0682 50.3062 88.3873 50.3062 88.8078Z" fill="white"/>
      <path d="M35.4835 100.619C35.4402 100.619 35.4185 100.576 35.4185 100.489C35.4185 100.402 35.4402 100.358 35.4835 100.358C35.9895 100.358 36.3653 100.322 36.6111 100.25C36.8568 100.177 37.023 100.032 37.1098 99.8145C37.1965 99.597 37.2399 99.2779 37.2399 98.8574V88.7861C37.2399 88.3655 37.1965 88.0537 37.1098 87.8507C37.0375 87.6332 36.8857 87.4882 36.6544 87.4157C36.4231 87.3287 36.069 87.2852 35.592 87.2852C35.5486 87.2852 35.5269 87.2416 35.5269 87.1546C35.5269 87.0676 35.5486 87.0241 35.592 87.0241H44.612C44.7566 87.0241 44.8289 87.0894 44.8289 87.2199L44.8722 90.0477C44.8722 90.0767 44.8361 90.0985 44.7638 90.113C44.6915 90.113 44.6409 90.0912 44.612 90.0477C44.453 89.2211 44.1206 88.6048 43.6146 88.1988C43.1087 87.7927 42.4438 87.5897 41.6198 87.5897H40.7308C40.196 87.5897 39.8201 87.6839 39.6033 87.8725C39.4009 88.061 39.2997 88.3728 39.2997 88.8078V98.7704C39.2997 99.2054 39.3576 99.539 39.4732 99.771C39.5888 99.9885 39.8201 100.141 40.1671 100.228C40.514 100.315 41.0344 100.358 41.7282 100.358C41.7571 100.358 41.7716 100.402 41.7716 100.489C41.7716 100.576 41.7571 100.619 41.7282 100.619C41.2367 100.619 40.7091 100.612 40.1454 100.598C39.5816 100.583 38.9384 100.576 38.2156 100.576C37.7097 100.576 37.2182 100.583 36.7412 100.598C36.2641 100.612 35.8449 100.619 35.4835 100.619ZM43.5279 95.9426C43.5279 95.348 43.3183 94.8912 42.8991 94.5722C42.4943 94.2532 41.8728 94.0936 41.0344 94.0936H38.324V93.5281H41.0777C41.9017 93.5281 42.5088 93.3903 42.8991 93.1148C43.3038 92.8247 43.5062 92.4187 43.5062 91.8966C43.5062 91.8676 43.5496 91.8531 43.6363 91.8531C43.723 91.8531 43.7664 91.8676 43.7664 91.8966C43.7664 92.3752 43.7592 92.745 43.7447 93.006C43.7447 93.267 43.7447 93.5353 43.7447 93.8108C43.7447 94.1589 43.752 94.5069 43.7664 94.855C43.7809 95.1885 43.7881 95.551 43.7881 95.9426C43.7881 95.9861 43.7447 96.0078 43.658 96.0078C43.5713 96.0078 43.5279 95.9861 43.5279 95.9426Z" fill="white"/>
      <path d="M26.3152 100.619C26.0984 100.619 25.737 100.344 25.2311 99.7926C24.7252 99.2415 24.1108 98.4512 23.3881 97.4216C22.6797 96.3775 21.8847 95.1376 21.0029 93.7019L22.7376 93.1799C23.9084 94.9346 24.9059 96.3412 25.7298 97.3998C26.5682 98.444 27.3054 99.198 27.9415 99.6621C28.5919 100.126 29.2135 100.358 29.8062 100.358C29.8351 100.358 29.8495 100.402 29.8495 100.489C29.8495 100.576 29.8351 100.619 29.8062 100.619C28.8955 100.619 28.1511 100.619 27.5728 100.619C27.0091 100.619 26.5899 100.619 26.3152 100.619ZM21.3932 86.9587C22.6508 86.9587 23.6193 87.2125 24.2987 87.7201C24.9926 88.2131 25.3395 88.8947 25.3395 89.7648C25.3395 90.5914 25.101 91.3309 24.624 91.9835C24.1614 92.6361 23.5543 93.1436 22.8026 93.5062C22.0654 93.8687 21.2704 94.05 20.4175 94.05C20.244 94.05 20.0561 94.05 19.8537 94.05C19.6514 94.0355 19.4707 94.021 19.3117 94.0065V98.8573C19.3117 99.2778 19.3478 99.5968 19.4201 99.8144C19.4924 100.032 19.6441 100.177 19.8754 100.249C20.1212 100.322 20.4753 100.358 20.9379 100.358C20.9813 100.358 21.0029 100.402 21.0029 100.489C21.0029 100.576 20.9813 100.619 20.9379 100.619C20.5765 100.619 20.1718 100.612 19.7236 100.597C19.2755 100.583 18.7841 100.576 18.2492 100.576C17.7433 100.576 17.259 100.583 16.7965 100.597C16.3339 100.612 15.9219 100.619 15.5605 100.619C15.5172 100.619 15.4955 100.576 15.4955 100.489C15.4955 100.402 15.5172 100.358 15.5605 100.358C16.0376 100.358 16.3917 100.322 16.623 100.249C16.8543 100.177 17.0133 100.032 17.1 99.8144C17.1868 99.5968 17.2301 99.2778 17.2301 98.8573V88.7859C17.2301 88.3654 17.1868 88.0536 17.1 87.8506C17.0277 87.633 16.876 87.488 16.6447 87.4155C16.4134 87.3285 16.0592 87.285 15.5822 87.285C15.5533 87.285 15.5389 87.2415 15.5389 87.1545C15.5389 87.0675 15.5533 87.024 15.5822 87.024C15.9436 87.024 16.3483 87.0385 16.7965 87.0675C17.259 87.082 17.7433 87.0892 18.2492 87.0892C18.7118 87.0892 19.2322 87.0675 19.8104 87.024C20.3886 86.9805 20.9162 86.9587 21.3932 86.9587ZM23.1929 90.5261C23.1929 89.685 23.0917 89.0397 22.8893 88.5902C22.7014 88.1261 22.434 87.8071 22.0871 87.6331C21.7402 87.459 21.3354 87.372 20.8728 87.372C20.3091 87.372 19.9043 87.4808 19.6586 87.6983C19.4273 87.9013 19.3117 88.2784 19.3117 88.8294V93.4192C19.514 93.4482 19.7309 93.4699 19.9622 93.4844C20.1934 93.4989 20.3958 93.5062 20.5693 93.5062C21.5378 93.5062 22.2172 93.2669 22.6075 92.7884C22.9978 92.2953 23.1929 91.5412 23.1929 90.5261Z" fill="white"/>
      <path d="M7.9793 100.882C6.72169 100.882 5.59418 100.701 4.59677 100.338C3.61381 99.9613 2.77541 99.4537 2.08156 98.8157C1.40216 98.1631 0.88177 97.4163 0.520389 96.5752C0.173463 95.7341 0 94.8277 0 93.8561C0 92.7975 0.209601 91.8404 0.628803 90.9848C1.04801 90.1147 1.63344 89.3679 2.38512 88.7443C3.13679 88.1208 4.01856 87.6422 5.03043 87.3087C6.04229 86.9607 7.14812 86.7866 8.34791 86.7866C9.05621 86.7866 9.75006 86.8446 10.4295 86.9607C11.1233 87.0767 11.6871 87.2434 12.1207 87.461C12.2653 87.519 12.3448 87.5697 12.3592 87.6132C12.3881 87.6422 12.4098 87.7582 12.4243 87.9613L12.7062 90.8108C12.7062 90.8543 12.67 90.8833 12.5977 90.8978C12.5255 90.9123 12.4749 90.8978 12.446 90.8543C12.3303 90.4918 12.1424 90.1002 11.8822 89.6797C11.6365 89.2592 11.3185 88.8676 10.9282 88.5051C10.5379 88.128 10.0681 87.8162 9.51878 87.5697C8.98394 87.3232 8.36236 87.1999 7.65405 87.1999C6.65664 87.1999 5.75319 87.4537 4.94369 87.9613C4.1342 88.4688 3.49094 89.1866 3.01392 90.1147C2.5369 91.0428 2.29838 92.1522 2.29838 93.4428C2.29838 94.4435 2.44294 95.3716 2.73204 96.2272C3.02115 97.0682 3.43312 97.8151 3.96797 98.4676C4.51726 99.1202 5.17498 99.6278 5.94111 99.9903C6.70723 100.353 7.56732 100.534 8.52137 100.534C9.11403 100.534 9.59106 100.462 9.95244 100.317C10.3138 100.172 10.574 99.9105 10.733 99.5335C10.892 99.142 10.9715 98.5909 10.9715 97.8803C10.9715 97.1843 10.9282 96.6767 10.8414 96.3577C10.7692 96.0241 10.574 95.8066 10.256 95.7051C9.93798 95.6036 9.42482 95.5528 8.71651 95.5528C8.62978 95.5528 8.58642 95.4948 8.58642 95.3788C8.58642 95.2628 8.62256 95.2048 8.69483 95.2048C9.67779 95.2628 10.5596 95.299 11.3401 95.3135C12.1352 95.3135 12.9664 95.2918 13.8337 95.2483C13.8915 95.2483 13.9204 95.2991 13.9204 95.4006C13.9349 95.5021 13.9059 95.5528 13.8337 95.5528C13.559 95.5383 13.3566 95.5891 13.2266 95.7051C13.0965 95.8066 13.0097 96.0386 12.9664 96.4012C12.9374 96.7637 12.923 97.3293 12.923 98.0978C12.923 98.5764 12.9374 98.9317 12.9664 99.1637C12.9953 99.3957 13.0169 99.5698 13.0314 99.6858C13.0603 99.7873 13.0748 99.896 13.0748 100.012C13.0748 100.099 13.0603 100.157 13.0314 100.186C13.0025 100.215 12.9374 100.244 12.8363 100.273C12.0701 100.447 11.2606 100.592 10.4078 100.708C9.55492 100.824 8.74543 100.882 7.9793 100.882Z" fill="white"/>
    </svg>
  );
}

/** Line-item "no image" thumbnail — gray box + brand mark. */
function HoNoImageThumb({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center bg-black/10 rounded-[4px] shrink-0 overflow-hidden" style={{ width: size, height: size }}>
      <NoImageMark width={Math.round(size * 0.528)} />
    </div>
  );
}

const fmtDelta = (n: number) => {
  if (n === 0) return '+$0';
  return `${n > 0 ? '+' : '-'}$${Math.abs(n).toLocaleString('en-US')}`;
};
const fmtOptionPrice = (n: number) => `${n === 0 ? 'Standard Option' : 'Upgrade'} ${fmtDelta(n)}`;

/** Fabricated marketing copy for a product / option / fee, keyed by name. */
function describe(name: string): string {
  if (/Herringbone/.test(name))
    return 'Solid white-oak planks laid in a classic herringbone pattern. The angled layout adds visual movement and a high-end, custom look — installation is more labor-intensive, which is reflected in the upgrade price.';
  if (/Walnut/.test(name))
    return 'Wide 7-inch American black walnut planks in a straight lay. A rich, dark hardwood with dramatic grain — the premium tier for a warm, luxurious finish underfoot.';
  if (/Oakwood|Staggered/.test(name))
    return 'Engineered white-oak flooring in a 5-inch width, installed in a staggered plank pattern over a prepared subfloor. A durable, timeless finish that suits most rooms.';
  if (/Acoustic Underlayment \| Premium/.test(name))
    return 'A high-density acoustic underlayment that significantly reduces impact and airborne sound transfer between floors. Recommended for bedrooms and second-storey rooms where quiet matters.';
  if (/Acoustic Underlayment/.test(name))
    return 'A standard foam acoustic underlayment that adds a modest sound-dampening layer and a little extra cushioning underfoot beneath the finished floor.';
  if (/Inspection/.test(name))
    return 'A required on-site visit where our installer verifies measurements, subfloor condition, and moisture levels before materials are ordered. Billed once per project.';
  if (/Permit/.test(name))
    return 'Preparation, filing, and processing of any local permits required for the flooring work. Covers municipal fees and coordination on your behalf.';
  if (/Furniture|Prep/.test(name))
    return 'Moving furniture out of and back into the work area, plus prepping and leveling the existing subfloor so the new flooring sits flat and lasts.';
  if (/Extended Warranty - 5/.test(name))
    return 'A 5-year extended protection plan covering material defects and installation-related issues, including labor for any qualifying repairs. Our most comprehensive coverage for long-term peace of mind.';
  if (/Extended Warranty - 3/.test(name))
    return 'A 3-year extended protection plan covering material defects and installation workmanship. Repairs and replacements for covered issues are handled at no additional cost.';
  return 'A quality component included in this proposal. Detailed specifications and product imagery for this line item will appear here.';
}

/** 3:2 "no product image" placeholder (light gray + centered logo). */
function HoHeroPlaceholder() {
  return (
    <div className="bg-black/10 flex flex-col items-center justify-center w-full rounded-[8px]" style={{ aspectRatio: '3 / 2' }}>
      <NoImageMark width={136} />
      <p className="text-center text-white" style={{ fontFamily: PROP_FONT, fontSize: 16, marginTop: 12 }}>No product image</p>
    </div>
  );
}

/* Real product photography, keyed off the product name. Files live in
   /public/images/configurator-prototype. Missing files fall back to the
   "no product image" placeholder via each renderer's onError handler. */
const PROD_IMG_BASE = '/images/configurator-prototype';
function productImage(name: string): string | undefined {
  if (/Herringbone/.test(name)) return `${PROD_IMG_BASE}/oak-herringbone-1.png`;
  if (/Walnut/.test(name)) return `${PROD_IMG_BASE}/walnut-straight-1.png`;
  if (/Oakwood|Staggered/.test(name)) return `${PROD_IMG_BASE}/oak-staggered-1.png`;
  if (/Acoustic Underlayment \| Premium/.test(name)) return `${PROD_IMG_BASE}/AU-Premium.png`;
  if (/Acoustic Underlayment/.test(name)) return `${PROD_IMG_BASE}/AU-Standard.png`;
  return undefined;
}

/** Line-item thumbnail: the product photo (cover) or the no-image placeholder. */
function HoThumb({ name, size = 48 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const img = productImage(name);
  if (!img || err) return <HoNoImageThumb size={size} />;
  return (
    <div style={{ width: size, height: size, flex: '0 0 auto', borderRadius: 4, overflow: 'hidden', background: 'rgba(0,0,0,0.06)' }}>
      <img src={img} alt="" onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  );
}

/** Upgrade swatch image (cover) with fallback to the no-image logo. */
function HoSwatchImg({ thumb }: { thumb?: string }) {
  const [err, setErr] = useState(false);
  if (!thumb || err) return <NoImageMark width={32} />;
  return <img src={thumb} alt="" onError={() => setErr(true)} className="w-full h-full object-cover" />;
}

/** 3:2 hero image (cover) with fallback to the no-image placeholder. */
function HoHero({ image }: { image?: string }) {
  const [err, setErr] = useState(false);
  if (!image || err) return <HoHeroPlaceholder />;
  return (
    <div className="w-full overflow-hidden rounded-[8px] bg-[#f0f0f0]" style={{ aspectRatio: '3 / 2' }}>
      <img src={image} alt="" onError={() => setErr(true)} className="w-full h-full object-cover" />
    </div>
  );
}

function HoProductBody({ content }: { content: Extract<ProductDetailContent, { kind: 'product' }> }) {
  return (
    <div className="flex gap-8 px-12 py-12 w-full items-start">
      <div className="flex-[8] min-w-0"><HoHero image={content.images?.[0]} /></div>
      <div className="flex-[4] min-w-0 flex flex-col gap-6 self-stretch">
        <div className="flex flex-col gap-4 w-full">
          <p className="text-[20px] font-semibold text-[#262626]" style={{ letterSpacing: '-0.8px' }}>{content.category}</p>
          <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>{content.qtyLabel}</p>
          <p className="text-[16px] text-[#262626] font-light whitespace-pre-line">{content.description}</p>
        </div>
        <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>
          {content.includedLabel ?? 'Included in this proposal'}
        </p>
      </div>
    </div>
  );
}

function HoUpgradeBody({ content }: { content: Extract<ProductDetailContent, { kind: 'upgrade' }> }) {
  const { category, qtyLabel, options, currentOptionId, onSelect } = content;
  const [activeId, setActiveId] = useState(currentOptionId);
  useEffect(() => { setActiveId(currentOptionId); }, [currentOptionId]);
  const active = options.find((o) => o.id === activeId) ?? options[0];
  return (
    <div className="flex gap-8 px-12 py-12 w-full items-start">
      <div className="flex-[8] min-w-0"><HoHero image={active.images?.[0] ?? active.thumb} /></div>
      <div className="flex-[4] min-w-0 flex flex-col gap-8 self-stretch">
        <div className="flex flex-col gap-3 pb-6" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-[#262626]">{category}</p>
            <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>{qtyLabel}</p>
          </div>
          <div className="flex gap-[10px] items-center">
            {options.map((opt) => {
              const selected = opt.id === activeId;
              const committed = opt.id === currentOptionId;
              return (
                <button
                  key={opt.id}
                  onClick={() => { setActiveId(opt.id); if (opt.id !== currentOptionId) onSelect(opt.id); }}
                  className="shrink-0 cursor-pointer relative"
                  style={{ width: 64, height: 64, borderRadius: 4, padding: 2, border: selected ? '1.5px solid #000' : '1.5px solid rgba(0,0,0,0.1)', background: 'transparent' }}
                >
                  <div className="w-full h-full overflow-hidden rounded-[2px] bg-black/10 flex items-center justify-center">
                    <HoSwatchImg thumb={opt.thumb} />
                  </div>
                  {committed && (
                    <div className="absolute" style={{ left: 5, bottom: 5 }}>
                      <SheetCheckbox checked={true} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>{fmtOptionPrice(active.priceDelta)}</p>
        </div>
        <div className="grid grid-cols-1">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="flex flex-col gap-4"
              style={{ gridArea: '1 / 1', visibility: opt.id === activeId ? 'visible' : 'hidden' }}
              aria-hidden={opt.id !== activeId}
            >
              <p className="text-[20px] font-semibold text-[#262626]" style={{ letterSpacing: '-0.04em' }}>{opt.title}</p>
              <p className="text-[16px] text-[#262626] font-light">{opt.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HoAddonBody({ content }: { content: Extract<ProductDetailContent, { kind: 'addon' }> }) {
  const { name, qtyLabel, description, priceDelta, selected, onToggle, images } = content;
  return (
    <div className="flex gap-8 px-12 py-12 w-full items-start">
      <div className="flex-[8] min-w-0"><HoHero image={images?.[0]} /></div>
      <div className="flex-[4] min-w-0 flex flex-col gap-6 self-stretch">
        <div className="flex flex-col gap-1">
          <p className="text-[16px] font-semibold text-[#262626]">Add-on</p>
          <p className="text-[20px] font-semibold text-[#262626]" style={{ letterSpacing: '-0.8px' }}>{name}</p>
          <p className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>{qtyLabel}</p>
        </div>
        <button onClick={onToggle} className="flex items-center gap-3 w-full bg-transparent border-0 p-0 cursor-pointer">
          <SheetCheckbox checked={selected} />
          <span className="text-[16px] text-[#262626]">{selected ? 'Added' : 'Add to Selection'}</span>
          <span className="text-[16px] text-[#bfbfbf]">|</span>
          <span className="text-[16px] text-[#737373]" style={{ letterSpacing: '-0.64px' }}>{fmtDelta(priceDelta)}</span>
        </button>
        <p className="text-[16px] text-[#262626] font-light">{description}</p>
      </div>
    </div>
  );
}

/** Bottom-anchored detail sheet scoped to the browser page. */
function HoDetailSheet({ content, onClose }: { content: ProductDetailContent | null; onClose: () => void }) {
  const [render, setRender] = useState<ProductDetailContent | null>(content);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (content) {
      setRender(content);
      const r = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = setTimeout(() => setRender(null), 300);
    return () => clearTimeout(t);
  }, [content]);
  if (!render) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, fontFamily: PROP_FONT }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: shown ? 1 : 0,
          transition: 'opacity 280ms ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '92%',
          background: '#fff',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          boxShadow: '0 -4px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: shown ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 320ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, paddingTop: 24, paddingRight: 24, zIndex: 10 }}>
          <SheetCloseButton onClick={onClose} />
        </div>
        <div style={{ overflowY: 'auto' }}>
          {render.kind === 'product' && <HoProductBody content={render} />}
          {render.kind === 'upgrade' && <HoUpgradeBody content={render} />}
          {render.kind === 'addon' && <HoAddonBody content={render} />}
        </div>
      </div>
    </div>
  );
}

/** Simple outlined / filled CTA button for the summary panel. */
function HoButton({ children, variant = 'outline', onClick }: { children: React.ReactNode; variant?: 'outline' | 'primary'; onClick?: () => void }) {
  const red = variant === 'primary';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 40,
        width: '100%',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        fontSize: 14,
        fontFamily: PROP_FONT,
        fontWeight: red ? 600 : 400,
        color: red ? '#fff' : 'rgba(0,0,0,0.85)',
        background: red ? PROP_ACCENT : '#fff',
        border: red ? 'none' : `1px solid ${PROP_INK}`,
      }}
    >
      {children}
    </button>
  );
}

/** Tween a number toward `target`, restarting from the currently displayed value
 *  whenever `target` changes (e.g. an add-on toggle or upgrade swap). easeOutCubic. */
function useCountUp(target: number, duration = 450) {
  const [value, setValue] = useState(target);
  const ref = useRef({ from: target, start: 0, raf: 0 });
  useEffect(() => {
    const s = ref.current;
    s.from = value; // begin from wherever the display currently sits
    s.start = 0;
    if (s.from === target) return;
    const step = (ts: number) => {
      if (!s.start) s.start = ts;
      const p = Math.min((ts - s.start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(s.from + (target - s.from) * eased);
      if (p < 1) s.raf = requestAnimationFrame(step);
      else setValue(target);
    };
    s.raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(s.raf);
    // Only re-tween on a new target; `value` is read intentionally as the live start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}

/** A dollar figure that animates (counts up/down) as its value changes. */
function AnimatedUsd({ value, style, suffix }: { value: number; style?: React.CSSProperties; suffix?: string }) {
  const v = useCountUp(value);
  return (
    <p style={style}>
      {fmtUsd(v)}
      {suffix}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Upfront Configurator (Customize Your Project) building blocks.      */
/* ------------------------------------------------------------------ */
/** "+$ 760" / "-$ 120" — Figma's delta formatting (space after the $). */
const fmtPlusUsd = (n: number) => `${n < 0 ? '-' : '+'}$ ${Math.abs(Math.round(n)).toLocaleString('en-US')}`;

/** 24px checkbox — 1px black border, 2px radius (Figma 238:963). */
function HoCheckbox({ checked, onToggle, size = 24 }: { checked: boolean; onToggle: () => void; size?: number }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 2,
            background: checked ? PROP_INK : 'transparent',
            border: checked ? 'none' : '1px solid #000',
          }}
        />
        {checked && <CheckMark size={16} color="#fff" style={{ position: 'absolute', inset: (size - 16) / 2 }} />}
      </div>
    </button>
  );
}

/** Double chevron pointing down — the "jump to Summary" glyph. */
function HoChevronsDown({ size = 16, color = '#262626' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 4.5L8 9l4.5-4.5" />
      <path d="M3.5 8.5L8 13l4.5-4.5" />
    </svg>
  );
}

/** 64px option swatch — the selected option carries a 1.5px black border. */
function HoOptionSwatch({ title, selected, onClick }: { title: string; selected: boolean; onClick: () => void }) {
  const [err, setErr] = useState(false);
  const img = productImage(title);
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 64,
        height: 64,
        flex: '0 0 auto',
        padding: 2,
        borderRadius: 4,
        cursor: 'pointer',
        border: `1.5px solid ${selected ? '#000' : 'transparent'}`,
        background: 'transparent',
        display: 'flex',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {!img || err ? (
        <div style={{ width: '100%', height: '100%', borderRadius: 2, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <NoImageMark width={30} />
        </div>
      ) : (
        <img src={img} alt="" onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2, display: 'block' }} />
      )}
      {/* same selected badge as the detail sheet's option swatches */}
      {selected && (
        <div style={{ position: 'absolute', left: 5, bottom: 5 }}>
          <SheetCheckbox checked={true} />
        </div>
      )}
    </button>
  );
}

/** Sticky commerce bar pinned above the Customize stage (Figma 1690:33741).
 *  Lives INSIDE the first snap section, so it pins while the reader is
 *  customizing and scrolls off-screen with the section once they move on
 *  to the Summary stage. */
function HoStickyBar({
  monthly,
  total,
  onSummary,
  onApprove,
}: {
  monthly: number;
  total: number;
  onSummary: () => void;
  onApprove: () => void;
}) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.2)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              height: 32,
              padding: '6px 4px',
              borderRadius: 4,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: PROP_FONT,
            }}
          >
            <PhoneStroke size={16} color={PROP_INK} />
            <span style={{ fontSize: 14, color: PROP_INK }}>Contact Sales</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Each price block sizes to its number row (icon + figure); the
                  caption below fills exactly that width and ellipsizes —
                  width: 0 + minWidth: 100% keeps the caption from widening
                  the block. */}
              {/* Fixed-ish block widths + tabular figures: the numbers stay
                  left-aligned and the bar doesn't wobble as animated values
                  change digit count. */}
              <div style={{ height: 40, minWidth: 175, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0 12px 0 8px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 16 }}>
                  <CalculatorIcon size={16} color={PROP_INK} />
                  <AnimatedUsd
                    value={monthly}
                    suffix=" / mo"
                    style={{ fontSize: 18, color: PROP_INK, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                  />
                </div>
                <p style={{ fontSize: 10, color: '#737373', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 0, minWidth: '100%' }}>
                  Monthly payment via financing service provider
                </p>
              </div>
              <div style={{ width: 0.5, background: 'rgba(0,0,0,0.2)' }} />
              <div style={{ height: 40, minWidth: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0 8px 0 12px', boxSizing: 'border-box' }}>
                <AnimatedUsd
                  value={total}
                  style={{ fontSize: 18, color: PROP_INK, whiteSpace: 'nowrap', paddingRight: 16, fontVariantNumeric: 'tabular-nums' }}
                />
                <p style={{ fontSize: 10, color: '#737373', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 0, minWidth: '100%' }}>
                  Tax &amp; fees included in the design
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={onSummary}
                style={{
                  width: 108,
                  height: 40,
                  borderRadius: 4,
                  border: `1px solid ${PROP_INK}`,
                  background: '#fff',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.85)',
                  cursor: 'pointer',
                  fontFamily: PROP_FONT,
                }}
              >
                Summary
              </button>
              <button
                type="button"
                onClick={onApprove}
                style={{
                  height: 40,
                  padding: '6px 16px',
                  borderRadius: 4,
                  border: 'none',
                  background: PROP_INK,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: PROP_FONT,
                }}
              >
                Review &amp; Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeownerProposal({ categories }: { categories: SummaryCategory[] }) {
  // Homeowner-side selections: upgrade choice per upgradeable line item, and
  // which optional add-ons are checked. Both start at the contractor's
  // defaults (base product selected, add-ons unchecked).
  const [hoUpgrade, setHoUpgrade] = useState<Record<string, string>>({});
  const [hoAddon, setHoAddon] = useState<Record<string, boolean>>({});
  // Which line item's detail sheet is open (section + category + row key).
  const [detail, setDetail] = useState<{ section: 'included' | 'addon'; cat: string; key: string } | null>(null);
  const [drawingHover, setDrawingHover] = useState(false);
  // Configurator add-on card under the pointer (row key). Geometry-backed
  // add-ons echo the hover onto their drawing region(s); fee-based add-ons
  // have no geometry, so only the card itself highlights.
  const [hoverAddonKey, setHoverAddonKey] = useState<string | null>(null);
  // Two-stage scroll (Upfront Configurator): the scroller snaps between the
  // Customize stage and the Summary stage.
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const summarySectionRef = useRef<HTMLElement | null>(null);
  // "Customize Your Project" header: pinned below the commerce bar while the
  // configurator scrolls, but RELEASED (scrolls away with the content) once
  // the configurator column's bottom is fully in view. CSS sticky alone can't
  // express that release point, so a scroll handler flips the header from
  // sticky to absolute at the boundary — capturing its column offset at the
  // flip so the motion stays continuous in both directions.
  const configColRef = useRef<HTMLDivElement | null>(null);
  const configHeadRef = useRef<HTMLDivElement | null>(null);
  const [headRelease, setHeadRelease] = useState<{ top: number; height: number } | null>(null);
  // Add-on-only proposals (no upgradeable rows) render the header statically —
  // the column is short, so the sticky/release treatment would just leave the
  // header's flow spacer as a blank block between the search bar and Addons.
  const hasUpgradeGroups = categories.some((c) => c.rows.some((r) => !r.isAddon && r.upgrades.length > 0));
  // Hand-off between the stages, done by hand (CSS scroll-snap fights
  // mid-scroll positions — it re-snaps after re-renders and clamps
  // programmatic scrolls):
  // - Scrolling DOWN, the moment Summary fills more than 25% of the viewport
  //   it snaps to the top immediately, mid-scroll.
  // - Below the threshold, wait for the scroll to END, then bounce back so
  //   stage 1's bottom sits flush with the viewport bottom.
  // A triggered snap is a COMMITMENT: it must end with the Summary section's
  // top (left and right columns aligned) at the viewport top, no matter how
  // much residual gesture momentum interrupts the glide. The committed
  // destination is re-issued on scrollend until landed; only an upward escape
  // (Summary back under 25%) aborts it. Scrolling after landing is free.
  const snapCommitRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);
  const lastDirRef = useRef<'up' | 'down'>('down');
  /** Summary section's top in scroller layout px (rects are visual px — the
   *  panel is CSS-scaled — so convert before mixing with scrollTop). */
  const summaryTargetOf = (scroller: HTMLDivElement) => {
    const summary = summarySectionRef.current;
    if (!summary) return null;
    const ratio = scroller.getBoundingClientRect().height / scroller.clientHeight;
    return scroller.scrollTop + (summary.getBoundingClientRect().top - scroller.getBoundingClientRect().top) / ratio;
  };
  const onConfigScrollEnd = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = summaryTargetOf(scroller);
    if (target == null) return;
    const s = scroller.scrollTop;
    const H = scroller.clientHeight;
    const summaryVisible = H - (target - s); // > H once scrolled past the target
    const commit = snapCommitRef.current;
    snapCommitRef.current = null;
    if (commit != null && Math.abs(s - commit) <= 4) return; // landed — further scrolling is free
    if (commit != null && Math.abs(s - commit) <= 120) {
      // the glide was interrupted just shy of its destination (layout shifts
      // near the boundary can cancel a smooth scroll) — finish it
      snapCommitRef.current = commit;
      scroller.scrollTo({ top: commit, behavior: 'smooth' });
      return;
    }
    // Re-resolve the destination from the CURRENT position (a stale committed
    // destination must not fight a user who scrolled across the threshold
    // while the glide was in flight):
    // - stopped in the hand-off zone → resolve by the direction of travel
    //   (down: Summary past 25% snaps in, else bounce back; up: stage 1 past
    //   20% releases Summary off-screen, else return to Summary);
    // - overshot past the Summary top while a snap was in flight → finish the
    //   snap so the stages land aligned.
    let dest: number | null = null;
    if (s < target - 8 && s > target - H + 8) {
      dest =
        lastDirRef.current === 'up'
          ? target - s > H * 0.2
            ? target - H
            : target
          : summaryVisible > H * 0.25
            ? target
            : target - H;
    } else if (commit != null && s >= target - 8 && s < target + H) {
      dest = target;
    }
    if (dest != null && Math.abs(s - dest) > 4) {
      snapCommitRef.current = dest;
      scroller.scrollTo({ top: dest, behavior: 'smooth' });
    }
  };
  const onConfigScroll = () => {
    const scroller = scrollerRef.current;
    const col = configColRef.current;
    const head = configHeadRef.current;
    if (!scroller || !col || !head) return;
    // Immediate directional snaps, fired mid-scroll without waiting for the
    // gesture to end:
    // - scrolling DOWN: as soon as Summary crosses the 25% line, glide it to
    //   the top;
    // - scrolling UP from Summary: as soon as the content above has come down
    //   past 20% of the viewport, glide Summary off-screen (stage 1's bottom
    //   flush with the viewport bottom).
    const s = scroller.scrollTop;
    if (s !== lastScrollRef.current) lastDirRef.current = s > lastScrollRef.current ? 'down' : 'up';
    lastScrollRef.current = s;
    if (snapCommitRef.current == null) {
      const target = summaryTargetOf(scroller);
      const H = scroller.clientHeight;
      if (target != null && s < target - 8 && s > target - H + 8) {
        const aboveContent = target - s; // stage-1 content visible above Summary
        let dest: number | null = null;
        if (lastDirRef.current === 'down' && H - aboveContent > H * 0.25) dest = target;
        if (lastDirRef.current === 'up' && aboveContent > H * 0.2) dest = target - H;
        if (dest != null) {
          snapCommitRef.current = dest;
          scroller.scrollTo({ top: dest, behavior: 'smooth' });
        }
      }
    }
    // Static header (add-on-only proposal) — no release tracking needed.
    if (!hasUpgradeGroups) return;
    // The release boundary is the stage-1 content container's bottom edge —
    // INCLUDING its bottom padding — entering the viewport (col.parentElement
    // is the padded two-column container).
    const container = col.parentElement as HTMLElement;
    const scRect = scroller.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const released = contRect.bottom <= scRect.bottom + 0.5;
    setHeadRelease((prev) => {
      if (!released) return prev ? null : prev;
      if (prev) return prev;
      // Anchor the released header at the EXACT boundary geometry, in layout px
      // (client rects are scaled by the panel's CSS transform, so they must not
      // feed CSS top/height): with the container bottom at the scrollport
      // bottom, the pinned header (top: 64) sits 64 + colHeight + padBelowCol −
      // scrollportHeight from the column top. Deriving it — rather than
      // sampling the header's rect on a scroll event — keeps the hand-off
      // continuous at any scroll speed. When the column is short, the boundary
      // can arrive BEFORE the header has ever pinned — it is still at its flow
      // position (below the title block), so never release it above that:
      // otherwise the white header teleports up and covers the title/address.
      const ratio = scRect.height / scroller.clientHeight;
      const padBelowCol = (contRect.bottom - col.getBoundingClientRect().bottom) / ratio;
      const top = Math.max(head.offsetTop, 64 + col.offsetHeight + padBelowCol - scroller.clientHeight);
      return { top, height: head.offsetHeight };
    });
  };

  const rowKey = (cat: string, row: SummaryRow) =>
    `${cat}|${row.name}|${row.upgrades.map((u) => u.id).join(',')}|${row.feeId ?? ''}`;

  // Split aggregated rows into Included vs. Optional Add-ons, keeping category
  // grouping — mirrors the app's Report Summary sections.
  const includedCats = categories
    .map((c) => ({ category: c.category, rows: c.rows.filter((r) => !r.isAddon) }))
    .filter((c) => c.rows.length > 0);
  const addonCats = categories
    .map((c) => ({ category: c.category, rows: c.rows.filter((r) => r.isAddon) }))
    .filter((c) => c.rows.length > 0);

  // Options for an upgradeable row: the base product (delta 0) + each upgrade.
  const optionsFor = (row: SummaryRow): HoUpgradeOption[] => [
    { id: row.baseId, title: row.name, delta: 0 },
    ...row.upgrades.map((u) => ({ id: u.id, title: u.name, delta: u.delta })),
  ];
  const selectedOptId = (cat: string, row: SummaryRow) => hoUpgrade[rowKey(cat, row)] ?? row.baseId;

  // Per-region drawing fills follow the homeowner's live upgrade choice: when a
  // flooring row's selected option differs from its base product, override the
  // fill of every drawing region (instance) that row covers.
  const drawingOverrides: Record<string, string> = {};
  includedCats.forEach((c) =>
    c.rows.forEach((row) => {
      if (!row.upgrades.length) return;
      const sel = selectedOptId(c.category, row);
      if (sel === row.baseId) return;
      const name = findLibraryItem(sel)?.name;
      if (!name) return;
      row.instanceIds.forEach((id) => {
        drawingOverrides[id] = name;
      });
    }),
  );

  // ── Financials — correspond to the app's per-instance pricing ──
  // Base contract = every included row's price (base products + one-time
  // fees). Picking an upgrade adds its delta; checking an add-on adds its
  // price. Matches the app Report total when nothing is changed.
  let contractTotal = 0;
  includedCats.forEach((c) =>
    c.rows.forEach((row) => {
      contractTotal += row.price;
      if (row.upgrades.length) {
        const sel = selectedOptId(c.category, row);
        const opt = row.upgrades.find((u) => u.id === sel);
        if (opt) contractTotal += opt.delta;
      }
    }),
  );
  addonCats.forEach((c) =>
    c.rows.forEach((row) => {
      if (hoAddon[rowKey(c.category, row)]) contractTotal += row.price;
    }),
  );
  const monthly = contractTotal / 24;

  // Derive the open detail sheet's content from the current selection so the
  // add-on checkbox / upgrade swatch inside the sheet always reflect live
  // state. Product → 'product'; upgradeable product → 'upgrade'; add-on →
  // 'addon' — the same three variants as the proposal-v3 ProductDetailSheet.
  const sheetContent: ProductDetailContent | null = (() => {
    if (!detail) return null;
    const cats = detail.section === 'included' ? includedCats : addonCats;
    const cat = cats.find((c) => c.category === detail.cat);
    const row = cat?.rows.find((r) => rowKey(detail.cat, r) === detail.key);
    if (!row) return null;
    const measure = row.measureText ?? fmtArea(row.area);
    const imgs = (name: string) => {
      const src = productImage(name);
      return src ? [src] : undefined;
    };
    if (detail.section === 'addon') {
      const k = rowKey(detail.cat, row);
      return {
        kind: 'addon',
        name: row.name,
        qtyLabel: measure,
        description: describe(row.name),
        priceDelta: row.price,
        selected: !!hoAddon[k],
        onToggle: () => setHoAddon((prev) => ({ ...prev, [k]: !prev[k] })),
        images: imgs(row.name),
      };
    }
    if (row.upgrades.length > 0) {
      // Top line = category only; option titles drop the "{Category} - " prefix.
      const stripCat = (title: string) =>
        title.startsWith(`${detail.cat} - `) ? title.slice(detail.cat.length + 3) : title;
      return {
        kind: 'upgrade',
        category: detail.cat,
        qtyLabel: measure,
        options: optionsFor(row).map((o) => ({
          id: o.id,
          title: stripCat(o.title),
          description: describe(o.title),
          priceDelta: o.delta,
          thumb: productImage(o.title),
          images: imgs(o.title),
        })),
        currentOptionId: selectedOptId(detail.cat, row),
        onSelect: (id: string) => setHoUpgrade((prev) => ({ ...prev, [rowKey(detail.cat, row)]: id })),
      };
    }
    return { kind: 'product', category: row.name, qtyLabel: measure, description: describe(row.name), images: imgs(row.name) };
  })();

  // Every user-configurable choice, flattened for the Customize stage:
  // upgradeable included rows + optional add-ons. When neither exists the
  // page falls back to the classic single-stage proposal layout.
  const upgradeGroups = includedCats.flatMap((c) =>
    c.rows.filter((r) => r.upgrades.length > 0).map((row) => ({ cat: c.category, row })),
  );
  const addonItems = addonCats.flatMap((c) => c.rows.map((row) => ({ cat: c.category, row })));
  const hasCustomization = upgradeGroups.length > 0 || addonItems.length > 0;
  // Drawing regions to highlight for the hovered add-on card (empty for
  // fee-based add-ons — they have no geometry on the plan).
  const hoverAddonIds = hoverAddonKey
    ? (addonItems.find(({ cat, row }) => rowKey(cat, row) === hoverAddonKey)?.row.instanceIds ?? [])
    : [];

  // Button-driven scrolls commit their destination so the hand-off snap logic
  // doesn't hijack the glide while it crosses the boundary zone.
  const scrollToSummary = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = summaryTargetOf(scroller);
    if (target == null) return;
    snapCommitRef.current = target;
    scroller.scrollTo({ top: target, behavior: 'smooth' });
  };
  const scrollToTop = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    snapCommitRef.current = 0;
    scroller.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Shared building blocks (used by both layouts) ── */
  const pageHeader = (
    <header style={{ height: 56, flex: '0 0 auto', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1160, padding: '0 96px', boxSizing: 'border-box' }}>
        <HomeIcon size={24} />
        <FloorLogo />
        <UserIcon size={24} />
      </div>
    </header>
  );

  const drawingCard = (
    <HoSectionCard label="Drawing">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <div
          onMouseEnter={() => setDrawingHover(true)}
          onMouseLeave={() => setDrawingHover(false)}
          style={{ position: 'relative', width: '100%', aspectRatio: '880 / 565', background: '#fff', border: '1px solid #ececec', borderRadius: 4, overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* viewBox cropped to the plan's extents so the drawing renders
                larger with less side whitespace (taller card to match) */}
            <FloorPlanSvg selected={null} onSelect={() => {}} viewBox="100 145 880 565" productOverrides={drawingOverrides} highlightIds={hoverAddonIds} />
          </div>
          {/* Zoom controls — revealed only on hover over the drawing */}
          <ZoomControlsPill
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 20,
              opacity: drawingHover ? 1 : 0,
              pointerEvents: drawingHover ? 'auto' : 'none',
              transition: 'opacity 160ms ease',
            }}
          />
        </div>
        {/* legend row — corresponds to the drawing fills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', paddingTop: 4 }}>
          {[
            { kind: 'stagger', label: 'Oakwood Flooring | w 5" | Staggered' },
            { kind: 'herring', label: 'Oakwood Flooring | w 5" | Herringbone' },
            { kind: 'solid', label: 'Walnut Flooring | w 7" | Straight' },
          ].map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LegendSwatch kind={r.kind} />
              <span style={{ fontSize: 13, color: '#3a3a3a' }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </HoSectionCard>
  );

  const includedCard = (
    <HoSectionCard label="Included Products">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        {includedCats.map((c) => (
          <div key={c.category} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <HoCategoryLabel name={c.category} count={c.rows.length} />
            {c.rows.map((row) => {
              const hasUpgrade = row.upgrades.length > 0;
              const selId = selectedOptId(c.category, row);
              const opts = optionsFor(row);
              const label = opts.find((o) => o.id === selId)?.title ?? row.name;
              return (
                <HoProductLine
                  key={rowKey(c.category, row)}
                  name={label}
                  measure={row.measureText ?? fmtArea(row.area)}
                  hasUpgrade={hasUpgrade}
                  onOpen={() => setDetail({ section: 'included', cat: c.category, key: rowKey(c.category, row) })}
                />
              );
            })}
          </div>
        ))}
      </div>
    </HoSectionCard>
  );

  const addonsCard = addonCats.length > 0 && (
    <HoSectionCard label="Add-ons">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        {addonCats.map((c) =>
          c.rows.map((row) => {
            const k = rowKey(c.category, row);
            return (
              <HoAddonLine
                key={k}
                name={row.name}
                measure={row.measureText ?? fmtArea(row.area)}
                price={row.price}
                selected={!!hoAddon[k]}
                onToggle={() => setHoAddon((prev) => ({ ...prev, [k]: !prev[k] }))}
                onOpen={() => setDetail({ section: 'addon', cat: c.category, key: k })}
              />
            );
          }),
        )}
      </div>
    </HoSectionCard>
  );

  /* ── Classic single-stage layout — proposals with nothing to configure ── */
  if (!hasCustomization) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: PROP_FONT, color: PROP_INK }}>
        {/* scrolling page body — the header lives inside the scroll region so it
            scrolls off-screen with the content (maximizing information density
            once the reader starts scrolling), rather than staying pinned. */}
        <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', background: '#fff' }}>
          {pageHeader}

          <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 24px 48px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* ── Scope column ── */}
            <div style={{ flex: '2 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {drawingCard}
              {includedCard}
              {addonsCard}
            </div>

            {/* ── Summary column (sticky) ── */}
            <div style={{ flex: '1 1 0', minWidth: 0, position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
              <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* title block */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: 20, fontWeight: 600 }}>SUMMARY</p>
                  <p style={{ fontSize: 20, fontWeight: 600 }}>{PROPOSAL_TITLE}</p>
                  <p style={{ fontSize: 16, fontWeight: 400 }}>{PROPOSAL_ADDRESS}</p>
                </div>

                {/* financials */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div>
                      <p style={{ fontSize: 12, color: '#737373' }}>Contract Total <sup style={{ fontSize: 8 }}>1</sup></p>
                      <AnimatedUsd value={contractTotal} style={{ fontSize: 32, color: PROP_INK }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#737373' }}>Estimated Monthly Payment <sup style={{ fontSize: 8 }}>2</sup></p>
                      <AnimatedUsd value={monthly} style={{ fontSize: 20, color: PROP_INK, fontWeight: 300 }} suffix=" / mo" />
                    </div>
                  </div>

                  {/* actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
                    <HoButton variant="primary">Approve</HoButton>
                    <HoButton>
                      <CardIcon size={16} color="rgba(0,0,0,0.85)" />
                      View Payment Schedule
                    </HoButton>
                    <HoButton>
                      <PhoneStroke size={16} color={PROP_INK} />
                      Contact Sales
                    </HoButton>
                    <HoButton>
                      <DownloadStroke size={16} color="#000000" />
                      Download Config [PDF]
                    </HoButton>
                    <p style={{ fontSize: 12, color: '#737373', lineHeight: 1.5 }}>
                      <sup>1</sup> Total project pricing is subject to change based on applicable tax and final site conditions.{' '}
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Read more</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product / Upgrade / Add-on detail sheet — opens from any line item */}
        <HoDetailSheet content={sheetContent} onClose={() => setDetail(null)} />
      </div>
    );
  }

  /* ── Upfront Configurator layout — two snap stages ──
     Stage 1 (Customize Your Project): left = drawing only, right = the
     configurator (all upgrades + add-ons), with the sticky commerce bar
     pinned on top. Stage 2 (Summary): left = Included Products + Add-ons,
     right = the full Summary; the sticky bar scrolls away with stage 1. */
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: PROP_FONT, color: PROP_INK }}>
      <div
        ref={scrollerRef}
        onScroll={onConfigScroll}
        onScrollEnd={onConfigScrollEnd}
        style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', background: '#fff', overflowAnchor: 'none' }}
      >
        {/* ═══ Stage 1 — Customize Your Project ═══ */}
        <section style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          {pageHeader}
          <HoStickyBar monthly={monthly} total={contractTotal} onSummary={scrollToSummary} onApprove={scrollToSummary} />

          <div style={{ width: '100%', maxWidth: 1160, margin: '0 auto', padding: '24px 24px 96px', display: 'flex', gap: 24, alignItems: 'flex-start', boxSizing: 'border-box' }}>
            {/* left — the drawing only (Included Products waits for stage 2).
                Sticky below the commerce bar (12+40+12+0.5 ≈ 64px) so it stays
                put while the configurator column scrolls. */}
            <div style={{ flex: '2 1 0', minWidth: 0, position: 'sticky', top: 88, alignSelf: 'flex-start' }}>{drawingCard}</div>

            {/* right — the configurator */}
            <div
              ref={configColRef}
              style={{ flex: '1 1 0', minWidth: 0, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 24, boxSizing: 'border-box', position: 'relative' }}
            >
              {/* proposal title block — same styles as the Summary title block */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: 20, fontWeight: 600 }}>{PROPOSAL_TITLE}</p>
                <p style={{ fontSize: 16, fontWeight: 400 }}>{PROPOSAL_ADDRESS}</p>
              </div>

              {/* section title + search — pinned right below the commerce bar
                  (64px tall) while the configurator scrolls; once the column's
                  bottom is fully in view the header is released (absolute) and
                  rides up with the content. The spacer keeps the flow layout
                  identical while the header is out of flow. */}
              {hasUpgradeGroups && headRelease && (
                <div style={{ height: headRelease.height, margin: '-24px 0 -12px', flex: '0 0 auto' }} />
              )}
              <div
                ref={configHeadRef}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  zIndex: 10,
                  background: '#fff',
                  ...(hasUpgradeGroups
                    ? {
                        padding: '24px 0 12px',
                        ...(headRelease
                          ? { position: 'absolute', top: headRelease.top, left: 12, right: 12 }
                          : { position: 'sticky', top: 64, margin: '-24px 0 -12px' }),
                      }
                    : null),
                }}
              >
                <p style={{ fontSize: 16, fontWeight: 600 }}>Customize Your Project</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', border: '0.5px solid #000', borderRadius: 2 }}>
                  <SearchIcon size={16} color="#737373" />
                  <span style={{ fontSize: 12, color: '#737373', whiteSpace: 'nowrap' }}>Search Configuration / Upgrade / Add-ons</span>
                </div>
              </div>

              {/* upgrade groups + add-ons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}>
                {upgradeGroups.map(({ cat, row }) => {
                  const k = rowKey(cat, row);
                  const opts = optionsFor(row);
                  const selId = selectedOptId(cat, row);
                  const sel = opts.find((o) => o.id === selId) ?? opts[0];
                  return (
                    <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {/* whole text block opens the upgrade detail sheet */}
                      <div
                        onClick={() => setDetail({ section: 'included', cat, key: k })}
                        style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0', cursor: 'pointer' }}
                      >
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{cat}</p>
                        <p style={{ fontSize: 14, fontWeight: 300, color: '#737373' }}>{row.measureText ?? fmtArea(row.area)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 14 }}>{sel.title}</p>
                          <ProductInfo size={16} color={PROP_INK} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#737373' }}>{fmtPlusUsd(sel.delta)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {opts.map((o) => (
                          <HoOptionSwatch
                            key={o.id}
                            title={o.title}
                            selected={o.id === selId}
                            onClick={() => setHoUpgrade((prev) => ({ ...prev, [k]: o.id }))}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {addonItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Addons</p>
                    {addonItems.map(({ cat, row }) => {
                      const k = rowKey(cat, row);
                      const checked = !!hoAddon[k];
                      const hovered = hoverAddonKey === k;
                      return (
                        <div
                          key={k}
                          onClick={() => setDetail({ section: 'addon', cat, key: k })}
                          onMouseEnter={() => setHoverAddonKey(k)}
                          onMouseLeave={() => setHoverAddonKey((prev) => (prev === k ? null : prev))}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '8px 8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${checked || hovered ? PROP_INK : '#bfbfbf'}`,
                            cursor: 'pointer',
                            background: hovered ? '#fafafa' : '#fff',
                            transition: 'border-color 120ms ease, background 120ms ease',
                          }}
                        >
                          <div style={{ display: 'flex', gap: 12, paddingRight: 8 }}>
                            <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                <p style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</p>
                                <ProductInfo size={16} color={PROP_INK} />
                              </div>
                              <p style={{ fontSize: 14, fontWeight: 300, color: '#737373' }}>{row.measureText ?? fmtArea(row.area)}</p>
                              <p style={{ fontSize: 14, fontWeight: 600, color: '#737373' }}>{fmtPlusUsd(row.price)}</p>
                            </div>
                            <div style={{ paddingTop: 4 }}>
                              <HoCheckbox checked={checked} onToggle={() => setHoAddon((prev) => ({ ...prev, [k]: !prev[k] }))} />
                            </div>
                          </div>
                          {/* products with no photography get no thumbnail here */}
                          {productImage(row.name) && (
                            <div style={{ width: 64, height: 64, padding: 2, boxSizing: 'border-box' }}>
                              <HoThumb name={row.name} size={60} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* jump to the Summary stage — same look as the Back to Top button */}
              <button
                type="button"
                onClick={scrollToSummary}
                style={{
                  height: 40,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  borderRadius: 4,
                  border: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  fontFamily: PROP_FONT,
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.85)',
                }}
              >
                <HoChevronsDown size={16} color={PROP_INK} />
                Summary
              </button>
            </div>
          </div>
        </section>

        {/* ═══ Stage 2 — Summary ═══ */}
        <section ref={summarySectionRef} style={{ minHeight: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: 1160, margin: '0 auto', padding: '24px 24px 48px', display: 'flex', gap: 24, alignItems: 'flex-start', boxSizing: 'border-box' }}>
            {/* left — full scope: Included Products + Add-ons */}
            <div style={{ flex: '2 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {includedCard}
              {addonsCard}
              <button
                type="button"
                onClick={scrollToTop}
                style={{
                  height: 40,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  borderRadius: 4,
                  border: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  fontFamily: PROP_FONT,
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.85)',
                }}
              >
                <ArrowUpIcon size={16} color={PROP_INK} />
                Back to Top
              </button>
            </div>

            {/* right — Summary column (sticky within stage 2) */}
            <div style={{ flex: '1 1 0', minWidth: 0, position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
              <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* title block */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: 20, fontWeight: 600 }}>SUMMARY</p>
                  <p style={{ fontSize: 20, fontWeight: 600 }}>{PROPOSAL_TITLE}</p>
                  <p style={{ fontSize: 16, fontWeight: 400 }}>{PROPOSAL_ADDRESS}</p>
                </div>

                {/* financials */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div>
                      <p style={{ fontSize: 12, color: '#737373' }}>Contract Total <sup style={{ fontSize: 8 }}>1</sup></p>
                      <AnimatedUsd value={contractTotal} style={{ fontSize: 32, color: PROP_INK }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#737373' }}>Estimated Monthly Payment <sup style={{ fontSize: 8 }}>2</sup></p>
                      <AnimatedUsd value={monthly} style={{ fontSize: 20, color: PROP_INK, fontWeight: 300 }} suffix=" / mo" />
                    </div>
                  </div>

                  {/* actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
                    <HoButton variant="primary">Review Contract &amp; Approve</HoButton>
                    <HoButton>
                      <CalculatorIcon size={16} color="rgba(0,0,0,0.85)" />
                      Explore Payment &amp; Financing
                    </HoButton>
                    <HoButton>
                      <PhoneStroke size={16} color={PROP_INK} />
                      Contact Sales
                    </HoButton>
                    <HoButton>
                      <DownloadStroke size={16} color="#000000" />
                      Download Config [PDF]
                    </HoButton>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 24 }}>
                      <p style={{ fontSize: 12, color: PROP_INK, fontWeight: 300, lineHeight: 1.5 }}>
                        <sup>1</sup> Total project pricing is subject to change based on applicable taxes, fees, payment timing, and any final
                        project adjustments. The final amount presented at the time of payment will control.
                      </p>
                      <p style={{ fontSize: 12, color: PROP_INK, fontWeight: 300, lineHeight: 1.5 }}>
                        <sup>2</sup> Any monthly payment information shown is an estimate only and is not a financing offer. Final payment
                        amounts, interest rates, and loan terms are subject to lender review and will be confirmed during the formal
                        application process.
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.85)', textAlign: 'center', textDecoration: 'underline', cursor: 'pointer' }}>
                        Read more
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Product / Upgrade / Add-on detail sheet — opens from any line item */}
      <HoDetailSheet content={sheetContent} onClose={() => setDetail(null)} />
    </div>
  );
}
