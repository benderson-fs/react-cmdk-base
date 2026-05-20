import * as React from "react";
import {
  PromptInputContext,
  isGenerating,
  type PromptInputAttachment,
  type PromptInputContextValue,
  type PromptInputErrorEvent,
  type PromptInputMessage,
  type PromptInputStatus,
} from "./context";
import { cn } from "../lib/cn";
import { useMergedRef } from "../lib/use-merged-ref";

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

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "") return true;
  const patterns = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return patterns.some((p) => {
    if (p.startsWith(".")) {
      return file.name.toLowerCase().endsWith(p.toLowerCase());
    }
    if (p.endsWith("/*")) {
      const prefix = p.slice(0, -1);
      return file.type.startsWith(prefix);
    }
    return file.type === p;
  });
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

  const [attachments, setAttachments] = React.useState<
    PromptInputAttachment[]
  >([]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const attachmentSeq = React.useRef(0);
  const idPrefix = React.useId();
  const [isDragging, setIsDragging] = React.useState(false);
  // Dragenter / dragleave fire for every descendant element. Counting them
  // lets us distinguish "left the form" from "moved between children".
  const dragDepth = React.useRef(0);

  const openFileDialog = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const mintId = React.useCallback(() => {
    attachmentSeq.current += 1;
    return `${idPrefix}-att-${attachmentSeq.current}`;
  }, [idPrefix]);

  const addFiles = React.useCallback(
    (input: File[] | FileList) => {
      const incoming = Array.from(input);
      if (incoming.length === 0) return;

      const acceptResult = incoming.reduce<{
        accepted: File[];
        rejected: number;
      }>(
        (acc, f) => {
          if (matchesAccept(f, accept)) acc.accepted.push(f);
          else acc.rejected += 1;
          return acc;
        },
        { accepted: [], rejected: 0 },
      );
      if (acceptResult.rejected > 0) {
        onError?.({
          code: "accept",
          message: `${acceptResult.rejected} file(s) rejected by accept filter.`,
        });
      }
      if (acceptResult.accepted.length === 0) return;

      const sizeResult = acceptResult.accepted.reduce<{
        sized: File[];
        rejected: number;
      }>(
        (acc, f) => {
          if (!maxFileSize || f.size <= maxFileSize) acc.sized.push(f);
          else acc.rejected += 1;
          return acc;
        },
        { sized: [], rejected: 0 },
      );
      if (sizeResult.rejected > 0) {
        onError?.({
          code: "max_file_size",
          message: `${sizeResult.rejected} file(s) exceed the maximum size.`,
        });
      }
      if (sizeResult.sized.length === 0) return;

      setAttachments((prev) => {
        const capacity =
          typeof maxFiles === "number"
            ? Math.max(0, maxFiles - prev.length)
            : undefined;
        const capped =
          typeof capacity === "number"
            ? sizeResult.sized.slice(0, capacity)
            : sizeResult.sized;
        if (typeof capacity === "number" && sizeResult.sized.length > capacity) {
          onError?.({
            code: "max_files",
            message: "Too many files. Some were not added.",
          });
        }
        const next: PromptInputAttachment[] = capped.map((file) => ({
          id: mintId(),
          filename: file.name,
          mediaType: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          file,
        }));
        return [...prev, ...next];
      });
    },
    [accept, maxFileSize, maxFiles, mintId, onError],
  );

  // Revoke object URLs *after* React commits the unmount of any <img src={url}>
  // that consumers might be rendering. Sync revoke in the state-updater races
  // with the next paint and can flash a broken image in some browsers.
  const deferRevoke = React.useCallback((urls: string[]) => {
    if (urls.length === 0) return;
    const run = () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
    if (typeof queueMicrotask === "function") queueMicrotask(run);
    else Promise.resolve().then(run);
  }, []);

  const removeFile = React.useCallback(
    (id: string) => {
      setAttachments((prev) => {
        const found = prev.find((a) => a.id === id);
        if (found?.url) deferRevoke([found.url]);
        return prev.filter((a) => a.id !== id);
      });
    },
    [deferRevoke],
  );

  const clearFiles = React.useCallback(() => {
    setAttachments((prev) => {
      deferRevoke(prev.map((a) => a.url).filter(Boolean));
      return [];
    });
  }, [deferRevoke]);

  // Cleanup on unmount
  const attachmentsRef = React.useRef(attachments);
  React.useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  React.useEffect(
    () => () => {
      for (const a of attachmentsRef.current) {
        if (a.url) URL.revokeObjectURL(a.url);
      }
    },
    [],
  );

  const beginDrag = React.useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    dragDepth.current += 1;
    if (dragDepth.current === 1) setIsDragging(true);
  }, []);

  const endDrag = React.useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  }, []);

  const resetDrag = React.useCallback(() => {
    dragDepth.current = 0;
    setIsDragging(false);
  }, []);

  // Drag/drop on form (unless globalDrop)
  React.useEffect(() => {
    const form = formRef.current;
    if (!form || globalDrop) return;

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
        e.stopPropagation();
        resetDrag();
        if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
      }
    };
    form.addEventListener("dragenter", beginDrag);
    form.addEventListener("dragleave", endDrag);
    form.addEventListener("dragover", onDragOver);
    form.addEventListener("drop", onDrop);
    return () => {
      form.removeEventListener("dragenter", beginDrag);
      form.removeEventListener("dragleave", endDrag);
      form.removeEventListener("dragover", onDragOver);
      form.removeEventListener("drop", onDrop);
      resetDrag();
    };
  }, [addFiles, globalDrop, beginDrag, endDrag, resetDrag]);

  // Document drop when globalDrop
  React.useEffect(() => {
    if (!globalDrop) return;

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
        resetDrag();
        if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
      }
    };
    document.addEventListener("dragenter", beginDrag);
    document.addEventListener("dragleave", endDrag);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragenter", beginDrag);
      document.removeEventListener("dragleave", endDrag);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
      resetDrag();
    };
  }, [addFiles, globalDrop, beginDrag, endDrag, resetDrag]);

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
        ref={useMergedRef(formRef, ref)}
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
