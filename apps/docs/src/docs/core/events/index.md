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
import { EventBus } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-custom-submit-button',
  template: `<button (click)="submit()">Submit Form</button>`,
})
export class CustomSubmitButton {
  eventBus = inject(EventBus);

  submit() {
    // Dispatch submit event to the parent dynamic-form
    this.eventBus.dispatch(SubmitEvent);
  }
}
```

## Built-in Events

### SubmitEvent

Fired when form is submitted.

```typescript
eventBus.on(SubmitEvent).subscribe(() => {
  // Handle form submission
  console.log('Form submitted');
});
```

### PageChangeEvent

Fired when navigating between wizard pages.

```typescript
eventBus.on(PageChangeEvent).subscribe((event) => {
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

## Multiple Event Subscriptions

Subscribe to multiple event types:

```typescript
eventBus.on([SubmitEvent, PageChangeEvent, NextPageEvent]).subscribe((event) => {
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
import { FormEvent } from '@ng-forge/dynamic-form';

// Simple event
export class SaveDraftEvent implements FormEvent {
  readonly type = 'save-draft' as const;
}

// Event with payload
export class ValidationErrorEvent implements FormEvent {
  readonly type = 'validation-error' as const;

  constructor(public readonly fieldKey: string, public readonly errorMessage: string) {}
}
```

Usage:

```typescript
// Dispatch simple event
eventBus.dispatch(SaveDraftEvent);

// Dispatch event with payload
eventBus.dispatch(ValidationErrorEvent, 'email', 'Invalid email format');

// Subscribe to custom event
eventBus.on(SaveDraftEvent).subscribe(() => {
  saveDraft();
});

eventBus.on(ValidationErrorEvent).subscribe((event) => {
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
    this.eventBus.on(PageChangeEvent).subscribe(() => {
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
    this.eventBus.on(PageChangeEvent).subscribe((event) => {
      const percentage = ((event.currentPageIndex + 1) / event.totalPages) * 100;
      this.progress.set(percentage);
    });
  }
}
```

### Conditional Field Updates

```typescript
@Component({...})
export class DynamicFieldsComponent {
  eventBus = inject(EventBus);

  ngOnInit() {
    // Listen for custom field change events
    this.eventBus.on(FieldChangeEvent).subscribe((event) => {
      if (event.fieldKey === 'accountType') {
        this.updateVisibleFields(event.value);
      }
    });
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

**Clean up subscriptions:**

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.eventBus
    .subscribe('submit')
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      // Handle event
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

**Type safety:**

```typescript
// ✓ Type-safe event
class UserUpdatedEvent implements FormEvent {
  readonly type = 'user-updated' as const;
  constructor(public readonly userId: string) {}
}

// ✗ Avoid string types
eventBus.on('some-random-event'); // No type checking
```

## Event Flow

1. Component dispatches event via `eventBus.dispatch()`
2. Event bus broadcasts to all subscribers
3. Subscribers receive event and execute handlers
4. Type filtering ensures only relevant handlers execute

## Integration with Forms

Event bus is automatically provided to all form components:

```typescript
@Component({
  providers: [EventBus], // Automatically provided by DynamicForm
})
export class DynamicFormComponent {
  // Event bus available to all child field components
}
```

Field components can inject and use the event bus:

```typescript
export class CustomFieldComponent extends BaseFieldComponent {
  eventBus = inject(EventBus);

  onValueChange(value: any) {
    this.eventBus.dispatch(FieldChangedEvent, this.field().key, value);
  }
}
```
