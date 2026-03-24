'use client';

import dynamic from 'next/dynamic';

const ProposalLayoutEditor = dynamic(
  () => import('@/features/proposal-layout-editor/ProposalLayoutEditor'),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fcfbf8_0%,#f2eee8_100%)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/70 bg-white/88 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Loading
          </p>
          <h1 className="m-0 mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-950">
            Preparing the custom widget canvas
          </h1>
          <p className="m-0 mt-3 text-[14px] leading-6 text-slate-500">
            The `tldraw` canvas is loading on the client so the custom widget editor
            can start without blocking the rest of the app.
          </p>
        </div>
      </main>
    ),
  }
);

export default function ProposalLayoutEditorPage() {
  return <ProposalLayoutEditor />;
}
