// src/internal/command-core/empty.tsx
import * as React from "react";
import { useCommandCore } from "./hooks";

export interface CommandCoreEmptyProps {
  className?: string;
  "data-slot"?: string;
  alwaysRender?: boolean;
  children?: React.ReactNode;
  /** Override the query used for the `query.length > 0` check. When
   * omitted, falls back to the CommandCore-internal filter query.
   * SearchInput passes its own `query` here so Empty visibility is
   * driven by what the user has typed. */
  query?: string;
}

export function CommandCoreEmpty({
  className,
  "data-slot": dataSlot = "command-core-empty",
  alwaysRender = false,
  children,
  query: queryProp,
}: CommandCoreEmptyProps) {
  const { query: coreQuery, matchCount } = useCommandCore();
  const query = queryProp !== undefined ? queryProp : coreQuery;
  // Render as a permanent popup-content child toggled by `hidden` rather
  // than conditionally returning null. Keeps the element mounted so screen
  // readers traversing the popup see consistent structure across
  // empty/non-empty transitions, and avoids thrashing the matchSet
  // registration effect on visibility flips.
  const visible = alwaysRender || (query.length > 0 && matchCount === 0);
  return (
    <div data-slot={dataSlot} className={className} hidden={!visible}>
      {children ?? "No results"}
    </div>
  );
}

CommandCoreEmpty.displayName = "CommandCore.Empty";
