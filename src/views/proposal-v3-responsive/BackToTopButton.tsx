'use client';

// ── Shared Back to Top button ─────────────────────────────────────────────────
// Exact same markup and styling as the primary Back-to-Top button in
// OptionsPageResponsive (the full-size variant, not the compact 91px one).

const IMG_ARROW_UP = '/images/proposal-v3-responsive/arrow-up.svg';

export default function BackToTopButton({
  onClick,
  transparent = false,
}: {
  onClick: () => void;
  /** When true, drops the white fill so the button blends into a tinted
   *  container (used by Change History where the surrounding panel is
   *  already `#f5f5f5`). */
  transparent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 h-10 ${
        transparent ? 'bg-transparent' : 'bg-white'
      } rounded-[4px] px-3 py-1.5 w-[276px] justify-center cursor-pointer`}
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <img src={IMG_ARROW_UP} alt="" style={{ width: 16, height: 16, display: 'block', flexShrink: 0 }} />
      <span className="text-[14px] text-[rgba(0,0,0,0.85)] leading-[18px] whitespace-nowrap">
        Back to Top
      </span>
    </button>
  );
}
