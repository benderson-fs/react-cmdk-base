import * as React from "react";
import { CommandCoreLoading } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface SearchInputLoadingProps {
  loading?: boolean;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SearchInputLoading({
  loading = true,
  label,
  className,
  children,
}: SearchInputLoadingProps) {
  return (
    <CommandCoreLoading
      loading={loading}
      label={label}
      data-slot="search-input-loading"
      className={cn("si-loading", className)}
    >
      {children}
    </CommandCoreLoading>
  );
}

SearchInputLoading.displayName = "SearchInput.Loading";
