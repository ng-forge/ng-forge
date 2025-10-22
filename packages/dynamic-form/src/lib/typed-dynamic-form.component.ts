import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { DynamicForm } from './dynamic-form.component';
import { defineForm, FieldDef, FormConfig } from './models/field-config';

/**
 * Type-safe dynamic form component following Angular Architects pattern
 * Provides a bridge for existing field configurations while using the new clean API
 *
 * Usage:
 * ```typescript
 * const fields = [
 *   defineField({ key: 'name', type: 'input', label: 'Name' }),
 *   defineField({ key: 'email', type: 'input', label: 'Email', validation: { email: true } })
 * ] as const;
 *
 * type FormValue = InferFormValue<typeof fields>;
 *
 * @Component({
 *   template: `
 *     <typed-dynamic-form
 *       [fields]="fields"
 *       [value]="formValue"
 *       (valueChange)="onFormChange($event)" />
 *   `
 * })
 * ```
 */
@Component({
  selector: 'typed-dynamic-form',
  imports: [DynamicForm],
  template: `
    <dynamic-form
      [config]="formConfig()"
      [value]="value()"
      (valueChange)="onFormValueChange($event)"
      (validChange)="onValidChange($event)"
      (formSubmit)="onFormSubmit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypedDynamicForm<TResult = unknown> {
  /**
   * Array of field definitions using the new clean API
   */
  fields = input.required<readonly FieldDef[]>();

  /**
   * The current form model value
   */
  value = input<TResult>();

  /**
   * Convert fields array to FormConfig structure following Angular Architects pattern
   */
  readonly formConfig = computed((): FormConfig => defineForm({ fields: this.fields() }));

  // Output event streams
  private readonly valueChange$ = new Subject<TResult>();
  private readonly validChange$ = new Subject<boolean>();
  private readonly submit$ = new Subject<TResult>();

  /**
   * Emits the updated form model with proper typing
   */
  readonly valueChange = outputFromObservable(this.valueChange$);
  readonly validChange = outputFromObservable(this.validChange$);
  readonly formSubmit = outputFromObservable(this.submit$);

  onFormValueChange(value: unknown): void {
    this.valueChange$.next(value as TResult);
  }

  onValidChange(valid: boolean): void {
    this.validChange$.next(valid);
  }

  onFormSubmit(value: unknown): void {
    this.submit$.next(value as TResult);
  }
}
