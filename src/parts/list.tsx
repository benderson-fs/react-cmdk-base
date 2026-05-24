import * as React from "react";
import { CommandCoreList } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface CommandMenuListProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuList({
  className,
  children,
}: CommandMenuListProps) {
  return (
    <CommandCoreList
      data-slot="command-menu-list"
      className={cn("cmdk-list", className)}
    >
      {children}
    </CommandCoreList>
  );
}

CommandMenuList.displayName = "CommandMenu.List";
