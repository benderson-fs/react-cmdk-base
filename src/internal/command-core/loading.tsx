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
  // No role="progressbar": Loading lives inside the listbox, where only
  // option/group/separator roles are valid per WAI-ARIA. Status changes
  // are announced via SearchInput.Root's aria-live region.
  return (
    <div
      data-slot={dataSlot}
      aria-label={label ?? "Loading"}
      className={className}
    >
      {children}
    </div>
  );
}

CommandCoreLoading.displayName = "CommandCore.Loading";
