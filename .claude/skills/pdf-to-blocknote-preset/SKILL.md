---
name: pdf-to-blocknote-preset
description: 将 PDF 提案模板转换为 BlockNote 编辑器的预填内容（TypeScript block-node 数组），并注册到编辑器左上角的预设下拉菜单中。当用户提供 PDF 文件并要求将其添加为 BlockNote 编辑器预设时使用。
---

# PDF → BlockNote 预设转换器

将 PDF 提案模板还原为 `BlockNoteMultiColumn.tsx` 中的预设常量，使其出现在编辑器左上角的下拉切换器里。

## 第一步：读取 PDF

用 `Read` 工具读取用户提供的 PDF 路径，逐页分析：

- 页面结构与视觉层次（标题、段落、分栏、分页）
- **动态字段**（客户名、地址、日期、金额等）vs **静态文本**
- 是否包含：公司 Logo、绘图/平面图、产品报价表、明确的分页符

## 第二步：确认当前可用的积木

在写任何代码之前，先读取以下文件确认所有自定义块和行内内容的最新 props：

- `src/views/blocknote-multi-column/BlockNoteMultiColumn.tsx`（`schema` 常量）
- `src/views/blocknote-multi-column/CompanyInfoBlock.tsx`
- `src/views/blocknote-multi-column/ProductListBlock.tsx`
- `src/views/blocknote-multi-column/DrawingBlock.tsx`

### 当前已注册的 Block 类型

| 类型 | 关键 props | 用途 |
|---|---|---|
| `companyLogo` | `centered?: boolean` | 公司 Logo 占位图；封面页居中时用三列技巧（见下方） |
| `companyField` | `fieldType: "name"\|"website"\|"email"\|"phone"\|"address"\|"cityStateZip"` | 公司信息字段，content 中必须嵌入对应 `placeholderInput` |
| `productList` | 无 | 产品报价表（含汇总行），整块渲染 |
| `drawing` | 无 | 绘图 / 平面图占位块 |
| `conditionalSection` | `conditionField`, `conditionOperator`, `conditionValue` | 条件显示区块 |
| `pageBreak` | 无 | 仅在 PDF 有明确硬分页处插入 |
| `columnList` / `column` | `column.props.width: number`（相对比例） | 多列布局 |

标准 BlockNote 块（`heading`、`paragraph`、`bulletListItem` 等）也可正常使用，支持 `textAlignment`、`level` 等标准 props。

### 当前已注册的 Inline Content 类型

只能使用以下精确标签，**不得自造新标签**：

| `props.label` 值 | 替换内容 |
|---|---|
| `"Customer Name"` | 客户姓名 |
| `"Project Address"` | 项目地址 |
| `"MM/DD/YYYY"` | 完工日期 / 评估日期 |
| `"$0.00"` | 总预算 / 报价金额 |
| `"Company Name"` | 承包商公司名称 |
| `"Company Website"` | 公司网址 |
| `"Company Email"` | 公司邮箱 |
| `"Company Phone"` | 公司电话 |
| `"Company Address"` | 公司街道地址 |
| `"Company City/St/Zip"` | 公司城市/州/邮编 |

行内节点写法：
```ts
{ type: "placeholderInput" as const, props: { label: "Customer Name" } }
```

## 第三步：逐页映射

按以下规则把 PDF 内容翻译成 block node：

### 公司 Header（Logo + 联系信息）

固定用二列布局，Logo 在左，`companyField` 堆叠在右：

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
        // website / email / phone / address / cityStateZip 同理
      ],
    },
  ],
}
```

### 封面页居中 Logo

`companyLogo` 没有 `textAlignment` prop，用三列技巧代替：

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

### 段落中嵌入动态字段

```ts
{
  type: "paragraph" as const,
  content: [
    "客户姓名为 ",
    { type: "placeholderInput" as const, props: { label: "Customer Name" } },
    "，项目地址为 ",
    { type: "placeholderInput" as const, props: { label: "Project Address" } },
    "。",
  ],
}
```

### 居中文字（封面页）

```ts
{ type: "paragraph" as const, props: { textAlignment: "center" as const }, content: "Evaluated on:" }
```

### 加粗文字

```ts
{ type: "text" as const, text: "某些加粗文字", styles: { bold: true } }
```

### 平面图 / 绘图

```ts
{ type: "drawing" as const }
```

### 产品报价表

```ts
{ type: "productList" as const }
```

### 分页符

仅在 PDF 中有明确硬分页的位置插入，**不要在每个 section 之间都加**：

```ts
{ type: "pageBreak" as const }
```

### 无对应占位符的静态文字

直接用字符串或 `{ type: "text", text: "...", styles: {} }` 写死，**不要捏造新的 placeholder label**。

## 第四步：写预设常量

在 `BlockNoteMultiColumn.tsx` 的 `CONTENT_PRESETS` 数组**正上方**添加新常量：

```ts
// ── <描述性名称> 预设 ──────────────────────────────────────────────
const PRESET_<大写名称> = [
  // ... block nodes
] as const;
```

然后注册到 `CONTENT_PRESETS`：

```ts
const CONTENT_PRESETS: { label: string; content: unknown }[] = [
  { label: "Default Template", content: INITIAL_EDITOR_CONTENT },
  // 已有的预设...
  { label: "<人类可读的下拉标签>", content: PRESET_<大写名称> },
];
```

## 第五步：自检

写完后逐项核对：

- [ ] 每个 `companyField` 的 `content` 里都有对应的 `placeholderInput`
- [ ] 所有 `placeholderInput` 的 `label` 都在第二步的表格中存在
- [ ] `columnList` 的直接子节点全部是 `column`，无例外
- [ ] 没有凭空加入 PDF 里没有的 `pageBreak`
- [ ] 没有凭空发明 PDF 里没有的内容或元素

## 常见错误

| 错误 | 正确做法 |
|---|---|
| 自造不存在的 placeholder label | 只用第二步表格中的 10 个标签 |
| 把非 `column` 块直接放进 `columnList` | 所有内容必须先套一层 `{ type: "column", ... }` |
| 给 `companyLogo` 加 `textAlignment` | 用三列布局居中 |
| 每个 section 之间都加 `pageBreak` | pagedjs 自动分页，只在 PDF 有明确硬分页处加 |
| 在 `companyField` 上用 `textAlignment` | 它已内置右对齐样式，不支持该 prop |
