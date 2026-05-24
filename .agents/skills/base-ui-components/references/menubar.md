# Menubar

Import: `import { Menubar } from '@base-ui/react/menubar'`

## When to use
- Build app-style menu bars (File / Edit / View / Help) with shared keyboard focus across multiple `Menu.Root` children.
- Provide roving focus, hover-to-switch, and modal/non-modal grouping for several adjacent menus.
- Compose with `Menu.*` parts (Trigger, Portal, Popup, Item, SubmenuRoot, etc.) — see `menu.md` for the menu surface.

## Anatomy
- `Menubar` — single-part wrapper around several `Menu.Root` siblings
  - `Menu.Root`
    - `Menu.Trigger`
    - `Menu.Portal`
      - `Menu.Backdrop`
      - `Menu.Positioner`
        - `Menu.Popup`
          - `Menu.Arrow`
          - `Menu.Item` / `Menu.LinkItem` / `Menu.Separator`
          - `Menu.SubmenuRoot` → `Menu.SubmenuTrigger`
          - `Menu.Group` → `Menu.GroupLabel`
          - `Menu.RadioGroup` → `Menu.RadioItem` → `Menu.RadioItemIndicator`
          - `Menu.CheckboxItem` → `Menu.CheckboxItemIndicator`
          - `Menu.Viewport`

## Parts API

### Menubar
The container for menus. Source doesn't declare an explicit rendered element for `Menubar` (unlike the other parts) — in practice it renders a `<div>`. Use the `render` prop if you need a different tag.
**Props:**
- `loopFocus` — `boolean` (`true`) — wrap arrow-key focus back to the first menu when the end is reached.
- `modal` — `boolean` (`true`) — modal behavior for the whole bar (locks scroll/outside pointer while a menu is open).
- `disabled` — `boolean` (`false`) — disables every menu in the bar.
- `orientation` — `MenuRoot.Orientation` (`'horizontal'`) — `'horizontal' | 'vertical'`; controls arrow-key axis for switching between menus.
- `className` — `string | ((state: Menubar.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Menubar.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Menubar.State) => ReactElement)`.

**Data attributes:**
- `data-orientation` — `'horizontal' | 'vertical'`.
- `data-has-submenu-open` — present when any submenu within the menubar is open.
- `data-modal` — present when `modal` is true.

**State (`Menubar.State`):**
- `orientation: MenuRoot.Orientation`
- `modal: boolean`
- `hasSubmenuOpen: boolean`

**External type:** `Orientation = 'horizontal' | 'vertical'`.

## Keyboard
| Key | Action |
| --- | --- |
| Arrow Right / Left | Move focus between sibling `Menu.Trigger`s (horizontal orientation). |
| Arrow Down / Up | Same, vertical orientation; also opens the focused menu when on a trigger. |
| Enter / Space | Open the focused menu and move focus to the first item. |
| Type-ahead | Match a trigger label by leading characters. |
| Arrow Down (while a menu is open) | Move highlight into the open menu's items. |
| Arrow Right / Left (while a menu is open) | Switch to the next / previous sibling menu; opens it automatically. |
| Escape | Close the open menu; focus stays on the trigger. |
| Tab | Exits the menubar entirely. |

## State
- Menubar is otherwise stateless beyond its own props — each child `Menu.Root` keeps its own `open`/`onOpenChange`. The bar coordinates focus and the "open on hover when a sibling is open" behavior automatically.
- `modal` and `loopFocus` apply bar-wide; per-menu equivalents on `Menu.Root` still work but the bar's `modal` flag takes precedence for cross-menu interactions.
- `data-has-submenu-open` lets you style the bar itself when any submenu is active (e.g., dim the rest of the chrome).

## Canonical example
```tsx
'use client';
import * as React from 'react';
import { Menubar } from '@base-ui/react/menubar';
import { Menu } from '@base-ui/react/menu';

const triggerClass =
  "h-8 border-0 bg-transparent px-3 text-sm text-neutral-950 select-none data-popup-open:bg-neutral-100 data-pressed:bg-neutral-100 data-disabled:text-neutral-500 focus-visible:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:text-white dark:data-popup-open:bg-neutral-800 dark:data-pressed:bg-neutral-800 dark:data-disabled:text-neutral-400 dark:focus-visible:outline-white";

const itemClass =
  "flex cursor-default items-center justify-between gap-4 py-2 pl-4 pr-4 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 data-highlighted:before:content-[''] dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white";

const popupClass =
  "origin-[var(--transform-origin)] border border-neutral-950 bg-white py-1 text-neutral-950 shadow-[0.25rem_0.25rem_0] shadow-black/12 outline-none transition-[scale,opacity] duration-100 ease-out data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-instant:transition-none dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none";

export default function ExampleMenubar() {
  const onClick = (e: React.MouseEvent<HTMLElement>) =>
    console.log(`${e.currentTarget.textContent} clicked`);

  return (
    <Menubar className="flex items-center">
      <Menu.Root>
        <Menu.Trigger className={triggerClass}>File</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="outline-none" sideOffset={4}>
            <Menu.Popup className={popupClass}>
              <Menu.Item className={itemClass} onClick={onClick}>New</Menu.Item>
              <Menu.Item className={itemClass} onClick={onClick}>Open</Menu.Item>
              <Menu.SubmenuRoot>
                <Menu.SubmenuTrigger className={itemClass}>
                  Export <CaretRight />
                </Menu.SubmenuTrigger>
                <Menu.Portal>
                  <Menu.Positioner sideOffset={-4} alignOffset={-4}>
                    <Menu.Popup className={popupClass}>
                      <Menu.Item className={itemClass} onClick={onClick}>PDF</Menu.Item>
                      <Menu.Item className={itemClass} onClick={onClick}>PNG</Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.SubmenuRoot>
              <Menu.Separator className="mx-1 my-1 h-px bg-neutral-950 dark:bg-white" />
              <Menu.Item className={itemClass} onClick={onClick}>Print</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger className={triggerClass}>Edit</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={4}>
            <Menu.Popup className={popupClass}>
              <Menu.Item className={itemClass} onClick={onClick}>Cut</Menu.Item>
              <Menu.Item className={itemClass} onClick={onClick}>Copy</Menu.Item>
              <Menu.Item className={itemClass} onClick={onClick}>Paste</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Menu.Root disabled>
        <Menu.Trigger className={triggerClass}>Help</Menu.Trigger>
      </Menu.Root>
    </Menubar>
  );
}

function CaretRight(props: React.ComponentProps<'svg'>) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}><path d="M6 12V4l4.5 4z" /></svg>;
}
```

## Gotchas
- `Menubar` only coordinates direct `Menu.Root` children — wrapping them in additional fragments/components is fine, but the menus themselves must be siblings within the menubar element.
- Once a menu is open, hovering an adjacent `Menu.Trigger` auto-opens it. Set `openOnHover={false}` on the trigger to opt out per-menu.
- `Menubar`'s `modal` flag overrides per-menu modality across the bar; set both to `false` if you need a non-blocking menu bar.
- `disabled` on `Menubar` disables every child menu; you can still disable individual `Menu.Root`s for finer control.
- `data-has-submenu-open` is useful when you want to dim non-active menus or pause global hotkeys while a deep submenu chain is open.
- Use `loopFocus={false}` if you want arrow keys at the ends of the bar to stop instead of wrapping to the opposite end.
- For vertical menu bars (`orientation='vertical'`), invert the arrow-key axis: Up/Down moves between triggers and Right opens menus to the side via `Menu.Positioner side='right'`.
