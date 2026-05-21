import * as React from "react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";
import { PromptInputTooltip } from "./tooltip";

export type PromptInputButtonVariant = "ghost" | "default";

export interface PromptInputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PromptInputButtonVariant;
  pressed?: boolean;
  asChild?: boolean;
  /**
   * Shorthand to wrap this button in a `<PromptInput.Tooltip>`. Pass a
   * string for plain content, or an object for shortcut + side overrides.
   */
  tooltip?:
    | string
    | {
        content: React.ReactNode;
        shortcut?: string;
        side?: "top" | "right" | "bottom" | "left";
      };
  ref?: React.Ref<HTMLButtonElement>;
}

export function PromptInputButton({
  variant = "ghost",
  pressed,
  asChild,
  tooltip,
  type,
  className,
  children,
  ref,
  ...props
}: PromptInputButtonProps) {
  const mergedClassName = cn("pi-btn", `pi-btn-${variant}`, className);
  const dataPressed = pressed ? "" : undefined;
  const ariaPressed = typeof pressed === "boolean" ? pressed : undefined;

  const rendered = asChild ? (
    <Slot
      ref={ref}
      type={type}
      className={mergedClassName}
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

  return <PromptInputTooltip {...tooltipProps}>{rendered}</PromptInputTooltip>;
}

PromptInputButton.displayName = "PromptInput.Button";
