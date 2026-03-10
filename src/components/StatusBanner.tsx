import type { ProposalStatus } from '../data/mockProposal';

const CONFIG: Record<string, { icon: string; bg: string; border: string; text: string; title: string; body: string }> = {
  RECALLED: {
    icon: '↩️',
    bg: '#fff7ef',
    border: '#f2c8aa',
    text: '#8f3c15',
    title: 'Proposal Recalled',
    body: 'This proposal has been recalled by the contractor. Please contact your sales rep for more information.',
  },
  EXPIRED: {
    icon: '⏰',
    bg: '#fff3ec',
    border: '#f0c4a9',
    text: '#a2471a',
    title: 'Proposal Expired',
    body: 'This proposal has passed its expiration date. Contact your sales rep to request a new one.',
  },
  VOID: {
    icon: '🚫',
    bg: '#f8f4ef',
    border: '#e7ddd3',
    text: '#4b5563',
    title: 'Proposal Voided',
    body: 'This proposal is no longer valid. Please contact your sales rep for an updated proposal.',
  },
  LOST: {
    icon: '📁',
    bg: '#f8f4ef',
    border: '#e7ddd3',
    text: '#4b5563',
    title: 'Proposal Closed',
    body: 'This proposal has been closed. Contact your sales rep if you have questions.',
  },
  DELETED: {
    icon: '🗑️',
    bg: '#fff1eb',
    border: '#f0c4a9',
    text: '#a2471a',
    title: 'Proposal Deleted',
    body: 'This proposal has been deleted and is no longer available.',
  },
};

interface StatusBannerProps {
  status: ProposalStatus;
  salesEmail?: string;
}

export function StatusBanner({ status, salesEmail }: StatusBannerProps) {
  const cfg = CONFIG[status];
  if (!cfg) return null;

  return (
    <div
      className="rounded-[28px] p-5 flex gap-4"
      style={{
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        boxShadow: 'var(--arc-shadow-soft)',
      }}
    >
      <span className="text-2xl shrink-0">{cfg.icon}</span>
      <div>
        <h3 className="text-base font-bold mb-1" style={{ color: cfg.text }}>
          {cfg.title}
        </h3>
        <p className="text-sm mb-0" style={{ color: cfg.text, opacity: 0.8, lineHeight: 1.5 }}>
          {cfg.body}
        </p>
        {salesEmail && (
          <a
            href={`mailto:${salesEmail}`}
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold"
            style={{ color: cfg.text, textDecoration: 'underline' }}
          >
            Contact Sales Rep
          </a>
        )}
      </div>
    </div>
  );
}
