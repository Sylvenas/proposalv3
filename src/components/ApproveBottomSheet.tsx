import { useEffect, useRef } from 'react';
import type { ProposalOption } from '../data/mockProposal';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

interface ApproveBottomSheetProps {
  open: boolean;
  option: ProposalOption;
  currencySymbol: string;
  esignRequired?: boolean;
  approving?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApproveBottomSheet({
  open,
  option,
  currencySymbol,
  esignRequired,
  approving,
  onConfirm,
  onCancel,
}: ApproveBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg,#fffdfb,#fbf5ef)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: open
            ? 'transform 0.4s cubic-bezier(0.22,1,0.36,1)'
            : 'transform 0.25s ease-in',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 -24px 48px rgba(15,23,42,0.18)',
          borderTop: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: '#d9cec2' }} />
        </div>

        <div className="px-5 pb-8 pt-2">
          {/* Header */}
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--arc-ink)' }}>You&apos;re about to approve</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--arc-muted)' }}>Review your selection before confirming.</p>

          {/* Summary card */}
          <div
            className="rounded-[28px] p-4 mb-5"
            style={{ background: '#fff8f3', border: '1.5px solid #f0c4a9', boxShadow: '0 12px 24px rgba(227,87,28,0.08)' }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--arc-muted)' }}>Package</p>
                <p className="text-base font-bold mb-0" style={{ color: 'var(--arc-ink)' }}>{option.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: 'var(--arc-muted)' }}>Total</p>
                <p className="text-lg font-extrabold mb-0" style={{ color: 'var(--arc-ink)' }}>
                  {currencySymbol}{fmt(option.total)}
                </p>
              </div>
            </div>

            {/* Mini payment timeline */}
            {option.paymentPhases.length > 0 && (
              <>
                <div
                  className="border-t pt-3"
                  style={{ borderColor: '#efd9c8' }}
                >
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9b8b7f' }}>
                    Payment Schedule
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    {option.paymentPhases.map((phase, i) => (
                      <div key={phase.id} className="flex items-center gap-1 flex-1">
                        {/* Node */}
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className="w-3 h-3 rounded-full border-2 border-white shrink-0"
                            style={{
                              background: i === 0 ? 'var(--arc-orange)' : 'white',
                              border: i === 0 ? '2px solid var(--arc-orange)' : '2px solid #d8cdc3',
                            }}
                          />
                          <p className="text-xs font-semibold mt-1 mb-0 text-center" style={{ color: 'var(--arc-ink)' }}>
                            {currencySymbol}{fmt(phase.amount)}
                          </p>
                          <p className="text-xs mb-0 text-center leading-tight" style={{ color: '#9b8b7f' }}>
                            {phase.label}
                          </p>
                        </div>
                        {/* Connector */}
                        {i < option.paymentPhases.length - 1 && (
                          <div className="h-px flex-1 shrink" style={{ maxWidth: 24, background: '#eadfd4' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Security notice */}
          <div
            className="flex gap-3 items-start p-3.5 rounded-2xl mb-6"
            style={{ background: '#f2faf6', border: '1px solid #cdebdc' }}
          >
            <span className="text-green-500 shrink-0 mt-0.5">🔒</span>
            <p className="text-xs text-green-800 mb-0 leading-relaxed">
              Your approval is secure. We&apos;ll send a confirmation email right away, and your sales rep will reach out to discuss next steps.
            </p>
          </div>

          {/* Confirm button */}
          <button
            onClick={onConfirm}
            disabled={approving}
            className="w-full py-4 rounded-2xl text-base font-bold text-white mb-3 transition-opacity"
            style={{
              background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
              boxShadow: '0 10px 22px rgba(227,87,28,0.28)',
              opacity: approving ? 0.7 : 1,
            }}
          >
            {approving
              ? 'Processing…'
              : esignRequired
                ? 'View & Sign Proposal →'
                : 'Confirm Approval →'}
          </button>

          {/* Cancel */}
          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-sm underline underline-offset-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--arc-muted)' }}
            >
              Cancel — no commitment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
