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
    const explicitAriaLabel =
      ariaLabelProp && ariaLabelProp.trim().length > 0
        ? { "aria-label": ariaLabelProp }
        : {};
    // asChild path: deliberately omit e.preventDefault() so consumer-rendered
    // <Link>/<a> navigation still fires. onClick is passed as a regular Slot
    // prop (NOT in forceProps), so Slot composes it with the consumer child's
    // onClick rather than replacing it. data-slot stays in forceProps as a
    // library-identity attribute the consumer must not override.
    return (
      <Combobox.Item
        value={value}
        disabled={disabled}
        {...explicitAriaLabel}
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
