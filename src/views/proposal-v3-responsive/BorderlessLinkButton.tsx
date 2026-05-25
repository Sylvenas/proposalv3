'use client';

// ── BorderlessLinkButton ──────────────────────────────────────────────────────
// The small, borderless "icon + label" action used at the bottom of a CTA
// stack — e.g. Project Hub's "View Invoice & Payment Record" and Change
// Order's "Download Change Order Doc [PDF]" / "Download Signed Contract [PDF]".
//
// Responsive rules (frozen here so every consumer stays in sync):
//   • Layout: left-aligned (justify-start), 8px gap between icon and label
//   • Spacing: px-0 py-1, no fixed height; mt-4 at <lg, mt-3 at lg+ to
//     separate from the bordered button stack above.
//   • Label: 14px / rgba(0,0,0,0.85), lineHeight 18px, no wrap.
//   • Border: none. Background: transparent.

import type { MouseEventHandler, ReactNode } from 'react';

export default function BorderlessLinkButton({
  icon,
  label,
  onClick,
  tight = false,
}: {
  icon: ReactNode;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** When true, drops the leading mt-4/mt-3 separator. Use this on the
   *  second (and later) consecutive BorderlessLinkButton in a stack —
   *  the first button's own `py-1` already provides enough breathing
   *  room, so the default top-margin would visibly over-separate them. */
  tight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-transparent border-0 flex gap-[8px] items-center justify-start px-0 py-1 w-full cursor-pointer${
        tight ? '' : ' mt-4 lg:mt-3'
      }`}
    >
      {/* Fixed-width icon slot keeps the label's left edge aligned across
          consecutive borderless links even when their intrinsic icon sizes
          differ (e.g. the 18px clock vs the 14px download glyph). The icon
          is centered inside this slot so smaller glyphs don't shift the
          text leftward. */}
      <span
        className="shrink-0 inline-flex items-center justify-center"
        style={{ width: 18 }}
      >
        {icon}
      </span>
      <span
        className="text-[14px] text-[rgba(0,0,0,0.85)] whitespace-nowrap"
        style={{ lineHeight: '18px' }}
      >
        {label}
      </span>
    </button>
  );
}
