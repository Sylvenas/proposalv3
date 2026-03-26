"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import Image from "next/image";
import {
  odaOptions,
  odaProjectInfo,
  THUMB_BASE_SCOPE,
  type ODAOption,
  type ODAItem,
} from "@/data/odaMockDataCopy";

// Scale helper: pure CSS clamp — no JS resize listener needed, zero jitter
const sv = (px: number) => `calc(${px} / 1440 * clamp(1280px, 100vw, 2560px))`;

const COMPARE_BASE_SCOPE =
  "/assets/figma-local/51981941-368d-42cc-b857-4efc43e45491-088570687b.jpg";
const COMPARE_INFO_ICON =
  "/assets/figma-local/18c9139d-35d9-423f-bba5-b49a22d84866-aa9029ccd2.svg";
const INSPECTION_CLOSE_ICON =
  "/assets/figma-local/2f985f51-8ed2-4b21-a3f4-6ea1b0c78488-e43bc55b91.svg";
const INSPECTION_PHONE_ICON =
  "/assets/figma-local/0f6108b8-708f-4590-af43-3a49d4fe79ca-e0bccc251f.svg";
const INSPECTION_PLACEHOLDER_LOGO =
  "/assets/figma-local/686f232d-6dfd-49f8-9717-5fff486d34ed-placeholder.png";
const INSPECTION_ARROW_LEFT =
  "/assets/figma-local/23565d5b-0bdd-410a-89b9-c2c63bc82c1a-arrow-left.svg";
const INSPECTION_ARROW_RIGHT =
  "/assets/figma-local/381b6246-be61-4e66-b4b2-2e62e81c316d-arrow-right.svg";
const INSPECTION_REPORT_IMAGE_1 =
  "/assets/figma-local/a9f6d074-8b60-421d-b834-eb390a876bf4-adaf8d9422.jpg";
const INSPECTION_REPORT_IMAGE_2 =
  "/assets/figma-local/8bf4ece5-237e-42ab-b756-e842e4093c6e-6bb9bdf761.jpg";
const INSPECTION_REPORT_IMAGE_3 =
  "/assets/figma-local/400d4e67-59c3-423a-9416-600c82e4e24d-2f5e887f60.png";
const INSPECTION_REPORT_IMAGE_4 =
  "/assets/figma-local/411fdc2e-0d4a-4899-957e-d7cf93525672-6f405a0e7f.png";
const INSPECTION_REPORT_IMAGE_5 =
  "/assets/figma-local/cf0f30fb-4654-49fb-8b6c-9121f88e352b-9f30eb9e71.png";
const INSPECTION_REPORT_IMAGE_6 =
  "/assets/figma-local/89e35ce2-be01-47f2-b097-d938fc738300-f89e359ebf.png";
const INSPECTION_REPORT_IMAGE_7 =
  "/assets/figma-local/fab24a9f-a481-4283-963d-5003d9ae168d-7701ebdfbf.png";
const INSPECTION_REPORT_IMAGE_8 =
  "/assets/figma-local/5a2ab62f-2406-43f6-b3a2-8a3af77e6ce6-3123c2f005.png";
const INSPECTION_VIDEO_ICON =
  "/assets/figma-local/7acf45ae-fdae-49ab-9554-5d71be8157fc-b9adcd46f8.svg";
const FENCE_REPORT_MAP_IMAGE =
  "/assets/figma-local/7ecdfa62-2a1c-46e9-95d9-2917edb47626-4296a497c5.png";
const FENCE_VIDEO_THUMB_1 =
  "/assets/figma-local/03bea55b-22fd-4fa1-9d7a-538a799d39c9-e15fc39124.png";
const FENCE_VIDEO_THUMB_2 =
  "/assets/figma-local/e6cef6d6-048f-4a8c-8ebd-3c9dae0e0d6a-e6053e1a51.png";
const FENCE_REPORT_IMAGE_1 =
  "/assets/figma-local/fce12163-f53d-418a-9837-783fed716a4f-0fb666855d.png";
const FENCE_REPORT_IMAGE_2 =
  "/assets/figma-local/9fe3f401-d10a-4568-abd7-9a095ee4331d-ba5f6d380b.png";
const FENCE_REPORT_IMAGE_3 =
  "/assets/figma-local/8a172b75-ba04-4c77-897b-0d6ac8dec986-5857d9a3f5.png";
const FENCE_REPORT_IMAGE_4 =
  "/assets/figma-local/3a669088-338c-4a6a-a257-523c64b4f94c-900677c61a.png";
const FENCE_REPORT_IMAGE_5 =
  "/assets/figma-local/0257875c-a8c9-43cd-ba8c-a037a2168aec-93773f7a43.png";
const FENCE_REPORT_IMAGE_6 =
  "/assets/figma-local/63ebf90e-4739-41ca-8ffc-44e1bb499e30-63650129cb.png";
const FENCE_REPORT_IMAGE_7 =
  "/assets/figma-local/df655b70-f276-4fac-b41c-f58ff3341076-df691fee8c.png";
const FENCE_REPORT_IMAGE_8 =
  "/assets/figma-local/ff80bcd2-83d1-4c33-bc96-04521ac9fdb2-f6f4658116.png";
const FENCE_REPORT_IMAGE_9 =
  "/assets/figma-local/dc8d5c73-a157-4942-84c5-272449c26511-e96713c581.png";
const FENCE_REPORT_IMAGE_10 =
  "/assets/figma-local/525533a5-8619-4d55-962f-96ab64da650f-b25e2d8a5b.png";
const FENCE_REPORT_IMAGE_11 =
  "/assets/figma-local/604881f7-32e5-4ecf-81c1-440cd804eeb8-8518666e45.png";
const FENCE_REPORT_IMAGE_12 =
  "/assets/figma-local/b35dc5d5-4cc7-4350-93a8-ccc61a6d7b05-9961aa633f.png";
const FENCE_HERO_LOGO =
  "/assets/figma-local/b02f8bc3-57dc-4213-9641-c04f056d81a2-4dded8ea44.jpg";
const FENCE_NAV_LOGO =
  "/assets/figma-local/670f5677-273c-4b14-b4f6-461a424e2a1d-01b30d815b.png";
const FENCE_ZOOM_IN_ICON =
  "/assets/figma-local/e3c306b7-b20f-4b57-bf85-59e38b1f6932-e2b6136576.svg";
const FENCE_ZOOM_OUT_ICON =
  "/assets/figma-local/3571920d-fc78-4728-a3dd-e07f3e23b040-b929c87335.svg";
const FENCE_FIT_ICON =
  "/assets/figma-local/10de511b-aea0-4cb1-8b63-b2e134299c01-95dfa8c9b5.svg";
const FENCE_VIDEO_PLAY_ICON =
  "/assets/figma-local/ead193d8-2453-4cbc-8eb3-8f5b45cc21b6-3a028e07bc.svg";
const FENCE_PHONE_ICON =
  "/assets/figma-local/3ed348af-ff7a-48b8-99b8-93ec3082e23f-2616cf1a6f.svg";
const FENCE_HOME_ICON =
  "/assets/figma-local/e71d420a-1b53-4a10-baad-4d92f787ca2d-7d8bb73ca7.svg";
const FENCE_USER_ICON =
  "/assets/figma-local/67ec092e-9b3f-4e5e-bdf6-04af373f05f6-97149766fa.svg";
const OPTION_CARD_IMAGE_1 =
  "/assets/figma-local/b3a2fca2-f15b-4fb4-9709-eb448f7e7d19-0fd1b446fe.png";
const OPTION_CARD_IMAGE_2 =
  "/assets/figma-local/65787a1a-2075-401b-891f-18a2e00f57eb-dfac981e26.png";
const OPTION_LOGO_IMAGE =
  "/assets/figma-local/2d66bc15-bb7b-46b6-9877-769f911daab7-f7ce0f3462.png";
const OPTION_COMPARE_ICON =
  "/assets/figma-local/8c28d037-63ce-4e99-8acc-b89fdcb25640-2a5cf4bf8d.svg";
const OPTION_STICKY_CHEVRON =
  "/assets/figma-local/fd10f897-2826-49a3-85fa-44e822913e0b-cadf1ade6b.svg";
const OPTION_BACK_TO_TOP_ICON =
  "/assets/figma-local/ef5e1ae1-49b9-4aca-ab37-0f9f45ce4b7d-a1eca606f9.svg";
const OPTION_HOME_ICON =
  "/assets/figma-local/d2a15d78-aa7f-41da-8bee-c1e50e844b7c-69be7a1678.svg";
const OPTION_USER_ICON =
  "/assets/figma-local/be7b996d-c6ef-489c-8ceb-6741da1b14ee-440bae599f.svg";
const OPTION_INFO_ICON =
  "/assets/figma-local/028a1418-0005-4ead-b04c-f9e8becd5138-7f07ab0078.svg";
const OPTION_CHAIN_PLACEHOLDER =
  "/assets/figma-local/cdd35f48-c738-4aa0-9be8-564fdab0b479-c26c079d24.png";
const OPTION_GATE_IMAGE_1 =
  "/assets/figma-local/79ed251c-3b2d-4fd9-82a7-345238d8ddc3-63fef2806a.png";
const OPTION_GATE_IMAGE_2 =
  "/assets/figma-local/7feffa04-1d2f-41fc-be91-d12652497028-ad8cf843e0.jpg";
const OPTION_GATE_IMAGE_3 =
  "/assets/figma-local/5bb7f9ab-a34b-486c-8f8a-07ef4e7ab8d0-e43c1b13ab.jpg";
const OPTION_GATE_IMAGE_4 =
  "/assets/figma-local/f338dfae-ca24-4729-9f1a-640e850eb79f-78668dc38f.png";
const OPTION_HARDWARE_IMAGE_1 =
  "/assets/figma-local/0eef5329-de03-48c1-9d20-768a934e16f2-2542bbfbee.png";
const OPTION_HARDWARE_IMAGE_2 =
  "/assets/figma-local/a282e3db-8386-44c2-bd88-6e355d32d6a3-936e67bc86.png";
const OPTION_HARDWARE_IMAGE_3 =
  "/assets/figma-local/99a0c2e2-dfcd-4e0b-9424-3691a356f35f-21072c80f6.jpg";
const OPTION_HARDWARE_IMAGE_4 =
  "/assets/figma-local/e7066310-7033-4824-891c-dcbd0a945c76-51e46a783f.png";
const OPTION_HARDWARE_IMAGE_5 =
  "/assets/figma-local/f0177215-9498-4bb4-85c3-8c33ede13fcd-cee8dd5495.png";

// ─── Fence Option 2 assets ────────────────────────────────────────────────────
const FENCE_DRAWING_MAP = "/assets/fence-drawing-map.png";
const FENCE_THUMB_PANEL = "/assets/fence-thumb-panel.png";   // Fence Parts, Sections, some Hardware
const FENCE_THUMB_GATE_1 = "/assets/fence-thumb-gate-1.png"; // Gate items 1 & 2
const FENCE_THUMB_GATE_3 = "/assets/fence-thumb-gate-3.png"; // Gate item 3 (5' 5'W)
const FENCE_THUMB_CAP = "/assets/fence-thumb-cap.png";       // New England Cap
const FENCE_THUMB_POST_INSERT = "/assets/fence-thumb-post-insert.png"; // Aluminum Gate Post Insert
const FENCE_WARRANTY_IMG = "/assets/fence-extended-warranty.jpg";      // Fence Extended Warranty promo card

const PLACEHOLDER_PRODUCT_IMAGES = new Set([
  OPTION_CHAIN_PLACEHOLDER,
  THUMB_BASE_SCOPE,
  FENCE_THUMB_PANEL,
]);

const CONTRACT_PAGES = [
  "/pdf2/Madison Fence - Rozier - Option 2 - Approved_页面_1 1.png",
  "/pdf2/Madison Fence - Howland_页面_2 2.png",
  "/pdf2/Madison Fence - Rozier - Option 2 - Approved_页面_3 1.png",
  "/pdf2/Madison Fence - Rozier - Option 2 - Approved_页面_4 1.png",
];
const EMAIL_CONTENT_LOGO =
  "https://www.figma.com/api/mcp/asset/e182eb12-f01c-4deb-a581-866053874a4c";
const PRODUCT_DETAIL_EMPTY_LOGO =
  "https://www.figma.com/api/mcp/asset/851b002b-204b-43ec-9e80-70ecd0b77d17";

function isPlaceholderProductImage(src?: string | null) {
  return Boolean(src && PLACEHOLDER_PRODUCT_IMAGES.has(src));
}

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
  // sm: nav bar (109×30), md: email card (130×36), lg: footer/reviews (217×60)
  const dims = { sm: [109, 30], md: [130, 36], lg: [217, 60] };
  const [width, height] = dims[size];

  return (
    <Image
      src="/assets/madison-fence-logo.png"
      alt="Madison Fence Company"
      width={width}
      height={height}
      priority={size !== "lg"}
      style={{ width: sv(width), height: sv(height) }}
    />
  );
}

// ─── Screen 1: Email ─────────────────────────────────────────────────────────
function EmailScreen({ onContinue }: { onContinue: () => void }) {
  const {
    clientName,
  } = odaProjectInfo;
  const firstName = clientName.split(" ")[0];

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
                      <p className="text-[16px] leading-[16px]">{`Madison Fence Company <service@madisonfence.com>`}</p>
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
                  <div
                    className="bg-[#f0f0f0] flex justify-center py-[31px] w-full"
                  >
                    <div className="flex flex-col" style={{ width: 720 }}>
                      {/* White email card */}
                      <div className="bg-white flex flex-col gap-[27px] items-center pb-[64px] pt-[48px] px-[54px]">
                        <div
                          className="relative flex-shrink-0"
                          style={{ width: 240, height: 240 }}
                        >
                          <img
                            src={EMAIL_CONTENT_LOGO}
                            alt="Madison Fence Company"
                            className="absolute inset-0 block size-full object-cover"
                          />
                        </div>
                        {/* Hi */}
                        <p
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[16px]"
                          style={{ fontWeight: 300 }}
                        >
                          Hi {firstName},
                        </p>
                        {/* Body paragraphs */}
                        <div
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="mb-[6px]">
                            Your fence project proposal from Madison Fence
                            Company is ready.
                          </p>
                          <p>
                            You can now review your project online — compare
                            fence options, review included materials and gate
                            configurations, explore available financing, and
                            confirm pricing before approving your agreement.
                          </p>
                        </div>
                        {/* What you can do */}
                        <div
                          className="min-w-full text-[rgba(0,0,0,0.85)]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="font-semibold text-[16px] leading-[20px] mb-[6px]">
                            What you can do
                          </p>
                          <ul className="text-[12px] leading-[20px] list-disc pl-5">
                            <li>Compare available fence options</li>
                            <li>
                              Review included materials, gate details, and
                              project scope
                            </li>
                            <li>Explore payment and financing options</li>
                            <li>{`Sign your agreement online when you're ready`}</li>
                          </ul>
                        </div>
                        {/* Project info */}
                        <p
                          className="min-w-full whitespace-pre-wrap text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <span style={{ fontWeight: 600 }}>Project:</span>
                          {` Henderson Backyard Fence Replacement`}
                          <br />
                          <span style={{ fontWeight: 600 }}>Prepared by:</span>
                          {` Leslie Cheung`}
                          <br />
                          <span style={{ fontWeight: 600 }}>
                            Proposal total starting from:
                          </span>
                          {` $8,615.00`}
                        </p>
                        {/* CTA */}
                        <div
                          className="bg-[#d41a32] flex items-center justify-center px-[16px] py-[6px] rounded-[2px] flex-shrink-0"
                          style={{ height: 40 }}
                        >
                          <button
                            onClick={() =>
                              window.open(
                                "/proposal-v3?screen=landing",
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
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          If you have any questions, you can contact your sales
                          representative Leslie Cheung directly before making
                          your final decision.
                        </p>
                        <div
                          className="min-w-full text-[12px] text-[rgba(0,0,0,0.85)] leading-[20px]"
                          style={{ fontWeight: 300 }}
                        >
                          <p className="mb-[6px]">Thank you,</p>
                          <p>Madison Fence Company</p>
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
                          Madison Fence Company
                          <br />
                          1268 Wilshire Boulevard, Suite 410, Santa Monica, CA
                          90403
                          <br />
                          (310) 555-0126 | hello@oda-architecture.com
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
                          You are receiving this email because Madison Fence
                          Company has invited you to review your project online.
                          Your digital proposal may include configurable package
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
  if (!entry) return null;
  const media = entry.media[activeMediaIndex] ?? entry.media[0] ?? null;
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
              className="relative overflow-hidden flex items-center justify-center"
              style={{
                width: "100%",
                height: sv(510),
                borderRadius: sv(8),
                border: media ? "none" : "1px solid #b4b4b4",
              }}
            >
              {media ? (
                <>
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
                </>
              ) : (
                <img
                  src={INSPECTION_PLACEHOLDER_LOGO}
                  alt="ODA Design & Architecture"
                  style={{ width: sv(252), height: sv(49) }}
                />
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
                className="bg-white border border-transparent flex items-center justify-center transition-colors hover:border-[#262626] active:bg-[#ebebeb]"
                style={{
                  width: sv(132),
                  height: sv(40),
                  borderRadius: sv(4),
                  gap: sv(2),
                  color: "rgba(0,0,0,0.85)",
                  fontSize: sv(14),
                  cursor: "pointer",
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
            <div
              className="flex items-center w-full"
              style={{ gap: sv(21) }}
            >
              <button
                onClick={() => hasPrev && onChangeEntry(activeEntryIndex - 1)}
                className="flex-shrink-0 flex items-center justify-center transition-opacity"
                style={{
                  width: sv(48),
                  height: sv(48),
                  opacity: hasPrev ? 1 : 0.3,
                  cursor: hasPrev ? "pointer" : "default",
                }}
              >
                <img
                  src={INSPECTION_ARROW_LEFT}
                  alt="Previous"
                  style={{ width: sv(48), height: sv(48), transform: "rotate(180deg)" }}
                />
              </button>
              <p
                className="flex-1 text-center text-[#262626]"
                style={{
                  fontSize: sv(20),
                  fontWeight: 300,
                  letterSpacing: "-0.8px",
                  lineHeight: "normal",
                }}
              >
                {activeEntryIndex + 1} / {entries.length}
              </p>
              <button
                onClick={() => hasNext && onChangeEntry(activeEntryIndex + 1)}
                className="flex-shrink-0 flex items-center justify-center transition-opacity"
                style={{
                  width: sv(48),
                  height: sv(48),
                  opacity: hasNext ? 1 : 0.3,
                  cursor: hasNext ? "pointer" : "default",
                }}
              >
                <img
                  src={INSPECTION_ARROW_RIGHT}
                  alt="Next"
                  style={{ width: sv(48), height: sv(48) }}
                />
              </button>
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
  const HERO_DESIGN_WIDTH = 1440;
  const HERO_DESIGN_HEIGHT = 1024;
  const HERO_MAX_SCALE = 1;
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroActionsRef = useRef<HTMLDivElement>(null);
  const [inspectionModal, setInspectionModal] = useState<{
    entryIndex: number;
    mediaIndex: number;
  } | null>(null);
  const [isInspectionSectionPinned, setIsInspectionSectionPinned] =
    useState(false);
  const [heroScale, setHeroScale] = useState(1);

  const hsv = (px: number) => `${px * heroScale}px`;

  // Track when section 2 has reached the top so the top nav can appear.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const actionsRect = heroActionsRef.current?.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (!actionsRect) {
        setIsInspectionSectionPinned(false);
        return;
      }

      setIsInspectionSectionPinned(actionsRect.bottom <= containerRect.top);
    };

    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateHeroScale = () => {
      const widthScale = window.innerWidth / HERO_DESIGN_WIDTH;
      const heightScale = window.innerHeight / HERO_DESIGN_HEIGHT;
      setHeroScale(Math.min(widthScale, heightScale, HERO_MAX_SCALE));
    };

    updateHeroScale();
    window.addEventListener("resize", updateHeroScale, { passive: true });
    return () => window.removeEventListener("resize", updateHeroScale);
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
      title: "Walkthrough Video Record",
      description:
        "Walkthrough Video Record - A brief on-site walkthrough video was recorded during the inspection visit to document existing fence conditions, slope transitions, drainage concerns, and proposed gate location. This video is intended as a visual reference for the homeowner prior to final approval.",
      media: [
        { type: "video", src: FENCE_VIDEO_THUMB_1, thumbSrc: FENCE_VIDEO_THUMB_1 },
        { type: "video", src: FENCE_VIDEO_THUMB_2, thumbSrc: FENCE_VIDEO_THUMB_2 },
      ],
    },
    {
      id: 2,
      title: "Drainage Risk Area",
      description:
        "Drainage Risk Area - Water staining and softened soil were observed near the back-right corner adjacent to the downspout discharge area. This section may be vulnerable to long-term post movement if drainage is not improved. Recommend minor grading correction or extension of the drainage outlet prior to installation.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_1 },
        { type: "image", src: FENCE_REPORT_IMAGE_2 },
        { type: "image", src: FENCE_REPORT_IMAGE_3 },
      ],
    },
    {
      id: 3,
      title: "Soil condition Observation",
      description:
        "Soil condition Observation - rear and right-side yard show moderately compacted clay-heavy soil. Post-hole digging is expected to require additional effort, and concrete setting time may be slightly extended if moisture remains high near the lower section of the yard.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_4 },
        { type: "image", src: FENCE_REPORT_IMAGE_5 },
        { type: "image", src: FENCE_REPORT_IMAGE_6 },
      ],
    },
    {
      id: 4,
      title: "Existing Fence Removal Requirement",
      description:
        "Existing Fence Removal Requirement - Existing wood fence along the rear property line shows leaning posts, warped rails, and multiple deteriorated pickets. Full demolition and disposal of the current fence system is recommended before new installation.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_7 },
        { type: "image", src: FENCE_REPORT_IMAGE_8 },
      ],
    },
    {
      id: 5,
      title: "Property Line Verification Note",
      description:
        "Property Line Verification Note - Fence alignment shown in this proposal is based on visible site conditions and client guidance during walkthrough. Final installation should follow confirmed property boundaries. Survey verification is recommended if boundary location is uncertain.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_9 },
        { type: "image", src: FENCE_REPORT_IMAGE_10 },
        { type: "image", src: FENCE_REPORT_IMAGE_11 },
        { type: "image", src: FENCE_REPORT_IMAGE_12 },
      ],
    },
  ];

  const floorPlanMarkers = [
    { id: 1, x: "45.5%", y: "28.6%" },
    { id: 2, x: "66.9%", y: "29.7%" },
    { id: 3, x: "57.3%", y: "61.9%" },
    { id: 4, x: "76.5%", y: "23.8%" },
    { id: 5, x: "50.6%", y: "50.5%" },
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
        <img
          src={FENCE_HOME_ICON}
          alt="Home"
          style={{ width: sv(17.99), height: sv(15.98) }}
        />
      </button>
      <img
        src={FENCE_NAV_LOGO}
        alt="Madison Fence Company"
        style={{ width: sv(109), height: sv(30), objectFit: "cover" }}
      />
      <button
        onClick={onHome}
        className="flex items-center justify-center text-[#737373]"
        style={{ width: sv(24), height: sv(24) }}
      >
        <img
          src={FENCE_USER_ICON}
          alt="Account"
          style={{ width: sv(14), height: sv(15.98) }}
        />
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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#262626",
          }}
        >
          {/* Company Logo */}
          <div
            style={{
              width: hsv(281),
              height: hsv(281),
              flexShrink: 0,
            }}
          >
            <img
              src={FENCE_HERO_LOGO}
              alt="Madison Fence Company"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Spacer between logo and title block */}
          <div style={{ height: hsv(79), flexShrink: 0 }} />

          {/* Title Block: address + title + prepared for */}
          <div
            className="flex flex-col items-center"
            style={{ flexShrink: 0 }}
          >
            <p
              className="m-0 text-center whitespace-nowrap"
              style={{
                fontSize: hsv(20),
                fontWeight: 300,
                lineHeight: "normal",
              }}
            >
              {"1722 Willis Ave NW, Grand Rapids, MI 49504 "}
            </p>
            <h1
              className="m-0 text-center whitespace-nowrap"
              style={{
                fontSize: hsv(48),
                fontWeight: 300,
                lineHeight: "normal",
                letterSpacing: hsv(-0.48),
              }}
            >
              FENCE REPLACEMENT PROPOSAL
            </h1>
            <p
              className="m-0 text-center whitespace-nowrap"
              style={{
                paddingTop: hsv(8),
                fontSize: hsv(20),
                fontWeight: 300,
                lineHeight: "normal",
              }}
            >
              {"Prepared for Michael Rozier "}
            </p>
          </div>

          {/* Spacer */}
          <div style={{ height: hsv(96), flexShrink: 0 }} />

          {/* Build Your Dream Fence */}
          <p
            className="m-0 text-center whitespace-nowrap"
            style={{
              fontSize: hsv(20),
              fontWeight: 300,
              lineHeight: "normal",
              flexShrink: 0,
            }}
          >
            Build Your Dream Fence
          </p>

          {/* Spacer */}
          <div style={{ height: hsv(49), flexShrink: 0 }} />

          {/* Action Buttons */}
          <div
            ref={heroActionsRef}
            className="flex items-center"
            style={{ gap: hsv(8), flexShrink: 0 }}
          >
            <button
              onClick={scrollToInspection}
              className="flex items-center justify-center transition-opacity hover:opacity-85"
              style={{
                width: hsv(168),
                height: hsv(40),
                border: `${hsv(1)} solid #262626`,
                backgroundColor: "#ffffff",
                color: "rgba(0,0,0,0.85)",
                fontSize: hsv(14),
                fontWeight: 400,
                lineHeight: hsv(18),
                cursor: "pointer",
              }}
            >
              INSPECTION REPORT
            </button>
            <button
              onClick={onContinue}
              className="flex items-center justify-center transition-opacity hover:opacity-85"
              style={{
                width: hsv(168),
                height: hsv(40),
                backgroundColor: "#d41a32",
                color: "#ffffff",
                fontSize: hsv(14),
                fontWeight: 600,
                lineHeight: hsv(18),
                cursor: "pointer",
              }}
            >
              EXPLORE OPTIONS
            </button>
          </div>

          {/* Spacer */}
          <div style={{ height: hsv(14), flexShrink: 0 }} />

          {/* Valid Until */}
          <p
            className="m-0 text-center whitespace-nowrap"
            style={{
              fontSize: hsv(16),
              fontWeight: 300,
              lineHeight: "normal",
              flexShrink: 0,
            }}
          >
            Valid Until: April 30, 2026
          </p>
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
            borderBottom: isInspectionSectionPinned
              ? `0.5px solid rgba(0,0,0,0.2)`
              : "0.5px solid transparent",
            opacity: isInspectionSectionPinned ? 1 : 0,
            pointerEvents: isInspectionSectionPinned ? "auto" : "none",
            transition: "opacity 0.2s ease, border-color 0.2s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: sv(1440),
              margin: "0 auto",
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
                Henderson Backyard Fence
              </p>
              <p
                style={{
                  fontSize: sv(14),
                  fontWeight: 400,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                1722 Willis Ave NW, Grand Rapids, MI 49504
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
                <img
                  src={FENCE_PHONE_ICON}
                  alt=""
                  style={{ width: sv(24), height: sv(22) }}
                />
                <span>Contact Sales</span>
              </button>
              <button
                className="flex items-center justify-center"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  backgroundColor: "rgb(212, 26, 50)",
                  color: "white",
                  border: "none",
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
            <div
              className="bg-white flex flex-col"
              style={{
                borderRadius: sv(12),
                width: sv(1249),
                margin: "0 auto",
                padding: `${sv(16)} ${sv(48)} ${sv(40)}`,
                gap: sv(32),
                boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
              }}
            >
              <div
                className="flex items-center"
                style={{ paddingTop: sv(16) }}
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
              </div>
              <div
                className="flex flex-col justify-between"
                style={{ height: sv(776) }}
              >
                <div
                  className="relative self-center overflow-hidden"
                  style={{
                    width: sv(1109),
                    height: sv(744),
                    borderRadius: sv(4),
                  }}
                >
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ borderRadius: sv(4) }}
                  >
                    <img
                      src={FENCE_REPORT_MAP_IMAGE}
                      alt="Fence inspection drawing"
                      style={{
                        position: "absolute",
                        width: "197.75%",
                        height: "381.45%",
                        left: "-56.4%",
                        top: "-140.73%",
                        maxWidth: "none",
                      }}
                    />
                  </div>
                  {floorPlanMarkers.map((marker) => (
                    <button
                      key={marker.id}
                      onClick={() => openInspectionModal(marker.id - 1, 0)}
                      className="absolute flex items-center justify-center transition-opacity hover:opacity-85 focus:outline-none"
                      style={{
                        left: marker.x,
                        top: marker.y,
                        transform: "translate(-50%, -50%)",
                        width: sv(44),
                        height: sv(44),
                        borderRadius: sv(2),
                        backgroundColor: "#262626",
                        color: "#ffffff",
                        fontSize: sv(24),
                        fontWeight: 700,
                        lineHeight: "normal",
                        fontFamily: "Arial, sans-serif",
                      }}
                      type="button"
                    >
                      {marker.id}
                    </button>
                  ))}
                  <div
                    className="absolute left-0 right-0 bottom-0 flex items-end"
                    style={{ gap: sv(12), padding: `${sv(24)} ${sv(32)}` }}
                  >
                    {[
                      FENCE_ZOOM_IN_ICON,
                      FENCE_ZOOM_OUT_ICON,
                      FENCE_FIT_ICON,
                    ].map((icon, index) => (
                      <button
                        key={icon}
                        className="flex items-center justify-center focus:outline-none"
                        style={{
                          width: sv(48),
                          height: sv(48),
                          borderRadius: sv(4),
                          backgroundColor: "rgba(0,0,0,0.6)",
                          boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.25)",
                          backdropFilter: "blur(2px)",
                          paddingLeft: sv(2),
                        }}
                        aria-label={
                          index === 0
                            ? "Zoom in"
                            : index === 1
                              ? "Zoom out"
                              : "Fit view"
                        }
                        type="button"
                      >
                        <img
                          src={icon}
                          alt=""
                          style={{ width: sv(24), height: sv(24) }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col"
                style={{ gap: sv(24) }}
              >
                {inspectionItems.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="flex flex-col"
                    style={{
                      borderTop: "0.5px solid rgba(0,0,0,0.1)",
                      paddingTop: sv(12),
                      paddingLeft: sv(16),
                      paddingRight: sv(16),
                    }}
                  >
                    <div
                      className="flex items-center"
                      style={{ gap: sv(16) }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: sv(24),
                          height: sv(24),
                          borderRadius: sv(2),
                          backgroundColor: "#262626",
                          color: "#ffffff",
                          fontSize: sv(16),
                          fontWeight: 700,
                          lineHeight: "normal",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        {item.id}
                      </div>
                      <p
                        className="m-0"
                        style={{
                          flex: 1,
                          fontSize: sv(14),
                          fontWeight: 300,
                          color: "#262626",
                          lineHeight: "normal",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                    {item.media.length > 0 && (
                      <div
                        className="flex items-center"
                        style={{
                          gap: sv(4),
                          paddingLeft: sv(40),
                          paddingTop: sv(8),
                        }}
                      >
                        {item.media.map((media, mediaIndex) => {
                          const isVideo = media.type === "video";
                          return (
                            <button
                              key={`${item.id}-${mediaIndex}`}
                              onClick={() =>
                                openInspectionModal(itemIndex, mediaIndex)
                              }
                              className="relative flex items-center justify-center overflow-hidden flex-shrink-0"
                              style={{
                                width: sv(64),
                                height: sv(64),
                                borderRadius: sv(4),
                                border: isVideo
                                  ? `${sv(2)} solid #ffffff`
                                  : "none",
                                padding: isVideo ? 0 : sv(2),
                              }}
                            >
                              <img
                                src={media.thumbSrc ?? media.src}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: isVideo ? sv(4) : sv(2),
                                }}
                              />
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <img
                                    src={FENCE_VIDEO_PLAY_ICON}
                                    alt=""
                                    style={{
                                      width: sv(24),
                                      height: sv(24),
                                    }}
                                  />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
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
  const selectButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
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
    const syncHeaderVisibility = () => {
      const hasVisibleSelectButton = selectButtonRefs.current.some((button) => {
        if (!button) return false;
        const rect = button.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });

      setHideComparisonHeader(hasVisibleSelectButton);
    };

    syncHeaderVisibility();
    window.addEventListener("scroll", syncHeaderVisibility, { passive: true });
    window.addEventListener("resize", syncHeaderVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncHeaderVisibility);
      window.removeEventListener("resize", syncHeaderVisibility);
    };
  }, []);

  const setSelectButtonRef =
    (index: number) => (element: HTMLButtonElement | null) => {
      selectButtonRefs.current[index] = element;
    };

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

  type OptionSummary = {
    title: string;
    description: string;
    duration: string;
    price: string;
    contractTotal: string;
    monthly: string;
    image: string;
  };

  type CompareLineItem = {
    name: string;
    qty: string;
    unit: string;
    img: string;
    imageStyle?: CSSProperties;
    faded?: boolean;
  };

  type CompareDash = { dash: true };

  const optionSummaries: OptionSummary[] = [
    {
      title: "OPTION 1 - CHAIN LINK FENCE",
      description:
        "Durable / Low Maintenance / Cost-Effective Perimeter Security",
      duration: "2–3 Weeks Estimated Construction Time",
      price: "$8,615.00 USD",
      contractTotal: "$8,615.00",
      monthly: "$404.13 / mo",
      image: OPTION_CARD_IMAGE_1,
    },
    {
      title: "OPTION 2 - VINYL TRADITIONS FENCE",
      description:
        "Enhanced Privacy / Clean Appearance / Minimal Maintenance",
      duration: "4–6 Weeks Estimated Construction Time",
      price: "$9,999.00 USD",
      contractTotal: "$9,999.00",
      monthly: "$469.06 / mo",
      image: OPTION_CARD_IMAGE_2,
    },
  ];

  const scheduleData: Array<Array<{ label: string; value: string }>> = [
    [
      { label: "Contract Total", value: optionSummaries[0].contractTotal },
      {
        label: "Estimated Monthly Payment Starting at",
        value: optionSummaries[0].monthly,
      },
      { label: "Estimated Construction Time", value: "2–3 Weeks" },
    ],
    [
      { label: "Contract Total", value: optionSummaries[1].contractTotal },
      {
        label: "Estimated Monthly Payment Starting at",
        value: optionSummaries[1].monthly,
      },
      { label: "Estimated Construction Time", value: "4–6 Weeks" },
    ],
  ];

  const normalizeCompareText = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const findCompareSourceItem = (
    optionIdx: number,
    sectionTitle: string,
    compareItem: CompareLineItem,
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
    compareItem: CompareLineItem,
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
      previewImage: compareItem.img,
    };

    setCompareProductDetailModal({
      item: sourceItem ?? fallbackItem,
      sectionName: sectionTitle,
      measurementLabel: `${compareItem.qty} ${compareItem.unit}`,
      description: `Detailed scope reference for ${compareItem.name.toLowerCase()} in ${optionNames[optionIdx].toLowerCase()}.`,
    });
  };

  const compareSections: Array<{
    title: string;
    columns: (CompareLineItem | CompareDash)[][];
  }> = [
    {
      title: "Fence Parts",
      columns: [
        [
          {
            name: "8F x 4' KK Extruded Blk",
            qty: "2",
            unit: "pcs",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "8F x 5' KK Extruded Blk",
            qty: "2",
            unit: "pcs",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: 'Btm Lock Slat 2" Mesh Dsn',
            qty: "4",
            unit: "pcs",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: 'Btm Lock Slat 2" Mesh Dsn',
            qty: "5",
            unit: "pcs",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "3/8 x 21' SE 17ga Poly Blk",
            qty: "9",
            unit: "rolls",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "5/8 x 8' 16ga Polyester Blk",
            qty: "11",
            unit: "rolls",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "8 x 9' 16ga Polyester Blk",
            qty: "2",
            unit: "rolls",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "3/8 x 8' 16ga Polyester Blk",
            qty: "2",
            unit: "rolls",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
        ],
        [
          {
            name: "Vinyl | Stratford | 4' | Panel | White",
            qty: "17",
            unit: "sec.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "Vinyl | Stratford | 4' | End Post | White",
            qty: "2",
            unit: "pcs.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "Vinyl | Stratford | 4' | Corner Post | White",
            qty: "8",
            unit: "pcs.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: "Vinyl | Stratford | 4' | Line Post | White",
            qty: "32",
            unit: "pcs.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
        ],
      ],
    },
    {
      title: "Gate",
      columns: [
        [
          {
            name: "4 x 5 Weld SWG 17g 9F Blk",
            qty: "1",
            unit: "sets",
            img: OPTION_GATE_IMAGE_1,
          },
          {
            name: "5 x 4 Weld SWG 17g 9F Blk",
            qty: "1",
            unit: "sets",
            img: OPTION_GATE_IMAGE_1,
          },
          {
            name: "5 x 5 Weld SWG 17g 9F Blk",
            qty: "1",
            unit: "sets",
            img: OPTION_GATE_IMAGE_2,
          },
        ],
        [
          {
            name: "Vinyl | Stratford | 4' | 5'W Gate | White",
            qty: "1",
            unit: "sets",
            img: OPTION_GATE_IMAGE_3,
            imageStyle: {
              width: "139%",
              height: "139%",
              left: "-19.5%",
              top: "-19.5%",
              maxWidth: "none",
            },
          },
          {
            name: "Vinyl | Stratford | 5' | 4'W Gate | White",
            qty: "1",
            unit: "sets",
            img: OPTION_GATE_IMAGE_3,
            imageStyle: {
              width: "139%",
              height: "139%",
              left: "-19.5%",
              top: "-19.5%",
              maxWidth: "none",
            },
          },
          {
            name: "Vinyl | Stratford | 5' | 5'W Gate | White",
            qty: "1",
            unit: "sets",
            img: OPTION_GATE_IMAGE_4,
          },
        ],
      ],
    },
    {
      title: "Sections",
      columns: [
        [
          {
            name: `BCL | 5' | 58" Tension Bar`,
            qty: "6",
            unit: "pcs.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: `BCL | 5' | 9' Terminal Post`,
            qty: "6",
            unit: "pcs.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
        ],
        [
          {
            name: `7/8" x 8' CQ20 Galv Post`,
            qty: "2",
            unit: "pcs.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
          {
            name: `5" x 5" Heavy Duty Post Stiffeners for 1 7/8" (2") Post`,
            qty: "2",
            unit: "pcs.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
        ],
      ],
    },
    {
      title: "Hardware",
      columns: [
        [
          {
            name: `3/8" DC Rail End Poly Blk`,
            qty: "4",
            unit: "pcs",
            img: OPTION_HARDWARE_IMAGE_1,
          },
          {
            name: `3/8" Brace Band Poly Blk`,
            qty: "12",
            unit: "pcs.",
            img: OPTION_HARDWARE_IMAGE_2,
            faded: true,
          },
          {
            name: `3/8" DC Cap Poly Blk`,
            qty: "6",
            unit: "pcs.",
            img: OPTION_HARDWARE_IMAGE_2,
            faded: true,
          },
          {
            name: `3/8" Tension Band Poly`,
            qty: "12",
            unit: "pcs.",
            img: OPTION_HARDWARE_IMAGE_3,
          },
        ],
        [
          {
            name: `Vinyl | 5" New England Cap - White`,
            qty: "18",
            unit: "pcs.",
            img: OPTION_HARDWARE_IMAGE_4,
          },
          {
            name: `Vinyl | 5"x5"x96" Aluminum Gate Post Insert`,
            qty: "2",
            unit: "pcs.",
            img: OPTION_HARDWARE_IMAGE_5,
          },
          {
            name: `Vinyl | Std Latch - 1 Side - External - Keyed - Black`,
            qty: "1",
            unit: "sets",
            img: OPTION_HARDWARE_IMAGE_2,
            faded: true,
          },
          {
            name: `Vinyl | Std Self Close Adj Hinge - Pair - Black`,
            qty: "2",
            unit: "pairs",
            img: OPTION_HARDWARE_IMAGE_2,
            faded: true,
          },
        ],
      ],
    },
    {
      title: "Additional Materials",
      columns: [
        [
          {
            name: "Concrete 50 lb Bag",
            qty: "18",
            unit: "bags",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
        ],
        [
          {
            name: "Concrete 50 lb Bag",
            qty: "20",
            unit: "bags",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
        ],
      ],
    },
    {
      title: "Services",
      columns: [
        [
          {
            name: "Soil Condition Survey",
            qty: "2",
            unit: "svc.",
            img: OPTION_CHAIN_PLACEHOLDER,
            faded: true,
          },
        ],
        [{ dash: true as const }],
      ],
    },
  ];

  const optionNames = [
    optionSummaries[0].title,
    optionSummaries[1].title,
  ];

  const OptionCard = ({
    optIdx,
    selectButtonRef,
  }: {
    optIdx: number;
    selectButtonRef?: (element: HTMLButtonElement | null) => void;
  }) => {
    const opt = optionSummaries[optIdx];
    return (
      <div
        className="flex flex-col items-center"
        style={{
          flex: "1 0 0",
          minWidth: 0,
          minHeight: 0,
          backgroundColor: "#EDEDED",
          gap: sv(24),
          paddingBottom: sv(48),
          boxShadow: "0px 4px 16px rgba(0,0,0,0.12), 0px 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="relative w-full shrink-0"
          style={{ aspectRatio: "800/471" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={opt.image}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: `0 ${sv(28)}`, gap: sv(4) }}
        >
          <p
            style={{
              fontSize: sv(18),
              fontWeight: 600,
              color: "#262626",
              width: "100%",
              lineHeight: "normal",
            }}
          >
            {opt.title}
          </p>
        </div>
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: `0 ${sv(28)}`, gap: sv(28) }}
        >
          <div
            className="flex flex-col items-start w-full"
            style={{ gap: sv(4) }}
          >
            <p
              style={{
                fontSize: sv(16),
                color: "#262626",
                width: "100%",
                letterSpacing: sv(-0.16),
                lineHeight: "normal",
              }}
            >
              {opt.description}
            </p>
            <p
              style={{
                fontSize: sv(16),
                color: "#262626",
                width: "100%",
                letterSpacing: sv(-0.16),
                lineHeight: "normal",
              }}
            >
              {opt.duration}
            </p>
            <p
              style={{
                fontSize: sv(22),
                fontWeight: 600,
                color: "#262626",
                width: "100%",
                letterSpacing: sv(-0.22),
                lineHeight: "normal",
              }}
            >
              {opt.price}
            </p>
          </div>
          <div className="flex items-center justify-end w-full">
            <button
              ref={selectButtonRef}
              onClick={() => {
                onSelect(optIdx);
                onContinue();
              }}
              className="flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{
                flex: "1 0 0",
                height: sv(40),
                padding: `${sv(6)} ${sv(16)}`,
                backgroundColor: "#d41a32",
                color: "white",
                fontSize: sv(14),
                fontWeight: 600,
                lineHeight: sv(18),
                borderRadius: sv(4),
              }}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LineItem = ({
    item,
    sectionTitle,
    optionIdx,
  }: {
    item: CompareLineItem | CompareDash;
    sectionTitle: string;
    optionIdx: number;
  }) => {
    if ("dash" in item) {
      return (
        <div
          className="flex items-start w-full"
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
                  opacity: item.faded ? 0.1 : 1,
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
                src={OPTION_INFO_ICON}
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
    <>
    <style>{`
      @keyframes bounceUpDown {
        0%, 100% { transform: translateY(-4px); }
        50% { transform: translateY(12px); }
      }
    `}</style>
    <div
      className="bg-white"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Fixed sticky comparison header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          backgroundColor: "white",
          borderBottom: "0.5px solid rgba(0,0,0,0.2)",
          boxShadow: "0px 4px 3px 0px rgba(123,123,123,0.1)",
          display: hideComparisonHeader ? "none" : undefined,
        }}
      >
        <div
          className="relative flex items-center"
          style={{
            width: sv(1440),
            margin: "0 auto",
            gap: sv(24),
            padding: `0 ${sv(80)}`,
          }}
        >
          {optionNames.map((name, i) => (
            <button
              key={i}
              className="flex items-center"
              style={{
                flex: "1 0 0",
                height: sv(48),
                padding: `0 ${sv(8)}`,
                gap: sv(4),
                border: "none",
                background: "transparent",
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
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </p>
              <div
                className="flex items-center justify-center"
                style={{ width: sv(16), height: sv(16) }}
              >
                <div
                  style={{
                    width: sv(16),
                    height: sv(16),
                    transform: "rotate(90deg)",
                  }}
                >
                  <img
                    src={OPTION_STICKY_CHEVRON}
                    alt=""
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>
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
                {optionSummaries.map((_, i) => (
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
      </div>

      <div style={{ width: sv(1440), minHeight: "100vh", margin: "0 auto" }}>
        <div
          className="flex items-center justify-center"
          style={{ paddingTop: sv(28) }}
        >
          <div
            className="flex items-center justify-between"
            style={{ width: sv(991), height: sv(30) }}
          >
            <button
              onClick={onHome}
              className="flex items-center justify-center"
              style={{ width: sv(24), height: sv(24) }}
            >
              <img
                src={OPTION_HOME_ICON}
                alt="Home"
                style={{ width: sv(17.99), height: sv(15.977) }}
              />
            </button>
            <img
              src={OPTION_LOGO_IMAGE}
              alt="Madison Fence Company"
              style={{ width: sv(109), height: sv(30), objectFit: "cover" }}
            />
            <button
              className="flex items-center justify-center"
              style={{ width: sv(24), height: sv(24) }}
            >
              <img
                src={OPTION_USER_ICON}
                alt="Account"
                style={{ width: sv(14), height: sv(15.977) }}
              />
            </button>
          </div>
        </div>

        <div
          className="flex flex-col items-center"
          style={{
            width: sv(1440),
            padding: `${sv(41)} ${sv(80)} ${sv(80)}`,
            gap: sv(96),
          }}
        >
          <div
            className="flex flex-col items-center"
            style={{ width: "100%", gap: sv(24) }}
          >
            <div
              className="flex items-start"
              style={{ width: "100%", gap: sv(32) }}
            >
              {optionSummaries.map((_, i) => (
                <OptionCard
                  key={i}
                  optIdx={i}
                  selectButtonRef={setSelectButtonRef(i)}
                />
              ))}
            </div>
            <div
              className="flex flex-col items-center"
              style={{ gap: sv(16), paddingBottom: sv(64), paddingTop: sv(16) }}
            >
              <div
                className="text-center whitespace-nowrap"
                style={{ fontSize: sv(14), color: "#262626", lineHeight: 0 }}
              >
                <p style={{ fontWeight: 600, marginBottom: sv(4), lineHeight: "normal" }}>
                  {"Need support choosing a option? "}
                </p>
                <p style={{ fontWeight: 300, lineHeight: "normal" }}>
                  Compare different options to help you decide which one fits you
                  best.
                </p>
              </div>
              <button
                onClick={scrollToCompare}
                className="flex flex-col items-center justify-center"
                style={{
                  padding: `${sv(6)} ${sv(4)}`,
                  gap: sv(4),
                  borderRadius: sv(4),
                  background: "transparent",
                  border: "none",
                  color: "#262626",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: sv(20), fontWeight: 300, lineHeight: sv(18), whiteSpace: "nowrap" }}>
                  Compare Options
                </span>
                <div
                  className="overflow-hidden relative"
                  style={{
                    width: sv(24),
                    height: sv(24),
                    animation: "bounceUpDown 1.5s ease-in-out infinite",
                  }}
                >
                  <img
                    src={OPTION_COMPARE_ICON}
                    alt=""
                    style={{
                      position: "absolute",
                      width: sv(10.131),
                      height: sv(10.131),
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
              </button>
            </div>
          </div>

          <div ref={compareRef} className="flex flex-col items-center" style={{ width: "100%", gap: sv(64) }}>
            <div className="flex flex-col items-center" style={{ width: "100%", gap: sv(32) }}>
              <p
                style={{
                  fontSize: sv(28),
                  fontWeight: 600,
                  color: "#262626",
                  textAlign: "center",
                  lineHeight: "normal",
                  width: "100%",
                }}
              >
                Schedule and Pricing
              </p>
              <div className="flex items-start" style={{ width: "100%", gap: sv(32) }}>
                {scheduleData.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col" style={{ flex: "1 0 0" }}>
                    {column.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex flex-col items-start"
                        style={{
                          borderTop: "0.5px solid rgba(0,0,0,0.1)",
                          padding: `${sv(16)} 0`,
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            width: "100%",
                            fontSize: sv(14),
                            color: "#737373",
                            letterSpacing: sv(-0.14),
                            lineHeight: "normal",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            width: "100%",
                            fontSize: sv(24),
                            fontWeight: 600,
                            color: "#262626",
                            lineHeight: "normal",
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

            {compareSections.map((section) => (
              <div
                key={section.title}
                className="flex flex-col items-center"
                style={{ width: "100%", gap: sv(32) }}
              >
                <p
                  style={{
                    fontSize: sv(28),
                    fontWeight: 600,
                    color: "#262626",
                    textAlign: "center",
                    lineHeight: "normal",
                    width: "100%",
                  }}
                >
                  {section.title}
                </p>
                <div
                  className="flex items-start"
                  style={{ width: "100%", gap: sv(32) }}
                >
                  {section.columns.map((items, columnIndex) => (
                    <div
                      key={columnIndex}
                      className="flex flex-col items-start"
                      style={{ flex: "1 0 0" }}
                    >
                      {items.map((item, itemIndex) => (
                        <LineItem
                          key={itemIndex}
                          item={item}
                          sectionTitle={section.title}
                          optionIdx={columnIndex}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex flex-col items-start"
            style={{ width: "100%", gap: sv(40) }}
          >
            <div
              className="flex flex-col items-center"
              style={{ width: "100%", gap: sv(2) }}
            >
              <p
                style={{
                  width: "100%",
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
                className="flex items-center justify-center"
                style={{
                  width: sv(276),
                  height: sv(40),
                  padding: `${sv(6)} ${sv(12)}`,
                  gap: sv(4),
                  borderRadius: sv(4),
                  border: "none",
                  backgroundColor: "#ffffff",
                  color: "rgba(0,0,0,0.85)",
                }}
              >
                <div
                  className="flex items-center justify-end"
                  style={{ width: sv(20) }}
                >
                  <div
                    className="relative"
                    style={{ width: sv(24), height: sv(24) }}
                  >
                    <img
                      src={OPTION_BACK_TO_TOP_ICON}
                      alt=""
                      style={{
                        position: "absolute",
                        width: sv(12.008),
                        height: sv(14),
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: sv(14), lineHeight: sv(18) }}>
                  Back to Top
                </span>
              </button>
            </div>
            <div
              className="flex items-start"
              style={{ width: "100%", gap: sv(32) }}
            >
              {optionSummaries.map((_, i) => (
                <OptionCard
                  key={i}
                  optIdx={i}
                  selectButtonRef={setSelectButtonRef(i + optionSummaries.length)}
                />
              ))}
            </div>
          </div>
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
    </>
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
                      style={{
                        opacity: isPlaceholderProductImage(item.thumbnailSrc)
                          ? 0.1
                          : 1,
                      }}
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
                      style={{
                        opacity: isPlaceholderProductImage(item.thumbnailSrc)
                          ? 0.1
                          : 1,
                      }}
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
              {CONTRACT_PAGES.map((pageSrc, index) => (
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
            className="w-full bg-[#d41a32] text-white font-semibold flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ height: sv(40), fontSize: sv(14), borderRadius: sv(2) }}
            onClick={() => {
              onClose();
              onApprove();
            }}
          >
            Sign
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
    return [];
  };
  const currentImages = getImagesForSwatch(activeSwatchIdx);
  const mainImage = currentImages[activeThumb] ?? currentImages[0] ?? null;
  const hasOnlyPlaceholderImages =
    currentImages.length > 0 &&
    currentImages.every((src) => isPlaceholderProductImage(src));
  // Only dim placeholder assets; real product photos should render normally.
  const imgOpacity = hasOnlyPlaceholderImages ? 0.1 : 1;

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
            {hasOnlyPlaceholderImages ? (
              <div
                className="relative w-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  height: sv(577),
                  borderRadius: sv(8),
                  backgroundColor: "#d9d9d9",
                }}
              >
                <div
                  className="relative flex-shrink-0"
                  style={{ width: sv(175), height: sv(175) }}
                >
                  <Image
                    src={PRODUCT_DETAIL_EMPTY_LOGO}
                    alt=""
                    fill
                    sizes="175px"
                    className="object-contain"
                    style={{ opacity: 0.95, mixBlendMode: "screen" }}
                  />
                </div>
              </div>
            ) : (
              /* Hero image: aspect 732:510, border-radius 8px */
              <div
                className="relative w-full overflow-hidden bg-[#f0f0f0]"
                style={{ aspectRatio: "732/510", borderRadius: sv(8) }}
              >
                {mainImage && (
                  <Image
                    src={mainImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="840px"
                    style={{ opacity: imgOpacity }}
                  />
                )}
              </div>
            )}

            {/* Thumbnail strip: 3 photos of the current product — gap 8px, 86×64 each */}
            {!hasOnlyPlaceholderImages && currentImages.length > 0 && (
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
                        style={{ opacity: imgOpacity }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                {!hasOnlyPlaceholderImages && swatches.length > 0 && (
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
            {!hideSelectButton && !hasOnlyPlaceholderImages && (
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
  const [showSignModal, setShowSignModal] = useState(false);
  const [drawingZoom, setDrawingZoom] = useState(1);
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [modalZoom, setModalZoom] = useState(1);
  const [productDetailModal, setProductDetailModal] = useState<{
    item: ODAItem;
    sectionName: string;
    onSelect: (swatchIdx: number) => void;
  } | null>(null);

  // Fixed product sections for Option 2 - Vinyl Traditions Fence
  const mkItem = (id: string, name: string, price: number, img: string): ODAItem => ({
    id, name, spec: "", price, previewImage: img,
  });
  const fenceParts: SummaryLineItem[] = [
    { name: "Vinyl | Stratford | 4' | Panel | White", qty: "17", unit: "sec.", price: 2125, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("fp-1", "Vinyl | Stratford | 4' | Panel | White", 2125, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Stratford | 4' | End Post | White", qty: "2", unit: "pcs", price: 140, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("fp-2", "Vinyl | Stratford | 4' | End Post | White", 140, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Stratford | 4' | Corner Post | White", qty: "8", unit: "pcs.", price: 520, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("fp-3", "Vinyl | Stratford | 4' | Corner Post | White", 520, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Stratford | 4' | Line Post | White", qty: "32", unit: "pcs", price: 760, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("fp-4", "Vinyl | Stratford | 4' | Line Post | White", 760, FENCE_THUMB_PANEL) },
  ];
  const gateItems: SummaryLineItem[] = [
    { name: "Vinyl | Stratford | 4' | 5'W Gate | White", qty: "1", unit: "sets", price: 560, thumbnailSrc: FENCE_THUMB_GATE_1, showChange: false, odaItem: mkItem("g-1", "Vinyl | Stratford | 4' | 5'W Gate | White", 560, FENCE_THUMB_GATE_1) },
    { name: "Vinyl | Stratford | 5' | 4'W Gate | White", qty: "1", unit: "sets", price: 520, thumbnailSrc: FENCE_THUMB_GATE_1, showChange: false, odaItem: mkItem("g-2", "Vinyl | Stratford | 5' | 4'W Gate | White", 520, FENCE_THUMB_GATE_1) },
    { name: "Vinyl | Stratford | 5' | 5'W Gate | White", qty: "1", unit: "sets", price: 610, thumbnailSrc: FENCE_THUMB_GATE_3, showChange: false, odaItem: mkItem("g-3", "Vinyl | Stratford | 5' | 5'W Gate | White", 610, FENCE_THUMB_GATE_3) },
  ];
  const sectionParts: SummaryLineItem[] = [
    { name: `7/8" x 8' CQ20 Galv Post`, qty: "2", unit: "pcs.", price: 90, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("sp-1", `7/8" x 8' CQ20 Galv Post`, 90, FENCE_THUMB_PANEL) },
    { name: `5" x 5" Heavy Duty Post Stiffeners for 1 7/8" (2") Post`, qty: "2", unit: "pcs.", price: 120, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("sp-2", `5" x 5" Heavy Duty Post Stiffeners`, 120, FENCE_THUMB_PANEL) },
  ];
  const hardwareItems: SummaryLineItem[] = [
    { name: `Vinyl | 5" New England Cap - White`, qty: "18", unit: "pcs.", price: 85, thumbnailSrc: FENCE_THUMB_CAP, showChange: false, odaItem: mkItem("hw-1", `Vinyl | 5" New England Cap - White`, 85, FENCE_THUMB_CAP) },
    { name: `Vinyl | 5"x5"x96" Aluminum Gate Post Insert`, qty: "2", unit: "pcs.", price: 140, thumbnailSrc: FENCE_THUMB_POST_INSERT, showChange: false, odaItem: mkItem("hw-2", `Vinyl | 5"x5"x96" Aluminum Gate Post Insert`, 140, FENCE_THUMB_POST_INSERT) },
    { name: "Vinyl | Std Latch - 1 Side - External - Keyed - Black", qty: "1", unit: "sets", price: 95, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("hw-3", "Vinyl | Std Latch - 1 Side - External - Keyed - Black", 95, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Std Self Close Adj Hinge - Pair - Black", qty: "2", unit: "pairs", price: 110, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("hw-4", "Vinyl | Std Self Close Adj Hinge - Pair - Black", 110, FENCE_THUMB_PANEL) },
  ];
  const additionalMaterial: SummaryLineItem[] = [
    { name: "Concrete 50 lb Bag", qty: "20", unit: "bags", price: 305, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem("am-1", "Concrete 50 lb Bag", 305, FENCE_THUMB_PANEL) },
  ];

  const handleProductInfoClick = (item: SummaryLineItem) => {
    if (!item.odaItem) return;
    setProductDetailModal({
      item: item.odaItem,
      sectionName: item.sectionName ?? item.name,
      onSelect: () => undefined,
    });
  };

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

          {/* Nav Row 2: Change Option only */}
          <div
            className="flex items-center border-b"
            style={{
              paddingTop: sv(16),
              paddingBottom: sv(16),
              paddingLeft: sv(32),
              paddingRight: sv(32),
              borderBottomWidth: "0.5px",
              borderColor: "rgba(0,0,0,0.2)",
            }}
          >
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
          </div>
        </div>
      </div>

      {/* Main content: left 840px + right 505px */}
      <div
        className="flex items-start justify-between"
        style={{
          width: sv(1440),
          margin: "0 auto",
          paddingLeft: sv(32),
          paddingRight: sv(32),
          paddingTop: sv(25),
          paddingBottom: sv(64),
        }}
      >
        {/* ── Left column: Drawings + Products + Reviews ── */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{ width: sv(840), gap: sv(27) }}
        >
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
            <div className="flex items-center" style={{ paddingTop: sv(16) }}>
              <p
                className="font-semibold text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ fontSize: sv(14) }}
              >
                All Included/Selected Products
              </p>
            </div>
            <SummaryGroup name="Fence Parts" items={fenceParts} onInfoClick={handleProductInfoClick} />
            <SummaryGroup name="Gate" items={gateItems} onInfoClick={handleProductInfoClick} />
            <SummaryGroup name="Sections" items={sectionParts} onInfoClick={handleProductInfoClick} />
            <SummaryGroup name="Hardware" items={hardwareItems} onInfoClick={handleProductInfoClick} />
            <SummaryGroup name="Additional Material" items={additionalMaterial} onInfoClick={handleProductInfoClick} />
          </div>

          {/* Drawings card */}
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
                Drawings
              </p>
            </div>
            <div
              className="relative"
              style={{ width: sv(792), height: sv(539) }}
            >
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
                    src={FENCE_DRAWING_MAP}
                    alt="Fence Drawing"
                    fill
                    className="object-contain"
                    sizes="792px"
                  />
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 flex items-center"
                style={{ gap: sv(12), padding: `${sv(24)} ${sv(32)}` }}
              >
                <button
                  onClick={() => setDrawingZoom((z) => Math.min(z + 0.25, 3))}
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
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: sv(24), height: sv(24) }}>
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                    <path d="M7.5 10.5h6M10.5 7.5v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setDrawingZoom((z) => Math.max(z - 0.25, 0.5))}
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
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: sv(24), height: sv(24) }}>
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                    <path d="M7.5 10.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => { setModalZoom(1); setDrawingModalOpen(true); }}
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
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: sv(24), height: sv(24) }}>
                    <path d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
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
            <div style={{ height: sv(60), display: "flex", alignItems: "center" }}>
              <ODALogo size="lg" />
            </div>
            <div className="flex flex-col" style={{ gap: sv(8) }}>
              <p className="font-semibold text-[#262626]" style={{ fontSize: sv(16) }}>
                Madison Fence Company
              </p>
              <div className="flex items-center" style={{ gap: sv(16) }}>
                <div className="flex items-center" style={{ gap: sv(4) }}>
                  <svg viewBox="0 0 24 24" fill="#262626" style={{ width: sv(16), height: sv(16) }}>
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  <span className="text-[#262626]" style={{ fontSize: sv(14) }}>4.6</span>
                </div>
                <span className="text-[#262626]" style={{ fontSize: sv(14) }}>(882 reviews)</span>
                <span className="text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: sv(14), fontWeight: 300 }}>
                  https://www.gomadisonfence.com/
                </span>
              </div>
            </div>
            <div className="flex flex-col" style={{ gap: sv(24), fontWeight: 300, lineHeight: 1.5 }}>
              {[
                {
                  quote: `"I had such a great experience with Madison Fence Company! From start to finish, everything was handled so smoothly and professionally. Pei, the owner, is truly wonderful, knowledgeable, honest, and committed to making sure the job is done right. Junyu, who handles the scheduling, is equally fantastic, she's so organized, friendly, and always kept me updated, which made the whole process stress-free."`,
                  author: "— Aileen, Grand Rapids Michigan",
                },
                {
                  quote: `"First and foremost. I'd like to say this about Madison Fence Company. When I needed someone to come out and look at my fencing to get me a quote? Not only were they johnny on the spot with fast service the quote was extremely reasonable. Their workers were very courteous, professional and experienced. This company was and will always be my first choice for my home needs for fencing replacement and repairs. Thanks guys for being of great service."`,
                  author: "— Joe, Grand Rapids, Michigan",
                },
                {
                  quote: `"We had an outstanding experience from start to finish! The communication throughout the entire process was top notch! The team's knowledge and professionalism was excellent every step of the way. They helped guide us seamlessly through HOA and city requirements, which made the project stress free. Michael was fantastic. Mary in the office was always prompt and clear with updates. Henry, our project manager, was kind, knowledgeable, and incredibly helpful. Isaac, our installer, did an amazing job. The fence looks perfect and it was all completed in just two days. Truly a 10 out of 10 experience. Highly recommend!"`,
                  author: "— Mary, Grand Rapids Michigan",
                },
              ].map((r, i) => (
                <div key={i} className="flex flex-col" style={{ gap: sv(4) }}>
                  <p className="text-[#262626]" style={{ fontSize: sv(12), letterSpacing: "-0.24px" }}>{r.quote}</p>
                  <p className="text-[#262626]" style={{ fontSize: sv(11), letterSpacing: "-0.22px" }}>{r.author}</p>
                </div>
              ))}
            </div>
            <button className="text-[#262626] underline text-left w-fit" style={{ fontSize: sv(14) }}>
              Read more
            </button>
          </div>
        </div>

        {/* ── Right column: pricing summary ── */}
        <div
          className="flex-shrink-0 flex flex-col sticky"
          style={{ width: sv(505), gap: sv(23), top: sv(140) }}
        >
          {/* Title */}
          <div className="flex flex-col" style={{ gap: sv(4) }}>
            <div className="flex flex-col text-[#262626]">
              <p className="font-semibold" style={{ fontSize: sv(20) }}>
                SUMMARY - OPTION 2 - VINYL TRADITIONS FENCE
              </p>
              <p style={{ fontSize: sv(14) }}>Henderson Backyard Fence</p>
            </div>
          </div>

          {/* Contract Total + Monthly Payment */}
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
                $9,999.00
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
                $469.06 / mo
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
              { label: "Materials & Installation", value: "$9,030" },
              { label: "Discount -5%", value: "$300" },
              { label: "Sales Tax & Fees", value: "$1,269" },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col" style={{ paddingBottom: sv(2) }}>
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
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col" style={{ gap: sv(12) }}>
            {/* Sign & Approve — RED */}
            <button
              className="w-full text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
              style={{
                height: sv(40),
                fontSize: sv(14),
                borderRadius: sv(4),
                backgroundColor: "#d41a32",
              }}
              onClick={() => setShowSignModal(true)}
            >
              Sign &amp; Approve
            </button>
            {/* Explore Payment & Financing */}
            <button
              className="w-full border border-[#262626] bg-white text-[#262626] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
              style={{ height: sv(40), fontSize: sv(14), borderRadius: sv(4), gap: sv(4) }}
            >
              <svg viewBox="0 0 11 14" fill="none" className="flex-shrink-0" style={{ width: sv(11), height: sv(14) }}>
                <rect x="0.5" y="0.5" width="10" height="13" rx="1" stroke="currentColor" strokeWidth="1" />
                <path d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
              </svg>
              Explore Payment &amp; Financing
            </button>
            {/* Contact Sales + Download Config */}
            <div className="flex" style={{ gap: sv(12) }}>
              <button
                className="flex-1 border border-[#262626] bg-white text-[#262626] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                style={{ height: sv(40), fontSize: sv(14), borderRadius: sv(4), gap: sv(4) }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="flex-shrink-0" style={{ width: sv(16), height: sv(16) }}>
                  <path d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                </svg>
                Contact Sales
              </button>
              <button
                className="flex-1 border border-[#262626] bg-white text-[#262626] flex items-center justify-center hover:bg-[#262626] hover:text-white transition-colors"
                style={{ height: sv(40), fontSize: sv(14), borderRadius: sv(4), gap: sv(4) }}
              >
                <svg viewBox="0 0 17 18" fill="none" className="flex-shrink-0" style={{ width: sv(17), height: sv(18) }}>
                  <path d="M8.5 1v11M3.5 7l5 5 5-5M1 17h15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download Config [PDF]
              </button>
            </div>
          </div>

          {/* Inspection Report */}
          <button
            className="flex items-center text-[#262626] hover:opacity-60 transition-opacity"
            style={{
              height: sv(32),
              gap: sv(4),
              paddingLeft: sv(4),
              paddingRight: sv(4),
              borderRadius: sv(4),
            }}
          >
            <span
              className="flex items-center justify-end flex-shrink-0"
              style={{ width: sv(20) }}
            >
              <svg viewBox="0 0 24 24" fill="none" style={{ width: sv(24), height: sv(24) }}>
                <rect x="4.5" y="4" width="15" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8.5 4V3.5C8.5 3.224 8.724 3 9 3h6c.276 0 .5.224.5.5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ fontSize: sv(14) }}>Inspection Report</span>
          </button>

          {/* Footnotes */}
          <div
            className="flex flex-col"
            style={{ gap: sv(12), paddingTop: sv(24), fontWeight: 300, lineHeight: 1.5 }}
          >
            <p className="text-[#262626]" style={{ fontSize: sv(11), letterSpacing: "-0.22px" }}>
              <sup style={{ fontSize: "7px" }}>1 </sup>
              Total project pricing is subject to change based on applicable
              taxes, fees, payment timing, and any final project
              adjustments. The final amount presented at the time of payment
              will control.
            </p>
            <p className="text-[#262626]" style={{ fontSize: sv(11), letterSpacing: "-0.22px" }}>
              <sup style={{ fontSize: "7px" }}>2 </sup>
              Any monthly payment information shown is an estimate only and
              is not a financing offer. Final payment amounts, interest
              rates, and loan terms are subject to lender review and will be
              confirmed during the formal application process.
            </p>
            <button className="text-[#262626] underline text-left w-fit" style={{ fontSize: sv(11) }}>
              Read more
            </button>
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
            <button
              onClick={() => setDrawingModalOpen(false)}
              className="absolute flex items-center justify-center hover:bg-[#f0f0f0] transition-colors text-[#262626]"
              style={{ top: sv(20), right: sv(20), width: sv(32), height: sv(32), borderRadius: "50%" }}
            >
              <svg viewBox="0 0 14 14" fill="none" style={{ width: sv(14), height: sv(14) }}>
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="relative flex-1 overflow-hidden" style={{ borderRadius: sv(8) }}>
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${modalZoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease",
                }}
              >
                <Image src={FENCE_DRAWING_MAP} alt="Fence Drawing" fill className="object-contain" sizes="1104px" />
              </div>
              <div className="absolute flex items-center" style={{ bottom: sv(24), left: sv(32), gap: sv(12) }}>
                <button
                  onClick={() => setModalZoom((z) => Math.min(z + 0.25, 3))}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: sv(48), height: sv(48), borderRadius: sv(4), backdropFilter: "blur(2px)", backgroundColor: "rgba(0,0,0,0.6)", boxShadow: "0 0 2px rgba(0,0,0,0.25)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: sv(24), height: sv(24) }}>
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                    <path d="M7.5 10.5h6M10.5 7.5v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setModalZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: sv(48), height: sv(48), borderRadius: sv(4), backdropFilter: "blur(2px)", backgroundColor: "rgba(0,0,0,0.6)", boxShadow: "0 0 2px rgba(0,0,0,0.25)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: sv(24), height: sv(24) }}>
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="1.5" />
                    <path d="M7.5 10.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 16l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setModalZoom(1)}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: sv(48), height: sv(48), borderRadius: sv(4), backdropFilter: "blur(2px)", backgroundColor: "rgba(0,0,0,0.6)", boxShadow: "0 0 2px rgba(0,0,0,0.25)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: sv(24), height: sv(24) }}>
                    <path d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  const [approvedContractZoom, setApprovedContractZoom] = useState(1);
  const tabs = [
    "Project Home",
    "Contract",
    "Documents",
    "Products",
    "Drawings",
    "Invoices & Payments",
  ];

  const mkItem2 = (id: string, name: string, price: number, img: string): ODAItem => ({
    id, name, spec: "", price, previewImage: img,
  });
  const fenceParts: SummaryLineItem[] = [
    { name: "Vinyl | Stratford | 4' | Panel | White", qty: "17", unit: "sec.", price: 2125, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("fp-1", "Vinyl | Stratford | 4' | Panel | White", 2125, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Stratford | 4' | End Post | White", qty: "2", unit: "pcs", price: 140, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("fp-2", "Vinyl | Stratford | 4' | End Post | White", 140, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Stratford | 4' | Corner Post | White", qty: "8", unit: "pcs.", price: 520, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("fp-3", "Vinyl | Stratford | 4' | Corner Post | White", 520, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Stratford | 4' | Line Post | White", qty: "32", unit: "pcs", price: 760, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("fp-4", "Vinyl | Stratford | 4' | Line Post | White", 760, FENCE_THUMB_PANEL) },
  ];
  const gateItems: SummaryLineItem[] = [
    { name: "Vinyl | Stratford | 4' | 5'W Gate | White", qty: "1", unit: "sets", price: 560, thumbnailSrc: FENCE_THUMB_GATE_1, showChange: false, odaItem: mkItem2("g-1", "Vinyl | Stratford | 4' | 5'W Gate | White", 560, FENCE_THUMB_GATE_1) },
    { name: "Vinyl | Stratford | 5' | 4'W Gate | White", qty: "1", unit: "sets", price: 520, thumbnailSrc: FENCE_THUMB_GATE_1, showChange: false, odaItem: mkItem2("g-2", "Vinyl | Stratford | 5' | 4'W Gate | White", 520, FENCE_THUMB_GATE_1) },
    { name: "Vinyl | Stratford | 5' | 5'W Gate | White", qty: "1", unit: "sets", price: 610, thumbnailSrc: FENCE_THUMB_GATE_3, showChange: false, odaItem: mkItem2("g-3", "Vinyl | Stratford | 5' | 5'W Gate | White", 610, FENCE_THUMB_GATE_3) },
  ];
  const sectionParts: SummaryLineItem[] = [
    { name: `7/8" x 8' CQ20 Galv Post`, qty: "2", unit: "pcs.", price: 90, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("sp-1", `7/8" x 8' CQ20 Galv Post`, 90, FENCE_THUMB_PANEL) },
    { name: `5" x 5" Heavy Duty Post Stiffeners for 1 7/8" (2") Post`, qty: "2", unit: "pcs.", price: 120, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("sp-2", `5" x 5" Heavy Duty Post Stiffeners`, 120, FENCE_THUMB_PANEL) },
  ];
  const hardwareItems: SummaryLineItem[] = [
    { name: `Vinyl | 5" New England Cap - White`, qty: "18", unit: "pcs.", price: 85, thumbnailSrc: FENCE_THUMB_CAP, showChange: false, odaItem: mkItem2("hw-1", `Vinyl | 5" New England Cap - White`, 85, FENCE_THUMB_CAP) },
    { name: `Vinyl | 5"x5"x96" Aluminum Gate Post Insert`, qty: "2", unit: "pcs.", price: 140, thumbnailSrc: FENCE_THUMB_POST_INSERT, showChange: false, odaItem: mkItem2("hw-2", `Vinyl | 5"x5"x96" Aluminum Gate Post Insert`, 140, FENCE_THUMB_POST_INSERT) },
    { name: "Vinyl | Std Latch - 1 Side - External - Keyed - Black", qty: "1", unit: "sets", price: 95, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("hw-3", "Vinyl | Std Latch - 1 Side - External - Keyed - Black", 95, FENCE_THUMB_PANEL) },
    { name: "Vinyl | Std Self Close Adj Hinge - Pair - Black", qty: "2", unit: "pairs", price: 110, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("hw-4", "Vinyl | Std Self Close Adj Hinge - Pair - Black", 110, FENCE_THUMB_PANEL) },
  ];
  const additionalMaterial: SummaryLineItem[] = [
    { name: "Concrete 50 lb Bag", qty: "20", unit: "bags", price: 305, thumbnailSrc: FENCE_THUMB_PANEL, showChange: false, odaItem: mkItem2("am-1", "Concrete 50 lb Bag", 305, FENCE_THUMB_PANEL) },
  ];

  const [approvedProductDetailModal, setApprovedProductDetailModal] = useState<{
    item: ODAItem;
    sectionName: string;
    onSelect: (swatchIdx: number) => void;
  } | null>(null);
  const handleApprovedProductInfoClick = (item: SummaryLineItem) => {
    if (!item.odaItem) return;
    setApprovedProductDetailModal({
      item: item.odaItem,
      sectionName: item.sectionName ?? item.name,
      onSelect: () => undefined,
    });
  };

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
              padding: `${sv(32)} ${sv(32)} 0`,
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
                    padding: `${sv(6)} ${sv(12)} ${sv(16)}`,
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
          style={{ width: activeTab === "Contract" ? "100%" : sv(840), gap: sv(27) }}
        >
          {activeTab === "Contract" ? (
            <div
              className="flex flex-col relative"
              style={{
                width: "100%",
                maxWidth: sv(902),
                margin: "0 auto",
                gap: sv(16),
              }}
            >
              <div
                className="flex flex-col bg-[#f5f5f5]"
                style={{
                  width: `${approvedContractZoom * 100}%`,
                  minWidth: "100%",
                  gap: sv(16),
                }}
              >
                {CONTRACT_PAGES.map((pageSrc, index) => (
                  <div
                    key={pageSrc}
                    style={{
                      border: "1px solid rgba(0,0,0,0.16)",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <Image
                      src={pageSrc}
                      alt={`Contract page ${index + 1}`}
                      width={2380}
                      height={3368}
                      className="w-full h-auto block bg-white"
                    />
                  </div>
                ))}
              </div>
              <div
                className="sticky flex"
                style={{
                  bottom: sv(24),
                  left: 0,
                  gap: sv(12),
                  width: "fit-content",
                }}
              >
                  <button
                    onClick={() =>
                      setApprovedContractZoom((z) => Math.min(z + 0.25, 2))
                    }
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
                  <button
                    onClick={() =>
                      setApprovedContractZoom((z) => Math.max(z - 0.25, 0.5))
                    }
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
                  <button
                    onClick={() => setApprovedContractZoom(1)}
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
          ) : (
            <>
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
                <SummaryGroup name="Fence Parts" items={fenceParts} onInfoClick={handleApprovedProductInfoClick} />
                <SummaryGroup name="Gate" items={gateItems} onInfoClick={handleApprovedProductInfoClick} />
                <SummaryGroup name="Sections" items={sectionParts} onInfoClick={handleApprovedProductInfoClick} />
                <SummaryGroup name="Hardware" items={hardwareItems} onInfoClick={handleApprovedProductInfoClick} />
                <SummaryGroup name="Additional Material" items={additionalMaterial} onInfoClick={handleApprovedProductInfoClick} />
              </div>

              {/* Drawings card */}
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
                  <p className="font-semibold text-[#262626] overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: sv(14) }}>
                    Drawings
                  </p>
                </div>
                <div className="relative" style={{ width: sv(792), height: sv(539) }}>
                  <div className="overflow-hidden relative" style={{ width: sv(792), height: sv(521) }}>
                    <Image
                      src={FENCE_DRAWING_MAP}
                      alt="Fence Drawing"
                      fill
                      className="object-contain"
                      sizes="792px"
                    />
                  </div>
                </div>
              </div>

              {/* Fence Extended Warranty — full-bleed image card */}
              <div
                className="relative overflow-hidden flex-shrink-0 w-full"
                style={{
                  aspectRatio: "1365 / 1024",
                  borderRadius: sv(12),
                  boxShadow: "0px 2px 10px 0px rgba(0,0,0,0.12), 0px 1px 2px 0px rgba(0,0,0,0.06)",
                }}
              >
                <Image
                  src={FENCE_WARRANTY_IMG}
                  alt="Fence Extended Warranty"
                  fill
                  className="object-cover"
                  sizes="840px"
                />
              </div>
            </>
          )}
        </div>

        {activeTab !== "Contract" ? (
          /* Right column: 505px, sticky */
          <div
            className="flex-shrink-0 flex flex-col items-center sticky"
            style={{ width: sv(505), gap: sv(23), top: sv(158) }}
          >
            {/* Title */}
            <div className="flex flex-col w-full text-[#262626] leading-normal">
              <p className="font-semibold w-full" style={{ fontSize: sv(20) }}>
                Fence Replacement - Henderson Backyard Fence
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
                    <span className="text-[#262626]">$4,998 / </span>
                    <span className="text-[#737373]">$9,999</span>
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
                  $4,999
                </p>
                <p
                  className="text-[#262626] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontSize: sv(12) }}
                >
                  100% balance due at project completion{" "}
                  <span style={{ fontWeight: 300 }}>&lt;5/26/2028&gt;</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col w-full" style={{ gap: sv(12) }}>
              {/* Make A Payment */}
              <button
                className="w-full bg-[#d41a32] text-white font-semibold flex items-center justify-center hover:opacity-80 transition-opacity"
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

	              {/* Contact Sales + Download Contract */}
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
	                      viewBox="0 0 17 18"
	                      fill="none"
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
	                  </span>
	                  Download Contract [PDF]
	                </button>
	              </div>
	            </div>

	            {/* Download links */}
	            <div className="flex flex-col w-full">
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
        ) : null}
      </div>
      {approvedProductDetailModal && (
        <ProductDetailModal
          item={approvedProductDetailModal.item}
          sectionName={approvedProductDetailModal.sectionName}
          onSelect={approvedProductDetailModal.onSelect}
          onClose={() => setApprovedProductDetailModal(null)}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ODAProposalPageCopy({
  initialScreen = "email",
}: {
  initialScreen?: Screen;
}) {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [selectedOption, setSelectedOption] = useState(0);
  const [visible, setVisible] = useState(true);
  const goToLanding = () => setScreen("landing");

  const navigateTo = (next: Screen) => {
    setVisible(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setScreen(next);
      requestAnimationFrame(() => {
        setVisible(true);
      });
    }, 150);
  };

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


  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {screen === "email" && (
        <EmailScreen onContinue={() => navigateTo("landing")} />
      )}
      {screen === "landing" && (
        <LandingScreen
          onContinue={() => navigateTo("options")}
          onHome={goToLanding}
        />
      )}
      {screen === "options" && (
        <OptionsScreen
          selectedOption={selectedOption}
          onSelect={setSelectedOption}
          onContinue={() => navigateTo("detail")}
          onHome={goToLanding}
        />
      )}
      {screen === "detail" && (
        <DetailScreen
          option={odaOptions[selectedOption]}
          onBack={() => navigateTo("options")}
          onApprove={() => navigateTo("approved")}
          onHome={goToLanding}
        />
      )}
      {screen === "approved" && (
        <ApprovedScreen
          option={odaOptions[selectedOption]}
          onHome={goToLanding}
        />
      )}
    </div>
  );
}
