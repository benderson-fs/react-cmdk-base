import * as React from "react";

type AnyRef<T> =
  | React.RefCallback<T>
  | React.MutableRefObject<T | null>
  | React.RefObject<T | null>
  | null
  | undefined;

/**
 * Merge multiple refs into a single ref callback so a component can both
 * accept a `ref` prop AND keep an internal ref to the same node.
 *
 * Returns a stable callback (identity preserved across renders), so the
 * merged element does not detach and reattach when the parent re-renders.
 * On unmount React calls the callback with `null`, which clears every
 * object ref's `.current` and forwards `null` to every callback ref.
 */
export function useMergedRef<T>(
  ...refs: Array<AnyRef<T>>
): React.RefCallback<T> {
  const refsRef = React.useRef(refs);
  refsRef.current = refs;
  return React.useCallback((node: T | null) => {
    for (const ref of refsRef.current) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  }, []);
}
