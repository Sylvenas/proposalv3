import { useCallback, useState } from 'react';
import type { Phase, Proposal, ProposalOption } from '../data/mockProposal';
import { HeroBand } from '../components/HeroBand';
import { PriceReveal } from '../components/PriceReveal';
import { PaymentTimeline } from '../components/PaymentTimeline';
import { ProductList } from '../components/ProductList';
import {
  OptionPills,
  OptionHeroCard,
  ValueSpectrum,
  MiniOptionCard,
} from '../components/OptionSelector';
import { BlueprintPreview } from '../components/BlueprintPreview';
import { DrawingPreview } from '../components/DrawingPreview';
import { StickyFooter } from '../components/StickyFooter';
import { ApproveBottomSheet } from '../components/ApproveBottomSheet';
import { SuccessConfetti } from '../components/SuccessConfetti';
import { StatusBanner } from '../components/StatusBanner';
import { PaymentBottomSheet } from '../components/PaymentBottomSheet';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

/* ─── Desktop right panel ────────────────────────────────────── */

function DesktopRightPanel({
  proposal,
  selectedOption,
  phases,
  onApprove,
  onPayment,
  onSelectOption,
}: {
  proposal: Proposal;
  selectedOption: ProposalOption;
  phases: Phase[];
  onApprove: () => void;
  onPayment: () => void;
  onSelectOption: (id: string) => void;
}) {
  const isApproved = !!proposal.approvedOptionId;
  const isApprovedOption = proposal.approvedOptionId === selectedOption.id;
  const monthly = Math.round(selectedOption.total / 120);
  const firstUnpaid = phases.find(p => p.status !== 'paid');
  const totalPaid = phases.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pctPaid = selectedOption.total > 0 ? Math.round((totalPaid / selectedOption.total) * 100) : 0;

  return (
    <div className="sticky top-6 flex flex-col gap-5">
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(180deg,var(--arc-surface),#fff8f3)',
          border: isApprovedOption ? '1.5px solid #f3cfb6' : '1.5px solid var(--arc-border)',
          boxShadow: 'var(--arc-shadow)',
        }}
      >
        {isApprovedOption && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: 'var(--arc-orange-soft)' }}>
            <span>✅</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--arc-orange-deep)' }}>Approved</span>
          </div>
        )}
        {selectedOption.isRecommended && !isApproved && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--arc-orange)' }}>
              Recommended
            </span>
          </div>
        )}

        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--arc-ink)' }}>{selectedOption.name}</h3>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--arc-ink)' }}>
            {proposal.currencySymbol}{fmt(selectedOption.total)}
          </span>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--arc-muted)' }}>
          ≈ {proposal.currencySymbol}{fmt(monthly)}/month over 10 years
        </p>

        {isApprovedOption && phases.length > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--arc-muted)' }}>
              <span>Paid {proposal.currencySymbol}{fmt(totalPaid)}</span>
              <span>{pctPaid}% complete</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ece5de' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pctPaid}%`,
                  background: 'linear-gradient(90deg,var(--arc-orange),var(--arc-orange-deep))',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            {firstUnpaid && (
              <p className="text-xs mt-2" style={{ color: 'var(--arc-muted)' }}>
                Next: {firstUnpaid.label} — {proposal.currencySymbol}{fmt(firstUnpaid.amount)}
              </p>
            )}
          </div>
        )}

        {!isApproved && phases.length > 0 && (
          <div className="mb-5 space-y-2">
            {phases.map(phase => (
              <div key={phase.id} className="flex justify-between text-sm">
                <span style={{ color: 'var(--arc-muted)' }}>{phase.label}</span>
                <span className="font-semibold" style={{ color: 'var(--arc-ink)' }}>
                  {proposal.currencySymbol}{fmt(phase.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {!isApproved ? (
          <button
            onClick={onApprove}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
              boxShadow: '0 10px 20px rgba(227,87,28,0.28)',
            }}
          >
            Approve This Proposal
          </button>
        ) : isApprovedOption && firstUnpaid ? (
          <button
            onClick={onPayment}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))',
              boxShadow: '0 10px 20px rgba(227,87,28,0.24)',
            }}
          >
            Pay {proposal.currencySymbol}{fmt(firstUnpaid.amount)} Now →
          </button>
        ) : isApprovedOption ? (
          <div
            className="w-full py-3.5 rounded-xl text-sm font-bold text-center"
            style={{ background: 'var(--arc-orange-soft)', color: 'var(--arc-orange-deep)' }}
          >
            🎉 Fully Paid
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-4 mt-4">
          <a href={selectedOption.pdfUrl || '#'} className="text-xs font-medium" style={{ color: 'var(--arc-muted)' }}>
            Download PDF
          </a>
          <span style={{ color: 'var(--arc-border)' }}>|</span>
          <a href={`mailto:${proposal.salesEmail}`} className="text-xs font-medium" style={{ color: 'var(--arc-muted)' }}>
            Questions?
          </a>
        </div>
      </div>

      {proposal.options.length > 1 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--arc-surface)', border: '1.5px solid var(--arc-border)', boxShadow: 'var(--arc-shadow)' }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
            {isApproved ? 'Your Package' : 'Compare Options'}
          </p>
          <div className="flex flex-col gap-2">
            {proposal.options.map(opt => {
              const selected = opt.id === selectedOption.id;
              const approved = opt.id === proposal.approvedOptionId;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelectOption(opt.id)}
                  className="w-full text-left px-4 py-3 rounded-xl border transition-all text-sm"
                  style={{
                    background: approved ? '#edf9f3' : selected ? 'var(--arc-orange-soft)' : 'white',
                    borderColor: approved ? '#9bd8bc' : selected ? '#f1be9f' : 'var(--arc-border)',
                    fontWeight: selected ? 700 : 400,
                    color: approved ? '#166534' : selected ? 'var(--arc-orange-deep)' : 'var(--arc-ink)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>{opt.name}{approved ? ' ✓' : ''}</span>
                    <span className="text-base font-bold" style={{ color: approved ? 'var(--arc-green)' : selected ? 'var(--arc-orange)' : 'var(--arc-ink)' }}>
                      {proposal.currencySymbol}{fmt(opt.total)}
                    </span>
                  </div>
                  {opt.id === proposal.recommendedOptionId && !approved && (
                    <span className="text-xs font-normal" style={{ color: 'var(--arc-orange)' }}>★ Recommended</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */

interface ProposalPageProps {
  proposal: Proposal;
}

export function ProposalPage({ proposal }: ProposalPageProps) {
  const defaultOption =
    proposal.options.find(o => o.id === proposal.approvedOptionId) ||
    proposal.options.find(o => o.id === proposal.recommendedOptionId) ||
    proposal.options[0];

  const [selectedId, setSelectedId] = useState(defaultOption.id);
  const [heroVisible, setHeroVisible] = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentPhaseId, setPaymentPhaseId] = useState<string | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [approvedOptionId, setApprovedOptionId] = useState(proposal.approvedOptionId);
  const [approving, setApproving] = useState(false);

  // Local phase state (to reflect paid status after payment)
  const [phaseOverrides, setPhaseOverrides] = useState<Record<string, 'paid'>>({});

  const selectedOption = proposal.options.find(o => o.id === selectedId) || defaultOption;
  const isApproved = Boolean(approvedOptionId);
  const isApprovedOption = approvedOptionId === selectedId;

  // Merge phase overrides (simulate payment)
  const currentPhases = selectedOption.paymentPhases.map(p =>
    phaseOverrides[p.id] ? { ...p, status: 'paid' as const } : p
  );
  const firstUnpaid = currentPhases.find(p => p.status !== 'paid');

  const isBadStatus = ['RECALLED', 'EXPIRED', 'VOID', 'LOST', 'DELETED'].includes(proposal.status);

  const handleHeroVisibility = useCallback((v: boolean) => setHeroVisible(v), []);

  const handleApproveConfirm = async () => {
    setApproving(true);
    await new Promise(r => setTimeout(r, 1200));
    setApproving(false);
    setApprovedOptionId(selectedId);
    setShowApprove(false);
    setShowSuccess(true);
  };

  const openPayment = (phaseId?: string) => {
    setPaymentPhaseId(phaseId || firstUnpaid?.id);
    setShowPayment(true);
  };

  const handlePaymentComplete = (phaseId: string) => {
    setPhaseOverrides(prev => ({ ...prev, [phaseId]: 'paid' }));
  };

  /* ── Desktop ─────────────────────────────────────────────────── */
  const desktopContent = (
    <div className="hidden md:block min-h-screen" style={{ background: 'var(--arc-paper)' }}>
      {/* Topbar */}
      <div
        className="sticky top-0 z-30 px-8 h-16 flex items-center justify-between"
        style={{
          background: 'rgba(255,253,250,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--arc-border)',
          boxShadow: '0 1px 8px rgba(15,23,42,0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          {proposal.company.logoUrl ? (
            <img src={proposal.company.logoUrl} alt="Logo" className="h-7 w-auto" />
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))' }}>
              {proposal.company.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-semibold" style={{ color: 'var(--arc-ink)' }}>{proposal.name}</span>
          {isApproved && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#e7f8f0', color: 'var(--arc-green)' }}>
              ✓ Approved
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <a href={selectedOption.pdfUrl || '#'} className="text-sm font-medium" style={{ color: 'var(--arc-muted)' }}>Download PDF</a>
          <a href={`mailto:${proposal.salesEmail}`} className="text-sm font-medium" style={{ color: 'var(--arc-muted)' }}>Questions?</a>
        </div>
      </div>

      {/* Hero */}
      <div className="w-full relative" style={{ height: 280, background: 'linear-gradient(160deg,#1f334b,#14273a)', overflow: 'hidden' }}>
        {proposal.coverImageUrl && (
          <img src={proposal.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.24, filter: 'saturate(0.55) brightness(0.9)' }} />
        )}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(227,87,28,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(227,87,28,0.12) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(20,39,58,0.92),rgba(20,39,58,0.58) 55%,rgba(20,39,58,0.2))' }} />
        <div className="relative z-10 h-full flex flex-col justify-end px-16 pb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full w-fit" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#ffd6c3' }}>ArcSite Proposal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{proposal.name}</h1>
          <p className="text-base" style={{ color: '#d6dee8' }}>Prepared for {proposal.customerName}</p>
        </div>
      </div>

      {/* Two-column */}
      <div className="px-16 py-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="flex flex-col gap-8">
            {isBadStatus && <StatusBanner status={proposal.status} salesEmail={proposal.salesEmail} />}

            {proposal.options.length > 1 && (
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
                  {isApproved ? 'Your Package' : 'Choose Your Package'}
                </p>
                <OptionPills options={proposal.options} selectedId={selectedId} approvedId={approvedOptionId} onSelect={setSelectedId} />
              </div>
            )}

            {/* Payment timeline in main column for approved */}
            {isApprovedOption && (
              <PaymentTimeline
                phases={currentPhases}
                currencySymbol={proposal.currencySymbol}
                onPayPhase={openPayment}
              />
            )}

            <ProductList productGroups={selectedOption.productGroups} />
            <DrawingPreview
              drawingPreviewUrl={selectedOption.drawingPreviewUrl}
              pdfUrl={selectedOption.pdfUrl}
            />
            <BlueprintPreview coverImageUrl={selectedOption.coverImageUrl} />
          </div>

          <DesktopRightPanel
            proposal={{ ...proposal, approvedOptionId }}
            selectedOption={selectedOption}
            phases={currentPhases}
            onApprove={() => setShowApprove(true)}
            onPayment={() => openPayment()}
            onSelectOption={setSelectedId}
          />
        </div>
      </div>
    </div>
  );

  /* ── Mobile ──────────────────────────────────────────────────── */
  const mobileContent = (
    <div className="md:hidden min-h-screen" style={{ background: 'var(--arc-paper)', paddingBottom: 100 }}>
      <HeroBand proposal={proposal} coverImageUrl={selectedOption.coverImageUrl} onVisibilityChange={handleHeroVisibility} />

      <div className="flex flex-col gap-8 px-4 pt-6">
        {isBadStatus && <StatusBanner status={proposal.status} salesEmail={proposal.salesEmail} />}

        {/* APPROVED: Payment progress hero */}
        {isApprovedOption && !isBadStatus && (
          <div
            className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg,#fff6ef,#fff2e8)', border: '1.5px solid #f3cfb6', boxShadow: 'var(--arc-shadow)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span>✅</span>
              <span className="text-sm font-bold" style={{ color: 'var(--arc-orange-deep)' }}>Proposal Approved</span>
            </div>
            {firstUnpaid ? (
              <>
                <p className="text-xs mb-1" style={{ color: 'var(--arc-muted)' }}>Next payment due</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--arc-ink)' }}>
                    {proposal.currencySymbol}{fmt(firstUnpaid.amount)}
                  </span>
                  <span className="text-sm mb-1" style={{ color: 'var(--arc-muted)' }}>{firstUnpaid.label}</span>
                </div>
                <button
                  onClick={() => openPayment(firstUnpaid.id)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))', boxShadow: '0 10px 20px rgba(227,87,28,0.24)' }}
                >
                  Pay {proposal.currencySymbol}{fmt(firstUnpaid.amount)} Now →
                </button>
              </>
            ) : (
              <p className="text-sm font-semibold" style={{ color: 'var(--arc-orange-deep)' }}>🎉 All payments complete!</p>
            )}
          </div>
        )}

        {/* Multi-option selector */}
        {proposal.options.length > 1 && (
          <section>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
              {isApproved ? 'Your Package' : 'Choose Your Package'}
            </p>
            <div className="mb-4">
              <OptionPills options={proposal.options} selectedId={selectedId} approvedId={approvedOptionId} onSelect={setSelectedId} />
            </div>
            <OptionHeroCard
              option={selectedOption}
              currencySymbol={proposal.currencySymbol}
              approvedId={approvedOptionId}
              onApprove={!isApproved && !isBadStatus ? () => setShowApprove(true) : undefined}
            />
            {proposal.options.filter(o => o.id !== selectedId).length > 0 && (
              <div className="flex gap-2 mt-3">
                {proposal.options.filter(o => o.id !== selectedId).map(opt => (
                  <MiniOptionCard key={opt.id} option={opt} currencySymbol={proposal.currencySymbol} onSelect={setSelectedId} />
                ))}
              </div>
            )}
            <div className="mt-4">
              <ValueSpectrum options={proposal.options} selectedId={selectedId} currencySymbol={proposal.currencySymbol} />
            </div>
          </section>
        )}

        {/* Single option price */}
        {proposal.options.length === 1 && (
          <PriceReveal total={selectedOption.total} currencySymbol={proposal.currencySymbol} />
        )}

        {proposal.options.length > 1 && (
          <PriceReveal total={selectedOption.total} currencySymbol={proposal.currencySymbol} />
        )}

        <DrawingPreview
          drawingPreviewUrl={selectedOption.drawingPreviewUrl}
          pdfUrl={selectedOption.pdfUrl}
        />

        {/* Payment timeline — always show, wired up if approved */}
        <PaymentTimeline
          phases={currentPhases}
          currencySymbol={proposal.currencySymbol}
          onPayPhase={isApprovedOption ? openPayment : undefined}
        />

        <ProductList productGroups={selectedOption.productGroups} />
        <BlueprintPreview coverImageUrl={selectedOption.coverImageUrl} />

        {/* Single option approve CTA */}
        {proposal.options.length === 1 && !isApproved && !isBadStatus && (
          <button
            onClick={() => setShowApprove(true)}
            className="w-full py-4 rounded-2xl text-base font-bold text-white"
            style={{ background: 'linear-gradient(135deg,var(--arc-orange),var(--arc-orange-deep))', boxShadow: '0 10px 20px rgba(227,87,28,0.28)' }}
          >
            Approve This Proposal
            <span className="block text-xs font-normal mt-0.5 opacity-80">
              {proposal.currencySymbol}{fmt(selectedOption.total)} · Tap to review
            </span>
          </button>
        )}

        <div className="flex items-center justify-center gap-6 pb-2">
          <a href={selectedOption.pdfUrl || '#'} className="text-sm font-medium" style={{ color: 'var(--arc-muted)' }}>Download PDF</a>
          <a href={`mailto:${proposal.salesEmail}`} className="text-sm font-medium" style={{ color: 'var(--arc-muted)' }}>Questions?</a>
        </div>
      </div>

      {/* Sticky footer */}
      {!isBadStatus && (
        <StickyFooter
          currencySymbol={proposal.currencySymbol}
          isApproved={isApproved}
          isVisible={heroVisible}
          onApprove={() => setShowApprove(true)}
          onPayment={isApproved && firstUnpaid ? () => openPayment() : undefined}
          title={isApproved && firstUnpaid ? firstUnpaid.label : selectedOption.name}
          amount={isApproved && firstUnpaid ? firstUnpaid.amount : selectedOption.total}
        />
      )}
    </div>
  );

  return (
    <>
      {mobileContent}
      {desktopContent}

      <ApproveBottomSheet
        open={showApprove}
        option={selectedOption}
        currencySymbol={proposal.currencySymbol}
        esignRequired={proposal.esignRequired}
        approving={approving}
        onConfirm={handleApproveConfirm}
        onCancel={() => setShowApprove(false)}
      />

      <PaymentBottomSheet
        open={showPayment}
        phases={currentPhases}
        currencySymbol={proposal.currencySymbol}
        initialPhaseId={paymentPhaseId}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={handlePaymentComplete}
      />

      <SuccessConfetti
        open={showSuccess}
        blueprintUrl={selectedOption.coverImageUrl}
        customerName={proposal.customerName}
        salesName={proposal.salesName}
        onClose={() => setShowSuccess(false)}
        onPayment={() => { setShowSuccess(false); openPayment(); }}
        paymentEnabled={currentPhases.some(p => p.status !== 'paid')}
      />
    </>
  );
}
