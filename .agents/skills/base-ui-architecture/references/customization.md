# Customization

Base UI components are customised through a small set of consistent primitives: custom change events with `eventDetails`, the `render` prop for slot replacement, and controlled/uncontrolled state.

## Base UI change events

Change handlers like `onOpenChange`, `onValueChange`, `onPressedChange`, `onCheckedChange` are **Base UI events**, not React DOM events. They can fire from DOM events, internal effects, or even during render.

Signatures:

```ts
onOpenChange:    (open: boolean, eventDetails: BaseUIChangeEventDetails) => void
onValueChange:   (value: T,       eventDetails: BaseUIChangeEventDetails) => void
onPressedChange: (pressed: boolean, eventDetails: BaseUIChangeEventDetails) => void
```

### `eventDetails`

The second argument to every Base UI change handler:

```ts
interface BaseUIChangeEventDetails {
  reason: string;
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
}
```

| Field | Purpose |
| :--- | :--- |
| `reason` | String identifying **why** the change happened (e.g. `'trigger-press'`, `'escape-key'`, `'outside-press'`, `'item-press'`). Most IDEs autocomplete these after typing `reason === '`. |
| `event` | Native DOM event that triggered the change. |
| `cancel()` | Prevents Base UI from changing internal state. |
| `allowPropagation()` | Allows the DOM event to propagate in cases where Base UI normally stops it (e.g. <kbd>Esc</kbd> closing nested popups). |
| `isCanceled` | Whether `cancel()` has been called. |
| `isPropagationAllowed` | Whether the DOM event will propagate. |

### Cancelling an event

Prevent a state change without going fully controlled:

```tsx
<Tooltip.Root
  onOpenChange={(open, eventDetails) => {
    if (eventDetails.reason === 'trigger-press') {
      eventDetails.cancel();
    }
  }}
>
  …
</Tooltip.Root>
```

The component stays uncontrolled; only the disallowed transition is blocked.

### Allowing event propagation

Most popups stop <kbd>Esc</kbd> propagation so parent popups don't all close. Opt out per case:

```tsx
<Tooltip.Root
  onOpenChange={(open, eventDetails) => {
    if (eventDetails.reason === 'escape-key') {
      eventDetails.allowPropagation();
    }
  }}
>
  …
</Tooltip.Root>
```

## Preventing Base UI from handling a React event

Use `event.preventBaseUIHandler()` on the React synthetic event to skip Base UI's built-in handler:

```tsx
<NumberField.Input
  onPaste={(event) => {
    event.preventBaseUIHandler();
  }}
/>
```

Use as an escape hatch when no dedicated prop exists. Some interactions use native (not React) events; in those cases this method has no effect.

## Controlled vs uncontrolled

Components are **uncontrolled by default** — they manage their own state.

```tsx
<Dialog.Root>
  <Dialog.Trigger />
</Dialog.Root>
```

Make them controlled by pairing the value prop with its change handler:

```tsx
const [open, setOpen] = React.useState(false);

React.useEffect(() => {
  const t = setTimeout(() => setOpen(true), 1000);
  return () => clearTimeout(t);
}, []);

<Dialog.Root open={open} onOpenChange={setOpen}>
  {/* No trigger required */}
</Dialog.Root>;
```

Controlled mode also lets you read the value from outside the root.

The handbook's *customization* page only demonstrates Dialog; the table below consolidates the controlled/uncontrolled prop pairs from each component's reference (`../../base-ui-components/references/<slug>.md`) — verify there for the canonical prop set.

| Component | Uncontrolled prop | Controlled props |
| :--- | :--- | :--- |
| Dialog / Popover / Tooltip / Menu / Drawer / NavigationMenu | `defaultOpen` | `open` + `onOpenChange` |
| Select / Combobox / Autocomplete | `defaultValue`, `defaultOpen` | `value` + `onValueChange`, `open` + `onOpenChange` |
| Checkbox / Switch | `defaultChecked` | `checked` + `onCheckedChange` |
| RadioGroup / Tabs / ToggleGroup | `defaultValue` | `value` + `onValueChange` |
| Slider / NumberField | `defaultValue` | `value` + `onValueChange` |
| Toggle | `defaultPressed` | `pressed` + `onPressedChange` |
| OTPField | `defaultValue` | `value` + `onValueChange` |

## Slot replacement via `render`

`render` is the slot-replacement primitive. Three forms:

```tsx
{/* Change rendered element */}
<Menu.Item render={<a href="/x" />}>Link item</Menu.Item>

{/* Compose with your component */}
<Menu.Trigger render={<MyButton size="md" />}>Open</Menu.Trigger>

{/* Full control via function form */}
<Switch.Thumb
  render={(props, state) => (
    <span {...props}>{state.checked ? <Check /> : <X />}</span>
  )}
/>
```

See `references/composition.md` for full details.

## Prop forwarding rules

For composition to work, your custom components **must**:

1. Use `React.forwardRef` (or `ref` prop in React 19) and pass `ref` to the underlying DOM node.
2. Spread all received props onto the DOM node — particularly `onClick`, `onKeyDown`, `aria-*`, `data-*`, `style`, and `className`.
3. Merge, don't replace, when you add your own handlers/className. Use a small helper or `mergeProps` from `@base-ui/react/utils/merge-props` (see `base-ui-utilities`).

Anti-pattern (drops Base UI handlers):

```tsx
const MyButton = React.forwardRef<HTMLButtonElement>(function MyButton(props, ref) {
  return <button ref={ref} className="my-button" onClick={() => console.log('click')} />;
  // Bug: props discarded; Base UI's onClick handler never fires.
});
```

Correct:

```tsx
const MyButton = React.forwardRef<HTMLButtonElement, MyButtonProps>(
  function MyButton({ onClick, className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={cn('my-button', className)}
        onClick={(e) => {
          console.log('click');
          onClick?.(e);
        }}
        {...rest}
      />
    );
  },
);
```

## Imperative actions via `actionsRef`

Several components expose imperative actions through `actionsRef`. The exact action surface is documented in each component's reference (`../../base-ui-components/references/<slug>.md`) — overlays typically expose `{ unmount(), close() }`, `Field.Root` exposes `{ validate() }`, `Form` exposes `{ validate(fieldName?) }`.

```tsx
const actionsRef = React.useRef<Popover.Root.Actions>(null);

<Popover.Root actionsRef={actionsRef}>…</Popover.Root>

// Later:
actionsRef.current?.unmount();
```

| Component | Action |
| :--- | :--- |
| Dialog / Popover / Drawer / Menu / Select / Tooltip / Popups | `unmount()` — used with manual unmount animations |
| Field.Root | `validate()` |
| Form | `validate(fieldName?)` |

See the individual component pages for the full action surface.

## Customization checklist

- Need to **change DOM tag**? `render={<a />}`.
- Need to **wrap with your component**? `render={<MyButton />}` (forwardRef + spread).
- Need to **render different children based on state**? `render={(props, state) => …}`.
- Need to **block an internal state change**? `eventDetails.cancel()`.
- Need to **opt out of Base UI's handling**? `event.preventBaseUIHandler()`.
- Need to **observe state externally**? Switch to controlled (`open` + `onOpenChange`, etc.).
- Need to **drive unmount timing**? `actionsRef.current.unmount()`.
