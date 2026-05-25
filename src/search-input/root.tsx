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
  // NOTE: do NOT wire `open`/`onOpenChange` to our user-visible
  // `resultsOpen` here. Base UI's Combobox calls `setOpen(true)` on every
  // input change (REASONS.inputChange) — if we surface that to
  // `setResultsOpen`, the popover pops open mid-typing and focus moves
  // into the listbox. The popover's user-visible open/close lives on the
  // Popover.Root inside SearchInputResults; this Combobox's own internal
  // open state stays uncontrolled and is purely an implementation detail
  // for the listbox layer (matches CommandMenuComboboxBridge in
  // src/parts/root.tsx). The popover opens only via handleSubmit calling
  // setResultsOpen(true) after a successful commit.
  return (
    <Combobox.Root
      inline
      autoHighlight
      openOnInputClick={false}
      loopFocus={loop}
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
    | "onSubmit"
    | "onError"
    | "defaultValue"
    // The library locks these at runtime via JSX later-wins. Omit them
    // from the type so consumers see the contract at compile time too.
    // `data-*` keys can't be cleanly omitted (no explicit declaration in
    // React's HTMLAttributes) — those are documented as locked.
    | "role"
    | "aria-label"
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
   * Currently-selected scope value (controlled mode).
   *
   * **Footgun warning:** `useControllable` treats `undefined` as
   * "uncontrolled." Passing `scope={undefined}` from e.g.
   * `useState<string | undefined>()` will silently put the component into
   * uncontrolled mode — internal state then takes over rendering and your
   * continuously-passed value no longer wins. To express "controlled with
   * no selection," pass `scope={null}` (preferred) or an empty string
   * `scope=""`; both are valid controlled values that stay in controlled
   * mode. Pair with `onScopeChange` and (optionally) `defaultScope`.
   *
   * In development, a runtime warning fires when scope transitions from a
   * defined value to `undefined`, since that's the bait pattern.
   */
  scope?: string | null;
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
  const [scope, setScopeRaw] = useControllable<string | null | undefined>({
    prop: scopeProp,
    defaultProp: defaultScope,
    onChange: onScopeChange
      ? (next) => {
          if (next != null) onScopeChange(next);
        }
      : undefined,
  });
  const setScope = React.useCallback(
    (next: string) => {
      setScopeRaw(next);
    },
    [setScopeRaw],
  );
  // Surface scope to message and context as `string | undefined` — both
  // `null` and `undefined` mean "no selection" downstream. `null` is only
  // a public input form, not part of the consumer-facing read surface.
  const scopeValue = scope ?? undefined;

  // Dev-only: warn when `scope` flips from a defined value to undefined.
  // That's the footgun documented above — it silently switches the hook
  // into uncontrolled mode. Consumers expressing "no selection" should
  // pass `null` (or "") instead of `undefined`.
  const prevScopePropRef = React.useRef(scopeProp);
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const prev = prevScopePropRef.current;
      if (prev !== undefined && scopeProp === undefined) {
        // eslint-disable-next-line no-console
        console.warn(
          "[SearchInput.Root] `scope` transitioned from a defined value to `undefined`. " +
            "This switches the component to uncontrolled mode and internal state takes over. " +
            "To express \"controlled with no selection\", pass `scope={null}` (or `scope=\"\"`) instead.",
        );
      }
    }
    prevScopePropRef.current = scopeProp;
  }, [scopeProp]);

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
      const message: SearchInputMessage = { query, scope: scopeValue };
      let result: void | Promise<void>;
      try {
        result = onSubmit(message, event);
      } catch {
        // Sync throw — abort the submit before mutating popup state. Without
        // this ordering the popup would open over the new committedQuery with
        // no signal to the consumer that the dispatch failed.
        return;
      }
      // Sync portion of onSubmit returned without throwing — safe to commit.
      resetPage();
      setCommittedQuery(query);
      setResultsOpen(true);
      if (result instanceof Promise) {
        try {
          await result;
        } catch {
          // Async rejection — committedQuery/resultsOpen stay; the request
          // was successfully dispatched, only the response failed. Consumer
          // surfaces this via status="error".
        }
      }
    },
    [
      status,
      query,
      scopeValue,
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
      scope: scopeValue,
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
      scopeValue,
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
