# Form Pages

Multi-step forms and wizards.

## Wizard

```typescript
{
  type: 'wizard',
  pages: [
    {
      label: 'Account',
      fields: [
        { key: 'username', type: 'input', label: 'Username' },
        { key: 'password', type: 'input', label: 'Password', props: { type: 'password' } },
      ],
    },
    {
      label: 'Profile',
      fields: [
        { key: 'firstName', type: 'input', label: 'First Name' },
        { key: 'lastName', type: 'input', label: 'Last Name' },
      ],
    },
  ],
}
```

_Documentation in progress_
