import * as React from "react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";
import { SearchInputTooltip } from "./tooltip";

export type SearchInputButtonVariant = "ghost" | "default";

export interface SearchInputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SearchInputButtonVariant;
  pressed?: boolean;
  asChild?: boolean;
  /**
   * Shorthand to wrap this button in a `<SearchInput.Tooltip>`. Pass a
   * string for plain content, or an object for shortcut + side overrides.
   */
  tooltip?:
    | string
    | {
        content: React.ReactNode;
        shortcut?: string;
        side?: "top" | "right" | "bottom" | "left";
      };
  // No `ref` field — provided via React.forwardRef.
}

// INVARIANT: data-slot is rendered FIRST (literal attribute) and then
// {...props} is spread AFTER it on the same <button>. The spread order
// is load-bearing: consumer-passed data-slot (from wrappers like
// SearchInput.Picker / SearchInput.PickerTrigger) wins the override,
// while the literal default ensures every Button has a data-slot even
// when unwrapped. ALSO no intermediate wrapper around the <button> —
// wrappers pass data-slot expecting it to reach the actual <button>
// element. If you add either a wrapper here, or reorder the spread,
// also add a `slot` prop and consumer migration.
export const SearchInputButton = React.forwardRef<
  HTMLButtonElement,
  SearchInputButtonProps
>(function SearchInputButton(
  {
    variant = "ghost",
    pressed,
    asChild,
    tooltip,
    type,
    className,
    children,
    ...props
  },
  ref,
) {
  const mergedClassName = cn("si-btn", `si-btn-${variant}`, className);
  const dataPressed = pressed ? "" : undefined;
  const ariaPressed = typeof pressed === "boolean" ? pressed : undefined;

  const rendered = asChild ? (
    <Slot
      ref={ref}
      type={type}
      className={mergedClassName}
      data-slot="search-input-button"
      data-variant={variant}
      data-pressed={dataPressed}
      aria-pressed={ariaPressed}
      {...props}
    >
      {children as React.ReactElement}
    </Slot>
  ) : (
    <button
      ref={ref}
      type={type ?? "button"}
      data-slot="search-input-button"
      data-variant={variant}
      data-pressed={dataPressed}
      aria-pressed={ariaPressed}
      className={mergedClassName}
      {...props}
    >
      {children}
    </button>
  );

  if (!tooltip) return rendered;

  const tooltipProps =
    typeof tooltip === "string" ? { content: tooltip } : tooltip;

  return (
    <SearchInputTooltip {...tooltipProps}>{rendered}</SearchInputTooltip>
  );
});

SearchInputButton.displayName = "SearchInput.Button";
