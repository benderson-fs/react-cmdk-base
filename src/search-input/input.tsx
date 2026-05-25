import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useSearchInput, isInFlight } from "./context";
import { cn } from "../lib/cn";

export interface SearchInputInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  placeholder?: string;
}

export const SearchInputInput = React.forwardRef<
  HTMLInputElement,
  SearchInputInputProps
>(function SearchInputInput(
  { placeholder = "Search…", onKeyDown, className, ...props },
  ref,
) {
  const ctx = useSearchInput();

  // Clear `selectedValue` when the user backspaces the input to empty.
  // Typing-after-selection does NOT clear (selectedValue persists across
  // edits); only a transition to empty does. The bridge's
  // onInputValueChange clears the post-selection MUTE; this effect clears
  // the SELECTION itself when the user has effectively retracted it.
  const prevQueryRef = React.useRef(ctx.query);
  React.useEffect(() => {
    const prev = prevQueryRef.current;
    prevQueryRef.current = ctx.query;
    if (prev !== "" && ctx.query === "" && ctx.selectedValue != null) {
      ctx.setSelectedValue(null);
    }
  }, [ctx.query, ctx.selectedValue, ctx.setSelectedValue]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        if (ctx.resultsOpen) {
          e.preventDefault();
          ctx.setResultsOpen(false);
          return;
        }
        if (
          ctx.collapsible &&
          ctx.query.length === 0 &&
          !isInFlight(ctx.status)
        ) {
          e.preventDefault();
          ctx.setCollapsed(true);
          e.currentTarget.blur();
        }
      }
    },
    [onKeyDown, ctx],
  );

  return (
    <Combobox.Input
      ref={ref}
      placeholder={placeholder}
      {...props}
      // These attrs are spread AFTER {...props} so JSX later-wins semantics
      // make the library values authoritative. Consumers cannot reassign
      // them via spread — this is the contract.
      id={ctx.inputId}
      role="combobox"
      aria-expanded={ctx.resultsOpen}
      aria-controls={ctx.popupId}
      aria-haspopup="listbox"
      autoComplete="off"
      data-slot="search-input-input"
      className={cn("si-input", className)}
      value={ctx.query}
      onChange={(e) => ctx.setQuery(e.currentTarget.value)}
      onKeyDown={handleKeyDown}
    />
  );
});

SearchInputInput.displayName = "SearchInput.Input";
