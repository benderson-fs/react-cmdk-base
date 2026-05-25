import * as React from "react";
import {
  SearchInputResultsShell,
  type SearchInputResultsShellProps,
} from "./combobox-shell";

export interface SearchInputResultsInlineProps
  extends Omit<SearchInputResultsShellProps, "variant"> {}

/**
 * Anchored results panel without a backdrop. The page remains
 * interactive — clicks outside the panel reach their target. Combobox's
 * Escape handling and outside-click logic still close the panel.
 */
export const SearchInputResultsInline = React.forwardRef<
  HTMLDivElement,
  SearchInputResultsInlineProps
>(function SearchInputResultsInline(props, ref) {
  return <SearchInputResultsShell ref={ref} variant="inline" {...props} />;
});

SearchInputResultsInline.displayName = "SearchInput.ResultsInline";
