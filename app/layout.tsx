import type { Metadata } from 'next';
import { Barlow_Semi_Condensed } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArcSite Proposal',
  description: 'ArcSite Proposal Prototype',
};

const barlowSemiCondensed = Barlow_Semi_Condensed({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-barlow-semi-condensed',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={barlowSemiCondensed.variable}>
      <head>
        {/* Disable browser scroll restoration, reset to top, and whitewash the
            html background before React hydrates. The whitewash is needed because
            the CoverCurtain covers <body> but not the <html> scrollbar-gutter
            region on the right; without this, the gutter briefly shows the default
            cream --arc-paper (#fffdfa) as a thin yellow strip on first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
              window.scrollTo(0, 0);
              document.documentElement.style.background = 'white';
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
