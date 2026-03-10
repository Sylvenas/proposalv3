import type { ProposalOption } from '../data/mockProposal';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

/* ─── Pill selector ─────────────────────────────────────────── */

interface OptionPillsProps {
  options: ProposalOption[];
  selectedId: string;
  approvedId?: string;
  onSelect: (id: string) => void;
}

export function OptionPills({ options, selectedId, approvedId, onSelect }: OptionPillsProps) {
  return (
    <div
      className="flex gap-2 p-1 rounded-[22px]"
      style={{
        scrollbarWidth: 'none',
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid var(--arc-border)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
      }}
    >
      {options.map(opt => {
        const selected = opt.id === selectedId;
        const approved = opt.id === approvedId;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="flex-1 px-4 py-2 rounded-[18px] text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              background: approved
                ? 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))'
                : selected
                  ? 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))'
                  : 'rgba(255,255,255,0.72)',
              color: approved ? 'white' : selected ? 'white' : 'var(--arc-muted)',
              border: approved
                ? '1.5px solid var(--arc-orange-deep)'
                : selected
                  ? '1.5px solid var(--arc-orange-deep)'
                  : '1.5px solid var(--arc-border)',
              transform: selected ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: selected ? '0 12px 24px rgba(227,87,28,0.18)' : '0 2px 8px rgba(15,23,42,0.03)',
            }}
          >
            {approved && '✓ '}
            {opt.name}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Option hero card ───────────────────────────────────────── */

interface OptionHeroCardProps {
  option: ProposalOption;
  currencySymbol: string;
  approvedId?: string;
  onApprove?: () => void;
}

export function OptionHeroCard({ option, currencySymbol, approvedId, onApprove }: OptionHeroCardProps) {
  const isApproved = option.id === approvedId;
  const monthly = Math.round(option.total / 120);

  const included = option.features.filter(f => f.included);
  const excluded = option.features.filter(f => !f.included);

  return (
    <div
      className="rounded-[28px] overflow-hidden"
      style={{
        background: isApproved
          ? 'linear-gradient(180deg,rgba(255,255,255,0.96),#fff8f2)'
          : 'linear-gradient(180deg,rgba(255,255,255,0.96),#fff8f2)',
        border: `1.5px solid ${isApproved ? '#f3cfb6' : 'var(--arc-border)'}`,
        boxShadow: 'var(--arc-shadow-soft)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        {option.isRecommended && !isApproved && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs">⭐</span>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--arc-orange)' }}
            >
              Recommended
            </span>
          </div>
        )}
        {isApproved && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs">✅</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--arc-orange-deep)' }}>
              Approved
            </span>
          </div>
        )}
        <h3 className="text-[22px] font-bold mb-1.5 tracking-tight" style={{ color: 'var(--arc-ink)' }}>{option.name}</h3>
        <p className="text-sm mb-0 leading-6" style={{ color: 'var(--arc-muted)' }}>{option.description}</p>

        {/* Price */}
        <div className="mt-5 flex items-end gap-2">
          <span className="font-extrabold leading-none tracking-tight" style={{ fontSize: 36, color: 'var(--arc-ink)' }}>
            {currencySymbol}{fmt(option.total)}
          </span>
          <span className="text-sm mb-1" style={{ color: 'var(--arc-muted)' }}>
            ≈ {currencySymbol}{fmt(monthly)}/mo
          </span>
        </div>
      </div>

      {/* Feature list */}
      <div className="px-5 pb-4 border-t" style={{ borderColor: 'var(--arc-border)' }}>
        <div className="pt-4 grid grid-cols-2 gap-2">
          {included.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm rounded-2xl px-3 py-2" style={{ color: 'var(--arc-ink)', background: 'rgba(255,255,255,0.72)' }}>
              <span className="font-bold text-xs" style={{ color: 'var(--arc-green)' }}>✓</span>
              <span className="leading-5">{f.label}</span>
            </div>
          ))}
          {excluded.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm rounded-2xl px-3 py-2" style={{ color: '#b7ab9f', background: 'rgba(255,255,255,0.42)' }}>
              <span className="font-bold text-xs">○</span>
              <span className="leading-5">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!isApproved && onApprove && (
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={onApprove}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
              boxShadow: '0 14px 28px rgba(227,87,28,0.24)',
            }}
          >
            Select {option.name} — {currencySymbol}{fmt(option.total)}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Value spectrum bar ────────────────────────────────────── */

interface ValueSpectrumProps {
  options: ProposalOption[];
  selectedId: string;
  currencySymbol: string;
}

export function ValueSpectrum({ options, selectedId, currencySymbol }: ValueSpectrumProps) {
  if (options.length < 2) return null;
  const min = options[0].total;
  const max = options[options.length - 1].total;
  const range = max - min || 1;

  return (
    <div className="px-1 py-1">
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
        Value Spectrum
      </p>
      {/* Track */}
      <div className="relative h-2 rounded-full mx-3" style={{ background: '#eedfd4' }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(90deg,#f7cab0,var(--arc-orange))' }}
        />
        {/* Markers */}
        {options.map(opt => {
          const pct = ((opt.total - min) / range) * 100;
          const selected = opt.id === selectedId;
          return (
            <div
              key={opt.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{
                  background: selected ? 'var(--arc-orange-deep)' : 'var(--arc-orange)',
                  boxShadow: selected ? '0 0 0 3px rgba(227,87,28,0.18)' : undefined,
                  transform: selected ? 'scale(1.3)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4 gap-2">
        {options.map(opt => {
          const selected = opt.id === selectedId;
          return (
            <div key={opt.id} className="text-center" style={{ flex: 1 }}>
              <p
                className="text-xs font-semibold mb-0"
                style={{ color: selected ? 'var(--arc-orange-deep)' : '#9b8b7f' }}
              >
                {currencySymbol}{(opt.total / 1000).toFixed(1)}k
              </p>
              <p
                className="text-xs mb-0"
                style={{ color: selected ? 'var(--arc-muted)' : '#c9b8aa' }}
              >
                {opt.name}
              </p>
              {selected && (
                <p className="text-xs mb-0" style={{ color: 'var(--arc-orange)' }}>Current</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mini option cards (non-selected) ──────────────────────── */

interface MiniOptionCardProps {
  option: ProposalOption;
  currencySymbol: string;
  onSelect: (id: string) => void;
}

export function MiniOptionCard({ option, currencySymbol, onSelect }: MiniOptionCardProps) {
  return (
    <button
      onClick={() => onSelect(option.id)}
      className="flex-1 text-left rounded-2xl p-3.5 border transition-all active:scale-[0.97]"
      style={{
        borderColor: 'var(--arc-border)',
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
      }}
    >
      <p className="text-xs mb-1 font-medium" style={{ color: 'var(--arc-muted)' }}>{option.name}</p>
      <p className="text-sm font-bold mb-0" style={{ color: 'var(--arc-ink)' }}>
        {currencySymbol}{fmt(option.total)}
      </p>
    </button>
  );
}
