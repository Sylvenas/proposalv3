'use client';

// ── SalesContactCard ──────────────────────────────────────────────────────────
// Shared "Contact Sales" sheet/modal — opens from any Contact Sales CTA across
// the prototype (Summary, Project Hub, Invoice/Payment detail). Renders the
// assigned sales rep's identity (avatar/name/title/company) plus tappable
// email & phone rows. Mobile presents as a bottom sheet; desktop centers as
// a modal card. Both share a full-width "Done" footer button.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from './useBodyScrollLock';
import { PhoneIcon, EmailIcon } from './SvgIcons';

// Mock sales contact details — single source of truth, imported by every
// caller via this file's named exports.
export const SALES_NAME    = 'Marcus Chen';
export const SALES_TITLE   = 'Senior Sales Representative';
export const SALES_COMPANY = 'Madison Fence Company';
export const SALES_EMAIL   = 'marcus@madisonfence.com';
export const SALES_PHONE   = '+15552345678';
export const SALES_PHONE_DISPLAY = '(555) 234-5678';

const ANIM_MS  = 240;
const EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN  = 'cubic-bezier(0.4, 0, 1, 1)';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

// Inner card markup — avatar, identity block, email/phone rows, and a
// configurable footer CTA. Exported so callers that want to render the
// sales card inside their own surface (e.g. swap-in-place inside the
// invoice/payment detail dialog) can reuse the exact same layout.
export function SalesContactCardContent({
  cta,
  secondaryCta,
}: {
  cta: { label: string; onClick: () => void; icon?: React.ReactNode };
  /** Optional second button stacked under the primary CTA — used by the
   *  invoice/payment dialog swap so the user can dismiss the whole dialog
   *  in one tap, without first having to bounce back to the payment detail. */
  secondaryCta?: { label: string; onClick: () => void; icon?: React.ReactNode };
}) {
  const avatar = (
    <div
      className="flex items-center justify-center shrink-0 select-none"
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f4d8db 0%, #e9b9c0 100%)',
        color: '#8b1226',
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: '0.02em',
      }}
    >
      {initialsOf(SALES_NAME)}
    </div>
  );

  const Row = ({
    icon,
    label,
    value,
    href,
    isLast,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string;
    isLast?: boolean;
  }) => (
    <a
      href={href}
      onClick={() => cta.onClick()}
      className="flex items-center gap-3 px-5 py-4 cursor-pointer no-underline transition-colors hover:bg-[#fafafa]"
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)',
        color: '#262626',
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#f5f5f5',
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[12px] text-[#737373] leading-normal">{label}</span>
        <span className="text-[14px] text-[#262626] leading-normal truncate">{value}</span>
      </div>
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRight: '1.5px solid #b3b3b3',
          borderTop: '1.5px solid #b3b3b3',
          transform: 'rotate(45deg)',
          flexShrink: 0,
        }}
      />
    </a>
  );

  return (
    <>
      <div className="flex flex-col items-center px-6 pt-6 pb-5">
        {avatar}
        <p
          className="text-[18px] font-semibold text-[#262626] mt-3 text-center"
          style={{ lineHeight: 1.3 }}
        >
          {SALES_NAME}
        </p>
        <p
          className="text-[13px] text-[#737373] mt-[2px] text-center"
          style={{ lineHeight: 1.4 }}
        >
          {SALES_TITLE}
        </p>
        <p
          className="text-[13px] text-[#737373] text-center"
          style={{ lineHeight: 1.4 }}
        >
          {SALES_COMPANY}
        </p>
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Row
          icon={<EmailIcon size={16} />}
          label="Email"
          value={SALES_EMAIL}
          href={`mailto:${SALES_EMAIL}`}
        />
        <Row
          icon={<PhoneIcon size={16} />}
          label="Phone"
          value={SALES_PHONE_DISPLAY}
          href={`tel:${SALES_PHONE}`}
          isLast
        />
      </div>

      <div
        className="flex flex-col gap-3 px-5 pt-4 pb-5"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <button
          type="button"
          onClick={cta.onClick}
          className="bg-white border border-solid border-[#262626] flex items-center justify-center gap-[6px] h-10 px-4 rounded-[4px] w-full cursor-pointer"
        >
          {cta.icon}
          <span
            className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
            style={{ lineHeight: '18px' }}
          >
            {cta.label}
          </span>
        </button>
        {secondaryCta && (
          <button
            type="button"
            onClick={secondaryCta.onClick}
            className="bg-white border border-solid border-[#262626] flex items-center justify-center gap-[6px] h-10 px-4 rounded-[4px] w-full cursor-pointer"
          >
            {secondaryCta.icon}
            <span
              className="text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap"
              style={{ lineHeight: '18px' }}
            >
              {secondaryCta.label}
            </span>
          </button>
        )}
      </div>
    </>
  );
}

export function ContactSalesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setAnimateIn(true));
    } else if (mounted) {
      setAnimateIn(false);
      const t = setTimeout(() => setMounted(false), ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  useBodyScrollLock(mounted);

  if (!mounted) return null;

  const card = <SalesContactCardContent cta={{ label: 'Done', onClick: onClose }} />;

  // Portal to <body> so the dialog escapes any ancestor stacking context.
  // ProjectHubPageResponsive nests this card inside a `position: sticky`
  // sidebar — and per CSS spec, position:sticky always creates a stacking
  // context (even with z-index:auto). Rendering inline would trap the
  // backdrop *under* the sticky tab bar (z-40), leaving the tabs sharp on
  // top of the dim. SSR-safe: skip the portal until we have `document`.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contact sales"
      className="fixed inset-0 z-[120]"
      style={{ fontFamily: 'Segoe UI, sans-serif' }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        style={{
          opacity: animateIn ? 1 : 0,
          backdropFilter: animateIn ? 'blur(3px)' : 'blur(0px)',
          WebkitBackdropFilter: animateIn ? 'blur(3px)' : 'blur(0px)',
          transition: animateIn
            ? `opacity ${ANIM_MS}ms ${EASE_OUT}, backdrop-filter ${ANIM_MS}ms ${EASE_OUT}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_OUT}`
            : `opacity ${ANIM_MS}ms ${EASE_IN}, backdrop-filter ${ANIM_MS}ms ${EASE_IN}, -webkit-backdrop-filter ${ANIM_MS}ms ${EASE_IN}`,
        }}
      />

      {/* Mobile (< lg) — bottom sheet */}
      <div
        className="lg:hidden absolute left-0 right-0 bottom-0 bg-white flex flex-col overflow-hidden"
        style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: '0px -4px 24px rgba(0,0,0,0.18)',
          transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
          transition: animateIn
            ? `transform ${ANIM_MS}ms ${EASE_OUT}`
            : `transform ${ANIM_MS}ms ${EASE_IN}`,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="rounded-full bg-[#d9d9d9]" style={{ width: 36, height: 4 }} />
        </div>
        {card}
      </div>

      {/* Desktop (lg+) — centered modal card */}
      <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
        <div
          className="bg-white pointer-events-auto"
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: 12,
            boxShadow: '0px 20px 48px rgba(0,0,0,0.20)',
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
            transition: animateIn
              ? `opacity ${ANIM_MS}ms ${EASE_OUT}, transform ${ANIM_MS}ms ${EASE_OUT}`
              : `opacity ${ANIM_MS}ms ${EASE_IN}, transform ${ANIM_MS}ms ${EASE_IN}`,
            overflow: 'hidden',
          }}
        >
          {card}
        </div>
      </div>
    </div>,
    document.body
  );
}
