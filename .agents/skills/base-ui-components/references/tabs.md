# Tabs

Import: `import { Tabs } from '@base-ui/react/tabs'`

## When to use
- Toggle between related panels on the same page.
- Horizontal or vertical orientation, with optional sliding indicator.
- For navigation across routes, render `Tabs.Tab` as anchors via `render` + `nativeButton={false}`.

## Anatomy
```
Tabs.Root
  Tabs.List
    Tabs.Tab
    Tabs.Indicator
  Tabs.Panel
```

## Parts API

### Tabs.Root
Groups tabs and panels. Renders `<div>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| defaultValue | `Tabs.Tab.Value` | `0` | Initial value (uncontrolled). `null` = no active tab. |
| value | `Tabs.Tab.Value` | - | Controlled active value. `null` = no active tab. |
| onValueChange | `((value: Tabs.Tab.Value, eventDetails: Tabs.Root.ChangeEventDetails) => void)` | - | Called on change. `reason`: `'none'` (user), `'initial'` (first auto-select), `'disabled'` (auto-fallback when active tab becomes disabled), `'missing'` (auto-fallback when active tab is removed). Automatic reasons cannot be canceled. |
| orientation | `Tabs.Root.Orientation` (`'horizontal' \| 'vertical'`) | `'horizontal'` | Layout flow direction. |
| className | `string \| ((state: Tabs.Root.State) => string \| undefined)` | - | Class or state-driven class. |
| style | `React.CSSProperties \| ((state: Tabs.Root.State) => React.CSSProperties \| undefined)` | - | Style or state-driven style. |
| render | `ReactElement \| ((props: HTMLProps, state: Tabs.Root.State) => ReactElement)` | - | Replace element or compose. |

**Data attributes:** `data-orientation` (`'horizontal' | 'vertical'`), `data-activation-direction` (`'left' | 'right' | 'up' | 'down' | 'none'`).

**CSS variables:** none.

### Tabs.List
Groups tab buttons. Renders `<div>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| activateOnFocus | `boolean` | `false` | Activate tab automatically on arrow-key focus. Otherwise requires Enter/Space. |
| loopFocus | `boolean` | `true` | Loop arrow-key focus at list ends. |
| className | `string \| ((state: Tabs.List.State) => string \| undefined)` | - | Class. |
| style | `React.CSSProperties \| ((state: Tabs.List.State) => React.CSSProperties \| undefined)` | - | Style. |
| render | `ReactElement \| ((props: HTMLProps, state: Tabs.List.State) => ReactElement)` | - | Replace element. |

**Data attributes:** `data-orientation`, `data-activation-direction`.

**CSS variables:** none.

### Tabs.Tab
Interactive tab button. Renders `<button>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| value\* | `Tabs.Tab.Value` | - | Value of this tab. |
| nativeButton | `boolean` | `true` | Set false when `render` produces non-button (e.g. `<a>`). |
| disabled | `boolean` | - | Disable this tab. Note SSR caveat: a disabled first tab will still appear selected during SSR — set `defaultValue`/`value` to an enabled tab. |
| className | `string \| ((state: Tabs.Tab.State) => string \| undefined)` | - | Class. |
| style | `React.CSSProperties \| ((state: Tabs.Tab.State) => React.CSSProperties \| undefined)` | - | Style. |
| render | `ReactElement \| ((props: HTMLProps, state: Tabs.Tab.State) => ReactElement)` | - | Replace element. |

**Data attributes:** `data-orientation`, `data-disabled`, `data-activation-direction`, `data-active`.

**CSS variables:** none.

### Tabs.Indicator
Visual indicator tracking the active tab. Renders `<span>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| renderBeforeHydration | `boolean` | `false` | Render before React hydrates to avoid SSR flash. |
| className | `string \| ((state: Tabs.Indicator.State) => string \| undefined)` | - | Class. |
| style | `React.CSSProperties \| ((state: Tabs.Indicator.State) => React.CSSProperties \| undefined)` | - | Style. |
| render | `ReactElement \| ((props: HTMLProps, state: Tabs.Indicator.State) => ReactElement)` | - | Replace element. |

**Data attributes:** `data-orientation`, `data-activation-direction`.

**CSS variables:**
| Variable | Type | Description |
| :--- | :--- | :--- |
| `--active-tab-bottom` | `number` | Distance from bottom of parent to active tab. |
| `--active-tab-height` | `number` | Active tab height. |
| `--active-tab-left` | `number` | Distance from left of parent to active tab. |
| `--active-tab-right` | `number` | Distance from right of parent to active tab. |
| `--active-tab-top` | `number` | Distance from top of parent to active tab. |
| `--active-tab-width` | `number` | Active tab width. |

### Tabs.Panel
Panel shown when matching tab is active. Renders `<div>`.

**Props:**
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| value\* | `Tabs.Tab.Value` | - | Value of the tab this panel belongs to. |
| keepMounted | `boolean` | `false` | Keep DOM mounted while hidden. |
| className | `string \| ((state: Tabs.Panel.State) => string \| undefined)` | - | Class. |
| style | `React.CSSProperties \| ((state: Tabs.Panel.State) => React.CSSProperties \| undefined)` | - | Style. |
| render | `ReactElement \| ((props: HTMLProps, state: Tabs.Panel.State) => ReactElement)` | - | Replace element. |

**Data attributes:** `data-orientation`, `data-activation-direction`, `data-hidden`, `data-index`, `data-starting-style`, `data-ending-style`.

**CSS variables:** none.

## Keyboard
| Key | Action |
| :--- | :--- |
| ArrowLeft / ArrowRight | Move between tabs (horizontal). |
| ArrowUp / ArrowDown | Move between tabs (vertical). |
| Home / End | Move to first / last enabled tab. |
| Enter / Space | Activate focused tab (unless `activateOnFocus`). |
| Tab | Move focus into panel; subsequent Tabs leave the component. |

## State
```tsx
// Uncontrolled
<Tabs.Root defaultValue="overview" />

// Controlled
const [value, setValue] = React.useState<Tabs.Tab.Value>('overview');
<Tabs.Root value={value} onValueChange={(next, details) => setValue(next)} />
```

Key types:
```ts
type TabsRootChangeEventReason = 'none' | 'disabled' | 'missing' | 'initial';
type TabsTabActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none';
type TabsTabValue = any; // any unique identifier per tab
```

## Animation
`Tabs.Panel` exposes `data-starting-style` (animating in) and `data-ending-style` (animating out). Set `keepMounted` if you need to animate without remounting. Drive Indicator transitions via `--active-tab-*` CSS variables.

## Canonical example
```tsx
// Tailwind v4
import { Tabs } from '@base-ui/react/tabs';

const tabClassName =
  'flex h-[calc(2rem+1px)] items-center justify-center bg-transparent px-2 py-0 font-inherit text-sm font-normal leading-5 break-keep whitespace-nowrap text-neutral-600 outline-none select-none hover:text-neutral-950 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-active:text-neutral-950 dark:text-neutral-300 dark:hover:text-white dark:data-active:text-white';

const panelClassName =
  'col-start-1 row-start-1 flex w-full items-center justify-center bg-white p-4 text-center text-sm text-neutral-950 outline-none focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white dark:bg-neutral-950 dark:text-white [[hidden]]:hidden';

export default function ExampleTabs() {
  return (
    <Tabs.Root className="w-full max-w-xs" defaultValue="overview">
      <Tabs.List className="relative z-1 -mb-px flex gap-1">
        <Tabs.Tab className={tabClassName} value="overview">Overview</Tabs.Tab>
        <Tabs.Tab className={tabClassName} value="projects">Projects</Tabs.Tab>
        <Tabs.Tab className={tabClassName} value="account">Account</Tabs.Tab>
        <Tabs.Indicator className="absolute top-0 left-0 -z-1 h-full w-(--active-tab-width) translate-x-(--active-tab-left) border-x border-t border-neutral-950 bg-white transition-[translate,width] duration-150 ease-in-out dark:border-white dark:bg-neutral-950" />
      </Tabs.List>
      <div className="grid w-full min-h-32 grid-cols-1 border border-neutral-950 dark:border-white">
        <Tabs.Panel className={panelClassName} value="overview">
          <p>Workspace stats and activity.</p>
        </Tabs.Panel>
        <Tabs.Panel className={panelClassName} value="projects">
          <p>Milestones and deadlines.</p>
        </Tabs.Panel>
        <Tabs.Panel className={panelClassName} value="account">
          <p>Profile and preferences.</p>
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
```

## Gotchas
- A disabled first tab works at runtime (next enabled tab is selected) but not during SSR. Set `defaultValue`/`value` explicitly to an enabled tab to avoid hydration mismatch.
- `Tabs.Tab` defaults `nativeButton={true}`. When rendering as an anchor or link, pass both `nativeButton={false}` and `render={<a />}` / `render={<Link />}`.
- `activateOnFocus` changes the activation model — keyboard arrows then auto-activate panels. Pair with `keepMounted` if panels are expensive to mount.
- The Indicator uses the `--active-tab-*` CSS variables; you must absolutely position it inside `Tabs.List` and read those vars for translation/sizing.
- Use `renderBeforeHydration` to avoid the indicator briefly being absent after SSR.
- `onValueChange` reasons other than `'none'` are automatic — `cancel()` is a no-op for `'initial'`, `'disabled'`, `'missing'`.
