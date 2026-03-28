"use client";

import dynamic from "next/dynamic";

const BlockNoteMultiColumn = dynamic(
  () => import("@/views/blocknote-multi-column/BlockNoteMultiColumn"),
  { ssr: false },
);

export default function BlockNoteMultiColumnPage() {
  return (
    <div className="min-h-screen bg-white">
      <BlockNoteMultiColumn />
    </div>
  );
}
