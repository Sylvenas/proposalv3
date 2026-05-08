'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ScrollHintArrows from './ScrollHintArrows';

// ─── Types ───────────────────────────────────────────────────────────────────
export type PaymentTarget = {
  /** Outstanding balance for the invoice being paid (e.g. 4999). */
  amount: number;
  /** Subtitle line, e.g. "Balance (60%) · Henderson Backyard Fence". */
  description: string;
};

type Method = 'card' | 'bank';

// Shared form state — lifted to the dialog root so the mobile sheet and the
// desktop modal stay in sync as the viewport crosses the lg breakpoint.
type FormState = {
  method: Method;
  // Card fields
  cardholderName: string;
  cardNumber: string;
  cvv: string;
  expiration: string;
  zip: string;
  // Bank fields
  accountHolderName: string;
  accountType: string;
  routingNumber: string;
  accountNumber: string;
  repeatAccountNumber: string;
};

type SetField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

const INITIAL_FORM_STATE: FormState = {
  method: 'card',
  cardholderName: '',
  cardNumber: '',
  cvv: '',
  expiration: '',
  zip: '',
  accountHolderName: '',
  accountType: '',
  routingNumber: '',
  accountNumber: '',
  repeatAccountNumber: '',
};

// ─── Animation tuning (mirrors InvoicePaymentDetailDialog) ───────────────────
const ANIM_MS = 280;
const EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN  = 'cubic-bezier(0.4, 0, 1, 1)';

// ─── Format helpers ──────────────────────────────────────────────────────────
function fmtMoney(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Inline icons ────────────────────────────────────────────────────────────
function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3L13 13M13 3L3 13" stroke="#737373" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CardMethodIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="#262626" strokeWidth="1.5" />
      <line x1="3" y1="10.5" x2="21" y2="10.5" stroke="#262626" strokeWidth="1.5" />
      <rect x="6" y="14" width="5" height="2.5" rx="0.5" stroke="#262626" strokeWidth="1" />
    </svg>
  );
}

function BankMethodIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5L12 4L21 9.5" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 10V18M9 10V18M15 10V18M19 10V18" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 20H21" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#262626" />
      <path d="M5 8.2L7 10.2L11 6.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardInputIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="#bfbfbf" strokeWidth="1.2" />
      <line x1="2" y1="7.5" x2="16" y2="7.5" stroke="#bfbfbf" strokeWidth="1.2" />
    </svg>
  );
}

function ChevronDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M4 6L8 10L12 6" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldLockIcon({ width = 12, height = 13 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 12 13" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M6 1L11 2.5V6.5C11 9.26 8.76 11.34 6 12C3.24 11.34 1 9.26 1 6.5V2.5L6 1Z"
        stroke="#737373"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <rect x="4.4" y="5.6" width="3.2" height="2.6" rx="0.4" stroke="#737373" strokeWidth="0.8" />
      <path d="M5 5.6V4.6a1 1 0 1 1 2 0v1" stroke="#737373" strokeWidth="0.8" />
    </svg>
  );
}

// ─── Reusable form pieces ────────────────────────────────────────────────────
function FieldLabel({ children, mobile }: { children: React.ReactNode; mobile?: boolean }) {
  // Mobile: 12px at XS, 14px at sm+ (S/M tablet).
  // Desktop: 12px at L (lg), 14px at XL+.
  return (
    <p
      className={`font-semibold text-[#737373] leading-normal whitespace-nowrap ${
        mobile ? 'text-[12px] sm:text-[14px]' : 'text-[12px] xl:text-[14px]'
      }`}
    >
      {children}
    </p>
  );
}

function TextInput({
  placeholder,
  leadingIcon,
  mobile,
  value,
  onChange,
  error,
}: {
  placeholder: string;
  leadingIcon?: React.ReactNode;
  mobile?: boolean;
  value?: string;
  onChange?: (next: string) => void;
  /** When true, draws a red 1px outline. Clears once value is non-empty. */
  error?: boolean;
}) {
  return (
    <div
      className={`flex items-center h-10 w-full rounded-[4px] border border-solid gap-1 ${
        mobile ? 'px-2' : 'px-3'
      }`}
      style={{
        borderWidth: error ? 1 : 0.5,
        borderColor: error ? '#d41a32' : '#d9d9d9',
        backgroundColor: error ? 'rgba(212,26,50,0.04)' : undefined,
      }}
    >
      {leadingIcon}
      <input
        type="text"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`bg-transparent border-0 outline-none flex-1 min-w-0 leading-normal text-[#262626] placeholder:text-[#bfbfbf] ${
          mobile ? 'text-[14px] sm:text-[16px]' : 'text-[14px] xl:text-[16px]'
        }`}
        style={{ fontFamily: 'inherit', padding: 0 }}
      />
    </div>
  );
}

// Native <select> styled to match TextInput. Placeholder shows when value is
// empty; switches to label color once an option is chosen.
// Custom dropdown styled to match the rest of the dialog (no native <select>
// chrome). Trigger looks like a TextInput; menu is a floating panel rendered
// directly below with a soft shadow, matching border + radius. Click-outside
// and Escape both close the menu.
function Select({
  placeholder,
  options,
  mobile,
  value,
  onChange,
  error,
}: {
  placeholder: string;
  options: string[];
  mobile?: boolean;
  value?: string;
  onChange?: (next: string) => void;
  /** When true, draws a red 1px outline. Clears once value is non-empty. */
  error?: boolean;
}) {
  const current = value ?? '';
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sizeClass = mobile
    ? 'text-[14px] sm:text-[16px]'
    : 'text-[14px] xl:text-[16px]';

  // Close on outside click and Escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center h-10 w-full rounded-[4px] border border-solid gap-1 cursor-pointer text-left ${
          mobile ? 'px-2' : 'px-3'
        }`}
        style={{
          borderWidth: error ? 1 : 0.5,
          borderColor: error ? '#d41a32' : '#d9d9d9',
          backgroundColor: error ? 'rgba(212,26,50,0.04)' : '#ffffff',
        }}
      >
        <span
          className={`flex-1 min-w-0 leading-normal whitespace-nowrap overflow-hidden text-ellipsis ${sizeClass} ${
            current === '' ? 'text-[#bfbfbf]' : 'text-[#262626]'
          }`}
        >
          {current === '' ? placeholder : current}
        </span>
        <span
          className="flex items-center justify-center"
          style={{
            transition: 'transform 160ms ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDownIcon size={16} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-10 bg-white rounded-[4px] overflow-hidden"
          style={{
            border: '0.5px solid #d9d9d9',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt === current;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange?.(opt);
                  setOpen(false);
                }}
                className={`flex items-center w-full h-10 cursor-pointer text-left bg-white hover:bg-[#f5f5f5] ${
                  mobile ? 'px-2' : 'px-3'
                } ${sizeClass} ${isSelected ? 'text-[#262626] font-semibold' : 'text-[#262626]'}`}
                style={{ border: 0 }}
              >
                <span className="flex-1 min-w-0 leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                  {opt}
                </span>
                {isSelected && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8.5L6.5 12L13 5"
                      stroke="#262626"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Method tile ─────────────────────────────────────────────────────────────
function MethodTile({
  icon,
  title,
  subtitle,
  selected,
  onSelect,
  mobile,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
  mobile?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col items-start justify-between flex-1 min-w-0 rounded-[8px] cursor-pointer text-left bg-white ${
        mobile
          ? 'px-3 sm:px-4 py-2 sm:py-3 gap-[10px] h-[91px] sm:h-[121px]'
          : 'px-4 py-3 h-[121px]'
      }`}
      style={{
        // inset box-shadow draws the outline INSIDE the rounded clip, so the
        // corners stay crisp at non-integer thicknesses (1.5px) where a CSS
        // `border` would anti-alias against the surface beneath the radius.
        boxShadow: selected
          ? 'inset 0 0 0 1.5px #000000'
          : 'inset 0 0 0 1.5px #bfbfbf',
      }}
    >
      <div className="flex items-start justify-between w-full">
        {icon}
        <div style={{ opacity: selected ? 1 : 0 }}>
          <CheckCircleIcon size={16} />
        </div>
      </div>
      <div className="flex flex-col gap-1 items-start w-full">
        <p
          className={`font-semibold text-[#262626] leading-normal whitespace-nowrap ${
            mobile ? 'text-[12px] sm:text-[14px]' : 'text-[14px]'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-[#737373] leading-normal whitespace-nowrap ${
            mobile ? 'text-[10px] sm:text-[12px]' : 'text-[12px]'
          }`}
        >
          {subtitle}
        </p>
      </div>
    </button>
  );
}

// Card form fields — name, card+CVV row, expiration+ZIP row.
// Used inside the desktop modal and the mobile sheet.
function CardFormFields({
  mobile,
  state,
  setField,
  submitAttempted,
}: {
  mobile?: boolean;
  state: FormState;
  setField: SetField;
  /** True once the user has tried to submit with missing fields — empty
   *  fields render with a red outline until they're filled. */
  submitAttempted?: boolean;
}) {
  const errFor = (v: string) => Boolean(submitAttempted && v.trim() === '');
  // Inner-row gap mirrors the column's section gap so the rhythm matches.
  const rowGap = mobile
    ? 'gap-4 sm:gap-6 xl:gap-6 2xl:gap-8'
    : 'gap-4 xl:gap-6 2xl:gap-8';
  return (
    <>
      <div className="flex flex-col gap-1 items-start w-full">
        <FieldLabel mobile={mobile}>NAME ON CARD</FieldLabel>
        <TextInput
          mobile={mobile}
          placeholder="Cardholder Name"
          value={state.cardholderName}
          onChange={(v) => setField('cardholderName', v)}
          error={errFor(state.cardholderName)}
        />
      </div>
      <div className={`flex ${rowGap} items-start w-full`}>
        <div className="flex flex-col gap-1 items-start min-w-0" style={{ flex: '332 1 0' }}>
          <FieldLabel mobile={mobile}>CARD NUMBER</FieldLabel>
          <TextInput
            mobile={mobile}
            placeholder="1234 5678 9012 3456"
            leadingIcon={<CardInputIcon size={18} />}
            value={state.cardNumber}
            onChange={(v) => setField('cardNumber', v)}
            error={errFor(state.cardNumber)}
          />
        </div>
        <div className="flex flex-col gap-1 items-start min-w-0" style={{ flex: '129 1 0' }}>
          <FieldLabel mobile={mobile}>CVV / CVC</FieldLabel>
          <TextInput
            mobile={mobile}
            placeholder="***"
            value={state.cvv}
            onChange={(v) => setField('cvv', v)}
            error={errFor(state.cvv)}
          />
        </div>
      </div>
      <div className={`flex ${rowGap} items-start w-full`}>
        <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
          <FieldLabel mobile={mobile}>EXPIRATION DATE</FieldLabel>
          <TextInput
            mobile={mobile}
            placeholder="MM / YY"
            value={state.expiration}
            onChange={(v) => setField('expiration', v)}
            error={errFor(state.expiration)}
          />
        </div>
        <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
          <FieldLabel mobile={mobile}>ZIP / POSTAL CODE</FieldLabel>
          <TextInput
            mobile={mobile}
            placeholder="12345"
            value={state.zip}
            onChange={(v) => setField('zip', v)}
            error={errFor(state.zip)}
          />
        </div>
      </div>
    </>
  );
}

// Bank-transfer form fields. Desktop pairs Account # + Repeat Account # on
// one row to keep the form compact; mobile stacks them on their own rows
// since the sheet is narrow.
//   Row 1: ACCOUNTHOLDER NAME (full width)
//   Row 2: ROUTING NUMBER | ACCOUNT TYPE (50/50)
//   Row 3: ACCOUNT NUMBER (desktop) | REPEAT ACCOUNT NUMBER (desktop)
//          ACCOUNT NUMBER (mobile, full width)
//          REPEAT ACCOUNT NUMBER (mobile, full width)
function BankFormFields({
  mobile,
  state,
  setField,
  submitAttempted,
}: {
  mobile?: boolean;
  state: FormState;
  setField: SetField;
  submitAttempted?: boolean;
}) {
  const errFor = (v: string) => Boolean(submitAttempted && v.trim() === '');
  const rowGap = mobile
    ? 'gap-4 sm:gap-6 xl:gap-6 2xl:gap-8'
    : 'gap-4 xl:gap-6 2xl:gap-8';
  return (
    <>
      <div className="flex flex-col gap-1 items-start w-full">
        <FieldLabel mobile={mobile}>ACCOUNTHOLDER NAME</FieldLabel>
        <TextInput
          mobile={mobile}
          placeholder="Account Holder Name"
          value={state.accountHolderName}
          onChange={(v) => setField('accountHolderName', v)}
          error={errFor(state.accountHolderName)}
        />
      </div>
      <div className={`flex ${rowGap} items-start w-full`}>
        <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
          <FieldLabel mobile={mobile}>ROUTING NUMBER</FieldLabel>
          <TextInput
            mobile={mobile}
            placeholder="Routing #"
            value={state.routingNumber}
            onChange={(v) => setField('routingNumber', v)}
            error={errFor(state.routingNumber)}
          />
        </div>
        <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
          <FieldLabel mobile={mobile}>ACCOUNT TYPE</FieldLabel>
          <Select
            mobile={mobile}
            placeholder="Select..."
            options={['Checking', 'Saving']}
            value={state.accountType}
            onChange={(v) => setField('accountType', v)}
            error={errFor(state.accountType)}
          />
        </div>
      </div>
      {mobile ? (
        <>
          <div className="flex flex-col gap-1 items-start w-full">
            <FieldLabel mobile>ACCOUNT NUMBER</FieldLabel>
            <TextInput
              mobile
              placeholder="Account #"
              value={state.accountNumber}
              onChange={(v) => setField('accountNumber', v)}
              error={errFor(state.accountNumber)}
            />
          </div>
          <div className="flex flex-col gap-1 items-start w-full">
            <FieldLabel mobile>REPEAT ACCOUNT NUMBER</FieldLabel>
            <TextInput
              mobile
              placeholder="Re-Account #"
              value={state.repeatAccountNumber}
              onChange={(v) => setField('repeatAccountNumber', v)}
              error={errFor(state.repeatAccountNumber)}
            />
          </div>
        </>
      ) : (
        <div className={`flex ${rowGap} items-start w-full`}>
          <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
            <FieldLabel>ACCOUNT NUMBER</FieldLabel>
            <TextInput
              placeholder="Account #"
              value={state.accountNumber}
              onChange={(v) => setField('accountNumber', v)}
              error={errFor(state.accountNumber)}
            />
          </div>
          <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
            <FieldLabel>REPEAT ACCOUNT NUMBER</FieldLabel>
            <TextInput
              placeholder="Re-Account #"
              value={state.repeatAccountNumber}
              onChange={(v) => setField('repeatAccountNumber', v)}
              error={errFor(state.repeatAccountNumber)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Desktop left column (form) — matches Figma exactly ──────────────────────
function DesktopFormColumn({
  target,
  state,
  setField,
  submitAttempted,
}: {
  target: PaymentTarget;
  state: FormState;
  setField: SetField;
  submitAttempted: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-4 xl:gap-6 2xl:gap-8 items-start p-6 xl:p-8 2xl:p-10 min-w-0"
      style={{ flex: '6 1 0' }}
    >
      {/* Header — MAKE A PAYMENT, big amount, subtitle */}
      <div className="flex flex-col gap-1 items-start w-full">
        <p className="text-[12px] xl:text-[14px] font-semibold text-[#737373] leading-normal whitespace-nowrap">
          MAKE A PAYMENT
        </p>
        <p className="text-[20px] xl:text-[24px] text-[#262626] leading-normal whitespace-nowrap">
          {fmtMoney(target.amount).replace(/\.00$/, '')}
        </p>
        <p className="text-[14px] xl:text-[16px] text-[#737373] leading-normal whitespace-nowrap">
          {target.description}
        </p>
      </div>

      {/* Payment method tiles */}
      <div className="flex flex-col gap-1 items-start w-full">
        <FieldLabel>PAYMENT METHOD</FieldLabel>
        <div className="flex gap-1 items-start w-full">
          <MethodTile
            icon={<CardMethodIcon size={24} />}
            title="Credit / Debit Card"
            subtitle="Instant · 3% Platform fee"
            selected={state.method === 'card'}
            onSelect={() => setField('method', 'card')}
          />
          <MethodTile
            icon={<BankMethodIcon size={24} />}
            title="Bank Transfer"
            subtitle="ACH · 1-3 Business days · No fee"
            selected={state.method === 'bank'}
            onSelect={() => setField('method', 'bank')}
          />
        </div>
      </div>

      {/* Method-specific form fields */}
      {state.method === 'card' ? (
        <CardFormFields state={state} setField={setField} submitAttempted={submitAttempted} />
      ) : (
        <BankFormFields state={state} setField={setField} submitAttempted={submitAttempted} />
      )}
    </div>
  );
}

// ─── Desktop right column (summary) ──────────────────────────────────────────
function DesktopSummaryColumn({
  target,
  fee,
  total,
  onClose,
  onConfirm,
  isValid,
}: {
  target: PaymentTarget;
  fee: number;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
  /** Drives the visual disabled state on Confirm and Pay. The button still
   *  receives clicks so we can flip the highlight on missing fields. */
  isValid: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-4 xl:gap-6 2xl:gap-8 items-start p-6 xl:p-8 2xl:p-10 bg-[#fafafa] relative min-w-0"
      style={{ flex: '4 1 0', borderLeft: '0.5px solid rgba(0,0,0,0.1)' }}
    >
      {/* Header row with X */}
      <div className="flex items-start justify-between w-full pb-3">
        <p className="text-[12px] xl:text-[14px] font-semibold text-[#737373] leading-normal whitespace-nowrap">
          PAYMENT SUMMARY
        </p>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="bg-transparent border-0 cursor-pointer p-0 flex items-center justify-center"
          style={{ width: 16, height: 16 }}
        >
          <CloseIcon size={16} />
        </button>
      </div>

      {/* Amount due + Platform fee — one-step tighter than the column gap so
          the two subtotal rows read as a paired unit (better visual rhythm). */}
      <div className="flex flex-col gap-2 xl:gap-3 2xl:gap-4 items-start w-full">
        <div className="flex items-start w-full">
          <p className="flex-1 min-w-0 text-[14px] text-[#737373] leading-normal whitespace-nowrap">
            Amount due
          </p>
          <p className="text-[14px] text-[#737373] leading-normal whitespace-nowrap">
            {fmtMoney(target.amount)}
          </p>
        </div>
        <div className="flex items-start w-full">
          <p className="flex-1 min-w-0 text-[14px] text-[#737373] leading-normal whitespace-nowrap">
            Platform fee (3%)
          </p>
          <p className="text-[14px] text-[#737373] leading-normal whitespace-nowrap">
            {fmtMoney(fee)}
          </p>
        </div>
      </div>

      {/* You'll be charged */}
      <div
        className="flex items-start w-full pt-2"
        style={{ borderTop: '0.5px solid rgba(0,0,0,0.1)' }}
      >
        <p className="flex-1 min-w-0 text-[14px] text-[#262626] leading-normal whitespace-nowrap">
          You&rsquo;ll be charged
        </p>
        <p className="text-[16px] font-semibold text-[#398ae7] leading-normal whitespace-nowrap">
          {fmtMoney(total)}
        </p>
      </div>

      {/* Authorization copy — extra top margin gives breathing room from the
          "You'll be charged" total above. */}
      <p className="text-[10px] xl:text-[12px] text-[#737373] leading-normal" style={{ marginTop: 8 }}>
        By clicking &lsquo;Confirm and Pay,&rsquo; you authorize ArcSite to initiate a one-time
        debit from your provided account for{' '}
        <span className="font-semibold">{fmtMoney(total)}</span>, and acknowledge your
        agreement to our <span className="underline">terms of service.</span>
      </p>

      {/* Spacer + button + secured-by row, pushed to bottom */}
      <div className="flex flex-col gap-2 items-center justify-end flex-1 min-h-0 w-full">
        <button
          type="button"
          onClick={onConfirm}
          aria-disabled={!isValid}
          className={`bg-[#d41a32] border-0 flex items-center justify-center h-10 px-2 py-1 rounded-[2px] w-full ${
            isValid ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          <span
            className="text-[14px] font-semibold text-white text-center whitespace-nowrap"
            style={{ letterSpacing: '-0.56px', lineHeight: '16px' }}
          >
            Confirm and Pay {fmtMoney(total)}
          </span>
        </button>
        <div className="flex gap-1.5 items-center justify-center w-full">
          <ShieldLockIcon width={12} height={13} />
          <p className="text-[12px] text-[#737373] leading-normal whitespace-nowrap">
            Secured by ArcSite Payment
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile sheet body ───────────────────────────────────────────────────────
//
// Strict 1:1 port of Figma node 980:19466 — section ordering, sizing, colors,
// and gap structure all mirror the design. Outer padding 12 / 16 / 32 / 12
// (left / top / bottom / right ≈ frame x=12 inset). Sections are stacked
// with a 16px gap (matches measured y-deltas in the figma frame).
function MobileSheetScrollContent({
  target,
  fee,
  total,
  state,
  setField,
  submitAttempted,
}: {
  target: PaymentTarget;
  fee: number;
  total: number;
  state: FormState;
  setField: SetField;
  submitAttempted: boolean;
}) {
  const errFor = (v: string) => Boolean(submitAttempted && v.trim() === '');
  return (
    <div className="flex flex-col gap-6 sm:gap-8 items-start w-full px-3 sm:px-6 pt-6 pb-8 sm:pb-12">
      {/* Header — sizes scale up at sm+ to take advantage of larger tablet
          viewports (S/M get +2-4px on each line). */}
      <div className="flex flex-col gap-1 items-start w-full">
        <p className="text-[12px] sm:text-[14px] font-semibold text-[#737373] leading-normal whitespace-nowrap">
          MAKE A PAYMENT
        </p>
        <p className="text-[20px] sm:text-[24px] text-[#262626] leading-normal whitespace-nowrap">
          {fmtMoney(target.amount).replace(/\.00$/, '')}
        </p>
        <p className="text-[14px] sm:text-[16px] text-[#737373] leading-normal whitespace-nowrap">
          {target.description}
        </p>
      </div>

      {/* Summary block (gray, rounded) — Amount due / Platform fee / You'll be charged */}
      <div className="bg-[#fafafa] rounded-[8px] flex flex-col gap-2 sm:gap-3 items-start w-full px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-start w-full">
          <p className="flex-1 min-w-0 text-[14px] sm:text-[16px] text-[#737373] leading-normal whitespace-nowrap">
            Amount due
          </p>
          <p className="text-[14px] sm:text-[16px] text-[#737373] leading-normal whitespace-nowrap">
            {fmtMoney(target.amount)}
          </p>
        </div>
        <div className="flex items-start w-full">
          <p className="flex-1 min-w-0 text-[14px] sm:text-[16px] text-[#737373] leading-normal whitespace-nowrap">
            Platform fee (3%)
          </p>
          <p className="text-[14px] sm:text-[16px] text-[#737373] leading-normal whitespace-nowrap">
            {fmtMoney(fee)}
          </p>
        </div>
        <div
          className="flex items-start w-full"
          style={{ borderTop: '0.5px solid rgba(0,0,0,0.1)', paddingTop: 8 }}
        >
          <p className="flex-1 min-w-0 text-[14px] sm:text-[16px] text-[#262626] leading-normal whitespace-nowrap">
            You&rsquo;ll be charged
          </p>
          <p className="text-[16px] sm:text-[20px] font-semibold text-[#398ae7] leading-normal whitespace-nowrap">
            {fmtMoney(total)}
          </p>
        </div>
      </div>

      {/* Payment method tiles */}
      <div className="flex flex-col gap-1 sm:gap-2 items-start w-full">
        <FieldLabel mobile>PAYMENT METHOD</FieldLabel>
        <div className="flex gap-1 sm:gap-2 items-start w-full">
          <MethodTile
            mobile
            icon={<CardMethodIcon size={24} />}
            title="Credit / Debit Card"
            subtitle="Instant · 3% Platform fee"
            selected={state.method === 'card'}
            onSelect={() => setField('method', 'card')}
          />
          <MethodTile
            mobile
            icon={<BankMethodIcon size={24} />}
            title="Bank Transfer"
            subtitle="ACH · 1-3 Business days · No fee"
            selected={state.method === 'bank'}
            onSelect={() => setField('method', 'bank')}
          />
        </div>
      </div>

      {state.method === 'card' ? (
        <>
          {/* NAME ON CARD */}
          <div className="flex flex-col gap-1 items-start w-full">
            <FieldLabel mobile>NAME ON CARD</FieldLabel>
            <TextInput
              mobile
              placeholder="Cardholder Name"
              value={state.cardholderName}
              onChange={(v) => setField('cardholderName', v)}
              error={errFor(state.cardholderName)}
            />
          </div>

          {/* CARD NUMBER */}
          <div className="flex flex-col gap-1 items-start w-full">
            <FieldLabel mobile>CARD NUMBER</FieldLabel>
            <TextInput
              mobile
              placeholder="1234 5678 9012 3456"
              leadingIcon={<CardInputIcon size={18} />}
              value={state.cardNumber}
              onChange={(v) => setField('cardNumber', v)}
              error={errFor(state.cardNumber)}
            />
          </div>

          {/* EXPIRATION DATE + CVV / CVC — two equal columns */}
          <div className="flex gap-4 sm:gap-6 xl:gap-6 2xl:gap-8 items-start w-full">
            <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
              <FieldLabel mobile>EXPIRATION DATE</FieldLabel>
              <TextInput
                mobile
                placeholder="MM / YY"
                value={state.expiration}
                onChange={(v) => setField('expiration', v)}
                error={errFor(state.expiration)}
              />
            </div>
            <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
              <FieldLabel mobile>CVV / CVC</FieldLabel>
              <TextInput
                mobile
                placeholder="***"
                value={state.cvv}
                onChange={(v) => setField('cvv', v)}
                error={errFor(state.cvv)}
              />
            </div>
          </div>

          {/* ZIP / POSTAL CODE — own row, full width */}
          <div className="flex flex-col gap-1 items-start w-full">
            <FieldLabel mobile>ZIP / POSTAL CODE</FieldLabel>
            <TextInput
              mobile
              placeholder="12345"
              value={state.zip}
              onChange={(v) => setField('zip', v)}
              error={errFor(state.zip)}
            />
          </div>
        </>
      ) : (
        <BankFormFields mobile state={state} setField={setField} submitAttempted={submitAttempted} />
      )}

      {/* Authorization copy */}
      <p className="text-[12px] sm:text-[14px] text-[#737373] leading-normal w-full">
        By clicking &lsquo;Confirm and Pay,&rsquo; you authorize ArcSite to initiate a
        one-time debit from your provided account for{' '}
        <span className="font-semibold">{fmtMoney(total)}</span>, and acknowledge
        your agreement to our <span className="underline">terms of service.</span>
      </p>
    </div>
  );
}

// Sticky footer for the mobile sheet — Confirm/Cancel buttons + Secured-by
// row stay pinned to the sheet's bottom edge regardless of scroll position.
function MobileSheetFooter({
  total,
  onClose,
  onConfirm,
  isValid,
}: {
  total: number;
  onClose: () => void;
  onConfirm: () => void;
  isValid: boolean;
}) {
  return (
    <div
      className="bg-white flex flex-col gap-3 sm:gap-4 items-start w-full shrink-0 px-3 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6"
      style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}
    >
      <div className="flex flex-col gap-1 sm:gap-2 items-start w-full">
        <button
          type="button"
          onClick={onConfirm}
          aria-disabled={!isValid}
          className={`bg-[#d41a32] border-0 flex items-center justify-center h-10 rounded-[2px] w-full ${
            isValid ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          style={{ paddingLeft: 16, paddingRight: 16, opacity: isValid ? 1 : 0.5 }}
        >
          <span
            className="text-[14px] sm:text-[16px] font-semibold text-white text-center whitespace-nowrap"
            style={{ lineHeight: '18px' }}
          >
            Confirm and Pay {fmtMoney(total)}
          </span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-white border border-solid border-[#262626] flex items-center justify-center h-10 rounded-[2px] cursor-pointer w-full"
          style={{ borderWidth: 0.5, paddingLeft: 16, paddingRight: 16 }}
        >
          <span
            className="text-[14px] sm:text-[16px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
            style={{ lineHeight: '18px' }}
          >
            Cancel
          </span>
        </button>
      </div>
      <div className="flex gap-2 sm:gap-3 items-center justify-center w-full">
        <ShieldLockIcon width={12} height={13} />
        <p className="text-[10px] sm:text-[12px] text-[#737373] leading-normal whitespace-nowrap">
          Secured by ArcSite Payment
        </p>
      </div>
    </div>
  );
}

// ─── Main dialog ─────────────────────────────────────────────────────────────
export default function MakePaymentDialog({
  target,
  onClose,
  onConfirm,
}: {
  /** Non-null = open. Null = closed. */
  target: PaymentTarget | null;
  onClose: () => void;
  /** Called when the user clicks "Confirm and Pay". Prototype: just closes. */
  onConfirm?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  // Keep last non-null target so the dialog can keep rendering during exit.
  const [last, setLast] = useState<PaymentTarget | null>(null);

  // Scroll viewport for the mobile bottom-sheet — observed by ScrollHintArrows.
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Form state lives at the dialog root so the mobile sheet and desktop modal
  // share a single source of truth. Switching viewports across the lg
  // breakpoint preserves whatever the user has typed.
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const setField = useCallback<SetField>((key, value) => {
    setFormState((s) => ({ ...s, [key]: value }));
  }, []);

  // Tracks whether the user has tried to confirm with missing fields. Once
  // true, empty required fields render with a red outline. Reset whenever
  // the dialog closes so a re-open starts clean.
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Required keys per method — keep in lockstep with what the form renders.
  const requiredKeys: ReadonlyArray<keyof FormState> =
    formState.method === 'card'
      ? ['cardholderName', 'cardNumber', 'cvv', 'expiration', 'zip']
      : [
          'accountHolderName',
          'routingNumber',
          'accountType',
          'accountNumber',
          'repeatAccountNumber',
        ];
  const isValid = requiredKeys.every((k) => String(formState[k]).trim() !== '');

  useEffect(() => {
    if (target) {
      setLast(target);
      setMounted(true);
      // Fresh open — clear any prior submit-attempt highlight.
      setSubmitAttempted(false);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setOpen(true));
        (r1 as unknown as { _r2: number })._r2 = r2;
      });
      return () => cancelAnimationFrame(r1);
    }
    if (!mounted) return;
    setOpen(false);
    const t = window.setTimeout(() => setMounted(false), ANIM_MS);
    return () => window.clearTimeout(t);
  }, [target, mounted]);

  // Body scroll lock while open
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Esc to close
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  if (!mounted || !last) return null;

  const fee = Math.round(last.amount * 0.03 * 100) / 100;
  const total = Math.round((last.amount + fee) * 100) / 100;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  // Wired to the Confirm and Pay button. When the form is valid we go through
  // the normal close-and-confirm flow; when it's not, we flip the
  // submit-attempted flag so empty fields surface their red outline.
  const attemptSubmit = () => {
    if (isValid) {
      handleConfirm();
    } else {
      setSubmitAttempted(true);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/60"
        style={{
          opacity: open ? 1 : 0,
          backdropFilter: open ? 'blur(4px)' : 'blur(0px)',
          WebkitBackdropFilter: open ? 'blur(4px)' : 'blur(0px)',
          transition: open
            ? `opacity ${ANIM_MS}ms ${EASE_OUT}, backdrop-filter ${ANIM_MS}ms ${EASE_OUT}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_OUT}`
            : `opacity ${ANIM_MS}ms ${EASE_IN}, backdrop-filter ${ANIM_MS}ms ${EASE_IN}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_IN}`,
        }}
      />

      {/* ── Mobile (XS/S/M) — bottom sheet ─────────────────────────────────── */}
      <div
        className="lg:hidden fixed left-0 right-0 bottom-0 z-[81] bg-white flex flex-col overflow-hidden"
        style={{
          fontFamily: 'Segoe UI, sans-serif',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          maxHeight: '92vh',
          boxShadow: '0px -4px 24px rgba(0,0,0,0.18)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: open
            ? `transform ${ANIM_MS}ms ${EASE_OUT}`
            : `transform ${ANIM_MS}ms ${EASE_IN}`,
        }}
      >
        {/* Drag-handle pill — matches the Invoice/Payment Detail sheet for a
            consistent bottom-sheet affordance. */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="rounded-full bg-[#d9d9d9]" style={{ width: 36, height: 4 }} />
        </div>

        {/* Scrollable content area — header, summary, method tiles, form, auth.
            Scrollbar is fully hidden (even while scrolling) per UX request.
            Wrapped in a `relative flex flex-col` container so the bouncing
            scroll-hint arrows can anchor to the scroll viewport's edges
            without affecting the sheet's natural height. */}
        <div className="relative flex flex-col flex-1 min-h-0">
          <div
            ref={mobileScrollRef}
            className="flex-1 min-h-0 overflow-y-auto make-payment-sheet-scroll"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <MobileSheetScrollContent
              target={last}
              fee={fee}
              total={total}
              state={formState}
              setField={setField}
              submitAttempted={submitAttempted}
            />
          </div>
          <ScrollHintArrows targetRef={mobileScrollRef} />
        </div>
        <style>{`
          .make-payment-sheet-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {/* Sticky footer — Confirm/Cancel + Secured-by, pinned to sheet bottom */}
        <MobileSheetFooter
          total={total}
          onClose={onClose}
          onConfirm={attemptSubmit}
          isValid={isValid}
        />
      </div>

      {/* ── Desktop (L+) — centered modal, two-column layout ─────────────────
          Modal width tracks 10 columns of the page's 12-column grid (12px
          gutters; page side padding 24px = 48px total at lg+). 10-col width
          formula: (5/6) × (100vw − 48px) − 2px. Capped at 1000px once the
          viewport gets wide enough that the formula exceeds the cap.
          Internal split: form column = 6 of 10 cols, summary = 4 of 10. */}
      <div
        className="hidden lg:flex fixed inset-0 z-[81] items-center justify-center pointer-events-none"
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        <div
          className="bg-white flex pointer-events-auto relative overflow-hidden"
          style={{
            width: 'min(1000px, calc((100vw - 48px) * 5 / 6 - 2px))',
            borderRadius: 12,
            boxShadow: '0px 8px 32px rgba(0,0,0,0.24), 0px 2px 8px rgba(0,0,0,0.12)',
            transform: open ? 'scale(1)' : 'scale(0.96)',
            opacity: open ? 1 : 0,
            transition: open
              ? `transform ${ANIM_MS}ms ${EASE_OUT}, opacity ${ANIM_MS}ms ${EASE_OUT}`
              : `transform ${ANIM_MS}ms ${EASE_IN}, opacity ${ANIM_MS}ms ${EASE_IN}`,
          }}
        >
          <DesktopFormColumn
            target={last}
            state={formState}
            setField={setField}
            submitAttempted={submitAttempted}
          />
          <DesktopSummaryColumn
            target={last}
            fee={fee}
            total={total}
            onClose={onClose}
            onConfirm={attemptSubmit}
            isValid={isValid}
          />
        </div>
      </div>
    </>
  );
}
