import * as React from "react";
import { isGenerating, usePromptInput } from "./context";
import { cn } from "../lib/cn";

export interface PromptInputTextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  > {
  placeholder?: string;
}

export function PromptInputTextarea({
  placeholder = "What would you like to know?",
  onKeyDown,
  onPaste,
  className,
  "aria-label": ariaLabel,
  ...props
}: PromptInputTextareaProps) {
  const ctx = usePromptInput();
  const [isComposing, setIsComposing] = React.useState(false);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === "Enter") {
        if (isComposing || e.nativeEvent.isComposing) return;
        if (e.shiftKey) return;
        if (isGenerating(ctx.status)) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
        return;
      }

      // Remove last attachment on Backspace when textarea is empty.
      // Gate on !e.repeat so holding Backspace doesn't accidentally chew
      // through multiple attachments after emptying the field.
      if (
        e.key === "Backspace" &&
        !e.repeat &&
        e.currentTarget.value === "" &&
        ctx.attachments.length > 0
      ) {
        e.preventDefault();
        const last = ctx.attachments[ctx.attachments.length - 1];
        if (last) ctx.removeFile(last.id);
      }
    },
    [onKeyDown, isComposing, ctx],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      onPaste?.(e);
      if (e.defaultPrevented) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        ctx.addFiles(files);
      }
    },
    [onPaste, ctx],
  );

  return (
    <textarea
      className={cn("pi-textarea", className)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? ctx.label}
      value={ctx.text}
      onChange={(e) => ctx.setText(e.currentTarget.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      rows={1}
      {...props}
    />
  );
}

PromptInputTextarea.displayName = "PromptInput.Textarea";
