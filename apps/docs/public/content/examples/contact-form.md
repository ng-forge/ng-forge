---
description: 'Create a contact form with text inputs, textarea, date picker, and real-time validation feedback using ng-forge dynamic forms.'
---

Simple contact form demonstrating basic form fields, validation, and user input.

## Live Demo

<docs-live-example scenario="examples/contact"></docs-live-example>

## Overview

This example shows a basic contact form with:

- Text inputs (name, email, phone)
- Textarea for messages
- Date selection
- Basic validation (required, email format)
- Real-time validation feedback

## Implementation

```typescript
import { Component } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-contact-form',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
})
export class ContactFormComponent {
  config = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        value: '',
        required: true,
        placeholder: 'Your first name',
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        value: '',
        required: true,
        placeholder: 'Your last name',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: '',
        required: true,
        email: true,
        placeholder: 'email@example.com',
        props: {
          type: 'email',
        },
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone',
        value: '',
        placeholder: '+1 (555) 000-0000',
        props: {
          type: 'tel',
        },
      },
      {
        key: 'subject',
        type: 'select',
        label: 'Subject',
        value: '',
        required: true,
        options: [
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Technical Support' },
          { value: 'sales', label: 'Sales Question' },
          { value: 'feedback', label: 'Feedback' },
        ],
        placeholder: 'Select a subject',
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        value: '',
        required: true,
        minLength: 10,
        maxLength: 500,
        validationMessages: {
          required: 'Please enter your message',
          minLength: 'Message must be at least 10 characters',
          maxLength: 'Message cannot exceed 500 characters',
        },
        placeholder: 'Tell us how we can help...',
        props: {
          rows: 5,
        },
      },
      {
        key: 'subscribe',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        value: false,
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Send Message',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig;
}
```

## Key Features

### Field Validation

All critical fields have validation:

```typescript
{
  key: 'email',
  required: true,
  email: true,  // Built-in email validator
}

{
  key: 'message',
  required: true,
  minLength: 10,
  maxLength: 500,
}
```

### User-Friendly Placeholders

Every field includes helpful placeholder text:

```typescript
placeholder: 'email@example.com',  // Shows expected format,
```

### Subject Categorization

Dropdown allows users to categorize their inquiry:

```typescript
{
  key: 'subject',
  type: 'select',
  options: [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    // ...
  ],
}
```

## Use Cases

- Customer support forms
- Lead generation
- General inquiries
- Feedback collection
- Event registration
- Newsletter signup

## Related Examples

- **[User Registration](/examples/user-registration)** - Multi-step form with conditional fields
- **[Login Form](/examples/login-form)** - Simple authentication

## Related Documentation

- **[Validation](/validation/basics)** - Form validation guide
- **[Material Integration](/configuration)** - Material Design styling
