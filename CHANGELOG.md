# Changelog

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
