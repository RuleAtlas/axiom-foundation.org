/**
 * App-surface visibility for rulespec-* repos.
 *
 * A rulespec repo may declare `.axiom/registry.toml`:
 *
 *   [registry]
 *   app_visibility = "experimental"
 *
 * Repos marked experimental are excluded from public app surfaces (the
 * encoded-search index sync, the runtime encoded-search fallback, and —
 * via the mirrored map in axiom-corpus — navigation encoding badges).
 * An absent file, absent key, or unrecognized value means "public", so
 * established repos need no marker and a fetch hiccup cannot hide a live
 * country. Parsed line-wise (not a full TOML parser) — keep the marker in
 * the simple `app_visibility = "value"` form.
 */
/**
 * ``public``: presented and read. ``unlisted``: read at its URL, presented
 * nowhere -- no landing tile, no chip, no index listing, no search hit,
 * no coverage row. ``experimental``: presented as a pending tile, read by
 * nothing.
 */
export type AppVisibility = "public" | "unlisted" | "experimental";

export function parseAppVisibility(tomlText: string | null): AppVisibility {
  if (!tomlText) return "public";
  for (const line of tomlText.split(/\r?\n/)) {
    const match = line.match(/^\s*app_visibility\s*=\s*"([a-z]+)"\s*(?:#.*)?$/);
    if (match) {
      if (match[1] === "experimental") return "experimental";
      if (match[1] === "unlisted") return "unlisted";
      return "public";
    }
  }
  return "public";
}
