import Link from 'next/link';

type NavItem = {
  href: string;
  title: string;
  description: string;
};

type NavSection = {
  title: string;
  active: NavItem[];
  archived: NavItem[];
};

const sections: NavSection[] = [
  {
    title: 'Proposals V3',
    active: [
      {
        href: '/proposal-future-blueprint',
        title: 'Proposal Future Blueprint',
        description:
          'A future-facing blueprint page that outlines the proposal direction and goals for the next one to two years.',
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
    ],
    archived: [
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
    ],
  },
  {
    title: 'Template Setup',
    active: [
      {
        href: '/blocknote-multi-column',
        title: 'BlockNote Multi-Column',
        description:
          'A BlockNote rich-text editor demo showcasing multi-column block layouts using @blocknote/xl-multi-column.',
      },
    ],
    archived: [
      {
        href: '/initial-draft',
        title: 'Initial Draft',
        description:
          'The first draft version of the proposal experience, preserved as the earliest prototype.',
      },
    ],
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
            Use this page as the index for all top-level routes.
          </p>
        </header>

        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h1 className="m-0 text-[1.4rem] font-semibold tracking-[-0.03em] text-[color:var(--arc-ink)]">
                {section.title}
              </h1>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {section.active.map((page) => (
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
              </div>

              <h2 className="m-0 mt-6 text-[1rem] font-semibold tracking-[0.02em] text-[color:var(--arc-muted)]">
                Archived
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {section.archived.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    target="_blank"
                    className="group rounded-lg border border-dashed border-[color:var(--arc-border)] bg-white px-4 py-4 transition hover:border-[color:var(--arc-orange)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="m-0 text-[1.05rem] font-semibold tracking-[-0.02em] text-[color:var(--arc-ink)]">
                          {page.title}
                        </h3>
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
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
