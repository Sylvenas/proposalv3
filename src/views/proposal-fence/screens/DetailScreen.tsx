import { useState } from "react";
import Image from "next/image";

import type { ODAItem, ODAOption } from "@/data/odaMockDataFence";

import { ODALogo } from "../components/ODALogo";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { SignModal } from "../components/SignModal";
import { SummaryGroup } from "../components/SummaryGroup";
import { FENCE_DRAWING_MAP, FENCE_THUMB_CAP, FENCE_THUMB_GATE_1, FENCE_THUMB_GATE_3, FENCE_THUMB_PANEL, FENCE_THUMB_POST_INSERT, type SummaryLineItem, FENCE_WARRANTY_IMG, sv } from "../shared";

export function DetailScreen({
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
