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
 * `SearchInputModalContext`. Base UI runs FloatingFocusManager in modal
 * mode, which aria-hides + inerts everything outside the popup —
 * INCLUDING the surrounding `<form>`. The input retains real DOM focus
 * via aria-activedescendant, but the form's Submit button is NOT
 * interactive while the modal panel is open. To act on the form, dismiss
 * the panel first (Escape, click on the backdrop, or select an item).
 *
 * The visual dim is provided by `<Combobox.Backdrop>`; page scroll is
 * not locked.
 */
export const SearchInputResultsModal = React.forwardRef<
  HTMLDivElement,
  SearchInputResultsModalProps
>(function SearchInputResultsModal(props, ref) {
  return <SearchInputResultsShell ref={ref} variant="modal" {...props} />;
});

SearchInputResultsModal.displayName = "SearchInput.ResultsModal";
