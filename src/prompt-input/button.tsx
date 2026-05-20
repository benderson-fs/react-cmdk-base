import * as React from "react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";

export type PromptInputButtonVariant = "ghost" | "default";

export interface PromptInputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PromptInputButtonVariant;
  pressed?: boolean;
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function PromptInputButton({
  variant = "ghost",
  pressed,
  asChild,
  type,
  className,
  children,
  ref,
  ...props
}: PromptInputButtonProps) {
  const mergedClassName = cn("pi-btn", `pi-btn-${variant}`, className);
  const dataPressed = pressed ? "" : undefined;
  const ariaPressed = typeof pressed === "boolean" ? pressed : undefined;

  if (asChild) {
    return (
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
    );
  }

  return (
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
}

PromptInputButton.displayName = "PromptInput.Button";
