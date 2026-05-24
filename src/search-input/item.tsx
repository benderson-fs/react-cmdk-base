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
  iconClassName,
  labelClassName,
  trailClassName,
  ...props
}: SearchInputItemProps) {
  return (
    <CommandCoreItem
      {...props}
      data-slot="search-input-item"
      className={cn("si-item", className)}
      iconClassName={cn("si-item-icon", iconClassName)}
      labelClassName={cn("si-item-label", labelClassName)}
      trailClassName={cn("si-item-trail", trailClassName)}
    />
  );
}

SearchInputItem.displayName = "SearchInput.Item";
