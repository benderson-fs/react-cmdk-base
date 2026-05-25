import * as React from "react";
import { CommandCoreEmpty } from "../internal/command-core";
import { useSearchInput } from "./context";
import { cn } from "../lib/cn";

export interface SearchInputEmptyProps {
  className?: string;
  alwaysRender?: boolean;
  children?: React.ReactNode;
}

export function SearchInputEmpty({
  className,
  alwaysRender = false,
  children,
}: SearchInputEmptyProps) {
  const ctx = useSearchInput();
  return (
    <CommandCoreEmpty
      data-slot="search-input-empty"
      className={cn("si-empty", className)}
      alwaysRender={alwaysRender}
      // Pass the SearchInput's live query so Empty visibility is driven
      // by what the user has typed, not the CommandCore-internal filter query.
      query={ctx.query}
    >
      {children}
    </CommandCoreEmpty>
  );
}

SearchInputEmpty.displayName = "SearchInput.Empty";
