import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import {
  SearchInputContext,
  useSearchInput,
  isInFlight,
  type SearchInputContextValue,
  type SearchInputMessage,
  type SearchInputStatus,
} from "./context";
import {
  CommandCoreProvider,
  useCommandCore,
  type CommandCoreFilter,
} from "../internal/command-core";
import { useControllable } from "../lib/use-controllable";
import { useMergedRef } from "../lib/use-merged-ref";
import { cn } from "../lib/cn";

function SearchInputComboboxBridge({
  loop,
  children,
}: {
  loop: boolean;
  children: React.ReactNode;
}) {
  const { query, setQuery, fireSelect } = useCommandCore();
  const { resultsOpen, setResultsOpen } = useSearchInput();
  return (
    <Combobox.Root
      inline
      autoHighlight
      openOnInputClick={false}
      loopFocus={loop}
      open={resultsOpen}
      onOpenChange={setResultsOpen}
      inputValue={query}
      onInputValueChange={(v: string) => setQuery(v)}
      onValueChange={(value: string | null) => {
        if (value !== null) fireSelect(value);
      }}
    >
      {children}
    </Combobox.Root>
  );
}

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
  /** Override the result match function. Applied to all popup items via
   * the internal CommandCoreProvider. Default: case-insensitive substring
   * match against label and keywords. */
  filter?: CommandCoreFilter;
  label?: string;
  /** When true, arrow-key navigation in the popup loops back to the first
   * option after the last. Default: true. */
  loop?: boolean;
  /**
   * Currently-selected scope value (controlled mode). NOTE: `useControllable`
   * treats `undefined` as "uncontrolled" — passing `scope={undefined}`
   * silently puts the component in uncontrolled mode where setScope only
   * fires onScopeChange but does not flip the value. To express "controlled
   * with no scope selected," pass an empty string `scope=""` or a sentinel
   * value and handle the empty case in your `onScopeChange`. Pair with
   * `onScopeChange` and (optionally) `defaultScope`.
   */
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
  const mergedFormRef = useMergedRef(formRef, ref);
  const idPrefix = React.useId();
  const inputId = `${idPrefix}-input`;
  const popupId = `${idPrefix}-popup`;

  const submit = React.useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  // Page state is owned by Root so we can reset it on resubmit without
  // remounting CommandCoreProvider. The inner provider receives `page`
  // controlled and pushes onto its own stack on drill-down; resetting
  // to "root" externally clears that stack via the provider's effect.
  const [page, setPage] = React.useState<string>("root");
  const resetPage = React.useCallback(() => {
    setPage("root");
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
      resetPage();
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
    [
      status,
      query,
      scope,
      resetPage,
      setCommittedQuery,
      setResultsOpen,
      onSubmit,
    ],
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
      formRef,
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

  return (
    <SearchInputContext.Provider value={ctxValue}>
      <CommandCoreProvider
        page={page}
        onPageChange={setPage}
        query={committedQuery}
        filter={filter}
        onClose={() => setResultsOpen(false)}
      >
        <SearchInputComboboxBridge loop={loop}>
          <form
            ref={mergedFormRef}
            {...formProps}
            role="search"
            aria-label={label}
            data-slot="search-input-root"
            data-collapsible={collapsible ? "" : undefined}
            data-state={
              collapsible ? (collapsed ? "collapsed" : "expanded") : undefined
            }
            className={cn("si-root", className)}
            onSubmit={handleSubmit}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onFocus={handleFocus}
          >
            <span
              role="status"
              aria-live="polite"
              className="si-sr-only"
              data-slot="search-input-status"
            >
              {isInFlight(status) ? "Searching" : ""}
            </span>
            {children}
          </form>
        </SearchInputComboboxBridge>
      </CommandCoreProvider>
    </SearchInputContext.Provider>
  );
});

SearchInputRoot.displayName = "SearchInput.Root";
