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
  // Initial value handles first mount; subsequent renders update via the
  // layout effect below.
  //
  // NOTE: do NOT write `refsRef.current = refs` during render. That's a
  // concurrent-render hazard (aborted renders still mutate the ref). See
  // src/lib/use-controllable.ts for the same pattern + explanation.
  const refsRef = React.useRef<Array<AnyRef<T>>>(refs);
  const attachedRefsRef = React.useRef<Array<AnyRef<T>>>([]);
  const nodeRef = React.useRef<T | null>(null);
  const cleanupsRef = React.useRef<Map<AnyRef<T>, CleanupFn>>(new Map());

  // Attach a non-null node to a single ref. Callers must route the null
  // path through `runCleanup` — this function never writes null.
  function writeRef(ref: AnyRef<T>, node: T) {
    if (!ref) return;
    if (typeof ref === "function") {
      const result = ref(node);
      if (typeof result === "function") {
        cleanupsRef.current.set(ref, result as CleanupFn);
      } else if (
        process.env.NODE_ENV !== "production" &&
        result !== undefined &&
        result !== null
      ) {
        // Catches common misuses: an `async` callback ref returns a
        // Promise (typeof "object"), or a consumer forgot to wrap a
        // cleanup function and returned its return value instead.
        console.error(
          "useMergedRef: callback ref returned a non-function value " +
            `(${typeof result}); cleanup will not run on detach. ` +
            "Callback refs returning a value must return a cleanup function.",
        );
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
    // Commit the latest refs array here (NOT during render) so aborted
    // concurrent renders don't leak into ref state.
    refsRef.current = refs;
    const next = refs;
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

  // Final teardown: run all captured cleanups on full unmount. Uses
  // useLayoutEffect so cleanup is synchronous (matching React 19's
  // callback-ref cleanup contract), rather than deferring to the passive
  // phase after paint.
  React.useLayoutEffect(() => {
    return () => {
      // Wrap each cleanup so a single throwing consumer doesn't prevent
      // the remaining cleanups from running and leave cleanupsRef in an
      // inconsistent state. React would otherwise log this as an opaque
      // "error in cleanup of useLayoutEffect" with no operation context.
      for (const [, cleanup] of cleanupsRef.current) {
        try {
          cleanup();
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.error("useMergedRef: cleanup function threw", err);
          }
        }
      }
      cleanupsRef.current.clear();
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
