---
title: Custom Types
route: custom-types
keyword: TypeSafetyCustomTypesPage
---

Extending the type system with custom field types, runtime validation, and type guards.

## Custom Field Types

Extend `FieldRegistryLeaves` to add custom field types with full type safety:

### Step 1: Define Field Interfaces

Create type definitions for your custom fields:

```typescript
// custom-fields.d.ts
import type { BaseValueField } from '@ng-forge/dynamic-forms';

// Color picker props
export interface ColorPickerProps {
  format?: 'hex' | 'rgb' | 'hsl';
  alpha?: boolean;
}

// Color picker field (extends BaseValueField)
export type ColorPickerField = BaseValueField<ColorPickerProps, string>;

// File upload props
export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

// File upload field
export type FileUploadField = BaseValueField<FileUploadProps, File[]>;

// Rating props
export interface RatingProps {
  max?: number;
  allowHalf?: boolean;
}

// Rating field
export type RatingField = BaseValueField<RatingProps, number>;
```

### Step 2: Augment Field Registry

Register your types with the global registry:

```typescript
// custom-fields.d.ts (continued)
declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    'color-picker': ColorPickerField;
    'file-upload': FileUploadField;
    rating: RatingField;
  }
}
```

This enables:

- TypeScript autocomplete for `type: 'color-picker'`
- Type checking for field properties
- Automatic type inference in `InferFormValue`

### Step 3: Create Field Components

Implement the component for each field type:

```typescript
// color-picker.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { AsyncPipe } from '@angular/common';
import { DynamicText, DynamicTextPipe, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { ColorPickerField, ColorPickerProps } from './custom-fields';

@Component({
  selector: 'df-color-picker',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <div class="color-picker-field">
      @if (label()) {
      <label [for]="key()">{% raw %}{{ label() | dynamicText | async }}{% endraw %}</label>
      }
      <input type="color" [field]="f" [id]="key()" [disabled]="f.disabled()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class ColorPickerComponent implements ValueFieldComponent<ColorPickerField> {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();
  readonly label = input<DynamicText>();
  readonly className = input<string>('');
  readonly props = input<ColorPickerProps>();
}
```

### Step 4: Register Field Type

Create field type definitions and register them:

```typescript
// custom-fields.provider.ts
import { FieldTypeDefinition, valueFieldMapper } from '@ng-forge/dynamic-forms';
import type { ColorPickerField, ColorPickerProps, FileUploadField, FileUploadProps, RatingField, RatingProps } from './custom-fields';

export const ColorPickerFieldType: FieldTypeDefinition<ColorPickerField> = {
  name: 'color-picker',
  loadComponent: () => import('./color-picker.component'),
  mapper: valueFieldMapper,
  valueHandling: 'include',
};

export const FileUploadFieldType: FieldTypeDefinition<FileUploadField> = {
  name: 'file-upload',
  loadComponent: () => import('./file-upload.component'),
  mapper: valueFieldMapper,
  valueHandling: 'include',
};

export const RatingFieldType: FieldTypeDefinition<RatingField> = {
  name: 'rating',
  loadComponent: () => import('./rating.component'),
  mapper: valueFieldMapper,
  valueHandling: 'include',
};
```

### Step 5: Provide Field Types

Add to your app configuration:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { ColorPickerFieldType, FileUploadFieldType, RatingFieldType } from './custom-fields.provider';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), ColorPickerFieldType, FileUploadFieldType, RatingFieldType)],
};
```

### Step 6: Use Custom Fields

Now use your custom fields with full type safety:

```typescript
const config = {
  fields: [
    {
      key: 'brandColor',
      type: 'color-picker',
      value: '#000000',
      label: 'Brand Color',
      required: true,
      props: {
        format: 'hex',
        alpha: true,
      },
    },
    {
      key: 'logo',
      type: 'file-upload',
      value: [],
      label: 'Company Logo',
      props: {
        accept: 'image/*',
        multiple: false,
        maxSize: 5242880, // 5MB
      },
    },
    {
      key: 'satisfaction',
      type: 'rating',
      value: 0,
      label: 'Overall Satisfaction',
      required: true,
      props: {
        max: 5,
        allowHalf: true,
      },
    },
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   brandColor: string;
//   logo?: File[];
//   satisfaction: number;
// }
```

## Runtime Type Guards

Use type guards to check field categories at runtime:

### Available Type Guards

```typescript
import {
  isContainerField,
  isLeafField,
  isValueBearingField,
  isDisplayOnlyField,
  isPageField,
  isRowField,
  isGroupField,
} from '@ng-forge/dynamic-forms';
```

### Container vs Leaf Fields

```typescript
function processField(field: RegisteredFieldTypes) {
  if (isContainerField(field)) {
    // field is PageField | RowField | GroupField
    console.log('Container field:', field.type);
    console.log('Children:', field.fields.length);
  }

  if (isLeafField(field)) {
    // field is not a container (input, select, button, text, etc.)
    console.log('Leaf field:', field.type);
  }
}
```

### Value-Bearing vs Display-Only

```typescript
function analyzeField(field: RegisteredFieldTypes) {
  if (isValueBearingField(field)) {
    // field has a 'value' property (input, select, checkbox, etc.)
    console.log('Field value:', field.value);
    console.log('Field key:', field.key);
  }

  if (isDisplayOnlyField(field)) {
    // field doesn't contribute to form values (text, button, containers)
    console.log('Display-only field:', field.type);
  }
}
```

### Specific Container Checks

```typescript
function processContainers(field: RegisteredFieldTypes) {
  if (isPageField(field)) {
    console.log('Page with', field.fields.length, 'children');
    console.log('Page key:', field.key);
  }

  if (isRowField(field)) {
    console.log('Row with', field.fields.length, 'columns');
  }

  if (isGroupField(field)) {
    console.log('Group key:', field.key);
    console.log('Group fields:', field.fields.length);
  }
}
```

### Complete Example

```typescript
import { isContainerField, isValueBearingField, isPageField } from '@ng-forge/dynamic-forms';

function collectFormKeys(fields: RegisteredFieldTypes[]): string[] {
  const keys: string[] = [];

  for (const field of fields) {
    // Skip pages (they're containers but don't have keys)
    if (isPageField(field)) {
      keys.push(...collectFormKeys(field.fields));
      continue;
    }

    // Process value-bearing fields
    if (isValueBearingField(field)) {
      keys.push(field.key);
    }

    // Recursively process other containers
    if (isContainerField(field) && !isPageField(field)) {
      keys.push(...collectFormKeys(field.fields));
    }
  }

  return keys;
}
```

## Related

- **[Type Safety Basics](../basics/)** - Foundation of type inference
- **[Container Fields](../containers/)** - Understanding containers
- **[Advanced Types](../advanced-types/)** - Runtime validation, advanced patterns, and best practices
- **[Custom Integration Guide](../../../deep-dive/custom-integrations/)** - Building UI adapter packages
- **[Validation](../../validation/basics/)** - Type-safe validation
