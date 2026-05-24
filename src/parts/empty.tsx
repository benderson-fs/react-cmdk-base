import * as React from "react";
import { CommandCoreEmpty } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface CommandMenuEmptyProps {
  className?: string;
  children?: React.ReactNode;
  alwaysRender?: boolean;
}

export function CommandMenuEmpty({
  className,
  children,
  alwaysRender = false,
}: CommandMenuEmptyProps) {
  return (
    <CommandCoreEmpty
      data-slot="command-menu-empty"
      className={cn("cmdk-empty", className)}
      alwaysRender={alwaysRender}
    >
      {children}
    </CommandCoreEmpty>
  );
}

CommandMenuEmpty.displayName = "CommandMenu.Empty";
