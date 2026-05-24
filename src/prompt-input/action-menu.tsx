import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "../lib/cn";
import {
  PromptInputButton,
  type PromptInputButtonProps,
} from "./button";

export type PromptInputActionMenuProps = React.ComponentProps<
  typeof Menu.Root
>;

export function PromptInputActionMenu(props: PromptInputActionMenuProps) {
  return <Menu.Root {...props} />;
}

function DefaultPlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export interface PromptInputActionMenuTriggerProps
  extends PromptInputButtonProps {}

/**
 * Trigger button for the action menu. Defaults to a `+` icon and
 * `aria-label="Open actions"`; both can be overridden by passing `children`
 * or `aria-label` respectively (consumer props win over the defaults).
 */
export function PromptInputActionMenuTrigger({
  children,
  className,
  "aria-label": ariaLabel,
  ...props
}: PromptInputActionMenuTriggerProps) {
  return (
    <Menu.Trigger
      render={
        <PromptInputButton
          className={className}
          aria-label={ariaLabel ?? "Open actions"}
          data-slot="prompt-input-action-menu-trigger"
          {...props}
        >
          {children ?? <DefaultPlusIcon />}
        </PromptInputButton>
      }
    />
  );
}

// We narrow `className` / `style` to plain values: base UI types both
// as a `state => …` union which we don't pipe through `cn()`. Re-
// exposing as plain values keeps the consumer API ergonomic and guards
// against Base UI ever invoking style(state) on a plain object.
export interface PromptInputActionMenuContentProps
  extends Omit<
    React.ComponentProps<typeof Menu.Popup>,
    "render" | "className" | "style"
  > {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PromptInputActionMenuContent({
  align = "start",
  side = "top",
  sideOffset = 8,
  className,
  children,
  ...props
}: PromptInputActionMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner align={align} side={side} sideOffset={sideOffset}>
        <Menu.Popup
          data-slot="prompt-input-action-menu-content"
          className={cn("pi-menu-popup", className)}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

// className / style narrowed — see note on PromptInputActionMenuContentProps.
export interface PromptInputActionMenuItemProps
  extends Omit<React.ComponentProps<typeof Menu.Item>, "className" | "style"> {
  className?: string;
  style?: React.CSSProperties;
  /**
   * When true, the menu stays open after this item is selected. Defaults
   * to `false` (matches Base UI's default close-on-select behaviour).
   */
  keepOpen?: boolean;
}

export function PromptInputActionMenuItem({
  className,
  keepOpen,
  closeOnClick,
  ...props
}: PromptInputActionMenuItemProps) {
  return (
    <Menu.Item
      data-slot="prompt-input-action-menu-item"
      className={cn("pi-menu-item", className)}
      closeOnClick={keepOpen ? false : closeOnClick}
      {...props}
    />
  );
}

PromptInputActionMenu.displayName = "PromptInput.ActionMenu";
PromptInputActionMenuTrigger.displayName = "PromptInput.ActionMenuTrigger";
PromptInputActionMenuContent.displayName = "PromptInput.ActionMenuContent";
PromptInputActionMenuItem.displayName = "PromptInput.ActionMenuItem";
