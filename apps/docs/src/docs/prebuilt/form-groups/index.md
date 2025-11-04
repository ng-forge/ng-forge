# Form Groups

Group related fields with visual containers and labels.

## Basic Group

```typescript
{
  type: 'group',
  label: 'Personal Information',
  fields: [
    { key: 'firstName', type: 'input', label: 'First Name' },
    { key: 'lastName', type: 'input', label: 'Last Name' },
    { key: 'email', type: 'input', label: 'Email' },
  ],
}
```

## Collapsible Groups

```typescript
{
  type: 'group',
  label: 'Optional Information',
  collapsible: true,
  collapsed: true,
  fields: [
    { key: 'phone', type: 'input', label: 'Phone' },
    { key: 'address', type: 'textarea', label: 'Address' },
  ],
}
```

_Documentation in progress_
