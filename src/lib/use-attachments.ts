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

  // Track latest attachments via ref so addFiles/removeFile/clearFiles can
  // keep stable identity — reading `attachments` from closure would force
  // it into their dep arrays, causing identity churn on every add/remove
  // and defeating consumer useMemo/useCallback memoization.
  const attachmentsRef = React.useRef(attachments);
  React.useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

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
          ? Math.max(0, maxFiles - attachmentsRef.current.length)
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
    [accept, maxFileSize, maxFiles, mintId, onError],
  );

  const removeFile = React.useCallback(
    (id: string) => {
      const target = attachmentsRef.current.find((a) => a.id === id);
      if (!target) return;
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      if (target.url) deferRevoke([target.url]);
    },
    [deferRevoke],
  );

  const clearFiles = React.useCallback(() => {
    const urls = attachmentsRef.current
      .map((a) => a.url)
      .filter((u): u is string => Boolean(u));
    setAttachments([]);
    deferRevoke(urls);
  }, [deferRevoke]);

  React.useEffect(
    () => () => {
      const urls = attachmentsRef.current
        .map((a) => a.url)
        .filter((u): u is string => Boolean(u));
      // Route through deferRevoke so revokes land after the current commit
      // flushes — avoids broken-image flashes on sibling <img> chips that
      // are unmounting in the same batch (notably Safari).
      deferRevoke(urls);
    },
    // deferRevoke is a stable useCallback (empty deps); sweep runs once on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { attachments, addFiles, removeFile, clearFiles };
}
