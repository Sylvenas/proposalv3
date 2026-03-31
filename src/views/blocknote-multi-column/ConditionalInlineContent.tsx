"use client";

import { createReactInlineContentSpec, useBlockNoteEditor } from "@blocknote/react";
import { useRef, useState } from "react";
import { ConditionalInlineModal } from "./ConditionalInlineModal";

// ── Gear icon ────────────────────────────────────────────────────────────────
const GearIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
             a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
             A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
             l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
             A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
             l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
             a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
             l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
             a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ── Inner component ───────────────────────────────────────────────────────────
function ConditionalInlineInner({
  conditionField,
  conditionOperator,
  conditionValue,
  contentRef,
}: {
  conditionField:    string;
  conditionOperator: string;
  conditionValue:    string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentRef:        any;
}) {
  const editor = useBlockNoteEditor();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [condModalOpen, setCondModalOpen] = useState(false);

  // ── Update condition props only (text lives in ProseMirror content) ───────
  const updateCondition = (newAttrs: { conditionField: string; conditionOperator: string; conditionValue: string }) => {
    const el = rootRef.current;
    if (!el) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const view = (editor as any)._tiptapEditor.view;
    const { state, dispatch } = view;

    // Walk the document to find the conditionalInline node whose rendered DOM
    // is inside (or is) our root span — much more reliable than posAtCoords.
    let targetPos = -1;
    state.doc.descendants((node: { type: { name: string } }, pos: number) => {
      if (targetPos !== -1) return false; // already found
      if (node.type.name === "conditionalInline") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dom = view.nodeDOM(pos) as Node | null;
        if (dom && (dom === el || el.contains(dom) || (dom as HTMLElement).contains?.(el))) {
          targetPos = pos;
          return false;
        }
      }
    });

    if (targetPos === -1) return;
    dispatch(state.tr.setNodeMarkup(targetPos, undefined, newAttrs));
  };

  const hasCondition = !!conditionValue;

  return (
    <span
      ref={rootRef}
      style={{
        display:         "inline",
        padding:         "1px 5px 1px 5px",
        border:          `1px dashed ${condModalOpen ? "#3b72d9" : "#94b8f5"}`,
        borderRadius:    4,
        backgroundColor: condModalOpen ? "#e8f0fe" : "#f0f6ff",
        verticalAlign:   "baseline",
        lineHeight:      1.6,
      }}
    >
      {/* Gear — non-editable, left side */}
      <span
        contentEditable={false}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCondModalOpen(true); }}
        title="Edit condition"
        style={{
          display:       "inline-flex",
          alignItems:    "center",
          width:         14,
          height:        14,
          color:         "#94b8f5",
          cursor:        "pointer",
          marginRight:   3,
          verticalAlign: "middle",
          transition:    "color 0.15s",
          userSelect:    "none",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#3b72d9")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#94b8f5")}
      >
        <GearIcon />
      </span>

      {/* IF badge — non-editable */}
      {hasCondition && (
        <span
          contentEditable={false}
          style={{
            fontSize:      "0.68em",
            fontWeight:    700,
            color:         "#3b72d9",
            background:    "#d0e2ff",
            borderRadius:  3,
            padding:       "0 3px",
            letterSpacing: "0.04em",
            lineHeight:    1.5,
            cursor:        "default",
            marginRight:   4,
            verticalAlign: "middle",
            userSelect:    "none",
          }}
        >
          IF
        </span>
      )}

      {/* Editable text — real ProseMirror content via contentRef */}
      <span
        ref={contentRef}
        style={{
          fontSize:   "0.9em",
          color:      "inherit",
          outline:    "none",
        }}
      />

      {/* Condition edit modal */}
      {condModalOpen && (
        <ConditionalInlineModal
          isOpen
          mode="edit"
          initialData={{ conditionField, conditionOperator, conditionValue }}
          onClose={() => setCondModalOpen(false)}
          onConfirm={(cfg) => {
            updateCondition(cfg);
            setCondModalOpen(false);
          }}
        />
      )}
    </span>
  );
}

// ── Inline content spec ───────────────────────────────────────────────────────
export const ConditionalInline = createReactInlineContentSpec(
  {
    type: "conditionalInline" as const,
    propSchema: {
      conditionField:    { default: "customerName" },
      conditionOperator: { default: "eq" },
      conditionValue:    { default: "" },
    },
    content: "styled",
  } as const,
  {
    render: ({ inlineContent, contentRef }) => (
      <ConditionalInlineInner
        conditionField={inlineContent.props.conditionField}
        conditionOperator={inlineContent.props.conditionOperator}
        conditionValue={inlineContent.props.conditionValue}
        contentRef={contentRef}
      />
    ),
  },
);
