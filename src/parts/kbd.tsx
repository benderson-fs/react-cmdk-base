import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuKbdProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuKbd({
  className,
  children,
}: CommandMenuKbdProps) {
  return <kbd className={cn("cmdk-kbd", className)}>{children}</kbd>;
}
