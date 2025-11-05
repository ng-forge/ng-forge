import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-form';
import { BsErrorsComponent } from '../../shared/bs-errors.component';
import { BsSelectComponent, BsSelectProps } from './bs-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-select',
  imports: [Field, BsErrorsComponent, DynamicTextPipe, AsyncPipe],
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
        }
        @for (option of options(); track option.value) {
          <option
            [value]="option.value"
            [disabled]="option.disabled || false"
            [selected]="isSelected(option.value, f().value())"
          >
            {{ option.label | dynamicText | async }}
          </option>
        }
      </select>

      @if (props()?.helpText; as helpText) {
        <div class="form-text" [id]="key() + '-help'">{{ helpText | dynamicText | async }}</div>
      }

      <df-bs-errors
        [errors]="f().errors()"
        [invalid]="f().invalid()"
        [touched]="f().touched()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class BsSelectFieldComponent<T> implements BsSelectComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<BsSelectProps<T>>();

  defaultCompare = Object.is;

  protected isSelected(optionValue: T, fieldValue: T | T[] | null): boolean {
    const compareWith = this.props()?.compareWith || this.defaultCompare;

    if (Array.isArray(fieldValue)) {
      return fieldValue.some(v => compareWith(v, optionValue));
    }

    return fieldValue !== null && compareWith(fieldValue, optionValue);
  }
}
