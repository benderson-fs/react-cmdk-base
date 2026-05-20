import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuFooter({
  className,
  children,
}: CommandMenuFooterProps) {
  return <div className={cn("cmdk-footer", className)}>{children}</div>;
}

CommandMenuFooter.displayName = "CommandMenu.Footer";
