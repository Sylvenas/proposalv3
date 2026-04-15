"use client";

import { useState } from "react";
import Image from "next/image";

import type { ODAItem, ODAOption } from "@/data/odaMockDataFence";
import {
  FENCE_DRAWING_MAP,
  FENCE_THUMB_GATE_1,
  FENCE_THUMB_GATE_3,
  FENCE_THUMB_PANEL,
  FENCE_WARRANTY_IMG,
  OPTION_LOGO_IMAGE,
  type SummaryLineItem,
} from "@/views/proposal-fence/shared";
import { PinchZoom } from "../components/PinchZoom";
import { SignSheet } from "../components/SignSheet";
import { MobileSummaryGroup } from "../components/SummaryGroup";

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
  const [showSignSheet, setShowSignSheet] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const mkItem = (id: string, name: string, price: number, img: string): ODAItem => ({
    id, name, spec: "", price, previewImage: img,
  });

  const fenceParts: SummaryLineItem[] = [
    {
      name: "Vinyl Stratford Fence — 4' Height",
      qty: "136",
      unit: "lf",
      price: 4490,
      thumbnailSrc: FENCE_THUMB_PANEL,
      showChange: false,
      odaItem: mkItem("fp-1", "Vinyl Stratford Fence — 4' Height", 4490, FENCE_THUMB_PANEL),
    },
  ];

  const gateItems: SummaryLineItem[] = [
    {
      name: "Vinyl | Stratford | 4' | 5'W Gate | White",
      qty: "1",
      unit: "sets",
      price: 560,
      thumbnailSrc: FENCE_THUMB_GATE_1,
      showChange: false,
      odaItem: mkItem("g-1", "Vinyl | Stratford | 4' | 5'W Gate | White", 560, FENCE_THUMB_GATE_1),
    },
    {
      name: "Vinyl | Stratford | 5' | 4'W Gate | White",
      qty: "1",
      unit: "sets",
      price: 520,
      thumbnailSrc: FENCE_THUMB_GATE_1,
      showChange: false,
      odaItem: mkItem("g-2", "Vinyl | Stratford | 5' | 4'W Gate | White", 520, FENCE_THUMB_GATE_1),
    },
    {
      name: "Vinyl | Stratford | 5' | 5'W Gate | White",
      qty: "1",
      unit: "sets",
      price: 610,
      thumbnailSrc: FENCE_THUMB_GATE_3,
      showChange: false,
      odaItem: mkItem("g-3", "Vinyl | Stratford | 5' | 5'W Gate | White", 610, FENCE_THUMB_GATE_3),
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100dvh",
        paddingBottom: 88,
      }}
    >
      {/* ── Sticky top header ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "white",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Nav row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              width: 36,
              height: 36,
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}>
              <path d="M13 7H1M6 2L1 7L6 12" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <img
            src={OPTION_LOGO_IMAGE}
            alt="Grand Rapids Fence"
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <button
            onClick={onHome}
            style={{
              width: 36,
              height: 36,
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 18 16" fill="none" style={{ width: 18, height: 16 }}>
              <path d="M1 6L9 1L17 6V15H11.5V10.5H6.5V15H1V6Z" stroke="#262626" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Summary card ── */}
      <div
        style={{
          margin: "12px 16px 0",
          backgroundColor: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        {/* Collapsed header (always visible) */}
        <div style={{ padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#262626", margin: 0 }}>
            SUMMARY — OPTION 2 — VINYL TRADITIONS FENCE
          </p>
          <p style={{ fontSize: 12, color: "#737373", margin: 0 }}>Henderson Backyard Fence</p>
        </div>

        {/* Pricing row */}
        <div
          style={{
            padding: "0 16px 16px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderBottom: summaryExpanded ? "0.5px solid rgba(0,0,0,0.1)" : "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: "#262626", letterSpacing: "-0.5px" }}>
              $9,999.00
            </span>
            <span style={{ fontSize: 12, color: "#737373" }}>$469.06 / mo estimated</span>
          </div>
          <button
            onClick={() => setSummaryExpanded(!summaryExpanded)}
            style={{
              height: 32,
              padding: "0 12px",
              backgroundColor: "#f0f0f0",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              color: "#262626",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {summaryExpanded ? "Less" : "Details"}
            <svg
              viewBox="0 0 16 16"
              fill="none"
              style={{
                width: 12,
                height: 12,
                transform: summaryExpanded ? "rotate(270deg)" : "rotate(90deg)",
                transition: "transform 0.15s",
              }}
            >
              <path d="M6 4l4 4-4 4" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Expanded summary details */}
        {summaryExpanded && (
          <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "#737373" }}>Contract Total</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#262626" }}>$9,999.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "#737373" }}>Discount -5%</span>
              <span style={{ fontSize: 15, color: "#262626" }}>-$300</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "#737373" }}>Sales Tax &amp; Fees</span>
              <span style={{ fontSize: 15, color: "#262626" }}>$1,269</span>
            </div>
            <div style={{ height: "0.5px", backgroundColor: "rgba(0,0,0,0.1)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "#737373" }}>Proposal Valid Until</span>
              <span style={{ fontSize: 14, color: "#262626" }}>April 30, 2026</span>
            </div>

            {/* Secondary CTAs */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                style={{
                  flex: 1,
                  height: 40,
                  border: "0.5px solid #262626",
                  backgroundColor: "white",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#262626",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg viewBox="0 0 11 14" fill="none" style={{ width: 11, height: 14 }}>
                  <rect x="0.5" y="0.5" width="10" height="13" rx="1" stroke="currentColor" strokeWidth="1" />
                  <path d="M2.5 3.5h6M2.5 6.5h2M6.5 6.5h2M2.5 9.5h2M6.5 9.5h2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
                </svg>
                Financing
              </button>
              <button
                style={{
                  flex: 1,
                  height: 40,
                  border: "0.5px solid #262626",
                  backgroundColor: "white",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#262626",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                  <path d="M3.5 2.5C3.5 2.5 2.5 3.5 2.5 5.5C2.5 9.5 6.5 13.5 10.5 13.5C12.5 13.5 13.5 12.5 13.5 12.5L11 10C11 10 10 10.5 9 10C7.5 9 7 8.5 6 7C5.5 6 6 5 6 5L3.5 2.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                </svg>
                Contact
              </button>
              <button
                style={{
                  flex: 1,
                  height: 40,
                  border: "0.5px solid #262626",
                  backgroundColor: "white",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#262626",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg viewBox="0 0 17 18" fill="none" style={{ width: 14, height: 15 }}>
                  <path d="M8.5 1v11M3.5 7l5 5 5-5M1 17h15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                PDF
              </button>
            </div>

            {/* Footnote */}
            <p style={{ fontSize: 10, fontWeight: 300, color: "#737373", lineHeight: 1.5, margin: 0 }}>
              <sup>1</sup> Total pricing is subject to change based on applicable taxes, fees, payment timing, and final adjustments.
              Monthly payments are estimates only and not a financing offer.
            </p>
          </div>
        )}
      </div>

      {/* ── Products card ── */}
      <div
        style={{
          margin: "12px 16px 0",
          backgroundColor: "white",
          borderRadius: 12,
          padding: "4px 16px 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: "#262626", margin: "16px 0 4px" }}>
          All Included / Selected Products
        </p>
        <MobileSummaryGroup name="Fence" items={fenceParts} />
        <MobileSummaryGroup name="Gate" items={gateItems} />
      </div>

      {/* ── Drawing card (pinch-to-zoom) ── */}
      <div
        style={{
          margin: "12px 16px 0",
          backgroundColor: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: "#262626", padding: "16px 16px 12px", margin: 0 }}>
          Drawings
        </p>
        <PinchZoom
          style={{
            width: "100%",
            aspectRatio: "4/3",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Image
            src={FENCE_DRAWING_MAP}
            alt="Fence Drawing"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </PinchZoom>
        <p
          style={{
            fontSize: 11,
            color: "#737373",
            textAlign: "center",
            padding: "8px 0 12px",
            margin: 0,
          }}
        >
          Pinch to zoom
        </p>
      </div>

      {/* ── Reviews card ── */}
      <div
        style={{
          margin: "12px 16px 0",
          backgroundColor: "white",
          borderRadius: 12,
          padding: "16px 16px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <img
          src={OPTION_LOGO_IMAGE}
          alt="Grand Rapids Fence"
          style={{ height: 40, width: "auto", objectFit: "contain" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#262626", margin: 0 }}>
            Grand Rapids Fence
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg viewBox="0 0 24 24" fill="#262626" style={{ width: 14, height: 14 }}>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              <span style={{ fontSize: 13, color: "#262626" }}>4.6</span>
            </div>
            <span style={{ fontSize: 13, color: "#737373" }}>(882 reviews)</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              quote: `"I had such a great experience with Grand Rapids Fence! From start to finish, everything was handled so smoothly and professionally. Pei, the owner, is truly wonderful, knowledgeable, honest, and committed to making sure the job is done right."`,
              author: "— Aileen, Grand Rapids Michigan",
            },
            {
              quote: `"First and foremost, I'd like to say this about Grand Rapids Fence. When I needed someone to come out and look at my fencing to get me a quote? Not only were they johnny on the spot with fast service the quote was extremely reasonable."`,
              author: "— Joe, Grand Rapids, Michigan",
            },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontSize: 12, color: "#262626", fontWeight: 300, lineHeight: 1.6, margin: 0, letterSpacing: "-0.2px" }}>
                {r.quote}
              </p>
              <p style={{ fontSize: 11, color: "#737373", margin: 0 }}>{r.author}</p>
            </div>
          ))}
        </div>
        <button style={{ fontSize: 13, color: "#262626", textDecoration: "underline", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
          Read more
        </button>
      </div>

      {/* ── Fixed bottom CTA bar ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          backgroundColor: "white",
          borderTop: "0.5px solid rgba(0,0,0,0.1)",
          zIndex: 30,
        }}
      >
        <button
          onClick={() => setShowSignSheet(true)}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 10,
            backgroundColor: "#F5A020",
            border: "none",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "-0.3px",
          }}
        >
          Sign &amp; Approve
        </button>
      </div>

      {/* ── Sign sheet ── */}
      <SignSheet
        isOpen={showSignSheet}
        onClose={() => setShowSignSheet(false)}
        onApprove={onApprove}
      />
    </div>
  );
}
