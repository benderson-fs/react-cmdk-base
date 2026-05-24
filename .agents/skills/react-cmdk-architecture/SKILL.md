---
name: react-cmdk-architecture
description: Use when implementing, modifying, or reviewing source code in the react-cmdk-base package — covers the three public namespaces (CommandMenu, PromptInput, SearchInput), file layout, exported types, and the conventions every part follows. Start here before touching any namespace-specific skill.
---

# react-cmdk-base architecture

`react-cmdk-base` ships three composable primitive families built on `@base-ui/react` (peer-pinned to `^1.5.0`). All three follow the same conventions: data attributes for styling, CSS custom properties for theming, `asChild` for element polymorphism on the leaf interactive parts, and a flat namespace export per family.

## The three namespaces

| Namespace | Primary primitive | Use when |
| --- | --- | --- |
| `CommandMenu` | Base UI `Dialog` + custom command core | Building a `cmd/ctrl+K`-style palette with drill-down pages, groups, free-search fallback |
| `PromptInput` | `<form>` with Base UI `Menu`/`Select`/`Tooltip` sub-parts | Building a chat composer: textarea + attachments + toolbar buttons + model picker + status-aware submit |
| `SearchInput` | Base UI `Popover` hosting the shared command core | Submit-on-Enter search affordance — a collapsible row that opens a CommandMenu-style results popup on submit |

For each namespace there is a dedicated skill. Read it before writing code:

- Working on CommandMenu source or a CommandMenu consumer → **REQUIRED:** `react-cmdk-command-menu`
- Working on PromptInput source or a PromptInput consumer → **REQUIRED:** `react-cmdk-prompt-input`
- Working on SearchInput source or a SearchInput consumer → **REQUIRED:** `react-cmdk-search-input`

For cross-cutting concerns:

- Touching `asChild` on `CommandMenu.Item`, `PromptInput.Button`, `PromptInput.Submit`, or `Slot` itself → **REQUIRED:** `react-cmdk-aschild`
- Editing `src/styles.css`, `themes/luz.css`, `themes/luz-palette.css`, or any CSS custom property surface → **REQUIRED:** `react-cmdk-theming`

For Base UI specifics (the upstream primitives behind everything here):

- General Base UI patterns → `base-ui-architecture`
- A specific primitive (Menu, Select, Combobox, Popover, Tooltip, Dialog) → `base-ui-components`
- `mergeProps` / `useRender` / `DirectionProvider` / `CSPProvider` → `base-ui-utilities`

## Repository layout

```
src/
  index.ts                  # Public exports — every named export must be re-exported here
  command-menu.tsx          # Namespace assembly (CommandMenu.Root, .Item, …)
  prompt-input.tsx          # Namespace assembly
  search-input.tsx          # Namespace assembly
  styles.css                # All shipped CSS — token blocks + utility classes
  hooks/
    use-command-menu.ts     # Public hook (re-exported)
    use-cmdk-shortcut.ts    # Public hook
  lib/
    slot.tsx                # asChild engine — see react-cmdk-aschild
    cn.ts, use-controllable.ts, use-merged-ref.ts, use-attachments.ts, use-drag-drop.ts
    context.ts              # CommandMenu context (re-exports from internal/command-core)
  parts/                    # CommandMenu parts (Root/Input/List/Page/Group/Item/…)
  prompt-input/             # PromptInput parts (root/textarea/footer/picker/…)
  search-input/             # SearchInput parts (root/input/submit/results/…)
  internal/command-core/    # Shared command-palette engine; consumed by CommandMenu and SearchInput
  themes/
    luz.css                 # Opt-in token overlay
    luz-palette.css         # Opt-in Tailwind v4 @theme block

dist/                       # Published artefacts
tests/                      # Vitest + RTL test suite
app/                        # Next.js prototype — exercises every public API
```

The Next.js prototype in `app/` is the single best place to test changes against real consumer code. Routes: `/` (CommandMenu), `/prompt` (PromptInput), `/search` (SearchInput), `/luz` (luz theme demo).

## Universal conventions (apply to every part)

### `data-slot` for stable selectors

Every public part root renders a `data-slot="<family>-<part>"` attribute (e.g. `data-slot="command-menu-item"`, `data-slot="prompt-input-submit"`). Composing wrappers override with a more specific slot — `PromptInput.ActionMenuTrigger` advertises `prompt-input-action-menu-trigger`, not the underlying `prompt-input-button`. When adding a new part, follow `<family>-<kebab-name>` and lock it via `forceProps` if the part uses `Slot` so consumers can't replace it through `asChild`. See `react-cmdk-aschild` for the lock mechanism.

### CSS custom properties for theming

Every visual surface declares its tokens at the top of its block in `src/styles.css`. Four blocks because three of the four surfaces portal to `document.body` and can't inherit from `.pi-root`:

- `.cmdk-popup` → `--cmdk-*`
- `.pi-root` → `--pi-*`
- `.pi-menu-popup` → `--pi-menu-*`
- `.pi-tooltip` → `--pi-tooltip-*`

Read `react-cmdk-theming` before changing anything in `styles.css` or either luz file.

### `asChild` on interactive leaves

Three parts accept `asChild`: `CommandMenu.Item`, `PromptInput.Button`, `PromptInput.Submit`. All three delegate to `src/lib/slot.tsx`. The Slot semantics matter — event handlers compose, non-event undefined clears, `forceProps` locks identity attributes. Read `react-cmdk-aschild` before adding `asChild` to a new part or changing Slot behaviour.

### Controlled/uncontrolled via `useControllable`

`src/lib/use-controllable.ts` is the single source of truth for the controlled/uncontrolled pattern used across Root components. Always pair a controlled prop (`value`, `open`, `collapsed`, `committedQuery`, `scope`) with `default*` and an `on*Change` callback in the same prop set. Never mix `value` and `defaultValue` — `useControllable` warns in dev.

### Public hooks throw outside their Root

`useCommandMenu()`, `usePromptInput()`, `useSearchInput()` all throw when used outside their respective Root. This is intentional — it surfaces composition errors loudly instead of silently returning bogus state.

### Exported types

Every public component exports its `Props` type (`PromptInputRootProps`, `CommandMenuItemProps`, …). Consumers that write `forwardRef` adapters or wrapper components depend on these. **When you add or rename a prop, update the exported type AND verify `src/index.ts` re-exports it.**

## Where state lives

- **CommandMenu**: text + matchCount + page stack + searchPrefix in `CommandCoreProvider` (`internal/command-core/provider.tsx`); `open`/`page` props on `Root` can be controlled by the consumer.
- **PromptInput**: text + attachments + collapsed in `<Root>`; status comes from the consumer.
- **SearchInput**: live `query` + `committedQuery` + `scope` + `resultsOpen` + page in `<Root>`; `status` comes from the consumer. `query` is what the input shows; `committedQuery` is what the popup filters against (and only mutates on successful submit).

## Workflow when changing public API

1. Decide whether the change is additive or breaking. Breaking changes go in the next minor (pre-1.0 we ship breaking on minor); document under the appropriate "Upgrading X → Y" section in `README.md`.
2. Update the part itself in `src/parts/` or `src/prompt-input/` or `src/search-input/`.
3. Update the namespace assembly in `src/command-menu.tsx` / `src/prompt-input.tsx` / `src/search-input.tsx`.
4. Update `src/index.ts` if a new export is added.
5. Update the README API table.
6. Update `CHANGELOG.md`.
7. Add or update a Vitest test in `tests/`.
8. Verify the prototype in `app/` still renders by running `pnpm dev` and exercising the affected route.
9. Run `pnpm type-check && pnpm test && pnpm build` — `prepublishOnly` runs the same chain.

## What NOT to do

- **Don't bypass `src/lib/slot.tsx`** for new `asChild` surfaces. Roll-your-own Slots will desync from the documented merge rules (handler composition, `forceProps`, ref merging).
- **Don't import from `src/lib/context` or `src/hooks/use-command-menu` outside the package** when working in the prototype — use the public `useCommandMenu` re-export from `react-cmdk-base`. Internal modules are unstable.
- **Don't add a fifth token surface** unless the new surface portals to `document.body` (the reason there are four). Same-surface tokens go into the existing block.
- **Don't introduce a runtime icon dep**. SVGs are inlined per-part; consumers can override via `icon`/`children` props.
- **Don't widen `searchPrefix`** on `useCommandMenu()` — it's `readonly string[]` (since 0.10.x). Clone before mutating.
