"use client";

import { BlockNoteSchema, combineByGroup } from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import * as locales from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@mantine/core/styles.css";
import { BlockNoteView } from "@blocknote/mantine";
import type { Theme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
  useBlockNoteEditor,
  useComponentsContext,
  useCreateBlockNote,
  useSelectedBlocks,
} from "@blocknote/react";
import {
  getMultiColumnSlashMenuItems,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ── Reuse custom blocks from the tech spike ────────────────────────────────────
import { createProductListUI } from "./ProductListBlockUI";
import { createConditionalSection } from "../blocknote-multi-column/ConditionalSectionBlock";
import { createPageBreak } from "../blocknote-multi-column/PageBreakBlock";
import {
  createCompanyLogo,
  createCompanyField,
  COMPANY_INFO_INITIAL_BLOCKS,
} from "../blocknote-multi-column/CompanyInfoBlock";
import { createDrawing } from "../blocknote-multi-column/DrawingBlock";
import {
  createLandscapingTerms,
  LANDSCAPING_TERMS_BLOCK,
} from "../blocknote-multi-column/LandscapingTermsBlock";
import { PlaceholderInput } from "../blocknote-multi-column/PlaceholderInput";
import { ConditionalInline } from "../blocknote-multi-column/ConditionalInlineContent";
import { Mention, MENTION_USERS } from "../blocknote-multi-column/Mention";
import { ExportModal, type ExportFormData } from "../blocknote-multi-column/ExportModal";
import {
  ConditionalSectionModal,
  type ConditionalSectionConfig,
} from "../blocknote-multi-column/ConditionalSectionModal";
import { ConditionalInlineModal } from "../blocknote-multi-column/ConditionalInlineModal";
import "../blocknote-multi-column/product-list.css";
import "../blocknote-multi-column/conditional-section.css";
import "../blocknote-multi-column/page-break.css";
import blocknoteCoreCSS from "../blocknote-multi-column/bn-core-css.generated";

// ── HTML processing helpers (adapted from tech spike) ──────────────────────────

function getFieldValue(formData: ExportFormData, field: string): string {
  switch (field) {
    case "customerName": return formData.customerName ?? "";
    case "projectAddress": return formData.projectAddress ?? "";
    case "completionDate": return formData.completionDate ?? "";
    case "totalBudget": return formData.totalBudget ?? "";
    default: return "";
  }
}

function evaluateCondition(fieldValue: string, operator: string, conditionValue: string): boolean {
  if (!conditionValue) return true;
  const a = fieldValue.toLowerCase();
  const b = conditionValue.toLowerCase();
  switch (operator) {
    case "eq": return a === b;
    case "neq": return a !== b;
    case "contains": return a.includes(b);
    case "notContains": return !a.includes(b);
    default: return true;
  }
}

const PLACEHOLDER_FIELD_MAP: Record<string, keyof ExportFormData> = {
  "Customer Name": "customerName",
  "Project Address": "projectAddress",
  "MM/DD/YYYY": "completionDate",
  "$0.00": "totalBudget",
  "Company Name": "companyName",
  "Company Website": "companyWebsite",
  "Company Email": "companyEmail",
  "Company Phone": "companyPhone",
  "Company Address": "companyAddress",
  "Company City/St/Zip": "companyCityStateZip",
};

function replacePlaceholderInputs(html: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll<HTMLElement>('[data-inline-content-type="placeholderInput"]').forEach((el) => {
    const label = el.dataset.label ?? el.textContent?.trim() ?? "";
    const fieldKey = PLACEHOLDER_FIELD_MAP[label];
    const value = fieldKey ? (formData[fieldKey] as string) || "\u2014" : "\u2014";
    el.replaceWith(document.createTextNode(value));
  });
  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function processInlineConditionalsFromEditorDom(html: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll<HTMLElement>('[data-inline-content-type="conditionalInline"]').forEach((el) => {
    const field = el.dataset.conditionField ?? "customerName";
    const operator = el.dataset.conditionOperator ?? "eq";
    const value = el.dataset.conditionValue ?? "";
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[contenteditable="false"]').forEach((n) => n.remove());
    const text = clone.textContent ?? "";
    if (evaluateCondition(getFieldValue(formData, field), operator, value)) {
      el.replaceWith(document.createTextNode(text));
    } else {
      el.remove();
    }
  });
  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function processConditionalSectionsFromEditorDom(html: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll<HTMLElement>(".conditional-section-block").forEach((el) => {
    const field = el.dataset.conditionField ?? "";
    const operator = el.dataset.conditionOperator ?? "eq";
    const compare = el.dataset.conditionValue ?? "";
    if (!compare.trim()) return;
    if (!evaluateCondition(getFieldValue(formData, field), operator, compare)) {
      el.closest(".bn-block-outer")?.remove();
    }
  });
  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function buildProductListHtml(
  products: { name: string; quantity: string; amount: string }[],
  summary?: { subtotal: string; discount: string; salesTaxRate: string; salesTax: string; total: string },
): string {
  const rows = products
    .map((p) =>
      `<div class="product-list-row"><div class="product-list-desc"><div class="product-list-name">${p.name}</div></div><div class="product-list-qty">${p.quantity}</div><div class="product-list-amt">${p.amount}</div></div>`
    ).join("");
  let summaryRows = "";
  if (summary && (summary.subtotal || summary.discount || summary.salesTax || summary.total)) {
    if (summary.subtotal) summaryRows += `<div class="product-list-summary-row"><span>Subtotal</span><span>${summary.subtotal}</span></div>`;
    if (summary.discount) summaryRows += `<div class="product-list-summary-row"><span>Discount</span><span>${summary.discount}</span></div>`;
    if (summary.salesTax) {
      const ratePrefix = summary.salesTaxRate ? `(${summary.salesTaxRate}) ` : "";
      summaryRows += `<div class="product-list-summary-row"><span>Sales Tax</span><span>${ratePrefix}${summary.salesTax}</span></div>`;
    }
    if (summary.total) summaryRows += `<div class="product-list-summary-row product-list-total"><span>Total</span><span>${summary.total}</span></div>`;
  } else {
    const total = products.reduce((sum, p) => {
      const cleaned = p.amount.replace(/[^0-9.\-]/g, "");
      return sum + (parseFloat(cleaned) || 0);
    }, 0);
    summaryRows = `<div class="product-list-summary-row product-list-total"><span>Total</span><span>$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>`;
  }
  return `<div class="product-list-block"><div class="product-list-title">Product List</div><div class="product-list-table"><div class="product-list-header"><div class="product-list-desc">Description</div><div class="product-list-qty">Quantity</div><div class="product-list-amt">Amount</div></div>${rows}<div class="product-list-summary">${summaryRows}</div></div></div>`;
}

function replaceProductListBlocks(html: string, formData: ExportFormData): string {
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

function markConditionalSections(htmlContent: string): string {
  if (typeof document === "undefined") return htmlContent;
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.querySelectorAll<HTMLElement>(".conditional-section-block").forEach((header) => {
    const field = header.dataset.conditionField ?? "";
    const operator = header.dataset.conditionOperator ?? "eq";
    const value = header.dataset.conditionValue ?? "";
    const toWrap: HTMLElement[] = [header];
    let sibling = header.nextElementSibling as HTMLElement | null;
    while (sibling && sibling.hasAttribute("data-nesting-level")) {
      toWrap.push(sibling);
      sibling = sibling.nextElementSibling as HTMLElement | null;
    }
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

function processInlineConditionals(fullHtml: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return fullHtml;
  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, "text/html");
  doc.querySelectorAll<HTMLElement>('[data-inline-content-type="conditionalInline"]').forEach((el) => {
    const field = el.dataset.conditionField ?? "customerName";
    const operator = el.dataset.conditionOperator ?? "eq";
    const value = el.dataset.conditionValue ?? "";
    const editableSpan = el.querySelector<HTMLElement>("[data-editable]");
    const text = editableSpan?.textContent ?? "";
    const conditionMet = evaluateCondition(getFieldValue(formData, field), operator, value);
    if (conditionMet) {
      el.replaceWith(document.createTextNode(text));
    } else {
      el.remove();
    }
  });
  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

// ── PDF styles ─────────────────────────────────────────────────────────────────

const PDF_STYLES = `
  ${blocknoteCoreCSS}
  @page {
    size: A4;
    margin: 24mm 20mm;
    @top-left { content: element(proposalHeader); vertical-align: bottom; padding-bottom: 4mm; width: 170mm; }
    @bottom-left { content: element(proposalFooter); vertical-align: top; padding-top: 4mm; width: 170mm; }
  }
  body { font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; color: #3f3f3f; line-height: 1.6; }
  .proposal-page-header { position: running(proposalHeader); width: 170mm; max-width: 170mm; box-sizing: border-box; border-bottom: 1px solid #d9dde3; padding-bottom: 3mm; font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #2f3640; }
  .proposal-page-header-inner { display: table; table-layout: fixed; width: 100%; }
  .proposal-page-header-brand { display: table-cell; width: 50%; font-size: 11px; font-weight: 700; line-height: 1.2; white-space: nowrap; vertical-align: bottom; }
  .proposal-page-header-meta { display: table-cell; width: 50%; font-size: 9px; color: #6b7280; line-height: 1.2; text-align: right; white-space: nowrap; vertical-align: bottom; }
  .proposal-page-footer { position: running(proposalFooter); width: 170mm; max-width: 170mm; box-sizing: border-box; border-top: 1px solid #d9dde3; padding-top: 3mm; font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #6b7280; }
  .proposal-page-footer-inner { display: table; table-layout: fixed; width: 100%; }
  .proposal-page-footer-note { display: table-cell; width: 50%; font-size: 9px; line-height: 1.2; white-space: nowrap; vertical-align: top; }
  .proposal-page-footer-meta { display: table-cell; width: 50%; font-size: 9px; line-height: 1.2; text-align: right; white-space: nowrap; vertical-align: top; }
  .proposal-page-footer-page-number::after { content: "Page " counter(page) " of " counter(pages); }
  h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; }
  h2 { font-size: 20px; font-weight: 700; margin: 14px 0 6px; }
  h3 { font-size: 16px; font-weight: 600; margin: 12px 0 4px; }
  p { margin: 6px 0; }
  p:empty { min-height: 1.6em; }
  ul, ol { margin: 4px 0; padding-left: 24px; }
  li { margin: 2px 0; }
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
  [data-inline-content-type="placeholderInput"] { display: inline; }
  [data-inline-content-type="conditionalInline"] { display: inline; }
  .conditional-section-block { border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
  .conditional-section-header { display: none !important; }
  [data-page-break="true"] { display: block; height: 0; overflow: hidden; visibility: hidden; break-after: page; page-break-after: always; }
  .bn-block-column-list { table-layout: fixed; }
  .bn-block-column { vertical-align: top; }
`;

const PAGE_HEADER_HTML = `<div class="proposal-page-header"><div class="proposal-page-header-inner"><div class="proposal-page-header-brand">Apex Construction LLC</div><div class="proposal-page-header-meta">Proposal | 742 Evergreen Terrace</div></div></div>`;
const PAGE_FOOTER_HTML = `<div class="proposal-page-footer"><div class="proposal-page-footer-inner"><div class="proposal-page-footer-note">Apex Construction LLC</div><div class="proposal-page-footer-meta"><span class="proposal-page-footer-page-number"></span></div></div></div>`;

const INACTIVE_SECTION_STYLES = [
  "[data-section-active='false'] .bn-editor,",
  "[data-section-active='false'] .ProseMirror,",
  "[data-section-active='false'] .bn-block-group {",
  "  background: transparent !important;",
  "}",
].join("\n");

const PREVIEW_EXTRA_STYLES = `
  body { background: transparent; margin: 0; padding: 64px 0 16px; }
  .pagedjs_pages { display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .pagedjs_page { box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; background: white !important; }
  .bn-editor { padding-inline: 0 !important; }
  :root { --preview-zoom: 1; }
  .pagedjs_pages { zoom: var(--preview-zoom); }
  /* Strip all BlockNote editor-UI chrome (selection outlines, focus borders, drag handles) */
  [data-node-type] { outline: none !important; box-shadow: none !important; }
  .ProseMirror-selectednode { outline: none !important; box-shadow: none !important; }
  .bn-block-outer::before, .bn-block-outer::after { display: none !important; }
  [data-node-type="blockContainer"] { border: none !important; }
`;

// ── Default preview data ───────────────────────────────────────────────────────

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
    { name: "6ft Cedar Privacy Fence", quantity: "320 ft", amount: "$25,600.00" },
    { name: "Aluminum Gate (Double Swing)", quantity: "2", amount: "$4,200.00" },
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

// ── Schema ─────────────────────────────────────────────────────────────────────

const schema = withMultiColumn(
  BlockNoteSchema.create().extend({
    blockSpecs: {
      productList: createProductListUI(),
      conditionalSection: createConditionalSection(),
      pageBreak: createPageBreak(),
      companyLogo: createCompanyLogo(),
      companyField: createCompanyField(),
      drawing: createDrawing(),
      landscapingTerms: createLandscapingTerms(),
    },
    inlineContentSpecs: {
      placeholderInput: PlaceholderInput,
      conditionalInline: ConditionalInline,
      mention: Mention,
    },
  }),
);

// ── Initial content (ArcSite Proposal Template) ────────────────────────────────

const INITIAL_EDITOR_CONTENT = [
  {
    type: "columnList" as const,
    children: [
      { type: "column" as const, props: { width: 0.6 }, children: [{ type: "companyLogo" as const }] },
      {
        type: "column" as const,
        props: { width: 1.0 },
        children: [
          { type: "companyField" as const, props: { fieldType: "name" }, content: [{ type: "placeholderInput" as const, props: { label: "Company Name" } }] },
          { type: "companyField" as const, props: { fieldType: "website" }, content: [{ type: "placeholderInput" as const, props: { label: "Company Website" } }] },
          { type: "companyField" as const, props: { fieldType: "email" }, content: [{ type: "placeholderInput" as const, props: { label: "Company Email" } }] },
          { type: "companyField" as const, props: { fieldType: "phone" }, content: [{ type: "placeholderInput" as const, props: { label: "Company Phone" } }] },
          { type: "companyField" as const, props: { fieldType: "address" }, content: [{ type: "placeholderInput" as const, props: { label: "Company Address" } }] },
          { type: "companyField" as const, props: { fieldType: "cityStateZip" }, content: [{ type: "placeholderInput" as const, props: { label: "Company City/St/Zip" } }] },
        ],
      },
    ],
  },
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
      "Estimated total budget: ",
      { type: "placeholderInput" as const, props: { label: "$0.00" } },
    ],
  },
  { type: "pageBreak" as const },
  {
    type: "columnList" as const,
    children: [
      { type: "column" as const, props: { width: 1.0 }, children: [{ type: "paragraph" as const }] },
      { type: "column" as const, props: { width: 0.8 }, children: [{ type: "companyLogo" as const }] },
      { type: "column" as const, props: { width: 1.0 }, children: [{ type: "paragraph" as const }] },
    ],
  },
  { type: "paragraph" as const, props: { textAlignment: "center" as const }, content: "This evaluation was prepared for:" },
  { type: "heading" as const, props: { level: 1, textAlignment: "center" as const }, content: [{ type: "placeholderInput" as const, props: { label: "Customer Name" } }] },
  { type: "heading" as const, props: { level: 1, textAlignment: "center" as const }, content: [{ type: "placeholderInput" as const, props: { label: "Project Address" } }] },
  { type: "paragraph" as const, props: { textAlignment: "center" as const }, content: "Evaluated on:" },
  { type: "paragraph" as const, props: { textAlignment: "center" as const }, content: [{ type: "placeholderInput" as const, props: { label: "MM/DD/YYYY" } }] },
  { type: "heading" as const, props: { level: 2 }, content: "Detail Plan" },
  { type: "drawing" as const },
  { type: "productList" as const },
  {
    type: "conditionalSection" as const,
    props: { conditionField: "customerName", conditionOperator: "neq", conditionValue: "" },
    children: [
      { type: "paragraph" as const, content: "Dear Customer, here are some texts. Here are some texts. Here are some texts. Here are some texts." },
    ],
  },
  { type: "paragraph" as const },
] as const;

// ── Preset registry ────────────────────────────────────────────────────────────

const CONTENT_PRESETS: { label: string; content: unknown }[] = [
  { label: "Default", content: INITIAL_EDITOR_CONTENT },
  { label: "Landscaping Terms & Conditions", content: [LANDSCAPING_TERMS_BLOCK] },
];

// ── Theme ──────────────────────────────────────────────────────────────────────

const customTheme: Theme = {
  colors: {
    editor: { text: "#1F1F1F", background: "#ffffff" },
    menu: { text: "#1F1F1F", background: "#ffffff" },
    tooltip: { text: "#1F1F1F", background: "#F2F2F2" },
    hovered: { text: "#1F1F1F", background: "#F2F2F2" },
    selected: { text: "#ffffff", background: "#1F1F1F" },
    disabled: { text: "#9B9B9B", background: "#F2F2F2" },
    shadow: "#CFCFCF",
    border: "#E6E6E6",
    sideMenu: "#CFCFCF",
  },
  borderRadius: 4,
  fontFamily:
    '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Open Sans", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

// ── Block Background Color Button ──────────────────────────────────────────────

const BLOCK_BACKGROUND_COLORS = [
  { label: "Default", value: "default", swatch: "#fff" },
  { label: "Gray", value: "gray", swatch: "#e9ecef" },
  { label: "Red", value: "red", swatch: "#ffe3e3" },
  { label: "Orange", value: "orange", swatch: "#ffe8cc" },
  { label: "Yellow", value: "yellow", swatch: "#fff3bf" },
  { label: "Green", value: "green", swatch: "#d3f9d8" },
  { label: "Blue", value: "blue", swatch: "#d0ebff" },
  { label: "Purple", value: "purple", swatch: "#e5dbff" },
  { label: "Pink", value: "pink", swatch: "#ffdeeb" },
] as const;

function BlockBackgroundColorButton() {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const selectedBlocks = useSelectedBlocks();
  const blocks = selectedBlocks.length > 0 ? selectedBlocks : [editor.getTextCursorPosition().block];
  const supportedBlocks = blocks.filter((block) => Object.prototype.hasOwnProperty.call(block.props, "backgroundColor"));
  const activeColor = supportedBlocks.length > 0 ? supportedBlocks[0].props.backgroundColor ?? "default" : "default";
  if (supportedBlocks.length === 0) return null;
  return (
    <Components.Generic.Menu.Root position="bottom-start">
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button mainTooltip="Block background color" isSelected={activeColor !== "default"}>
          Block BG
        </Components.FormattingToolbar.Button>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown">
        {BLOCK_BACKGROUND_COLORS.map((color) => (
          <Components.Generic.Menu.Item
            key={color.value}
            checked={activeColor === color.value}
            icon={<span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, border: "1px solid rgba(0,0,0,0.24)", backgroundColor: color.swatch }} />}
            onClick={() => { supportedBlocks.forEach((block) => { editor.updateBlock(block, { props: { backgroundColor: color.value } }); }); }}
          >
            {color.label}
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
}

// ── SVG Icons for the UI ───────────────────────────────────────────────────────

function PageSetupIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InfoTooltip() {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ color: "white", opacity: 0.6, position: "relative", display: "inline-flex", alignItems: "center", cursor: "default" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <InfoIcon />
      {visible && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(30,30,30,0.92)",
            color: "white",
            fontFamily: "Roboto, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.5,
            padding: "8px 12px",
            borderRadius: 6,
            whiteSpace: "normal",
            width: 260,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 200,
            pointerEvents: "none",
          }}
        >
          This quick preview may look different from the final PDF rendering. To get an accurate PDF rendering, choose "View PDF".
        </div>
      )}
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" />
      <text x="4" y="12" fontSize="5" fontWeight="700" fill="currentColor" fontFamily="sans-serif">PDF</text>
    </svg>
  );
}

function CollapsePreviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3L10 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="2" x2="13" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExpandPreviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="2" x2="3" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SectionMoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5.5" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="10.5" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

function MergeUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 13V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MergeDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3v10M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4h10M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M12 4v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Zoom Bar component ────────────────────────────────────────────────────────

function ZoomBar({
  zoom,
  onZoomIn,
  onZoomOut,
  onSetAuto,
  onSet100,
}: {
  zoom: 'auto' | number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetAuto: () => void;
  onSet100: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const label = zoom === 'auto' ? 'Auto-Size' : `${Math.round((zoom as number) * 100)}%`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        height: 32,
        padding: "6px 12px",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "0.5px solid rgba(255,255,255,0.25)",
        borderRadius: 9999,
        zIndex: 30,
        whiteSpace: "nowrap",
      }}
    >
      {/* Minus */}
      <button
        onClick={onZoomOut}
        style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center", width: 20 }}
      >
        <svg width="13" height="2" viewBox="0 0 13 2" fill="none"><rect width="13" height="1.5" rx="0.75" fill="white" /></svg>
      </button>

      {/* Label + dropdown */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontFamily: "Roboto, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            padding: "0 4px",
            minWidth: 80,
            textAlign: "center",
          }}
        >
          {label}
        </button>
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(30,30,30,0.95)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              border: "0.5px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: 4,
              minWidth: 160,
              zIndex: 100,
            }}
          >
            {[
              { label: "Auto-Size", onClick: () => { onSetAuto(); setDropdownOpen(false); } },
              { label: "100%", onClick: () => { onSet100(); setDropdownOpen(false); } },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontFamily: "Roboto, sans-serif",
                  fontSize: 13,
                  textAlign: "left",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Plus */}
      <button
        onClick={onZoomIn}
        style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center", width: 20 }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="0" y="5.75" width="13" height="1.5" rx="0.75" fill="white" />
          <rect x="5.75" y="0" width="1.5" height="13" rx="0.75" fill="white" />
        </svg>
      </button>
    </div>
  );
}

// ── Title Bar component (Figma: node I545:9153;8:1525) ────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="12" height="24" viewBox="0 0 12 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6L4 12L9 18" stroke="rgba(0,0,0,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function TitleBar({
  onEditPreviewData,
  onExportToPdf,
  onExportPlaywright,
  onExportJson,
}: {
  onEditPreviewData: () => void;
  onExportToPdf: () => void;
  onExportPlaywright: () => void;
  onExportJson: () => void;
}) {
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const devMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!devMenuOpen) return;
    const handle = (e: MouseEvent) => {
      if (devMenuRef.current && !devMenuRef.current.contains(e.target as Node)) {
        setDevMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [devMenuOpen]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 52,
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        backgroundColor: "rgba(255,255,255,0.65)",
      }}
    >
      {/* Back button */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 32,
          height: 32,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ChevronLeftIcon />
      </div>

      {/* Title + edit icon + Draft tag */}
      <div
        style={{
          position: "absolute",
          left: 52,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Roboto, sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(0,0,0,0.85)",
            lineHeight: "22px",
            whiteSpace: "nowrap",
          }}
        >
          Proposal with Cover Page
        </span>
        <EditIcon />
        {/* Draft tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "3px 8px",
            backgroundColor: "#ebf4ff",
            border: "1px solid #80bfff",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "Roboto, sans-serif",
              fontSize: 12,
              fontWeight: 400,
              color: "#398ae7",
              lineHeight: "16px",
              whiteSpace: "nowrap",
            }}
          >
            Draft
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        {/* Page Setup button */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 32,
            padding: "6px 12px",
            backgroundColor: "white",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: "Roboto, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "rgba(0,0,0,0.85)",
            lineHeight: "18px",
            whiteSpace: "nowrap",
          }}
        >
          Page Setup
        </button>
        {/* Publish to APP button */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 32,
            padding: "6px 12px",
            backgroundColor: "#398ae7",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: "Roboto, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "white",
            lineHeight: "18px",
            whiteSpace: "nowrap",
          }}
        >
          Publish to APP
        </button>
        {/* Dev Menu button */}
        <div ref={devMenuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDevMenuOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 32,
              padding: "6px 12px",
              backgroundColor: "white",
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "Roboto, sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: "rgba(0,0,0,0.85)",
              lineHeight: "18px",
              whiteSpace: "nowrap",
              gap: 6,
            }}
          >
            Dev Menu
            <ChevronDownIcon />
          </button>
          {devMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: 220,
                backgroundColor: "white",
                border: "1px solid #e6e6e6",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                padding: 4,
                zIndex: 200,
              }}
            >
              {([
                { label: "Edit Preview Data", action: onEditPreviewData },
                { label: "Export to PDF", action: onExportToPdf },
                { label: "Export PDF by Playwright", action: onExportPlaywright },
                { label: "Export JSON", action: onExportJson },
              ] as { label: string; action: () => void }[]).map(({ label, action }) => (
                <button
                  key={label}
                  onClick={() => { setDevMenuOpen(false); action(); }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "8px 12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Roboto, sans-serif",
                    fontSize: 13,
                    fontWeight: 400,
                    color: "rgba(0,0,0,0.85)",
                    textAlign: "left",
                    borderRadius: 4,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Collapsed-Preview floating button (Figma node 773:10919) ───────────────
// Shown when the preview panel is collapsed — 40x40 dark pill anchored to
// the right edge of the page, sitting just below the title bar.
function CollapsedPreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Quick Preview"
      style={{
        position: "absolute",
        top: 68, // 52 (title bar) + 16 spacing
        right: 0,
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "0.5px solid rgba(255,255,255,0.25)",
        borderTopLeftRadius: 9999,
        borderBottomLeftRadius: 9999,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        color: "white",
        cursor: "pointer",
        zIndex: 40,
      }}
    >
      <EyeIcon />
    </button>
  );
}

// ── Section Header pill ───────────────────────────────────────────────────────

function SectionHeader({
  label,
  isFirst,
  isLast,
  isFloating,
  isActive,
  onMergeUp,
  onMergeDown,
  onDelete,
}: {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  /** True when the sticky header is stuck to the top (content above has scrolled away) */
  isFloating: boolean;
  /** True when this section is the currently active (focused) section */
  isActive: boolean;
  onMergeUp: () => void;
  onMergeDown: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const showBg = isFloating || isHovered;
  // When floating (sticky) and the section is not active, hide the pill entirely
  const hidePill = isFloating && !isActive;

  const menuItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "8px 12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "Roboto, sans-serif",
    fontSize: 13,
    fontWeight: 400,
    color: "rgba(0,0,0,0.85)",
    whiteSpace: "nowrap",
    borderRadius: 4,
  };

  const disabledStyle: React.CSSProperties = {
    ...menuItemStyle,
    color: "rgba(0,0,0,0.25)",
    cursor: "not-allowed",
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 52, // stick below the 52px absolute title bar
        zIndex: 10,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: isFirst ? 8 : 32,
      }}
    >
      {/* Pill — hidden when floating over an inactive section */}
      <div
        ref={menuRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "8px 16px",
          borderRadius: 9999,
          backgroundColor: showBg ? "rgba(0,0,0,0.1)" : "transparent",
          backdropFilter: showBg ? "blur(22px)" : "none",
          WebkitBackdropFilter: showBg ? "blur(22px)" : "none",
          transition: "background-color 0.15s",
          position: "relative",
          visibility: hidePill ? "hidden" : "visible",
          pointerEvents: hidePill ? "none" : "auto",
          cursor: "pointer",
        }}
      >
        <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.85)" }}>
          {label}
        </span>
        <div>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              borderRadius: 4,
              color: "rgba(0,0,0,0.55)",
            }}
          >
            <SectionMoreIcon />
          </button>
        </div>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: "calc(100% + 4px)",
              minWidth: 180,
              backgroundColor: "white",
              border: "1px solid #e6e6e6",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              padding: 4,
              zIndex: 100,
            }}
          >
              <button
                style={menuItemStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f2f2f2"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                onClick={() => { setMenuOpen(false); }}
              >
                <PageSetupIcon />
                Section Settings
              </button>
              <button
                style={isFirst ? disabledStyle : menuItemStyle}
                disabled={isFirst}
                onMouseEnter={(e) => { if (!isFirst) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f2f2f2"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                onClick={() => { if (!isFirst) { setMenuOpen(false); onMergeUp(); } }}
              >
                <MergeUpIcon />
                Merge Up
              </button>
              <button
                style={isLast ? disabledStyle : menuItemStyle}
                disabled={isLast}
                onMouseEnter={(e) => { if (!isLast) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f2f2f2"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                onClick={() => { if (!isLast) { setMenuOpen(false); onMergeDown(); } }}
              >
                <MergeDownIcon />
                Merge Down
              </button>
              <div style={{ height: 1, backgroundColor: "#e6e6e6", margin: "4px 0" }} />
              <button
                style={{ ...menuItemStyle, color: "#e53e3e" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff5f5"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                onClick={() => { setMenuOpen(false); onDelete(); }}
              >
                <TrashIcon />
                Delete Section
              </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Delete Section Dialog ─────────────────────────────────────────────────────

function DeleteSectionDialog({
  sectionTitle,
  isFirst,
  isLast,
  onMergeUp,
  onMergeDown,
  onDeleteContent,
  onCancel,
}: {
  sectionTitle: string;
  isFirst: boolean;
  isLast: boolean;
  onMergeUp: () => void;
  onMergeDown: () => void;
  onDeleteContent: () => void;
  onCancel: () => void;
}) {
  const dialogBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    padding: "10px 16px",
    borderRadius: 6,
    border: "1px solid #d9d9d9",
    backgroundColor: "white",
    cursor: "pointer",
    fontFamily: "Roboto, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(0,0,0,0.85)",
  };

  const disabledBtnStyle: React.CSSProperties = {
    ...dialogBtnStyle,
    color: "rgba(0,0,0,0.25)",
    borderColor: "#e6e6e6",
    cursor: "not-allowed",
    backgroundColor: "#fafafa",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: 400,
          backgroundColor: "white",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 8px", fontFamily: "Roboto, sans-serif", fontSize: 16, fontWeight: 600, color: "rgba(0,0,0,0.85)" }}>
          Delete &ldquo;{sectionTitle}&rdquo;
        </h3>
        <p style={{ margin: "0 0 20px", fontFamily: "Roboto, sans-serif", fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
          What would you like to do with this section&apos;s content?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            style={isFirst ? disabledBtnStyle : dialogBtnStyle}
            disabled={isFirst}
            onClick={onMergeUp}
          >
            <MergeUpIcon /> Merge Content Up
          </button>
          <button
            style={isLast ? disabledBtnStyle : dialogBtnStyle}
            disabled={isLast}
            onClick={onMergeDown}
          >
            <MergeDownIcon /> Merge Content Down
          </button>
          <button
            style={{ ...dialogBtnStyle, color: "#e53e3e", borderColor: "#feb2b2" }}
            onClick={onDeleteContent}
          >
            <TrashIcon /> Delete Content
          </button>
          <button
            style={dialogBtnStyle}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Section Button ────────────────────────────────────────────────────────

function AddSectionButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 24px" }}>
      <button
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 20px",
          backgroundColor: "white",
          border: "1px dashed rgba(0,0,0,0.25)",
          borderRadius: 9999,
          cursor: "pointer",
          fontFamily: "Roboto, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(0,0,0,0.55)",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#398ae7";
          (e.currentTarget as HTMLButtonElement).style.color = "#398ae7";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.25)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,0,0,0.55)";
        }}
      >
        <PlusIcon />
        New Section
      </button>
    </div>
  );
}

// ── SectionEditor (standalone component with its own editor hook) ─────────────

function SectionEditor({
  sectionId,
  initialContent,
  isLast,
  onEditorReady,
  onEditorChange,
  onActiveBlockChange,
  onCreateSectionBelow,
}: {
  sectionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent: any;
  isLast: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditorReady: (sectionId: string, editor: any) => void;
  onEditorChange: () => void;
  onActiveBlockChange: (blockId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreateSectionBelow: (afterSectionId: string, initialBlocks: any[]) => void;
}) {
  const editor = useCreateBlockNote({
    schema,
    tables: { splitCells: true, cellBackgroundColor: true, cellTextColor: true, headers: true },
    extensions: [],
    dropCursor: multiColumnDropCursor,
    dictionary: { ...locales.en, multi_column: multiColumnLocales.en },
    initialContent,
  });

  // Expose editor to parent on mount
  useEffect(() => {
    onEditorReady(sectionId, editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, sectionId]);

  // Report the current active block (by id) on click / keyboard / focus events in the editor DOM.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dom = (editor as any)?._tiptapEditor?.view?.dom as HTMLElement | undefined;
    if (!dom) return;
    const notify = () => {
      try {
        const block = editor.getTextCursorPosition()?.block;
        if (block?.id) onActiveBlockChange(block.id);
      } catch {
        // ignore
      }
    };
    dom.addEventListener("click", notify);
    dom.addEventListener("keyup", notify);
    dom.addEventListener("focusin", notify);
    return () => {
      dom.removeEventListener("click", notify);
      dom.removeEventListener("keyup", notify);
      dom.removeEventListener("focusin", notify);
    };
  }, [editor, onActiveBlockChange]);

  // ── Conditional section modal state ──────────────────────────────────────
  const [isConditionalModalOpen, setIsConditionalModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditionalInsertBlockRef = useRef<any>(null);

  // ── Conditional inline modal state ───────────────────────────────────────
  const [isConditionalInlineModalOpen, setIsConditionalInlineModalOpen] = useState(false);

  // ── Slash menu items ─────────────────────────────────────────────────────
  const getSlashMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        [
          ...combineByGroup(
            getDefaultReactSlashMenuItems(editor).filter(
              (item) => !["Emoji", "Video", "Audio", "File", "Quote", "Code Block", "Toggle List", "Check List"].includes(item.title),
            ),
            getMultiColumnSlashMenuItems(editor),
          ),
          {
            title: "Product List", subtext: "Insert a product list table", group: "Other",
            onItemClick: () => { editor.insertBlocks([{ type: "productList" as const }], editor.getTextCursorPosition().block, "after"); },
            aliases: ["products", "table", "invoice"], badge: "New",
          },
          {
            title: "Conditional Section", subtext: "Show or hide content based on a field value", group: "Other",
            onItemClick: () => { conditionalInsertBlockRef.current = editor.getTextCursorPosition().block; setIsConditionalModalOpen(true); },
            aliases: ["condition", "if", "show", "hide", "conditional"], badge: "New",
          },
          {
            title: "Page Break", subtext: "Insert a page break for PDF export", group: "Other",
            onItemClick: () => { editor.insertBlocks([{ type: "pageBreak" as const }], editor.getTextCursorPosition().block, "after"); },
            aliases: ["page", "break", "newpage", "pagebreak"], badge: "New",
          },
          {
            title: "Company Info", subtext: "Insert company logo and contact details", group: "Other",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onItemClick: () => { editor.insertBlocks(COMPANY_INFO_INITIAL_BLOCKS as any, editor.getTextCursorPosition().block, "after"); },
            aliases: ["company", "logo", "contact", "header"], badge: "New",
          },
          {
            title: "Drawing", subtext: "Insert a floor plan drawing with legend", group: "Other",
            onItemClick: () => { editor.insertBlocks([{ type: "drawing" as const }], editor.getTextCursorPosition().block, "after"); },
            aliases: ["drawing", "floorplan", "plan", "legend", "arcsite"], badge: "New",
          },
          {
            title: "New Section",
            subtext: "Split this section — move content below this block into a new section",
            group: "Other",
            onItemClick: () => {
              // Find the current (active) block and collect all blocks after it
              const activeBlock = editor.getTextCursorPosition().block;
              const allBlocks = editor.document;
              const idx = allBlocks.findIndex((b) => b.id === activeBlock.id);
              // Blocks strictly AFTER the active block — they move to the new section
              const blocksToMove =
                idx >= 0 ? allBlocks.slice(idx + 1) : [];
              // Remove them from the current editor so the section splits cleanly
              if (blocksToMove.length > 0) {
                editor.removeBlocks(blocksToMove.map((b) => b.id));
              }
              // Ask parent to create a new section seeded with the moved blocks
              onCreateSectionBelow(sectionId, blocksToMove);
            },
            aliases: ["section", "newsection", "new section", "split", "divide"],
            badge: "New",
          },
        ],
        query,
      );
  }, [editor, sectionId, onCreateSectionBelow]);

  // ── Placeholder/hash menu items ──────────────────────────────────────────
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
            onItemClick: () => { editor.insertInlineContent([{ type: "placeholderInput" as const, props: { label: item.label } }, " "]); },
            aliases: [item.label.toLowerCase()],
          })),
          {
            title: "Conditional Text", subtext: "Show text only when a condition is met",
            onItemClick: () => { setIsConditionalInlineModalOpen(true); },
            aliases: ["if", "condition", "conditional", "when"], badge: "New",
          },
        ],
        query,
      );
  }, [editor]);

  // ── Mention menu items ───────────────────────────────────────────────────
  const getMentionMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        MENTION_USERS.map((user) => ({
          title: user,
          onItemClick: () => { editor.insertInlineContent([{ type: "mention" as const, props: { user } }, " "]); },
        })),
        query,
      );
  }, [editor]);

  // ── Conditional section insert ───────────────────────────────────────────
  const handleInsertConditionalSection = useCallback(
    (config: ConditionalSectionConfig) => {
      setIsConditionalModalOpen(false);
      const targetBlock = conditionalInsertBlockRef.current ?? editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "conditionalSection" as const, props: config, children: [{ type: "paragraph" as const }] }], targetBlock, "after");
    },
    [editor],
  );

  // ── Conditional inline insert ────────────────────────────────────────────
  const handleInsertConditionalInline = useCallback(
    (cfg: { conditionField: string; conditionOperator: string; conditionValue: string }) => {
      setIsConditionalInlineModalOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tiptap = (editor as any)._tiptapEditor;
      editor.insertInlineContent([{ type: "conditionalInline" as const, props: cfg }]);
      setTimeout(() => {
        const { state } = tiptap;
        const { from } = state.selection;
        let filled = false;
        state.doc.nodesBetween(
          Math.max(0, from - 5),
          Math.min(state.doc.content.size, from + 5),
          (node: { type: { name: string }; content: { size: number } }, pos: number) => {
            if (!filled && node.type.name === "conditionalInline" && node.content.size === 0) {
              tiptap.view.dispatch(state.tr.insertText("Conditional Text", pos + 1));
              filled = true;
              return false;
            }
          },
        );
      }, 0);
    },
    [editor],
  );

  // Click handler for the bottom "free" editing area of the LAST section:
  // if the last block has content, append a new empty paragraph and focus it;
  // otherwise just focus the existing empty last block.
  const handleClickBottomSpace = useCallback(() => {
    try {
      const allBlocks = editor.document;
      if (allBlocks.length === 0) {
        editor.focus();
        return;
      }
      const last = allBlocks[allBlocks.length - 1];
      const isEmptyParagraph =
        last.type === "paragraph" &&
        Array.isArray(last.content) &&
        last.content.length === 0;
      if (isEmptyParagraph) {
        editor.setTextCursorPosition(last, "end");
      } else {
        const [inserted] = editor.insertBlocks(
          [{ type: "paragraph" as const }],
          last,
          "after",
        );
        if (inserted) editor.setTextCursorPosition(inserted, "end");
      }
      editor.focus();
    } catch {
      // ignore
    }
  }, [editor]);

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <BlockNoteView
          editor={editor}
          theme={customTheme}
          sideMenu={true}
          tableHandles={true}
          slashMenu={false}
          formattingToolbar={false}
          onChange={onEditorChange}
        >
          <FormattingToolbarController
            formattingToolbar={(props) => (
              <FormattingToolbar {...props}>
                {getFormattingToolbarItems(props.blockTypeSelectItems)}
                <BlockBackgroundColorButton key="blockBackgroundColorButton" />
              </FormattingToolbar>
            )}
          />
          <SuggestionMenuController triggerCharacter="/" getItems={getSlashMenuItems} />
          <SuggestionMenuController triggerCharacter="#" getItems={getPlaceholderMenuItems} />
          <SuggestionMenuController triggerCharacter="@" getItems={getMentionMenuItems} />
        </BlockNoteView>
        {/* Last section only: 600px extra "free" editing area below the content.
            Clicking this empty space focuses the editor at the end so the user can
            keep typing without having to hunt for the end of the content. */}
        {isLast && (
          <div
            onMouseDown={(e) => {
              // Prevent default so clicking doesn't steal focus before we set cursor
              e.preventDefault();
              handleClickBottomSpace();
            }}
            style={{ minHeight: 600, cursor: "text" }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Per-editor modals */}
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
    </>
  );
}

// ── Preview Toolbar ────────────────────────────────────────────────────────────

function PreviewToolbar({
  selectedPresetIndex,
  onPresetChange,
  onViewPdf,
  isCollapsed,
  onToggleCollapse,
}: {
  selectedPresetIndex: number;
  onPresetChange: (index: number) => void;
  onViewPdf: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarWidth, setToolbarWidth] = useState(600);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setToolbarWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isNarrow = toolbarWidth < 440;

  const btnStyle: React.CSSProperties = {
    display: "flex",
    gap: 2,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    backgroundColor: "rgba(0,0,0,0.5)",
    border: "0.5px solid rgba(255,255,255,0.25)",
    borderRadius: 4,
    color: "white",
    fontFamily: "Roboto, sans-serif",
    fontSize: 14,
    fontWeight: 400,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  };

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "8px 12px",
        zIndex: 20,
      }}
    >
      {/* Blur background — absolute so content behind scrolls underneath */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          backgroundColor: "rgba(115,115,115,0.65)",
        }}
      />

      {/* Quick Preview label */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative", flexShrink: 0 }}>
        <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, fontWeight: 600, color: "white" }}>
          Quick Preview
        </span>
        <InfoTooltip />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, position: "relative" }} />

      {/* Preset dropdown — fills available space, max 200px */}
      <div style={{ position: "relative", flex: 1, maxWidth: 200, minWidth: 0 }}>
        <select
          value={selectedPresetIndex}
          onChange={(e) => onPresetChange(Number(e.target.value))}
          style={{
            ...btnStyle,
            appearance: "none",
            WebkitAppearance: "none",
            paddingRight: 28,
            background: "rgba(0,0,0,0.5)",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {CONTENT_PRESETS.map((preset, i) => (
            <option key={i} value={i} style={{ color: "#000" }}>
              {preset.label}
            </option>
          ))}
        </select>
        <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "white" }}>
          <ChevronDownIcon />
        </div>
      </div>

      {/* View PDF button — icon-only when toolbar is narrow */}
      <button
        style={{
          ...btnStyle,
          position: "relative",
          padding: isNarrow ? "6px 8px" : "6px 12px",
          flexShrink: 0,
        }}
        onClick={onViewPdf}
        title="View PDF"
      >
        <PdfIcon />
        {!isNarrow && <span>View PDF</span>}
      </button>

      {/* Fold/Expand preview toggle */}
      <button
        onClick={onToggleCollapse}
        style={{
          ...btnStyle,
          width: 32,
          height: 32,
          padding: 0,
          position: "relative",
          flexShrink: 0,
        }}
      >
        {isCollapsed ? <ExpandPreviewIcon /> : <CollapsePreviewIcon />}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Section state model ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

interface Section {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialContent: any;
}

let nextSectionId = 1;
function makeSectionId(): string {
  return `section-${nextSectionId++}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Main Component ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function BlockNoteMultiColumnUI() {
  // ── Section state ───────────────────────────────────────────────────────
  const [sections, setSections] = useState<Section[]>(() => [
    {
      id: makeSectionId(),
      title: "Section 1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialContent: INITIAL_EDITOR_CONTENT as unknown as any,
    },
  ]);

  // Track active section for opacity
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id ?? "");

  // Editor refs map: sectionId -> editor instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorsRef = useRef<Map<string, any>>(new Map());

  const handleEditorReady = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sectionId: string, editor: any) => {
      editorsRef.current.set(sectionId, editor);
    },
    [],
  );

  // Clean up stale editor refs when sections change
  useEffect(() => {
    const currentIds = new Set(sections.map((s) => s.id));
    for (const key of editorsRef.current.keys()) {
      if (!currentIds.has(key)) {
        editorsRef.current.delete(key);
      }
    }
  }, [sections]);

  // ── Delete section dialog state ─────────────────────────────────────────
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  // ── Helper: get blocks from an editor as JSON ───────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getEditorBlocks = useCallback((sectionId: string): any[] => {
    const editor = editorsRef.current.get(sectionId);
    if (!editor) return [];
    return editor.document;
  }, []);

  // ── Helper: append blocks to end of an editor ──────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appendBlocksToEditor = useCallback((targetSectionId: string, blocks: any[]) => {
    const editor = editorsRef.current.get(targetSectionId);
    if (!editor || blocks.length === 0) return;
    const existingBlocks = editor.document;
    const lastBlock = existingBlocks[existingBlocks.length - 1];
    editor.insertBlocks(blocks, lastBlock, "after");
  }, []);

  // ── Helper: prepend blocks to start of an editor ───────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prependBlocksToEditor = useCallback((targetSectionId: string, blocks: any[]) => {
    const editor = editorsRef.current.get(targetSectionId);
    if (!editor || blocks.length === 0) return;
    const existingBlocks = editor.document;
    const firstBlock = existingBlocks[0];
    editor.insertBlocks(blocks, firstBlock, "before");
  }, []);

  // ── Section operations ──────────────────────────────────────────────────

  const addSection = useCallback(() => {
    setSections((prev) => [
      ...prev,
      {
        id: makeSectionId(),
        title: `Section ${prev.length + 1}`,
        initialContent: [{ type: "paragraph" }],
      },
    ]);
  }, []);

  // Create a new section directly below `afterSectionId`, seeded with the provided
  // initial blocks (moved content from the triggering section). Empty arrays are
  // replaced with a single empty paragraph.
  const createSectionBelow = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (afterSectionId: string, initialBlocks: any[]) => {
      setSections((prev) => {
        const idx = prev.findIndex((s) => s.id === afterSectionId);
        if (idx < 0) return prev;
        const newSection: Section = {
          id: makeSectionId(),
          title: `Section ${prev.length + 1}`,
          initialContent:
            initialBlocks.length > 0 ? initialBlocks : [{ type: "paragraph" }],
        };
        return [...prev.slice(0, idx + 1), newSection, ...prev.slice(idx + 1)];
      });
    },
    [],
  );

  const mergeUp = useCallback(
    (sectionId: string) => {
      const idx = sections.findIndex((s) => s.id === sectionId);
      if (idx <= 0) return;
      const prevSection = sections[idx - 1];
      const blocks = getEditorBlocks(sectionId);
      appendBlocksToEditor(prevSection.id, blocks);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [sections, getEditorBlocks, appendBlocksToEditor],
  );

  const mergeDown = useCallback(
    (sectionId: string) => {
      const idx = sections.findIndex((s) => s.id === sectionId);
      if (idx < 0 || idx >= sections.length - 1) return;
      const nextSection = sections[idx + 1];
      const blocks = getEditorBlocks(sectionId);
      prependBlocksToEditor(nextSection.id, blocks);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [sections, getEditorBlocks, prependBlocksToEditor],
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [],
  );

  // ── Preview state ──────────────────────────────────────────────────────

  const [previewData, setPreviewData] = useState<ExportFormData | null>(DEFAULT_PREVIEW_DATA);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const previewUrlRef = useRef<string>("");
  const [editorVersion, setEditorVersion] = useState(0);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  // ── Preview iframe + scroll refs ────────────────────────────────────────
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);

  // ── Section floating (sticky) detection ────────────────────────────────
  // Track scrollTop of the edit panel; compare against each section container's offsetTop
  const [editScrollTop, setEditScrollTop] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ── Zoom state ──────────────────────────────────────────────────────────
  const [previewZoom, setPreviewZoom] = useState<'auto' | number>('auto');
  const [containerWidth, setContainerWidth] = useState(434);
  // Keep a ref that always holds the latest containerWidth so zoom handlers
  // don't depend on stale closure values (avoids "auto → 10%" snap bug).
  const containerWidthRef = useRef(434);
  containerWidthRef.current = containerWidth;
  const previewContentRef = useRef<HTMLDivElement>(null);

  const A4_PAGE_RENDER_WIDTH = 858;
  const getEffectiveScale = () => {
    if (previewZoom === 'auto') return Math.min(containerWidth / A4_PAGE_RENDER_WIDTH, 1);
    return previewZoom as number;
  };

  // Track preview container width
  useEffect(() => {
    const el = previewContentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Update zoom on already-loaded iframe when zoom/containerWidth changes
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe?.contentDocument) return;
    const scale = getEffectiveScale();
    try {
      iframe.contentDocument.documentElement.style.setProperty('--preview-zoom', String(scale));
    } catch { /* cross-origin */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewZoom, containerWidth]);

  const handleEditorChange = useCallback(() => { setEditorVersion((v) => v + 1); }, []);

  // ── Track edit-panel scroll position for sticky-header floating detection only (no preview sync) ──
  const handleEditPanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setEditScrollTop(e.currentTarget.scrollTop);
  }, []);

  // ── "Center active block" behavior ──────────────────────────────────────
  // Debounce so we don't scroll on every keystroke.
  // Preview toolbar occupies ~48px at the top of the preview panel.
  const TOOLBAR_OVERLAP = 48;
  const activeBlockScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleActiveBlockChange = useCallback((blockId: string) => {
    if (activeBlockScrollTimeoutRef.current) clearTimeout(activeBlockScrollTimeoutRef.current);
    activeBlockScrollTimeoutRef.current = setTimeout(() => {
      const iframe = previewIframeRef.current;
      if (!iframe?.contentDocument || !iframe?.contentWindow) return;
      try {
        // BlockNote renders blocks with data-id="<blockId>" attributes which are preserved
        // through innerHTML capture in buildPreviewHtml. Paged.js keeps them on paginated
        // copies — prefer those (inside .pagedjs_pages) over the hidden source.
        let el = iframe.contentDocument.querySelector<HTMLElement>(
          `.pagedjs_pages [data-id="${blockId}"]`,
        );
        if (!el) {
          el = iframe.contentDocument.querySelector<HTMLElement>(`[data-id="${blockId}"]`);
        }
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Ignore if block has no rendered height (e.g. empty page-break block)
        if (rect.height === 0 && rect.top === 0) return;
        // Absolute Y position within the iframe's scrollable document:
        //   rect.top is viewport-relative; add scrollY to get document-relative.
        const iframeScrollY = iframe.contentWindow.scrollY;
        const elAbsTop = rect.top + iframeScrollY;
        const iframeClientHeight = iframe.contentDocument.documentElement.clientHeight;
        // Center the block in the visible area (below the 56px toolbar overlap):
        //   visibleCenter = (iframeClientHeight + TOOLBAR_OVERLAP) / 2
        const visibleCenter = (iframeClientHeight + TOOLBAR_OVERLAP) / 2;
        const targetScrollTop = elAbsTop + rect.height / 2 - visibleCenter;
        iframe.contentWindow.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
      } catch {
        // cross-origin
      }
    }, 120);
  }, []);

  // Clear the debounce timer on unmount
  useEffect(() => {
    return () => {
      if (activeBlockScrollTimeoutRef.current) clearTimeout(activeBlockScrollTimeoutRef.current);
    };
  }, []);

  // ── Zoom handlers ───────────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    setPreviewZoom((z) => {
      // Use the ref so we always read the live container width, not a stale closure value
      const current = z === 'auto' ? Math.min(containerWidthRef.current / A4_PAGE_RENDER_WIDTH, 1) : z as number;
      // Snap to the next 10% boundary above current value
      const next = Math.ceil((current + 0.001) / 0.1) * 0.1;
      return Math.min(parseFloat(next.toFixed(2)), 3);
    });
  // containerWidthRef is a ref — no dep needed; A4_PAGE_RENDER_WIDTH is constant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZoomOut = useCallback(() => {
    setPreviewZoom((z) => {
      // Use the ref so we always read the live container width, not a stale closure value
      const current = z === 'auto' ? Math.min(containerWidthRef.current / A4_PAGE_RENDER_WIDTH, 1) : z as number;
      // Snap to the next 10% boundary below current value
      const next = Math.floor((current - 0.001) / 0.1) * 0.1;
      return Math.max(parseFloat(next.toFixed(2)), 0.1);
    });
  // containerWidthRef is a ref — no dep needed; A4_PAGE_RENDER_WIDTH is constant
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── iframe load handler ─────────────────────────────────────────────────
  const handlePreviewIframeLoad = useCallback(() => {
    const iframe = previewIframeRef.current;
    if (!iframe?.contentDocument) return;
    const scale = getEffectiveScale();
    try {
      const applyZoom = () => {
        if (!iframe.contentDocument) return;
        iframe.contentDocument.documentElement.style.setProperty('--preview-zoom', String(scale));
      };
      applyZoom();
      setTimeout(applyZoom, 500);
      setTimeout(applyZoom, 1500);
    } catch { /* cross-origin */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewZoom, containerWidth]);

  const buildPreviewHtml = useCallback(
    (currentData: ExportFormData): string => {
      // Collect innerHTML from all section editors in order
      const sectionHtmlParts: string[] = [];
      for (const section of sections) {
        const editor = editorsRef.current.get(section.id);
        if (!editor) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tiptap = (editor as any)._tiptapEditor;
        const innerHtml = (tiptap.view.dom as HTMLElement).innerHTML;
        sectionHtmlParts.push(innerHtml);
      }

      // Wrap each section in a div; sections after the first get a class that forces a new page
      const combinedInnerHtml = sectionHtmlParts
        .map((html, i) =>
          i === 0
            ? `<div class="section-content" data-section-index="${i}">${html}</div>`
            : `<div class="section-content section-page-break" data-section-index="${i}">${html}</div>`
        )
        .join("");

      let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${PDF_STYLES}</style><style>.bn-editor { outline: none !important; } .section-page-break { break-before: page; page-break-before: always; }</style></head><body>${PAGE_HEADER_HTML}${PAGE_FOOTER_HTML}<div class="bn-root"><div class="bn-default-styles"><div class="bn-editor">${combinedInnerHtml}</div></div></div></body></html>`;
      html = processInlineConditionalsFromEditorDom(html, currentData);
      html = replacePlaceholderInputs(html, currentData);
      html = processConditionalSectionsFromEditorDom(html, currentData);
      html = replaceProductListBlocks(html, currentData);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      html = html.replace("</head>", `<style>${PREVIEW_EXTRA_STYLES}</style><script src="${origin}/static/pagedjs/paged.polyfill.js"></script></head>`);
      return html;
    },
    [sections],
  );

  const previewDataRef = useRef(previewData);
  previewDataRef.current = previewData;

  const updatePreview = useCallback(() => {
    const currentData = previewDataRef.current;
    if (!currentData) return;
    try {
      const html = buildPreviewHtml(currentData);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } catch (error) {
      console.error("Preview update failed:", error);
    }
  }, [buildPreviewHtml]);

  useEffect(() => {
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); };
  }, []);

  useEffect(() => {
    if (!previewData) return;
    const timer = setTimeout(updatePreview, 400);
    return () => clearTimeout(timer);
  }, [previewData, editorVersion, updatePreview]);

  const handlePresetChange = useCallback(
    (index: number) => {
      setSelectedPresetIndex(index);
      // Reset to a single section with preset content
      setSections([
        {
          id: makeSectionId(),
          title: "Section 1",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialContent: CONTENT_PRESETS[index].content as any,
        },
      ]);
      // Bump editor version to trigger preview update after new editors mount
      setTimeout(() => setEditorVersion((v) => v + 1), 100);
    },
    [],
  );

  // ── Export state ───────────────────────────────────────────────────────

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const buildFullHtml = useCallback(async () => {
    // Collect HTML from all section editors
    const sectionHtmlParts: string[] = [];
    for (const section of sections) {
      const editor = editorsRef.current.get(section.id);
      if (!editor) continue;
      const blocks = editor.document;
      const rawHtml = await editor.blocksToHTMLLossy(blocks);
      const withEmptyParas = rawHtml.replace(/<p><\/p>/g, "<p><br></p>");
      const markedHtml = markConditionalSections(withEmptyParas);
      sectionHtmlParts.push(markedHtml);
    }
    const combinedHtml = sectionHtmlParts
      .map((html, i) =>
        i === 0
          ? `<div class="section-content">${html}</div>`
          : `<div class="section-content section-page-break">${html}</div>`
      )
      .join("");
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${PDF_STYLES} .section-page-break { break-before: page; page-break-before: always; }</style></head><body>${PAGE_HEADER_HTML}${PAGE_FOOTER_HTML}${combinedHtml}</body></html>`;
  }, [sections]);

  const handleExportWithData = useCallback(
    async (data: ExportFormData) => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        const fullHtml = await buildFullHtml();
        let processedHtml = processInlineConditionals(fullHtml, data);
        processedHtml = replacePlaceholderInputs(processedHtml, data);
        const pdfServerUrl = process.env.NEXT_PUBLIC_PDF_SERVER_URL ?? "http://localhost:5001";
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
        alert("Export failed. Make sure the Python server is running on port 5001.");
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting, buildFullHtml],
  );

  // ── Data editor ────────────────────────────────────────────────────────

  const [isDataEditorOpen, setIsDataEditorOpen] = useState(false);
  const handleUpdatePreviewData = useCallback((data: ExportFormData) => {
    setPreviewData(data);
    setIsDataEditorOpen(false);
  }, []);

  // ── Playwright export ───────────────────────────────────────────────────

  const [isExportingPw, setIsExportingPw] = useState(false);
  const handleExportPlaywright = useCallback(async () => {
    if (isExportingPw) return;
    setIsExportingPw(true);
    try {
      const fullHtml = await buildFullHtml();
      const data = previewDataRef.current;
      if (!data) throw new Error("Preview data not available");
      let processedHtml = processInlineConditionals(fullHtml, data);
      processedHtml = replacePlaceholderInputs(processedHtml, data);
      const pdfServerUrl = process.env.NEXT_PUBLIC_PDF_SERVER_URL ?? "http://localhost:5001";
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
      a.download = "proposal-pw.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Playwright export failed:", error);
      alert("Playwright export failed. Make sure the server is running on port 5001.");
    } finally {
      setIsExportingPw(false);
    }
  }, [isExportingPw, buildFullHtml, previewDataRef]);

  // ── JSON export ─────────────────────────────────────────────────────────

  const handleExportJson = useCallback(() => {
    const allContent = sections.map((s) => ({
      id: s.id,
      title: s.title,
      blocks: editorsRef.current.get(s.id)?.document ?? [],
    }));
    const json = JSON.stringify(allContent, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "proposal-content.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sections]);

  // ── Determine delete dialog context ─────────────────────────────────────
  const deletingSection = deletingSectionId ? sections.find((s) => s.id === deletingSectionId) : null;
  const deletingSectionIdx = deletingSectionId ? sections.findIndex((s) => s.id === deletingSectionId) : -1;

  // ═══════════════════════════════════════════════════════════════════════════
  // ── Render ─────────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  // Hide the section pill entirely when there's only one section
  const showSectionHeaders = sections.length > 1;

  // Compute which section headers are "floating" (stuck to top while content scrolled past)
  // A header is floating when the edit panel has scrolled past the section container's natural top
  const computeIsFloating = (sectionId: string) => {
    const el = sectionContainerRefs.current.get(sectionId);
    if (!el) return false;
    return editScrollTop > el.offsetTop;
  };

  return (
    <div style={{ position: "relative", height: "100vh", fontFamily: "Roboto, sans-serif", overflow: "hidden" }}>
      {/* Override BlockNote white background inside inactive sections */}
      <style dangerouslySetInnerHTML={{ __html: INACTIVE_SECTION_STYLES }} />

      {/* ── Main content area fills the whole viewport; TitleBar floats above ─ */}
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

        {/* ── Edit Panel (left) ──────────────────────────────────────────── */}
        <div
          ref={editPanelRef}
          onScroll={handleEditPanelScroll}
          style={{
            flex: 1,
            minWidth: 790,
            overflow: "auto",
            backgroundColor: "#ffffff",
          }}
        >
          {/* 52px top offset so first content starts below title bar; scrolls under it for blur */}
          <div style={{ paddingTop: 52 }}>
            {sections.map((section, idx) => (
              <div key={section.id}>
                {/* Separator — own container so it is never affected by the section's opacity */}
                {idx > 0 && (
                  <div style={{ height: 16, backgroundColor: "#e6e6e6", flexShrink: 0 }} />
                )}
                {/* Full-width card — fill changes with active state */}
                <div
                  ref={(el) => {
                    if (el) sectionContainerRefs.current.set(section.id, el);
                    else sectionContainerRefs.current.delete(section.id);
                  }}
                  onClick={() => setActiveSectionId(section.id)}
                  data-section-active={activeSectionId === section.id ? "true" : "false"}
                  style={{
                    backgroundColor: activeSectionId === section.id ? "white" : "#f0f0f0",
                    opacity: activeSectionId === section.id ? 1 : 0.6,
                    transition: "opacity 0.2s ease, background-color 0.2s ease",
                  }}
                >
                  {/* Constrained content area — centered, max 1080px */}
                  <div
                    style={{
                      maxWidth: 1080,
                      minWidth: 768,
                      width: "100%",
                      margin: "0 auto",
                      padding: "0 56px 56px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {showSectionHeaders && (
                      <SectionHeader
                        label={section.title}
                        isFirst={idx === 0}
                        isLast={idx === sections.length - 1}
                        isFloating={computeIsFloating(section.id)}
                        isActive={activeSectionId === section.id}
                        onMergeUp={() => mergeUp(section.id)}
                        onMergeDown={() => mergeDown(section.id)}
                        onDelete={() => setDeletingSectionId(section.id)}
                      />
                    )}
                    <SectionEditor
                      sectionId={section.id}
                      initialContent={section.initialContent}
                      isLast={idx === sections.length - 1}
                      onEditorReady={handleEditorReady}
                      onEditorChange={handleEditorChange}
                      onActiveBlockChange={handleActiveBlockChange}
                      onCreateSectionBelow={createSectionBelow}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Preview Panel (right) ──────────────────────────────────────── */}
        {!isPreviewCollapsed && (
        // Outer column: 52px spacer on top (solid, matches title bar height) +
        // preview content below — this keeps the preview from extending behind the title bar
        // while the edit panel's content can still scroll under it.
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 400, maxWidth: 1080 }}>
          {/* Title-bar-height spacer — solid background so nothing bleeds through */}
          <div style={{ height: 52, flexShrink: 0, backgroundColor: "rgba(255,255,255,0.65)" }} />
          <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            // Figma: border-l-[0.5px] border-t-[0.5px] border-[rgba(0,0,0,0.15)] rounded-tl-[8px]
            borderTop: "0.5px solid rgba(0,0,0,0.15)",
            borderLeft: "0.5px solid rgba(0,0,0,0.15)",
            borderTopLeftRadius: 8,
            // Clip the toolbar's blur background to the rounded corner
            isolation: "isolate",
          }}
        >
          {/* Preview toolbar */}
          <PreviewToolbar
            selectedPresetIndex={selectedPresetIndex}
            onPresetChange={handlePresetChange}
            onViewPdf={() => { /* placeholder — does not open sample data dialog */ }}
            isCollapsed={isPreviewCollapsed}
            onToggleCollapse={() => setIsPreviewCollapsed((v) => !v)}
          />

          {/* Preview content — iframe fills entire area; body has 72px top padding
              so content flows UNDER the 56px toolbar and its blur shows through. */}
          <div
            ref={previewContentRef}
            style={{
              flex: 1,
              backgroundColor: "#737373",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {previewUrl ? (
              <iframe
                ref={previewIframeRef}
                src={previewUrl}
                onLoad={handlePreviewIframeLoad}
                style={{ width: "100%", height: "100%", border: "none", backgroundColor: "transparent" }}
                title="PDF Preview"
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.6)", gap: 12 }}>
                <span style={{ fontSize: 14 }}>Loading preview...</span>
              </div>
            )}
            <ZoomBar
              zoom={previewZoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onSetAuto={() => setPreviewZoom('auto')}
              onSet100={() => setPreviewZoom(1)}
            />
          </div>
        </div>
        </div>
        )}
      </div>

      {/* ── Title Bar (floats above everything; edit content scrolls under it for blur) ─ */}
      <TitleBar
        onEditPreviewData={() => setIsDataEditorOpen(true)}
        onExportToPdf={() => setIsModalOpen(true)}
        onExportPlaywright={handleExportPlaywright}
        onExportJson={handleExportJson}
      />

      {/* ── Floating Quick-Preview button (shown only when preview is collapsed) ── */}
      {isPreviewCollapsed && (
        <CollapsedPreviewButton onClick={() => setIsPreviewCollapsed(false)} />
      )}

      {/* ── Delete Section Dialog ──────────────────────────────────────────── */}
      {deletingSection && (
        <DeleteSectionDialog
          sectionTitle={deletingSection.title}
          isFirst={deletingSectionIdx === 0}
          isLast={deletingSectionIdx === sections.length - 1}
          onMergeUp={() => {
            mergeUp(deletingSection.id);
            setDeletingSectionId(null);
          }}
          onMergeDown={() => {
            mergeDown(deletingSection.id);
            setDeletingSectionId(null);
          }}
          onDeleteContent={() => {
            deleteSection(deletingSection.id);
            setDeletingSectionId(null);
          }}
          onCancel={() => setDeletingSectionId(null)}
        />
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
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
    </div>
  );
}
