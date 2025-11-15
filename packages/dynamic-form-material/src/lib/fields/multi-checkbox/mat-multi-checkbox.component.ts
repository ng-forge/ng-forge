import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  FieldOption,
  shouldShowErrors,
  ValidationMessages,
  ValueType,
} from '@ng-forge/dynamic-form';
import { ValueInArrayPipe } from '../../directives/value-in-array.pipe';
import { isEqual } from 'lodash-es';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { MatMultiCheckboxComponent, MatMultiCheckboxProps } from './mat-multi-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-multi-checkbox',
  imports: [MatCheckbox, ValueInArrayPipe, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @if (label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group">
      @for (option of options(); track option.value) {
        <mat-checkbox
          [checked]="option | inArray: valueViewModel()"
          [disabled]="f().disabled() || option.disabled"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
          (change)="onCheckboxChange(option, $event.checked)"
        >
          {{ option.label | dynamicText | async }}
        </mat-checkbox>
      }
    </div>

    @if (props()?.hint; as hint) {
      <div class="mat-hint">{{ hint | dynamicText | async }}</div>
    }
    @for (error of errorsToDisplay(); track error.kind) {
      <mat-error>{{ error.message }}</mat-error>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  host: {
    '[class]': 'className() || ""',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  providers: [ValueInArrayPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatMultiCheckboxFieldComponent<T extends ValueType> implements MatMultiCheckboxComponent<T> {
  readonly field = input.required<FieldTree<T[]>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<MatMultiCheckboxProps>();

  valueViewModel = linkedSignal<FieldOption<T>[]>(
    () => {
      const currentValues = this.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedOptions]) => {
      const selectedValues = selectedOptions.map((option) => option.value);

      if (!isEqual(selectedValues, this.field()().value())) {
        this.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]) => {
      const values = options.map((option) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in mat-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }

  onCheckboxChange(option: FieldOption<T>, checked: boolean): void {
    this.valueViewModel.update((currentOptions) => {
      if (checked) {
        return currentOptions.some((opt) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt) => opt.value !== option.value);
      }
    });
  }

  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
