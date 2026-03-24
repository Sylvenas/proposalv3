#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_ROOTS = ["app", "src", "public"];
const DEFAULT_OUT_DIR = "public/assets/figma-local";
const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".md",
  ".mdx",
]);
const IGNORED_DIRS = new Set([".git", ".next", "dist", "node_modules"]);
const FIGMA_URL_RE =
  /https:\/\/(?:www\.)?figma\.com\/api\/mcp\/asset\/[A-Za-z0-9-]+(?:\?[^\s"'`)<>]*)?/g;

function parseArgs(argv) {
  const roots = [];
  let outDir = DEFAULT_OUT_DIR;
  let dryRun = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--root") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--root requires a value");
      }
      roots.push(value);
      index += 1;
      continue;
    }
    if (arg === "--out-dir") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--out-dir requires a value");
      }
      outDir = value;
      index += 1;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    dryRun,
    outDir,
    roots: roots.length > 0 ? roots : DEFAULT_ROOTS,
  };
}

function printHelp() {
  console.log(`Usage: node .codex/skills/localize-figma-assets/scripts/localize-figma-assets.mjs [options]

Options:
  --root <dir>      Add a scan root. May be repeated. Defaults to: ${DEFAULT_ROOTS.join(", ")}
  --out-dir <dir>   Output directory for local assets. Default: ${DEFAULT_OUT_DIR}
  --dry-run         Report matches without writing files
  -h, --help        Show this help
`);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function hashText(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 10);
}

function inferExtension(contentType, url) {
  const normalized = (contentType || "").split(";")[0].trim().toLowerCase();
  const byType = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };

  if (byType[normalized]) {
    return byType[normalized];
  }

  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname);
    if (ext) {
      return ext.toLowerCase();
    }
  } catch {}

  return ".bin";
}

function buildFileName(url, extension) {
  let assetId = "figma-asset";
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    assetId = parts.at(-1) || assetId;
  } catch {}
  const suffix = hashText(url);
  return `${assetId}-${suffix}${extension}`;
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(rootPath) {
  const entries = await readdir(rootPath, { withFileTypes: true });
  const filePaths = [];

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      filePaths.push(...(await walkFiles(entryPath)));
      continue;
    }

    if (CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      filePaths.push(entryPath);
    }
  }

  return filePaths;
}

async function collectFiles(projectRoot, roots) {
  const results = [];
  for (const root of roots) {
    const absoluteRoot = path.resolve(projectRoot, root);
    if (!(await pathExists(absoluteRoot))) {
      continue;
    }
    const stats = await stat(absoluteRoot);
    if (stats.isDirectory()) {
      results.push(...(await walkFiles(absoluteRoot)));
      continue;
    }
    if (stats.isFile() && CODE_EXTENSIONS.has(path.extname(absoluteRoot).toLowerCase())) {
      results.push(absoluteRoot);
    }
  }
  return results;
}

async function collectMatches(filePaths) {
  const fileMatches = new Map();
  const uniqueUrls = new Set();

  for (const filePath of filePaths) {
    const content = await readFile(filePath, "utf8");
    const matches = content.match(FIGMA_URL_RE);
    if (!matches || matches.length === 0) {
      continue;
    }
    const deduped = [...new Set(matches)];
    fileMatches.set(filePath, { content, matches: deduped });
    for (const url of deduped) {
      uniqueUrls.add(url);
    }
  }

  return { fileMatches, uniqueUrls: [...uniqueUrls] };
}

async function downloadAsset(url, outputDir, dryRun) {
  const outputEntries = await readdir(outputDir, { withFileTypes: true }).catch(() => []);
  const assetPrefix = `${buildFileName(url, "").replace(/\.$/, "")}`;
  const existingEntry = outputEntries.find(
    (entry) => entry.isFile() && entry.name.startsWith(assetPrefix),
  );

  if (!dryRun && existingEntry) {
    const existingPath = path.join(outputDir, existingEntry.name);
    return {
      localPath: toPublicUrl(existingPath),
      status: "reused",
      url,
    };
  }

  if (dryRun) {
    const initialName = buildFileName(url, ".bin");
    const initialPath = path.join(outputDir, initialName);
    return {
      localPath: toPublicUrl(initialPath),
      status: "planned",
      url,
    };
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = inferExtension(response.headers.get("content-type"), url);
  const finalName = buildFileName(url, extension);
  const finalPath = path.join(outputDir, finalName);

  if (!(await pathExists(finalPath))) {
    await writeFile(finalPath, buffer);
  }

  return {
    localPath: toPublicUrl(finalPath),
    status: "downloaded",
    url,
  };
}

function toPublicUrl(targetPath) {
  const publicRoot = path.resolve(process.cwd(), "public");
  const relativePath = path.relative(publicRoot, targetPath);
  if (relativePath.startsWith("..")) {
    throw new Error(`Output path must stay inside public/: ${targetPath}`);
  }
  return `/${toPosixPath(relativePath)}`;
}

async function main() {
  const projectRoot = process.cwd();
  const { dryRun, outDir, roots } = parseArgs(process.argv.slice(2));
  const outputDir = path.resolve(projectRoot, outDir);

  if (!dryRun) {
    await mkdir(outputDir, { recursive: true });
  }

  const files = await collectFiles(projectRoot, roots);
  const { fileMatches, uniqueUrls } = await collectMatches(files);

  if (uniqueUrls.length === 0) {
    console.log("No Figma asset URLs found.");
    return;
  }

  const downloadMap = new Map();
  for (const url of uniqueUrls) {
    const result = await downloadAsset(url, outputDir, dryRun);
    downloadMap.set(url, result.localPath);
  }

  let updatedFileCount = 0;
  for (const [filePath, { content, matches }] of fileMatches.entries()) {
    let nextContent = content;
    for (const url of matches) {
      nextContent = nextContent.split(url).join(downloadMap.get(url));
    }

    if (nextContent !== content) {
      updatedFileCount += 1;
      if (!dryRun) {
        await writeFile(filePath, nextContent, "utf8");
      }
    }
  }

  console.log(`${dryRun ? "Dry run complete" : "Localization complete"}.`);
  console.log(`Scanned files: ${files.length}`);
  console.log(`Matched Figma URLs: ${uniqueUrls.length}`);
  console.log(`Updated files: ${updatedFileCount}`);
  console.log(`Asset output dir: ${toPosixPath(path.relative(projectRoot, outputDir))}`);

  for (const url of uniqueUrls) {
    console.log(`${url} -> ${downloadMap.get(url)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
