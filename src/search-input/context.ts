import * as React from "react";

export type SearchInputStatus =
  | "idle"
  | "submitted"
  | "streaming"
  | "error";

export interface SearchInputMessage {
  query: string;
  scope?: string;
}

export interface SearchInputContextValue {
  query: string;
  setQuery: (q: string) => void;
  committedQuery: string;
  status: SearchInputStatus;
  label: string;
  collapsible: boolean;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  resultsOpen: boolean;
  setResultsOpen: (o: boolean) => void;
  scope: string | undefined;
  setScope: (s: string) => void;
  /** Imperative submit — same path as Enter/Submit click. */
  submit: () => void;
  /** Used by Results to discover the input's id for aria-controls. */
  inputId: string;
  /** Used by Input to discover the popup's id for aria-controls. */
  popupId: string;
}

export const SearchInputContext =
  React.createContext<SearchInputContextValue | null>(null);

export function useSearchInput(): SearchInputContextValue {
  const ctx = React.useContext(SearchInputContext);
  if (!ctx) {
    throw new Error(
      "SearchInput parts must be used inside <SearchInput.Root>",
    );
  }
  return ctx;
}

export function isInFlight(status: SearchInputStatus): boolean {
  return status === "submitted" || status === "streaming";
}
