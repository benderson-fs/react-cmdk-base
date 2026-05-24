import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useSearchInput } from "./context";
import { isInFlight } from "./context";
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
  { placeholder = "Search…", onKeyDown, className, id, role, ...props },
  ref,
) {
  const ctx = useSearchInput();

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
