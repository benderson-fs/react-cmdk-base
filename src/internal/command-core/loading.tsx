// src/internal/command-core/loading.tsx
import * as React from "react";

export interface CommandCoreLoadingProps {
  loading?: boolean;
  label?: string;
  className?: string;
  "data-slot"?: string;
  children?: React.ReactNode;
}

export function CommandCoreLoading({
  loading = true,
  label,
  className,
  "data-slot": dataSlot = "command-core-loading",
  children,
}: CommandCoreLoadingProps) {
  if (!loading) return null;
  return (
    <div
      data-slot={dataSlot}
      role="progressbar"
      aria-label={label ?? "Loading"}
      className={className}
    >
      {children}
    </div>
  );
}

CommandCoreLoading.displayName = "CommandCore.Loading";
