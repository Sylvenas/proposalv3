'use client';

import { useEffect, useRef, useState } from 'react';

// Available tabs on the Project Hub. Start with a string-literal union so
// TypeScript keeps each call site honest.
export type ProjectHubTab =
  | 'home'
  | 'contract'
  | 'invoices'
  | 'changes';

// `label` is used on desktop (horizontal tabs), the collapsed mobile row,
// and the expanded mobile dropdown. `mobileMenuLabel` is available if a tab
// ever needs a shorter variant inside the mobile menu.
export const PROJECT_HUB_TABS: { id: ProjectHubTab; label: string; mobileMenuLabel?: string }[] = [
  { id: 'home',      label: 'Project Home' },
  { id: 'contract',  label: 'Contract Doc' },
  { id: 'invoices',  label: 'Invoices & Payments' },
  { id: 'changes',   label: 'Change History' },
];

const TAB_LABEL = (id: ProjectHubTab) =>
  PROJECT_HUB_TABS.find((t) => t.id === id)?.label ?? '';

// ─────────────────────────────────────────────────────────────────────────────
// Mobile (XS/S/M, <lg) — Figma 864:27648
// Collapsed state: single 44px row showing the active tab's label + chevron.
// Expanded state: proposal title + address + vertical menu of all tabs.
// Tap anywhere on the collapsed row to expand; tap the X or a tab to collapse.
// ─────────────────────────────────────────────────────────────────────────────
// Animation tuning.
const MENU_EASE_OUT      = 'cubic-bezier(0.33, 1, 0.68, 1)';
const MENU_EASE_IN       = 'cubic-bezier(0.32, 0, 0.67, 0)';
const MENU_SLIDE_MS      = 320;  // menu panel translate (bg extends + label moves)
const MENU_TITLE_MS      = 220;  // title block fade
const MENU_TITLE_DELAY   = 140;  // title fades in after the bg has mostly settled
const MENU_ITEM_MS       = 200;  // each non-active tab fade
const MENU_ITEM_DELAY_0  = 160;  // first non-active tab starts after title begins
const MENU_ITEM_STAGGER  = 40;   // per-index delay between tab fades
const MENU_EXIT_MS       = 260;  // full exit duration (panel + items fade out together)

// Layout estimates used to align the expanded-menu active tab with the
// collapsed-row position at the start of the open animation. These match
// the inline styles / Tailwind classes below. Kept as constants so the
// math stays self-documenting.
const ROW_HEIGHT_PX        = 44;
const TITLE_BLOCK_HEIGHT_PX = 64; // pt-2 (8) + title (~24) + address (~21) + pb-2 (8)
const TITLE_TO_LIST_GAP_PX  = 12; // gap-3 on the menu panel

function getActiveTopInMenu(activeIdx: number) {
  return TITLE_BLOCK_HEIGHT_PX + TITLE_TO_LIST_GAP_PX + activeIdx * ROW_HEIGHT_PX;
}

function MobileHeader({
  active,
  onChange,
}: {
  active: ProjectHubTab;
  onChange: (tab: ProjectHubTab) => void;
}) {
  // Animation state machine:
  //   mounted : panel rendered in DOM (kept true during exit animation)
  //   open    : drives translate to 0 + contents opacity to 1
  //   offsetY : measured per-open; menu starts translated so the active
  //             item aligns with the collapsed row's viewport position.
  //
  // Flow (open):
  //   setExpanded(true) → measure triggerTop → setMounted(true) +
  //   setOffsetY(triggerTop - activeTopInMenu) → double rAF → setOpen(true)
  //   → CSS transitions fire:
  //     – panel.transform: translateY(offsetY) → translateY(0) (bg extends
  //       toward page top; active label slides to its expanded position)
  //     – title block fades in after MENU_TITLE_DELAY
  //     – non-active tabs fade in top-to-bottom with MENU_ITEM_STAGGER
  //
  // Flow (close): setOpen(false) → panel slides back + content fades out;
  // after MENU_EXIT_MS the panel unmounts.
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [offsetY, setOffsetY]   = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const activeIdx = PROJECT_HUB_TABS.findIndex((t) => t.id === active);
  const activeTopInMenu = getActiveTopInMenu(activeIdx < 0 ? 0 : activeIdx);

  useEffect(() => {
    if (expanded) {
      // Capture the trigger's viewport position BEFORE the menu mounts so
      // the panel can be positioned with the active label aligned to it.
      const rect = triggerRef.current?.getBoundingClientRect();
      const triggerTop = rect?.top ?? 0;
      setOffsetY(triggerTop - activeTopInMenu);
      setMounted(true);
      // Double rAF so the initial translated paint commits before we flip
      // open=true, otherwise React batching collapses the two renders and
      // the transform transition is skipped.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setOpen(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    setOpen(false);
    const t = window.setTimeout(() => setMounted(false), MENU_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [expanded, activeTopInMenu]);

  // Close on Esc while expanded.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const pickTab = (t: ProjectHubTab) => {
    onChange(t);
    setExpanded(false);
  };

  return (
    // `relative` anchors the absolute-positioned expanded menu below;
    // collapsed row always occupies its 44px slot so expanding doesn't
    // push page content down.
    <div
      className="lg:hidden bg-white w-full relative"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Collapsed row — always rendered so the sticky header keeps its
          natural 44px height when the menu is expanded. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-1 px-4 sm:px-6 bg-white border-b-[0.5px] border-[rgba(0,0,0,0.2)] cursor-pointer border-l-0 border-r-0 border-t-0"
        style={{
          height: ROW_HEIGHT_PX,
          boxShadow: '0px 4px 3px 0px rgba(123,123,123,0.1)',
        }}
      >
        <span className="flex-1 min-w-0 text-left text-[14px] font-semibold text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">
          {TAB_LABEL(active)}
        </span>
        <ChevronDown rotated={expanded} />
      </button>

      {mounted && (
        <>
          {/* Backdrop — dims + blurs the rest of the page while the menu is
              open. Fills the viewport; the opaque white menu panel below
              stacks on top. Fades in/out. Tap to dismiss. */}
          <div
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-[60]"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              opacity: open ? 1 : 0,
              transition: `opacity ${MENU_SLIDE_MS}ms ${open ? MENU_EASE_OUT : MENU_EASE_IN}`,
            }}
          />

          {/* Menu panel — fixed to the viewport top. Initial transform is
              translateY(offsetY) so the active tab's menu row aligns exactly
              with the collapsed-row position; the panel then slides up to
              translateY(0), which visually moves the active label down into
              its expanded-menu position while extending the bg to page top. */}
          <div
            className="fixed top-0 left-0 right-0 z-[61] bg-white flex flex-col pb-3"
            style={{
              boxShadow: '0px 4px 3px 0px rgba(123,123,123,0.1)',
              transform: open ? 'translateY(0)' : `translateY(${offsetY}px)`,
              transition: `transform ${open ? MENU_SLIDE_MS : MENU_EXIT_MS}ms ${open ? MENU_EASE_OUT : MENU_EASE_IN}`,
              willChange: 'transform',
            }}
          >
            {/* Title block — fades in after the panel has mostly settled so
                the "Proposal Name + Project Name" appear at the top. */}
            <div
              className="flex flex-col px-4 sm:px-6 pt-2 pb-2 w-full"
              style={{
                height: TITLE_BLOCK_HEIGHT_PX,
                opacity: open ? 1 : 0,
                transition: `opacity ${MENU_TITLE_MS}ms ease-out ${open ? MENU_TITLE_DELAY : 0}ms`,
              }}
            >
              <div className="flex items-center justify-between w-full">
                <p className="flex-1 text-[16px] font-semibold text-[#262626] leading-normal">
                  FENCE REPLACEMENT PROPOSAL
                </p>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setExpanded(false)}
                  className="shrink-0 size-4 flex items-center justify-center bg-transparent border-0 cursor-pointer"
                >
                  <CloseX />
                </button>
              </div>
              <div className="flex items-center pr-8 w-full">
                <p className="flex-1 text-[14px] text-[#262626] leading-normal">
                  1722 Willis Ave NW, Grand Rapids, MI 49504
                </p>
              </div>
            </div>

            {/* Tab list — rendered with a gap above to match
                TITLE_TO_LIST_GAP_PX. The active tab stays opacity:1 so, as
                the panel translates, its label appears to slide down from
                the collapsed row into its expanded-menu slot. Non-active
                items fade in top-to-bottom with a stagger. */}
            <div className="flex flex-col w-full" style={{ marginTop: TITLE_TO_LIST_GAP_PX }}>
              {PROJECT_HUB_TABS.map((t, i) => {
                const isActive = t.id === active;
                // Non-active tabs fade in after the active label reaches its
                // expanded position. On close they fade back out immediately.
                const itemDelay = open ? MENU_ITEM_DELAY_0 + i * MENU_ITEM_STAGGER : 0;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pickTab(t.id)}
                    className="w-full text-left px-4 sm:px-6 flex items-center bg-white border-0 cursor-pointer"
                    style={{
                      height: ROW_HEIGHT_PX,
                      opacity: isActive ? 1 : open ? 1 : 0,
                      transition: isActive
                        ? undefined
                        : `opacity ${MENU_ITEM_MS}ms ease-out ${itemDelay}ms`,
                    }}
                  >
                    <span
                      className="text-[16px] leading-normal"
                      style={{
                        color: isActive ? '#262626' : 'rgba(0,0,0,0.85)',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {t.mobileMenuLabel ?? t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop (L/XL/XXL, lg+) — Figma 864:24060
// Horizontal tab row with a 2px underline on the active tab.
// ─────────────────────────────────────────────────────────────────────────────
function DesktopHeader({
  active,
  onChange,
}: {
  active: ProjectHubTab;
  onChange: (tab: ProjectHubTab) => void;
}) {
  // Refs for the container + each tab button, so we can measure the active
  // tab's position and slide the underline between tabs on change.
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs      = useRef<(HTMLButtonElement | null)[]>([]);

  // Underline geometry (null until first measurement). When null the
  // indicator is not rendered — this avoids an initial slide-in from 0.
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);
  // After the first render we flip a flag so subsequent active-tab changes
  // animate the underline. The very first positioning happens without a
  // transition to avoid a visible slide from the container's left edge.
  const hasPositioned = useRef(false);
  const [animateUnderline, setAnimateUnderline] = useState(false);

  useEffect(() => {
    const activeIdx = PROJECT_HUB_TABS.findIndex((t) => t.id === active);
    const btn       = tabRefs.current[activeIdx];
    const container = containerRef.current;
    if (!btn || !container) return;

    const recalc = () => {
      const btnRect       = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setUnderline({
        left:  btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    };

    recalc();
    // After the first recalc enable the sliding transition for subsequent
    // changes (active tab click or resize).
    if (!hasPositioned.current) {
      hasPositioned.current = true;
      // Defer one frame so the initial position paints first without animation.
      requestAnimationFrame(() => setAnimateUnderline(true));
    }

    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="hidden lg:flex bg-white w-full border-b-[0.5px] border-[rgba(0,0,0,0.2)] items-center px-6 relative"
      style={{ fontFamily: 'Segoe UI, sans-serif', gap: 24 }}
    >
      {PROJECT_HUB_TABS.map((t, i) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            type="button"
            onClick={() => onChange(t.id)}
            className="flex items-center justify-center bg-transparent border-0 cursor-pointer"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 12,
              // Reserve the underline's 2px of space under every tab so
              // heights stay consistent (the actual underline is a single
              // absolutely-positioned element below).
              paddingBottom: 12,
            }}
          >
            {/* Ghost-text trick: render an invisible bold copy to reserve
                the widest possible width, and stack the real (variable-
                weight) label on top. This prevents horizontal jitter when
                the active-tab weight flips between 400 and 600. */}
            <span
              className="relative inline-block text-[14px] whitespace-nowrap"
              style={{ lineHeight: '18px' }}
            >
              <span
                aria-hidden="true"
                className="invisible"
                style={{ fontWeight: 600 }}
              >
                {t.label}
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  color: 'rgba(0,0,0,0.85)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {t.label}
              </span>
            </span>
          </button>
        );
      })}
      {/* Sliding active-tab underline. Positioned absolutely so it can
          animate `left` / `width` between tabs without reflowing siblings.
          Height 2px; sits over the 0.5px container bottom border. */}
      {underline && (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left:   underline.left,
            width:  underline.width,
            bottom: 0,
            height: 2,
            background: '#262626',
            transition: animateUnderline
              ? 'left 280ms cubic-bezier(0.4, 0, 0.2, 1), width 280ms cubic-bezier(0.4, 0, 0.2, 1)'
              : 'none',
          }}
        />
      )}
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────
function ChevronDown({ rotated = false }: { rotated?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
      }}
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseX() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function ProjectHubStickyHeader({
  active,
  onChange,
}: {
  active: ProjectHubTab;
  onChange: (tab: ProjectHubTab) => void;
}) {
  return (
    <>
      <MobileHeader active={active} onChange={onChange} />
      <DesktopHeader active={active} onChange={onChange} />
    </>
  );
}
