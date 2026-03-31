"use client";

import { useState } from "react";

const FIELD_OPTIONS = [
  { value: "customerName",   label: "Customer Name" },
  { value: "projectAddress", label: "Project Address" },
  { value: "completionDate", label: "Completion Date" },
  { value: "totalBudget",    label: "Total Budget" },
];

const OPERATOR_OPTIONS = [
  { value: "eq",          label: "equals" },
  { value: "neq",         label: "does not equal" },
  { value: "contains",    label: "contains" },
  { value: "notContains", label: "does not contain" },
];

export interface ConditionalSectionConfig {
  conditionField:    string;
  conditionOperator: string;
  conditionValue:    string;
}

interface Props {
  isOpen:   boolean;
  onClose:  () => void;
  onInsert: (config: ConditionalSectionConfig) => void;
}

export function ConditionalSectionModal({ isOpen, onClose, onInsert }: Props) {
  const [field,    setField]    = useState("customerName");
  const [operator, setOperator] = useState("eq");
  const [value,    setValue]    = useState("");

  if (!isOpen) return null;

  const fieldLabel    = FIELD_OPTIONS.find(o => o.value === field)?.label    ?? field;
  const operatorLabel = OPERATOR_OPTIONS.find(o => o.value === operator)?.label ?? operator;
  const preview       = value
    ? `Show when ${fieldLabel} ${operatorLabel} "${value}"`
    : "No condition set — always shown";

  const handleInsert = () => {
    onInsert({ conditionField: field, conditionOperator: operator, conditionValue: value });
    // Reset for next time
    setField("customerName");
    setOperator("eq");
    setValue("");
  };

  const handleClose = () => {
    setField("customerName");
    setOperator("eq");
    setValue("");
    onClose();
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
      onMouseDown={handleClose}
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
              Configure Conditional Section
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
              Set the condition before inserting the block
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Field */}
          <div>
            <label style={labelStyle}>Field</label>
            <select style={selectStyle} value={field} onChange={(e) => setField(e.target.value)}>
              {FIELD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div>
            <label style={labelStyle}>Condition</label>
            <select style={selectStyle} value={operator} onChange={(e) => setOperator(e.target.value)}>
              {OPERATOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div>
            <label style={labelStyle}>Value</label>
            <input
              type="text"
              placeholder="Enter value to compare…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInsert()}
              autoFocus
              style={{
                ...selectStyle,
                cursor: "text",
              }}
            />
          </div>

          {/* Live preview */}
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
            onClick={handleClose}
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
            onClick={handleInsert}
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
            Insert Block
          </button>
        </div>
      </div>
    </div>
  );
}
