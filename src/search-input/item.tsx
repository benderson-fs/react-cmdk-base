import * as React from "react";
import {
  CommandCoreItem,
  type CommandCoreItemProps,
} from "../internal/command-core";
import { cn } from "../lib/cn";

export interface SearchInputItemProps
  extends Omit<CommandCoreItemProps, "data-slot"> {}

export function SearchInputItem({
  className,
  ...props
}: SearchInputItemProps) {
  return (
    <CommandCoreItem
      {...props}
      data-slot="search-input-item"
      className={cn("si-item", className)}
    />
  );
}

SearchInputItem.displayName = "SearchInput.Item";
