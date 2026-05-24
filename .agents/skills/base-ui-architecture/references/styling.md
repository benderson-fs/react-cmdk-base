# Styling

Base UI is unstyled and ships no CSS. Style each part via `className`, `style`, and `data-*` attributes. Tailwind, CSS Modules, and CSS-in-JS all work; you keep total control of the styling layer.

## Style hooks

### `className` (string or function)

Every part that renders an HTML element accepts `className`. It may be a string or a function of the part's `State`:

```tsx
<Switch.Thumb className="SwitchThumb" />

<Switch.Thumb className={(state) => (state.checked ? 'checked' : 'unchecked')} />
```

### `style` (object or function)

```tsx
<Switch.Thumb style={{ height: '100px' }} />

<Switch.Thumb style={(state) => ({ color: state.checked ? 'red' : 'blue' })} />
```

### `data-*` attributes

Every interactive part exposes state via data attributes — the preferred styling hook. Examples:

| Part | Attributes |
| :--- | :--- |
| Switch / Checkbox | `data-checked`, `data-unchecked`, `data-disabled`, `data-readonly` |
| Popover / Menu / Dialog trigger | `data-popup-open`, `data-disabled` |
| Positioner / Popup | `data-side="top|right|bottom|left|inline-start|inline-end|none"` (`none` is set when the popup is centered with no anchor — e.g. Select/NavigationMenu), `data-align="start|center|end"`, `data-anchor-hidden` |
| Animation (Positioner/Popup) | `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`, `data-instant` — see `animation.md` |
| Field parts | `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-focused`, `data-filled`, `data-disabled` |
| Menu/Select item | `data-highlighted`, `data-selected`, `data-disabled` |
| Animation | `data-starting-style`, `data-ending-style`, `data-instant` |

Check each component's API page for the full list.

### CSS variables

Positioners/Popups expose CSS variables for sizing/transforms:

| Variable | Source | Use |
| :--- | :--- | :--- |
| `--transform-origin` | Popup | Scale/translate animations |
| `--available-width`, `--available-height` | Positioner / Popup | Constrain popup size to viewport |
| `--anchor-width`, `--anchor-height` | Popup (where applicable) | Match popup to trigger width |
| `--popup-width`, `--popup-height` | Popup | Read measured popup size |
| `--positioner-width`, `--positioner-height` | Positioner | Read positioner size |

Consume with `var(--…)` or Tailwind arbitrary values: `max-h-[var(--available-height)]`, `origin-[var(--transform-origin)]`.

## Tailwind v4 (preferred)

Tailwind v4's data-attribute syntax pairs naturally with Base UI:

```tsx
import { Menu } from '@base-ui/react/menu';

export default function ExampleMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger className="flex h-8 items-center justify-center rounded-md border border-neutral-950 bg-white px-3 text-sm text-neutral-950 select-none hover:bg-neutral-100 active:bg-neutral-200 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:data-popup-open:bg-neutral-800 dark:focus-visible:outline-white">
        Song
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="outline-hidden" sideOffset={8}>
          <Menu.Popup className="origin-(--transform-origin) border border-neutral-950 bg-white py-1 text-neutral-950 outline-hidden transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-white dark:bg-neutral-950 dark:text-white">
            <Menu.Item className="flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950">
              Add to Library
            </Menu.Item>
            <Menu.Item className="flex cursor-default py-2 pr-8 pl-4 text-sm leading-4 outline-hidden select-none data-highlighted:bg-neutral-950 data-highlighted:text-white dark:data-highlighted:bg-white dark:data-highlighted:text-neutral-950">
              Add to Playlist
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
```

### Tailwind data-attribute patterns to memorise

| Pattern | Meaning |
| :--- | :--- |
| `data-popup-open:bg-x` | When the popup is open |
| `data-[side=bottom]:translate-y-1` | When the positioner anchors below |
| `data-[align=start]:origin-left` | Align-driven transform origin |
| `data-checked:bg-green-500` | Checkbox/Switch checked |
| `data-highlighted:bg-neutral-950` | Active item in Menu/Select/Combobox |
| `data-invalid:border-red-500` | Field validation state |
| `data-starting-style:opacity-0` / `data-ending-style:opacity-0` | Enter/exit transitions |
| `data-disabled:opacity-50` | Disabled state |
| `hover:not-data-disabled:bg-neutral-100` | Only hover when not disabled |

### Where Base UI **injects** styles

Base UI injects **layout** styles directly on the `Positioner` element (e.g. `position`, `top`/`left`, `transform`) using its Floating UI integration — do **not** try to position the positioner yourself. Style its **children** (`Popup`, `Arrow`) instead. Width/height on the positioner is fine when you want it to size with the anchor:

```tsx
<Menu.Positioner className="w-[var(--anchor-width)]" sideOffset={8} />
```

## Dark mode

Base UI is mode-agnostic — choose the strategy your app uses:

- **Tailwind v4 class strategy** — pair light/dark utilities: `bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white`.
- **`prefers-color-scheme`** — use `@media (prefers-color-scheme: dark)` in CSS Modules.
- Combine with data attributes for state + scheme: `data-popup-open:bg-neutral-100 dark:data-popup-open:bg-neutral-800`.

## CSS Modules (briefly)

Apply a class to each part; style it in a `.module.css` file using selectors on data attributes:

```tsx
import { Menu } from '@base-ui/react/menu';

export default function ExampleMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger className="Trigger">Song</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="Positioner" sideOffset={8}>
          <Menu.Popup className="Popup">
            <Menu.Item className="Item">Add to Library</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
```

```css
.Popup {
  transform-origin: var(--transform-origin);
  transition: transform 100ms ease-out, opacity 100ms ease-out;
}
.Popup[data-starting-style],
.Popup[data-ending-style] {
  opacity: 0;
  transform: scale(0.98);
}
.Item[data-highlighted] { background: #111; color: #fff; }
```

## CSS-in-JS

Wrap each part with `styled()` and assemble:

```tsx
import { Menu } from '@base-ui/react/menu';
import styled from '@emotion/styled';

const StyledMenuTrigger = styled(Menu.Trigger)` /* … */ `;
const StyledMenuPositioner = styled(Menu.Positioner)` /* … */ `;
const StyledMenuPopup = styled(Menu.Popup)` /* … */ `;
const StyledMenuItem = styled(Menu.Item)` /* … */ `;
```

## Gotchas

- **Don't position the `Positioner`.** Base UI handles that. Style its `Popup` child instead.
- **`outline-hidden` on positioner/popup.** Base UI's focus management may briefly focus the positioner; suppress its native outline and paint focus on the `Popup` content.
- **`data-starting-style` vs `data-open`.** Use `data-starting-style` / `data-ending-style` for **transitions** (cancellable), `data-open` / `data-closed` for **keyframe animations**. See `references/animation.md`.
- **CSS variable typos fail silently.** `origin-(--transform-orign)` (note the typo) won't error — verify against the API page.
- **Stacking context.** Wrap your app root in `isolation: isolate` so portal'd popups never lose to a stray `z-index` in your app shell.
