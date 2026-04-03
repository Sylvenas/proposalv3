import { useState } from "react";
import Image from "next/image";

import type { ODAItem, ODAOption } from "@/data/odaMockDataFence";

import { ODALogo } from "../components/ODALogo";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { SummaryGroup } from "../components/SummaryGroup";
import { CONTRACT_PAGES, FENCE_DRAWING_MAP, FENCE_THUMB_CAP, FENCE_THUMB_GATE_1, FENCE_THUMB_GATE_3, FENCE_THUMB_PANEL, FENCE_THUMB_POST_INSERT, type SummaryLineItem, FENCE_WARRANTY_IMG, sv } from "../shared";

export function ApprovedScreen({
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
                className="w-full bg-[#F5A020] text-white font-semibold flex items-center justify-center hover:opacity-80 transition-opacity"
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
