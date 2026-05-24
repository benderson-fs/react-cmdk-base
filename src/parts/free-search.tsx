import * as React from "react";
import { CommandCoreFreeSearch } from "../internal/command-core";

export interface CommandMenuFreeSearchProps {
  label?: string;
  onSelect?: (query: string) => void;
}

export function CommandMenuFreeSearch(props: CommandMenuFreeSearchProps) {
  return (
    <CommandCoreFreeSearch
      {...props}
      itemDataSlot="command-menu-item"
      className="cmdk-item"
    />
  );
}

CommandMenuFreeSearch.displayName = "CommandMenu.FreeSearch";
