# Validation Error Resolution - Clean Implementation Design

## Overview
A factory-based approach using ngxtension's `derivedFrom` to create reactive, unified error resolution supporting string/Observable/Signal validation messages.

## Architecture

### 1. Utility: Dynamic Text to Observable Converter
```typescript
// packages/dynamic-form/src/lib/utils/dynamic-text-to-observable.ts
import { isSignal, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { isObservable, Observable, of } from 'rxjs';
import { DynamicText } from '../models/types/dynamic-text';

/**
 * Converts DynamicText (string | Observable | Signal) to Observable
 * Unifies all three types into a consistent Observable stream
 */
export function dynamicTextToObservable(
  value: DynamicText | undefined,
  injector?: Injector
): Observable<string> {
  if (value === undefined) {
    return of('');
  }

  if (isObservable(value)) {
    return value;
  }

  if (isSignal(value)) {
    return toObservable(value, { injector });
  }

  return of(String(value));
}
```

### 2. Utility: Parameter Interpolation
```typescript
// packages/dynamic-form/src/lib/utils/interpolate-params.ts
import { ValidationError } from '../models/validation-types';

/**
 * Interpolates {{param}} placeholders in message with error values
 * Example: "Min value is {{min}}" → "Min value is 5"
 */
export function interpolateParams(
  message: string,
  error: ValidationError
): string {
  let result = message;
  const params = extractErrorParams(error);

  Object.entries(params).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(placeholder, String(value));
  });

  return result;
}

function extractErrorParams(error: ValidationError): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  // Common validation error parameters
  if ('min' in error) params.min = error.min;
  if ('max' in error) params.max = error.max;
  if ('requiredLength' in error) params.requiredLength = error.requiredLength;
  if ('actualLength' in error) params.actualLength = error.actualLength;
  if ('pattern' in error) params.pattern = error.pattern;
  if ('actual' in error) params.actual = error.actual;
  if ('expected' in error) params.expected = error.expected;

  return params;
}
```

### 3. Core Factory: Create Resolved Errors Signal
```typescript
// packages/dynamic-form/src/lib/utils/create-resolved-errors-signal.ts
import { Signal, Injector, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FieldTree, ValidationError } from '@angular/forms/signals';
import { derivedFrom } from 'ngxtension/derived-from';
import { combineLatest, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ValidationMessages } from '../models/validation-types';
import { dynamicTextToObservable } from './dynamic-text-to-observable';
import { interpolateParams } from './interpolate-params';

export interface ResolvedError {
  kind: string;
  message: string;
}

/**
 * Factory function that creates a signal of resolved validation errors
 * Handles async resolution of DynamicText validation messages
 *
 * @param field - Signal containing FieldTree
 * @param validationMessages - Signal containing custom validation messages
 * @param injector - Optional injector for signal conversion
 * @returns Signal<ResolvedError[]> - Reactively resolved error messages
 */
export function createResolvedErrorsSignal(
  field: Signal<FieldTree>,
  validationMessages: Signal<ValidationMessages | undefined>,
  injector?: Injector
): Signal<ResolvedError[]> {
  const _injector = injector ?? inject(Injector);

  return derivedFrom(
    {
      field: toObservable(field, { injector: _injector }),
      messages: toObservable(validationMessages, { injector: _injector }),
    },
    switchMap(({ field: fieldValue, messages }) => {
      const errors = fieldValue.errors();

      // No errors - return empty array
      if (!errors || errors.length === 0) {
        return of([]);
      }

      // Create observable for each error's resolved message
      const errorResolvers = errors.map((error) =>
        resolveErrorMessage(error, messages, _injector)
      );

      // Combine all error message observables into single array emission
      return errorResolvers.length > 0
        ? combineLatest(errorResolvers)
        : of([]);
    }),
    {
      initialValue: [],
      injector: _injector
    }
  );
}

/**
 * Resolves a single error message from DynamicText sources
 */
function resolveErrorMessage(
  error: ValidationError,
  messages: ValidationMessages | undefined,
  injector: Injector
): Observable<ResolvedError> {
  // Get custom message for this error kind
  const customMessage = messages?.[error.kind];

  // Convert DynamicText to Observable
  const messageObservable = customMessage
    ? dynamicTextToObservable(customMessage, injector)
    : of(error.message || 'Validation error');

  // Apply parameter interpolation
  return messageObservable.pipe(
    map(msg => ({
      kind: error.kind,
      message: interpolateParams(msg, error),
    }))
  );
}
```

### 4. Computed Helper: Should Show Errors
```typescript
// packages/dynamic-form/src/lib/utils/should-show-errors.ts
import { Signal, computed } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Computed signal that determines if errors should be displayed
 * Based on field's invalid, touched, and error count
 */
export function shouldShowErrors(field: Signal<FieldTree>): Signal<boolean> {
  return computed(() => {
    const f = field();
    return f.invalid() && f.touched() && f.errors().length > 0;
  });
}
```

## Usage in Field Components

### Material Input Example
```typescript
// packages/dynamic-form-material/src/lib/fields/input/mat-input.component.ts
import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import {
  DynamicText,
  DynamicTextPipe,
  createResolvedErrorsSignal,
  shouldShowErrors,
  ValidationMessages
} from '@ng-forge/dynamic-form';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-input',
  imports: [
    MatFormField, MatLabel, MatInput, MatHint, MatError,
    Field, DynamicTextPipe, AsyncPipe
  ],
  template: `
    @let f = field();

    <mat-form-field
      [appearance]="props()?.appearance ?? 'outline'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'dynamic'"
    >
      @if (label()) {
        <mat-label>{{ label() | dynamicText | async }}</mat-label>
      }

      <input
        matInput
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
      />

      @if (props()?.hint; as hint) {
        <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      }

      <!-- Inline error resolution - no component wrapper -->
      @if (showErrors()) {
        @for (error of resolvedErrors(); track error.kind) {
          <mat-error>{{ error.message }}</mat-error>
        }
      }
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class MatInputFieldComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatInputProps>();

  // NEW: Accept validationMessages
  readonly validationMessages = input<ValidationMessages>();

  // NEW: Create resolved errors signal using factory
  readonly resolvedErrors = createResolvedErrorsSignal(
    this.field,
    this.validationMessages
  );

  // NEW: Determine if errors should show
  readonly showErrors = shouldShowErrors(this.field);
}
```

### Bootstrap Input Example
```typescript
// packages/dynamic-form-bootstrap/src/lib/fields/input/bs-input.component.ts
template: `
  @let f = field();

  <div class="mb-3">
    @if (label()) {
      <label [for]="key()" class="form-label">
        {{ label() | dynamicText | async }}
      </label>
    }

    <input
      [field]="f"
      [id]="key()"
      class="form-control"
      [class.is-invalid]="f().invalid() && f().touched()"
    />

    <!-- Inline error resolution -->
    @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <div class="invalid-feedback d-block">
          {{ error.message }}
        </div>
      }
    }
  </div>
`
```

### Ionic Input Example
```typescript
// packages/dynamic-form-ionic/src/lib/fields/input/ionic-input.component.ts
template: `
  @let f = field();

  <ion-input [field]="f" ... >
    @if (showErrors()) {
      <div slot="error">
        @for (error of resolvedErrors(); track error.kind) {
          <ion-note color="danger">{{ error.message }}</ion-note>
        }
      </div>
    }
  </ion-input>
`
```

### PrimeNG Input Example
```typescript
// packages/dynamic-form-primeng/src/lib/fields/input/prime-input.component.ts
template: `
  @let f = field();

  <div class="df-prime-field">
    <!-- ... input ... -->

    <!-- Inline error resolution -->
    @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <small class="p-error">{{ error.message }}</small>
      }
    }
  </div>
`
```

## Key Benefits

1. ✅ **Unified Handling**: Single approach for string/Observable/Signal
2. ✅ **Reactive**: Automatically updates when field or messages change
3. ✅ **No Projection Issues**: Inline template, no component wrapper
4. ✅ **Type-Safe**: Full TypeScript support
5. ✅ **Performant**: Efficient with `derivedFrom` and proper memoization
6. ✅ **Consistent**: Same pattern across all frameworks
7. ✅ **Clean Separation**: Factory creates signal, template consumes it
8. ✅ **Testable**: Easy to unit test factory and utilities separately

## Implementation Checklist

- [ ] Create `dynamic-text-to-observable.ts` utility
- [ ] Create `interpolate-params.ts` utility
- [ ] Create `create-resolved-errors-signal.ts` factory
- [ ] Create `should-show-errors.ts` helper
- [ ] Export utilities from `@ng-forge/dynamic-form`
- [ ] Update Material field components
- [ ] Update Bootstrap field components
- [ ] Update Ionic field components
- [ ] Update PrimeNG field components
- [ ] Remove old error components
- [ ] Fix `ValueFieldComponent` to include `validationMessages`
- [ ] Update documentation
- [ ] Add unit tests
- [ ] Add integration tests
