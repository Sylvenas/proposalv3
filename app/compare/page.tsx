'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { odaOptions, THUMB_BASE_SCOPE } from '@/data/odaMockData'

// ─── Viewport-scale helper ─────────────────────────────────────────────────────
const sv = (px: number) => `calc(${px} / 1440 * clamp(1440px, 100vw, 3840px))`

// ─── Icons ────────────────────────────────────────────────────────────────────
function HomeIcon() {
  return (
    <svg style={{ width: sv(18), height: sv(16) }} viewBox="0 0 18 16" fill="none">
      <path d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z" stroke="#262626" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg style={{ width: sv(17), height: sv(17) }} viewBox="0 0 17 17" fill="none">
      <circle cx="8.5" cy="5.5" r="3" stroke="#737373" strokeWidth="1.2" />
      <path d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5" stroke="#737373" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
function InfoCircle() {
  return (
    <svg style={{ width: sv(16), height: sv(16) }} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="7.5" stroke="#737373" strokeWidth="1" />
      <path d="M8 7.5v3.5" stroke="#737373" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5.8" r="0.7" fill="#737373" />
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg style={{ width: sv(16), height: sv(16) }} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <path d="M5.5 3L10.5 8L5.5 13" stroke="#262626" strokeWidth="1" />
    </svg>
  )
}
function ArrowLeftRightIcon() {
  return (
    <svg style={{ width: sv(14), height: sv(16) }} viewBox="0 0 14 16" fill="none">
      <path d="M10 2L13 5L10 8" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 5H3" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 8L1 11L4 14" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 11H11" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function ArrowUpIcon() {
  return (
    <svg style={{ width: sv(12), height: sv(14) }} viewBox="0 0 12 14" fill="none">
      <path d="M6 13V1M1 6L6 1L11 6" stroke="rgba(0,0,0,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function ODALogo() {
  return (
    <div className="flex items-center" style={{ gap: sv(6) }}>
      <div className="rounded-full bg-[#262626]" style={{ width: sv(20), height: sv(20) }} />
      <span className="font-semibold text-[#262626]" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14), letterSpacing: sv(2) }}>ODA LIVING</span>
    </div>
  )
}

// ─── Comparison Line Item ──────────────────────────────────────────────────────
function CompareLineItem({ thumb, name, qty, unit }: { thumb: string; name: string; qty: string; unit: string }) {
  return (
    <div className="bg-white flex items-start w-full" style={{ gap: sv(12), paddingTop: sv(12), paddingBottom: sv(12), borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
      <div className="flex-shrink-0" style={{ width: sv(48), height: sv(48), padding: sv(2), borderRadius: sv(4) }}>
        <div className="relative overflow-hidden" style={{ width: sv(44), height: sv(44), borderRadius: sv(2) }}>
          <Image src={thumb} alt="" fill className="object-cover" sizes="44px" />
        </div>
      </div>
      <div className="flex flex-1 items-center min-w-0" style={{ gap: sv(12), paddingRight: sv(4) }}>
        <p className="flex-1 text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14) }}>
          {name}
        </p>
        <div className="flex items-center justify-end flex-shrink-0" style={{ width: sv(116) }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: sv(24), height: sv(24) }}>
            <InfoCircle />
          </div>
          <div className="flex items-center flex-shrink-0" style={{ gap: sv(8), width: sv(97), fontFamily: "'Segoe UI', sans-serif", fontWeight: 300 }}>
            <p className="flex-1 text-[#262626] text-right" style={{ fontSize: sv(14) }}>{qty}</p>
            <p className="text-[#262626] flex-shrink-0" style={{ fontSize: sv(14), width: sv(32) }}>{unit}</p>
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
    <div className="bg-[#fbfbfb] flex flex-1 flex-col" style={{ gap: sv(24), paddingBottom: sv(32), minWidth: 0 }}>
      <div className="relative w-full" style={{ aspectRatio: '800/471' }}>
        <Image src={option.images[0]} alt="" fill className="object-cover" sizes="640px" />
      </div>
      <div className="flex flex-col" style={{ paddingLeft: sv(28), paddingRight: sv(28), gap: sv(28) }}>
        <div className="flex flex-col" style={{ gap: sv(4) }}>
          <p className="text-[#262626] font-semibold w-full" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(16) }}>
            {option.title.replace('—', '-')}
          </p>
          <div className="flex flex-col text-[#262626]" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14) }}>
            <p>{option.subtitle}</p>
            <p style={{ letterSpacing: sv(-0.14) }}>{option.materials[0]}</p>
          </div>
        </div>
        <div className="flex items-center w-full" style={{ gap: sv(8) }}>
          <button
            ref={btnRef}
            className="flex flex-1 items-center justify-center bg-[#262626] text-white hover:opacity-90 transition-opacity font-semibold"
            style={{ height: sv(40), padding: `${sv(6)} ${sv(16)}`, fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14), borderRadius: sv(4) }}
            onClick={() => window.close()}
          >
            Select &amp; Configure
          </button>
          {showBothButtons && (
            <button
              className="flex flex-1 items-center justify-center bg-white border border-[#262626] hover:bg-[#f5f5f5] transition-colors"
              style={{ height: sv(40), paddingLeft: sv(12), paddingRight: sv(8), paddingTop: sv(6), paddingBottom: sv(6), gap: sv(4), color: 'rgba(0,0,0,0.85)', fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14), borderRadius: sv(4) }}
              onClick={() => window.close()}
            >
              Change Option
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: sv(24), height: sv(24) }}>
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
    <div className="flex flex-col items-center w-full" style={{ gap: sv(48) }}>
      <p className="text-[#262626] font-semibold text-center w-full" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(28) }}>
        {title}
      </p>
      <div className="flex items-start w-full" style={{ gap: sv(48) }}>
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
    <div className="flex flex-col w-full" style={{ paddingTop: sv(16), paddingBottom: sv(16), borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
      <p className="text-[#737373]" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14), letterSpacing: sv(-0.14) }}>{label}</p>
      <p className="text-[#262626] font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(24) }}>{value}</p>
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
          style={{ borderBottom: '0.5px solid rgba(0,0,0,0.2)', boxShadow: '0px 4px 3px 0px rgba(123,123,123,0.1)', height: sv(48) }}
        >
          <div className="mx-auto flex items-center" style={{ width: sv(1440), paddingLeft: sv(80), paddingRight: sv(80), height: sv(48), gap: sv(48) }}>
            <div className="flex flex-1 items-center" style={{ gap: sv(4), paddingLeft: sv(8), paddingRight: sv(8) }}>
              <p className="text-[#262626] font-semibold whitespace-nowrap" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14) }}>
                {optA.title.replace('—', '-')}
              </p>
              <ChevronRightIcon />
            </div>
            <div className="flex flex-1 items-center" style={{ gap: sv(4), paddingLeft: sv(8), paddingRight: sv(8) }}>
              <p className="text-[#262626] font-semibold whitespace-nowrap" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(14) }}>
                {optB.title.replace('—', '-')}
              </p>
              <ChevronRightIcon />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex items-center justify-between" style={{ height: sv(72), paddingLeft: sv(217), paddingRight: sv(217) }}>
        <button className="flex items-center justify-center" style={{ width: sv(24), height: sv(24) }}><HomeIcon /></button>
        <ODALogo />
        <button className="flex items-center justify-center" style={{ width: sv(24), height: sv(24) }}><UserIcon /></button>
      </nav>

      {/* Main content */}
      <div className="mx-auto flex flex-col" style={{ width: sv(1440), paddingLeft: sv(80), paddingRight: sv(80), paddingBottom: sv(96), paddingTop: sv(32), gap: sv(96) }}>

        {/* Top option cards */}
        <div className="flex items-center w-full" style={{ gap: sv(48) }}>
          <OptionCard optionIdx={a} showBothButtons={true} btnRef={btnTopA} />
          <OptionCard optionIdx={b} showBothButtons={true} btnRef={btnTopB} />
        </div>

        {/* Schedule and Pricing */}
        <div className="flex flex-col items-center w-full" style={{ gap: sv(48) }}>
          <p className="text-[#262626] font-semibold text-center w-full" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(28) }}>
            Schedule and Pricing
          </p>
          <div className="flex items-start w-full" style={{ gap: sv(48) }}>
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
        <div className="flex flex-col items-center w-full" style={{ gap: sv(48) }}>
          <p className="text-[#262626] text-center w-full" style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: sv(36) }}>
            Decision made?
          </p>
          <button
            className="flex items-center justify-center bg-white border border-[#262626] hover:bg-[#f5f5f5] transition-colors"
            style={{ height: sv(40), width: sv(276), paddingLeft: sv(12), paddingRight: sv(12), paddingTop: sv(6), paddingBottom: sv(6), gap: sv(4), color: 'rgba(0,0,0,0.85)', fontSize: sv(14), fontFamily: "'Segoe UI', sans-serif", borderRadius: sv(4) }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: sv(20) }}>
              <ArrowUpIcon />
            </div>
            Back to Top
          </button>

          {/* Bottom option cards — single Select & Configure */}
          <div className="flex items-center w-full" style={{ gap: sv(48) }}>
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
