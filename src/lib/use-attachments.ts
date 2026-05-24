import * as React from "react";
import type {
  PromptInputAttachment,
  PromptInputErrorEvent,
} from "../prompt-input/context";

export interface UseAttachmentsOptions {
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  onError?: (err: PromptInputErrorEvent) => void;
  idPrefix: string;
}

export interface UseAttachmentsResult {
  attachments: PromptInputAttachment[];
  addFiles: (files: File[] | FileList) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
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

export function useAttachments({
  accept,
  maxFiles,
  maxFileSize,
  onError,
  idPrefix,
}: UseAttachmentsOptions): UseAttachmentsResult {
  const [attachments, setAttachments] = React.useState<
    PromptInputAttachment[]
  >([]);
  const seq = React.useRef(0);

  const mintId = React.useCallback(() => {
    seq.current += 1;
    return `${idPrefix}-att-${seq.current}`;
  }, [idPrefix]);

  // Defer revoke past the next paint so any <img src={url}> consumer
  // has unmounted first.
  const deferRevoke = React.useCallback((urls: string[]) => {
    if (urls.length === 0) return;
    const run = () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
    if (typeof queueMicrotask === "function") queueMicrotask(run);
    else Promise.resolve().then(run);
  }, []);

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

      // Compute cap, fire onError, mint ids, and create Blob URLs OUTSIDE
      // the updater so StrictMode's double-invoke of the updater cannot
      // produce duplicate side effects (leaked Blob URLs, doubled onError).
      const capacity =
        typeof maxFiles === "number"
          ? Math.max(0, maxFiles - attachments.length)
          : undefined;
      const capped =
        typeof capacity === "number"
          ? sizeResult.sized.slice(0, capacity)
          : sizeResult.sized;
      if (
        typeof capacity === "number" &&
        sizeResult.sized.length > capacity
      ) {
        onError?.({
          code: "max_files",
          message: "Too many files. Some were not added.",
        });
      }
      if (capped.length === 0) return;
      const newEntries: PromptInputAttachment[] = capped.map((file) => ({
        id: mintId(),
        filename: file.name,
        mediaType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file,
      }));
      setAttachments((prev) => [...prev, ...newEntries]);
    },
    [accept, attachments, maxFileSize, maxFiles, mintId, onError],
  );

  const removeFile = React.useCallback(
    (id: string) => {
      const target = attachments.find((a) => a.id === id);
      if (!target) return;
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      if (target.url) deferRevoke([target.url]);
    },
    [attachments, deferRevoke],
  );

  const clearFiles = React.useCallback(() => {
    const urls = attachments.map((a) => a.url).filter(Boolean);
    setAttachments([]);
    deferRevoke(urls);
  }, [attachments, deferRevoke]);

  // Sweep on unmount
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

  return { attachments, addFiles, removeFile, clearFiles };
}
