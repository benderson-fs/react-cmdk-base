import * as React from "react";
import { cn } from "../lib/cn";

export interface PromptInputHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputHeader({
  className,
  ...props
}: PromptInputHeaderProps) {
  return <div className={cn("pi-header", className)} {...props} />;
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
  ...props
}: PromptInputToolsProps) {
  return <div className={cn("pi-tools", className)} {...props} />;
}
