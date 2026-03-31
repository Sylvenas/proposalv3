"use client";

import { COLORS_DEFAULT, createExtension } from "@blocknote/core";
import { createReactInlineContentSpec, useBlockNoteEditor } from "@blocknote/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { CSSProperties, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Utilities (exported so BlockNoteMultiColumn can reuse them)
// ---------------------------------------------------------------------------

/** Resolve a BlockNote named color (e.g. "orange") or any CSS color to hex. */
export function resolveBlockNoteColor(name: string): string {
  if (!name || name === "default") return "";
  return COLORS_DEFAULT[name]?.text ?? name;
}

/** Safely parse the JSON stored in the `stylesJson` node prop. */
export function parseStyles(json: string): Record<string, unknown> {
  if (!json) return {};
  try { return JSON.parse(json) as Record<string, unknown>; } catch { return {}; }
}

/** Convert a styles object to React inline CSS for the editor pill. */
export function stylesToReactCSS(styles: Record<string, unknown>): CSSProperties {
  const css: CSSProperties = {};
  if (styles.bold)      css.fontWeight = "bold";
  if (styles.italic)    css.fontStyle  = "italic";
  const deco: string[] = [];
  if (styles.underline) deco.push("underline");
  if (styles.strike)    deco.push("line-through");
  if (deco.length)      css.textDecoration = deco.join(" ");
  if (styles.code)      css.fontFamily     = "monospace";
  if (styles.textColor) css.color = resolveBlockNoteColor(styles.textColor as string);
  return css;
}

// ---------------------------------------------------------------------------
// Mark → value extractor lookup table.
// Add an entry here whenever BlockNote gains a new mark type.
// ---------------------------------------------------------------------------
const MARK_TO_VALUE: Record<string, (attrs?: Record<string, string>) => unknown> = {
  bold:      () => true,
  italic:    () => true,
  underline: () => true,
  strike:    () => true,
  code:      () => true,
  textColor: (attrs) => attrs?.stringValue ?? "",
};

// ---------------------------------------------------------------------------
// BlockNote extension: syncs ALL supported marks → `stylesJson` node prop.
//
// `content:"none"` inline nodes have `marks:""` in ProseMirror, so TipTap
// silently drops mark changes on them. We intercept every AddMarkStep /
// RemoveMarkStep in appendTransaction and merge the result into a single
// `stylesJson` prop, which BlockNote serialises as `data-styles-json` in the
// exported HTML.  Adding support for a new mark type only requires one new
// line in MARK_TO_VALUE above.
// ---------------------------------------------------------------------------
export const placeholderColorSyncExtension = createExtension({
  key: "placeholderStyleSync",
  prosemirrorPlugins: [
    new Plugin({
      key: new PluginKey("placeholderStyleSync"),
      appendTransaction(transactions, oldState, newState) {
        // Collect mark changes from all transactions
        const markChanges: Array<{ type: string; value: unknown | null }> = [];

        for (const tr of transactions) {
          for (const step of tr.steps) {
            const json = step.toJSON() as {
              stepType: string;
              mark?: { type: string; attrs?: Record<string, string> };
            };
            const markType = json.mark?.type ?? "";
            if (!(markType in MARK_TO_VALUE)) continue;

            if (json.stepType === "addMark") {
              markChanges.push({ type: markType, value: MARK_TO_VALUE[markType](json.mark?.attrs) });
            } else if (json.stepType === "removeMark") {
              markChanges.push({ type: markType, value: null }); // null → delete key
            }
          }
        }

        if (markChanges.length === 0) return null;

        // Use the pre-transaction selection to cover the full selected range.
        const { from, to } = oldState.selection;
        const result = newState.tr;
        let changed = false;

        newState.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name !== "placeholderInput") return;

          const current = parseStyles(node.attrs.stylesJson);
          let dirty = false;

          for (const { type, value } of markChanges) {
            if (value === null) {
              if (type in current) { delete current[type]; dirty = true; }
            } else {
              if (current[type] !== value) { current[type] = value; dirty = true; }
            }
          }

          if (dirty) {
            const stylesJson = Object.keys(current).length ? JSON.stringify(current) : "";
            result.setNodeMarkup(pos, undefined, { ...node.attrs, stylesJson });
            changed = true;
          }
        });

        return changed ? result : null;
      },
    }),
  ],
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const PLACEHOLDER_OPTIONS = [
  { title: "Customer Name",   label: "Customer Name" },
  { title: "Project Address", label: "Project Address" },
  { title: "Date",            label: "MM/DD/YYYY" },
  { title: "Amount",          label: "$0.00" },
  { title: "Phone",           label: "(xxx) xxx-xxxx" },
  { title: "Email",           label: "email@example.com" },
  { title: "Custom Field",    label: "Enter value" },
];

function PlaceholderInputInner({ label, stylesJson }: { label: string; stylesJson: string }) {
  const styles    = parseStyles(stylesJson);
  const extraCSS  = stylesToReactCSS(styles);
  const editor    = useBlockNoteEditor();
  const [open, setOpen]       = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

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
          // Preserve all existing attrs (including stylesJson) — only update label
          dispatch(state.tr.setNodeMarkup(p, undefined, { ...node.attrs, label: newLabel }));
          break;
        }
      }
    }
    setOpen(false);
  };

  return (
    <span ref={spanRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Visible pill */}
      <span
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          display: "inline-block",
          padding: "1px 8px",
          border: `1px dashed ${open ? "#228be6" : "#bbb"}`,
          borderRadius: 4,
          fontSize: "0.9em",
          lineHeight: 1.6,
          backgroundColor: open ? "#e7f3ff" : "#fafafa",
          cursor: "pointer",
          verticalAlign: "baseline",
          // Apply user-set formatting; fall back to inherited color when none set
          color: open ? "#228be6" : (extraCSS.color ?? "inherit"),
          ...extraCSS,
          // Override color again so "open" blue always wins
          ...(open ? { color: "#228be6" } : {}),
        }}
      >
        {label}
      </span>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: 180,
            padding: "4px 0",
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
                  padding: "7px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  background: isActive ? "#f0f7ff" : isHover ? "#f5f5f5" : "transparent",
                  color: isActive ? "#228be6" : "#333",
                  fontWeight: isActive ? 600 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
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
// Spec
// ---------------------------------------------------------------------------
export const PlaceholderInput = createReactInlineContentSpec(
  {
    type: "placeholderInput",
    propSchema: {
      label:      { default: "Enter value" },
      stylesJson: { default: "" },
    },
    content: "none",
  } as const,
  {
    render: (props) => (
      <PlaceholderInputInner
        label={props.inlineContent.props.label}
        stylesJson={props.inlineContent.props.stylesJson}
      />
    ),
  },
);
