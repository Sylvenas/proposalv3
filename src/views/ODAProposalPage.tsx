'use client'

import { useState } from 'react'
import { odaOptions, odaProjectInfo, type ODAOption, type ODAItem } from '@/data/odaMockData'

function getItemPrice(item: ODAItem): number {
  if (!item.isAddon) {
    return item.swatchPrices?.[item.selectedSwatch ?? 0] ?? item.price
  } else {
    return item.addonSwatchPrices?.[item.selectedAddonSwatch ?? 0] ?? item.price
  }
}

type Screen = 'email' | 'landing' | 'options' | 'detail'

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
        <div className="w-full h-[300px] overflow-hidden">
          <img src={emailImage} alt="Project Preview" className="w-full h-full object-cover" />
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
            onClick={onContinue}
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
    <div className="h-screen w-full relative overflow-hidden"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Background Image */}
      <img src={heroImage} alt="Architecture" className="absolute inset-0 w-full h-full object-cover" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />

      {/* Top-left Logo */}
      <div className="absolute top-7 left-8">
        <ODALogo color="white" size="sm" />
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 px-10 pb-10 flex items-end justify-between">
        {/* Left: Title */}
        <div>
          <h1 className="text-white leading-[1.0] font-light" style={{ fontSize: '54px', letterSpacing: '-1px' }}>
            HOME RENOVATION<br />PROPOSAL
          </h1>
        </div>

        {/* Right: Tagline + CTA */}
        <div className="text-right flex flex-col items-end gap-3">
          <p className="text-white/75 text-[13px] max-w-[260px] leading-relaxed text-right">
            Where curation meets legacy, define your singular dimensions.
          </p>
          <button
            onClick={onContinue}
            className="h-[40px] px-7 bg-[#262626] text-white text-[11px] tracking-[2px] uppercase hover:bg-black transition-colors"
          >
            Explore Options
          </button>
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
              className="flex-shrink-0 overflow-hidden cursor-pointer"
              style={{ width: '800px', height: '471px', opacity: 0.3 }}
              onClick={() => onSelect(prev)}
            >
              <img src={odaOptions[prev].images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Center (image-only layer, behind fg card) */}
            <div className="flex-shrink-0 overflow-hidden" style={{ width: '800px', height: '471px' }}>
              <img src={option.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Right ghost */}
            <div
              className="flex-shrink-0 overflow-hidden cursor-pointer"
              style={{ width: '800px', height: '471px', opacity: 0.3 }}
              onClick={() => onSelect(next)}
            >
              <img src={odaOptions[next].images[0]} alt="" className="w-full h-full object-cover" />
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

// ─── Screen 4: Option Detail ──────────────────────────────────────────────────
function DetailScreen({
  option,
  onBack,
}: {
  option: ODAOption
  onBack: () => void
}) {
  const [currentImage, setCurrentImage] = useState(0)
  const [sections, setSections] = useState(option.sections.map(s => ({
    ...s,
    collapsed: false,
    items: s.items.map(item => ({ ...item })),
  })))
  const [searchQuery, setSearchQuery] = useState('')

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
            >
              Summary
            </button>
            <button
              className="bg-[#262626] text-white font-semibold text-[14px] rounded-[4px] px-4 hover:bg-black transition-colors flex-shrink-0"
              style={{ height: '40px' }}
            >
              Sign &amp; Approve
            </button>
          </div>
        </div>
      </div>

      </div>{/* end sticky header */}

      {/* Main content: 842px gallery + 505px config */}
      <div className="flex items-start px-8 pt-6" style={{ gap: '32px', height: 'calc(100vh - 158px)' }}>

        {/* Left: Image Gallery (842px fixed) */}
        <div className="flex-shrink-0 flex flex-col gap-[10px]" style={{ width: '842px' }}>
          {/* Main image with expand button */}
          <div className="relative overflow-hidden rounded-[8px] bg-[#F0F0F0]" style={{ aspectRatio: '864/633' }}>
            <img src={option.images[currentImage]} alt="Room view" className="w-full h-full object-cover" />
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
                className="flex-shrink-0 rounded-[4px] overflow-hidden"
                style={{
                  width: '86px', height: '64px', padding: '2px',
                  border: i === currentImage ? '1.5px solid #262626' : '1.5px solid transparent',
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover rounded-[2px]" />
              </button>
            ))}
          </div>

          {/* Caption: image-specific */}
          <p className="text-[14px] text-[#262626]">
            {option.sections[0]?.name ?? 'Interior'} Preview {currentImage + 1}
          </p>
        </div>

        {/* Right: Configuration panel (505px fixed, independently scrollable) */}
        <div className="flex-shrink-0 flex flex-col overflow-y-auto pb-10 px-2" style={{ width: '505px', gap: '23px', height: '100%' }}>

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
                            <p className="font-semibold text-[14px] text-[#737373] text-right">{formatPrice(item.price)}</p>
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
                                className="rounded-[4px] overflow-hidden flex-shrink-0"
                                style={{
                                  width: '64px', height: '64px', padding: '2px',
                                  border: item.selectedAddonSwatch === swIdx ? '1.5px solid black' : '1.5px solid transparent',
                                }}
                              >
                                <img src={sw} alt="" className="w-full h-full object-cover rounded-[2px]" />
                              </button>
                            ))}
                          </div>
                        ) : item.previewImage ? (
                          <div className="mt-1 p-[2px] rounded-[4px] w-16 h-16">
                            <img src={item.previewImage} alt="" className="w-full h-full object-cover rounded-[2px]" />
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
                                className="rounded-[4px] overflow-hidden flex-shrink-0"
                                style={{
                                  width: '64px', height: '64px', padding: '2px',
                                  border: item.selectedSwatch === swIdx ? '1.5px solid black' : '1.5px solid transparent',
                                }}
                              >
                                <img src={sw} alt="" className="w-full h-full object-cover rounded-[2px]" />
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
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ODAProposalPage() {
  const [screen, setScreen] = useState<Screen>('email')
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
        />
      )}
    </>
  )
}
