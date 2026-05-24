import * as React from "react";
import { cn } from "./cn";
import { useMergedRef } from "./use-merged-ref";

type AnyProps = Record<string, unknown>;

export interface SlotProps {
  children: React.ReactNode;
  /**
   * Props that win over the child's same-named props on collision. Use
   * for library-identity attributes (e.g. `data-slot`) that should not
   * be overridable through `asChild`.
   *
   * Applied AFTER all other merge logic with a literal replace — `className`
   * is NOT concatenated, `style` is NOT merged, and event handlers are NOT
   * composed when supplied here. Do not include `ref` in `forceProps`; it
   * will silently override the merged ref produced by `useMergedRef`.
   */
  forceProps?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Radix-style Slot. Renders its single child with merged props:
 *   - `className`: concatenated (parent first, then child)
 *   - `style`: merged (child wins on key collisions)
 *   - event handlers (props starting with `on`): composed so the parent
 *     handler runs first; if the parent calls `event.preventDefault()`
 *     or Base UI sets `event.baseUIHandlerPrevented`, the child handler
 *     is skipped. This matches both Radix's composeEventHandlers and
 *     Base UI's preventBaseUIHandler semantics.
 *   - All other props: child wins on collision (so a child can override
 *     `type`, `role`, etc.) — UNLESS overridden by `forceProps`, which
 *     wins for library-identity attributes the consumer should not be
 *     able to replace via asChild.
 *
 * Ref handling uses `useMergedRef`: identity is stable across renders,
 * cleanup functions returned from callback refs are honored, and
 * refs added/removed across renders are notified appropriately.
 * `forceProps` can lock library-identity attrs (e.g. `data-slot`) that
 * the asChild child must not override.
 */
export const Slot = React.forwardRef<unknown, SlotProps>(function Slot(
  { children, forceProps, ...slotProps },
  forwardedRef,
) {
  if (process.env.NODE_ENV !== "production") {
    if (
      forceProps &&
      typeof forceProps === "object" &&
      "ref" in forceProps
    ) {
      console.error(
        "Slot: `ref` in `forceProps` is not supported and will silently " +
          "override the merged ref. Pass refs via the normal `ref` prop.",
      );
    }
  }
  // Extract child ref unconditionally so hook order is stable across renders.
  const childRef = React.isValidElement(children)
    ? ((children.props as { ref?: React.Ref<unknown> }).ref ??
       (children as { ref?: React.Ref<unknown> }).ref)
    : undefined;
  const mergedRef = useMergedRef(
    forwardedRef as React.Ref<unknown>,
    childRef,
  );

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
        const event = args[0] as
          | {
              defaultPrevented?: boolean;
              baseUIHandlerPrevented?: boolean;
            }
          | undefined;
        if (event?.defaultPrevented) return;
        if (event?.baseUIHandlerPrevented) return;
        (childValue as (...a: unknown[]) => unknown)(...args);
      };
    } else {
      // Preserve parent EVENT HANDLERS when the child explicitly passes
      // undefined — matches Radix Slot semantics (undefined on a handler is
      // a no-op, not a clear). For non-event props (disabled, aria-*, type,
      // role, etc.), undefined IS a meaningful "clear" signal and the child
      // wins. Without this scoping, a consumer writing
      // <button disabled={undefined}> to override an outer disabled={true}
      // would silently keep the disabled state.
      if (
        key.startsWith("on") &&
        childValue === undefined &&
        parentValue !== undefined
      ) {
        // Keep the parent handler from the initial spread.
      } else {
        merged[key] = childValue;
      }
    }
  }

  merged.ref = mergedRef;
  if (forceProps) {
    const fp = forceProps as Record<string, unknown>;
    for (const key of Object.keys(fp)) {
      merged[key] = fp[key];
    }
  }
  return React.cloneElement(children, merged);
});
