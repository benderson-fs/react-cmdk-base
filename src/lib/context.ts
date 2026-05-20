import { createContext } from "react";

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
  searchPrefix: string[];
  setSearchPrefix: (p: string[]) => void;
  close: () => void;
  registerItem: (value: string, item: RegisteredItem) => () => void;
  fireSelect: (value: string) => void;
}

export const CommandMenuContext = createContext<CommandMenuContextValue | null>(
  null,
);
