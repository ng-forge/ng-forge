import { ChangeDetectionStrategy, Component, input, linkedSignal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { ValueInArrayPipe } from './value-in-array.pipe';
import { isEqual } from 'lodash-es';
import { explicitEffect } from 'ngxtension/explicit-effect';

type Option<T> = { value: T; label: string; disabled?: boolean };

@Component({
  selector: 'df-mat-multi-checkbox',
  imports: [FormsModule, MatCheckbox, MatErrorsComponent, ValueInArrayPipe],
  host: {
    '[class]': 'className() || ""',
  },
  template: `
    <div>
      @if (label(); as label) {
      <div class="checkbox-group-label">{{ label }}</div>
      }

      <div class="checkbox-group">
        @for (option of options(); track option.value; let $idx = $index) {
        <mat-checkbox
          [checked]="option | inArray : valueViewModel()"
          [disabled]="disabled() || option.disabled"
          [color]="color() || 'primary'"
          [labelPosition]="labelPosition() || 'after'"
          (change)="onCheckboxChange(option, $event.checked)"
        >
          {{ option.label }}
        </mat-checkbox>
        }
      </div>

      @if (hint(); as hint) {
      <div class="mat-hint">{{ hint }}</div>
      }

      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .checkbox-group-label {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 8px;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      mat-checkbox {
        margin: 0;
      }

      .mat-hint {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 4px;
      }
    `,
  ],
  providers: [ValueInArrayPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMultiCheckboxFieldComponent<T> implements FormValueControl<T[]> {
  readonly value = model<T[]>([]);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input<string>('');
  readonly options = input.required<Option<T>[]>();
  readonly required = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  valueViewModel = linkedSignal<Option<T>[]>(
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

  onCheckboxChange(option: Option<T>, checked: boolean): void {
    this.valueViewModel.update((currentOptions) => {
      if (checked) {
        return currentOptions.some((opt) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt) => opt.value !== option.value);
      }
    });
  }
}
