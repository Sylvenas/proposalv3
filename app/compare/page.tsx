'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { odaOptions, THUMB_BASE_SCOPE } from '@/data/odaMockData'

// ─── Icons ────────────────────────────────────────────────────────────────────
function HomeIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
      <path d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z" stroke="#262626" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <circle cx="8.5" cy="5.5" r="3" stroke="#737373" strokeWidth="1.2" />
      <path d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5" stroke="#737373" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
function InfoCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="7.5" stroke="#737373" strokeWidth="1" />
      <path d="M8 7.5v3.5" stroke="#737373" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5.8" r="0.7" fill="#737373" />
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <path d="M5.5 3L10.5 8L5.5 13" stroke="#262626" strokeWidth="1" />
    </svg>
  )
}
function ArrowLeftRightIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
      <path d="M10 2L13 5L10 8" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 5H3" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 8L1 11L4 14" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 11H11" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function ArrowUpIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      <path d="M6 13V1M1 6L6 1L11 6" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function ODALogo() {
  return (
    <div className="flex items-center" style={{ gap: '6px' }}>
      <div className="rounded-full bg-[#262626]" style={{ width: '20px', height: '20px' }} />
      <span className="font-semibold text-[14px] tracking-[2px] text-[#262626]" style={{ fontFamily: "'Segoe UI', sans-serif" }}>ODA LIVING</span>
    </div>
  )
}

// ─── Comparison Line Item ──────────────────────────────────────────────────────
function CompareLineItem({ thumb, name, qty, unit }: { thumb: string; name: string; qty: string; unit: string }) {
  return (
    <div className="bg-white flex gap-[12px] items-start py-[12px] w-full" style={{ borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
      <div className="flex-shrink-0 p-[2px] rounded-[4px]" style={{ width: '48px', height: '48px' }}>
        <div className="relative rounded-[2px] overflow-hidden" style={{ width: '44px', height: '44px' }}>
          <Image src={thumb} alt="" fill className="object-cover" sizes="44px" />
        </div>
      </div>
      <div className="flex flex-1 gap-[12px] items-center min-w-0 pr-[4px]">
        <p className="flex-1 text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
          {name}
        </p>
        <div className="flex items-center justify-end flex-shrink-0" style={{ width: '116px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '24px', height: '24px' }}>
            <InfoCircle />
          </div>
          <div className="flex gap-[8px] items-center flex-shrink-0" style={{ width: '97px', fontFamily: "'Segoe UI', sans-serif", fontWeight: 300 }}>
            <p className="flex-1 text-[14px] text-[#262626] text-right">{qty}</p>
            <p className="text-[14px] text-[#262626] flex-shrink-0" style={{ width: '32px' }}>{unit}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Option Card ──────────────────────────────────────────────────────────────
function OptionCard({ optionIdx, showBothButtons, btnRef }: {
  optionIdx: number
  showBothButtons: boolean
  btnRef?: React.RefObject<HTMLButtonElement | null>
}) {
  const option = odaOptions[optionIdx]
  if (!option) return null
  return (
    <div className="bg-[#fbfbfb] flex flex-1 flex-col pb-[32px]" style={{ gap: '24px', minWidth: 0 }}>
      <div className="relative w-full" style={{ aspectRatio: '800/471' }}>
        <Image src={option.images[0]} alt="" fill className="object-cover" sizes="640px" />
      </div>
      <div className="flex flex-col px-[28px]" style={{ gap: '28px' }}>
        <div className="flex flex-col" style={{ gap: '4px' }}>
          <p className="text-[16px] text-[#262626] font-semibold w-full" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            {option.title.replace('—', '-')}
          </p>
          <div className="flex flex-col text-[14px] text-[#262626]" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <p>{option.subtitle}</p>
            <p style={{ letterSpacing: '-0.14px' }}>{option.materials[0]}</p>
          </div>
        </div>
        <div className="flex gap-[8px] items-center w-full">
          <button
            ref={btnRef}
            className="flex flex-1 items-center justify-center bg-[#262626] text-white rounded-[4px] text-[14px] font-semibold hover:opacity-90 transition-opacity"
            style={{ height: '40px', padding: '6px 16px', fontFamily: "'Segoe UI', sans-serif" }}
            onClick={() => window.close()}
          >
            Select &amp; Configure
          </button>
          {showBothButtons && (
            <button
              className="flex flex-1 gap-[4px] items-center justify-center bg-white border border-[#262626] rounded-[4px] text-[14px] hover:bg-[#f5f5f5] transition-colors"
              style={{ height: '40px', paddingLeft: '12px', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px', color: 'rgba(0,0,0,0.85)', fontFamily: "'Segoe UI', sans-serif" }}
              onClick={() => window.close()}
            >
              Change Option
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                <ArrowLeftRightIcon />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section Block ─────────────────────────────────────────────────────────────
function SectionBlock({ title, leftItems, rightItems }: {
  title: string
  leftItems: { thumb: string; name: string; qty: string; unit: string }[]
  rightItems: { thumb: string; name: string; qty: string; unit: string }[]
}) {
  return (
    <div className="flex flex-col items-center w-full" style={{ gap: '48px' }}>
      <p className="text-[28px] text-[#262626] font-semibold text-center w-full" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        {title}
      </p>
      <div className="flex gap-[48px] items-start w-full">
        <div className="flex flex-1 flex-col min-w-0">
          {leftItems.map((item, i) => <CompareLineItem key={i} {...item} />)}
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          {rightItems.map((item, i) => <CompareLineItem key={i} {...item} />)}
        </div>
      </div>
    </div>
  )
}

// ─── Pricing Row ──────────────────────────────────────────────────────────────
function PricingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col py-[16px] w-full" style={{ borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
      <p className="text-[14px] text-[#737373]" style={{ fontFamily: "'Segoe UI', sans-serif", letterSpacing: '-0.14px' }}>{label}</p>
      <p className="text-[24px] text-[#262626] font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>{value}</p>
    </div>
  )
}

// ─── Compare page inner ───────────────────────────────────────────────────────
function CompareInner() {
  const params = useSearchParams()
  const a = parseInt(params.get('a') ?? '0', 10)
  const b = parseInt(params.get('b') ?? '1', 10)
  const optA = odaOptions[a] ?? odaOptions[0]
  const optB = odaOptions[b] ?? odaOptions[1]

  // Refs for the 4 "Select & Configure" buttons
  const btnTopA = useRef<HTMLButtonElement>(null)
  const btnTopB = useRef<HTMLButtonElement>(null)
  const btnBotA = useRef<HTMLButtonElement>(null)
  const btnBotB = useRef<HTMLButtonElement>(null)

  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const buttons = [btnTopA, btnTopB, btnBotA, btnBotB]
    const visibleSet = new Set<Element>()

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleSet.add(entry.target)
        else visibleSet.delete(entry.target)
      }
      setShowStickyBar(visibleSet.size === 0)
    }, { threshold: 0 })

    buttons.forEach(ref => { if (ref.current) observer.observe(ref.current) })
    return () => observer.disconnect()
  }, [])

  // Pricing
  const pricingA = [
    { label: 'Base Scope Cost', value: `$${optA.priceFrom.toLocaleString()}` },
    { label: 'Maximum Project Cost', value: `$${Math.round(optA.priceFrom * 1.367).toLocaleString()}` },
    { label: 'Estimate Completion Time', value: `${optA.deliveryDays} Days` },
  ]
  const pricingB = [
    { label: 'Base Scope Cost', value: `$${optB.priceFrom.toLocaleString()}` },
    { label: 'Maximum Project Cost', value: `$${Math.round(optB.priceFrom * 1.677).toLocaleString()}` },
    { label: 'Estimate Completion Time', value: `${optB.deliveryDays} Days` },
  ]

  // Base scope
  const baseScopeA = [
    { thumb: THUMB_BASE_SCOPE, name: 'Existing Surface Preparation & Demolition', qty: '960', unit: 'sqf.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Wall & Ceiling Preparation', qty: '190', unit: 'sqf.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Flooring Base Installation', qty: '547', unit: 'sqf.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Lighting & Electrical Adjustments', qty: '128', unit: 'hrs.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Installation & Finishing Labor', qty: '1,300', unit: 'hrs.' },
  ]
  const baseScopeB = [
    { thumb: THUMB_BASE_SCOPE, name: 'Existing Surface Preparation & Demolition', qty: '720', unit: 'sqf.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Wall & Ceiling Preparation', qty: '190', unit: 'sqf.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Flooring Base Installation', qty: '547', unit: 'sqf.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Lighting & Electrical Adjustments', qty: '128', unit: 'hrs.' },
    { thumb: THUMB_BASE_SCOPE, name: 'Installation & Finishing Labor', qty: '1,300', unit: 'hrs.' },
  ]

  // Dynamic sections
  function buildItems(option: typeof optA) {
    const result: Record<string, { thumb: string; name: string; qty: string; unit: string }[]> = {}
    for (const section of option.sections) {
      result[section.name] = section.items.map(item => ({
        thumb: item.previewImage ?? item.swatches?.[0] ?? item.addonSwatches?.[0] ?? THUMB_BASE_SCOPE,
        name: item.name,
        qty: item.price > 0 ? '1' : '—',
        unit: 'pcs.',
      }))
    }
    return result
  }
  const sectionsA = buildItems(optA)
  const sectionsB = buildItems(optB)
  const allSectionNames = Array.from(new Set([...Object.keys(sectionsA), ...Object.keys(sectionsB)]))

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Sticky option bar — shown when all 4 Select & Configure buttons are out of view ── */}
      {showStickyBar && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-white"
          style={{ borderBottom: '0.5px solid rgba(0,0,0,0.2)', boxShadow: '0px 4px 3px 0px rgba(123,123,123,0.1)', height: '48px' }}
        >
          <div className="mx-auto flex gap-[48px] items-center" style={{ width: '1440px', padding: '0 80px', height: '48px' }}>
            <div className="flex flex-1 gap-[4px] items-center px-[8px]">
              <p className="text-[14px] text-[#262626] font-semibold whitespace-nowrap" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
                {optA.title.replace('—', '-')}
              </p>
              <ChevronRightIcon />
            </div>
            <div className="flex flex-1 gap-[4px] items-center px-[8px]">
              <p className="text-[14px] text-[#262626] font-semibold whitespace-nowrap" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
                {optB.title.replace('—', '-')}
              </p>
              <ChevronRightIcon />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="h-[72px] flex items-center justify-between" style={{ padding: '0 15.1%' }}>
        <button className="size-6 flex items-center justify-center"><HomeIcon /></button>
        <ODALogo />
        <button className="size-6 flex items-center justify-center"><UserIcon /></button>
      </nav>

      {/* Main content */}
      <div className="mx-auto flex flex-col" style={{ width: '1440px', padding: '0 80px 96px', gap: '96px', paddingTop: '32px' }}>

        {/* Top option cards */}
        <div className="flex gap-[48px] items-center w-full">
          <OptionCard optionIdx={a} showBothButtons={true} btnRef={btnTopA} />
          <OptionCard optionIdx={b} showBothButtons={true} btnRef={btnTopB} />
        </div>

        {/* Schedule and Pricing */}
        <div className="flex flex-col items-center w-full" style={{ gap: '48px' }}>
          <p className="text-[28px] text-[#262626] font-semibold text-center w-full" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            Schedule and Pricing
          </p>
          <div className="flex gap-[48px] items-start w-full">
            <div className="flex flex-1 flex-col min-w-0">{pricingA.map((r, i) => <PricingRow key={i} {...r} />)}</div>
            <div className="flex flex-1 flex-col min-w-0">{pricingB.map((r, i) => <PricingRow key={i} {...r} />)}</div>
          </div>
        </div>

        {/* Base Scope */}
        <SectionBlock title="Base Scope" leftItems={baseScopeA} rightItems={baseScopeB} />

        {/* Dynamic sections */}
        {allSectionNames.map(name => (
          <SectionBlock key={name} title={name} leftItems={sectionsA[name] ?? []} rightItems={sectionsB[name] ?? []} />
        ))}

        {/* Decision made? */}
        <div className="flex flex-col items-center w-full" style={{ gap: '48px' }}>
          <p className="text-[36px] text-[#262626] text-center w-full" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            Decision made?
          </p>
          <button
            className="flex gap-[4px] items-center justify-center bg-white border border-[#262626] rounded-[4px] hover:bg-[#f5f5f5] transition-colors"
            style={{ height: '40px', width: '276px', padding: '6px 12px', color: 'rgba(0,0,0,0.85)', fontSize: '14px', fontFamily: "'Segoe UI', sans-serif" }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '20px' }}>
              <ArrowUpIcon />
            </div>
            Back to Top
          </button>

          {/* Bottom option cards — single Select & Configure */}
          <div className="flex gap-[48px] items-center w-full">
            <OptionCard optionIdx={a} showBothButtons={false} btnRef={btnBotA} />
            <OptionCard optionIdx={b} showBothButtons={false} btnRef={btnBotB} />
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CompareInner />
    </Suspense>
  )
}
