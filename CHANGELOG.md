# Changelog

## 0.9.0 — 2026-05-24

### Added

- `PromptInput.Picker` + Trigger / Content / Item / Group / GroupLabel — a generic single-value picker built on Base UI's `Select` primitive. Items announce as `option` inside a `listbox`. Supports `defaultValue` (uncontrolled), `name`/`form` (native form submission via hidden input), `multiple`, and object-valued items via `Select.Root`'s native props. The trigger auto-displays the selected item's text via `Select.Value` ONLY when items are supplied via the `items` prop on `Select.Root`; with JSX-child items, pass `label` on the trigger.
- The existing `PromptInput.ModelSelect` (Menu-based) is unchanged — keep using it when the popup mixes selection with arbitrary action items. Use `Picker` for pure value-from-list semantics.

### Salvaged from stale branches (forward-port wave)

- `Slot`: `useMergedRef` integration (stable ref identity), `forceProps` API for library-identity attributes, honors `event.baseUIHandlerPrevented`, React 19 ref-read order fix.
- `useMergedRef`: React 19 cleanup-function support, departing-ref notification, newly-added refs seeded with current node.
- `CommandMenu.Item`: `aria-label` override (with empty-string fall-through), `data-slot` locked via Slot.forceProps in asChild branch.
- `CommandMenu.Root`: `setPage` and `popPage` are no-op transitions when the target equals the current page (back-stack and onPageChange both skipped).
- `CommandMenu.Page`: `setSearchPrefix` short-circuits when contents are unchanged.
- `useAttachments`: StrictMode-safe `deferRevoke` (out of setAttachments updaters); new isolated test coverage.
- `useDragDrop`: stabilized `onDrop` via ref; new isolated test coverage.
- Tests: two-sided render-count assertion on pages test.
- README: nine forward-ported polish improvements (install snippet, Submit data-status / onStop, Button/Textarea/Tooltip API tables, etc.).

## Unreleased

### Added
- `PromptInput.Toolbar` — WAI-ARIA toolbar wrapper for the controls row, with arrow-key roving focus. Prefer over `PromptInput.Tools` when there are two or more controls.
- **Luz theme** — an opt-in visual theme published at
  `react-cmdk-base/themes/luz.css`. Maps `CommandMenu` to a Spotlight-style
  always-dark surface (20px corners, base-black bg, white items) and
  `PromptInput` to luz's light/dark FilterToolbar variants, with the
  product-purple-700 focus ring. Activate by setting `data-theme="luz"`
  on any ancestor (typically `<html>`). See README "Theming → Luz theme".
- **Luz palette** — an opt-in companion file at
  `react-cmdk-base/themes/luz-palette.css` that registers the full
  luz design-system palette (colors, radii, shadows, easing) under
  Tailwind v4's `@theme` namespaces. Consumer code can now write
  utilities like `bg-luz-product-purple-700`, `rounded-luz-toolbar`,
  and `shadow-luz-heavy` directly. Independent of the luz theme
  overlay — opt in to either, neither, or both. See README
  "Theming → Luz palette (Tailwind tokens)".

### Fixed
- `useControllable` no longer writes to a ref during render (React 18 concurrent-render hazard).
- `useDragDrop` observes element rebinds via state, so listeners reattach when the bound node changes.
- `PromptInput.AddScreenshot` catches unexpected errors from `getDisplayMedia` instead of leaking unhandled rejections.
- Pending collapse timer is cancelled when `collapsible` flips off mid-cycle.
- Luz theme: placeholder color is no longer identical to typed-text color.
- **A11y:** every `outline-none` swapped for `outline-hidden` across
  the CommandMenu input/list/items and PromptInput
  textarea/buttons/submit/menu items. Under Tailwind v4, `outline-none`
  literally sets `outline-style: none` and silently removes the focus
  indicator under Windows High Contrast Mode (forced colors).
  `outline-hidden` keeps the synthetic outline forced-colors users rely
  on while remaining invisible to sighted users (every surface already
  has a custom `ring-*` or `[data-highlighted]` focus indicator).
- **Visual regression:** `.pi-root` now uses `shadow-xs`. The v4 rename
  pushed `shadow-sm` to the former `shadow` value (heavier than the
  design intended); `shadow-xs` matches the v3-era subtle drop shadow.
- **Visual regression:** `.cmdk-backdrop` now uses `backdrop-blur-xs`
  (4px). The v4 rename pushed `backdrop-blur-sm` to 8px — twice the
  original intended blur.

### Changed
- `PromptInput.Tooltip`, `PromptInput.ActionMenuTrigger`, `PromptInput.ModelSelectTrigger`: switched to Base UI element-form `render` so consumer-supplied event handlers compose with Base UI's managed handlers (previously consumer handlers could overwrite Base UI's roving-focus/open/dismiss logic).
- `CommandMenu.Empty` stays mounted at all times and toggles via the `hidden` attribute, so screen readers announce the "had results → none" transition via the live region.
- `CommandMenu.Item` registers its match in `useLayoutEffect`, eliminating a one-frame `Empty` flash on fast typing.
- `CommandMenu.Input` wraps its row in `Combobox.InputGroup`, exposing `data-popup-open` / `data-list-empty` / `data-placeholder` etc. on the row element.
- `CommandMenu` dialog: drop redundant `aria-label` (Title now provides the accessible name); added `Dialog.Description` and `Dialog.Close` for screen-reader users.
- `PromptInput.Textarea` accessible-name default changed from the form's `label` (was `"Prompt input"`) to `"Message"` — no more duplicate-label announcement.
- `useCmdkShortcut` accepts either Cmd or Ctrl modifier — no `navigator.platform` sniff.
- **Internals:** `.pi-btn` and `.pi-submit` focus rings now use
  Tailwind's public `ring-(--pi-focus-ring)` shorthand instead of
  overriding the private `--tw-ring-color` variable. Consumers who
  previously pasted custom `--tw-ring-color` declarations expecting
  them to compose with the library should migrate to the public form
  (`ring-(--your-var)`) for forward compatibility.
- **Internals:** `.pi-menu-popup` uses Tailwind v4's parens form for
  CSS-variable utility values (`origin-(--transform-origin)`).
- **Internals:** dropped the empty `<span class="pi-tooltip-content">`
  wrapper inside `PromptInput.Tooltip`. The class was rendered in JSX
  but had no CSS rule and was never part of the public surface.

### Removed

- `package.json` `"main"` and `"module"` fields — modern resolvers use the `exports` map (`./dist/index.js` is ESM-only).
- `src/lib/is-dev.ts` — replaced by inline `process.env.NODE_ENV !== "production"` checks. The production build strips these branches via tsup's `env` + `minifySyntax`.

## 0.7.0 — 2026-05-22

### Added
- `useControllable` hook (and its `UseControllableOptions` /
  `UseControllableResult` types) exported from the package — Radix-style
  controlled/uncontrolled state merge, used internally by
  `CommandMenu.Root` and `PromptInput.Root` and available to consumers
  building similar components.
- `data-slot="<family>-<part>"` attribute on every part's root DOM
  element in both component families. Consumers can target structural
  children without depending on internal classnames. Documented in
  README under "Styling hooks (data-slot)".

### Changed
- Dark mode is now driven by a single CSS-variable system. Previously,
  dark mode was implemented three ways simultaneously (scoped CSS
  variables, Tailwind `dark:` utilities, and one manual `.dark .foo`
  ancestor rule). All color decisions now flow through ~55 tokens across
  four surfaces (`.cmdk-popup`, `.pi-root`, `.pi-menu-popup`,
  `.pi-tooltip`) — three of which are portaled and therefore declare
  their own token blocks. Tokens are driven by BOTH
  `@media (prefers-color-scheme: dark)` AND a `.dark` ancestor selector,
  so consumers using either media-query or class-toggle dark mode will
  see correct theming. Visual output unchanged in both modes.

### Removed
- `placeholder` prop on `<CommandMenu.Root>` — was accepted by the type
  but never read at runtime. Pass `placeholder` to `<CommandMenu.Input>`
  instead.
- `delay` prop on `<PromptInput.Tooltip>` — was a no-op (the underlying
  Base UI `Tooltip.Root` does not accept a per-tooltip delay). Set
  `delay` on a `Tooltip.Provider` you own, or rely on the provider
  rendered by `<PromptInput.Root>`.

## 0.6.0 — 2026-05-21

### Added
- `<PromptInput.Root>` now accepts `collapsible`, `collapsed`,
  `defaultCollapsed`, and `onCollapsedChange` — opt into a single-row
  composer that animates open on hover/focus and collapses on `Escape`
  (when empty). See README "Collapsible state".
- `usePromptInput()` exposes `collapsible`, `collapsed`, and `setCollapsed`
  so consumers can drive the state from custom children.
- `<PromptInput.Header>`, `<PromptInput.Tools>`, and
  `<PromptInput.Attachments>` honor the new state by setting the
  `hidden` HTML attribute when collapsed. `<PromptInput.Footer>` switches
  to `display: contents` instead so `Submit` (nested inside) stays
  visible as a row sibling of `Body`.

### Changed
- `.pi-root[data-collapsible]` and `.pi-root[data-state="collapsed"]`
  selectors added; CSS transitions on `padding`, `max-height`, and submit
  button size over 150ms. Respects `prefers-reduced-motion: reduce`.
- Trigger handlers (`onPointerEnter`, `onPointerLeave`, `onFocus`,
  `onKeyDown`) now honor `event.defaultPrevented` — consumers can suppress
  the auto-expand/collapse by calling `e.preventDefault()` in their own
  handler.
- The Escape-to-collapse handler now only acts when the event originates
  from the textarea, so open Base UI menus can dismiss on Escape without
  also collapsing the prompt.


## 0.5.0 — 2026-05-21

### Changed
- **BREAKING: package renamed from `@benderson-fs/react-cmdk-base` to
  `react-cmdk-base`** (now public on npm). Update your imports:
  ```diff
  - import { CommandMenu } from "@benderson-fs/react-cmdk-base";
  + import { CommandMenu } from "react-cmdk-base";
  ```
- Published publicly on the npm registry; no PAT or `.npmrc` required.
  Install with `pnpm add react-cmdk-base @base-ui/react`.

### Added
- `package.json` `keywords`, `author`, and `bugs.url` for npm search +
  the "Issues" link on the npm page.
- `package.json` `sideEffects: ["**/*.css"]` so bundlers do not
  tree-shake the published stylesheet.
- `CHANGELOG.md` is now included in the published tarball.

### Removed
- `.npmrc` (was scoped to GitHub Packages; no longer needed).

## 0.4.0 — 2026-05-21

### Added
- README: complete `PromptInput` API tables (Root, Submit, Button, Textarea,
  Tooltip, ActionMenu cluster, ModelSelect cluster, Attachments, structural
  wrappers, `usePromptInput` hook, exported types) plus a runnable Usage
  example mirroring the CommandMenu one.
- README: `useCommandMenu()` return-shape table.
- `LICENSE` restored, attributing both the original (Albin Groen, 2021)
  and the current maintainer (Ben Henderson, 2026).

### Changed
- `--pi-border-strong` now applied via `.pi-root:focus-within` (previously
  declared but unreferenced). Visually: focus-within border darkens slightly.
- `--pi-radius-inner` now applied to `.pi-menu-popup` and
  `.pi-attachment-chip` (previously unreferenced). Override the token to
  reshape inner surfaces.
- README "Features" list refreshed to cover the 0.2.0 + 0.3.0 surface;
  intro reworded so the "no icon-library dependency" claim is accurate
  (the package inlines its own SVGs).

### Removed
- `.github/FUNDING.yml` (orphaned fork artifact pointing at the upstream
  maintainer).
- Tracked design specs and implementation plans under `docs/superpowers/`.
  These remain on disk but are now ignored — they're treated as local
  workspace artifacts rather than published documentation.

## 0.3.0 — 2026-05-21

### Added
- `<CommandMenu.Empty>` now auto-renders when the query is non-empty and no
  items match. Pass `alwaysRender` to force the previous behaviour.
- `<CommandMenu.Loading loading label?>` — `role="progressbar"` placeholder
  for async fetches.
- `<CommandMenu.Separator orientation?>` — built on Base UI `Separator`.
- `<CommandMenu.Root filter>` — supply a custom matcher (e.g. fuzzy
  scoring); replaces the default substring + keyword matcher.
- `<CommandMenu.Item forceMount>` — render an item regardless of the
  current query; doesn't inflate `matchCount`.
- `<PromptInput.Tooltip content shortcut? side?>` — Base UI Tooltip wrapper.
- `<PromptInput.Button tooltip>` — shorthand auto-wraps the button.
- `<PromptInput.AddScreenshot>` — Menu.Item that captures the screen via
  `getDisplayMedia` and adds the PNG as an attachment.
- `useCommandMenu()` now exposes `matchCount: number` and
  `filter: (query, label, keywords) => boolean`.

### Changed
- `.cmdk-group-label` is now `position: sticky` so headings stay visible as
  the list scrolls. Uses `var(--cmdk-bg)` for opacity, so consumer theme
  overrides apply.

## 0.2.0 — 2026-05-21

### Added
- `asChild` prop on `CommandMenu.Item`, `PromptInput.Button`, and
  `PromptInput.Submit` for design-system composition without wrapper elements.
- `PromptInput.ActionMenuItem` now accepts `keepOpen` to prevent the menu
  closing after selection.
- CSS-variable theme tokens: `--pi-bg`, `--pi-border`, `--pi-text`,
  `--pi-accent`, `--pi-radius` and friends; mirrored as `--cmdk-*` for the
  command menu popup. See README "Theming".
- `@example` JSDoc on `CommandMenu` and `PromptInput` exports.
- `displayName` on every public primitive for better DevTools output.

### Changed
- `PromptInput.Submit` now defaults its `status` from the Root context;
  passing the prop is only needed to override. Existing consumers that pass
  `status` keep working unchanged.

### Internal
- `Root` extracted `useAttachments` and `useDragDrop` hooks; `useMergedRef`
  helper introduced; `isDev()` replaces the inline NODE_ENV guard;
  `Slot` primitive added under `src/lib/` to support `asChild`.

## 0.1.0

Initial release.
