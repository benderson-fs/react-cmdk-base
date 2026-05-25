// src/internal/command-core/free-search.tsx
import * as React from "react";
import { CommandCoreItem } from "./item";
import { useCommandCore } from "./hooks";

export interface CommandCoreFreeSearchProps {
  label?: string;
  itemDataSlot?: string;
  className?: string;
  onSelect?: (query: string) => void;
  /** Override the query used for display and onSelect. When omitted, falls
   * back to the CommandCore-internal filter query. SearchInput passes its
   * own `query` prop here so FreeSearch shows the live typed query. */
  query?: string;
}

export function CommandCoreFreeSearch({
  label = "Search for",
  itemDataSlot,
  className,
  onSelect,
  query: queryProp,
}: CommandCoreFreeSearchProps) {
  const { query: coreQuery } = useCommandCore();
  const query = queryProp !== undefined ? queryProp : coreQuery;
  const handleSelect = React.useCallback(() => {
    onSelect?.(query);
  }, [onSelect, query]);

  if (!query) return null;

  return (
    <CommandCoreItem
      value="__command_core_free_search__"
      keywords={["*"]}
      forceMount
      onSelect={handleSelect}
      className={className}
      data-slot={itemDataSlot}
    >
      {label}{" "}
      <span className="font-semibold">&quot;{query}&quot;</span>
    </CommandCoreItem>
  );
}

CommandCoreFreeSearch.displayName = "CommandCore.FreeSearch";
