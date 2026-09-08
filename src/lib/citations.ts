/**
 * Who builds on Axiom — the curated list behind /citations.
 *
 * Every entry is a real, checkable reference: a paper, report,
 * product, or dataset that uses or cites Axiom's corpus, RuleSpec
 * encodings, or engine. Add one by appending to CITATIONS with the
 * link that shows the reference; the page sorts newest first and
 * groups by kind. No entry without a link — a citation we can't show
 * isn't one.
 */

export type CitationKind = "product" | "paper" | "report" | "dataset";

export interface Citation {
  /** Stable id, used as the React key and the row anchor. */
  id: string;
  kind: CitationKind;
  title: string;
  /** Who made it — an organization or an author list. */
  by: string;
  /** ISO date of publication or first release (YYYY-MM or YYYY-MM-DD). */
  date: string;
  /** Where the reference appears. */
  href: string;
  /** What of Axiom's it uses, in one sentence. */
  uses: string;
}

export const CITATION_KIND_LABELS: Record<CitationKind, string> = {
  product: "Products & tools",
  paper: "Papers",
  report: "Reports",
  dataset: "Datasets",
};

/** Display order of the groups on the page. */
export const CITATION_KIND_ORDER: CitationKind[] = [
  "paper",
  "report",
  "product",
  "dataset",
];

export const CITATIONS: Citation[] = [
  {
    id: "policyengine-snap-payment-error-rates",
    kind: "product",
    title: "SNAP payment error rates and the OBBBA state cost share",
    by: "PolicyEngine",
    date: "2026-07",
    href: "https://github.com/PolicyEngine/snap-payment-error-rates",
    uses:
      "Encodes the statutory cost-share tiers of 7 U.S.C. 2013(a)(2) in RuleSpec and executes them in the browser with Axiom's compiled rules engine, re-deriving every state's band from the encoded law.",
  },
];

/** Entries newest first. */
export function sortedCitations(entries: Citation[] = CITATIONS): Citation[] {
  return entries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** Entries grouped in display order; kinds with no entries are omitted. */
export function groupedCitations(
  entries: Citation[] = CITATIONS
): Array<{ kind: CitationKind; label: string; entries: Citation[] }> {
  const sorted = sortedCitations(entries);
  return CITATION_KIND_ORDER.map((kind) => ({
    kind,
    label: CITATION_KIND_LABELS[kind],
    entries: sorted.filter((c) => c.kind === kind),
  })).filter((group) => group.entries.length > 0);
}

/** "2026-07" → "July 2026"; "2026-07-09" → "9 July 2026". */
export function formatCitationDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const month = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).toLocaleString(
    "en-GB",
    { month: "long", timeZone: "UTC" }
  );
  return d ? `${d} ${month} ${y}` : `${month} ${y}`;
}
