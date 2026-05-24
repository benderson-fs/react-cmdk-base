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
  // owns `page`; setPage/popPage may be rejected (consumer ignores
  // onPageChange) and the rendered page may not actually change. To keep
  // pageRef AND pageStack in sync with what actually rendered, both are
  // reconciled in a single commit-time effect below.
  // In uncontrolled mode we keep the synchronous writes — that's what
  // allows two sequential setPage calls within the same handler to see
  // each other's in-flight target (locked by the "two sequential setPage"
  // back-stack regression test).
  const isPageControlledRef = React.useRef(pageProp !== undefined);
  React.useEffect(() => {
    isPageControlledRef.current = pageProp !== undefined;
  }, [pageProp]);

  const pageRef = React.useRef(page);
  const prevPageRef = React.useRef(page);
  // Records the intent of the most recent internal setPage/popPage call
  // so the reconcile effect can apply it ONLY when the page actually moves.
  const pendingStackOpRef = React.useRef<"push" | "pop" | null>(null);
  // Distinguishes "internal nav that committed to root" (preserve stack
  // — popPage came from us) from "external nav to root" (consumer reset,
  // clear stack so popPage callers don't pop a stale frame).
  const internalNavRef = React.useRef(false);
  const pageStack = React.useRef<string[]>([]);

  // Reconcile pageRef and pageStack with the committed page. In controlled
  // mode the consumer may have rejected the setPage/popPage request, in
  // which case page === prevPageRef.current and the stack must NOT mutate.
  React.useEffect(() => {
    if (page !== prevPageRef.current) {
      if (pendingStackOpRef.current === "push") {
        pageStack.current.push(prevPageRef.current);
      } else if (pendingStackOpRef.current === "pop") {
        pageStack.current.pop();
      } else if (!internalNavRef.current && page === "root") {
        // External nav to "root" with no pending internal op — consumer
        // reset (e.g. SearchInput.Root.resetPage on resubmit). Clear the
        // back stack so popPage callers don't return to a stale frame.
        pageStack.current = [];
      }
    }
    pendingStackOpRef.current = null;
    internalNavRef.current = false;
    prevPageRef.current = page;
    pageRef.current = page;
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
      internalNavRef.current = true;
      if (isPageControlledRef.current) {
        // Defer the stack push to commit — only apply if the consumer
        // accepts the change (page actually moves to `id`).
        pendingStackOpRef.current = "push";
      } else {
        pageStack.current.push(current);
        pageRef.current = id;
      }
      setPageRaw(id);
      setQuery("");
    },
    [setPageRaw],
  );

  const popPage = React.useCallback(() => {
    const stack = pageStack.current;
    // Peek (don't pop) so we can defer the mutation to commit in
    // controlled mode. Uncontrolled path pops synchronously below.
    const target = stack[stack.length - 1] ?? "root";
    const current = pageRef.current;
    if (target === current) {
      setQuery("");
      return;
    }
    internalNavRef.current = true;
    if (isPageControlledRef.current) {
      pendingStackOpRef.current = "pop";
    } else {
      stack.pop();
      pageRef.current = target;
    }
    setPageRaw(target);
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
