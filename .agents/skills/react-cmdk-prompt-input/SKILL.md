---
name: react-cmdk-prompt-input
description: Use when implementing, modifying, or reviewing PromptInput source or consumer code in react-cmdk-base — covers the status machine, attachments lifecycle (object-URL deferred-revoke / accept-maxFiles-maxFileSize gating), textarea state ownership, the collapsible state machine, Toolbar vs Tools, ActionMenu, Picker vs ModelSelect, and Submit's type-swap on stoppable status.
---

# PromptInput

A chat-style composer rendered as `<form>` with attachment state, status-aware Submit, and an optional collapsible single-row layout. Sub-parts use Base UI's `Menu` (ActionMenu, ModelSelect), `Select` (Picker), and `Tooltip`.

**REQUIRED BACKGROUND:** `react-cmdk-architecture` (start there). For specific Base UI primitives this skill builds on: `base-ui-components` → `menu.md`, `select.md`, `tooltip.md`.

## Anatomy

```
<PromptInput.Root onSubmit value? onValueChange? status? collapsible? …>
  <PromptInput.Attachments alwaysRender? />     // chip row; hides via `hidden` when collapsed
  <PromptInput.Header />                        // optional above-textarea content; hides when collapsed
  <PromptInput.Body>
    <PromptInput.Textarea placeholder? />       // auto-grow via field-sizing
  </PromptInput.Body>
  <PromptInput.Footer>                          // becomes display:contents when collapsed
    <PromptInput.Tools>                         // or <PromptInput.Toolbar> for 2+ controls
      <PromptInput.ActionMenu>…</PromptInput.ActionMenu>
      <PromptInput.Button tooltip? pressed? variant?>…</PromptInput.Button>
      <PromptInput.ModelSelect>…</PromptInput.ModelSelect>
       OR
      <PromptInput.Picker>…</PromptInput.Picker>
    </PromptInput.Tools>
    <PromptInput.Submit onStop? status? />      // stays visible when collapsed
  </PromptInput.Footer>
</PromptInput.Root>
```

Root mounts a `Tooltip.Provider` automatically so adjacent tooltips share the open-delay window. The hidden `<input type="file">` lives inside Root too.

## State ownership — who owns what

| State | Owner | Notes |
| --- | --- | --- |
| `text` | `<Root>` via `useControllable` | Consumer can read/write via `value`/`onValueChange` or `defaultValue`; **Textarea ignores its own `value`/`defaultValue` props** |
| `attachments` | `<Root>` via `useAttachments` (`src/lib/use-attachments.ts`) | Mutate ONLY via `addFiles` / `removeFile` / `clearFiles` from context |
| `collapsed` | `<Root>` via `useControllable` | Locked to `false` when `collapsible` is false; setter is no-op |
| `status` | **Consumer** | Passed in via `status` prop; defaults to `"ready"` |

The Textarea explicitly disregards consumer-supplied `value` / `defaultValue` on itself because text is fully owned by Root — passing it on Textarea is a no-op (silent, not a warn). When wiring "controlled text", pass `value` on `<Root>` instead.

## The status machine

`PromptInputStatus = "ready" | "submitted" | "streaming" | "error"`.

`isGenerating(status) = status === "submitted" || status === "streaming"` (exported from `src/prompt-input/context.ts`).

| Status | Submit icon | Submit aria-label | Submit `type` (default) | Enter in textarea | onSubmit fires? |
| --- | --- | --- | --- | --- | --- |
| `ready` | Send | "Send message" | `submit` | Submits | yes |
| `submitted` | Spinner | "Submitting" | `submit`, OR `button` if `onStop` is set | Blocked | no |
| `streaming` | Stop | "Stop generating" | `submit`, OR `button` if `onStop` is set | Blocked | no |
| `error` | X | "Retry" | `submit` | Submits | yes |

The Submit click is stoppable when `isGenerating(status) && onStop`. In that case, the click handler `event.preventDefault()`s and calls `onStop` instead of `onClick`; `buttonType` defaults to `"button"`. When `onStop` is absent during generation, the button stays `type="submit"` but the form-level guard (`if (isGenerating(status)) return;` in Root's `handleSubmit`) makes the submit a no-op — both layers are intentional belt-and-braces.

## Submit flow

`Root.handleSubmit`:

1. `event.preventDefault()`
2. If `isGenerating(status)` → return (guard)
3. Snapshot `{ text, files: attachments }`
4. Call `onSubmit(snapshot, event)` — return type `void | Promise<void>`
5. If Promise: `await` → on success `setText("")` + `clearFiles()`; on rejection KEEP content
6. If not Promise: clear text + files immediately

Compare to `SearchInput`'s submit which commits popup state on sync success BEFORE awaiting and keeps state on rejection. PromptInput clears AFTER, which is why a rejected Promise leaves the textarea/attachments populated for retry.

## Attachments — the lifecycle invariants (`src/lib/use-attachments.ts`)

`addFiles(files)` processes in this fixed order:

1. **accept filter** — patterns: `*/*` not supported, `image/*` (prefix), `.pdf` (extension), `application/pdf` (exact). Rejected count → `onError({ code: "accept" })`. Returns if all rejected.
2. **maxFileSize filter** — per-file byte cap. Rejected count → `onError({ code: "max_file_size" })`. Returns if all rejected.
3. **maxFiles cap** — `Math.max(0, maxFiles - attachmentsRef.current.length)`. Overage → `onError({ code: "max_files" })`. Slice to capacity.
4. For each remaining file: mint id (sequence-stable per Root), `URL.createObjectURL`, build `PromptInputAttachment`.
5. `setAttachments(prev => [...prev, ...new])`.

**Critical invariants**:

- **The ID, blob URL, and `onError` happen OUTSIDE the updater function.** This is intentional — StrictMode double-invokes updaters, and side effects inside would leak blob URLs and double-fire error callbacks.
- **Revokes are deferred** via `queueMicrotask` (or `Promise.resolve().then`). `removeFile` revokes the removed entry's URL after the React commit so `<img src={url}>` consumers can unmount cleanly without a broken-image flash (Safari).
- **`clearFiles`** revokes ALL current URLs. Used by Root after successful submit and synchronous-onSubmit success.
- **Unmount sweep** — Root's `useEffect` cleanup revokes all remaining URLs (also via `deferRevoke`).

**`onError` fires once per `addFiles` call per error code** — multiple files rejected for the same reason produce one event with a count in the message. Three rejection codes can fire in a single call (one each for `accept`, `max_file_size`, `max_files`).

## Drag/drop and paste

`useDragDrop({ globalDrop, onDrop })` — Root binds either to `document` (`globalDrop`) or to the form itself. Dropped files route through `addFiles`. `data-dragging=""` lands on the Root while a drag is over.

Textarea paste handler reads `event.clipboardData.files` and forwards to `addFiles` if any. Don't bypass — paste of files is one of the documented attachment routes.

Textarea Backspace on empty value removes the LAST attachment — but only when `event.repeat === false` (so holding Backspace doesn't shred the attachment list).

## Textarea quirks

- Hard-codes `rows={1}`. The `field-sizing: content` CSS handles auto-grow between 4rem and 12rem.
- `aria-label` defaults to Root's `label` prop (`"Prompt input"`).
- **Ignores its own `value` / `defaultValue` / `onChange`** — text state is fully owned by Root.
- Enter submits (IME-safe — checks `event.isComposing` and `event.keyCode === 229`). Shift+Enter inserts newline. Enter is suppressed while `isGenerating(status)`.

## The collapsible state machine (`src/prompt-input/root.tsx`)

Opt in via `<Root collapsible>`. Triggers (each respects `event.defaultPrevented` from the consumer's handler so you can cancel):

| Event | Trigger | Behaviour |
| --- | --- | --- |
| `pointerenter` on form | always (when collapsible) | Clear collapse timer, expand if collapsed |
| `focus` (any descendant) | always | Same as pointerenter |
| `pointerleave` from form | always | Schedule collapse after 150ms, then check guards |
| Escape keydown | **textarea only** (filtered by `target instanceof HTMLTextAreaElement && classList.contains("pi-textarea")`) | Guard-checked collapse + blur |

The 150ms pointerleave timer's tick runs the guards:

1. Form does NOT contain `document.activeElement` (focus-within check)
2. `isEmptyForCollapse()` — `text.length === 0 && attachments.length === 0 && !isGenerating(status)`

Only if both pass does it collapse. The Escape handler runs the same emptiness check.

**The Escape filter on `pi-textarea` is load-bearing** — without it, an open ActionMenu or ModelSelect dismissing on Escape would also collapse the prompt. If you add a new collapsible-aware part with a textarea, give it the `pi-textarea` class or duplicate the dismiss handling.

Root exposes two data attributes for styling hooks:

- `data-collapsible=""` (present whenever `collapsible` is on)
- `data-state="expanded" | "collapsed"`

`<Footer>` flips to `display: contents` when collapsed so `<Submit>` becomes a sibling of `<Body>` in the layout. `<Header>`, `<Tools>`, and `<Attachments>` set the `hidden` HTML attribute when collapsed (NOT `display: none` via CSS) — screen readers and tab navigation skip them automatically.

## Toolbar vs Tools

| Part | When |
| --- | --- |
| `<PromptInput.Tools>` | One control on the left of Footer. Plain `<div>`. |
| `<PromptInput.Toolbar>` | 2+ controls. Adds `role="toolbar"` and arrow-key roving focus (Base UI `Toolbar`). |

Toolbar without arrow-key navigation is a WAI-ARIA anti-pattern. Use `<Tools>` when there's a single control to skip the toolbar semantics entirely.

## ActionMenu, ModelSelect, Picker — what to pick

### `<PromptInput.ActionMenu>` (Base UI `Menu`)

Action menu — items announce as `menuitem`. Use for "+" affordance with `AddAttachments`, `AddScreenshot`, or arbitrary custom items. `ActionMenuItem` accepts `keepOpen` to leave the menu open after click.

### `<PromptInput.ModelSelect>` (Base UI `Menu` with `menuitemradio`)

Model picker built on Menu. Items announce as `menuitemradio` with `aria-checked`. Use when the popup MIXES selection with arbitrary action items (e.g. "GPT-4o", "Claude", separator, "Manage models…"). `ModelSelectItem onClick` runs BEFORE the value change.

### `<PromptInput.Picker>` (Base UI `Select`)

True listbox picker. Items announce as `option` inside `role="listbox"`. Use when the popup is purely "pick one value from a known list" — supports `defaultValue`, native form submission via `name`, grouping (`PickerGroup` + `PickerGroupLabel`), `PickerSeparator`, and auto-derived trigger labels via three patterns:

1. `<PickerTrigger label="GPT-4o" />` — verbatim, does NOT auto-update.
2. `<Picker items={[…]}>` — `<Select.Value>` derives from items.
3. `<PickerTrigger><Select.Value>{(v) => LABELS[v] ?? v}</Select.Value></PickerTrigger>` — lightest workaround.

**With JSX-child items and no `label` prop, `<Select.Value />` serializes the raw value** (e.g. `"gpt-4o"` instead of `"GPT-4o"`). All three patterns above are documented workarounds.

**Picker is modal by default** (locks page scroll, blocks outside clicks). When nesting inside another modal (Dialog, CommandMenu, …), pass `modal={false}` on `<Picker>`.

| | `ModelSelect` (Menu) | `Picker` (Select) |
| --- | --- | --- |
| Popup role | `menu` | `listbox` |
| Item role | `menuitemradio` | `option` |
| `defaultValue` | no | yes |
| Native form submission | no | yes (via `name`/`form`) |
| Group support | no | yes (`PickerGroup` + `PickerGroupLabel`) |
| Mixed selection + actions | yes | no — every item must be an `option` |

## Tooltip

`<PromptInput.Tooltip>` wraps one child in Base UI Tooltip. The shared `Tooltip.Provider` is auto-mounted by `<PromptInput.Root>`, so adjacent tooltips skip the open-delay. The positioner uses a fixed `sideOffset` of 6px.

`<PromptInput.Button tooltip={string | { content, shortcut?, side? }}>` is shorthand — it wraps the button in a Tooltip automatically.

**SearchInput does NOT auto-mount the provider** — consumers must add one themselves (see `react-cmdk-search-input`).

## `usePromptInput()` — public surface

Throws if used outside `<PromptInput.Root>`.

| Field | Notes |
| --- | --- |
| `text`, `setText` | Pair tied to `useControllable` |
| `attachments`, `addFiles`, `removeFile`, `clearFiles`, `openFileDialog` | Same instances Root uses |
| `status`, `label` | Reflect Root's props |
| `collapsible`, `collapsed`, `setCollapsed` | `collapsed` is always `false` when `collapsible` is off; `setCollapsed` is a no-op in that case |

`addFiles`, `removeFile`, `clearFiles` are stable across renders — safe to put in `useMemo`/`useCallback` deps.

## Status / status-prop conventions

- `<Submit status={…}>` overrides the context status, but ONLY for that button's icon + aria-label + type. The form-level guard still uses `ctx.status`. Use this when a sibling Submit should reflect a separate "retry" state without affecting the rest of the form.

## Submit `asChild`

`PromptInput.Submit` accepts `asChild`. In that branch:

- The Slot path applies `data-slot`, `data-status`, `aria-label`, the merged className, and the click handler.
- `buttonType` is still computed (`type ?? (stoppable ? "button" : "submit")`) but it's passed through — the asChild child's own `type` will WIN on collision per Slot semantics (since 0.10.x).
- The child receives the merged status icon ONLY if the child renders `{children}` from props; if not, the child draws its own content.

See `react-cmdk-aschild` for the full Slot semantics (event-handler composition, `forceProps`-locked `data-slot`, ref merging).

## Gotchas

- **Don't pass `value` / `defaultValue` to Textarea** — it's a no-op. Pass to Root instead.
- **Don't pass `rows` to Textarea** — it's hardcoded to `1` and field-sizing handles auto-grow.
- **Don't mutate `attachments` directly** — always go through `addFiles` / `removeFile` / `clearFiles`. Direct mutation skips the deferRevoke and leaks blob URLs.
- **Don't use Toolbar for a single control** — `<Tools>` is the right choice (toolbar without arrow nav is an a11y anti-pattern).
- **Don't pass `modal={true}` to Picker inside a Dialog/CommandMenu** — it already defaults to `true`. When nesting, pass `modal={false}`.
- **Don't omit `defaultValue` on Picker with `name`** — an unsubmitted Picker with `name` set but no `defaultValue` contributes an empty-string entry, indistinguishable from a deliberate empty selection.
- **Don't add a Submit that ignores `isGenerating(status)`** — both layers (button click + form submit) check it. Bypassing one and not the other creates ambiguous behaviour during streaming.
- **The Submit's `type` field is `type ?? (stoppable ? "button" : "submit")` — consumer-provided `type` wins.** Don't override this without thinking about what happens when the consumer explicitly sets `type="submit"` during streaming with `onStop` wired (the click won't stop; it will try to submit, which the form guard rejects).

## Where to look in source

- `src/prompt-input/root.tsx` — form, status guard, collapsible state machine, useAttachments wiring, Tooltip.Provider mount
- `src/prompt-input/submit.tsx` — status → icon / aria-label / type mapping, stoppable click
- `src/prompt-input/textarea.tsx` — text state ownership, Enter/Backspace/paste handling
- `src/prompt-input/footer.tsx` — `display: contents` switch
- `src/prompt-input/picker.tsx` — Select-based picker, items prop, native form submission
- `src/prompt-input/model-select.tsx` — Menu-based picker with `menuitemradio`
- `src/prompt-input/action-menu.tsx` + `add-attachments.tsx` + `add-screenshot.tsx`
- `src/lib/use-attachments.ts` — the canonical attachments lifecycle (read before changing any rule above)
- `src/lib/use-drag-drop.ts` — globalDrop vs form-scoped binding
