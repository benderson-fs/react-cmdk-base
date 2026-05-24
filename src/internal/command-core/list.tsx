// src/internal/command-core/list.tsx
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";

export interface CommandCoreListProps {
  className?: string;
  "data-slot"?: string;
  children: React.ReactNode;
}

export function CommandCoreList({
  className,
  "data-slot": dataSlot = "command-core-list",
  children,
}: CommandCoreListProps) {
  return (
    <Combobox.List data-slot={dataSlot} className={className}>
      {children}
    </Combobox.List>
  );
}

CommandCoreList.displayName = "CommandCore.List";
