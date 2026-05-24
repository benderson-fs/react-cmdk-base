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
  // Always mount the element and toggle visibility via `hidden`, so the
  // aria-live="polite" region can announce the "had results → none"
  // transition. If we conditionally returned null, the live region would
  // unmount before the announcement could fire.
  const visible = alwaysRender || (query.length > 0 && matchCount === 0);
  return (
    <div
      data-slot={dataSlot}
      className={className}
      hidden={!visible}
      role="status"
      aria-live="polite"
    >
      {children ?? "No results"}
    </div>
  );
}

CommandCoreEmpty.displayName = "CommandCore.Empty";
