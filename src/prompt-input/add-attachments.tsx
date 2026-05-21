import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { usePromptInput } from "./context";
import { cn } from "../lib/cn";

function PaperclipIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pi-menu-item-icon"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

// className narrowed to string — base-ui's `string | (state) => string` union
// can't pipe through our `cn()` helper without duplicating its state types.
export interface PromptInputAddAttachmentsProps
  extends Omit<
    React.ComponentProps<typeof Menu.Item>,
    "children" | "className"
  > {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function PromptInputAddAttachments({
  label = "Add files",
  icon,
  className,
  onClick,
  ...props
}: PromptInputAddAttachmentsProps) {
  const ctx = usePromptInput();
  return (
    <Menu.Item
      data-slot="prompt-input-add-attachments"
      className={cn("pi-menu-item", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        ctx.openFileDialog();
      }}
      {...props}
    >
      {icon ?? <PaperclipIcon />}
      <span className="pi-menu-item-label">{label}</span>
    </Menu.Item>
  );
}

PromptInputAddAttachments.displayName = "PromptInput.AddAttachments";
