import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuLoadingProps {
  /** When true, the component renders. Defaults to true so consumers can
   * conditionally render the whole element if they prefer. */
  loading?: boolean;
  /** Optional accessible label, applied as `aria-label`. */
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CommandMenuLoading({
  loading = true,
  label,
  className,
  children,
}: CommandMenuLoadingProps) {
  if (!loading) return null;
  return (
    <div
      role="progressbar"
      aria-label={label}
      className={cn("cmdk-loading", className)}
    >
      {children}
    </div>
  );
}

CommandMenuLoading.displayName = "CommandMenu.Loading";
