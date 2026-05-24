import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import { cn } from "../lib/cn";
import { useSearchInput } from "./context";

export interface SearchInputToolsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Plain-`<div>` container for the controls row. Use this when there's
 * a single control or when the row isn't a logical group needing
 * arrow-key navigation.
 *
 * For two or more interactive controls (scope picker + Submit, etc.),
 * prefer {@link SearchInputToolbar}, which provides `role="toolbar"`
 * and arrow-key roving focus per the WAI-ARIA toolbar pattern.
 * Annotating a control group with `role="toolbar"` without roving
 * focus is an a11y anti-pattern, which is why this component stays a
 * plain div.
 *
 * Honors the `collapsed` state from context: when the SearchInput is
 * collapsed, this container is hidden via the `hidden` attribute
 * (preserves consumer-passed `hidden`).
 */
export function SearchInputTools({
  className,
  hidden,
  ...props
}: SearchInputToolsProps) {
  const { collapsed } = useSearchInput();
  const isHidden = Boolean(hidden) || collapsed;
  return (
    <div
      data-slot="search-input-tools"
      className={cn("si-tools", className)}
      {...props}
      hidden={isHidden}
      {...(isHidden ? { inert: true } : {})}
      aria-hidden={isHidden || undefined}
    />
  );
}

SearchInputTools.displayName = "SearchInput.Tools";

export interface SearchInputToolbarProps
  extends Omit<
    React.ComponentProps<typeof Toolbar.Root>,
    "className" | "render"
  > {
  className?: string;
}

/**
 * WAI-ARIA toolbar wrapper for the SearchInput controls row. Provides
 * arrow-key roving focus and `role="toolbar"`. Children should be
 * `<Toolbar.Button render={<SearchInput.Button .../>} />` (or any
 * trigger from this package, which renders a button under the hood).
 *
 * Prefer this over `<SearchInput.Tools>` when you have two or more
 * controls in the row — Tools is a plain div kept for non-toolbar
 * layouts (e.g. a single Submit).
 *
 * Honors the `collapsed` state from context: when the SearchInput is
 * collapsed, this container is hidden via the `hidden` attribute
 * (preserves consumer-passed `hidden`).
 */
export function SearchInputToolbar({
  className,
  hidden,
  ...props
}: SearchInputToolbarProps) {
  const { collapsed } = useSearchInput();
  const isHidden = Boolean(hidden) || collapsed;
  return (
    <Toolbar.Root
      data-slot="search-input-toolbar"
      className={cn("si-toolbar", className)}
      {...props}
      hidden={isHidden}
      {...(isHidden ? { inert: true } : {})}
      aria-hidden={isHidden || undefined}
    />
  );
}

SearchInputToolbar.displayName = "SearchInput.Toolbar";
