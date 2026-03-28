import { createReactInlineContentSpec } from "@blocknote/react";

export const PlaceholderInput = createReactInlineContentSpec(
  {
    type: "placeholderInput",
    propSchema: {
      label: {
        default: "Enter value",
      },
    },
    content: "none",
  } as const,
  {
    render: (props) => (
      <input
        readOnly
        tabIndex={-1}
        value={props.inlineContent.props.label}
        style={{
          display: "inline-block",
          padding: "1px 8px",
          border: "1px dashed #bbb",
          borderRadius: 4,
          color: "#999",
          fontSize: "0.9em",
          lineHeight: 1.6,
          backgroundColor: "#fafafa",
          cursor: "default",
          verticalAlign: "baseline",
          outline: "none",
          width: `${props.inlineContent.props.label.length + 2}ch`,
          pointerEvents: "none",
        }}
      />
    ),
  },
);
