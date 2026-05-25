import * as React from "react";
import { CommandCoreFreeSearch } from "../internal/command-core";

export interface SearchInputFreeSearchProps {
  label?: string;
  onSelect?: (query: string) => void;
}

/**
 * Free-search row that appears at the bottom of the results popup with
 * text "Search for &quot;{query}&quot;". When clicked, fires `onSelect(query)`
 * with the LIVE query (v0.12: filter-as-you-type model). Consumers using
 * this row to navigate to an external search must snapshot the query
 * themselves at click/Enter time.
 *
 * (Pre-0.12 the row fired with `committedQuery`. The v0.12 redesign drops
 * the submit-only filter model — see CHANGELOG 0.12.0 → FreeSearch flip.)
 *
 * @example
 * ```tsx
 * <SearchInput.FreeSearch onSelect={(q) => navigate(`/search?q=${q}`)} />
 * ```
 */
export function SearchInputFreeSearch(props: SearchInputFreeSearchProps) {
  return (
    <CommandCoreFreeSearch
      {...props}
      itemDataSlot="search-input-item"
      className="si-item"
    />
  );
}

SearchInputFreeSearch.displayName = "SearchInput.FreeSearch";
