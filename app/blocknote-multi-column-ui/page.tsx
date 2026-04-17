"use client";

import dynamic from "next/dynamic";

const BlockNoteMultiColumnUI = dynamic(
  () => import("@/views/blocknote-multi-column-ui/BlockNoteMultiColumnUI"),
  { ssr: false },
);

export default function BlockNoteMultiColumnUIPage() {
  return (
    <div className="min-h-screen bg-white">
      <BlockNoteMultiColumnUI />
    </div>
  );
}
