"use client";

import { useState } from "react";
import Image from "next/image";

import { odaProjectInfo } from "@/data/odaMockDataFence";
import { CONTRACT_PAGES } from "@/views/proposal-fence/shared";

export function SignSheet({
  isOpen,
  onClose,
  onApprove,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
}) {
  const [showContract, setShowContract] = useState(false);
  const { clientName } = odaProjectInfo;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px 16px 16px",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            if (showContract) {
              setShowContract(false);
            } else {
              onClose();
            }
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#f0f0f0",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {showContract ? (
            <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}>
              <path d="M9 2L4 7l5 5" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}>
              <path d="M1 1l12 12M13 1L1 13" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#262626",
          }}
        >
          {showContract ? "Review Contract" : "Sign Contract"}
        </span>
        <div style={{ width: 36 }} />
      </div>

      {showContract ? (
        /* ── Contract viewer ── */
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            backgroundColor: "#f5f5f5",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {CONTRACT_PAGES.map((pageSrc, index) => (
            <div
              key={pageSrc}
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: "#ffffff",
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
      ) : (
        /* ── Sign panel ── */
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Project summary */}
          <div
            style={{
              backgroundColor: "#f7f7f7",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 600, color: "#262626" }}>
              OPTION 2 - VINYL TRADITIONS FENCE
            </p>
            <p style={{ fontSize: 13, color: "#737373" }}>Henderson Backyard Fence</p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 600, color: "#262626" }}>
                $9,999.00
              </span>
              <span style={{ fontSize: 13, color: "#737373" }}>contract total</span>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#262626" }}>
              Sign Contract as {clientName}
            </p>
            <p style={{ fontSize: 13, fontWeight: 300, color: "#262626", lineHeight: 1.6 }}>
              Please review your final project selections and contract details
              before signing. By signing below, you confirm your acceptance of
              the scope, pricing, and terms outlined in this agreement.
            </p>
          </div>

          {/* View contract link */}
          <button
            onClick={() => setShowContract(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 44,
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.2)",
              backgroundColor: "white",
              padding: "0 16px",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
              <rect x="4.5" y="4" width="15" height="16" rx="1.5" stroke="#262626" strokeWidth="1.2" />
              <path d="M8.5 4V3.5C8.5 3.224 8.724 3 9 3h6c.276 0 .5.224.5.5V4" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M9 12l2 2 4-4" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 14, color: "#262626", flex: 1, textAlign: "left" }}>
              Review Full Contract
            </span>
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
              <path d="M6 4l4 4-4 4" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Legal disclaimer */}
          <p style={{ fontSize: 11, fontWeight: 300, color: "#737373", lineHeight: 1.6 }}>
            Total project pricing is subject to change based on applicable
            taxes, fees, payment timing, and any final project adjustments. The
            final amount presented at the time of payment will control.
          </p>
        </div>
      )}

      {/* Sticky bottom: Sign button */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          borderTop: "0.5px solid rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
        }}
      >
        <button
          onClick={() => {
            onClose();
            onApprove();
          }}
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
    </div>
  );
}
