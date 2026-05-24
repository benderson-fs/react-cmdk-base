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
