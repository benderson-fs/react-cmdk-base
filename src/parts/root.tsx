import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Combobox } from "@base-ui/react/combobox";
import {
  CommandMenuContext,
  type CommandMenuFilter,
  type RegisteredItem,
} from "../lib/context";
import { useControllable } from "../lib/use-controllable";

const defaultFilter: CommandMenuFilter = (query, label, keywords) => {
  if (!query) return true;
  if (keywords?.includes("*")) return true;
  const q = query.toLowerCase();
  if (label.toLowerCase().includes(q)) return true;
  return (keywords ?? []).some((k) => k.toLowerCase().includes(q));
};

export interface CommandMenuRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: string;
  /**
   * Called when the active page changes to a *different* id. Not called
   * when `setPage` or `popPage` is invoked and the resolved target equals
   * the current page (no-op transition).
   */
  onPageChange?: (page: string) => void;
  label?: string;
  loop?: boolean;
  /**
   * Override the built-in matcher. Receives the current query, the item's
   * label (derived from its children), and any `keywords` it declared.
   * Return `true` to keep the item visible, `false` to hide it. Defaults
   * to a case-insensitive substring + keyword match.
   */
  filter?: CommandMenuFilter;
  children: React.ReactNode;
}

export function CommandMenuRoot({
  open,
  onOpenChange,
  page: pageProp,
  onPageChange,
  label = "Command menu",
  loop = true,
  filter,
  children,
}: CommandMenuRootProps) {
  const [page, setPageRaw] = useControllable<string>({
    prop: pageProp,
    defaultProp: "root",
    onChange: onPageChange,
  });
  // Sync a ref with the current page so setPage/popPage can read the
  // up-to-date value within the same event handler, even after a
  // previous setPage call that hasn't committed yet. Without this,
  // two sequential setPage("a"); setPage("b") calls would both see
  // the same stale `page` and push duplicate entries onto pageStack.
  const pageRef = React.useRef(page);
  React.useEffect(() => {
    pageRef.current = page;
  });
  const pageStack = React.useRef<string[]>([]);

  const [query, setQuery] = React.useState("");
  const [searchPrefix, setSearchPrefix] = React.useState<readonly string[]>([]);

  const setPage = React.useCallback(
    (id: string) => {
      const current = pageRef.current;
      if (id === current) {
        // No-op transition; don't pollute the back stack. Still clear the
        // query so consumers can re-trigger drill-down logic.
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
      // No-op transition: clear the query but don't fire onPageChange.
      // Same contract as setPage when called with the current id.
      setQuery("");
      return;
    }
    setPageRaw(target);
    pageRef.current = target;
    setQuery("");
  }, [setPageRaw]);

  const itemsRef = React.useRef(new Map<string, RegisteredItem>());

  const registerItem = React.useCallback(
    (value: string, item: RegisteredItem) => {
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

  const close = React.useCallback(
    () => onOpenChange(false),
    [onOpenChange],
  );

  const fireSelect = React.useCallback(
    (value: string) => {
      const item = itemsRef.current.get(value);
      item?.onSelect?.(value);
      if (!item?.keepOpen) close();
    },
    [close],
  );

  const effectiveFilter = React.useMemo<CommandMenuFilter>(
    () => filter ?? defaultFilter,
    [filter],
  );

  const ctxValue = React.useMemo<
    React.ContextType<typeof CommandMenuContext>
  >(
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
    <CommandMenuContext.Provider value={ctxValue}>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="cmdk-backdrop" />
          <Dialog.Popup
            data-slot="command-menu-root"
            className="cmdk-popup"
          >
            <Dialog.Title className="cmdk-sr-only">{label}</Dialog.Title>
            <Dialog.Description className="cmdk-sr-only">
              Type to search, use arrow keys to navigate, Enter to select,
              Escape to close.
            </Dialog.Description>
            <Dialog.Close className="cmdk-sr-only">Close</Dialog.Close>
            <Combobox.Root
              inline
              autoHighlight
              openOnInputClick={false}
              loopFocus={loop}
              inputValue={query}
              onInputValueChange={(v: string) => setQuery(v)}
              onValueChange={(value: string | null) => {
                if (value !== null) fireSelect(value);
              }}
            >
              {children}
            </Combobox.Root>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </CommandMenuContext.Provider>
  );
}

CommandMenuRoot.displayName = "CommandMenu.Root";
