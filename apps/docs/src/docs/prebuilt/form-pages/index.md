# Form Pages

Create multi-step forms by using page fields. When your form contains page fields, it automatically enters "paged mode" and renders with navigation controls.

## Basic Multi-Step Form

Create a multi-step form by adding multiple page fields to your form configuration:

```typescript
{
  fields: [
    {
      key: 'account',
      type: 'page',
      title: 'Account Information',
      fields: [
        { key: 'username', type: 'input', label: 'Username', value: '', required: true },
        { key: 'password', type: 'input', label: 'Password', value: '', props: { type: 'password' }, required: true },
      ],
    },
    {
      key: 'profile',
      type: 'page',
      title: 'Profile Details',
      fields: [
        { key: 'firstName', type: 'input', label: 'First Name', value: '' },
        { key: 'lastName', type: 'input', label: 'Last Name', value: '' },
      ],
    },
  ],
}
```

## Page Properties

Each page field supports:

- `key` (required) - Unique identifier for the page
- `type: 'page'` (required) - Field type identifier
- `fields` (required) - Array of child fields to render on this page
- `title` (optional) - Page heading displayed to users
- `description` (optional) - Additional context or instructions for the page

## Page with Description

```typescript
{
  key: 'preferences',
  type: 'page',
  title: 'Communication Preferences',
  description: 'Choose how you would like to receive updates from us.',
  fields: [
    { key: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter', value: false },
    { key: 'notifications', type: 'checkbox', label: 'Enable notifications', value: false },
  ],
}
```

## Paged Mode Behavior

When your form contains page fields:

- **Automatic Detection**: Form automatically enters "paged mode"
- **Navigation Controls**: Previous/Next buttons are rendered automatically
- **Validation**: Users must complete required fields before advancing to the next page
- **Single Page View**: Only one page is visible at a time

## Value Structure

Pages are container fields - they don't add nesting to your form values. Fields flatten to the root level:

```typescript
// Form config with pages
{
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'firstName', type: 'input', value: '' },
      ],
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'lastName', type: 'input', value: '' },
      ],
    },
  ],
}

// Resulting form value (flat structure)
{
  firstName: 'John',
  lastName: 'Doe',
  // Note: page keys are NOT in the value
}
```

## Nesting Restrictions

Page fields can only be used at the top level of your form configuration. They **cannot** be nested inside:

- Other page fields
- Row fields
- Group fields

Attempting to nest pages will result in a validation error.

## Allowed Children

Pages can contain:

- Leaf fields (input, select, checkbox, etc.)
- Row fields (for horizontal layouts)
- Group fields (for nested data structures)

## CSS Classes

Page fields use these classes for styling:

- `.df-page` - Applied to the page container
- `.df-page-visible` - Applied to the currently visible page
- `.df-page-hidden` - Applied to hidden pages
- `.df-page-field` - Applied to the page field component
