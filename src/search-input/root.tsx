import * as React from "react";
import {
  SearchInputContext,
  isInFlight,
  type SearchInputContextValue,
  type SearchInputMessage,
  type SearchInputStatus,
} from "./context";
import type { CommandCoreFilter } from "../internal/command-core";
import { useControllable } from "../lib/use-controllable";
import { cn } from "../lib/cn";

export interface SearchInputRootProps
  extends Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    "onSubmit" | "onError" | "defaultValue"
  > {
  onSubmit: (
    message: SearchInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  committedQuery?: string;
  defaultCommittedQuery?: string;
  onCommittedQueryChange?: (q: string) => void;
  resultsOpen?: boolean;
  defaultResultsOpen?: boolean;
  onResultsOpenChange?: (open: boolean) => void;
  status?: SearchInputStatus;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  filter?: CommandCoreFilter;
  label?: string;
  loop?: boolean;
  scope?: string;
  defaultScope?: string;
  onScopeChange?: (scope: string) => void;
  children: React.ReactNode;
}

export const SearchInputRoot = React.forwardRef<
  HTMLFormElement,
  SearchInputRootProps
>(function SearchInputRoot(
  {
    onSubmit,
    query: queryProp,
    defaultQuery = "",
    onQueryChange,
    committedQuery: committedQueryProp,
    defaultCommittedQuery = "",
    onCommittedQueryChange,
    resultsOpen: resultsOpenProp,
    defaultResultsOpen = false,
    onResultsOpenChange,
    status = "idle",
    collapsible = true,
    collapsed: collapsedProp,
    defaultCollapsed,
    onCollapsedChange,
    filter,
    label = "Search",
    loop = true,
    scope: scopeProp,
    defaultScope,
    onScopeChange,
    className,
    children,
    ...formProps
  },
  ref,
) {
  const [query, setQuery] = useControllable<string>({
    prop: queryProp,
    defaultProp: defaultQuery,
    onChange: onQueryChange,
  });
  const [committedQuery, setCommittedQuery] = useControllable<string>({
    prop: committedQueryProp,
    defaultProp: defaultCommittedQuery,
    onChange: onCommittedQueryChange,
  });
  const [resultsOpen, setResultsOpen] = useControllable<boolean>({
    prop: resultsOpenProp,
    defaultProp: defaultResultsOpen,
    onChange: onResultsOpenChange,
  });
  const [collapsedRaw, setCollapsedRaw] = useControllable<boolean>({
    prop: collapsedProp,
    defaultProp: collapsible ? (defaultCollapsed ?? true) : false,
    onChange: onCollapsedChange,
  });
  const collapsed = collapsible ? collapsedRaw : false;
  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (!collapsible) return;
      setCollapsedRaw(next);
    },
    [collapsible, setCollapsedRaw],
  );
  const [scope, setScopeRaw] = useControllable<string | undefined>({
    prop: scopeProp,
    defaultProp: defaultScope,
    onChange: onScopeChange
      ? (next) => {
          if (next !== undefined) onScopeChange(next);
        }
      : undefined,
  });
  const setScope = React.useCallback(
    (next: string) => {
      setScopeRaw(next);
    },
    [setScopeRaw],
  );

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const idPrefix = React.useId();
  const inputId = `${idPrefix}-input`;
  const popupId = `${idPrefix}-popup`;

  const submit = React.useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  const collapseTimerRef = React.useRef<number | null>(null);

  const isEmptyForCollapse = React.useCallback(() => {
    return (
      query.length === 0 && !isInFlight(status) && !resultsOpen
    );
  }, [query, status, resultsOpen]);

  const handlePointerEnter = React.useCallback(
    (e: React.PointerEvent<HTMLFormElement>) => {
      formProps.onPointerEnter?.(e);
      if (e.defaultPrevented) return;
      if (!collapsible) return;
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      if (collapsed) setCollapsed(false);
    },
    [collapsible, collapsed, setCollapsed, formProps],
  );

  const handlePointerLeave = React.useCallback(
    (e: React.PointerEvent<HTMLFormElement>) => {
      formProps.onPointerLeave?.(e);
      if (e.defaultPrevented) return;
      if (!collapsible) return;
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
      }
      collapseTimerRef.current = window.setTimeout(() => {
        collapseTimerRef.current = null;
        const form = formRef.current;
        if (!form) return;
        if (form.contains(document.activeElement)) return;
        if (!isEmptyForCollapse()) return;
        setCollapsed(true);
      }, 150);
    },
    [collapsible, setCollapsed, isEmptyForCollapse, formProps],
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLFormElement>) => {
      formProps.onFocus?.(e);
      if (e.defaultPrevented) return;
      if (!collapsible) return;
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      if (collapsed) setCollapsed(false);
    },
    [collapsible, collapsed, setCollapsed, formProps],
  );

  React.useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
    };
  }, [collapsible]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isInFlight(status)) return;
      if (query.length === 0) return;
      setCommittedQuery(query);
      setResultsOpen(true);
      const message: SearchInputMessage = { query, scope };
      const result = onSubmit(message, event);
      if (result instanceof Promise) {
        try {
          await result;
        } catch {
          // consumer is responsible for status="error" surfacing
        }
      }
    },
    [status, query, scope, setCommittedQuery, setResultsOpen, onSubmit],
  );

  const ctxValue = React.useMemo<SearchInputContextValue>(
    () => ({
      query,
      setQuery,
      committedQuery,
      status,
      label,
      collapsible,
      collapsed,
      setCollapsed,
      resultsOpen,
      setResultsOpen,
      scope,
      setScope,
      submit,
      inputId,
      popupId,
    }),
    [
      query,
      setQuery,
      committedQuery,
      status,
      label,
      collapsible,
      collapsed,
      setCollapsed,
      resultsOpen,
      setResultsOpen,
      scope,
      setScope,
      submit,
      inputId,
      popupId,
    ],
  );

  const setFormRef = React.useCallback(
    (node: HTMLFormElement | null) => {
      formRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <SearchInputContext.Provider value={ctxValue}>
      <form
        ref={setFormRef}
        role="search"
        aria-label={label}
        data-slot="search-input-root"
        data-collapsible={collapsible ? "" : undefined}
        data-state={
          collapsible ? (collapsed ? "collapsed" : "expanded") : undefined
        }
        className={cn("si-root", className)}
        {...formProps}
        onSubmit={handleSubmit}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
      >
        {children}
      </form>
    </SearchInputContext.Provider>
  );
});

SearchInputRoot.displayName = "SearchInput.Root";
