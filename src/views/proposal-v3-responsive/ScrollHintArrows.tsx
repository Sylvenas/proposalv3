'use client';

import { RefObject, useEffect, useState } from 'react';

// ── Shared Scroll Hint Arrows ────────────────────────────────────────────────
// Bouncing chevron arrows shown at the top/bottom edge of a scroll container
// when the user can still scroll further in that direction. Used inside the
// Make Payment and Invoice/Payment Detail bottom-sheets (and their desktop
// modal counterparts) so users always know there's more content off-screen.
//
// Usage:
//   <div className="relative flex-1 min-h-0 flex flex-col">
//     <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">…</div>
//     <ScrollHintArrows targetRef={scrollRef} />
//   </div>
//
// The parent of <ScrollHintArrows> must be `position: relative` so the
// absolutely-positioned arrows anchor to the scroll viewport.

type Props = {
  targetRef: RefObject<HTMLElement | null>;
  /** Vertical inset from the top edge of the scroll viewport. Default 8px. */
  topInset?: number;
  /** Vertical inset from the bottom edge of the scroll viewport. Default 8px. */
  bottomInset?: number;
};

export default function ScrollHintArrows({
  targetRef,
  topInset = 8,
  bottomInset = 8,
}: Props) {
  const [canUp, setCanUp] = useState(false);
  const [canDown, setCanDown] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      // 1px tolerance for sub-pixel rounding.
      setCanUp(scrollTop > 1);
      setCanDown(scrollTop + clientHeight < scrollHeight - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });

    // Track size changes (content added/removed, viewport resize, etc.).
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Also observe the inner content so we react when its height changes.
    const firstChild = el.firstElementChild;
    if (firstChild) ro.observe(firstChild);

    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [targetRef]);

  return (
    <>
      <style>{`
        @keyframes scrollHintBounceUp {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -4px); }
        }
        @keyframes scrollHintBounceDown {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, 4px); }
        }
        .scroll-hint-arrow {
          position: absolute;
          left: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 200ms ease;
          z-index: 2;
        }
        .scroll-hint-arrow.is-visible { opacity: 1; }
        .scroll-hint-arrow-up { animation: scrollHintBounceUp 1.4s ease-in-out infinite; }
        .scroll-hint-arrow-down { animation: scrollHintBounceDown 1.4s ease-in-out infinite; }
      `}</style>
      <div
        aria-hidden="true"
        className={`scroll-hint-arrow scroll-hint-arrow-up${canUp ? ' is-visible' : ''}`}
        style={{ top: topInset }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 8.5L7 4.5L11 8.5"
            stroke="#262626"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        aria-hidden="true"
        className={`scroll-hint-arrow scroll-hint-arrow-down${canDown ? ' is-visible' : ''}`}
        style={{ bottom: bottomInset }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 5.5L7 9.5L11 5.5"
            stroke="#262626"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
