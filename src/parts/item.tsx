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
  children,
}: CommandMenuItemProps) {
  const { fireSelect, registerItem, query, registerMatch, unregisterMatch, filter } =
    useCommandMenu();
  const label = React.useMemo(
    () => getLabelFromChildren(children) || value,
    [children, value],
  );

  React.useEffect(() => {
    return registerItem(value, { onSelect, keepOpen });
  }, [registerItem, value, onSelect, keepOpen]);

  const matched = filter(query, label, keywords);
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
    return (
      <Combobox.Item
        value={value}
        disabled={disabled}
        aria-label={label}
        className={itemClassName}
        render={
          <Slot
            data-slot="command-menu-item"
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
      aria-label={label}
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
