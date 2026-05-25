---
name: react-cmdk-command-menu
description: Use when implementing, modifying, or reviewing CommandMenu source or consumer code in react-cmdk-base — covers the Page/Group/Item anatomy, the shared command core (registerItem / registerMatch / fireSelect / matchCount), drill-down with controlled/uncontrolled page, the default filter, and the asChild a11y rules on Item.
---

# CommandMenu

`cmd/ctrl+K` palette built as a Base UI `Dialog` wrapping a shared command-core engine that lives in `src/internal/command-core/`. The same engine backs `SearchInput`'s results parts (`ResultsInline` / `ResultsModal` / `ResultsShell`), so contract changes to the core ripple to both surfaces — be careful.

**REQUIRED BACKGROUND:** `react-cmdk-architecture` (start there). For Base UI Dialog specifics, see `base-ui-components` → `dialog.md`.

## Anatomy

```
<CommandMenu.Root open onOpenChange page? onPageChange? filter? loop?>
  <CommandMenu.Input placeholder? />            // search row with magnifier + breadcrumb chips
  <CommandMenu.List>                            // scrollable container
    <CommandMenu.Page id searchPrefix?>         // only renders when ctx.page === id
      <CommandMenu.Group heading?>              // sticky heading
        <CommandMenu.Item value onSelect …/>
      </CommandMenu.Group>
      <CommandMenu.Empty alwaysRender? />       // auto-renders on zero matches
      <CommandMenu.Loading loading? label? />   // role=progressbar
      <CommandMenu.Separator />
      <CommandMenu.FreeSearch label? onSelect />// catches non-empty queries
    </CommandMenu.Page>
  </CommandMenu.List>
  <CommandMenu.Footer><CommandMenu.Kbd /></CommandMenu.Footer>
</CommandMenu.Root>
```

Root mounts the Base UI Dialog plus `CommandCoreProvider` (`src/internal/command-core/provider.tsx`). Every part below is a thin renderer that reads from `useCommandMenu()` / the internal core context.

## The command core — what every Item interacts with

When an Item mounts, it does three things via the core context (`src/internal/command-core/`):

1. **`registerItem(value, { onSelect, keepOpen })`** — returns an unregister cleanup. The map is the source of truth for `fireSelect`.
2. **`registerMatch(value, matched)` / `unregisterMatch(value)`** — the Item computes its match status from `ctx.filter(query, label, keywords)` and pushes the result into the match set. `matchCount = matchSet.size`. Items with `forceMount` do NOT count toward matchCount.
3. **`fireSelect(value)`** — on Enter or click, the Item calls this. The core looks up the registered item, calls `onSelect`, and then calls `close()` UNLESS `keepOpen` is true.

This is why a new "Item-like" part must register through these APIs — Base UI's Combobox listbox draws highlight/focus from the rendered children, but the match-counted state and the close-on-select behaviour are owned by the core.

## The default filter

`defaultFilter(query, label, keywords)`:

- Empty query → match
- `keywords.includes("*")` → match (catch-all)
- Otherwise: case-insensitive substring against `label` OR any `keywords` entry

Override by passing `filter` on `<Root>` — the resolved filter is exposed via `useCommandMenu().filter` so custom parts can use the same matcher.

## Page state — three subtle behaviours

`page` is controllable (`page` / `defaultPage` / `onPageChange`). The provider in `src/internal/command-core/provider.tsx` has commit-time reconciliation to handle the controlled-mode hazards:

- **Two sequential `setPage(...)` in one handler** — uncontrolled mode mutates `pageRef.current` synchronously so the second call sees the first's target. Don't break this — the back-stack regression test depends on it.
- **Controlled mode where the consumer rejects** — `setPage("b")` schedules a pending push tagged with `requested: "b"`. The reconcile effect only mutates `pageStack` if `committed === requested`. If the consumer ignores `onPageChange` (or commits a different target), the pending op is dropped silently.
- **External nav to "root"** — when the committed page becomes `"root"` and the move was NOT an accepted internal nav, the back stack is cleared. This prevents `popPage()` from returning to a stale frame after the consumer programmatically resets.

`setPage(currentPage)` is a no-op for navigation but DOES clear `query`. Same for `popPage()` when the stack is empty (target stays `"root"`).

## Query state — two modes (relevant to SearchInput in v0.12+)

`CommandCoreProvider`'s `query` prop supports two modes (v0.12 removed the third mode from 0.11.x along with `onQueryChange`):

| Mode | `query` prop | Behaviour |
| --- | --- | --- |
| Uncontrolled | omit | Provider owns state; `setPage`/`popPage` clear to `""`. Optional `defaultQuery` seeds it. |
| One-way controlled | set | The prop overrides internal state; internal `setQuery` calls still update internal state but the rendered value is the prop. The consumer is the source of truth. |

`SearchInput` uses one-way controlled — `<SearchInput.Root>` passes its live `query` down to `CommandCoreProvider` so `matchCount` and item filtering reflect what the user has typed. The CommandCore-side `setQuery` is not a public surface; only the SearchInput's bridge `onInputValueChange` writes through `setQuery` on the public `SearchInputContextValue`.

## `useCommandMenu()` — public surface vs internal fields

Throws if used outside `<CommandMenu.Root>`. Documented public fields:

| Field | Type |
| --- | --- |
| `query`, `setQuery` | `string`, `(q: string) => void` |
| `page`, `popPage` | `string`, `() => void` |
| `searchPrefix` | `readonly string[]` *(0.10.x+ — clone before mutating)* |
| `matchCount` | `number` (excludes `forceMount`) |
| `filter` | resolved matcher (Root's `filter` or the default) |
| `close` | `() => void` |

Plus internal fields used by custom parts: `registerItem`, `registerMatch`, `unregisterMatch`, `fireSelect`, `setPage`, `setSearchPrefix`. `setPage` and `popPage` have stable identity across renders — safe to pass to `React.memo`'d children.

## `CommandMenu.Item` invariants

- `value` is the unique id within the active page. Items on different pages may share a value.
- `onSelect` fires on Enter or click; **only fired when the item is currently a match** unless `forceMount` is set.
- `keepOpen` defers the `close()` after `onSelect` — use for "Open submenu" style items (combine with `onSelect={() => setPage("subpage")}`).
- `forceMount` renders even when the query doesn't match (use for "Create new …" actions). Counts as a match for selection purposes but NOT for `matchCount` — so `<Empty>` still auto-renders correctly when the only visible items are forceMount.
- `aria-label`:
  - **Without `asChild`**: overrides the accessible name AND the filter target. For icon-only items, pass to make them reachable by typing.
  - **With `asChild`**: the child's natural accessible name (link text / button text) is preserved unless `aria-label` is set explicitly on Item. Empty / whitespace = "no override" — the child's name stays.
- `keywords`: extra search terms; `"*"` matches anything.

For `asChild` details (event composition, ref merging, `forceProps` lock for `data-slot`), see `react-cmdk-aschild`.

## Keyboard

The Combobox layer (Base UI) drives arrow keys, Enter, Escape, and Home/End. Backspace on an empty input does two things, in order:

1. If `searchPrefix.length > 0` → pop a breadcrumb (delegated to the page) — handled by `popPage()`.
2. Otherwise — Combobox default (clear input — already empty, so no-op).

`<Root loop>` controls arrow-key wraparound (default `true`).

`useCmdkShortcut(setOpen)` wires `cmd/ctrl+K` globally. Important: it calls `e.stopPropagation()` on intercepted shortcuts, and invokes the setter as an updater (`c => !c`) — so passing a non-`Dispatch<SetStateAction<boolean>>` setter (i.e. a `(v: boolean) => void`) will receive a boolean, which is the desired behaviour.

## `<Empty>` auto-render rules

By default, `<CommandMenu.Empty>` renders only when:

- `query.length > 0`, AND
- `matchCount === 0` (excludes `forceMount` items)

Pass `alwaysRender` to bypass both checks. Default text: `"No results"` — override with children.

## `<FreeSearch>`

Appears whenever `query.length > 0`. Acts as a convenience Item with `value="__free-search__:<query>"`-shaped uniqueness — picks up Enter/click and forwards to `onSelect(query)`. Default label `"Search for"`. SearchInput has its own `SearchInput.FreeSearch` that filters against `committedQuery` instead.

## Gotchas

- **`searchPrefix` is `readonly string[]`** since 0.10.x. Don't `.push()` directly — clone first. The setter is `setSearchPrefix` (internal API).
- **Re-rendering `Item` should NOT churn its registration** — `registerItem` is stable, but the `value` you pass MUST be stable too (don't compute it from a closure that changes every render). If you key items by an unstable value, the match set will leak entries.
- **Don't add new public methods to `useCommandMenu`** without checking the namespace assembly file (`src/command-menu.tsx`) re-exports them.
- **The Page's `searchPrefix` prop** seeds `ctx.searchPrefix` via an effect inside `Page` — if you call `useCommandMenu().setSearchPrefix(...)` from a custom child, your value will be clobbered when the user navigates back to a different Page.

## Where to look in source

- `src/parts/root.tsx` — Dialog + CommandCoreProvider + Combobox setup
- `src/parts/item.tsx` — registerItem / registerMatch / fireSelect wiring, asChild path
- `src/parts/page.tsx` — searchPrefix effect, `page === id` gate
- `src/parts/empty.tsx` — matchCount-based auto-render
- `src/parts/free-search.tsx` — committedQuery-aware variant lives in `src/search-input/`, the CommandMenu version lives here
- `src/internal/command-core/provider.tsx` — the shared engine (every invariant above lives here)
- `src/internal/command-core/context.ts` — type definitions for `CommandCoreFilter`, `CommandCoreRegisteredItem`, the full context shape
- `src/hooks/use-command-menu.ts` — the public hook (thin re-projection of the core context)

## What NOT to do

- **Don't access the core context directly from consumer code** (`src/internal/command-core/context.ts` is internal). The public hook is `useCommandMenu()` from the package root.
- **Don't add `onClose` semantics to the SearchInput's CommandCoreProvider** — it correctly fires `setResultsOpen(false)` already. Conflating "close" with "navigate" breaks SearchInput's drill-down (which keeps the popup open while changing pages).
- **Don't compute `matchCount` from `itemsRef`** — `itemsRef` is the registration map, not the match set. The two diverge whenever an Item is mounted but doesn't match (most of the time).
