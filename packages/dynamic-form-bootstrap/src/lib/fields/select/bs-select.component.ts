import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-form';
import { BsSelectComponent, BsSelectProps } from './bs-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-select',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="mb-3">
      @if (label(); as label) {
      <label [for]="key()" class="form-label">{{ label | dynamicText | async }}</label>
      }
      <select
        [field]="f"
        [id]="key()"
        class="form-select"
        [class.form-select-sm]="props()?.size === 'sm'"
        [class.form-select-lg]="props()?.size === 'lg'"
        [class.is-invalid]="f().invalid() && f().touched()"
        [multiple]="props()?.multiple || false"
        [size]="props()?.htmlSize"
        [attr.aria-describedby]="props()?.helpText ? key() + '-help' : null"
      >
        @if (placeholder(); as placeholder) {
        <option value="" disabled [selected]="!f().value()">{{ placeholder | dynamicText | async }}</option>
        } @for (option of options(); track option.value) {
        <option [value]="option.value" [disabled]="option.disabled || false" [selected]="isSelected(option.value, f().value())">
          {{ option.label | dynamicText | async }}
        </option>
        }
      </select>

      @if (props()?.helpText; as helpText) {
      <div class="form-text" [id]="key() + '-help'">{{ helpText | dynamicText | async }}</div>
      } @for (error of errorsToDisplay(); track error.kind) {
      <div class="invalid-feedback d-block">{{ error.message }}</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class BsSelectFieldComponent<T extends string> implements BsSelectComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<BsSelectProps<T>>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  defaultCompare = Object.is;

  protected isSelected(optionValue: T, fieldValue: T | T[] | null): boolean {
    const compareWith = this.props()?.compareWith || this.defaultCompare;

    if (Array.isArray(fieldValue)) {
      return fieldValue.some((v) => compareWith(v, optionValue));
    }

    return fieldValue !== null && compareWith(fieldValue, optionValue);
  }
}
