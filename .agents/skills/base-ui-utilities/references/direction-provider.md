# Direction Provider

Import: `import { DirectionProvider, useDirection } from '@base-ui/react/direction-provider'`

## When to use
- Tell Base UI components (e.g. `Slider`, navigation primitives, anything keyboard-direction-aware) to flip their RTL behavior. The provider does *not* change HTML or CSS — set `dir="rtl"` or `direction: rtl` yourself.
- Read the active direction inside a portaled subtree that lives outside the element carrying `dir="rtl"`.
- Mount near the root (or around any subtree whose direction differs from the rest of the app).

## API

### `<DirectionProvider>` props

| Prop        | Type              | Default | Description                                   |
| :---------- | :---------------- | :------ | :-------------------------------------------- |
| `direction` | `TextDirection`   | `'ltr'` | Reading direction propagated to Base UI tree. |
| `children`  | `React.ReactNode` | —       | —                                             |

### `useDirection()`

Returns `TextDirection`.

### Type aliases

- `TextDirection` = `'ltr' | 'rtl'`
- `DirectionProvider.Props` → `DirectionProviderProps`
- `DirectionProvider.State` → `DirectionProviderState` (`{}`) — the underlying type alias exists, though source's "Canonical Types" list only surfaces `DirectionProvider.Props`.
- `useDirection()` return type: `type ReturnValue = TextDirection;`

### Which components react to it?

Source documents this only generically ("enables child Base UI components to adjust behavior based on RTL text direction"); the lists below are derived from individual component docs and are heuristic — verify per component reference if you need certainty.

- **Floating positioners that accept logical `side` values (`'inline-start' | 'inline-end'`)** — verified per component refs: `Tooltip`, `Popover`, `Menu`, `ContextMenu`, `Select`, `Combobox`, `Autocomplete`, `PreviewCard`, `NavigationMenu`. In RTL mode `inline-start` resolves to the right edge and `inline-end` to the left. Numeric `side` values (`'left'`/`'right'`) are not flipped — prefer the logical values when you want RTL-aware positioning.
- **Keyboard-direction-aware controls** — `Slider` documents direction-aware arrow keys; arrow-key traversal in `Menu` / `Menubar` / `NavigationMenu` / `Toolbar` / `RadioGroup` / `Combobox` chip navigation typically follows direction. Verify the specific behaviour per component ref.
- **`useDirection()`** consumers — anything you author that needs the current direction inside a portal.

Components likely unaffected (no logical-side props, no arrow-key traversal): `Avatar`, `Button`, `Checkbox`, `Switch`, `Toggle`, `Separator`, `Progress`, `Meter`, `Accordion`, `Collapsible`, plain `Field`/`Form`/`Input` (HTML inherits `dir` natively).

Portaled subtrees rendered outside the `dir="rtl"` DOM ancestor still need a surrounding `DirectionProvider` (or use `useDirection`) to behave correctly.

## Examples

```tsx
import { Slider } from '@base-ui/react/slider';
import { DirectionProvider, useDirection } from '@base-ui/react/direction-provider';

export default function ExampleDirectionProvider() {
  return (
    // The provider only signals Base UI — you still set dir="rtl" on the DOM.
    <div dir="rtl">
      <DirectionProvider direction="rtl">
        <Slider.Root defaultValue={25}>
          <Slider.Control className="flex w-56 touch-none items-center py-3 select-none">
            <Slider.Track className="h-1 w-full bg-neutral-200 select-none dark:bg-neutral-800">
              <Slider.Indicator className="bg-neutral-950 select-none dark:bg-white" />
              <Slider.Thumb className="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:has-[:focus-visible]:outline-white" />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </DirectionProvider>
    </div>
  );
}

// Inside a portaled subtree (e.g. tooltip content) the inherited `dir` attribute
// may not apply. Use the hook to read the direction that the provider exposes.
function PortaledLabel() {
  const direction = useDirection(); // 'ltr' | 'rtl'
  return <span data-direction={direction}>...</span>;
}
```

## Where to mount

- **App-wide RTL:** wrap the root with `DirectionProvider direction="rtl"` and add `dir="rtl"` to `<html>` (or the top-level container). This guarantees portaled subtrees inherit the correct direction via context, even if they render under `document.body`.
- **Per-subtree RTL:** wrap just the section that should be RTL with both `dir="rtl"` (on the DOM element) and a nested `DirectionProvider`.
- **Reading direction inside a portal:** call `useDirection()` to get the current direction; pass it to whatever computes positioning/visual flipping in custom code.

The Base UI docs also include a CSS-Modules variant of the same slider example. The component code is identical — only the styling mechanism (`styles.Control`, `styles.Track`, etc.) changes. Tailwind and CSS Modules are interchangeable here.

## Gotchas
- Setting `direction="rtl"` on `<DirectionProvider>` does **not** apply `dir="rtl"` to the DOM or set `direction: rtl` in CSS — keep them in sync yourself. Layout/visual flipping is your responsibility.
- Portaled components (popovers, tooltips, dialogs, selects rendered into `document.body`) escape the ancestor with `dir="rtl"`. Wrap them — or the whole app — with `DirectionProvider` so they still see the correct direction.
- The provider only affects Base UI behavior (keyboard navigation, value mapping in sliders, etc.). It will not flip third-party components.
- The default is `'ltr'` — components without a surrounding `DirectionProvider` behave as LTR even if the DOM has `dir="rtl"`.
- `useDirection()` is documented as a hook to read the current text direction. Source does not document its behaviour outside a provider — best practice is to always mount one at the app root so the hook always sees a defined direction. Treat the return value as the source of truth inside portals.
- Nest providers freely — the nearest ancestor wins, so a localized `DirectionProvider direction="ltr"` inside an RTL-wide app forces its subtree back to LTR.
- Since `DirectionProvider` is implemented via React context, in Next.js App Router / RSC environments you typically need to mount it inside a `'use client'` component (e.g. a top-level `Providers.tsx`). Source doesn't state this requirement explicitly but it follows from React's RSC rules.
- Prefer logical `side` values (`'inline-start' | 'inline-end'`) for positioning when you want RTL to flip automatically — explicit `side="left"` / `side="right"` are not rewritten by the provider.
