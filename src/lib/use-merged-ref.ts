import * as React from "react";

type AnyRef<T> =
  | React.RefCallback<T>
  | React.MutableRefObject<T | null>
  | React.RefObject<T | null>
  | null
  | undefined;

type CleanupFn = () => void;

/**
 * Merge multiple refs into a single, stable ref callback. React-19-safe:
 * supports cleanup functions returned from callback refs, invokes
 * newly-added callback refs with the current node, and invokes departing
 * refs with `null` so consumers that conditionally swap refs across
 * renders don't see stale state.
 *
 * The returned callback identity is stable across renders, so React does
 * not detach and reattach the merged ref on every parent render — object
 * refs are written exactly once per mount, never see momentary `null`
 * while the node stays mounted.
 */
export function useMergedRef<T>(
  ...refs: Array<AnyRef<T>>
): React.RefCallback<T> {
  const refsRef = React.useRef<Array<AnyRef<T>>>(refs);
  const attachedRefsRef = React.useRef<Array<AnyRef<T>>>([]);
  const nodeRef = React.useRef<T | null>(null);
  const cleanupsRef = React.useRef<Map<AnyRef<T>, CleanupFn>>(new Map());

  refsRef.current = refs;

  function writeRef(ref: AnyRef<T>, node: T | null) {
    if (!ref) return;
    if (typeof ref === "function") {
      const result = ref(node);
      if (node !== null && typeof result === "function") {
        cleanupsRef.current.set(ref, result as CleanupFn);
      } else if (node === null) {
        cleanupsRef.current.delete(ref);
      }
      return;
    }
    (ref as React.MutableRefObject<T | null>).current = node;
  }

  function runCleanup(ref: AnyRef<T>) {
    if (!ref) return;
    const cleanup = cleanupsRef.current.get(ref);
    if (cleanup) {
      cleanupsRef.current.delete(ref);
      cleanup();
      return;
    }
    // No cleanup captured — fall back to the legacy null-invocation contract.
    if (typeof ref === "function") {
      ref(null);
    } else {
      (ref as React.MutableRefObject<T | null>).current = null;
    }
  }

  // Sync refs across renders: notify departing refs (cleanup or null) and
  // seed newly-added refs with the currently-mounted node. The "attached"
  // snapshot tracks the refs React last wrote to via the merged callback,
  // so re-renders that DON'T change the DOM node still propagate ref-array
  // diffs without re-writing refs React already handled.
  React.useLayoutEffect(() => {
    const next = refsRef.current;
    const attached = attachedRefsRef.current;
    const node = nodeRef.current;

    for (const ref of attached) {
      if (!next.includes(ref)) runCleanup(ref);
    }
    if (node !== null) {
      for (const ref of next) {
        if (!attached.includes(ref)) writeRef(ref, node);
      }
    }

    attachedRefsRef.current = next;
  });

  // Final teardown: run all captured cleanups on full unmount.
  React.useEffect(() => {
    return () => {
      for (const [ref, cleanup] of cleanupsRef.current) {
        cleanup();
        cleanupsRef.current.delete(ref);
      }
    };
  }, []);

  // Stable outer callback that writes to every ref in the current array.
  return React.useCallback((node: T | null) => {
    nodeRef.current = node;
    if (node === null) {
      // Detach: run captured cleanups, or fall back to ref(null) / current=null.
      for (const ref of attachedRefsRef.current) {
        runCleanup(ref);
      }
      attachedRefsRef.current = [];
      return;
    }
    for (const ref of refsRef.current) {
      writeRef(ref, node);
    }
    attachedRefsRef.current = refsRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
