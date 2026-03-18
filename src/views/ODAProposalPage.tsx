'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { odaOptions, odaProjectInfo, THUMB_BASE_SCOPE, type ODAOption, type ODAItem } from '@/data/odaMockData'

function getItemPrice(item: ODAItem): number {
  if (!item.isAddon) {
    return item.swatchPrices?.[item.selectedSwatch ?? 0] ?? item.price
  } else {
    return item.addonSwatchPrices?.[item.selectedAddonSwatch ?? 0] ?? item.price
  }
}

type Screen = 'email' | 'landing' | 'options' | 'detail' | 'approved'

function formatPrice(n: number) {
  return '$' + n.toLocaleString()
}

// ─── ODA Geometric Logo ───────────────────────────────────────────────────────
function ODALogo({ color = '#262626', size = 'md' }: { color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const scales = { sm: 0.7, md: 1, lg: 1.4 }
  const s = scales[size]
  return (
    <div className="flex items-center gap-2">
      <svg width={Math.round(52 * s)} height={Math.round(18 * s)} viewBox="0 0 52 18" fill="none">
        {/* O — solid circle */}
        <circle cx="9" cy="9" r="8.5" fill={color} />
        {/* D — outline circle */}
        <circle cx="26" cy="9" r="7.5" stroke={color} strokeWidth="2" fill="none" />
        {/* A — solid triangle */}
        <polygon points="43,0.5 52,17.5 34,17.5" fill={color} />
      </svg>
      <div>
        <div style={{ color, fontSize: Math.round(9 * s), letterSpacing: Math.round(2.5 * s) / 10 + 'em', fontWeight: 400, lineHeight: 1.2, textTransform: 'uppercase' }}>
          Design &amp;
        </div>
        <div style={{ color, fontSize: Math.round(9 * s), letterSpacing: Math.round(2.5 * s) / 10 + 'em', fontWeight: 400, lineHeight: 1.2, textTransform: 'uppercase' }}>
          Architecture
        </div>
      </div>
    </div>
  )
}

// ─── Screen 1: Email ─────────────────────────────────────────────────────────
function EmailScreen({ onContinue }: { onContinue: () => void }) {
  const { clientName, projectAddress, projectName, preparedBy, company, companyAddress, phone, email, emailImage } = odaProjectInfo
  const firstName = clientName.split(' ')[0]
  const option = odaOptions[0]

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex items-start justify-center py-12 px-4"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="w-full max-w-[680px] bg-white" style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div className="px-10 pt-8 pb-6">
          <ODALogo size="md" />
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-[300px] overflow-hidden">
          <Image src={emailImage} alt="Project Preview" fill className="object-cover" sizes="680px" />
        </div>

        {/* Body */}
        <div className="px-10 py-8">
          <p className="text-[14px] text-[#262626] mb-4">Hi {firstName},</p>
          <p className="text-[14px] text-[#4A4A4A] mb-3 leading-[1.7]">
            Your project proposal from ODA Architecture is ready.
          </p>
          <p className="text-[14px] text-[#4A4A4A] mb-6 leading-[1.7]">
            You can now explore your project online — compare package options, customize selected upgrades and add-ons, and review pricing before signing your agreement.
          </p>

          {/* What you can do */}
          <p className="text-[14px] font-semibold text-[#262626] mb-3">What you can do</p>
          <ul className="mb-7 space-y-2">
            {[
              'Compare Good / Better / Best options',
              'Select upgrades and optional add-ons',
              'Review your project scope, pricing and financing offers in real time',
              'Sign your contract online when you\'re ready',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-[#4A4A4A]">
                <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-[#4A4A4A] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* Project Info */}
          <div className="mb-7 space-y-1.5">
            <p className="text-[14px] text-[#262626]">
              <span className="font-semibold">Project: </span>{projectName}
            </p>
            <p className="text-[14px] text-[#262626]">
              <span className="font-semibold">Prepared by: </span>{preparedBy}
            </p>
            <p className="text-[14px] text-[#262626]">
              <span className="font-semibold">Proposal total starting from: </span>{formatPrice(option.priceFrom)}.00
            </p>
          </div>

          {/* CTA — left-aligned, not full width */}
          <button
            onClick={() => window.open('/proposal-v2?screen=landing', '_blank')}
            className="h-[40px] px-6 bg-[#262626] text-white text-[13px] hover:bg-black transition-colors mb-7"
          >
            Review My Proposal
          </button>

          {/* Sign-off */}
          <p className="text-[14px] text-[#4A4A4A] mb-6 leading-[1.7]">
            If you have any questions, you can contact your sales rep {preparedBy.split(',')[0]} directly before making your final selection.
          </p>
          <p className="text-[14px] text-[#262626] mb-1">Thank you.</p>
          <p className="text-[14px] text-[#262626] mb-0">{company}</p>
        </div>

        {/* Footer */}
        <div className="px-10 pt-5 pb-6 border-t border-black/10">
          <p className="text-[11px] text-[#737373] mb-0.5">{company}</p>
          <p className="text-[11px] text-[#737373] mb-0.5">{companyAddress}</p>
          <p className="text-[11px] text-[#737373] mb-0.5">{phone} | {email}</p>
          <p className="text-[11px] text-[#737373] mb-3">License #CSLB 1098421</p>
          <a href="#" className="text-[11px] text-[#4A4A4A] underline">Legal &amp; Privacy Statement</a>
          <p className="text-[10px] text-[#9E9E9E] mt-3 leading-[1.6]">
            This is an operational email. Please do not reply to this email. Replies to this email will not be responded to or read.
          </p>
          <p className="text-[10px] text-[#9E9E9E] mt-2 leading-[1.6]">
            You are receiving this email because ODA Architecture has invited you to review your project online. Your digital proposal may include configurable package options, upgrades, add-ons, and estimated pricing. Final contract terms are defined by the signed agreement and may vary based on site conditions, material availability, permitting requirements, and approved project changes.
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── Screen 2: Landing ────────────────────────────────────────────────────────
function LandingScreen({ onContinue }: { onContinue: () => void }) {
  const { heroImage } = odaProjectInfo

  return (
    <div className="min-h-screen bg-white"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-[1440px] mx-auto">

        {/* Logo — above image on white background */}
        <div style={{ padding: '39px 0 24px 95px' }}>
          <ODALogo size="sm" />
        </div>

        {/* Hero image card with side margins */}
        <div className="relative overflow-hidden" style={{ margin: '0 95px', height: '845px' }}>
          <Image src={heroImage} alt="Architecture" fill className="object-cover" sizes="(max-width:1440px) calc(100vw - 190px), 1250px" priority />

          {/* Gradient — bottom portion only */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: '216px', background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.5))' }}
          />

          {/* Title — bottom left of image */}
          <div className="absolute" style={{ left: '44px', bottom: '38px' }}>
            <p className="text-white m-0 leading-tight" style={{ fontSize: '48px', fontWeight: 300, letterSpacing: '-2.4px' }}>
              HOME RENOVATION
            </p>
            <p className="text-white m-0 leading-tight" style={{ fontSize: '48px', fontWeight: 300, letterSpacing: '-2.4px' }}>
              PROPOSAL
            </p>
          </div>

          {/* Tagline + CTA — bottom right, same row */}
          <div
            className="absolute flex items-center gap-6"
            style={{ right: '44px', bottom: '32px' }}
          >
            <p className="text-white text-[14px] m-0 whitespace-nowrap">
              Where curation meets legacy, define your singular dimensions.
            </p>
            <button
              onClick={onContinue}
              className="flex-shrink-0 flex items-center justify-center text-white text-[14px] font-semibold tracking-[1px] uppercase transition-opacity hover:opacity-80"
              style={{
                height: '40px',
                padding: '0 16px',
                background: 'rgba(116,116,116,0.7)',
                border: '1px solid white',
                whiteSpace: 'nowrap',
              }}
            >
              EXPLORE OPTIONS
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Screen 3: Option Selector ────────────────────────────────────────────────
function OptionsScreen({
  selectedOption,
  onSelect,
  onContinue,
}: {
  selectedOption: number
  onSelect: (i: number) => void
  onContinue: () => void
}) {
  const option = odaOptions[selectedOption]
  const prev = (selectedOption - 1 + odaOptions.length) % odaOptions.length
  const next = (selectedOption + 1) % odaOptions.length

  // Figma: 1440px page, center card 800px at x=321, arrows at x=222 and x=1171
  // Arrow center distance from page center: ~474px
  // Info card is 800px centered → arrows are ~74px outside card edges

  return (
    <div className="min-h-screen bg-white"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Nav — home | logo | user, symmetric ~15% padding (matches Figma's left-[217px] on 1440px) */}
      <nav className="h-[72px] flex items-center justify-between" style={{ padding: '0 15.1%' }}>
        <button className="size-6 flex items-center justify-center text-[#262626]">
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
            <path d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </button>
        <ODALogo size="sm" />
        <button className="size-6 flex items-center justify-center text-[#737373]">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="8.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* ── Main section: carousel + info card + arrows (all relative-positioned together) ── */}
      <div className="relative">

        {/* Background carousel — 3 × 800px cards, total 2440px, centered → side ghosts clip at viewport edges */}
        <div className="overflow-hidden" style={{ height: '471px' }}>
          <div
            className="absolute flex"
            style={{ gap: '20px', width: '2440px', left: '50%', transform: 'translateX(-50%)' }}
          >
            {/* Left ghost */}
            <div
              className="relative flex-shrink-0 overflow-hidden cursor-pointer"
              style={{ width: '800px', height: '471px', opacity: 0.3 }}
              onClick={() => onSelect(prev)}
            >
              <Image src={odaOptions[prev].images[0]} alt="" fill className="object-cover" sizes="800px" />
            </div>
            {/* Center (image-only layer, behind fg card) */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '800px', height: '471px' }}>
              <Image src={option.images[0]} alt="" fill className="object-cover" sizes="800px" priority />
            </div>
            {/* Right ghost */}
            <div
              className="relative flex-shrink-0 overflow-hidden cursor-pointer"
              style={{ width: '800px', height: '471px', opacity: 0.3 }}
              onClick={() => onSelect(next)}
            >
              <Image src={odaOptions[next].images[0]} alt="" fill className="object-cover" sizes="800px" />
            </div>
          </div>
        </div>

        {/* Foreground info card — sits directly below the carousel image, same 800px width, bg-[#fbfbfb] */}
        <div
          className="mx-auto bg-[#fbfbfb] flex flex-col"
          style={{ width: '800px' }}
        >
          <div className="flex flex-col px-7 pt-10 pb-16" style={{ gap: '28px' }}>
            {/* Title + subtitle */}
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <p
                className="text-[20px] text-[#262626] tracking-[1.6px]"
                style={{ fontFamily: "'Century Gothic', 'Trebuchet MS', sans-serif" }}
              >
                {option.title.replace('—', '-')}
              </p>
              <p className="text-[16px] text-[#262626]">
                Modern Eclecticism, Balancing Comfort and Refinement.
              </p>
            </div>
            {/* Materials (left) + Button (right) */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col text-[16px] text-[#262626]" style={{ gap: '8px', width: '230px' }}>
                <p>{option.materials[0]}</p>
                <p>{option.deliveryDays} Days Estimate Delivery Time</p>
                <p>Starting from {formatPrice(option.priceFrom)} USD</p>
              </div>
              <button
                onClick={onContinue}
                className="flex items-center border border-[#262626] text-black font-semibold text-[14px] hover:bg-[#262626] hover:text-white transition-colors"
                style={{ height: '40px', gap: '8px', padding: '6px 16px' }}
              >
                COUNTINUE CUSTOMIZE
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5H10M6.5 1L10 4.5L6.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Left Arrow — at x≈222 on 1440px → calc(50% - 474px + 24px) = calc(50% - 450px) from left edge */}
        <button
          onClick={() => onSelect(prev)}
          className="absolute flex items-center justify-center size-[48px] hover:opacity-50 transition-opacity"
          style={{ left: 'calc(50% - 450px)', top: '577px', transform: 'translateY(-50%)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Right Arrow — at x≈1171 on 1440px → calc(50% + 426px + 24px) = calc(50% + 450px) - 48px */}
        <button
          onClick={() => onSelect(next)}
          className="absolute flex items-center justify-center size-[48px] hover:opacity-50 transition-opacity"
          style={{ left: 'calc(50% + 402px)', top: '577px', transform: 'translateY(-50%)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L13 10L7 16" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

      </div>

      {/* Pagination dots — centered, 3 × 40px wide × 4px tall, gap-2 */}
      <div className="flex items-center justify-center mt-6 pb-10" style={{ gap: '8px' }}>
        {odaOptions.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="transition-all duration-300 rounded-[4px]"
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: i === selectedOption ? '#262626' : '#f1f0f0',
            }}
          />
        ))}
      </div>

    </div>
  )
}

// ─── Info circle icon ─────────────────────────────────────────────────────────
function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 opacity-40">
      <circle cx="7" cy="7" r="6.5" stroke="#262626" strokeWidth="1" />
      <path d="M7 6.5v3.5" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="4.5" r="0.6" fill="#262626" />
    </svg>
  )
}

type SummaryLineItem = {
  name: string
  qty: string
  unit: string
  price: number
  thumbnailSrc?: string
  showChange?: boolean
}

function SummaryGroup({ name, items }: { name: string; items: SummaryLineItem[] }) {
  return (
    <div className="flex flex-col w-full">
      {/* Group header: h-[48px], semibold 16px + count badge */}
      <div className="flex items-center gap-1 h-[48px]">
        <p className="font-semibold text-[16px] text-[#262626]">{name}</p>
        <div className="w-5 h-5 rounded-[4px] bg-[#f0f0f0] flex items-center justify-center ml-1">
          <span className="text-[10px] text-[#262626]" style={{ fontWeight: 300 }}>{items.length}</span>
        </div>
      </div>
      {/* Line items */}
      <div className="flex flex-col w-full">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start py-3 w-full" style={{ borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
            {/* Thumbnail: 48x48, rounded-[4px], p-[2px] */}
            <div className="flex-shrink-0 w-12 h-12 rounded-[4px] p-[2px]">
              {item.thumbnailSrc ? (
                <div className="relative w-full h-full rounded-[2px] overflow-hidden">
                  <Image src={item.thumbnailSrc} alt="" fill className="object-cover" sizes="44px" />
                </div>
              ) : (
                <div className="w-full h-full rounded-[2px] bg-[#f0f0f0]" />
              )}
            </div>
            {/* Content */}
            <div className="flex flex-1 items-center min-w-0">
              {/* Name: flex-1 truncate, 14px regular */}
              <p className="flex-1 text-[14px] text-[#262626] truncate min-w-0">{item.name}</p>
              {/* Qty + unit: w-[130px], gap-[16px], semilight 14px */}
              <div className="flex items-center gap-4 justify-end flex-shrink-0" style={{ width: '130px', fontWeight: 300 }}>
                <p className="flex-1 text-[14px] text-[#262626] text-right">{item.qty}</p>
                <p className="text-[14px] text-[#262626] flex-shrink-0 w-8">{item.unit}</p>
              </div>
              {/* Spacer: w-[64px] */}
              <div className="flex-shrink-0 bg-white" style={{ width: '64px', height: '19px' }} />
              {/* Price: w-[124px], gap-[2px], semilight 14px */}
              <div className="flex items-center gap-0.5 flex-shrink-0" style={{ width: '124px', fontWeight: 300 }}>
                <span className="text-[14px] text-[#262626] flex-shrink-0">$</span>
                <span className="flex-1 text-[14px] text-[#262626]">{item.price.toLocaleString()}</span>
              </div>
              {/* Actions: w-[112px] */}
              <div className="flex items-center justify-between flex-shrink-0" style={{ width: '112px' }}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <InfoIcon />
                </div>
                {item.showChange !== false ? (
                  <div className="flex items-center gap-2 h-6 cursor-pointer hover:opacity-60">
                    <span className="font-semibold text-[14px] text-[#262626]" style={{ letterSpacing: '-0.56px' }}>Change</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                      <path d="M6 4l4 4-4 4" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : (
                  <div style={{ width: '78px' }} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sign & Approve Modal ─────────────────────────────────────────────────────
function SignModal({ onClose, onApprove }: { onClose: () => void; onApprove: () => void }) {
  const [zoom, setZoom] = useState(1)
  const { clientName } = odaProjectInfo

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ padding: '32px 64px', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] flex gap-10 w-full relative"
        style={{ height: '963px', maxHeight: 'calc(100vh - 64px)', padding: '40px 48px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors text-[#262626]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* ── Left: scrollable contract document ── */}
        <div className="flex-1 min-w-0 flex flex-col relative min-h-0">
          {/* Document scroll area */}
          <div className="flex-1 overflow-auto border border-[#d9d9d9] min-h-0">
            <div style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
              <Image
                src="/assets/contract-page.png"
                alt="Contract"
                width={2380}
                height={3368}
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Zoom controls — overlaid at bottom-left */}
          <div className="absolute bottom-0 left-0 flex gap-3" style={{ padding: '24px 32px' }}>
            {/* Zoom in */}
            <button
              onClick={() => setZoom(z => Math.min(z + 0.25, 2))}
              className="w-12 h-12 flex items-center justify-center rounded-[4px]"
              style={{ backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.8)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                <path d="M7.5 10.5h6M10.5 7.5v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {/* Zoom out */}
            <button
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
              className="w-12 h-12 flex items-center justify-center rounded-[4px]"
              style={{ backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.8)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                <path d="M7.5 10.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {/* Fit / reset */}
            <button
              onClick={() => setZoom(1)}
              className="w-12 h-12 flex items-center justify-center rounded-[4px]"
              style={{ backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.8)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Right: signing panel ── */}
        <div className="flex-shrink-0 flex flex-col gap-6" style={{ width: '274px' }}>
          <p className="text-[16px] text-[#262626]" style={{ letterSpacing: '-0.64px', lineHeight: 'normal' }}>
            Sign Contract as {clientName}
          </p>
          <p className="text-[12px] text-[#262626] leading-[1.5]" style={{ fontWeight: 300 }}>
            Please review your final project selections and contract details before signing. By signing below, you confirm your acceptance of the scope, pricing, and terms outlined in this agreement.
          </p>
          <button
            className="w-full h-10 bg-black text-white font-semibold text-[14px] rounded-[2px] flex items-center justify-center hover:opacity-80 transition-opacity"
            onClick={() => { onClose(); onApprove() }}
          >
            Next Field (3)
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 4: Option Detail ──────────────────────────────────────────────────
function DetailScreen({
  option,
  onBack,
  onApprove,
}: {
  option: ODAOption
  onBack: () => void
  onApprove: () => void
}) {
  const [currentImage, setCurrentImage] = useState(0)
  const [sections, setSections] = useState(option.sections.map(s => ({
    ...s,
    collapsed: false,
    items: s.items.map(item => ({ ...item })),
  })))
  const [searchQuery, setSearchQuery] = useState('')
  const [showSignModal, setShowSignModal] = useState(false)
  const [drawingZoom, setDrawingZoom] = useState(1)
  const summaryRef = useRef<HTMLDivElement>(null)

  const toggleSection = (sectionIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx ? { ...s, collapsed: !s.collapsed } : s))
  }

  const toggleAddon = (sectionIdx: number, itemId: string) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx ? {
      ...s,
      items: s.items.map(item => item.id === itemId ? { ...item, selected: !item.selected } : item),
    } : s))
  }

  const selectSwatch = (sectionIdx: number, itemId: string, swatchIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx ? {
      ...s,
      items: s.items.map(item => item.id === itemId ? { ...item, selectedSwatch: swatchIdx } : item),
    } : s))
  }

  const selectAddonSwatch = (sectionIdx: number, itemId: string, swatchIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx ? {
      ...s,
      items: s.items.map(item => item.id === itemId ? { ...item, selectedAddonSwatch: swatchIdx } : item),
    } : s))
  }

  const allItems = sections.flatMap(s => s.items)
  const materialDelta = allItems
    .filter(i => !i.isAddon && i.swatchPrices)
    .reduce((sum, i) => {
      const current = i.swatchPrices![i.selectedSwatch ?? 0]
      const base    = i.swatchPrices![0]
      return sum + (current - base)
    }, 0)
  const addonTotal = allItems
    .filter(i => i.isAddon && i.selected)
    .reduce((sum, i) => sum + getItemPrice(i), 0)
  const total = option.priceFrom + materialDelta + addonTotal
  const monthlyPayment = Math.round(total * (option.monthlyPayment / option.priceFrom))

  const filteredSections = sections.map(s => ({
    ...s,
    items: s.items.filter(item =>
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spec.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(s => s.items.length > 0)

  return (
    <div className="min-h-screen bg-white"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Sticky header wrapper */}
      <div className="sticky top-0 z-50 bg-white">
      <div className="max-w-[1500px] mx-auto w-full">

      {/* Nav Row 1: home | logo | user (15.1% = 217px on 1440px, matching Figma left-[217px]) */}
      <nav className="flex items-center justify-between" style={{ padding: '31px 15.1%' }}>
        <button className="size-6 flex items-center justify-center text-[#262626] hover:opacity-60">
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
            <path d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </button>
        <ODALogo size="sm" />
        <button className="size-6 flex items-center justify-center text-[#262626] hover:opacity-60">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="8.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Nav Row 2: actions | pricing | buttons */}
      <div
        className="flex items-center justify-between px-8 border-b"
        style={{ paddingTop: '16px', paddingBottom: '16px', borderBottomWidth: '0.5px', borderColor: 'rgba(0,0,0,0.2)' }}
      >
        {/* Left: Change Option + Contact Sales */}
        <div className="flex items-center gap-8">
          <button
            onClick={onBack}
            className="flex items-center gap-1 h-8 px-1 rounded-[4px] text-[14px] text-[#262626] hover:opacity-60 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 7H1M6 2L1 7L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Change Option
          </button>
          <button className="flex items-center gap-1.5 h-8 px-1 rounded-[4px] text-[14px] text-[#262626] hover:opacity-60 transition-opacity">
            {/* Phone icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            </svg>
            Contact Sales
          </button>
        </div>

        {/* Right: pricing block + action buttons */}
        <div className="flex items-center gap-4">
          {/* Pricing: monthly | separator | total */}
          <div className="flex items-stretch h-10">
            {/* Monthly payment */}
            <div className="flex flex-col justify-between pl-2 pr-3">
              <div className="flex items-center gap-1.5">
                {/* Calculator icon */}
                <svg width="11" height="14" viewBox="0 0 11 14" fill="none" className="flex-shrink-0">
                  <rect x="0.5" y="0.5" width="10" height="13" rx="1" stroke="#262626" strokeWidth="1" />
                  <path d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2" stroke="#262626" strokeWidth="0.9" strokeLinecap="round" />
                </svg>
                <span className="text-[18px] text-[#262626] leading-none">{formatPrice(monthlyPayment)} /mo</span>
              </div>
              <span className="text-[10px] text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap" style={{ maxWidth: '200px' }}>
                Monthly payment via financing service provider
              </span>
            </div>
            {/* Vertical separator */}
            <div className="flex-shrink-0 w-px bg-[rgba(0,0,0,0.2)] self-stretch" />
            {/* Total */}
            <div className="flex flex-col justify-between pl-3 pr-2" style={{ width: '150px' }}>
              <span className="text-[18px] text-[#262626] leading-none">{formatPrice(total)}.00</span>
              <span className="text-[10px] text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap">Tax &amp; fees included</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="border border-[#262626] bg-white text-[#262626] text-[14px] rounded-[4px] hover:bg-[#262626] hover:text-white transition-colors flex-shrink-0"
              style={{ width: '108px', height: '40px' }}
              onClick={() => {
                if (summaryRef.current) {
                  const top = summaryRef.current.getBoundingClientRect().top + window.scrollY - 158
                  window.scrollTo({ top, behavior: 'smooth' })
                }
              }}
            >
              Summary
            </button>
            <button
              className="bg-[#262626] text-white font-semibold text-[14px] rounded-[4px] px-4 hover:bg-black transition-colors flex-shrink-0"
              style={{ height: '40px' }}
              onClick={() => setShowSignModal(true)}
            >
              Sign &amp; Approve
            </button>
          </div>
        </div>
      </div>

      </div>{/* end max-width inner */}
      </div>{/* end sticky header */}

      {/* Main content: 842px gallery + 505px config */}
      <div className="max-w-[1500px] mx-auto w-full flex items-start px-8 pt-6" style={{ gap: '32px' }}>

        {/* Left: Image Gallery (fills remaining width) */}
        <div className="flex-1 min-w-0 flex flex-col gap-[10px] sticky" style={{ top: '182px' }}>
          {/* Main image with expand button */}
          <div className="relative overflow-hidden rounded-[8px] bg-[#F0F0F0]" style={{ aspectRatio: '864/633' }}>
            <Image src={option.images[currentImage]} alt="Room view" fill className="object-cover" sizes="(max-width:1500px) calc(100vw - 569px), 900px" priority />
            {/* Expand icon: bottom-right, 32×32 */}
            <button className="absolute bottom-3 right-3 w-8 h-8 bg-white/80 rounded-[4px] flex items-center justify-center hover:bg-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 1H13V4.5M4.5 13H1V9.5M13 9.5V13H9.5M1 4.5V1H4.5" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Thumbnails: 86×64, 1.5px border on selected */}
          <div className="flex items-center gap-2">
            {option.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className="relative flex-shrink-0 rounded-[4px] overflow-hidden"
                style={{
                  width: '86px', height: '64px', padding: '2px',
                  border: i === currentImage ? '1.5px solid #262626' : '1.5px solid transparent',
                }}
              >
                <Image src={img} alt="" fill className="object-cover rounded-[2px]" sizes="86px" />
              </button>
            ))}
          </div>

          {/* Caption: image-specific */}
          <p className="text-[14px] text-[#262626]">
            {option.sections[0]?.name ?? 'Interior'} Preview {currentImage + 1}
          </p>
        </div>

        {/* Right: Configuration panel (505px fixed, scrolls with page) */}
        <div className="flex-shrink-0 flex flex-col pb-10 px-2" style={{ width: '505px', gap: '23px' }}>

          {/* Option title + project label */}
          <div className="flex flex-col text-[#262626]">
            <p className="font-semibold text-[20px] leading-snug">{option.title}</p>
            <p className="text-[14px]">{odaProjectInfo.projectLabel}</p>
          </div>

          {/* Search bar: 0.5px border, rounded-[2px] */}
          <div
            className="flex items-center gap-1 px-3 py-2 rounded-[2px]"
            style={{ border: '0.5px solid black' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-[#737373]">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search Configuration / Upgrade / Add-ons"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 text-[12px] text-[#737373] placeholder-[#737373] outline-none bg-transparent"
            />
          </div>

          {/* Section cards */}
          <div className="flex flex-col gap-6">
            {filteredSections.map((section, sectionIdx) => (
              <div
                key={section.name}
                className="bg-white rounded-[12px] pt-4 px-3 pb-6 flex flex-col gap-6"
                style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.2)' }}
              >
                {/* Section header: title (semibold 16px) + collapse toggle */}
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[16px] text-[#262626]">{section.name}</p>
                  <button
                    onClick={() => toggleSection(sectionIdx)}
                    className="w-4 h-4 flex items-center justify-center hover:opacity-50 transition-opacity"
                  >
                    {section.collapsed ? (
                      /* Plus = collapsed */
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1v11M1 6.5h11" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      /* Minus line = expanded */
                      <div className="w-[13px] h-px bg-black" />
                    )}
                  </button>
                </div>

                {/* Items — hidden when collapsed */}
                {!section.collapsed && section.items.map((item) => (
                  <div key={item.id}>
                    {item.isAddon ? (
                      /* ── Add-on: bordered sub-card ── */
                      <div
                        className="rounded-[8px] bg-white flex flex-col cursor-pointer"
                        style={{
                          border: `1px solid ${item.selected ? '#262626' : '#BFBFBF'}`,
                          padding: '8px 8px 12px 16px',
                        }}
                        onClick={() => toggleAddon(sectionIdx, item.id)}
                      >
                        {/* Info row: 64px min height, pr-4 to clear checkbox */}
                        <div className="flex items-center pr-4 gap-3" style={{ minHeight: '64px' }}>
                          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                            <p className="font-semibold text-[14px] text-[#262626] truncate">{item.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[14px] text-[#262626] truncate">{item.spec}</p>
                              <InfoIcon />
                            </div>
                            <p className="font-semibold text-[14px] text-[#737373]">{formatPrice(getItemPrice(item))}</p>
                          </div>
                          {/* 24px checkbox, rounded-[2px], border-black when unchecked */}
                          <div
                            className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-[2px] transition-colors ${item.selected ? 'bg-[#262626]' : 'border border-black'}`}
                          >
                            {item.selected && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Below: swatches row OR single 64×64 preview */}
                        {item.addonSwatches && item.addonSwatches.length > 0 ? (
                          <div className="flex gap-2.5 mt-1" onClick={e => e.stopPropagation()}>
                            {item.addonSwatches.map((sw, swIdx) => (
                              <button
                                key={swIdx}
                                onClick={() => selectAddonSwatch(sectionIdx, item.id, swIdx)}
                                className="relative rounded-[4px] overflow-hidden flex-shrink-0"
                                style={{
                                  width: '64px', height: '64px', padding: '2px',
                                  border: item.selectedAddonSwatch === swIdx ? '1.5px solid black' : '1.5px solid transparent',
                                }}
                              >
                                <Image src={sw} alt="" fill className="object-cover rounded-[2px]" sizes="64px" />
                              </button>
                            ))}
                          </div>
                        ) : item.previewImage ? (
                          <div className="relative mt-1 p-[2px] rounded-[4px] w-16 h-16 overflow-hidden">
                            <Image src={item.previewImage!} alt="" fill className="object-cover rounded-[2px]" sizes="64px" />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      /* ── Standard item: pl-16 pr-8 within card ── */
                      <div className="flex flex-col pl-4 pr-2">
                        {/* 64px text block: name / spec+info / price */}
                        <div className="flex flex-col justify-between py-1" style={{ minHeight: '64px' }}>
                          <div className="flex items-center">
                            <p className="font-semibold text-[14px] text-[#262626]">{item.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] text-[#262626] truncate">{item.spec}</p>
                            <InfoIcon />
                          </div>
                          <p className="font-semibold text-[14px] text-[#737373]">
                            $ {getItemPrice(item).toLocaleString()}
                          </p>
                        </div>
                        {/* Photo swatches: 64×64, gap-[10px] */}
                        {item.swatches && item.swatches.length > 0 && (
                          <div className="flex items-center" style={{ gap: '10px' }}>
                            {item.swatches.map((sw, swIdx) => (
                              <button
                                key={swIdx}
                                onClick={() => selectSwatch(sectionIdx, item.id, swIdx)}
                                className="relative rounded-[4px] overflow-hidden flex-shrink-0"
                                style={{
                                  width: '64px', height: '64px', padding: '2px',
                                  border: item.selectedSwatch === swIdx ? '1.5px solid black' : '1.5px solid transparent',
                                }}
                              >
                                <Image src={sw} alt="" fill className="object-cover rounded-[2px]" sizes="64px" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom: centered Summary button, pt-[40px] container, icon on LEFT */}
          <div className="flex flex-col items-center" style={{ paddingTop: '40px' }}>
            <button
              onClick={() => {
                if (summaryRef.current) {
                  const top = summaryRef.current.getBoundingClientRect().top + window.scrollY - 158
                  window.scrollTo({ top, behavior: 'smooth' })
                }
              }}
              className="flex items-center justify-center gap-0.5 border border-[#262626] bg-white text-[#262626] rounded-[4px] hover:bg-[#262626] hover:text-white transition-colors"
              style={{ width: '136px', height: '40px', fontSize: '16px' }}
            >
              {/* Chevron-down icon on the LEFT */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
                <path d="M4 7L9 12L14 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Summary
            </button>
          </div>

        </div>
      </div>

      {/* ─── Summary Section ──────────────────────────────────────────────────── */}
      <div ref={summaryRef} style={{ borderTop: '0.5px solid rgba(0,0,0,0.15)' }}>
        <div className="max-w-[1500px] mx-auto w-full px-8 pt-12 pb-16">
          <div className="flex items-start justify-between gap-8">

            {/* ── Left column: drawings card + items card + reviews card ── */}
            <div className="flex flex-col flex-shrink-0" style={{ width: '840px', gap: '27px' }}>

              {/* Drawings */}
              <div
                className="bg-white rounded-[12px] px-[24px] pb-[24px] flex flex-col"
                style={{ paddingTop: '16px', gap: '24px', boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.2)' }}
              >
                {/* Header */}
                <div className="flex items-center pt-[16px]">
                  <p className="font-semibold text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">Drawings</p>
                </div>

                {/* Content area: 792 × 539, image viewport + zoom controls */}
                <div className="relative" style={{ width: '792px', height: '539px' }}>
                  {/* Image viewport: fixed size, clips overflow */}
                  <div className="overflow-hidden relative" style={{ width: '792px', height: '492px' }}>
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: `scale(${drawingZoom})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Image
                        src="/assets/drawing-floor-plan.png"
                        alt="Floor Plan"
                        fill
                        className="object-contain"
                        sizes="792px"
                      />
                    </div>
                  </div>

                  {/* View Controls: absolute bottom-left, px-[32px] py-[24px] */}
                  <div className="absolute bottom-0 left-0 flex gap-[12px] items-center" style={{ padding: '24px 32px' }}>
                    {/* Zoom In */}
                    <button
                      onClick={() => setDrawingZoom(z => Math.min(z + 0.25, 3))}
                      className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
                      style={{ width: '48px', height: '48px', backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.6)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
                    >
                      <span style={{ paddingLeft: '2px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                          <path d="M7.5 10.5h6M10.5 7.5v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    {/* Zoom Out */}
                    <button
                      onClick={() => setDrawingZoom(z => Math.max(z - 0.25, 0.5))}
                      className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
                      style={{ width: '48px', height: '48px', backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.6)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
                    >
                      <span style={{ paddingLeft: '2px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                          <path d="M7.5 10.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    {/* Fit / Reset */}
                    <button
                      onClick={() => setDrawingZoom(1)}
                      className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
                      style={{ width: '48px', height: '48px', backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.6)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
                    >
                      <span style={{ paddingLeft: '2px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* All Included/Selected Products */}
              <div
                className="bg-white rounded-[12px] px-6 pb-6 flex flex-col"
                style={{ paddingTop: '16px', gap: '24px', boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.2)' }}
              >
                {/* Card header */}
                <div className="pt-4">
                  <p className="font-semibold text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">
                    All Included/Selected Products
                  </p>
                </div>

                {/* Base Scope */}
                <SummaryGroup
                  name="Base Scope"
                  items={[
                    { name: 'Existing Surface Preparation & Demolition', qty: '960', unit: 'sqf.', price: 42900, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                    { name: 'Wall & Ceiling Preparation', qty: '190', unit: 'sqf.', price: 24100, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                    { name: 'Flooring Base Installation', qty: '547', unit: 'sqf.', price: 4600, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                    { name: 'Lighting & Electrical Adjustments', qty: '128', unit: 'hrs.', price: 7270, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                    { name: 'Installation & Finishing Labor', qty: '1,300', unit: 'hrs.', price: 87580, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                  ]}
                />

                {/* Dynamic sections: standard items always shown, add-ons only if selected */}
                {sections.map(section => {
                  const lineItems: SummaryLineItem[] = section.items
                    .filter(item => !item.isAddon || item.selected)
                    .map(item => ({
                      name: item.spec,
                      qty: '1',
                      unit: 'each',
                      price: getItemPrice(item),
                      thumbnailSrc: item.isAddon
                        ? (item.addonSwatches?.[item.selectedAddonSwatch ?? 0] ?? item.previewImage)
                        : item.swatches?.[item.selectedSwatch ?? 0],
                      showChange: true,
                    }))
                  if (lineItems.length === 0) return null
                  return <SummaryGroup key={section.name} name={section.name} items={lineItems} />
                })}
              </div>

              {/* Reviews card */}
              <div
                className="bg-white rounded-[12px] px-6 flex flex-col"
                style={{ paddingTop: '24px', paddingBottom: '32px', gap: '24px', boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.2)' }}
              >
                {/* Logo */}
                <div style={{ height: '48px', display: 'flex', alignItems: 'center' }}>
                  <ODALogo size="lg" />
                </div>
                {/* Company info */}
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-[16px] text-[#262626]">ODA Architecture</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {/* Star icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#262626">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                      </svg>
                      <span className="text-[14px] text-[#262626]">4.6</span>
                    </div>
                    <span className="text-[14px] text-[#262626]">(243 reviews)</span>
                    <span className="text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontWeight: 300 }}>
                      https://oda-architecture.com/
                    </span>
                  </div>
                </div>
                {/* Quotes */}
                <div className="flex flex-col gap-6" style={{ fontWeight: 300, lineHeight: 1.5 }}>
                  {[
                    { quote: '"The result feels custom in all the right ways. ODA Architecture helped us make smart choices on materials, finishes, and layout, and the whole experience felt far more seamless than we expected."', author: '— Priya and Kevin S., Irvine, CA' },
                    { quote: '"ODA Architecture made the entire renovation process feel clear and intentional. We never felt overwhelmed, and every decision felt easier because the options were presented so thoughtfully."', author: '— Emily R., Pasadena, CA' },
                    { quote: '"From design through final execution, ODA Architecture brought a level of care and clarity that gave us real confidence. The space feels elevated, functional, and much more aligned with how we actually live."', author: '— Sophia L., Glendale, CA' },
                  ].map((r, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <p className="text-[12px] text-[#262626]" style={{ letterSpacing: '-0.24px' }}>{r.quote}</p>
                      <p className="text-[11px] text-[#262626]" style={{ letterSpacing: '-0.22px' }}>{r.author}</p>
                    </div>
                  ))}
                </div>
                <button className="text-[14px] text-[#262626] underline text-left w-fit">Read more</button>
              </div>
            </div>

            {/* ── Right column: pricing summary ── */}
            <div className="flex-shrink-0 flex flex-col sticky" style={{ width: '505px', gap: '23px', top: '182px' }}>

              {/* Title */}
              <div className="flex flex-col text-[#262626]">
                <p className="font-semibold text-[20px]">SUMMARY - {option.title.split(' - ')[0]}</p>
                <p className="text-[14px]">{odaProjectInfo.projectLabel}</p>
              </div>

              {/* Contact Total + Monthly Payment */}
              <div className="flex flex-col gap-4 py-6" style={{ borderTop: '0.5px solid rgba(0,0,0,0.2)' }}>
                <div className="flex flex-col">
                  <p className="text-[14px] text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap">
                    Contact Total <sup style={{ fontSize: '7px' }}>1</sup>
                  </p>
                  <p className="text-[32px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">
                    $ {total.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-[14px] text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap">
                    Estimated Monthly Payment <sup style={{ fontSize: '7px' }}>2</sup>
                  </p>
                  <p className="text-[24px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontWeight: 300 }}>
                    $ {monthlyPayment.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2 py-6" style={{ borderTop: '0.5px solid rgba(0,0,0,0.2)' }}>
                {[
                  { label: 'Base Scope', value: option.priceFrom },
                  { label: 'Selected Upgrades & Add-ons', value: addonTotal + materialDelta },
                  { label: 'Permit & Inspection Fees', value: Math.round(option.priceFrom * 0.045) },
                  { label: 'Sales Tax', value: Math.round(total * 0.075) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col pb-0.5">
                    <p className="text-[14px] text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap">{label}</p>
                    <p className="text-[20px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">
                      $ {value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                {/* Sign & Approve */}
                <button
                  className="w-full h-[40px] bg-[#262626] text-white font-semibold text-[14px] rounded-[4px] hover:bg-black transition-colors flex items-center justify-center"
                  onClick={() => setShowSignModal(true)}
                >
                  Sign &amp; Approve
                </button>
                {/* Explore Payment & Financing */}
                <button
                  className="w-full h-[40px] border border-[#262626] bg-white text-[#262626] text-[14px] rounded-[4px] flex items-center justify-center gap-1 hover:bg-[#262626] hover:text-white transition-colors"
                >
                  <svg width="11" height="14" viewBox="0 0 11 14" fill="none" className="flex-shrink-0">
                    <rect x="0.5" y="0.5" width="10" height="13" rx="1" stroke="currentColor" strokeWidth="1" />
                    <path d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
                  </svg>
                  Explore Payment &amp; Financing
                </button>
                {/* Contact Sales + Download */}
                <div className="flex gap-3">
                  <button
                    className="flex-1 h-[40px] border border-[#262626] bg-white text-[#262626] text-[14px] rounded-[4px] flex items-center justify-center gap-1 hover:bg-[#262626] hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                      <path d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                    </svg>
                    Contact Sales
                  </button>
                  <button
                    className="flex-1 h-[40px] border border-[#262626] bg-white text-[#262626] text-[14px] rounded-[4px] flex items-center justify-center gap-1 hover:bg-[#262626] hover:text-white transition-colors"
                  >
                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" className="flex-shrink-0">
                      <path d="M8.5 1v11M3.5 7l5 5 5-5M1 17h15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download Config [PDF]
                  </button>
                </div>
              </div>

              {/* Footnotes */}
              <div className="flex flex-col gap-3 pt-6" style={{ fontWeight: 300, lineHeight: 1.5 }}>
                <p className="text-[11px] text-[#262626]" style={{ letterSpacing: '-0.22px' }}>
                  <sup style={{ fontSize: '7px' }}>1 </sup>
                  Total project pricing is subject to change based on applicable taxes, fees, payment timing, and any final project adjustments. The final amount presented at the time of payment will control.
                </p>
                <p className="text-[11px] text-[#262626]" style={{ letterSpacing: '-0.22px' }}>
                  <sup style={{ fontSize: '7px' }}>2 </sup>
                  Any monthly payment information shown is an estimate only and is not a financing offer. Final payment amounts, interest rates, and loan terms are subject to lender review and will be confirmed during the formal application process.
                </p>
                <button className="text-[11px] text-[#262626] underline text-left w-fit">Read more</button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showSignModal && <SignModal onClose={() => setShowSignModal(false)} onApprove={onApprove} />}
    </div>
  )
}

// ─── Screen 5: Approved ───────────────────────────────────────────────────────
function ApprovedScreen({ option }: { option: ODAOption }) {
  const [activeTab, setActiveTab] = useState('Project Home')
  const tabs = ['Project Home', 'Updates', 'Products', 'Drawings', 'Documents', 'Invoices & Payments', 'Previews']
  const sections = option.sections

  const updates = [
    {
      date: '9/18/2027',
      dateNote: ' <3 days ago>',
      title: 'Wall & Ceiling Preparation Completed',
      desc: 'Surface preparation for the walls and ceilings is now complete. The project is moving forward into the next phase of interior finish installation.',
      photos: ['/assets/update-ps-1.png', '/assets/update-ps-2.png', '/assets/update-ps-3.png'],
    },
    {
      date: '6/02/2027',
      dateNote: '',
      title: 'Construction In Progress',
      desc: 'On-site work has officially started. Our team is currently completing site preparation and beginning the first phase of installation.',
      photos: [],
    },
    {
      date: '5/25/2027',
      dateNote: '',
      title: 'Demolition Work Completed',
      desc: 'Demolition work has been completed and the project area has been cleared for the next phase of construction. Site preparation and layout work will begin next.',
      photos: ['/assets/update-ps-4.png'],
    },
  ]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white">
        <div className="max-w-[1500px] mx-auto w-full">

          {/* Row 1: nav */}
          <nav className="flex items-center justify-between" style={{ padding: '31px 15.1%' }}>
            <button className="size-6 flex items-center justify-center text-[#262626] hover:opacity-60">
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
            <ODALogo size="sm" />
            <button className="size-6 flex items-center justify-center text-[#262626] hover:opacity-60">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="8.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </nav>

          {/* Row 2: tab navigation */}
          <div
            className="flex items-center px-8 overflow-x-auto scrollbar-none"
            style={{ borderBottom: '0.5px solid rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-center gap-8">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-shrink-0 flex items-center justify-center text-[14px] text-[rgba(0,0,0,0.85)]"
                  style={{
                    height: '32px',
                    padding: '6px 12px',
                    borderBottom: activeTab === tab ? '2px solid #262626' : '2px solid transparent',
                    marginBottom: '-0.5px',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1500px] mx-auto w-full px-8 pt-8 pb-16 flex items-start gap-8">

        {/* Left column: 840px */}
        <div className="flex-shrink-0 flex flex-col gap-[27px]" style={{ width: '840px' }}>

          {/* Project Updates */}
          <div
            className="bg-white rounded-[12px] px-[24px] pt-[16px] pb-[24px] flex flex-col gap-[24px]"
            style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-center pt-[16px]">
              <p className="font-semibold text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">Project Updates</p>
            </div>

            {updates.map((update, i) => (
              <div key={i} className="flex flex-col pt-[12px] w-full" style={{ borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
                {/* Date line */}
                <p className="text-[12px] leading-normal mb-0">
                  <span className="font-semibold text-[#737373]">{update.date}</span>
                  {update.dateNote && <span className="text-[#262626]">{update.dateNote}</span>}
                </p>
                {/* Title + info icon */}
                <div className="flex gap-[2px] items-center w-full">
                  <p className="text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap leading-normal">{update.title}</p>
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <InfoIcon />
                  </div>
                </div>
                {/* Description */}
                <p className="text-[12px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontWeight: 300 }}>
                  {update.desc}
                </p>
                {/* Photos */}
                {update.photos.length > 0 && (
                  <div className="flex items-center gap-[4px] pt-[8px]">
                    {update.photos.map((photo, j) => (
                      <div key={j} className="flex-shrink-0 p-[2px] rounded-[4px]" style={{ width: '64px', height: '64px' }}>
                        <div className="relative w-full h-full rounded-[2px] overflow-hidden">
                          <Image src={photo} alt="" fill className="object-cover" sizes="64px" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Show More */}
            <div className="flex flex-col justify-center text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap">
              <button className="underline leading-normal">Show More</button>
            </div>
          </div>

          {/* Approved Scope */}
          <div
            className="bg-white rounded-[12px] px-[24px] pt-[16px] pb-[24px] flex flex-col gap-[24px]"
            style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-center pt-[16px]">
              <p className="font-semibold text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">Approved Scope</p>
            </div>
            <SummaryGroup
              name="Base Scope"
              items={[
                { name: 'Existing Surface Preparation & Demolition', qty: '960', unit: 'sqf.', price: 42900, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                { name: 'Wall & Ceiling Preparation', qty: '190', unit: 'sqf.', price: 24100, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                { name: 'Flooring Base Installation', qty: '547', unit: 'sqf.', price: 4600, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                { name: 'Lighting & Electrical Adjustments', qty: '128', unit: 'hrs.', price: 7270, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
                { name: 'Installation & Finishing Labor', qty: '1,300', unit: 'hrs.', price: 87580, showChange: false, thumbnailSrc: THUMB_BASE_SCOPE },
              ]}
            />
            {sections.map(section => {
              const lineItems: SummaryLineItem[] = section.items
                .filter(item => !item.isAddon || item.selected)
                .map(item => ({
                  name: item.spec,
                  qty: '1',
                  unit: 'each',
                  price: getItemPrice(item),
                  thumbnailSrc: item.isAddon
                    ? (item.addonSwatches?.[item.selectedAddonSwatch ?? 0] ?? item.previewImage)
                    : item.swatches?.[item.selectedSwatch ?? 0],
                  showChange: false,
                }))
              if (lineItems.length === 0) return null
              return <SummaryGroup key={section.name} name={section.name} items={lineItems} />
            })}
          </div>

          {/* Move-In Service */}
          <div
            className="bg-white rounded-[12px] overflow-hidden flex"
            style={{ width: '835px', boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.2)' }}
          >
            <div className="relative flex-shrink-0" style={{ width: '416px', height: '325px' }}>
              <Image src="/assets/move-in-service.png" alt="" fill className="object-cover" sizes="416px" />
            </div>
            <div className="flex-1 flex flex-col gap-[16px] items-start pl-[48px] pr-[24px] justify-center min-w-0">
              <p
                className="text-[24px] text-[#262626] leading-[1.5] tracking-[-0.72px] w-full"
                style={{ fontFamily: "'Segoe UI Variable', 'Segoe UI', sans-serif", fontWeight: 400 }}
              >
                Move-In Service
              </p>
              <p className="text-[12px] text-[#262626] leading-[1.5] tracking-[-0.24px] w-full" style={{ fontWeight: 300 }}>
                Settle into your newly finished home with additional move-in support designed to make the final transition feel effortless, organized, and ready for everyday living.
              </p>
              <button
                className="flex items-center justify-center bg-[#262626] text-white rounded-[2px] hover:opacity-80 transition-opacity"
                style={{ padding: '6px 12px', fontSize: '9px' }}
              >
                Learn More
              </button>
            </div>
          </div>

        </div>

        {/* Right column: 505px, sticky */}
        <div
          className="flex-shrink-0 flex flex-col items-center sticky"
          style={{ width: '505px', gap: '23px', top: '158px' }}
        >

          {/* Title */}
          <div className="flex flex-col w-full text-[#262626] leading-normal">
            <p className="font-semibold text-[20px] w-full">{odaProjectInfo.projectLabel}</p>
            <p className="text-[14px] w-full">Proposal Approved on 3/18/2026</p>
          </div>

          {/* Payment Progress + Next Payment */}
          <div
            className="flex flex-col gap-[16px] py-[24px] w-full"
            style={{ borderTop: '0.5px solid rgba(0,0,0,0.2)' }}
          >
            {/* Payment Progress */}
            <div className="flex flex-col gap-[4px] w-full">
              <p className="text-[14px] text-[#737373] leading-normal overflow-hidden text-ellipsis whitespace-nowrap">
                Payment Progress <sup style={{ fontSize: '7.1px' }}>1</sup>
              </p>
              <div className="flex flex-col items-start w-full">
                <p className="text-[20px] leading-normal overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-[#262626]">$100,450 / </span>
                  <span className="text-[#737373]">$273,090</span>
                </p>
                {/* Progress bar: 270px wide, 2px tall */}
                <div className="flex items-center" style={{ width: '270px', height: '18px' }}>
                  <div className="flex-shrink-0 h-[2px]" style={{ width: '102px', background: '#262626' }} />
                  <div className="flex-1 h-[2px]" style={{ background: '#d9d9d9' }} />
                </div>
              </div>
            </div>

            {/* Next Payment */}
            <div className="flex flex-col w-full overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="text-[14px] text-[#737373] leading-normal">
                Next Payment <sup style={{ fontSize: '7.1px' }}>2</sup>
              </p>
              <p className="text-[32px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap">$68,000</p>
              <p className="text-[12px] text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap">
                1/3 balance due at 50% completion{' '}
                <span style={{ fontWeight: 300 }}>&lt;5/26/2028&gt;</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-[12px] w-full">
            {/* Make A Payment */}
            <button
              className="w-full h-[40px] bg-[#262626] text-white font-semibold text-[14px] rounded-[4px] flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              Make A Payment
            </button>

            {/* Financing Service */}
            <button
              className="w-full h-[40px] border border-[#262626] bg-white text-[rgba(0,0,0,0.85)] text-[14px] rounded-[4px] flex items-center justify-center gap-[2px] hover:bg-[#262626] hover:text-white transition-colors"
            >
              <span className="flex items-center justify-center h-full px-[5px]">
                <svg width="15" height="20" viewBox="0 0 11 14" fill="none" className="flex-shrink-0">
                  <rect x="0.5" y="0.5" width="10" height="13" rx="1" stroke="currentColor" strokeWidth="1" />
                  <path d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
                </svg>
              </span>
              Financing Service
            </button>

            {/* Contact Sales + Request Change */}
            <div className="flex gap-[12px] w-full">
              <button
                className="flex-1 h-[40px] border border-[#262626] bg-white text-[rgba(0,0,0,0.85)] text-[14px] rounded-[4px] flex items-center justify-center gap-[2px] hover:bg-[#262626] hover:text-white transition-colors"
              >
                <span className="w-6 h-[22px] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                  </svg>
                </span>
                Contact Sales
              </button>
              <button
                className="flex-1 h-[40px] border border-[#262626] bg-white text-[rgba(0,0,0,0.85)] text-[14px] rounded-[4px] flex items-center justify-center gap-[2px] hover:bg-[#262626] hover:text-white transition-colors"
              >
                <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM5 8h6M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Request Change
              </button>
            </div>
          </div>

          {/* Download links */}
          <div className="flex flex-col w-full">
            <button className="flex items-center gap-[2px] h-[24px] pr-[16px] py-[6px] bg-white rounded-[4px] w-full">
              <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <svg width="17" height="18" viewBox="0 0 17 18" fill="none">
                  <path d="M8.5 1v11M3.5 7l5 5 5-5M1 17h15" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[18px]">Download Contract Document [PDF]</span>
            </button>
            <button className="flex items-center gap-[2px] h-[24px] pr-[16px] py-[6px] bg-white rounded-[4px] w-full">
              <span className="w-6 h-[18px] flex items-center justify-center flex-shrink-0 overflow-clip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#262626" strokeWidth="1.5" />
                  <path d="M2 10h20M7 15h.01M12 15h5" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[18px]">Payment Schedule &amp; Records</span>
            </button>
          </div>

          {/* Footnotes */}
          <div className="flex flex-col gap-[12px] pt-[24px] w-full">
            <p className="text-[#262626] tracking-[-0.22px] leading-[0]" style={{ fontWeight: 300 }}>
              <span className="leading-[1.5] text-[7.1px]">1 </span>
              <span className="leading-[1.5] text-[11px]">Total project pricing is subject to change based on applicable taxes, fees, payment timing, and any final project adjustments. The final amount presented at the time of payment will control.</span>
            </p>
            <p className="text-[#262626] text-[11px] tracking-[-0.22px] leading-[1.5] overflow-hidden text-ellipsis" style={{ fontWeight: 300 }}>
              <span className="text-[7.1px]">2 </span>
              Any monthly payment information shown is an estimate only and is not a financing offer. Final payment amounts, interest rates, and loan terms are subject to lender review and will be confirmed during the formal application process.
            </p>
            <div className="flex flex-col justify-center text-[11px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap">
              <button className="underline leading-normal">Read more</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ODAProposalPage({ initialScreen = 'email' }: { initialScreen?: Screen }) {
  const getInitialScreen = (): Screen => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('screen') as Screen | null
      if (param && ['email', 'landing', 'options', 'detail', 'approved'].includes(param)) return param
    }
    return initialScreen
  }
  const [screen, setScreen] = useState<Screen>(getInitialScreen)
  const [selectedOption, setSelectedOption] = useState(0)

  return (
    <>
      {screen === 'email' && <EmailScreen onContinue={() => setScreen('landing')} />}
      {screen === 'landing' && <LandingScreen onContinue={() => setScreen('options')} />}
      {screen === 'options' && (
        <OptionsScreen
          selectedOption={selectedOption}
          onSelect={setSelectedOption}
          onContinue={() => setScreen('detail')}
        />
      )}
      {screen === 'detail' && (
        <DetailScreen
          option={odaOptions[selectedOption]}
          onBack={() => setScreen('options')}
          onApprove={() => setScreen('approved')}
        />
      )}
      {screen === 'approved' && (
        <ApprovedScreen
          option={odaOptions[selectedOption]}
        />
      )}
    </>
  )
}
