import * as React from "react";
import { Select } from "@base-ui/react/select";
import { cn } from "../lib/cn";
import {
  PromptInputButton,
  type PromptInputButtonProps,
} from "./button";

export interface PromptInputPickerProps
  extends Omit<React.ComponentProps<typeof Select.Root>, "children"> {
  children: React.ReactNode;
}

/**
 * Generic single-value picker built on Base UI's `Select` primitive. Use
 * when the popup is purely "pick one value from a known list" — items
 * announce as `option` inside a `listbox`. For a popup that mixes
 * selection with arbitrary action items, prefer
 * {@link PromptInputModelSelect} (Menu-based).
 *
 * All `Select.Root` props pass through — `value` / `defaultValue` /
 * `onValueChange`, plus `open` / `defaultOpen` / `onOpenChange`,
 * `disabled`, `name`, `form`, `multiple`, `items`, etc. See
 * `.claude/skills/base-ui-components/references/select.md` for the full
 * Root API.
 */
export function PromptInputPicker(props: PromptInputPickerProps) {
  return <Select.Root {...props} />;
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pi-model-chevron"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export interface PromptInputPickerTriggerProps
  extends Omit<PromptInputButtonProps, "children"> {
  /**
   * Visible label shown inside the trigger. Pass a string for plain text
   * or a node for a logo/badge — what you pass is rendered verbatim and
   * does NOT auto-update with the selected item. To let the trigger
   * auto-update from the selected item's `ItemText`, omit `label` (and
   * `children`); `Select.Value` will derive the display string.
   */
  label?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Trigger button for the Picker. Defaults `aria-label="Picker"` so the
 * trigger has an accessible name even when `label` is rendered as a
 * non-string. Override via `aria-label` for context-specific names
 * (e.g. `"Model"` or `"Format"`).
 *
 * Uses Base UI's `render={element}` form so `mergeProps` composes
 * consumer handlers with Base UI's open handler.
 */
export function PromptInputPickerTrigger({
  label,
  children,
  className,
  "aria-label": ariaLabel,
  ...props
}: PromptInputPickerTriggerProps) {
  return (
    <Select.Trigger
      render={
        <PromptInputButton
          className={cn("pi-model-trigger", className)}
          aria-label={ariaLabel ?? "Picker"}
          data-slot="prompt-input-picker-trigger"
          {...props}
        >
          {children ?? (
            label != null ? (
              <span className="pi-model-label">{label}</span>
            ) : (
              <Select.Value className="pi-model-label" />
            )
          )}
          <ChevronIcon />
        </PromptInputButton>
      }
    />
  );
}

// className narrowed to a plain string — base-ui's union with
// `(state) => string` can't be piped through `cn()` without
// duplicating the state types in every wrapper.
export interface PromptInputPickerContentProps
  extends Omit<
    React.ComponentProps<typeof Select.Popup>,
    "render" | "className"
  > {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
  /** Optional accessible label for the listbox (default: undefined). */
  "aria-label"?: string;
}

export function PromptInputPickerContent({
  align = "end",
  side = "top",
  sideOffset = 8,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: PromptInputPickerContentProps) {
  return (
    <Select.Portal>
      <Select.Positioner align={align} side={side} sideOffset={sideOffset}>
        <Select.Popup
          data-slot="prompt-input-picker-content"
          className={cn("pi-menu-popup", className)}
          {...props}
        >
          <Select.List aria-label={ariaLabel}>{children}</Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// className narrowed — see note on PromptInputPickerContentProps.
export interface PromptInputPickerItemProps
  extends Omit<React.ComponentProps<typeof Select.Item>, "className"> {
  className?: string;
}

export function PromptInputPickerItem({
  className,
  children,
  ...props
}: PromptInputPickerItemProps) {
  return (
    <Select.Item
      data-slot="prompt-input-picker-item"
      className={cn("pi-menu-item pi-model-item", className)}
      {...props}
    >
      <Select.ItemText className="pi-menu-item-label">
        {children}
      </Select.ItemText>
      <Select.ItemIndicator className="pi-model-check">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
}

// className narrowed — see note on PromptInputPickerContentProps.
export interface PromptInputPickerGroupProps
  extends Omit<React.ComponentProps<typeof Select.Group>, "className"> {
  className?: string;
}

export function PromptInputPickerGroup({
  className,
  ...props
}: PromptInputPickerGroupProps) {
  return (
    <Select.Group
      data-slot="prompt-input-picker-group"
      className={cn("pi-model-group", className)}
      {...props}
    />
  );
}

// className narrowed — see note on PromptInputPickerContentProps.
export interface PromptInputPickerGroupLabelProps
  extends Omit<React.ComponentProps<typeof Select.GroupLabel>, "className"> {
  className?: string;
}

export function PromptInputPickerGroupLabel({
  className,
  ...props
}: PromptInputPickerGroupLabelProps) {
  return (
    <Select.GroupLabel
      data-slot="prompt-input-picker-group-label"
      className={cn("pi-model-group-label", className)}
      {...props}
    />
  );
}

PromptInputPicker.displayName = "PromptInput.Picker";
PromptInputPickerTrigger.displayName = "PromptInput.PickerTrigger";
PromptInputPickerContent.displayName = "PromptInput.PickerContent";
PromptInputPickerItem.displayName = "PromptInput.PickerItem";
PromptInputPickerGroup.displayName = "PromptInput.PickerGroup";
PromptInputPickerGroupLabel.displayName = "PromptInput.PickerGroupLabel";
