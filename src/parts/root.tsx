import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Combobox } from "@base-ui/react/combobox";
import {
  CommandCoreProvider,
  useCommandCore,
} from "../internal/command-core";
import type { CommandCoreFilter } from "../internal/command-core";

export type CommandMenuFilter = CommandCoreFilter;

export interface CommandMenuRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: string;
  onPageChange?: (page: string) => void;
  label?: string;
  loop?: boolean;
  filter?: CommandMenuFilter;
  children: React.ReactNode;
}

function CommandMenuComboboxBridge({
  loop,
  children,
}: {
  loop: boolean;
  children: React.ReactNode;
}) {
  const { query, setQuery, fireSelect } = useCommandCore();
  return (
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
  );
}

export function CommandMenuRoot({
  open,
  onOpenChange,
  page,
  onPageChange,
  label = "Command menu",
  loop = true,
  filter,
  children,
}: CommandMenuRootProps) {
  const close = React.useCallback(
    () => onOpenChange(false),
    [onOpenChange],
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="cmdk-backdrop" />
        <Dialog.Popup data-slot="command-menu-root" className="cmdk-popup">
          <Dialog.Title className="cmdk-sr-only">{label}</Dialog.Title>
          <Dialog.Description className="cmdk-sr-only">
            Type to search, use arrow keys to navigate, Enter to select,
            Escape to close.
          </Dialog.Description>
          <Dialog.Close className="cmdk-sr-only">Close</Dialog.Close>
          <CommandCoreProvider
            page={page}
            onPageChange={onPageChange}
            filter={filter}
            onClose={close}
          >
            <CommandMenuComboboxBridge loop={loop}>
              {children}
            </CommandMenuComboboxBridge>
          </CommandCoreProvider>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

CommandMenuRoot.displayName = "CommandMenu.Root";
