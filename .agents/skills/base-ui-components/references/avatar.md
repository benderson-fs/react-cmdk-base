# Avatar

Import: `import { Avatar } from '@base-ui/react/avatar'`

## When to use
- Show a user's profile picture with a graceful fallback to initials or an icon when the image fails or is missing.
- Use `Avatar.Fallback` with `delay` to avoid flashing initials while a slow image is loading.
- For purely decorative imagery without fallback semantics, just use a styled `<img>`.

## Anatomy
- `Avatar.Root` — span wrapper that tracks image-loading status for descendants
- `Avatar.Image` — the actual `<img>` (only displayed when loaded)
- `Avatar.Fallback` — shown while loading or after failure

## Parts API

### Avatar.Root
Renders a `<span>`. Container that tracks the image's loading status.
**Props:**
- `className` — `string \| ((state: Avatar.Root.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props: HTMLProps, state) => ReactElement)`

State exposed to render/className functions: `{ imageLoadingStatus: 'idle' | 'loading' | 'loaded' | 'error' }`.

### Avatar.Image
Renders an `<img>`. Standard `<img>` HTML attributes (`src`, `alt`, `width`, `height`, `srcSet`, etc.) are forwarded.
**Props:**
- `onLoadingStatusChange` — `(status: ImageLoadingStatus) => void` — fires on status transitions
- `className` — `string \| ((state: Avatar.Image.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props, state) => ReactElement)`

**Data attributes:**
- `data-starting-style` — image animating in
- `data-ending-style` — image animating out

State exposed: `{ transitionStatus, imageLoadingStatus }`.

### Avatar.Fallback
Renders a `<span>`. Shown when the image is loading, errored, or absent.
**Props:**
- `delay` — `number` — ms to wait before showing the fallback (prevents flash on fast loads)
- `className` — `string \| ((state: Avatar.Fallback.State) => string \| undefined)`
- `style` — `React.CSSProperties \| ((state) => React.CSSProperties \| undefined)`
- `render` — `ReactElement \| ((props, state) => ReactElement)`

State exposed: `{ imageLoadingStatus }`.

## State
- No open/value state; the avatar is purely derived from image load status.
- `ImageLoadingStatus` = `'idle' | 'loading' | 'loaded' | 'error'`. Subscribe via `Avatar.Image`'s `onLoadingStatusChange` or via the render-function state on any part.
- Each child receives the current `imageLoadingStatus` so you can style by status (e.g. `data-` attrs on Root, or className functions).

## Animation
- `Avatar.Image` exposes `data-starting-style` / `data-ending-style` so you can cross-fade the image as it transitions from `loading` to `loaded` (or back to `error`).
- The fallback itself does not currently expose transition data attrs — animate via parent state if needed.

## Canonical example
```tsx
import { Avatar } from '@base-ui/react/avatar';

export default function ExampleAvatar() {
  return (
    <div className="flex gap-4">
      <Avatar.Root className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200 align-middle text-sm leading-none font-normal text-neutral-950 select-none dark:bg-neutral-800 dark:text-white">
        <Avatar.Image
          src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
          width="48"
          height="48"
          className="size-full object-cover"
        />
        <Avatar.Fallback delay={600} className="flex size-full items-center justify-center text-sm">
          LT
        </Avatar.Fallback>
      </Avatar.Root>

      {/* Initials-only avatar (no Image) */}
      <Avatar.Root className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200 align-middle text-sm leading-none font-normal text-neutral-950 select-none dark:bg-neutral-800 dark:text-white">
        LT
      </Avatar.Root>
    </div>
  );
}
```

## Gotchas
- The fallback only appears after the configured `delay`; setting `delay={0}` (or omitting it) shows initials immediately, which can flash before a fast load resolves.
- `Avatar.Image` returns `null` until the image loads — only the fallback (or raw children of `Root`) is rendered during loading/error.
- The Root renders a `<span>` so the avatar can sit inside text or buttons without producing invalid HTML.
- Provide alt text via `Avatar.Image`'s standard `alt` prop; the fallback should be a readable label (initials) for screen readers when no image loads.
- Do not nest interactive elements inside `Avatar.Root`; wrap the avatar in a button if you need it clickable.
