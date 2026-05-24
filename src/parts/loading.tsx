import * as React from "react";
import { CommandCoreLoading } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface CommandMenuLoadingProps {
  loading?: boolean;
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
  return (
    <CommandCoreLoading
      loading={loading}
      label={label}
      data-slot="command-menu-loading"
      className={cn("cmdk-loading", className)}
    >
      {children}
    </CommandCoreLoading>
  );
}

CommandMenuLoading.displayName = "CommandMenu.Loading";
