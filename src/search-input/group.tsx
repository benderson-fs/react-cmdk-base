import * as React from "react";
import { CommandCoreGroup } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface SearchInputGroupProps {
  heading?: string;
  className?: string;
  children: React.ReactNode;
}

export function SearchInputGroup({
  heading,
  className,
  children,
}: SearchInputGroupProps) {
  return (
    <CommandCoreGroup
      heading={heading}
      data-slot="search-input-group"
      className={cn("si-group", className)}
      headingClassName="si-group-label"
    >
      {children}
    </CommandCoreGroup>
  );
}

SearchInputGroup.displayName = "SearchInput.Group";
