import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Combobox } from "@base-ui/react/combobox";
import {
  CommandMenuContext,
  type CommandMenuFilter,
  type RegisteredItem,
} from "../lib/context";

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
  const [internalPage, setInternalPage] = React.useState("root");
  const page = pageProp ?? internalPage;
  const pageStack = React.useRef<string[]>([]);

  const [query, setQuery] = React.useState("");
  const [searchPrefix, setSearchPrefix] = React.useState<string[]>([]);

  const setPage = React.useCallback(
    (id: string) => {
      pageStack.current.push(page);
      if (onPageChange) onPageChange(id);
      else setInternalPage(id);
      setQuery("");
    },
    [page, onPageChange],
  );

  const popPage = React.useCallback(() => {
    const prev = pageStack.current.pop();
    const target = prev ?? "root";
    if (onPageChange) onPageChange(target);
    else setInternalPage(target);
    setQuery("");
  }, [onPageChange]);

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

  React.useEffect(() => {
    setQuery("");
  }, [page]);

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
          <Dialog.Popup className="cmdk-popup" aria-label={label}>
            <Dialog.Title className="cmdk-sr-only">{label}</Dialog.Title>
            <Combobox.Root
              inline
              autoHighlight
              openOnInputClick={false}
              loopFocus={loop}
              inputValue={query}
              onInputValueChange={(v: string) => setQuery(v)}
              onValueChange={(value: unknown) => {
                if (typeof value === "string") fireSelect(value);
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
