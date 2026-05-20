import * as React from "react";
import {
  PromptInputContext,
  isGenerating,
  type PromptInputContextValue,
  type PromptInputErrorEvent,
  type PromptInputMessage,
  type PromptInputStatus,
} from "./context";
import { cn } from "../lib/cn";
import { useMergedRef } from "../lib/use-merged-ref";
import { useAttachments } from "../lib/use-attachments";
import { useDragDrop } from "../lib/use-drag-drop";

export interface PromptInputRootProps
  extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    "onSubmit" | "onError" | "defaultValue"
  > {
  /**
   * Called when the form is submitted (Enter key or Submit click). If it returns
   * a rejected Promise, the text + attachments are kept so the user can retry —
   * consumers should signal failure to assistive tech themselves (e.g. via
   * `status="error"` on Submit).
   */
  onSubmit: (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  globalDrop?: boolean;
  /**
   * When provided, the hidden file input is given this `name` so a native
   * form submission (i.e. without intercepting `onSubmit`) will include the
   * selected files under that key. Most consumers won't need this — the
   * `PromptInputMessage` passed to `onSubmit` already carries `files`.
   */
  fileInputName?: string;
  /** Fires once per addFiles call if any incoming file is rejected. */
  onError?: (err: PromptInputErrorEvent) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  label?: string;
  /**
   * Generation status. When `submitted` or `streaming`, Enter is treated as
   * no-op so the textarea doesn't fire a duplicate submit while a request
   * is in flight. Submit button shows the matching icon.
   */
  status?: PromptInputStatus;
  children: React.ReactNode;
}


export function PromptInputRoot({
  onSubmit,
  accept,
  multiple,
  maxFiles,
  maxFileSize,
  globalDrop,
  fileInputName,
  onError,
  value,
  onValueChange,
  defaultValue = "",
  label = "Prompt input",
  status = "ready",
  className,
  children,
  ref,
  ...formProps
}: PromptInputRootProps & { ref?: React.Ref<HTMLFormElement> }) {
  const [internalText, setInternalText] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const text = isControlled ? value : internalText;

  const setText = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternalText(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange],
  );

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const idPrefix = React.useId();

  const openFileDialog = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const { attachments, addFiles, removeFile, clearFiles } = useAttachments({
    accept,
    maxFiles,
    maxFileSize,
    onError,
    idPrefix,
  });

  const { isDragging, bind: bindDragDrop } = useDragDrop({
    globalDrop,
    onDrop: addFiles,
  });

  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.files) addFiles(event.currentTarget.files);
      event.currentTarget.value = "";
    },
    [addFiles],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // Belt-and-braces: even if the textarea Enter-guard fails, the form
      // itself never fires onSubmit while a generation is in flight.
      if (isGenerating(status)) return;

      const snapshot: PromptInputMessage = { text, files: attachments };
      const result = onSubmit(snapshot, event);
      if (result instanceof Promise) {
        try {
          await result;
          setText("");
          clearFiles();
        } catch {
          // Keep user content for retry. Consumers should mirror failure into
          // their own `status="error"` to inform assistive tech.
        }
      } else {
        setText("");
        clearFiles();
      }
    },
    [status, text, attachments, onSubmit, setText, clearFiles],
  );

  const ctxValue = React.useMemo<PromptInputContextValue>(
    () => ({
      text,
      setText,
      attachments,
      addFiles,
      removeFile,
      clearFiles,
      openFileDialog,
      status,
      label,
    }),
    [
      text,
      setText,
      attachments,
      addFiles,
      removeFile,
      clearFiles,
      openFileDialog,
      status,
      label,
    ],
  );

  return (
    <PromptInputContext.Provider value={ctxValue}>
      <form
        ref={useMergedRef(formRef, ref, bindDragDrop)}
        onSubmit={handleSubmit}
        aria-label={label}
        data-dragging={isDragging ? "" : undefined}
        className={cn("pi-root", className)}
        {...formProps}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          name={fileInputName}
          onChange={handleFileChange}
          className="pi-file-input"
          aria-hidden="true"
          tabIndex={-1}
        />
        {children}
      </form>
    </PromptInputContext.Provider>
  );
}
