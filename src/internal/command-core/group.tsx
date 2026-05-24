// src/internal/command-core/group.tsx
import * as React from "react";

export interface CommandCoreGroupProps {
  heading?: string;
  className?: string;
  "data-slot"?: string;
  headingClassName?: string;
  children: React.ReactNode;
}

export function CommandCoreGroup({
  heading,
  className,
  "data-slot": dataSlot = "command-core-group",
  headingClassName,
  children,
}: CommandCoreGroupProps) {
  return (
    <div data-slot={dataSlot} className={className}>
      {heading ? <div className={headingClassName}>{heading}</div> : null}
      {children}
    </div>
  );
}

CommandCoreGroup.displayName = "CommandCore.Group";
