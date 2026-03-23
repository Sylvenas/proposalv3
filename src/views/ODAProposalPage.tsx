"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import Image from "next/image";
import {
  odaOptions,
  odaProjectInfo,
  THUMB_BASE_SCOPE,
  type ODAOption,
  type ODAItem,
} from "@/data/odaMockData";

// Scale helper: pure CSS clamp — no JS resize listener needed, zero jitter
const sv = (px: number) => `calc(${px} / 1440 * clamp(1280px, 100vw, 2560px))`;

const COMPARE_BASE_SCOPE =
  "https://www.figma.com/api/mcp/asset/51981941-368d-42cc-b857-4efc43e45491";
const COMPARE_INFO_ICON =
  "https://www.figma.com/api/mcp/asset/18c9139d-35d9-423f-bba5-b49a22d84866";
const INSPECTION_CLOSE_ICON =
  "https://www.figma.com/api/mcp/asset/2f985f51-8ed2-4b21-a3f4-6ea1b0c78488";
const INSPECTION_PHONE_ICON =
  "https://www.figma.com/api/mcp/asset/0f6108b8-708f-4590-af43-3a49d4fe79ca";
const INSPECTION_REPORT_IMAGE_1 =
  "https://www.figma.com/api/mcp/asset/a9f6d074-8b60-421d-b834-eb390a876bf4";
const INSPECTION_REPORT_IMAGE_2 =
  "https://www.figma.com/api/mcp/asset/8bf4ece5-237e-42ab-b756-e842e4093c6e";
const INSPECTION_REPORT_IMAGE_3 =
  "https://www.figma.com/api/mcp/asset/400d4e67-59c3-423a-9416-600c82e4e24d";
const INSPECTION_REPORT_IMAGE_4 =
  "https://www.figma.com/api/mcp/asset/411fdc2e-0d4a-4899-957e-d7cf93525672";
const INSPECTION_REPORT_IMAGE_5 =
  "https://www.figma.com/api/mcp/asset/cf0f30fb-4654-49fb-8b6c-9121f88e352b";
const INSPECTION_REPORT_IMAGE_6 =
  "https://www.figma.com/api/mcp/asset/89e35ce2-be01-47f2-b097-d938fc738300";
const INSPECTION_REPORT_IMAGE_7 =
  "https://www.figma.com/api/mcp/asset/fab24a9f-a481-4283-963d-5003d9ae168d";
const INSPECTION_REPORT_IMAGE_8 =
  "https://www.figma.com/api/mcp/asset/5a2ab62f-2406-43f6-b3a2-8a3af77e6ce6";
const INSPECTION_VIDEO_ICON =
  "https://www.figma.com/api/mcp/asset/7acf45ae-fdae-49ab-9554-5d71be8157fc";

function getItemPrice(item: ODAItem): number {
  if (!item.isAddon) {
    return item.swatchPrices?.[item.selectedSwatch ?? 0] ?? item.price;
  } else {
    return (
      item.addonSwatchPrices?.[item.selectedAddonSwatch ?? 0] ?? item.price
    );
  }
}

type Screen = "email" | "landing" | "options" | "detail" | "approved";
const VALID_SCREENS: Screen[] = [
  "email",
  "landing",
  "options",
  "detail",
  "approved",
];

function formatPrice(n: number) {
  return "$" + n.toLocaleString();
}

// ─── Company Logo ─────────────────────────────────────────────────────────────
function ODALogo({
  size = "md",
}: {
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  const scales = { sm: 1, md: 1.12, lg: 1.4 };
  const s = scales[size];
  const width = 124 * s;
  const height = 24 * s;

  return (
    <Image
      src="/assets/company-logo-figma.png"
      alt="Design & Architecture"
      width={Math.round(width)}
      height={Math.round(height)}
      priority={size !== "lg"}
      style={{ width: sv(width), height: sv(height) }}
    />
  );
}

// ─── Screen 1: Email ─────────────────────────────────────────────────────────
function EmailScreen({ onContinue }: { onContinue: () => void }) {
  const {
    clientName,
    projectName,
    preparedBy,
    company,
    companyAddress,
    phone,
    email,
    emailImage,
  } = odaProjectInfo;
  const firstName = clientName.split(" ")[0];
  const option = odaOptions[0];

  // Icon helpers — matches Figma's overflow-clip 20×20 container with centered shape
  const OI = ({
    src,
    w,
    h,
    sz = 20,
  }: {
    src: string;
    w: number;
    h: number;
    sz?: number;
  }) => (
    <div
      className="overflow-clip relative flex-shrink-0"
      style={{ width: sz, height: sz }}
    >
      <img
        alt=""
        className="absolute block max-w-none pointer-events-none"
        style={{
          width: w,
          height: h,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        src={src}
      />
    </div>
  );
  // Small chevron (12×12 container)
  const Chev = ({
    src = "/assets/outlook/chevron-sm.svg",
  }: {
    src?: string;
  }) => (
    <div
      className="overflow-clip relative flex-shrink-0"
      style={{ width: 12, height: 12 }}
    >
      <img
        alt=""
        className="absolute block max-w-none pointer-events-none"
        style={{
          width: 8,
          height: 4.5,
          left: "50%",
          top: "calc(50% + 0.75px)",
          transform: "translate(-50%, -50%)",
        }}
        src={src}
      />
    </div>
  );
  const Sep = () => (
    <div
      className="bg-[#e5e5e5] flex-shrink-0"
      style={{ width: 1, height: 32 }}
    />
  );

  const inboxItems = [
    {
      src: "/assets/outlook/send.svg",
      w: 16.35,
      h: 16.13,
      label: "Sent Items",
    },
    {
      src: "/assets/outlook/drafts.svg",
      w: 16,
      h: 16,
      label: "Drafts",
      badge: "2",
    },
  ];
  const folderItems = [
    { src: "/assets/outlook/mail-inbox2.svg", w: 14, h: 14, label: "Inbox" },
    {
      src: "/assets/outlook/folder-junk.svg",
      w: 17,
      h: 16,
      label: "Junk Email",
    },
    {
      src: "/assets/outlook/drafts.svg",
      w: 16,
      h: 16,
      label: "Drafts",
      badge: "2",
    },
    {
      src: "/assets/outlook/send.svg",
      w: 16.35,
      h: 16.13,
      label: "Sent Items",
    },
    {
      src: "/assets/outlook/delete2.svg",
      w: 16,
      h: 16.5,
      label: "Deleted Items",
    },
    { src: "/assets/outlook/archive2.svg", w: 16, h: 14, label: "Archive" },
    { src: "/assets/outlook/note.svg", w: 14, h: 14, label: "Notes" },
    {
      src: "/assets/outlook/folder.svg",
      w: 16,
      h: 14,
      label: "Conversatio...",
    },
  ];

  return (
    <div
      className="flex flex-col w-full h-screen overflow-hidden bg-[#fafafa]"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Navigation Bar ── */}
      <div
        className="flex items-center justify-between flex-shrink-0 bg-[#316ab7]"
        style={{ padding: "8px 8px 8px 14px" }}
      >
        <div className="flex items-center gap-5">
          <OI src="/assets/outlook/grid.svg" w={15.5} h={15.5} />
          <p className="font-semibold text-[16px] text-white leading-[24px] whitespace-nowrap">
            Outlook
          </p>
          {/* Search bar */}
          <div
            className="flex items-center gap-[14px] rounded-[4px] pl-[12px] pb-[7px] pt-[5px]"
            style={{ width: 350, backgroundColor: "rgba(255,255,255,0.7)" }}
          >
            <OI src="/assets/outlook/search.svg" w={14} h={14} />
            <p className="text-[14px] text-[#1b3a5b] leading-[20px]">Search</p>
          </div>
        </div>
        {/* JS avatar */}
        <div
          className="flex items-center justify-center rounded-full border border-white overflow-clip flex-shrink-0 pb-px"
          style={{ width: 32, height: 32 }}
        >
          <p className="text-[14px] text-[#f4f4f4] leading-[14px]">JS</p>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0">
        {/* Apps Section */}
        <div
          className="flex flex-col gap-[17px] flex-shrink-0 pt-[7px]"
          style={{ width: 49, backgroundColor: "#f0f0f0" }}
        >
          {/* Mail (active) */}
          <div className="flex items-center gap-[10px] pl-[2px] pr-[15px]">
            <div
              className="rounded-[2px] flex-shrink-0 bg-[#316ab7]"
              style={{ width: 2, height: 32 }}
            />
            <OI src="/assets/outlook/mail-blue.svg" w={16} h={13} />
          </div>
          {/* Calendar / People / Attach */}
          <div className="flex flex-col gap-[18px] items-center w-full">
            {[
              { src: "/assets/outlook/calendar.svg", w: 14, h: 14 },
              { src: "/assets/outlook/people.svg", w: 17, h: 13.5 },
              { src: "/assets/outlook/attach.svg", w: 12.6, h: 14.3 },
            ].map((ic, i) => (
              <div
                key={i}
                className="flex items-center justify-center py-[4px] w-full"
              >
                <OI src={ic.src} w={ic.w} h={ic.h} />
              </div>
            ))}
          </div>
          {/* Other apps */}
          <div className="flex flex-col gap-[14px] w-full">
            <div className="flex flex-col gap-[18px]">
              {[
                { src: "/assets/outlook/todo.svg", w: 20, h: 16.5 },
                { src: "/assets/outlook/word.svg", w: 20, h: 20 },
                { src: "/assets/outlook/excel.svg", w: 20, h: 20 },
                { src: "/assets/outlook/powerpoint.svg", w: 20, h: 20 },
                { src: "/assets/outlook/onedrive.svg", w: 20, h: 20 },
              ].map((ic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center py-[4px] w-full"
                >
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
              <p className="font-semibold text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">
                Home
              </p>
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
            <div
              className="bg-white border-[0.25px] border-black/6 flex gap-[36px] items-start px-[14px] py-[4px] flex-1 rounded-[4px]"
              style={{ boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.04)" }}
            >
              {/* New email */}
              <div className="flex gap-[10px] items-center">
                <img
                  src="/assets/outlook/line-horizontal.svg"
                  alt=""
                  className="flex-shrink-0"
                  style={{ width: 20, height: 20 }}
                />
                <div className="flex gap-px items-center">
                  <div className="flex gap-[10px] items-center bg-[#316ab7] rounded-l-[4px] h-[32px] pl-[9px] pr-[12px]">
                    <OI src="/assets/outlook/mail-white.svg" w={16} h={13} />
                    <p className="text-[14px] text-white leading-[20px] whitespace-nowrap">
                      New email
                    </p>
                  </div>
                  <div className="flex items-center justify-center bg-[#316ab7] rounded-r-[4px] px-[6px] py-[8px]">
                    <div
                      className="overflow-clip relative flex-shrink-0"
                      style={{ width: 16, height: 16 }}
                    >
                      <img
                        alt=""
                        className="absolute block max-w-none pointer-events-none"
                        style={{
                          width: 10,
                          height: 5.5,
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                        src="/assets/outlook/chevron-white.svg"
                      />
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
                        <p className="text-[14px] text-[#212121] leading-[20px]">
                          Delete
                        </p>
                      </div>
                      <Chev />
                    </div>
                    <div className="flex gap-[4px] items-center">
                      <OI src="/assets/outlook/archive.svg" w={16} h={14} />
                      <p className="text-[14px] text-black leading-[20px]">
                        Archive
                      </p>
                    </div>
                    <div className="flex gap-[4px] items-start">
                      <OI src="/assets/outlook/report.svg" w={14} h={16} />
                      <p className="text-[14px] text-[#212121] leading-[20px]">
                        Report
                      </p>
                    </div>
                    <div className="flex gap-[4px] items-center">
                      <OI src="/assets/outlook/sweep.svg" w={16.5} h={16.5} />
                      <p className="text-[14px] text-[#212121] leading-[20px]">
                        Sweep
                      </p>
                    </div>
                    <div className="flex gap-[7px] items-center">
                      <div className="flex gap-[4px] items-center">
                        <OI src="/assets/outlook/move-to.svg" w={17} h={16} />
                        <p className="text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">
                          Move to
                        </p>
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
                        <OI
                          src="/assets/outlook/reply-all.svg"
                          w={15.5}
                          h={12.24}
                        />
                        <p className="text-[14px] text-[#212121] leading-[20px]">
                          Reply
                        </p>
                      </div>
                      <Chev />
                    </div>
                    <Sep />
                  </div>
                  <div className="flex gap-[21px] items-center">
                    <div className="flex gap-[4px] items-start">
                      <OI src="/assets/outlook/mail-read.svg" w={16} h={14} />
                      <p className="text-[14px] text-[#212121] leading-[20px] whitespace-nowrap">
                        Read / Unread
                      </p>
                    </div>
                    <div className="flex gap-[19px] items-center">
                      <div className="flex gap-[13px] items-start">
                        <div className="flex gap-[4px] items-center">
                          <OI src="/assets/outlook/tag.svg" w={15.6} h={15.6} />
                          <Chev />
                        </div>
                        <div className="flex gap-[5px] items-center">
                          <div
                            className="relative flex-shrink-0"
                            style={{ width: 20, height: 20 }}
                          >
                            <img
                              alt=""
                              className="absolute block max-w-none pointer-events-none"
                              style={{
                                width: 12.5,
                                height: 15,
                                left: "calc(50% - 0.25px)",
                                top: "calc(50% + 0.5px)",
                                transform: "translate(-50%, -50%)",
                              }}
                              src="/assets/outlook/flag.svg"
                            />
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
            <div
              className="flex flex-col gap-[8px] bg-[#fafafa] flex-shrink-0 overflow-y-auto"
              style={{ padding: "18px 19px 18px 8px" }}
            >
              {/* Favourites */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div
                    className="overflow-clip relative flex-shrink-0"
                    style={{ width: 16, height: 16 }}
                  >
                    <img
                      alt=""
                      className="absolute block max-w-none pointer-events-none"
                      style={{
                        width: 10,
                        height: 5.5,
                        left: "50%",
                        top: "calc(50% + 0.25px)",
                        transform: "translate(-50%, -50%)",
                      }}
                      src="/assets/outlook/chevron-inbox.svg"
                    />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px] whitespace-nowrap">
                    Favourites
                  </p>
                </div>
                <div className="flex flex-col">
                  {/* Inbox (active, highlighted) */}
                  <div className="flex items-start bg-[#d3e3f8] rounded-[4px] pl-[38px] pr-[18px] py-[10px]">
                    <div className="flex flex-1 gap-[8px] items-start">
                      <div
                        className="flex gap-[8px] items-start"
                        style={{ width: 115 }}
                      >
                        <OI
                          src="/assets/outlook/mail-inbox.svg"
                          w={14}
                          h={14}
                        />
                        <p className="font-semibold text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">
                          Inbox
                        </p>
                      </div>
                      <p
                        className="text-[14px] text-[#265388] leading-[20px]"
                        style={{ width: 8 }}
                      >
                        1
                      </p>
                    </div>
                  </div>
                  {inboxItems.map(({ src, w, h, label, badge }) => (
                    <div
                      key={label}
                      className="flex items-center rounded-[4px] pl-[38px] pr-[18px] py-[10px]"
                    >
                      <div className="flex flex-1 gap-[8px] items-start">
                        <div
                          className="flex gap-[8px] items-center"
                          style={{ width: 115 }}
                        >
                          <OI src={src} w={w} h={h} />
                          <p className="text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">
                            {label}
                          </p>
                        </div>
                        {badge && (
                          <p
                            className="text-[14px] text-[#424242] leading-[20px]"
                            style={{ width: 8 }}
                          >
                            {badge}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]">
                    <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">
                      Add favourite
                    </p>
                  </div>
                </div>
              </div>
              {/* Folders */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div
                    className="overflow-clip relative flex-shrink-0"
                    style={{ width: 16, height: 16 }}
                  >
                    <img
                      alt=""
                      className="absolute block max-w-none pointer-events-none"
                      style={{
                        width: 10,
                        height: 5.5,
                        left: "50%",
                        top: "calc(50% + 0.25px)",
                        transform: "translate(-50%, -50%)",
                      }}
                      src="/assets/outlook/chevron-inbox.svg"
                    />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                    Folders
                  </p>
                </div>
                <div className="flex flex-col" style={{ width: 183 }}>
                  {folderItems.map(({ src, w, h, label, badge }) => (
                    <div
                      key={label}
                      className="flex items-center rounded-[4px] pl-[38px] pr-[18px] py-[10px]"
                    >
                      <div className="flex flex-1 gap-[8px] items-start">
                        <div
                          className="flex gap-[8px] items-center"
                          style={{ width: 115 }}
                        >
                          <OI src={src} w={w} h={h} />
                          <p className="text-[14px] text-[#424242] leading-[20px] flex-1 min-w-0">
                            {label}
                          </p>
                        </div>
                        {badge && (
                          <p className="text-[14px] text-[#424242] leading-[20px]">
                            {badge}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]">
                    <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">
                      Create new fol...
                    </p>
                  </div>
                </div>
              </div>
              {/* Groups */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex gap-[12px] items-center px-[12px]">
                  <div
                    className="overflow-clip relative flex-shrink-0"
                    style={{ width: 16, height: 16 }}
                  >
                    <img
                      alt=""
                      className="absolute block max-w-none pointer-events-none"
                      style={{
                        width: 10,
                        height: 5.5,
                        left: "50%",
                        top: "calc(50% + 0.25px)",
                        transform: "translate(-50%, -50%)",
                      }}
                      src="/assets/outlook/chevron-inbox.svg"
                    />
                  </div>
                  <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                    Groups
                  </p>
                </div>
                <div
                  className="flex items-start rounded-[4px] pl-[66px] pr-[18px] py-[10px]"
                  style={{ width: 187 }}
                >
                  <p className="text-[14px] text-[#265388] leading-[20px] whitespace-nowrap">
                    New group
                  </p>
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
                      <div
                        className="overflow-clip relative flex-shrink-0"
                        style={{ width: 16, height: 16 }}
                      >
                        <img
                          alt=""
                          className="absolute block max-w-none pointer-events-none"
                          style={{
                            width: 11,
                            height: 11,
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                          src="/assets/outlook/dismiss.svg"
                        />
                      </div>
                      <p className="text-[14px] text-[#808080] leading-[16px]">
                        Close
                      </p>
                    </div>
                    <div className="flex gap-[25px] items-start">
                      <div
                        className="bg-[#e0e0e0] flex-shrink-0"
                        style={{ width: 1, height: 18 }}
                      />
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
                  <p className="font-semibold text-[20px] text-[#424242] leading-[24px] whitespace-nowrap">
                    Your project proposal is ready to review
                  </p>
                  <div className="flex gap-[4px] items-center">
                    <div
                      className="overflow-clip relative flex-shrink-0"
                      style={{ width: 20, height: 20 }}
                    >
                      <img
                        alt=""
                        className="absolute block max-w-none pointer-events-none"
                        style={{
                          width: 15,
                          height: 17,
                          left: "calc(50% + 0.5px)",
                          top: "calc(50% - 0.5px)",
                          transform: "translate(-50%, -50%)",
                        }}
                        src="/assets/outlook/mail-checkmark.svg"
                      />
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
                    <div
                      className="flex flex-col items-center justify-center bg-[#1f5d68] rounded-[42px] flex-shrink-0 pb-[6px] pt-[2px] px-[4px]"
                      style={{ width: 42, height: 42 }}
                    >
                      <p className="font-semibold text-[16px] text-white leading-[16px]">
                        O
                      </p>
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
                      <OI
                        src="/assets/outlook/reply-hdr.svg"
                        w={15.5}
                        h={12.24}
                      />
                      <OI
                        src="/assets/outlook/reply-all-hdr.svg"
                        w={15.5}
                        h={12.24}
                      />
                      <OI
                        src="/assets/outlook/forward-hdr.svg"
                        w={15.5}
                        h={12.24}
                      />
                      <OI src="/assets/outlook/more-hdr.svg" w={12.5} h={2.5} />
                    </div>
                    <p className="text-[12px] text-[#808080] leading-[16px] whitespace-nowrap">
                      Thu 26/01/2023 05:26
                    </p>
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
                        <div
                          className="relative w-full overflow-hidden"
                          style={{ aspectRatio: "2666/1662" }}
                        >
                          <Image
                            src={emailImage}
                            alt="Project Preview"
                            fill
                            className="object-cover"
                            sizes="504px"
                          />
                        </div>
                        {/* Hi */}
                        <p
                          className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[16px]"
                          style={{ fontWeight: 300 }}
                        >
                          Hi {firstName},
                        </p>
                        {/* Body paragraphs */}
                        <div
                          className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="mb-[6px]">
                            Your project proposal from ODA Architecture is
                            ready.
                          </p>
                          <p>
                            You can now explore your project online — compare
                            package options, customize selected upgrades and
                            add-ons, and review pricing before signing your
                            agreement.
                          </p>
                        </div>
                        {/* What you can do */}
                        <div
                          className="text-[rgba(0,0,0,0.85)]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="font-semibold text-[16px] leading-[20px] mb-[6px]">
                            What you can do
                          </p>
                          <ul className="text-[12px] leading-[20px] list-disc pl-5">
                            <li>Compare Good / Better / Best options</li>
                            <li>Select upgrades and optional add-ons</li>
                            <li>
                              Review your project scope, pricing and financing
                              offers in real time
                            </li>
                            <li>{`Sign your contract online when you're ready`}</li>
                          </ul>
                        </div>
                        {/* Project info */}
                        <p
                          className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <span style={{ fontWeight: 600 }}>Project:</span>
                          {` ${projectName}`}
                          <br />
                          <span style={{ fontWeight: 600 }}>Prepared by:</span>
                          {` ${preparedBy.split(",")[0]}`}
                          <br />
                          <span style={{ fontWeight: 600 }}>
                            Proposal total starting from:
                          </span>
                          {` $ ${option.priceFrom.toLocaleString()}.00`}
                        </p>
                        {/* CTA */}
                        <div
                          className="bg-black flex items-center justify-center px-[16px] py-[6px] rounded-[2px] flex-shrink-0"
                          style={{ height: 40 }}
                        >
                          <button
                            onClick={() =>
                              window.open(
                                "/proposal-future-blueprint?screen=landing",
                                "_blank",
                              )
                            }
                            className="font-semibold text-[14px] text-white leading-[18px] text-center whitespace-nowrap"
                          >
                            Review My Proposal
                          </button>
                        </div>
                        {/* Sign-off */}
                        <p
                          className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          If you have any questions, you can contact your sales
                          rep {preparedBy.split(",")[0]} directly before making
                          your final selection.
                        </p>
                        <div
                          className="text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="mb-[6px]">Thank you,</p>
                          <p>ODA Architecture</p>
                        </div>
                      </div>
                      {/* Email footer */}
                      <div
                        className="bg-[#fafafa] flex flex-col gap-[8px] items-start pb-[36px] pt-[24px] px-[54px] text-[rgba(0,0,0,0.55)]"
                        style={{ fontSize: 8 }}
                      >
                        <p
                          className="leading-[12px] w-full"
                          style={{ fontWeight: 400 }}
                        >
                          {company}
                          <br />
                          {companyAddress}
                          <br />
                          {phone} | {email}
                          <br />
                          License #CSLB 1098421
                        </p>
                        <p
                          className="leading-[14px] w-full"
                          style={{ fontWeight: 600 }}
                        >
                          <span className="underline">Legal</span>
                          {` & `}
                          <span className="underline">Privacy Statement</span>
                        </p>
                        <p className="leading-[14px] w-full">
                          This is an operational email. Please do not reply to
                          this email. Replies to this email will not be
                          responded to or read.
                        </p>
                        <p
                          className="leading-[12px] w-full"
                          style={{ letterSpacing: "-0.16px" }}
                        >
                          You are receiving this email because ODA Architecture
                          has invited you to review your project online. Your
                          digital proposal may include configurable package
                          options, upgrades, add-ons, and estimated pricing.
                          Final contract terms are defined by the signed
                          agreement and may vary based on site conditions,
                          material availability, permitting requirements, and
                          approved project changes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply / Forward footer */}
                <div className="bg-white flex gap-[6px] items-center flex-shrink-0 pb-[13px] pt-[18px] px-[61px]">
                  <div className="bg-white border border-[#e0e0e0] flex gap-[8px] items-start px-[12px] py-[6px] rounded-[4px]">
                    <OI src="/assets/outlook/reply.svg" w={15.5} h={12.24} />
                    <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                      Reply
                    </p>
                  </div>
                  <div className="bg-white border border-[#e0e0e0] flex gap-[8px] items-start px-[12px] py-[6px] rounded-[4px]">
                    <OI
                      src="/assets/outlook/forward-arrow.svg"
                      w={15.5}
                      h={12.24}
                    />
                    <p className="font-semibold text-[14px] text-[#424242] leading-[20px]">
                      Forward
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type InspectionMedia = {
  type: "image" | "video";
  src: string;
  thumbSrc?: string;
};

type InspectionEntry = {
  id: number;
  title: string;
  description: string;
  media: InspectionMedia[];
};

function InspectionDetailModal({
  entries,
  activeEntryIndex,
  activeMediaIndex,
  onClose,
  onChangeEntry,
  onChangeMedia,
}: {
  entries: InspectionEntry[];
  activeEntryIndex: number;
  activeMediaIndex: number;
  onClose: () => void;
  onChangeEntry: (index: number) => void;
  onChangeMedia: (index: number) => void;
}) {
  const entry = entries[activeEntryIndex];
  const media = entry.media[activeMediaIndex] ?? entry.media[0];
  const hasPrev = activeEntryIndex > 0;
  const hasNext = activeEntryIndex < entries.length - 1;

  return (
    <div
      className="fixed inset-0 z-[220] flex flex-col items-center justify-end"
      style={{
        paddingTop: sv(113),
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white flex flex-col items-start w-full"
        style={{
          height: sv(767),
          borderTopLeftRadius: sv(16),
          borderTopRightRadius: sv(16),
          boxShadow:
            "0px 2px 4px 0px rgba(0,0,0,0.12), 0px 4px 24px 0px rgba(0,0,0,0.2)",
          gap: sv(16),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-end w-full"
          style={{
            paddingTop: sv(16),
            paddingLeft: sv(16),
            paddingRight: sv(16),
          }}
        >
          <button
            onClick={onClose}
            className="bg-[#f0f0f0] flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ width: sv(24), height: sv(24), borderRadius: sv(4) }}
          >
            <img
              src={INSPECTION_CLOSE_ICON}
              alt=""
              style={{ width: sv(10.506), height: sv(10.506) }}
            />
          </button>
        </div>
        <div
          className="flex items-start w-full flex-1 min-h-0"
          style={{ gap: sv(40), paddingLeft: sv(64), paddingRight: sv(64) }}
        >
          <div
            className="flex flex-col justify-between h-full flex-shrink-0"
            style={{ width: sv(840), paddingBottom: sv(24) }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                width: "100%",
                aspectRatio: "732 / 510",
                borderRadius: sv(8),
              }}
            >
              <Image
                src={media.src}
                alt=""
                fill
                className="object-cover"
                sizes="840px"
              />
              {media.type === "video" && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ backgroundColor: "rgba(0,0,0,0.14)" }}
                >
                  <img
                    src={INSPECTION_VIDEO_ICON}
                    alt=""
                    style={{ width: sv(72), height: sv(72) }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center w-full" style={{ gap: sv(8) }}>
              {entry.media.map((item, index) => {
                const isActive = index === activeMediaIndex;
                return (
                  <button
                    key={`${entry.id}-${index}`}
                    onClick={() => onChangeMedia(index)}
                    className="flex flex-col items-start"
                    style={{
                      width: sv(86),
                      height: sv(64),
                      padding: sv(2),
                      borderRadius: sv(4),
                      border: isActive
                        ? "1.5px solid #000000"
                        : "1.5px solid transparent",
                    }}
                  >
                    <div
                      className="relative flex-1 w-full overflow-hidden"
                      style={{ borderRadius: sv(2) }}
                    >
                      <Image
                        src={item.thumbSrc ?? item.src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="86px"
                      />
                      {item.type === "video" && (
                        <div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                        >
                          <img
                            src={INSPECTION_VIDEO_ICON}
                            alt=""
                            style={{ width: sv(20), height: sv(20) }}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className="flex flex-col flex-1 min-w-0 h-full"
            style={{ gap: sv(24), paddingBottom: sv(127) }}
          >
            <div
              className="flex flex-col flex-1 min-h-0"
              style={{ gap: sv(32) }}
            >
              <div className="flex flex-col w-full" style={{ gap: sv(16) }}>
                <p
                  className="font-semibold text-[#262626]"
                  style={{
                    fontSize: sv(20),
                    letterSpacing: sv(-0.8),
                    lineHeight: "normal",
                  }}
                >
                  INSPECTION DETAILS
                </p>
                <div
                  className="bg-[#262626] flex items-center justify-center"
                  style={{ width: sv(32), height: sv(32), borderRadius: sv(2) }}
                >
                  <p
                    style={{
                      fontSize: sv(16),
                      color: "#ffffff",
                      lineHeight: "normal",
                    }}
                  >
                    {entry.id}
                  </p>
                </div>
                <div
                  className="text-[#262626]"
                  style={{
                    fontSize: sv(14),
                    fontWeight: 300,
                    lineHeight: "normal",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {entry.description}
                </div>
              </div>
              <button
                className="bg-white border border-[#262626] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                style={{
                  width: sv(132),
                  height: sv(40),
                  borderRadius: sv(4),
                  gap: sv(2),
                  color: "rgba(0,0,0,0.85)",
                  fontSize: sv(14),
                }}
              >
                <img
                  src={INSPECTION_PHONE_ICON}
                  alt=""
                  style={{ width: sv(24), height: sv(22) }}
                />
                <span>Contact Sales</span>
              </button>
            </div>
            <div className="flex items-start w-full">
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => hasPrev && onChangeEntry(activeEntryIndex - 1)}
                  className="bg-white border border-[#262626] flex items-center justify-center transition-colors"
                  style={{
                    width: sv(96),
                    height: sv(40),
                    borderRadius: sv(4),
                    fontSize: sv(14),
                    color: "rgba(0,0,0,0.85)",
                    opacity: hasPrev ? 1 : 0.4,
                    cursor: hasPrev ? "pointer" : "default",
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => hasNext && onChangeEntry(activeEntryIndex + 1)}
                  className="bg-white border border-[#262626] flex items-center justify-center transition-colors"
                  style={{
                    width: sv(96),
                    height: sv(40),
                    borderRadius: sv(4),
                    fontSize: sv(14),
                    color: "rgba(0,0,0,0.85)",
                    opacity: hasNext ? 1 : 0.4,
                    cursor: hasNext ? "pointer" : "default",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Landing ────────────────────────────────────────────────────────
function LandingScreen({
  onContinue,
  onHome,
}: {
  onContinue: () => void;
  onHome: () => void;
}) {
  const { heroImage } = odaProjectInfo;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inspectionModal, setInspectionModal] = useState<{
    entryIndex: number;
    mediaIndex: number;
  } | null>(null);
  const [isInspectionSectionPinned, setIsInspectionSectionPinned] =
    useState(false);

  // Track when section 2 has reached the top so the top nav can appear.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const vh = container.clientHeight;
      setIsInspectionSectionPinned(scrollTop >= vh);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToInspection = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.clientHeight,
      behavior: "smooth",
    });
  };

  const inspectionItems: InspectionEntry[] = [
    {
      id: 1,
      title: "Walkthrough video recorded for pre-Construction reference.",
      description: "Walkthrough video recorded for pre-Construction reference.",
      media: [
        { type: "video", src: INSPECTION_REPORT_IMAGE_1 },
        { type: "video", src: INSPECTION_REPORT_IMAGE_2 },
      ],
    },
    {
      id: 2,
      title: "Existing flooring to be removed in main living area.",
      description:
        "Existing flooring to be removed in main living area. Current flooring material in the main living area shows visible wear, uneven transitions, and inconsistent patch repairs. Full removal is recommended to support proper substrate preparation and new finish installation.",
      media: [],
    },
    {
      id: 3,
      title: "HVAC vent position may need adjustment.",
      description:
        "HVAC vent position may need adjustment. Current vent placement may conflict with the proposed ceiling treatment and lighting layout. Recommend coordination during construction planning to confirm final positioning.",
      media: [
        { type: "image", src: INSPECTION_REPORT_IMAGE_3 },
        { type: "video", src: INSPECTION_REPORT_IMAGE_4 },
      ],
    },
    {
      id: 4,
      title:
        "Kitchen plumbing access should be verified before cabinet installation.",
      description:
        "Kitchen plumbing access should be verified before cabinet installation. Existing plumbing locations appear serviceable, but access and alignment should be rechecked once demolition is complete. Final cabinet and appliance layout may require localized plumbing adjustment.",
      media: [{ type: "image", src: INSPECTION_REPORT_IMAGE_5 }],
    },
    {
      id: 5,
      title: "Moisture risk observed around bathroom shower wall.",
      description:
        "Moisture risk observed around bathroom shower wall. Moisture staining was observed along the lower portion of the shower-adjacent wall. Recommend opening the affected area during demolition to inspect for concealed water damage, compromised substrate, or mold-related issues before finish installation.",
      media: [
        { type: "image", src: INSPECTION_REPORT_IMAGE_6 },
        { type: "image", src: INSPECTION_REPORT_IMAGE_7 },
        { type: "video", src: INSPECTION_REPORT_IMAGE_8 },
      ],
    },
  ];

  const floorPlanMarkers = [
    { id: 1, x: "82.6%", y: "43.1%" },
    { id: 2, x: "69.4%", y: "15.3%" },
    { id: 3, x: "46.2%", y: "88.0%" },
    { id: 4, x: "73.3%", y: "64.1%" },
    { id: 5, x: "5.2%", y: "35.1%" },
    { id: 6, x: "10.4%", y: "68.5%" },
  ];

  const openInspectionModal = (entryIndex: number, mediaIndex = 0) => {
    setInspectionModal({ entryIndex, mediaIndex });
  };

  const InspectionNavBar = () => (
    <nav
      className="flex justify-between items-center"
      style={{ padding: `${sv(24)} ${sv(217)}` }}
    >
      <button
        onClick={scrollToTop}
        className="flex items-center justify-center text-[#262626]"
        style={{ width: sv(24), height: sv(24) }}
      >
        <svg
          style={{ width: sv(18), height: sv(16) }}
          viewBox="0 0 18 16"
          fill="none"
        >
          <path
            d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ODALogo size="sm" />
      <button
        className="flex items-center justify-center text-[#737373]"
        style={{ width: sv(24), height: sv(24) }}
      >
        <svg
          style={{ width: sv(17), height: sv(17) }}
          viewBox="0 0 17 17"
          fill="none"
        >
          <circle
            cx="8.5"
            cy="5.5"
            r="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </nav>
  );

  return (
    <div
      ref={scrollRef}
      style={{
        height: "100vh",
        minWidth: "1280px",
        overflowY: "scroll",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Section 1: Hero (100vh) ── */}
      <section
        className="bg-white"
        style={{
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ width: "100%", maxWidth: sv(1440), margin: "0 auto" }}
        >
          {/* Logo */}
          <div
            style={{
              padding: `${sv(39)} 0 ${sv(24)} ${sv(95)}`,
              flexShrink: 0,
            }}
          >
            <ODALogo size="sm" />
          </div>

          {/* Hero image — fills remaining height, dynamically cropped */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{ margin: `0 ${sv(95)} ${sv(40)}` }}
          >
            <Image
              src={heroImage}
              alt="Architecture"
              fill
              className="object-cover"
              sizes="(max-width:1280px) calc(100vw - 190px), 1250px"
              priority
            />

            {/* Gradient */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: sv(216),
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.5))",
              }}
            />

            {/* Title — bottom left */}
            <div className="absolute" style={{ left: sv(44), bottom: sv(38) }}>
              <p
                className="text-white m-0 leading-tight"
                style={{
                  fontSize: sv(48),
                  fontWeight: 300,
                  letterSpacing: sv(-2.4),
                }}
              >
                HOME RENOVATION
              </p>
              <p
                className="text-white m-0 leading-tight"
                style={{
                  fontSize: sv(48),
                  fontWeight: 300,
                  letterSpacing: sv(-2.4),
                }}
              >
                PROPOSAL
              </p>
            </div>

            {/* Tagline + buttons — bottom right */}
            <div
              className="absolute flex items-center"
              style={{ right: sv(44), bottom: sv(32), gap: sv(16) }}
            >
              <p
                className="text-white m-0 whitespace-nowrap"
                style={{ fontSize: sv(14) }}
              >
                Where curation meets legacy, define your singular dimensions.
              </p>
              <button
                onClick={scrollToInspection}
                className="flex-shrink-0 flex items-center justify-center text-white font-semibold uppercase transition-opacity hover:opacity-80"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  fontSize: sv(14),
                  letterSpacing: sv(1),
                  background: "rgba(116,116,116,0.7)",
                  border: `${sv(1)} solid white`,
                  whiteSpace: "nowrap",
                }}
              >
                INSPECTION REPORT
              </button>
              <button
                onClick={onContinue}
                className="flex-shrink-0 flex items-center justify-center font-semibold uppercase transition-opacity hover:opacity-80"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  fontSize: sv(14),
                  letterSpacing: sv(1),
                  background: "rgba(255,255,255,0.9)",
                  border: `${sv(1)} solid white`,
                  color: "#333",
                  whiteSpace: "nowrap",
                }}
              >
                EXPLORE OPTIONS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Inspection Details (free-scrolls after snap) ── */}
      <section style={{ backgroundColor: "#ffffff", paddingBottom: sv(64) }}>
        {/* Sticky header: nav + inspection details bar */}
        <div
          className="bg-white"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            borderBottom: `0.5px solid rgba(0,0,0,0.2)`,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: sv(1440),
              margin: "0 auto",
              opacity: isInspectionSectionPinned ? 1 : 0,
              pointerEvents: isInspectionSectionPinned ? "auto" : "none",
              transition: "opacity 0.2s ease",
            }}
          >
            <InspectionNavBar />
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              width: "100%",
              maxWidth: sv(1440),
              margin: "0 auto",
              padding: `${sv(16)} ${sv(99)}`,
            }}
          >
            <div className="flex flex-col" style={{ gap: sv(2) }}>
              <p
                style={{
                  fontSize: sv(20),
                  fontWeight: 600,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                INSPECTION DETAILS
              </p>
              <p
                style={{
                  fontSize: sv(14),
                  fontWeight: 400,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                Home Renovation — Suite 2505, Broadway Tower
              </p>
            </div>
            <div className="flex items-center" style={{ gap: sv(8) }}>
              <button
                className="flex items-center justify-center"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  gap: sv(6),
                  border: `${sv(1)} solid #262626`,
                  borderRadius: sv(4),
                  backgroundColor: "white",
                  color: "rgba(0,0,0,0.85)",
                  fontSize: sv(14),
                  lineHeight: "normal",
                }}
              >
                <svg
                  style={{ width: sv(16), height: sv(16) }}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 1.5h3.5l1.5 4-2 1.5c.9 1.8 2.5 3.4 4.5 4.5L11 9l4 1.5v3.5C8 15 .5 7.5 2 1.5z"
                    stroke="#262626"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Contact Sales</span>
              </button>
              <button
                className="flex items-center justify-center"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  backgroundColor: "#262626",
                  color: "white",
                  borderRadius: sv(4),
                  fontSize: sv(14),
                  fontWeight: 600,
                  lineHeight: "normal",
                }}
                onClick={onContinue}
              >
                Explore Options
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ width: "100%", maxWidth: sv(1440), margin: "0 auto" }}>
          <div
            style={{
              padding: `${sv(32)} ${sv(95)}`,
              display: "flex",
              flexDirection: "column",
              gap: sv(24),
            }}
          >
            {/* INSPECTION REPORT card */}
            <div
              className="bg-white flex flex-col"
              style={{
                borderRadius: sv(12),
                padding: `${sv(32)} ${sv(48)} ${sv(24)}`,
                gap: sv(24),
                boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
              }}
            >
              <p
                style={{
                  fontSize: sv(16),
                  fontWeight: 600,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                INSPECTION REPORT
              </p>
              {inspectionItems.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="flex flex-col w-full"
                  style={{
                    borderTop: "0.5px solid rgba(0,0,0,0.1)",
                    paddingTop: sv(12),
                    gap: sv(8),
                  }}
                >
                  <div
                    className="flex items-start w-full"
                    style={{ gap: sv(12) }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: sv(24),
                        height: sv(24),
                        borderRadius: sv(2),
                        backgroundColor: "#262626",
                        color: "white",
                        fontSize: sv(16),
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {item.id}
                    </div>
                    <p
                      style={{
                        fontSize: sv(14),
                        fontWeight: 300,
                        color: "#262626",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                  {item.media.length > 0 && (
                    <div
                      className="flex items-center"
                      style={{ paddingLeft: sv(36), gap: sv(4) }}
                    >
                      {item.media.map((media, mediaIndex) => (
                        <button
                          key={mediaIndex}
                          onClick={() =>
                            openInspectionModal(itemIndex, mediaIndex)
                          }
                          className="relative flex-shrink-0 overflow-hidden"
                          style={{
                            width: sv(64),
                            height: sv(64),
                            borderRadius: sv(2),
                          }}
                        >
                          <Image
                            src={media.thumbSrc ?? media.src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                          {media.type === "video" && (
                            <div
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
                            >
                              <img
                                src={INSPECTION_VIDEO_ICON}
                                alt=""
                                style={{ width: sv(22), height: sv(22) }}
                              />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <p
                className="text-center"
                style={{
                  fontSize: sv(14),
                  color: "rgba(0,0,0,0.85)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Show More
              </p>
            </div>

            {/* INSPECTION DRAWING card */}
            <div
              className="bg-white flex flex-col"
              style={{
                borderRadius: sv(12),
                padding: `${sv(32)} ${sv(48)} ${sv(24)}`,
                gap: sv(24),
                boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
              }}
            >
              <p
                style={{
                  fontSize: sv(16),
                  fontWeight: 600,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                INSPECTION DRAWING
              </p>
              <div className="flex justify-center">
                <div
                  className="relative"
                  style={{ width: sv(909), height: sv(685) }}
                >
                  <Image
                    src="/assets/drawing-floor-plan.png"
                    alt="Floor plan"
                    fill
                    className="object-cover"
                    sizes="909px"
                  />
                  {floorPlanMarkers.map((marker) => (
                    <button
                      key={marker.id}
                      onClick={() =>
                        marker.id <= 5 && openInspectionModal(marker.id - 1, 0)
                      }
                      className="absolute flex items-center justify-center"
                      style={{
                        left: marker.x,
                        top: marker.y,
                        transform: "translate(-50%, -50%)",
                        width: sv(44),
                        height: sv(44),
                        borderRadius: sv(2),
                        backgroundColor: "#262626",
                        color: "white",
                        fontSize: sv(24),
                        fontWeight: 700,
                        lineHeight: 1,
                        cursor: marker.id <= 5 ? "pointer" : "default",
                      }}
                    >
                      {marker.id}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="flex items-center"
                style={{ gap: sv(12), padding: `0 ${sv(32)}` }}
              >
                <button
                  className="flex items-center justify-center"
                  style={{
                    width: sv(48),
                    height: sv(48),
                    borderRadius: sv(4),
                    backgroundColor: "rgba(0,0,0,0.6)",
                  }}
                >
                  <svg
                    style={{ width: sv(22), height: sv(22) }}
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 7v6M7 10h6M20 20l-4-4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className="flex items-center justify-center"
                  style={{
                    width: sv(48),
                    height: sv(48),
                    borderRadius: sv(4),
                    backgroundColor: "rgba(0,0,0,0.6)",
                  }}
                >
                  <svg
                    style={{ width: sv(22), height: sv(22) }}
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 10h6M20 20l-4-4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className="flex items-center justify-center"
                  style={{
                    width: sv(48),
                    height: sv(48),
                    borderRadius: sv(4),
                    backgroundColor: "rgba(0,0,0,0.6)",
                  }}
                >
                  <svg
                    style={{ width: sv(22), height: sv(22) }}
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <path
                      d="M2 8V2h6M14 2h6v6M20 14v6h-6M8 20H2v-6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {inspectionModal && (
        <InspectionDetailModal
          entries={inspectionItems}
          activeEntryIndex={inspectionModal.entryIndex}
          activeMediaIndex={inspectionModal.mediaIndex}
          onClose={() => setInspectionModal(null)}
          onChangeEntry={(entryIndex) =>
            setInspectionModal({ entryIndex, mediaIndex: 0 })
          }
          onChangeMedia={(mediaIndex) =>
            setInspectionModal((prev) =>
              prev ? { ...prev, mediaIndex } : prev,
            )
          }
        />
      )}
    </div>
  );
}

// ─── Screen 3: Option Selector ────────────────────────────────────────────────
function OptionsScreen({
  selectedOption,
  onSelect,
  onContinue,
  onHome,
}: {
  selectedOption: number;
  onSelect: (i: number) => void;
  onContinue: () => void;
  onHome: () => void;
}) {
  const compareRef = useRef<HTMLDivElement>(null);
  const topOptionsRef = useRef<HTMLDivElement>(null);
  const decisionSectionRef = useRef<HTMLDivElement>(null);
  const expandedCompareCardRef = useRef<HTMLDivElement>(null);
  const [hideComparisonHeader, setHideComparisonHeader] = useState(true);
  const [expandedCompareOptionIdx, setExpandedCompareOptionIdx] = useState<
    number | null
  >(null);
  const [compareProductDetailModal, setCompareProductDetailModal] = useState<{
    item: ODAItem;
    sectionName: string;
    measurementLabel: string;
    description: string;
  } | null>(null);

  const scrollToCompare = () =>
    compareRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const topOptionsEl = topOptionsRef.current;
    const decisionEl = decisionSectionRef.current;
    if (!topOptionsEl || !decisionEl) return;

    let isTopOptionsVisible = true;
    let isDecisionVisible = false;

    const syncHeaderVisibility = () => {
      setHideComparisonHeader(isTopOptionsVisible || isDecisionVisible);
    };

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.target === topOptionsEl) {
            isTopOptionsVisible = entry.isIntersecting;
          }
          if (entry.target === decisionEl) {
            isDecisionVisible = entry.isIntersecting;
          }
        });
        syncHeaderVisibility();
      },
      { threshold: 0.01 }
    );

    observer.observe(topOptionsEl);
    observer.observe(decisionEl);
    syncHeaderVisibility();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (expandedCompareOptionIdx === null) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (expandedCompareCardRef.current?.contains(target)) return;
      setExpandedCompareOptionIdx(null);
    };

    const handleScroll = () => {
      setExpandedCompareOptionIdx(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [expandedCompareOptionIdx]);

  // Schedule & Pricing data (3 options × 3 metrics)
  const scheduleData: Array<Array<{ label: string; value: string }>> = [
    [
      { label: "Base Scope Cost", value: "$250,000" },
      { label: "Maximum Project Cost", value: "$341,700" },
      { label: "Estimate Completion Time", value: "120 Days" },
    ],
    [
      { label: "Base Scope Cost", value: "$125,800" },
      { label: "Maximum Project Cost", value: "$211,000" },
      { label: "Estimate Completion Time", value: "90 Days" },
    ],
    [
      { label: "Base Scope Cost", value: "$650,000" },
      { label: "Maximum Project Cost", value: "$1,233,000" },
      { label: "Estimate Completion Time", value: "180 Days" },
    ],
  ];

  // Comparison line item type
  type CItem = {
    name: string;
    qty: string;
    unit: string;
    img: string;
    imageStyle?: CSSProperties;
  };
  type CDash = { dash: true };

  const normalizeCompareText = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const findCompareSourceItem = (
    optionIdx: number,
    sectionTitle: string,
    compareItem: CItem,
  ) => {
    const sourceSection = odaOptions[optionIdx].sections.find(
      (section) => section.name === sectionTitle,
    );
    if (!sourceSection) return null;

    const normalizedCompareName = normalizeCompareText(compareItem.name);
    return (
      sourceSection.items.find((sourceItem) => {
        const normalizedSpec = normalizeCompareText(sourceItem.spec);
        const normalizedName = normalizeCompareText(sourceItem.name);
        return (
          normalizedSpec === normalizedCompareName ||
          normalizedName === normalizedCompareName ||
          normalizedSpec.includes(normalizedCompareName) ||
          normalizedCompareName.includes(normalizedSpec)
        );
      }) ?? null
    );
  };

  const openCompareProductDetail = (
    compareItem: CItem,
    sectionTitle: string,
    optionIdx: number,
  ) => {
    const sourceItem = findCompareSourceItem(
      optionIdx,
      sectionTitle,
      compareItem,
    );
    const fallbackItem: ODAItem = {
      id: `compare-${sectionTitle}-${optionIdx}-${compareItem.name}`,
      name: sectionTitle,
      spec: compareItem.name,
      price: 0,
      productImages: [compareItem.img],
      previewImage: compareItem.img,
    };

    setCompareProductDetailModal({
      item: sourceItem ?? fallbackItem,
      sectionName: sectionTitle,
      measurementLabel: `${compareItem.qty} ${compareItem.unit}`,
      description: `Detailed scope reference for ${compareItem.name.toLowerCase()} in ${optionNames[optionIdx].toLowerCase()}.`,
    });
  };

  // Comparison line item thumbnails — exact Figma assets for node 412:5599
  const IF1 =
    "https://www.figma.com/api/mcp/asset/839abaa6-99cb-4cb6-acc4-b8757be02aa5";
  const IF2 =
    "https://www.figma.com/api/mcp/asset/d2d53416-1c9e-4f51-9dce-7ebeb8605507";
  const IF3 =
    "https://www.figma.com/api/mcp/asset/f260401f-d99d-48b4-a548-bbc84c8d405e";
  const IF4 =
    "https://www.figma.com/api/mcp/asset/5bb5b811-b579-412c-994d-dd7886732a14";
  const IF5 =
    "https://www.figma.com/api/mcp/asset/5ebfaeae-68b9-4675-b96a-e3d29543abdd";
  const IF6 =
    "https://www.figma.com/api/mcp/asset/175eb359-f0c7-458e-ac60-a1c129e88689";
  const IF7 =
    "https://www.figma.com/api/mcp/asset/48e8f73b-06ed-4c27-b398-3ef76be60cd3";
  const IF8 =
    "https://www.figma.com/api/mcp/asset/17793a24-f973-407f-8da0-92c61ffc2e1e";
  const IF9 =
    "https://www.figma.com/api/mcp/asset/c4fcc113-156d-4050-a038-d5a2c6ead8b6";
  const KT1 =
    "https://www.figma.com/api/mcp/asset/da5f585e-4864-406d-8727-0df12a6a41a8";
  const KT2 =
    "https://www.figma.com/api/mcp/asset/aa23928a-01f8-49a3-ac44-9d5a77276f28";
  const KT3 =
    "https://www.figma.com/api/mcp/asset/91b15597-7f23-4f5f-8189-884511344971";
  const KT4 =
    "https://www.figma.com/api/mcp/asset/56750a6f-bc62-4cc3-8067-e5c5d7602c2a";
  const KT5 =
    "https://www.figma.com/api/mcp/asset/7e23b8db-6b7a-4934-bb71-451c895a6c41";
  const KT6 =
    "https://www.figma.com/api/mcp/asset/cbf92a3d-10dd-4f84-9272-e902be412313";
  const KT7 =
    "https://www.figma.com/api/mcp/asset/806874b1-4718-4494-b168-e74baf12dbf3";
  const KT8 =
    "https://www.figma.com/api/mcp/asset/76d03b51-8070-4de7-a371-f502a5f8964f";
  const KT9 =
    "https://www.figma.com/api/mcp/asset/c948e0a1-84e0-42c8-98c6-1e36f7605c83";
  const BT1 =
    "https://www.figma.com/api/mcp/asset/76332eb0-9285-4c53-baa5-2e60879fe2b5";
  const BT2 =
    "https://www.figma.com/api/mcp/asset/9347fafe-c738-417b-af43-ce7de369166c";
  const BT3 =
    "https://www.figma.com/api/mcp/asset/0e90cde4-e32e-4997-81a8-a7bf544fc203";
  const BT4 =
    "https://www.figma.com/api/mcp/asset/753bd493-f005-4731-bddd-2aba4b3bd45b";
  const BT5 =
    "https://www.figma.com/api/mcp/asset/92bcb3db-ba5a-430d-aa4b-9dcc907ddc4d";
  const BT6 =
    "https://www.figma.com/api/mcp/asset/732b4b18-6007-4b15-939d-e6edc9904a24";
  const BT7 =
    "https://www.figma.com/api/mcp/asset/c61c9b83-e90e-433b-83c5-92619b816e06";
  const BT8 =
    "https://www.figma.com/api/mcp/asset/451cc17e-b5c0-4bf5-b5fc-be1937f8a16a";
  const PC1 =
    "https://www.figma.com/api/mcp/asset/1a5fcdf7-b33f-49f7-b351-4fb6ecc98b2c";
  const PC3 =
    "https://www.figma.com/api/mcp/asset/93027c17-568b-4628-86d5-4e1224adad23";

  const compareSections: Array<{
    title: string;
    columns: (CItem | CDash)[][];
  }> = [
    {
      title: "Base Scope",
      columns: [
        [
          {
            name: "Existing Surface Preparation & Demolition",
            qty: "960",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Wall & Ceiling Preparation",
            qty: "190",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Flooring Base Installation",
            qty: "547",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Lighting & Electrical Adjustments",
            qty: "128",
            unit: "hrs.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Installation & Finishing Labor",
            qty: "1,300",
            unit: "hrs.",
            img: COMPARE_BASE_SCOPE,
          },
        ],
        [
          {
            name: "Existing Surface Preparation & Demolition",
            qty: "720",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Wall & Ceiling Preparation",
            qty: "190",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Flooring Base Installation",
            qty: "400",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Lighting & Electrical Adjustments",
            qty: "72",
            unit: "hrs.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Installation & Finishing Labor",
            qty: "900",
            unit: "hrs.",
            img: COMPARE_BASE_SCOPE,
          },
        ],
        [
          {
            name: "Existing Surface Preparation & Demolition",
            qty: "720",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Wall & Ceiling Preparation",
            qty: "190",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Flooring Base Installation",
            qty: "400",
            unit: "sqf.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Lighting & Electrical Adjustments",
            qty: "300",
            unit: "hrs.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Installation & Finishing Labor",
            qty: "2,600",
            unit: "hrs.",
            img: COMPARE_BASE_SCOPE,
          },
        ],
      ],
    },
    {
      title: "Interior Finishes",
      columns: [
        [
          {
            name: "Oak Wood - 600x100mm - Herringbone Pattern",
            qty: "1,240",
            unit: "sqf.",
            img: IF1,
          },
          {
            name: "Decorative Plaster Wall Finish - White",
            qty: "2,280",
            unit: "sqf.",
            img: IF2,
          },
        ],
        [
          {
            name: "Wide-Plank Oak Wood Flooring – Natural Matte Finish",
            qty: "1,240",
            unit: "sqf.",
            img: IF3,
          },
          {
            name: "Microcement Wall Finish – Warm Light Greige",
            qty: "2,280",
            unit: "sqf.",
            img: IF4,
          },
          {
            name: "Flush Baseboard & Trim Detail – Soft White",
            qty: "420",
            unit: "lf.",
            img: IF5,
          },
        ],
        [
          {
            name: "Dark Walnut Wood Flooring – Chevron Pattern",
            qty: "1,240",
            unit: "sqf.",
            img: IF6,
          },
          {
            name: "Decorative Wall Panel Molding – Warm Ivory",
            qty: "2,280",
            unit: "sqf.",
            img: IF7,
          },
          {
            name: "Black Marble Floor Border Inlay – Polished Finish",
            qty: "420",
            unit: "lf.",
            img: IF8,
          },
          {
            name: "Ceiling Medallion & Trim Detail Package – Soft White",
            qty: "6",
            unit: "sets",
            img: IF9,
          },
        ],
      ],
    },
    {
      title: "Kitchen",
      columns: [
        [
          {
            name: "Liebherr WKb 4612 Barrique Wine Cabinet (195 bottles, Glass Door)",
            qty: "1",
            unit: "pcs.",
            img: KT1,
          },
          {
            name: "Extended Stone Edge Countertop",
            qty: "5",
            unit: "sqf.",
            img: KT2,
          },
          {
            name: "Handleless Cabinet Front Upgrade – Natural Oak Veneer",
            qty: "42",
            unit: "pcs.",
            img: KT3,
          },
        ],
        [
          {
            name: "Integrated Panel-Ready Refrigerator",
            qty: "1",
            unit: "pcs.",
            img: KT4,
          },
          {
            name: "Waterfall Stone Island Countertop – Honed Beige Quartzite",
            qty: "5",
            unit: "sqf.",
            img: KT5,
          },
        ],
        [
          {
            name: "Built-In Espresso Walnut Cabinetry – Brass Detail Trim",
            qty: "42",
            unit: "pcs.",
            img: KT6,
          },
          {
            name: "Calacatta Gold Marble Countertop – Polished Finish",
            qty: "5",
            unit: "sqf.",
            img: KT7,
          },
          {
            name: "Fluted Glass Bar Cabinet – Backlit Display Shelving",
            qty: "1",
            unit: "pcs.",
            img: KT8,
          },
          {
            name: "Statement Pendant Lighting – Aged Brass Finish",
            qty: "3",
            unit: "pcs.",
            img: KT9,
          },
        ],
      ],
    },
    {
      title: "Bathroom",
      columns: [
        [
          {
            name: "Floating Custom Teak Wood Design Vanity",
            qty: "3",
            unit: "pcs.",
            img: BT1,
          },
          {
            name: "Royal Infinity J-480 (seats 7-8)",
            qty: "2",
            unit: "pcs.",
            img: BT2,
          },
          {
            name: "Kohler Moxie Showerhead with Wireless Speaker",
            qty: "4",
            unit: "sets",
            img: BT3,
          },
        ],
        [
          {
            name: "Frameless Glass Shower Enclosure – Clear Low-Iron Glass",
            qty: "2",
            unit: "sets",
            img: BT4,
            imageStyle: {
              width: "100.82%",
              height: "134.43%",
              left: "-0.82%",
              top: "-0.17%",
              maxWidth: "none",
            },
          },
          {
            name: "Rain Shower System – Brushed Nickel",
            qty: "2",
            unit: "pcs.",
            img: BT5,
          },
        ],
        [
          {
            name: "Custom Walnut Vanity – Stone Top with Brass Hardware",
            qty: "2",
            unit: "sets",
            img: BT6,
          },
          {
            name: "Bookmatched Marble Feature Wall – Polished Finish",
            qty: "2",
            unit: "sets",
            img: BT7,
          },
          {
            name: "Rain Shower System – Brushed Nickel",
            qty: "2",
            unit: "pcs.",
            img: BT8,
          },
        ],
      ],
    },
    {
      title: "Post-Construction Service",
      columns: [
        [{ name: "Surface Care Package", qty: "1", unit: "srv.", img: PC1 }],
        [{ dash: true as const }],
        [
          {
            name: "Post-Construction White Glove Styling & Setup",
            qty: "1",
            unit: "srv.",
            img: COMPARE_BASE_SCOPE,
          },
          {
            name: "Luxury Surface Care & Maintenance Package",
            qty: "2",
            unit: "srv.",
            img: PC3,
          },
        ],
      ],
    },
  ];

  const optionNames = [
    "OPTION 1 - THE TIME LESS ORIGINAL",
    "OPTION 2 - THE ZEN SANCTUARY",
    "OPTION 3 - THE GATSBY HERITAGE",
  ];

  // Reusable option card — image uses Figma's exact crop: h=126.97%, top=-19.53%
  const OptionCard = ({ optIdx }: { optIdx: number }) => {
    const opt = odaOptions[optIdx];
    // Only Option 1 (index 0) uses whitespace-nowrap on subtitle per Figma design
    const subtitleWhiteSpace = optIdx === 0 ? "nowrap" : "normal";
    return (
      <div
        className="flex flex-col items-center"
        style={{
          flex: "1 0 0",
          minWidth: 0,
          minHeight: 0,
          backgroundColor: "#EDEDED",
          gap: sv(24),
          paddingBottom: sv(32),
        }}
      >
        <div
          className="relative w-full shrink-0"
          style={{ aspectRatio: "800/471" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={opt.images[0]}
              alt=""
              style={{
                position: "absolute",
                height: "126.97%",
                width: "100%",
                left: 0,
                top: "-19.53%",
                maxWidth: "none",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: `0 ${sv(28)}`, gap: sv(4), lineHeight: "normal" }}
        >
          <p
            style={{
              fontSize: sv(16),
              fontWeight: 600,
              color: "#262626",
              width: "100%",
            }}
          >
            {opt.title}
          </p>
          <p
            style={{
              fontSize: sv(14),
              color: "#737373",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: subtitleWhiteSpace,
              height: sv(38),
            }}
          >
            {opt.subtitle}
          </p>
        </div>
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: `0 ${sv(28)}`, gap: sv(28) }}
        >
          <div
            className="flex flex-col w-full"
            style={{
              gap: sv(4),
              fontSize: sv(14),
              color: "#262626",
              letterSpacing: sv(-0.14),
              lineHeight: "normal",
            }}
          >
            <p style={{ fontWeight: 400 }}>{opt.materials[0]}</p>
            <p style={{ fontWeight: 400 }}>
              {opt.deliveryDays} Days Estimate Delivery Time
            </p>
            <p style={{ fontWeight: 600 }}>
              Starting from {formatPrice(opt.priceFrom)} USD
            </p>
          </div>
          <div className="flex items-center justify-end w-full">
            <button
              onClick={() => {
                onSelect(optIdx);
                onContinue();
              }}
              className="flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{
                flex: "1 0 0",
                height: sv(40),
                padding: `${sv(6)} ${sv(16)}`,
                backgroundColor: "#262626",
                color: "white",
                fontSize: sv(14),
                fontWeight: 600,
                lineHeight: sv(18),
                borderRadius: sv(4),
              }}
            >
              Select &amp; Configure
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Comparison line item row — matches Figma exactly
  const LineItem = ({
    item,
    sectionTitle,
    optionIdx,
  }: {
    item: CItem | CDash;
    sectionTitle: string;
    optionIdx: number;
  }) => {
    if ("dash" in item) {
      return (
        <div
          className="flex items-start"
          style={{
            borderTop: "0.5px solid rgba(0,0,0,0.1)",
            paddingTop: sv(12),
            paddingBottom: sv(12),
            backgroundColor: "white",
          }}
        >
          <div
            className="flex flex-1 items-center min-w-0"
            style={{ paddingRight: sv(4) }}
          >
            <p
              style={{
                flex: "1 0 0",
                fontSize: sv(14),
                color: "#262626",
                lineHeight: "normal",
                minWidth: 0,
              }}
            >
              -
            </p>
          </div>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => openCompareProductDetail(item, sectionTitle, optionIdx)}
        className="flex items-start w-full text-left"
        style={{
          border: "none",
          borderTop: "0.5px solid rgba(0,0,0,0.1)",
          paddingTop: sv(12),
          paddingBottom: sv(12),
          gap: sv(12),
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        <div
          className="flex-shrink-0 flex flex-col items-start"
          style={{
            width: sv(48),
            height: sv(48),
            padding: sv(2),
            borderRadius: sv(4),
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{ width: "100%", height: "100%", borderRadius: sv(2) }}
          >
            <img
              src={item.img}
              alt=""
              className="absolute pointer-events-none"
              style={
                item.imageStyle ?? {
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }
              }
            />
          </div>
        </div>
        <div
          className="flex flex-1 items-center min-w-0"
          style={{ gap: sv(12), paddingRight: sv(4) }}
        >
          <p
            style={{
              flex: "1 0 0",
              fontSize: sv(14),
              color: "#262626",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: "normal",
              minWidth: 0,
            }}
          >
            {item.name}
          </p>
          <div
            className="flex items-center flex-shrink-0"
            style={{ width: sv(116), justifyContent: "flex-end" }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: sv(24), height: sv(24) }}
            >
              <img
                src={COMPARE_INFO_ICON}
                alt=""
                className="pointer-events-none"
                style={{ width: sv(16.333), height: sv(16.333) }}
              />
            </div>
            <div
              className="flex items-center flex-shrink-0"
              style={{
                width: sv(97),
                gap: sv(8),
                fontSize: sv(14),
                fontWeight: 300,
                color: "#262626",
                lineHeight: "normal",
              }}
            >
              <p className="flex-1 text-right min-w-0">{item.qty}</p>
              <p className="flex-shrink-0" style={{ width: sv(32) }}>
                {item.unit}
              </p>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="bg-white"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Top area: Nav + Title + Cards ── */}
      <div style={{ width: sv(1440), minHeight: "100vh", margin: "0 auto" }}>
        {/* Nav — height sv(99): 31px top pad + 24px icons + 44px gap to title = 99px matches Figma y=99 */}
        <nav
          className="flex justify-between"
          style={{
            height: sv(99),
            padding: `${sv(31)} ${sv(217)} 0`,
            alignItems: "flex-start",
          }}
        >
          <button
            onClick={onHome}
            className="flex items-center justify-center text-[#262626]"
            style={{ width: sv(24), height: sv(24) }}
          >
            <svg
              style={{ width: sv(18), height: sv(16) }}
              viewBox="0 0 18 16"
              fill="none"
            >
              <path
                d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <ODALogo size="sm" />
          <button
            className="flex items-center justify-center text-[#737373]"
            style={{ width: sv(24), height: sv(24) }}
          >
            <svg
              style={{ width: sv(17), height: sv(17) }}
              viewBox="0 0 17 17"
              fill="none"
            >
              <circle
                cx="8.5"
                cy="5.5"
                r="3"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </nav>

        {/* Page title — Figma: Segoe UI Regular 24px tracking-[1.92px] centered */}
        <p
          className="text-center whitespace-nowrap"
          style={{
            fontSize: sv(24),
            fontWeight: 400,
            color: "#262626",
            letterSpacing: sv(1.92),
            lineHeight: "normal",
            paddingBottom: sv(40),
          }}
        >
          SELECT YOUR OPTION
        </p>

        {/* 3-column option cards */}
        <div
          ref={topOptionsRef}
          className="flex"
          style={{ gap: sv(32), padding: `0 ${sv(80)}` }}
        >
          {odaOptions.map((_, i) => (
            <OptionCard key={i} optIdx={i} />
          ))}
        </div>

        {/* Need support + Compare Options button */}
        <div
          className="flex flex-col items-center"
          style={{ gap: sv(16), paddingTop: sv(24), paddingBottom: sv(80) }}
        >
          <div
            className="flex flex-col items-center text-center"
            style={{ gap: sv(4), lineHeight: "normal" }}
          >
            <p style={{ fontSize: sv(14), fontWeight: 600, color: "#262626" }}>
              Need support choosing a option?
            </p>
            <p style={{ fontSize: sv(14), fontWeight: 300, color: "#262626" }}>
              Compare different options to help you decide which one fits you
              best.
            </p>
          </div>
          <button
            onClick={scrollToCompare}
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{
              height: sv(32),
              padding: `${sv(6)} ${sv(4)}`,
              borderRadius: sv(4),
              gap: sv(4),
              color: "#262626",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {/* double-chevron-down icon */}
            <svg
              style={{ width: sv(24), height: sv(24) }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M8 8L12 12L16 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 13L12 17L16 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: sv(14),
                lineHeight: "normal",
                whiteSpace: "nowrap",
              }}
            >
              Compare Options
            </span>
          </button>
        </div>
      </div>

      {/* ── Comparison section ── */}
      <div ref={compareRef}>
        {/* Sticky comparison header — full viewport width */}
        <div
          className="relative bg-white"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            borderBottom: "0.5px solid rgba(0,0,0,0.2)",
            boxShadow: "0px 4px 3px 0px rgba(123,123,123,0.1)",
            display: hideComparisonHeader ? "none" : "flex",
            alignItems: "center",
            gap: sv(32),
            padding: `0 ${sv(80)}`,
            overflow: "visible",
          }}
        >
          {optionNames.map((name, i) => (
            <button
              key={i}
              className="flex items-center justify-center"
              style={{
                flex: "1 0 0",
                height: sv(48),
                padding: `0 ${sv(8)}`,
                gap: sv(4),
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() =>
                setExpandedCompareOptionIdx((prev) => (prev === i ? null : i))
              }
            >
              <p
                style={{
                  fontSize: sv(14),
                  fontWeight: 600,
                  color: "#262626",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </p>
              {/* chevron-down */}
              <svg
                style={{ width: sv(16), height: sv(16), flexShrink: 0 }}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#262626"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
          {expandedCompareOptionIdx !== null && !hideComparisonHeader && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: "100%",
                width: sv(1280),
                zIndex: 21,
                pointerEvents: "none",
              }}
            >
              <div className="flex" style={{ gap: sv(32) }}>
                {odaOptions.map((_, i) => (
                  <div key={i} style={{ flex: "1 0 0", minWidth: 0 }}>
                    {i === expandedCompareOptionIdx ? (
                      <div
                        ref={expandedCompareCardRef}
                        style={{
                          pointerEvents: "auto",
                          boxShadow:
                            "0px 24px 56px rgba(15,23,42,0.18), 0px 8px 20px rgba(15,23,42,0.10)",
                        }}
                      >
                        <OptionCard optIdx={i} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparison tables — 1280px centered (matches Figma frame width) */}
        <div
          style={{
            width: sv(1280),
            margin: "0 auto",
            paddingTop: sv(64),
            paddingBottom: sv(80),
          }}
        >
          {/* Schedule and Pricing — title Semibold 28px centered, metrics with border-top */}
          <div style={{ marginBottom: sv(64) }}>
            <p
              style={{
                fontSize: sv(28),
                fontWeight: 600,
                color: "#262626",
                textAlign: "center",
                lineHeight: "normal",
                marginBottom: sv(48),
              }}
            >
              Schedule and Pricing
            </p>
            <div className="flex" style={{ gap: sv(32) }}>
              {scheduleData.map((col, ci) => (
                <div key={ci} style={{ flex: "1 0 0" }}>
                  {col.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        borderTop: "0.5px solid rgba(0,0,0,0.1)",
                        paddingTop: sv(16),
                        paddingBottom: sv(16),
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: sv(14),
                          fontWeight: 400,
                          color: "#737373",
                          letterSpacing: sv(-0.14),
                          lineHeight: "normal",
                          textAlign: "center",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: sv(24),
                          fontWeight: 600,
                          color: "#262626",
                          lineHeight: "normal",
                          textAlign: "center",
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Comparison sections — title Semibold 28px centered, line items */}
          {compareSections.map((section) => (
            <div key={section.title} style={{ marginBottom: sv(64) }}>
              <p
                style={{
                  fontSize: sv(28),
                  fontWeight: 600,
                  color: "#262626",
                  textAlign: "center",
                  lineHeight: "normal",
                  marginBottom: sv(48),
                }}
              >
                {section.title}
              </p>
              <div
                className="mx-auto flex"
                style={{
                  width: sv(1264),
                  gap: sv(32),
                  alignItems: "flex-start",
                }}
              >
                {section.columns.map((items, ci) => (
                  <div
                    key={ci}
                    style={{ width: sv(400), flex: `0 0 ${sv(400)}` }}
                  >
                    {items.map((item, i) => (
                      <LineItem
                        key={i}
                        item={item}
                        sectionTitle={section.title}
                        optionIdx={ci}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Decision made section ── */}
      <div
        ref={decisionSectionRef}
        style={{
          width: sv(1440),
          margin: "0 auto",
          paddingTop: sv(80),
          paddingBottom: sv(110),
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{ gap: sv(2), marginBottom: sv(40) }}
        >
          <p
            style={{
              fontSize: sv(36),
              fontWeight: 600,
              color: "#262626",
              textAlign: "center",
              lineHeight: "normal",
            }}
          >
            Decision made?
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{
              height: sv(40),
              padding: `${sv(6)} ${sv(12)}`,
              backgroundColor: "white",
              borderRadius: sv(4),
              gap: sv(4),
              border: "none",
              cursor: "pointer",
            }}
          >
            {/* arrow-up icon */}
            <svg
              style={{ width: sv(24), height: sv(24) }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 19V5"
                stroke="#262626"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M5 12L12 5L19 12"
                stroke="#262626"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: sv(14),
                color: "rgba(0,0,0,0.85)",
                lineHeight: "normal",
                whiteSpace: "nowrap",
              }}
            >
              Back to Top
            </span>
          </button>
        </div>
        <div className="flex" style={{ gap: sv(32), padding: `0 ${sv(80)}` }}>
          {odaOptions.map((_, i) => (
            <OptionCard key={i} optIdx={i} />
          ))}
        </div>
      </div>

      {compareProductDetailModal && (
        <ProductDetailModal
          item={compareProductDetailModal.item}
          sectionName={compareProductDetailModal.sectionName}
          measurementLabel={compareProductDetailModal.measurementLabel}
          description={compareProductDetailModal.description}
          hidePrice={compareProductDetailModal.item.price === 0}
          hideSelectButton
          onSelect={() => undefined}
          onClose={() => setCompareProductDetailModal(null)}
        />
      )}
    </div>
  );
}

// ─── Info circle icon ─────────────────────────────────────────────────────────
function InfoIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      className="flex-shrink-0 opacity-40"
      style={{ width: sv(14), height: sv(14) }}
    >
      <circle cx="7" cy="7" r="6.5" stroke="#262626" strokeWidth="1" />
      <path
        d="M7 6.5v3.5"
        stroke="#262626"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="4.5" r="0.6" fill="#262626" />
    </svg>
  );
}

type SummaryLineItem = {
  name: string;
  qty: string;
  unit: string;
  price: number;
  thumbnailSrc?: string;
  showChange?: boolean;
  description?: string;
  odaItem?: ODAItem;
  sectionName?: string;
  sectionItems?: ODAItem[];
};

function SummaryGroup({
  name,
  items,
  layoutAlt,
  onInfoClick,
}: {
  name: string;
  items: SummaryLineItem[];
  layoutAlt?: boolean;
  onInfoClick?: (item: SummaryLineItem) => void;
}) {
  return (
    <div className="flex flex-col w-full">
      {/* Group header: h-[48px], semibold 16px + count badge */}
      <div className="flex items-center" style={{ gap: sv(4), height: sv(48) }}>
        <p
          className="font-semibold text-[#262626]"
          style={{ fontSize: sv(16) }}
        >
          {name}
        </p>
        <div
          className="bg-[#f0f0f0] flex items-center justify-center"
          style={{
            width: sv(20),
            height: sv(20),
            borderRadius: sv(4),
            marginLeft: sv(4),
          }}
        >
          <span
            className="text-[#262626]"
            style={{ fontSize: sv(10), fontWeight: 300 }}
          >
            {items.length}
          </span>
        </div>
      </div>
      {/* Line items */}
      <div className="flex flex-col w-full">
        {items.map((item, i) =>
          layoutAlt && item.showChange !== false ? (
            /* ── Alternative (large image) layout — only for product items with images ── */
            <div
              key={i}
              className="flex items-start w-full"
              style={{
                paddingTop: sv(12),
                paddingBottom: sv(12),
                borderTop: "0.5px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Image: 300×200, p-[2px], rounded-[4px] outer, rounded-[2px] inner */}
              <button
                type="button"
                className="flex-shrink-0 text-left"
                style={{
                  padding: sv(2),
                  borderRadius: sv(4),
                  cursor: item.odaItem ? "pointer" : "default",
                }}
                onClick={() => item.odaItem && onInfoClick?.(item)}
              >
                <div
                  className="relative overflow-hidden flex-shrink-0"
                  style={{
                    width: sv(300),
                    height: sv(200),
                    borderRadius: sv(2),
                    border: "0.5px solid #d9d9d9",
                  }}
                >
                  {item.thumbnailSrc ? (
                    <Image
                      src={item.thumbnailSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f0f0f0]" />
                  )}
                </div>
              </button>
              {/* Right content */}
              <div
                className="flex flex-1 flex-col min-w-0 self-stretch"
                style={{ gap: sv(24), paddingTop: sv(4), paddingBottom: sv(4) }}
              >
                {/* Top row: text info + actions */}
                <div className="flex items-start justify-end w-full">
                  {/* Text: name, qty, price */}
                  <div
                    className="flex flex-1 flex-col min-w-0"
                    style={{
                      gap: sv(8),
                      paddingLeft: sv(12),
                      paddingRight: sv(12),
                      fontSize: sv(14),
                    }}
                  >
                    <button
                      type="button"
                      className="w-fit max-w-full text-left"
                      style={{ cursor: item.odaItem ? "pointer" : "default" }}
                      onClick={() => item.odaItem && onInfoClick?.(item)}
                    >
                      <p className="text-[#262626] truncate min-w-0">
                        {item.name}
                      </p>
                    </button>
                    <div
                      className="flex items-center flex-shrink-0"
                      style={{
                        gap: sv(8),
                        width: sv(130),
                        fontWeight: 300,
                        color: "#737373",
                      }}
                    >
                      <p className="flex-shrink-0 whitespace-nowrap">
                        {item.qty}
                      </p>
                      <p className="flex-shrink-0" style={{ width: sv(32) }}>
                        {item.unit}
                      </p>
                    </div>
                    <div
                      className="flex items-center flex-shrink-0"
                      style={{
                        gap: sv(2),
                        width: sv(124),
                        fontWeight: 300,
                        color: "#262626",
                      }}
                    >
                      <p className="flex-shrink-0">$</p>
                      <p className="flex-1 min-w-0">
                        {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Actions: w-[112px] */}
                  <div
                    className="flex items-center justify-between flex-shrink-0"
                    style={{ width: sv(112) }}
                  >
                    <button
                      className="flex items-center justify-center hover:opacity-60 transition-opacity"
                      style={{
                        width: sv(24),
                        height: sv(24),
                        cursor: item.odaItem ? "pointer" : "default",
                      }}
                      onClick={() => item.odaItem && onInfoClick?.(item)}
                    >
                      <InfoIcon />
                    </button>
                    {item.showChange ? (
                      <button
                        type="button"
                        className="flex items-center hover:opacity-60 transition-opacity"
                        style={{
                          gap: sv(8),
                          height: sv(24),
                          cursor: item.odaItem ? "pointer" : "default",
                        }}
                        onClick={() => item.odaItem && onInfoClick?.(item)}
                      >
                        <span
                          className="font-semibold text-[#262626]"
                          style={{ fontSize: sv(14), letterSpacing: "-0.56px" }}
                        >
                          Change
                        </span>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="flex-shrink-0"
                          style={{ width: sv(16), height: sv(16) }}
                        >
                          <path
                            d="M6 4l4 4-4 4"
                            stroke="#262626"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : (
                      <div style={{ width: sv(78) }} />
                    )}
                  </div>
                </div>
                {/* Description row */}
                {item.description && (
                  <div className="px-[12px]">
                    <p className="text-[12px] text-[#737373] leading-normal">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Compact (small image) layout ── */
            <div
              key={i}
              className="flex items-start w-full"
              style={{
                gap: sv(12),
                paddingTop: sv(12),
                paddingBottom: sv(12),
                borderTop: "0.5px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Thumbnail: 48x48, rounded-[4px], p-[2px] */}
              <button
                type="button"
                className="flex-shrink-0 text-left"
                style={{
                  width: sv(48),
                  height: sv(48),
                  borderRadius: sv(4),
                  padding: sv(2),
                  cursor: item.odaItem ? "pointer" : "default",
                }}
                onClick={() => item.odaItem && onInfoClick?.(item)}
              >
                {item.thumbnailSrc ? (
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{ borderRadius: sv(2) }}
                  >
                    <Image
                      src={item.thumbnailSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full bg-[#f0f0f0]"
                    style={{ borderRadius: sv(2) }}
                  />
                )}
              </button>
              {/* Content */}
              <div className="flex flex-1 items-center min-w-0">
                {/* Name: flex-1 truncate, 14px regular */}
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  style={{ cursor: item.odaItem ? "pointer" : "default" }}
                  onClick={() => item.odaItem && onInfoClick?.(item)}
                >
                  <p
                    className="flex-1 text-[#262626] truncate min-w-0"
                    style={{ fontSize: sv(14) }}
                  >
                    {item.name}
                  </p>
                </button>
                {/* Qty + unit: w-[130px], gap-[16px], semilight 14px */}
                <div
                  className="flex items-center justify-end flex-shrink-0"
                  style={{ width: sv(130), gap: sv(16), fontWeight: 300 }}
                >
                  <p
                    className="flex-1 text-[#262626] text-right"
                    style={{ fontSize: sv(14) }}
                  >
                    {item.qty}
                  </p>
                  <p
                    className="text-[#262626] flex-shrink-0"
                    style={{ fontSize: sv(14), width: sv(32) }}
                  >
                    {item.unit}
                  </p>
                </div>
                {/* Spacer: w-[64px] */}
                <div
                  className="flex-shrink-0 bg-white"
                  style={{ width: sv(64), height: sv(19) }}
                />
                {/* Price: w-[124px], gap-[2px], semilight 14px */}
                <div
                  className="flex items-center flex-shrink-0"
                  style={{ width: sv(124), gap: sv(2), fontWeight: 300 }}
                >
                  <span
                    className="text-[#262626] flex-shrink-0"
                    style={{ fontSize: sv(14) }}
                  >
                    $
                  </span>
                  <span
                    className="flex-1 text-[#262626]"
                    style={{ fontSize: sv(14) }}
                  >
                    {item.price.toLocaleString()}
                  </span>
                </div>
                {/* Actions: w-[112px] */}
                <div
                  className="flex items-center justify-between flex-shrink-0"
                  style={{ width: sv(112) }}
                >
                  <button
                    className="flex items-center justify-center hover:opacity-60 transition-opacity"
                    style={{
                      width: sv(24),
                      height: sv(24),
                      cursor: item.odaItem ? "pointer" : "default",
                    }}
                    onClick={() => item.odaItem && onInfoClick?.(item)}
                  >
                    <InfoIcon />
                  </button>
                  {item.showChange !== false ? (
                    <button
                      type="button"
                      className="flex items-center hover:opacity-60 transition-opacity"
                      style={{
                        gap: sv(8),
                        height: sv(24),
                        cursor: item.odaItem ? "pointer" : "default",
                      }}
                      onClick={() => item.odaItem && onInfoClick?.(item)}
                    >
                      <span
                        className="font-semibold text-[#262626]"
                        style={{ fontSize: sv(14), letterSpacing: "-0.56px" }}
                      >
                        Change
                      </span>
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="flex-shrink-0"
                        style={{ width: sv(16), height: sv(16) }}
                      >
                        <path
                          d="M6 4l4 4-4 4"
                          stroke="#262626"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : (
                    <div style={{ width: sv(78) }} />
                  )}
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ─── Sign & Approve Modal ─────────────────────────────────────────────────────
function SignModal({
  onClose,
  onApprove,
}: {
  onClose: () => void;
  onApprove: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const { clientName } = odaProjectInfo;
  const contractPages = [
    "/pdf/1.png",
    "/pdf/2.png",
    "/pdf/3.png",
    "/pdf/4.png",
    "/pdf/5.png",
    "/pdf/6.png",
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        padding: `${sv(32)} ${sv(64)}`,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white flex w-full relative"
        style={{
          height: sv(963),
          maxHeight: "calc(100vh - 64px)",
          borderRadius: sv(24),
          gap: sv(40),
          padding: `${sv(40)} ${sv(48)}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center hover:bg-[#f0f0f0] transition-colors text-[#262626]"
          style={{
            top: sv(20),
            right: sv(20),
            width: sv(32),
            height: sv(32),
            borderRadius: "50%",
          }}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            style={{ width: sv(14), height: sv(14) }}
          >
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* ── Left: scrollable contract document ── */}
        <div className="flex-1 min-w-0 flex flex-col relative min-h-0">
          {/* Document scroll area */}
          <div className="flex-1 overflow-auto border border-[#d9d9d9] min-h-0">
            <div
              className="flex flex-col bg-[#f5f5f5]"
              style={{ width: `${zoom * 100}%`, minWidth: "100%", gap: sv(16) }}
            >
              {contractPages.map((pageSrc, index) => (
                <Image
                  key={pageSrc}
                  src={pageSrc}
                  alt={`Contract page ${index + 1}`}
                  width={2380}
                  height={3368}
                  className="w-full h-auto block bg-white"
                />
              ))}
            </div>
          </div>

          {/* Zoom controls — overlaid at bottom-left */}
          <div
            className="absolute bottom-0 left-0 flex"
            style={{ gap: sv(12), padding: `${sv(24)} ${sv(32)}` }}
          >
            {/* Zoom in */}
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
              className="flex items-center justify-center"
              style={{
                width: sv(48),
                height: sv(48),
                borderRadius: sv(4),
                backdropFilter: "blur(2px)",
                backgroundColor: "rgba(0,0,0,0.8)",
                boxShadow: "0 0 2px rgba(0,0,0,0.25)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: sv(20), height: sv(20) }}
              >
                <circle
                  cx="10.5"
                  cy="10.5"
                  r="6.5"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.5 10.5h6M10.5 7.5v6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 16l4 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* Zoom out */}
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="flex items-center justify-center"
              style={{
                width: sv(48),
                height: sv(48),
                borderRadius: sv(4),
                backdropFilter: "blur(2px)",
                backgroundColor: "rgba(0,0,0,0.8)",
                boxShadow: "0 0 2px rgba(0,0,0,0.25)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: sv(20), height: sv(20) }}
              >
                <circle
                  cx="10.5"
                  cy="10.5"
                  r="6.5"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.5 10.5h6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 16l4 4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* Fit / reset */}
            <button
              onClick={() => setZoom(1)}
              className="flex items-center justify-center"
              style={{
                width: sv(48),
                height: sv(48),
                borderRadius: sv(4),
                backdropFilter: "blur(2px)",
                backgroundColor: "rgba(0,0,0,0.8)",
                boxShadow: "0 0 2px rgba(0,0,0,0.25)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: sv(20), height: sv(20) }}
              >
                <path
                  d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Right: signing panel ── */}
        <div
          className="flex-shrink-0 flex flex-col"
          style={{ width: sv(274), gap: sv(24) }}
        >
          <p
            className="text-[#262626]"
            style={{
              fontSize: sv(16),
              letterSpacing: "-0.64px",
              lineHeight: "normal",
            }}
          >
            Sign Contract as {clientName}
          </p>
          <p
            className="text-[#262626] leading-[1.5]"
            style={{ fontSize: sv(12), fontWeight: 300 }}
          >
            Please review your final project selections and contract details
            before signing. By signing below, you confirm your acceptance of the
            scope, pricing, and terms outlined in this agreement.
          </p>
          <button
            className="w-full bg-black text-white font-semibold flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ height: sv(40), fontSize: sv(14), borderRadius: sv(2) }}
            onClick={() => {
              onClose();
              onApprove();
            }}
          >
            Sign & Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Detail Modal (Figma 330:3263) ─────────────────────────────────────
// Left gallery: 3 product photos of the CURRENTLY SELECTED variant (clicking thumb → main image)
// Right swatches: alternative material/variant options — clicking a swatch:
//   1. updates left gallery to that variant's photos
//   2. updates displayed price
//   3. changes button state (selected vs not selected)
function ProductDetailModal({
  item,
  sectionName,
  measurementLabel,
  description,
  onSelect,
  onClose,
  hidePrice = false,
  hideSelectButton = false,
}: {
  item: ODAItem;
  sectionName: string;
  measurementLabel?: string;
  description?: string;
  onSelect: (swatchIdx: number) => void;
  onClose: () => void;
  hidePrice?: boolean;
  hideSelectButton?: boolean;
}) {
  const swatches = item.swatches ?? item.addonSwatches ?? [];
  const initialSwatch = item.selectedSwatch ?? item.selectedAddonSwatch ?? 0;
  const [activeSwatchIdx, setActiveSwatchIdx] = useState(initialSwatch);
  const [activeThumb, setActiveThumb] = useState(0);
  const displayMeasurementLabel = measurementLabel ?? "1,240 SQF.";
  const displayDescription =
    description ??
    `A timeless ${sectionName.toLowerCase()} upgrade that brings warmth and character to your home.
                  The natural finish pairs with a considered layout to create a more elevated, custom-designed look.`;

  // Left gallery images: use per-swatch photos if available, else fall back to item's productImages
  const getImagesForSwatch = (idx: number): string[] => {
    if (item.swatchProductImages?.[idx]?.length)
      return item.swatchProductImages[idx];
    if (item.productImages?.length) return item.productImages;
    if (item.previewImage) return [item.previewImage];
    return [THUMB_BASE_SCOPE];
  };
  const currentImages = getImagesForSwatch(activeSwatchIdx);
  const mainImage = currentImages[activeThumb] ?? currentImages[0];

  // Price for the currently displayed swatch variant
  const swatchPrices = item.swatchPrices ?? item.addonSwatchPrices;
  const displayPrice = swatchPrices?.[activeSwatchIdx] ?? getItemPrice(item);

  // Button state: is the currently shown swatch the one already saved as selected?
  const isCurrentlySelected = activeSwatchIdx === initialSwatch;

  const handleSwatchClick = (idx: number) => {
    setActiveSwatchIdx(idx);
    setActiveThumb(0); // reset to first photo of the new variant
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col justify-end"
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingTop: sv(113),
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full flex flex-col"
        style={{
          height: sv(767),
          borderRadius: `${sv(16)} ${sv(16)} 0 0`,
          boxShadow:
            "0px 2px 4px rgba(0,0,0,0.12), 0px 4px 24px rgba(0,0,0,0.20)",
          gap: sv(16),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row: close button pinned right — padding 16px top, 16px horizontal */}
        <div
          className="flex justify-end flex-shrink-0"
          style={{ padding: `${sv(16)} ${sv(16)} 0` }}
        >
          <button
            onClick={onClose}
            className="flex items-center justify-center bg-[#F0F0F0] hover:bg-[#e0e0e0] transition-colors"
            style={{ width: sv(24), height: sv(24), borderRadius: sv(4) }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              style={{ width: sv(16), height: sv(16) }}
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="#262626"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body: flex row, gap 40px, padding 0 64px */}
        <div
          className="flex flex-1 min-h-0"
          style={{ gap: sv(40), padding: `0 ${sv(64)} ${sv(24)}` }}
        >
          {/* Left column: 840px wide, flex col, justify-between */}
          <div
            className="flex flex-col justify-between flex-shrink-0"
            style={{ width: sv(840), paddingBottom: sv(24) }}
          >
            {/* Hero image: aspect 732:510, border-radius 8px */}
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "732/510", borderRadius: sv(8) }}
            >
              <Image
                src={mainImage}
                alt=""
                fill
                className="object-cover"
                sizes="840px"
              />
            </div>

            {/* Thumbnail strip: 3 photos of the current product — gap 8px, 86×64 each */}
            <div className="flex" style={{ gap: sv(8) }}>
              {currentImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className="flex-shrink-0"
                  style={{
                    width: sv(86),
                    height: sv(64),
                    borderRadius: sv(4),
                    padding: sv(2),
                    border:
                      i === activeThumb
                        ? "1.5px solid #000000"
                        : "1.5px solid transparent",
                  }}
                >
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{ borderRadius: sv(2) }}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="86px"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right column — matches Figma 330:3285: flex-[1_0_0] h-full items-start gap-24px */}
          <div
            className="flex flex-col items-start overflow-y-auto"
            style={{
              flex: "1 0 0",
              height: "100%",
              gap: sv(24),
              fontFamily: "'Segoe UI', sans-serif",
              minWidth: 0,
            }}
          >
            {/* Top info block: shrink-0, gap 32px, items-start, w-full — Figma 330:3589 */}
            <div
              className="flex flex-col items-start w-full flex-shrink-0"
              style={{ gap: sv(32) }}
            >
              {/* Header block: gap 12px, items-start, shrink-0 — Figma 330:3577 */}
              <div
                className="flex flex-col items-start w-full flex-shrink-0"
                style={{ gap: sv(12) }}
              >
                {/* Labels: gap 4px, leading-normal, not-italic — Figma 330:3613 */}
                <div
                  className="flex flex-col items-start w-full"
                  style={{
                    gap: sv(4),
                    lineHeight: "normal",
                    fontStyle: "normal",
                  }}
                >
                  <p
                    style={{
                      fontSize: sv(16),
                      fontWeight: 600,
                      color: "#262626",
                      width: "100%",
                    }}
                  >
                    {sectionName}
                  </p>
                  <p
                    style={{
                      fontSize: sv(16),
                      fontWeight: 400,
                      color: "#737373",
                      letterSpacing: "-0.64px",
                      width: "100%",
                    }}
                  >
                    {displayMeasurementLabel}
                  </p>
                </div>

                {/* Alternative product swatches — gap 10px, items-center, shrink-0 — Figma 330:3605 */}
                {swatches.length > 0 && (
                  <div
                    className="flex items-center flex-shrink-0"
                    style={{ gap: sv(10) }}
                  >
                    {swatches.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => handleSwatchClick(i)}
                        className="flex-shrink-0"
                        style={{
                          width: sv(64),
                          height: sv(64),
                          borderRadius: sv(4),
                          border:
                            i === activeSwatchIdx
                              ? "1.5px solid #000000"
                              : "1.5px solid transparent",
                          padding: sv(2),
                          outline: "none",
                        }}
                      >
                        <div
                          className="relative w-full h-full overflow-hidden"
                          style={{ borderRadius: sv(2) }}
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product title + description: gap 16px, items-start, shrink-0 — Figma 330:3614 */}
              <div
                className="flex flex-col items-start w-full flex-shrink-0"
                style={{
                  gap: sv(16),
                  lineHeight: "normal",
                  fontStyle: "normal",
                }}
              >
                <p
                  style={{
                    fontSize: sv(20),
                    fontWeight: 600,
                    color: "#262626",
                    letterSpacing: "-0.8px",
                    width: "100%",
                  }}
                >
                  {item.spec}
                </p>
                <p
                  style={{
                    fontSize: sv(12),
                    fontWeight: 300,
                    color: "#262626",
                    width: "100%",
                  }}
                >
                  {displayDescription}
                </p>
              </div>

              {/* Price — updates per swatch — Figma 330:3592 */}
              {!hidePrice && (
                <div className="flex flex-col items-start w-full flex-shrink-0">
                  <p
                    style={{
                      fontSize: sv(24),
                      fontWeight: 300,
                      color: "#262626",
                      lineHeight: "normal",
                      fontStyle: "normal",
                      width: "100%",
                    }}
                  >
                    {formatPrice(displayPrice)}
                  </p>
                </div>
              )}
            </div>

            {/* CTA button — Figma 330:3583: shrink-0, auto-width (parent has items-start) */}
            {/* selected → gray bg #737373 text #333; unselected → dark bg #262626 text #fff */}
            {!hideSelectButton && (
              <button
                className="flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  height: sv(44),
                  padding: `${sv(6)} ${sv(16)}`,
                  borderRadius: sv(4),
                  backgroundColor: isCurrentlySelected ? "#737373" : "#262626",
                  color: isCurrentlySelected ? "#333333" : "#ffffff",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 600,
                  fontSize: sv(14),
                  lineHeight: "18px",
                  whiteSpace: "nowrap",
                  cursor: isCurrentlySelected ? "default" : "pointer",
                }}
                onClick={() => {
                  if (!isCurrentlySelected) onSelect(activeSwatchIdx);
                }}
              >
                {isCurrentlySelected ? "Product Selected" : "Select Product"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Option Detail ──────────────────────────────────────────────────
function DetailScreen({
  option,
  onBack,
  onApprove,
  onHome,
}: {
  option: ODAOption;
  onBack: () => void;
  onApprove: () => void;
  onHome: () => void;
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const [sections, setSections] = useState(
    option.sections.map((s) => ({
      ...s,
      collapsed: false,
      items: s.items.map((item) => ({ ...item })),
    })),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSignModal, setShowSignModal] = useState(false);
  const [drawingZoom, setDrawingZoom] = useState(1);
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState(1);
  const [productLayoutAlt, setProductLayoutAlt] = useState(false);
  const [hideTopSummaryActions, setHideTopSummaryActions] = useState(false);
  const [productDetailModal, setProductDetailModal] = useState<{
    item: ODAItem;
    sectionName: string;
    onSelect: (swatchIdx: number) => void;
  } | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTopSummaryActions = () => {
      if (!summaryRef.current) return;
      const scaledStickyTop =
        (182 / 1440) * Math.min(Math.max(window.innerWidth, 1280), 2560);
      setHideTopSummaryActions(
        summaryRef.current.getBoundingClientRect().top <= scaledStickyTop,
      );
    };

    updateTopSummaryActions();
    window.addEventListener("scroll", updateTopSummaryActions, {
      passive: true,
    });
    window.addEventListener("resize", updateTopSummaryActions);

    return () => {
      window.removeEventListener("scroll", updateTopSummaryActions);
      window.removeEventListener("resize", updateTopSummaryActions);
    };
  }, []);

  const openProductDetail = (item: ODAItem, sectionIdx: number) => {
    setProductDetailModal({
      item,
      sectionName: item.name,
      onSelect: (swatchIdx: number) => {
        if (item.isAddon) {
          selectAddonSwatch(sectionIdx, item.id, swatchIdx);
        } else {
          selectSwatch(sectionIdx, item.id, swatchIdx);
        }
        setProductDetailModal(null);
      },
    });
  };

  const toggleSection = (sectionIdx: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx ? { ...s, collapsed: !s.collapsed } : s,
      ),
    );
  };

  const toggleAddon = (sectionIdx: number, itemId: string) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx
          ? {
              ...s,
              items: s.items.map((item) =>
                item.id === itemId
                  ? { ...item, selected: !item.selected }
                  : item,
              ),
            }
          : s,
      ),
    );
  };

  const selectSwatch = (
    sectionIdx: number,
    itemId: string,
    swatchIdx: number,
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx
          ? {
              ...s,
              items: s.items.map((item) =>
                item.id === itemId
                  ? { ...item, selectedSwatch: swatchIdx }
                  : item,
              ),
            }
          : s,
      ),
    );
  };

  const selectAddonSwatch = (
    sectionIdx: number,
    itemId: string,
    swatchIdx: number,
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx
          ? {
              ...s,
              items: s.items.map((item) =>
                item.id === itemId
                  ? { ...item, selectedAddonSwatch: swatchIdx }
                  : item,
              ),
            }
          : s,
      ),
    );
  };

  const allItems = sections.flatMap((s) => s.items);
  const materialDelta = allItems
    .filter((i) => !i.isAddon && i.swatchPrices)
    .reduce((sum, i) => {
      const current = i.swatchPrices![i.selectedSwatch ?? 0];
      const base = i.swatchPrices![0];
      return sum + (current - base);
    }, 0);
  const addonTotal = allItems
    .filter((i) => i.isAddon && i.selected)
    .reduce((sum, i) => sum + getItemPrice(i), 0);
  const total = option.priceFrom + materialDelta + addonTotal;
  const monthlyPayment = Math.round(
    total * (option.monthlyPayment / option.priceFrom),
  );

  const filteredSections = sections
    .map((s) => ({
      ...s,
      items: s.items.filter(
        (item) =>
          searchQuery === "" ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.spec.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Sticky header wrapper */}
      <div className="sticky top-0 z-50 bg-white">
        <div style={{ width: sv(1440), margin: "0 auto" }}>
          {/* Nav Row 1: home | logo | user */}
          <nav
            className="flex items-center justify-between"
            style={{ padding: `${sv(31)} ${sv(217)} 0` }}
          >
            <button
              onClick={onHome}
              className="flex items-center justify-center text-[#262626] hover:opacity-60"
              style={{ width: sv(24), height: sv(24) }}
            >
              <svg
                viewBox="0 0 18 16"
                fill="none"
                style={{ width: sv(18), height: sv(16) }}
              >
                <path
                  d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <ODALogo size="sm" />
            <button
              className="flex items-center justify-center text-[#262626] hover:opacity-60"
              style={{ width: sv(24), height: sv(24) }}
            >
              <svg
                viewBox="0 0 17 17"
                fill="none"
                style={{ width: sv(17), height: sv(17) }}
              >
                <circle
                  cx="8.5"
                  cy="5.5"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </nav>

          {/* Nav Row 2: actions | pricing | buttons */}
          <div
            className="flex items-center justify-between border-b"
            style={{
              paddingTop: sv(16),
              paddingBottom: sv(16),
              paddingLeft: sv(32),
              paddingRight: sv(32),
              borderBottomWidth: "0.5px",
              borderColor: "rgba(0,0,0,0.2)",
            }}
          >
            {/* Left: Change Option + Contact Sales */}
            <div className="flex items-center" style={{ gap: sv(32) }}>
              <button
                onClick={onBack}
                className="flex items-center text-[#262626] hover:opacity-60 transition-opacity"
                style={{
                  gap: sv(4),
                  height: sv(32),
                  paddingLeft: sv(4),
                  paddingRight: sv(4),
                  borderRadius: sv(4),
                  fontSize: sv(14),
                }}
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ width: sv(14), height: sv(14) }}
                >
                  <path
                    d="M13 7H1M6 2L1 7L6 12"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Change Option
              </button>
              <button
                className="flex items-center text-[#262626] hover:opacity-60 transition-opacity"
                style={{
                  gap: sv(6),
                  height: sv(32),
                  paddingLeft: sv(4),
                  paddingRight: sv(4),
                  borderRadius: sv(4),
                  fontSize: sv(14),
                }}
              >
                {/* Phone icon */}
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ width: sv(16), height: sv(16) }}
                >
                  <path
                    d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                </svg>
                Contact Sales
              </button>
            </div>

            {/* Right: pricing block + action buttons */}
            {!hideTopSummaryActions && (
              <div className="flex items-center" style={{ gap: sv(16) }}>
                {/* Pricing: monthly | separator | total */}
                <div className="flex items-stretch" style={{ height: sv(40) }}>
                  {/* Monthly payment */}
                  <div
                    className="flex flex-col justify-between"
                    style={{ paddingLeft: sv(8), paddingRight: sv(12) }}
                  >
                    <div className="flex items-center" style={{ gap: sv(6) }}>
                      {/* Calculator icon */}
                      <svg
                        viewBox="0 0 11 14"
                        fill="none"
                        className="flex-shrink-0"
                        style={{ width: sv(11), height: sv(14) }}
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="10"
                          height="13"
                          rx="1"
                          stroke="#262626"
                          strokeWidth="1"
                        />
                        <path
                          d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2"
                          stroke="#262626"
                          strokeWidth="0.9"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        className="text-[#262626] leading-none"
                        style={{ fontSize: sv(18) }}
                      >
                        {formatPrice(monthlyPayment)} /mo
                      </span>
                    </div>
                    <span
                      className="text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontSize: sv(10), maxWidth: sv(200) }}
                    >
                      Monthly payment via financing service provider
                    </span>
                  </div>
                  {/* Vertical separator */}
                  <div
                    className="flex-shrink-0 bg-[rgba(0,0,0,0.2)] self-stretch"
                    style={{ width: "0.5px" }}
                  />
                  {/* Total */}
                  <div
                    className="flex flex-col justify-between"
                    style={{
                      paddingLeft: sv(12),
                      paddingRight: sv(8),
                      width: sv(150),
                    }}
                  >
                    <span
                      className="text-[#262626] leading-none"
                      style={{ fontSize: sv(18) }}
                    >
                      {formatPrice(total)}.00
                    </span>
                    <span
                      className="text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontSize: sv(10) }}
                    >
                      Tax &amp; fees included
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center" style={{ gap: sv(8) }}>
                  <button
                    className="border border-[#262626] bg-white text-[#262626] hover:bg-[#262626] hover:text-white transition-colors flex-shrink-0"
                    style={{
                      width: sv(108),
                      height: sv(40),
                      fontSize: sv(14),
                      borderRadius: sv(4),
                    }}
                    onClick={() => {
                      if (summaryRef.current) {
                        const top =
                          summaryRef.current.getBoundingClientRect().top +
                          window.scrollY -
                          158;
                        window.scrollTo({ top, behavior: "smooth" });
                      }
                    }}
                  >
                    Summary
                  </button>
                  <button
                    className="bg-[#262626] text-white font-semibold hover:bg-black transition-colors flex-shrink-0"
                    style={{
                      height: sv(40),
                      fontSize: sv(14),
                      borderRadius: sv(4),
                      paddingLeft: sv(16),
                      paddingRight: sv(16),
                    }}
                    onClick={() => setShowSignModal(true)}
                  >
                    Sign &amp; Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* end max-width inner */}
      </div>
      {/* end sticky header */}

      {/* Main content: 842px gallery + 505px config */}
      <div
        className="flex items-start"
        style={{
          width: sv(1440),
          margin: "0 auto",
          paddingLeft: sv(32),
          paddingRight: sv(32),
          paddingTop: sv(30),
          gap: sv(32),
        }}
      >
        {/* Left: Image Gallery (fills remaining width) */}
        <div
          className="flex-1 min-w-0 flex flex-col"
          style={{ position: "sticky", alignSelf: "flex-start", top: sv(156), gap: sv(10) }}
        >
          {/* Main image with expand button */}
          <div
            className="relative overflow-hidden bg-[#F0F0F0]"
            style={{ aspectRatio: "864/633", borderRadius: sv(8) }}
          >
            <Image
              src={option.images[currentImage]}
              alt="Room view"
              fill
              className="object-cover object-top"
              sizes="(max-width:1500px) calc(100vw - 569px), 900px"
              priority
            />
            {/* Expand icon: bottom-right, 32×32 */}
            <button
              className="absolute bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
              style={{
                bottom: sv(12),
                right: sv(12),
                width: sv(32),
                height: sv(32),
                borderRadius: sv(4),
              }}
            >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                style={{ width: sv(14), height: sv(14) }}
              >
                <path
                  d="M9.5 1H13V4.5M4.5 13H1V9.5M13 9.5V13H9.5M1 4.5V1H4.5"
                  stroke="#262626"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Thumbnails: 86×64, 1.5px border on selected */}
          <div className="flex items-center" style={{ gap: sv(8) }}>
            {option.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className="relative flex-shrink-0 overflow-hidden"
                style={{
                  width: sv(86),
                  height: sv(64),
                  padding: sv(2),
                  borderRadius: sv(4),
                  border:
                    i === currentImage
                      ? "1.5px solid #262626"
                      : "1.5px solid transparent",
                }}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  style={{ borderRadius: sv(2) }}
                  sizes="86px"
                />
              </button>
            ))}
          </div>

          {/* Caption: image-specific */}
          <p className="text-[#262626]" style={{ fontSize: sv(14) }}>
            {option.sections[0]?.name ?? "Interior"} Preview {currentImage + 1}
          </p>
        </div>

        {/* Right: Configuration panel (505px fixed, scrolls with page) */}
        <div
          className="flex-shrink-0 flex flex-col"
          style={{
            width: sv(505),
            gap: sv(23),
            paddingBottom: sv(40),
            paddingLeft: sv(8),
            paddingRight: sv(8),
          }}
        >
          {/* Option title + project label */}
          <div className="flex flex-col text-[#262626]">
            <p
              className="font-semibold leading-snug"
              style={{ fontSize: sv(20) }}
            >
              {option.title}
            </p>
            <p style={{ fontSize: sv(14) }}>{odaProjectInfo.projectLabel}</p>
          </div>

          {/* Search bar: 0.5px border, rounded-[2px] */}
          <div
            className="flex items-center"
            style={{
              gap: sv(4),
              padding: `${sv(8)} ${sv(12)}`,
              borderRadius: sv(2),
              border: "0.5px solid black",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="flex-shrink-0 text-[#737373]"
              style={{ width: sv(16), height: sv(16) }}
            >
              <circle
                cx="7"
                cy="7"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search Configuration / Upgrade / Add-ons"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-[#737373] placeholder-[#737373] outline-none bg-transparent"
              style={{ fontSize: sv(12) }}
            />
          </div>

          {/* Section cards */}
          <div className="flex flex-col" style={{ gap: sv(24) }}>
            {filteredSections.map((section, sectionIdx) => (
              <div
                key={section.name}
                className="bg-white flex flex-col"
                style={{
                  borderRadius: sv(12),
                  paddingTop: sv(16),
                  paddingLeft: sv(12),
                  paddingRight: sv(12),
                  paddingBottom: sv(24),
                  gap: sv(24),
                  boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
                }}
              >
                {/* Section header: title (semibold 16px) + collapse toggle */}
                <div className="flex items-center justify-between">
                  <p
                    className="font-semibold text-[#262626]"
                    style={{ fontSize: sv(16) }}
                  >
                    {section.name}
                  </p>
                  <button
                    onClick={() => toggleSection(sectionIdx)}
                    className="flex items-center justify-center hover:opacity-50 transition-opacity"
                    style={{ width: sv(16), height: sv(16) }}
                  >
                    {section.collapsed ? (
                      /* Plus = collapsed */
                      <svg
                        viewBox="0 0 13 13"
                        fill="none"
                        style={{ width: sv(13), height: sv(13) }}
                      >
                        <path
                          d="M6.5 1v11M1 6.5h11"
                          stroke="black"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      /* Minus line = expanded */
                      <div
                        className="bg-black"
                        style={{ width: sv(13), height: "0.5px" }}
                      />
                    )}
                  </button>
                </div>

                {/* Items — hidden when collapsed */}
                {!section.collapsed &&
                  section.items.map((item) => (
                    <div key={item.id}>
                      {item.isAddon ? (
                        /* ── Add-on: bordered sub-card ── */
                        <div
                          className="bg-white flex flex-col cursor-pointer"
                          style={{
                            borderRadius: sv(8),
                            border: `1px solid ${item.selected ? "#262626" : "#BFBFBF"}`,
                            padding: `${sv(8)} ${sv(8)} ${sv(12)} ${sv(16)}`,
                          }}
                          onClick={() => toggleAddon(sectionIdx, item.id)}
                        >
                          {/* Info row: 64px min height, pr-4 to clear checkbox */}
                          <div
                            className="flex items-center"
                            style={{
                              paddingRight: sv(16),
                              gap: sv(12),
                              minHeight: sv(64),
                            }}
                          >
                            <div
                              className="flex-1 min-w-0 flex flex-col justify-center"
                              style={{ gap: sv(2) }}
                            >
                              <button
                                type="button"
                                className="w-fit max-w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProductDetail(item, sectionIdx);
                                }}
                              >
                                <p
                                  className="font-semibold text-[#262626] truncate"
                                  style={{ fontSize: sv(14) }}
                                >
                                  {item.name}
                                </p>
                              </button>
                              <div
                                className="flex items-center"
                                style={{ gap: sv(8) }}
                              >
                                <p
                                  className="text-[#262626] truncate"
                                  style={{ fontSize: sv(14) }}
                                >
                                  {item.spec}
                                </p>
                                <button
                                  className="flex-shrink-0 hover:opacity-60 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openProductDetail(item, sectionIdx);
                                  }}
                                >
                                  <InfoIcon />
                                </button>
                              </div>
                              <p
                                className="font-semibold text-[#737373]"
                                style={{ fontSize: sv(14) }}
                              >
                                {formatPrice(getItemPrice(item))}
                              </p>
                            </div>
                            {/* 24px checkbox, rounded-[2px], border-black when unchecked */}
                            <div
                              className={`flex-shrink-0 flex items-center justify-center transition-colors ${item.selected ? "bg-[#262626]" : "border border-black"}`}
                              style={{
                                width: sv(24),
                                height: sv(24),
                                borderRadius: sv(2),
                              }}
                            >
                              {item.selected && (
                                <svg
                                  viewBox="0 0 10 8"
                                  fill="none"
                                  style={{ width: sv(10), height: sv(8) }}
                                >
                                  <path
                                    d="M1 4L3.5 6.5L9 1"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>

                          {/* Below: swatches row OR single 64×64 preview */}
                          {item.addonSwatches &&
                          item.addonSwatches.length > 0 ? (
                            <div
                              className="flex"
                              style={{ gap: sv(10), marginTop: sv(4) }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.addonSwatches.map((sw, swIdx) => (
                                <button
                                  key={swIdx}
                                  onClick={() =>
                                    selectAddonSwatch(
                                      sectionIdx,
                                      item.id,
                                      swIdx,
                                    )
                                  }
                                  className="relative overflow-hidden flex-shrink-0"
                                  style={{
                                    width: sv(64),
                                    height: sv(64),
                                    padding: sv(2),
                                    borderRadius: sv(4),
                                    border:
                                      item.selectedAddonSwatch === swIdx
                                        ? "1.5px solid black"
                                        : "1.5px solid transparent",
                                  }}
                                >
                                  <Image
                                    src={sw}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    style={{ borderRadius: sv(2) }}
                                    sizes="64px"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : item.previewImage ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductDetail(item, sectionIdx);
                              }}
                              className="relative overflow-hidden"
                              style={{
                                marginTop: sv(4),
                                padding: sv(2),
                                borderRadius: sv(4),
                                width: sv(64),
                                height: sv(64),
                              }}
                            >
                              <Image
                                src={item.previewImage!}
                                alt=""
                                fill
                                className="object-cover"
                                style={{ borderRadius: sv(2) }}
                                sizes="64px"
                              />
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        /* ── Standard item: pl-16 pr-8 within card ── */
                        <div
                          className="flex flex-col"
                          style={{ paddingLeft: sv(16), paddingRight: sv(8) }}
                        >
                          {/* 64px text block: name / spec+info / price */}
                          <div
                            className="flex flex-col justify-between"
                            style={{
                              minHeight: sv(64),
                              paddingTop: sv(4),
                              paddingBottom: sv(4),
                            }}
                          >
                            <div className="flex items-center">
                              <button
                                type="button"
                                className="text-left"
                                onClick={() =>
                                  openProductDetail(item, sectionIdx)
                                }
                              >
                                <p
                                  className="font-semibold text-[#262626]"
                                  style={{ fontSize: sv(14) }}
                                >
                                  {item.name}
                                </p>
                              </button>
                            </div>
                            <div
                              className="flex items-center"
                              style={{ gap: sv(8) }}
                            >
                              <p
                                className="text-[#262626] truncate"
                                style={{ fontSize: sv(14) }}
                              >
                                {item.spec}
                              </p>
                              <button
                                className="flex-shrink-0 hover:opacity-60 transition-opacity"
                                onClick={() => {
                                  openProductDetail(item, sectionIdx);
                                }}
                              >
                                <InfoIcon />
                              </button>
                            </div>
                            <p
                              className="font-semibold text-[#737373]"
                              style={{ fontSize: sv(14) }}
                            >
                              $ {getItemPrice(item).toLocaleString()}
                            </p>
                          </div>
                          {/* Photo swatches: 64×64, gap-[10px] */}
                          {item.swatches && item.swatches.length > 0 && (
                            <div
                              className="flex items-center"
                              style={{ gap: sv(10) }}
                            >
                              {item.swatches.map((sw, swIdx) => (
                                <button
                                  key={swIdx}
                                  onClick={() =>
                                    selectSwatch(sectionIdx, item.id, swIdx)
                                  }
                                  className="relative overflow-hidden flex-shrink-0"
                                  style={{
                                    width: sv(64),
                                    height: sv(64),
                                    padding: sv(2),
                                    borderRadius: sv(4),
                                    border:
                                      item.selectedSwatch === swIdx
                                        ? "1.5px solid black"
                                        : "1.5px solid transparent",
                                  }}
                                >
                                  <Image
                                    src={sw}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    style={{ borderRadius: sv(2) }}
                                    sizes="64px"
                                  />
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
          <div
            className="flex flex-col items-center"
            style={{ paddingTop: sv(40) }}
          >
            <button
              onClick={() => {
                if (summaryRef.current) {
                  const top =
                    summaryRef.current.getBoundingClientRect().top +
                    window.scrollY -
                    158;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
              className="flex items-center justify-center border border-[#262626] bg-white text-[#262626] hover:bg-[#262626] hover:text-white transition-colors"
              style={{
                width: sv(136),
                height: sv(40),
                fontSize: sv(16),
                borderRadius: sv(4),
                gap: sv(2),
              }}
            >
              {/* Chevron-down icon on the LEFT */}
              <svg
                viewBox="0 0 18 18"
                fill="none"
                className="flex-shrink-0"
                style={{ width: sv(18), height: sv(18) }}
              >
                <path
                  d="M4 7L9 12L14 7"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Summary
            </button>
          </div>
        </div>
      </div>

      {/* ─── Summary Section ──────────────────────────────────────────────────── */}
      <div ref={summaryRef} style={{ marginTop: sv(80) }}>
        <div
          style={{
            width: sv(1440),
            margin: "0 auto",
            paddingLeft: sv(32),
            paddingRight: sv(32),
            paddingTop: sv(48),
            paddingBottom: sv(64),
          }}
        >
          <div
            className="flex items-start justify-between"
            style={{ gap: sv(32) }}
          >
            {/* ── Left column: drawings card + items card + reviews card ── */}
            <div
              className="flex flex-col flex-shrink-0"
              style={{ width: sv(840), gap: sv(27) }}
            >
              {/* Drawings */}
              <div
                className="bg-white flex flex-col"
                style={{
                  borderRadius: sv(12),
                  paddingLeft: sv(24),
                  paddingRight: sv(24),
                  paddingTop: sv(16),
                  paddingBottom: sv(24),
                  gap: sv(24),
                  boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center"
                  style={{ paddingTop: sv(16) }}
                >
                  <p
                    className="font-semibold text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontSize: sv(14) }}
                  >
                    Drawings
                  </p>
                </div>

                {/* Content area: 792 × 539, image viewport + zoom controls */}
                <div
                  className="relative"
                  style={{ width: sv(792), height: sv(539) }}
                >
                  {/* Image viewport: fixed size, clips overflow */}
                  <div
                    className="overflow-hidden relative"
                    style={{ width: sv(792), height: sv(492) }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: `scale(${drawingZoom})`,
                        transformOrigin: "center center",
                        transition: "transform 0.15s ease",
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

                  {/* View Controls: absolute bottom-left */}
                  <div
                    className="absolute bottom-0 left-0 flex items-center"
                    style={{ gap: sv(12), padding: `${sv(24)} ${sv(32)}` }}
                  >
                    {/* Zoom In */}
                    <button
                      onClick={() =>
                        setDrawingZoom((z) => Math.min(z + 0.25, 3))
                      }
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: sv(48),
                        height: sv(48),
                        borderRadius: sv(4),
                        backdropFilter: "blur(2px)",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ width: sv(24), height: sv(24) }}
                      >
                        <circle
                          cx="10.5"
                          cy="10.5"
                          r="6.5"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7.5 10.5h6M10.5 7.5v6"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16 16l4 4"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    {/* Zoom Out */}
                    <button
                      onClick={() =>
                        setDrawingZoom((z) => Math.max(z - 0.25, 0.5))
                      }
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: sv(48),
                        height: sv(48),
                        borderRadius: sv(4),
                        backdropFilter: "blur(2px)",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ width: sv(24), height: sv(24) }}
                      >
                        <circle
                          cx="10.5"
                          cy="10.5"
                          r="6.5"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7.5 10.5h6"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16 16l4 4"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    {/* Expand / Open Modal */}
                    <button
                      onClick={() => {
                        setModalZoom(1);
                        setDrawingModalOpen(true);
                      }}
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: sv(48),
                        height: sv(48),
                        borderRadius: sv(4),
                        backdropFilter: "blur(2px)",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ width: sv(24), height: sv(24) }}
                      >
                        <path
                          d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* All Included/Selected Products */}
              <div
                className="bg-white flex flex-col"
                style={{
                  borderRadius: sv(12),
                  paddingLeft: sv(24),
                  paddingRight: sv(24),
                  paddingTop: sv(16),
                  paddingBottom: sv(24),
                  gap: sv(24),
                  boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between"
                  style={{ paddingTop: sv(16) }}
                >
                  <p
                    className="font-semibold text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontSize: sv(14) }}
                  >
                    All Included/Selected Products
                  </p>
                  {/* Swap Layout toggle */}
                  <button
                    onClick={() => setProductLayoutAlt((v) => !v)}
                    className="flex items-center flex-shrink-0 hover:bg-[#f5f5f5] transition-colors"
                    style={{
                      height: sv(32),
                      padding: `${sv(6)} ${sv(4)}`,
                      borderRadius: sv(4),
                      gap: sv(4),
                    }}
                  >
                    <div
                      className="flex items-center justify-center overflow-clip flex-shrink-0"
                      style={{
                        width: sv(24),
                        height: sv(24),
                        borderRadius: sv(2),
                        padding: sv(1),
                      }}
                    >
                      {/* Layout icon: compact ↔ large */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          productLayoutAlt
                            ? "/assets/icon-layout-large.svg"
                            : "/assets/icon-layout-compact.svg"
                        }
                        alt=""
                        style={{
                          width: sv(15),
                          height: sv(14),
                          display: "block",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    <span
                      className="text-[#262626]"
                      style={{ fontSize: sv(14), lineHeight: "18px" }}
                    >
                      Swap Layout
                    </span>
                  </button>
                </div>

                {/* Base Scope */}
                <SummaryGroup
                  name="Base Scope"
                  layoutAlt={productLayoutAlt}
                  items={[
                    {
                      name: "Existing Surface Preparation & Demolition",
                      qty: "960",
                      unit: "sqf.",
                      price: 42900,
                      showChange: false,
                      thumbnailSrc: THUMB_BASE_SCOPE,
                    },
                    {
                      name: "Wall & Ceiling Preparation",
                      qty: "190",
                      unit: "sqf.",
                      price: 24100,
                      showChange: false,
                      thumbnailSrc: THUMB_BASE_SCOPE,
                    },
                    {
                      name: "Flooring Base Installation",
                      qty: "547",
                      unit: "sqf.",
                      price: 4600,
                      showChange: false,
                      thumbnailSrc: THUMB_BASE_SCOPE,
                    },
                    {
                      name: "Lighting & Electrical Adjustments",
                      qty: "128",
                      unit: "hrs.",
                      price: 7270,
                      showChange: false,
                      thumbnailSrc: THUMB_BASE_SCOPE,
                    },
                    {
                      name: "Installation & Finishing Labor",
                      qty: "1,300",
                      unit: "hrs.",
                      price: 87580,
                      showChange: false,
                      thumbnailSrc: THUMB_BASE_SCOPE,
                    },
                  ]}
                />

                {/* Dynamic sections: standard items always shown, add-ons only if selected */}
                {sections.map((section, sectionIdx) => {
                  const lineItems: SummaryLineItem[] = section.items
                    .filter((item) => !item.isAddon || item.selected)
                    .map((item) => ({
                      name: item.spec,
                      qty: "1",
                      unit: "each",
                      price: getItemPrice(item),
                      thumbnailSrc: item.isAddon
                        ? (item.addonSwatches?.[
                            item.selectedAddonSwatch ?? 0
                          ] ?? item.previewImage)
                        : item.swatches?.[item.selectedSwatch ?? 0],
                      showChange: true,
                      odaItem: item,
                    }));
                  if (lineItems.length === 0) return null;
                  return (
                    <SummaryGroup
                      key={section.name}
                      name={section.name}
                      items={lineItems}
                      layoutAlt={productLayoutAlt}
                      onInfoClick={(lineItem) => {
                        if (!lineItem.odaItem) return;
                        const theItem = lineItem.odaItem;
                        setProductDetailModal({
                          item: theItem,
                          sectionName: theItem.name,
                          onSelect: (swatchIdx: number) => {
                            if (theItem.isAddon) {
                              selectAddonSwatch(
                                sectionIdx,
                                theItem.id,
                                swatchIdx,
                              );
                            } else {
                              selectSwatch(sectionIdx, theItem.id, swatchIdx);
                            }
                            setProductDetailModal(null);
                          },
                        });
                      }}
                    />
                  );
                })}
              </div>

              {/* Reviews card */}
              <div
                className="bg-white flex flex-col"
                style={{
                  borderRadius: sv(12),
                  paddingLeft: sv(24),
                  paddingRight: sv(24),
                  paddingTop: sv(24),
                  paddingBottom: sv(32),
                  gap: sv(24),
                  boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
                }}
              >
                {/* Logo */}
                <div
                  style={{
                    height: sv(48),
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ODALogo size="lg" />
                </div>
                {/* Company info */}
                <div className="flex flex-col" style={{ gap: sv(8) }}>
                  <p
                    className="font-semibold text-[#262626]"
                    style={{ fontSize: sv(16) }}
                  >
                    ODA Architecture
                  </p>
                  <div className="flex items-center" style={{ gap: sv(16) }}>
                    <div className="flex items-center" style={{ gap: sv(4) }}>
                      {/* Star icon */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="#262626"
                        style={{ width: sv(16), height: sv(16) }}
                      >
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                      </svg>
                      <span
                        className="text-[#262626]"
                        style={{ fontSize: sv(14) }}
                      >
                        4.6
                      </span>
                    </div>
                    <span
                      className="text-[#262626]"
                      style={{ fontSize: sv(14) }}
                    >
                      (243 reviews)
                    </span>
                    <span
                      className="text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontSize: sv(14), fontWeight: 300 }}
                    >
                      https://oda-architecture.com/
                    </span>
                  </div>
                </div>
                {/* Quotes */}
                <div
                  className="flex flex-col"
                  style={{ gap: sv(24), fontWeight: 300, lineHeight: 1.5 }}
                >
                  {[
                    {
                      quote:
                        '"The result feels custom in all the right ways. ODA Architecture helped us make smart choices on materials, finishes, and layout, and the whole experience felt far more seamless than we expected."',
                      author: "— Priya and Kevin S., Irvine, CA",
                    },
                    {
                      quote:
                        '"ODA Architecture made the entire renovation process feel clear and intentional. We never felt overwhelmed, and every decision felt easier because the options were presented so thoughtfully."',
                      author: "— Emily R., Pasadena, CA",
                    },
                    {
                      quote:
                        '"From design through final execution, ODA Architecture brought a level of care and clarity that gave us real confidence. The space feels elevated, functional, and much more aligned with how we actually live."',
                      author: "— Sophia L., Glendale, CA",
                    },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="flex flex-col"
                      style={{ gap: sv(4) }}
                    >
                      <p
                        className="text-[#262626]"
                        style={{ fontSize: sv(12), letterSpacing: "-0.24px" }}
                      >
                        {r.quote}
                      </p>
                      <p
                        className="text-[#262626]"
                        style={{ fontSize: sv(11), letterSpacing: "-0.22px" }}
                      >
                        {r.author}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  className="text-[#262626] underline text-left w-fit"
                  style={{ fontSize: sv(14) }}
                >
                  Read more
                </button>
              </div>
            </div>

            {/* ── Right column: pricing summary ── */}
            <div
              className="flex-shrink-0 flex flex-col sticky"
              style={{ width: sv(505), gap: sv(23), top: sv(144) }}
            >
              {/* Title */}
              <div className="flex flex-col text-[#262626]">
                <p className="font-semibold" style={{ fontSize: sv(20) }}>
                  SUMMARY - {option.title.split(" - ")[0]}
                </p>
                <p style={{ fontSize: sv(14) }}>
                  {odaProjectInfo.projectLabel}
                </p>
              </div>

              {/* Contact Total + Monthly Payment */}
              <div
                className="flex flex-col"
                style={{
                  gap: sv(16),
                  paddingTop: sv(24),
                  paddingBottom: sv(24),
                  borderTop: "0.5px solid rgba(0,0,0,0.2)",
                }}
              >
                <div className="flex flex-col">
                  <p
                    className="text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontSize: sv(14) }}
                  >
                    Contact Total <sup style={{ fontSize: "7px" }}>1</sup>
                  </p>
                  <p
                    className="text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontSize: sv(32) }}
                  >
                    $ {total.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p
                    className="text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontSize: sv(14) }}
                  >
                    Estimated Monthly Payment{" "}
                    <sup style={{ fontSize: "7px" }}>2</sup>
                  </p>
                  <p
                    className="text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontSize: sv(24), fontWeight: 300 }}
                  >
                    $ {monthlyPayment.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              <div
                className="flex flex-col"
                style={{
                  gap: sv(8),
                  paddingTop: sv(24),
                  paddingBottom: sv(24),
                  borderTop: "0.5px solid rgba(0,0,0,0.2)",
                }}
              >
                {[
                  { label: "Base Scope", value: option.priceFrom },
                  {
                    label: "Selected Upgrades & Add-ons",
                    value: addonTotal + materialDelta,
                  },
                  {
                    label: "Permit & Inspection Fees",
                    value: Math.round(option.priceFrom * 0.045),
                  },
                  { label: "Sales Tax", value: Math.round(total * 0.075) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col"
                    style={{ paddingBottom: sv(2) }}
                  >
                    <p
                      className="text-[#737373] overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontSize: sv(14) }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontSize: sv(20) }}
                    >
                      $ {value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col" style={{ gap: sv(12) }}>
                {/* Sign & Approve */}
                <button
                  className="w-full bg-[#262626] text-white font-semibold hover:bg-black transition-colors flex items-center justify-center"
                  style={{
                    height: sv(40),
                    fontSize: sv(14),
                    borderRadius: sv(4),
                  }}
                  onClick={() => setShowSignModal(true)}
                >
                  Sign &amp; Approve
                </button>
                {/* Explore Payment & Financing */}
                <button
                  className="w-full border border-[#262626] bg-white text-[#262626] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                  style={{
                    height: sv(40),
                    fontSize: sv(14),
                    borderRadius: sv(4),
                    gap: sv(4),
                  }}
                >
                  <svg
                    viewBox="0 0 11 14"
                    fill="none"
                    className="flex-shrink-0"
                    style={{ width: sv(11), height: sv(14) }}
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="10"
                      height="13"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <path
                      d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2"
                      stroke="currentColor"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                  </svg>
                  Explore Payment &amp; Financing
                </button>
                {/* Contact Sales + Download */}
                <div className="flex" style={{ gap: sv(12) }}>
                  <button
                    className="flex-1 border border-[#262626] bg-white text-[#262626] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                    style={{
                      height: sv(40),
                      fontSize: sv(14),
                      borderRadius: sv(4),
                      gap: sv(4),
                    }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="flex-shrink-0"
                      style={{ width: sv(16), height: sv(16) }}
                    >
                      <path
                        d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z"
                        stroke="currentColor"
                        strokeWidth="1.1"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Contact Sales
                  </button>
                  <button
                    className="flex-1 border border-[#262626] bg-white text-[#262626] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                    style={{
                      height: sv(40),
                      fontSize: sv(14),
                      borderRadius: sv(4),
                      gap: sv(4),
                    }}
                  >
                    <svg
                      viewBox="0 0 17 18"
                      fill="none"
                      className="flex-shrink-0"
                      style={{ width: sv(17), height: sv(18) }}
                    >
                      <path
                        d="M8.5 1v11M3.5 7l5 5 5-5M1 17h15"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Download Config [PDF]
                  </button>
                </div>
              </div>

              {/* Footnotes */}
              <div
                className="flex flex-col"
                style={{
                  gap: sv(12),
                  paddingTop: sv(24),
                  fontWeight: 300,
                  lineHeight: 1.5,
                }}
              >
                <p
                  className="text-[#262626]"
                  style={{ fontSize: sv(11), letterSpacing: "-0.22px" }}
                >
                  <sup style={{ fontSize: "7px" }}>1 </sup>
                  Total project pricing is subject to change based on applicable
                  taxes, fees, payment timing, and any final project
                  adjustments. The final amount presented at the time of payment
                  will control.
                </p>
                <p
                  className="text-[#262626]"
                  style={{ fontSize: sv(11), letterSpacing: "-0.22px" }}
                >
                  <sup style={{ fontSize: "7px" }}>2 </sup>
                  Any monthly payment information shown is an estimate only and
                  is not a financing offer. Final payment amounts, interest
                  rates, and loan terms are subject to lender review and will be
                  confirmed during the formal application process.
                </p>
                <button
                  className="text-[#262626] underline text-left w-fit"
                  style={{ fontSize: sv(11) }}
                >
                  Read more
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSignModal && (
        <SignModal
          onClose={() => setShowSignModal(false)}
          onApprove={onApprove}
        />
      )}

      {productDetailModal && (
        <ProductDetailModal
          item={productDetailModal.item}
          sectionName={productDetailModal.sectionName}
          onSelect={productDetailModal.onSelect}
          onClose={() => setProductDetailModal(null)}
        />
      )}

      {/* Drawing fullscreen modal */}
      {drawingModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setDrawingModalOpen(false)}
        >
          <div
            className="relative bg-white flex flex-col overflow-hidden"
            style={{
              width: sv(1200),
              height: sv(800),
              borderRadius: sv(24),
              padding: `${sv(40)} ${sv(48)}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setDrawingModalOpen(false)}
              className="absolute flex items-center justify-center hover:bg-[#f0f0f0] transition-colors text-[#262626]"
              style={{
                top: sv(20),
                right: sv(20),
                width: sv(32),
                height: sv(32),
                borderRadius: "50%",
              }}
            >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                style={{ width: sv(14), height: sv(14) }}
              >
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Image area */}
            <div
              className="relative flex-1 overflow-hidden"
              style={{ borderRadius: sv(8) }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${modalZoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease",
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
              <div
                className="absolute flex items-center"
                style={{ bottom: sv(24), left: sv(32), gap: sv(12) }}
              >
                {/* Zoom In */}
                <button
                  onClick={() => setModalZoom((z) => Math.min(z + 0.25, 3))}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: sv(48),
                    height: sv(48),
                    borderRadius: sv(4),
                    backdropFilter: "blur(2px)",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ width: sv(24), height: sv(24) }}
                  >
                    <circle
                      cx="10.5"
                      cy="10.5"
                      r="6.5"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7.5 10.5h6M10.5 7.5v6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 16l4 4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {/* Zoom Out */}
                <button
                  onClick={() => setModalZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: sv(48),
                    height: sv(48),
                    borderRadius: sv(4),
                    backdropFilter: "blur(2px)",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ width: sv(24), height: sv(24) }}
                  >
                    <circle
                      cx="10.5"
                      cy="10.5"
                      r="6.5"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7.5 10.5h6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 16l4 4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {/* Center / Reset */}
                <button
                  onClick={() => setModalZoom(1)}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: sv(48),
                    height: sv(48),
                    borderRadius: sv(4),
                    backdropFilter: "blur(2px)",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ width: sv(24), height: sv(24) }}
                  >
                    <path
                      d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen 5: Approved ───────────────────────────────────────────────────────
function ApprovedScreen({
  option,
  onHome,
}: {
  option: ODAOption;
  onHome: () => void;
}) {
  const [activeTab, setActiveTab] = useState("Project Home");
  const tabs = [
    "Project Home",
    "Updates",
    "Products",
    "Drawings",
    "Documents",
    "Invoices & Payments",
    "Previews",
  ];
  const sections = option.sections;

  const updates = [
    {
      date: "9/18/2027",
      dateNote: " <3 days ago>",
      title: "Wall & Ceiling Preparation Completed",
      desc: "Surface preparation for the walls and ceilings is now complete. The project is moving forward into the next phase of interior finish installation.",
      photos: [
        "/assets/update-ps-1.png",
        "/assets/update-ps-2.png",
        "/assets/update-ps-3.png",
      ],
    },
    {
      date: "6/02/2027",
      dateNote: "",
      title: "Construction In Progress",
      desc: "On-site work has officially started. Our team is currently completing site preparation and beginning the first phase of installation.",
      photos: [],
    },
    {
      date: "5/25/2027",
      dateNote: "",
      title: "Demolition Work Completed",
      desc: "Demolition work has been completed and the project area has been cleared for the next phase of construction. Site preparation and layout work will begin next.",
      photos: ["/assets/update-ps-4.png"],
    },
  ];

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white">
        <div style={{ width: sv(1440), margin: "0 auto" }}>
          {/* Row 1: nav */}
          <nav
            className="flex items-start justify-between"
            style={{ height: sv(54), padding: `${sv(31)} ${sv(217)} 0` }}
          >
            <button
              onClick={onHome}
              className="flex items-center justify-center text-[#262626] hover:opacity-60"
              style={{ width: sv(24), height: sv(24) }}
            >
              <svg
                viewBox="0 0 18 16"
                fill="none"
                style={{ width: sv(18), height: sv(16) }}
              >
                <path
                  d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <ODALogo size="sm" />
            <button
              className="flex items-center justify-center text-[#262626] hover:opacity-60"
              style={{ width: sv(24), height: sv(24) }}
            >
              <svg
                viewBox="0 0 17 17"
                fill="none"
                style={{ width: sv(17), height: sv(17) }}
              >
                <circle
                  cx="8.5"
                  cy="5.5"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M1.5 15.5C1.5 12.7386 4.68629 10.5 8.5 10.5C12.3137 10.5 15.5 12.7386 15.5 15.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </nav>

          {/* Row 2: tab navigation */}
          <div
            className="flex items-center overflow-x-auto scrollbar-none"
            style={{
              padding: `${sv(16)} ${sv(32)}`,
              borderBottom: "0.5px solid rgba(0,0,0,0.2)",
            }}
          >
            <div className="flex items-center" style={{ gap: sv(32) }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-shrink-0 flex items-center justify-center text-[rgba(0,0,0,0.85)]"
                  style={{
                    height: sv(32),
                    padding: `${sv(6)} ${sv(12)}`,
                    fontSize: sv(14),
                    borderBottom:
                      activeTab === tab
                        ? "2px solid #262626"
                        : "2px solid transparent",
                    marginBottom: "-0.5px",
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
      <div
        className="flex items-start"
        style={{
          width: sv(1440),
          margin: "0 auto",
          paddingLeft: sv(32),
          paddingRight: sv(32),
          paddingTop: sv(32),
          paddingBottom: sv(64),
          gap: sv(32),
        }}
      >
        {/* Left column: 840px */}
        <div
          className="flex-shrink-0 flex flex-col"
          style={{ width: sv(840), gap: sv(27) }}
        >
          {/* Project Updates */}
          <div
            className="bg-white flex flex-col"
            style={{
              borderRadius: sv(12),
              paddingLeft: sv(24),
              paddingRight: sv(24),
              paddingTop: sv(16),
              paddingBottom: sv(24),
              gap: sv(24),
              boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
            }}
          >
            <div className="flex items-center" style={{ paddingTop: sv(16) }}>
              <p
                className="font-semibold text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: sv(14) }}
              >
                Project Updates
              </p>
            </div>

            {updates.map((update, i) => (
              <div
                key={i}
                className="flex flex-col w-full"
                style={{
                  paddingTop: sv(12),
                  borderTop: "0.5px solid rgba(0,0,0,0.1)",
                }}
              >
                {/* Date line */}
                <p className="leading-normal mb-0" style={{ fontSize: sv(12) }}>
                  <span className="font-semibold text-[#737373]">
                    {update.date}
                  </span>
                  {update.dateNote && (
                    <span className="text-[#262626]">{update.dateNote}</span>
                  )}
                </p>
                {/* Title + info icon */}
                <div
                  className="flex items-center w-full"
                  style={{ gap: sv(2) }}
                >
                  <p
                    className="text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap leading-normal"
                    style={{ fontSize: sv(14) }}
                  >
                    {update.title}
                  </p>
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: sv(24), height: sv(24) }}
                  >
                    <InfoIcon />
                  </div>
                </div>
                {/* Description */}
                <p
                  className="text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontSize: sv(12), fontWeight: 300 }}
                >
                  {update.desc}
                </p>
                {/* Photos */}
                {update.photos.length > 0 && (
                  <div
                    className="flex items-center"
                    style={{ gap: sv(4), paddingTop: sv(8) }}
                  >
                    {update.photos.map((photo, j) => (
                      <div
                        key={j}
                        className="flex-shrink-0"
                        style={{
                          width: sv(64),
                          height: sv(64),
                          padding: sv(2),
                          borderRadius: sv(4),
                        }}
                      >
                        <div
                          className="relative w-full h-full overflow-hidden"
                          style={{ borderRadius: sv(2) }}
                        >
                          <Image
                            src={photo}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Show More */}
            <div
              className="flex flex-col justify-center text-center whitespace-nowrap text-[rgba(0,0,0,0.85)]"
              style={{ fontSize: sv(14) }}
            >
              <button className="underline leading-normal">Show More</button>
            </div>
          </div>

          {/* Approved Scope */}
          <div
            className="bg-white flex flex-col"
            style={{
              borderRadius: sv(12),
              paddingLeft: sv(24),
              paddingRight: sv(24),
              paddingTop: sv(16),
              paddingBottom: sv(24),
              gap: sv(24),
              boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
            }}
          >
            <div className="flex items-center" style={{ paddingTop: sv(16) }}>
              <p
                className="font-semibold text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: sv(14) }}
              >
                Approved Scope
              </p>
            </div>
            <SummaryGroup
              name="Base Scope"
              items={[
                {
                  name: "Existing Surface Preparation & Demolition",
                  qty: "960",
                  unit: "sqf.",
                  price: 42900,
                  showChange: false,
                  thumbnailSrc: THUMB_BASE_SCOPE,
                },
                {
                  name: "Wall & Ceiling Preparation",
                  qty: "190",
                  unit: "sqf.",
                  price: 24100,
                  showChange: false,
                  thumbnailSrc: THUMB_BASE_SCOPE,
                },
                {
                  name: "Flooring Base Installation",
                  qty: "547",
                  unit: "sqf.",
                  price: 4600,
                  showChange: false,
                  thumbnailSrc: THUMB_BASE_SCOPE,
                },
                {
                  name: "Lighting & Electrical Adjustments",
                  qty: "128",
                  unit: "hrs.",
                  price: 7270,
                  showChange: false,
                  thumbnailSrc: THUMB_BASE_SCOPE,
                },
                {
                  name: "Installation & Finishing Labor",
                  qty: "1,300",
                  unit: "hrs.",
                  price: 87580,
                  showChange: false,
                  thumbnailSrc: THUMB_BASE_SCOPE,
                },
              ]}
            />
            {sections.map((section) => {
              const lineItems: SummaryLineItem[] = section.items
                .filter((item) => !item.isAddon || item.selected)
                .map((item) => ({
                  name: item.spec,
                  qty: "1",
                  unit: "each",
                  price: getItemPrice(item),
                  thumbnailSrc: item.isAddon
                    ? (item.addonSwatches?.[item.selectedAddonSwatch ?? 0] ??
                      item.previewImage)
                    : item.swatches?.[item.selectedSwatch ?? 0],
                  showChange: false,
                }));
              if (lineItems.length === 0) return null;
              return (
                <SummaryGroup
                  key={section.name}
                  name={section.name}
                  items={lineItems}
                />
              );
            })}
          </div>

          {/* Move-In Service */}
          <div
            className="bg-white overflow-hidden flex"
            style={{
              borderRadius: sv(12),
              boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="relative flex-shrink-0"
              style={{ width: sv(416), height: sv(325) }}
            >
              <Image
                src="/assets/move-in-service.png"
                alt=""
                fill
                className="object-cover"
                sizes="416px"
              />
            </div>
            <div
              className="flex-1 flex flex-col items-start justify-center min-w-0"
              style={{ gap: sv(16), paddingLeft: sv(48), paddingRight: sv(24) }}
            >
              <p
                className="text-[#262626] leading-[1.5] w-full"
                style={{
                  fontSize: sv(24),
                  letterSpacing: "-0.72px",
                  fontFamily: "'Segoe UI Variable', 'Segoe UI', sans-serif",
                  fontWeight: 400,
                }}
              >
                Move-In Service
              </p>
              <p
                className="text-[#262626] leading-[1.5] w-full"
                style={{
                  fontSize: sv(12),
                  letterSpacing: "-0.24px",
                  fontWeight: 300,
                }}
              >
                Settle into your newly finished home with additional move-in
                support designed to make the final transition feel effortless,
                organized, and ready for everyday living.
              </p>
              <button
                className="flex items-center justify-center bg-[#262626] text-white hover:opacity-80 transition-opacity"
                style={{
                  padding: `${sv(6)} ${sv(12)}`,
                  fontSize: sv(9),
                  borderRadius: sv(2),
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Right column: 505px, sticky */}
        <div
          className="flex-shrink-0 flex flex-col items-center sticky"
          style={{ width: sv(505), gap: sv(23), top: sv(158) }}
        >
          {/* Title */}
          <div className="flex flex-col w-full text-[#262626] leading-normal">
            <p className="font-semibold w-full" style={{ fontSize: sv(20) }}>
              {odaProjectInfo.projectLabel}
            </p>
            <p className="w-full" style={{ fontSize: sv(14) }}>
              Proposal Approved on 3/18/2026
            </p>
          </div>

          {/* Payment Progress + Next Payment */}
          <div
            className="flex flex-col w-full"
            style={{
              gap: sv(16),
              paddingTop: sv(24),
              paddingBottom: sv(24),
              borderTop: "0.5px solid rgba(0,0,0,0.2)",
            }}
          >
            {/* Payment Progress */}
            <div className="flex flex-col w-full" style={{ gap: sv(4) }}>
              <p
                className="text-[#737373] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: sv(14) }}
              >
                Payment Progress <sup style={{ fontSize: "7px" }}>1</sup>
              </p>
              <div className="flex flex-col items-start w-full">
                <p
                  className="leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontSize: sv(20) }}
                >
                  <span className="text-[#262626]">$100,450 / </span>
                  <span className="text-[#737373]">$273,090</span>
                </p>
                {/* Progress bar */}
                <div
                  className="flex items-center"
                  style={{ width: sv(270), height: sv(18) }}
                >
                  <div
                    className="flex-shrink-0"
                    style={{
                      width: sv(102),
                      height: sv(2),
                      background: "#262626",
                    }}
                  />
                  <div
                    className="flex-1"
                    style={{ height: sv(2), background: "#d9d9d9" }}
                  />
                </div>
              </div>
            </div>

            {/* Next Payment */}
            <div className="flex flex-col w-full overflow-hidden text-ellipsis whitespace-nowrap">
              <p
                className="text-[#737373] leading-normal"
                style={{ fontSize: sv(14) }}
              >
                Next Payment <sup style={{ fontSize: "7px" }}>2</sup>
              </p>
              <p
                className="text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: sv(32) }}
              >
                $68,000
              </p>
              <p
                className="text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: sv(12) }}
              >
                1/3 balance due at 50% completion{" "}
                <span style={{ fontWeight: 300 }}>&lt;5/26/2028&gt;</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col w-full" style={{ gap: sv(12) }}>
            {/* Make A Payment */}
            <button
              className="w-full bg-[#262626] text-white font-semibold flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ height: sv(40), fontSize: sv(14), borderRadius: sv(4) }}
            >
              Make A Payment
            </button>

            {/* Financing Service */}
            <button
              className="w-full border border-[#262626] bg-white text-[rgba(0,0,0,0.85)] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
              style={{
                height: sv(40),
                fontSize: sv(14),
                borderRadius: sv(4),
                gap: sv(2),
              }}
            >
              <span
                className="flex items-center justify-center h-full"
                style={{ paddingLeft: sv(5), paddingRight: sv(5) }}
              >
                <svg
                  viewBox="0 0 11 14"
                  fill="none"
                  className="flex-shrink-0"
                  style={{ width: sv(11), height: sv(14) }}
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="10"
                    height="13"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <path
                    d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              Financing Service
            </button>

            {/* Contact Sales + Request Change */}
            <div className="flex w-full" style={{ gap: sv(12) }}>
              <button
                className="flex-1 border border-[#262626] bg-white text-[rgba(0,0,0,0.85)] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                style={{
                  height: sv(40),
                  fontSize: sv(14),
                  borderRadius: sv(4),
                  gap: sv(2),
                }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: sv(24), height: sv(22) }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ width: sv(16), height: sv(16) }}
                  >
                    <path
                      d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Contact Sales
              </button>
              <button
                className="flex-1 border border-[#262626] bg-white text-[rgba(0,0,0,0.85)] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                style={{
                  height: sv(40),
                  fontSize: sv(14),
                  borderRadius: sv(4),
                  gap: sv(2),
                }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: sv(24), height: sv(24) }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ width: sv(16), height: sv(16) }}
                  >
                    <path
                      d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM5 8h6M8 5l3 3-3 3"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Request Change
              </button>
            </div>
          </div>

          {/* Download links */}
          <div className="flex flex-col w-full">
            <button
              className="flex items-center bg-white w-full"
              style={{
                gap: sv(2),
                height: sv(24),
                paddingRight: sv(16),
                paddingTop: sv(6),
                paddingBottom: sv(6),
                borderRadius: sv(4),
              }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: sv(24), height: sv(24) }}
              >
                <svg
                  viewBox="0 0 17 18"
                  fill="none"
                  style={{ width: sv(17), height: sv(18) }}
                >
                  <path
                    d="M8.5 1v11M3.5 7l5 5 5-5M1 17h15"
                    stroke="#262626"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                className="text-[rgba(0,0,0,0.85)]"
                style={{ fontSize: sv(12), lineHeight: "18px" }}
              >
                Download Contract Document [PDF]
              </span>
            </button>
            <button
              className="flex items-center bg-white w-full overflow-clip"
              style={{
                gap: sv(2),
                height: sv(24),
                paddingRight: sv(16),
                paddingTop: sv(6),
                paddingBottom: sv(6),
                borderRadius: sv(4),
              }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: sv(24), height: sv(18) }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ width: sv(18), height: sv(18) }}
                >
                  <rect
                    x="2"
                    y="5"
                    width="20"
                    height="14"
                    rx="2"
                    stroke="#262626"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M2 10h20M7 15h.01M12 15h5"
                    stroke="#262626"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span
                className="text-[rgba(0,0,0,0.85)]"
                style={{ fontSize: sv(12), lineHeight: "18px" }}
              >
                Payment Schedule &amp; Records
              </span>
            </button>
          </div>

          {/* Footnotes */}
          <div
            className="flex flex-col w-full"
            style={{ gap: sv(12), paddingTop: sv(24) }}
          >
            <p
              className="text-[#262626] leading-[0]"
              style={{ fontWeight: 300, letterSpacing: "-0.22px" }}
            >
              <span className="leading-[1.5]" style={{ fontSize: sv(7) }}>
                1{" "}
              </span>
              <span className="leading-[1.5]" style={{ fontSize: sv(11) }}>
                Total project pricing is subject to change based on applicable
                taxes, fees, payment timing, and any final project adjustments.
                The final amount presented at the time of payment will control.
              </span>
            </p>
            <p
              className="text-[#262626] leading-[1.5] overflow-hidden text-ellipsis"
              style={{
                fontSize: sv(11),
                fontWeight: 300,
                letterSpacing: "-0.22px",
              }}
            >
              <span style={{ fontSize: sv(7) }}>2 </span>
              Any monthly payment information shown is an estimate only and is
              not a financing offer. Final payment amounts, interest rates, and
              loan terms are subject to lender review and will be confirmed
              during the formal application process.
            </p>
            <div
              className="flex flex-col justify-center text-center whitespace-nowrap text-[rgba(0,0,0,0.85)]"
              style={{ fontSize: sv(11) }}
            >
              <button className="underline leading-normal">Read more</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ODAProposalPage({
  initialScreen = "email",
}: {
  initialScreen?: Screen;
}) {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [selectedOption, setSelectedOption] = useState(0);
  const goToLanding = () => setScreen("landing");

  useEffect(() => {
    const syncStateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen");
      const optionParam = Number.parseInt(params.get("option") ?? "", 10);

      if (screenParam && VALID_SCREENS.includes(screenParam as Screen)) {
        setScreen(screenParam as Screen);
      }

      if (
        Number.isInteger(optionParam) &&
        optionParam >= 1 &&
        optionParam <= odaOptions.length
      ) {
        setSelectedOption(optionParam - 1);
      }
    };

    syncStateFromUrl();
    window.addEventListener("popstate", syncStateFromUrl);
    return () => window.removeEventListener("popstate", syncStateFromUrl);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("screen", screen);
    url.searchParams.set("option", String(selectedOption + 1));
    const nextUrl = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [screen, selectedOption]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  return (
    <>
      {screen === "email" && (
        <EmailScreen onContinue={() => setScreen("landing")} />
      )}
      {screen === "landing" && (
        <LandingScreen
          onContinue={() => setScreen("options")}
          onHome={goToLanding}
        />
      )}
      {screen === "options" && (
        <OptionsScreen
          selectedOption={selectedOption}
          onSelect={setSelectedOption}
          onContinue={() => setScreen("detail")}
          onHome={goToLanding}
        />
      )}
      {screen === "detail" && (
        <DetailScreen
          option={odaOptions[selectedOption]}
          onBack={() => setScreen("options")}
          onApprove={() => {
            const html = document.documentElement;
            const body = document.body;
            const prevHtmlScrollBehavior = html.style.scrollBehavior;
            const prevBodyScrollBehavior = body.style.scrollBehavior;

            html.style.scrollBehavior = "auto";
            body.style.scrollBehavior = "auto";
            window.scrollTo(0, 0);
            setScreen("approved");

            requestAnimationFrame(() => {
              window.scrollTo(0, 0);
              requestAnimationFrame(() => {
                html.style.scrollBehavior = prevHtmlScrollBehavior;
                body.style.scrollBehavior = prevBodyScrollBehavior;
              });
            });
          }}
          onHome={goToLanding}
        />
      )}
      {screen === "approved" && (
        <ApprovedScreen
          option={odaOptions[selectedOption]}
          onHome={goToLanding}
        />
      )}
    </>
  );
}
