# react-cmdk-base — PromptInput variant — design

**Status:** approved-for-implementation
**Date:** 2026-05-20
**Builds on:** [react-cmdk-base design](./2026-05-20-react-cmdk-base-design.md)

## Goal

Add a second top-level primitive, `PromptInput`, to `react-cmdk-base`. The shape and API are inspired by [AI Elements `PromptInput`](https://elements.ai-sdk.dev/components/prompt-input) — an auto-resizing chat-style textarea with a footer toolbar that hosts toggle buttons, dropdown action menus, a model picker, and a submit/stop button. We keep the AI-Elements composition (`PromptInput.Root` form + `Body` + `Textarea` + `Footer` containing `Tools` + `Submit`) but reimplement every primitive on top of Base UI — no shadcn, no Radix, no AI SDK types.

## Why a second variant in the same package

Both `CommandMenu` and `PromptInput` answer "what should we do?" UX in a Tailwind-styled, Base UI–native way. Shipping them together gives consumers a small surface (`react-cmdk-base`) for the keyboard-driven action layer of an app. They share the `cn` helper, the `styles.css` build, and the dark-mode/Tailwind conventions, but otherwise have no runtime coupling.

## Package layout addition

```
src/
├── prompt-input.tsx                 # <PromptInput> namespace re-export
├── parts/                           # (existing CommandMenu parts)
└── prompt-input/                    # NEW — sibling to parts/
    ├── root.tsx                     # <form> + PromptInputContext provider
    ├── body.tsx                     # block-grouping wrapper (contents)
    ├── textarea.tsx                 # auto-grow textarea, Enter-submit
    ├── footer.tsx                   # Header + Footer + Tools layout primitives
    ├── button.tsx                   # ghost/default button variants
    ├── submit.tsx                   # status-aware submit/stop button
    ├── action-menu.tsx              # base-ui Menu.Root + Trigger + Content + Item
    ├── add-attachments.tsx          # Menu.Item that opens the hidden file input
    ├── model-select.tsx             # Menu-based model picker (Trigger + Content + Item)
    ├── attachments.tsx              # display row of attachment chips with remove
    └── context.ts                   # PromptInputContext + hooks
```

Existing `src/styles.css` gets a new `@layer components` block (`pi-*` prefix).

`src/index.ts` adds `PromptInput` plus part exports and types. The namespace export pattern mirrors `CommandMenu`.

## Public API

```tsx
import { PromptInput } from "react-cmdk-base";
import "react-cmdk-base/styles.css";
import { GlobeIcon, PaperclipIcon, MonitorIcon } from "lucide-react";

const [status, setStatus] = useState<PromptInputStatus>("ready");
const [model, setModel] = useState("gpt-4o");

<PromptInput.Root onSubmit={({ text, files }) => { /* … */ }} multiple>
  <PromptInput.Attachments />
  <PromptInput.Body>
    <PromptInput.Textarea placeholder="What would you like to know?" />
  </PromptInput.Body>
  <PromptInput.Footer>
    <PromptInput.Tools>
      <PromptInput.ActionMenu>
        <PromptInput.ActionMenuTrigger />
        <PromptInput.ActionMenuContent>
          <PromptInput.AddAttachments />
          <PromptInput.ActionMenuItem onSelect={takeScreenshot}>
            <MonitorIcon /> Take screenshot
          </PromptInput.ActionMenuItem>
        </PromptInput.ActionMenuContent>
      </PromptInput.ActionMenu>

      <PromptInput.Button onClick={() => setSearch((s) => !s)} pressed={search}>
        <GlobeIcon /> Search
      </PromptInput.Button>

      <PromptInput.ModelSelect value={model} onValueChange={setModel}>
        <PromptInput.ModelSelectTrigger label={modelName(model)} />
        <PromptInput.ModelSelectContent>
          {models.map((m) => (
            <PromptInput.ModelSelectItem key={m.id} value={m.id}>
              {m.name}
            </PromptInput.ModelSelectItem>
          ))}
        </PromptInput.ModelSelectContent>
      </PromptInput.ModelSelect>
    </PromptInput.Tools>

    <PromptInput.Submit status={status} onStop={() => setStatus("ready")} />
  </PromptInput.Footer>
</PromptInput.Root>
```

### Part-by-part mapping to Base UI

| Library part | Base UI / native primitive |
| --- | --- |
| `Root` | native `<form>` + React context. Owns text value, attachments list, hidden file input, drag/drop handlers, submit handler |
| `Body` | plain `<div>` styled flex column |
| `Textarea` | native `<textarea>` with `field-sizing: content` for auto-grow; Enter-to-submit, Shift+Enter for newline, Backspace-on-empty removes last attachment, paste-with-files adds attachments |
| `Header` | plain `<div>`, flex-wrap row above textarea |
| `Footer` | plain `<div>`, flex row, `justify-between` |
| `Tools` | plain `<div>`, flex row, gap |
| `Button` | native `<button type="button">` with `variant` (`ghost` default, `default`) and `pressed` (data-pressed) for toggle state |
| `Submit` | native `<button type="submit">` whose icon & aria-label react to `status` (`ready`/`submitted`/`streaming`/`error`); becomes a stop button when `status === "streaming"` and `onStop` provided |
| `ActionMenu` | `Menu.Root` |
| `ActionMenuTrigger` | `Menu.Trigger` rendered through `PromptInput.Button` (plus default `PlusIcon`) |
| `ActionMenuContent` | `Menu.Portal` > `Menu.Positioner` > `Menu.Popup` |
| `ActionMenuItem` | `Menu.Item` styled like a row |
| `AddAttachments` | `Menu.Item` whose `onClick` calls `context.openFileDialog()` |
| `ModelSelect` | `Menu.Root` (we use Menu instead of base-ui Select so trigger styling matches the rest of the toolbar; selection state is managed by the consumer via `value` + `onValueChange`) |
| `ModelSelectTrigger` | `Menu.Trigger` rendered through `Button` with a chevron, accepts `label` prop |
| `ModelSelectContent` | `Menu.Portal` > `Menu.Positioner` > `Menu.Popup` with `aria-label="Model"` |
| `ModelSelectItem` | `Menu.Item` showing a check when its `value === current` |
| `Attachments` | plain `<div>` row of chips with filename + remove `<button>` |

### `Root` props

| name | type | default | description |
| --- | --- | --- | --- |
| `onSubmit` | `(message: PromptInputMessage, event: FormEvent) => void \| Promise<void>` | — | required; receives `{ text, files }`. The form resets on success |
| `accept` | `string` | — | file input `accept` attribute (e.g. `"image/*"`) |
| `multiple` | `boolean` | `false` | allow selecting multiple files |
| `maxFiles` | `number` | — | cap, extras dropped + `onError("max_files")` |
| `maxFileSize` | `number` | — | bytes; oversized files dropped + `onError("max_file_size")` |
| `globalDrop` | `boolean` | `false` | when true, drops anywhere on document add files |
| `onError` | `(err: { code, message }) => void` | — | validation reporter |
| `value` / `onValueChange` | `string` / `(v) => void` | — | optional controlled text |
| `defaultValue` | `string` | `""` | initial text in uncontrolled mode |
| `children` | `ReactNode` | — | parts |

### `Submit` props

| name | type | default | description |
| --- | --- | --- | --- |
| `status` | `"ready" \| "submitted" \| "streaming" \| "error"` | `"ready"` | drives icon + aria-label |
| `onStop` | `() => void` | — | called instead of submitting while generating; required for the stop affordance |
| standard button props | — | — | passthrough |

### `Button` props

| name | type | default | description |
| --- | --- | --- | --- |
| `variant` | `"ghost" \| "default"` | `"ghost"` | visual style |
| `pressed` | `boolean` | `undefined` | toggle state; renders `data-pressed=""` and an accent background |
| standard button props | — | — | passthrough; `type` defaults to `"button"` |

### `PromptInputMessage`

```ts
export interface PromptInputAttachment {
  id: string;
  filename: string;
  mediaType: string;
  size: number;
  /** Object URL — caller must not retain after submission resolves */
  url: string;
  file: File;
}

export interface PromptInputMessage {
  text: string;
  files: PromptInputAttachment[];
}
```

We deliberately do not depend on the `ai` package's `FileUIPart` / `ChatStatus` types — the library is provider-agnostic. Consumers wanting to map to those types can do so in their own `onSubmit`.

## Data flow

```
User types ──▶ <textarea> ──▶ context.setText
User attaches ─▶ <input type=file> change | drop | paste
                              │
                              ▼ Root validates accept/maxFiles/maxFileSize
                              ▼ context.attachments grows
User presses Enter ─▶ Textarea checks composing + shift + submit-disabled, then form.requestSubmit()
Form submit ─▶ Root handler: gather {text, files}, await onSubmit, on success reset text + attachments
ActionMenu item: Menu.Item onClick fires user handler; AddAttachments calls context.openFileDialog()
ModelSelect: Menu.Item onClick fires user onValueChange — value lives in consumer state
Submit: if generating + onStop, type=button + onClick calls onStop; else type=submit
```

**Attachment lifecycle:**
- Each attachment gets a `URL.createObjectURL(file)`, revoked on remove and on submit-success / unmount.
- Removing the last attachment via Backspace-on-empty mirrors AI Elements.

**Cross-part state lives in `PromptInputContext`:**
- `text`, `setText`
- `attachments` ([], `add(File[])`, `remove(id)`, `clear()`)
- `openFileDialog()` (triggers click on hidden input)
- `status` is consumer-managed and read by `Submit` only.

## Styling

New classes in `src/styles.css` under `@layer components`, all `pi-` prefixed so they don't collide with `cmdk-*`:

- `.pi-root` — rounded container, border, dark-mode aware, hover-able submit area
- `.pi-body` — flex column padding
- `.pi-textarea` — `field-sizing-content`, `min-h-16`, `max-h-48`, transparent bg, no resize
- `.pi-footer` — flex row, between, gap, border-top
- `.pi-tools` — flex row gap-1
- `.pi-btn`, `.pi-btn-ghost`, `.pi-btn-default`, `.pi-btn[data-pressed]`
- `.pi-submit`, `.pi-submit[data-status=streaming]`
- `.pi-menu-popup`, `.pi-menu-item`, `.pi-menu-item[data-highlighted]`
- `.pi-attachments`, `.pi-attachment-chip`, `.pi-attachment-remove`

The dropdown popup uses base-ui's `data-starting-style` / `data-ending-style` for open/close transitions, matching the CommandMenu popup convention.

## Error handling

| Failure | Behaviour |
| --- | --- |
| Any file rejected by `accept` | rejected files dropped from batch; `onError({ code: "accept" })` fires once with a count |
| Any file over `maxFileSize` | rejected files dropped from batch; `onError({ code: "max_file_size" })` fires once with a count |
| Over `maxFiles` | excess dropped, `onError({ code: "max_files" })` |
| `onSubmit` rejects | text + attachments are **kept** so the user can retry. The rejection is **not** surfaced to the consumer beyond their own promise — consumers should mirror `onSubmit` failure into `status="error"` themselves so the Submit button + screen readers reflect it |
| `onSubmit` resolves | text cleared, attachments cleared, hidden input reset |
| Submit clicked while `status` is generating without `onStop` | type=submit still — consumer's choice to disable. Root.handleSubmit also short-circuits when `status` is `submitted` or `streaming`, so Enter cannot fire a duplicate request |

## Accessibility

- `<form>` with `aria-label="Prompt input"` (override via `label` prop).
- Textarea has visible placeholder; consumers can wrap in `<label>` for stronger labelling.
- Submit button's `aria-label` flips between "Send message", "Submitting", "Stop generating", "Error".
- Toggle buttons set `aria-pressed` via the `pressed` prop.
- Menu items inherit Base UI Menu's roving-tabindex + roles.
- Attachment chips' remove buttons have `aria-label={"Remove " + filename}`.

## Testing strategy

`tests/prompt-input.test.tsx` — vitest + RTL:

1. `submit-on-enter`: typing + Enter calls `onSubmit({ text, files: [] })` and clears the textarea.
2. `shift-enter-newline`: Shift+Enter does not submit and inserts `\n`.
3. `attachments-add-remove`: clicking AddAttachments opens the file input; programmatically firing a change event adds a chip; clicking the chip's remove button removes it.
4. `status-icon`: rendering `<Submit status="streaming" onStop={fn} />` shows the stop icon and clicking it calls `onStop`, not `onSubmit`.
5. `pressed-toggle`: Button with `pressed` adds `aria-pressed="true"` and `data-pressed`.

(The base-ui Menu primitives don't need their own unit tests — they're upstream.)

## Prototype scope

New route `app/app/prompt/page.tsx`:

- Centered card with a `PromptInput` demoing every footer affordance.
- Web search toggle button (`GlobeIcon`).
- Action menu with two items: Add files (uses `AddAttachments`), Take screenshot (consumer-supplied handler that just `alert`s in the demo — actual screenshot capture is out of scope for v1).
- Model selector dropdown with 5 hard-coded models, check-icon on the selected one.
- Submit button with a fake status cycle: click → submitted (200 ms) → streaming (2 s) → ready, like the AI Elements demo.
- Attachments preview row above the textarea showing filename chips with remove buttons.
- The existing home page (`/`) gets a single new link to `/prompt` so reviewers can find it.

## Out of scope (v1)

- Tooltip wrapper on Button — consumers can wrap manually with Base UI `Tooltip` (we don't pull it into the lib's API).
- Tabs / hover cards / command sub-components from AI Elements — those are tied to specific layouts, easier to add later if needed.
- Image previews — chips show filename + size only. Could add `<img src={url}>` for `mediaType.startsWith("image/")` in v1 if cheap.
- Provider-style context (AI Elements' `PromptInputProvider`) — our state is form-local. We can add a provider later behind the same `useText`/`useAttachments` hooks if multi-form sharing is needed.
- `syncHiddenInput` for native form posts — uncommon, can revisit.
- Voice input / dictation, source citations (`PromptInputCitation`) — not in AI Elements either, future work.

## Acceptance criteria

1. `src/prompt-input/` directory exists; `src/prompt-input.tsx` re-exports the namespace; `src/index.ts` exposes `PromptInput` + types.
2. `pnpm type-check` clean; `pnpm build` produces `dist/` containing both APIs and a single CSS bundle.
3. `pnpm test` passes — existing 7 tests + 5+ new prompt-input tests.
4. `cd app && pnpm dev` serves `/prompt` showing every demoed feature; Enter submits, Shift+Enter newlines, attachments add/remove, model dropdown swaps label, status icon cycles.
5. The library remains icon-agnostic — `lucide-react` stays in `app/` only.
