import * as React from "react";
import { CommandMenuItem } from "./item";
import { useCommandMenu } from "../hooks/use-command-menu";

export interface CommandMenuFreeSearchProps {
  label?: string;
  onSelect?: (query: string) => void;
}

export function CommandMenuFreeSearch({
  label = "Search for",
  onSelect,
}: CommandMenuFreeSearchProps) {
  const { query } = useCommandMenu();
  const handleSelect = React.useCallback(() => {
    onSelect?.(query);
  }, [onSelect, query]);

  if (!query) return null;

  return (
    <CommandMenuItem
      value="__cmdk_free_search__"
      keywords={["*"]}
      onSelect={handleSelect}
    >
      {label} <span className="font-semibold">&quot;{query}&quot;</span>
    </CommandMenuItem>
  );
}
