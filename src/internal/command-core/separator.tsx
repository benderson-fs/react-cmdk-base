// src/internal/command-core/separator.tsx
import * as React from "react";
import { Separator } from "@base-ui/react/separator";

export interface CommandCoreSeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  "data-slot"?: string;
}

export function CommandCoreSeparator({
  className,
  orientation = "horizontal",
  "data-slot": dataSlot = "command-core-separator",
}: CommandCoreSeparatorProps) {
  return (
    <Separator
      data-slot={dataSlot}
      orientation={orientation}
      className={className}
    />
  );
}
