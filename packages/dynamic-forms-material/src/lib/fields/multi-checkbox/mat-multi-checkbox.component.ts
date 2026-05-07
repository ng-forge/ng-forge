import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { injectNgForgeField, isEqual, NgForgeControl, NgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { MatMultiCheckboxProps } from './mat-multi-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-multi-checkbox',
  imports: [MatCheckbox, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = field.field();
    @let checkboxGroupId = field.key() + '-checkbox-group';
    @let checked = checkedValuesMap();

    @if (field.label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div
      [id]="checkboxGroupId"
      class="checkbox-group"
      role="group"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <mat-checkbox
          ngForgeControl
          [checked]="checked['' + option.value]"
          [disabled]="f().disabled() || option.disabled"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
          (change)="onCheckboxChange(option, $event.checked)"
        >
          {{ option.label | dynamicText | async }}
        </mat-checkbox>
      }
    </div>

    @if (field.errorsToDisplay()[0]; as error) {
      <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatMultiCheckboxFieldComponent {
  protected readonly field = injectNgForgeField<ValueType[]>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<MatMultiCheckboxProps>();

  valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.field.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  /** Computed map of checked option values for O(1) lookup in template */
  readonly checkedValuesMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const opt of this.valueViewModel()) {
      map[String(opt.value)] = true;
    }
    return map;
  });

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedOptions]) => {
      const selectedValues = selectedOptions.map((option) => option.value);

      if (!isEqual(selectedValues, this.field.field()().value())) {
        this.field.field()().value.set(selectedValues);
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

  onCheckboxChange(option: FieldOption<ValueType>, checked: boolean): void {
    this.valueViewModel.update((currentOptions) => {
      if (checked) {
        return currentOptions.some((opt) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt) => opt.value !== option.value);
      }
    });
  }
}
