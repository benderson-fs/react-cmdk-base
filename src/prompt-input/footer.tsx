import * as React from "react";
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
  return <div className={cn("pi-footer", className)} {...props} />;
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
      className={cn("pi-tools", className)}
      {...props}
      hidden={hidden || collapsed}
    />
  );
}

PromptInputHeader.displayName = "PromptInput.Header";
PromptInputFooter.displayName = "PromptInput.Footer";
PromptInputTools.displayName = "PromptInput.Tools";
