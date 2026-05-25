// src/internal/command-core/context.ts
import { createContext } from "react";

export type CommandCoreFilter = (
  query: string,
  label: string,
  keywords: string[] | undefined,
) => boolean;

export interface CommandCoreRegisteredItem {
  onSelect?: (value: string) => void;
  keepOpen?: boolean;
  label: string;
}

export interface CommandCoreContextValue {
  page: string;
  setPage: (id: string) => void;
  popPage: () => void;
  query: string;
  setQuery: (q: string) => void;
  searchPrefix: readonly string[];
  setSearchPrefix: (p: readonly string[]) => void;
  close: () => void;
  registerItem: (
    value: string,
    item: CommandCoreRegisteredItem,
  ) => () => void;
  fireSelect: (value: string) => void;
  /**
   * Look up a registered item's display label by value. Returns
   * `undefined` if the value isn't currently registered. Used by the
   * SearchInput Combobox bridge to set `itemToStringLabel` so Combobox's
   * own input-value write on selection matches the label (not the
   * stringified value).
   */
  getItemLabel: (value: string) => string | undefined;
  registerMatch: (value: string, matched: boolean) => void;
  unregisterMatch: (value: string) => void;
  matchCount: number;
  filter: CommandCoreFilter;
}

export const CommandCoreContext =
  createContext<CommandCoreContextValue | null>(null);
