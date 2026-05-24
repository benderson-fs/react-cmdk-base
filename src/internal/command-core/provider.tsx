// src/internal/command-core/provider.tsx
import * as React from "react";
import {
  CommandCoreContext,
  type CommandCoreFilter,
  type CommandCoreRegisteredItem,
} from "./context";
import { useControllable } from "../../lib/use-controllable";

const defaultFilter: CommandCoreFilter = (query, label, keywords) => {
  if (!query) return true;
  if (keywords?.includes("*")) return true;
  const q = query.toLowerCase();
  if (label.toLowerCase().includes(q)) return true;
  return (keywords ?? []).some((k) => k.toLowerCase().includes(q));
};

export interface CommandCoreProviderProps {
  page?: string;
  defaultPage?: string;
  onPageChange?: (page: string) => void;
  filter?: CommandCoreFilter;
  /** Called on Item.onSelect when `item.keepOpen !== true`. */
  onClose?: () => void;
  children: React.ReactNode;
}

export function CommandCoreProvider({
  page: pageProp,
  defaultPage = "root",
  onPageChange,
  filter,
  onClose,
  children,
}: CommandCoreProviderProps) {
  const [page, setPageRaw] = useControllable<string>({
    prop: pageProp,
    defaultProp: defaultPage,
    onChange: onPageChange,
  });

  const pageRef = React.useRef(page);
  React.useEffect(() => {
    pageRef.current = page;
  });
  const pageStack = React.useRef<string[]>([]);

  const [query, setQuery] = React.useState("");
  const [searchPrefix, setSearchPrefix] = React.useState<readonly string[]>(
    [],
  );

  const setPage = React.useCallback(
    (id: string) => {
      const current = pageRef.current;
      if (id === current) {
        setQuery("");
        return;
      }
      pageStack.current.push(current);
      setPageRaw(id);
      pageRef.current = id;
      setQuery("");
    },
    [setPageRaw],
  );

  const popPage = React.useCallback(() => {
    const prev = pageStack.current.pop();
    const target = prev ?? "root";
    const current = pageRef.current;
    if (target === current) {
      setQuery("");
      return;
    }
    setPageRaw(target);
    pageRef.current = target;
    setQuery("");
  }, [setPageRaw]);

  const itemsRef = React.useRef(
    new Map<string, CommandCoreRegisteredItem>(),
  );

  const registerItem = React.useCallback(
    (value: string, item: CommandCoreRegisteredItem) => {
      itemsRef.current.set(value, item);
      return () => {
        itemsRef.current.delete(value);
      };
    },
    [],
  );

  const [matchSet, setMatchSet] = React.useState<Set<string>>(
    () => new Set(),
  );

  const registerMatch = React.useCallback(
    (value: string, matched: boolean) => {
      setMatchSet((prev) => {
        const has = prev.has(value);
        if (matched && !has) {
          const next = new Set(prev);
          next.add(value);
          return next;
        }
        if (!matched && has) {
          const next = new Set(prev);
          next.delete(value);
          return next;
        }
        return prev;
      });
    },
    [],
  );

  const unregisterMatch = React.useCallback((value: string) => {
    setMatchSet((prev) => {
      if (!prev.has(value)) return prev;
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);

  const close = React.useCallback(() => onClose?.(), [onClose]);

  const fireSelect = React.useCallback(
    (value: string) => {
      const item = itemsRef.current.get(value);
      item?.onSelect?.(value);
      if (!item?.keepOpen) close();
    },
    [close],
  );

  const effectiveFilter = React.useMemo<CommandCoreFilter>(
    () => filter ?? defaultFilter,
    [filter],
  );

  const ctxValue = React.useMemo(
    () => ({
      page,
      setPage,
      popPage,
      query,
      setQuery,
      searchPrefix,
      setSearchPrefix,
      close,
      registerItem,
      fireSelect,
      registerMatch,
      unregisterMatch,
      matchCount: matchSet.size,
      filter: effectiveFilter,
    }),
    [
      page,
      setPage,
      popPage,
      query,
      searchPrefix,
      close,
      registerItem,
      fireSelect,
      registerMatch,
      unregisterMatch,
      matchSet,
      effectiveFilter,
    ],
  );

  return (
    <CommandCoreContext.Provider value={ctxValue}>
      {children}
    </CommandCoreContext.Provider>
  );
}
