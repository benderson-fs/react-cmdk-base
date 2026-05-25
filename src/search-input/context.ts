import * as React from "react";

export type SearchInputStatus =
  | "idle"
  | "submitted"
  | "streaming"
  | "error";

export type SearchInputMode = "live" | "submit";

export interface SearchInputMessage {
  query: string;
  scope: string | undefined;
  selectedValue: string | null;
}

export interface SearchInputContextValue {
  query: string;
  setQuery: (q: string) => void;
  status: SearchInputStatus;
  label: string;
  mode: SearchInputMode;
  collapsible: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  resultsOpen: boolean;
  setResultsOpen: (open: boolean) => void;
  scope: string | undefined;
  setScope: (scope: string) => void;
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  highlighted: string | undefined;
  /** Imperative submit — same path as Enter/Submit click. */
  submit: () => void;
  /** Used by Results to discover the input's id for aria-controls. */
  inputId: string;
  /** Used by Input to discover the popup's id for aria-controls. */
  popupId: string;
  /** Form element ref — used by Results to anchor its popover to the form. */
  formRef: React.RefObject<HTMLFormElement | null>;
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

export interface SearchInputModalContextValue {
  modal: boolean;
  setModal: (m: boolean) => void;
}

export const SearchInputModalContext =
  React.createContext<SearchInputModalContextValue | null>(null);
