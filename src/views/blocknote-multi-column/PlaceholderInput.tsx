"use client";

import { createReactInlineContentSpec, useBlockNoteEditor } from "@blocknote/react";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Placeholder options
// ---------------------------------------------------------------------------
const PLACEHOLDER_OPTIONS = [
  { title: "Customer Name",        label: "Customer Name" },
  { title: "Project Address",      label: "Project Address" },
  { title: "Date",                 label: "MM/DD/YYYY" },
  { title: "Amount",               label: "$0.00" },
  { title: "Phone",                label: "(xxx) xxx-xxxx" },
  { title: "Email",                label: "email@example.com" },
  { title: "Custom Field",         label: "Enter value" },
  { title: "Company Name",         label: "Company Name" },
  { title: "Company Website",      label: "Company Website" },
  { title: "Company Email",        label: "Company Email" },
  { title: "Company Phone",        label: "Company Phone" },
  { title: "Company Address",      label: "Company Address" },
  { title: "Company City/St/Zip",  label: "Company City/St/Zip" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function PlaceholderInputInner({ label }: { label: string }) {
  const editor = useBlockNoteEditor();
  const [open, setOpen]       = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!spanRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const handleSelect = (newLabel: string) => {
    if (!spanRef.current) { setOpen(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const view = (editor as any)._tiptapEditor.view;
    const rect = spanRef.current.getBoundingClientRect();
    const hit  = view.posAtCoords({
      left: rect.left + rect.width  / 2,
      top:  rect.top  + rect.height / 2,
    });

    if (hit != null) {
      const { state, dispatch } = view;
      for (let offset = -1; offset <= 1; offset++) {
        const p    = hit.pos + offset;
        if (p < 0) continue;
        const node = state.doc.nodeAt(p);
        if (node?.type.name === "placeholderInput") {
          dispatch(state.tr.setNodeMarkup(p, undefined, { ...node.attrs, label: newLabel }));
          break;
        }
      }
    }
    setOpen(false);
  };

  return (
    <span ref={spanRef} style={{ position: "relative", display: "inline" }}>
      {/* Pill — onClick so ProseMirror can still place the cursor on mousedown,
          enabling node selection and FormattingToolbar (same mechanism as Mention). */}
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          // ProseMirror places an empty cursor adjacent to atom nodes on mousedown.
          // Use NodeSelection so selection.empty === false → FormattingToolbar appears.
          if (!spanRef.current) return;
          const view = (editor as any)._tiptapEditor.view;
          const rect = spanRef.current.getBoundingClientRect();
          const hit = view.posAtCoords({ left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 });
          if (hit == null) return;
          const { state } = view;
          for (let offset = -1; offset <= 1; offset++) {
            const p = hit.pos + offset;
            if (p < 0) continue;
            const node = state.doc.nodeAt(p);
            if (node?.type.name === "placeholderInput") {
              (editor as any)._tiptapEditor.commands.setNodeSelection(p);
              break;
            }
          }
        }}
        style={{
          display:         "inline-block",
          padding:         "1px 8px",
          border:          `1px dashed ${open ? "#228be6" : "#bbb"}`,
          borderRadius:    4,
          fontSize:        "0.9em",
          lineHeight:      1.6,
          backgroundColor: open ? "#e7f3ff" : "#fafafa",
          cursor:          "pointer",
          verticalAlign:   "baseline",
          // No hardcoded color — lets mark wrappers (bold, textColor, etc.) cascade in
        }}
      >
        {label}
      </span>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position:     "absolute",
            top:          "calc(100% + 4px)",
            left:         0,
            zIndex:       1000,
            background:   "#fff",
            border:       "1px solid #e0e0e0",
            borderRadius: 6,
            boxShadow:    "0 4px 16px rgba(0,0,0,0.12)",
            minWidth:     180,
            padding:      "4px 0",
          }}
        >
          {PLACEHOLDER_OPTIONS.map((opt) => {
            const isActive = opt.label === label;
            const isHover  = hovered === opt.label;
            return (
              <div
                key={opt.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt.label);
                }}
                onMouseEnter={() => setHovered(opt.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding:    "7px 14px",
                  fontSize:   13,
                  cursor:     "pointer",
                  background: isActive ? "#f0f7ff" : isHover ? "#f5f5f5" : "transparent",
                  color:      isActive ? "#228be6" : "#333",
                  fontWeight: isActive ? 600 : 400,
                  display:    "flex",
                  alignItems: "center",
                  gap:        8,
                }}
              >
                {isActive && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="#228be6">
                    <path d="M1 5l3 3 5-6" stroke="#228be6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {!isActive && <span style={{ width: 10 }} />}
                {opt.title}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#bbb" }}>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Spec — follows the same pattern as Mention:
//   content: "none"  → atomic, non-editable
//   no stylesJson    → marks attach natively to the node, no extension needed
// ---------------------------------------------------------------------------
export const PlaceholderInput = createReactInlineContentSpec(
  {
    type: "placeholderInput",
    propSchema: {
      label: { default: "Enter value" },
    },
    content: "none",
  } as const,
  {
    render: (props) => (
      <PlaceholderInputInner label={props.inlineContent.props.label} />
    ),
  },
);
