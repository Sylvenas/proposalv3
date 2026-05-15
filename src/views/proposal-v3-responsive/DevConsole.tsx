'use client';

// ── DevConsole ────────────────────────────────────────────────────────────────
// Slide-in panel from the right edge that lets us tweak the prototype's demo
// data at runtime. Mounted unconditionally near the page root so it sits above
// every page (Options / Summary / ProjectHub) — visibility is driven by
// `isOpen` from DevConsoleContext.
//
// Toggles are grouped into clusters by the page they primarily affect, so the
// console reads top-to-bottom in the same order the user encounters those
// pages in the prototype flow (Cover → Options → Summary).

import { useDevConsole, type DevConfig, type Preset } from './DevConsoleContext';
import { RestartIcon } from './SvgIcons';

// Curated bundles bulk-applied when a Preset is selected. Each preset only
// touches the small set of toggles that meaningfully differ between
// scopes — anything not listed here is left untouched on the existing
// config. Future Scope mirrors the out-of-the-box defaults; MVP collapses
// the demo to a minimum-viable shape.
const PRESETS: Record<Preset, Partial<DevConfig>> = {
  future: {
    optionImage: 'include',
    recommendedOption: 0,
    constructionTimeInfo: 'include',
    upgrades: 'enable',
    addonsSection: 'include',
    financingService: 'enable',
    companySlogan: 'enable',
  },
  mvp: {
    inspectionReport: false,
    optionImage: 'exclude',
    recommendedOption: 1,
    constructionTimeInfo: 'exclude',
    upgrades: 'disable',
    addonsSection: 'exclude',
    financingService: 'disable',
    companySlogan: 'disable',
  },
};

export default function DevConsole() {
  const { config, setConfig, isOpen, close, restartUserflow } = useDevConsole();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200]"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Backdrop — click to dismiss */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={close}
      />

      {/* Panel */}
      <div
        className="absolute top-0 right-0 h-full w-[320px] max-w-[90vw] bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Developer console"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.1)]">
          <p className="font-semibold text-[16px] text-[#262626]">Developer Console</p>
          <button
            onClick={close}
            className="text-[#737373] text-[24px] leading-none cursor-pointer bg-transparent border-0 p-0 w-6 h-6 flex items-center justify-center"
            aria-label="Close developer console"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 scrollbar-none">
          {/* Action: send the user back to the starting page for the current
              Proposal Status — Project Home for Signed On Device, Cover for
              every other status. Closes the console so the user immediately
              sees the result.
              States:
                idle     → light (white bg, dark text, gray border)
                hover    → highlighted (light-gray bg)
                active   → dark (#262626 bg, white text) while the button
                           is being pressed; reverts on release. */}
          <button
            type="button"
            onClick={() => {
              restartUserflow();
              close();
            }}
            className="group w-full shrink-0 h-10 rounded-[4px] text-[14px] font-semibold border bg-white text-[#262626] border-[#d9d9d9] cursor-pointer transition-colors hover:bg-[#f5f5f5] active:bg-[#262626] active:text-white active:border-[#262626] flex items-center justify-center gap-2"
          >
            {/* Icon inherits the button's current text color via
                `currentColor` so it flips to white on :active alongside
                the label. */}
            <RestartIcon size={20} fill="currentColor" />
            Restart Userflow
          </button>

          <Cluster title="Preset">
            <ToggleRow
              value={config.preset}
              options={[
                { label: 'MVP', value: 'mvp' as const },
                { label: 'Future Scope', value: 'future' as const },
              ]}
              onChange={(v) =>
                setConfig((c) => ({ ...c, ...PRESETS[v], preset: v }))
              }
            />
          </Cluster>

          <Cluster title="Proposal Status">
            <ToggleRow
              value={config.proposalStatus}
              options={[
                { label: 'Valid', value: 'regular' as const },
                { label: 'Expired', value: 'expired' as const },
                { label: 'Recalled', value: 'recalled' as const },
                { label: 'Deleted', value: 'deleted' as const },
                { label: 'Lost', value: 'lost' as const },
                { label: 'Void', value: 'void' as const },
                { label: 'Signed On Device', value: 'signedOnDevice' as const, colSpan: 2, disabled: true },
              ]}
              onChange={(v) => setConfig((c) => ({ ...c, proposalStatus: v }))}
              maxPerRow={3}
            />
          </Cluster>

          <Cluster title="Cover Page">
            <Section title="Inspection Report">
              <ToggleRow
                value={config.inspectionReport}
                options={[
                  { label: 'Excluded', value: false },
                  { label: 'Included', value: true },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, inspectionReport: v }))}
              />
            </Section>
            <Section title="Company Slogan">
              <ToggleRow
                value={config.companySlogan}
                options={[
                  { label: 'Enabled', value: 'enable' as const },
                  { label: 'Disabled', value: 'disable' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, companySlogan: v }))}
              />
            </Section>
          </Cluster>

          <Cluster title="Option Selection / Comparison Page">
            <Section title="Number of Options">
              <ToggleRow
                value={config.optionCount}
                options={[1, 2, 3, 4].map((n) => ({ label: String(n), value: n }))}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    optionCount: v,
                    recommendedOption: c.recommendedOption > v ? 0 : c.recommendedOption,
                  }))
                }
              />
            </Section>
            <Section title="Recommended Option">
              <ToggleRow
                value={config.recommendedOption}
                options={[
                  { label: 'None', value: 0 },
                  ...[1, 2, 3, 4].map((n) => ({
                    label: `#${n}`,
                    value: n,
                    disabled: config.optionCount < 2 || n > config.optionCount,
                  })),
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, recommendedOption: v }))}
              />
            </Section>
            <Section title="Option Image">
              <ToggleRow
                value={config.optionImage}
                options={[
                  { label: 'Included', value: 'include' as const },
                  { label: 'Excluded', value: 'exclude' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, optionImage: v }))}
              />
            </Section>
            <Section title="Construction Time Info">
              <ToggleRow
                value={config.constructionTimeInfo}
                options={[
                  { label: 'Included', value: 'include' as const },
                  { label: 'Excluded', value: 'exclude' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, constructionTimeInfo: v }))}
              />
            </Section>
            <Section title="Change Option Interaction">
              <ToggleRow
                value={config.changeOptionInteraction}
                options={[
                  { label: 'Checkbox', value: 'checkbox' as const },
                  { label: 'Button', value: 'button' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, changeOptionInteraction: v }))}
              />
            </Section>
          </Cluster>

          <Cluster title="Summary Page">
            <Section title="Upgrade">
              <ToggleRow
                value={config.upgrades}
                options={[
                  { label: 'Enabled', value: 'enable' as const },
                  { label: 'Disabled', value: 'disable' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, upgrades: v }))}
              />
            </Section>
            <Section title="Add-on">
              <ToggleRow
                value={config.addonsSection}
                options={[
                  { label: 'Included', value: 'include' as const },
                  { label: 'Excluded', value: 'exclude' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, addonsSection: v }))}
              />
            </Section>
            <Section title="Signature">
              <ToggleRow
                value={config.signatureRequired}
                options={[
                  { label: 'Not Required', value: false },
                  { label: 'Required', value: true },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, signatureRequired: v }))}
              />
            </Section>
            <Section title="Financing Estimation">
              <ToggleRow
                value={config.financingEstimation}
                options={[
                  { label: 'Included', value: 'included' as const },
                  { label: 'Excluded', value: 'excluded' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, financingEstimation: v }))}
              />
            </Section>
            <Section title="Number of Scheduled Payments">
              <ToggleRow
                value={config.scheduledPaymentsCount}
                options={[
                  { label: 'Common', value: 'common' as const },
                  { label: 'Overflow', value: 'overflow' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, scheduledPaymentsCount: v }))}
              />
            </Section>
          </Cluster>

          <Cluster title="Project Hub">
            <Section title="Financing Service">
              <ToggleRow
                value={config.financingService}
                options={[
                  { label: 'Enabled', value: 'enable' as const },
                  { label: 'Disabled', value: 'disable' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, financingService: v }))}
              />
            </Section>
            <Section title="Payment Info Input">
              <ToggleRow
                value={config.paymentInfoInput}
                options={[
                  { label: 'Prefilled', value: 'prefilled' as const },
                  { label: 'Blank', value: 'blank' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, paymentInfoInput: v }))}
              />
            </Section>
            <Section title="Payment Result">
              <ToggleRow
                value={config.paymentResult}
                options={[
                  { label: 'Success', value: 'success' as const },
                  { label: 'Failure', value: 'failure' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, paymentResult: v }))}
              />
            </Section>
            <Section title="Payment Completion Indication">
              <ToggleRow
                value={config.paymentCompletionIndication}
                options={[
                  { label: 'Seal', value: 'seal' as const },
                  { label: 'Check Mark', value: 'check' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, paymentCompletionIndication: v }))}
              />
            </Section>
            <Section title="Invoice">
              <ToggleRow
                value={config.invoiceMode}
                options={[
                  { label: 'Happy Path', value: 'happyPath' as const },
                  { label: 'Enumerated States', value: 'enumerate' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, invoiceMode: v }))}
              />
            </Section>
          </Cluster>
        </div>
      </div>
    </div>
  );
}

// Cluster — page-level group header plus nested sections, separated by a
// hairline rule. Margins handled by the parent's gap-6.
function Cluster({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 pb-1 border-b border-[rgba(0,0,0,0.08)] last:border-b-0 last:pb-0">
      <p className="text-[13px] font-semibold text-[#262626]">{title}</p>
      <div className="flex flex-col gap-4 pl-1 pb-4">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373]">
        {title}
      </p>
      {children}
    </div>
  );
}

// Generic toggle row used by every Section — picks the active button by
// reference equality with `value`. Pass `maxPerRow={3}` to opt into a 3-column
// grid that wraps when the option count exceeds the row width (used by
// Proposal Status, which now has five options).
function ToggleRow<T>({
  value,
  options,
  onChange,
  maxPerRow,
}: {
  value: T;
  /** Each option may set `colSpan` to widen the button in grid mode (only
   *  meaningful when `maxPerRow` is set; in flex mode each button is
   *  already flex-1). Defaults to 1. */
  options: { label: string; value: T; disabled?: boolean; colSpan?: 2 | 3 }[];
  onChange: (next: T) => void;
  maxPerRow?: 3;
}) {
  const useGrid = maxPerRow === 3;
  return (
    <div className={useGrid ? 'grid grid-cols-3 gap-2' : 'flex gap-2'}>
      {options.map(({ label, value: optionValue, disabled, colSpan }) => {
        const active = value === optionValue;
        const layoutClass = useGrid
          ? colSpan === 3
            ? 'col-span-3'
            : colSpan === 2
              ? 'col-span-2'
              : ''
          : 'flex-1';
        return (
          <button
            key={label}
            onClick={() => onChange(optionValue)}
            disabled={disabled}
            className={`${layoutClass} h-10 rounded-[4px] text-[14px] font-semibold border ${
              disabled
                ? 'bg-white text-[#bfbfbf] border-[#f0f0f0] cursor-not-allowed'
                : active
                  ? 'bg-[#262626] text-white border-[#262626] cursor-pointer'
                  : 'bg-white text-[#262626] border-[#d9d9d9] cursor-pointer'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
