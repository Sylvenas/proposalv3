import { useEffect, useRef, useState } from 'react';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

interface StickyFooterProps {
  currencySymbol: string;
  isApproved: boolean;
  isVisible: boolean; // hero visible → footer hidden
  onApprove: () => void;
  onPayment?: () => void;
  title?: string; // option name or phase label
  amount?: number;
}

export function StickyFooter({
  currencySymbol,
  isApproved,
  isVisible,
  onApprove,
  onPayment,
  title,
  amount,
}: StickyFooterProps) {
  const [mounted, setMounted] = useState(false);
  const prevVisible = useRef(isVisible);

  useEffect(() => {
    // Only animate after first render
    if (prevVisible.current !== isVisible) {
      setMounted(true);
      prevVisible.current = isVisible;
    } else {
      setMounted(true);
    }
  }, [isVisible]);

  const show = mounted && !isVisible;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'transform',
      }}
    >
      {/* Safe area bg */}
      <div
        className="pb-safe"
        style={{
          background: 'linear-gradient(180deg,rgba(255,252,248,0.84),rgba(255,252,248,0.98))',
          backdropFilter: 'blur(18px)',
          borderTop: '1px solid rgba(233,223,213,0.9)',
          boxShadow: '0 -16px 36px rgba(15,23,42,0.1)',
        }}
      >
        <div className="px-4 pt-3 pb-5">
          <div
            className="rounded-[28px] px-4 pt-3 pb-4"
            style={{
              background: 'rgba(255,255,255,0.82)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: 'var(--arc-shadow-soft)',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              {title && (
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: '#b0a090' }}>
                    {isApproved ? 'Next payment' : 'Selected option'}
                  </p>
                  <p className="text-sm font-semibold mb-0 truncate" style={{ color: 'var(--arc-ink)' }}>
                    {title}
                  </p>
                </div>
              )}
              {typeof amount === 'number' ? (
                <p
                  className="text-base font-extrabold mb-0 shrink-0"
                  style={{ color: 'var(--arc-ink)' }}
                >
                  {currencySymbol}{fmt(amount)}
                </p>
              ) : null}
            </div>

            {!isApproved ? (
              <button
                onClick={onApprove}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
                  boxShadow: '0 12px 22px rgba(227,87,28,0.28)',
                }}
              >
                Approve This Proposal →
              </button>
            ) : onPayment ? (
              <button
                onClick={onPayment}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
                  boxShadow: '0 12px 22px rgba(227,87,28,0.28)',
                }}
              >
                Make a Payment →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
