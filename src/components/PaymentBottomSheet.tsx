import { useEffect, useState } from 'react';
import type { Phase } from '../data/mockProposal';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

/* ─── Step 1: Phase selector ────────────────────────────────── */

function PhaseSelector({
  phases,
  selectedPhaseId,
  currencySymbol,
  onSelect,
}: {
  phases: Phase[];
  selectedPhaseId: string;
  currencySymbol: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {phases.map(phase => {
        const isPaid = phase.status === 'paid';
        const selected = phase.id === selectedPhaseId;

        if (isPaid) {
          return (
            <div
              key={phase.id}
              className="flex items-center gap-3 p-4 rounded-[22px]"
              style={{ background: '#faf5f0', opacity: 0.72, border: '1px solid #ece0d5' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--arc-orange-deep)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-0" style={{ color: '#9b8b7f' }}>{phase.label}</p>
                <p className="text-xs mb-0" style={{ color: 'var(--arc-orange-deep)' }}>Paid{phase.paidDate ? ` · ${phase.paidDate}` : ''}</p>
              </div>
              <p className="text-sm font-semibold mb-0 shrink-0" style={{ color: '#b0a090' }}>
                {currencySymbol}{fmt(phase.amount)}
              </p>
            </div>
          );
        }

        return (
          <button
            key={phase.id}
            onClick={() => onSelect(phase.id)}
            className="w-full text-left flex items-center gap-3 p-4 rounded-[22px] border transition-all"
            style={{
              borderColor: selected ? '#f0c4a9' : '#eee1d6',
              background: selected ? 'linear-gradient(180deg,#fff4ec,#fff9f5)' : 'rgba(255,255,255,0.92)',
              boxShadow: selected ? '0 12px 26px rgba(227,87,28,0.1)' : '0 6px 18px rgba(15,23,42,0.04)',
              cursor: 'pointer',
            }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{
                borderColor: selected ? 'var(--arc-orange)' : '#d8cdc3',
                background: selected ? 'var(--arc-orange)' : 'white',
              }}
            >
              {selected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-0" style={{ color: 'var(--arc-ink)' }}>{phase.label}</p>
              <p className="text-xs mb-0" style={{ color: 'var(--arc-muted)' }}>{phase.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-extrabold mb-0" style={{ color: 'var(--arc-ink)' }}>
                {currencySymbol}{fmt(phase.amount)}
              </p>
              <p className="text-xs mb-0" style={{ color: '#a69282' }}>{phase.percentage}%</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Step 2: Payment method ────────────────────────────────── */

type PayMethod = 'card' | 'ach';

function PaymentMethodSelector({
  method,
  onSelect,
}: {
  method: PayMethod;
  onSelect: (m: PayMethod) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
        Payment Method
      </p>
      <div className="flex gap-3 mb-5">
        {(['card', 'ach'] as PayMethod[]).map(m => (
          <button
            key={m}
            onClick={() => onSelect(m)}
            className="flex-1 py-3 rounded-2xl border text-sm font-semibold transition-all"
            style={{
              borderColor: method === m ? '#f0c4a9' : 'var(--arc-border)',
              background: method === m ? 'var(--arc-orange-soft)' : 'rgba(255,255,255,0.9)',
              color: method === m ? 'var(--arc-orange-deep)' : 'var(--arc-muted)',
              cursor: 'pointer',
              boxShadow: method === m ? '0 10px 20px rgba(227,87,28,0.08)' : 'none',
            }}
          >
            {m === 'card' ? '💳 Credit Card' : '🏦 Bank Transfer'}
          </button>
        ))}
      </div>

      {method === 'card' ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--arc-muted)' }}>Card Number</label>
            <div
              className="w-full px-4 py-3 rounded-2xl border text-sm font-mono"
              style={{ borderColor: '#eadfd4', background: '#fbf6f1', color: '#a28f82' }}
            >
              4242 4242 4242 4242
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--arc-muted)' }}>Expiry</label>
              <div
                className="w-full px-4 py-3 rounded-2xl border text-sm font-mono"
                style={{ borderColor: '#eadfd4', background: '#fbf6f1', color: '#a28f82' }}
              >
                12 / 28
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--arc-muted)' }}>CVC</label>
              <div
                className="w-full px-4 py-3 rounded-2xl border text-sm font-mono"
                style={{ borderColor: '#eadfd4', background: '#fbf6f1', color: '#a28f82' }}
              >
                •••
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--arc-muted)' }}>Routing Number</label>
            <div
              className="w-full px-4 py-3 rounded-2xl border text-sm font-mono"
              style={{ borderColor: '#eadfd4', background: '#fbf6f1', color: '#a28f82' }}
            >
              021000021
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--arc-muted)' }}>Account Number</label>
            <div
              className="w-full px-4 py-3 rounded-2xl border text-sm font-mono"
              style={{ borderColor: '#eadfd4', background: '#fbf6f1', color: '#a28f82' }}
            >
              ••••••••4242
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 3: Success ───────────────────────────────────────── */

function PaymentSuccess({
  phase,
  currencySymbol,
  onClose,
}: {
  phase: Phase;
  currencySymbol: string;
  onClose: () => void;
}) {
  return (
    <div className="text-center py-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))', boxShadow: '0 4px 16px rgba(227,87,28,0.36)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--arc-ink)' }}>Payment Received!</h2>
      <p className="text-sm mb-1" style={{ color: 'var(--arc-muted)' }}>
        {phase.label} · {currencySymbol}{fmt(phase.amount)}
      </p>
      <p className="text-xs mb-6" style={{ color: '#9b8b7f' }}>A receipt has been sent to your email.</p>

      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-2xl text-sm font-bold"
        style={{ background: '#fff7f1', color: 'var(--arc-ink)', border: '1px solid var(--arc-border)' }}
      >
        Done
      </button>
    </div>
  );
}

/* ─── Main bottom sheet ─────────────────────────────────────── */

type Step = 'select' | 'pay' | 'success';

interface PaymentBottomSheetProps {
  open: boolean;
  phases: Phase[];
  currencySymbol: string;
  initialPhaseId?: string;
  onClose: () => void;
  onPaymentComplete: (phaseId: string) => void;
}

export function PaymentBottomSheet({
  open,
  phases,
  currencySymbol,
  initialPhaseId,
  onClose,
  onPaymentComplete,
}: PaymentBottomSheetProps) {
  const firstUnpaid = phases.find(p => p.status !== 'paid');
  const [selectedPhaseId, setSelectedPhaseId] = useState(
    initialPhaseId || firstUnpaid?.id || phases[0]?.id
  );
  const [step, setStep] = useState<Step>('select');
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [paying, setPaying] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep('select');
      setSelectedPhaseId(initialPhaseId || firstUnpaid?.id || phases[0]?.id);
    }
  }, [open, initialPhaseId, firstUnpaid?.id, phases]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const selectedPhase = phases.find(p => p.id === selectedPhaseId);

  const handlePay = async () => {
    if (!selectedPhase) return;
    setPaying(true);
    await new Promise(r => setTimeout(r, 1500)); // simulate API
    setPaying(false);
    setStep('success');
    onPaymentComplete(selectedPhaseId);
  };

  const STEP_TITLES: Record<Step, string> = {
    select: 'Make a Payment',
    pay: 'Payment Details',
    success: '',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px]"
        style={{
          background: 'linear-gradient(180deg,#fffdfb,#fbf5ef)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: open
            ? 'transform 0.4s cubic-bezier(0.22,1,0.36,1)'
            : 'transform 0.25s ease-in',
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -24px 48px rgba(15,23,42,0.18)',
          borderTop: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#d9cec2' }} />
        </div>

        {/* Header */}
        {step !== 'success' && (
          <div className="flex items-center px-5 py-3 shrink-0">
            {step === 'pay' && (
              <button
                onClick={() => setStep('select')}
                className="mr-3 w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: '#f7f2ec' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-bold flex-1" style={{ color: 'var(--arc-ink)' }}>{STEP_TITLES[step]}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: '#f7f2ec', color: 'var(--arc-muted)' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {step === 'select' && (
            <>
              <p className="text-sm mb-5" style={{ color: 'var(--arc-muted)' }}>
                Choose which payment to make now.
              </p>
              <PhaseSelector
                phases={phases}
                selectedPhaseId={selectedPhaseId}
                currencySymbol={currencySymbol}
                onSelect={setSelectedPhaseId}
              />

              <div className="mt-6">
                {/* Summary row */}
                <div
                  className="flex justify-between items-center px-4 py-3 rounded-2xl mb-4"
                  style={{ background: '#fff8f3', border: '1px solid #f0c4a9', boxShadow: '0 10px 22px rgba(227,87,28,0.08)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--arc-muted)' }}>Amount due now</span>
                  <span className="text-lg font-extrabold" style={{ color: 'var(--arc-ink)' }}>
                    {currencySymbol}{fmt(selectedPhase?.amount ?? 0)}
                  </span>
                </div>

                <button
                  onClick={() => setStep('pay')}
                  disabled={!selectedPhase || selectedPhase.status === 'paid'}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
                    boxShadow: '0 10px 20px rgba(227,87,28,0.28)',
                    opacity: !selectedPhase || selectedPhase.status === 'paid' ? 0.5 : 1,
                  }}
                >
                  Continue to Payment →
                </button>
              </div>
            </>
          )}

          {step === 'pay' && selectedPhase && (
            <>
              {/* Amount reminder */}
              <div
                className="flex justify-between items-center px-4 py-3 rounded-2xl mb-5"
                style={{ background: '#fff8f3', border: '1.5px solid #f0c4a9', boxShadow: '0 10px 22px rgba(227,87,28,0.08)' }}
              >
                <div>
                  <p className="text-xs font-semibold mb-0" style={{ color: 'var(--arc-orange-deep)' }}>{selectedPhase.label}</p>
                  <p className="text-xs mb-0" style={{ color: 'var(--arc-muted)' }}>{selectedPhase.description}</p>
                </div>
                <span className="text-xl font-extrabold" style={{ color: 'var(--arc-ink)' }}>
                  {currencySymbol}{fmt(selectedPhase.amount)}
                </span>
              </div>

              <PaymentMethodSelector method={payMethod} onSelect={setPayMethod} />

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white mt-6"
                style={{
                  background: paying
                    ? '#b9ada0'
                    : 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
                  boxShadow: paying ? 'none' : '0 10px 20px rgba(227,87,28,0.28)',
                  transition: 'all 0.2s',
                }}
              >
                {paying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  `Pay ${currencySymbol}${fmt(selectedPhase.amount)}`
                )}
              </button>

              <p className="text-xs text-center mt-3" style={{ color: '#9b8b7f' }}>
                🔒 Secured by 256-bit SSL encryption
              </p>
            </>
          )}

          {step === 'success' && selectedPhase && (
            <PaymentSuccess
              phase={selectedPhase}
              currencySymbol={currencySymbol}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
