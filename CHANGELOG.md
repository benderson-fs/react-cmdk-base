# Changelog

## [Unreleased]

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
