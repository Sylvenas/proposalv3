'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Proposal } from '../data/mockProposal';

interface LandingPageProps {
  proposal: Proposal;
  onOpen: () => void;
}

export function LandingPage({ proposal, onOpen }: LandingPageProps) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [exiting, setExiting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!proposal.coverImageUrl) return;
    const img = new Image();
    img.src = proposal.coverImageUrl;
    img.onload = () => setBgLoaded(true);
  }, [proposal.coverImageUrl]);

  function handleOpen() {
    setExiting(true);
    setTimeout(onOpen, 220);
  }

  const daysLeft = useMemo(() => {
    if (!proposal.expiredTime) return null;
    const diff = Math.ceil(
      (new Date(proposal.expiredTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(diff, 0);
  }, [proposal.expiredTime]);

  const companyInitial = proposal.company.name.charAt(0);

  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 100,
        opacity: exiting ? 0 : 1,
        transition: exiting ? 'opacity 0.22s ease' : undefined,
      }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
        {/* Cover image — light warm treatment */}
        {proposal.coverImageUrl && (
          <img
            ref={imgRef}
            src={proposal.coverImageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'blur(32px) brightness(1.1) saturate(0.4)',
              transform: 'scale(1.1)',
              opacity: bgLoaded ? 0.18 : 0,
              transition: 'opacity 1s ease',
            }}
          />
        )}
        {/* Warm paper base — matches body */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(170deg, #fffdfa 0%, #fdf4ec 45%, #f7ece0 100%)',
          }}
        />
        {/* Orange glow — top right, like body */}
        <div
          className="absolute"
          style={{
            top: '-8%', right: '-8%',
            width: '65vw', height: '65vw',
            maxWidth: 560, maxHeight: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(227,87,28,0.13) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        {/* Warm amber glow — bottom left */}
        <div
          className="absolute"
          style={{
            bottom: '-8%', left: '-8%',
            width: '50vw', height: '50vw',
            maxWidth: 400, maxHeight: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(182,70,22,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Subtle warm grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(227,87,28,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(227,87,28,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Layout ── */}
      <div
        className="relative h-full flex flex-col"
        style={{ zIndex: 10, paddingBottom: '14vh' }}
      >
        {/* TOP: company logo */}
        <div
          className="flex items-center"
          style={{
            padding: '52px 28px 0',
            animation: 'fadeDown 0.4s ease 0.1s both',
          }}
        >
          {proposal.company.logoUrl ? (
            <img
              src={proposal.company.logoUrl}
              alt={proposal.company.name}
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--arc-orange), var(--arc-orange-deep))',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 17,
                  boxShadow: '0 4px 16px rgba(227,87,28,0.24)',
                }}
              >
                {companyInitial}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--arc-ink)',
                  letterSpacing: '-0.01em',
                  opacity: 0.7,
                }}
              >
                {proposal.company.name}
              </span>
            </div>
          )}
        </div>

        {/* CENTER: main content */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ padding: '0 28px' }}
        >
          {/* Proposal name */}
          <p
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--arc-ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: 10,
              animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) 0.3s both',
            }}
          >
            {proposal.name}
          </p>

          {/* Expiry pill */}
          {daysLeft !== null && proposal.status === 'PENDING' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 9px',
                borderRadius: 999,
                background: daysLeft <= 3 ? 'rgba(227,87,28,0.1)' : 'rgba(31,41,55,0.06)',
                border: `1px solid ${daysLeft <= 3 ? 'rgba(227,87,28,0.3)' : 'rgba(31,41,55,0.1)'}`,
                marginBottom: 20,
                width: 'fit-content',
                animation: 'fadeUp 0.35s ease 0.4s both',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke={daysLeft <= 3 ? 'var(--arc-orange-deep)' : 'var(--arc-muted)'} strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: daysLeft <= 3 ? 'var(--arc-orange-deep)' : 'var(--arc-muted)',
                }}
              >
                {daysLeft === 0 ? 'Expires today' : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}

          {/* Description */}
          {proposal.description && (
            <p
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: 'var(--arc-muted)',
                lineHeight: 1.6,
                marginBottom: 28,
                maxWidth: '80vw',
                animation: 'fadeUp 0.35s ease 0.48s both',
              }}
            >
              {proposal.description}
            </p>
          )}

          {/* CTA */}
          <div style={{ animation: 'fadeUp 0.35s ease 0.54s both' }}>
            <button
              onClick={handleOpen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 28px',
                borderRadius: 18,
                background: 'linear-gradient(135deg, var(--arc-orange) 0%, var(--arc-orange-deep) 100%)',
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                boxShadow: '0 8px 28px rgba(227,87,28,0.32)',
                animation: 'ctaPulse 2.6s ease-in-out 1.4s infinite',
              }}
            >
              Open Proposal
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* BOTTOM: sales info — de-emphasized */}
        <div style={{ padding: '0 28px 40px', animation: 'fadeUp 0.3s ease 0.8s both' }}>
          <div style={{ height: 1, background: 'rgba(31,41,55,0.08)', marginBottom: 14 }} />

          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--arc-muted)', opacity: 0.6, marginBottom: 10 }}>
            Contact Us
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--arc-orange)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--arc-ink)' }}>
                {proposal.salesName}
              </span>
            </div>

            {/* Phone */}
            {proposal.salesPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--arc-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span style={{ fontSize: 12, color: 'var(--arc-muted)' }}>
                  {proposal.salesPhone}
                </span>
              </div>
            )}

            {/* Email */}
            {proposal.salesEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--arc-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="2,4 12,13 22,4" />
                </svg>
                <span style={{ fontSize: 12, color: 'var(--arc-muted)' }}>
                  {proposal.salesEmail}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 8px 28px rgba(227,87,28,0.32); }
          50%       { box-shadow: 0 8px 44px rgba(227,87,28,0.52), 0 0 0 8px rgba(227,87,28,0.07); }
        }
      `}</style>
    </div>
  );
}
