import { useState } from 'react';
import type { ProductGroup } from '../data/mockProposal';

const ICONS: [string, string][] = [
  ['tear', '🏚️'],
  ['disposal', '🗑️'],
  ['shingle', '🪵'],
  ['sheet', '❄️'],
  ['ice', '❄️'],
  ['water', '💧'],
  ['warrant', '🔒'],
  ['gutter', '🌊'],
  ['labor', '👷'],
  ['material', '📦'],
  ['inspect', '🔍'],
  ['clean', '✨'],
  ['hvac', '❄️'],
  ['solar', '☀️'],
  ['electric', '⚡'],
  ['plumb', '🔧'],
  ['insul', '🏠'],
  ['vent', '💨'],
  ['flash', '⚡'],
  ['ridge', '🏠'],
  ['designer', '🎨'],
];

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of ICONS) {
    if (lower.includes(key)) return icon;
  }
  return '✅';
}

function BenefitCard({ group }: { group: ProductGroup }) {
  const [open, setOpen] = useState(false);
  const icon = getIcon(group.categoryName);
  const hasMore = group.products.length > 0;
  const subtitle = group.products[0]?.description || group.products[0]?.name || '';

  return (
    <button
      onClick={() => hasMore && setOpen(v => !v)}
      className="w-full text-left rounded-2xl p-4 bg-white border flex items-start gap-3 transition-all active:scale-[0.98]"
      style={{
        borderColor: open ? '#f3cfb6' : 'var(--arc-border)',
        boxShadow: open
          ? '0 0 0 3px rgba(227,87,28,0.08), 0 1px 6px rgba(0,0,0,0.05)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        cursor: hasMore ? 'pointer' : 'default',
      }}
    >
      <span className="text-2xl leading-none mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-0.5 leading-snug" style={{ color: 'var(--arc-ink)' }}>{group.categoryName}</p>
        {subtitle && (
          <p className="text-xs leading-snug mb-0" style={{ color: 'var(--arc-muted)', fontStyle: 'italic' }}>
            "{subtitle}"
          </p>
        )}
        {open && group.products.length > 1 && (
          <div className="mt-2 space-y-1 pt-2" style={{ borderTop: '1px solid #f3e8df' }}>
            {group.products.slice(1).map((p, i) => (
              <p key={i} className="text-xs mb-0" style={{ color: 'var(--arc-muted)' }}>{p.name}</p>
            ))}
          </div>
        )}
      </div>
      {hasMore && group.products.length > 1 && (
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#c4b4a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 mt-1"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </button>
  );
}

interface BenefitGridProps {
  productGroups: ProductGroup[];
  maxVisible?: number;
}

export function BenefitGrid({ productGroups, maxVisible = 3 }: BenefitGridProps) {
  const [showAll, setShowAll] = useState(false);
  if (!productGroups.length) return null;

  const visible = showAll ? productGroups : productGroups.slice(0, maxVisible);
  const hidden = productGroups.length - maxVisible;

  return (
    <section>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
        What You&apos;re Getting
      </p>
      <div className="flex flex-col gap-3">
        {visible.map((g, i) => <BenefitCard key={i} group={g} />)}
      </div>
      {!showAll && hidden > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full py-2.5 text-sm font-medium rounded-xl border border-dashed"
          style={{ color: 'var(--arc-orange-deep)', borderColor: '#f4c9ad', background: 'var(--arc-orange-soft)' }}
        >
          + {hidden} more item{hidden !== 1 ? 's' : ''}
        </button>
      )}
    </section>
  );
}
