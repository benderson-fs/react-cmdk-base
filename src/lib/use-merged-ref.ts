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
 * Callback refs receive `null` on unmount; object refs are cleared by
 * React itself, so we don't reassign them on unmount.
 */
export function useMergedRef<T>(...refs: Array<AnyRef<T>>): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (!ref) continue;
        if (typeof ref === "function") {
          ref(node);
        } else {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}
