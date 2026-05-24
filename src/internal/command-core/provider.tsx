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
  /**
   * Initial value of the internal query state when uncontrolled (i.e.
   * `query` is not provided). Read once on mount; later changes are
   * ignored. Use to seed a starting filter without paying for full
   * controlled-mode plumbing.
   */
  defaultQuery?: string;
  /**
   * Controlled query value. Three supported modes:
   *
   * 1. **Uncontrolled** — omit `query` and `onQueryChange`. Provider owns
   *    the state; `setPage`/`popPage` clear it to "" on navigation.
   * 2. **Fully controlled** — pass both `query` and `onQueryChange`. The
   *    consumer mirrors writes; the provider follows.
   * 3. **Read-only controlled** — pass `query` without `onQueryChange`.
   *    Internal `setQuery` calls (including the clear-on-navigate inside
   *    `setPage`/`popPage`) become no-ops; the rendered query is locked
   *    to whatever the consumer feeds in. `SearchInput.Root` uses this
   *    mode to bind the popup filter to `committedQuery` (last-submitted
   *    value), so typing in the input doesn't change the filter until
   *    the user submits again.
   */
  query?: string;
  /** See `query` for the three supported control modes. */
  onQueryChange?: (query: string) => void;
  children: React.ReactNode;
}

export function CommandCoreProvider({
  page: pageProp,
  defaultPage = "root",
  onPageChange,
  filter,
  onClose,
  defaultQuery,
  query: queryProp,
  onQueryChange,
  children,
}: CommandCoreProviderProps) {
  const [page, setPageRaw] = useControllable<string>({
    prop: pageProp,
    defaultProp: defaultPage,
    onChange: onPageChange,
  });

  // Track controlled-mode at call time. In controlled mode the consumer
  // owns `page`; setPage/popPage must NOT speculatively write pageRef,
  // because the consumer may ignore onPageChange and the rendered page
  // won't actually change. The useEffect below syncs pageRef from the
  // just-committed `page`, which is the only authoritative source.
  // In uncontrolled mode we DO write pageRef synchronously so that two
  // sequential setPage calls within the same handler observe each other's
  // in-flight target — without it, the second call reads the stale pre-
  // commit value and pushes the wrong frame onto the back stack.
  const isPageControlledRef = React.useRef(pageProp !== undefined);
  React.useEffect(() => {
    isPageControlledRef.current = pageProp !== undefined;
  }, [pageProp]);

  const pageRef = React.useRef(page);
  React.useEffect(() => {
    pageRef.current = page;
  }, [page]);
  const pageStack = React.useRef<string[]>([]);

  // Clear the internal page stack whenever the controlled `page` is
  // externally reset to "root". This keeps popPage callers from popping
  // a stale frame after the consumer (e.g. SearchInput.Root) resets the
  // page tree on resubmit.
  React.useEffect(() => {
    if (page === "root") {
      pageStack.current = [];
    }
  }, [page]);

  const [query, setQuery] = useControllable<string>({
    prop: queryProp,
    defaultProp: defaultQuery ?? "",
    onChange: onQueryChange,
  });
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
      // Only write pageRef synchronously when uncontrolled. In controlled
      // mode the consumer may ignore onPageChange, and a speculative write
      // would desync the ref from the rendered page — subsequent setPage
      // calls would then short-circuit on the stale ref. The useEffect
      // above syncs pageRef from the committed `page` after commit.
      if (!isPageControlledRef.current) {
        pageRef.current = id;
      }
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
    if (!isPageControlledRef.current) {
      pageRef.current = target;
    }
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

CommandCoreProvider.displayName = "CommandCore.Provider";
