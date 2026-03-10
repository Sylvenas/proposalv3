import { useState } from 'react';

interface BlueprintPreviewProps {
  coverImageUrl?: string;
}

export function BlueprintPreview({ coverImageUrl }: BlueprintPreviewProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <section>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
          AI Preview
        </p>

        <div
          className="rounded-[28px] overflow-hidden border"
          style={{
            borderColor: 'rgba(255,255,255,0.84)',
            boxShadow: 'var(--arc-shadow-float)',
            background: 'linear-gradient(180deg,#ffffff,#fffaf5)',
          }}
        >
          <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: '#f1e5db' }}>
            <p className="text-[15px] font-semibold mb-1 tracking-tight" style={{ color: 'var(--arc-ink)' }}>Visual concept preview</p>
            <p className="text-[13px] leading-6 mb-0" style={{ color: 'var(--arc-muted)' }}>
              AI-generated effect image showing how the finished project may look.
            </p>
          </div>

          <div className="p-4" style={{ background: 'linear-gradient(180deg,#fffdfa,#fff5ee)' }}>
            <div
              className="rounded-[24px] overflow-hidden relative cursor-pointer"
              style={{
                background: '#f4d4c1',
                minHeight: 220,
                boxShadow: '0 18px 34px rgba(15,23,42,0.16)',
              }}
              onClick={() => setFullscreen(true)}
            >
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="AI preview"
                  className="w-full h-full object-cover"
                  style={{ minHeight: 220 }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 relative z-10">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(227,87,28,0.7)" strokeWidth="1.5">
                    <path d="M4 18h16" />
                    <path d="M6 18V8l6-4 6 4v10" />
                    <path d="M10 18v-5h4v5" />
                  </svg>
                  <p className="text-sm mt-2 font-medium" style={{ color: 'var(--arc-orange-deep)' }}>AI concept preview</p>
                </div>
              )}

              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 14px 28px rgba(0,0,0,0.14)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  View AI preview
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl font-light w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onClick={() => setFullscreen(false)}
          >
            ×
          </button>
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt="Full AI preview"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="text-center text-white">
              <p className="text-lg font-semibold mb-2">No AI preview available</p>
              <p className="text-sm" style={{ color: '#9b8b7f' }}>A generated concept image will appear here.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
