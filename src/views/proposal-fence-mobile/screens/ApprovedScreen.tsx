"use client";

import { useState } from "react";
import Image from "next/image";

import type { ODAItem, ODAOption } from "@/data/odaMockDataFence";
import {
  CONTRACT_PAGES,
  FENCE_DRAWING_MAP,
  FENCE_THUMB_GATE_1,
  FENCE_THUMB_GATE_3,
  FENCE_THUMB_PANEL,
  FENCE_WARRANTY_IMG,
  OPTION_LOGO_IMAGE,
  type SummaryLineItem,
} from "@/views/proposal-fence/shared";
import { PinchZoom } from "../components/PinchZoom";
import { MobileSummaryGroup } from "../components/SummaryGroup";

const TABS = ["Project Home", "Contract", "Documents", "Products", "Drawings", "Invoices"];

export function ApprovedScreen({
  option,
  onHome,
}: {
  option: ODAOption;
  onHome: () => void;
}) {
  const [activeTab, setActiveTab] = useState("Project Home");

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
        paddingBottom: 40,
      }}
    >
      {/* ── Top nav ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "white",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
          }}
        >
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
          <img
            src={OPTION_LOGO_IMAGE}
            alt="Grand Rapids Fence"
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 36 }} />
        </div>

        {/* ── Horizontally scrollable tab bar ── */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            scrollbarWidth: "none",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0,
                height: 44,
                padding: "0 16px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#262626" : "#737373",
                borderBottom: activeTab === tab ? "2px solid #262626" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Approval badge ── */}
      <div
        style={{
          margin: "12px 16px 0",
          backgroundColor: "#262626",
          borderRadius: 10,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>
            Proposal Approved
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>
            Approved on 3/18/2026 · Henderson Backyard Fence
          </p>
        </div>
      </div>

      {/* ── Tab content ── */}
      {activeTab === "Contract" ? (
        /* ── Contract tab ── */
        <div
          style={{
            margin: "12px 16px 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            backgroundColor: "#f0f0f0",
            borderRadius: 10,
            padding: 12,
          }}
        >
          {CONTRACT_PAGES.map((pageSrc, index) => (
            <div
              key={pageSrc}
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: "white",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <Image
                src={pageSrc}
                alt={`Contract page ${index + 1}`}
                width={2380}
                height={3368}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          ))}
        </div>
      ) : activeTab === "Drawings" ? (
        /* ── Drawings tab ── */
        <div style={{ margin: "12px 16px 0" }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "#262626", padding: "16px 16px 12px", margin: 0 }}>
              Fence Drawing
            </p>
            <PinchZoom style={{ width: "100%", aspectRatio: "4/3", backgroundColor: "#f5f5f5" }}>
              <Image
                src={FENCE_DRAWING_MAP}
                alt="Fence Drawing"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </PinchZoom>
            <p style={{ fontSize: 11, color: "#737373", textAlign: "center", padding: "8px 0 12px", margin: 0 }}>
              Pinch to zoom
            </p>
          </div>
        </div>
      ) : (
        /* ── Project Home + other tabs ── */
        <>
          {/* Payment progress card */}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#262626", margin: 0 }}>
                Fence Replacement — Henderson Backyard Fence
              </p>
              <p style={{ fontSize: 12, color: "#737373", margin: 0 }}>Proposal Approved on 3/18/2026</p>
            </div>

            <div style={{ height: "0.5px", backgroundColor: "rgba(0,0,0,0.1)" }} />

            {/* Payment progress */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 12, color: "#737373", margin: 0 }}>
                Payment Progress <sup style={{ fontSize: 7 }}>1</sup>
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 22, color: "#262626", letterSpacing: "-0.3px" }}>$4,998</span>
                <span style={{ fontSize: 16, color: "#737373" }}>/ $9,999</span>
              </div>
              {/* Progress bar */}
              <div style={{ display: "flex", width: "100%", height: 4, borderRadius: 2, backgroundColor: "#e0e0e0", overflow: "hidden" }}>
                <div style={{ width: "50%", height: "100%", backgroundColor: "#262626", borderRadius: 2 }} />
              </div>
            </div>

            {/* Next payment */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ fontSize: 12, color: "#737373", margin: 0 }}>
                Next Payment <sup style={{ fontSize: 7 }}>2</sup>
              </p>
              <p style={{ fontSize: 26, fontWeight: 600, color: "#262626", margin: 0, letterSpacing: "-0.5px" }}>
                $4,999
              </p>
              <p style={{ fontSize: 11, color: "#737373", margin: 0 }}>
                100% balance due at project completion &lt;5/26/2028&gt;
              </p>
            </div>
          </div>

          {/* Action buttons card */}
          <div
            style={{
              margin: "12px 16px 0",
              backgroundColor: "white",
              borderRadius: 12,
              padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Make a payment — primary */}
            <button
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
              }}
            >
              Make A Payment
            </button>

            {/* Secondary buttons row */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  height: 44,
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
                  height: 44,
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
                  height: 44,
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
                Download
              </button>
            </div>

            {/* Payment schedule link */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 36,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="#262626" strokeWidth="1.5" />
                <path d="M2 10h20M7 15h.01M12 15h5" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 13, color: "#262626" }}>Payment Schedule &amp; Records</span>
            </button>

            {/* Footnotes */}
            <p style={{ fontSize: 10, fontWeight: 300, color: "#737373", lineHeight: 1.5, margin: 0 }}>
              <sup>1</sup> Total pricing subject to change based on taxes, fees, and adjustments.
              <br />
              <sup>2</sup> Monthly payments are estimates and not a financing offer.
            </p>
          </div>

          {/* Approved scope card */}
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
              Approved Scope
            </p>
            <MobileSummaryGroup name="Fence" items={fenceParts} />
            <MobileSummaryGroup name="Gate" items={gateItems} />
          </div>

          {/* Drawings card */}
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
            <PinchZoom style={{ width: "100%", aspectRatio: "4/3", backgroundColor: "#f5f5f5" }}>
              <Image
                src={FENCE_DRAWING_MAP}
                alt="Fence Drawing"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </PinchZoom>
            <p style={{ fontSize: 11, color: "#737373", textAlign: "center", padding: "8px 0 12px", margin: 0 }}>
              Pinch to zoom
            </p>
          </div>

          {/* Warranty card */}
          <div
            style={{
              margin: "12px 16px 0",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              aspectRatio: "4/3",
              position: "relative",
            }}
          >
            <Image
              src={FENCE_WARRANTY_IMG}
              alt="Fence Extended Warranty"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </>
      )}
    </div>
  );
}
