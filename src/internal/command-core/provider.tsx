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
  /** Called AFTER `item.onSelect`, receiving the resolved label and the keepOpen flag. */
  onItemSelect?: (
    value: string,
    label: string,
    opts: { keepOpen: boolean },
  ) => void;
  /**
   * Externally-controlled filter query. When provided, this overrides the
   * internal query state and drives item filtering. SearchInput passes its
   * live query here so matchCount reflects what the user has typed.
   */
  query?: string;
  /**
   * Initial value of the internal query state when uncontrolled (i.e.
   * `query` is not provided). Read once on mount; later changes are
   * ignored. Use to seed a starting filter without paying for full
   * controlled-mode plumbing.
   */
  defaultQuery?: string;
  children: React.ReactNode;
}

export function CommandCoreProvider({
  page: pageProp,
  defaultPage = "root",
  onPageChange,
  filter,
  onClose,
  onItemSelect,
  query: queryProp,
  defaultQuery,
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
  // so the reconcile effect can apply it ONLY when the page actually
  // moves to the requested target. Tagging with `requested` defends
  // against two hazards:
  //   1. Rejected request: page doesn't change → effect runs (no deps)
  //      and clears the flag, AND a subsequent external nav with a
  //      different target won't mistakenly trigger the stack op
  //      (requested !== page).
  //   2. Race: consumer commits a different page than we asked for.
  //      requested !== page → stack op skipped silently.
  // Derived "this commit was an accepted internal nav" replaces the
  // prior `internalNavRef` flag — that flag could go stale across a
  // rejected request and contaminate the clear-on-root branch later.
  const pendingStackOpRef = React.useRef<
    { op: "push" | "pop"; requested: string } | null
  >(null);
  const pageStack = React.useRef<string[]>([]);

  // Reconcile pageRef and pageStack with the committed page. No dep array:
  // runs on every commit so a rejected setPage/popPage (where `page` did
  // not change) still clears its pending flag — preventing a stale flag
  // from contaminating a future unrelated page transition.
  React.useEffect(() => {
    const pending = pendingStackOpRef.current;
    const isAcceptedInternalNav =
      pending !== null && pending.requested === page;
    if (page !== prevPageRef.current) {
      if (isAcceptedInternalNav) {
        if (pending!.op === "push") {
          pageStack.current.push(prevPageRef.current);
        } else {
          pageStack.current.pop();
        }
      } else if (page === "root") {
        // External nav to "root" (or a rejected internal nav that
        // committed elsewhere). Either way, the user's navigation
        // history is reset — clear the back stack so popPage callers
        // don't return to a stale frame.
        pageStack.current = [];
      }
      // If `pending` is set but `requested !== page`, the consumer
      // committed a different transition than we requested — drop the
      // pending op silently. No stack mutation, no warn (it's a valid
      // consumer prerogative in controlled mode).
    }
    pendingStackOpRef.current = null;
    prevPageRef.current = page;
    pageRef.current = page;
  });

  const [internalQuery, setQuery] = React.useState<string>(defaultQuery ?? "");
  // When a controlled query prop is provided, use it; otherwise use internal state.
  const query = queryProp !== undefined ? queryProp : internalQuery;
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
      if (isPageControlledRef.current) {
        // Defer the stack push to commit — only apply if the consumer
        // accepts the change (page actually moves to `id`). Tagging with
        // the requested target so the effect can detect rejection or
        // race-override and skip the mutation.
        pendingStackOpRef.current = { op: "push", requested: id };
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
    if (isPageControlledRef.current) {
      pendingStackOpRef.current = { op: "pop", requested: target };
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

  const onItemSelectRef = React.useRef(onItemSelect);
  React.useEffect(() => {
    onItemSelectRef.current = onItemSelect;
  }, [onItemSelect]);

  const fireSelect = React.useCallback(
    (value: string) => {
      const item = itemsRef.current.get(value);
      item?.onSelect?.(value);
      if (item && onItemSelectRef.current) {
        onItemSelectRef.current(value, item.label, {
          keepOpen: !!item.keepOpen,
        });
      }
      if (!item?.keepOpen) close();
    },
    [close],
  );

  const getItemLabel = React.useCallback(
    (value: string) => itemsRef.current.get(value)?.label,
    [],
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
      getItemLabel,
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
      getItemLabel,
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
