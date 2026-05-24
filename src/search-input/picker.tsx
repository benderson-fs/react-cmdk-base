import * as React from "react";
import { Select } from "@base-ui/react/select";
import { cn } from "../lib/cn";
import { SearchInputButton, type SearchInputButtonProps } from "./button";

export interface SearchInputPickerProps
  extends Omit<React.ComponentProps<typeof Select.Root>, "children"> {
  children: React.ReactNode;
}

/**
 * Generic single-value picker built on Base UI's Select primitive. Use
 * for "select a scope" UX inside SearchInput.Tools / Toolbar.
 *
 * To feed the selected scope into the SearchInputMessage payload, wire
 * Picker's `value`/`onValueChange` to the Root's `scope`/`onScopeChange`:
 *
 * ```tsx
 * const [scope, setScope] = useState("all");
 * <SearchInput.Root scope={scope} onScopeChange={setScope} …>
 *   <SearchInput.Picker value={scope} onValueChange={setScope}>…</SearchInput.Picker>
 * </SearchInput.Root>
 * ```
 *
 * Modal default: Base UI's Select.Root is modal:true (locks page scroll).
 * If nesting inside a Dialog/CommandMenu, pass modal={false}.
 */
export function SearchInputPicker(props: SearchInputPickerProps) {
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
      className="si-picker-chevron"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export interface SearchInputPickerTriggerProps
  extends Omit<SearchInputButtonProps, "children"> {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export function SearchInputPickerTrigger({
  label,
  children,
  className,
  "aria-label": ariaLabel,
  ...props
}: SearchInputPickerTriggerProps) {
  return (
    <Select.Trigger
      render={
        <SearchInputButton
          variant="ghost"
          className={cn("si-picker-trigger", className)}
          aria-label={ariaLabel ?? "Picker"}
          data-slot="search-input-picker-trigger"
          {...props}
        />
      }
    >
      <span className="si-picker-label">
        {children ?? label ?? <Select.Value />}
      </span>
      <ChevronIcon />
    </Select.Trigger>
  );
}

SearchInputPickerTrigger.displayName = "SearchInput.PickerTrigger";

export interface SearchInputPickerContentProps {
  className?: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  /** See Base UI's Positioner.collisionPadding. */
  collisionPadding?: React.ComponentProps<
    typeof Select.Positioner
  >["collisionPadding"];
  /** See Base UI's Positioner.collisionAvoidance. */
  collisionAvoidance?: React.ComponentProps<
    typeof Select.Positioner
  >["collisionAvoidance"];
  sticky?: boolean;
}

export function SearchInputPickerContent({
  className,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  collisionAvoidance,
  sticky = false,
}: SearchInputPickerContentProps) {
  return (
    <Select.Portal>
      <Select.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        sticky={sticky}
      >
        <Select.Popup
          data-slot="search-input-picker-content"
          className={cn("si-picker-popup", className)}
        >
          {children}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  );
}

SearchInputPickerContent.displayName = "SearchInput.PickerContent";

export interface SearchInputPickerItemProps
  extends Omit<
    React.ComponentProps<typeof Select.Item>,
    "render" | "className"
  > {
  className?: string;
}

export function SearchInputPickerItem({
  className,
  children,
  ...props
}: SearchInputPickerItemProps) {
  return (
    <Select.Item
      data-slot="search-input-picker-item"
      className={cn("si-picker-item", className)}
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}

SearchInputPickerItem.displayName = "SearchInput.PickerItem";

export interface SearchInputPickerGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SearchInputPickerGroup({
  className,
  ...props
}: SearchInputPickerGroupProps) {
  return (
    <Select.Group
      data-slot="search-input-picker-group"
      className={cn("si-picker-group", className)}
      {...props}
    />
  );
}

SearchInputPickerGroup.displayName = "SearchInput.PickerGroup";

export interface SearchInputPickerGroupLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SearchInputPickerGroupLabel({
  className,
  ...props
}: SearchInputPickerGroupLabelProps) {
  return (
    <Select.GroupLabel
      data-slot="search-input-picker-group-label"
      className={cn("si-picker-group-label", className)}
      {...props}
    />
  );
}

SearchInputPickerGroupLabel.displayName = "SearchInput.PickerGroupLabel";

export interface SearchInputPickerSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SearchInputPickerSeparator({
  className,
  ...props
}: SearchInputPickerSeparatorProps) {
  return (
    <Select.Separator
      data-slot="search-input-picker-separator"
      className={cn("si-menu-separator", className)}
      {...props}
    />
  );
}

SearchInputPickerSeparator.displayName = "SearchInput.PickerSeparator";
