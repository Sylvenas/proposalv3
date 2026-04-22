'use client';

// ── Work-in-progress placeholder ─────────────────────────────────────────────
// Temporary content shown on tabs that haven't been built yet (Invoices &
// Payments, Change History). Centered illustration + short "coming soon" line.

const IMG_WIP = '/images/proposal-v3-responsive/working-in-progress.svg';

export default function WorkInProgressSection() {
  return (
    <div
      className="flex flex-col items-center justify-center w-full py-24 gap-6"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* SVG is percentage-sized internally (no intrinsic dimensions), so set
          an explicit width AND aspect ratio to render at a sensible size. */}
      <img
        src={IMG_WIP}
        alt=""
        className="block w-[236px]"
        style={{ aspectRatio: '266 / 150' }}
      />
      <p className="text-[14px] xl:text-[16px] text-[#262626] leading-normal text-center">
        We&rsquo;re working on it — coming soon
      </p>
    </div>
  );
}
