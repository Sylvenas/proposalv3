# Claude Code Guidelines

## Figma Design Fidelity — STRICT RULE

When implementing UI from a Figma design, you MUST reproduce the design with 100% fidelity. This is a non-negotiable requirement.

### What this means

- **Never invent elements** that do not exist in the design (e.g. badges, labels, decorative icons, placeholder images, color fills).
- **Never omit elements** that exist in the design.
- **Never "improve" or "interpret"** the design — implement exactly what is shown, pixel by pixel.
- Always fetch the Figma node via the MCP tool (`get_design_context`) before writing any code for a new UI section.
- Use the Figma screenshot and generated code as the authoritative reference. Cross-check both.

### Common mistakes to avoid

- Adding placeholder images or colored blocks when a section in the design has no image.
- Adding status badges (e.g. "Approved", "Active") that are not in the design.
- Changing text content, prefixes, or suffixes (e.g. adding "APPROVED —" before a title).
- Using a self-invented icon SVG instead of downloading and using the exact Figma asset.
- Applying the large-image alt layout to items that use the compact text-only layout in the design.
- Rounding corners on elements that should have none (e.g. tab active underline clipped by border-radius).

### Workflow for every Figma implementation task

1. Call `get_design_context` with the exact node ID from the provided Figma URL.
2. Study the screenshot carefully before writing any code.
3. Read the generated reference code to extract exact dimensions, colors, spacing, font sizes, and border radii.
4. Implement strictly from the design — no additions, no omissions, no creative reinterpretation.
5. If a design detail is ambiguous, ask the user before making any assumption.

## Responsive Scaling System — STRICT RULE

All pages in `src/views/ODAProposalPage.tsx` use a **viewport-scale system** that proportionally scales all UI elements between 1440px (laptop) and 3840px (4K). This is non-negotiable for any new or modified screen.

### How it works

- A CSS variable `--scale` is set on `:root` by a `useEffect` in `ODAProposalPage`:
  ```ts
  const scale = Math.min(Math.max(window.innerWidth / 1440, 1), 3840 / 1440)
  document.documentElement.style.setProperty('--scale', String(scale))
  ```
- A helper `sv(px: number)` converts any design-base pixel value to a scaled CSS expression:
  ```ts
  const sv = (px: number) => `calc(${px}px * var(--scale))`
  ```
- **Design base width**: 1440px (all Figma designs are at this width).
- **Below 1440px**: scale stays at 1 (content is 1440px wide, horizontal scroll allowed).
- **Above 3840px**: scale is capped at 3840/1440 ≈ 2.667 (content is 3840px wide, white side margins, horizontally centered).

### Rules for every screen

1. **Every pixel value** — widths, heights, margins, paddings, font sizes, gaps, border widths, letter spacing, border radii — MUST use `sv()`.
2. **Page container** must be:
   ```tsx
   <div style={{ width: sv(1440), margin: '0 auto' }}>
   ```
3. **Frame height**: Use `get_metadata` on the Figma node to get the exact frame height, then compute bottom padding as `sv(frameHeight - lowestElementBottom)`.
4. **Outer wrapper** should be `bg-white` to ensure white side margins above 3840px.
5. **Tailwind arbitrary-value classes** (e.g. `text-[14px]`, `h-[40px]`, `gap-6`) that contain pixel values MUST be converted to inline styles using `sv()`.
6. **Unitless / relative Tailwind classes** (e.g. `flex`, `items-center`, `whitespace-nowrap`, `leading-tight`, `object-cover`, `overflow-hidden`) are fine to keep as-is.
7. **SVG `width`/`height` attributes** must use `style={{ width: sv(n), height: sv(n) }}` instead of HTML attributes (SVG attributes don't support `calc()`).
8. **Letter spacing in em** scales automatically when the font size is already scaled with `sv()` — no extra change needed for `em`-based letter spacing.

### Workflow for every new screen

1. Call `get_design_context` to get the screenshot + reference code.
2. Call `get_metadata` on the frame node to get exact frame width (confirm 1440px) and height.
3. Calculate bottom padding: `frame_height − (topmost_y + lowest_element_height)`.
4. Replace every hardcoded pixel with `sv(n)`.
5. Wrap content in `<div style={{ width: sv(1440), margin: '0 auto', paddingBottom: sv(bottomPad) }}>`.

## Active Technologies
- TypeScript 5.9 / React 19 + Next.js 15, Tailwind CSS 4, `@dnd-kit/core`, `@dnd-kit/utilities`, `react-rnd` (001-drag-drop-widget-builder)
- None (prototype — in-memory state only, no persistence) (001-drag-drop-widget-builder)

## Recent Changes
- 001-drag-drop-widget-builder: Added TypeScript 5.9 / React 19 + Next.js 15, Tailwind CSS 4, `@dnd-kit/core`, `@dnd-kit/utilities`, `react-rnd`
