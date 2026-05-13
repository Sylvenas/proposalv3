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

import { useDevConsole } from './DevConsoleContext';

export default function DevConsole() {
  const { config, setConfig, isOpen, close } = useDevConsole();

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

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          <Cluster title="Cover Page">
            <Section title="Inspection Report">
              <ToggleRow
                value={config.inspectionReport}
                options={[
                  { label: 'Exclude', value: false },
                  { label: 'Include', value: true },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, inspectionReport: v }))}
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
            <Section title="Option Image">
              <ToggleRow
                value={config.optionImage}
                options={[
                  { label: 'Include', value: 'include' as const },
                  { label: 'Exclude', value: 'exclude' as const },
                ]}
                onChange={(v) => setConfig((c) => ({ ...c, optionImage: v }))}
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
                  { label: 'Enumerate States', value: 'enumerate' as const },
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
// reference equality with `value`.
function ToggleRow<T>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T; disabled?: boolean }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map(({ label, value: optionValue, disabled }) => {
        const active = value === optionValue;
        return (
          <button
            key={label}
            onClick={() => onChange(optionValue)}
            disabled={disabled}
            className={`flex-1 h-10 rounded-[4px] text-[14px] font-semibold border ${
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
