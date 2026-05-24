import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { Combobox } from "@base-ui/react/combobox";
import { useSearchInput } from "./context";
import {
  CommandCoreProvider,
  CommandCoreList,
  useCommandCore,
} from "../internal/command-core";
import { cn } from "../lib/cn";

export interface SearchInputResultsProps {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
  collisionAvoidance?: React.ComponentProps<
    typeof Popover.Positioner
  >["collisionAvoidance"];
  sticky?: boolean;
  matchTriggerWidth?: boolean;
  keepMounted?: boolean;
  children: React.ReactNode;
}

function ResultsComboboxBridge({ children }: { children: React.ReactNode }) {
  const { query, setQuery, fireSelect } = useCommandCore();
  return (
    <Combobox.Root
      inline
      autoHighlight
      openOnInputClick={false}
      loopFocus
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

function SeedCommittedQuery({ committed }: { committed: string }) {
  const { setQuery, query } = useCommandCore();
  React.useLayoutEffect(() => {
    if (query !== committed) setQuery(committed);
  }, [committed, query, setQuery]);
  return null;
}

export function SearchInputResults({
  className,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  collisionAvoidance,
  sticky = false,
  matchTriggerWidth = true,
  keepMounted = false,
  children,
}: SearchInputResultsProps) {
  const ctx = useSearchInput();

  const closeResults = React.useCallback(
    () => ctx.setResultsOpen(false),
    [ctx],
  );

  return (
    <Popover.Root open={ctx.resultsOpen} onOpenChange={ctx.setResultsOpen}>
      <Popover.Portal keepMounted={keepMounted}>
        <Popover.Positioner
          anchor={ctx.formRef}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          collisionAvoidance={collisionAvoidance}
          sticky={sticky}
          style={
            matchTriggerWidth
              ? ({ width: "var(--anchor-width)" } as React.CSSProperties)
              : undefined
          }
        >
          <Popover.Popup
            id={ctx.popupId}
            data-slot="search-input-results"
            data-state={ctx.resultsOpen ? "open" : "closed"}
            className={cn("si-results", className)}
          >
            <CommandCoreProvider onClose={closeResults}>
              <SeedCommittedQuery committed={ctx.committedQuery} />
              <ResultsComboboxBridge>
                <CommandCoreList
                  data-slot="search-input-list"
                  className="si-list"
                >
                  {children}
                </CommandCoreList>
              </ResultsComboboxBridge>
            </CommandCoreProvider>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

SearchInputResults.displayName = "SearchInput.Results";
