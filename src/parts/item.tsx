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

function matchesQuery(
  query: string,
  label: string,
  keywords: string[] | undefined,
): boolean {
  if (!query) return true;
  if (keywords?.includes("*")) return true;
  const q = query.toLowerCase();
  if (label.toLowerCase().includes(q)) return true;
  return (keywords ?? []).some((k) => k.toLowerCase().includes(q));
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
  children,
}: CommandMenuItemProps) {
  const { fireSelect, registerItem, query } = useCommandMenu();
  const label = React.useMemo(
    () => getLabelFromChildren(children) || value,
    [children, value],
  );

  React.useEffect(() => {
    return registerItem(value, { onSelect, keepOpen });
  }, [registerItem, value, onSelect, keepOpen]);

  if (!matchesQuery(query, label, keywords)) return null;

  const itemClassName = cn("cmdk-item", className);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) fireSelect(value);
  };

  if (asChild) {
    return (
      <Slot
        className={itemClassName}
        onClick={handleClick}
        aria-disabled={disabled || undefined}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <Combobox.Item
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
