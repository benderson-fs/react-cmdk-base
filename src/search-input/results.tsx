import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { useSearchInput } from "./context";
import { CommandCoreList } from "../internal/command-core";
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
            <CommandCoreList
              data-slot="search-input-list"
              className="si-list"
            >
              {children}
            </CommandCoreList>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

SearchInputResults.displayName = "SearchInput.Results";
