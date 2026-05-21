import * as React from "react";
import { Separator } from "@base-ui/react/separator";
import { cn } from "../lib/cn";

export interface CommandMenuSeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function CommandMenuSeparator({
  className,
  orientation = "horizontal",
}: CommandMenuSeparatorProps) {
  return (
    <Separator
      data-slot="command-menu-separator"
      orientation={orientation}
      className={cn("cmdk-separator", className)}
    />
  );
}

CommandMenuSeparator.displayName = "CommandMenu.Separator";
