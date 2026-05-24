---
name: base-ui-utilities
description: Use when working with @base-ui/react helper utilities — CSP nonce handling for inline styles, RTL via DirectionProvider, mergeProps for combining event handlers/classNames/styles across prop sets, or useRender for adding a Base UI-style `render` prop (and merging refs) to your own component.
---

# Base UI utilities

Four helpers exported from `@base-ui/react`. Most projects won't need all of them — reach for these when you hit the specific situation.

| Need | Open |
| --- | --- |
| Strict CSP — nonce inline styles or disable them | `references/csp-provider.md` |
| RTL support across all Base UI components | `references/direction-provider.md` |
| Combine multiple prop sets (events, className, style) on one element | `references/merge-props.md` |
| Build your own component with a Base UI-style `render` prop | `references/use-render.md` |

## Quick orientation

- **`CSPProvider`** — wrap the app to inject `nonce` on `<style>`/`<script>` tags Base UI emits (or `disableStyleElements` to render none). Pair with your existing CSP setup.
- **`DirectionProvider`** — wrap the app (or a subtree) with `direction="rtl"`. All Floating-UI-based components (`Popover`, `Menu`, `Select`, `Combobox`, …) flip their `side`/`align` automatically.
- **`mergeProps`** — `mergeProps(set1, set2, …)` produces a single props object. Event handlers compose (right-to-left), `className` concatenates, `style` merges. **`ref` is NOT merged — only the rightmost `ref` wins.** Use `useRender`'s `ref` array option when you need to fork refs. Use `mergeProps` when wrapping a Base UI part with extra behaviour on the same DOM node.
- **`useRender`** — implement Base UI's `render: ReactElement | (props, state) => ReactElement` contract in your own component. Returns the props object to spread onto the rendered element.

For the `render` prop pattern *applied to* Base UI parts (the common case), read `../base-ui-architecture/references/composition.md` first.
