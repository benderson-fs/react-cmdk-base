// src/internal/command-core/empty.tsx
import * as React from "react";
import { useCommandCore } from "./hooks";

export interface CommandCoreEmptyProps {
  className?: string;
  "data-slot"?: string;
  alwaysRender?: boolean;
  children?: React.ReactNode;
}

export function CommandCoreEmpty({
  className,
  "data-slot": dataSlot = "command-core-empty",
  alwaysRender = false,
  children,
}: CommandCoreEmptyProps) {
  const { query, matchCount } = useCommandCore();
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
