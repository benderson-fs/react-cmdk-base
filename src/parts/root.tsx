import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Combobox } from "@base-ui/react/combobox";
import {
  CommandMenuContext,
  type RegisteredItem,
} from "../lib/context";

export interface CommandMenuRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: string;
  onPageChange?: (page: string) => void;
  placeholder?: string;
  label?: string;
  loop?: boolean;
  children: React.ReactNode;
}

export function CommandMenuRoot({
  open,
  onOpenChange,
  page: pageProp,
  onPageChange,
  label = "Command menu",
  loop = true,
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
