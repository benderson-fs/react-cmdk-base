import * as React from "react";
import { cn } from "../lib/cn";

export interface CommandMenuGroupProps {
  heading?: string;
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuGroup({
  heading,
  className,
  children,
}: CommandMenuGroupProps) {
  return (
    <div className={cn("cmdk-group", className)}>
      {heading ? <div className="cmdk-group-label">{heading}</div> : null}
      {children}
    </div>
  );
}

CommandMenuGroup.displayName = "CommandMenu.Group";
