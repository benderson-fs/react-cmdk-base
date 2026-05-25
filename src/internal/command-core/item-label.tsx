// src/internal/command-core/item-label.tsx
import * as React from "react";

export interface CommandCoreItemLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/**
 * Marker + presentational slot for an Item's display label. When present
 * inside a CommandCore Item, its rendered text seeds:
 * 1. The Item's accessibleName (aria-label fallback).
 * 2. The filter target (consumers can type the label to match).
 * 3. The SearchInput selection write-back (the string written into the
 *    input on Enter-on-highlight).
 *
 * When omitted, Item falls back to `getLabelFromChildren(children)`.
 */
export const CommandCoreItemLabel = React.forwardRef<
  HTMLSpanElement,
  CommandCoreItemLabelProps
>(function CommandCoreItemLabel({ children, ...rest }, ref) {
  return (
    <span
      ref={ref}
      data-slot="command-core-item-label"
      {...rest}
    >
      {children}
    </span>
  );
});

CommandCoreItemLabel.displayName = "CommandCore.ItemLabel";
