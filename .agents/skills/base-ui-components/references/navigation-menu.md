# Navigation Menu

Import: `import { NavigationMenu } from '@base-ui/react/navigation-menu'`

## When to use
- Top-level site navigation that opens content panels on hover/click (mega-menu style).
- Supports nested submenus by nesting another `NavigationMenu.Root` inside a `Content`.
- Use `Menu` instead for command/action menus; use `Popover` for arbitrary popups.

## Anatomy
- `NavigationMenu.Root` (`<nav>` at top level, `<div>` when nested)
  - `NavigationMenu.List` (`<ul>`)
    - `NavigationMenu.Item` (`<li>`)
      - `NavigationMenu.Trigger` (`<button>`) — opens content
        - `NavigationMenu.Icon`
      - `NavigationMenu.Content` — moved into popup viewport when active
        - `NavigationMenu.Link` (`<a>`)
  - `NavigationMenu.Portal`
    - `NavigationMenu.Backdrop`
    - `NavigationMenu.Positioner`
      - `NavigationMenu.Popup` (`<nav>`)
        - `NavigationMenu.Arrow`
        - `NavigationMenu.Viewport`

## Parts API

### NavigationMenu.Root
Renders `<nav>` (or `<div>` when nested). Owns value/open state.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultValue` | `Value \| null` | `null` | Uncontrolled initial open item. |
| `value` | `Value \| null` | `null` | Controlled open item; non-nullish = open. |
| `onValueChange` | `(value: Value \| null, eventDetails: NavigationMenu.Root.ChangeEventDetails) => void` | — | Fires on value change. |
| `actionsRef` | `React.RefObject<NavigationMenu.Root.Actions \| null>` | — | Imperative actions (`unmount`). |
| `onOpenChangeComplete` | `(open: boolean) => void` | — | Fires after open/close animations complete. |
| `delay` | `number` | `50` | Open delay (ms). |
| `closeDelay` | `number` | `50` | Close delay (ms). |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | — |
| `className` / `style` / `render` | state-aware standard | — | — |

**State:** `{ open: boolean; nested: boolean }`.
**Root.Actions:** `{ unmount: () => void }`.
**Root.ChangeEventReason:** `'trigger-press' \| 'trigger-hover' \| 'outside-press' \| 'list-navigation' \| 'focus-out' \| 'escape-key' \| 'link-press' \| 'none'`.
**Root.ChangeEventDetails:** discriminated union by `reason` with matching `event`; plus `cancel()`, `allowPropagation()`, `isCanceled`, `isPropagationAllowed`, `trigger`.
**Root.Value:** `type NavigationMenuRootValue<TValue = any> = TValue | null`.

### NavigationMenu.Trigger
Renders `<button>`. Opens content on hover or press.

**Props:** `nativeButton` (default `true` — set `false` if `render`ing non-button), plus `className`/`style`/`render`.
**Data attributes:** `data-popup-open`, `data-pressed`.
**State:** `{ open: boolean }`.

### NavigationMenu.Icon
Indicator icon inside a trigger.
**Props:** `className`/`style`/`render`. **State:** `{ open: boolean }`.

### NavigationMenu.List
Renders `<ul>`. **Props:** `className`/`style`/`render`. **State:** `{ open: boolean }`.

### NavigationMenu.Item
Renders `<li>`.
**Props:** `value` (`any` — unique identifier, auto-generated if omitted), plus standard.
**State:** `{}`.

### NavigationMenu.Content
Renders `<div>`. Content is moved into the popup viewport when its item is active.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `keepMounted` | `boolean` | `false` | Keep mounted while closed (helps SSR/crawlers). |
| `className` / `style` / `render` | state-aware | — | — |

**Data attributes:** `data-open`, `data-closed`, `data-activation-direction` (`left`/`right`/`up`/`down`), `data-starting-style`, `data-ending-style`.
**State:** `{ open: boolean; transitionStatus: TransitionStatus; activationDirection: 'left' \| 'right' \| 'up' \| 'down' \| null }`.

### NavigationMenu.Portal
Renders `<div>`. Portals popup tree (default to `<body>`).
**Props:** `container` (`HTMLElement \| ShadowRoot \| RefObject<...> \| null`), `keepMounted` (default `false`), standard.
**State:** `{}`.

### NavigationMenu.Backdrop
Renders `<div>`. Optional backdrop behind popup.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`.
**State:** `{ open: boolean; transitionStatus: TransitionStatus }`.

### NavigationMenu.Positioner
Renders `<div>`. Anchors popup to active trigger.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `disableAnchorTracking` | `boolean` | `false` | Stop tracking anchor layout shifts. |
| `align` | `Align` (`'start' \| 'center' \| 'end'`) | `'center'` | — |
| `alignOffset` | `number \| OffsetFunction` | `0` | — |
| `side` | `Side` (`'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-end' \| 'inline-start'`) | `'bottom'` | May auto-flip. |
| `sideOffset` | `number \| OffsetFunction` | `0` | — |
| `arrowPadding` | `number` | `5` | — |
| `anchor` | `Element \| VirtualElement \| RefObject<Element \| null> \| (() => Element \| VirtualElement \| null) \| null` | — | Default: trigger. |
| `collisionAvoidance` | `CollisionAvoidance` | — | `{ side, align, fallbackAxisSide }` — see notes. |
| `collisionBoundary` | `Boundary` | `'clipping-ancestors'` | — |
| `collisionPadding` | `Padding` | `5` | — |
| `sticky` | `boolean` | `false` | Keep popup visible after anchor scrolls out. |
| `positionMethod` | `'absolute' \| 'fixed'` | `'absolute'` | — |
| `className` / `style` / `render` | state-aware | — | — |

`OffsetFunction`: `(data: { side; align; anchor: {width,height}; positioner: {width,height} }) => number`.
**Data attributes:** `data-open`, `data-closed`, `data-anchor-hidden`, `data-align` (`start|center|end`), `data-instant`, `data-side`.
**CSS variables:** `--anchor-height`, `--anchor-width`, `--available-height`, `--available-width`, `--positioner-height`, `--positioner-width`, `--transform-origin`.
**State:** `{ open: boolean; side: Side; align: Align; anchorHidden: boolean; instant: boolean }`.

### NavigationMenu.Popup
Renders `<nav>`. Container for current content.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-align`, `data-side`, `data-starting-style`, `data-ending-style`.
**CSS variables:** `--popup-height`, `--popup-width`.
**State:** `{ open: boolean; transitionStatus: TransitionStatus; side: Side; align: Align; anchorHidden: boolean }`.

### NavigationMenu.Arrow
Renders `<div>`. Pointer toward current anchor.
**Props:** standard.
**Data attributes:** `data-open`, `data-closed`, `data-uncentered`, `data-align`, `data-side`.
**State:** `{ open: boolean; side: Side; align: Align; uncentered: boolean }`.

### NavigationMenu.Viewport
Renders `<div>`. Clipping region for the active item's content.
**Props:** standard. **State:** `{}`.

### NavigationMenu.Link
Renders `<a>`. Use `render={<NextLink href={...} />}` (or equivalent) for client-side routing.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `closeOnClick` | `boolean` | `false` | Close menu on link click. |
| `active` | `boolean` | `false` | Mark as current page. |
| `className` / `style` / `render` | state-aware | — | — |

**Data attributes:** `data-active`.
**State:** `{ active: boolean }`.

## Keyboard
| Key | Action |
| :-- | :--- |
| `Tab` / `Shift+Tab` | Moves focus between triggers and into open content. |
| `ArrowLeft` / `ArrowRight` | Move between sibling triggers (horizontal orientation). |
| `ArrowUp` / `ArrowDown` | Move between triggers in vertical orientation. |
| `Enter` / `Space` | Activate trigger or link. |
| `Escape` | Close popup. |

## State
Controlled: `<NavigationMenu.Root value={value} onValueChange={setValue}>`.
Uncontrolled: `<NavigationMenu.Root defaultValue={null}>`.
Imperative close: `actionsRef.current?.unmount()` (also forces unmount after animations).
Inside `onValueChange`, call `eventDetails.cancel()` to block Base UI's default close, or `allowPropagation()` to let the event bubble.

## Animation
- `data-starting-style` / `data-ending-style` on `Popup`, `Backdrop`, `Content` mark enter/exit phases — set the "off" styles here.
- `data-instant` on `Positioner` skips transitions (e.g. mid-flight side changes).
- `Content` exposes `data-activation-direction` to animate slide transitions when switching between items.
- `--transform-origin`, `--popup-width/height`, `--positioner-width/height` enable scale/size transitions.

## Canonical example
```tsx
// Tailwind v4
import * as React from 'react';
import { NavigationMenu } from '@base-ui/react/navigation-menu';

const triggerClass =
  "flex h-8 items-center gap-1.5 bg-transparent px-3 text-sm select-none hover:bg-neutral-100 data-popup-open:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:hover:bg-neutral-800 dark:data-popup-open:bg-neutral-800";

export default function ExampleNavigationMenu() {
  return (
    <NavigationMenu.Root className="min-w-max text-neutral-950 dark:text-white">
      <NavigationMenu.List className="relative flex gap-px">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className={triggerClass}>
            Overview
            <NavigationMenu.Icon className="transition-transform duration-200 data-popup-open:rotate-180">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12 6H4l4 4.5z" /></svg>
            </NavigationMenu.Icon>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="p-2 transition-opacity duration-300 data-starting-style:opacity-0 data-ending-style:opacity-0">
            <ul className="m-0 grid w-72 list-none grid-cols-1 p-0">
              <li>
                <NavigationMenu.Link href="/quick-start" className="block p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  Quick Start
                </NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          sideOffset={10}
          collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
          className="h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-300 data-instant:transition-none"
        >
          <NavigationMenu.Popup className="origin-[var(--transform-origin)] h-[var(--popup-height)] w-[var(--popup-width)] border border-neutral-950 bg-white shadow-md transition-[opacity,transform,width,height] duration-300 data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0 dark:border-white dark:bg-neutral-950">
            <NavigationMenu.Arrow className="data-[side=bottom]:top-[-6px]" />
            <NavigationMenu.Viewport className="relative h-full w-full overflow-hidden" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
```

## Gotchas
- `Content` is rendered inside its `Item` in markup but is portaled into `Viewport` at runtime — style it as a panel, not as anchored content.
- Use `render={<a />}` or a framework `Link` on `NavigationMenu.Link` for routing; without `render`, it renders a plain `<a>`.
- Set `nativeButton={false}` on `Trigger` if you `render` a non-button element (e.g. a `Link`).
- Width/height of popup come from CSS variables (`--popup-width`/`--popup-height`); transition them rather than measuring layout yourself.
- Nest `NavigationMenu.Root` inside `Content` for submenus — the nested root automatically renders a `<div>` instead of `<nav>`.
- `delay`/`closeDelay` are 50ms by default; bump them for steadier hover behavior on dense menus.
- `actionsRef.current?.unmount()` forcibly tears down the popup (skip exit animation) — useful for route changes.
