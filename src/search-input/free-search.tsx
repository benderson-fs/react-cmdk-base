import * as React from "react";
import { CommandCoreFreeSearch } from "../internal/command-core";

export interface SearchInputFreeSearchProps {
  label?: string;
  onSelect?: (query: string) => void;
}

/**
 * Free-search row that appears at the bottom of the results popup with
 * text "Search for &quot;{query}&quot;". When clicked, fires `onSelect(query)`
 * with the LAST-SUBMITTED query (committedQuery), NOT the live typing in
 * the outer input. This matches consumer intent: free-search is for
 * "perform an external search with the query the user submitted."
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
