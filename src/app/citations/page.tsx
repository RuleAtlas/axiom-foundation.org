import type { Metadata } from "next";
import { ArrowRightIcon } from "@/components/icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";
import {
  CITATIONS,
  formatCitationDate,
  groupedCitations,
} from "@/lib/citations";

export const metadata: Metadata = {
  title: "Citations — Axiom Foundation",
  description:
    "Who builds on Axiom: the papers, reports, products, and datasets that use or cite the corpus, the RuleSpec encodings, and the engine.",
};

const CITATIONS_SOURCE_URL =
  "https://github.com/TheAxiomFoundation/axiom.org/blob/master/src/lib/citations.ts";

export default function CitationsPage() {
  const groups = groupedCitations(CITATIONS);

  return (
    <div className="relative z-1 pt-32 pb-24 px-8">
      <div className="max-w-[1080px] mx-auto">
        <Reveal className="mb-16 max-w-[760px]">
          <span className="kicker mb-6 inline-flex">
            <span className="kicker-mark">&sect;</span>
            Citations &middot; In the wild
          </span>
          <h1 className="heading-page mb-6 mt-2">Who builds on Axiom</h1>
          <p className="font-body text-[1.2rem] text-[var(--color-ink-secondary)] leading-relaxed text-pretty">
            Open law is only useful once someone builds on it. This is the
            running list of work that does &mdash; papers, reports, products,
            and datasets that use or cite the corpus, the RuleSpec encodings,
            or the engine. Every entry links to where the reference appears.
          </p>
        </Reveal>

        {groups.map((group) => (
          <Reveal key={group.kind} as="section" className="mb-20">
            <h2 className="m-0 mb-8 font-display text-[1.35rem] font-light tracking-[0.02em] text-[var(--color-ink)]">
              <span
                aria-hidden
                className="mb-3 block h-px w-7 bg-[var(--color-accent)]"
              />
              {group.label}
            </h2>
            <RevealGroup
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              staggerChildren={0.08}
            >
              {group.entries.map((entry) => (
                <RevealItem
                  key={entry.id}
                  as="div"
                  className="card-edition citation-card p-6 flex flex-col transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[var(--color-ink-muted)] mb-3">
                    {entry.by} &middot;{" "}
                    <time dateTime={entry.date}>
                      {formatCitationDate(entry.date)}
                    </time>
                  </span>
                  <h3 className="font-body text-[1.05rem] font-medium text-[var(--color-ink)] mb-2 leading-snug">
                    {entry.title}
                  </h3>
                  <p className="font-body text-[0.88rem] text-[var(--color-ink-secondary)] leading-relaxed mb-5">
                    {entry.uses}
                  </p>
                  <a
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.14em] uppercase text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors no-underline"
                  >
                    See the reference
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>
        ))}

        <Reveal className="mb-20 border-t border-[var(--color-rule)] pt-12 max-w-[760px]">
          <h2 className="m-0 mb-4 font-display text-[1.35rem] font-light tracking-[0.02em] text-[var(--color-ink)]">
            <span
              aria-hidden
              className="mb-3 block h-px w-7 bg-[var(--color-accent)]"
            />
            Missing one?
          </h2>
          <p className="font-body text-[1rem] leading-relaxed text-[var(--color-ink-secondary)] mb-5">
            The list is a file in the site&apos;s repository. If you have
            built on Axiom or cited it, add your entry with a link to where
            the reference appears &mdash; that link is the whole criterion.
          </p>
          <a
            href={CITATIONS_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[0.75rem] tracking-[0.12em] uppercase text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors no-underline"
          >
            Add a citation on GitHub
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </div>
  );
}
