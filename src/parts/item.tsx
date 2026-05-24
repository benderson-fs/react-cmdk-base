import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useCommandMenu } from "../hooks/use-command-menu";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";

export interface CommandMenuItemProps {
  value: string;
  keywords?: string[];
  keepOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
  trailing?: React.ReactNode;
  /**
   * When true, render the child element instead of the default Combobox.Item
   * wrapper. The child receives the row className, click handler, and
   * `aria-disabled` — useful for nesting a Link or custom Button.
   */
  asChild?: boolean;
  /**
   * When true, render the item regardless of the current query. The item
   * is NOT counted as a match, so `<CommandMenu.Empty>` still appears
   * when no real matches exist. Useful for catch-all actions like
   * "Create new …".
   */
  forceMount?: boolean;
  /**
   * Override the derived accessible name **and** the filter target.
   * By default both are read from the item's text children (falling
   * back to `value`). Pass `aria-label` for icon-only items so they
   * are reachable by typing the visible/spoken name rather than the
   * machine `value`. An empty string or whitespace-only value is
   * treated as "no override" — the derived label is used.
   */
  "aria-label"?: string;
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


export function CommandMenuItem({
  value,
  keywords,
  keepOpen = false,
  icon: Icon,
  disabled,
  onSelect,
  className,
  trailing,
  asChild,
  forceMount,
  "aria-label": ariaLabelProp,
  children,
}: CommandMenuItemProps) {
  const { fireSelect, registerItem, query, registerMatch, unregisterMatch, filter } =
    useCommandMenu();
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
  // forceMount items report `false` so they never enter the match set —
  // <Empty> still appears when no real matches exist, even if a
  // force-mounted item's label coincidentally matches the query.
  const reportedMatch = forceMount ? false : matched;
  React.useLayoutEffect(() => {
    registerMatch(value, reportedMatch);
    return () => unregisterMatch(value);
  }, [registerMatch, unregisterMatch, value, reportedMatch]);

  if (!matched && !forceMount) return null;

  const itemClassName = cn("cmdk-item", className);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) fireSelect(value);
  };

  if (asChild) {
    // Only set aria-label when the consumer explicitly provided one.
    // For text-bearing children (e.g. <a>Visit docs</a>), the child's
    // natural accessible name should prevail. For icon-only children
    // with no text, the consumer must pass aria-label to get an
    // accessible name — same contract as the non-asChild path.
    const explicitAriaLabel =
      ariaLabelProp && ariaLabelProp.trim().length > 0
        ? { "aria-label": accessibleName }
        : {};
    return (
      <Combobox.Item
        value={value}
        disabled={disabled}
        {...explicitAriaLabel}
        className={itemClassName}
        render={
          <Slot
            forceProps={{ "data-slot": "command-menu-item" }}
            // asChild path intentionally omits e.preventDefault(): Slot
            // composes parent → child handlers but SKIPS the child if the
            // parent calls preventDefault, which would block a consumer's
            // onClick (e.g. a Next.js <Link> routing handler). The child
            // element's native default behavior is the consumer's call.
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
      data-slot="command-menu-item"
      value={value}
      disabled={disabled}
      aria-label={accessibleName}
      className={itemClassName}
      onClick={handleClick}
    >
      {Icon ? <Icon className="cmdk-item-icon" /> : null}
      <span className="cmdk-item-label">{children}</span>
      {trailing ? <span className="cmdk-item-trail">{trailing}</span> : null}
    </Combobox.Item>
  );
}

CommandMenuItem.displayName = "CommandMenu.Item";
