'use client';

import { CSSProperties } from 'react';
import { Fullscreen, ZoomIn, ZoomOut } from './icons';

// ── Zoom Controls Pill ────────────────────────────────────────────────────────
// Light glass-morphism pill (Figma "Commands", node 1400:23334): zoom-in /
// zoom-out cluster, a hairline separator, then fullscreen. 155×48, rounded-12,
// translucent light fill with a 22px background blur. Prototype — buttons have
// no behavior yet.
export default function ZoomControlsPill({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`flex gap-[6px] items-center justify-center rounded-[12px] px-[8px] py-[4px] ${className}`}
      style={{
        height: 48,
        background: 'rgba(240,240,240,0.85)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        boxShadow: '0px 2px 1.5px 0px rgba(0,0,0,0.08), 0px 4px 6px 0px rgba(0,0,0,0.14)',
        ...style,
      }}
    >
      {/* Cluster — zoom in / zoom out */}
      <div className="flex gap-[6px] items-center">
        {(
          [
            [ZoomIn, 'Zoom in'],
            [ZoomOut, 'Zoom out'],
          ] as const
        ).map(([Icon, label]) => (
          <button
            key={label}
            className="flex items-center justify-center cursor-pointer shrink-0"
            style={{ width: 40, height: 40, padding: 8, background: 'none', border: 'none' }}
            aria-label={label}
          >
            <Icon size={24} color="#262626" />
          </button>
        ))}
      </div>
      {/* Separator */}
      <div className="self-stretch shrink-0" style={{ width: 0.5, background: 'rgba(0,0,0,0.1)' }} />
      {/* Fullscreen */}
      <button
        className="flex items-center justify-center cursor-pointer shrink-0"
        style={{ padding: 8, background: 'none', border: 'none' }}
        aria-label="Fit to view"
      >
        <Fullscreen size={24} color="#262626" />
      </button>
    </div>
  );
}
