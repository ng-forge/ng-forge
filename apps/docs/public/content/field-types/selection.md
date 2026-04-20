---
title: Selection
slug: field-types/selection
description: 'Select, radio, checkbox, and multi-select field types for ng-forge dynamic forms. Options configuration, value binding, and adapter-specific props.'
---

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
  placeholder: 'Select country',
}
```

**Core Properties:**

- `options`: Array of `{ value: T, label: string }` objects (at field level, not in props)

**Core Props:**

- `placeholder`: Placeholder text when no value selected

#### Adapter Props

<docs-adapter-props field="select"></docs-adapter-props>

#### Example

<docs-live-example scenario="examples/select" hideForCustom="true"></docs-live-example>

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

#### Adapter Props

<docs-adapter-props field="radio"></docs-adapter-props>

#### Example

<docs-live-example scenario="examples/radio" hideForCustom="true"></docs-live-example>

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

#### Adapter Props

<docs-adapter-props field="checkbox"></docs-adapter-props>

#### Example

<docs-live-example scenario="examples/checkbox" hideForCustom="true"></docs-live-example>

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

#### Adapter Props

<docs-adapter-props field="toggle"></docs-adapter-props>

#### Example

<docs-live-example scenario="examples/toggle" hideForCustom="true"></docs-live-example>

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

#### Adapter Props

<docs-adapter-props field="multi-checkbox"></docs-adapter-props>

#### Example

<docs-live-example scenario="examples/multi-checkbox" hideForCustom="true"></docs-live-example>
