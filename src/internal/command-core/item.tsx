// src/internal/command-core/item.tsx
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useCommandCore } from "./hooks";
import { Slot } from "../../lib/slot";

export interface CommandCoreItemProps {
  value: string;
  keywords?: string[];
  keepOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  trailClassName?: string;
  trailing?: React.ReactNode;
  asChild?: boolean;
  forceMount?: boolean;
  "aria-label"?: string;
  /** Default "command-core-item"; consumer wrappers override. */
  "data-slot"?: string;
  children: React.ReactNode;
}

function getLabelFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getLabelFromChildren).join(" ");
  }
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return getLabelFromChildren(props.children);
  }
  return "";
}

// Detects whether a React tree carries its own accessible name via text,
// aria-label, aria-labelledby, <img alt>, or <title> (e.g. inside <svg>).
// Used in the asChild branch to decide whether to apply the value-based
// aria-label fallback — when the consumer's children already provide a
// name, we must NOT override it.
function hasAccessibleNameInTree(node: React.ReactNode): boolean {
  if (node == null || typeof node === "boolean") return false;
  if (typeof node === "string" || typeof node === "number") {
    return String(node).trim().length > 0;
  }
  if (Array.isArray(node)) {
    return node.some(hasAccessibleNameInTree);
  }
  if (!React.isValidElement(node)) return false;
  const props = node.props as {
    "aria-label"?: unknown;
    "aria-labelledby"?: unknown;
    alt?: unknown;
    children?: React.ReactNode;
  };
  if (
    typeof props["aria-label"] === "string" &&
    props["aria-label"].trim().length > 0
  ) {
    return true;
  }
  if (
    typeof props["aria-labelledby"] === "string" &&
    props["aria-labelledby"].trim().length > 0
  ) {
    return true;
  }
  if (
    node.type === "img" &&
    typeof props.alt === "string" &&
    props.alt.trim().length > 0
  ) {
    return true;
  }
  if (node.type === "title") return true;
  return hasAccessibleNameInTree(props.children);
}

export function CommandCoreItem({
  value,
  keywords,
  keepOpen = false,
  icon: Icon,
  disabled,
  onSelect,
  className,
  iconClassName,
  labelClassName,
  trailClassName,
  trailing,
  asChild,
  forceMount,
  "aria-label": ariaLabelProp,
  "data-slot": dataSlot = "command-core-item",
  children,
}: CommandCoreItemProps) {
  const {
    fireSelect,
    registerItem,
    query,
    registerMatch,
    unregisterMatch,
    filter,
  } = useCommandCore();
  const label = React.useMemo(
    () => getLabelFromChildren(children) || value,
    [children, value],
  );

  const accessibleName =
    ariaLabelProp && ariaLabelProp.trim().length > 0
      ? ariaLabelProp
      : label;

  React.useEffect(() => {
    return registerItem(value, { onSelect, keepOpen });
  }, [registerItem, value, onSelect, keepOpen]);

  const matched = filter(query, accessibleName, keywords);
  const reportedMatch = forceMount ? false : matched;
  React.useLayoutEffect(() => {
    registerMatch(value, reportedMatch);
    return () => unregisterMatch(value);
  }, [registerMatch, unregisterMatch, value, reportedMatch]);

  if (!matched && !forceMount) return null;

  const itemClassName = className;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) fireSelect(value);
  };

  if (asChild) {
    // asChild path. Two notes:
    //
    // 1. The Slot-level onClick is the only path that calls fireSelect for
    //    asChild anchor items. Base UI's Combobox.Item early-returns from
    //    its own onValueChange dispatch when the click target is inside an
    //    <a href> (search "Let the link handle the click" in Base UI's
    //    combobox source). e.preventDefault is intentionally omitted so the
    //    consumer's <Link>/<a> navigation still fires. onClick is composed
    //    (not in forceProps) so Slot merges it with the child's onClick.
    //
    // 2. aria-label policy:
    //      - consumer-supplied non-empty -> use it
    //      - else if children carry an inherent accessible name (text,
    //        aria-label, aria-labelledby, <img alt>, <title>) -> do NOT
    //        set aria-label, let the browser compute the name from children
    //      - else (icon-only with no name) -> fall back to accessibleName
    //        (derived label or value) so the option has at least some name
    //
    // data-slot stays in forceProps so a child element's data-slot can't
    // override the library identity attribute.
    const consumerLabel =
      ariaLabelProp && ariaLabelProp.trim().length > 0 ? ariaLabelProp : null;
    const ariaLabel =
      consumerLabel ??
      (hasAccessibleNameInTree(children) ? undefined : accessibleName);
    return (
      <Combobox.Item
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        className={itemClassName}
        render={
          <Slot
            forceProps={{ "data-slot": dataSlot }}
            onClick={() => {
              if (!disabled) fireSelect(value);
            }}
          >
            {children as React.ReactElement}
          </Slot>
        }
      />
    );
  }

  return (
    <Combobox.Item
      value={value}
      disabled={disabled}
      data-slot={dataSlot}
      aria-label={accessibleName}
      className={itemClassName}
      onClick={handleClick}
    >
      {Icon ? <Icon className={iconClassName} /> : null}
      <span className={labelClassName}>{children}</span>
      {trailing ? <span className={trailClassName}>{trailing}</span> : null}
    </Combobox.Item>
  );
}

CommandCoreItem.displayName = "CommandCore.Item";
