import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CitationsPage from "./page";
import {
  CITATIONS,
  formatCitationDate,
  groupedCitations,
  sortedCitations,
  type Citation,
} from "@/lib/citations";

type Plain = { children: React.ReactNode; className?: string };
vi.mock("@/components/landing/reveal", () => ({
  Reveal: ({ children, className }: Plain) => (
    <div className={className}>{children}</div>
  ),
  RevealGroup: ({ children, className }: Plain) => (
    <div className={className}>{children}</div>
  ),
  RevealItem: ({ children, className }: Plain) => (
    <div className={className}>{children}</div>
  ),
}));

const SAMPLE: Citation[] = [
  {
    id: "older-paper",
    kind: "paper",
    title: "An older paper",
    by: "Someone",
    date: "2025-11",
    href: "https://example.org/older",
    uses: "Cites the corpus.",
  },
  {
    id: "newer-product",
    kind: "product",
    title: "A newer product",
    by: "A company",
    date: "2026-07-09",
    href: "https://example.org/newer",
    uses: "Runs the engine.",
  },
  {
    id: "newer-paper",
    kind: "paper",
    title: "A newer paper",
    by: "Someone else",
    date: "2026-03",
    href: "https://example.org/newer-paper",
    uses: "Cites the encodings.",
  },
];

describe("citations data", () => {
  it("every curated entry links somewhere and carries a date", () => {
    for (const entry of CITATIONS) {
      expect(entry.href).toMatch(/^https:\/\//);
      expect(entry.date).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
      expect(entry.uses.length).toBeGreaterThan(20);
    }
  });

  it("sorts newest first", () => {
    expect(sortedCitations(SAMPLE).map((c) => c.id)).toEqual([
      "newer-product",
      "newer-paper",
      "older-paper",
    ]);
  });

  it("groups in display order and drops empty kinds", () => {
    const groups = groupedCitations(SAMPLE);
    expect(groups.map((g) => g.label)).toEqual(["Papers", "Products & tools"]);
    expect(groups[0]!.entries.map((c) => c.id)).toEqual([
      "newer-paper",
      "older-paper",
    ]);
  });

  it("formats month-only and full dates", () => {
    expect(formatCitationDate("2026-07")).toBe("July 2026");
    expect(formatCitationDate("2026-07-09")).toBe("9 July 2026");
  });
});

describe("CitationsPage", () => {
  it("renders the header, every curated entry with its link, and the add-yours footer", () => {
    render(<CitationsPage />);
    expect(
      screen.getByRole("heading", { name: "Who builds on Axiom" })
    ).toBeInTheDocument();
    for (const entry of CITATIONS) {
      expect(screen.getByText(entry.title)).toBeInTheDocument();
      const link = screen
        .getByText(entry.title)
        .closest(".citation-card")
        ?.querySelector("a");
      expect(link).toHaveAttribute("href", entry.href);
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
    expect(
      screen.getByRole("link", { name: /add a citation on github/i })
    ).toHaveAttribute(
      "href",
      expect.stringContaining("src/lib/citations.ts")
    );
  });
});
