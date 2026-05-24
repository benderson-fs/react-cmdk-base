import * as React from "react";
import { CommandCoreFreeSearch } from "../internal/command-core";

export interface SearchInputFreeSearchProps {
  label?: string;
  onSelect?: (query: string) => void;
}

export function SearchInputFreeSearch(props: SearchInputFreeSearchProps) {
  return (
    <CommandCoreFreeSearch
      {...props}
      itemDataSlot="search-input-item"
      className="si-item"
    />
  );
}

SearchInputFreeSearch.displayName = "SearchInput.FreeSearch";
