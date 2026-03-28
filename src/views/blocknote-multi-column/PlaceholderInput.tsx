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
      <span
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
        }}
      >
        {props.inlineContent.props.label}
      </span>
    ),
  },
);
