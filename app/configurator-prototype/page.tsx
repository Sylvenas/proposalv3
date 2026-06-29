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

const findLibraryItem = (id: string): LibraryItem | undefined =>
  PRODUCT_LIBRARY.flatMap((g) => g.items).find((it) => it.id === id);

const findLibraryEntry = (id: string): { item: LibraryItem; category: string } | undefined => {
  for (const g of PRODUCT_LIBRARY) {
    const item = g.items.find((it) => it.id === id);
    if (item) return { item, category: g.category };
  }
  return undefined;
};

const WALNUT_ORANGE = '#f6b15a';
const STAGGERED_FILL = '#fdeef6'; // flat magenta tint (the former hatch ground)

/** Map a product name to its canvas fill, keyed off the legend hatch style. */
function fillForProduct(product: string): string {
  if (product.includes('Herringbone')) return 'url(#hatchHerringbone)';
  if (product.includes('Straight')) return WALNUT_ORANGE;
  return STAGGERED_FILL; // Staggered → flat tint, no hatch
}

export default function ConfiguratorPrototypePage() {
  const [scale, setScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      const pad = 48;
      const s = Math.min(
        (window.innerWidth - pad) / DESIGN_W,
        (window.innerHeight - pad) / DESIGN_H,
      );
      setScale(Math.min(s, 1));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#2f3e4d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
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
            <TopToolbar />
            <RulerCorner />
            <CanvasArea />
          </div>
        </div>

        {/* Primary CTA, floats on the dark background below the iPad */}
        <button
          type="button"
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

function TopToolbar() {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: '#e1efff',
            color: BLUE,
            borderRadius: 9,
            padding: '6px 11px',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Reports
          <svg width="11" height="7" viewBox="0 0 11 7" fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l4.5 4.5L10 1" />
          </svg>
        </div>
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

function CanvasArea() {
  const [selected, setSelected] = useState<string | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  // Upgrade-option library ids added per instance.
  const [upgrades, setUpgrades] = useState<Record<string, string[]>>({});
  // Standalone product library ids added per instance (via "+ Add Product").
  const [added, setAdded] = useState<Record<string, string[]>>({});
  // First-level product ids flagged as Optional Add-ons, per instance.
  const [addon, setAddon] = useState<Record<string, string[]>>({});
  // Instances whose base (included) product has been removed.
  const [baseRemoved, setBaseRemoved] = useState<Record<string, boolean>>({});
  const selInst = FLOOR_INSTANCES.find((i) => i.id === selected) ?? null;

  // Product indicator shown beside "Product Setup". When the selected instance
  // has no products left (base removed + nothing added), there is no indicator.
  const selIndicator: { product: string; category: string } | null = (() => {
    if (!selInst) return null;
    if (!(baseRemoved[selInst.id] ?? false)) {
      return { product: selInst.product, category: selInst.category };
    }
    const firstAdded = (added[selInst.id] ?? [])[0];
    const entry = firstAdded ? findLibraryEntry(firstAdded) : undefined;
    return entry ? { product: entry.item.name, category: entry.category } : null;
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
}: {
  title: string;
  isDisabled: (id: string) => boolean;
  tagFor: (id: string) => string;
  onPick: (libId: string) => void;
  placement: React.CSSProperties;
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
        {PRODUCT_LIBRARY.map((group) => (
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

type ProductGroup = {
  key: string;
  category: string;
  name: string;
  area: number;
  price: number;
  thumb: string;
  isBase: boolean;
};

function ProductItemModal({
  inst,
  upgradeIds,
  addedIds,
  addonIds,
  baseRemoved,
  onAddUpgrade,
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
  const sectionBand = (label: string, marginTop = 0) => (
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
      {label}
    </div>
  );

  const renderUpgrades = () => (
    <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 2 }}>
      <div
        style={{
          width: 152,
          flex: '0 0 auto',
          paddingTop: 11,
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
          paddingTop: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 12, bottom: 0, width: 2, background: '#e1e1e4' }} />
        {upgradeRows.map((u) => (
          <div
            key={u.id}
            style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 10, padding: '14px 20px' }}
          >
            <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: 6, border: '1px solid #e0cdda', background: u.thumb }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, color: '#1c1c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {u.name}
            </span>
            <span style={{ fontSize: 16, color: '#6b6b70', minWidth: 110, textAlign: 'right' }}>{fmtSqFt(u.area)}</span>
            <span style={{ fontSize: 17, fontWeight: 600, color: '#1c1c1e', minWidth: 120, textAlign: 'right' }}>
              {u.delta < 0 ? '− ' : '+ '}
              {fmtUsd(Math.abs(u.delta))}
            </span>
            <span style={{ color: BLUE, fontSize: 22, letterSpacing: '2px', padding: '0 4px' }}>•••</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRow = (g: ProductGroup, marginBottom: number) => {
    const isAddon = addonIds.includes(g.key);
    const ownsUpgrades = g.key === primaryFlooringKey;
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 10, padding: '14px 20px', marginBottom }}
      >
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
                  {PRODUCT_ROW_ACTIONS.map((action, idx) => {
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

  const renderGroups = (gs: ProductGroup[]) =>
    byCategory(gs).map(([category, catGroups]) => (
      <div key={category}>
        <div style={{ fontSize: 13, color: '#8a8a8e', margin: '18px 4px 8px' }}>{category}</div>
        {catGroups.map((g) => {
          const ownsUpgrades = g.key === primaryFlooringKey && upgradeRows.length > 0;
          return (
            <Fragment key={g.key}>
              {renderRow(g, ownsUpgrades ? 0 : 10)}
              {ownsUpgrades && renderUpgrades()}
            </Fragment>
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
          {sectionBand('Included Product')}
          {renderGroups(includedGroups)}
          {addonGroups.length > 0 && (
            <>
              {sectionBand('Optional Add-ons', 26)}
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
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const W = 13; // exterior wall stroke (canvas units)
  const Wi = 7; // interior wall stroke
  const black = '#0d0d0d';
  const selInst = FLOOR_INSTANCES.find((i) => i.id === selected) ?? null;

  return (
    <svg
      viewBox="0 0 1120 760"
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
        <rect key={i.id} x={i.x} y={i.y} width={i.w} height={i.h} fill={fillForProduct(i.product)} />
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
        <RoomLabel x={215} y={342} name="BEDROOM 3" dim={'12\'-0" X 10\'-7"'} area="130.2 sq ft" />
        <RoomLabel x={215} y={628} name="BEDROOM 2" dim={'12\'-0" X 10\'-7"'} area="122.3 sq ft" />
        <RoomLabel x={816} y={352} name="MASTER SUITE" dim={'13\'-10" X 12\'-2"'} area="162.9 sq ft" />

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
      <text x={x} y={y + 42} fontSize="20" fill="#5a5a5a">{area}</text>
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
