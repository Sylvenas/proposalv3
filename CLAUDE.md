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

## Active Technologies
- TypeScript 5.9 / React 19 + Next.js 15, Tailwind CSS 4, `@dnd-kit/core`, `@dnd-kit/utilities`, `react-rnd` (001-drag-drop-widget-builder)
- None (prototype — in-memory state only, no persistence) (001-drag-drop-widget-builder)

## Recent Changes
- 001-drag-drop-widget-builder: Added TypeScript 5.9 / React 19 + Next.js 15, Tailwind CSS 4, `@dnd-kit/core`, `@dnd-kit/utilities`, `react-rnd`
