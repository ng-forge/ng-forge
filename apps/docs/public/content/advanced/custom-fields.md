---
title: Custom Fields
slug: advanced/custom-fields
---

Add a custom field type to any existing ng-forge adapter — no need to build a full adapter from scratch.

## Scenario

You're using Material, Bootstrap, or another adapter and need a field type that the adapter doesn't provide — for example, a rich text editor, a file uploader, or a custom rating widget.

## 1. Create Your Field Component

Implement `ValueFieldComponent<T>` from the core package:

```typescript name="rich-text-field.component.ts"
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-rich-text-field',
  template: `<label [textContent]="field().label"></label>
    <my-rich-editor [value]="field().value()" (valueChange)="valueChange.emit($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextFieldComponent implements ValueFieldComponent<string> {
  // Injected by the form engine — contains value, label, props, errors, etc.
  readonly field = input.required<ResolvedValueField<string>>();
  readonly valueChange = output<string>();
}
```

## 2. Define the Field Type

```typescript name="my-custom-fields.ts"
import { FieldTypeDefinition, valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { RichTextFieldComponent } from './rich-text-field.component';

const richTextField: FieldTypeDefinition = {
  type: 'rich-text',
  loadComponent: () => RichTextFieldComponent,
  mapper: valueFieldMapper,
};
```

## 3. Provide Alongside Your Adapter

Pass your custom field definition to `provideDynamicForm()` alongside the adapter's fields:

```typescript name="app.config.ts"
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(
      ...withMaterialFields(), // all Material field types
      richTextField, // your custom field
    ),
  ],
};
```

## 4. Use It in a Form

```typescript
const config = {
  fields: [
    { key: 'name', type: 'input', value: '', label: 'Name' },
    { key: 'body', type: 'rich-text', value: '', label: 'Content' },
    { key: 'submit', type: 'submit', label: 'Save' },
  ],
} as const satisfies FormConfig;
```

## Key Points

- Custom fields work with all conditional logic, validation, and value derivation — no special handling needed
- You can add as many custom fields as you need alongside any adapter
- The `mapper` function translates the resolved field to your component's inputs — use `valueFieldMapper` for standard value-based fields or `checkboxFieldMapper` for boolean fields

## Going Further

If you need a completely custom adapter (no existing adapter as base), or want to implement the config cascade (`defaultProps`) for your custom fields, see the full [Custom Integrations](/custom-integrations) guide.

## Next Steps

- **[Custom Integrations](/custom-integrations)** — Build a complete adapter for any UI library from scratch
- **[Type Safety](/advanced/basics)** — Leverage TypeScript inference for form values and field types
- **[Events](/advanced/events)** — Dispatch and subscribe to form events from custom field components
