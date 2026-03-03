Fields for selecting one or multiple values from a set of options.

## select

Single or multi-select dropdown.

```typescript
{
  key: 'country',
  type: 'select',
  value: '',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ],
  props: {
    placeholder: 'Select country',
  }
}
```

**Core Properties:**

- `options`: Array of `{ value: T, label: string }` objects (at field level, not in props)

**Core Props:**

- `placeholder`: Placeholder text when no value selected

<docs-live-example scenario="examples/select"></docs-live-example>

## radio

Single selection from multiple options.

```typescript
{
  key: 'plan',
  type: 'radio',
  value: '',
  label: 'Subscription Plan',
  required: true,
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $10/month' },
    { value: 'enterprise', label: 'Enterprise - $50/month' },
  ],
}
```

**Core Properties:**

- `options`: Array of `{ value: string, label: string }` objects (at field level, not in props)

<docs-live-example scenario="examples/radio"></docs-live-example>

## checkbox

Boolean toggle control.

```typescript
{
  key: 'newsletter',
  type: 'checkbox',
  value: false,
  label: 'Subscribe to newsletter',
}
```

<docs-live-example scenario="examples/checkbox"></docs-live-example>

## toggle

Boolean switch control. Similar to checkbox but with a switch UI.

```typescript
{
  key: 'darkMode',
  type: 'toggle',
  label: 'Enable Dark Mode',
  value: false,
}
```

<docs-live-example scenario="examples/toggle"></docs-live-example>

## multi-checkbox

Multiple selection from a list of checkboxes. Value is an array of selected values.

```typescript
{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Interests',
  value: [],
  options: [
    { value: 'tech', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
  ],
}
```

**Core Properties:**

- `options`: Array of `{ value: T, label: string }` objects (at field level, not in props)

<docs-live-example scenario="examples/multi-checkbox"></docs-live-example>
