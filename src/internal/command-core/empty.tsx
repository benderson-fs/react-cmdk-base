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
  // Render as a permanent listbox child toggled by `hidden` rather than
  // conditionally returning null. Keeps the element in the listbox DOM so
  // screen readers traversing the list see consistent structure, and avoids
  // thrashing the registration effect on visibility transitions.
  const visible = alwaysRender || (query.length > 0 && matchCount === 0);
  return (
    <div data-slot={dataSlot} className={className} hidden={!visible}>
      {children ?? "No results"}
    </div>
  );
}

CommandCoreEmpty.displayName = "CommandCore.Empty";
