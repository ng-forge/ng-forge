---
title: Form Pages
slug: prebuilt/form-pages
description: 'Build multi-step wizard forms with page fields. Automatically enables paged mode with navigation controls and per-page validation.'
---

Create multi-step forms by using page fields. When your form contains page fields, it automatically enters "paged mode" and shows one page at a time. Navigation is added as `next` and `previous` button fields inside each page.

## Basic Multi-Step Form

Create a multi-step form by adding multiple page fields to your form configuration:

```typescript
{
  fields: [
    {
      key: 'account',
      type: 'page',
      fields: [
        { key: 'accountTitle', type: 'text', label: 'Account Information', props: { elementType: 'h3' } },
        { key: 'username', type: 'input', label: 'Username', value: '', required: true },
        { key: 'password', type: 'input', label: 'Password', value: '', props: { type: 'password' }, required: true },
        { key: 'accountNext', type: 'next', label: 'Continue' },
      ],
    },
    {
      key: 'profile',
      type: 'page',
      fields: [
        { key: 'profileTitle', type: 'text', label: 'Profile Details', props: { elementType: 'h3' } },
        { key: 'firstName', type: 'input', label: 'First Name', value: '' },
        { key: 'lastName', type: 'input', label: 'Last Name', value: '' },
        { key: 'profilePrevious', type: 'previous', label: 'Back' },
        { key: 'submit', type: 'submit', label: 'Create Account' },
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

## Example: Preferences Page

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
- **Navigation Controls**: Add `next` and `previous` button fields inside each page to move between pages
- **Validation**: Users must complete required fields before advancing to the next page
- **Single Page View**: Only one page is visible at a time
- **Programmatic Jumps**: Dispatch [`GoToPageEvent`](/recipes/events) to move to a page by index, for step lists or deep links
- **Deep Links & Resume**: Set `options.initialPage` to open the form on a specific page (see below)

## Deep Links and Session Resume

To open a paged form somewhere other than page 0, set `options.initialPage`. The orchestrator applies it as it initializes, so it works even when the config arrives asynchronously from a backend.

```typescript
const config: FormConfig = {
  options: { initialPage: 2 },
  fields: [/* pages */],
};
```

The shorthand lands on the page unconditionally, which is what restoring a saved session usually wants: a user who stopped on page 4 comes back to page 4, even if page 2 is still incomplete. The next and submit buttons stay gated as normal, so nothing invalid can be submitted.

Pass an object to opt into validation instead:

```typescript
const config: FormConfig = {
  options: { initialPage: { index: 2, validate: true } },
  fields: [/* pages */],
};
```

That applies the same gate a forward `GoToPageEvent` uses, stopping on the first invalid page.

**Edge cases** are handled for you: an out-of-range index clamps to the last page, negative and non-numeric values fall back to page 0, and a hidden target resolves to the nearest visible page.

### Restoring from a query parameter

A typical resume flow fetches the saved session, then feeds the page into the config:

```typescript
export class ResumeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly config = computed(() => ({
    ...this.savedConfig(),
    options: { initialPage: Number(this.params().get('page')) },
  }));
}
```

For navigation _after_ load, such as a step list or reacting to a URL change, dispatch `GoToPageEvent` instead. Add `{ validate: false }` when you want it to land exactly rather than stop at the first incomplete page.

## Performance & Lazy Loading

ng-forge renders the current and adjacent pages immediately and defers distant pages until the browser is idle, keeping navigation flicker free.

### How It Works

The page orchestrator uses a **2-tier loading strategy**:

**Tier 1: Current + Adjacent Pages (±1)**

- Render immediately using `@defer (on immediate)`
- Only the current page and its immediate neighbors render immediately (2 pages on load, up to 3 mid-form)
- Adjacent pages are fully rendered but hidden with `display: none`
- Ensures zero flicker when navigating forward/backward

**Tier 2: Distant Pages (2+ steps away)**

- Defer loading until browser is idle using `@defer (on idle)`
- Lazy loading optimizes initial page load
- Load automatically during browser idle time
- Once loaded, pages remain in DOM (hidden with CSS)

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

- **No navigation flicker**: adjacent pages are already rendered
- **Less initial rendering work**: distant pages defer until the browser is idle

**Note:** Once loaded, pages remain in the DOM (hidden with CSS). The primary benefit is optimizing **initial load performance**, not ongoing memory usage.

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
- Array fields (for repeating sections)
- Container fields (for wrapper chains)

## Conditional Visibility

Pages support the `logic` property to conditionally skip a page (hide it from the page navigation and progression) based on form state.

```typescript
{
  key: 'businessDetails',
  type: 'page',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business',
    },
  }],
  fields: [
    { key: 'companyName', type: 'input', label: 'Company Name', value: '' },
    { key: 'taxId', type: 'input', label: 'Tax ID', value: '' },
  ],
}
```

When a page is hidden, it is excluded from the multi-step navigation; users skip directly past it. Only `'hidden'` is supported as a logic type on containers.

For all available condition types and operators, see [Conditional Logic](/dynamic-behavior/conditional-logic).

## CSS Classes

Page fields use these classes for styling:

- `.df-page-orchestrator` - Applied to the host element that wraps all pages
- `.df-page-field` - Applied to each page field component
- `.df-page-visible` - Applied to the currently visible page
- `.df-page-hidden` - Applied to hidden pages

## Next Steps

- **[Form Arrays](/prebuilt/form-arrays/simplified)**: Create repeating sections with add/remove controls
- **[Dynamic Behavior](/dynamic-behavior/conditional-logic)**: Conditional logic, value derivation, and form submission
- **[Form Rows](/prebuilt/form-rows)**: Arrange fields side-by-side within pages
