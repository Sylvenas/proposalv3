import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArcSite Proposal',
  description: 'ArcSite Proposal Prototype',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Disable browser scroll restoration and reset to top immediately,
            before React hydrates, so the cover curtain always starts at top. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      {/* overflow:hidden prevents scrollbar flash while CoverCurtain is visible.
          CoverCurtain's cleanup restores overflow when dismissed. */}
      <body style={{ overflow: 'hidden' }}>{children}</body>
    </html>
  );
}
