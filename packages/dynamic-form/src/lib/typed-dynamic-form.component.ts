import { ChangeDetectionStrategy, Component, input, Type } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { DynamicForm } from './dynamic-form.component';
import type { FieldConfig } from './models/field-config';
import type { FormOptions } from './models/form-options';
import type { ProvidedFormResult } from './providers/dynamic-form-providers';

/**
 * Typed version of DynamicForm that automatically infers result types from provider configuration
 *
 * Usage:
 * ```typescript
 * const providers = provideDynamicForm(withConfig({
 *   fields: [
 *     { key: 'name', type: 'input' },
 *     { key: 'email', type: 'email' }
 *   ] as const
 * }));
 * type FormResult = ProvidedFormResult<typeof providers>;
 *
 * @Component({
 *   providers: [providers],
 *   template: `
 *     <typed-dynamic-form
 *       [fields]="fields"
 *       (valueChange)="onFormChange($event)" />
 *   `
 * })
 * export class MyComponent {
 *   onFormChange(result: FormResult) {
 *     // result is properly typed!
 *   }
 * }
 * ```
 */
@Component({
  selector: 'typed-dynamic-form',
  imports: [DynamicForm],
  template: ` <dynamic-form [fields]="fields()" [value]="value()" [options]="options()" (valueChange)="onFormValueChange($event)" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypedDynamicForm<TResult = unknown> {
  /**
   * Array of field configurations that define the form structure.
   */
  fields = input.required<FieldConfig[]>();

  /**
   * The current form model value.
   */
  value = input<TResult>();

  /**
   * Optional form-wide configuration options.
   */
  options = input<FormOptions>();

  private valueChange$ = new Subject<TResult>();

  /**
   * Emits the updated form model with proper typing based on provider configuration.
   */
  valueChange = outputFromObservable(this.valueChange$);

  onFormValueChange(value: unknown): void {
    this.valueChange$.next(value as TResult);
  }
}

/**
 * Helper function to create a typed dynamic form component class
 *
 * @param providers The providers that contain the type information
 * @returns A typed component class
 */
export function createTypedDynamicForm<T>(providers: T): Type<TypedDynamicForm<ProvidedFormResult<T>>> {
  return TypedDynamicForm as Type<TypedDynamicForm<ProvidedFormResult<T>>>;
}
