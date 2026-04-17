import { createReactBlockSpec } from "@blocknote/react";

// Green placeholder rectangle representing dynamic data
function Placeholder({ width, height = 16, dark = false }: { width: number; height?: number; dark?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: dark ? "#c2f2c3" : "#d4fad6",
        height,
        width,
        borderRadius: 2,
        flexShrink: 0,
      }}
    />
  );
}

// Lighter green for sub-items
function SubPlaceholder({ width, height = 10 }: { width: number; height?: number }) {
  return (
    <div
      style={{
        backgroundColor: "#edfcee",
        height,
        width,
        borderRadius: 2,
        flexShrink: 0,
      }}
    />
  );
}

// Filled gear icon — same shape as the conditional section gear, green variant
function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 1.5h3l.4 1.9c.35.13.68.3.98.5l1.83-.6 1.5 2.6-1.46 1.3c.04.27.04.54 0 .8l1.46 1.3-1.5 2.6-1.83-.6c-.3.2-.63.37-.98.5L9.5 14.5h-3l-.4-1.9a4.3 4.3 0 0 1-.98-.5l-1.83.6-1.5-2.6 1.46-1.3a4.03 4.03 0 0 1 0-.8L1.79 6.9l1.5-2.6 1.83.6c.3-.2.63-.37.98-.5L6.5 1.5z"
        fill="#04b50b"
      />
      <circle cx="8" cy="8" r="1.8" fill="white" />
    </svg>
  );
}

export const createProductListUI = createReactBlockSpec(
    {
      type: "productList" as const,
      propSchema: {},
      content: "none",
    },
    {
      render: () => {
        return (
          <div className="product-list-block" contentEditable={false} style={{ width: "100%" }}>
            <div
              style={{
                border: "1px dashed #04b50b",
                borderRadius: 4,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* ── Green header bar ──────────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 8,
                  padding: "3px 8px",
                  backgroundColor: "#d0f5d1",
                  borderBottom: "0.5px solid rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#04b50b",
                      lineHeight: "14px",
                    }}
                  >
                    Product List
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 8px",
                      backgroundColor: "#04b50b",
                      borderRadius: 9999,
                      fontFamily: "Roboto, sans-serif",
                      fontSize: 10,
                      fontWeight: 400,
                      color: "white",
                      lineHeight: "14px",
                    }}
                  >
                    Variable Block
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 1, height: 14 }} />
                <div style={{ cursor: "pointer" }}>
                  <GearIcon />
                </div>
              </div>

              {/* ── Table content ─────────────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "35px 15px 15px",
                  /* Offset top to account for the absolute header taking space */
                  paddingTop: 12,
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 8,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "Roboto, sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#262626",
                      lineHeight: "18px",
                    }}
                  >
                    Description
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "Roboto, sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#262626",
                      lineHeight: "18px",
                      textAlign: "right",
                    }}
                  >
                    Quantity
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "Roboto, sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#262626",
                      lineHeight: "18px",
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </span>
                </div>

                {/* Row 1 */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}><Placeholder width={86} /></div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><Placeholder width={49} /></div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><Placeholder width={49} /></div>
                </div>

                {/* Row 2 */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}><Placeholder width={86} /></div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><Placeholder width={41} /></div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><Placeholder width={41} /></div>
                </div>

                {/* Row 3 (with sub-item) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1 }}><Placeholder width={86} /></div>
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><div style={{ width: 25 }} /></div>
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><Placeholder width={57} /></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1 }}><SubPlaceholder width={54} /></div>
                    <div style={{ flex: 1 }} />
                    <div style={{ flex: 1 }} />
                  </div>
                </div>

                {/* ── Summary section ──────────────────────────────────────── */}
                <div
                  style={{
                    borderTop: "1px solid #e6e6e6",
                    paddingTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "flex-end",
                  }}
                >
                  {/* Subtotal */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 240 }}>
                    <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, fontWeight: 400, color: "#262626", lineHeight: "16px" }}>Subtotal</span>
                    <Placeholder width={33} />
                  </div>
                  {/* Tax 1 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 240 }}>
                    <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, fontWeight: 400, color: "#262626", lineHeight: "16px" }}>Tax 1</span>
                    <Placeholder width={41} />
                  </div>
                  {/* Tax 2 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 240 }}>
                    <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, fontWeight: 400, color: "#262626", lineHeight: "16px" }}>Tax 2</span>
                    <Placeholder width={25} />
                  </div>
                  {/* Total */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 240 }}>
                    <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, fontWeight: 700, color: "#262626", lineHeight: "16px" }}>Total</span>
                    <Placeholder width={49} dark />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
  );
