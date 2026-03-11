import { useEffect, useRef, useState, useMemo } from 'react';
import type { Proposal } from '../data/mockProposal';

function ExpiryCountdown({ expiredTime }: { expiredTime: string }) {
  const daysLeft = useMemo(() => {
    const diff = Math.ceil(
      (new Date(expiredTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(diff, 0);
  }, [expiredTime]);

  const urgent = daysLeft <= 3;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
      style={{
        background: urgent ? 'rgba(255,241,235,0.96)' : 'rgba(255,255,255,0.15)',
        borderColor: urgent ? '#f1be9f' : 'rgba(255,255,255,0.36)',
        color: urgent ? 'var(--arc-orange-deep)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {daysLeft === 0 ? 'Expires today' : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
    </div>
  );
}

interface HeroBandProps {
  proposal: Proposal;
  coverImageUrl?: string;
  onVisibilityChange?: (visible: boolean) => void;
}

export function HeroBand({ proposal, coverImageUrl, onVisibilityChange }: HeroBandProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgSrc = coverImageUrl || proposal.coverImageUrl;

  useEffect(() => {
    if (!heroRef.current || !onVisibilityChange) return;
    const el = heroRef.current;
    const obs = new IntersectionObserver(
      ([e]) => onVisibilityChange(e.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisibilityChange]);

  return (
    <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: 292 }}>
      {/* Background layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 88% 12%, rgba(227,87,28,0.28), transparent 22%), linear-gradient(160deg,#21364d 0%,#14273a 100%)',
        }}
      >
        {imgSrc && (
          <img
            src={imgSrc}
            alt="Blueprint"
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover"
            style={{
              opacity: imgLoaded ? 0.3 : 0,
              transition: 'opacity 0.8s ease',
              filter: 'saturate(0.66) brightness(0.68)',
            }}
          />
        )}
        {/* Blueprint grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(227,87,28,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(227,87,28,0.12) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            opacity: 0.42,
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 96, background: 'linear-gradient(transparent, rgba(15,30,51,0.76))' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 pt-8 pb-6">
        {/* Proposal name — the hero */}
        <h1
          className="font-bold text-white leading-tight mb-2"
          style={{ fontSize: 28, letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.34)' }}
        >
          {proposal.name}
        </h1>

        {/* Customer + address */}
        <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Prepared for {proposal.customerName}
        </p>
        {proposal.customerAddress ? (
          <div className="flex items-center gap-1.5 mb-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {proposal.customerAddress}
            </span>
          </div>
        ) : (
          <div className="mb-4" />
        )}

        {proposal.expiredTime && proposal.status === 'PENDING' && (
          <ExpiryCountdown expiredTime={proposal.expiredTime} />
        )}
      </div>

      {/* Floating trust card */}
      <div className="relative z-10 mx-4 mb-0" style={{ marginTop: 2 }}>
        <div
          className="rounded-[28px] p-4 flex items-center gap-3"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(16px)',
            boxShadow: 'var(--arc-shadow-float)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >
          {/* Logo or initials */}
          {proposal.company.logoUrl ? (
            <img src={proposal.company.logoUrl} alt="Logo" className="h-10 w-auto object-contain shrink-0" />
          ) : (
            <div
              className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 font-bold text-base"
              style={{ background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))', color: 'white' }}
            >
              {proposal.company.name.charAt(0)}
            </div>
          )}

          {/* Name + company */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-0.5 truncate" style={{ color: 'var(--arc-ink)' }}>
              {proposal.salesName}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] tracking-tight leading-none" style={{ color: 'var(--arc-orange)' }}>★★★★★</span>
              <span className="text-xs truncate" style={{ color: 'var(--arc-muted)' }}>{proposal.company.name}</span>
            </div>
          </div>

          {/* Call CTA */}
          {proposal.salesPhone && (
            <a
              href={`tel:${proposal.salesPhone}`}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))', color: 'white', textDecoration: 'none', boxShadow: '0 10px 20px rgba(227,87,28,0.24)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
