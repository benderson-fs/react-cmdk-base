// src/internal/command-core/free-search.tsx
import * as React from "react";
import { CommandCoreItem } from "./item";
import { useCommandCore } from "./hooks";

export interface CommandCoreFreeSearchProps {
  label?: string;
  itemDataSlot?: string;
  className?: string;
  onSelect?: (query: string) => void;
}

export function CommandCoreFreeSearch({
  label = "Search for",
  itemDataSlot,
  className,
  onSelect,
}: CommandCoreFreeSearchProps) {
  const { query } = useCommandCore();
  const handleSelect = React.useCallback(() => {
    onSelect?.(query);
  }, [onSelect, query]);

  if (!query) return null;

  return (
    <CommandCoreItem
      value="__command_core_free_search__"
      keywords={["*"]}
      onSelect={handleSelect}
      className={className}
      data-slot={itemDataSlot}
    >
      {label}{" "}
      <span className="font-semibold">&quot;{query}&quot;</span>
    </CommandCoreItem>
  );
}
