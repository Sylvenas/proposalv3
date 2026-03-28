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
import { useMemo } from "react";

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

  return (
    <BlockNoteView editor={editor}>
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={getSlashMenuItems}
      />
      <SuggestionMenuController
        triggerCharacter="#"
        getItems={getPlaceholderMenuItems}
      />
    </BlockNoteView>
  );
}
