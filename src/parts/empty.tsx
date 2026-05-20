import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuEmptyProps {
  className?: string;
  children?: React.ReactNode;
}

export function CommandMenuEmpty({
  className,
  children,
}: CommandMenuEmptyProps) {
  return (
    <div className={cn("cmdk-empty", className)} data-cmdk-empty>
      {children ?? "No results"}
    </div>
  );
}

CommandMenuEmpty.displayName = "CommandMenu.Empty";
