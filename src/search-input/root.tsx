import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import {
  SearchInputContext,
  SearchInputModalContext,
  isInFlight,
  type SearchInputContextValue,
  type SearchInputMessage,
  type SearchInputMode,
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
  resultsOpen,
  selectedValue,
  defaultSelectedValue,
  query,
  setQuery,
  mutedRef,
  setHighlighted,
  children,
}: {
  loop: boolean;
  resultsOpen: boolean;
  selectedValue: string | null;
  defaultSelectedValue: string | null;
  query: string;
  setQuery: (q: string) => void;
  mutedRef: React.MutableRefObject<boolean>;
  setHighlighted: (v: string | undefined) => void;
  children: React.ReactNode;
}) {
  const { fireSelect, getItemLabel } = useCommandCore();
  // Combobox writes its own inputValue on selection via
  // `stringifyAsLabel(value, itemToStringLabel)` — see
  // node_modules/@base-ui/react/combobox/root/AriaCombobox.js:516. Without
  // a custom itemToStringLabel, Combobox uses `String(value)` (e.g.
  // "alpha"). That input-value write fires our `onInputValueChange` AFTER
  // `onValueChange` → handleItemSelect, overwriting the label write-back
  // with the raw value string. Routing through getItemLabel makes
  // Combobox stringify directly to the registered display label so both
  // paths converge on the same string.
  return (
    <Combobox.Root
      autoHighlight
      openOnInputClick={false}
      loopFocus={loop}
      // Always inline=true so Base UI treats the input as "inputInsidePopup".
      // This sets focusManagerModal=false (= !inputInsidePopup || modal =
      // !true || false = false) which prevents FloatingFocusManager from
      // aria-hiding elements outside the popup. Without this, typing while
      // the panel is open would aria-hide the rest of the page, making form
      // elements (like the Submit button) inaccessible.
      //
      // As a side-effect, inline=true disables Base UI's label write-back
      // path (shouldFillInput = single && !inputInsidePopup = false), so
      // our own handleItemSelect.setQuery is the only write-back path. This
      // eliminates the keepOpen write-back bug and the mute race condition.
      //
      // Visual/functional modal behaviour (backdrop, scroll-lock, dismiss on
      // click-outside) is handled by the Combobox.Backdrop and our own blur
      // / LiveResultsOpenDeriver close paths — not by Base UI's modal flag.
      // The `modal` prop is therefore hardcoded to false here.
      inline
      // ONE-WAY: pass open from consumer-visible resultsOpen; do NOT
      // accept onOpenChange. Combobox's internal setOpen(true,
      // REASONS.inputChange) on each keystroke cannot bubble out.
      open={resultsOpen}
      inputValue={query}
      onInputValueChange={(v: string) => {
        // With inline=true, Base UI never fires itemPress write-back
        // (shouldFillInput=false), so we can unconditionally clear the mute
        // here. The mute is set by handleItemSelect (item selection) and
        // mutePanel (Escape key); it is only cleared when the user types.
        mutedRef.current = false;
        setQuery(v);
      }}
      // Pass null (not undefined) for "no selection" so that Base UI's
      // useControlled hook stays in controlled mode (it checks `!== undefined`).
      // `undefined` would flip to uncontrolled and trigger a dev warning.
      // Base UI's public type says `string | undefined` but accepts null at
      // runtime; the cast silences TypeScript.
      value={selectedValue as string | undefined}
      defaultValue={(defaultSelectedValue ?? null) as string | undefined}
      itemToStringLabel={(value: string) => getItemLabel(value) ?? value}
      onItemHighlighted={(v) => setHighlighted(v ?? undefined)}
      onValueChange={(value: string | null) => {
        if (value !== null) fireSelect(value);
      }}
    >
      {children}
    </Combobox.Root>
  );
}

function LiveResultsOpenDeriver({
  query,
  focused,
  mode,
  mutedRef,
  resultsOpen,
  setResultsOpen,
}: {
  query: string;
  focused: boolean;
  mode: SearchInputMode;
  mutedRef: React.RefObject<boolean>;
  resultsOpen: boolean;
  setResultsOpen: (open: boolean) => void;
}) {
  const { matchCount } = useCommandCore();
  React.useEffect(() => {
    if (mode !== "live") return;
    const shouldBeOpen =
      focused && query.length > 0 && matchCount > 0 && !mutedRef.current;
    if (shouldBeOpen !== resultsOpen) setResultsOpen(shouldBeOpen);
  }, [mode, focused, query, matchCount, resultsOpen, setResultsOpen, mutedRef]);
  return null;
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
  onSubmit?: (
    message: SearchInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  mode?: SearchInputMode;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  selectedValue?: string | null;
  defaultSelectedValue?: string | null;
  onSelectedValueChange?: (value: string | null) => void;
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
    mode,
    query: queryProp,
    defaultQuery = "",
    onQueryChange,
    selectedValue: selectedValueProp,
    defaultSelectedValue,
    onSelectedValueChange,
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
  const [selectedValue, setSelectedValue] = useControllable<string | null>({
    prop: selectedValueProp,
    defaultProp: defaultSelectedValue ?? null,
    onChange: onSelectedValueChange,
  });
  const resolvedMode: SearchInputMode = mode ?? "live";
  const [resultsOpen, setResultsOpen] = useControllable<boolean>({
    prop: resultsOpenProp,
    defaultProp: defaultResultsOpen,
    onChange: onResultsOpenChange,
  });
  const mutedAfterSelectionRef = React.useRef(false);
  const [focused, setFocused] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState<string | undefined>(undefined);
  const [variantModal, setVariantModal] = React.useState(false);
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
      setFocused(true);
      if (!collapsible) return;
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      if (collapsed) setCollapsed(false);
    },
    [collapsible, collapsed, setCollapsed, formProps],
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLFormElement>) => {
      formProps.onBlur?.(e);
      if (e.defaultPrevented) return;
      if (
        e.relatedTarget &&
        formRef.current?.contains(e.relatedTarget as Node)
      ) {
        return;
      }
      setFocused(false);
    },
    [formProps],
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
      if (resolvedMode === "submit" && query.length === 0) return;
      if (!onSubmit) return;
      const message: SearchInputMessage = {
        query,
        scope: scopeValue,
        selectedValue,
      };
      let result: void | Promise<void>;
      try {
        result = onSubmit(message, event);
      } catch {
        return;
      }
      if (resolvedMode === "submit") {
        resetPage();
        setResultsOpen(true);
      }
      if (result instanceof Promise) {
        try { await result; } catch {}
      }
    },
    [
      status,
      query,
      scopeValue,
      selectedValue,
      resolvedMode,
      resetPage,
      setResultsOpen,
      onSubmit,
    ],
  );

  const handleItemSelect = React.useCallback(
    (value: string, label: string, opts: { keepOpen: boolean }) => {
      if (opts.keepOpen) return; // drill-down: consumer manages page
      setSelectedValue(value);
      setQuery(label);
      mutedAfterSelectionRef.current = true;
      setResultsOpen(false);
      resetPage();
    },
    [setSelectedValue, setQuery, setResultsOpen, resetPage],
  );

  // Exposed via context so SearchInputInput can mute the deriver when Escape
  // closes the panel; without this, LiveResultsOpenDeriver would immediately
  // reopen the panel after Escape because focused+query+matchCount are still
  // truthy.
  const mutePanel = React.useCallback(() => {
    mutedAfterSelectionRef.current = true;
  }, []);

  const ctxValue = React.useMemo<SearchInputContextValue>(
    () => ({
      query,
      setQuery,
      status,
      label,
      mode: resolvedMode,
      collapsible,
      collapsed,
      setCollapsed,
      resultsOpen,
      setResultsOpen,
      scope: scopeValue,
      setScope,
      selectedValue,
      setSelectedValue,
      highlighted,
      mutePanel,
      submit,
      inputId,
      popupId,
      formRef,
    }),
    [
      query,
      setQuery,
      status,
      label,
      resolvedMode,
      collapsible,
      collapsed,
      setCollapsed,
      resultsOpen,
      setResultsOpen,
      scopeValue,
      setScope,
      selectedValue,
      setSelectedValue,
      highlighted,
      mutePanel,
      submit,
      inputId,
      popupId,
    ],
  );

  return (
    <SearchInputContext.Provider value={ctxValue}>
      <SearchInputModalContext.Provider value={{ modal: variantModal, setModal: setVariantModal }}>
        <CommandCoreProvider
          page={page}
          onPageChange={setPage}
          filter={filter}
          query={query}
          onClose={() => setResultsOpen(false)}
          onItemSelect={handleItemSelect}
        >
          <LiveResultsOpenDeriver
            query={query}
            focused={focused}
            mode={resolvedMode}
            mutedRef={mutedAfterSelectionRef}
            resultsOpen={resultsOpen}
            setResultsOpen={setResultsOpen}
          />
          <SearchInputComboboxBridge
            loop={loop}
            resultsOpen={resultsOpen}
            selectedValue={selectedValue}
            defaultSelectedValue={defaultSelectedValue ?? null}
            query={query}
            setQuery={setQuery}
            mutedRef={mutedAfterSelectionRef}
            setHighlighted={setHighlighted}
          >
            <form
              ref={mergedFormRef}
              {...formProps}
              role="search"
              aria-label={label}
              data-slot="search-input-root"
              data-collapsible={collapsible ? "" : undefined}
              data-state={collapsible ? (collapsed ? "collapsed" : "expanded") : undefined}
              className={cn("si-root", className)}
              onSubmit={handleSubmit}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <span role="status" aria-live="polite" className="si-sr-only" data-slot="search-input-status">
                {isInFlight(status) ? "Searching" : ""}
              </span>
              {children}
            </form>
          </SearchInputComboboxBridge>
        </CommandCoreProvider>
      </SearchInputModalContext.Provider>
    </SearchInputContext.Provider>
  );
});

SearchInputRoot.displayName = "SearchInput.Root";
