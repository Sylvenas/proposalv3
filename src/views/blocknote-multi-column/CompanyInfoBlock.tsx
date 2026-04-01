import React from "react";
import { createReactBlockSpec } from "@blocknote/react";

// ── Logo placeholder block (non-editable) ────────────────────────────────────

export const createCompanyLogo = createReactBlockSpec(
  {
    type: "companyLogo" as const,
    propSchema: {},
    content: "none",
  },
  {
    render: () => (
      <div
        contentEditable={false}
        style={{
          width: 220,
          height: 140,
          backgroundColor: "#f0f0f0",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M8 38 L24 10 L40 38"
            stroke="#c0c0c0"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="13" y1="30" x2="35" y2="30" stroke="#c0c0c0" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 12, color: "#b0b0b0", letterSpacing: 0.5 }}>
          Company Logo
        </span>
      </div>
    ),
  },
);

// ── Per-field inline-editable block ──────────────────────────────────────────

type FieldType = "name" | "website" | "email" | "phone" | "address" | "cityStateZip";

const FIELD_STYLES: Record<FieldType, React.CSSProperties> = {
  name:         { fontSize: 20, fontWeight: 500, color: "#2d2d2d", marginBottom: 2 },
  website:      { fontSize: 15, color: "#1a0dab", textDecoration: "underline" },
  email:        { fontSize: 15, color: "#1a0dab", textDecoration: "underline" },
  phone:        { fontSize: 15, color: "#1a0dab", textDecoration: "underline" },
  address:      { fontSize: 15, color: "#2d2d2d" },
  cityStateZip: { fontSize: 15, color: "#2d2d2d" },
};

export const createCompanyField = createReactBlockSpec(
  {
    type: "companyField" as const,
    propSchema: {
      fieldType: { default: "name" },
    },
    content: "inline",
  },
  {
    render: ({ block, contentRef }) => {
      const fieldType = (block.props.fieldType ?? "name") as FieldType;
      const style = FIELD_STYLES[fieldType] ?? FIELD_STYLES.address;
      return (
        <div
          data-company-field={fieldType}
          style={{ textAlign: "right", width: "100%", ...style }}
          ref={contentRef as React.Ref<HTMLDivElement>}
        />
      );
    },
  },
);

// Default content inserted when the user adds a Company Info block via the slash menu
export const COMPANY_INFO_INITIAL_BLOCKS = [
  {
    type: "columnList" as const,
    children: [
      {
        type: "column" as const,
        props: { width: 0.6 },
        children: [{ type: "companyLogo" as const }],
      },
      {
        type: "column" as const,
        props: { width: 1.0 },
        children: [
          { type: "companyField" as const, props: { fieldType: "name" },         content: "Sample Company" },
          { type: "companyField" as const, props: { fieldType: "website" },      content: "www.sample.com" },
          { type: "companyField" as const, props: { fieldType: "email" },        content: "sample@sample.com" },
          { type: "companyField" as const, props: { fieldType: "phone" },        content: "(888) 266-1843" },
          { type: "companyField" as const, props: { fieldType: "address" },      content: "Company Street Address" },
          { type: "companyField" as const, props: { fieldType: "cityStateZip" }, content: "Company City, MI, 49546" },
        ],
      },
    ],
  },
] as const;
