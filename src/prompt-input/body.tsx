import * as React from "react";
import { cn } from "../lib/cn";

export interface PromptInputBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputBody({
  className,
  ...props
}: PromptInputBodyProps) {
  return <div className={cn("pi-body", className)} {...props} />;
}
