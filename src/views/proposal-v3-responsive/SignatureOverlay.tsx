'use client';

import { useEffect, useRef, useState } from 'react';

// ── Animation constants ──────────────────────────────────────────────────────
const ANIM_MS = 300;
const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';
const EASE_IN  = 'cubic-bezier(0.32, 0, 0.67, 0)';

// Simulated contract-generation delay. The real integration will replace
// this with an actual fetch lifecycle.
const SKELETON_MS = 2000;

// ── Asset paths ───────────────────────────────────────────────────────────────
const BASE = '/images/proposal-v3-responsive';
const IMG_ZOOM_IN      = `${BASE}/zoom-in.svg`;
const IMG_ZOOM_OUT     = `${BASE}/zoom-out.svg`;
const IMG_ZOOM_FIT     = `${BASE}/zoom-fit.svg`;
const IMG_CONTRACT_P1  = `${BASE}/contract-page-1.png`;
const IMG_CONTRACT_P2  = `${BASE}/contract-page-2.png`;
const IMG_CONTRACT_P3  = `${BASE}/contract-page-3.png`;
const IMG_CONTRACT_P4  = `${BASE}/contract-page-4.png`;

const PDF_PAGES: { src: string; ratio: string }[] = [
  // aspect = width/height from Figma slot sizes
  { src: IMG_CONTRACT_P1, ratio: '2448/3168' },
  { src: IMG_CONTRACT_P2, ratio: '2193/2838' },
  { src: IMG_CONTRACT_P3, ratio: '1700/2200' },
  { src: IMG_CONTRACT_P4, ratio: '2487/4096' },
];

// ── Tokens (per-breakpoint, from Figma variables) ────────────────────────────
// Mobile layout (<lg):
//   XS  (<640) : Margin=16, Overlay-Inner=16, Gutter=16, Font-M=14, Font-S=12, XXS=8
//   S   (640+) : Margin=24, Overlay-Inner=24, Gutter=16, Font-M=16, Font-S=14, XXS=8
//   M   (768+) : same as S
// Desktop layout (lg+):
//   L   (1024+): Overlay-Outer=24, Overlay-Inner=32, Gap(XL)=32, L=24, Gutter=12,  Font-L=20, Font-S=14
//   XL  (1280+): Overlay-Outer=24, Overlay-Inner=48, Gap(XL)=32, L=24, Gutter=12,  Font-L=24, Font-S=16
//   XXL (1536+): Overlay-Outer=32, Overlay-Inner=48, Gap(XL)=32, L=24, Gutter=12,  Font-L=24, Font-S=16

// ── Zoom Button ───────────────────────────────────────────────────────────────
function ZoomButton({ icon, alt }: { icon: string; alt: string }) {
  return (
    <button
      className="flex items-center justify-center rounded-[4px] shrink-0 cursor-pointer border-0"
      style={{
        width: 48,
        height: 48,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0px 0px 2px 0px rgba(0,0,0,0.25)',
      }}
    >
      {/* SVGs default their `fill="var(--fill-0, white)"` to white,
          so no color filter is needed. */}
      <img src={icon} alt={alt} style={{ width: 24, height: 24 }} />
    </button>
  );
}

// ── Skeleton page ────────────────────────────────────────────────────────────
// Generic "contract document" placeholder: centered title + date, then a
// few numbered sections (each a heading line + justified body lines), and
// a signature block at the bottom. No borders — the very light page fill
// (#f5f5f5) is what separates consecutive pages on the scroll.
//
// Sizes are expressed as CSS cqw (container-query-width) units so that
// everything scales with the page width, regardless of aspect ratio.
// Container queries need a `container-type` on the wrapper, applied inline.
function SkeletonPage({ ratio, pageIndex }: { ratio: string; pageIndex: number }) {
  // Seeded pseudo-random so layout is stable per page but varies page-to-page.
  const rand = (i: number) => {
    const x = Math.sin((pageIndex + 1) * 9.73 + i * 4.31) * 10000;
    return x - Math.floor(x);
  };

  // Design the skeleton for a ~1:1.3 page: sizes are in cqw (1cqw = 1% of
  // page width). Heights chosen so a full page reads as a document.
  const LINE_H        = '1.6cqw';
  const LINE_GAP      = '1.2cqw';
  const HEADING_H     = '2.2cqw';
  const TITLE_H       = '3.4cqw';
  const SUBTITLE_H    = '1.8cqw';
  const SIGNATURE_H   = '1.9cqw';
  const SIGNATURE_LABEL_H = '1.4cqw';
  const SECTION_GAP   = '3.5cqw';
  const PAD_X         = '10cqw';
  const PAD_Y         = '8cqw';

  const Line = ({ w, height = LINE_H, bg = '#e8e8e8' }: { w: string; height?: string; bg?: string }) => (
    <div style={{ width: w, height, background: bg, borderRadius: 2, flexShrink: 0 }} />
  );

  const Section = ({ bodyLines, offset }: { bodyLines: number; offset: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: LINE_GAP, width: '100%' }}>
      <Line w={`${28 + rand(offset) * 18}cqw`} height={HEADING_H} bg="#dcdcdc" />
      {Array.from({ length: bodyLines }).map((_, i) => (
        <Line
          key={i}
          w={
            i === bodyLines - 1
              ? `${40 + rand(offset + i + 1) * 30}cqw`
              : '100%'
          }
        />
      ))}
    </div>
  );

  return (
    <div
      className="relative w-full bg-[#f5f5f5] shrink-0 overflow-hidden"
      style={{ aspectRatio: ratio, containerType: 'inline-size' }}
    >
      <div
        className="absolute inset-0 flex flex-col items-stretch"
        style={{
          padding: `${PAD_Y} ${PAD_X}`,
          gap: SECTION_GAP,
        }}
      >
        {/* Title — centred, bold */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: LINE_GAP, marginBottom: '2cqw', flexShrink: 0 }}>
          <Line w="42cqw" height={TITLE_H} bg="#cfcfcf" />
          <Line w="24cqw" height={SUBTITLE_H} bg="#dcdcdc" />
        </div>

        <Section bodyLines={6} offset={0} />
        <Section bodyLines={5} offset={10} />
        <Section bodyLines={4} offset={20} />

        {/* Signature block at bottom — two side-by-side signers */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: '6cqw',
            width: '100%',
            paddingTop: '4cqw',
            flexShrink: 0,
          }}
        >
          {[0, 1].map((i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.4cqw' }}>
              <Line w="60%" height={SIGNATURE_LABEL_H} bg="#dcdcdc" />
              <div style={{ height: '6cqw' }} />
              <Line w="85%" height={SIGNATURE_H} bg="#cfcfcf" />
              <Line w="45%" height={SIGNATURE_LABEL_H} />
            </div>
          ))}
        </div>
      </div>

      {/* Shimmer sweep overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
          animation: 'signatureSkeletonShimmer 1.4s linear infinite',
        }}
      />
    </div>
  );
}

// ── PDF Viewer ────────────────────────────────────────────────────────────────
// Mobile (<lg): View Controls at top-right (floating). PDF content scrolls.
// Desktop (lg+): View Controls at bottom-left (floating). PDF content scrolls.
function PdfViewer({
  mobileLayout,
  loading,
}: {
  mobileLayout: boolean;
  loading: boolean;
}) {
  const pages = (
    <div
      className={
        mobileLayout
          // Top padding: clears the floating view-control row (48px button +
          // 8-12px offset) so the first page isn't covered.
          // Bottom padding: clears the bottom-sheet's upward shadow on the
          // last page.
          ? 'flex flex-col gap-4 w-full px-4 sm:px-6 pt-[72px] pb-16'
          : 'flex flex-col gap-3 w-full pb-16'
      }
    >
      {PDF_PAGES.map((p, i) =>
        loading ? (
          <SkeletonPage key={i} ratio={p.ratio} pageIndex={i} />
        ) : (
          <div
            key={i}
            className="relative w-full border-[0.5px] border-[#d9d9d9] bg-white shrink-0"
            style={{ aspectRatio: p.ratio }}
          >
            <img
              src={p.src}
              alt={`Contract page ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          </div>
        )
      )}
    </div>
  );

  const controls = (
    <div className="flex gap-3 pointer-events-auto">
      <ZoomButton icon={IMG_ZOOM_IN} alt="Zoom in" />
      <ZoomButton icon={IMG_ZOOM_OUT} alt="Zoom out" />
      <ZoomButton icon={IMG_ZOOM_FIT} alt="Fit" />
    </div>
  );

  // Auto-hiding scrollbar: add a `.scrolling` class while the user is actively
  // scrolling and remove it after a short pause. The thin rail + thumb live in
  // a scoped stylesheet at the top of the overlay.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timer: number | undefined;
    const onScroll = () => {
      el.classList.add('scrolling');
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => el.classList.remove('scrolling'), 700);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  // A wrapping relative container lets the controls overlay the scroll area
  // without affecting PDF content layout (controls are h-0 in Figma).
  return (
    <div
      className="relative flex-1 min-w-0 min-h-0 w-full"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Scroll area — fills its parent */}
      <div
        ref={scrollRef}
        className="signature-pdf-scroll absolute inset-0 overflow-y-auto"
      >
        {pages}
      </div>

      {/* Floating View Controls */}
      {mobileLayout ? (
        // Mobile: top-right, padding aligns with PDF content padding
        <div className="pointer-events-none absolute top-0 right-0 flex justify-end pt-2 sm:pt-3 pr-4 sm:pr-6">
          {controls}
        </div>
      ) : (
        // Desktop: bottom-left
        <div className="pointer-events-none absolute left-0 bottom-0 flex p-4">
          {controls}
        </div>
      )}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────────
// Simple circular spinner — white stroke on transparent so it reads against
// the red Sign button when disabled. Animation defined alongside the
// skeleton-shimmer keyframes in the main overlay style block.
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ animation: 'signatureSpinnerRotate 0.9s linear infinite', flexShrink: 0 }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="white" strokeOpacity="0.35" strokeWidth="1.75" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

// ── Signature Utility ─────────────────────────────────────────────────────────
// Mobile: bg-white + shadow, padding = Margin, gap = XXS(8),
//         title Font-M + tracking -0.04em, description Font-S light,
//         Cancel + Sign buttons side-by-side (gap XXS=8), each flex-1, h-10.
// Desktop: no background/shadow (host card already provides it), gap-24,
//          title Font-L, description Font-S, single Sign button full-width.
function SignatureUtility({
  clientName,
  mobileLayout,
  disabled,
  onCancel,
  onSign,
}: {
  clientName: string;
  mobileLayout: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSign: () => void;
}) {
  if (mobileLayout) {
    return (
      <div
        className="relative z-[1] flex flex-col gap-2 w-full p-4 sm:p-6 bg-white shrink-0"
        style={{
          fontFamily: 'Segoe UI, sans-serif',
          // Mirror the Figma "shadow/02 medium" elevation vertically so the
          // bottom-sheet casts its shadow UP over the PDF content above
          // (default +y offset would put the shadow below the viewport).
          boxShadow: '0px -2px 4px 0px rgba(0,0,0,0.12), 0px -4px 24px 0px rgba(0,0,0,0.2)',
        }}
      >
        {/* Title — Font M: 14 XS / 16 S+ */}
        <p
          className="w-full text-[14px] sm:text-[16px] text-[#262626] leading-normal"
          style={{ letterSpacing: '-0.04em' }}
        >
          Sign Contract as {clientName}
        </p>
        {/* Description — Font S: 12 XS / 14 S+, light */}
        <p
          className="w-full text-[12px] sm:text-[14px] text-[#262626] leading-normal"
          style={{ fontWeight: 300 }}
        >
          Please review your final project selections and contract details before signing.
          By signing below, you confirm your acceptance of the scope, pricing, and terms
          outlined in this agreement.
        </p>
        {/* Buttons row — gap = XXS(8) */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 min-w-0 h-10 flex items-center justify-center rounded-[2px] bg-white border-[0.5px] border-solid border-[#262626] cursor-pointer"
            style={{ paddingLeft: 16, paddingRight: 16 }}
          >
            <span
              className="text-[14px] sm:text-[16px] text-[rgba(0,0,0,0.85)] whitespace-nowrap"
              style={{ lineHeight: '18px' }}
            >
              Cancel
            </span>
          </button>
          <button
            onClick={onSign}
            disabled={disabled}
            className="flex-1 min-w-0 h-10 flex items-center justify-center gap-2 rounded-[2px] bg-[#d41a32] cursor-pointer border-0 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ paddingLeft: 16, paddingRight: 16 }}
          >
            {disabled && <Spinner />}
            <span
              className="text-[14px] sm:text-[16px] font-semibold text-white whitespace-nowrap"
              style={{ lineHeight: '18px' }}
            >
              {disabled ? 'Loading Contract' : 'Next Field (3)'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div
      className="flex flex-col gap-6 w-full"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Title — Font L: 20 L / 24 XL+ */}
      <p
        className="w-full text-[20px] xl:text-[24px] text-[#262626] leading-normal"
        style={{ letterSpacing: '-0.04em' }}
      >
        Sign Contract as {clientName}
      </p>
      {/* Description — Font S: 14 L / 16 XL+, light */}
      <p
        className="w-full text-[14px] xl:text-[16px] text-[#262626] leading-normal"
        style={{ fontWeight: 300 }}
      >
        Please review your final project selections and contract details before signing.
        By signing below, you confirm your acceptance of the scope, pricing, and terms
        outlined in this agreement.
      </p>
      {/* Single full-width Sign button */}
      <button
        onClick={onSign}
        disabled={disabled}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-[2px] bg-[#d41a32] cursor-pointer border-0 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ paddingLeft: 16, paddingRight: 16 }}
      >
        {disabled && <Spinner />}
        <span
          className="text-[16px] font-semibold text-white whitespace-nowrap"
          style={{ lineHeight: '18px' }}
        >
          {disabled ? 'Loading Contract' : 'Next Field (3)'}
        </span>
      </button>
    </div>
  );
}

// ── Main Overlay ──────────────────────────────────────────────────────────────
// Self-manages enter/exit animations. On mount, slides up from bottom (and
// fades in the backdrop). When `onClose` is requested (X, backdrop click,
// Cancel button, Esc), it first slides out, then after the animation
// completes it notifies the parent to unmount via the `onClose` prop.
export default function SignatureOverlay({
  clientName,
  onClose,
}: {
  clientName: string;
  onClose: () => void;
}) {
  // `open`: drives CSS transform + opacity. Starts false so the first paint
  //   has translateY(100%), then rAF flips it to true for the slide-in.
  // `closing`: once true, we're animating out; ignore further close triggers.
  const [open, setOpen]       = useState(false);
  const [closing, setClosing] = useState(false);
  // Loading state — starts true; simulate a contract-generation delay, then
  // swap the skeleton for real PDF pages and enable the Sign button.
  const [loading, setLoading] = useState(true);

  // Trigger enter animation one frame after mount (so the initial
  // translateY(100%)/opacity:0 state renders first).
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Simulated loading timer.
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), SKELETON_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Shared close path: start exit animation, then notify parent after it
  // completes. Guarded so rapid clicks don't schedule multiple unmounts.
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    setOpen(false);
    window.setTimeout(onClose, ANIM_MS);
  };

  // Close on Esc + lock body scroll while the overlay is mounted.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  // requestClose is stable enough for this component's lifecycle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSign = () => {
    // Placeholder — real signature flow not implemented yet.
  };

  // Direction-aware easing: enter uses ease-out (decelerate into place),
  // exit uses ease-in (accelerate off-screen).
  const easing = open ? EASE_OUT : EASE_IN;
  const slideStyle: React.CSSProperties = {
    transform: open ? 'translateY(0)' : 'translateY(100%)',
    transition: `transform ${ANIM_MS}ms ${easing}`,
  };
  const fadeStyle: React.CSSProperties = {
    opacity: open ? 1 : 0,
    transition: `opacity ${ANIM_MS}ms ${easing}`,
  };

  return (
    <>
      {/* Global shimmer keyframes for the skeleton pages. Uses a plain
          <style> tag (not styled-jsx) so it works uniformly in App Router. */}
      <style
        dangerouslySetInnerHTML={{
          __html: [
            '@keyframes signatureSkeletonShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}',
            '@keyframes signatureSpinnerRotate{to{transform:rotate(360deg)}}',
            // Auto-hiding thin scrollbar for the PDF viewer. Thumb is invisible
            // until the user scrolls; fades back out after ~300ms.
            '.signature-pdf-scroll{scrollbar-width:thin;scrollbar-color:transparent transparent;scrollbar-gutter:stable;transition:scrollbar-color 300ms ease}',
            '.signature-pdf-scroll.scrolling{scrollbar-color:rgba(0,0,0,0.35) transparent}',
            '.signature-pdf-scroll::-webkit-scrollbar{width:8px;height:8px}',
            '.signature-pdf-scroll::-webkit-scrollbar-track{background:transparent}',
            '.signature-pdf-scroll::-webkit-scrollbar-thumb{background:transparent;border-radius:4px;border:2px solid transparent;background-clip:padding-box;transition:background 300ms ease}',
            '.signature-pdf-scroll.scrolling::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.35);background-clip:padding-box}',
            '.signature-pdf-scroll::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.5);background-clip:padding-box}',
          ].join(''),
        }}
      />

      {/*
        Mobile layout (XS/S/M, <lg):
        Full-viewport white overlay. PDF on top (scroll), Signature Utility
        sticky at bottom. Whole surface slides up from the bottom.
      */}
      <div
        className="lg:hidden fixed inset-0 z-[70] bg-white flex flex-col"
        style={slideStyle}
      >
        <PdfViewer mobileLayout loading={loading} />
        <SignatureUtility
          clientName={clientName}
          mobileLayout
          disabled={loading}
          onCancel={requestClose}
          onSign={handleSign}
        />
      </div>

      {/*
        Desktop layout (L/XL/XXL, lg+):
        Backdrop fades in; the card slides up from bottom.
      */}
      <div
        className="hidden lg:flex fixed inset-0 z-[70] items-stretch justify-center"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          ...fadeStyle,
        }}
        onClick={requestClose}
      >
        {/*
          Outer card — outer margin: L=24, XL=24, XXL=32.
          Max width caps at the XXL page max (2160px) minus XXL outer margin
          (32 each side) = 2096px, so the card stops growing when the page
          itself stops growing.
        */}
        <div
          className="relative w-full max-w-[2096px] bg-white rounded-[16px] flex m-6 2xl:m-8"
          style={{
            boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.12), 0px 4px 24px 0px rgba(0,0,0,0.2)',
            fontFamily: 'Segoe UI, sans-serif',
            ...slideStyle,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close (X) — top-right corner */}
          <button
            onClick={requestClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-[3] w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-[#f5f5f5] cursor-pointer border-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3L13 13M13 3L3 13" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Inner: padding = Overlay-Inner (L=32, XL/XXL=48); gap = 32 (XL token) */}
          <div className="flex gap-8 w-full h-full p-8 xl:p-12">
            {/* PDF Viewer — flex-1 (2/3) */}
            <PdfViewer mobileLayout={false} loading={loading} />
            {/* Signature Utility — flex 1/3, max 340 */}
            <div className="shrink-0 flex flex-col justify-start" style={{ width: '33%', maxWidth: 340 }}>
              <SignatureUtility
                clientName={clientName}
                mobileLayout={false}
                disabled={loading}
                onCancel={requestClose}
                onSign={handleSign}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
