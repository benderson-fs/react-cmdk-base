import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "../lib/cn";
import {
  PromptInputButton,
  type PromptInputButtonProps,
} from "./button";

interface ModelSelectContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const ModelSelectContext =
  React.createContext<ModelSelectContextValue | null>(null);

function useModelSelect(): ModelSelectContextValue {
  const ctx = React.useContext(ModelSelectContext);
  if (!ctx) {
    throw new Error(
      "PromptInput.ModelSelect parts must be used inside <PromptInput.ModelSelect>",
    );
  }
  return ctx;
}

export interface PromptInputModelSelectProps
  extends Omit<React.ComponentProps<typeof Menu.Root>, "children"> {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function PromptInputModelSelect({
  value,
  onValueChange,
  children,
  ...props
}: PromptInputModelSelectProps) {
  const ctxValue = React.useMemo<ModelSelectContextValue>(
    () => ({
      value,
      onValueChange:
        onValueChange ??
        ((next: string) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[react-cmdk-base] PromptInput.ModelSelect: selected "${next}" but no onValueChange was provided.`,
            );
          }
        }),
    }),
    [value, onValueChange],
  );
  return (
    <ModelSelectContext.Provider value={ctxValue}>
      <Menu.Root {...props}>{children}</Menu.Root>
    </ModelSelectContext.Provider>
  );
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

export interface PromptInputModelSelectTriggerProps
  extends Omit<PromptInputButtonProps, "children"> {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Trigger button for the model picker. Defaults `aria-label="Model"` so the
 * trigger has an accessible name even when `label` is rendered as a
 * non-string (e.g. a chef logo). Override via `aria-label` if you want
 * something more specific (e.g. `aria-label="Select model: GPT-4o"`).
 */
export function PromptInputModelSelectTrigger({
  label,
  children,
  className,
  "aria-label": ariaLabel,
  ...props
}: PromptInputModelSelectTriggerProps) {
  return (
    <Menu.Trigger
      render={
        <PromptInputButton
          className={cn("pi-model-trigger", className)}
          aria-label={ariaLabel ?? "Model"}
          data-slot="prompt-input-model-select-trigger"
          {...props}
        >
          {children ?? <span className="pi-model-label">{label}</span>}
          <ChevronIcon />
        </PromptInputButton>
      }
    />
  );
}

// className narrowed to string — see note on PromptInputAddAttachmentsProps.
export interface PromptInputModelSelectContentProps
  extends Omit<
    React.ComponentProps<typeof Menu.Popup>,
    "render" | "className"
  > {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
}

export function PromptInputModelSelectContent({
  align = "end",
  side = "top",
  sideOffset = 8,
  className,
  children,
  ...props
}: PromptInputModelSelectContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner align={align} side={side} sideOffset={sideOffset}>
        <Menu.Popup
          data-slot="prompt-input-model-select-content"
          className={cn("pi-menu-popup", className)}
          aria-label="Model"
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
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

// className narrowed to string — see note on PromptInputAddAttachmentsProps.
export interface PromptInputModelSelectItemProps
  extends Omit<React.ComponentProps<typeof Menu.Item>, "className"> {
  value: string;
  className?: string;
}

export function PromptInputModelSelectItem({
  value,
  className,
  children,
  onClick,
  ...props
}: PromptInputModelSelectItemProps) {
  const ctx = useModelSelect();
  const selected = ctx.value === value;
  return (
    <Menu.Item
      data-slot="prompt-input-model-select-item"
      className={cn("pi-menu-item pi-model-item", className)}
      data-selected={selected ? "" : undefined}
      role="menuitemradio"
      aria-checked={selected}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        ctx.onValueChange(value);
      }}
      {...props}
    >
      <span className="pi-menu-item-label">{children}</span>
      <span className="pi-model-check" aria-hidden="true">
        {selected ? <CheckIcon /> : null}
      </span>
    </Menu.Item>
  );
}

PromptInputModelSelect.displayName = "PromptInput.ModelSelect";
PromptInputModelSelectTrigger.displayName = "PromptInput.ModelSelectTrigger";
PromptInputModelSelectContent.displayName = "PromptInput.ModelSelectContent";
PromptInputModelSelectItem.displayName = "PromptInput.ModelSelectItem";
