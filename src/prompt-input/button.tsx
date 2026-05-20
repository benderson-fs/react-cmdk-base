import * as React from "react";
import { cn } from "../lib/cn";

export type PromptInputButtonVariant = "ghost" | "default";

export interface PromptInputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PromptInputButtonVariant;
  pressed?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function PromptInputButton({
  variant = "ghost",
  pressed,
  type,
  className,
  children,
  ref,
  ...props
}: PromptInputButtonProps) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      data-variant={variant}
      data-pressed={pressed ? "" : undefined}
      aria-pressed={typeof pressed === "boolean" ? pressed : undefined}
      className={cn("pi-btn", `pi-btn-${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
