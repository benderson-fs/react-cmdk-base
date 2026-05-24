import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import { cn } from "../lib/cn";
import { usePromptInput } from "./context";

export interface PromptInputHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputHeader({
  className,
  hidden,
  ...props
}: PromptInputHeaderProps) {
  const { collapsed } = usePromptInput();
  return (
    <div
      data-slot="prompt-input-header"
      className={cn("pi-header", className)}
      {...props}
      hidden={hidden || collapsed}
    />
  );
}

export interface PromptInputFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputFooter({
  className,
  ...props
}: PromptInputFooterProps) {
  return (
    <div
      data-slot="prompt-input-footer"
      className={cn("pi-footer", className)}
      {...props}
    />
  );
}

export interface PromptInputToolsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputTools({
  className,
  hidden,
  ...props
}: PromptInputToolsProps) {
  const { collapsed } = usePromptInput();
  return (
    <div
      data-slot="prompt-input-tools"
      className={cn("pi-tools", className)}
      {...props}
      hidden={hidden || collapsed}
    />
  );
}

PromptInputHeader.displayName = "PromptInput.Header";
PromptInputFooter.displayName = "PromptInput.Footer";
PromptInputTools.displayName = "PromptInput.Tools";

export interface PromptInputToolbarProps
  extends Omit<
    React.ComponentProps<typeof Toolbar.Root>,
    "className" | "render"
  > {
  className?: string;
  hidden?: boolean;
}

/**
 * WAI-ARIA toolbar wrapper for the PromptInput controls row. Provides
 * arrow-key roving focus and `role="toolbar"`. Children should be
 * `<Toolbar.Button render={<PromptInputButton .../>} />` (or any
 * trigger from this package, which renders a button under the hood).
 *
 * Prefer this over `<PromptInput.Tools>` when you have two or more
 * controls in the row — Tools is a plain div kept for backwards
 * compatibility and for non-toolbar layouts (e.g. a single Submit).
 */
export function PromptInputToolbar({
  className,
  hidden,
  ...props
}: PromptInputToolbarProps) {
  const { collapsed } = usePromptInput();
  return (
    <Toolbar.Root
      data-slot="prompt-input-toolbar"
      className={cn("pi-tools", className)}
      hidden={hidden || collapsed}
      {...props}
    />
  );
}

PromptInputToolbar.displayName = "PromptInput.Toolbar";
