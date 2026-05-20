import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { cn } from "../lib/cn";

export interface CommandMenuListProps {
  className?: string;
  children: React.ReactNode;
}

export function CommandMenuList({
  className,
  children,
}: CommandMenuListProps) {
  return (
    <Combobox.List className={cn("cmdk-list", className)}>
      {children}
    </Combobox.List>
  );
}
