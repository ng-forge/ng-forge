A comprehensive multi-step registration form demonstrating the `page` field type for creating wizards and stepped workflows.

## Live Demo

{{ NgDocActions.demo("PaginatedFormDemoComponent", { container: false }) }}

## Overview

This example showcases a 4-step registration form with:

- **Page navigation** with Previous/Next/Submit buttons
- **Per-page validation** that prevents moving forward with invalid data
- **Progress tracking** through multiple steps
- **Flattened form values** - page fields don't nest their children
- **Mixed field types** across different steps

## Implementation

{% raw %}

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-paginated-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
  `,
})
export class PaginatedFormComponent {
  formValue = signal({});

  config = {
    fields: [
      // Step 1: Personal Information
      {
        key: 'step1',
        type: 'page',
        fields: [
          {
            key: 'step1Title',
            type: 'text',
            label: 'Personal Information',
            props: { elementType: 'h2' },
          },
          {
            key: 'step1Description',
            type: 'text',
            label: 'Please provide your basic information',
          },
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            value: '',
            required: true,
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            value: '',
            required: true,
          },
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Date of Birth',
            required: true,
          },
          {
            type: 'next',
            key: 'step1Next',
            label: 'Continue to Contact Info',
          },
        ],
      },

      // Step 2: Contact Information
      {
        key: 'step2',
        type: 'page',
        fields: [
          {
            key: 'step2Title',
            type: 'text',
            label: 'Contact Information',
            props: { elementType: 'h2' },
          },
          {
            key: 'step2Description',
            type: 'text',
            label: 'How can we reach you?',
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
            value: '',
            required: true,
            email: true,
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone Number',
            value: '',
            required: true,
          },
          {
            key: 'contactPreference',
            type: 'radio',
            label: 'Preferred Contact Method',
            value: 'email',
            options: [
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'both', label: 'Either' },
            ],
          },
          {
            type: 'row',
            key: 'step2Buttons',
            fields: [
              { type: 'previous', key: 'step2Previous', label: 'Back', col: 6 },
              { type: 'next', key: 'step2Next', label: 'Continue', col: 6 },
            ],
          },
        ],
      },

      // Step 3: Address
      {
        key: 'step3',
        type: 'page',
        fields: [
          {
            key: 'step3Title',
            type: 'text',
            label: 'Address',
            props: { elementType: 'h2' },
          },
          {
            key: 'step3Description',
            type: 'text',
            label: 'Where do you live?',
          },
          {
            key: 'street',
            type: 'input',
            label: 'Street Address',
            value: '',
            required: true,
          },
          {
            type: 'row',
            key: 'cityStateRow',
            fields: [
              { key: 'city', type: 'input', label: 'City', value: '', required: true, col: 6 },
              { key: 'state', type: 'select', label: 'State', required: true, options: [...], col: 6 },
            ],
          },
          {
            key: 'zipCode',
            type: 'input',
            label: 'ZIP Code',
            value: '',
            required: true,
            pattern: /^\d{5}$/,
          },
          {
            type: 'row',
            key: 'step3Buttons',
            fields: [
              { type: 'previous', key: 'step3Previous', label: 'Back', col: 6 },
              { type: 'next', key: 'step3Next', label: 'Continue', col: 6 },
            ],
          },
        ],
      },

      // Step 4: Preferences & Completion
      {
        key: 'step4',
        type: 'page',
        fields: [
          {
            key: 'step4Title',
            type: 'text',
            label: 'Preferences',
            props: { elementType: 'h2' },
          },
          {
            key: 'step4Description',
            type: 'text',
            label: 'Tell us about your preferences',
          },
          {
            key: 'interests',
            type: 'multi-checkbox',
            label: 'Interests',
            options: [
              { value: 'technology', label: 'Technology' },
              { value: 'sports', label: 'Sports' },
              // ... more options
            ],
          },
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Subscribe to newsletter',
            checked: true,
          },
          {
            key: 'terms',
            type: 'checkbox',
            label: 'I agree to the terms and conditions',
            required: true,
          },
          {
            type: 'row',
            key: 'step4Buttons',
            fields: [
              { type: 'previous', key: 'step4Previous', label: 'Back', col: 6 },
              { type: 'submit', key: 'submit', label: 'Complete Registration', col: 6 },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig;
}
```

{% endraw %}

## Form Value Structure

Note that page fields use `valueHandling: 'flatten'`, meaning their children are flattened to the parent level:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1990-01-01",
  "email": "john@example.com",
  "phone": "+1-555-0000",
  "contactPreference": "email",
  "street": "123 Main St",
  "city": "New York",
  "state": "ny",
  "zipCode": "10001",
  "interests": ["technology", "sports"],
  "newsletter": true,
  "terms": true
}
```

The page structure is **not reflected** in the form value - all fields are at the top level.

## Key Features

### Navigation Buttons

- **`type: 'next'`** - Validates current page and moves to next step
- **`type: 'previous'`** - Goes to previous step without validation
- **`type: 'submit'`** - Validates entire form and submits

### Per-Page Validation

Each page validates independently. Users cannot proceed to the next page until all required fields on the current page are valid.

### Page Configuration

```typescript
{
  key: 'step1',    // Required key
  type: 'page',    // Page field type
  fields: [        // Child fields
    // Add text fields for titles/descriptions if needed
    { key: 'title', type: 'text', label: 'Page Title', props: { elementType: 'h2' } },
    { key: 'desc', type: 'text', label: 'Page description...' },
    // ... other fields for this page
  ],
}
```

## Performance & Lazy Loading

ng-forge uses Angular's `@defer` blocks with smart preloading to optimize page rendering, balancing performance with flicker-free navigation.

### How It Works

- **All pages load immediately** - Using `@defer (on immediate)` to prevent navigation flicker
- **Only current page visible** - Non-visible pages are hidden with CSS `display: none`
- **Instant navigation** - Pages switch instantly since they're already loaded
- **Automatic optimization** - No configuration needed - ng-forge handles this automatically

### Benefits

```typescript
// With 4 pages, all load immediately but only current is visible
fields: [
  { key: 'step1', type: 'page', fields: [...] }, // ✓ Visible
  { key: 'step2', type: 'page', fields: [...] }, // ✓ Loaded, hidden
  { key: 'step3', type: 'page', fields: [...] }, // ✓ Loaded, hidden
  { key: 'step4', type: 'page', fields: [...] }, // ✓ Loaded, hidden
]
```

**Performance advantages:**

- ⚡ **Zero flicker navigation** - All pages preloaded for instant switching
- 🎯 **Optimized initial load** - `@defer (on immediate)` loads efficiently during idle time
- 🚀 **Better UX** - Smooth page transitions without loading states
- 📱 **Mobile-friendly** - Pages load during browser idle periods

### Technical Details

Under the hood, the page orchestrator uses:

```typescript
@defer (on immediate) {
  <page-field
    [field]="pageField"
    [isVisible]="i === state().currentPageIndex"
  />
}
```

This means:

- **All pages load immediately** using Angular's `on immediate` trigger
- **Visibility controlled via input** - Pages toggle with `isVisible` input and CSS
- **No DOM destruction** - Pages stay mounted, preventing navigation flicker
- **Declarative rendering** - Angular handles the component lifecycle

### Best Practices

For optimal performance with multi-step forms:

1. **Keep pages focused** - Limit each page to 5-10 fields for best UX
2. **Heavy computations** - Move expensive operations to deferred pages when possible
3. **Large datasets** - If a page loads large dropdown data, that fetch can happen during idle time
4. **Conditional pages** - Use `logic` to hide/show pages - they still benefit from deferred loading

```typescript
{
  key: 'advancedOptions',
  type: 'page',
  logic: [{
    type: 'hidden',
    condition: { /* only show for power users */ }
  }],
  fields: [/* expensive fields with large datasets */]
}
```

Even if a page is conditionally hidden, it still defers loading until needed, saving resources.

## Common Enhancements

### Dynamic Steps

Show/hide pages based on user choices:

```typescript
{
  key: 'businessInfo',
  type: 'page',
  title: 'Business Information',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business',
    },
  }],
  fields: [/* ... */],
}
```

### Progress Indicator

Add a custom progress component:

{% raw %}

```typescript
template: `
  <div class="progress-bar">
    Step {{ currentPage() + 1 }} of {{ totalPages }}
  </div>
  <dynamic-form [config]="config" [(value)]="formValue" />
`;
```

{% endraw %}

### Conditional Validation

Apply different validation rules per step:

```typescript
{
  key: 'taxId',
  type: 'input',
  label: 'Tax ID',
  value: '',
  validators: [{
    type: 'required',
    when: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
    errorMessage: 'Tax ID is required for business accounts',
  }],
}
```

## Use Cases

- **Multi-step registration** - Break long forms into digestible steps
- **Onboarding flows** - Guide users through setup processes
- **Checkout processes** - Separate shipping, payment, and review
- **Survey forms** - Organize questions into logical sections
- **Complex data entry** - Reduce cognitive load with progressive disclosure

## Related Examples

- [User Registration Form](../user-registration) - Single-page registration with validation
- [Contact Form](../contact-form) - Simple contact form
- [Login Form](../login-form) - Basic authentication

## Related Documentation

- [Page Field Type](../../ui-libs-integrations/material/page) - Page field documentation
- [Navigation Buttons](../../ui-libs-integrations/material/button#navigation-buttons) - Next, Previous, Submit buttons
- [Conditional Logic](../../core/conditional-logic) - Show/hide pages dynamically
- [Validation](../../core/validation) - Per-page and cross-page validation
