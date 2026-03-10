import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 600) {
  const [val, setVal] = useState(0);
  const triggered = useRef(false);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { val, elRef };
}

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

interface PriceRevealProps {
  total: number;
  currencySymbol: string;
  showMonthly?: boolean;
}

export function PriceReveal({ total, currencySymbol, showMonthly = true }: PriceRevealProps) {
  const { val, elRef } = useCountUp(total);
  const monthly = Math.round(total / 120);

  return (
    <section>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
        Your Investment
      </p>
      <div
        ref={elRef}
        className="rounded-[28px] p-5 border"
        style={{
          borderColor: 'rgba(255,255,255,0.72)',
          boxShadow: 'var(--arc-shadow-float)',
          background:
            'radial-gradient(circle at top right, rgba(227,87,28,0.14), transparent 28%), linear-gradient(180deg,#ffffff,#fff6ef)',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: '#9b8b7f' }}>
              Proposal total
            </p>
            <div className="flex items-end gap-1">
              <span className="text-lg font-medium leading-none mb-1" style={{ color: '#a88e7d' }}>{currencySymbol}</span>
              <span
                className="font-extrabold leading-none tracking-tight"
                style={{ fontSize: 44, color: 'var(--arc-ink)' }}
              >
                {fmt(val)}
              </span>
            </div>
          </div>
          <div
            className="shrink-0 rounded-2xl px-3 py-2 text-right"
            style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid #f0e3d8' }}
          >
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: '#9b8b7f' }}>
              Monthly
            </p>
            <p className="text-sm font-bold mb-0" style={{ color: 'var(--arc-ink)' }}>
              {currencySymbol}{fmt(monthly)}
            </p>
          </div>
        </div>
        {showMonthly && monthly > 0 && (
          <p className="text-sm mb-0 leading-6" style={{ color: 'var(--arc-muted)' }}>
            Financing estimate shown for context. Your final payment schedule appears below.
          </p>
        )}
      </div>
    </section>
  );
}
