# Changelog

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
