import * as React from "react";
import { CommandCoreSeparator } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface SearchInputSeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function SearchInputSeparator({
  className,
  orientation = "horizontal",
}: SearchInputSeparatorProps) {
  return (
    <CommandCoreSeparator
      data-slot="search-input-separator"
      orientation={orientation}
      className={cn("si-separator", className)}
    />
  );
}

SearchInputSeparator.displayName = "SearchInput.Separator";
