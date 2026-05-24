import * as React from "react";
import { CommandCoreGroup } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface CommandMenuGroupProps {
  heading?: string;
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuGroup({
  heading,
  className,
  children,
}: CommandMenuGroupProps) {
  return (
    <CommandCoreGroup
      heading={heading}
      data-slot="command-menu-group"
      className={cn("cmdk-group", className)}
      headingClassName="cmdk-group-label"
    >
      {children}
    </CommandCoreGroup>
  );
}

CommandMenuGroup.displayName = "CommandMenu.Group";
