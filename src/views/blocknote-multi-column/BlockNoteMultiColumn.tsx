"use client";

import {
  BlockNoteSchema,
  combineByGroup,
} from "@blocknote/core";
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

  container.querySelectorAll<HTMLElement>(".conditional-section-block").forEach((header) => {
    const field    = header.dataset.conditionField    ?? "";
    const operator = header.dataset.conditionOperator ?? "eq";
    const value    = header.dataset.conditionValue    ?? "";

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
    wrapper.dataset.conditionField     = field;
    wrapper.dataset.conditionOperator  = operator;
    wrapper.dataset.conditionValue     = value;

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
    case "customerName":   return formData.customerName   ?? "";
    case "projectAddress": return formData.projectAddress ?? "";
    case "completionDate": return formData.completionDate ?? "";
    case "totalBudget":    return formData.totalBudget    ?? "";
    default:               return "";
  }
}

function evaluateCondition(fieldValue: string, operator: string, conditionValue: string): boolean {
  if (!conditionValue) return true; // No condition set → always show
  const a = fieldValue.toLowerCase();
  const b = conditionValue.toLowerCase();
  switch (operator) {
    case "eq":          return a === b;
    case "neq":         return a !== b;
    case "contains":    return a.includes(b);
    case "notContains": return !a.includes(b);
    default:            return true;
  }
}

function processInlineConditionals(fullHtml: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return fullHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, "text/html");

  doc.querySelectorAll<HTMLElement>('[data-inline-content-type="conditionalInline"]').forEach((el) => {
    // BlockNote only serialises non-default props, so fall back to schema defaults
    const field    = el.dataset.conditionField    ?? "customerName";
    const operator = el.dataset.conditionOperator ?? "eq";
    const value    = el.dataset.conditionValue    ?? "";

    // The user-typed text lives in the [data-editable] child span
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

function processCompanyInfo(fullHtml: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return fullHtml;
  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, "text/html");
  const fieldMap: Record<string, string> = {
    name:           formData.companyName        ?? "",
    website:        formData.companyWebsite      ?? "",
    email:          formData.companyEmail        ?? "",
    phone:          formData.companyPhone        ?? "",
    address:        formData.companyAddress      ?? "",
    cityStateZip:   formData.companyCityStateZip ?? "",
  };
  doc.querySelectorAll<HTMLElement>("[data-company-field]").forEach((el) => {
    const field = el.dataset.companyField ?? "";
    const value = fieldMap[field];
    if (!value) return;
    el.textContent = value;
    if (el.tagName === "A") {
      if (field === "website") el.setAttribute("href", `https://${value}`);
      if (field === "email")   el.setAttribute("href", `mailto:${value}`);
      if (field === "phone")   el.setAttribute("href", `tel:${value}`);
    }
  });
  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

// ── Client-side HTML post-processing (mirrors pdf-server replace_placeholders) ─

const PLACEHOLDER_FIELD_MAP: Record<string, keyof ExportFormData> = {
  "Customer Name": "customerName",
  "Project Address": "projectAddress",
  "MM/DD/YYYY": "completionDate",
  "$0.00": "totalBudget",
};

function replacePlaceholderInputs(html: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll<HTMLElement>('[data-inline-content-type="placeholderInput"]').forEach((el) => {
    const label    = el.dataset.label ?? el.textContent?.trim() ?? "";
    const fieldKey = PLACEHOLDER_FIELD_MAP[label];
    const value    = fieldKey ? (formData[fieldKey] as string) || "\u2014" : "\u2014";

    // All formatting is stored as JSON in the stylesJson prop → data-styles-json attribute
    const css = stylesToReactCSS(parseStyles(el.dataset.stylesJson ?? ""));

    el.innerHTML = "";
    const span = document.createElement("span");
    if (css.fontWeight)      span.style.fontWeight      = String(css.fontWeight);
    if (css.fontStyle)       span.style.fontStyle       = String(css.fontStyle);
    if (css.textDecoration)  span.style.textDecoration  = String(css.textDecoration);
    if (css.fontFamily)      span.style.fontFamily      = String(css.fontFamily);
    if (css.color)           span.style.color           = String(css.color);
    span.textContent = value;
    el.appendChild(span);
  });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function processConditionalSectionBlocks(html: string, formData: ExportFormData): string {
  if (typeof document === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll<HTMLElement>('[data-conditional-wrapper="true"]').forEach((el) => {
    const field = el.dataset.conditionField ?? "";
    const operator = el.dataset.conditionOperator ?? "eq";
    const compare = el.dataset.conditionValue ?? "";
    if (!compare.trim()) return;
    const met = evaluateCondition(getFieldValue(formData, field), operator, compare);
    if (!met) el.remove();
  });

  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

function buildProductListHtml(products: { name: string; quantity: string; amount: string }[], summary?: { subtotal: string; discount: string; salesTaxRate: string; salesTax: string; total: string }): string {
  const rows = products.map(p =>
    `<div class="product-list-row">` +
    `<div class="product-list-desc"><div class="product-list-name">${p.name}</div></div>` +
    `<div class="product-list-qty">${p.quantity}</div>` +
    `<div class="product-list-amt">${p.amount}</div>` +
    `</div>`
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

// ─────────────────────────────────────────────────────────────────────────────

import { createProductList } from "./ProductListBlock";
import { createConditionalSection } from "./ConditionalSectionBlock";
import { createPageBreak } from "./PageBreakBlock";
import { createCompanyInfo } from "./CompanyInfoBlock";
import { createDrawing } from "./DrawingBlock";
import { PlaceholderInput, placeholderColorSyncExtension, parseStyles, stylesToReactCSS } from "./PlaceholderInput";
import { ConditionalInline } from "./ConditionalInlineContent";
import { ExportModal, type ExportFormData } from "./ExportModal";
import { ConditionalSectionModal, type ConditionalSectionConfig } from "./ConditionalSectionModal";
import { ConditionalInlineModal } from "./ConditionalInlineModal";
import "./product-list.css";
import "./conditional-section.css";
import "./page-break.css";

const PDF_STYLES = `
  @page { size: A4; margin: 20mm; }
  body {
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    line-height: 1.6;
  }
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

  .bn-block-column-list { display: flex; gap: 16px; }
  .bn-block-column { flex-basis: 0; min-width: 0; overflow: hidden; }

  [data-inline-content-type="placeholderInput"] { display: inline; }
  [data-inline-content-type="conditionalInline"] { display: inline; }

  .conditional-section-block { border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
  .conditional-section-header { display: none !important; }

  [data-page-break="true"] { display: block; height: 0; overflow: hidden; visibility: hidden; break-after: page; page-break-after: always; }
`;

const PREVIEW_EXTRA_STYLES = `
  html { background: #e8e8e8; }
  body {
    margin: 0; padding: 24px 0; background: transparent;
    font-size: 16px;
    font-family: Inter, SF Pro Display, -apple-system, BlinkMacSystemFont, "Open Sans", "Segoe UI", Roboto, sans-serif;
    color: #000;
  }
  h1 { font-size: 3em; }
  h2 { font-size: 2em; }
  h3 { font-size: 1.3em; }
  .preview-page {
    max-width: 750px;
    margin: 0 auto 20px;
    padding: 40px;
    background: white;
    box-shadow: 0 2px 12px rgba(0,0,0,0.10);
    border-radius: 4px;
    min-height: 120px;
    box-sizing: border-box;
  }
  .preview-page:last-child { margin-bottom: 0; }
`;

// Script injected at the end of <body> to split content into visual pages.
// It finds the top-level body child that contains [data-page-break] and uses
// it as a split point, wrapping the surrounding content into .preview-page divs.
const PREVIEW_PAGE_SPLIT_SCRIPT = `
<script>
(function () {
  var body = document.body;
  var breaks = body.querySelectorAll('[data-page-break="true"]');

  // Mark the top-level body child that is (or contains) each page break
  breaks.forEach(function (el) {
    var node = el;
    while (node.parentElement && node.parentElement !== body) {
      node = node.parentElement;
    }
    node.setAttribute('data-page-break-wrapper', 'true');
  });

  // Split body children into page buckets at break wrappers
  var children = Array.from(body.children);
  var pages = [[]];
  children.forEach(function (child) {
    if (child.getAttribute('data-page-break-wrapper') === 'true') {
      pages.push([]);
    } else {
      pages[pages.length - 1].push(child);
    }
  });

  // Rebuild body with .preview-page wrappers
  body.innerHTML = '';
  pages.forEach(function (nodes) {
    var page = document.createElement('div');
    page.className = 'preview-page';
    nodes.forEach(function (n) { page.appendChild(n); });
    body.appendChild(page);
  });
})();
</script>
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

const schema = withMultiColumn(
  BlockNoteSchema.create().extend({
    blockSpecs: {
      productList: createProductList(),
      conditionalSection: createConditionalSection(),
      pageBreak: createPageBreak(),
      companyInfo: createCompanyInfo(),
      drawing: createDrawing(),
    },
    inlineContentSpecs: {
      placeholderInput:  PlaceholderInput,
      conditionalInline: ConditionalInline,
    },
  }),
);

export default function BlockNoteMultiColumn() {
  const editor = useCreateBlockNote({
    schema,
    extensions: [placeholderColorSyncExtension],
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    },
    initialContent: [
      {
        type: "heading",
        props: { level: 2 },
        content: "Custom Block in Multi-Column Layout Test",
      },
      {
        type: "companyInfo" as const,
      },
      {
        type: "paragraph",
        content:
          "Below is a Product List custom block placed inside a multi-column layout to verify custom blocks work with columns.",
      },
      {
        type: "columnList",
        children: [
          {
            type: "column",
            props: { width: 1.6 },
            children: [
              {
                type: "productList" as const,
              },
            ],
          },
          {
            type: "column",
            props: { width: 1.0 },
            children: [
              {
                type: "heading",
                props: { level: 3 },
                content: "Project Notes",
              },
              {
                type: "paragraph",
                content:
                  "This column sits next to the Product List to verify that custom blocks participate in multi-column layouts correctly.",
              },
              {
                type: "bulletListItem",
                content: "Custom blocks render properly in columns",
              },
              {
                type: "bulletListItem",
                content: "Drag & drop works across columns",
              },
              {
                type: "bulletListItem",
                content: "Slash menu includes product list insert",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        props: { level: 3 },
        content: "Custom Inline Content Demo",
      },
      {
        type: "paragraph",
        content: [
          "The customer name is ",
          {
            type: "placeholderInput",
            props: { label: "Customer Name" },
          } as const,
          " and the project address is ",
          {
            type: "placeholderInput",
            props: { label: "Project Address" },
          } as const,
          ".",
        ],
      },
      {
        type: "paragraph",
        content: [
          "Estimated completion date: ",
          {
            type: "placeholderInput",
            props: { label: "MM/DD/YYYY" },
          } as const,
          ", total budget: ",
          {
            type: "placeholderInput",
            props: { label: "$0.00" },
          } as const,
          ".",
        ],
      },
      {
        type: "paragraph",
        content:
          'Type "#" to insert a placeholder input field anywhere.',
      },
      {
        type: "heading",
        props: { level: 3 },
        content: "Standalone Product List (outside columns)",
      },
      {
        type: "productList" as const,
      },
      {
        type: "heading",
        props: { level: 3 },
        content: "Drawing / Floor Plan",
      },
      {
        type: "drawing" as const,
      },
      {
        type: "paragraph",
      },
    ],
  });

  const getSlashMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        [
          ...combineByGroup(
            getDefaultReactSlashMenuItems(editor).filter((item) => item.title !== "Emoji"),
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
              conditionalInsertBlockRef.current = editor.getTextCursorPosition().block;
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
                [{ type: "companyInfo" as const }],
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
  const [isConditionalInlineModalOpen, setIsConditionalInlineModalOpen] = useState(false);

  const handleInsertConditionalInline = useCallback((cfg: { conditionField: string; conditionOperator: string; conditionValue: string }) => {
    setIsConditionalInlineModalOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tiptap = (editor as any)._tiptapEditor;

    // Step 1: insert the (empty) node via BlockNote — this reliably places it
    editor.insertInlineContent([{
      type: "conditionalInline" as const,
      props: cfg,
    }]);

    // Step 2: in the next tick the node is in the doc; find the nearest empty
    // conditionalInline and fill it with the default text
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
  }, [editor]);

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
                { type: "placeholderInput" as const, props: { label: item.label } },
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

  const handleInsertConditionalSection = useCallback((config: ConditionalSectionConfig) => {
    setIsConditionalModalOpen(false);
    const targetBlock = conditionalInsertBlockRef.current ?? editor.getTextCursorPosition().block;
    editor.insertBlocks(
      [{ type: "conditionalSection" as const, props: config, children: [{ type: "paragraph" as const }] }],
      targetBlock,
      "after",
    );
  }, [editor]);

  // --- Preview state (auto-populate with default data on mount) ---
  const [previewData, setPreviewData] = useState<ExportFormData | null>(
    DEFAULT_PREVIEW_DATA,
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);

  // --- Export state ---
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buildFullHtml = useCallback(
    async () => {
      const blocks = editor.document;
      const rawHtml = await editor.blocksToHTMLLossy(blocks);
      // Preserve empty paragraphs: blocksToHTMLLossy outputs <p></p> with no
      // content, so browsers and WeasyPrint collapse them. Adding a <br>
      // gives each empty paragraph the height of one line — matching the editor.
      const withEmptyParas = rawHtml.replace(/<p><\/p>/g, '<p><br></p>');
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
    },
    [editor],
  );

  // Fetch preview from server (data replacement happens server-side)
  const previewDataRef = useRef(previewData);
  previewDataRef.current = previewData;

  const updatePreview = useCallback(async () => {
    const currentData = previewDataRef.current;
    if (!currentData) return;
    setIsPreviewLoading(true);
    try {
      const fullHtml = await buildFullHtml();
      let processedHtml = processCompanyInfo(processInlineConditionals(fullHtml, currentData), currentData);
      processedHtml = replacePlaceholderInputs(processedHtml, currentData);
      processedHtml = processConditionalSectionBlocks(processedHtml, currentData);
      processedHtml = replaceProductListBlocks(processedHtml, currentData);
      let html = processedHtml.replace("</head>", `<style>${PREVIEW_EXTRA_STYLES}</style></head>`);
      html = html.replace("</body>", `${PREVIEW_PAGE_SPLIT_SCRIPT}</body>`);
      setPreviewHtml(html);
    } catch (error) {
      console.error("Preview update failed:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  }, [buildFullHtml]);

  // Debounced preview: re-run when editor content or preview data changes
  useEffect(() => {
    if (!previewData) return;
    const timer = setTimeout(updatePreview, 400);
    return () => clearTimeout(timer);
  }, [previewData, editorVersion, updatePreview]);

  const [isDataEditorOpen, setIsDataEditorOpen] = useState(false);

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
        const processedHtml = processCompanyInfo(processInlineConditionals(fullHtml, data), data);
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
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
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
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
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
                srcDoc={previewHtml}
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
