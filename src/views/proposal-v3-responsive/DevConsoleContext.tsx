'use client';

// ── DevConsoleContext ─────────────────────────────────────────────────────────
// Prototype-only developer console for tweaking the demo proposal's data
// configuration at runtime (e.g. switching the visible option count). Lives at
// the top of OptionsPageResponsive so its state persists across the
// Options → Summary → ProjectHub navigation.

import { createContext, useContext, useMemo, useState } from 'react';

export type PaymentResult = 'success' | 'failure';
export type PaymentCompletionIndication = 'check' | 'seal';
export type InvoiceMode = 'happyPath' | 'enumerate';
export type PaymentInfoInput = 'prefilled' | 'blank';
export type ChangeOptionInteraction = 'button' | 'checkbox';
export type FinancingEstimation = 'included' | 'excluded';
export type ScheduledPaymentsCount = 'common' | 'overflow';

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
  /** Invoice list shape on the Invoices & Payments tab. 'happyPath' uses the
   *  default 3-invoice 20/60/20 schedule with the static payment chronology.
   *  'enumerate' replaces it with a synthetic list that exhibits every
   *  status × due-date combination (Paid; Partial × normal/today/overdue;
   *  Unpaid × normal/today/overdue) so QA can eyeball each variant. */
  invoiceMode: InvoiceMode;
  /** Whether the Make A Payment dialog opens with mock card/bank data
   *  already filled in ('prefilled', the default — speeds up testing the
   *  Confirm and Pay flow) or with empty fields ('blank' — exercises the
   *  validation states). */
  paymentInfoInput: PaymentInfoInput;
  /** UI treatment for the "Change Option" affordance on the comparison
   *  page. 'button' (default) shows a per-card Change Option CTA that
   *  opens the picker sheet/modal; 'checkbox' (TBD) will use inline
   *  checkboxes for direct multi-select swapping. */
  changeOptionInteraction: ChangeOptionInteraction;
  /** Whether the Summary page surfaces monthly-payment financing estimates.
   *  'included' (default) keeps the Estimated Monthly Payment row in the
   *  Summary section + the right-column estimation panel in the Payment
   *  Schedule dialog. 'excluded' hides all financing copy across both. */
  financingEstimation: FinancingEstimation;
  /** Length of the schedule rendered in the Payment Schedule dialog.
   *  'common' (default) shows the standard 3-step 20/60/20 split.
   *  'overflow' shows a 6-step demo schedule used to verify scroll /
   *  overflow handling on both the bottom sheet and the desktop modal. */
  scheduledPaymentsCount: ScheduledPaymentsCount;
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
    signatureRequired: false,
    paymentResult: 'success',
    paymentCompletionIndication: 'seal',
    invoiceMode: 'happyPath',
    paymentInfoInput: 'prefilled',
    changeOptionInteraction: 'checkbox',
    financingEstimation: 'included',
    scheduledPaymentsCount: 'common',
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
