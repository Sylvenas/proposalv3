"use client";

import { BlockNoteSchema, combineByGroup } from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import * as locales from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@mantine/core/styles.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  getMultiColumnSlashMenuItems,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ── Conditional section: mark wrappers so the server can remove them ──────────
//
// blocksToHTMLLossy serializes nested blocks as FLAT SIBLINGS with a
// data-nesting-level attribute — there is no common wrapping ancestor.
// We collect the header div + all immediately-following siblings that carry
// data-nesting-level, then wrap them in a new div stamped with
// data-conditional-wrapper. The server removes that wrapper (and its children)
// when the condition is not met.

function markConditionalSections(htmlContent: string): string {
  if (typeof document === "undefined") return htmlContent;

  const container = document.createElement("div");
  container.innerHTML = htmlContent;

  container
    .querySelectorAll<HTMLElement>(".conditional-section-block")
    .forEach((header) => {
      const field = header.dataset.conditionField ?? "";
      const operator = header.dataset.conditionOperator ?? "eq";
      const value = header.dataset.conditionValue ?? "";

      // Collect the header + all immediately-following siblings with data-nesting-level
      const toWrap: HTMLElement[] = [header];
      let sibling = header.nextElementSibling as HTMLElement | null;
      while (sibling && sibling.hasAttribute("data-nesting-level")) {
        toWrap.push(sibling);
        sibling = sibling.nextElementSibling as HTMLElement | null;
      }

      // Create wrapper, stamp attributes, move elements into it
      const wrapper = document.createElement("div");
      wrapper.dataset.conditionalWrapper = "true";
      wrapper.dataset.conditionField = field;
      wrapper.dataset.conditionOperator = operator;
      wrapper.dataset.conditionValue = value;

      header.parentElement!.insertBefore(wrapper, header);
      toWrap.forEach((el) => wrapper.appendChild(el));
    });

  return container.innerHTML;
}

// ─────────────────────────────────────────────────────────────────────────────

// ── Evaluate inline conditionals client-side before sending to the server ────
//
// BlockNote serializes `[data-inline-content-type="conditionalInline"]` spans
// containing both non-editable UI (gear icon, IF badge) and the user's text
// in a `[data-editable]` child span. We need to:
//   - Remove the whole element when the condition is not met
//   - Replace with plain text when the condition IS met

function getFieldValue(formData: ExportFormData, field: string): string {
  switch (field) {
    case "customerName":
      return formData.customerName ?? "";
    case "projectAddress":
      return formData.projectAddress ?? "";
    case "completionDate":
      return formData.completionDate ?? "";
    case "totalBudget":
      return formData.totalBudget ?? "";
    default:
      return "";
  }
}

function evaluateCondition(
  fieldValue: string,
  operator: string,
  conditionValue: string,
): boolean {
  if (!conditionValue) return true; // No condition set → always show
  const a = fieldValue.toLowerCase();
  const b = conditionValue.toLowerCase();
  switch (operator) {
    case "eq":
      return a === b;
    case "neq":
      return a !== b;
    case "contains":
      return a.includes(b);
    case "notContains":
      return !a.includes(b);
    default:
      return true;
  }
}

function processInlineConditionals(
  fullHtml: string,
  formData: ExportFormData,
): string {
  if (typeof document === "undefined") return fullHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, "text/html");

  doc
    .querySelectorAll<HTMLElement>(
      '[data-inline-content-type="conditionalInline"]',
    )
    .forEach((el) => {
      // BlockNote only serialises non-default props, so fall back to schema defaults
      const field = el.dataset.conditionField ?? "customerName";
      const operator = el.dataset.conditionOperator ?? "eq";
      const value = el.dataset.conditionValue ?? "";

      // The user-typed text lives in the [data-editable] child span
      const editableSpan = el.querySelector<HTMLElement>("[data-editable]");
      const text = editableSpan?.textContent ?? "";

      const conditionMet = evaluateCondition(
        getFieldValue(formData, field),
        operator,
        value,
      );

      if (conditionMet) {
        el.replaceWith(document.createTextNode(text));
      } else {
        el.remove();
      }
    });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

// ── Client-side HTML post-processing (mirrors pdf-server replace_placeholders) ─

const PLACEHOLDER_FIELD_MAP: Record<string, keyof ExportFormData> = {
  "Customer Name":       "customerName",
  "Project Address":     "projectAddress",
  "MM/DD/YYYY":          "completionDate",
  "$0.00":               "totalBudget",
  "Company Name":        "companyName",
  "Company Website":     "companyWebsite",
  "Company Email":       "companyEmail",
  "Company Phone":       "companyPhone",
  "Company Address":     "companyAddress",
  "Company City/St/Zip": "companyCityStateZip",
};

function replacePlaceholderInputs(
  html: string,
  formData: ExportFormData,
): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc
    .querySelectorAll<HTMLElement>(
      '[data-inline-content-type="placeholderInput"]',
    )
    .forEach((el) => {
      const label = el.dataset.label ?? el.textContent?.trim() ?? "";
      const fieldKey = PLACEHOLDER_FIELD_MAP[label];
      const value = fieldKey
        ? (formData[fieldKey] as string) || "\u2014"
        : "\u2014";

      // All formatting is stored as JSON in the stylesJson prop → data-styles-json attribute
      const css = stylesToReactCSS(parseStyles(el.dataset.stylesJson ?? ""));

      el.innerHTML = "";
      const span = document.createElement("span");
      if (css.fontWeight) span.style.fontWeight = String(css.fontWeight);
      if (css.fontStyle) span.style.fontStyle = String(css.fontStyle);
      if (css.textDecoration)
        span.style.textDecoration = String(css.textDecoration);
      if (css.fontFamily) span.style.fontFamily = String(css.fontFamily);
      if (css.color) span.style.color = String(css.color);
      span.textContent = value;
      el.appendChild(span);
    });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function processConditionalSectionBlocks(
  html: string,
  formData: ExportFormData,
): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc
    .querySelectorAll<HTMLElement>('[data-conditional-wrapper="true"]')
    .forEach((el) => {
      const field = el.dataset.conditionField ?? "";
      const operator = el.dataset.conditionOperator ?? "eq";
      const compare = el.dataset.conditionValue ?? "";
      if (!compare.trim()) return;
      const met = evaluateCondition(
        getFieldValue(formData, field),
        operator,
        compare,
      );
      if (!met) el.remove();
    });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function buildProductListHtml(
  products: { name: string; quantity: string; amount: string }[],
  summary?: {
    subtotal: string;
    discount: string;
    salesTaxRate: string;
    salesTax: string;
    total: string;
  },
): string {
  const rows = products
    .map(
      (p) =>
        `<div class="product-list-row">` +
        `<div class="product-list-desc"><div class="product-list-name">${p.name}</div></div>` +
        `<div class="product-list-qty">${p.quantity}</div>` +
        `<div class="product-list-amt">${p.amount}</div>` +
        `</div>`,
    )
    .join("");

  let summaryRows = "";
  if (
    summary &&
    (summary.subtotal || summary.discount || summary.salesTax || summary.total)
  ) {
    if (summary.subtotal)
      summaryRows += `<div class="product-list-summary-row"><span>Subtotal</span><span>${summary.subtotal}</span></div>`;
    if (summary.discount)
      summaryRows += `<div class="product-list-summary-row"><span>Discount</span><span>${summary.discount}</span></div>`;
    if (summary.salesTax) {
      const ratePrefix = summary.salesTaxRate
        ? `(${summary.salesTaxRate}) `
        : "";
      summaryRows += `<div class="product-list-summary-row"><span>Sales Tax</span><span>${ratePrefix}${summary.salesTax}</span></div>`;
    }
    if (summary.total)
      summaryRows += `<div class="product-list-summary-row product-list-total"><span>Total</span><span>${summary.total}</span></div>`;
  } else {
    const total = products.reduce((sum, p) => {
      const cleaned = p.amount.replace(/[^0-9.\-]/g, "");
      return sum + (parseFloat(cleaned) || 0);
    }, 0);
    summaryRows = `<div class="product-list-summary-row product-list-total"><span>Total</span><span>$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>`;
  }

  return (
    `<div class="product-list-block">` +
    `<div class="product-list-title">Product List</div>` +
    `<div class="product-list-table">` +
    `<div class="product-list-header"><div class="product-list-desc">Description</div><div class="product-list-qty">Quantity</div><div class="product-list-amt">Amount</div></div>` +
    rows +
    `<div class="product-list-summary">${summaryRows}</div>` +
    `</div></div>`
  );
}

// ── Preview-only: inline conditionals from the live ProseMirror DOM ──────────
// blocksToHTMLLossy puts the editable text in [data-editable]; the editor DOM
// renders it via contentRef (no data-editable attr). We extract it by cloning
// the element and stripping all contenteditable=false children (gear, IF badge).
function processInlineConditionalsFromEditorDom(
  html: string,
  formData: ExportFormData,
): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc
    .querySelectorAll<HTMLElement>(
      '[data-inline-content-type="conditionalInline"]',
    )
    .forEach((el) => {
      const field = el.dataset.conditionField ?? "customerName";
      const operator = el.dataset.conditionOperator ?? "eq";
      const value = el.dataset.conditionValue ?? "";

      const clone = el.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll('[contenteditable="false"]')
        .forEach((n) => n.remove());
      const text = clone.textContent ?? "";

      if (evaluateCondition(getFieldValue(formData, field), operator, value)) {
        el.replaceWith(document.createTextNode(text));
      } else {
        el.remove();
      }
    });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

// ── Preview-only: conditional sections from the live ProseMirror DOM ─────────
// In the editor DOM, conditional children are properly nested under .bn-block-outer.
// Removing that ancestor removes both the header and all child blocks atomically.
function processConditionalSectionsFromEditorDom(
  html: string,
  formData: ExportFormData,
): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc
    .querySelectorAll<HTMLElement>(".conditional-section-block")
    .forEach((el) => {
      const field = el.dataset.conditionField ?? "";
      const operator = el.dataset.conditionOperator ?? "eq";
      const compare = el.dataset.conditionValue ?? "";
      if (!compare.trim()) return;
      if (
        !evaluateCondition(getFieldValue(formData, field), operator, compare)
      ) {
        el.closest(".bn-block-outer")?.remove();
      }
      // condition met → .conditional-section-header already hidden by CSS
    });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function replaceProductListBlocks(
  html: string,
  formData: ExportFormData,
): string {
  if (typeof document === "undefined") return html;
  if (!formData.products?.length) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll(".product-list-block").forEach((block) => {
    const temp = doc.createElement("div");
    temp.innerHTML = buildProductListHtml(formData.products, formData.summary);
    block.replaceWith(temp.firstElementChild!);
  });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

// ─────────────────────────────────────────────────────────────────────────────

import { createProductList } from "./ProductListBlock";
import { createConditionalSection } from "./ConditionalSectionBlock";
import { createPageBreak } from "./PageBreakBlock";
import {
  createCompanyLogo,
  createCompanyField,
  COMPANY_INFO_INITIAL_BLOCKS,
} from "./CompanyInfoBlock";
import { createDrawing } from "./DrawingBlock";
import {
  PlaceholderInput,
  placeholderColorSyncExtension,
  parseStyles,
  stylesToReactCSS,
} from "./PlaceholderInput";
import { ConditionalInline } from "./ConditionalInlineContent";
import { ExportModal, type ExportFormData } from "./ExportModal";
import {
  ConditionalSectionModal,
  type ConditionalSectionConfig,
} from "./ConditionalSectionModal";
import { ConditionalInlineModal } from "./ConditionalInlineModal";
import "./product-list.css";
import "./conditional-section.css";
import "./page-break.css";
// Auto-generated from @blocknote/core dist/style.css by scripts/generate-bn-css.mjs
// Injected into the preview iframe and PDF export HTML so styles stay in sync with the editor.
import blocknoteCoreCSS from "./bn-core-css.generated";

const PDF_STYLES = `
  ${blocknoteCoreCSS}

  /* ── PDF page setup ──────────────────────────────────────────────────────── */
  @page { size: A4; margin: 20mm; }
  body {
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    color: #3f3f3f;
    line-height: 1.6;
  }

  /* ── Typography (blocksToHTMLLossy outputs semantic tags) ────────────────── */
  h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; }
  h2 { font-size: 20px; font-weight: 700; margin: 14px 0 6px; }
  h3 { font-size: 16px; font-weight: 600; margin: 12px 0 4px; }
  p { margin: 6px 0; }
  p:empty { min-height: 1.6em; }
  ul, ol { margin: 4px 0; padding-left: 24px; }
  li { margin: 2px 0; }

  /* ── Custom block styles ─────────────────────────────────────────────────── */
  .product-list-block { width: 100%; font-family: "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #1a1a1a; }
  .product-list-title { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .product-list-table { border-top: 1px solid #e0e0e0; }
  .product-list-header { display: grid; grid-template-columns: 1fr 80px 80px; padding: 4px 6px; background: #f5f5f5; font-weight: 700; font-size: 11px; border-bottom: 1px solid #e0e0e0; }
  .product-list-row { display: grid; grid-template-columns: 1fr 80px 80px; padding: 6px; border-bottom: 1px solid #eee; align-items: center; }
  .product-list-desc { display: flex; align-items: center; gap: 6px; }
  .product-list-name { font-weight: 600; font-size: 11px; }
  .product-list-qty { text-align: left; }
  .product-list-amt { text-align: right; font-weight: 500; }
  .product-list-summary { padding: 6px; border-top: 1px solid #e0e0e0; }
  .product-list-summary-row { display: flex; justify-content: flex-end; gap: 20px; padding: 1px 0; font-size: 10px; color: #555; }
  .product-list-summary-row span:first-child { min-width: 60px; text-align: right; }
  .product-list-summary-row span:last-child { min-width: 70px; text-align: right; }
  .product-list-total { font-weight: 700; font-size: 11px; color: #1a1a1a; padding-top: 2px; }

  .drawing-block { width: 100%; font-family: "Segoe UI", Roboto, sans-serif; }

  /* ── Inline content ──────────────────────────────────────────────────────── */
  [data-inline-content-type="placeholderInput"] { display: inline; }
  [data-inline-content-type="conditionalInline"] { display: inline; }

  /* ── Suppress editor-only chrome ────────────────────────────────────────── */
  .conditional-section-block { border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
  .conditional-section-header { display: none !important; }

  /* ── Page break ──────────────────────────────────────────────────────────── */
  [data-page-break="true"] { display: block; height: 0; overflow: hidden; visibility: hidden; break-after: page; page-break-after: always; }

  /* ── WeasyPrint flex-height bug workaround ─────────────────────────────── */
  /* WeasyPrint miscalculates the height of flex-row containers, leaving a
     large blank gap after them. The pdf-server converts column-lists from
     flex to CSS table layout with proportional widths (see
     convert_flex_columns_to_table in server.py). These rules are a
     safety net in case the server transform is skipped. */
  .bn-block-column-list { table-layout: fixed; }
  .bn-block-column { vertical-align: top; }
`;

// pagedjs reads @page { size: A4; margin: 20mm } from PDF_STYLES and auto-paginates.
// We only need to style the outer shell and give each generated .pagedjs_page a shadow.
const PREVIEW_EXTRA_STYLES = `
  /* Zero out @page margins so pagedjs sets all --pagedjs-margin-* vars to 0.
     This collapses the empty grid rows/columns that were pushing content down.
     The 20mm margins in PDF_STYLES still apply when exporting via WeasyPrint. */
  @page { margin: 0; }
  body {
    background: #e8e8e8;
    margin: 0;
    padding: 16px 0;
  }
  .pagedjs_pages {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .pagedjs_page {
    box-shadow: 0 2px 12px rgba(0,0,0,0.10) !important;
    background: white !important;
  }
`;

const DEFAULT_PREVIEW_DATA: ExportFormData = {
  customerName: "Emily Richardson",
  projectAddress: "742 Evergreen Terrace, Springfield, IL 62704",
  completionDate: "09/20/2026",
  totalBudget: "$87,350.00",
  companyName: "Apex Construction LLC",
  companyWebsite: "www.apexconstruction.com",
  companyEmail: "contact@apexconstruction.com",
  companyPhone: "(616) 847-2200",
  companyAddress: "4820 Cascade Rd SE",
  companyCityStateZip: "Grand Rapids, MI, 49503",
  products: [
    {
      name: "6ft Cedar Privacy Fence",
      quantity: "320 ft",
      amount: "$25,600.00",
    },
    {
      name: "Aluminum Gate (Double Swing)",
      quantity: "2",
      amount: "$4,200.00",
    },
    { name: "Concrete Post Footings", quantity: "48", amount: "$7,680.00" },
    { name: "Stain & Sealant Treatment", quantity: "1", amount: "$3,200.00" },
    { name: "Permit & Inspection Fee", quantity: "1", amount: "$450.00" },
  ],
  summary: {
    subtotal: "$41,130.00",
    discount: "-$1,500.00",
    salesTaxRate: "6.25%",
    salesTax: "$2,476.88",
    total: "$42,106.88",
  },
};

const schema = withMultiColumn(
  BlockNoteSchema.create().extend({
    blockSpecs: {
      productList: createProductList(),
      conditionalSection: createConditionalSection(),
      pageBreak: createPageBreak(),
      companyLogo: createCompanyLogo(),
      companyField: createCompanyField(),
      drawing: createDrawing(),
    },
    inlineContentSpecs: {
      placeholderInput: PlaceholderInput,
      conditionalInline: ConditionalInline,
    },
  }),
);

// ── Full initial document content ─────────────────────────────────────────────
// Edit this single constant to change what appears in the editor on first load.
// All values here are placeholders — replace with real data before shipping.
const INITIAL_EDITOR_CONTENT = [
  {
    type: "heading" as const,
    props: { level: 2 },
    content: "Custom Block in Multi-Column Layout Test",
  },
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
          {
            type: "companyField" as const,
            props: { fieldType: "name" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Name" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "website" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Website" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "email" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Email" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "phone" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Phone" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "address" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Address" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "cityStateZip" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company City/St/Zip" } }],
          },
        ],
      },
    ],
  },
  {
    type: "paragraph" as const,
    content:
      "Below is a Product List custom block placed inside a multi-column layout to verify custom blocks work with columns.",
  },
  {
    type: "columnList" as const,
    children: [
      {
        type: "column" as const,
        props: { width: 1.6 },
        children: [{ type: "productList" as const }],
      },
      {
        type: "column" as const,
        props: { width: 1.0 },
        children: [
          {
            type: "heading" as const,
            props: { level: 3 },
            content: "Project Notes",
          },
          {
            type: "paragraph" as const,
            content:
              "This column sits next to the Product List to verify that custom blocks participate in multi-column layouts correctly.",
          },
          {
            type: "bulletListItem" as const,
            content: "Custom blocks render properly in columns",
          },
          {
            type: "bulletListItem" as const,
            content: "Drag & drop works across columns",
          },
          {
            type: "bulletListItem" as const,
            content: "Slash menu includes product list insert",
          },
        ],
      },
    ],
  },
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Custom Inline Content Demo",
  },
  {
    type: "paragraph" as const,
    content: [
      "The customer name is ",
      { type: "placeholderInput" as const, props: { label: "Customer Name" } },
      " and the project address is ",
      {
        type: "placeholderInput" as const,
        props: { label: "Project Address" },
      },
      ".",
    ],
  },
  {
    type: "paragraph" as const,
    content: [
      "Estimated completion date: ",
      { type: "placeholderInput" as const, props: { label: "MM/DD/YYYY" } },
      ", total budget: ",
      { type: "placeholderInput" as const, props: { label: "$0.00" } },
      ".",
    ],
  },
  {
    type: "paragraph" as const,
    content: 'Type "#" to insert a placeholder input field anywhere.',
  },
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Standalone Product List (outside columns)",
  },
  { type: "productList" as const },
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Drawing / Floor Plan",
  },
  { type: "drawing" as const },
  { type: "paragraph" as const },
] as const;

// ── ArcSite Sample Drawing preset ─────────────────────────────────────────────
// Mirrors the structure of "ArcSite Sample Drawing_Blank Template.pdf":
//   Page 1 – company header + intro blurb
//   Page 2 – cover sheet (client info, evaluated on/by)
//   Page 3 – detail plan drawing + product list
const PRESET_SIMPLE_EXAMPLE = [
  // ── Page 1: Company header ────────────────────────────────────────────────
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
          {
            type: "companyField" as const,
            props: { fieldType: "name" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Name" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "website" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Website" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "email" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Email" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "phone" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Phone" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "address" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Address" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "cityStateZip" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company City/St/Zip" } }],
          },
        ],
      },
    ],
  },
  // Intro lines referencing customer placeholders
  {
    type: "paragraph" as const,
    content: [
      "The customer name is ",
      { type: "placeholderInput" as const, props: { label: "Customer Name" } },
      " and the project address is ",
      { type: "placeholderInput" as const, props: { label: "Project Address" } },
      ".",
    ],
  },
  {
    type: "paragraph" as const,
    content: [
      "Estimated  total budget: ",
      { type: "placeholderInput" as const, props: { label: "$0.00" } },
    ],
  },
  {
    type: "paragraph" as const,
    content: 'Type "#" to insert a placeholder input field anywhere.',
  },

  // ── Page break → cover sheet ──────────────────────────────────────────────
  { type: "pageBreak" as const },

  // ── Page 2: Cover sheet ───────────────────────────────────────────────────
  // Three-column layout to center the logo: empty | logo | empty
  {
    type: "columnList" as const,
    children: [
      {
        type: "column" as const,
        props: { width: 1.0 },
        children: [{ type: "paragraph" as const }],
      },
      {
        type: "column" as const,
        props: { width: 0.8 },
        children: [{ type: "companyLogo" as const }],
      },
      {
        type: "column" as const,
        props: { width: 1.0 },
        children: [{ type: "paragraph" as const }],
      },
    ],
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: "This evaluation was prepared for:",
  },
  {
    type: "heading" as const,
    props: { level: 1, textAlignment: "center" as const },
    content: [{ type: "placeholderInput" as const, props: { label: "Customer Name" } }],
  },
  {
    type: "heading" as const,
    props: { level: 1, textAlignment: "center" as const },
    content: [{ type: "placeholderInput" as const, props: { label: "Project Address" } }],
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: "Evaluated on:",
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: [{ type: "placeholderInput" as const, props: { label: "MM/DD/YYYY" } }],
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: "Evaluated by:",
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: [
      { type: "text" as const, text: "Sales Name", styles: {} },
    ],
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: [
      { type: "placeholderInput" as const, props: { label: "Company Phone" } },
      { type: "text" as const, text: " | ", styles: {} },
      { type: "placeholderInput" as const, props: { label: "Company Email" } },
    ],
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: [
      { type: "text" as const, text: "", styles: { bold: true } },
      { type: "placeholderInput" as const, props: { label: "Company Name" } },
    ],
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: [
      { type: "text" as const, text: "", styles: { bold: true } },
      { type: "placeholderInput" as const, props: { label: "Company Address" } },
    ],
  },
  {
    type: "paragraph" as const,
    props: { textAlignment: "center" as const },
    content: [
      { type: "text" as const, text: "", styles: { bold: true } },
      { type: "placeholderInput" as const, props: { label: "Company City/St/Zip" } },
    ],
  },

  // ── Page 3: Detail plan drawing ───────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 2 },
    content: "Detail Plan",
  },
  { type: "drawing" as const },

  // ── Product list ──────────────────────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 2 },
    content: "Product List",
  },
  { type: "productList" as const },
  { type: "paragraph" as const },
] as const;

// ── Olshan Foundation Repair Agreement preset ─────────────────────────────────
// Faithful reproduction of "Olshan - 38 Harmony Hollow Ct_Modified copy.pdf"
// using BlockNote table blocks for all tabular content.
const PRESET_OLSHAN_AGREEMENT = [
  // ── Company header ────────────────────────────────────────────────────────
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
          {
            type: "companyField" as const,
            props: { fieldType: "address" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Address" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "cityStateZip" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company City/St/Zip" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "phone" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Phone" } }],
          },
          {
            type: "companyField" as const,
            props: { fieldType: "email" },
            content: [{ type: "placeholderInput" as const, props: { label: "Company Email" } }],
          },
        ],
      },
    ],
  },

  // ── Title ─────────────────────────────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 2, textAlignment: "center" as const },
    content: "Agreement / Contract",
  },

  // ── Contract intro ────────────────────────────────────────────────────────
  {
    type: "paragraph" as const,
    content: [
      { type: "placeholderInput" as const, props: { label: "Company Name" } },
      { type: "text" as const, text: ", hereinafter called CONTRACTOR, enters into this agreement on this ", styles: {} },
      { type: "placeholderInput" as const, props: { label: "MM/DD/YYYY" } },
      { type: "text" as const, text: ", with:", styles: {} },
    ],
  },
  {
    type: "heading" as const,
    props: { level: 2, textAlignment: "center" as const },
    content: [{ type: "placeholderInput" as const, props: { label: "Customer Name" } }],
  },
  {
    type: "paragraph" as const,
    content: ", hereinafter called OWNER to provide labor, equipment, and materials for the work described herein upon the structure located at:",
  },
  {
    type: "heading" as const,
    props: { level: 2, textAlignment: "center" as const },
    content: [{ type: "placeholderInput" as const, props: { label: "Project Address" } }],
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "Owner's Contact Number: ", styles: {} },
      { type: "placeholderInput" as const, props: { label: "Company Phone" } },
      { type: "text" as const, text: "     Alternate Number: ", styles: {} },
      { type: "placeholderInput" as const, props: { label: "Company Email" } },
    ],
  },

  // ── Foundation Underpinning ───────────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Foundation Underpinning (Scope of Work)",
  },
  // 4-column table: [Repair Plan Service | Repair Warranty | Modified Service | Modified Warranty]
  {
    type: "table" as const,
    content: {
      type: "tableContent" as const,
      rows: [
        {
          cells: [
            [{ type: "text" as const, text: "REPAIR PLAN: at Total Cost of $10,100.00", styles: { bold: true } }],
            [{ type: "text" as const, text: "Warranty", styles: { bold: true } }],
            [{ type: "text" as const, text: "MODIFIED REPAIR PLAN: at Total Cost of $5,500.00", styles: { bold: true } }],
            [{ type: "text" as const, text: "Warranty", styles: { bold: true } }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "Service or Product", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
            [{ type: "text" as const, text: "Service or Product", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "Hybrid Piling  (19-Exterior and 0-Interior)", styles: {} }],
            [{ type: "text" as const, text: "Lifetime Service", styles: {} }],
            [{ type: "text" as const, text: "Hybrid Piling  (10-Exterior and 0-Interior)", styles: {} }],
            [{ type: "text" as const, text: "Lifetime Service", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "2 Exterior Breakouts  2 Concrete Patches", styles: {} }],
            [{ type: "text" as const, text: "1 Year Limited", styles: {} }],
            [{ type: "text" as const, text: "", styles: {} }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "REPAIR PLAN SPECIAL PROVISIONS:", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
            [{ type: "text" as const, text: "MODIFICATIONS TO REPAIR PLAN SPECIAL PROVISIONS:", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "<> <> <>", styles: {} }],
            [{ type: "text" as const, text: "", styles: {} }],
            [{ type: "text" as const, text: "<> <> <>  Install Exterior Pilings #10-19.", styles: {} }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
      ],
    },
  },
  {
    type: "paragraph" as const,
    content: "Note: Possible Additional Charges (if needed, during initial job):  Tunnel per ft $225 ;  Cut Builder Piers $350 each;  Remove Previous Work / Concrete $125 per Hour;  Steel Support / Angle Iron $40 per piling;  Generator Rental $75 per day",
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "Owner has selected the MODIFIED REPAIR PLAN with a TOTAL COST to the OWNER of:  ", styles: {} },
      { type: "text" as const, text: "$ 5,500.00", styles: { bold: true } },
    ],
  },

  // ── Plumbing Repair ───────────────────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Plumbing Repair (Scope of Work)",
  },
  {
    type: "table" as const,
    content: {
      type: "tableContent" as const,
      rows: [
        {
          cells: [
            [{ type: "text" as const, text: "REPAIR PLAN: at Total Cost of $250.00", styles: { bold: true } }],
            [{ type: "text" as const, text: "Warranty", styles: { bold: true } }],
            [{ type: "text" as const, text: "MODIFIED REPAIR PLAN: N/A", styles: { bold: true } }],
            [{ type: "text" as const, text: "Warranty", styles: { bold: true } }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "Service or Product", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
            [{ type: "text" as const, text: "Service or Product", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "1 (EA) - Post-Leak Detection (Waste Water)", styles: {} }],
            [{ type: "text" as const, text: "No Warranty", styles: {} }],
            [{ type: "text" as const, text: "N/A", styles: {} }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "SPECIAL PROVISIONS:", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
            [{ type: "text" as const, text: "MODIFICATIONS TO SPECIAL PROVISIONS:", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "N/A", styles: {} }],
            [{ type: "text" as const, text: "", styles: {} }],
            [{ type: "text" as const, text: "N/A", styles: {} }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
      ],
    },
  },
  {
    type: "paragraph" as const,
    content: "Note: Possible Additional Charges (if needed, during initial work) >>  Chipping $125 per Hour     Generator Rental $75 per Day     Cleanout Installation $450 Ea.",
  },
  {
    type: "paragraph" as const,
    content: "Owner has selected the MODIFIED Plumbing Repair (Scope of Work) with a TOTAL COST to the OWNER of:  $ -",
  },

  // ── Other Special Provisions ──────────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Other Special Provisions",
  },
  {
    type: "table" as const,
    content: {
      type: "tableContent" as const,
      rows: [
        {
          cells: [
            [{ type: "text" as const, text: "Other Cost Adjustments - brief description>>", styles: {} }],
            [{ type: "text" as const, text: "5% Discount valid through 02/17/2017", styles: {} }],
            [{ type: "text" as const, text: "$ (275.00)", styles: { bold: true } }],
          ],
        },
      ],
    },
  },

  // ── Totals ────────────────────────────────────────────────────────────────
  {
    type: "table" as const,
    content: {
      type: "tableContent" as const,
      rows: [
        {
          cells: [
            [{ type: "text" as const, text: "TOTAL AGREEMENT COST >>", styles: { bold: true } }],
            [{ type: "text" as const, text: "$ 5,225.00", styles: { bold: true } }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "Deposit  (Note: deposits may be refundable up to 2 weeks prior to work beginning)", styles: {} }],
            [{ type: "text" as const, text: "$ -", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "Net Amount Due from Customer per payment terms below", styles: { bold: true } }],
            [{ type: "text" as const, text: "$ 5,225.00", styles: { bold: true } }],
          ],
        },
      ],
    },
  },

  // ── Payment Terms ─────────────────────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Payment Terms:",
  },
  {
    type: "paragraph" as const,
    content: "Payment for services to be paid  (1/2) $2,612.50  Due before work starts     (1/2) $2,612.50  Due upon completion",
  },
  {
    type: "paragraph" as const,
    content: "Available Cash Discount: Pay entire amount by CHECK and save $104.50     Final payment reduced from $2,612.50 to $2,508.00",
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "<<<Owner Initial acknowledging receipt of a copy of Applicable Warranties & Warranties Terms & Provisions", styles: { italic: true } },
    ],
  },

  // ── Legal text ────────────────────────────────────────────────────────────
  {
    type: "paragraph" as const,
    content: "This agreement is subject to Chapter 27 of the Texas Property Code. The provisions of that chapter may affect your right to recover damages from the performance of this contract. If you have a complaint concerning a construction defect arising from the performance of this contract and that defect has not been corrected through existing warranty service, you must provide notice regarding the defect to the contractor by certified mail, not later than the 60th day before the date you file suit in a court of law. If requested by Contractor, you must provide an opportunity to inspect & cure the defect pursuant to Section 27.004, Texas Property Code.",
  },
  {
    type: "paragraph" as const,
    content: [
      { type: "text" as const, text: "LIMITED WARRANTY: ", styles: { bold: true } },
      { type: "text" as const, text: "UNLESS A LONGER WARRANTY PERIOD IS SPECIFIED, CONTRACTOR WARRANTS THE WORKMANSHIP OF THE INSTALLATION FOR ONE YEAR FROM ITS COMPLETION DATE. DURING THE WARRANTY PERIOD, CONTRACTOR WILL REPAIR AT NO CHARGE TO YOU, ANY DEFECTS DUE TO FAULTY WORKMANSHIP. CONTRACTOR'S WARRANTY EXCLUDES INDIRECT OR CONSEQUENTIAL DAMAGES, DAMAGE CAUSED BY ABUSE, MISUSE, NEGLECT, WORK PERFORMED BY OTHERS, OR IMPROPER CARE/CLEANING. YOU MAY HAVE OTHER RIGHTS UNDER APPLICABLE LAW. MECHANICAL AND ELECTRICAL PARTS ARE COVERED BY AND LIMITED TO MANUFACTURER'S WARRANTY AND ARE NOT WARRANTED BY CONTRACTOR.", styles: {} },
    ],
  },
  {
    type: "paragraph" as const,
    content: "This signed AGREEMENT, the attached TERMS and CONDITIONS, Warranties provided and drawings (Addendum A) collectively shall represent the Contract/Agreement for repairs with the OWNER. To the extent there is a conflict between documents, the AGREEMENT shall control.",
  },
  {
    type: "paragraph" as const,
    content: "This Agreement must be signed, returned to the office and signed by Contractor within 30 days to be binding upon both parties. I have read and initialed confirming my understanding of the terms of this Agreement. By signing below, I agree with and will abide by the terms and conditions set forth in this Agreement, and authorize Contractor to perform the work specified.",
  },

  // ── Signatures ────────────────────────────────────────────────────────────
  {
    type: "heading" as const,
    props: { level: 3 },
    content: "Signatures:",
  },
  {
    type: "table" as const,
    content: {
      type: "tableContent" as const,
      rows: [
        {
          cells: [
            [{ type: "text" as const, text: "Owner(s):", styles: { bold: true } }],
            [{ type: "text" as const, text: "", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "Date: ___________________", styles: {} }],
            [{ type: "text" as const, text: "Date: ___________________", styles: {} }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "Prepared By: DeShazer Shawn", styles: {} }],
            [{ type: "placeholderInput" as const, props: { label: "Customer Name" } }],
          ],
        },
        {
          cells: [
            [{ type: "text" as const, text: "General Manager (Contractor)", styles: {} }],
            [{ type: "text" as const, text: "Date: ___________________", styles: {} }],
          ],
        },
      ],
    },
  },

  { type: "paragraph" as const },
] as const;

// ── Preset registry ───────────────────────────────────────────────────────────
// Add new presets here. The first entry is selected by default.
const CONTENT_PRESETS: { label: string; content: unknown }[] = [
  { label: "Default Template", content: INITIAL_EDITOR_CONTENT },
  { label: "ArcSite Proposal Template", content: PRESET_SIMPLE_EXAMPLE },
  { label: "Olshan Foundation Repair Agreement", content: PRESET_OLSHAN_AGREEMENT },
];

export default function BlockNoteMultiColumn() {
  const editor = useCreateBlockNote({
    schema,
    extensions: [placeholderColorSyncExtension],
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: INITIAL_EDITOR_CONTENT as unknown as any,
  });

  const getSlashMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        [
          ...combineByGroup(
            getDefaultReactSlashMenuItems(editor).filter(
              (item) =>
                ![
                  "Emoji",
                  "Video",
                  "Audio",
                  "File",
                  "Quote",
                  "Code Block",
                  "Toggle List",
                  "Check List",
                ].includes(item.title),
            ),
            getMultiColumnSlashMenuItems(editor),
          ),
          {
            title: "Product List",
            subtext: "Insert a product list table",
            group: "Other",
            onItemClick: () => {
              editor.insertBlocks(
                [{ type: "productList" as const }],
                editor.getTextCursorPosition().block,
                "after",
              );
            },
            aliases: ["products", "table", "invoice"],
            badge: "New",
          },
          {
            title: "Conditional Section",
            subtext: "Show or hide content based on a field value",
            group: "Other",
            onItemClick: () => {
              conditionalInsertBlockRef.current =
                editor.getTextCursorPosition().block;
              setIsConditionalModalOpen(true);
            },
            aliases: ["condition", "if", "show", "hide", "conditional"],
            badge: "New",
          },
          {
            title: "Page Break",
            subtext: "Insert a page break for PDF export",
            group: "Other",
            onItemClick: () => {
              editor.insertBlocks(
                [{ type: "pageBreak" as const }],
                editor.getTextCursorPosition().block,
                "after",
              );
            },
            aliases: ["page", "break", "newpage", "pagebreak"],
            badge: "New",
          },
          {
            title: "Company Info",
            subtext: "Insert company logo and contact details",
            group: "Other",
            onItemClick: () => {
              editor.insertBlocks(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                COMPANY_INFO_INITIAL_BLOCKS as any,
                editor.getTextCursorPosition().block,
                "after",
              );
            },
            aliases: ["company", "logo", "contact", "header"],
            badge: "New",
          },
          {
            title: "Drawing",
            subtext: "Insert a floor plan drawing with legend",
            group: "Other",
            onItemClick: () => {
              editor.insertBlocks(
                [{ type: "drawing" as const }],
                editor.getTextCursorPosition().block,
                "after",
              );
            },
            aliases: ["drawing", "floorplan", "plan", "legend", "arcsite"],
            badge: "New",
          },
        ],
        query,
      );
  }, [editor]);

  // --- Conditional inline insert modal ---
  const [isConditionalInlineModalOpen, setIsConditionalInlineModalOpen] =
    useState(false);

  const handleInsertConditionalInline = useCallback(
    (cfg: {
      conditionField: string;
      conditionOperator: string;
      conditionValue: string;
    }) => {
      setIsConditionalInlineModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tiptap = (editor as any)._tiptapEditor;

      // Step 1: insert the (empty) node via BlockNote — this reliably places it
      editor.insertInlineContent([
        {
          type: "conditionalInline" as const,
          props: cfg,
        },
      ]);

      // Step 2: in the next tick the node is in the doc; find the nearest empty
      // conditionalInline and fill it with the default text
      setTimeout(() => {
        const { state } = tiptap;
        const { from } = state.selection;
        let filled = false;
        state.doc.nodesBetween(
          Math.max(0, from - 5),
          Math.min(state.doc.content.size, from + 5),
          (
            node: { type: { name: string }; content: { size: number } },
            pos: number,
          ) => {
            if (
              !filled &&
              node.type.name === "conditionalInline" &&
              node.content.size === 0
            ) {
              tiptap.view.dispatch(
                state.tr.insertText("Conditional Text", pos + 1),
              );
              filled = true;
              return false;
            }
          },
        );
      }, 0);
    },
    [editor],
  );

  const getPlaceholderMenuItems = useMemo(() => {
    const items = [
      { title: "Customer Name", label: "Customer Name" },
      { title: "Project Address", label: "Project Address" },
      { title: "Date", label: "MM/DD/YYYY" },
      { title: "Amount", label: "$0.00" },
      { title: "Phone", label: "(xxx) xxx-xxxx" },
      { title: "Email", label: "email@example.com" },
      { title: "Custom Field", label: "Enter value" },
    ];

    return async (query: string) =>
      filterSuggestionItems(
        [
          ...items.map((item) => ({
            title: item.title,
            onItemClick: () => {
              editor.insertInlineContent([
                {
                  type: "placeholderInput" as const,
                  props: { label: item.label },
                },
                " ",
              ]);
            },
            aliases: [item.label.toLowerCase()],
          })),
          {
            title: "Conditional Text",
            subtext: "Show text only when a condition is met",
            onItemClick: () => {
              setIsConditionalInlineModalOpen(true);
            },
            aliases: ["if", "condition", "conditional", "when"],
            badge: "New",
          },
        ],
        query,
      );
  }, [editor]);

  // --- Conditional section insert modal ---
  const [isConditionalModalOpen, setIsConditionalModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditionalInsertBlockRef = useRef<any>(null);

  const handleInsertConditionalSection = useCallback(
    (config: ConditionalSectionConfig) => {
      setIsConditionalModalOpen(false);
      const targetBlock =
        conditionalInsertBlockRef.current ??
        editor.getTextCursorPosition().block;
      editor.insertBlocks(
        [
          {
            type: "conditionalSection" as const,
            props: config,
            children: [{ type: "paragraph" as const }],
          },
        ],
        targetBlock,
        "after",
      );
    },
    [editor],
  );

  // --- Preview state (auto-populate with default data on mount) ---
  const [previewData, setPreviewData] = useState<ExportFormData | null>(
    DEFAULT_PREVIEW_DATA,
  );
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const previewUrlRef = useRef<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);

  // --- Export state ---
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buildFullHtml = useCallback(async () => {
    const blocks = editor.document;
    const rawHtml = await editor.blocksToHTMLLossy(blocks);
    // Preserve empty paragraphs: blocksToHTMLLossy outputs <p></p> with no
    // content, so browsers and WeasyPrint collapse them. Adding a <br>
    // gives each empty paragraph the height of one line — matching the editor.
    const withEmptyParas = rawHtml.replace(/<p><\/p>/g, "<p><br></p>");
    // Stamp data-conditional-wrapper on the correct ancestor so the server
    // can remove the entire section (header + children) in one query.
    const markedHtml = markConditionalSections(withEmptyParas);
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>${PDF_STYLES}</style>
</head>
<body>
${markedHtml}
</body>
</html>`;
  }, [editor]);

  // Preview uses the live ProseMirror DOM so all BN class names are preserved
  // and blocknoteCoreCSS applies exactly as in the editor — no manual CSS patches needed.
  // PDF export continues to use buildFullHtml (blocksToHTMLLossy → WeasyPrint).
  const buildPreviewHtml = useCallback(
    (currentData: ExportFormData): string => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tiptap = (editor as any)._tiptapEditor;
      const innerHtml = (tiptap.view.dom as HTMLElement).innerHTML;

      let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>${PDF_STYLES}</style>
<style>
  .bn-editor { outline: none !important; }
</style>
</head>
<body>
<div class="bn-root"><div class="bn-default-styles"><div class="bn-editor">${innerHtml}</div></div></div>
</body>
</html>`;

      html = processInlineConditionalsFromEditorDom(html, currentData);
      html = replacePlaceholderInputs(html, currentData);
      html = processConditionalSectionsFromEditorDom(html, currentData);
      html = replaceProductListBlocks(html, currentData);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      html = html.replace(
        "</head>",
        `<style>${PREVIEW_EXTRA_STYLES}</style><script src="${origin}/static/pagedjs/paged.polyfill.js"></script></head>`,
      );
      return html;
    },
    [editor],
  );

  const previewDataRef = useRef(previewData);
  previewDataRef.current = previewData;

  const updatePreview = useCallback(() => {
    const currentData = previewDataRef.current;
    if (!currentData) return;
    setIsPreviewLoading(true);
    try {
      const html = buildPreviewHtml(currentData);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } catch (error) {
      console.error("Preview update failed:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [buildPreviewHtml]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  // Debounced preview: re-run when editor content or preview data changes
  useEffect(() => {
    if (!previewData) return;
    const timer = setTimeout(updatePreview, 400);
    return () => clearTimeout(timer);
  }, [previewData, editorVersion, updatePreview]);

  const [isDataEditorOpen, setIsDataEditorOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const handlePresetChange = useCallback(
    (index: number) => {
      setSelectedPresetIndex(index);
      const blocks = editor.document;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.replaceBlocks(blocks, CONTENT_PRESETS[index].content as any);
    },
    [editor],
  );

  const handleUpdatePreviewData = useCallback((data: ExportFormData) => {
    setPreviewData(data);
    setIsDataEditorOpen(false);
  }, []);

  const handleEditorChange = useCallback(() => {
    setEditorVersion((v) => v + 1);
  }, []);

  // --- Export ---
  const handleExportWithData = useCallback(
    async (data: ExportFormData) => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        const fullHtml = await buildFullHtml();
        let processedHtml = processInlineConditionals(fullHtml, data);
        processedHtml = replacePlaceholderInputs(processedHtml, data);
        const pdfServerUrl =
          process.env.NEXT_PUBLIC_PDF_SERVER_URL ?? "http://localhost:5001";
        const response = await fetch(`${pdfServerUrl}/api/html-to-pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: processedHtml, formData: data }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "blocknote-export.pdf";
        a.click();
        URL.revokeObjectURL(url);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Export failed:", error);
        alert(
          "Export failed. Make sure the Python server is running on port 5001.",
        );
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting, buildFullHtml],
  );

  // --- Export via Playwright ---
  const [isExportingPw, setIsExportingPw] = useState(false);
  const handleExportPlaywright = useCallback(async () => {
    if (isExportingPw) return;
    setIsExportingPw(true);
    try {
      const fullHtml = await buildFullHtml();
      const data = previewDataRef.current;
      let processedHtml = processInlineConditionals(fullHtml, data);
      processedHtml = replacePlaceholderInputs(processedHtml, data);
      const pdfServerUrl =
        process.env.NEXT_PUBLIC_PDF_SERVER_URL ?? "http://localhost:5001";
      const response = await fetch(`${pdfServerUrl}/api/html-to-pdf-playwright`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: processedHtml, formData: data }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blocknote-export-pw.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Playwright export failed:", error);
      alert("Playwright export failed. Make sure the server is running on port 5001.");
    } finally {
      setIsExportingPw(false);
    }
  }, [isExportingPw, buildFullHtml]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
        <select
          value={selectedPresetIndex}
          onChange={(e) => handlePresetChange(Number(e.target.value))}
          style={{
            padding: "7px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: "#333",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          {CONTENT_PRESETS.map((preset, i) => (
            <option key={i} value={i}>
              {preset.label}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setIsDataEditorOpen(true)}
            style={{
              padding: "8px 20px",
              backgroundColor: "#fff",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Edit Preview Data
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: "8px 20px",
              backgroundColor: "#228be6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Export to PDF
          </button>
          <button
            onClick={handleExportPlaywright}
            disabled={isExportingPw}
            style={{
              padding: "8px 20px",
              backgroundColor: isExportingPw ? "#999" : "#40c057",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: isExportingPw ? "not-allowed" : "pointer",
            }}
          >
            {isExportingPw ? "Exporting..." : "Export PDF by Playwright"}
          </button>
        </div>
      </div>

      {/* Split content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left panel – Editor */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
            borderRight: "1px solid #ddd",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              borderRadius: 4,
              minHeight: "calc(100vh - 80px)",
            }}
          >
            <BlockNoteView
              editor={editor}
              theme="light"
              slashMenu={false}
              onChange={handleEditorChange}
            >
              <SuggestionMenuController
                triggerCharacter="/"
                getItems={getSlashMenuItems}
              />
              <SuggestionMenuController
                triggerCharacter="#"
                getItems={getPlaceholderMenuItems}
              />
            </BlockNoteView>
          </div>
        </div>

        {/* Right panel – Live Preview */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            backgroundColor: "#e8e8e8",
            position: "relative",
          }}
        >
          {!previewData ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#999",
                gap: 12,
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#bbb"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <span style={{ fontSize: 14 }}>
                Click &quot;Present Default Data&quot; to see live preview
              </span>
            </div>
          ) : (
            <>
              {isPreviewLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "4px 12px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    borderRadius: 4,
                    fontSize: 12,
                    zIndex: 10,
                  }}
                >
                  Updating...
                </div>
              )}
              <iframe
                src={previewUrl || undefined}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  backgroundColor: "transparent",
                }}
                title="PDF Preview"
              />
            </>
          )}
        </div>
      </div>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={handleExportWithData}
        isExporting={isExporting}
        initialData={previewData}
      />
      <ExportModal
        isOpen={isDataEditorOpen}
        onClose={() => setIsDataEditorOpen(false)}
        onExport={handleUpdatePreviewData}
        isExporting={false}
        initialData={previewData}
        submitLabel="Apply to Preview"
      />
      <ConditionalSectionModal
        isOpen={isConditionalModalOpen}
        onClose={() => setIsConditionalModalOpen(false)}
        onInsert={handleInsertConditionalSection}
      />
      <ConditionalInlineModal
        isOpen={isConditionalInlineModalOpen}
        onClose={() => setIsConditionalInlineModalOpen(false)}
        onConfirm={handleInsertConditionalInline}
      />
    </div>
  );
}
