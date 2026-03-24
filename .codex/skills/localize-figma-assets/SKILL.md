---
name: localize-figma-assets
description: Download remote Figma asset URLs used in a Next.js project into local public assets and replace source code references with local paths. Use when a project contains https://www.figma.com/api/mcp/asset/... or other Figma-hosted image URLs that should be vendored into the repo.
---

# Localize Figma Assets

Use this skill when a Next.js or React codebase contains remote Figma image URLs that should be checked into the repository and served locally.

## Workflow

1. Inspect the codebase for remote Figma asset URLs, especially `https://www.figma.com/api/mcp/asset/...`.
2. Run the bundled script:

```bash
npm run figma:localize
```

3. Review the output summary:
   - downloaded assets
   - reused existing local assets
   - updated source files
4. If needed, rerun with explicit roots or output directory:

```bash
node .codex/skills/localize-figma-assets/scripts/localize-figma-assets.mjs --root src --root app --out-dir public/assets/figma-local
```

## Defaults

- Scans: `app/`, `src/`, `public/`
- Ignores: `.git/`, `.next/`, `dist/`, `node_modules/`
- Rewrites only files with code/data extensions such as `ts`, `tsx`, `js`, `jsx`, `json`, `css`, `html`, `mdx`
- Saves downloads to `public/assets/figma-local/`

## Notes

- The script is deterministic: each remote URL maps to a stable local filename derived from the asset id plus a short hash.
- It de-duplicates repeated URLs before downloading.
- It infers file extensions from the response `content-type` when possible.
- Use `--dry-run` to inspect matches without changing files.
