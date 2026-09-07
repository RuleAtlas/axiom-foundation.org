import { describe, expect, it, vi } from "vitest";

// Synthetic gated ("xg") and unlisted ("xu") families: with every real
// family public, the gates have no live instance to test against.
vi.mock("@/lib/axiom/rulespec-families", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/axiom/rulespec-families")>();
  return {
    ...actual,
    RULESPEC_FAMILIES: Object.freeze([
      ...actual.RULESPEC_FAMILIES,
      { slug: "xg", repo: "rulespec-xg", appVisibility: "experimental" },
      { slug: "xu", repo: "rulespec-xu", appVisibility: "unlisted" },
    ]),
  };
});
vi.mock("@/lib/axiom/jurisdictions-seed", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/axiom/jurisdictions-seed")>();
  return {
    ...actual,
    JURISDICTIONS_SEED: [
      ...actual.JURISDICTIONS_SEED,
      { slug: "xg", label: "Xgated", hasCitationPaths: true },
      { slug: "xu", label: "Xunlisted", hasCitationPaths: true },
    ],
  };
});

import { getLandingJurisdictions } from "@/lib/axiom/landing-jurisdictions";
import { parseAppVisibility } from "@/lib/axiom/registry-visibility";
import {
  RULESPEC_COUNTRY_SLUGS,
  RULESPEC_PRESENTED_COUNTRY_SLUGS,
  RULESPEC_REPOS,
  getRuleSpecRepoLocation,
  isAppReadableJurisdiction,
  isListedJurisdiction,
  isRuleSpecRepoInAppReadList,
} from "@/lib/axiom/repo-map";
import {
  isGatedJurisdiction,
  isUnlistedJurisdiction,
  withoutGatedRows,
  withoutUnlistedRows,
} from "@/lib/axiom/rulespec/index-visibility";

describe("the three visibility states", () => {
  it("parses the registry marker for each, defaulting to public", () => {
    expect(parseAppVisibility('[registry]\napp_visibility = "unlisted"\n')).toBe(
      "unlisted"
    );
    expect(
      parseAppVisibility('[registry]\napp_visibility = "experimental"\n')
    ).toBe("experimental");
    expect(parseAppVisibility('[registry]\napp_visibility = "public"\n')).toBe(
      "public"
    );
    expect(parseAppVisibility('[registry]\napp_visibility = "secret"\n')).toBe(
      "public"
    );
    expect(parseAppVisibility(null)).toBe("public");
  });

  it("reads public and unlisted families, never a gated one", () => {
    expect(isAppReadableJurisdiction("il")).toBe(true);
    expect(isAppReadableJurisdiction("xu")).toBe(true);
    expect(isAppReadableJurisdiction("xu-north")).toBe(true);
    expect(isAppReadableJurisdiction("xg")).toBe(false);
    expect(isRuleSpecRepoInAppReadList("rulespec-xu")).toBe(true);
    expect(isRuleSpecRepoInAppReadList("rulespec-xg")).toBe(false);
    expect(getRuleSpecRepoLocation("xu")).toEqual({ repo: "rulespec-xu", prefix: "xu" });
    expect(getRuleSpecRepoLocation("xg")).toBeNull();
  });

  it("lists and presents public families only", () => {
    expect(isListedJurisdiction("il")).toBe(true);
    expect(isListedJurisdiction("xu")).toBe(false);
    expect(isListedJurisdiction("xg")).toBe(false);
    // The listed (read-index) set is public only; the presented set adds
    // the pending pilots but never an unlisted family.
    expect(RULESPEC_REPOS).toContain("rulespec-il");
    expect(RULESPEC_REPOS).not.toContain("rulespec-xu");
    expect(RULESPEC_REPOS).not.toContain("rulespec-xg");
    expect(RULESPEC_COUNTRY_SLUGS).toEqual(expect.arrayContaining(["il", "xg", "xu"]));
    expect(RULESPEC_PRESENTED_COUNTRY_SLUGS).toContain("il");
    expect(RULESPEC_PRESENTED_COUNTRY_SLUGS).toContain("xg");
    expect(RULESPEC_PRESENTED_COUNTRY_SLUGS).not.toContain("xu");
  });

  it("keeps an unlisted family off the landing while a pending pilot stays on it", () => {
    const slugs = getLandingJurisdictions().map((j) => j.slug);
    expect(slugs).toContain("il");
    expect(slugs).toContain("xg");
    expect(slugs).not.toContain("xu");
  });

  it("drops unlisted rows from listing surfaces and gated rows from every read", () => {
    const rows = [
      { citation_path: "il/statute/income-tax-ordinance/section-121" },
      { citation_path: "xu/statute/act/section-1" },
      { citation_path: "xg/statute/act/section-1" },
      { citation_path: "us-il/statute/x/section-1" },
    ];
    expect(isUnlistedJurisdiction("xu")).toBe(true);
    expect(isUnlistedJurisdiction("il")).toBe(false);
    expect(isGatedJurisdiction("xg")).toBe(true);
    expect(isGatedJurisdiction("xu")).toBe(false);
    expect(withoutGatedRows(rows, (r) => r.citation_path).map((r) => r.citation_path)).toEqual([
      "il/statute/income-tax-ordinance/section-121",
      "xu/statute/act/section-1",
      "us-il/statute/x/section-1",
    ]);
    expect(
      withoutUnlistedRows(rows, (r) => r.citation_path).map((r) => r.citation_path)
    ).toEqual([
      "il/statute/income-tax-ordinance/section-121",
      "xg/statute/act/section-1",
      "us-il/statute/x/section-1",
    ]);
  });
});
