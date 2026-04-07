---
name: pdf-to-blocknote-preset
description: Convert a PDF proposal template into prefilled BlockNote editor content (a TypeScript block-node array), then register it in the preset dropdown menu at the top-left of the editor. Use this when the user provides a PDF file and asks to add it as a BlockNote editor preset.
---

# PDF to BlockNote Preset Converter

Recreate a PDF proposal template as a preset constant in `BlockNoteMultiColumn.tsx` so it appears in the dropdown switcher at the top-left of the editor.

## Step 1: Read the PDF

Use the `Read` tool to read the PDF path provided by the user, and analyze it page by page:

- Page structure and visual hierarchy (headings, paragraphs, columns, pagination)
- **Dynamic fields** (customer name, address, date, amount, etc.) vs. **static text**
- Whether it includes: company logo, drawing / floor plan, product quote table, explicit page breaks

## Step 2: Confirm the Current Available Blocks

Before writing any code, read the following files to confirm the latest props for all custom blocks and inline content:

- `src/views/blocknote-multi-column/BlockNoteMultiColumn.tsx` (the `schema` constant)
- `src/views/blocknote-multi-column/CompanyInfoBlock.tsx`
- `src/views/blocknote-multi-column/ProductListBlock.tsx`
- `src/views/blocknote-multi-column/DrawingBlock.tsx`

### Currently Registered Block Types

| Type | Key props | Purpose |
|---|---|---|
| `companyLogo` | `centered?: boolean` | Company logo placeholder; use the three-column technique for centered cover-page logos (see below) |
| `companyField` | `fieldType: "name"\|"website"\|"email"\|"phone"\|"address"\|"cityStateZip"` | Company information field; `content` must include the corresponding `placeholderInput` |
| `productList` | none | Product quote table (including summary row), rendered as a whole block |
| `drawing` | none | Drawing / floor plan placeholder block |
| `conditionalSection` | `conditionField`, `conditionOperator`, `conditionValue` | Conditionally visible section block |
| `pageBreak` | none | Insert only where the PDF has an explicit hard page break |
| `columnList` / `column` | `column.props.width: number` (relative ratio) | Multi-column layout |

Standard BlockNote blocks (`heading`, `paragraph`, `bulletListItem`, etc.) are also available and support standard props such as `textAlignment` and `level`.

### Currently Registered Inline Content Types

Use only the following exact labels. **Do not invent new labels**:

| `props.label` value | Replacement content |
|---|---|
| `"Customer Name"` | Customer name |
| `"Project Address"` | Project address |
| `"MM/DD/YYYY"` | Completion date / evaluation date |
| `"$0.00"` | Total budget / quoted amount |
| `"Company Name"` | Contractor company name |
| `"Company Website"` | Company website |
| `"Company Email"` | Company email |
| `"Company Phone"` | Company phone |
| `"Company Address"` | Company street address |
| `"Company City/St/Zip"` | Company city / state / ZIP |

Inline node syntax:

```ts
{ type: "placeholderInput" as const, props: { label: "Customer Name" } }
```

## Step 3: Map the PDF Page by Page

Translate the PDF content into block nodes using the following rules:

### Company Header (Logo + Contact Information)

Always use a two-column layout, with the logo on the left and stacked `companyField` blocks on the right:

```ts
{
  type: "columnList" as const,
  children: [
    { type: "column" as const, props: { width: 0.6 },
      children: [{ type: "companyLogo" as const }] },
    { type: "column" as const, props: { width: 1.0 },
      children: [
        { type: "companyField" as const, props: { fieldType: "name" },
          content: [{ type: "placeholderInput" as const, props: { label: "Company Name" } }] },
        // website / email / phone / address / cityStateZip follow the same pattern
      ],
    },
  ],
}
```

### Centered Logo on the Cover Page

`companyLogo` does not have a `textAlignment` prop. Use the three-column technique instead:

```ts
{
  type: "columnList" as const,
  children: [
    { type: "column" as const, props: { width: 1.0 }, children: [{ type: "paragraph" as const }] },
    { type: "column" as const, props: { width: 0.8 }, children: [{ type: "companyLogo" as const }] },
    { type: "column" as const, props: { width: 1.0 }, children: [{ type: "paragraph" as const }] },
  ],
}
```

### Embed Dynamic Fields in Paragraphs

```ts
{
  type: "paragraph" as const,
  content: [
    "Customer name: ",
    { type: "placeholderInput" as const, props: { label: "Customer Name" } },
    ". Project address: ",
    { type: "placeholderInput" as const, props: { label: "Project Address" } },
    ".",
  ],
}
```

### Centered Text (Cover Page)

```ts
{ type: "paragraph" as const, props: { textAlignment: "center" as const }, content: "Evaluated on:" }
```

### Bold Text

```ts
{ type: "text" as const, text: "Some bold text", styles: { bold: true } }
```

### Floor Plan / Drawing

```ts
{ type: "drawing" as const }
```

### Product Quote Table

```ts
{ type: "productList" as const }
```

### Page Breaks

Insert a page break only where the PDF has an explicit hard page break. **Do not add one between every section**:

```ts
{ type: "pageBreak" as const }
```

### Static Text Without a Matching Placeholder

Hard-code it directly as a string or as `{ type: "text", text: "...", styles: {} }`. **Do not invent new placeholder labels**.

## Step 4: Write the Preset Constant

Add a new constant immediately **above** the `CONTENT_PRESETS` array in `BlockNoteMultiColumn.tsx`:

```ts
// -- <descriptive name> preset ----------------------------------------------
const PRESET_<UPPERCASE_NAME> = [
  // ... block nodes
] as const;
```

Then register it in `CONTENT_PRESETS`:

```ts
const CONTENT_PRESETS: { label: string; content: unknown }[] = [
  { label: "Default Template", content: INITIAL_EDITOR_CONTENT },
  // Existing presets...
  { label: "<human-readable dropdown label>", content: PRESET_<UPPERCASE_NAME> },
];
```

## Step 5: Self-Check

After writing the preset, verify each item:

- [ ] Every `companyField` includes the corresponding `placeholderInput` in its `content`
- [ ] Every `placeholderInput` `label` exists in the table from Step 2
- [ ] Every direct child of `columnList` is a `column`, with no exceptions
- [ ] No `pageBreak` was added unless it exists explicitly in the PDF
- [ ] No content or element was invented beyond what exists in the PDF

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Inventing a non-existent placeholder label | Use only the 10 labels listed in the Step 2 table |
| Placing a non-`column` block directly inside `columnList` | Wrap all content in `{ type: "column", ... }` first |
| Adding `textAlignment` to `companyLogo` | Use the three-column layout to center it |
| Adding `pageBreak` between every section | pagedjs handles automatic pagination; add it only where the PDF has an explicit hard page break |
| Using `textAlignment` on `companyField` | It has built-in right-aligned styling and does not support that prop |
