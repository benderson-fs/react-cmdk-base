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
  const [boundNode, setBoundNode] = React.useState<HTMLElement | null>(null);
  const depth = React.useRef(0);

  // Hold onDrop in a ref so handleDrop's identity is stable across renders.
  // Consumers passing inline callbacks no longer cause listener-attach churn.
  //
  // The effect intentionally has NO dependency array: it runs after every
  // commit, syncing `onDropRef.current` to the just-rendered `onDrop`.
  // Safe because `handleDrop` reads the ref at event time (long after
  // commit), never during render. See src/lib/use-controllable.ts for
  // the same pattern + concurrent-render rationale.
  const onDropRef = React.useRef(onDrop);
  React.useEffect(() => {
    onDropRef.current = onDrop;
  });

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
      if (!globalDrop) e.stopPropagation();
      reset();
      if (e.dataTransfer.files.length > 0) onDropRef.current(e.dataTransfer.files);
    },
    [globalDrop, reset], // onDrop read via ref — not a dep
  );

  React.useEffect(() => {
    const target: EventTarget | null = globalDrop ? document : boundNode;
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
  }, [globalDrop, boundNode, beginDrag, endDrag, onDragOver, handleDrop, reset]);

  // Callback ref — re-runs the effect when the host element changes.
  const bind = React.useCallback((node: HTMLElement | null) => {
    setBoundNode(node);
  }, []);

  return { isDragging, bind };
}
