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
  neq: "is not empty,",
  contains: "contains",
  notContains: "does not contain",
};

// Block-toggle icon: 3 horizontal lines in blue (left of text in header)
const BlockToggleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="#398ae7" />
    <rect x="2" y="7.25" width="9" height="1.5" rx="0.75" fill="#398ae7" />
    <rect x="2" y="10.5" width="12" height="1.5" rx="0.75" fill="#398ae7" />
  </svg>
);

// Filled blue gear icon for the right side of the header
const ConditionalGearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.5 1.5h3l.4 1.9c.35.13.68.3.98.5l1.83-.6 1.5 2.6-1.46 1.3c.04.27.04.54 0 .8l1.46 1.3-1.5 2.6-1.83-.6c-.3.2-.63.37-.98.5L9.5 14.5h-3l-.4-1.9a4.3 4.3 0 0 1-.98-.5l-1.83.6-1.5-2.6 1.46-1.3a4.03 4.03 0 0 1 0-.8L1.79 6.9l1.5-2.6 1.83.6c.3-.2.63-.37.98-.5L6.5 1.5z"
      fill="#398ae7"
    />
    <circle cx="8" cy="8" r="1.8" fill="white" />
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

        // Build the inline text pieces: "if" [field bold blue] operator "show:"
        const showOperator = conditionOperator === "neq" ? "is not empty," : operatorLabel;

        return (
          <div
            className="conditional-section-block"
            data-condition-field={conditionField}
            data-condition-operator={conditionOperator}
            data-condition-value={conditionValue}
            contentEditable={false}
          >
            <div className="conditional-section-header">
              {/* Left: block-toggle icon */}
              <span className="conditional-section-toggle">
                <BlockToggleIcon />
              </span>

              {/* Inline text: "if [Field] operator show:" */}
              <span className="conditional-section-text">
                <span className="conditional-section-if">if</span>
                {" "}
                <span className="conditional-section-field">[{fieldLabel}]</span>
                {" "}
                <span className="conditional-section-operator">{showOperator}</span>
                {" "}
                <span className="conditional-section-show">show:</span>
              </span>

              {/* Spacer */}
              <span style={{ flex: 1 }} />

              {/* Right: gear icon button */}
              <button
                className="conditional-section-gear"
                onClick={(e) => {
                  e.stopPropagation();
                  setPanelOpen((v) => !v);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Configure condition"
              >
                <ConditionalGearIcon />
              </button>

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
