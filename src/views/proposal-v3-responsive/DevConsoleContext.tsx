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
export type OptionImage = 'include' | 'exclude';
export type FinancingService = 'enable' | 'disable';
export type AddonsSectionVisibility = 'include' | 'exclude';
export type Upgrades = 'enable' | 'disable';
export type Preset = 'mvp' | 'future';
export type ConstructionTimeInfo = 'include' | 'exclude';
export type ProposalStatus =
  | 'regular'
  | 'expired'
  | 'recalled'
  | 'deleted'
  | 'lost'
  | 'void'
  | 'signedOnDevice';
export type CompanySlogan = 'enable' | 'disable';
/** Payment state to simulate on the Change Order Approval Page.
 *  'underPaid' (default) keeps the current state where the existing
 *  contract still has outstanding balance. 'fullyPaid' and 'overPaid'
 *  are reserved for upcoming UI variants. */
export type ExistingPayment = 'underPaid' | 'fullyPaid' | 'overPaid';
/** Color palette used for the Over Paid warning indications (progress bar,
 *  row accent bar, "Need Refund" / "Overpaid" text). 'red' (default) is
 *  the alert palette; 'yellow' uses the softer amber/orange tones. */
export type OverpaidIndication = 'red' | 'yellow';
/** Controls whether per-invoice status rows are visible inside the
 *  "Before / After Change Order" comparison panels on the Change Order
 *  Approval Page's Invoices & Payments tab. 'omitted' (default) keeps
 *  the current state (panels show only progress + totals, not invoice
 *  status). 'shown' surfaces the per-invoice status list inside each
 *  comparison panel — exact rendering is TBD. */
export type InvoiceStatusInComparison = 'omitted' | 'shown';
/** Top-level document type rendered by the prototype. 'proposal' (default)
 *  runs the regular Proposal flow (Cover → Options → Summary → Project Hub).
 *  'changeOrder' switches to a placeholder Change Order page so that variant
 *  can be iterated independently. */
export type ProposalType = 'proposal' | 'changeOrder';

/** Abstract page identity shared across the Proposal and Change Order flows.
 *  Each flow publishes its current page (via useEffect) and reads this value
 *  on mount so toggling `config.type` lands the user on the equivalent page
 *  in the other flow. Mapping:
 *    Proposal flow                ↔ Change Order flow
 *    ─────────────────────────────────────────────────────
 *    Cover            ('cover')   → tab='home'
 *    Options          ('options') → tab='home'
 *    Summary          ('summary') ↔ tab='home' (Change Order Approval Page)
 *    Hub: Home        ('hub.home')      → tab='home'
 *    Hub: Contract    ('hub.contract')  ↔ tab='contract'
 *    Hub: Invoices    ('hub.invoices')  ↔ tab='invoices'
 *    (no equivalent)  ('hub.changes')   ← tab='changes' (falls back to Hub: Home in proposal mode)
 */
export type PageIntent =
  | 'cover'
  | 'options'
  | 'summary'
  | 'hub.home'
  | 'hub.contract'
  | 'hub.invoices'
  | 'hub.changes';

export type DevConfig = {
  /** How many fence options the prototype renders (1–4). */
  optionCount: number;
  /** Which option is marked as recommended. 0 = none, 1..optionCount = index. */
  recommendedOption: number;
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
  /** Whether the Option Cards on the comparison page show their hero image.
   *  'include' (default) renders the photo. 'exclude' hides the photo and
   *  replaces it with a flat color banner above the card content; the banner
   *  color is driven by `recommendedOption` (theme red for the recommended
   *  option / when none is set; desaturated red for non-recommended cards
   *  when a recommendation exists). */
  optionImage: OptionImage;
  /** Whether the Financing Service CTA on Project Home is offered.
   *  'enable' (default) renders the outlined "Financing Service" button
   *  alongside Make A Payment. 'disable' replaces it with an outlined
   *  "View Invoice & Payment Record" shortcut that jumps to the Invoices
   *  & Payments tab. */
  financingService: FinancingService;
  /** Whether the Summary page renders the Add-ons section. 'include'
   *  (default) keeps the section. 'exclude' hides the entire Add-ons
   *  card from the Summary page. */
  addonsSection: AddonsSectionVisibility;
  /** Whether the Included Products line items expose their upgrade
   *  swatches. 'enable' (default) keeps the Change pill + upgrade
   *  bottom-sheet. 'disable' renders every upgradeable item as a plain
   *  product locked to the default option's title and description. */
  upgrades: Upgrades;
  /** Active preset for the prototype demo. Selecting a preset bulk-applies
   *  a curated set of overrides across the rest of the dev console toggles.
   *  'future' (default) matches the original out-of-the-box values; 'mvp'
   *  collapses the demo down to the smaller MVP-scope feature set. */
  preset: Preset;
  /** Whether the Option Cards and Comparison rows surface the estimated
   *  construction time line. 'include' (default) keeps both rows; 'exclude'
   *  hides the card-level "{n} Weeks Estimated Construction Time" row and
   *  the matching ComparisonParam. */
  constructionTimeInfo: ConstructionTimeInfo;
  /** Lifecycle state of the proposal demo. 'regular' (default) renders the
   *  normal cover + comparison flow. Every other status — 'recalled',
   *  'deleted', 'lost', 'void' — collapses the proposal to the locked cover
   *  curtain with the yellow "Proposal No Longer Available" pill and a
   *  Contact Sales CTA. The four non-regular values exist as separate dev
   *  toggles for QA scenarios even though they share visuals today. */
  proposalStatus: ProposalStatus;
  /** Whether the cover page renders the company tagline ("Build Your Dream
   *  Fence"). 'enable' (default) shows it; 'disable' hides it. Bulk-flipped
   *  by the Preset toggle — Future Scope keeps it on, MVP turns it off. */
  companySlogan: CompanySlogan;
  /** Top-level document type. 'proposal' (default) renders the regular flow;
   *  'changeOrder' swaps to the Change Order placeholder page. */
  type: ProposalType;
  /** Existing-payment state on the Change Order Approval Page. Only meaningful
   *  when `type === 'changeOrder'`. 'underPaid' (default) is the current
   *  behavior. 'fullyPaid' / 'overPaid' are reserved for upcoming variants. */
  existingPayment: ExistingPayment;
  /** Palette used by the Over Paid status indications. Only meaningful
   *  when `existingPayment === 'overPaid'`. */
  overpaidIndication: OverpaidIndication;
  /** Whether per-invoice status rows render inside the Change Order
   *  Approval Page's Before / After comparison panels. Only meaningful
   *  when `type === 'changeOrder'`. Defaults to 'omitted' (panels show
   *  progress + totals only). 'shown' enables a richer per-invoice
   *  status view — exact layout TBD. */
  invoiceStatusInComparison: InvoiceStatusInComparison;
};

type DevConsoleContextValue = {
  config: DevConfig;
  setConfig: (updater: (c: DevConfig) => DevConfig) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Monotonically-increasing counter. The page wiring (OptionsPageResponsive)
   *  watches it and re-applies the starting page for the current proposal
   *  status whenever it bumps. */
  restartTick: number;
  /** Bump `restartTick`. Called by the "Restart Userflow" button. */
  restartUserflow: () => void;
  /** Abstract page identity shared by the Proposal and Change Order flows so
   *  toggling `config.type` lands on the equivalent page in the other flow. */
  pageIntent: PageIntent;
  setPageIntent: (p: PageIntent) => void;
};

const DevConsoleCtx = createContext<DevConsoleContextValue | null>(null);

export function DevConsoleProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<DevConfig>({
    optionCount: 3,
    recommendedOption: 1,
    inspectionReport: false,
    signatureRequired: false,
    paymentResult: 'success',
    paymentCompletionIndication: 'seal',
    invoiceMode: 'happyPath',
    paymentInfoInput: 'prefilled',
    changeOptionInteraction: 'checkbox',
    financingEstimation: 'included',
    scheduledPaymentsCount: 'common',
    optionImage: 'exclude',
    financingService: 'disable',
    addonsSection: 'exclude',
    upgrades: 'disable',
    preset: 'mvp',
    constructionTimeInfo: 'exclude',
    proposalStatus: 'regular',
    companySlogan: 'disable',
    type: 'proposal',
    existingPayment: 'underPaid',
    overpaidIndication: 'yellow',
    invoiceStatusInComparison: 'omitted',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [restartTick, setRestartTick] = useState(0);
  const [pageIntent, setPageIntent] = useState<PageIntent>('cover');

  const value = useMemo<DevConsoleContextValue>(
    () => ({
      config,
      setConfig: (updater) => setConfigState((c) => updater(c)),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      restartTick,
      restartUserflow: () => setRestartTick((n) => n + 1),
      pageIntent,
      setPageIntent,
    }),
    [config, isOpen, restartTick, pageIntent]
  );

  return <DevConsoleCtx.Provider value={value}>{children}</DevConsoleCtx.Provider>;
}

export function useDevConsole() {
  const ctx = useContext(DevConsoleCtx);
  if (!ctx) throw new Error('useDevConsole must be used inside <DevConsoleProvider>');
  return ctx;
}
