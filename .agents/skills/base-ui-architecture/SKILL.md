---
name: base-ui-architecture
description: Use when writing, styling, debugging, or composing any @base-ui/react component — covers anatomy patterns, the render prop, data-attribute styling, transitions, forms, accessibility, TypeScript, and project setup. Pair with base-ui-components when working with a specific primitive.
---

# Base UI architecture

`@base-ui/react` (peer-pinned to `^1.5.0` in this repo) is an unstyled, accessible primitives library. Every interactive component follows the same anatomy: state lives in `Root`, behaviour in `Trigger`, layout in `Portal` → `Positioner`, content in `Popup` (+ optional `Arrow`). Every part exposes its state via `data-*` attributes and CSS variables instead of class names you'd have to memorise.

**Tailwind v4 is the styling default.** Examples assume Tailwind v4. If `package.json` uses v3, translate `data-[state=open]:` → `data-state-open:` etc. manually.

## When working with Base UI

| Task | Open |
| --- | --- |
| Setting up Base UI in a new file or project | `references/quick-start.md` |
| Styling a component (Tailwind, CSS Modules, dark mode) | `references/styling.md` |
| Animating enter/exit, swapping content, framer-motion | `references/animation.md` |
| Composing parts with your own components (`render` prop) | `references/composition.md` |
| Controlled vs uncontrolled, slot replacement, prop forwarding | `references/customization.md` |
| Building forms (Field + Form + RHF/TanStack integration) | `references/forms.md` |
| TypeScript generics, ref typing, render-prop typing | `references/typescript.md` |
| What Base UI does for a11y vs what you must add | `references/accessibility.md` |
| Specific component API (Tooltip, Dialog, Menu, etc.) | `../base-ui-components/SKILL.md` |
| `mergeProps`, `useRender`, CSP, RTL | `../base-ui-utilities/SKILL.md` |

## Universal patterns

- **Portal + Positioner pairing**: anchored floating components (`Tooltip`, `Popover`, `Menu`, `Select`, `Combobox`, `Autocomplete`, `NavigationMenu`, `ContextMenu`, `PreviewCard`) require `Portal` → `Positioner` → `Popup`. **`Dialog` and `Drawer` are modal surfaces, not anchored** — they use `Portal` → `Backdrop` + `Popup` (no `Positioner`).
- **Styling = data attributes**: prefer `className="data-[state=open]:opacity-100"` over render-function branches. `data-*` selectors cover all state transitions for free.
- **Animations**: `data-starting-style` (enter), `data-ending-style` (exit), `data-instant` (skip transition). Set `keepMounted` on `Portal`/`Positioner` if exit anims need the previous mount.
- **Controlled/uncontrolled**: every stateful component takes `value`/`defaultValue`/`onValueChange` or `open`/`defaultOpen`/`onOpenChange` — never both `value` and `defaultValue`.

## Always read the reference

If your task touches a specific component, read its reference file in `base-ui-components/references/<slug>.md` **before** writing code. Parts, props, and data attributes vary per component and are easy to mis-remember.
