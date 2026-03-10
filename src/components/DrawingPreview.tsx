import { useState } from 'react';

interface DrawingPreviewProps {
  drawingPreviewUrl?: string;
  pdfUrl?: string;
}

export function DrawingPreview({ drawingPreviewUrl, pdfUrl }: DrawingPreviewProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <section>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
          Drawing
        </p>

        <div
          className="rounded-[28px] overflow-hidden border"
          style={{
            borderColor: 'rgba(255,255,255,0.84)',
            boxShadow: 'var(--arc-shadow-float)',
            background: 'linear-gradient(180deg,#ffffff,#fffbf7)',
          }}
        >
          <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: '#f1e5db' }}>
            <p className="text-[15px] font-semibold mb-1 tracking-tight" style={{ color: 'var(--arc-ink)' }}>Site drawing</p>
            <p className="text-[13px] leading-6 mb-0" style={{ color: 'var(--arc-muted)' }}>
              Precise field drawing used to review measurements, layout, and scope.
            </p>
          </div>

          <div className="p-4" style={{ background: 'linear-gradient(180deg,#fffdfa,#f8f2ec)' }}>
            <div
              className="rounded-[24px] overflow-hidden relative cursor-pointer"
              style={{
                background: '#1e334a',
                minHeight: 220,
                boxShadow: '0 18px 34px rgba(15,23,42,0.18)',
              }}
              onClick={() => setFullscreen(true)}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(122,181,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(122,181,255,0.16) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {drawingPreviewUrl ? (
                <img
                  src={drawingPreviewUrl}
                  alt="Drawing preview"
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.42, minHeight: 220, filter: 'grayscale(0.2) contrast(1.05)' }}
                />
              ) : null}

              <div className="absolute inset-0 p-4">
                <div className="absolute left-6 top-6 text-xs font-semibold tracking-[0.16em] uppercase" style={{ color: '#bfdcff' }}>
                  PLAN VIEW
                </div>
                <div className="absolute right-6 top-6 text-xs font-semibold tracking-[0.16em] uppercase" style={{ color: '#bfdcff' }}>
                  SCALE 1:50
                </div>

                <div
                  className="absolute left-8 top-14 rounded-xl border-2"
                  style={{
                    width: 120,
                    height: 70,
                    borderColor: '#7dd3fc',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                />
                <div
                  className="absolute left-20 top-108 rounded-xl border-2"
                  style={{
                    width: 160,
                    height: 86,
                    borderColor: '#93c5fd',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                />
                <div
                  className="absolute right-10 top-16 rounded-xl border-2"
                  style={{
                    width: 118,
                    height: 92,
                    borderColor: '#7dd3fc',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                />

                <div className="absolute left-8 bottom-10 text-[11px] font-medium" style={{ color: '#bfdcff' }}>
                  Dimensions, placement, and scope reference
                </div>

                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.16)' }}
                >
                  <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white"
                  style={{
                      background: 'rgba(255,255,255,0.14)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      boxShadow: '0 14px 28px rgba(0,0,0,0.18)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 7h18" />
                      <path d="M7 3v18" />
                      <path d="M17 3v18" />
                      <path d="M3 17h18" />
                    </svg>
                    View drawing
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-3 rounded-2xl text-sm font-semibold"
                style={{
                  color: 'var(--arc-muted)',
                  background: 'rgba(255,255,255,0.86)',
                  border: '1px solid var(--arc-border)',
                }}
              >
                Open drawing PDF
              </a>
            ) : null}
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
          {drawingPreviewUrl ? (
            <img
              src={drawingPreviewUrl}
              alt="Full drawing"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="text-center text-white">
              <p className="text-lg font-semibold mb-2">No drawing preview available</p>
              <p className="text-sm" style={{ color: '#9b8b7f' }}>Open the drawing PDF for the full document.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
