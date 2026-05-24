---
name: react-cmdk-search-input
description: Use when implementing, modifying, or reviewing SearchInput source or consumer code in react-cmdk-base — covers the submit-only results model (query vs committedQuery), the sync-throw-aborts-commit submit ordering, the collapsible state machine that includes resultsOpen, the scope-prop string-or-null trap, and the role=search / role=combobox / role=listbox a11y wiring.
---

# SearchInput

A collapsible single-row search affordance that opens a CommandMenu-style results popup on submit. Mounted as `<form role="search">` with a `<Popover>` hosting the same `CommandCoreProvider` that powers CommandMenu.

**REQUIRED BACKGROUND:** `react-cmdk-architecture` (start there) AND `react-cmdk-command-menu` (the popup reuses the command core — every invariant about `registerItem` / `registerMatch` / `fireSelect` / drill-down still applies). For Base UI Popover: `base-ui-components` → `popover.md`.

## Anatomy

```
<SearchInput.Root onSubmit status? collapsible? scope? onScopeChange? filter? loop?>
  <SearchInput.Input placeholder? />          // role=combobox, aria-expanded/controls/haspopup
  <SearchInput.Submit onStop? />              // disabled when query empty + idle
  <SearchInput.Tools>                         // or <Toolbar> for 2+ controls; hidden when collapsed
    <SearchInput.Picker>…</SearchInput.Picker>
  </SearchInput.Tools>
  <SearchInput.Results>                       // Popover anchored to form
    <SearchInput.Page id="root">
      <SearchInput.Group heading="Docs">
        <SearchInput.Item value onSelect>…</SearchInput.Item>
      </SearchInput.Group>
      <SearchInput.Empty />
      <SearchInput.Loading />
      <SearchInput.FreeSearch />              // filters against committedQuery
    </SearchInput.Page>
  </SearchInput.Results>
</SearchInput.Root>
```

The Page/Group/Item/Empty/Loading/Separator/FreeSearch parts are CommandMenu's parts with SearchInput-specific renderers — they share the core context, NOT the Item component itself.

## The submit-only results model

`<SearchInput.Input>` does NOT filter as you type. Typing only updates the live `query` displayed in the input — the popup's filter binds to `committedQuery`, which only changes on a successful submit. This is implemented by passing `query={committedQuery}` to `CommandCoreProvider` WITHOUT `onQueryChange` (the read-only controlled mode documented in `react-cmdk-command-menu`).

| State | What it tracks | Updates when |
| --- | --- | --- |
| `query` | Live input value | Every keystroke |
| `committedQuery` | What the popup filters against | Successful submit (sync portion of `onSubmit` returns without throwing) |
| `resultsOpen` | Whether the Popover is mounted | `true` after first commit; consumer can close via `setResultsOpen` |

Do NOT wire `onQueryChange` on the inner `CommandCoreProvider`. The whole submit-on-Enter model collapses if typing immediately mutates the popup filter.

## Status vocabulary differs from PromptInput

`SearchInputStatus = "idle" | "submitted" | "streaming" | "error"`. **`idle` replaces `ready`** — the SearchInput is a one-shot dispatcher, not a persistent composer.

`isInFlight(status) = status === "submitted" || status === "streaming"` — same semantics as PromptInput's `isGenerating`.

| Status | Submit appearance | Submit click | Submit `disabled` when query empty? |
| --- | --- | --- | --- |
| `idle` | Send icon, default label | Submits | Yes |
| `submitted` | Spinner, "Submitting" | No-op or Stop (if `onStop`) | No (still in-flight) |
| `streaming` | Stop icon, "Stop search" | Stop (if `onStop`) | No |
| `error` | Error icon, "Retry" | Submits | No |

## The submit-ordering invariant (`src/search-input/root.tsx`)

The submit handler is carefully ordered to avoid mutating popup state when the dispatch fails synchronously:

```ts
handleSubmit:
  event.preventDefault()
  if (isInFlight(status)) return
  if (query.length === 0) return
  message = { query, scope: scopeValue }
  try { result = onSubmit(message, event) }
  catch { return }                  // SYNC THROW → abort (no popup mutation)
  resetPage()                       // sync success → commit popup state
  setCommittedQuery(query)
  setResultsOpen(true)
  if (result instanceof Promise) {
    try { await result } catch {}   // ASYNC REJECTION → keep popup state
  }
```

Three things follow from this:

1. **A sync-throwing `onSubmit` aborts the commit.** Use this if you want a "validation failure" path that doesn't change the popup — throw synchronously, the popup stays where it was. The consumer is responsible for surfacing the validation error (e.g. via `status="error"`).
2. **Async rejections keep popup state.** The dispatch succeeded; only the response failed. The consumer signals failure via `status="error"`, but `committedQuery` / `resultsOpen` stay so the user can see what they searched for.
3. **Empty queries don't submit.** Even an `onSubmit` that handles empty queries won't fire — the guard short-circuits before calling.

**Don't reorder these.** A previous regression placed `setCommittedQuery(query)` BEFORE the try-catch, which opened the popup with stale or absent results when the consumer's sync onSubmit threw.

## Page state — owned by Root, not by CommandCoreProvider

Page state is `useState<string>("root")` on the Root, passed in CONTROLLED to `CommandCoreProvider`. `resetPage()` is called on each successful submit to send the popup back to `"root"`. The inner provider's commit-time reconciliation effect (see `react-cmdk-command-menu` → page state) handles the controlled-mode race correctly — it sees the external reset and clears its pageStack via the `external nav to root` branch.

**The README claim that Results re-mounts on each new committed query via `key` is OUT OF DATE.** The current implementation uses `resetPage()`, NOT remount. Drill-down navigation still works because the provider's pageStack is cleared by the external-nav-to-root effect branch.

## Collapsible — defaults differ from PromptInput

| | SearchInput | PromptInput |
| --- | --- | --- |
| `collapsible` default | `true` | `false` |
| `defaultCollapsed` (when collapsible) | `true` | `true` |
| `isEmptyForCollapse` guards | `query empty` + `!isInFlight` + `!resultsOpen` | `text empty` + `attachments empty` + `!isGenerating` |
| Escape filter | textarea-only? No — Input is `<input type="search">` | textarea-only |

The 150ms `pointerleave` collapse timer runs the same `form.contains(document.activeElement)` + `isEmptyForCollapse()` guards as PromptInput. The big difference is `resultsOpen` — the row stays expanded while the results popover is showing, even if the user is no longer hovering or focused.

## The `scope` prop — the controlled/uncontrolled trap

`scope?: string | null`. Public surface accepts BOTH `string` and `null`:

- `scope={null}` (or `scope=""`) — "controlled with no selection".
- `scope={undefined}` — UNCONTROLLED (internal state takes over).

**Going `defined → undefined` switches the component to uncontrolled mode.** A defined-to-undefined transition is the bait pattern — consumers expressing "no selection" frequently set `undefined`, not realizing it flips control mode. Root logs a dev-only warning on this transition.

Internally, the context value surfaces `scopeValue: string | undefined` (the `null ?? undefined` collapses to a single "no selection" sentinel for downstream consumers). The `SearchInputMessage` includes `scope: scopeValue`, so consumers only ever see `string | undefined` in their `onSubmit` handler.

**Don't widen `onScopeChange` to `(scope: string | null) => void`.** The change handler ignores `null` (`if (next != null) onScopeChange(next)`) precisely because consumers wiring an uncontrolled `<Picker>` may emit `undefined` transiently — propagating that upstream would put them into the trap.

## A11y wiring

| Element | Role | Attributes |
| --- | --- | --- |
| `<SearchInput.Root>` | `form role="search"` | `aria-label={label}` (default `"Search"`), `data-slot="search-input-root"`, `data-collapsible`, `data-state` |
| `<SearchInput.Input>` | `input[type=search] role=combobox` | `aria-expanded={resultsOpen}`, `aria-controls={popupId}`, `aria-haspopup="listbox"`, `id={inputId}`, `disabled` while in-flight |
| `<SearchInput.Results>` | Base UI `Popover.Popup` | Anchored to form via `formRef`; hosts the Combobox listbox |
| in-flight polite region | `aria-live="polite"` | Announces "Searching" while `isInFlight(status)` |

`inputId` and `popupId` come from `React.useId()` on the Root, exposed via `useSearchInput()`. When wiring custom Input parts, read them from the context — don't generate fresh ids.

## Tooltip — provider is NOT auto-mounted

Unlike PromptInput, `SearchInput.Root` does NOT mount a `Tooltip.Provider`. Consumers using `<SearchInput.Tooltip>` MUST wrap their tree:

```tsx
import { Tooltip } from "@base-ui/react/tooltip";

<Tooltip.Provider>
  <SearchInput.Root>…</SearchInput.Root>
</Tooltip.Provider>
```

This is intentional — SearchInput is often used standalone in a page header where you don't want the Tooltip context bleeding into siblings.

## `useSearchInput()` — public surface

Throws if used outside `<SearchInput.Root>`.

| Field | Notes |
| --- | --- |
| `query`, `setQuery` | Live input value |
| `committedQuery` | Last successfully submitted query (read-only — change via submit) |
| `status`, `label` | Reflect Root's props |
| `scope`, `setScope` | `scope: string \| undefined` (post-collapse); `setScope: (s: string) => void` |
| `collapsible`, `collapsed`, `setCollapsed` | Same controlled/uncontrolled rules as PromptInput |
| `resultsOpen`, `setResultsOpen` | Consumer can close imperatively |
| `submit` | `() => void` — calls `formRef.current?.requestSubmit()` |
| `inputId`, `popupId`, `formRef` | For wiring custom Input/Results parts |

## Drill-down inside the popup

`SearchInput.Item.onSelect` is the typical entry point for navigation. To drill down, call `useCommandCore().setPage("subpage")` — **but `useCommandCore` is intentionally NOT a public export**. The expected pattern is to drive the page externally:

```tsx
const [page, setPage] = React.useState("root");

<SearchInput.Root onSubmit={…}>
  <SearchInput.Results>
    <SearchInput.Page id="root">
      <SearchInput.Item value="users" onSelect={() => setPage("users")} keepOpen>
        Users…
      </SearchInput.Item>
    </SearchInput.Page>
    <SearchInput.Page id="users" searchPrefix={["Users"]}>
      …
    </SearchInput.Page>
  </SearchInput.Results>
</SearchInput.Root>
```

Backspace on the popup's empty Combobox input pops the page stack (delegated to the same `popPage()` in the core). The Combobox layer (not the Input layer) handles this — the Input in SearchInput is `<input type="search">`, the popup uses a separate Combobox internally.

## What lives where

| Concern | Owner |
| --- | --- |
| Live `query`, `committedQuery`, `resultsOpen`, `scope`, `collapsed`, `page` | `<SearchInput.Root>` |
| Match set, item registration, fireSelect | `CommandCoreProvider` (`src/internal/command-core/`) |
| Listbox layer (arrow keys, Enter, selection) | Base UI `Combobox` inside the Popover |
| Popover positioning | Base UI `Popover.Positioner` (anchored to `formRef`) |
| Status, filter, label | Consumer (via Root props) |

## Gotchas

- **Don't wire `onQueryChange` on the inner `CommandCoreProvider`** — it's read-only controlled by design. Typing must NOT mutate the popup filter.
- **Don't widen `scope` to allow `undefined` as "no selection"** — that's the controlled→uncontrolled trap. Use `null` or `""` for "no selection".
- **Don't reorder the submit ordering** — sync-throw-aborts is a documented contract.
- **`SearchInput.Input` is `<input type="search">`, NOT a textarea** — Enter submits the form; there's no Shift+Enter newline. Backspace on empty does NOT remove anything (no attachments).
- **Don't expect `Tooltip.Provider` to be mounted** — consumer must wrap.
- **`status="ready"` is a PromptInput-only value** — SearchInput uses `"idle"`. The vocabularies do NOT overlap on this one value.
- **Don't add an `onClose` to the inner `CommandCoreProvider` that does anything other than `setResultsOpen(false)`** — the popup closes via that signal, and the core's drill-down navigation re-uses the close handler for keepOpen items.

## Where to look in source

- `src/search-input/root.tsx` — submit ordering (lines ~292-330), scope dev warning (~192-206), collapsible state machine (mirrors PromptInput), CommandCoreProvider wiring with `query={committedQuery}` (no onQueryChange)
- `src/search-input/input.tsx` — `role=combobox`, aria wiring, `disabled` while in-flight
- `src/search-input/submit.tsx` — `isInFlight`, stoppable logic, `disabled` when query empty + idle
- `src/search-input/results.tsx` — Popover, Combobox, listbox layer
- `src/search-input/free-search.tsx` — comment explains "filters against committedQuery, not live query"
- `src/search-input/context.ts` — `SearchInputStatus`, `isInFlight`, `SearchInputContextValue` shape
- `src/internal/command-core/provider.tsx` — the read-only controlled mode (mode 3) the SearchInput leans on
