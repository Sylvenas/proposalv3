"use client";

import { useRef } from "react";

import {
  OPTION_CARD_IMAGE_1,
  OPTION_CARD_IMAGE_2,
  OPTION_CHAIN_PLACEHOLDER,
  OPTION_GATE_IMAGE_1,
  OPTION_GATE_IMAGE_2,
  OPTION_GATE_IMAGE_3,
  OPTION_GATE_IMAGE_4,
  OPTION_LOGO_IMAGE,
} from "@/views/proposal-fence/shared";

interface OptionSummary {
  title: string;
  shortName: string;
  description: string;
  price: string;
  monthly: string;
  image: string;
}

interface CompareLineItem {
  name: string;
  qty: string;
  unit: string;
  img: string;
  faded?: boolean;
}

// ─── Reusable compare-row cell ────────────────────────────────────────────────
function Cell({
  children,
  isLeft,
}: {
  children: React.ReactNode;
  isLeft: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: isLeft ? "10px 8px 10px 16px" : "10px 16px 10px 8px",
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

function DashCell({ isLeft }: { isLeft: boolean }) {
  return (
    <Cell isLeft={isLeft}>
      <span style={{ fontSize: 18, color: "#d0d0d0", lineHeight: 1 }}>—</span>
    </Cell>
  );
}

export function OptionsScreen({
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

  const optionSummaries: OptionSummary[] = [
    {
      title: "OPTION 1 - CHAIN LINK FENCE",
      shortName: "Chain Link",
      description: "Durable / Low Maintenance / Cost-Effective Perimeter Security",
      price: "$8,615.00 USD",
      monthly: "$404.13 / mo",
      image: OPTION_CARD_IMAGE_1,
    },
    {
      title: "OPTION 2 - VINYL TRADITIONS FENCE",
      shortName: "Vinyl Traditions",
      description: "Enhanced Privacy / Clean Appearance / Minimal Maintenance",
      price: "$9,999.00 USD",
      monthly: "$469.06 / mo",
      image: OPTION_CARD_IMAGE_2,
    },
  ];

  // ── Pricing rows ─────────────────────────────────────────────────────────────
  const pricingRows: Array<{ label: string; values: [string, string] }> = [
    { label: "Contract Total", values: ["$8,615.00", "$9,999.00"] },
    { label: "Est. Monthly Payment", values: ["$404.13 / mo", "$469.06 / mo"] },
    { label: "Proposal Valid Until", values: ["April 30, 2026", "April 30, 2026"] },
  ];

  // ── Compare product sections ──────────────────────────────────────────────────
  const compareSections: Array<{
    title: string;
    columns: (CompareLineItem | null)[][];
  }> = [
    {
      title: "Fence",
      columns: [
        [
          { name: "Chain Link Fence — 4' Height", qty: "136", unit: "lf", img: OPTION_CHAIN_PLACEHOLDER, faded: true },
          { name: "Chain Link Fence — 5' Height", qty: "96", unit: "lf", img: OPTION_CHAIN_PLACEHOLDER, faded: true },
        ],
        [
          { name: "Vinyl Stratford Fence — 4' Height", qty: "136", unit: "lf", img: OPTION_CHAIN_PLACEHOLDER, faded: true },
          null,
        ],
      ],
    },
    {
      title: "Gate",
      columns: [
        [
          { name: "4 x 5 Weld SWG 17g 9F Blk", qty: "1", unit: "sets", img: OPTION_GATE_IMAGE_1 },
          { name: "5 x 4 Weld SWG 17g 9F Blk", qty: "1", unit: "sets", img: OPTION_GATE_IMAGE_1 },
          { name: "5 x 5 Weld SWG 17g 9F Blk", qty: "1", unit: "sets", img: OPTION_GATE_IMAGE_2 },
        ],
        [
          { name: "Vinyl | Stratford | 4' | 5'W Gate | White", qty: "1", unit: "sets", img: OPTION_GATE_IMAGE_3 },
          { name: "Vinyl | Stratford | 5' | 4'W Gate | White", qty: "1", unit: "sets", img: OPTION_GATE_IMAGE_3 },
          { name: "Vinyl | Stratford | 5' | 5'W Gate | White", qty: "1", unit: "sets", img: OPTION_GATE_IMAGE_4 },
        ],
      ],
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#ffffff",
        minHeight: "100dvh",
        paddingBottom: 40,
      }}
    >
      {/* ── Top nav ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "white",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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

      {/* ── Page heading ── */}
      <div style={{ padding: "20px 16px 0" }}>
        <p style={{ fontSize: 11, color: "#737373", letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 6px" }}>
          Proposal Options
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#262626", margin: "0 0 4px", letterSpacing: "-0.3px" }}>
          Choose Your Fence
        </h2>
        <p style={{ fontSize: 13, fontWeight: 300, color: "#737373", margin: 0 }}>
          Select the option that fits your needs and budget.
        </p>
      </div>

      {/* ── Option cards ── */}
      <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {optionSummaries.map((opt, i) => (
          <div
            key={i}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#EDEDED",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              border: selectedOption === i ? "2px solid #F5A020" : "2px solid transparent",
            }}
          >
            <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
              <img src={opt.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "16px 16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#262626", margin: 0, letterSpacing: "-0.2px" }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: 13, color: "#737373", margin: 0, lineHeight: 1.4 }}>
                  {opt.description}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#262626", letterSpacing: "-0.4px" }}>{opt.price}</span>
                  <span style={{ fontSize: 12, color: "#737373" }}>{opt.monthly}</span>
                </div>
                <button
                  onClick={() => { onSelect(i); onContinue(); }}
                  style={{
                    height: 44,
                    padding: "0 24px",
                    backgroundColor: "#F5A020",
                    border: "none",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Compare scroll link ── */}
      <div
        style={{
          margin: "28px 16px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <p style={{ fontSize: 13, color: "#737373", margin: 0, textAlign: "center" }}>
          <strong style={{ color: "#262626" }}>Need help deciding?</strong>
          {" "}See a full side-by-side breakdown below.
        </p>
        <button
          onClick={() => compareRef.current?.scrollIntoView({ behavior: "smooth" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#262626",
            fontSize: 13,
          }}
        >
          Compare Options
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
            <path d="M8 3v10M3 8l5 5 5-5" stroke="#262626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          COMPARE SECTION — Apple-style side-by-side
      ══════════════════════════════════════════════════════════════ */}
      <div ref={compareRef} style={{ marginTop: 28 }}>

        {/* ── Sticky column header ── */}
        <div
          style={{
            position: "sticky",
            top: 56,
            zIndex: 20,
            backgroundColor: "white",
            borderBottom: "0.5px solid rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex" }}>
            {optionSummaries.map((opt, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: i === 0 ? "12px 8px 12px 16px" : "12px 16px 12px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#737373",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    lineHeight: 1,
                  }}
                >
                  Option {i + 1}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#262626",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {opt.shortName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section: Schedule & Pricing ── */}
        <SectionHeader title="Schedule & Pricing" />

        {pricingRows.map((row) => (
          <div key={row.label}>
            {/* Row label — full width */}
            <p
              style={{
                fontSize: 11,
                color: "#737373",
                margin: 0,
                padding: "10px 16px 4px",
              }}
            >
              {row.label}
            </p>
            {/* Values row */}
            <div style={{ display: "flex" }}>
              {row.values.map((val, i) => (
                <Cell key={i} isLeft={i === 0}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#262626",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {val}
                  </span>
                </Cell>
              ))}
            </div>
          </div>
        ))}

        {/* ── Sections: Fence + Gate ── */}
        {compareSections.map((section) => {
          const maxRows = Math.max(
            section.columns[0].length,
            section.columns[1].length
          );

          return (
            <div key={section.title}>
              <SectionHeader title={section.title} />

              {Array.from({ length: maxRows }).map((_, rowIdx) => {
                const left = section.columns[0][rowIdx] ?? null;
                const right = section.columns[1][rowIdx] ?? null;

                return (
                  <div
                    key={rowIdx}
                    style={{
                      display: "flex",
                      minHeight: 64,
                    }}
                  >
                    {/* Left cell */}
                    {left ? (
                      <Cell isLeft>
                        <ProductCell item={left} />
                      </Cell>
                    ) : (
                      <DashCell isLeft />
                    )}

                    {/* Right cell */}
                    {right ? (
                      <Cell isLeft={false}>
                        <ProductCell item={right} />
                      </Cell>
                    ) : (
                      <DashCell isLeft={false} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* ── Decision prompt ── */}
        <div
          style={{
            borderTop: "0.5px solid rgba(0,0,0,0.1)",
            padding: "28px 16px 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#262626",
              textAlign: "center",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            Decision made?
          </p>
          {optionSummaries.map((opt, i) => (
            <div
              key={i}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "#EDEDED",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
              }}
            >
              <img
                src={opt.image}
                alt=""
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#262626", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#262626", margin: 0 }}>{opt.price}</p>
              </div>
              <button
                onClick={() => { onSelect(i); onContinue(); }}
                style={{
                  height: 40,
                  padding: "0 16px",
                  backgroundColor: "#F5A020",
                  border: "none",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 8,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#737373",
        margin: 0,
        padding: "20px 16px 6px",
        textTransform: "uppercase",
        letterSpacing: "0.6px",
      }}
    >
      {title}
    </p>
  );
}

function ProductCell({ item }: { item: { name: string; qty: string; unit: string; img: string; faded?: boolean } }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 6,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={item.img}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: item.faded ? 0.12 : 1,
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 12,
            color: "#262626",
            margin: 0,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          } as React.CSSProperties}
        >
          {item.name}
        </p>
        <p style={{ fontSize: 11, color: "#737373", margin: "3px 0 0", fontWeight: 300 }}>
          {item.qty} {item.unit}
        </p>
      </div>
    </div>
  );
}
