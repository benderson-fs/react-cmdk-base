import * as React from "react";
import { cn } from "./cn";

type AnyProps = Record<string, unknown>;

export interface SlotProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

/**
 * Radix-style Slot. Renders its single child with merged props:
 *   - `className`: concatenated (parent first, then child)
 *   - `style`: merged (child wins on key collisions)
 *   - event handlers (props starting with `on`): composed so the parent
 *     handler runs first; if the parent calls `event.preventDefault()`
 *     (or otherwise sets `defaultPrevented`), the child handler is skipped.
 *     This matches Radix's `composeEventHandlers` semantics — the Slot user
 *     (parent) can cancel the child's default behavior.
 *   - All other props: child wins on collision (so a child can override
 *     `type`, `role`, etc.).
 *
 * Forwards `ref` to the child via React 19 ref-as-prop on the cloned element.
 */
export const Slot = React.forwardRef<unknown, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef,
) {
  if (!React.isValidElement(children)) {
    throw new Error(
      "Slot: `children` must be a single React element when using asChild.",
    );
  }
  const childProps = (children.props ?? {}) as AnyProps;
  const merged: AnyProps = { ...slotProps };

  for (const key of Object.keys(childProps)) {
    const childValue = childProps[key];
    const parentValue = (slotProps as AnyProps)[key];

    if (key === "className") {
      merged.className = cn(
        slotProps.className as string | undefined,
        childValue as string | undefined,
      );
    } else if (key === "style") {
      merged.style = {
        ...(parentValue as React.CSSProperties | undefined),
        ...(childValue as React.CSSProperties | undefined),
      };
    } else if (
      typeof childValue === "function" &&
      typeof parentValue === "function" &&
      key.startsWith("on")
    ) {
      merged[key] = (...args: unknown[]) => {
        (parentValue as (...a: unknown[]) => unknown)(...args);
        const event = args[0] as { defaultPrevented?: boolean } | undefined;
        if (event?.defaultPrevented) return;
        (childValue as (...a: unknown[]) => unknown)(...args);
      };
    } else {
      merged[key] = childValue;
    }
  }

  // React 19 ref-as-prop on cloneElement: pass through both forwarded and child ref.
  const childRef = (children as { ref?: React.Ref<unknown> }).ref;
  merged.ref = mergeRefs(forwardedRef, childRef);

  return React.cloneElement(children, merged);
});

function mergeRefs<T>(
  a: React.Ref<T> | undefined,
  b: React.Ref<T> | undefined,
): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of [a, b]) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}
