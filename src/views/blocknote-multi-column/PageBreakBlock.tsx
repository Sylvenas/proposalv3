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
          gap: 12,
          padding: "10px 0",
          userSelect: "none",
          cursor: "default",
        }}
      >
        <div style={{ flex: 1, borderTop: "1px dashed #c8c8c8" }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#a0a0a0",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Page Break
        </span>
        <div style={{ flex: 1, borderTop: "1px dashed #c8c8c8" }} />
      </div>
    ),
  },
);
