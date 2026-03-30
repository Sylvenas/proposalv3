"use client";

import { useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";

const FIELD_LABELS: Record<string, string> = {
  customerName: "Customer Name",
  projectAddress: "Project Address",
  completionDate: "Completion Date",
  totalBudget: "Total Budget",
};

const OPERATOR_LABELS: Record<string, string> = {
  eq: "equals",
  neq: "does not equal",
  contains: "contains",
  notContains: "does not contain",
};

const GearIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const createConditionalSection = createReactBlockSpec(
    {
      type: "conditionalSection" as const,
      propSchema: {
        conditionField: { default: "customerName" },
        conditionOperator: { default: "eq" },
        conditionValue: { default: "" },
      },
      content: "none",
    },
    {
      render: ({ block, editor }) => {
        const [panelOpen, setPanelOpen] = useState(false);
        const { conditionField, conditionOperator, conditionValue } = block.props;

        const updateProp = (key: string, value: string) => {
          editor.updateBlock(block, { props: { [key]: value } });
        };

        const fieldLabel = FIELD_LABELS[conditionField] ?? conditionField;
        const operatorLabel = OPERATOR_LABELS[conditionOperator] ?? conditionOperator;

        const summary = conditionValue
          ? `Show when ${fieldLabel} ${operatorLabel} "${conditionValue}"`
          : "No condition set — always shown";

        return (
          <div
            className="conditional-section-block"
            data-condition-field={conditionField}
            data-condition-operator={conditionOperator}
            data-condition-value={conditionValue}
            contentEditable={false}
          >
            <div className="conditional-section-header">
              <button
                className="conditional-section-gear"
                onClick={(e) => {
                  e.stopPropagation();
                  setPanelOpen((v) => !v);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Configure condition"
              >
                <GearIcon />
              </button>
              <span className="conditional-section-label">IF</span>
              <span className="conditional-section-summary">{summary}</span>

              {panelOpen && (
                <div
                  className="conditional-section-panel"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="conditional-section-panel-row">
                    <label>Field</label>
                    <select
                      value={conditionField}
                      onChange={(e) => updateProp("conditionField", e.target.value)}
                    >
                      {Object.entries(FIELD_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="conditional-section-panel-row">
                    <label>Operator</label>
                    <select
                      value={conditionOperator}
                      onChange={(e) => updateProp("conditionOperator", e.target.value)}
                    >
                      {Object.entries(OPERATOR_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="conditional-section-panel-row">
                    <label>Value</label>
                    <input
                      type="text"
                      value={conditionValue}
                      onChange={(e) => updateProp("conditionValue", e.target.value)}
                      placeholder="Enter value to compare"
                    />
                  </div>
                  <button
                    className="conditional-section-done"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPanelOpen(false);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  );
