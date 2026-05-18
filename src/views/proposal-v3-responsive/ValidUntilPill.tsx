'use client';

// ── ValidUntilPill ────────────────────────────────────────────────────────────
// Shared "Valid Until <date>" pill used by both the Cover page (centered under
// the proposal title) and the Change Order page's right-side summary header.
// One source of truth keeps the padding / text-size / icon-size responsive
// rules in sync across the two surfaces.
//
// Responsive rules (from the original CoverPageContent inline pill):
//   • Padding:  px-4 py-2.5 at <xl, px-5 py-3 at xl+
//   • Text:     14px at <xl, 16px at xl+
//   • Icon:     16px calendar glyph at all breakpoints
//   • Radius:   6px
//   • Background: #f5f5f5
//
// Alignment is left to the caller via `className` (e.g. `self-center` on the
// cover's centered stack vs `self-start` inside the Change Order right column).

import { CalendarIcon } from './SvgIcons';

export default function ValidUntilPill({
  date,
  className = '',
}: {
  date: string;
  /** Extra wrapper classes — typically used for alignment (`self-center`,
   *  `self-start`) inside the caller's flex container. */
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-[#f5f5f5] px-4 py-2.5 xl:px-5 xl:py-3 rounded-[6px] ${className}`}
    >
      <span className="text-[14px] xl:text-[16px] text-[#262626] leading-none">
        Valid Until
      </span>
      {/* Icon + date kept on a tighter inner gap (4px) so the calendar glyph
          reads as a prefix on the date rather than a third equal item. */}
      <span className="inline-flex items-center gap-1">
        <CalendarIcon size={16} />
        <span className="text-[14px] xl:text-[16px] text-[#262626] leading-none">
          {date}
        </span>
      </span>
    </div>
  );
}
