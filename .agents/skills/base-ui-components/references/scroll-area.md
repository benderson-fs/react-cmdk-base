# Scroll Area

Import: `import { ScrollArea } from '@base-ui/react/scroll-area'`

## When to use
- Replace native scrollbars with custom-styled ones while keeping native scrolling behaviour, accessibility, and momentum.
- Build scrollable regions that need scroll edge masks, fade indicators, or overflow-aware styling.
- Pair with `<Tabs.List render={<ScrollArea.Viewport />} />` when a horizontally scrolling tablist needs overflow state.

## Anatomy
- `ScrollArea.Root`
  - `ScrollArea.Viewport`
    - `ScrollArea.Content`
  - `ScrollArea.Scrollbar` (one per axis)
    - `ScrollArea.Thumb`
  - `ScrollArea.Corner` (optional, for both-axis scroll)

## Parts API

### ScrollArea.Root
Groups all parts. Renders a `<div>`.

**Props:**
- `overflowEdgeThreshold`: `number | Partial<{ xStart: number; xEnd: number; yStart: number; yEnd: number }>` (default `0`) — pixels of overflow required before edge attributes apply.
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-has-overflow-x`, `data-has-overflow-y`, `data-overflow-x-end`, `data-overflow-x-start`, `data-overflow-y-end`, `data-overflow-y-start`, `data-scrolling`.

**CSS variables:** `--scroll-area-corner-height`, `--scroll-area-corner-width`.

### ScrollArea.Viewport
The actual scrollable container. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).

**Data attributes:** `data-has-overflow-x`, `data-has-overflow-y`, `data-overflow-x-end`, `data-overflow-x-start`, `data-overflow-y-end`, `data-overflow-y-start`, `data-scrolling`.

**CSS variables:** `--scroll-area-overflow-x-end`, `--scroll-area-overflow-x-start`, `--scroll-area-overflow-y-end`, `--scroll-area-overflow-y-start` (pixel distances from each edge).

### ScrollArea.Content
Wrapper for the scrollable content. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).

**Data attributes:** none on the element directly (state mirrors Root/Viewport).

### ScrollArea.Scrollbar
A vertical or horizontal scrollbar. Renders a `<div>`.

**Props:**
- `orientation`: `'vertical' | 'horizontal'` (default `'vertical'`).
- `keepMounted`: `boolean` (default `false`) — keep mounted even when the viewport is not scrollable.
- `className`, `style`, `render` (state-aware).

**Data attributes:** `data-orientation` (`'horizontal' | 'vertical'`), `data-has-overflow-x`, `data-has-overflow-y`, `data-hovering`, `data-overflow-x-end`, `data-overflow-x-start`, `data-overflow-y-end`, `data-overflow-y-start`, `data-scrolling`.

**CSS variables:** `--scroll-area-thumb-height`, `--scroll-area-thumb-width`.

### ScrollArea.Thumb
The draggable indicator inside `Scrollbar`. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes:** `data-orientation` (`'horizontal' | 'vertical'`).

### ScrollArea.Corner
Filler at the intersection of two scrollbars. Renders a `<div>`.

**Props:** `className`, `style`, `render` (state-aware).
**Data attributes / CSS variables:** none.

## Keyboard
| Key | Effect |
| --- | --- |
| Tab | Focus the viewport (when focusable / has `tabindex`). |
| Arrow keys | Scroll the viewport when focused (native scroll behaviour). |
| Page Up / Page Down | Scroll by one page vertically. |
| Home / End | Scroll to start / end of the scrollable axis. |
| Space / Shift+Space | Page down / up (native). |

## State

```ts
type ScrollAreaRootState = {
  scrolling: boolean;
  hasOverflowX: boolean;
  hasOverflowY: boolean;
  overflowXStart: boolean;
  overflowXEnd: boolean;
  overflowYStart: boolean;
  overflowYEnd: boolean;
  cornerHidden: boolean;
};
// Viewport.State and Content.State have the same shape as Root.State.

type ScrollAreaScrollbarState = ScrollAreaRootState & {
  hovering: boolean;
  orientation: 'vertical' | 'horizontal';
};

type ScrollAreaThumbState = { orientation?: 'vertical' | 'horizontal' };
type ScrollAreaCornerState = {};

type Coords = { x: number; y: number };
type HiddenState = { x: boolean; y: boolean; corner: boolean };
type OverflowEdges = { xStart: boolean; xEnd: boolean; yStart: boolean; yEnd: boolean };
type Size = { width: number; height: number };
```

Fully uncontrolled — scroll position is owned by the browser's native scroll container.

## Animation
There is no enter/exit transition. Animate `Scrollbar` opacity using `data-hovering` and `data-scrolling`. Use the `--scroll-area-overflow-*` CSS variables on `Viewport` to drive CSS masks/fades that react to scroll position.

## Canonical example
```tsx
// Tailwind v4
import { ScrollArea } from '@base-ui/react/scroll-area';

export default function ExampleScrollArea() {
  return (
    <ScrollArea.Root className="h-[8.5rem] w-96 max-w-[calc(100vw-8rem)] bg-white dark:bg-neutral-950">
      <ScrollArea.Viewport className="h-full border border-neutral-950 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:border-white dark:focus-visible:outline-white">
        <ScrollArea.Content className="flex flex-col gap-4 py-2 pr-5 pl-3 text-sm leading-[1.375rem] text-neutral-950 dark:text-white">
          <p>
            Vernacular architecture is building done outside any academic tradition, and without
            professional guidance. It is a broad category, encompassing many building types and
            methods of construction, both historical and modern.
          </p>
          <p>
            It usually serves immediate, local needs and is constrained by the materials available
            in its particular region, reflecting local traditions and cultural practices.
          </p>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="pointer-events-none m-px flex w-4 justify-center bg-black/12 opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0 dark:bg-white/12">
        <ScrollArea.Thumb className="w-full bg-neutral-950 dark:bg-white" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
```

## Gotchas
- `ScrollArea.Root` is not the scroll container — `ScrollArea.Viewport` is. Set the height/width constraint on `Root` (or both) and let `Viewport` fill it.
- Render one `ScrollArea.Scrollbar` per axis; include `ScrollArea.Corner` if both are present to keep them from overlapping.
- The `--scroll-area-overflow-*` variables are scoped to `Viewport` and do not inherit by default; child elements must opt-in with `--scroll-area-overflow-y-start: inherit;` etc.
- Provide an SSR fallback like `var(--scroll-area-overflow-y-end, 40px)` because the variables are only set after hydration.
- `data-scrolling` is the live "user is scrolling" flag — use it (with `transition-duration: 0ms`) to make scrollbars appear instantly while scrolling and fade out otherwise.
- When using `<Tabs.List render={<ScrollArea.Viewport />} />`, the tab list itself becomes the scrollable element, so put overflow-driven styles on it.
- `overflowEdgeThreshold` prevents the edge attributes from flickering for sub-pixel content overflow.
