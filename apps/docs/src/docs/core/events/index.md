The event bus enables communication between the `<dynamic-form>` component and custom field components within it. Each form instance has its own isolated event bus.

## Overview

The event bus provides:

- Communication between field components within a single form
- Type-safe event subscriptions
- Reactive event handling with RxJS
- Wizard page navigation coordination
- Custom field component workflows

**Note**: The event bus is scoped to each `<dynamic-form>` instance - events don't cross form boundaries.

## Usage in Custom Field Components

When building custom field types, inject the event bus to communicate with the parent form or other fields:

```typescript
import { Component, inject } from '@angular/core';
import { EventBus } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-custom-submit-button',
  template: `<button (click)="submit()">Submit Form</button>`,
})
export class CustomSubmitButton {
  eventBus = inject(EventBus);

  submit() {
    // Dispatch submit event to the parent dynamic-forms
    this.eventBus.dispatch(SubmitEvent);
  }
}
```

## Built-in Events

### SubmitEvent

Fired when form is submitted.

```typescript
eventBus.on<SubmitEvent>('submit').subscribe(() => {
  // Handle form submission
  console.log('Form submitted');
});
```

### PageChangeEvent

Fired when navigating between wizard pages.

```typescript
eventBus.on<PageChangeEvent>('page-change').subscribe((event) => {
  console.log(`Page ${event.currentPageIndex + 1} of ${event.totalPages}`);
  console.log(`Previous page: ${event.previousPageIndex}`);
});
```

**Properties:**

- `currentPageIndex: number` - Current page (0-based)
- `totalPages: number` - Total number of pages
- `previousPageIndex?: number` - Previous page index

### NextPageEvent

Navigate to next page in wizard.

```typescript
eventBus.dispatch(NextPageEvent);
```

### PreviousPageEvent

Navigate to previous page in wizard.

```typescript
eventBus.dispatch(PreviousPageEvent);
```

### FormResetEvent

Reset form to default values.

```typescript
// Dispatch reset event
eventBus.dispatch(FormResetEvent);

// Listen for reset
eventBus.on<FormResetEvent>('form-reset').subscribe(() => {
  console.log('Form was reset to defaults');
});
```

### FormClearEvent

Clear all form values (empty state, not defaults).

```typescript
// Dispatch clear event
eventBus.dispatch(FormClearEvent);

// Listen for clear
eventBus.on<FormClearEvent>('form-clear').subscribe(() => {
  console.log('Form was cleared');
});
```

### AddArrayItemEvent

Add an item to an array field.

```typescript
// Add item using array's template
eventBus.dispatch(AddArrayItemEvent, 'contacts');

// Add item with custom field template
const fieldTemplate = { key: 'email', type: 'input', value: '' };
eventBus.dispatch(AddArrayItemEvent, 'contacts', fieldTemplate);

// Add item at specific index
eventBus.dispatch(AddArrayItemEvent, 'contacts', fieldTemplate, 2);
```

**Constructor parameters:**

- `arrayKey: string` - Key of the array field
- `field?: ArrayAllowedChildren` - Optional field template (uses array's template if omitted)
- `index?: number` - Optional index to insert at (defaults to end)

### RemoveArrayItemEvent

Remove an item from an array field.

```typescript
// Remove item at index 1
eventBus.dispatch(RemoveArrayItemEvent, 'contacts', 1);

// Remove last item
eventBus.dispatch(RemoveArrayItemEvent, 'contacts');
```

**Constructor parameters:**

- `arrayKey: string` - Key of the array field
- `index?: number` - Index to remove (defaults to last item)

## Multiple Event Subscriptions

Subscribe to multiple event types by passing an array of type strings:

```typescript
eventBus.on<SubmitEvent | PageChangeEvent | NextPageEvent>(['submit', 'page-change', 'next-page']).subscribe((event) => {
  switch (event.type) {
    case 'submit':
      handleSubmit();
      break;
    case 'page-change':
      handlePageChange(event);
      break;
    case 'next-page':
      handleNextPage();
      break;
  }
});
```

## Custom Events

Create custom events for your forms:

```typescript
import { FormEvent } from '@ng-forge/dynamic-forms';

// Simple event
export class SaveDraftEvent implements FormEvent {
  readonly type = 'save-draft' as const;
}

// Event with payload
export class ValidationErrorEvent implements FormEvent {
  readonly type = 'validation-error' as const;

  constructor(
    public readonly fieldKey: string,
    public readonly errorMessage: string,
  ) {}
}
```

Usage:

```typescript
// Dispatch simple event
eventBus.dispatch(SaveDraftEvent);

// Dispatch event with payload
eventBus.dispatch(ValidationErrorEvent, 'email', 'Invalid email format');

// Subscribe to custom event
eventBus.on<SaveDraftEvent>('save-draft').subscribe(() => {
  saveDraft();
});

eventBus.on<ValidationErrorEvent>('validation-error').subscribe((event) => {
  showError(event.fieldKey, event.errorMessage);
});
```

## Practical Examples

### Form Auto-save

```typescript
@Component({...})
export class AutoSaveFormComponent {
  eventBus = inject(EventBus);

  ngOnInit() {
    // Auto-save on page change
    this.eventBus.on<PageChangeEvent>('page-change').subscribe(() => {
      this.saveDraft();
    });
  }

  saveDraft() {
    // Save form data
  }
}
```

### Multi-step Form Navigation

```typescript
@Component({
  template: `
    <button (click)="previous()">Previous</button>
    <button (click)="next()">Next</button>
    <button (click)="submit()">Submit</button>
  `,
})
export class WizardNavigationComponent {
  eventBus = inject(EventBus);

  previous() {
    this.eventBus.dispatch(PreviousPageEvent);
  }

  next() {
    this.eventBus.dispatch(NextPageEvent);
  }

  submit() {
    this.eventBus.dispatch(SubmitEvent);
  }
}
```

### Progress Tracking

```typescript
@Component({...})
export class ProgressTrackerComponent {
  eventBus = inject(EventBus);
  progress = signal(0);

  ngOnInit() {
    this.eventBus.on<PageChangeEvent>('page-change').subscribe((event) => {
      const percentage = ((event.currentPageIndex + 1) / event.totalPages) * 100;
      this.progress.set(percentage);
    });
  }
}
```

### Form Reset and Clear

```typescript
@Component({...})
export class FormActionsComponent {
  eventBus = inject(EventBus);

  resetForm() {
    // Reset form to default values
    this.eventBus.dispatch(FormResetEvent);
  }

  clearForm() {
    // Clear all form values
    this.eventBus.dispatch(FormClearEvent);
  }
}
```

## Best Practices

**Use built-in events:**

- Leverage existing events for common scenarios
- Consistent behavior across forms

**Create custom events for domain logic:**

- Keep event names descriptive
- Include necessary payload data
- Use readonly properties

**Type safety:**

```typescript
// ✓ Type-safe event subscription
class UserUpdatedEvent implements FormEvent {
  readonly type = 'user-updated' as const;
  constructor(public readonly userId: string) {}
}

// ✓ Use generic parameter for type inference
eventBus.on<UserUpdatedEvent>('user-updated').subscribe((event) => {
  console.log(event.userId); // TypeScript knows event has userId
});

// ✗ Avoid subscriptions without generic type parameter
eventBus.on('some-random-event'); // No type checking on event properties
```

## Event Flow

1. Component dispatches event via `eventBus.dispatch()`
2. Event bus broadcasts to all subscribers
3. Subscribers receive event and execute handlers
4. Type filtering ensures only relevant handlers execute

## Integration with Forms

The event bus is automatically provided by the `DynamicForm` component to all child field components. You don't need to manually provide it:

```typescript
// The DynamicForm component internally provides EventBus
// All child field components can inject and use it
import { DynamicForm } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-my-form',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" />`,
})
export class MyFormComponent {
  // EventBus is available to all field components rendered by DynamicForm
}
```

Field components can inject and use the event bus:

```typescript
export class CustomFieldComponent extends BaseFieldComponent {
  eventBus = inject(EventBus);

  onSubmit() {
    // Trigger form submission from custom component
    this.eventBus.dispatch(SubmitEvent);
  }
}
```
