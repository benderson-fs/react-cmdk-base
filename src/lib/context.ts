import { createContext } from "react";

export type CommandMenuFilter = (
  query: string,
  label: string,
  keywords: string[] | undefined,
) => boolean;

export interface RegisteredItem {
  onSelect?: (value: string) => void;
  keepOpen?: boolean;
}

export interface CommandMenuContextValue {
  page: string;
  setPage: (id: string) => void;
  popPage: () => void;
  query: string;
  setQuery: (q: string) => void;
  searchPrefix: readonly string[];
  setSearchPrefix: (p: readonly string[]) => void;
  close: () => void;
  registerItem: (value: string, item: RegisteredItem) => () => void;
  fireSelect: (value: string) => void;
  registerMatch: (value: string, matched: boolean) => void;
  unregisterMatch: (value: string) => void;
  matchCount: number;
  filter: CommandMenuFilter;
}

export const CommandMenuContext = createContext<CommandMenuContextValue | null>(
  null,
);
