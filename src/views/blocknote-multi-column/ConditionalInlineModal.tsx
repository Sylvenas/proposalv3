"use client";

import { useEffect, useState } from "react";

export const FIELD_OPTIONS = [
  { value: "customerName",   label: "Customer Name" },
  { value: "projectAddress", label: "Project Address" },
  { value: "completionDate", label: "Completion Date" },
  { value: "totalBudget",    label: "Total Budget" },
];

export const OPERATOR_OPTIONS = [
  { value: "eq",          label: "equals" },
  { value: "neq",         label: "does not equal" },
  { value: "contains",    label: "contains" },
  { value: "notContains", label: "does not contain" },
];

export interface ConditionalInlineConfig {
  text:              string;
  conditionField:    string;
  conditionOperator: string;
  conditionValue:    string;
}

interface ConditionOnly {
  conditionField:    string;
  conditionOperator: string;
  conditionValue:    string;
}

interface Props {
  isOpen:       boolean;
  onClose:      () => void;
  onConfirm:    (config: ConditionOnly) => void;
  initialData?: Partial<ConditionOnly>;
  mode?:        "insert" | "edit";
}

const DEFAULT: ConditionOnly = {
  conditionField:    "customerName",
  conditionOperator: "eq",
  conditionValue:    "",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #ddd",
  borderRadius: 5,
  fontSize: 13,
  outline: "none",
  background: "#fff",
  color: "#333",
  boxSizing: "border-box",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "#666",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export function ConditionalInlineModal({ isOpen, onClose, onConfirm, initialData, mode = "insert" }: Props) {
  const [cfg, setCfg] = useState<ConditionOnly>(DEFAULT);

  useEffect(() => {
    if (isOpen) setCfg({ ...DEFAULT, ...initialData });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const set = (key: keyof ConditionOnly, val: string) =>
    setCfg((prev) => ({ ...prev, [key]: val }));

  const fieldLabel    = FIELD_OPTIONS.find(o => o.value === cfg.conditionField)?.label    ?? cfg.conditionField;
  const operatorLabel = OPERATOR_OPTIONS.find(o => o.value === cfg.conditionOperator)?.label ?? cfg.conditionOperator;
  const preview       = cfg.conditionValue
    ? `Show when ${fieldLabel} ${operatorLabel} "${cfg.conditionValue}"`
    : "No condition set — always shown";

  const handleConfirm = () => onConfirm(cfg);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          width: 420,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px 14px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "#e8f0fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b72d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
              {mode === "edit" ? "Edit Condition" : "Configure Conditional Text"}
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
              {mode === "edit" ? "Update when this text should be shown" : "Set the condition before inserting the text"}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Field */}
          <div>
            <label style={labelStyle}>Field</label>
            <select
              style={selectStyle}
              value={cfg.conditionField}
              onChange={(e) => set("conditionField", e.target.value)}
              autoFocus
            >
              {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Operator */}
          <div>
            <label style={labelStyle}>Condition</label>
            <select style={selectStyle} value={cfg.conditionOperator} onChange={(e) => set("conditionOperator", e.target.value)}>
              {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Value */}
          <div>
            <label style={labelStyle}>Value</label>
            <input
              type="text"
              placeholder="Enter value to compare…"
              value={cfg.conditionValue}
              onChange={(e) => set("conditionValue", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              style={{ ...selectStyle, cursor: "text" }}
            />
          </div>

          {/* Preview */}
          <div
            style={{
              padding: "8px 12px",
              background: "#f5f8ff",
              border: "1px solid #d0e2ff",
              borderRadius: 5,
              fontSize: 12,
              color: "#4a6fa0",
              fontStyle: "italic",
            }}
          >
            {preview}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 13,
              background: "#fff",
              color: "#555",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "7px 18px",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              background: "#228be6",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {mode === "edit" ? "Save" : "Insert"}
          </button>
        </div>
      </div>
    </div>
  );
}
