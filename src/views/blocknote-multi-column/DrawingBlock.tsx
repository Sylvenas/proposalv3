import { createReactBlockSpec } from "@blocknote/react";

interface LegendItem {
  symbol: React.ReactNode;
  label: string;
  value: string;
}

const DiamondSymbol = ({ color = "#555" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect
      x="9"
      y="1"
      width="11"
      height="11"
      rx="0"
      transform="rotate(45 9 9)"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const LineSymbol = ({ color = "#e08c00" }: { color?: string }) => (
  <svg width="28" height="10" viewBox="0 0 28 10">
    <line x1="0" y1="5" x2="28" y2="5" stroke={color} strokeWidth="2" />
  </svg>
);

const SquareSymbol = ({ color = "#00c8c8" }: { color?: string }) => (
  <div
    style={{
      width: 18,
      height: 18,
      backgroundColor: color,
      flexShrink: 0,
    }}
  />
);

const LEGEND_LEFT: LegendItem[] = [
  {
    symbol: <DiamondSymbol />,
    label: "Condition",
    value: "4",
  },
  {
    symbol: <LineSymbol color="#e08c00" />,
    label: "Line Product",
    value: "144.4 ft",
  },
  {
    symbol: <LineSymbol color="#c040c0" />,
    label: "Product (Line)",
    value: "288.8 ft",
  },
  {
    symbol: <DiamondSymbol color="#888" />,
    label: "Price Parts",
    value: "3",
  },
];

const LEGEND_RIGHT: LegendItem[] = [
  {
    symbol: <SquareSymbol color="#b8e860" />,
    label: "Area Product",
    value: "395.9 sq ft",
  },
  {
    symbol: <LineSymbol color="#2255cc" />,
    label: "Line wall Surface",
    value: "722 sq ft",
  },
  {
    symbol: <SquareSymbol color="#00c8c8" />,
    label: "Converted",
    value: "1,026 Bag",
  },
];

// A simplified SVG floor plan placeholder that resembles an architectural drawing
const FloorPlanPlaceholder = () => (
  <div
    style={{
      width: "100%",
      aspectRatio: "4 / 3",
      backgroundColor: "#fafafa",
      border: "1.5px solid #999",
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <svg
      viewBox="0 0 400 300"
      style={{ width: "85%", height: "85%" }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer walls */}
      <rect x="20" y="20" width="360" height="260" stroke="#222" strokeWidth="4" fill="white" />

      {/* Kitchen area (top-left) */}
      <rect x="20" y="20" width="140" height="120" stroke="#222" strokeWidth="3" fill="white" />
      <text x="50" y="95" fontSize="9" fill="#555" fontWeight="600">KITCHEN</text>

      {/* Walk-in cooler (pink) */}
      <rect x="25" y="25" width="75" height="55" fill="#f0a0e0" stroke="#c060a0" strokeWidth="1" />
      <text x="27" y="48" fontSize="7" fill="#8b0060">WALK-IN</text>
      <text x="27" y="58" fontSize="7" fill="#8b0060">COOLER</text>
      <text x="27" y="70" fontSize="8" fill="#8b0060" fontWeight="bold">395.9 sq ft</text>

      {/* Reception / green area */}
      <rect x="130" y="60" width="70" height="160" fill="#a8e870" stroke="#60a030" strokeWidth="1" />
      <text x="138" y="145" fontSize="9" fill="#386010" fontWeight="600">872.9 sq ft</text>

      {/* Upper dining area (top-right) */}
      <rect x="220" y="20" width="160" height="110" stroke="#222" strokeWidth="2" fill="white" />
      <text x="270" y="80" fontSize="9" fill="#555">UPPER</text>
      <text x="265" y="92" fontSize="9" fill="#555">DINING</text>

      {/* Lower dining area (bottom-right) */}
      <rect x="220" y="150" width="160" height="130" stroke="#222" strokeWidth="2" fill="white" />
      <text x="265" y="220" fontSize="9" fill="#555">LOWER</text>
      <text x="265" y="232" fontSize="9" fill="#555">DINING</text>

      {/* Dimension lines */}
      <line x1="20" y1="140" x2="130" y2="140" stroke="#c040c0" strokeWidth="1" strokeDasharray="3,2" />
      <text x="65" y="136" fontSize="7" fill="#c040c0">49&apos; 11&quot;</text>

      <line x1="130" y1="140" x2="220" y2="140" stroke="#c040c0" strokeWidth="1" />
      <text x="155" y="136" fontSize="7" fill="#c040c0">35&apos; 5&quot;</text>

      {/* Entrance labels */}
      <text x="160" y="290" fontSize="8" fill="#555" textAnchor="middle">MAIN ENTRANCE</text>
      <text x="200" y="14" fontSize="8" fill="#555" textAnchor="middle">UPPER ENTRANCE</text>

      {/* Logo / title box bottom-right */}
      <rect x="280" y="230" width="95" height="45" stroke="#888" strokeWidth="1" fill="#f5f5f5" />
      <text x="328" y="248" fontSize="7" fill="#555" textAnchor="middle" fontWeight="bold">ARCSITE</text>
      <text x="328" y="258" fontSize="6" fill="#888" textAnchor="middle">CONCEPTUAL</text>
      <text x="328" y="267" fontSize="6" fill="#888" textAnchor="middle">RESTAURANT PLAN</text>

      {/* Scale box */}
      <rect x="240" y="232" width="30" height="14" stroke="#e08c00" strokeWidth="1.5" fill="none" />
      <text x="278" y="243" fontSize="7" fill="#555">= 5&apos;-0&quot;</text>
    </svg>
  </div>
);

const LegendRow = ({ item }: { item: LegendItem }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 12px",
      borderBottom: "1px solid #e8e8e8",
    }}
  >
    <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {item.symbol}
    </div>
    <div style={{ flex: 1, fontSize: 13, color: "#333" }}>{item.label}</div>
    <div style={{ fontSize: 13, color: "#333", fontWeight: 500, minWidth: 80, textAlign: "right" }}>
      {item.value}
    </div>
  </div>
);

export const createDrawing = createReactBlockSpec(
  {
    type: "drawing",
    propSchema: {},
    content: "none",
  },
  {
    render: () => {
      return (
        <div
          className="drawing-block"
          contentEditable={false}
          style={{
            width: "100%",
            fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: 8,
            }}
          >
            Detail Plan
          </div>

          {/* Drawing container with outer border */}
          <div
            style={{
              border: "1.5px solid #aaa",
              borderRadius: 2,
              padding: 16,
              backgroundColor: "#fff",
              marginBottom: 0,
            }}
          >
            <FloorPlanPlaceholder />
          </div>

          {/* Legend table */}
          <div
            style={{
              border: "1px solid #ddd",
              borderTop: "none",
              borderRadius: "0 0 2px 2px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {/* Left column */}
              <div style={{ borderRight: "1px solid #ddd" }}>
                {LEGEND_LEFT.map((item, idx) => (
                  <LegendRow key={idx} item={item} />
                ))}
              </div>
              {/* Right column */}
              <div>
                {LEGEND_RIGHT.map((item, idx) => (
                  <LegendRow key={idx} item={item} />
                ))}
                {/* Empty row to match left column count */}
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #e8e8e8" }} />
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
);
