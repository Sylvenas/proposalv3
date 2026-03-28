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
import { useCallback, useMemo, useState } from "react";

import { createProductList } from "./ProductListBlock";
import { PlaceholderInput } from "./PlaceholderInput";
import "./product-list.css";

const schema = withMultiColumn(
  BlockNoteSchema.create().extend({
    blockSpecs: {
      productList: createProductList(),
    },
    inlineContentSpecs: {
      placeholderInput: PlaceholderInput,
    },
  }),
);

export default function BlockNoteMultiColumn() {
  const editor = useCreateBlockNote({
    schema,
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
        type: "paragraph",
      },
    ],
  });

  const getSlashMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        [
          ...combineByGroup(
            getDefaultReactSlashMenuItems(editor),
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
        ],
        query,
      );
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
        items.map((item) => ({
          title: item.title,
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: "placeholderInput",
                props: { label: item.label },
              } as const,
              " ",
            ]);
          },
          aliases: [item.label.toLowerCase()],
        })),
        query,
      );
  }, [editor]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const blocks = editor.document;
      const htmlContent = await editor.blocksToHTMLLossy(blocks);

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
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
  ul, ol { margin: 4px 0; padding-left: 24px; }
  li { margin: 2px 0; }

  .product-list-block { width: 100%; font-family: "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #1a1a1a; }
  .product-list-title { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .product-list-table { border-top: 1px solid #e0e0e0; }
  .product-list-header { display: grid; grid-template-columns: 1fr 80px 80px; padding: 4px 6px; background: #f5f5f5; font-weight: 700; font-size: 11px; border-bottom: 1px solid #e0e0e0; }
  .product-list-row { display: grid; grid-template-columns: 1fr 80px 80px; padding: 6px; border-bottom: 1px solid #eee; align-items: center; }
  .product-list-subrow { display: grid; grid-template-columns: 1fr 80px 80px; padding: 2px 6px; color: #555; font-size: 10px; }
  .product-list-subrow:last-child { padding-bottom: 6px; border-bottom: 1px solid #eee; }
  .product-list-desc { display: flex; align-items: center; gap: 6px; }
  .product-list-name { font-weight: 600; font-size: 11px; }
  .product-list-subtitle { color: #888; font-size: 10px; margin-top: 1px; }
  .product-list-qty { text-align: left; }
  .product-list-amt { text-align: right; font-weight: 500; }
  .product-list-discount { font-size: 9px; color: #888; font-weight: 400; margin-top: 1px; }
  .product-list-after-discount { font-size: 9px; font-weight: 700; margin-top: 1px; }
  .product-list-summary { padding: 6px; border-top: 1px solid #e0e0e0; }
  .product-list-summary-row { display: flex; justify-content: flex-end; gap: 20px; padding: 1px 0; font-size: 10px; color: #555; }
  .product-list-summary-row span:first-child { min-width: 60px; text-align: right; }
  .product-list-summary-row span:last-child { min-width: 70px; text-align: right; }
  .product-list-total { font-weight: 700; font-size: 11px; color: #1a1a1a; padding-top: 2px; }

  .bn-block-column-list {
    display: flex;
    gap: 16px;
  }
  .bn-block-column {
    flex-basis: 0;
    min-width: 0;
    overflow: hidden;
  }

  [data-inline-content-type="placeholderInput"] {
    display: inline-block;
  }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

      const response = await fetch("http://localhost:5001/api/html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: fullHtml }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blocknote-export.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Make sure the Python server is running on port 5001.");
    } finally {
      setIsExporting(false);
    }
  }, [editor, isExporting]);

  return (
    <div style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 794,
          margin: "0 auto",
          padding: "16px 0 0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0 0 12px",
          }}
        >
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            style={{
              padding: "8px 20px",
              backgroundColor: isExporting ? "#ccc" : "#228be6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: isExporting ? "not-allowed" : "pointer",
            }}
          >
            {isExporting ? "Exporting..." : "Export to PDF"}
          </button>
        </div>
        <div
          style={{
            backgroundColor: "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            borderRadius: 4,
            minHeight: "calc(100vh - 80px)",
          }}
        >
          <BlockNoteView editor={editor} theme="light">
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
    </div>
  );
}
