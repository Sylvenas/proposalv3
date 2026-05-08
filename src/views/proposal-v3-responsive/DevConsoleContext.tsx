'use client';

// ── DevConsoleContext ─────────────────────────────────────────────────────────
// Prototype-only developer console for tweaking the demo proposal's data
// configuration at runtime (e.g. switching the visible option count). Lives at
// the top of OptionsPageResponsive so its state persists across the
// Options → Summary → ProjectHub navigation.

import { createContext, useContext, useMemo, useState } from 'react';

export type PaymentResult = 'success' | 'failure';
export type PaymentCompletionIndication = 'check' | 'seal';

export type DevConfig = {
  /** How many fence options the prototype renders (1–4). */
  optionCount: number;
  /** Whether the cover page exposes an "Inspection Report" CTA. */
  inspectionReport: boolean;
  /** Whether approval requires a hand-drawn signature. When false, the
   *  "Sign & Approve" CTA becomes a simple "Approve" with a short
   *  confirmation delay. */
  signatureRequired: boolean;
  /** Outcome of the Make-A-Payment confirm step. 'success' records the
   *  payment and updates the invoice list; 'failure' shows a payment-failed
   *  screen instead. */
  paymentResult: PaymentResult;
  /** Visual treatment for the "all invoices paid" state on Project Home —
   *  inline green check + line, or the rotated "Paid in Full" seal. */
  paymentCompletionIndication: PaymentCompletionIndication;
};

type DevConsoleContextValue = {
  config: DevConfig;
  setConfig: (updater: (c: DevConfig) => DevConfig) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const DevConsoleCtx = createContext<DevConsoleContextValue | null>(null);

export function DevConsoleProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<DevConfig>({
    optionCount: 3,
    inspectionReport: false,
    signatureRequired: true,
    paymentResult: 'success',
    paymentCompletionIndication: 'seal',
  });
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<DevConsoleContextValue>(
    () => ({
      config,
      setConfig: (updater) => setConfigState((c) => updater(c)),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [config, isOpen]
  );

  return <DevConsoleCtx.Provider value={value}>{children}</DevConsoleCtx.Provider>;
}

export function useDevConsole() {
  const ctx = useContext(DevConsoleCtx);
  if (!ctx) throw new Error('useDevConsole must be used inside <DevConsoleProvider>');
  return ctx;
}
