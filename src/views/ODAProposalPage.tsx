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
  const { clientName, projectName, preparedBy, company, companyAddress, phone, email, emailImage } = odaProjectInfo
  const firstName = clientName.split(' ')[0]
  const option = odaOptions[0]

  // Icon helpers — matches Figma's overflow-clip 20×20 container with centered shape
  const OI = ({ src, w, h, sz = 20 }: { src: string; w: number; h: number; sz?: number }) => (
    <div className="overflow-clip relative flex-shrink-0" style={{ width: sz, height: sz }}>
      <img alt="" className="absolute block max-w-none pointer-events-none"
        style={{ width: w, height: h, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        src={src} />
    </div>
  )
  // Small chevron (12×12 container)
  const Chev = ({ src = '/assets/outlook/chevron-sm.svg' }: { src?: string }) => (
    <div className="overflow-clip relative flex-shrink-0" style={{ width: 12, height: 12 }}>
      <img alt="" className="absolute block max-w-none pointer-events-none"
        style={{ width: 8, height: 4.5, left: '50%', top: 'calc(50% + 0.75px)', transform: 'translate(-50%, -50%)' }}
        src={src} />
    </div>
  )
  const Sep = () => <div className="bg-[#e5e5e5] flex-shrink-0" style={{ width: 1, height: 32 }} />

  const inboxItems = [
    { src: '/assets/outlook/send.svg', w: 16.35, h: 16.13, label: 'Sent Items' },
    { src: '/assets/outlook/drafts.svg', w: 16, h: 16, label: 'Drafts', badge: '2' },
  ]
  const folderItems = [
    { src: '/assets/outlook/mail-inbox2.svg', w: 14, h: 14, label: 'Inbox' },
    { src: '/assets/outlook/folder-junk.svg', w: 17, h: 16, label: 'Junk Email' },
    { src: '/assets/outlook/drafts.svg', w: 16, h: 16, label: 'Drafts', badge: '2' },
    { src: '/assets/outlook/send.svg', w: 16.35, h: 16.13, label: 'Sent Items' },
    { src: '/assets/outlook/delete2.svg', w: 16, h: 16.5, label: 'Deleted Items' },
    { src: '/assets/outlook/archive2.svg', w: 16, h: 14, label: 'Archive' },
    { src: '/assets/outlook/note.svg', w: 14, h: 14, label: 'Notes' },
    { src: '/assets/outlook/folder.svg', w: 16, h: 14, label: 'Conversatio...' },
  ]

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-[#fafafa]"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Navigation Bar ── */}
      <div className="flex items-center justify-between flex-shrink-0 bg-[#316ab7]"
        style={{ padding: '8px 8px 8px 14px' }}>
        <div className="flex items-center gap-5">
          <OI src="/assets/outlook/grid.svg" w={15.5} h={15.5} />
          <p className="font-semibold text-[16px] text-white leading-[24px] whitespace-nowrap">Outlook</p>
          {/* Search bar */}
          <div className="flex items-center gap-[14px] rounded-[4px] pl-[12px] pb-[7px] pt-[5px]"
            style={{ width: 350, backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <OI src="/assets/outlook/search.svg" w={14} h={14} />
            <p className="text-[14px] text-[#1b3a5b] leading-[20px]">Search</p>
          </div>
        </div>
        {/* JS avatar */}
        <div className="flex items-center justify-center rounded-full border border-white overflow-clip flex-shrink-0 pb-px"
          style={{ width: 32, height: 32 }}>
          <p className="text-[14px] text-[#f4f4f4] leading-[14px]">JS</p>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0">

        {/* Apps Section */}
        <div className="flex flex-col gap-[17px] flex-shrink-0 pt-[7px]"
          style={{ width: 49, backgroundColor: '#f0f0f0' }}>
          {/* Mail (active) */}
          <div className="flex items-center gap-[10px] pl-[2px] pr-[15px]">
            <div className="rounded-[2px] flex-shrink-0 bg-[#316ab7]" style={{ width: 2, height: 32 }} />
            <OI src="/assets/outlook/mail-blue.svg" w={16} h={13} />
          </div>
          {/* Calendar / People / Attach */}
          <div className="flex flex-col gap-[18px] items-center w-full">
            {[
              { src: '/assets/outlook/calendar.svg', w: 14, h: 14 },
              { src: '/assets/outlook/people.svg', w: 17, h: 13.5 },
              { src: '/assets/outlook/attach.svg', w: 12.6, h: 14.3 },
            ].map((ic, i) => (
              <div key={i} className="flex items-center justify-center py-[4px] w-full">
                <OI src={ic.src} w={ic.w} h={ic.h} />
              </div>
            ))}
          </div>
          {/* Other apps */}
          <div className="flex flex-col gap-[14px] w-full">
            <div className="flex flex-col gap-[18px]">
              {[
                { src: '/assets/outlook/todo.svg', w: 20, h: 16.5 },
                { src: '/assets/outlook/word.svg', w: 20, h: 20 },
                { src: '/assets/outlook/excel.svg', w: 20, h: 20 },
                { src: '/assets/outlook/powerpoint.svg', w: 20, h: 20 },
                { src: '/assets/outlook/onedrive.svg', w: 20, h: 20 },
              ].map((ic, i) => (
                <div key={i} className="flex items-center justify-center py-[4px] w-full">
                  <OI src={ic.src} w={ic.w} h={ic.h} />
                </div>
              ))}
            </div>
            {/* App Folder */}
            <div className="flex items-center justify-center py-[4px] w-full">
              <OI src="/assets/outlook/app-folder.svg" w={18} h={18} sz={24} />
            </div>
          </div>
        </div>

        {/* Right of apps */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Top Header (Home / View / Help) */}
          <div className="flex items-start flex-shrink-0 pl-[15px]">
            {/* Home — active */}
            <div className="flex flex-col gap-[2px] items-center justify-center pt-[6px] px-[14px]">
              <p className="font-semibold text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">Home</p>
              <div className="bg-[#316ab7] w-full" style={{ height: 3 }} />
            </div>
            <div className="flex items-center justify-center px-[14px] py-[6px]">
              <p className="text-[14px] text-[#212121] leading-[20px]">View</p>
            </div>
            <div className="flex items-center justify-center px-[14px] py-[6px]">
              <p className="text-[14px] text-[#212121] leading-[20px]">Help</p>
            </div>
          </div>

          {/* Email Actions Toolbar */}
          <div className="flex gap-px items-end pl-[8px] flex-shrink-0">
            <div className="bg-white border-[0.25px] border-black/6 flex gap-[36px] items-start px-[14px] py-[4px] flex-1 rounded-[4px]"
              style={{ boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.04)' }}>
              {/* New email */}
              <div className="flex gap-[10px] items-center">
                <img src="/assets/outlook/line-horizontal.svg" alt="" className="flex-shrink-0" style={{ width: 20, height: 20 }} />
                <div className="flex gap-px items-center">
                  <div className="flex gap-[10px] items-center bg-[#316ab7] rounded-l-[4px] h-[32px] pl-[9px] pr-[12px]">
                    <OI src="/assets/outlook/mail-white.svg" w={16} h={13} />
                    <p className="text-[14px] text-white leading-[20px] whitespace-nowrap">New email</p>
                  </div>
                  <div className="flex items-center justify-center bg-[#316ab7] rounded-r-[4px] px-[6px] py-[8px]">
                    <div className="overflow-clip relative flex-shrink-0" style={{ width: 16, height: 16 }}>
                      <img alt="" className="absolute block max-w-none pointer-events-none"
                        style={{ width: 10, height: 5.5, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                        src="/assets/outlook/chevron-white.svg" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Action groups */}
              <div className="flex gap-[13px] items-start">
                <div className="flex gap-[6px] items-center">
                  <div className="flex gap-[21px] items-start">
                    <div className="flex gap-[7px] items-center">
                      <div className="flex gap-[4px] items-start">
                        <OI src="/assets/outlook/delete.svg" w={16} h={16.5} />
                        <p className="text-[14px] text-[#212121] leading-[20px]">Delete</p>
                      </div>
                      <Chev />
                    </div>
                    <div className="flex gap-[4px] items-center">
                      <OI src="/assets/outlook/archive.svg" w={16} h={14} />
                      <p className="text-[14px] text-black leading-[20px]">Archive</p>
                    </div>
                    <div className="flex gap-[4px] items-start">
                      <OI src="/assets/outlook/report.svg" w={14} h={16} />
                      <p className="text-[14px] text-[#212121] leading-[20px]">Report</p>
                    </div>
                    <div className="flex gap-[4px] items-center">
                      <OI src="/assets/outlook/sweep.svg" w={16.5} h={16.5} />
                      <p className="text-[14px] text-[#212121] leading-[20px]">Sweep</p>
                    </div>
                    <div className="flex gap-[7px] items-center">
                      <div className="flex gap-[4px] items-center">
                        <OI src="/assets/outlook/move-to.svg" w={17} h={16} />
                        <p className="text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">Move to</p>
                      </div>
                      <Chev />
                    </div>
                  </div>
                  <Sep />
                </div>
                <div className="flex gap-[14px] items-start">
                  <div className="flex gap-[6px] items-center">
                    <div className="flex gap-[7px] items-center">
                      <div className="flex gap-[4px] items-start">
                        <OI src="/assets/outlook/reply-all.svg" w={15.5} h={12.24} />
                        <p className="text-[14px] text-[#212121] leading-[20px]">Reply</p>
                      </div>
                      <Chev />
                    </div>
                    <Sep />
                  </div>
                  <div className="flex gap-[21px] items-center">
                    <div className="flex gap-[4px] items-start">
                      <OI src="/assets/outlook/mail-read.svg" w={16} h={14} />
                      <p className="text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">Read / Unread</p>
                    </div>
                    <div className="flex gap-[19px] items-center">
                      <div className="flex gap-[13px] items-start">
                        <div className="flex gap-[4px] items-center">
                          <OI src="/assets/outlook/tag.svg" w={15.6} h={15.6} />
                          <Chev />
                        </div>
                        <div className="flex gap-[5px] items-center">
                          <div className="relative flex-shrink-0" style={{ width: 20, height: 20 }}>
                            <img alt="" className="absolute block max-w-none pointer-events-none"
                              style={{ width: 12.5, height: 15, left: 'calc(50% - 0.25px)', top: 'calc(50% + 0.5px)', transform: 'translate(-50%, -50%)' }}
                              src="/assets/outlook/flag.svg" />
                          </div>
                          <Chev />
                        </div>
                        <OI src="/assets/outlook/pin.svg" w={14.97} h={14.97} />
                      </div>
                      <div className="flex gap-[7px] items-center">
                        <div className="flex gap-[4px] items-center">
                          <OI src="/assets/outlook/clock.svg" w={16} h={16} />
                          <Chev />
                        </div>
                        <div className="flex gap-[14px] items-center">
                          <Sep />
                          <div className="opacity-30">
                            <OI src="/assets/outlook/undo.svg" w={13} h={16} />
                          </div>
                          <Sep />
                          <OI src="/assets/outlook/more.svg" w={12.5} h={2.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body: Inbox sidebar + Email panel */}
          <div className="flex flex-1 min-h-0">

            {/* Inbox Organiser */}
            <div className="flex flex-col gap-[8px] bg-[#fafafa] flex-shrink-0 overflow-y-auto"
              style={{ padding: '18px 19px 18px 8px' }}>
              {/* Favourites */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div className="overflow-clip relative flex-shrink-0" style={{ width: 16, height: 16 }}>
                    <img alt="" className="absolute block max-w-none pointer-events-none"
                      style={{ width: 10, height: 5.5, left: '50%', top: 'calc(50% + 0.25px)', transform: 'translate(-50%, -50%)' }}
                      src="/assets/outlook/chevron-inbox.svg" />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px] whitespace-nowrap">Favourites</p>
                </div>
                <div className="flex flex-col">
                  {/* Inbox (active, highlighted) */}
                  <div className="flex items-start bg-[#d3e3f8] rounded-[4px] pl-[38px] pr-[18px] py-[10px]">
                    <div className="flex flex-1 gap-[8px] items-start">
                      <div className="flex gap-[8px] items-start" style={{ width: 115 }}>
                        <OI src="/assets/outlook/mail-inbox.svg" w={14} h={14} />
                        <p className="font-semibold text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">Inbox</p>
                      </div>
                      <p className="text-[14px] text-[#265388] leading-[20px]" style={{ width: 8 }}>1</p>
                    </div>
                  </div>
                  {inboxItems.map(({ src, w, h, label, badge }) => (
                    <div key={label} className="flex items-center rounded-[4px] pl-[38px] pr-[18px] py-[10px]">
                      <div className="flex flex-1 gap-[8px] items-start">
                        <div className="flex gap-[8px] items-center" style={{ width: 115 }}>
                          <OI src={src} w={w} h={h} />
                          <p className="text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">{label}</p>
                        </div>
                        {badge && <p className="text-[14px] text-[#424242] leading-[20px]" style={{ width: 8 }}>{badge}</p>}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]">
                    <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">Add favourite</p>
                  </div>
                </div>
              </div>
              {/* Folders */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div className="overflow-clip relative flex-shrink-0" style={{ width: 16, height: 16 }}>
                    <img alt="" className="absolute block max-w-none pointer-events-none"
                      style={{ width: 10, height: 5.5, left: '50%', top: 'calc(50% + 0.25px)', transform: 'translate(-50%, -50%)' }}
                      src="/assets/outlook/chevron-inbox.svg" />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">Folders</p>
                </div>
                <div className="flex flex-col" style={{ width: 183 }}>
                  {folderItems.map(({ src, w, h, label, badge }) => (
                    <div key={label} className="flex items-center rounded-[4px] pl-[38px] pr-[18px] py-[10px]">
                      <div className="flex flex-1 gap-[8px] items-start">
                        <div className="flex gap-[8px] items-center" style={{ width: 115 }}>
                          <OI src={src} w={w} h={h} />
                          <p className="text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">{label}</p>
                        </div>
                        {badge && <p className="text-[14px] text-[#424242] leading-[20px]">{badge}</p>}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]">
                    <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">Create new fol...</p>
                  </div>
                </div>
              </div>
              {/* Groups */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div className="overflow-clip relative flex-shrink-0" style={{ width: 16, height: 16 }}>
                    <img alt="" className="absolute block max-w-none pointer-events-none"
                      style={{ width: 10, height: 5.5, left: '50%', top: 'calc(50% + 0.25px)', transform: 'translate(-50%, -50%)' }}
                      src="/assets/outlook/chevron-inbox.svg" />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">Groups</p>
                </div>
                <div className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]" style={{ width: 187 }}>
                  <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">New group</p>
                </div>
              </div>
            </div>

            {/* Email Panel */}
            <div className="flex flex-col gap-[8px] flex-1 min-w-0 pb-[16px]">

              {/* Email Header Bar */}
              <div className="bg-white border border-[#f0f0f0] flex flex-col gap-[6px] pt-[12px] rounded-[4px] flex-shrink-0">
                {/* Close / Previous / Next + Zoom */}
                <div className="flex items-start justify-between pl-[21px] pr-[24px]">
                  <div className="flex gap-[22px] items-center pt-[6px]">
                    <div className="flex gap-[7px] items-start">
                      <div className="overflow-clip relative flex-shrink-0" style={{ width: 16, height: 16 }}>
                        <img alt="" className="absolute block max-w-none pointer-events-none"
                          style={{ width: 11, height: 11, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                          src="/assets/outlook/dismiss.svg" />
                      </div>
                      <p className="text-[14px] text-[#808080] leading-[16px]">Close</p>
                    </div>
                    <div className="flex gap-[25px] items-start">
                      <div className="bg-[#e0e0e0] flex-shrink-0" style={{ width: 1, height: 18 }} />
                      <div className="flex gap-[21px] items-start text-[14px] leading-[16px] whitespace-nowrap">
                        <p className="text-[#d1d1d1]">Previous</p>
                        <p className="text-[#424242]">Next</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-[3px] items-end">
                    <OI src="/assets/outlook/zoom.svg" w={14} h={14} />
                    <div className="flex items-start pb-px">
                      <Chev src="/assets/outlook/chevron-email.svg" />
                    </div>
                  </div>
                </div>
                {/* Subject */}
                <div className="flex gap-[16px] items-center px-[13px] py-[10px]">
                  <p className="font-semibold text-[20px] text-[#424242] leading-[24px] whitespace-nowrap">Your project proposal is ready to review</p>
                  <div className="flex gap-[4px] items-center">
                    <div className="overflow-clip relative flex-shrink-0" style={{ width: 20, height: 20 }}>
                      <img alt="" className="absolute block max-w-none pointer-events-none"
                        style={{ width: 15, height: 17, left: 'calc(50% + 0.5px)', top: 'calc(50% - 0.5px)', transform: 'translate(-50%, -50%)' }}
                        src="/assets/outlook/mail-checkmark.svg" />
                    </div>
                    <div className="flex items-start pt-[3px]">
                      <Chev src="/assets/outlook/chevron-email.svg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content (scrollable) */}
              <div className="border border-[#d1d1d1] flex flex-col flex-1 min-h-0 overflow-clip rounded-[4px]">

                {/* Sender info header */}
                <div className="bg-white flex items-center justify-between flex-shrink-0 pb-[13px] pl-[12px] pr-[22px] pt-[15px]">
                  <div className="flex gap-[11px] items-end">
                    <div className="flex flex-col items-center justify-center bg-[#1f5d68] rounded-[42px] flex-shrink-0 pb-[6px] pt-[2px] px-[4px]"
                      style={{ width: 42, height: 42 }}>
                      <p className="font-semibold text-[16px] text-white leading-[16px]">O</p>
                    </div>
                    <div className="flex flex-col gap-[7px] text-[#424242] whitespace-nowrap">
                      <p className="text-[16px] leading-[16px]">{`ODA Architecture <service@oda-architecture.com>`}</p>
                      <div className="flex gap-[6px] items-center text-[14px]">
                        <p>To:</p>
                        <p>You</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[9px] items-end">
                    <div className="flex gap-[16px] items-start">
                      <OI src="/assets/outlook/reply-hdr.svg" w={15.5} h={12.24} />
                      <OI src="/assets/outlook/reply-all-hdr.svg" w={15.5} h={12.24} />
                      <OI src="/assets/outlook/forward-hdr.svg" w={15.5} h={12.24} />
                      <OI src="/assets/outlook/more-hdr.svg" w={12.5} h={2.5} />
                    </div>
                    <p className="text-[12px] text-[#808080] leading-[16px] whitespace-nowrap">Thu 26/01/2023 05:26</p>
                  </div>
                </div>

                {/* Email body — scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-white pl-[65px] pr-[28px]">
                  <div className="bg-[#fafafa] w-full" style={{ height: 1 }} />
                  {/* Grey surround */}
                  <div className="bg-[#f0f0f0] flex justify-center py-[31px] w-full">
                    <div className="flex flex-col" style={{ width: 612 }}>
                      {/* White email card */}
                      <div className="bg-white flex flex-col gap-[27px] items-start pb-[64px] pt-[48px] px-[54px]">
                        {/* ODA Logo */}
                        <div style={{ height: 44, width: 225 }}>
                          <ODALogo size="md" />
                        </div>
                        {/* Hero image */}
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '2666/1662' }}>
                          <Image src={emailImage} alt="Project Preview" fill className="object-cover" sizes="504px" />
                        </div>
                        {/* Hi */}
                        <p className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[16px]" style={{ fontWeight: 300 }}>Hi {firstName},</p>
                        {/* Body paragraphs */}
                        <div className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]" style={{ fontWeight: 300 }}>
                          <p className="mb-[6px]">Your project proposal from ODA Architecture is ready.</p>
                          <p>You can now explore your project online — compare package options, customize selected upgrades and add-ons, and review pricing before signing your agreement.</p>
                        </div>
                        {/* What you can do */}
                        <div className="text-[rgba(0,0,0,0.85)]" style={{ fontWeight: 300 }}>
                          <p className="font-semibold text-[16px] leading-[20px] mb-[6px]">What you can do</p>
                          <ul className="text-[12px] leading-[20px] list-disc pl-5">
                            <li>Compare Good / Better / Best options</li>
                            <li>Select upgrades and optional add-ons</li>
                            <li>Review your project scope, pricing and financing offers in real time</li>
                            <li>{`Sign your contract online when you're ready`}</li>
                          </ul>
                        </div>
                        {/* Project info */}
                        <p className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]" style={{ fontWeight: 300 }}>
                          <span style={{ fontWeight: 600 }}>Project:</span>{` ${projectName}`}<br />
                          <span style={{ fontWeight: 600 }}>Prepared by:</span>{` ${preparedBy.split(',')[0]}`}<br />
                          <span style={{ fontWeight: 600 }}>Proposal total starting from:</span>{` $ ${option.priceFrom.toLocaleString()}.00`}
                        </p>
                        {/* CTA */}
                        <div className="bg-black flex items-center justify-center px-[16px] py-[6px] rounded-[2px] flex-shrink-0" style={{ height: 40 }}>
                          <button
                            onClick={() => window.open('/proposal-v2?screen=landing', '_blank')}
                            className="font-semibold text-[14px] text-white leading-[18px] text-center whitespace-nowrap"
                          >
                            Review My Proposal
                          </button>
                        </div>
                        {/* Sign-off */}
                        <p className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]" style={{ fontWeight: 300 }}>
                          If you have any questions, you can contact your sales rep {preparedBy.split(',')[0]} directly before making your final selection.
                        </p>
                        <div className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]" style={{ fontWeight: 300 }}>
                          <p className="mb-[6px]">Thank you,</p>
                          <p>ODA Architecture</p>
                        </div>
                      </div>
                      {/* Email footer */}
                      <div className="bg-[#fafafa] flex flex-col gap-[8px] items-start pb-[36px] pt-[24px] px-[54px] text-[rgba(0,0,0,0.55)]" style={{ fontSize: 8 }}>
                        <p className="leading-[12px] w-full" style={{ fontWeight: 400 }}>
                          {company}<br />
                          {companyAddress}<br />
                          {phone} | {email}<br />
                          License #CSLB 1098421
                        </p>
                        <p className="leading-[14px] w-full" style={{ fontWeight: 600 }}>
                          <span className="underline">Legal</span>
                          {` & `}
                          <span className="underline">Privacy Statement</span>
                        </p>
                        <p className="leading-[14px] w-full">
                          This is an operational email.  Please do not reply to this email. Replies to this email will not be responded to or read.
                        </p>
                        <p className="leading-[12px] w-full" style={{ letterSpacing: '-0.16px' }}>
                          You are receiving this email because ODA Architecture has invited you to review your project online. Your digital proposal may include configurable package options, upgrades, add-ons, and estimated pricing. Final contract terms are defined by the signed agreement and may vary based on site conditions, material availability, permitting requirements, and approved project changes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply / Forward footer */}
                <div className="bg-white flex gap-[6px] items-center flex-shrink-0 pb-[13px] pt-[18px] px-[61px]">
                  <div className="bg-white border border-[#e0e0e0] flex gap-[8px] items-start px-[12px] py-[6px] rounded-[4px]">
                    <OI src="/assets/outlook/reply.svg" w={15.5} h={12.24} />
                    <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">Reply</p>
                  </div>
                  <div className="bg-white border border-[#e0e0e0] flex gap-[8px] items-start px-[12px] py-[6px] rounded-[4px]">
                    <OI src="/assets/outlook/forward-arrow.svg" w={15.5} h={12.24} />
                    <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">Forward</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
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

  const [hasSwitched, setHasSwitched] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSelected, setCompareSelected] = useState<number[]>([])

  const enterCompare = () => {
    setCompareMode(true)
    setCompareSelected([selectedOption])
  }

  const exitCompare = () => {
    setCompareMode(false)
    setCompareSelected([])
  }

  const toggleCompareOption = (i: number) => {
    setCompareSelected(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : prev.length < 2 ? [...prev, i] : prev
    )
  }

  const isChecked = compareSelected.includes(selectedOption)
  const canCompare = compareSelected.length === 2

  return (
    <div className="min-h-screen bg-white"
      style={{ fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: '72px' }}>

      {/* Nav */}
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

      {/* ── Image carousel + arrows (relative wrapper so arrows can overlay ghost areas) ── */}
      <div className="relative" style={{ height: '471px' }}>
        {/* Carousel */}
        <div className="overflow-hidden absolute inset-0">
          <div
            className="absolute flex"
            style={{ gap: '20px', width: '2440px', left: '50%', transform: 'translateX(-50%)' }}
          >
            {/* Left ghost */}
            <div
              className="relative flex-shrink-0 overflow-hidden cursor-pointer"
              style={{ width: '800px', height: '471px', opacity: 0.3 }}
              onClick={() => { setHasSwitched(true); onSelect(prev) }}
            >
              <Image src={odaOptions[prev].images[0]} alt="" fill className="object-cover" sizes="800px" />
            </div>
            {/* Center */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '800px', height: '471px' }}>
              <Image src={option.images[0]} alt="" fill className="object-cover" sizes="800px" priority />
            </div>
            {/* Right ghost */}
            <div
              className="relative flex-shrink-0 overflow-hidden cursor-pointer"
              style={{ width: '800px', height: '471px', opacity: 0.3 }}
              onClick={() => { setHasSwitched(true); onSelect(next) }}
            >
              <Image src={odaOptions[next].images[0]} alt="" fill className="object-cover" sizes="800px" />
            </div>
          </div>
        </div>

        {/* Left Arrow — x=240, y=356 on 1440px page */}
        <button
          onClick={() => { setHasSwitched(true); onSelect(prev) }}
          className="absolute flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ width: '48px', height: '48px', left: 'calc(50% - 480px)', top: '356px', backgroundColor: '#333333', borderRadius: '6px' }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8 2L2 8L8 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Right Arrow — x=1152, y=356 on 1440px page */}
        <button
          onClick={() => { setHasSwitched(true); onSelect(next) }}
          className="absolute flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ width: '48px', height: '48px', left: 'calc(50% + 432px)', top: '356px', backgroundColor: '#333333', borderRadius: '6px' }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M2 2L8 8L2 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Info card — bg-[#fbfbfb], 800px, shadow, pb-32 ── */}
      <div
        className="mx-auto bg-[#fbfbfb] flex flex-col pb-[32px]"
        style={{
          width: '800px',
          gap: '24px',
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.06), 0px 2px 10px 0px rgba(0,0,0,0.12)',
        }}
      >
        {/* Text content area: px-28, gap-28 */}
        <div className="flex flex-col px-[28px] pt-[24px]" style={{ gap: '28px' }}>

          {/* Title + subtitle */}
          <div className="flex flex-col" style={{ gap: '8px' }}>
            <p className="text-[24px] text-[#262626] tracking-[1.92px]">
              {option.title.replace('—', '-')}
            </p>
            <p className="text-[16px] text-[#262626]" style={{ fontWeight: 300 }}>
              Modern Eclecticism, Balancing Comfort and Refinement.
            </p>
          </div>

          {/* Details: gap-4px, tracking -0.16px, semilight */}
          <div className="flex flex-col text-[16px] text-[#262626]" style={{ gap: '4px', fontWeight: 300, letterSpacing: '-0.16px' }}>
            <p>{option.materials[0]}</p>
            <p>{option.deliveryDays} Days Estimate Delivery Time</p>
            <p>Starting from {formatPrice(option.priceFrom)} USD</p>
          </div>

          {/* CTA area: Select & Configure OR Add to comparison checkbox */}
          {compareMode ? (
            /* Compare mode: checkbox row (h-44, gap-12) */
            <button
              className="flex items-center"
              style={{ gap: '12px', height: '44px' }}
              onClick={() => toggleCompareOption(selectedOption)}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '24px', height: '24px',
                  backgroundColor: isChecked ? '#262626' : 'transparent',
                  border: isChecked ? 'none' : '1.5px solid #262626',
                  borderRadius: '2px',
                }}
              >
                {isChecked && (
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <path d="M1 4.5L5.5 9L13 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[16px] text-[#262626]">Add to comparison</span>
            </button>
          ) : (
            /* Default: Select & Configure — full-width dark button */
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center bg-[#262626] text-white text-[16px] font-semibold rounded-[4px] hover:opacity-90 transition-opacity"
              style={{ height: '44px', padding: '6px 16px' }}
            >
              Select &amp; Configure
            </button>
          )}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center mt-6 pb-10" style={{ gap: '8px' }}>
        {odaOptions.map((_, i) => (
          <button
            key={i}
            onClick={() => { setHasSwitched(true); onSelect(i) }}
            className="transition-all duration-300 rounded-[4px]"
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: i === selectedOption ? '#262626' : '#f1f0f0',
            }}
          />
        ))}
      </div>

      {/* ── Sticky bottom bar — only shown after user has switched options ── */}
      {(hasSwitched || compareMode) && <div
        className="fixed bottom-0 left-0 right-0 bg-white flex items-center"
        style={{ height: '72px', padding: '0 15.1%', boxShadow: '0px -8px 32px 0px rgba(123,123,123,0.1)', zIndex: 50 }}
      >
        {!compareMode ? (
          /* Default state */
          <div className="flex items-center w-full" style={{ gap: '24px' }}>
            <p className="font-semibold text-[14px] text-[#262626] flex-shrink-0">
              Need support choosing a option?
            </p>
            <p className="text-[14px] text-[#262626] flex-1" style={{ fontWeight: 300 }}>
              Compare different options to help you decide which one fits you best.
            </p>
            <button
              onClick={enterCompare}
              className="flex-shrink-0 flex items-center border border-[#262626] text-[#262626] text-[14px] hover:bg-[#262626] hover:text-white transition-colors"
              style={{ height: '40px', padding: '6px 16px', borderRadius: '4px' }}
            >
              Compare Options
            </button>
          </div>
        ) : (
          /* Compare active state */
          <div className="flex items-center w-full" style={{ gap: '24px' }}>
            {/* Two option slots */}
            <div className="flex flex-shrink-0" style={{ gap: '12px' }}>
              {[0, 1].map(slotIdx => (
                compareSelected[slotIdx] !== undefined ? (
                  <div key={slotIdx}
                    className="flex items-center justify-between"
                    style={{ width: '240px', height: '40px', border: '1px solid #262626', borderRadius: '4px', padding: '0 16px' }}
                  >
                    <span className="text-[12px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap flex-1 mr-2">
                      {odaOptions[compareSelected[slotIdx]].title.replace('—', '-')}
                    </span>
                    <button
                      className="flex-shrink-0 flex items-center justify-center hover:opacity-60 transition-opacity"
                      onClick={() => setCompareSelected(prev => prev.filter((_, i) => i !== slotIdx))}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="#262626" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div key={slotIdx}
                    className="flex items-center justify-center"
                    style={{ width: '240px', height: '40px', border: '1px solid #bfbfbf', borderRadius: '4px', padding: '0 16px' }}
                  >
                    <span className="text-[12px] text-[#737373]">Choose a option</span>
                  </div>
                )
              ))}
            </div>

            <p className="text-[14px] text-[#262626] flex-1" style={{ fontWeight: 300 }}>
              Select 2 options to start comparing
            </p>

            {/* Compare Options button */}
            <button
              disabled={!canCompare}
              onClick={() => canCompare && window.open(`/compare?a=${compareSelected[0]}&b=${compareSelected[1]}`, '_blank')}
              className="flex-shrink-0 flex items-center text-white text-[14px] transition-opacity"
              style={{
                height: '40px', padding: '6px 16px', borderRadius: '4px',
                backgroundColor: 'rgba(0,0,0,0.85)',
                opacity: canCompare ? 1 : 0.5,
                cursor: canCompare ? 'pointer' : 'not-allowed',
              }}
            >
              Compare Options
            </button>

            {/* Exit compare mode */}
            <button
              onClick={exitCompare}
              className="flex-shrink-0 flex items-center justify-center hover:opacity-60 transition-opacity"
              style={{ width: '30px', height: '30px' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>}

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
  description?: string
}

function SummaryGroup({ name, items, layoutAlt }: { name: string; items: SummaryLineItem[]; layoutAlt?: boolean }) {
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
        {items.map((item, i) => layoutAlt && item.showChange !== false ? (
          /* ── Alternative (large image) layout — only for product items with images ── */
          <div key={i} className="flex items-start py-[12px] w-full" style={{ borderTop: '0.5px solid rgba(0,0,0,0.1)' }}>
            {/* Image: 300×200, p-[2px], rounded-[4px] outer, rounded-[2px] inner */}
            <div className="flex-shrink-0 p-[2px] rounded-[4px]">
              <div className="relative rounded-[2px] overflow-hidden flex-shrink-0" style={{ width: '300px', height: '200px', border: '0.5px solid #d9d9d9' }}>
                {item.thumbnailSrc ? (
                  <Image src={item.thumbnailSrc} alt="" fill className="object-cover" sizes="300px" />
                ) : (
                  <div className="w-full h-full bg-[#f0f0f0]" />
                )}
              </div>
            </div>
            {/* Right content */}
            <div className="flex flex-1 flex-col gap-[24px] py-[4px] min-w-0 self-stretch">
              {/* Top row: text info + actions */}
              <div className="flex items-start justify-end w-full">
                {/* Text: name, qty, price */}
                <div className="flex flex-1 flex-col gap-[8px] px-[12px] text-[14px] min-w-0">
                  <p className="text-[#262626] truncate min-w-0">{item.name}</p>
                  <div className="flex gap-[8px] items-center flex-shrink-0" style={{ width: '130px', fontWeight: 300, color: '#737373' }}>
                    <p className="flex-shrink-0 whitespace-nowrap">{item.qty}</p>
                    <p className="flex-shrink-0 w-[32px]">{item.unit}</p>
                  </div>
                  <div className="flex gap-[2px] items-center flex-shrink-0" style={{ width: '124px', fontWeight: 300, color: '#262626' }}>
                    <p className="flex-shrink-0">$</p>
                    <p className="flex-1 min-w-0">{item.price.toLocaleString()}</p>
                  </div>
                </div>
                {/* Actions: w-[112px] */}
                <div className="flex items-center justify-between flex-shrink-0" style={{ width: '112px' }}>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <InfoIcon />
                  </div>
                  {item.showChange ? (
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
              {/* Description row */}
              {item.description && (
                <div className="px-[12px]">
                  <p className="text-[12px] text-[#737373] leading-normal">{item.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Compact (small image) layout ── */
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
  const [drawingModalOpen, setDrawingModalOpen] = useState(false)
  const [modalZoom, setModalZoom] = useState(1)
  const [productLayoutAlt, setProductLayoutAlt] = useState(false)
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
                    {/* Expand / Open Modal */}
                    <button
                      onClick={() => { setModalZoom(1); setDrawingModalOpen(true) }}
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
                <div className="pt-4 flex items-center justify-between">
                  <p className="font-semibold text-[14px] text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap">
                    All Included/Selected Products
                  </p>
                  {/* Swap Layout toggle */}
                  <button
                    onClick={() => setProductLayoutAlt(v => !v)}
                    className="flex items-center gap-[4px] flex-shrink-0 hover:bg-[#f5f5f5] transition-colors"
                    style={{ height: '32px', padding: '6px 4px', borderRadius: '4px' }}
                  >
                    <div className="flex items-center justify-center overflow-clip flex-shrink-0" style={{ width: '24px', height: '24px', borderRadius: '2px', padding: '1px' }}>
                      {/* Layout icon: compact ↔ large */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={productLayoutAlt ? '/assets/icon-layout-large.svg' : '/assets/icon-layout-compact.svg'}
                        alt=""
                        style={{ width: '15px', height: '14px', display: 'block', flexShrink: 0 }}
                      />
                    </div>
                    <span className="text-[14px] text-[#262626]" style={{ lineHeight: '18px' }}>Swap Layout</span>
                  </button>
                </div>

                {/* Base Scope */}
                <SummaryGroup
                  name="Base Scope"
                  layoutAlt={productLayoutAlt}
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
                  return <SummaryGroup key={section.name} name={section.name} items={lineItems} layoutAlt={productLayoutAlt} />
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

      {/* Drawing fullscreen modal */}
      {drawingModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
          onClick={() => setDrawingModalOpen(false)}
        >
          <div
            className="relative bg-white flex flex-col overflow-hidden"
            style={{ width: '1200px', height: '800px', borderRadius: '24px', padding: '40px 48px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setDrawingModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors text-[#262626]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Image area */}
            <div className="relative flex-1 overflow-hidden rounded-[8px]">
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${modalZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Image
                  src="/assets/drawing-floor-plan.png"
                  alt="Floor Plan"
                  fill
                  className="object-contain"
                  sizes="1104px"
                />
              </div>

              {/* Zoom controls — bottom-left inside image area */}
              <div className="absolute bottom-[24px] left-[32px] flex gap-[12px] items-center">
                {/* Zoom In */}
                <button
                  onClick={() => setModalZoom(z => Math.min(z + 0.25, 3))}
                  className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
                  style={{ width: '48px', height: '48px', backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.6)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                    <path d="M7.5 10.5h6M10.5 7.5v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {/* Zoom Out */}
                <button
                  onClick={() => setModalZoom(z => Math.max(z - 0.25, 0.5))}
                  className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
                  style={{ width: '48px', height: '48px', backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.6)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                    <path d="M7.5 10.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {/* Center / Reset */}
                <button
                  onClick={() => setModalZoom(1)}
                  className="flex-shrink-0 flex items-center justify-center rounded-[4px]"
                  style={{ width: '48px', height: '48px', backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.6)', boxShadow: '0 0 2px rgba(0,0,0,0.25)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
