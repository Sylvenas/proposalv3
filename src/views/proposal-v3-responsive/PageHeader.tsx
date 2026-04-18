'use client';

// ── Shared PageHeader ─────────────────────────────────────────────────────────
// Reused by OptionsPageResponsive and SummaryPageResponsive.
// Figma variables:
//   Low Density  (XS/S <md):  --margin=8px, --s=8px,  h=48px
//   Medium Density (M+ md+):  --margin=12px, --s=12px, h=48px
// px responsive: XS px-4 | S/M/L+ px-6  →  px-4 sm:px-6

const BASE = '/images/proposal-v3-responsive';
const IMG_HEADER_HOME = `${BASE}/header-home.svg`;
const IMG_HEADER_LOGO = `${BASE}/header-logo.webp`;
const IMG_HEADER_USER = `${BASE}/header-user.svg`;

export default function PageHeader({ onShowCover }: { onShowCover: () => void }) {
  return (
    <header className="w-full bg-white flex items-center justify-center h-12 px-4 sm:px-6">
      <div className="flex items-center justify-between w-full max-w-[1024px]">
        {/* Home icon: 24×24 clip box, vector 17.99×15.98px centred inside */}
        <button
          onClick={onShowCover}
          className="relative shrink-0 overflow-clip cursor-pointer bg-transparent border-0 p-0"
          style={{ width: 24, height: 24 }}
          aria-label="Back to cover"
        >
          <div
            className="absolute"
            style={{
              width: 17.99,
              height: 15.977,
              left: 'calc(50% - 0.02px)',
              top: 'calc(50% + 0.01px)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src={IMG_HEADER_HOME}
              alt=""
              className="absolute inset-0 block w-full h-full"
              style={{ maxWidth: 'none' }}
            />
          </div>
        </button>

        {/* Logo 87×24 */}
        <div className="relative shrink-0" style={{ width: 87, height: 24 }}>
          <img
            src={IMG_HEADER_LOGO}
            alt="Madison Fence Company"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ maxWidth: 'none' }}
          />
        </div>

        {/* User icon: 24×24 clip box, vector 14×15.98px centred inside */}
        <div className="relative shrink-0 overflow-clip" style={{ width: 24, height: 24 }}>
          <div
            className="absolute"
            style={{
              width: 14,
              height: 15.977,
              left: '50%',
              top: 'calc(50% + 0.01px)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src={IMG_HEADER_USER}
              alt="User"
              className="absolute inset-0 block w-full h-full"
              style={{ maxWidth: 'none' }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
