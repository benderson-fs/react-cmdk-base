import * as React from "react";

export interface UseControllableOptions<T> {
  /** Controlled value. When defined, the hook is in controlled mode. */
  prop: T | undefined;
  /** Initial value for uncontrolled mode. Read only on first render. */
  defaultProp: T;
  /** Called whenever the value should change. Fires in both modes. */
  onChange?: (next: T) => void;
}

export type UseControllableResult<T> = [
  value: T,
  setValue: (next: T) => void,
];

/**
 * Merge a controlled prop and an uncontrolled default into a single
 * value + setter pair, matching the semantics of Radix's
 * `useControllableState`.
 *
 * - `prop === undefined` → uncontrolled: the hook owns internal state.
 *   `setValue` updates internal state and fires `onChange`.
 * - `prop !== undefined` → controlled: the returned value is `prop`.
 *   `setValue` fires `onChange` but does NOT update any internal state;
 *   the parent is responsible for reflecting the change via `prop`.
 *
 * `defaultProp` is only read on the first render — later changes are
 * ignored, mirroring the contract of every `defaultValue`-style prop.
 *
 * The returned `setValue` reference is wrapped in `useCallback` keyed on
 * `onChange`, so consumers can pass it directly into context without
 * thrashing memoization (assuming they stabilise `onChange` themselves).
 *
 * Switching from uncontrolled to controlled is allowed (and useful for
 * progressive enhancement). After the switch the controlled value wins;
 * the hook does NOT fire `onChange` on the toggle itself.
 */
export function useControllable<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableOptions<T>): UseControllableResult<T> {
  const [internal, setInternal] = React.useState<T>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? (prop as T) : internal;

  // Hold the latest `prop` in a ref so the setter reads the mode at
  // call time rather than at render time. This avoids writing to a ref
  // during render (which is a React 18 concurrent-render hazard).
  const propRef = React.useRef(prop);
  React.useEffect(() => {
    propRef.current = prop;
  });

  const setValue = React.useCallback(
    (next: T) => {
      if (propRef.current === undefined) setInternal(next);
      onChange?.(next);
    },
    [onChange],
  );

  return [value, setValue];
}
