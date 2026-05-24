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
  ...props
}: CommandMenuItemProps) {
  return (
    <CommandCoreItem
      {...props}
      data-slot="command-menu-item"
      className={cn("cmdk-item", className)}
    />
  );
}

CommandMenuItem.displayName = "CommandMenu.Item";
