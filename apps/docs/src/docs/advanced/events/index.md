The events API provides two complementary services for working with form events. Which one you use depends on **where your code lives** relative to the `dynamic-form` element.

## Choosing the right API

|                   | `EventBus`                            | `EventDispatcher`                                          |
| ----------------- | ------------------------------------- | ---------------------------------------------------------- |
| **Where to use**  | Inside DynamicForm (field components) | Outside DynamicForm (host components)                      |
| **How to get it** | `inject(EventBus)`                    | `providers: [EventDispatcher]` + `inject(EventDispatcher)` |
| **Dispatches**    | Constructor + args                    | Pre-built event instances                                  |
| **Subscribes**    | Yes — `.on()` method                  | No                                                         |

> **Important:** `EventBus` is scoped to the `DynamicForm` component's injector tree. It is **only available to components rendered inside DynamicForm** (i.e. custom field components). If you inject `EventBus` in a parent or host component, you get a completely separate, disconnected instance that the form knows nothing about. Use `EventDispatcher` instead.

---

## EventDispatcher — dispatching from outside DynamicForm

Use `EventDispatcher` when you need to drive form behaviour **from the host component** — for example, appending array items in response to a field value change, triggering a form reset from a toolbar button, or reacting to external application state.

### Setup

Provide `EventDispatcher` at the **host component** level (not root). `DynamicForm` automatically detects it and connects its internal event bus.

```typescript
import { Component, effect, inject, signal } from '@angular/core';
import { DynamicForm, EventDispatcher, FormConfig, arrayEvent } from '@ng-forge/dynamic-forms';

@Component({
  providers: [EventDispatcher], // Provide at host component level
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" [(value)]="formValue"></form>`,
})
export class MyFormComponent {
  protected readonly config = { fields: [...] } as const satisfies FormConfig;
  readonly formValue = signal<Record<string, unknown>>({});

  private readonly dispatcher = inject(EventDispatcher);

  constructor() {
    effect(() => {
      const category = this.formValue()?.['category'] as string | undefined;
      if (category) {
        this.dispatcher.dispatch(
          arrayEvent('tasks').append([{ key: 'name', type: 'input', label: 'Task', value: category }])
        );
      }
    });
  }
}
```

### Dispatching events

`EventDispatcher.dispatch()` accepts any `FormEvent` instance. Use the `arrayEvent()` builder for array operations:

```typescript
// Array manipulation
this.dispatcher.dispatch(arrayEvent('contacts').append(contactTemplate));
this.dispatcher.dispatch(arrayEvent('contacts').removeAt(0));
this.dispatcher.dispatch(arrayEvent('contacts').pop());

// Form lifecycle
this.dispatcher.dispatch(new FormResetEvent());
this.dispatcher.dispatch(new FormClearEvent());

// Custom events
this.dispatcher.dispatch(new MyCustomEvent());
```

### Multi-form note

If multiple `DynamicForm` instances exist under the same provider scope, **all forms** receive dispatched events. To target a specific form, scope the `EventDispatcher` provider to a wrapper component that contains only that form.

---

## Listening to events from outside DynamicForm

For observing events from a host component, use the output bindings exposed directly on the `dynamic-form` element. This avoids any DI scoping concerns and works with standard Angular event binding syntax.

### Output bindings

| Output                          | Emits                                                     |
| ------------------------------- | --------------------------------------------------------- |
| `(events)`                      | Every form event (full stream)                            |
| `(submitted)`                   | Form value when submitted **and valid** (SubmitEvent)     |
| `(reset)`                       | When the form is reset to default values                  |
| `(cleared)`                     | When the form is cleared to empty state                   |
| `(onPageChange)`                | PageChangeEvent on each wizard page navigation            |
| `(onPageNavigationStateChange)` | Navigation state changes (canGoNext, canGoPrevious, etc.) |
| `(validityChange)`              | Boolean — whenever form validity changes                  |
| `(dirtyChange)`                 | Boolean — whenever form dirty state changes               |
| `(initialized)`                 | Once all field components are rendered and ready          |

### Examples

**React to specific well-known events via dedicated outputs:**

```typescript
@Component({
  imports: [DynamicForm],
  template: `
    <form [dynamic-form]="config" (submitted)="onSubmit($event)" (reset)="onReset()" (onPageChange)="onPageChange($event)"></form>
  `,
})
export class MyFormComponent {
  onSubmit(value: Record<string, unknown>) {
    console.log('Valid submission:', value);
  }

  onReset() {
    console.log('Form reset to defaults');
  }

  onPageChange(event: PageChangeEvent) {
    console.log(`Now on page ${event.currentPageIndex + 1} of ${event.totalPages}`);
  }
}
```

**React to custom or less common events via `(events)`:**

```typescript
@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config" (events)="onEvent($event)"></form>`,
})
export class MyFormComponent {
  onEvent(event: FormEvent) {
    if (event.type === 'save-draft') {
      this.saveDraft();
    }
  }
}
```

> **Note:** `(submitted)` only fires when the form is valid. To handle submit events regardless of validity, use `(events)` and filter for `event.type === 'submit'`.

---

## EventBus — dispatching from inside DynamicForm

`EventBus` is the internal event bus scoped to each `DynamicForm` instance. Inject it inside **custom field components** to communicate with the parent form or other fields within the same form.

> **Scoping reminder:** `EventBus` is provided by `DynamicForm` via its component injector. It is only resolvable from within field components rendered by that form. Do not inject it in host or parent components — you will get a disconnected, standalone instance.

### Usage in custom field components

```typescript
import { Component, inject } from '@angular/core';
import { EventBus, SubmitEvent } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-custom-submit-button',
  template: `<button (click)="submit()">Submit Form</button>`,
})
export class CustomSubmitButton {
  private readonly eventBus = inject(EventBus);

  submit() {
    this.eventBus.dispatch(SubmitEvent);
  }
}
```

### Subscribing to events

```typescript
export class CustomFieldComponent {
  private readonly eventBus = inject(EventBus);

  ngOnInit() {
    this.eventBus.on<PageChangeEvent>('page-change').subscribe((event) => {
      console.log(`Navigated to page ${event.currentPageIndex + 1}`);
    });
  }
}
```

---

## Built-in Events

### SubmitEvent

Fired when form is submitted.

```typescript
eventBus.on<SubmitEvent>('submit').subscribe(() => {
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

### Array Events

The `arrayEvent()` builder provides a fluent API for array field manipulation. Import it from the main package:

```typescript
import { arrayEvent } from '@ng-forge/dynamic-forms';
```

#### Adding Items

**Important:** A template is required for all add operations. The template defines the structure of the new item:

- **Single FieldDef** → creates a **primitive item** (field value extracted directly)
- **Array of FieldDefs** → creates an **object item** (fields merged into object)

```typescript
// Define templates
const tagTemplate = { key: 'tag', type: 'input', label: 'Tag' }; // Primitive item
const contactTemplate = [
  // Object item
  { key: 'name', type: 'input', label: 'Name' },
  { key: 'email', type: 'input', label: 'Email' },
];

// Append item at end (most common)
eventBus.dispatch(arrayEvent('tags').append(tagTemplate));
eventBus.dispatch(arrayEvent('contacts').append(contactTemplate));

// Prepend item at beginning
eventBus.dispatch(arrayEvent('contacts').prepend(contactTemplate));

// Insert at specific index
eventBus.dispatch(arrayEvent('contacts').insertAt(2, contactTemplate));
```

#### Removing Items

```typescript
// Remove last item (stack pop)
eventBus.dispatch(arrayEvent('contacts').pop());

// Remove first item (queue shift)
eventBus.dispatch(arrayEvent('contacts').shift());

// Remove item at specific index
eventBus.dispatch(arrayEvent('contacts').removeAt(2));
```

#### Internal Event Classes

For advanced use cases (extending events or type-checking), you can import the underlying event classes:

```typescript
import {
  AppendArrayItemEvent,
  PrependArrayItemEvent,
  InsertArrayItemEvent,
  PopArrayItemEvent,
  ShiftArrayItemEvent,
  RemoveAtIndexEvent,
} from '@ng-forge/dynamic-forms';

// Example: extend for a pre-filled template
export class AddContactEvent extends AppendArrayItemEvent {
  constructor() {
    super('contacts', [
      { key: 'name', type: 'input', label: 'Name' },
      { key: 'phone', type: 'input', label: 'Phone' },
    ]);
  }
}

// Usage with EventDispatcher (from outside)
dispatcher.dispatch(new AddContactEvent());

// Usage with EventBus (from inside a field component)
eventBus.dispatch(AddContactEvent);
```

**Event types:**

| Event                   | Description                    |
| ----------------------- | ------------------------------ |
| `AppendArrayItemEvent`  | Add item at end of array       |
| `PrependArrayItemEvent` | Add item at beginning of array |
| `InsertArrayItemEvent`  | Add item at specific index     |
| `PopArrayItemEvent`     | Remove last item               |
| `ShiftArrayItemEvent`   | Remove first item              |
| `RemoveAtIndexEvent`    | Remove item at specific index  |

---

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

---

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

Usage inside a field component (via `EventBus`):

```typescript
// Dispatch
eventBus.dispatch(SaveDraftEvent);
eventBus.dispatch(ValidationErrorEvent, 'email', 'Invalid email format');

// Subscribe
eventBus.on<SaveDraftEvent>('save-draft').subscribe(() => saveDraft());
eventBus.on<ValidationErrorEvent>('validation-error').subscribe((event) => {
  showError(event.fieldKey, event.errorMessage);
});
```

Usage from a host component (via `EventDispatcher`):

```typescript
// Dispatch a pre-built instance
dispatcher.dispatch(new SaveDraftEvent());
dispatcher.dispatch(new ValidationErrorEvent('email', 'Invalid email format'));
```

---

## Attaching Form Values to Events

By default, events don't include the form's current value. You can opt-in to automatically attach the form value to all dispatched events using `withEventFormValue()`.

### Global Opt-in

Enable for all forms in your application:

```typescript
import { provideDynamicForm, withEventFormValue } from '@ng-forge/dynamic-forms';

provideDynamicForm(...withMaterialFields(), withEventFormValue());
```

### Per-Form Control

Override the global setting for specific forms:

```typescript
const config = {
  fields: [...],
  options: {
    // Enable for this form (even if globally disabled)
    emitFormValueOnEvents: true,
    // Or disable for this form (even if globally enabled)
    // emitFormValueOnEvents: false,
  },
} as const satisfies FormConfig;
```

### Accessing the Form Value

Use the `hasFormValue()` type guard to safely access the attached value:

```typescript
import { hasFormValue } from '@ng-forge/dynamic-forms';

eventBus.on<SubmitEvent>('submit').subscribe((event) => {
  if (hasFormValue(event)) {
    // TypeScript knows event.formValue exists
    console.log('Form value at submission:', event.formValue);
    sendToApi(event.formValue);
  }
});
```

This is useful when you need the complete form state at the time an event occurred, such as:

- Logging form values on submission
- Auto-saving on page changes
- Analytics tracking
