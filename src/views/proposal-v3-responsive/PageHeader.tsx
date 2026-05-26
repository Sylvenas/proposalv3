'use client';

// ── Shared PageHeader ─────────────────────────────────────────────────────────
// Reused by OptionsPageResponsive and SummaryPageResponsive.
// Figma variables:
//   Low Density  (XS/S <md):  --margin=8px, --s=8px,  h=48px
//   Medium Density (M+ md+):  --margin=12px, --s=12px, h=48px
// px responsive: XS px-4 | S/M/L+ px-6  →  px-4 sm:px-6

import { useDevConsole } from './DevConsoleContext';
import { Home, User } from './icons';

const IMG_HEADER_LOGO = '/images/proposal-v3-responsive/header-logo.webp';

export default function PageHeader({ onShowCover }: { onShowCover: () => void }) {
  const { open: openDevConsole } = useDevConsole();
  return (
    <header className="relative z-[51] w-full bg-white flex items-center justify-center h-12 px-4 sm:px-6">
      <div className="flex items-center justify-between w-full max-w-[1024px]">
        {/* Home icon */}
        <button
          onClick={onShowCover}
          className="relative shrink-0 cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center"
          style={{ width: 24, height: 24 }}
          aria-label="Back to cover"
        >
          <Home size={24} />
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

        {/* User icon — doubles as the entry point to the prototype Developer Console. */}
        <button
          onClick={openDevConsole}
          className="relative shrink-0 cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center"
          style={{ width: 24, height: 24 }}
          aria-label="Open developer console"
        >
          <User size={24} />
        </button>
      </div>
    </header>
  );
}
