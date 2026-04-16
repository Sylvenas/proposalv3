import Link from 'next/link';

const pages = [
  {
    href: '/proposal-v3-responsive',
    title: 'Proposal V3 (Responsive)',
    description:
      'A fully responsive Options selection page built from the Figma design system. Layout adapts across XS/S/M/L/XL/XXL breakpoints with Low Density (mobile) and Medium Density (tablet+) spacing modes.',
  },
  {
    href: '/proposal-future-blueprint',
    title: 'Proposal Future Blueprint',
    description:
      'A future-facing blueprint page that outlines the proposal direction and goals for the next one to two years.',
  },
  {
    href: '/proposal-v3',
    title: 'Proposal V3',
    description:
      'An isolated copy of the proposal future blueprint page for independent edits without affecting the original prototype.',
  },
  {
    href: '/proposal-fence',
    title: 'Proposals V3 - Grand Rapids Fence',
    description:
      'A full copy of Proposal V3 for independent iteration on the fence proposal flow.',
  },
  {
    href: '/proposal-fence-mobile',
    title: 'Proposals V3 - Grand Rapids Fence (Mobile)',
    description:
      'A mobile-optimized version of the Grand Rapids Fence proposal flow, featuring pinch-to-zoom drawings, accordion inspection report, Apple-style side-by-side option comparison, and a slide-up sign sheet.',
  },
  {
    href: '/proposal-foundation',
    title: 'Proposals V3 - Bosterra Foundation Repair',
    description:
      'A full copy of the proposal flow adapted for Bosterra, Inc. foundation repair services.',
  },
  {
    href: '/proposal-html-render',
    title: 'Proposal HTML Render',
    description:
      'An updated proposal experience that keeps the existing structure but renders the PDF area using HTML.',
  },
  {
    href: '/homeowner-site-proposal-builder',
    title: 'Homeowner Site Proposal Builder',
    description:
      'Build the overall layout and content of a homeowner proposal site through drag-and-drop widgets, similar to assembling a personalized campaign page.',
  },
  {
    href: '/custom-widget',
    title: 'Custom Widget',
    description:
      'A tldraw-based infinite canvas for composing custom widgets with text, images, shapes, lines, and server-driven placeholder modules.',
  },
  {
    href: '/initial-draft',
    title: 'Initial Draft',
    description:
      'The first draft version of the proposal experience, preserved as the earliest prototype.',
  },
  {
    href: '/blocknote-multi-column',
    title: 'BlockNote Multi-Column',
    description:
      'A BlockNote rich-text editor demo showcasing multi-column block layouts using @blocknote/xl-multi-column.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8 text-[color:var(--arc-ink)] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[color:var(--arc-border)] pb-5">
          <p className="m-0 text-[12px] tracking-[0.16em] text-[color:var(--arc-muted)]">
            Project Navigation
          </p>
          <h1 className="m-0 mt-2 text-[1.8rem] font-semibold tracking-[-0.04em]">
            Proposal Prototype Pages
          </h1>
          <p className="m-0 mt-2 max-w-3xl text-[14px] leading-6 text-[color:var(--arc-muted)]">
            Use this page as the index for all current prototype routes. Each card
            includes a short description and a direct link.
          </p>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              target="_blank"
              className="group rounded-lg border border-[color:var(--arc-border)] bg-white px-4 py-4 transition hover:border-[color:var(--arc-orange)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[1.05rem] font-semibold tracking-[-0.02em] text-[color:var(--arc-ink)]">
                    {page.title}
                  </h2>
                  <p className="m-0 mt-2 text-[13px] leading-6 text-[color:var(--arc-muted)]">
                    {page.description}
                  </p>
                </div>
                <span className="mt-0.5 text-[13px] text-[color:var(--arc-orange)] transition group-hover:translate-x-0.5">
                  Open
                </span>
              </div>

              <div className="mt-3 border-t border-[color:var(--arc-border)] pt-3 text-[12px] text-[color:var(--arc-muted)]">
                {page.href}
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
