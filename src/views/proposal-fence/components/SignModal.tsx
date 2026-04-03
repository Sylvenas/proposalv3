import { useState } from "react";
import Image from "next/image";

import { odaProjectInfo } from "@/data/odaMockDataFence";

import { CONTRACT_PAGES, sv } from "../shared";

export function SignModal({
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
            className="w-full bg-[#F5A020] text-white font-semibold flex items-center justify-center hover:opacity-80 transition-opacity"
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
