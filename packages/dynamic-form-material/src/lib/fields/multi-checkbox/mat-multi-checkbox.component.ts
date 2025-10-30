import { ChangeDetectionStrategy, Component, input, linkedSignal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { ValueInArrayPipe } from '../../directives/value-in-array.pipe';
import { isEqual } from 'lodash-es';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { MatMultiCheckboxComponent, MatMultiCheckboxProps } from './mat-multi-checkbox.type';
import { MultiCheckboxOption, ValueType } from '@ng-forge/dynamic-form';

@Component({
  selector: 'df-mat-multi-checkbox',
  imports: [FormsModule, MatCheckbox, MatErrorsComponent, ValueInArrayPipe],
  template: `
    @if (label(); as label) {
    <div class="checkbox-group-label">{{ label }}</div>
    }

    <div class="checkbox-group">
      @for (option of options(); track option.value; let $idx = $index) {
      <mat-checkbox
        [checked]="option | inArray : valueViewModel()"
        [disabled]="disabled() || option.disabled"
        [color]="props()?.color || 'primary'"
        [labelPosition]="props()?.labelPosition || 'after'"
        (change)="onCheckboxChange(option, $event.checked)"
      >
        {{ option.label }}
      </mat-checkbox>
      }
    </div>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint }}</div>
    }

    <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    '[class]': 'className() || ""',
  },
  providers: [ValueInArrayPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMultiCheckboxFieldComponent<T extends ValueType> implements FormValueControl<T[]>, MatMultiCheckboxComponent<T> {
  readonly value = model.required<T[]>();

  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<MultiCheckboxOption<T>[]>([]);
  readonly props = input<MatMultiCheckboxProps>();

  valueViewModel = linkedSignal<MultiCheckboxOption<T>[]>(
    () => {
      const currentValues = this.value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual }
  );

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedOptions]) => {
      const selectedValues = selectedOptions.map((option) => option.value);

      if (!isEqual(selectedValues, this.value())) {
        this.value.set(selectedValues);
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

  onCheckboxChange(option: MultiCheckboxOption<T>, checked: boolean): void {
    this.valueViewModel.update((currentOptions) => {
      if (checked) {
        return currentOptions.some((opt) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt) => opt.value !== option.value);
      }
    });
  }
}
