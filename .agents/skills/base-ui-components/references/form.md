# Form

Import: `import { Form } from '@base-ui/react/form'`

## When to use
- Wrap `<Field.Root>` controls to consolidate per-field validation and server-side error mapping.
- Submit via native `onSubmit`, React 19 `action` (`useActionState`), or `onFormSubmit` for a JS-object payload.
- Set form-wide `validationMode` while letting individual fields override it.

## Anatomy
- `Form` — renders a native `<form>` element. Compose with `Field.Root` / `Field.Label` / `Field.Control` / `Field.Error`.

## Parts API

### Form
Renders a `<form>` element.
**Props:**
- `errors` — `Errors` — externally provided errors, e.g. after server submission or schema validation. Source declares it as the alias `Errors`; in practice it's `Record<string, string | string[] | undefined>` keyed by each `Field.Root` `name`.
- `actionsRef` — `React.RefObject<Form.Actions | null>` — `{ validate(fieldName?: string): void }` imperative handle (validate all fields, or one by name).
- `onFormSubmit` — `(formValues: Record<string, any>, eventDetails: Form.SubmitEventDetails) => void` — receives the form values as a plain object; `preventDefault()` is called on the native submit event automatically.
- `validationMode` — `Form.ValidationMode` (`'onSubmit'`) — `'onSubmit' | 'onBlur' | 'onChange'`; `Field.Root.validationMode` takes precedence over this.
- `className` — `string | ((state: Form.State) => string | undefined)`.
- `style` — `React.CSSProperties | ((state: Form.State) => React.CSSProperties | undefined)`.
- `render` — `ReactElement | ((props: HTMLProps, state: Form.State) => ReactElement)`.
- Native `<form>` props (`onSubmit`, `action`, `method`, etc.) are accepted.

**`actionsRef` usage:**
```tsx
actionsRef.current.validate();        // all fields
actionsRef.current.validate('email'); // one field
```

**State:** `{}` (empty).
**Types:** `Form.Actions = { validate: (fieldName?: string) => void }`. `Form.SubmitEventDetails = { reason: 'none'; event: Event }`. `Form.SubmitEventReason = 'none'`. `Form.ValidationMode = 'onSubmit' | 'onBlur' | 'onChange'`. `Form.Values = Record<string, any>`.

## Keyboard
| Key | Action |
| --- | --- |
| Enter | Submits the form when focus is inside a single-line input (native behavior). |
| Tab / Shift+Tab | Move focus between contained controls. |

## State
- **Submission**: pick one of three styles — native `onSubmit`, React 19 `action={formAction}` from `useActionState`, or `onFormSubmit` for typed object payloads.
- **Errors**: pass `errors` as `{ [fieldName]: string | string[] }` keyed by each `<Field.Root name="...">`. Errors are merged with per-field validity.
- **Validation timing**: `validationMode` on `<Form>` is the default; any `<Field.Root validationMode>` overrides it for that field.
- Use `actionsRef.current.validate(fieldName?)` to run validation imperatively without submitting.

## Canonical example
```tsx
'use client';
import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Button } from '@base-ui/react/button';

export default function ExampleForm() {
  const [errors, setErrors] = React.useState<Form.Props['errors']>({});
  const [loading, setLoading] = React.useState(false);

  return (
    <Form
      className="flex w-full max-w-64 flex-col gap-4"
      errors={errors}
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const url = formData.get('url') as string;
        setLoading(true);
        const res = await submitForm(url);
        setErrors({ url: res.error });
        setLoading(false);
      }}
    >
      <Field.Root name="url" className="flex flex-col items-start gap-1">
        <Field.Label className="text-sm font-bold text-neutral-950 dark:text-white">
          Homepage
        </Field.Label>
        <Field.Control
          type="url"
          required
          defaultValue="https://example.com"
          placeholder="https://example.com"
          pattern="https?://.*"
          className="h-8 w-full border border-neutral-950 bg-white px-2 text-sm text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400 dark:focus:outline-white"
        />
        <Field.Error className="text-sm text-red-700 dark:text-red-400" />
      </Field.Root>
      <Button
        type="submit"
        disabled={loading}
        focusableWhenDisabled
        className="flex h-8 items-center justify-center border border-neutral-950 bg-white px-3 text-sm text-neutral-950 hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 data-disabled:border-neutral-500 data-disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white"
      >
        Submit
      </Button>
    </Form>
  );
}

async function submitForm(value: string): Promise<{ error?: string }> {
  await new Promise((r) => setTimeout(r, 600));
  try {
    const u = new URL(value);
    if (u.hostname.endsWith('example.com')) return { error: 'example domain not allowed' };
  } catch {
    return { error: 'invalid URL' };
  }
  return {};
}
```

## Gotchas
- `errors` keys must match each `<Field.Root name="...">` exactly — there is no field-id resolution.
- Using `onFormSubmit` always calls `preventDefault()` on the underlying submit event; do not combine it with a native `action="/path"` if you expect a browser navigation.
- With `useActionState`, pass the returned `formAction` to the `action` prop and merge server-returned errors into `errors`. The action is awaited; show a loading state via the third tuple item.
- Field-level `validationMode` always wins over Form-level. To force a single behavior, omit it on every field.
- Async `validate` functions cannot block submission under `validationMode="onSubmit"`. For async checks, return errors from the server through `errors` instead.
- Pair with Zod (or any schema) by calling `schema.safeParse(formValues)` inside `onFormSubmit` and mapping `z.flattenError(result.error).fieldErrors` to `errors`.
- `Form.State` is currently `{}` — render-prop callbacks receive an empty state object.
