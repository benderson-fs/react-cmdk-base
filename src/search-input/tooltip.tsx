import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "../lib/cn";

export interface SearchInputTooltipProps {
  content: React.ReactNode;
  /** Optional keyboard shortcut hint shown after the content in muted text. */
  shortcut?: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children: React.ReactElement;
}

/**
 * Wrap a single child in a Base UI Tooltip. The child is used as the
 * trigger and must accept ref + standard event handlers (any
 * <SearchInput.Button> or native <button> works).
 *
 * Composition: `<Tooltip.Trigger render={children} />` routes through
 * Base UI's `mergeProps` so the child's existing handlers, className,
 * style, and ref are preserved (Base UI's tooltip handlers compose on
 * top of them, not in place of them).
 *
 * **Provider requirement:** SearchInput.Root does NOT include a
 * `<Tooltip.Provider>` (unlike PromptInput.Root which wraps one). If
 * you use SearchInputTooltip, wrap your tree in `<Tooltip.Provider>`
 * from `@base-ui/react/tooltip` at the app or layout level.
 */
export function SearchInputTooltip({
  content,
  shortcut,
  side = "top",
  className,
  children,
}: SearchInputTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={6}>
          <Tooltip.Popup
            data-slot="search-input-tooltip"
            className={cn("si-tooltip", className)}
          >
            {content}
            {shortcut ? (
              <span className="si-tooltip-shortcut">{shortcut}</span>
            ) : null}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

SearchInputTooltip.displayName = "SearchInput.Tooltip";
