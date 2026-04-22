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

// Exit: physical "curtain retract" — panel first dips down a few px with
// ease-out (the curtain loads its spring), then accelerates upward with
// ease-in (the spring snaps it closed). Backdrop fades across the whole exit.
const EXIT_OVERSHOOT_PX    = 14;
const EXIT_OVERSHOOT_MS    = 160;
const EXIT_RETRACT_MS      = 340;
const EXIT_TOTAL_MS        = EXIT_OVERSHOOT_MS + EXIT_RETRACT_MS;
// Overshoot: strong ease-out so it decelerates into the bottom of the dip.
const EXIT_OVERSHOOT_EASE  = 'cubic-bezier(0.16, 1, 0.3, 1)';
// Retract: ease-in so it accelerates as it snaps up, like a released spring.
const EXIT_RETRACT_EASE    = 'cubic-bezier(0.5, 0, 0.75, 0)';

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
  // Flow (close) — two-phase "curtain retract":
  //   phase 1 (EXIT_OVERSHOOT_MS, ease-out): panel dips down by
  //           EXIT_OVERSHOOT_PX (spring loads); content stays fully visible.
  //   phase 2 (EXIT_RETRACT_MS, ease-in):    panel snaps up to offsetY,
  //           accelerating as it goes; title + non-active items fade with it.
  //   backdrop fades + un-blurs linearly across EXIT_TOTAL_MS, reaching
  //   fully clear exactly as the panel finishes and unmounts.
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [offsetY, setOffsetY]   = useState(0);
  // Exit-only two-phase state. 0: not exiting (or during open). 1: overshoot
  // dip downward. 2: retract upward. Used to pick the panel's transform + the
  // transition timing for each leg of the curtain animation.
  const [exitPhase, setExitPhase] = useState<0 | 1 | 2>(0);
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
      setExitPhase(0);
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
    // Close: start the two-phase curtain retract. Phase 1 pulls the panel
    // down EXIT_OVERSHOOT_PX with ease-out; phase 2 snaps it up to offsetY
    // with ease-in. Backdrop fades across the full EXIT_TOTAL_MS.
    // Guard: only run when the panel is actually mounted. Without this, the
    // effect's close branch fires on every initial render (expanded starts
    // false) and on every `active`-prop change while closed, scheduling
    // phantom timers and churning state for a panel that doesn't exist.
    if (!mounted) return;
    setOpen(false);
    setExitPhase(1);
    const tPhase2 = window.setTimeout(() => setExitPhase(2), EXIT_OVERSHOOT_MS);
    const tUnmount = window.setTimeout(() => {
      setMounted(false);
      setExitPhase(0);
    }, EXIT_TOTAL_MS);
    return () => {
      window.clearTimeout(tPhase2);
      window.clearTimeout(tUnmount);
    };
  }, [expanded, activeTopInMenu, mounted]);

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
              background: open ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
              // Blur clears to 0px across the full exit so the page behind
              // sharpens gradually, reaching crisp exactly as the panel
              // finishes retracting.
              backdropFilter: open ? 'blur(8px)' : 'blur(0px)',
              WebkitBackdropFilter: open ? 'blur(8px)' : 'blur(0px)',
              opacity: open ? 1 : 0,
              transition: open
                ? `opacity ${MENU_SLIDE_MS}ms ${MENU_EASE_OUT}, background-color ${MENU_SLIDE_MS}ms ${MENU_EASE_OUT}, backdrop-filter ${MENU_SLIDE_MS}ms ${MENU_EASE_OUT}, -webkit-backdrop-filter ${MENU_SLIDE_MS}ms ${MENU_EASE_OUT}`
                : `opacity ${EXIT_TOTAL_MS}ms linear, background-color ${EXIT_TOTAL_MS}ms linear, backdrop-filter ${EXIT_TOTAL_MS}ms linear, -webkit-backdrop-filter ${EXIT_TOTAL_MS}ms linear`,
            }}
          />

          {/* Menu panel — fixed to the viewport top. Initial transform is
              translateY(offsetY) so the active tab's menu row aligns exactly
              with the collapsed-row position; the panel then slides up to
              translateY(0), which visually moves the active label down into
              its expanded-menu position while extending the bg to page top. */}
          <div
            className="fixed left-0 right-0 z-[61] bg-white flex flex-col pb-3"
            style={{
              // Extend the panel EXIT_OVERSHOOT_PX above the viewport and pad
              // the content down by the same amount. When the panel dips
              // downward during phase 1, the white background's top edge
              // stays at (or above) y=0, so the backdrop is never exposed
              // along the top. Content visually starts at y=0 when open, the
              // same as before the extension.
              top: -EXIT_OVERSHOOT_PX,
              paddingTop: EXIT_OVERSHOOT_PX,
              boxShadow: '0px 4px 3px 0px rgba(123,123,123,0.1)',
              transform: open
                ? 'translateY(0)'
                : exitPhase === 1
                  ? `translateY(${EXIT_OVERSHOOT_PX}px)`
                  : `translateY(${offsetY}px)`,
              transition: open
                ? `transform ${MENU_SLIDE_MS}ms ${MENU_EASE_OUT}`
                : exitPhase === 1
                  ? `transform ${EXIT_OVERSHOOT_MS}ms ${EXIT_OVERSHOOT_EASE}`
                  : `transform ${EXIT_RETRACT_MS}ms ${EXIT_RETRACT_EASE}`,
              willChange: 'transform',
            }}
          >
            {/* Title block — fades in after the panel has mostly settled so
                the "Proposal Name + Project Name" appear at the top. */}
            <div
              className="flex flex-col px-4 sm:px-6 pt-2 pb-2 w-full"
              style={{
                height: TITLE_BLOCK_HEIGHT_PX,
                // During the overshoot (phase 1) the title stays fully
                // visible; it only fades while the panel is retracting
                // upward (phase 2), so the copy rolls up with the curtain.
                opacity: open || exitPhase === 1 ? 1 : 0,
                transition: open
                  ? `opacity ${MENU_TITLE_MS}ms ease-out ${MENU_TITLE_DELAY}ms`
                  : `opacity ${EXIT_RETRACT_MS}ms ease-in`,
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
                      opacity: isActive ? 1 : open || exitPhase === 1 ? 1 : 0,
                      transition: isActive
                        ? undefined
                        : open
                          ? `opacity ${MENU_ITEM_MS}ms ease-out ${itemDelay}ms`
                          : `opacity ${EXIT_RETRACT_MS}ms ease-in`,
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
            // Pull the underline down by the container's 0.5px bottom border
            // so its 2px bar sits flush with (and covers) the divider line,
            // instead of stacking above it.
            bottom: -0.5,
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
