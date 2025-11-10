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

## Page with Description

```typescript
{
  key: 'preferences',
  type: 'page',
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

## Performance & Lazy Loading

ng-forge uses Angular's `@defer` blocks with smart prefetching to optimize page rendering while maintaining flicker-free navigation.

### How It Works

The page orchestrator uses a **2-tier loading strategy**:

**Tier 1: Current + Adjacent Pages (±1)**

- Render immediately using `@defer (on immediate)`
- Maximum 3 pages in DOM at once (current + 2 adjacent)
- Adjacent pages are fully rendered but hidden with `display: none`
- Ensures zero flicker when navigating forward/backward

**Tier 2: Distant Pages (2+ steps away)**

- Defer loading until browser is idle using `@defer (on idle)`
- True lazy loading for memory efficiency
- Load automatically during browser idle time

### Benefits

```typescript
// Example: User is on step 2 of 5
fields: [
  { key: 'step1', type: 'page', ... }, // ✓ Rendered (adjacent)
  { key: 'step2', type: 'page', ... }, // ✓ Visible (current)
  { key: 'step3', type: 'page', ... }, // ✓ Rendered (adjacent)
  { key: 'step4', type: 'page', ... }, // ⏳ Deferred (distant)
  { key: 'step5', type: 'page', ... }, // ⏳ Deferred (distant)
]
```

**Performance advantages:**

- ⚡ **Zero navigation flicker** - Adjacent pages already rendered
- 💾 **Memory efficient** - Only 3 pages max in DOM at once
- 🚀 **Faster initial load** - Distant pages defer until idle
- 📱 **Mobile-friendly** - Reduced memory footprint

This optimization happens automatically - no configuration needed.

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
