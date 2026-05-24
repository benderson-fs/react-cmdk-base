# Accessibility

Base UI handles ARIA, roles, pointer interactions, keyboard navigation, and focus management out of the box, following the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/). You augment it with labels, visible focus styles, and contrast.

## What Base UI handles for you

| Concern | Provided by Base UI |
| :--- | :--- |
| ARIA roles and attributes | Yes — applied automatically to all parts |
| Pointer interactions | Yes — click/hover/long-press handlers per pattern |
| Keyboard navigation | Yes — arrow keys, alphanumeric typeahead, <kbd>Home</kbd>/<kbd>End</kbd>/<kbd>Enter</kbd>/<kbd>Esc</kbd> |
| Focus management on open/close | Yes — automatic, plus `initialFocus` / `finalFocus` props on overlay components |
| Roving tabindex / composite widget focus | Yes — internal to Menu, Tabs, Toolbar, RadioGroup, etc. |
| Auto-association of form controls | Yes — via `Form`, `Field`, `Fieldset`, `Input` |

## What you must add

### 1. Accessible labels

For every form control or custom widget, ensure an accessible name exists.

| Control | Strategy |
| :--- | :--- |
| `Input`, `NumberField`, `OTPField`, `Autocomplete`, `Combobox` (external input), `Checkbox`, `Radio`, `Switch` | Wrap with `<Field.Label>` (or native `<label>`) |
| `Combobox` (input inside popup) | `<Combobox.Label>` |
| `Select` | `<Select.Label>` |
| `Slider` | `<Slider.Label>`; for multi-thumb add `aria-label` on each `<Slider.Thumb>` |
| Groups (range slider, checkbox/radio group) | `<Fieldset.Root render={<Slider.Root />}>` + `<Fieldset.Legend>` |
| Custom controls without a visible label | `aria-label` or `aria-labelledby` on the control |
| Images / icon buttons | `alt`, `aria-label` |

`<Checkbox.Root>`, `<Radio.Root>`, `<Switch.Root>` can be **implicitly** labelled by wrapping them inside `<Field.Label>`:

```tsx
<Field.Root>
  <Field.Label>
    <Switch.Root />
    Developer mode
  </Field.Label>
  <Field.Description>Enables extra tools for web developers</Field.Description>
</Field.Root>
```

### 2. Visible focus styles

Base UI manages focus but does not paint it. You **must** style `:focus` / `:focus-visible` to meet [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance):

```tsx
<Popover.Trigger className="focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white" />
```

### 3. Color contrast

Meet WCAG 2.2 minimums between foreground and background. For modern color science, consider [APCA](https://apcacontrast.com/). Use Base UI's data attributes to ensure disabled/invalid/checked states still meet contrast:

```tsx
<Field.Control className="data-invalid:text-red-700 data-disabled:text-neutral-500" />
```

### 4. Describing controls

`<Field.Description>` auto-wires `aria-describedby`. Place it inside `<Field.Root>` — no manual ID wiring needed:

```tsx
<Field.Root>
  <Select.Root>
    <Select.Label>Time zone</Select.Label>
    <Select.Trigger />
  </Select.Root>
  <Field.Description>Used for notifications and reminders</Field.Description>
</Field.Root>
```

### 5. Error announcement

`<Field.Error>` is rendered into the accessibility tree only while the field is invalid. Use the `match` prop to scope a message to a specific [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) flag:

```tsx
<Field.Error match="valueMissing">You must create a username</Field.Error>
```

## Keyboard shortcuts you get for free

Refer to each component's docs for the exact key map; the common patterns:

- **Menu / Select / Combobox / Autocomplete:** <kbd>↑</kbd><kbd>↓</kbd> to move, typeahead by letter, <kbd>Home</kbd>/<kbd>End</kbd> to jump, <kbd>Enter</kbd>/<kbd>Space</kbd> to activate, <kbd>Esc</kbd> to close.
- **Tabs / Toolbar / RadioGroup:** roving tabindex; <kbd>←</kbd><kbd>→</kbd> (or <kbd>↑</kbd><kbd>↓</kbd> in vertical orientation).
- **Dialog / Popover:** focus trap while open; <kbd>Esc</kbd> closes; focus returns to trigger.
- **Slider:** arrow keys to step; <kbd>PageUp</kbd>/<kbd>PageDown</kbd> for larger steps; <kbd>Home</kbd>/<kbd>End</kbd> for min/max.

## Testing

Base UI is tested across browsers, devices, platforms, and screen readers. Still run your composed UI through automated audits (axe, Lighthouse) and at least one screen-reader smoke test (NVDA, VoiceOver) before shipping — your composition can still introduce labelling or focus regressions.
