'use client';

import { useState } from 'react';
import { ProposalPage } from './views/ProposalPage';
import {
  MOCK_PROPOSAL,
  MOCK_PROPOSAL_APPROVED,
  MOCK_PROPOSAL_SINGLE,
  type Proposal,
  type ProposalStatus,
} from './data/mockProposal';

type ScenarioKey = 'multi-pending' | 'multi-approved' | 'single' | 'expired' | 'recalled' | 'void';

const SCENARIOS: Record<ScenarioKey, { label: string; proposal: Proposal }> = {
  'multi-pending': {
    label: '3 Options · Pending',
    proposal: MOCK_PROPOSAL,
  },
  'multi-approved': {
    label: '3 Options · Approved',
    proposal: MOCK_PROPOSAL_APPROVED,
  },
  single: {
    label: 'Single Option',
    proposal: MOCK_PROPOSAL_SINGLE,
  },
  expired: {
    label: 'Expired',
    proposal: { ...MOCK_PROPOSAL, status: 'EXPIRED' as ProposalStatus },
  },
  recalled: {
    label: 'Recalled',
    proposal: { ...MOCK_PROPOSAL, status: 'RECALLED' as ProposalStatus },
  },
  void: {
    label: 'Void',
    proposal: { ...MOCK_PROPOSAL, status: 'VOID' as ProposalStatus },
  },
};

export default function App() {
  const [scenario, setScenario] = useState<ScenarioKey>('multi-pending');
  const [showSwitcher, setShowSwitcher] = useState(false);

  const currentProposal = SCENARIOS[scenario].proposal;

  return (
    <div>
      {/* Scenario switcher — prototype-only dev toolbar */}
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={() => setShowSwitcher(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg"
          style={{
            background: 'rgba(32,53,77,0.92)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
          {SCENARIOS[scenario].label}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            style={{ transform: showSwitcher ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showSwitcher && (
          <div
            className="absolute right-0 mt-2 rounded-xl overflow-hidden shadow-xl min-w-max"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--arc-border)',
              boxShadow: 'var(--arc-shadow)',
            }}
          >
            {(Object.entries(SCENARIOS) as [ScenarioKey, (typeof SCENARIOS)[ScenarioKey]][]).map(
              ([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => { setScenario(key); setShowSwitcher(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                  style={{
                    background: scenario === key ? 'var(--arc-orange-soft)' : 'transparent',
                    color: scenario === key ? 'var(--arc-orange-deep)' : 'var(--arc-ink)',
                    fontWeight: scenario === key ? 600 : 400,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  {scenario === key ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <div style={{ width: 12 }} />
                  )}
                  {label}
                </button>
              )
            )}
            <div
              className="px-4 py-2 text-xs border-t"
              style={{ borderColor: 'var(--arc-border)', color: '#9b8b7f' }}
            >
              Prototype — design review only
            </div>
          </div>
        )}
      </div>

      {/* Main proposal */}
      <ProposalPage key={scenario} proposal={currentProposal} />
    </div>
  );
}
