import * as React from "react";

export interface UseDragDropOptions {
  /**
   * When true, listen on `document` instead of the bound element.
   */
  globalDrop?: boolean;
  /** Called with the dropped FileList. */
  onDrop: (files: FileList) => void;
}

export interface UseDragDropResult {
  isDragging: boolean;
  /** Attach to the element that should host drag listeners (when !globalDrop). */
  bind: (node: HTMLElement | null) => void;
}

/**
 * Tracks file-only drag/drop with a depth counter so dragenter/dragleave
 * on descendant elements don't flicker `isDragging`. Returns a `bind`
 * callback to attach to the host element, or listens on `document` when
 * `globalDrop` is true.
 */
export function useDragDrop({
  globalDrop,
  onDrop,
}: UseDragDropOptions): UseDragDropResult {
  const [isDragging, setIsDragging] = React.useState(false);
  const depth = React.useRef(0);
  const elementRef = React.useRef<HTMLElement | null>(null);

  const beginDrag = React.useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    depth.current += 1;
    if (depth.current === 1) setIsDragging(true);
  }, []);

  const endDrag = React.useCallback((e: DragEvent) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setIsDragging(false);
  }, []);

  const reset = React.useCallback(() => {
    depth.current = 0;
    setIsDragging(false);
  }, []);

  const onDragOver = React.useCallback((e: DragEvent) => {
    if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
  }, []);

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      // stopPropagation only matters when scoped to an element — globalDrop
      // listens on document where stopPropagation is a no-op.
      if (!globalDrop) e.stopPropagation();
      reset();
      if (e.dataTransfer.files.length > 0) onDrop(e.dataTransfer.files);
    },
    [globalDrop, onDrop, reset],
  );

  // Attach to the bound element OR to document based on globalDrop.
  React.useEffect(() => {
    const target: EventTarget | null = globalDrop
      ? document
      : elementRef.current;
    if (!target) return;

    target.addEventListener("dragenter", beginDrag as EventListener);
    target.addEventListener("dragleave", endDrag as EventListener);
    target.addEventListener("dragover", onDragOver as EventListener);
    target.addEventListener("drop", handleDrop as EventListener);
    return () => {
      target.removeEventListener("dragenter", beginDrag as EventListener);
      target.removeEventListener("dragleave", endDrag as EventListener);
      target.removeEventListener("dragover", onDragOver as EventListener);
      target.removeEventListener("drop", handleDrop as EventListener);
      reset();
    };
  }, [globalDrop, beginDrag, endDrag, onDragOver, handleDrop, reset]);

  const bind = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return { isDragging, bind };
}
