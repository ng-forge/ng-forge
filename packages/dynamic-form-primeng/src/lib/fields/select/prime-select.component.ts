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
import { AsyncPipe } from '@angular/common';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { PrimeSelectComponent, PrimeSelectProps } from './prime-select.type';

@Component({
  selector: 'df-prime-select',
  imports: [Field, Select, MultiSelect, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label(); as label) {
      <label [for]="key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      } @if (isMultiple()) {
      <p-multiSelect
        [field]="f"
        [inputId]="key()"
        [options]="options()"
        optionLabel="label"
        optionValue="value"
        [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
        [filter]="props()?.filter ?? false"
        [showClear]="props()?.showClear ?? false"
        [styleClass]="props()?.styleClass ?? ''"
      />
      } @else {
      <p-select
        [field]="f"
        [inputId]="key()"
        [options]="options()"
        optionLabel="label"
        optionValue="value"
        [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
        [filter]="props()?.filter ?? false"
        [showClear]="props()?.showClear ?? false"
        [styleClass]="props()?.styleClass ?? ''"
      />
      } @for (error of errorsToDisplay(); track error.kind) {
      <small class="p-error">{{ error.message }}</small>
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
export default class PrimeSelectFieldComponent<T> implements PrimeSelectComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<PrimeSelectProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly formValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.formValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly isMultiple = computed(() => this.props()?.multiple ?? false);
}
