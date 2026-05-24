---
name: base-ui-components
description: Use when implementing, modifying, or debugging a specific @base-ui/react primitive (Accordion, Alert Dialog, Autocomplete, Avatar, Button, Checkbox, Checkbox Group, Collapsible, Combobox, Context Menu, Dialog, Drawer, Field, Fieldset, Form, Input, Menu, Menubar, Meter, Navigation Menu, Number Field, OTP Field, Popover, Preview Card, Progress, Radio, Scroll Area, Select, Separator, Slider, Switch, Tabs, Toast, Toggle, Toggle Group, Toolbar, Tooltip). One reference file per component documents every Part, prop, data attribute, CSS variable, and keyboard interaction.
---

# Base UI components

One reference file per primitive in `references/<slug>.md`. **Always read the reference before writing component code** — parts and prop defaults vary, and the docs are dense by design.

Each reference follows the same schema: `When to use` → `Anatomy` → `Parts API` → `Keyboard` → `State` → `Animation` → `Canonical example` → `Gotchas`.

## Choosing the right primitive

| Need | Reach for |
| --- | --- |
| Brief hover/focus label on an icon button | `tooltip.md` |
| Persistent floating UI with interactive content | `popover.md` |
| Right-click / long-press menu at the pointer | `context-menu.md` |
| Click-to-open menu of actions | `menu.md` |
| Picking one value from a list | `select.md` |
| Typing to filter + pick from a list | `autocomplete.md` (single value) or `combobox.md` (multi/grouped/freeform) |
| Modal overlay (any content) | `dialog.md` (non-blocking) or `alert-dialog.md` (requires response) |
| Bottom/side sheet with swipe-to-dismiss | `drawer.md` |
| Toast notifications | `toast.md` |
| Form field + label + error wiring | `field.md` (single field) + `form.md` (consolidated errors) |
| Numeric input with increment/decrement | `number-field.md` |
| OTP / verification code | `otp-field.md` |
| Switching between panels | `tabs.md` |
| Collapsible disclosure (one panel) | `collapsible.md` |
| Collapsible disclosure (multiple) | `accordion.md` |

For overlay components, also load `../base-ui-architecture/references/animation.md` for the enter/exit pattern.

## Universal overlay anatomy

```
<X.Root>                          // state + a11y
  <X.Trigger />                   // opens
  <X.Portal>                      // moves popup out of layout
    <X.Backdrop />                // optional dim layer (Dialog/Drawer)
    <X.Positioner>                // anchors via Floating UI
      <X.Popup>                   // the surface
        <X.Arrow />               // optional pointer
        … content …
      </X.Popup>
    </X.Positioner>
  </X.Portal>
</X.Root>
```

Floating components all expose the same Positioner props (`side`, `align`, `sideOffset`, `alignOffset`, `collisionAvoidance`, `collisionBoundary`, `arrowPadding`, `sticky`) and the same CSS variables (`--anchor-width`, `--anchor-height`, `--available-width`, `--available-height`, `--transform-origin`). Read one Positioner section and you've read them all.

## Index

37 components, one reference each: `references/{accordion,alert-dialog,autocomplete,avatar,button,checkbox,checkbox-group,collapsible,combobox,context-menu,dialog,drawer,field,fieldset,form,input,menu,menubar,meter,navigation-menu,number-field,otp-field,popover,preview-card,progress,radio,scroll-area,select,separator,slider,switch,tabs,toast,toggle,toggle-group,toolbar,tooltip}.md`.
