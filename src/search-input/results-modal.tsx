import * as React from "react";
import {
  SearchInputResultsShell,
  type SearchInputResultsShellProps,
} from "./combobox-shell";

export interface SearchInputResultsModalProps
  extends Omit<SearchInputResultsShellProps, "variant"> {}

/**
 * Anchored results panel with a dimmed backdrop. Mounting this variant
 * flips the underlying `Combobox.Root` `modal` prop to `true` via
 * `SearchInputModalContext`, which locks page scroll and disables
 * outside pointer events. The input retains real DOM focus throughout
 * (Combobox uses aria-activedescendant for listbox navigation).
 *
 * Form-internal pointer events (e.g. clicking `<SearchInput.Submit>` or
 * a Picker trigger) remain functional — only outside-the-form pointer
 * events are blocked.
 */
export const SearchInputResultsModal = React.forwardRef<
  HTMLDivElement,
  SearchInputResultsModalProps
>(function SearchInputResultsModal(props, ref) {
  return <SearchInputResultsShell ref={ref} variant="modal" {...props} />;
});

SearchInputResultsModal.displayName = "SearchInput.ResultsModal";
