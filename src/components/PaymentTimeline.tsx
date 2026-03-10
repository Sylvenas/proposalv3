import type { Phase } from '../data/mockProposal';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

function PhaseNode({ phase, isLast, currencySymbol, onPayPhase }: {
  phase: Phase;
  isLast: boolean;
  currencySymbol: string;
  onPayPhase?: (id: string) => void;
}) {
  const paid = phase.status === 'paid';
  const next = phase.status === 'pending';

  return (
    <div className={`flex gap-4${!isLast ? ' pb-3' : ''}`}>
      {/* Left: connector */}
      <div className="flex flex-col items-center">
        {/* Node */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 mt-[14px]"
        style={{
            background: paid ? 'var(--arc-orange-deep)' : next ? 'var(--arc-orange)' : 'white',
            borderColor: paid ? 'var(--arc-orange-deep)' : next ? 'var(--arc-orange)' : '#d8cdc3',
            boxShadow: next ? '0 0 0 4px rgba(227,87,28,0.14)' : undefined,
          }}
        >
          {paid ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : next ? (
            <div className="w-2 h-2 rounded-full bg-white" />
          ) : (
            <div className="w-2 h-2 rounded-full" style={{ background: '#cfbfb1' }} />
          )}
        </div>
        {/* Connector line */}
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-1"
            style={{
              background: paid ? 'var(--arc-orange-deep)' : '#e8ddd3',
              minHeight: 32,
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div
        className="pb-4 flex-1 rounded-[24px] px-4 py-4"
        style={{
          background: paid
            ? 'linear-gradient(180deg,#faf6f2,#f7f1eb)'
            : next
              ? 'linear-gradient(180deg,#fff6ef,#fffaf6)'
              : 'rgba(255,255,255,0.82)',
          border: `1px solid ${paid ? '#e8ddd3' : next ? '#f3cfb6' : '#efe3d9'}`,
          boxShadow: next ? '0 12px 24px rgba(227,87,28,0.08)' : 'none',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--arc-ink)' }}>{phase.label}</p>
            <p className="text-xs mb-0" style={{ color: 'var(--arc-muted)' }}>{phase.description}</p>
            {paid && phase.paidDate && (
              <p className="text-xs font-medium mt-0.5 mb-0" style={{ color: 'var(--arc-orange-deep)' }}>Paid {phase.paidDate}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p
              className="text-base font-bold mb-0"
              style={{ color: paid ? 'var(--arc-orange-deep)' : 'var(--arc-ink)' }}
            >
              {currencySymbol}{fmt(phase.amount)}
            </p>
            <p className="text-xs mb-0" style={{ color: '#ae9b8d' }}>{phase.percentage}%</p>
          </div>
        </div>

        {/* Pay now CTA for first unpaid */}
        {next && (
          <button
            onClick={() => onPayPhase?.(phase.id)}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95"
            style={{
              background: onPayPhase ? 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))' : 'var(--arc-orange-soft)',
              color: onPayPhase ? 'white' : 'var(--arc-orange-deep)',
              border: onPayPhase ? 'none' : '1px solid #f0c4a9',
              boxShadow: onPayPhase ? '0 10px 18px rgba(227,87,28,0.24)' : 'none',
              cursor: onPayPhase ? 'pointer' : 'default',
            }}
          >
            Pay {currencySymbol}{fmt(phase.amount)} now
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ phases }: { phases: Phase[] }) {
  const total = phases.reduce((s, p) => s + p.amount, 0);
  const paid = phases.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pct = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div className="mt-1 rounded-[22px] px-4 py-4" style={{ background: '#fbf5ef', border: '1px solid #eee1d6' }}>
      <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--arc-muted)' }}>
        <span>Paid ${paid.toLocaleString('en-US')}</span>
        <span>Total ${total.toLocaleString('en-US')}</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#eee5dd' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg,var(--arc-orange),var(--arc-orange-deep))',
            transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>
    </div>
  );
}

interface PaymentTimelineProps {
  phases: Phase[];
  currencySymbol: string;
  onPayPhase?: (phaseId: string) => void;
}

export function PaymentTimeline({ phases, currencySymbol, onPayPhase }: PaymentTimelineProps) {
  if (!phases.length) return null;

  return (
    <section>
      <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#9b8b7f' }}>
        Payment Plan
      </p>
      <div
        className="rounded-[28px] p-5 border"
        style={{
          borderColor: 'rgba(255,255,255,0.8)',
          boxShadow: 'var(--arc-shadow-float)',
          background:
            'radial-gradient(circle at top right, rgba(31,143,99,0.08), transparent 26%), linear-gradient(180deg,#ffffff,#fffbf8)',
        }}
      >
        <div>
          {phases.map((phase, i) => (
            <PhaseNode
              key={phase.id}
              phase={phase}
              isLast={i === phases.length - 1}
              currencySymbol={currencySymbol}
              onPayPhase={onPayPhase}
            />
          ))}
        </div>
        <ProgressBar phases={phases} />
      </div>
    </section>
  );
}
