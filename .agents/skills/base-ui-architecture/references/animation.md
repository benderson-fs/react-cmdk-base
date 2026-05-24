# Animation

Base UI components animate through CSS transitions, CSS animations, or JS libraries (Motion / framer-motion). Each component exposes data attributes for state and dedicated attributes for enter/exit phases.

## Attributes summary

| Attribute | Purpose | Use with |
| :--- | :--- | :--- |
| `[data-starting-style]` | Initial style **to transition from** when becoming visible (also applied when becoming hidden so closing animates back to it) | CSS **transitions** |
| `[data-ending-style]` | Final style **to transition to** when becoming hidden | CSS **transitions** |
| `[data-open]` | Applied while the component is visible | CSS **animations** (`@keyframes`) |
| `[data-closed]` | Applied just before the component becomes hidden | CSS **animations** (`@keyframes`) |
| `[data-instant]` | Skips animation for this state change. Documented per-component (Popup/Arrow/Viewport on Tooltip, Popover, Menu, Select, Combobox, Autocomplete, ContextMenu) — not in the handbook. Carries enum values that differ per component (`'delay'`, `'dismiss'`, `'focus'`, `'click'`, `'group'`, `'trigger-change'`). Match the attribute presence, not a specific value, for the cleanest CSS. | All approaches |

## CSS transitions (preferred)

Transitions can be **smoothly cancelled mid-flight** — if the user closes a popup while it's opening, it reverses cleanly. Prefer these over keyframe animations.

```tsx
<Popover.Popup
  className="origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0"
/>
```

Equivalent CSS:

```css
.Popup {
  transform-origin: var(--transform-origin);
  transition: transform 150ms, opacity 150ms;
}
.Popup[data-starting-style],
.Popup[data-ending-style] {
  opacity: 0;
  transform: scale(0.9);
}
```

## CSS animations

Use `@keyframes` with `[data-open]` and `[data-closed]`. **Not cancellable mid-flight** — the animation will complete before the inverse plays.

```css
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes scaleOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }

.Popup[data-open]   { animation: scaleIn 250ms ease-out; }
.Popup[data-closed] { animation: scaleOut 250ms ease-in; }
```

Tailwind v4 equivalent (with custom keyframes in `@theme`):

```tsx
<Popover.Popup className="data-open:animate-[scaleIn_250ms_ease-out] data-closed:animate-[scaleOut_250ms_ease-in]" />
```

## JavaScript animations (Motion)

Base UI detects in-flight animations using [`element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations) before unmounting. Motion exposes `opacity` animations to `getAnimations()`, so Base UI waits automatically. **If your animation doesn't include `opacity`** (e.g. a translating drawer), animate `opacity` to a near-1 value (`opacity: 0.9999`) so Base UI can detect the in-flight animation.

### `keepMounted` — when it's required

Popup components (Popover, Dialog, Tooltip, Menu, Select, etc.) unmount from the DOM when closed by default. For exit animations driven by `<AnimatePresence>` to play, the popup must remain in the React tree long enough for Motion to drive the exit. Pass `keepMounted` to the `Portal` part:

```tsx
<Popover.Portal keepMounted>…</Popover.Portal>
```

### Pattern 1 — unmounted-when-closed components with `<AnimatePresence>`

Requirements:
1. Make the component **controlled** with `open` so `<AnimatePresence>` can see the conditional child.
2. Specify `keepMounted` on `<Portal>`.
3. Use `render` to compose the `<Popup>` with `motion.div`.

```tsx
'use client';
import * as React from 'react';
import { Popover } from '@base-ui/react/popover';
import { AnimatePresence, motion } from 'motion/react';

export default function AnimatedPopover() {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="px-3 h-8 border border-neutral-950 bg-white">
        Trigger
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal keepMounted>
            <Popover.Positioner sideOffset={8}>
              <Popover.Popup
                className="border border-neutral-950 bg-white p-3"
                render={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                }
              >
                Popup
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
```

### Pattern 2 — `keepMounted` components driven by `open` state

Components that stay in the DOM when closed need a different approach:

1. Use `render` to compose `<Popup>` with `motion.div`.
2. Drive `animate` props from `state.open` (use the **function** form of `render` to access state).
3. Skip `<AnimatePresence>` entirely.

```tsx
'use client';
import { Popover } from '@base-ui/react/popover';
import { motion, type HTMLMotionProps } from 'motion/react';

export default function AnimatedPopoverKept() {
  return (
    <Popover.Root>
      <Popover.Trigger>Trigger</Popover.Trigger>
      <Popover.Portal keepMounted>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            render={(props, state) => (
              <motion.div
                {...(props as HTMLMotionProps<'div'>)}
                initial={false}
                animate={{
                  opacity: state.open ? 1 : 0,
                  scale: state.open ? 1 : 0.8,
                }}
              />
            )}
          >
            Popup
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

### Pattern 3 — `Select` (mounts on first open, then persists)

`Select` is initially unmounted but stays mounted after first interaction. Combine both patterns: track a `mounted` flag once the positioner ref is attached, switch between the unmount/exit-driven `motion.div` and the open-state-driven one:

```tsx
'use client';
import * as React from 'react';
import { Select } from '@base-ui/react/select';
import { AnimatePresence, motion } from 'motion/react';

export default function AnimatedSelect() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const positionerRef = React.useCallback(() => setMounted(true), []);
  const portalMounted = open || mounted;

  const motionElement = mounted ? (
    <motion.div
      initial={false}
      animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.8 }}
    />
  ) : (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    />
  );

  return (
    <Select.Root items={ITEMS} open={open} onOpenChange={setOpen}>
      <Select.Trigger className="flex h-8 px-2 border border-neutral-950 bg-white">
        <Select.Value />
      </Select.Trigger>
      <AnimatePresence>
        {portalMounted && (
          <Select.Portal>
            <Select.Positioner sideOffset={4} ref={positionerRef}>
              <Select.Popup className="border border-neutral-950 bg-white" render={motionElement}>
                <Select.List>{/* items */}</Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        )}
      </AnimatePresence>
    </Select.Root>
  );
}
```

## Manual unmounting via `actionsRef`

For full control, pass an `actionsRef` to `<Root>` and call `actionsRef.current.unmount()` once your animation completes:

```tsx
function App() {
  const [open, setOpen] = React.useState(false);
  const actionsRef = React.useRef(null);

  return (
    <Popover.Root open={open} onOpenChange={setOpen} actionsRef={actionsRef}>
      <Popover.Trigger>Trigger</Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal keepMounted>
            <Popover.Positioner>
              <Popover.Popup
                render={
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onAnimationComplete={() => {
                      if (!open) actionsRef.current.unmount();
                    }}
                  />
                }
              />
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
```

## Transition coordination

- Base UI applies `data-starting-style` for **one frame** at mount, then removes it — that's what triggers the CSS transition. Don't depend on it remaining.
- `data-ending-style` is applied while the component is being torn down; Base UI waits for animations to finish (via `getAnimations()`) before fully unmounting.
- For coordinated multi-element transitions (e.g. backdrop + popup), use the same `transition-duration` on both — they share the same lifecycle.

## Gotchas

- **No `opacity` in your Motion animation?** Add `opacity: 0.9999` so Base UI's `getAnimations()` detection triggers; otherwise the popup unmounts immediately.
- **`keepMounted` is on `<Portal>`, not `<Root>`** — easy to misplace.
- **`<AnimatePresence>` needs a conditional child** — wrap the entire `<Portal>` in `{open && …}`, not just its descendants.
- **Render-function in `Popup` with Motion** — cast props (`props as HTMLMotionProps<'div'>`) since Motion and Base UI HTML prop types differ.
- **CSS animations don't cancel** — if your popup may open/close rapidly, prefer transitions.
- **Use `data-instant`** to skip animation on programmatic state changes (e.g. opening a dialog by URL on initial load).
