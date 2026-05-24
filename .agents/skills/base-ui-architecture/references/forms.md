# Forms

Base UI form components extend the native [constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api). They work standalone, with `<Form>` for whole-form coordination, or integrated with React Hook Form / TanStack Form.

The core parts: **`Form`** (whole-form container, error wiring), **`Field`** (per-control wrapper with label/control/description/error), **`Fieldset`** (group of fields with shared legend).

> The API surface below consolidates the handbook's *forms* tutorial with the component reference pages — for canonical Part/prop documentation see `../../base-ui-components/references/field.md`, `form.md`, and `fieldset.md`.

## Field — full API surface

### `Field.Root`

Groups all parts of a field. Renders a `<div>`.

| Prop | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `name` | `string` | — | Submitted form field name. Takes precedence over `name` on `<Field.Control>`. |
| `actionsRef` | `RefObject<Field.Root.Actions \| null>` | — | Imperative actions: `validate()`. |
| `dirty` | `boolean` | — | Externally controlled "changed" state. |
| `touched` | `boolean` | — | Externally controlled "touched" state. |
| `disabled` | `boolean` | `false` | Disables the wrapped control. Takes precedence over child `disabled`. |
| `invalid` | `boolean` | — | Externally controlled invalid state. |
| `validate` | `(value, formValues) => string \| string[] \| Promise<string \| string[] \| null> \| null` | — | Custom validation. Return error string(s), or `null` if valid. Async supported (but doesn't block submission in `onSubmit` mode). |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | `'onSubmit'` | Takes precedence over `<Form>`'s mode. |
| `validationDebounceTime` | `number` (ms) | `0` | Debounces `validate` callbacks. Use with `onChange` mode + async. |
| `className`, `style`, `render` | standard | — | See composition. |

`Field.Root` exposes data attributes on **every descendant part**: `data-disabled`, `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`.

`Field.Root.State`:

```ts
type FieldRootState = {
  disabled: boolean;
  touched: boolean;
  dirty: boolean;
  valid: boolean | null;
  filled: boolean;
  focused: boolean;
};
```

`Field.Root.Actions`:

```ts
type FieldRootActions = { validate: () => void };
```

### `Field.Label`

Renders a `<label>` element, auto-associated with the field control.

| Prop | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `nativeLabel` | `boolean` | `true` | Set `false` when rendering as a non-`<label>` element (e.g. `<div>`). Prevents `:hover` propagation to button-based controls (Select/Combobox triggers) and stops clicks from re-firing on the button. |
| `className`, `style`, `render` | standard | — | |

### `Field.Description`

Auto-wires `aria-describedby` to the control. Renders a `<p>`. No special props beyond standard `className`/`style`/`render`.

### `Field.Item`

Groups individual options in a checkbox group or radio group so each has its own label and description. Renders a `<div>`.

| Prop | Type | Default |
| :--- | :--- | :--- |
| `disabled` | `boolean` | `false` |
| `className`, `style`, `render` | standard | — |

### `Field.Control`

The form control to label and validate. Renders an `<input>`. **Can be omitted** — any Base UI input component (`Input`, `Checkbox`, `Select`, `Combobox`, `Switch`, `RadioGroup`, `NumberField`, `Slider`, `Autocomplete`, `OTPField`) integrates with `Field.Root` automatically.

| Prop | Type | Purpose |
| :--- | :--- | :--- |
| `defaultValue` | `string \| number \| string[]` | Uncontrolled value. |
| `onValueChange` | `(value: string, eventDetails: Field.Control.ChangeEventDetails) => void` | Controlled change handler. |
| `className`, `style`, `render` | standard | — |

`Field.Control.ChangeEventReason`: `'none'`.

### `Field.Error`

Renders a `<div>`. Use `match` to control when the error displays.

| Prop | Type | Purpose |
| :--- | :--- | :--- |
| `match` | `boolean \| 'valid' \| 'badInput' \| 'customError' \| 'patternMismatch' \| 'rangeOverflow' \| 'rangeUnderflow' \| 'stepMismatch' \| 'tooLong' \| 'tooShort' \| 'typeMismatch' \| 'valueMissing'` | Show the error only when the field's [`ValidityState`](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) matches. `true` shows always (use when external library controls visibility). Omit for default behaviour (show whenever invalid). |
| `className`, `style`, `render` | standard | — |

Error data attributes include the standard set plus `data-starting-style` / `data-ending-style` (animate the error message in/out).

`Field.Error.State` adds `transitionStatus: TransitionStatus` on top of the standard `FieldRootState` fields.

### `Field.Validity`

Renders nothing by itself; takes a `children` function to render based on validity:

```ts
<Field.Validity>
  {(state: Field.Validity.State) => /* … */}
</Field.Validity>
```

`Field.Validity.State`:

```ts
type FieldValidityState = {
  validity: {
    badInput: boolean; customError: boolean; patternMismatch: boolean;
    rangeOverflow: boolean; rangeUnderflow: boolean; stepMismatch: boolean;
    tooLong: boolean; tooShort: boolean; typeMismatch: boolean;
    valueMissing: boolean; valid: boolean | null;
  };
  transitionStatus: TransitionStatus;
  errors: string[];
  value: unknown;
  error: string;
  initialValue: unknown;
};
```

## Form — full API surface

`<Form>` renders a `<form>` element with consolidated error handling.

| Prop | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `errors` | `Record<string, string \| string[]>` | — | Server-side validation errors keyed by field `name`. Cleared per field when the field's value changes. |
| `actionsRef` | `RefObject<Form.Actions \| null>` | — | `validate(fieldName?)` — validates all fields, or a single field by name. |
| `onFormSubmit` | `(formValues: Form.Values, eventDetails: Form.SubmitEventDetails) => void` | — | Submission handler receiving form values as an object. `preventDefault()` is called on the native event automatically. |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | `'onSubmit'` | Field-level `validationMode` takes precedence. |
| `className`, `style`, `render` | standard | — | |

`Form.Values = Record<string, any>`.

`Form.SubmitEventDetails`:

```ts
type FormSubmitEventDetails = {
  reason: 'none';
  event: Event;
};
```

## Labelling cheatsheet

| Control | Label strategy |
| :--- | :--- |
| `Input`, `NumberField`, `OTPField`, `Autocomplete`, `Combobox` (external input), `Checkbox`, `Radio`, `Switch` | `<Field.Label>` (or native `<label>`); may wrap the control implicitly |
| `Combobox` (input inside popup) | `<Combobox.Label>` |
| `Select` | `<Select.Label>` |
| `Slider` | `<Slider.Label>`; multi-thumb sliders need `aria-label` per `<Slider.Thumb>` |
| Group of controls (range slider, checkbox/radio group) | `<Fieldset.Root render={<Slider.Root />}>` + `<Fieldset.Legend>` |
| Each option in a checkbox/radio group | wrap with `<Field.Item>`, each with its own `<Field.Label>` |
| No visible label | `aria-label` on the control |

Implicit labelling (Switch / Checkbox / Radio):

```tsx
<Field.Root>
  <Field.Label>
    <Switch.Root />
    Developer mode
  </Field.Label>
  <Field.Description>Enables extra tools for web developers</Field.Description>
</Field.Root>
```

## Building form fields

Pass `name` to `<Field.Root>` to include the value in form submission. Without `name`, the field is local-only.

## Submitting data

```tsx
// Native — receive a FormData
<Form onSubmit={async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  await fetch('/api', { method: 'POST', body: formData });
}} />

// Base UI — receive parsed values (preventDefault is automatic)
<Form onFormSubmit={async (formValues) => {
  await fetch('/api', { method: 'POST', body: JSON.stringify(formValues) });
}} />
```

## Constraint validation

Native HTML validation attributes are supported on `<Field.Control>` and most Base UI controls:

- `required`
- `minLength`, `maxLength`
- `pattern` (regex)
- `step` (numeric multiple)

```tsx
<Field.Root name="website">
  <Field.Control type="url" required pattern="https?://.*" />
  <Field.Error />
</Field.Root>
```

Base UI uses a hidden input to participate in native form submission and validation. To anchor the native validation bubble near the visible control, give the field a `name` and wrap controls in a relatively-positioned container:

```tsx
<Field.Root name="apple">
  <Select.Root>
    <Select.Label>Apple</Select.Label>
    <div className="relative">
      <Select.Trigger />
    </div>
  </Select.Root>
</Field.Root>
```

## Custom validation

Pass `validate` to `<Field.Root>`. Returns string(s) when invalid, `null` when valid. Sync or async.

```tsx
<Field.Root
  name="username"
  validationMode="onChange"
  validationDebounceTime={300}
  validate={async (value) => {
    if (value === 'admin') return 'Reserved for system use.';
    const result = await fetch(`/api/username-available?name=${value}`).then((r) => r.json());
    if (!result.available) return `${value} is unavailable.`;
    return null;
  }}
>
  <Field.Control required minLength={3} />
  <Field.Error />
</Field.Root>
```

## Server-side validation

Pass an `errors` object to `<Form>`. Keys = field `name`s; values = error string or string[]. Errors clear per field once that field's value changes.

```tsx
const [errors, setErrors] = React.useState();

<Form
  errors={errors}
  onSubmit={async (event) => {
    event.preventDefault();
    const response = await submitToServer(/* … */);
    setErrors(response.errors);
  }}
>
  <Field.Root name="promoCode" />
</Form>;
```

With React 19 server actions / `useActionState`:

```tsx
'use client';
const [state, formAction] = React.useActionState(login, {});

<Form action={formAction} errors={state.errors}>
  <Field.Root name="password">
    <Field.Control />
    <Field.Error />
  </Field.Root>
</Form>;

// actions.ts — 'use server'
export async function login(formData: FormData) {
  const result = authenticateUser(formData);
  if (!result.success) return { errors: { password: 'Invalid username or password' } };
  /* redirect on success */
}
```

## Displaying errors

`<Field.Error>` without `children` renders the native message when invalid. Scope a custom message with `match`:

```tsx
<Field.Error match="valueMissing">You must create a username</Field.Error>
<Field.Error match="patternMismatch">Use only letters, numbers, and dashes</Field.Error>
<Field.Error match="tooShort">Too short — at least 3 characters</Field.Error>
```

## Compact end-to-end example (Tailwind v4)

A working form with constraint validation, custom validation, error display, and submission.

```tsx
'use client';
import * as React from 'react';
import { Form } from '@base-ui/react/form';
import { Field } from '@base-ui/react/field';

export default function SignupForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  return (
    <Form
      aria-label="Create account"
      errors={errors}
      className="flex w-80 flex-col gap-4"
      onFormSubmit={async (values) => {
        const res = await fetch('/api/signup', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const body = await res.json();
          setErrors(body.errors ?? {});
          return;
        }
        setErrors({});
      }}
    >
      <Field.Root
        name="username"
        validationMode="onBlur"
        validate={(value) => {
          if (typeof value === 'string' && value.startsWith('admin')) {
            return 'Reserved prefix.';
          }
          return null;
        }}
        className="flex flex-col gap-1 data-invalid:[&_label]:text-red-700"
      >
        <Field.Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Username
        </Field.Label>
        <Field.Control
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_-]+"
          placeholder="e.g. alice132"
          className="h-9 rounded border border-neutral-300 px-3 text-sm outline-none focus-visible:border-neutral-900 data-invalid:border-red-500 dark:border-neutral-700 dark:focus-visible:border-white"
        />
        <Field.Description className="text-xs text-neutral-600 dark:text-neutral-400">
          3–20 chars; letters, numbers, dashes, underscores.
        </Field.Description>
        <Field.Error match="valueMissing" className="text-xs text-red-600">
          Username is required.
        </Field.Error>
        <Field.Error match="tooShort" className="text-xs text-red-600">
          At least 3 characters.
        </Field.Error>
        <Field.Error match="patternMismatch" className="text-xs text-red-600">
          Letters, numbers, dashes, underscores only.
        </Field.Error>
        <Field.Error className="text-xs text-red-600" />
      </Field.Root>

      <Field.Root name="email">
        <Field.Label className="text-sm font-medium">Email</Field.Label>
        <Field.Control type="email" required placeholder="you@example.com"
          className="h-9 rounded border border-neutral-300 px-3 text-sm outline-none focus-visible:border-neutral-900 data-invalid:border-red-500" />
        <Field.Error className="text-xs text-red-600" />
      </Field.Root>

      <button type="submit"
        className="h-9 rounded bg-neutral-900 px-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900">
        Create account
      </button>
    </Form>
  );
}
```

## React Hook Form integration

Use `<Controller>` to forward `name`, `field`, and `fieldState` into a `<Field.Root>`. Pass `invalid`, `touched`, `dirty` externally; wire `ref`, `value`, `onBlur`, `onChange` onto the control:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { Form } from '@base-ui/react/form';
import { Field } from '@base-ui/react/field';

const { control, handleSubmit } = useForm<{ username: string }>({
  defaultValues: { username: '' },
});

<Form onSubmit={handleSubmit(async (data) => { /* … */ })}>
  <Controller
    name="username"
    control={control}
    rules={{
      required: 'This is a required field',
      minLength: { value: 2, message: 'Too short' },
      validate: (value) => (/* custom */ null),
    }}
    render={({
      field: { name, ref, value, onBlur, onChange },
      fieldState: { invalid, isTouched, isDirty, error },
    }) => (
      <Field.Root name={name} invalid={invalid} touched={isTouched} dirty={isDirty}>
        <Field.Label>Username</Field.Label>
        <Field.Control
          ref={ref}
          value={value}
          onBlur={onBlur}
          onValueChange={onChange}
          placeholder="e.g. alice132"
        />
        <Field.Error match={!!error}>{error?.message}</Field.Error>
      </Field.Root>
    )}
  />
</Form>;
```

Notes:

- For RHF to **focus invalid fields**, the `ref` must reach the underlying Base UI input. Use `inputRef` where available (Select, Combobox) or pass `ref` directly to `<Field.Control>` / `<NumberField.Input>` / `<Combobox.Input>` / `<Autocomplete.Input>`.
- Use `match={!!error}` to delegate error visibility to RHF.
- Wrap submit with `handleSubmit`: `<Form onSubmit={handleSubmit(submitForm)} />`.

## TanStack Form integration

Use `<form.Field>` with the `children` render prop. Forward `field.name`, `field.state.value`, `field.handleChange`, `field.handleBlur`, and `field.state.meta` into `<Field.Root>`:

```tsx
import { useForm, revalidateLogic } from '@tanstack/react-form';
import { Field } from '@base-ui/react/field';

const form = useForm<FormValues>({
  defaultValues: { username: '', email: '' },
  validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
  validators: {
    onDynamic: ({ value }) => {
      const errors: Record<string, string> = {};
      if (!value.username) errors.username = 'Username is required.';
      else if (value.username.length < 3) errors.username = 'At least 3 characters.';
      return { form: errors, fields: errors };
    },
  },
  onSubmit: async ({ value }) => {
    await fetch('/api', { method: 'POST', body: JSON.stringify(value) });
  },
});

<form
  onSubmit={(event) => {
    event.preventDefault();
    form.handleSubmit();
  }}
>
  <form.Field
    name="username"
    validators={{
      onChangeAsync: async ({ value }) => {
        const ok = await checkAvailable(value);
        return ok ? undefined : `${value} is not available.`;
      },
    }}
    children={(field) => (
      <Field.Root
        name={field.name}
        invalid={!field.state.meta.isValid}
        dirty={field.state.meta.isDirty}
        touched={field.state.meta.isTouched}
      >
        <Field.Label>Username</Field.Label>
        <Field.Control
          value={field.state.value}
          onValueChange={field.handleChange}
          onBlur={field.handleBlur}
          placeholder="e.g. bob276"
        />
        <Field.Error match={!field.state.meta.isValid}>
          {field.state.meta.errors.join(',')}
        </Field.Error>
      </Field.Root>
    )}
  />
  <button type="submit">Submit</button>
</form>;
```

Notes:

- TanStack Form mode is configured at the form level via `revalidateLogic` + `validators.onDynamic`. Per-field validators go on `<form.Field validators={{ onChangeAsync: … }} />`.
- The Base UI `<Form>` component is **not** required when using TanStack Form — render a native `<form>` and call `form.handleSubmit()` from `onSubmit`.

## Gotchas

- `Field.Control` is optional — any Base UI input inside `<Field.Root>` auto-integrates.
- Anchor the validation bubble: wrap non-`<input>` controls (Select, Combobox triggers) in a `position: relative` container.
- Use `nativeLabel={false}` when rendering `<Field.Label>` as a non-`<label>` element to avoid label-on-button double-firing.
- `validate` async in `onSubmit` mode does **not** block submission — use `onChange` or `onBlur` for blocking behaviour.
- `errors` clears per field on change — server errors disappear once that field is edited.
- RHF focus requires real refs forwarded all the way to the input (use `inputRef` on Select/Combobox).
- `<Field.Error match>`: `true` = always show (external library control); a `ValidityState` key = only that exact failure; omitted = show whenever invalid.
