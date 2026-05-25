import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import {
  useSearchInput,
  SearchInputModalContext,
} from "./context";
import { CommandCoreList } from "../internal/command-core";
import { cn } from "../lib/cn";

export interface SearchInputResultsShellProps
  extends React.ComponentProps<"div"> {
  variant: "inline" | "modal";
  /** Pixel offset between the form row and the panel. @default 4 */
  sideOffset?: number;
  /** Side relative to the anchor. @default "bottom" */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment relative to the anchor. @default "start" */
  align?: "start" | "center" | "end";
  /** Match anchor width via --anchor-width. @default true */
  matchTriggerWidth?: boolean;
}

/**
 * Shared shell for SearchInput results — wraps Base UI's Combobox
 * `Positioner` + `Popup` (+ optional `Backdrop` for the modal variant).
 *
 * **Why Combobox primitives, not Dialog or Popover:** the input keeps
 * real DOM focus across typing and arrow navigation; Combobox uses
 * `aria-activedescendant` so focus never moves into the listbox. The
 * Combobox `modal` prop (set on `Combobox.Root` via the
 * `SearchInputModalContext` channel) locks page scroll and disables
 * outside pointer events without moving focus.
 *
 * The shell signals its variant upward via `SearchInputModalContext` so
 * the inner `Combobox.Root` (mounted by `SearchInput.Root`) can flip its
 * `modal` prop to match.
 */
export const SearchInputResultsShell = React.forwardRef<
  HTMLDivElement,
  SearchInputResultsShellProps
>(function SearchInputResultsShell(
  {
    variant,
    sideOffset = 4,
    side = "bottom",
    align = "start",
    matchTriggerWidth = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const ctx = useSearchInput();
  const modalCtx = React.useContext(SearchInputModalContext);

  // Tell Root which variant is mounted so Combobox.Root.modal stays in
  // sync. Reset on unmount so a subsequent inline mount doesn't inherit
  // a stale modal=true.
  React.useEffect(() => {
    if (!modalCtx) return;
    modalCtx.setModal(variant === "modal");
    return () => modalCtx.setModal(false);
  }, [modalCtx, variant]);

  return (
    <>
      {variant === "modal" ? (
        <Combobox.Backdrop
          className="si-results-backdrop"
          data-slot="search-input-results-backdrop"
        />
      ) : null}
      <Combobox.Positioner
        anchor={ctx.formRef}
        side={side}
        align={align}
        sideOffset={sideOffset}
        style={
          matchTriggerWidth
            ? ({ width: "var(--anchor-width)" } as React.CSSProperties)
            : undefined
        }
      >
        <Combobox.Popup
          ref={ref}
          id={ctx.popupId}
          data-slot={
            variant === "modal"
              ? "search-input-results-modal"
              : "search-input-results-inline"
          }
          data-variant={variant}
          data-state={ctx.resultsOpen ? "open" : "closed"}
          className={cn("si-results-panel", className)}
          {...rest}
        >
          <CommandCoreList
            data-slot="search-input-list"
            className="si-list"
          >
            {children}
          </CommandCoreList>
        </Combobox.Popup>
      </Combobox.Positioner>
    </>
  );
});

SearchInputResultsShell.displayName = "SearchInput.ResultsShell";
