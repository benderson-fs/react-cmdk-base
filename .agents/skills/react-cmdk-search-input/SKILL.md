---
name: react-cmdk-search-input
description: Use when implementing, modifying, or reviewing SearchInput source or consumer code in react-cmdk-base — covers the live-mode default (filter-as-you-type), the one-way open wiring on the Combobox bridge, the itemToStringLabel label write-back path, the modal=true aria-hide contract, the ItemLabel child slot, and the always-required inline=true on the bridge. Also covers the submit-mode 0.11.x preservation, the collapsible state machine, the scope-prop string-or-null trap, and the role=search / role=combobox / role=listbox a11y wiring.
---

# SearchInput

A live-by-default search affordance built on Base UI Combobox primitives. The default mode (`mode="live"`) filters as you type and persists a selected value; `mode="submit"` preserves the original 0.11.x submit-only model. Two anchored result variants: `<SearchInput.ResultsInline>` (no backdrop, page stays interactive) and `<SearchInput.ResultsModal>` (Combobox `modal=true` — aria-hides + inerts everything outside the popup via FloatingFocusManager). The input retains real DOM focus in both; keyboard navigation uses `aria-activedescendant` on the listbox.

**REQUIRED BACKGROUND:** `react-cmdk-architecture` (start there) AND `react-cmdk-command-menu` (the popup reuses the command core — every invariant about `registerItem` / `registerMatch` / `fireSelect` / drill-down still applies). For the Base UI layer: `base-ui-components` → `combobox.md` (NOT `popover.md` — the shell was replaced in 0.12).

## Anatomy

```
<SearchInput.Root onSubmit? mode? selectedValue? onSelectedValueChange? status? collapsible? scope? onScopeChange? filter? loop? page? onPageChange?>
  <SearchInput.Input placeholder? />          // role=combobox, aria-expanded/controls/haspopup
  <SearchInput.Submit onStop? />              // mode-aware disabled rule
  <SearchInput.Tools>                         // or <Toolbar> for 2+ controls; hidden when collapsed
    <SearchInput.Picker>…</SearchInput.Picker>
  </SearchInput.Tools>
  <SearchInput.ResultsInline>                 // anchored panel, no backdrop
    <SearchInput.Page id="root">
      <SearchInput.Group heading="Docs">
        <SearchInput.Item value onSelect>
          <SearchInput.ItemLabel>Label text</SearchInput.ItemLabel>
        </SearchInput.Item>
      </SearchInput.Group>
      <SearchInput.Empty />
      <SearchInput.Loading />
      <SearchInput.FreeSearch />
    </SearchInput.Page>
  </SearchInput.ResultsInline>
  {/* OR: <SearchInput.ResultsModal> for backdrop + modal focus management */}
</SearchInput.Root>
```

The Page/Group/Item/Empty/Loading/Separator/FreeSearch parts are CommandMenu's parts with SearchInput-specific renderers — they share the core context, NOT the Item component itself.

## The live + submit mode model

### Live mode (default)

`<SearchInput.Input>` filters as you type. The panel mounts when: (1) the input is focused, (2) query is non-empty, (3) matchCount > 0, (4) the panel is not muted. The Combobox bridge receives `open={resultsOpen}` ONE-WAY — SearchInput drives open state; the bridge never accepts `onOpenChange` back (doing so reintroduced the typing-steals-focus regression in earlier attempts).

| Condition | Panel opens? |
| --- | --- |
| Focused + non-empty query + matchCount > 0 + not muted | Yes (live deriver) |
| Focused + empty query | No |
| After selection (muted) | No, until next `onInputValueChange` |
| After Escape (muted) | No, until next keystroke |

### Submit mode (mode="submit")

Pass `mode="submit"` to restore 0.11.x. Typing does NOT open the panel; only Enter or the Submit button does. The live deriver is disabled; `resultsOpen` only transitions inside `handleSubmit` after a successful sync call.

## State table

| State | What it tracks | Updates when |
| --- | --- | --- |
| `query` | Live input value | Every keystroke |
| `selectedValue` | Persistent item selection | Enter on highlighted item; backspace-to-empty clears; programmatic null |
| `highlighted` | Currently highlighted item value (read-only) | Arrow navigation, mouse hover |
| `resultsOpen` | Whether the results panel is mounted | Live deriver (live mode); handleSubmit (submit mode); mutePanel/dismissal |
| `status` | `idle \| submitted \| streaming \| error` | Consumer via Root prop |
| `scope` | Active scope filter string | Consumer via Root prop or Picker |
| `collapsed` | Row collapsed state | Focus/hover/Escape/pointer-leave |
| `mode` | `"live" \| "submit"` | Root prop only |

**No `committedQuery`.** The filter binds to live `query` in live mode. In submit mode there is no separate committedQuery state — `query` at submit time IS the filter value because the panel only opens on submit.

## The bridge contract

`SearchInput.Root` renders a `Combobox.Root` ("the bridge") with these invariants:

- **`open={resultsOpen}` ONE-WAY.** We pass `open` to Combobox but never wire `onOpenChange` back. Base UI's Combobox emits `onOpenChange` on every keystroke (REASONS.inputChange auto-open). Accepting that back would re-open the panel mid-typing and hand focus to the listbox, stealing focus from the input.
- **`inline={true}` ALWAYS SET.** The input (`<SearchInput.Input>`) is rendered OUTSIDE `Combobox.Positioner`. Base UI's `nextIsInsidePopup = hasPositionerParent || inline` mechanic (see `node_modules/@base-ui/react/combobox/input/ComboboxInput.js:99`) requires `inline=true` to flip `inputInsidePopup=true`. Without it, `focusManagerModal = !inputInsidePopup || modal` collapses to `true` unconditionally, hijacking focus even in non-modal usage.
- **`modal={variantModal}`.** Driven by which Results variant is mounted, signaled upward via `SearchInputModalContext`. With `inline=true` already set, `focusManagerModal = !inputInsidePopup || modal` collapses to just `modal` — so the modal flag is authoritative only in the modal variant.
- **`itemToStringLabel={(v) => getItemLabel(v) ?? v}`.** Makes Combobox's own input-value write on selection converge on our label string. The `getItemLabel` selector is exposed on the `CommandCoreContext` and reads from the registered items map. `getItemLabel` was added in Task 9 when `label` was added to `CommandCoreRegisteredItem`.
- **`onInputValueChange` clears the mute ref.** After a selection, the panel is muted so the live deriver can't immediately re-open it. The next keystroke (`onInputValueChange`) clears the mute flag, restoring normal live behavior.

## Selection flow

```
Enter on highlighted item
  → Combobox onValueChange
  → bridge fireSelect(value)
  → CommandCore fireSelect
  → calls item.onSelect THEN onItemSelect(value, label, { keepOpen })
  → SearchInput.Root handleItemSelect:
      if NOT keepOpen:
        setSelectedValue(value)
        setQuery(label)          // label comes from getItemLabel(value) ?? value
        mutePanel()
        setResultsOpen(false)
        resetPage()
      if keepOpen:
        no-op here (consumer manages drill-down state)
```

**Enter when nothing highlighted** → fires Submit (equivalent to clicking the Submit button).

## ItemLabel slot

`<SearchInput.ItemLabel>` (and `<CommandMenu.ItemLabel>`) is a child slot that, when present inside an Item, seeds:
1. The Item's **accessibleName fallback** (for screen readers)
2. The **filter target** string (what the command-core filter matches against)
3. The **selection write-back string** (what gets written into the input on selection)

When `ItemLabel` is absent, the fallback is `getLabelFromChildren(children)` — a recursive text extraction. The `findItemLabel` helper walks React children by `displayName` so HMR / Fast Refresh don't break the detection (comparing by displayName avoids the stale-module-identity problem with `=== ItemLabel`).

## Modal contract clarification

`Combobox modal=true` activates FloatingFocusManager in modal mode. FloatingFocusManager aria-hides and makes inert everything outside the floating popup. This includes the `<form>` that `SearchInput.Root` renders — the form's Submit button is not interactive while the modal panel is open. The documented user flow is: dismiss the panel first (Escape, click backdrop, or select an item), then interact with the form.

The backdrop click calls `setResultsOpen(false)` via the `Combobox.Backdrop` close handler.

## Status vocabulary differs from PromptInput

`SearchInputStatus = "idle" | "submitted" | "streaming" | "error"`. **`idle` replaces `ready`** — the SearchInput is a one-shot dispatcher, not a persistent composer.

`isInFlight(status) = status === "submitted" || status === "streaming"` — same semantics as PromptInput's `isGenerating`.

| Status | Submit appearance | Submit click |
| --- | --- | --- |
| `idle` | Send icon, default label | Submits |
| `submitted` | Spinner, "Submitting" | No-op or Stop (if `onStop`) |
| `streaming` | Stop icon, "Stop search" | Stop (if `onStop`) |
| `error` | Error icon, "Retry" | Submits |

## Submit-ordering invariant (`src/search-input/root.tsx`)

### Submit mode (preserves 0.11.x sync-throw-aborts-commit)

```ts
handleSubmit:
  event.preventDefault()
  if (isInFlight(status)) return
  if (query.length === 0) return              // empty-query guard
  message = { query, scope: scopeValue, selectedValue }
  try { result = onSubmit(message, event) }
  catch { return }                            // SYNC THROW → abort
  resetPage()
  setResultsOpen(true)
  if (result instanceof Promise) {
    try { await result } catch {}
  }
```

### Live mode

In live mode, `handleSubmit` calls `onSubmit` but does NOT mutate popup state (the panel is already open from the live deriver). The empty-query guard is dropped — Submit may be invoked with `selectedValue` set and an empty query (that's the typeahead-picker pattern).

**`onSubmit` is optional on Root.** SearchInput can act as a pure type-ahead picker with no enrich action — omit `onSubmit` entirely.

## Message shape

```ts
type SearchInputMessage = {
  query: string;
  scope: string | undefined;
  selectedValue: string | null;
};
```

`scope: string | undefined` is a required field (not optional). `selectedValue` carries the persistent selection at submit time.

## Page state — same as 0.11.x

Page state is `useState<string>("root")` on Root, passed CONTROLLED to `CommandCoreProvider`. `resetPage()` is called on any non-`keepOpen` selection AND on each successful submit in submit mode. The inner provider's controlled-mode reconciliation effect handles the external reset via the `external nav to root` branch, clearing the pageStack without remounting.

## Collapsible — same as 0.11.x

| | SearchInput | PromptInput |
| --- | --- | --- |
| `collapsible` default | `true` | `false` |
| `defaultCollapsed` (when collapsible) | `true` | `true` |
| `isEmptyForCollapse` guards | `query empty` + `!isInFlight` + `!resultsOpen` | `text empty` + `attachments empty` + `!isGenerating` |

The 150ms `pointerleave` collapse timer runs the same `form.contains(document.activeElement)` + `isEmptyForCollapse()` guards. The `resultsOpen` guard keeps the row expanded while the panel is showing.

## The `scope` prop — same controlled/uncontrolled trap as 0.11.x

`scope?: string | null`. Public surface accepts BOTH `string` and `null`:

- `scope={null}` (or `scope=""`) — "controlled with no selection".
- `scope={undefined}` — UNCONTROLLED (internal state takes over).

**Going `defined → undefined` switches the component to uncontrolled mode.** Root logs a dev-only warning on this transition. Internally the context surfaces `scopeValue: string | undefined`. The message shape includes `scope: scopeValue` so consumers only ever see `string | undefined` in their handler.

## Tooltip — provider NOT auto-mounted

`SearchInput.Root` does NOT mount a `Tooltip.Provider`. Consumers using `<SearchInput.Tooltip>` MUST wrap:

```tsx
import { Tooltip } from "@base-ui/react/tooltip";
<Tooltip.Provider>
  <SearchInput.Root>…</SearchInput.Root>
</Tooltip.Provider>
```

## Drill-down — same as 0.11.x

Use `keepOpen` on items and drive `page` as a controlled prop on Root. The expected pattern:

```tsx
const [page, setPage] = React.useState("root");

<SearchInput.Root onSubmit={…} page={page} onPageChange={setPage}>
  <SearchInput.ResultsInline>
    <SearchInput.Page id="root">
      <SearchInput.Item value="users" onSelect={() => setPage("users")} keepOpen>
        <SearchInput.ItemLabel>Users</SearchInput.ItemLabel>
      </SearchInput.Item>
    </SearchInput.Page>
    <SearchInput.Page id="users" searchPrefix={["Users"]}>
      …
    </SearchInput.Page>
  </SearchInput.ResultsInline>
</SearchInput.Root>
```

## `useSearchInput()` — public surface

Throws if used outside `<SearchInput.Root>`.

| Field | Notes |
| --- | --- |
| `query`, `setQuery` | Live input value |
| `selectedValue`, `setSelectedValue` | Persistent selection (`string \| null`) |
| `highlighted` | Currently highlighted item value (read-only) |
| `mode` | `"live" \| "submit"` |
| `status`, `label` | Reflect Root's props |
| `scope`, `setScope` | `scope: string \| undefined`; `setScope: (s: string) => void` |
| `collapsible`, `collapsed`, `setCollapsed` | Same controlled/uncontrolled rules as PromptInput |
| `resultsOpen`, `setResultsOpen` | Consumer can close imperatively |
| `submit` | `() => void` — calls `formRef.current?.requestSubmit()` |
| `inputId`, `popupId`, `formRef` | For wiring custom Input/Results parts |

## Gotchas / Don'ts

- **Don't accept `onOpenChange` on the inner Combobox.Root.** It fires on every keystroke (Base UI's REASONS.inputChange auto-open path) and would re-introduce the typing-steals-focus regression.
- **Don't drop `inline=true` on the bridge.** The input is OUTSIDE `Combobox.Positioner`, so `inputInsidePopup` is false by default and `focusManagerModal` collapses to `true` unconditionally — hijacking focus even in non-modal usage.
- **Don't clear `selectedValue` on submit or on typing-after-selection.** Only backspace-to-empty, programmatic null, or a consumer clear button should clear it. This is the typeahead-picker contract.
- **Don't expect the form's Submit button to be clickable while the modal variant is open.** That's the documented Combobox modal contract (FloatingFocusManager aria-hides + inerts the form). Dismiss the panel first.
- **Don't add a second click handler on CommandCoreItem's non-asChild path.** Combobox.Item's own `commitSelection` path is the canonical select. An extra `onClick` caused a double-fire bug (removed in Task 12 fixes).
- **Don't widen `scope` to allow `undefined` as "no selection".** That's the controlled→uncontrolled trap. Use `null` or `""` for "no selection".
- **Don't reorder the submit-ordering invariant.** Sync-throw-aborts-commit is a documented contract.
- **`SearchInput.Input` is `<input type="search">`, NOT a textarea.** Enter submits the form; there is no Shift+Enter newline.
- **`status="ready"` is a PromptInput-only value.** SearchInput uses `"idle"`. The vocabularies do NOT overlap on this value.

## Where to look in source

- `src/search-input/root.tsx` — the Combobox bridge with `inline`/`modal`/`itemToStringLabel`/`open` ONE-WAY contract; the live-mode deriver; `handleSubmit` (mode-aware); `handleItemSelect`.
- `src/search-input/combobox-shell.tsx` — `Combobox.Portal` + `Combobox.Positioner` + `Combobox.Popup` + optional `Combobox.Backdrop`.
- `src/search-input/results-inline.tsx` — sets `variantModal=false` via `SearchInputModalContext`.
- `src/search-input/results-modal.tsx` — sets `variantModal=true` via `SearchInputModalContext`; adds `Combobox.Backdrop`.
- `src/search-input/index.ts` — part exports; `src/search-input.tsx` — aggregator re-exports.
- `src/search-input/input.tsx` — Combobox.Input wiring; clears `selectedValue` on backspace-to-empty; calls `mutePanel()` on Escape.
- `src/search-input/submit.tsx` — mode-aware disabled rule.
- `src/internal/command-core/item-label.tsx` — the `ItemLabel` slot component.
- `src/internal/command-core/item.tsx` — `findItemLabel` resolver; registers `label` in `registerItem`.
- `src/internal/command-core/provider.tsx` — `onItemSelect` prop; `getItemLabel` selector; controlled `query` prop.
- `src/internal/command-core/context.ts` — `label` on `CommandCoreRegisteredItem`; `getItemLabel` on the context value.
