[← Back to Quick Start](/examples)

A comprehensive multi-step registration form demonstrating the `page` field type for creating wizards and stepped workflows.

## Live Demo

<iframe src="http://localhost:4201/#/examples/paginated-form" class="example-frame" title="Paginated Form Demo"></iframe>

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
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';
import '@ng-forge/dynamic-forms-material';

@Component({
  selector: 'app-paginated-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <form [dynamic-form]="config" [(value)]="formValue"></form>
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
              { type: 'previous', key: 'step2Previous', label: 'Back' },
              { type: 'next', key: 'step2Next', label: 'Continue' },
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
              { type: 'previous', key: 'step3Previous', label: 'Back' },
              { type: 'next', key: 'step3Next', label: 'Continue' },
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
            value: true,
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
              { type: 'previous', key: 'step4Previous', label: 'Back' },
              { type: 'submit', key: 'submit', label: 'Complete Registration' },
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

Dynamic Forms uses Angular's `@defer` blocks with **smart prefetching** to achieve true lazy loading while maintaining flicker-free navigation.

### How It Works

- **Current page loads immediately** - The active page renders instantly
- **Adjacent pages (±1) prefetch** - Next/previous pages load in background for instant navigation
- **Distant pages defer until idle** - Pages 2+ steps away load when browser is idle
- **Automatic optimization** - No configuration needed - Dynamic Forms handles this automatically

### Benefits

```typescript
// Example: Currently on step 2 of 5
fields: [
  { key: 'step1', type: 'page', fields: [...] }, // ✓ Prefetched (adjacent)
  { key: 'step2', type: 'page', fields: [...] }, // ✓ Visible (current)
  { key: 'step3', type: 'page', fields: [...] }, // ✓ Prefetched (adjacent)
  { key: 'step4', type: 'page', fields: [...] }, // ⏳ Deferred (distant)
  { key: 'step5', type: 'page', fields: [...] }, // ⏳ Deferred (distant)
]
```

**Performance advantages:**

- ⚡ **Zero flicker navigation** - Adjacent pages prefetched for instant next/previous
- 🚀 **Faster initial load** - Only 3 pages load immediately, distant pages defer until idle
- ⏱️ **Better Time to Interactive (TTI)** - Reduced initial JavaScript parsing/compilation
- 📱 **Mobile-friendly** - Lower startup cost on slower devices
- 🎯 **Optimized user experience** - Smooth page transitions without loading states

### Technical Details

Under the hood, the page orchestrator uses a **2-tier loading strategy**:

```typescript
@if (i === currentPageIndex || i === currentPageIndex + 1 || i === currentPageIndex - 1) {
  <!-- Current and adjacent pages: render immediately (but hide adjacent) -->
  @defer (on immediate) {
    <page-field [isVisible]="i === currentPageIndex" />
  }
} @else {
  <!-- Distant pages: defer until idle -->
  @defer (on idle) {
    <page-field [isVisible]="false" />
  }
}
```

This means:

- **Current + adjacent pages render immediately** - Using `@defer (on immediate)` to render during browser idle
- **Visibility controlled via input and CSS** - Adjacent pages are fully rendered but hidden with `display: none`
- **Initial load optimization** - Only 3 pages render initially, distant pages defer until idle
- **Zero flicker navigation** - Next/previous pages already rendered, just toggle visibility
- **Once loaded, pages persist** - Pages remain in DOM (hidden with CSS) after initial load

The primary benefit is **optimizing initial load performance**, not ongoing memory usage.

### Best Practices

For optimal performance with multi-step forms:

1. **Keep pages focused** - Limit each page to 5-10 fields for best UX
2. **Put heavy pages later** - Place pages with expensive operations or large datasets later in the flow so they defer until idle
3. **Front-load critical data** - Place important fields in early pages (they prefetch immediately)
4. **Leverage the 3-page window** - Only current + adjacent pages load immediately, so structure your flow accordingly

**Example optimization:**

```typescript
fields: [
  {
    key: 'basicInfo',
    type: 'page',
    fields: [
      /* lightweight fields */
    ],
  },
  {
    key: 'contact',
    type: 'page',
    fields: [
      /* lightweight fields */
    ],
  },
  {
    key: 'address',
    type: 'page',
    fields: [
      /* lightweight fields */
    ],
  },
  // These won't load until user reaches page 2-4 (when idle)
  {
    key: 'preferences',
    type: 'page',
    fields: [
      /* heavy multi-checkbox with 100 options */
    ],
  },
  {
    key: 'advanced',
    type: 'page',
    fields: [
      /* complex conditional logic */
    ],
  },
];
```

With this structure:

- **Pages 1-2** load immediately (current + adjacent)
- **Page 3** prefetches when you reach page 2
- **Pages 4-5** defer until browser is idle, saving initial load time

## Common Enhancements

### Dynamic Steps

Show/hide pages based on user choices:

```typescript
{
  key: 'businessInfo',
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
  <form [dynamic-form]="config" [(value)]="formValue" />
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

- [Conditional Logic](../../dynamic-behavior/conditional-logic/overview) - Show/hide pages dynamically
- [Validation](../../validation/basics) - Per-page and cross-page validation
- [Material Integration](../../ui-libs-integrations/material/) - Material Design styling
