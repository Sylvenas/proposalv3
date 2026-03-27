"use client";

import { useState } from "react";

export function UploadScreen({
  onUpload,
  error,
}: {
  onUpload: (file: File) => Promise<void>;
  error?: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      await onUpload(file);
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#faf8f4] px-6"
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="w-full max-w-[720px] rounded-2xl bg-white p-10 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-[#8b7355]">
            DATA SOURCE
          </p>
          <h1 className="text-[36px] font-semibold leading-tight text-[#262626]">
            Upload Proposal Demo Package
          </h1>
          <p className="text-[15px] leading-7 text-[#5f5f5f]">
            Upload a `.zip` package that contains one Excel file and one `images/`
            folder. The Excel provides proposal copy, pricing, and product rows.
            Image columns should reference files inside the package by name.
          </p>
        </div>

        <label className="mt-10 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#c8b79e] bg-[#fcfaf6] px-8 py-14 text-center transition hover:border-[#8b7355] hover:bg-[#f8f3ea]">
          <span className="text-[18px] font-semibold text-[#262626]">
            {isLoading ? "Parsing package..." : "Choose .zip file"}
          </span>
          <span className="mt-2 text-[14px] text-[#6f6f6f]">
            Current session only. Re-upload to replace the demo data.
          </span>
          <input
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>

        {error ? (
          <div className="mt-6 rounded-lg border border-[#e0b4b4] bg-[#fff5f5] px-4 py-3 text-[14px] leading-6 text-[#9f3a38]">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
