import { createReactBlockSpec } from "@blocknote/react";

export const createPageBreak = createReactBlockSpec(
  {
    type: "pageBreak" as const,
    propSchema: {},
    content: "none",
  },
  {
    render: () => (
      <div
        data-page-break="true"
        contentEditable={false}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 0",
          userSelect: "none",
          cursor: "default",
        }}
      >
        <div style={{ flex: 1, borderTop: "1.5px dashed #c0c0c0" }} />
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 500,
            color: "#b0b0b0",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c0c0c0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Page Break
        </span>
        <div style={{ flex: 1, borderTop: "1.5px dashed #c0c0c0" }} />
      </div>
    ),
  },
);
