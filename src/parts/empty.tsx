import * as React from "react";
import { cn } from "../lib/cn";
import { useCommandMenu } from "../hooks/use-command-menu";

export interface CommandMenuEmptyProps {
  className?: string;
  children?: React.ReactNode;
  /**
   * When true, render regardless of match state. Useful for placeholder
   * content. Defaults to false: Empty only renders when the query is
   * non-empty and no items match.
   */
  alwaysRender?: boolean;
}

export function CommandMenuEmpty({
  className,
  children,
  alwaysRender = false,
}: CommandMenuEmptyProps) {
  const { query, matchCount } = useCommandMenu();
  if (!alwaysRender && (query.length === 0 || matchCount > 0)) return null;
  return (
    <div className={cn("cmdk-empty", className)} data-cmdk-empty>
      {children ?? "No results"}
    </div>
  );
}

CommandMenuEmpty.displayName = "CommandMenu.Empty";
