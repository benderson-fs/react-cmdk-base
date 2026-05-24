import * as React from "react";
import { CommandCoreEmpty } from "../internal/command-core";
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
  return (
    <CommandCoreEmpty
      data-slot="search-input-empty"
      className={cn("si-empty", className)}
      alwaysRender={alwaysRender}
    >
      {children}
    </CommandCoreEmpty>
  );
}

SearchInputEmpty.displayName = "SearchInput.Empty";
