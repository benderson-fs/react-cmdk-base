import * as React from "react";
import {
  CommandCoreItem,
  type CommandCoreItemProps,
} from "../internal/command-core";
import { cn } from "../lib/cn";

export interface CommandMenuItemProps
  extends Omit<CommandCoreItemProps, "data-slot"> {}

export function CommandMenuItem({
  className,
  iconClassName,
  labelClassName,
  trailClassName,
  ...props
}: CommandMenuItemProps) {
  return (
    <CommandCoreItem
      {...props}
      data-slot="command-menu-item"
      className={cn("cmdk-item", className)}
      iconClassName={cn("cmdk-item-icon", iconClassName)}
      labelClassName={cn("cmdk-item-label", labelClassName)}
      trailClassName={cn("cmdk-item-trail", trailClassName)}
    />
  );
}

CommandMenuItem.displayName = "CommandMenu.Item";
