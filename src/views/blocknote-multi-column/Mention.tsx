"use client";

import { createReactInlineContentSpec } from "@blocknote/react";

// ---------------------------------------------------------------------------
// Mention inline content — mirrors the official BlockNote Mentions example.
// Trigger: type "@" in the editor to open the suggestion menu.
// ---------------------------------------------------------------------------
export const Mention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      user: { default: "Unknown" },
    },
    content: "none",
  } as const,
  {
    render: (props) => (
      <span
        style={{
          backgroundColor: "#8400ff22",
          borderRadius: 4,
          padding: "0 5px",
        }}
      >
        @{props.inlineContent.props.user}
      </span>
    ),
  },
);

export const MENTION_USERS = [
  "Steve",
  "Bob",
  "Joe",
  "Mike",
  "Alice",
  "Carol",
];
