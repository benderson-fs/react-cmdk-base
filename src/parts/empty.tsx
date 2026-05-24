import * as React from "react";
import { cn } from "../lib/cn";
import { useCommandMenu } from "../hooks/use-command-menu";

export interface CommandMenuEmptyProps {
  className?: string;
  children?: React.ReactNode;
  /**
   * When true, render visible regardless of match state. Useful for
   * placeholder content. Defaults to false: Empty is mounted at all
   * times (so the live-region announcement works on the "had results →
   * none" transition) but visually hidden via the `hidden` attribute
   * unless the query is non-empty and no items match.
   */
  alwaysRender?: boolean;
}

export function CommandMenuEmpty({
  className,
  children,
  alwaysRender = false,
}: CommandMenuEmptyProps) {
  const { query, matchCount } = useCommandMenu();
  const visible = alwaysRender || (query.length > 0 && matchCount === 0);
  return (
    <div
      data-slot="command-menu-empty"
      className={cn("cmdk-empty", className)}
      data-cmdk-empty
      hidden={!visible}
      role="status"
      aria-live="polite"
    >
      {children ?? "No results"}
    </div>
  );
}

CommandMenuEmpty.displayName = "CommandMenu.Empty";
